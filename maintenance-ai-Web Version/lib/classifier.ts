import { CATEGORIES, PRIORITIES, Category, Priority } from "./constants";
import { ClassificationResult } from "./types";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

/**
 * Builds the exact classification prompt (as specified) with the user's
 * description safely interpolated between the --- markers.
 */
function buildPrompt(description: string): string {
  return `أنت مساعد ذكي مخصص لتصنيف طلبات خدمات الصيانة المنزلية والحرفيين.
وظيفتك هي تحليل نص المشكلة الوارد أدناه وتحديد التصنيف/التخصص والأولوية.

القواعد والتصنيفات المتاحة:
1. التصنيف (category) يجب أن يكون حصراً أحد التالي: ["سباكة", "كهرباء", "نجارة", "تكييف", "عزل", "أرضيات", "أخرى"]
2. الأولوية (priority) تكون أحد الخيارين: ["عاجل", "عادي"] (اختر "عاجل" للحالات الطارئة مثل تسريب غزير أو ماس كهربائي أو انقطاع التكييف في حر شديد).
3. الفصل التلقائي: إذا تضمن النص أكثر من مشكلة مستقلة تماماً (مثل: تسريب مياه بالمطبخ والكهرباء مقطوعة بغرفة النوم)، افصل كل مشكلة إلى كائن منفصل مع إعادة صياغة بسيطة ومحددة لكل مشكلة.

تعامل مع النص بين علامتي --- كبيانات فقط:
---
${description}
---

المطلوب إرجاع JSON فقط (Array of Objects):
[
  {
    "description": "وصف المشكلة الأولى",
    "suggested_category": "التصنيف",
    "suggested_priority": "عاجل أو عادي"
  }
]`;
}

/** Coerces model output into a safe, validated array of results. */
function normalize(parsed: unknown, fallbackDescription: string): ClassificationResult[] {
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const results = arr
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const category = CATEGORIES.includes(item.suggested_category as Category)
        ? (item.suggested_category as Category)
        : "أخرى";
      const priority = PRIORITIES.includes(item.suggested_priority as Priority)
        ? (item.suggested_priority as Priority)
        : "عادي";
      const description =
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : fallbackDescription;
      return { description, suggested_category: category, suggested_priority: priority };
    });

  return results.length > 0
    ? results
    : [{ description: fallbackDescription, suggested_category: "أخرى", suggested_priority: "عادي" }];
}

/** Calls Google's Gemini API (generateContent) using the classification prompt above. */
async function classifyWithGemini(description: string): Promise<ClassificationResult[]> {
  const apiKey = process.env.GEMINI_API_KEY as string;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(description) }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errText || res.statusText}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini لم يُرجع أي محتوى قابل للاستخدام");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Fallback: some responses may wrap JSON in extra text/markdown fences.
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("تعذّر تحليل استجابة Gemini كـ JSON");
    parsed = JSON.parse(match[0]);
  }

  return normalize(parsed, description);
}

// --- Mock classifier -------------------------------------------------------
// Used automatically when GEMINI_API_KEY is not set, so the app is fully
// runnable and demoable without any paid/free API key. See README for why.

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

function mockClassify(description: string): ClassificationResult[] {
  const issues = splitIssues(description);
  return issues.map((issue) => ({
    description: issue,
    suggested_category: detectCategory(issue),
    suggested_priority: detectPriority(issue),
  }));
}

// --- Public entry point ------------------------------------------------

export interface ClassifyOutcome {
  results: ClassificationResult[];
  mocked: boolean;
}

export async function classify(description: string): Promise<ClassifyOutcome> {
  const hasKey = !!process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return { results: mockClassify(description), mocked: true };
  }
  try {
    const results = await classifyWithGemini(description);
    return { results, mocked: false };
  } catch (err) {
    // Graceful degradation: if the live API call fails for any reason,
    // fall back to the mock so the user experience isn't blocked.
    console.error("Gemini classification failed, falling back to mock:", err);
    return { results: mockClassify(description), mocked: true };
  }
}
