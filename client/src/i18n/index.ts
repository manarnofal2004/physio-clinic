import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "./locales/ar";
import { en, type Translation } from "./locales/en";

export const LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = "language";

// Saved choice first, then the browser language, then English.
const getInitialLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") return stored;
  } catch {
    // storage unavailable, fall back to the browser language
  }
  return navigator.language.startsWith("ar") ? "ar" : "en";
};

// Keeps <html lang dir> and the tab title in step with the language, and remembers the choice.
const applyLanguage = (language: string) => {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
  document.title = i18n.t("brand.fullName");
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // ignore write failures
  }
};

i18n.on("languageChanged", applyLanguage);

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
});

applyLanguage(i18n.language);

// Lets TypeScript check translation keys: t("nav.book") works, t("nav.typo") fails.
declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: Translation };
  }
}

export default i18n;
