// base44/functions/generateAIContent/entry.ts
// AI-assisted content generation — creates AIContentRequest, generates content via InvokeLLM (non-Gemini),
// stores result for admin review. AI output NEVER goes directly to students.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

const CONTENT_SCHEMAS: Record<string, any> = {
  lesson_notes: {
    type: "object",
    properties: {
      title: { type: "string", description: "Engaging student-friendly title" },
      learning_goal: { type: "string", description: "What the student will learn today, answering 'Apa yang saya akan belajar hari ini?'" },
      key_points: { type: "array", items: { type: "string" }, description: "Most important knowledge points" },
      concept_explanation: { type: "string", description: "Step-by-step concept explanation in Markdown" },
      examples: {
        type: "array",
        items: {
          type: "object",
          properties: {
            problem: { type: "string" },
            solution: { type: "string" },
          },
          required: ["problem", "solution"],
        },
        description: "Worked examples",
      },
      visual_suggestions: { type: "array", items: { type: "string" }, description: "Suggestions for diagrams, illustrations, tables, number lines, mind maps" },
      memory_tips: { type: "string", description: "Easy ways to remember concepts" },
      mini_activity: { type: "string", description: "A small interactive challenge" },
      quick_check: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question"],
        },
        description: "3-5 questions to check understanding",
      },
    },
    required: ["title", "learning_goal", "key_points", "concept_explanation"],
  },
  video_script: {
    type: "object",
    properties: {
      video_script: { type: "string", description: "Video narration script" },
      video_url: { type: "string", description: "Suggested YouTube search term" },
    },
    required: ["video_script"],
  },
  flashcards: {
    type: "object",
    properties: {
      flashcards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            front: { type: "string" },
            back: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["front", "back"],
        },
      },
    },
    required: ["flashcards"],
  },
  questions: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correct_answer: { type: "string" },
            explanation: { type: "string" },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            cognitive_level: { type: "string", enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"] },
            hint: { type: "string" },
          },
          required: ["question", "options", "correct_answer", "explanation", "difficulty"],
        },
      },
    },
    required: ["questions"],
  },
  activity: {
    type: "object",
    properties: {
      activity_type: { type: "string", enum: ["matching", "sorting", "fill_blank", "true_false", "word_builder"] },
      title: { type: "string" },
      instructions: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            left: { type: "string", description: "Item / Soalan kiri untuk padanan" },
            right: { type: "string", description: "Item / Jawapan kanan untuk padanan" },
            category: { type: "string", description: "Nama kategori untuk aktiviti isihan" },
            sentence: { type: "string", description: "Ayat soalan untuk fill_blank" },
            answer: { type: "string", description: "Jawapan betul untuk fill_blank" },
            statement: { type: "string", description: "Kenyataan untuk true_false" },
            is_true: { type: "boolean", description: "Status betul (true) atau salah (false) untuk true_false" }
          }
        },
        description: "Senarai item/pasangan padanan/latihan interaktif"
      },
      activity_data: { type: "string", description: "JSON string of activity-specific data (backward compat)" }
    },
    required: ["activity_type", "title", "instructions", "items"],
  },
  teacher_guide: {
    type: "object",
    properties: {
      learning_objective: { type: "string" },
      success_criteria: { type: "string" },
      teaching_strategy: { type: "string" },
      suggested_activity: { type: "string" },
      assessment_notes: { type: "string" },
    },
    required: ["learning_objective", "teaching_strategy"],
  },
  mindmap: {
    type: "object",
    properties: {
      branches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            children: { type: "array", items: { type: "string" } },
          },
          required: ["label", "children"],
        },
      },
    },
    required: ["branches"],
  },
  infographic: {
    type: "object",
    properties: {
      title: { type: "string", description: "Tajuk infografik" },
      short_description: { type: "string", description: "Penerangan ringkas tumpuan visual" },
      image_url: { type: "string", description: "URL imej infografik utama / ilustrasi pembelajaran" },
      key_points: {
        type: "array",
        items: { type: "string" },
        description: "3-5 poin pengajaran paling penting"
      },
      visual_labels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Label atau tajuk elemen visual" },
            detail: { type: "string", description: "Penerangan elemen" },
            icon: { type: "string", description: "Emoji atau ikon pengenalan (cth: 💡, 📌, ⚡)" }
          },
          required: ["label", "detail"]
        },
        description: "Mata fokus visual / label rajah"
      },
      summary: { type: "string", description: "Ringkasan kesimpulan (backward compat)" },
      key_takeaways: { type: "array", items: { type: "string" }, description: "Pengajaran utama (backward compat)" },
      visual_layout: { type: "string", description: "Cadangan susun atur visual" }
    },
    required: ["title", "short_description", "key_points", "visual_labels"],
  },
  worksheet: {
    type: "object",
    properties: {
      content_markdown: { type: "string", description: "Worksheet content in Markdown" },
    },
    required: ["content_markdown"],
  },
  explanation: {
    type: "object",
    properties: {
      explanations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            concept: { type: "string" },
            explanation: { type: "string" },
            example: { type: "string" },
            analogy: { type: "string" },
          },
          required: ["concept", "explanation"],
        },
      },
    },
    required: ["explanations"],
  },
  common_mistakes: {
    type: "object",
    properties: {
      mistakes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            mistake: { type: "string" },
            correction: { type: "string" },
            explanation: { type: "string" },
            recommended_activity: { type: "string" },
          },
          required: ["mistake", "correction", "explanation"],
        },
      },
    },
    required: ["mistakes"],
  },
};

const buildPrompt = (contentType: string, topicName: string, subjectName: string, levelName: string, customContext?: string) => {
  const base = `Anda adalah pakar pendidikan KSSR/KSSM Malaysia. Jana kandungan pembelajaran berkualiti tinggi dalam Bahasa Melayu.

Topik: ${topicName}
Subjek: ${subjectName}
Tahap: ${levelName}

Jenis kandungan yang dijana: ${contentType}`;
  const context = customContext ? `\n\nKonteks tambahan dari admin:\n${customContext}` : "";
  const instruction = `\n\nPastikan kandungan:
1. Sesuai dengan tahap persekolahan Malaysia (${levelName})
2. Menggunakan Bahasa Melayu yang betul dan mesra kanak-kanak
3. Berdasarkan sukatan KSSR/KSSM
4. Fakta yang tepat dan mudah difahami`;
  return base + context + instruction;
};

const buildLessonNotesPrompt = (topicName: string, subjectName: string, levelName: string, customContext?: string) => {
  const isPrimary = /tahun/i.test(levelName);
  const stage = isPrimary ? "KSSR" : "KSSM";
  const levelLabel = isPrimary ? "Sekolah Rendah" : "Sekolah Menengah";

  const ageGuidance = isPrimary
    ? `Adaptasi untuk pelajar sekolah rendah:
- Gunakan Bahasa Melayu yang mudah dan ringkas
- Ayat pendek
- Penjelasan visual
- Contoh kehidupan harian
- Nada mesra dan periang
- Gaya pengembaraan StudyQuest yang menyeronokkan bila sesuai`
    : `Adaptasi untuk pelajar sekolah menengah:
- Gunakan bahasa akademik yang jelas
- Terangkan konsep secara mendalam
- Sertakan formula, definisi dan penaakulan
- Hubungkan konsep dengan aplikasi kehidupan sebenar`;

  return `Anda ialah StudyQuest AI Learning Content Creator.

Tugas anda ialah menukarkan kandungan kurikulum Malaysia (${stage} - ${levelLabel}) menjadi nota pembelajaran mesra pelajar.

Output BUKAN rancangan pengajaran guru.
Output akan dipaparkan terus kepada pelajar di dalam aplikasi pembelajaran StudyQuest.

================================================

INPUT:
Tahap Pendidikan: ${stage} (${levelLabel})
Tingkatan/Tahun: ${levelName}
Subjek: ${subjectName}
Topik: ${topicName}${customContext ? `\nRujukan / Standard Pembelajaran:\n${customContext}` : ""}

================================================

KEPERLUAN NOTA PEMBELAJARAN PELAJAR:

Cipta nota yang membantu pelajar memahami, mengingat dan mengaplikasi konsep.

${ageGuidance}

================================================

JANA dalam format JSON berikut:
{
  "title": "",
  "learning_goal": "",
  "key_points": [],
  "examples": [{"problem":"","solution":""}],
  "visual_suggestions": [],
  "memory_tips": "",
  "mini_activity": "",
  "quick_check": [{"question":"","answer":""}]
}

================================================

PERATURAN KANDUNGAN:

1. Title — Tajuk menarik mesra pelajar.
2. Learning Goal — Terangkan: "Apa yang saya akan belajar hari ini?"
3. Key Points — Ringkasan pengetahuan paling penting.
4. Concept Explanation (medan "concept_explanation") — Terangkan langkah demi langkah.
   ${isPrimary ? "Gunakan contoh mudah." : "Sertakan: Definisi, Peraturan, Formula, Penaakulan."}
5. Examples — Contoh penyelesaian terbimbing.
6. Visual Suggestions — Cadang: rajah, ilustrasi, jadual, garis nombor, peta minda.
7. Memory Tips — Cara mudah untuk mengingat konsep.
8. Mini Activity — Cabaran interaktif kecil.
9. Quick Check — 3-5 soalan untuk semak pemahaman.

================================================

PERSONALISASI:
Gunakan placeholder {{nama}} untuk merujuk kepada pelajar secara peribadi.
- Title: boleh sertakan "{{nama}}" sekali (cth: "Hai {{nama}}! Mari Kita...").
- Learning Goal & Mini Activity: boleh panggil "{{nama}}" supaya nota terasa mesra.
JANGAN gantikan {{nama}} dengan nama sebenar. Biarkan placeholder {{nama}} apa adanya.

================================================

JANGAN sertakan:
- Arahan guru
- Tempoh pelajaran
- Pengurusan kelas
- Strategi pengajaran
- Refleksi guru
- Nota penilaian guru

Output mesti rasa seperti jurnal pembelajaran peribadi pelajar.`;
};

const buildInfographicPrompt = (topicName: string, subjectName: string, levelName: string, customContext?: string) => {
  return `Anda ialah StudyQuest AI Visual Content Creator untuk infografik pembelajaran KSSR/KSSM Malaysia.

Tugas: Cipta infografik visual-first learning card untuk topik ini.

INPUT:
Tahap: ${levelName}
Subjek: ${subjectName}
Topik: ${topicName}${customContext ? `\nKonteks Tambahan: ${customContext}` : ""}

KEPERLUAN INFOGRAFIK VISUAL:
1. Utamakan imej visual utama (image_url). Sediakan cadangan URL imej ilustrasi berkualiti atau Unsplash educational photo yang paling sesuai dengan ${topicName}.
2. Sediakan tajuk menarik (title) dan penerangan ringkas (short_description).
3. Sertakan 3-5 poin fokus utama (key_points).
4. Sertakan 3-5 label visual (visual_labels) dengan tajuk label, penerangan detail, dan ikon emoji.
5. Gunakan Bahasa Melayu mesra kanak-kanak. Boleh gunakan placeholder {{nama}} untuk personalisasi.

JANA dalam format JSON berikut:
{
  "title": "Tajuk Kad Infografik",
  "short_description": "Penerangan ringkas konsep utama...",
  "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
  "key_points": ["Poin utama 1", "Poin utama 2", "Poin utama 3"],
  "visual_labels": [
    { "label": "Elemen A", "detail": "Fungsi utama elemen A", "icon": "💡" },
    { "label": "Elemen B", "detail": "Proses berlaku di B", "icon": "⚡" }
  ]
}`;
};

const getBloomDistributionGuidance = (levelName: string): string => {
  const levelStr = String(levelName || "").toLowerCase();

  // Primary Year 1-3 (Tahun 1, 2, 3)
  if (/(tahun|y|year)\s*[1-3]/i.test(levelStr) || levelStr.includes("tahun 1") || levelStr.includes("tahun 2") || levelStr.includes("tahun 3")) {
    return `- 30% (3 Soalan) Mengingat (Remember): Kenal pasti, sebut fakta asas, padanan mudah.
- 40% (4 Soalan) Memahami (Understand): Terangkan maksud, gambarkan konsep harian.
- 20% (2 Soalan) Mengaplikasi (Apply): Selesaikan masalah situasi ringkas.
- 10% (1 Soalan) Menganalisis (Analyze): Bandingkan 2 objek atau situasi mudah.`;
  }

  // Primary Year 4-6 (Tahun 4, 5, 6)
  if (/(tahun|y|year)\s*[4-6]/i.test(levelStr) || levelStr.includes("tahun 4") || levelStr.includes("tahun 5") || levelStr.includes("tahun 6")) {
    return `- 20% (2 Soalan) Mengingat (Remember): Definisi dan fakta kurikulum.
- 30% (3 Soalan) Memahami (Understand): Penjelasan konsep dan rajah.
- 30% (3 Soalan) Mengaplikasi (Apply): Pengiraan atau penyelesaian masalah harian.
- 20% (2 Soalan) Menganalisis (Analyze): Hubung kait fakta, urutan sebab-akibat.`;
  }

  // Secondary (Tingkatan 1-5 / Form 1-5)
  return `- 20% (2 Soalan) Mengingat (Remember): Istilah akademik, formula, takrifan DSKP.
- 30% (3 Soalan) Memahami (Understand): Mekanisme, prinsip, dan penerangan konsep.
- 30% (3 Soalan) Mengaplikasi (Apply): Penggunaan formula, senario kehidupan sebenar.
- 20% (2 Soalan) KBAT / HOTS (Menganalisis/Menilai/Mencipta): Penilaian data, keputusan terbaik, justifikasi jawapan.`;
};

const buildQuestionsPrompt = (topicName: string, subjectName: string, levelName: string, customContext?: string) => {
  const bloomGuidance = getBloomDistributionGuidance(levelName);

  return `Anda ialah pakar pentaksiran kurikulum KSSR/KSSM Malaysia.
Jana 10 soalan kuiz pilihan berganda (MCQ) berkualiti tinggi untuk topik "${topicName}" (${subjectName}, ${levelName}) dalam Bahasa Melayu.

================================================
DISTRIBUSI TAKSONOMI BLOOM (MANDATORI 10 SOALAN UNTUK ${levelName}):
${bloomGuidance}

================================================
PERATURAN PILIHAN JAWAPAN SIKAP/DISTRACTOR:
1. SETIAP jawapan salah (distractor) MESTI mewakili kesilapan lazim (realistic Malaysian student misconception) yang kerap dibuat oleh pelajar Malaysia semasa belajar topik ini.
2. JANGAN sertakan jawapan yang terlalu mudah diteka, unsur jenaka, atau pilihan mengarut.
3. Elakkan corak berulang (seperti jawapan A sentiasa betul).
4. Gunakan contoh situasi harian dan konteks yang familiar kepada pelajar di Malaysia.

Jana JSON mengikut format persis berikut:
{
  "questions": [
    {
      "question": "Soalan yang jelas dan berpandukan DSKP...",
      "options": ["Jawapan A", "Jawapan B", "Jawapan C", "Jawapan D"],
      "correct_answer": "Jawapan A",
      "explanation": "Penjelasan terperinci mengapa jawapan ini betul...",
      "cognitive_level": "remember",
      "difficulty": "medium",
      "hint": "Petunjuk membantu pelajar"
    }
  ]
}${customContext ? `\nKonteks Tambahan: ${customContext}` : ""}`;
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Authenticate — admin only
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: "Sesi tidak sah. Sila log masuk." }, { status: 401 });
    }

    const builtInRole = String(user.role || "").toLowerCase();
    const appRole = String(user.app_role || "").toLowerCase();
    if (builtInRole !== "admin" && appRole !== "admin" && appRole !== "teacher" && user.is_admin !== true) {
      return Response.json({ success: false, error: "Hanya pentadbir/guru dibenarkan." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { lesson_version_id, content_type, prompt_context } = body;

    if (!lesson_version_id || !content_type) {
      return Response.json({ success: false, error: "lesson_version_id dan content_type diperlukan." }, { status: 400 });
    }

    if (!CONTENT_SCHEMAS[content_type]) {
      return Response.json({ success: false, error: `Jenis kandungan tidak sah: ${content_type}` }, { status: 400 });
    }

    // 2. Fetch LessonVersion + Lesson + Topic + Subject for context
    const lessonVersion = await base44.asServiceRole.entities.LessonVersion.get(lesson_version_id).catch(() => null);
    if (!lessonVersion) {
      return Response.json({ success: false, error: "LessonVersion tidak dijumpai." }, { status: 404 });
    }

    const lesson = await base44.asServiceRole.entities.Lesson.get(lessonVersion.lesson_id).catch(() => null);
    const topic = lesson?.topic_id ? await base44.asServiceRole.entities.Topic.get(lesson.topic_id).catch(() => null) : null;
    const subject = topic?.subject_id ? await base44.asServiceRole.entities.Subject.get(topic.subject_id).catch(() => null) : null;

    const topicName = topic?.name || lesson?.topic_name || "Topik";
    const subjectName = subject?.name || lesson?.subject_name || "Subjek";
    const levelName = topic?.form_level || "Tahun 1";

    // 3. Create AIContentRequest — status: requested
    const aiRequest = await base44.asServiceRole.entities.AIContentRequest.create({
      lesson_version_id,
      lesson_id: lessonVersion.lesson_id,
      content_type,
      prompt_context: prompt_context || "",
      status: "requested",
      generated_by: user.id,
    });

    // 4. Update to generating
    await base44.asServiceRole.entities.AIContentRequest.update(aiRequest.id, { status: "generating" });

    try {
      // 5. Check for custom prompt template
      const templates = await base44.asServiceRole.entities.AIPromptTemplate.filter({
        content_type,
        status: "active",
      });
      const matchingTemplate = templates.find((t: any) =>
        (!t.subject || t.subject === subjectName) &&
        (!t.level || t.level === levelName)
      );

      const promptText = matchingTemplate
        ? matchingTemplate.prompt_template
            .replace(/\{topic\}/g, topicName)
            .replace(/\{subject\}/g, subjectName)
            .replace(/\{level\}/g, levelName)
        : (content_type === "lesson_notes"
          ? buildLessonNotesPrompt(topicName, subjectName, levelName, prompt_context)
          : content_type === "infographic"
          ? buildInfographicPrompt(topicName, subjectName, levelName, prompt_context)
          : content_type === "questions"
          ? buildQuestionsPrompt(topicName, subjectName, levelName, prompt_context)
          : buildPrompt(content_type, topicName, subjectName, levelName, prompt_context));

      // 6. Call InvokeLLM — use Google Gemini for educational reasoning
      const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: promptText,
        model: "gemini_3_flash",
        response_json_schema: CONTENT_SCHEMAS[content_type],
      });

      // 6b. Dynamic Image Generation Pipeline for Infographics
      if (content_type === "infographic" || content_type === "infographic_image") {
        const visualPrompt =
          aiResponse.image_prompt ||
          aiResponse.short_description ||
          `Educational infographic diagram for ${topicName}`;

        try {
          const imageRes = await base44.asServiceRole.integrations.Core.GenerateImage({
            prompt: `High quality clean educational vector infographic diagram illustration for Malaysian KSSR/KSSM students about "${topicName}". Concept: ${visualPrompt}. Bright colors, clear visual structure, school textbook style, digital vector art.`,
          }).catch(() => null);

          if (imageRes && (imageRes.url || imageRes.image_url)) {
            aiResponse.image_url = imageRes.url || imageRes.image_url;
          }
        } catch (imgErr) {
          console.warn("GenerateImage non-fatal warning:", imgErr);
        }
      }

      // 7. Store generated content in AIContentRequest
      await base44.asServiceRole.entities.AIContentRequest.update(aiRequest.id, {
        status: "completed",
        generated_content: JSON.stringify(aiResponse),
      });

      return Response.json({
        success: true,
        request_id: aiRequest.id,
        content_type,
        generated_content: aiResponse,
      });
    } catch (genError: any) {
      await base44.asServiceRole.entities.AIContentRequest.update(aiRequest.id, {
        status: "failed",
      });
      return Response.json({ success: false, error: genError.message || "Gagal menjana kandungan AI." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("generateAIContent error:", error);
    return Response.json({ success: false, error: error.message || "Ralat sistem." }, { status: 500 });
  }
}