import './style.css'
import { api } from './api'
import type { Project } from './config'
import { config } from './config'
import { APP_VERSION } from './version'
import { githubAuth, type GitHubUser } from './auth'
console.log("API URL is", config.apiUrl)

// Declare the global function type
declare global {
  interface Window {
    handleDelete: (project: Project) => Promise<void>
    handleGitHubLogin: () => void
    handleLogout: () => void
  }
}

let projects: Project[] = []
let currentUser: GitHubUser | null = null
let isAuthenticated = false

async function loadProjects() {
  try {
    projects = await api.getProjects()
    renderProjects()
  } catch (error) {
    console.error('Failed to load projects:', error)
    showError('Failed to load projects')
  }
}

async function checkAuthStatus() {
  const authState = await githubAuth.checkAuthStatus()
  isAuthenticated = authState.isAuthenticated
  currentUser = authState.user
  
  if (isAuthenticated && currentUser) {
    renderApp()
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
  githubAuth.initiateLogin()
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

function renderLogin(errorMessage?: string) {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-container">
          <img src="/vitruviux-logo.png" alt="Vitruviux" class="logo" />
        </div>
        <h1>VITRUVIUX</h1>
        <p class="login-subtitle">Generate your next project with AI-powered insights</p>
        ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ''}
        <button class="github-login-btn" onclick="window.handleGitHubLogin()">
          <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 4.624-5.479 4.809.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  `
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="header-fixed">
      <div class="header-content">
        <div class="header-left">
          <img src="/vitruviux-logo.png" alt="Vitruviux" class="header-logo" />
        </div>
        <div class="header-right">
          <div class="user-info">
            <img src="${currentUser?.avatar_url || ''}" alt="${currentUser?.name || 'User'}" class="user-avatar" />
            <span class="user-name">${currentUser?.name || 'User'}</span>
          </div>
          <button class="logout-btn" onclick="window.handleLogout()">Logout</button>
        </div>
      </div>
    </div>
    <div class="version-display">v${APP_VERSION}</div>
    <div class="container">
      <div id="tabContent"></div>
    </div>
  `
}

function renderProjects() {
  const tabContent = document.getElementById('tabContent')
  if (!tabContent) return
  tabContent.innerHTML = `
    <div class="hero-section">
      <h1>Generate Your Next Project</h1>
      <p class="hero-subtitle">Create amazing projects with AI-powered insights and best practices</p>
    </div>
    
    <div class="project-form">
      <div class="form-group">
        <label for="projectName">Project Name</label>
        <input 
          type="text" 
          id="projectName" 
          placeholder="Enter your project name..." 
          class="project-input"
        />
      </div>
      <div class="form-group">
        <label for="projectType">Project Type</label>
        <select id="projectType" class="project-select">
          <option value="ECOMMERCE">E-commerce</option>
          <option value="BLOG">Blog</option>
          <option value="PORTFOLIO">Portfolio</option>
          <option value="DASHBOARD">Dashboard</option>
        </select>
      </div>
      <button id="generateBtn" class="generate-btn">
        <svg class="sparkles-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3l1.09 6.26L22 12l-8.91 2.74L12 21l-1.09-6.26L2 12l8.91-2.74L12 3z"/>
        </svg>
        Generate Project
      </button>
    </div>
    
    <div id="error" class="error-message"></div>
    
    <div class="projects-section">
      <h2>Your Projects</h2>
      <div id="projectsList" class="projects-list"></div>
    </div>
  `
  const projectsList = document.getElementById('projectsList')
  if (projectsList) {
    projectsList.innerHTML = projects.length === 0 
      ? '<p class="no-projects">No projects generated yet</p>'
      : projects.map(project => `
          <div class="project-item">
            <div class="project-header">
              <h3>${project.name}</h3>
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
  const generateBtn = document.getElementById('generateBtn')
  const projectInput = document.getElementById('projectName') as HTMLInputElement
  const projectTypeSelect = document.getElementById('projectType') as HTMLSelectElement
  
  generateBtn?.addEventListener('click', async () => {
    const projectName = projectInput.value.trim()
    const projectType = projectTypeSelect.value
    
    if (projectName) {
      try {
        await api.createProject({
          name: projectName,
          type: projectType as 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO'
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
}



function handleLogout() {
  githubAuth.logout()
  isAuthenticated = false
  currentUser = null
  renderLogin()
}

// Make functions available globally for the onclick handlers
window.handleDelete = handleDelete
window.handleLogout = handleLogout
window.handleGitHubLogin = handleGitHubLogin

// Initial render
checkAuthStatus()
