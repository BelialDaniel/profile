import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import es from "./locales/es.json"

export const supportedLanguages = ["en", "es"] as const
export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = "en"

export const languageLabels: Record<Language, string> = {
  en: "English",
  es: "Español",
}

export function isLanguage(value: string): value is Language {
  return (supportedLanguages as readonly string[]).includes(value)
}

export function resolveLanguage(lng: string | undefined): Language {
  const normalized = lng?.toLowerCase().split("-")[0]
  return normalized && isLanguage(normalized) ? normalized : defaultLanguage
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: defaultLanguage,
    supportedLngs: [...supportedLanguages],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ["navigator", "htmlTag"],
      caches: [],
    },
  })

export default i18n
