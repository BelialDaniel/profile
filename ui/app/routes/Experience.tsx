import { useTranslation } from "react-i18next"
import type { EducationItem, Job } from "~/i18n/content"

export default function Experience() {
  const { t } = useTranslation()
  const jobs = t("experience.jobs", { returnObjects: true }) as Job[]
  const studies = t("experience.studies", {
    returnObjects: true,
  }) as EducationItem[]

  return (
    <section className="page">
      <h1>{t("experience.title")}</h1>
      <div className="page-section">
        <h2>{t("experience.workTitle")}</h2>
        {jobs.map((job) => (
          <article className="card" key={`${job.company}-${job.role}`}>
            <h3>{job.role}</h3>
            <p className="meta">
              {job.company} · {job.period}
            </p>
            <p>{job.description}</p>
            {job.points.length > 0 ? (
              <ul>
                {job.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
            {job.tech.length > 0 ? (
              <ul className="tags">
                {job.tech.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
      <div className="page-section">
        <h2>{t("experience.educationTitle")}</h2>
        {studies.map((item) => (
          <article className="card" key={item.degree}>
            <h3>{item.degree}</h3>
            <p className="meta">{item.school}</p>
            <p>{item.detail}</p>
            {item.tech.length > 0 ? (
              <ul className="tags">
                {item.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
