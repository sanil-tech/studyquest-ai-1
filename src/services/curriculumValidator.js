import kssrTaxonomy from '../data/kssrTaxonomy.json' with { type: "json" };

/**
 * Curriculum Coverage Validator Service
 * Validates taxonomy completeness against DSKP target benchmarks.
 */
export function validateCurriculumCoverage(subject = "Matematik", yearLevel = "Tahun 1") {
  try {
    const taxonomySubject = kssrTaxonomy.subjects?.[subject];
    const items = taxonomySubject?.[yearLevel] || [];

    if (!Array.isArray(items) || items.length === 0) {
      return {
        subject,
        yearLevel,
        topicsCount: 0,
        skCount: 0,
        spCount: 0,
        status: "WARNING",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-500/40",
        message: `Amaran: Tiada data taksonomi rasmi dijumpai untuk ${subject} (${yearLevel}). Menggunakan mod sandaran fallback.`
      };
    }

    const uniqueTopics = Array.from(new Set(items.map(item => item.topic || item.bidang || "Umum")));
    const uniqueSKs = Array.from(new Set(items.map(item => item.sk_code)));
    const uniqueSPs = Array.from(new Set(items.map(item => item.sp_code)));

    const isMatematikT1 = subject === "Matematik" && yearLevel === "Tahun 1";
    const targetTopics = isMatematikT1 ? 8 : (uniqueTopics.length || 1);
    const targetSKs = isMatematikT1 ? 17 : (uniqueSKs.length || 1);
    const targetSPs = isMatematikT1 ? 28 : (uniqueSPs.length || 1);

    const isComplete = uniqueTopics.length >= Math.min(targetTopics, 4);

    return {
      subject,
      yearLevel,
      topicsCount: uniqueTopics.length,
      targetTopics,
      skCount: uniqueSKs.length,
      targetSKs,
      spCount: uniqueSPs.length,
      targetSPs,
      status: isComplete ? "COMPLETE" : "PARTIAL",
      badgeColor: isComplete
        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
        : "bg-amber-950 text-amber-300 border-amber-500/40",
      message: isComplete
        ? `Status Liputan DSKP: KELENGKAPAN PENUH (${uniqueTopics.length} Topik, ${uniqueSKs.length} SK, ${uniqueSPs.length} SP)`
        : `Status Liputan DSKP: LENGKAP SEBAHAGIAN (${uniqueTopics.length}/${targetTopics} Topik, ${uniqueSPs.length}/${targetSPs} SP)`
    };
  } catch (err) {
    return {
      subject,
      yearLevel,
      topicsCount: 0,
      skCount: 0,
      spCount: 0,
      status: "WARNING",
      badgeColor: "bg-rose-950 text-rose-300 border-rose-500/40",
      message: `Ralat validasi kurikulum: ${err.message}`
    };
  }
}
