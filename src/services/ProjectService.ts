import { api } from '../api'
import type { Project, CreateProjectRequest } from '../types'
import { showError } from '../utils'

export class ProjectService {
  private projects: Project[] = []

  async loadProjects(): Promise<Project[]> {
    try {
      this.projects = await api.getProjects()
      return this.projects
    } catch (error) {
      console.error('Failed to load projects:', error)
      showError('Failed to load projects')
      throw error
    }
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      const newProject = await api.createProject(projectData)
      await this.loadProjects() // Refresh the projects list
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      showError('Failed to create project')
      throw error
    }
  }

  async deleteProject(project: Project): Promise<void> {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await api.deleteProject(project.user.id, project.id, project.user.github_user_id)
        await this.loadProjects() // Refresh the projects list
      } catch (error) {
        console.error('Failed to delete project:', error)
        showError('Failed to delete project')
        throw error
      }
    }
  }

  getProjects(): Project[] {
    return this.projects
  }

  async refreshProjects(): Promise<void> {
    await this.loadProjects()
  }
}
