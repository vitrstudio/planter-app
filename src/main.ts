import './style.css'
import { config, setDefaultUserId } from './config'
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
  try {
    const authState = await authService.checkAuthStatus()
    
    if (authState.isAuthenticated) {
      // Set the user ID for API calls
      if (authState.userId) {
        setDefaultUserId(authState.userId)
      }
      renderApp(authState.user)
      await loadProjects()
    } else {
      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      
      if (code && state) {
        // Handle OAuth callback
        const success = await authService.handleCallback(code, state)
        if (success) {
          // Clear URL parameters and redirect
          window.history.replaceState({}, document.title, window.location.pathname)
          await checkAuthStatus() // Re-check auth status
          return
        } else {
          renderLogin('GitHub authentication failed. Please try again.')
        }
      } else if (error) {
        let errorMessage = ''
        if (error === 'access_denied') {
          errorMessage = 'GitHub access was denied. Please try again.'
        } else if (error === 'auth_failed') {
          errorMessage = 'Authentication failed. Please try again.'
        } else {
          errorMessage = `Authentication error: ${error}`
        }
        renderLogin(errorMessage)
      } else {
        renderLogin()
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    renderLogin('Authentication check failed. Please try again.')
  }
}

async function handleGitHubLogin() {
  try {
    await authService.initiateLogin()
  } catch (error) {
    console.error('Failed to initiate GitHub login:', error)
    showError('Failed to start GitHub authentication. Please try again.')
  }
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
    // Remove focus from dropdown after selection
    projectTypeSelect.addEventListener('change', () => {
      projectTypeSelect.blur()
    })
    
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
