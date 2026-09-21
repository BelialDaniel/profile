import { useTranslation } from "react-i18next"

const links = [
  {
    key: "contact.gitlabLabel",
    href: "https://gitlab.com/BelialDaniel",
  },
  {
    key: "contact.githubLabel",
    href: "https://github.com/BelialDaniel",
  },
  {
    key: "contact.linkedinLabel",
    href: "https://linkedin.com/in/daniel-maldonado-morales",
  },
  {
    key: "contact.cursorLabel",
    href: "https://cursor.com/@belialdaniel",
  },
] as const

export default function Contact() {
  const { t } = useTranslation()

  return (
    <section className="page">
      <h1>{t("contact.title")}</h1>
      <p>{t("contact.intro")}</p>
      <p className="contact-email">
        <a href={`mailto:${t("contact.email")}`}>{t("contact.email")}</a>
        <span>{t("contact.emailLabel")}</span>
      </p>
      <ul className="contact-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {t(link.key)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
