import { Category, Priority } from "./constants";
import { ClassificationResult } from "./types";

const CATEGORY_KEYWORDS: Array<{ category: Category; words: string[] }> = [
  { category: "سباكة", words: ["تسريب", "مياه", "ماء", "صنبور", "مواسير", "انسداد", "حمام", "مغسلة", "خزان"] },
  { category: "كهرباء", words: ["كهرباء", "كهربائي", "ماس", "عطل كهربائي", "مفتاح", "مقبس", "انقطاع التيار", "لمبة", "إضاءة"] },
  { category: "نجارة", words: ["باب", "خشب", "نجار", "خزانة", "درج", "شباك خشب", "قفل"] },
  { category: "تكييف", words: ["تكييف", "مكيف", "مبرد", "حر شديد", "تبريد", "تدفئة"] },
  { category: "عزل", words: ["عزل", "رطوبة", "تسرب سطح", "نش", "سقف يسرب"] },
  { category: "أرضيات", words: ["بلاط", "أرضية", "سيراميك", "باركيه", "رخام"] },
];

const URGENT_KEYWORDS = [
  "تسريب غزير",
  "ماس كهربائي",
  "حريق",
  "طارئ",
  "خطر",
  "غرق",
  "انقطاع التكييف",
  "حر شديد",
  "انقطاع كهرباء كامل",
];

function detectCategory(text: string): Category {
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => text.includes(w))) return category;
  }
  return "أخرى";
}

function detectPriority(text: string): Priority {
  return URGENT_KEYWORDS.some((w) => text.includes(w)) ? "عاجل" : "عادي";
}

/** Splits obviously distinct issues on common Arabic conjunctions/separators. */
function splitIssues(description: string): string[] {
  const parts = description
    .split(/(?:\n+|،\s*و|\.\s*|؛\s*)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 3);

  // Only treat as multiple issues if each remaining chunk mentions a
  // different domain keyword — otherwise keep the original text whole.
  if (parts.length < 2) return [description.trim()];

  const categorized = parts.map((p) => ({ text: p, category: detectCategory(p) }));
  const distinctCategories = new Set(categorized.map((c) => c.category));
  if (distinctCategories.size < 2) return [description.trim()];

  return categorized.map((c) => c.text);
}

export function mockClassify(description: string): ClassificationResult[] {
  const issues = splitIssues(description);
  return issues.map((issue) => ({
    description: issue,
    suggested_category: detectCategory(issue),
    suggested_priority: detectPriority(issue),
  }));
}
