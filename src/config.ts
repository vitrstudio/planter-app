export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080'
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

// For now, we'll hardcode the user ID since we don't have authentication yet
export const DEFAULT_USER_ID = '0c54c56d-dd61-46b1-a4c2-3c3f1e23f1c6' 