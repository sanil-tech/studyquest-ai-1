import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  const resHeaders = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: resHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole || base44;

    // ------------------------------------------------------------------
    // 1. INPUT PARSING & AUTHENTICATION RESOLUTION
    // ------------------------------------------------------------------
    const body = await req.json().catch(() => ({}));
    let lessonIdParam = body.lesson_id || body.lessonId;
    const topicIdParam = body.topic_id || body.topicId;
    const assessmentIdParam = body.assessment_id || body.assessmentId;
    const studentIdParam = body.student_id || body.studentId;
    const lessonVersionIdParam = body.lesson_version_id || body.lessonVersionId;
    const isPreviewParam = body.preview === true || body.preview === "true";

    if (!lessonIdParam && !topicIdParam && !assessmentIdParam && !lessonVersionIdParam) {
      return Response.json(
        { success: false, error: "lesson_id, topic_id, assessment_id, atau lesson_version_id diperlukan." },
        { status: 400, headers: resHeaders }
      );
    }

    // Authenticate optional user token
    const authUser = await base44.auth.me().catch(() => null);
    const activeStudentId = studentIdParam || authUser?.id || null;

    // Direct LessonVersion preview lookup by ID
    let targetVersionObj: any = null;
    if (lessonVersionIdParam) {
      targetVersionObj = await db.entities.LessonVersion.get(lessonVersionIdParam).catch(() => null);
      if (targetVersionObj && targetVersionObj.lesson_id) {
        lessonIdParam = targetVersionObj.lesson_id;
      }
    }

    // ------------------------------------------------------------------
    // 2. FETCH ROOT LESSON ANCHOR (SUPPORT ASSESSMENT_ID LOOKUP)
    // ------------------------------------------------------------------
    let lessonIdToFetch = lessonIdParam;
    let targetAssessmentObj: any = null;

    if (assessmentIdParam) {
      targetAssessmentObj = await db.entities.Assessment.get(assessmentIdParam).catch(() => null);
      if (targetAssessmentObj && targetAssessmentObj.lesson_id) {
        lessonIdToFetch = targetAssessmentObj.lesson_id;
      }
    }

    let lesson: any = null;
    if (lessonIdToFetch) {
      lesson = await db.entities.Lesson.get(lessonIdToFetch).catch(() => null);
    } else if (topicIdParam) {
      const lessons = await db.entities.Lesson.filter({ topic_id: topicIdParam }).catch(() => []);
      lesson = lessons && lessons.length > 0 ? lessons[0] : null;
    }

    if (!lesson && !targetVersionObj) {
      return Response.json(
        {
          success: false,
          error: "Pelajaran atau penilaian tidak dijumpai.",
          debug: {
            topic_id: topicIdParam || null,
            lesson_id: lessonIdToFetch || null,
            assessment_id: assessmentIdParam || null,
            lesson_version_id: lessonVersionIdParam || null
          }
        },
        { status: 404, headers: resHeaders }
      );
    }

    const lessonId = lesson?.id || targetVersionObj?.lesson_id;
    const topicId = lesson?.topic_id;

    // ------------------------------------------------------------------
    // 3. TIER 1 BATCH FETCH: Topic, Versions, Student Profile, Progress
    // ------------------------------------------------------------------
    const [topic, versions, studentUser, progressList, walletList, rewardRules] = await Promise.all([
      topicId ? db.entities.Topic.get(topicId).catch(() => null) : null,
      lessonId ? db.entities.LessonVersion.filter({ lesson_id: lessonId }).catch(() => []) : [],
      activeStudentId ? db.entities.User.get(activeStudentId).catch(() => null) : null,
      activeStudentId ? db.entities.Progress.filter({ student_id: activeStudentId }).catch(() => []) : [],
      activeStudentId ? db.entities.Wallet.filter({ student_id: activeStudentId }).catch(() => []) : [],
      db.entities.RewardRule.filter({ is_active: true }).catch(() => []),
    ]);

    // SAFE LESSONVERSION RESOLUTION
    // Priority 1: explicit targetVersionObj (preview by ID)
    // Priority 2: lesson.published_version_id (any status accepted)
    // Priority 3: published versions from the versions array
    // Priority 4 (fallback): latest available version by any status — allows draft/generated lessons to load
    let publishedVersion: any = targetVersionObj || null;

    if (!publishedVersion && lesson?.published_version_id) {
      const v = await db.entities.LessonVersion.get(lesson.published_version_id).catch(() => null);
      if (v) publishedVersion = v; // accept any status when fetched by explicit published_version_id
    }

    if (!publishedVersion && Array.isArray(versions) && versions.length > 0) {
      const publishedOnly = versions.filter(
        (v: any) => v.status === "published" || v.review_status === "published" || v.workflow_status === "PUBLISHED"
      );
      if (publishedOnly.length > 0) {
        // Prefer highest version number among published
        publishedVersion = publishedOnly.sort(
          (a: any, b: any) => (b.version_number || 0) - (a.version_number || 0)
        )[0];
      } else if (isPreviewParam) {
        // FALLBACK: Only in explicitly authorized admin preview mode allow draft/generated lessons to load.
        publishedVersion = [...versions].sort(
          (a: any, b: any) =>
            new Date(b.updated_at || b.created_at || 0).getTime() -
            new Date(a.updated_at || a.created_at || 0).getTime()
        )[0] || null;
      }
    }

    if (!publishedVersion) {
      return Response.json(
        {
          success: false,
          error: "Tiada versi pelajaran yang ditemui.",
          debug: {
            lesson_id: lessonId || null,
            versions_found: Array.isArray(versions) ? versions.length : 0,
            version_statuses: Array.isArray(versions)
              ? versions.map((v: any) => ({ id: v.id, status: v.status, workflow_status: v.workflow_status }))
              : []
          }
        },
        { status: 404, headers: resHeaders }
      );
    }

    const versionId = publishedVersion.id;

    // ------------------------------------------------------------------
    // 4. TIER 2 BATCH FETCH: 7-Entity Published Content Parity
    // ------------------------------------------------------------------
    const subjectId = topic?.subject_id;
    const [
      subject,
      learningStandard,
      lessonContent,
      lessonBlocks,
      mediaAssets,
      flashcards,
      activities,
      teacherGuides,
      explanations,
      commonMistakes,
      assessments
    ] = await Promise.all([
      subjectId ? db.entities.Subject.get(subjectId).catch(() => null) : null,
      topic?.learning_standard_id ? db.entities.LearningStandard.get(topic.learning_standard_id).catch(() => null) : null,
      // FIX: Fetch ALL content for the version without a status filter.
      // We apply status prioritisation in-memory below, with a fallback to all available content.
      // This ensures draft/generated lessons load while still preferring published rows.
      db.entities.LessonContent.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.LessonBlock.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.LessonMediaAsset.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.Flashcard.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.LearningActivity.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.TeacherGuide.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.AIExplanation.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.CommonMistake.filter({ lesson_version_id: versionId }).catch(() => []),
      db.entities.Assessment.filter({ lesson_id: lessonId }).catch(() => []),
    ]);

    // Ensure target assessment is present if requested directly
    let finalAssessments = assessments || [];
    if (targetAssessmentObj && !finalAssessments.some((a: any) => a.id === targetAssessmentObj.id)) {
      finalAssessments.push(targetAssessmentObj);
    }

    // ------------------------------------------------------------------
    // 5. TIER 3 BATCH FETCH: Questions & MCQ Options (Zero N+1 Query)
    // ------------------------------------------------------------------
    const assessmentIds = finalAssessments.map((a: any) => a.id);
    let questions: any[] = [];
    if (assessmentIds.length > 0) {
      const qByAsm = await db.entities.QuestionBank.filter({ assessment_id: { $in: assessmentIds } }).catch(() => []);
      const qByVer = await db.entities.QuestionBank.filter({ lesson_version_id: versionId }).catch(() => []);
      const qMap = new Map();
      [...qByAsm, ...qByVer].forEach((q: any) => { if (q && q.id) qMap.set(q.id, q); });
      questions = Array.from(qMap.values());
    } else {
      questions = await db.entities.QuestionBank.filter({ lesson_version_id: versionId }).catch(() => []);
    }

    const questionIds = questions.map((q: any) => q.question_id || q.id);
    let options: any[] = [];
    if (questionIds.length > 0) {
      options = await db.entities.QuestionOption.filter({ question_id: { $in: questionIds } }).catch(() => []);
    }

    // ------------------------------------------------------------------
    // 6. IN-MEMORY ASSEMBLY & SECURITY SHIELDING
    // ------------------------------------------------------------------

    // Group Options by question_id (SECURITY: Omit is_correct and correctness metadata)
    const optionsMap: Record<string, any[]> = {};
    for (const opt of options) {
      const qKey = opt.question_id;
      if (!optionsMap[qKey]) optionsMap[qKey] = [];
      optionsMap[qKey].push({
        id: opt.id,
        label: opt.label,
        text: opt.text,
        sort_order: opt.sort_order ?? 0
      });
    }
    // Sort options sequentially (A, B, C, D)
    Object.keys(optionsMap).forEach(k => {
      optionsMap[k].sort((a, b) => a.sort_order - b.sort_order);
    });

    // Assemble Questions (SECURITY: Sanitized for client-side retrieval — NEVER expose correct_answer / is_correct)
    const assembledQuestionsMap: Record<string, any[]> = {};
    for (const q of questions) {
      const qKey = q.question_id || q.id;
      const asmId = q.assessment_id || 'default_assessment';
      if (!assembledQuestionsMap[asmId]) assembledQuestionsMap[asmId] = [];

      // Fallback: parse options_json string if options table is empty
      let qOpts = optionsMap[qKey] || [];
      if (qOpts.length === 0 && q.options_json) {
        try {
          const parsedOpts = typeof q.options_json === 'string' ? JSON.parse(q.options_json) : q.options_json;
          if (Array.isArray(parsedOpts)) {
            qOpts = parsedOpts.map((optItem: any, idx: number) => {
              if (typeof optItem === 'object' && optItem !== null) {
                return {
                  id: optItem.id || optItem.label || String.fromCharCode(65 + idx),
                  label: optItem.label || String.fromCharCode(65 + idx),
                  text: optItem.text || optItem.option_text || '',
                  sort_order: optItem.sort_order ?? idx
                };
              }
              return {
                id: String.fromCharCode(65 + idx),
                label: String.fromCharCode(65 + idx),
                text: String(optItem),
                sort_order: idx
              };
            });
          }
        } catch { /* ignore parse error */ }
      }

      assembledQuestionsMap[asmId].push({
        id: qKey,
        learning_standard_id: q.learning_standard_id || topic?.learning_standard_id || null,
        question_text: q.question_text || q.question || '',
        question_type: q.question_type || 'MCQ',
        question_image_url: q.question_image_url || null,
        options: qOpts,
        difficulty: q.difficulty || 'medium',
        cognitive_level: q.cognitive_level || 'understand'
      });
    }

    // Assemble Assessments
    const assembledAssessments = finalAssessments.map((a: any) => ({
      id: a.id,
      title: a.title,
      assessment_type: a.assessment_type || 'PRACTICE',
      time_limit_minutes: a.time_limit_minutes || 0,
      passing_score: a.passing_score || 80,
      reward_xp: a.reward_xp || 50,
      reward_coins: a.reward_coins || 10,
      questions: assembledQuestionsMap[a.id] || []
    }));

    // In-memory status prioritisation:
    // If any rows have status=published, keep only those.
    // Otherwise fall back to ALL rows (covers draft/generated lessons).
    const applyStatusFallback = (rows: any[]): any[] => {
      if (!Array.isArray(rows) || rows.length === 0) return [];
      const published = rows.filter(
        (r: any) => r.status === "published" || r.review_status === "published" || r.workflow_status === "PUBLISHED"
      );
      return published.length > 0 ? published : rows;
    };

    const filteredContent = applyStatusFallback(lessonContent);
    const filteredBlocks = applyStatusFallback(lessonBlocks);
    const filteredAssets = applyStatusFallback(mediaAssets);
    const filteredFlashcards = applyStatusFallback(flashcards);
    const filteredActivities = applyStatusFallback(activities);
    const filteredGuides = applyStatusFallback(teacherGuides);
    const filteredExplanations = applyStatusFallback(explanations);
    const filteredMistakes = applyStatusFallback(commonMistakes);
    // For assessments, prefer PUBLISHED workflow but fall back to any
    const filteredAssessments = (() => {
      const pub = (assessments || []).filter((a: any) => a.workflow_status === "PUBLISHED" || a.status === "published");
      return pub.length > 0 ? pub : (assessments || []);
    })();

    // Combine raw blocks & standalone entities into unified content_blocks array
    const rawCombinedBlocks = [...filteredContent, ...filteredBlocks];

    // Format & Parse LessonBlocks / LessonContent
    const formattedBlocks = rawCombinedBlocks
      .map((b: any) => {
        if (b.content_type) {
          let blockType = "TEXT_MARKDOWN";
          if (b.content_type === "notes") blockType = "TEXT_MARKDOWN";
          else if (b.content_type === "mindmap") blockType = "MINDMAP";
          else if (b.content_type === "video" || b.content_type === "video_script" || b.content_type === "video_embed") blockType = "VIDEO";
          else if (b.content_type === "worksheet") blockType = "WORKSHEET";
          else if (b.content_type === "infographic") blockType = "INFOGRAPHIC";
          else if (b.content_type === "flashcard") blockType = "FLASHCARD_DECK";
          else if (b.content_type === "activity" || b.content_type === "game" || b.content_type === "interactive") blockType = "INTERACTIVE_GAME";
          else blockType = b.content_type.toUpperCase();

          let parsedPayload: any = {};
          if (b.content_type === "mindmap") {
            try {
              parsedPayload = { branches: typeof b.content_markdown === "string" ? JSON.parse(b.content_markdown) : (b.content_markdown || []) };
            } catch {
              parsedPayload = { branches: [], markdown: b.content_markdown || "" };
            }
          } else if (b.content_type === "infographic") {
            let infoData: any = {};
            if (typeof b.content_markdown === "string") {
              try {
                infoData = JSON.parse(b.content_markdown);
              } catch {
                infoData = { short_description: b.content_markdown, raw_markdown: b.content_markdown };
              }
            } else if (typeof b.content_markdown === "object" && b.content_markdown !== null) {
              infoData = b.content_markdown;
            }

            const imgUrl = infoData.image_url || infoData.media_url || b.media_url || publishedVersion?.infographic_url || lesson?.infographic_url || "";
            const title = infoData.title || b.title || "Infografik Visual";
            const desc = infoData.short_description || infoData.summary || (typeof b.content_markdown === "string" ? b.content_markdown : "");
            const points = infoData.key_points || infoData.key_takeaways || [];
            const labels = infoData.visual_labels || (infoData.sections ? infoData.sections.map((s: any) => ({ label: s.heading, detail: s.content, icon: "📌" })) : []);

            parsedPayload = {
              image_url: imgUrl,
              title: title,
              short_description: desc,
              key_points: points,
              visual_labels: labels,
              summary: desc,
              key_takeaways: points,
              media_url: imgUrl,
              raw_markdown: typeof b.content_markdown === "string" ? b.content_markdown : ""
            };
          } else if (b.content_type === "flashcard") {
            try {
              parsedPayload = { cards: typeof b.content_markdown === "string" ? JSON.parse(b.content_markdown) : (b.content_markdown || []) };
            } catch {
              parsedPayload = { cards: [] };
            }
          } else if (b.content_type === "video" || b.content_type === "video_script" || b.content_type === "video_embed") {
            const vUrl = b.media_url || b.video_url || b.youtube_url || lesson.video_url || publishedVersion?.video_url || "";
            const vScript = b.voice_script || b.content_markdown || "";
            parsedPayload = {
              video_url: vUrl,
              youtube_url: vUrl,
              video_script: vScript,
              summary: b.content_markdown || vScript || ""
            };
          } else {
            parsedPayload = {
              markdown: b.content_markdown || "",
              voice_script: b.voice_script || "",
              media_url: b.media_url || "",
              image_url: b.media_url || "",
              youtube_url: b.media_url || "",
              summary: b.content_markdown || "",
              instructions: b.content_markdown || ""
            };
          }

          let blockTitle = b.title || "";
          if (blockType === "VIDEO" && (!blockTitle || blockTitle === "Skrip Video (AI)" || blockTitle === "Skrip Video")) {
            blockTitle = "Taklimat Video";
          }

          return {
            id: b.id,
            block_type: blockType,
            title: blockTitle,
            order_number: b.sort_order ?? 0,
            payload: parsedPayload,
          };
        }

        let parsedPayload = b.payload;
        if (typeof parsedPayload === 'string') {
          try { parsedPayload = JSON.parse(parsedPayload); } catch { /* keep raw string */ }
        }
        if (!parsedPayload || typeof parsedPayload !== 'object') {
          parsedPayload = {};
        }

        let bType = (b.block_type || "TEXT_MARKDOWN").toUpperCase();
        if (bType === "VIDEO_EMBED" || bType === "VIDEO_SCRIPT") {
          bType = "VIDEO";
        }

        if (bType === "VIDEO") {
          const vUrl = parsedPayload.video_url || parsedPayload.youtube_url || parsedPayload.media_url || b.video_url || lesson.video_url || publishedVersion?.video_url || "";
          const vScript = parsedPayload.video_script || parsedPayload.voice_script || parsedPayload.script || b.voice_script || b.content_markdown || "";
          parsedPayload = {
            video_url: vUrl,
            youtube_url: vUrl,
            video_script: vScript,
            summary: parsedPayload.summary || parsedPayload.markdown || b.content_markdown || ""
          };
        } else if (bType === "INFOGRAPHIC") {
          const imgUrl = parsedPayload.image_url || parsedPayload.media_url || b.media_url || publishedVersion?.infographic_url || lesson?.infographic_url || "";
          const title = parsedPayload.title || b.title || "Infografik Visual";
          const desc = parsedPayload.short_description || parsedPayload.summary || parsedPayload.markdown || "";
          const points = parsedPayload.key_points || parsedPayload.key_takeaways || [];
          const labels = parsedPayload.visual_labels || (parsedPayload.sections ? parsedPayload.sections.map((s: any) => ({ label: s.heading, detail: s.content, icon: "📌" })) : []);

          parsedPayload = {
            ...parsedPayload,
            image_url: imgUrl,
            title: title,
            short_description: desc,
            key_points: points,
            visual_labels: labels,
            summary: desc,
            key_takeaways: points,
            media_url: imgUrl
          };
        }

        let blockTitle = b.title || "";
        if (bType === "VIDEO" && (!blockTitle || blockTitle === "Skrip Video (AI)" || blockTitle === "Skrip Video")) {
          blockTitle = "Taklimat Video";
        }

        return {
          id: b.id,
          block_type: bType,
          title: blockTitle,
          order_number: b.order_number ?? 0,
          payload: parsedPayload
        };
      })
      .sort((a: any, b: any) => (a.order_number || 0) - (b.order_number || 0));

    // Append standalone LessonMediaAsset items as INFOGRAPHIC blocks if present
    if (Array.isArray(filteredAssets) && filteredAssets.length > 0) {
      filteredAssets.forEach((ma: any, idx: number) => {
        const hasMediaBlock = formattedBlocks.some((b: any) => b.id === ma.id);
        if (!hasMediaBlock) {
          let keyPoints = [];
          let visualLabels = [];
          try { keyPoints = typeof ma.key_points_json === "string" ? JSON.parse(ma.key_points_json) : (ma.key_points_json || []); } catch {}
          try { visualLabels = typeof ma.visual_labels_json === "string" ? JSON.parse(ma.visual_labels_json) : (ma.visual_labels_json || []); } catch {}

          formattedBlocks.push({
            id: ma.id || `media-asset-${idx + 1}`,
            block_type: "INFOGRAPHIC",
            title: ma.title || "Infografik Visual",
            order_number: ma.sort_order ?? 1.2,
            payload: {
              image_url: ma.image_url || "",
              media_url: ma.image_url || "",
              title: ma.title || "Infografik Visual",
              short_description: ma.description || "",
              description: ma.description || "",
              key_points: keyPoints,
              visual_labels: visualLabels
            }
          });
        }
      });
    }

    // Append standalone Flashcard deck to formattedBlocks if present and not already added
    if (Array.isArray(filteredFlashcards) && filteredFlashcards.length > 0) {
      const hasFlashcardBlock = formattedBlocks.some((b: any) => b.block_type === "FLASHCARD_DECK" || b.block_type === "FLASHCARD");
      if (!hasFlashcardBlock) {
        formattedBlocks.push({
          id: `flashcard-deck-${versionId}`,
          block_type: "FLASHCARD_DECK",
          title: "Kad Minda Memori",
          order_number: 1.5,
          payload: {
            cards: filteredFlashcards.map((f: any) => ({
              id: f.id,
              front: f.front || f.front_text || "",
              back: f.back || f.back_text || "",
              explanation: f.explanation || ""
            }))
          }
        });
      }
    }

    // Append standalone LearningActivities to formattedBlocks if present
    if (Array.isArray(filteredActivities) && filteredActivities.length > 0) {
      filteredActivities.forEach((act: any, idx: number) => {
        const hasActBlock = formattedBlocks.some((b: any) => b.id === act.id);
        if (!hasActBlock) {
          let parsedData: any = {};
          if (typeof act.activity_data_json === "string") {
            try { parsedData = JSON.parse(act.activity_data_json); } catch { parsedData = {}; }
          } else {
            parsedData = act.activity_data_json || {};
          }

          formattedBlocks.push({
            id: act.id || `activity-${idx + 1}`,
            block_type: "INTERACTIVE_GAME",
            title: act.title || "Aktiviti Pembelajaran Interaktif",
            order_number: 2.5 + idx * 0.1,
            payload: {
              activity_type: act.activity_type || parsedData.type || "matching",
              instructions: act.instructions || parsedData.instructions || "",
              activity_data: parsedData,
              items: parsedData.items || parsedData.pairs || parsedData.options || []
            }
          });
        }
      });
    }

    // Append TeacherGuide to formattedBlocks if present
    if (Array.isArray(filteredGuides) && filteredGuides.length > 0) {
      const tg = filteredGuides[0];
      const hasTg = formattedBlocks.some((b: any) => b.block_type === "TEACHER_GUIDE");
      if (!hasTg) {
        formattedBlocks.push({
          id: tg.id || `teacher-guide-${versionId}`,
          block_type: "TEACHER_GUIDE",
          title: "Panduan Pembelajaran Guru",
          order_number: 0.5,
          payload: {
            learning_objective: tg.learning_objective || "",
            teaching_strategy: tg.teaching_strategy || "",
            success_criteria: tg.success_criteria || "",
            suggested_activity: tg.suggested_activity || ""
          }
        });
      }
    }

    // Append AIExplanations to formattedBlocks if present
    if (Array.isArray(filteredExplanations) && filteredExplanations.length > 0) {
      const hasExp = formattedBlocks.some((b: any) => b.block_type === "AI_EXPLANATION");
      if (!hasExp) {
        formattedBlocks.push({
          id: `ai-explanations-${versionId}`,
          block_type: "AI_EXPLANATION",
          title: "Penerangan Pintar AI",
          order_number: 0.8,
          payload: {
            explanations: filteredExplanations.map((e: any) => ({
              concept: e.concept || "",
              explanation: e.explanation || "",
              example: e.example || "",
              analogy: e.analogy || ""
            }))
          }
        });
      }
    }

    // Append CommonMistakes to formattedBlocks if present
    if (Array.isArray(filteredMistakes) && filteredMistakes.length > 0) {
      const hasCm = formattedBlocks.some((b: any) => b.block_type === "COMMON_MISTAKES");
      if (!hasCm) {
        formattedBlocks.push({
          id: `common-mistakes-${versionId}`,
          block_type: "COMMON_MISTAKES",
          title: "Kesilapan Lazim",
          order_number: 2.8,
          payload: {
            mistakes: filteredMistakes.map((m: any) => ({
              mistake: m.mistake || "",
              correction: m.correction || "",
              explanation: m.explanation || "",
              recommended_activity: m.recommended_activity || ""
            }))
          }
        });
      }
    }

    // Sort final content blocks sequentially
    formattedBlocks.sort((a: any, b: any) => (a.order_number || 0) - (b.order_number || 0));

    // Assemble Optional Student Context
    const activeProgress = progressList?.[0] || {};
    const activeWallet = walletList?.[0] || {};
    const studentContext = activeStudentId ? {
      student_id: activeStudentId,
      display_name: studentUser?.nickname || studentUser?.full_name || 'Pelajar',
      level: activeProgress.level || 1,
      total_xp: activeProgress.total_xp || 0,
      streak_days: activeProgress.streak_days || 0,
      wallet_balance: activeWallet.balance || 0,
      education_level: studentUser?.education_level || studentUser?.school_year || ''
    } : null;

    // Resolve Primary Assessment Context
    const primaryAssessment = (assessmentIdParam
      ? assembledAssessments.find((a: any) => a.id === assessmentIdParam)
      : null) || assembledAssessments[0] || null;

    const assessmentContext = {
      challenge_type: primaryAssessment?.assessment_type || 'PRACTICE',
      reward: {
        xp: primaryAssessment?.reward_xp ?? 50,
        coins: primaryAssessment?.reward_coins ?? 10
      },
      completion_message: primaryAssessment
        ? `Tahniah! Anda telah menyempurnakan ${primaryAssessment.title || 'penilaian ini'}.`
        : "Tahniah! Anda telah menyempurnakan penilaian ini."
    };

    // ------------------------------------------------------------------
    // 7. UNIFIED LEARNING PACKAGE PAYLOAD CONTRACT
    // ------------------------------------------------------------------
    return Response.json({
      success: true,
      package_type: 'COMPLETE_LEARNING_PACKAGE',
      lesson_id: lessonId,
      version_id: versionId,
      blocks: formattedBlocks,
      curriculum_context: {
        curriculum_name: 'KSSR / KSSM',
        subject_id: subject?.id || '',
        subject_name: subject?.name || lesson.subject_name || '',
        topic_id: topic?.id || lesson.topic_id || '',
        topic_name: topic?.name || lesson.topic_name || '',
        form_level: topic?.form_level || studentUser?.education_level || 'Tahun 1',
        learning_standard_code: learningStandard?.code || '',
        learning_standard_description: learningStandard?.description || ''
      },
      lesson: {
        id: lessonId,
        title: lesson.title || topic?.name || 'Pelajaran',
        status: publishedVersion.status || 'draft'
      },
      version: {
        id: versionId,
        version_number: publishedVersion.version_number || 1,
        published_at: publishedVersion.published_at || publishedVersion.updated_at || new Date().toISOString()
      },
      content_blocks: formattedBlocks,
      // debug: block count breakdown visible to admin/dev for tracing
      _debug: {
        total_blocks: formattedBlocks.length,
        raw_lesson_content_rows: filteredContent.length,
        raw_lesson_block_rows: filteredBlocks.length,
        version_status: publishedVersion.status || 'unknown',
        version_id: versionId
      },
      assessments: assembledAssessments,
      learning_entities: {
        lesson_content: filteredContent,
        blocks: filteredBlocks,
        flashcards: filteredFlashcards,
        questions: questions,
        activities: filteredActivities,
        teacher_guides: filteredGuides,
        explanations: filteredExplanations,
        common_mistakes: filteredMistakes
      },
      assessment_context: assessmentContext,
      student_context: studentContext,
      rewards: {
        lesson_completion_xp: 20,
        lesson_completion_coins: 5,
        rules: (rewardRules || []).map((r: any) => ({
          activity_type: r.activity_type,
          base_xp: r.base_xp,
          base_coins: r.base_coins
        }))
      },
      learning_path: {
        prerequisite_met: true,
        recommended_next_action: assembledAssessments.length > 0 ? 'TAKE_ASSESSMENT' : 'NEXT_LESSON'
      }
    }, { status: 200, headers: resHeaders });

  } catch (error: any) {
    console.error('getLearningPackage Error:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Gagal memuatkan Pakej Pembelajaran.',
        debug: { stack: error.stack?.split('\n').slice(0, 3) }
      },
      { status: 500, headers: resHeaders }
    );
  }
});
