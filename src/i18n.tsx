import React, { useState, useContext, createContext, useCallback } from "react";
import locale from "./locales/en.json";

const languages = {
  en: { name: "English" },
  es: { name: "Español" },
} as const;
type Languages = keyof typeof languages;

const translate = (language: Languages, x: string) => {
  let dict = locale as any;
  while (true) {
    const pointIndex = x.indexOf(".");
    if (pointIndex === -1) break;
    dict = dict[x.slice(0, pointIndex)];
    x = x.slice(pointIndex + 1);
    if (!dict) return x;
  }
  return dict[x] || x;
};
const translator = (language: Languages) => (key: string, replace?: string[]) => {
  let translation = translate(language, key);
  if (replace) {
    translation = replace.reduce((a, b) => a.replace("{}", b), translation);
  }
  return translation;
};

const defaultLanguage = Object.keys(languages)[0] as Languages;
const LanguageContext = createContext({
  language: defaultLanguage,
  t: translator(defaultLanguage),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(defaultLanguage);
  const t = useCallback(translator(language), [language]);
  return <LanguageContext.Provider value={{ language, t }}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const t = useContext(LanguageContext)?.t;
  if (!t) throw new Error("useTranslation must have a LanguageProvider as a parent");
  return t;
}

export function tr(x: string) {
  return x;
}
