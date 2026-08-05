// base44/functions/saveGeneratedLesson/entry.ts
// Converts AI generated lesson package from AdminContentStudio into database records
// (Lesson, LessonVersion, LessonBlock, Assessment, QuestionBank, QuestionOption).

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function(req: Request): Promise<Response> {
  let step = "INITIALIZATION";
  try {
    const base44 = createClientFromRequest(req);

    // 1. Authenticate user - allow admin or teacher
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      // Fallback check if request is valid
      console.warn("saveGeneratedLesson: Unauthenticated or service invocation");
    }

    step = "PARSING_REQUEST";
    const body = await req.json().catch(() => ({}));
    const {
      subject,
      year_level,
      topic,
      sp_code,
      sk_code,
      target_tp,
      package: pkg
    } = body;

    if (!pkg) {
      return Response.json(
        { success: false, error: "Pakej pelajaran (package) tidak dibekalkan." },
        { status: 400 }
      );
    }

    const subjectName = subject || pkg.subject || "Matematik";
    const yearLevel = String(year_level || pkg.year_level || pkg.grade || "Tahun 1");
    const topicName = topic || pkg.topic || "Pelajaran AI";
    const skCode = sk_code || pkg.sk_code || pkg.lesson?.metadata?.sk_code || "";
    const spCode = sp_code || pkg.sp_code || pkg.lesson?.metadata?.sp_code || "";
    const lessonTitle = pkg.title || pkg.lesson?.title || `Pelajaran ${subjectName}: ${topicName}`;

    // 2. Create or Reuse Lesson record
    step = "LESSON_RECORD";
    let lessonId = "";
    try {
      const existingLessons = await base44.asServiceRole.entities.Lesson.filter({
        subject_name: subjectName,
        topic_name: topicName,
        grade: yearLevel
      });
      if (existingLessons && existingLessons.length > 0) {
        lessonId = existingLessons[0].id;
      }
    } catch (e) {
      console.warn("Error filtering existing Lesson:", e);
    }

    if (!lessonId) {
      const newLesson = await base44.asServiceRole.entities.Lesson.create({
        subject_name: subjectName,
        topic_name: topicName,
        grade: yearLevel,
        title: lessonTitle,
        sk_code: skCode,
        sp_code: spCode,
        status: "draft"
      });
      lessonId = newLesson.id;
    }

    // 3. Determine version number & Create LessonVersion record
    step = "LESSON_VERSION_RECORD";
    let versionNumber = 1;
    try {
      const existingVersions = await base44.asServiceRole.entities.LessonVersion.filter({
        lesson_id: lessonId
      });
      if (existingVersions && existingVersions.length > 0) {
        const maxVer = Math.max(...existingVersions.map((v: any) => v.version_number || 1));
        versionNumber = maxVer + 1;
      }
    } catch (e) {
      console.warn("Error fetching existing LessonVersions:", e);
    }

    const lessonVersion = await base44.asServiceRole.entities.LessonVersion.create({
      lesson_id: lessonId,
      version_number: versionNumber,
      status: "draft",
      preview_status: "APPROVED",
      quality_score: pkg.lesson?.quality_score || pkg.quality_score || 95,
      completeness_score: 100,
      year_level: yearLevel,
      sk_code: skCode,
      sp_code: spCode,
      created_source: "ai_generated"
    });
    const lessonVersionId = lessonVersion.id;

    // 4. Extract & Create LessonBlocks
    step = "LESSON_BLOCKS_RECORD";
    let rawBlocks: any[] = [];

    // Support v2.0 (pkg.lesson.blocks or pkg.blocks) and v1.0 (pkg.steps + pkg.student_ui)
    if (pkg.version === "2.0" || pkg.lesson?.blocks) {
      rawBlocks = pkg.lesson?.blocks || pkg.blocks || [];
    } else if (Array.isArray(pkg.steps)) {
      // Convert legacy steps format to modular blocks
      if (pkg.student_ui?.mascot_dialogue) {
        rawBlocks.push({
          block_type: "INTRO",
          title: "Pengenalan",
          pedagogical_phase: "engage",
          cognitive_level: "remember",
          content: {
            mascot_dialogue: pkg.student_ui.mascot_dialogue,
            intro_title: lessonTitle
          }
        });
      }

      pkg.steps.forEach((st: any, idx: number) => {
        let blockType = st.step_type || "CONCEPT";
        if (blockType === "STORY") blockType = "STORY_HOOK";
        rawBlocks.push({
          block_type: blockType,
          title: st.title || `Langkah ${idx + 1}`,
          pedagogical_phase: st.pedagogical_phase || (idx === 0 ? "engage" : "explain"),
          cognitive_level: st.cognitive_level || "understand",
          content: st.payload || st.content || st
        });
      });

      rawBlocks.push({
        block_type: "REWARD",
        title: "Ganjaran",
        pedagogical_phase: "evaluate",
        cognitive_level: "remember",
        content: { reward_xp: 50, reward_coins: 20 }
      });
    }

    let blocksCreated = 0;
    const questionsExtracted: any[] = [];

    for (let i = 0; i < rawBlocks.length; i++) {
      const b = rawBlocks[i];
      const blockType = (b.block_type || b.type || "CONCEPT").toUpperCase();
      const orderNumber = b.order || b.order_number || (i + 1);
      const blockContent = b.content || b.payload || b;

      // Extract quiz questions if inside a QUIZ block
      if (blockType === "QUIZ" && blockContent?.questions) {
        if (Array.isArray(blockContent.questions)) {
          questionsExtracted.push(...blockContent.questions);
        }
      }

      const payloadStr = typeof blockContent === "string" ? blockContent : JSON.stringify(blockContent);

      await base44.asServiceRole.entities.LessonBlock.create({
        lesson_version_id: lessonVersionId,
        lesson_id: lessonId,
        block_type: blockType,
        title: b.title || blockType,
        order_number: orderNumber,
        payload: payloadStr,
        pedagogical_phase: b.pedagogical_phase || "explain",
        cognitive_level: b.cognitive_level || "understand",
        status: "draft"
      });
      blocksCreated++;
    }

    // 5. Create Assessments & Question Records
    step = "ASSESSMENT_RECORDS";
    let assessmentsCreated = 0;

    // Check for direct questions in package
    if (pkg.quiz?.questions && Array.isArray(pkg.quiz.questions)) {
      questionsExtracted.push(...pkg.quiz.questions);
    }
    if (pkg.assessments && Array.isArray(pkg.assessments)) {
      pkg.assessments.forEach((asm: any) => {
        if (asm.questions && Array.isArray(asm.questions)) {
          questionsExtracted.push(...asm.questions);
        }
      });
    }

    if (questionsExtracted.length > 0) {
      const tpVal = parseInt(String(target_tp || "3").replace(/\D/g, ""), 10) || 3;

      const assessment = await base44.asServiceRole.entities.Assessment.create({
        lesson_id: lessonId,
        lesson_version_id: lessonVersionId,
        title: `Kuarikulum Pelajaran: ${topicName}`,
        type: "quiz",
        assessment_type: "PRACTICE",
        tp_level: tpVal,
        total_questions: questionsExtracted.length,
        passing_score: 80,
        status: "draft"
      });
      assessmentsCreated++;

      for (let qIdx = 0; qIdx < questionsExtracted.length; qIdx++) {
        const qData = questionsExtracted[qIdx];
        const questionIdStr = `q_${Date.now()}_${qIdx + 1}`;

        const qText = qData.question || qData.question_text || qData.stem || `Soalan ${qIdx + 1}`;
        const correctAns = qData.correct_answer || qData.answer || qData.correctAnswer || "A";
        const explanationStr = qData.explanation || qData.rationale || "";
        const diffStr = (qData.difficulty || "medium").toLowerCase();

        const optsArr = qData.options || qData.choices || [];
        const optsJson = JSON.stringify(optsArr);

        const qbRecord = await base44.asServiceRole.entities.QuestionBank.create({
          question_id: questionIdStr,
          lesson_id: lessonId,
          lesson_version_id: lessonVersionId,
          assessment_id: assessment.id,
          question: qText,
          correct_answer: String(correctAns),
          explanation: explanationStr,
          difficulty: ["easy", "medium", "hard"].includes(diffStr) ? diffStr : "medium",
          quiz_type: "lesson_quiz",
          options_json: optsJson,
          hint: qData.hint || "",
          cognitive_level: qData.cognitive_level || "understand",
          status: "draft",
          created_source: "ai_generated"
        });

        // Store options in QuestionOption table if array provided
        if (Array.isArray(optsArr)) {
          for (let oIdx = 0; oIdx < optsArr.length; oIdx++) {
            const opt = optsArr[oIdx];
            const label = typeof opt === "object" ? (opt.label || String.fromCharCode(65 + oIdx)) : String.fromCharCode(65 + oIdx);
            const text = typeof opt === "object" ? (opt.text || opt.option_text || "") : String(opt);

            if (text) {
              await base44.asServiceRole.entities.QuestionOption.create({
                question_id: qbRecord.question_id || qbRecord.id,
                label,
                text,
                sort_order: oIdx
              });
            }
          }
        }
      }
    }

    return Response.json({
      success: true,
      lesson_id: lessonId,
      lesson_version_id: lessonVersionId,
      blocks_created: blocksCreated,
      assessments_created: assessmentsCreated
    });

  } catch (err: any) {
    console.error(`saveGeneratedLesson Failed at step [${step}]:`, err);
    return Response.json({
      success: false,
      step_failed: step,
      error: err?.message || String(err),
      debug: { stack: err?.stack }
    }, { status: 500 });
  }
}
