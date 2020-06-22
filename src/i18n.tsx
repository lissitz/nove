import React, {
  useState,
  useContext,
  createContext,
  useCallback,
  useEffect,
} from "react";
import en from "./locales/en.json";
import es from "./locales/es.json";

const locales = {
  en,
  es,
};

export const languages = {
  en: { name: "English" },
  es: { name: "Español" },
} as const;

export type Language = keyof typeof languages;

const translate = (language: Language, x: string): string => {
  let dict = locales[language] as any;
  let key = x;
  while (true) {
    const pointIndex = key.indexOf(".");
    if (pointIndex === -1) break;
    dict = dict[key.slice(0, pointIndex)];
    key = key.slice(pointIndex + 1);
    if (!dict)
      return language === defaultLanguage ? key : translate(defaultLanguage, x);
  }
  return (
    dict[key] ||
    (language === defaultLanguage ? key : translate(defaultLanguage, x))
  );
};
const translator = (language: Language) => (
  key: string,
  replace?: string[]
) => {
  let translation = translate(language, key);
  if (replace) {
    translation = replace.reduce((a, b) => a.replace("{}", b), translation);
  }
  return translation;
};

const defaultLanguage = Object.keys(languages)[0] as Language;
const LanguageContext = createContext({
  language: defaultLanguage,
  t: translator(defaultLanguage),
});

function noop() {}
const SetLanguageContext = createContext<
  React.Dispatch<React.SetStateAction<Language>> | Function
>(noop);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const key = "nove-language";
  const [language, setLanguage] = useState(() => {
    try {
      const value = localStorage.getItem(key);
      let state = JSON.parse(value || "null") || defaultLanguage;
      return state;
    } catch {
      return defaultLanguage;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(language));
    } catch {}
  }, [language]);
  const t = useCallback(translator(language), [language]);
  return (
    <SetLanguageContext.Provider value={setLanguage}>
      <LanguageContext.Provider value={{ language, t }}>
        {children}
      </LanguageContext.Provider>
    </SetLanguageContext.Provider>
  );
}

export function useTranslation() {
  const t = useContext(LanguageContext)?.t;
  return t;
}

export function useSetLanguage() {
  const value = useContext(SetLanguageContext);
  return value;
}

export function useLanguage() {
  const language = useContext(LanguageContext)?.language;
  return language;
}

export function tr(x: string) {
  return x;
}
