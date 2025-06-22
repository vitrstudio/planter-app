import './style.css'
import { api } from './api'
import type { Project, User } from './config'
import { setDefaultUserId, getDefaultUserId } from './config'
import { config } from './config'
console.log("API URL is", config.apiUrl)

// Declare the global function type
declare global {
  interface Window {
    handleDelete: (project: Project) => Promise<void>
  }
}

let projects: Project[] = []
let users: User[] = []
let activeTab: 'projects' | 'users' = 'projects'

async function loadProjects() {
  try {
    projects = await api.getProjects()
    if (activeTab === 'projects') renderProjects()
  } catch (error) {
    console.error('Failed to load projects:', error)
    showError('Failed to load projects')
  }
}

async function loadUsers() {
  try {
    users = await api.getUsers()
    if (users.length > 0 && !getDefaultUserId()) {
      setDefaultUserId(users[0].id)
    }
    if (activeTab === 'users') renderUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
    showError('Failed to load users')
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

function renderTabs() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="header-fixed">
      <div class="header-content">
        <h1>Planter App</h1>
        <div class="tab-switch">
          <button id="tab-projects" class="tab-btn${activeTab === 'projects' ? ' active' : ''}">Projects</button>
          <button id="tab-users" class="tab-btn${activeTab === 'users' ? ' active' : ''}">Users</button>
        </div>
      </div>
    </div>
    <div class="container">
      <div id="tabContent"></div>
    </div>
  `
  document.getElementById('tab-projects')?.addEventListener('click', () => switchTab('projects'))
  document.getElementById('tab-users')?.addEventListener('click', () => switchTab('users'))
}

function renderProjects() {
  const tabContent = document.getElementById('tabContent')
  if (!tabContent) return
  tabContent.innerHTML = `
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
  `
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
  const generateBtn = document.getElementById('generateBtn')
  const projectInput = document.getElementById('projectName') as HTMLInputElement
  generateBtn?.addEventListener('click', async () => {
    const projectName = projectInput.value.trim()
    if (projectName) {
      try {
        await api.createProject({
          name: projectName,
          type: 'ECOMMERCE' // Default type
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

function renderUsers() {
  const tabContent = document.getElementById('tabContent')
  if (!tabContent) return
  tabContent.innerHTML = `
    <div class="users-section">
      <h2>Users</h2>
      <div id="usersList" class="users-list"></div>
    </div>
  `
  const usersList = document.getElementById('usersList')
  if (usersList) {
    usersList.innerHTML = users.length === 0
      ? '<p class="no-projects">No users found</p>'
      : users.map(user => `
          <div class="user-item${user.id === getDefaultUserId() ? ' default-user' : ''}" data-user-id="${user.id}">
            <div class="user-header">
              <span class="user-id">User ID: ${user.id}</span>
              <span class="github-id">GitHub ID: ${user.github_user_id}</span>
              ${user.id === getDefaultUserId() ? '<span class="default-label">Default</span>' : ''}
            </div>
            <div class="user-date">Created: ${formatDate(user.created_at)}</div>
          </div>
        `).join('')
    // Add click listeners to user items
    Array.from(usersList.getElementsByClassName('user-item')).forEach((el) => {
      el.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement
        const userId = target.getAttribute('data-user-id')
        if (userId) {
          setDefaultUserId(userId)
          renderUsers()
        }
      })
    })
  }
}

function switchTab(tab: 'projects' | 'users') {
  if (activeTab === tab) return
  activeTab = tab
  renderTabs()
  if (tab === 'projects') {
    renderProjects()
    loadProjects()
  } else {
    renderUsers()
    loadUsers()
  }
}

// Make handleDelete available globally for the onclick handler
window.handleDelete = handleDelete

// Initial render
renderTabs()
renderProjects()
loadProjects()
