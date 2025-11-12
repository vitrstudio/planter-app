export type ProjectType = 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO' | 'UNKNOWN'

export interface User {
  id: string
  github_user_id: number
  avatar_url: string
  name: string
  created_at: number
}

export interface Project {
  id: string
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

export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  name: string
  email?: string
}

export interface SessionResponse {
  userId: string
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: GitHubUser | null
  token: string | null
  userId: string | null
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
