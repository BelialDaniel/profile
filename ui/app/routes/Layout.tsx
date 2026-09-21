import type { Route } from "./+types/Layout"
import { Link, Outlet } from "react-router"
import { useTranslation } from "react-i18next"
import {
  isLanguage,
  languageLabels,
  supportedLanguages,
} from "~/i18n/config"
import { useLanguageStore } from "~/stores/language"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BelialDaniel" },
    { name: "description", content: "Welcome to my profile!" },
  ]
}

export default function Layout() {
  const { t } = useTranslation()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link to="/">{t("nav.home")}</Link>
            </li>
          </ul>
        </nav>
        <label>
          {t("nav.language")}
          <select
            value={language}
            onChange={(event) => {
              if (isLanguage(event.target.value)) {
                setLanguage(event.target.value)
              }
            }}
          >
            {supportedLanguages.map((lng) => (
              <option key={lng} value={lng}>
                {languageLabels[lng]}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
