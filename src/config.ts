export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080'
} as const

export type ProjectType = 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO'

export interface Project {
  id: string
  name: string
  type: ProjectType
  createdAt: string
}

export interface CreateProjectRequest {
  name: string
  type: ProjectType
} 