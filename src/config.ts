export const config = {
  apiUrl: import.meta.env.VITE_PLANTER_API_URL || 'http://localhost:8080'
} as const

export type ProjectType = 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO'

export interface User {
  id: string
  github_user_id: number
  created_at: number
}

export interface Project {
  id: string
  version: number
  name: string
  github_repository_id: number
  type: ProjectType
  created_at: number
  user: User
}

export interface CreateProjectRequest {
  name: string
  type: ProjectType
}

let DEFAULT_USER_ID = ''
export function setDefaultUserId(id: string) {
  DEFAULT_USER_ID = id
}
export function getDefaultUserId() {
  return DEFAULT_USER_ID
}