"use client";

export type AdminLangTab = "en" | "id";

export function AdminLangTabs({
  value,
  onChange,
}: {
  value: AdminLangTab;
  onChange: (tab: AdminLangTab) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-0.5"
      role="tablist"
    >
      {(
        [
          { id: "en" as const, label: "English" },
          { id: "id" as const, label: "Indonesia" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
            value === tab.id
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
