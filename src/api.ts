import { config } from './config'
import type { Project, CreateProjectRequest } from './config'

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
    const response = await fetch(`${config.apiUrl}/api/projects`, {
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
  }
} 