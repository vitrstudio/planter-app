import { config, getDefaultUserId, setDefaultUserId } from './config'
import type { Project, CreateProjectRequest } from './config'
import type { User } from './config'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const api = {
  async createProject(project: CreateProjectRequest): Promise<Project> {
    const response = await fetch(`${config.apiUrl}/api/users/${getDefaultUserId()}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
    return handleResponse<Project>(response)
  },

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${config.apiUrl}/api/projects`)
    return handleResponse<Project[]>(response)
  },

  async deleteProject(userId: string, projectId: string, githubUserId: number): Promise<void> {
    const response = await fetch(`${config.apiUrl}/api/users/${userId}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ github_user_id: githubUserId }),
    })
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${config.apiUrl}/api/users`)
    return handleResponse<User[]>(response)
  }
} 