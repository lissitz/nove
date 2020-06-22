import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "./locales/en-US.json";
import es from "./locales/es-ES.json";

const locales = {
  "en-US": en,
  "es-ES": es,
};

export const languages = {
  "en-US": { name: "English" },
  "es-ES": { name: "Español" },
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

export function useFormat() {
  const language = useLanguage();
  return useMemo(() => {
    return {
      timestamp: formatTimestamp(language),
      quantity: formatQuantity(language),
    };
  }, [language]);
}

function formatTimestamp(language: Language) {
  return (timestamp: number, t: (s: string, replace?: string[]) => string) => {
    let delta = Date.now() / 1000 - timestamp;
    delta = Math.floor(delta / 60);
    if (delta === 0) return t("<aMinute");
    if (delta === 1) return t("aMinute");
    if (delta < 60) return t("xMinutes", [delta.toLocaleString(language)]);
    delta = Math.floor(delta / 60);
    if (delta === 1) return t("anHour");
    if (delta < 24) return t("xHours", [delta.toLocaleString(language)]);
    delta = Math.floor(delta / 24);
    if (delta === 1) return t("aDay");
    if (delta < 30) return t("xDays", [delta.toLocaleString(language)]);
    delta = Math.floor(delta / 30);
    if (delta === 1) return t("aMonth");
    if (delta < 12) return t("xMonths", [delta.toLocaleString(language)]);
    delta = Math.floor(delta / 12);
    if (delta === 1) return t("aYear");
    else return t("xYears", [delta.toLocaleString(language)]);
  };
}

function formatQuantity(language: Language) {
  return (quantity: number, t: (s: string, replace?: string[]) => string) => {
    if (quantity > 999999) {
      return t("xm", [
        (quantity / 1000000).toLocaleString(language, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
      ]);
    } else if (quantity > 999) {
      return t("xk", [
        (quantity / 1000).toLocaleString(language, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
      ]);
    } else return quantity.toLocaleString(language);
  };
}
