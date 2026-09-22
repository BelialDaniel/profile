export type SkillGroup = {
  title: string
  items: string[]
}

export type Job = {
  role: string
  company: string
  period: string
  description: string
  points: string[]
  tech: string[]
}

export type Project = {
  name: string
  role: string
  url: string
  description: string
  tech: string[]
}

export type ProjectSection = {
  title: string
  items: Project[]
}

export type EducationItem = {
  degree: string
  school: string
  detail: string
  tech: string[]
}
