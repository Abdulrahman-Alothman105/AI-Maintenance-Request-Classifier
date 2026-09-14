export const CATEGORIES = [
  "سباكة",
  "كهرباء",
  "نجارة",
  "تكييف",
  "عزل",
  "أرضيات",
  "أخرى",
] as const;

export const PRIORITIES = ["عاجل", "عادي"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORY_ICON: Record<Category, string> = {
  سباكة: "🔧",
  كهرباء: "⚡",
  نجارة: "🪚",
  تكييف: "❄️",
  عزل: "🧱",
  أرضيات: "🧩",
  أخرى: "🛠️",
};
