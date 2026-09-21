import { useTranslation } from "react-i18next"
import type { SkillGroup } from "~/i18n/content"

const githubUrl = "https://github.com/BelialDaniel"
const gitlabUrl = "https://gitlab.com/BelialDaniel"
const cursorUrl = "https://cursor.com/@belialdaniel"
const linkedinUrl = "https://linkedin.com/in/daniel-maldonado-morales"

export default function Home() {
  const { t } = useTranslation()
  const skillGroups = t("about.skillGroups", {
    returnObjects: true,
  }) as SkillGroup[]

  return (
    <section className="page">
      <p className="meta">{t("about.location")}</p>
      <h1>{t("about.name")}</h1>
      <p className="lede">{t("about.role")}</p>
      <p>{t("about.bio")}</p>
      <div className="links">
        <a href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={gitlabUrl} target="_blank" rel="noreferrer">
          GitLab
        </a>
        <a href={cursorUrl} target="_blank" rel="noreferrer">
          Cursor
        </a>
        <a href={linkedinUrl} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <div className="skill-groups">
        {skillGroups.map((group) => (
          <div className="skill-group" key={group.title}>
            <h2>{group.title}</h2>
            <ul className="tags">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
