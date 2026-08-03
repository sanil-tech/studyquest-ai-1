/**
 * Global Student Content Sanitizer Utility
 * 
 * Strips administrative DSKP/KSSR codes, technical step labels, PBD target tags,
 * and developer debug terms from student-facing UI text.
 * 
 * @param {string} text - The input string to sanitize.
 * @returns {string} - Clean, student-friendly text.
 */
export function sanitizeStudentText(text) {
  if (!text) return "";

  return String(text)
    .replace(/Pelajaran\s+SP\s+[\d\.]+\s+bagi\s+/gi, '')
    .replace(/mengikut\s+SP\s+[\d\.]+/gi, '')
    .replace(/\b(SP|SK)\s+[\d\.]+/gi, '')
    .replace(/\b(TP[1-6])\b/gi, '')
    .replace(/\b(PBD|DSKP)\b/gi, '')
    .replace(/MICRO_CPA|VISUAL_STORY|COMPARISON_SPLIT|STEP_BY_STEP|MYTH_BUSTER/gi, '')
    .replace(/Pelajaran SP\s*\d+(\.\d+)*/gi, "")
    .replace(/\(SP\s*\d+(\.\d+)*\)/gi, "")
    .replace(/\(SK\s*\d+(\.\d+)*\)/gi, "")
    .replace(/\s+/g, ' ')
    .trim();
}

export default sanitizeStudentText;
