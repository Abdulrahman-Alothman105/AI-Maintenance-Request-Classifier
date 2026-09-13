import { getAllRequests } from "@/lib/store";
import { CATEGORY_ICON } from "@/lib/constants";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RequestsPage() {
  const requests = getAllRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-blueprint sm:text-3xl">كل البلاغات</h1>
        <p className="mt-1 text-sm text-ink/70">
          {requests.length > 0 ? `إجمالي البلاغات: ${requests.length}` : "لا توجد بلاغات محفوظة بعد."}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-panel p-8 text-center text-sm text-ink/60">
          ابدأ بإنشاء بلاغ جديد من صفحة "بلاغ جديد".
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-md border border-line bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderInlineStartWidth: 4,
                borderInlineStartColor: r.priority === "عاجل" ? "#B33A3A" : "#3D7A5C",
              }}
            >
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-ink">{r.description}</p>
                <p className="mt-1 text-xs text-ink/50">{formatDate(r.createdAt)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-sm border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink">
                  {CATEGORY_ICON[r.category]} {r.category}
                </span>
                <span
                  className={`rounded-sm px-2.5 py-1 text-xs font-medium ${
                    r.priority === "عاجل" ? "bg-urgent-light text-urgent" : "bg-normal-light text-normal"
                  }`}
                >
                  {r.priority}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
