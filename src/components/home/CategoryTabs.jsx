import React from "react";

export default function CategoryTabs({ categories, active, onChange, t }) {
  return (
    <div className="flex gap-2 px-4 mt-[18px] mb-3 overflow-x-auto scrollbar-hide">
      {categories.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
            active === c.key ? "bg-[#bd9c59] text-[#1e1832] font-semibold" : "bg-white/10 text-white/70"
          }`}
        >
          {t(c.labelKey)}
        </button>
      ))}
    </div>
  );
}