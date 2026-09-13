"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, PRIORITIES, CATEGORY_ICON, Category, Priority } from "@/lib/constants";
import { ClassificationResult } from "@/lib/types";

type DraftItem = ClassificationResult & { id: string };

export default function NewRequestPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [mocked, setMocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClassify() {
    if (!description.trim()) {
      setError("الرجاء كتابة وصف المشكلة أولاً");
      return;
    }
    setError(null);
    setLoading(true);
    setDrafts(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "تعذّر تحليل الطلب");
      const withIds: DraftItem[] = data.results.map((r: ClassificationResult, i: number) => ({
        ...r,
        id: `${Date.now()}-${i}`,
      }));
      setDrafts(withIds);
      setMocked(!!data.mocked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => prev?.map((d) => (d.id === id ? { ...d, ...patch } : d)) ?? null);
  }

  async function handleSave() {
    if (!drafts || drafts.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: drafts.map(({ description, suggested_category, suggested_priority }) => ({
            description,
            category: suggested_category,
            priority: suggested_priority,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "تعذّر حفظ الطلب");
      router.push("/requests");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-blueprint sm:text-3xl">بلاغ صيانة جديد</h1>
        <p className="mt-1 text-sm text-ink/70">
          صف المشكلة بكلماتك، وسيقترح المساعد الذكي التخصص وأولوية التنفيذ تلقائياً.
        </p>
      </div>

      <div className="rounded-md border border-line bg-panel p-4 shadow-sm sm:p-5">
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-ink">
          وصف المشكلة
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="مثال: يوجد تسريب مياه تحت حوض المطبخ، وأيضاً الإضاءة في غرفة النوم لا تعمل"
          className="w-full resize-none rounded-sm border border-line bg-white p-3 text-base leading-relaxed outline-none focus:border-blueprint"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          {error && <p className="text-sm text-urgent">{error}</p>}
          <button
            onClick={handleClassify}
            disabled={loading}
            className="mr-auto rounded-sm bg-blueprint px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blueprint-dark disabled:opacity-60"
          >
            {loading ? "جاري التحليل..." : "إرسال"}
          </button>
        </div>
      </div>

      {drafts && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-blueprint">
              {drafts.length > 1 ? `تم رصد ${drafts.length} مشاكل منفصلة` : "نتيجة التحليل"}
            </h2>
            {mocked && (
              <span className="rounded-sm bg-amber-light/40 px-2 py-1 text-xs text-amber">
                وضع تجريبي (Mock)
              </span>
            )}
          </div>

          <ul className="space-y-3">
            {drafts.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-3 rounded-md border border-line bg-panel p-4 sm:flex-row sm:items-start"
                style={{
                  borderInlineStartWidth: 4,
                  borderInlineStartColor: d.suggested_priority === "عاجل" ? "#B33A3A" : "#3D7A5C",
                }}
              >
                <p className="flex-1 text-sm leading-relaxed text-ink">{d.description}</p>

                <div className="flex shrink-0 gap-2">
                  <select
                    value={d.suggested_category}
                    onChange={(e) => updateDraft(d.id, { suggested_category: e.target.value as Category })}
                    className="rounded-sm border border-line bg-white px-2 py-1.5 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_ICON[c]} {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={d.suggested_priority}
                    onChange={(e) => updateDraft(d.id, { suggested_priority: e.target.value as Priority })}
                    className={`rounded-sm border px-2 py-1.5 text-sm font-medium ${
                      d.suggested_priority === "عاجل"
                        ? "border-urgent bg-urgent-light text-urgent"
                        : "border-normal bg-normal-light text-normal"
                    }`}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-sm bg-blueprint py-2.5 text-sm font-medium text-white transition-colors hover:bg-blueprint-dark disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {saving ? "جاري الحفظ..." : "حفظ البلاغ"}
          </button>
        </div>
      )}
    </div>
  );
}
