import './style.css'
import { config } from './config'
import { ProjectService, AuthService } from './services'
import { renderLogin, renderApp, renderProjectsTab } from './components'
import { showError } from './utils'

console.log("API URL is", config.apiUrl)

// Declare the global function type
declare global {
  interface Window {
    handleDelete: (project: any) => Promise<void>
    handleGitHubLogin: () => void
    handleLogout: () => void
  }
}

// Initialize services
const projectService = new ProjectService()
const authService = new AuthService()

async function loadProjects() {
  try {
    await projectService.loadProjects()
    renderProjectsTab(projectService.getProjects())
  } catch (error) {
    console.error('Failed to load projects:', error)
    showError('Failed to load projects')
  }
}

async function checkAuthStatus() {
  await authService.checkAuthStatus()
  
  if (authService.isUserAuthenticated()) {
    renderApp(authService.getCurrentUser())
    await loadProjects()
  } else {
    // Check for error parameters in URL
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    
    let errorMessage = ''
    if (error === 'auth_failed') {
      errorMessage = 'Authentication failed. Please try again.'
    } else if (error) {
      errorMessage = `Authentication error: ${error}`
    }
    
    renderLogin(errorMessage)
  }
}

function handleGitHubLogin() {
  authService.initiateLogin()
}

async function handleDelete(project: any) {
  try {
    await projectService.deleteProject(project)
    renderProjectsTab(projectService.getProjects())
  } catch (error) {
    console.error('Failed to delete project:', error)
    showError('Failed to delete project')
  }
}

function handleLogout() {
  authService.logout()
  renderLogin()
}

// Set up event listeners for project generation
function setupProjectFormListeners() {
  const generateBtn = document.getElementById('generateBtn')
  const projectInput = document.getElementById('projectName') as HTMLInputElement
  const projectTypeSelect = document.getElementById('projectType') as HTMLSelectElement
  
  if (generateBtn && projectInput && projectTypeSelect) {
    generateBtn.addEventListener('click', async () => {
      const projectName = projectInput.value.trim()
      const projectType = projectTypeSelect.value
      
      if (projectName) {
        try {
          await projectService.createProject({
            name: projectName,
            type: projectType as 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO'
          })
          projectInput.value = ''
          renderProjectsTab(projectService.getProjects())
        } catch (error) {
          console.error('Failed to create project:', error)
          showError('Failed to create project')
        }
      } else {
        showError('Please provide a project name')
      }
    })
  }
}

// Make functions available globally for the onclick handlers
window.handleDelete = handleDelete
window.handleLogout = handleLogout
window.handleGitHubLogin = handleGitHubLogin

// Initial render
checkAuthStatus()

// Set up event listeners after initial render
setTimeout(() => {
  setupProjectFormListeners()
}, 100)
