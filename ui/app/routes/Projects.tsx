import { useTranslation } from "react-i18next"
import type { ProjectSection, ProjectStatus } from "~/i18n/content"

const statusClassName: Record<ProjectStatus, string> = {
  under_construction: "card__badge card__badge--under_construction",
  on_sale: "card__badge",
  refactoring: "card__badge card__badge--refactoring",
  sold: "card__badge card__badge--sold",
}

export default function Projects() {
  const { t } = useTranslation()
  const sections = t("projects.sections", {
    returnObjects: true,
  }) as ProjectSection[]

  return (
    <section className="page">
      <h1>{t("projects.title")}</h1>
      {sections.map((section) => (
        <div className="page-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.items.map((project) => (
            <ProjectCard
              key={project.name}
              name={project.name}
              url={project.url}
              role={project.role}
              description={project.description}
              tech={project.tech}
              status={project.status}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

function ProjectCard({
  name,
  url,
  role,
  description,
  tech,
  status,
}: {
  name: string
  url: string
  role: string
  description: string
  tech: string[]
  status?: ProjectStatus
}) {
  const { t } = useTranslation()

  return (
    <article className="card">
      <div className="card__title">
        <h3>
          {url ? (
            <a href={url} target="_blank" rel="noreferrer">
              <svg
                className="link-icon"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  d="M6.5 3.5H3.5v9h9V9.5M9.5 2.5h4v4M13.5 2.5 8 8"
                />
              </svg>
              {name}
            </a>
          ) : (
            name
          )}
        </h3>
        {status ? (
          <span className={statusClassName[status]}>
            {t(`projects.status.${status}`)}
          </span>
        ) : null}
      </div>
      <p className="meta">{role}</p>
      <p>{description}</p>
      {tech.length > 0 ? (
        <ul className="tags">
          {tech.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
