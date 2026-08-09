import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { makeT, LANGUAGES } from "@/components/home/i18n";

const I18nContext = createContext();
const STORAGE_KEY = "app_lang";
const DEFAULT_LANG = "vi";

// Provider ngôn ngữ toàn ứng dụng: lưu lựa chọn vào localStorage, cung cấp t() cho mọi trang.
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  const t = useMemo(() => makeT(lang), [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      /* ignore */
    }
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}