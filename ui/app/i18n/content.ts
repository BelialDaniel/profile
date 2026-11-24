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

export const projectStatuses = [
  "under_construction",
  "on_sale",
  "refactoring",
  "sold",
] as const

export type ProjectStatus = (typeof projectStatuses)[number]

export type Project = {
  name: string
  role: string
  url: string
  description: string
  tech: string[]
  status?: ProjectStatus
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
