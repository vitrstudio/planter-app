import './style.css'
import { api } from './api'
import type { Project } from './config'

// Declare the global function type
declare global {
  interface Window {
    handleDelete: (project: Project) => Promise<void>
  }
}

let projects: Project[] = []

async function loadProjects() {
  try {
    projects = await api.getProjects()
    renderProjects()
  } catch (error) {
    console.error('Failed to load projects:', error)
    showError('Failed to load projects')
  }
}

function showError(message: string) {
  const errorDiv = document.getElementById('error')
  if (errorDiv) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
      errorDiv.style.display = 'none'
    }, 3000)
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

async function handleDelete(project: Project) {
  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
    try {
      await api.deleteProject(project.user.id, project.id, project.user.github_user_id)
      await loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
      showError('Failed to delete project')
    }
  }
}

function renderProjects() {
  const projectsList = document.getElementById('projectsList')
  if (projectsList) {
    projectsList.innerHTML = projects.length === 0 
      ? '<p class="no-projects">No projects generated yet</p>'
      : projects.map(project => `
          <div class="project-item">
            <div class="project-header">
              <h3>${project.name}</h3>
              <span class="project-version">v${project.version}</span>
            </div>
            <div class="project-details">
              <p class="project-type">${project.type}</p>
              <p class="project-repo">Repository ID: ${project.github_repository_id}</p>
              <p class="project-date">Created: ${formatDate(project.created_at)}</p>
              <p class="project-user">Created by: User #${project.user.github_user_id}</p>
            </div>
            <button 
              class="delete-btn" 
              title="Delete project"
              onclick="window.handleDelete(${JSON.stringify(project).replace(/"/g, '&quot;')})"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `).join('')
  }
}

// Make handleDelete available globally for the onclick handler
window.handleDelete = handleDelete

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>Planter App</h1>
    <div class="input-group">
      <input 
        type="text" 
        id="projectName" 
        placeholder="Project name" 
        class="project-input"
      />
      <button id="generateBtn" class="generate-btn">Generate Project</button>
    </div>
    <div id="error" class="error-message"></div>
    <div class="projects-section">
      <h2>Projects generated</h2>
      <div id="projectsList" class="projects-list"></div>
    </div>
  </div>
`

const generateBtn = document.getElementById('generateBtn')
const projectInput = document.getElementById('projectName') as HTMLInputElement

generateBtn?.addEventListener('click', async () => {
  const projectName = projectInput.value.trim()
  
  if (projectName) {
    try {
      await api.createProject({
        name: projectName,
        type: 'ECOMMERCE' // Default type, you might want to make this configurable
      })
      projectInput.value = ''
      await loadProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
      showError('Failed to create project')
    }
  } else {
    showError('Please provide a project name')
  }
})

// Load projects on page load
loadProjects()
