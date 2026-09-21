import { create } from "zustand"
import { persist } from "zustand/middleware"
import i18n, {
  resolveLanguage,
  type Language,
} from "~/i18n/config"

type LanguageState = {
  language: Language
  setLanguage: (language: Language) => void
}

function syncDocumentLanguage(language: Language) {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.lang = language
}

async function applyLanguage(language: Language) {
  const current = resolveLanguage(i18n.resolvedLanguage ?? i18n.language)

  if (current !== language) {
    await i18n.changeLanguage(language)
  }

  syncDocumentLanguage(language)
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: resolveLanguage(i18n.resolvedLanguage ?? i18n.language),
      setLanguage: (language) => {
        void applyLanguage(language)
        set({ language })
      },
    }),
    {
      name: "language",
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          return
        }

        const language = resolveLanguage(state.language)
        void applyLanguage(language)

        if (state.language !== language) {
          useLanguageStore.setState({ language })
        }
      },
    },
  ),
)

i18n.on("languageChanged", (lng) => {
  const language = resolveLanguage(lng)
  syncDocumentLanguage(language)

  if (useLanguageStore.getState().language !== language) {
    useLanguageStore.setState({ language })
  }
})
