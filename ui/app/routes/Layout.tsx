import type { Route } from "./+types/Layout"
import { NavLink, Outlet } from "react-router"
import { useTranslation } from "react-i18next"
import {
  languageLabels,
  supportedLanguages,
} from "~/i18n/config"
import { useLanguageStore } from "~/stores/language"

const navItems: Array<{
  to: string
  key: "nav.about" | "nav.experience" | "nav.projects" | "nav.contact"
  end?: boolean
}> = [
  { to: "/", key: "nav.about", end: true },
  { to: "/experience", key: "nav.experience" },
  { to: "/projects", key: "nav.projects" },
  { to: "/contact", key: "nav.contact" },
]

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Daniel Morales" },
    {
      name: "description",
      content: "Full Stack Developer based in Guadalajara.",
    },
  ]
}

export default function Layout() {
  const { t } = useTranslation()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink
            to="/"
            end
            viewTransition
            className="site-brand"
            aria-label={t("brand")}
          >
            <span className="site-brand__mark" aria-hidden="true">
              BD
            </span>
          </NavLink>
          <div className="site-header__right">
            <nav className="site-nav" aria-label="Primary">
              <ul>
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      viewTransition
                      className={({ isActive }) =>
                        isActive ? "site-nav__btn is-active" : "site-nav__btn"
                      }
                    >
                      {t(item.key)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="language-switcher" role="group" aria-label={t("nav.language")}>
              {supportedLanguages.map((lng) => (
                <button
                  key={lng}
                  type="button"
                  className={language === lng ? "is-active" : undefined}
                  aria-pressed={language === lng}
                  aria-label={languageLabels[lng]}
                  onClick={() => setLanguage(lng)}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
