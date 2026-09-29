/**
 * Utility functions for Bengali Voice Call Speech Synthesis & Pronunciation formatting
 */

export function formatBengaliNameForSpeech(name: string): string {
  if (!name) return "";
  let clean = String(name).trim();

  // Replace English Md. / Md / MD / M.D. with মোহাম্মদ
  clean = clean.replace(/\b(md\.|md|m\.d\.)\b/gi, "মোহাম্মদ ");

  // Replace Bangla মোঃ / মো. / মো: / মো at the start of name with মোহাম্মদ
  clean = clean.replace(/^(মোঃ|মো\.|মো:|মো\s+|মো(?=[\s\u0980-\u09FF]))/i, "মোহাম্মদ ");
  
  // Replace Bangla মুঃ / মু. / মু: / মু at the start with মুহাম্মদ
  clean = clean.replace(/^(মুঃ|মু\.|মু:|মু\s+)/i, "মুহাম্মদ ");

  // Replace inside name with dot or colon e.g. "আলহাজ্ব মোঃ করিম" -> "আলহাজ্ব মোহাম্মদ করিম"
  clean = clean.replace(/(\s+)(মোঃ|মো\.|মো:)(\s*)/g, "$1মোহাম্মদ ");
  clean = clean.replace(/(\s+)(মুঃ|মু\.|মু:)(\s*)/g, "$1মুহাম্মদ ");

  // Standalone 'মো' at word boundary
  clean = clean.replace(/\bমো\b/g, "মোহাম্মদ");

  return clean.replace(/\s+/g, " ").trim();
}

/**
 * Builds standard absence voice call dialogue without duplicate "সম্মানিত অভিভাবক" or greetings,
 * explicitly naming the student with correct Bengali pronunciation.
 */
export function buildAbsenceVoiceCallDialogue(studentName: string, customMessage?: string): string {
  const spokenName = formatBengaliNameForSpeech(studentName || "ছাত্র");

  if (!customMessage || !customMessage.trim()) {
    return `সম্মানিত অভিভাবক, আপনার সন্তান ${spokenName} আজকে যথাসময়ে মাদ্রাসায় উপস্থিত হয়নি। অনুগ্রহ করে আপনার সমস্যার কথা জানিয়ে মাদরাসা কর্তৃপক্ষের সাথে যোগাযোগ করুন।`;
  }

  let text = customMessage.trim();

  // Strip initial salam if present
  text = text.replace(/^(আসসালামু\s*আলাইকুম|আসসালামুয়ালাইকুম|সালাম)[।,.\s-]*/i, "").trim();

  // Strip duplicate "সম্মানিত অভিভাবক"
  text = text.replace(/^(সম্মানিত\s*অভিভাবক[।,.\s]*|অভিভাবক[।,.\s]*)+/i, "").trim();

  // Check if text already starts with "আপনার সন্তান" or similar
  if (/^আপনার\s*সন্তান/i.test(text)) {
    // If it contains "আপনার সন্তান ... আজ/আজকে", strip that opening part to avoid repetition
    text = text.replace(/^আপনার\s*সন্তান(\s+[^,।]+)?[।,.\s]*/i, "").trim();
  }

  // Format any abbreviated name inside the custom text
  text = text.replace(/\b(মোঃ|মো\.|মো:|মো\s+)/g, "মোহাম্মদ ");

  if (!text) {
    return `সম্মানিত অভিভাবক, আপনার সন্তান ${spokenName} আজকে যথাসময়ে মাদ্রাসায় উপস্থিত হয়নি। অনুগ্রহ করে আপনার সমস্যার কথা জানিয়ে মাদরাসা কর্তৃপক্ষের সাথে যোগাযোগ করুন।`;
  }

  return `সম্মানিত অভিভাবক, আপনার সন্তান ${spokenName}, ${text}`;
}
