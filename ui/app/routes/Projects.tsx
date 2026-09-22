import { useTranslation } from "react-i18next"
import type { Project, ProjectSection } from "~/i18n/content"

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
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      ))}
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card">
      <h3>
        {project.url ? (
          <a href={project.url} target="_blank" rel="noreferrer">
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
            {project.name}
          </a>
        ) : (
          project.name
        )}
      </h3>
      <p className="meta">{project.role}</p>
      <p>{project.description}</p>
      {project.tech.length > 0 ? (
        <ul className="tags">
          {project.tech.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
