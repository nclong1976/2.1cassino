import React from "react";
import { LANGUAGES } from "./i18n";

export default function LanguageSwitcher({ lang, onChange }) {
  return (
    <div className="flex justify-center items-center gap-[9px] mt-[21px] mb-[16px] shrink-0 flex-wrap">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`text-figma-13 font-normal font-paragraph leading-figma-14 transition-colors ${
            lang === l.code ? "text-[#bd9c59] font-semibold" : "text-figma-text-10 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}