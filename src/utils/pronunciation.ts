/**
 * Utility functions for Bengali Voice Call Speech Synthesis & Pronunciation formatting
 */

export function formatBengaliNameForSpeech(name: string): string {
  if (!name) return "";
  let clean = String(name).trim();

  // Replace English Md. / Md / MD / M.D. with মোহাম্মদ
  clean = clean.replace(/\b(md\.|md|m\.d\.)\b/gi, "মোহাম্মদ ");

  // Replace Bangla মোঃ / মো. / মো: / মো with মোহাম্মদ
  clean = clean.replace(/\b(মোঃ|মো\.|মো:|মো)\b/g, "মোহাম্মদ");
  clean = clean.replace(/^(মোঃ|মো\.|মো:|মো\s+|মো(?=[\s\u0980-\u09FF]))/i, "মোহাম্মদ ");
  clean = clean.replace(/(\s+)(মোঃ|মো\.|মো:|মো)(\s*)/g, "$1মোহাম্মদ ");
  
  // Replace Bangla মুঃ / মু. / মু: / মু with মুহাম্মদ
  clean = clean.replace(/\b(মুঃ|মু\.|মু:|মু)\b/g, "মুহাম্মদ");
  clean = clean.replace(/^(মুঃ|মু\.|mu:|মু\s+)/i, "মুহাম্মদ ");
  clean = clean.replace(/(\s+)(মুঃ|মু\.|মু:)(\s*)/g, "$1মুহাম্মদ ");

  return clean.replace(/\s+/g, " ").trim();
}

/**
 * Builds standard absence voice call dialogue with single "সম্মানিত অভিভাবক" prefix.
 */
export function buildAbsenceVoiceCallDialogue(studentName: string, customMessage?: string): string {
  const spokenName = formatBengaliNameForSpeech(studentName || "ছাত্র");
  return `সম্মানিত অভিভাবক, আপনার সন্তান ${spokenName} আজকে যথাসময়ে মাদ্রাসায় উপস্থিত হয়নি। অনুগ্রহ করে আপনার সমস্যার কথা জানিয়ে মাদ্রাসার কর্তৃপক্ষের সাথে যোগাযোগ করুন।`;
}
