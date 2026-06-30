"use client";

import {
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { LanguageContext, Language, T } from "@/utils/translations";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("id");

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
      t: T[lang],
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
