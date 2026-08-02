// base44/functions/evaluateLessonQuality/entry.ts
// Phase 3: Upgraded AI Lesson Quality Evaluator Edge Function
// Evaluates lesson content against the 5-part weighted DSKP quality rubric and enforces 4 publication tiers.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface QualityAuditInput {
  lesson_version_id: string;
}

const FIVE_PART_QUALITY_SCHEMA = {
  type: "object",
  properties: {
    curriculum_alignment_score: { type: "number", description: "Keselarasan SK/SP DSKP & Objektif (30%)" },
    pedagogical_structure_score: { type: "number", description: "Kelengkapan 5 Fasa Pedagogi & Contoh Terbimbing (25%)" },
    language_quality_score: { type: "number", description: "Ketepatan Bahasa Melayu Istilah DBP (15%)" },
    student_engagement_score: { type: "number", description: "Set Induksi Suku 🐢 & Aksesibiliti (15%)" },
    assessment_quality_score: { type: "number", description: "Keseimbangan Bloom 30/40/30 & Miskonsepsi (15%)" },

    publication_tier: {
      type: "string",
      enum: ["EXCELLENT_AUTO_APPROVE", "GOOD_PUBLISH_ALLOWED", "NEEDS_REVIEW", "REJECTED"],
      description: "Tier kelayakan penerbitan (90-100: Auto Approve, 80-89: Good, 70-79: Review, <70: Reject)",
    },
    strengths: { type: "array", items: { type: "string" }, description: "Kekuatan utama modul" },
    weaknesses: { type: "array", items: { type: "string" }, description: "Kelemahan atau ruang penambahbaikan" },
    improvement_suggestions: { type: "array", items: { type: "string" }, description: "Cadangan penambahbaikan terperinci" },
  },
  required: [
    "curriculum_alignment_score",
    "pedagogical_structure_score",
    "language_quality_score",
    "student_engagement_score",
    "assessment_quality_score",
    "publication_tier",
    "strengths",
    "weaknesses",
    "improvement_suggestions"
  ],
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: QualityAuditInput = await req.json().catch(() => ({}));

    if (!body.lesson_version_id) {
      return Response.json(
        { success: false, error: "lesson_version_id diperlukan." },
        { status: 400 }
      );
    }

    const version = await base44.asServiceRole.entities.LessonVersion.get(body.lesson_version_id).catch(() => null);
    if (!version) {
      return Response.json(
        { success: false, error: "Versi pelajaran tidak ditemui." },
        { status: 404 }
      );
    }

    const blocks = await base44.asServiceRole.entities.LessonBlock.filter({
      lesson_version_id: version.id,
    }).catch(() => []);

    const notes = version.notes_content || "";
    const skCode = version.sk_code || "SK Tidak Dinyatakan";
    const spCode = version.sp_code || "SP Tidak Dinyatakan";

    const systemPrompt = `Anda ialah Ketua Pemeriksa Audit Kualiti Kandungan DSKP KPM.
Tugas anda ialah meneliti modul pelajaran ini mengikut 5 MATRIKS KUALITI WAJIB:
1. Curriculum Alignment (30%): Keselarasan SK/SP & Objektif Pembelajaran.
2. Pedagogical Structure (25%): Kelengkapan 5 Fasa Pedagogi & Contoh Terbimbing.
3. Language Quality (15%): Ketepatan Bahasa Melayu DBP & Istilah Sains/Matematik.
4. Student Engagement (15%): Set Induksi Misteri Suku 🐢 & Keberkesanan Visual.
5. Assessment Quality (15%): Keseimbangan Bloom (30% Ingat, 40% Faham/Aplikasi, 30% KBAT).

PENENTUAN TIER PENERBITAN:
- 90 - 100: EXCELLENT_AUTO_APPROVE
- 80 - 89: GOOD_PUBLISH_ALLOWED
- 70 - 79: NEEDS_REVIEW
- Dibawah 70: REJECTED`;

    const userPrompt = `Audit kandungan DSKP ini:
SK: ${skCode}
SP: ${spCode}
Jumlah Blok Kandungan: ${blocks.length}
Petikan Nota:
${notes.slice(0, 3000)}`;

    const auditRes = await base44.asServiceRole.integrations.CoreLLM.invokeLLM({
      systemPrompt,
      prompt: userPrompt,
      responseFormat: "json",
      jsonSchema: FIVE_PART_QUALITY_SCHEMA,
    });

    const report = typeof auditRes === "string" ? JSON.parse(auditRes) : auditRes;

    // Calculate 5-part Weighted Cumulative Score
    const cScore = (report.curriculum_alignment_score || 85) * 0.30;
    const pScore = (report.pedagogical_structure_score || 85) * 0.25;
    const lScore = (report.language_quality_score || 85) * 0.15;
    const eScore = (report.student_engagement_score || 85) * 0.15;
    const aScore = (report.assessment_quality_score || 85) * 0.15;

    const weightedScore = Math.round(cScore + pScore + lScore + eScore + aScore);

    // Resolve Tier & Publish Status
    let tier: "EXCELLENT_AUTO_APPROVE" | "GOOD_PUBLISH_ALLOWED" | "NEEDS_REVIEW" | "REJECTED" = "REJECTED";
    let isPublishAllowed = false;

    if (weightedScore >= 90) {
      tier = "EXCELLENT_AUTO_APPROVE";
      isPublishAllowed = true;
    } else if (weightedScore >= 80) {
      tier = "GOOD_PUBLISH_ALLOWED";
      isPublishAllowed = true;
    } else if (weightedScore >= 70) {
      tier = "NEEDS_REVIEW";
      isPublishAllowed = false;
    } else {
      tier = "REJECTED";
      isPublishAllowed = false;
    }

    report.publication_tier = tier;

    // Save Scorecard on LessonVersion
    await base44.asServiceRole.entities.LessonVersion.update(version.id, {
      quality_score: weightedScore,
      quality_feedback: JSON.stringify(report),
    }).catch(() => {});

    return Response.json({
      success: true,
      quality_score: weightedScore,
      publication_tier: tier,
      is_publish_allowed: isPublishAllowed,
      report: report,
    });
  } catch (error: any) {
    console.error("evaluateLessonQuality error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa menilai kualiti modul." },
      { status: 500 }
    );
  }
}
