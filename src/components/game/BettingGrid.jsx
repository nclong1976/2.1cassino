import React from "react";

const COL_CLASS = { 2: "grid-cols-2", 3: "grid-cols-3", 5: "grid-cols-5" };

export default function BettingGrid({ tab, selectedCells, onToggle }) {
  if (!tab) return null;
  const isSel = (label) => selectedCells.some((s) => s.tabId === tab.id && s.label === label);

  return (
    <div className="relative z-10 flex-1 flex flex-col">
      <div className="w-full min-h-[46px] flex items-center justify-center border-b border-[#dcdcdc] bg-[#e8e8e8]">
        <p className="text-figma-23 font-bold font-paragraph leading-figma-27 text-[#b62d34]">{tab.label}</p>
      </div>

      {tab.sections.map((sec, si) => (
        <div key={si} className={`grid w-full ${COL_CLASS[sec.columns] || "grid-cols-2"}`}>
          {sec.items.map((item, i) => {
            const sel = isSel(item.label);
            const lastCol = (i + 1) % sec.columns === 0;
            return (
              <button
                key={i}
                onClick={() => onToggle(tab.id, tab.label, item)}
                className={`relative z-10 flex flex-col items-center justify-center h-[109px] transition-colors border-b border-[#e5e5e5] ${lastCol ? "" : "border-r"} ${sel ? "bg-[#ffe3b3] ring-2 ring-[#fe6400] z-20" : "bg-white/90 hover:bg-white"}`}
              >
                <p className="text-figma-21 font-normal font-figma-inter text-figma-text-1-5 mb-3">{item.label}</p>
                <p className={`text-figma-19 font-normal font-figma-inter leading-figma-22 ${sel ? "text-[#c04a2d] font-bold" : "text-figma-text-4-5"}`}>
                  {item.odds}
                </p>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}