import './style.css'
import { api } from './api'
import type { Project } from './config'

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

function renderProjects() {
  const projectsList = document.getElementById('projectsList')
  if (projectsList) {
    projectsList.innerHTML = projects.length === 0 
      ? '<p class="no-projects">No projects generated yet</p>'
      : projects.map(project => `
          <div class="project-item">
            <h3>${project.name}</h3>
            <p class="project-type">${project.type}</p>
            <p class="project-date">Created: ${new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        `).join('')
  }
}

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
  }
})

// Load projects on page load
loadProjects()
