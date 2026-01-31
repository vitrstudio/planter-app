import type { Project } from '../types'
import { formatDate } from '../utils'

export function renderProjectsGrid(projects: Project[]) {
  return `
    <div class="projects-section">
      <div id="projectsList" class="projects-list">
        ${renderProjectsList(projects)}
      </div>
    </div>
  `
}

export function renderProjectForm() {
  return `
    <div class="project-form">
      <div class="form-group">
        <label for="projectName">Project Name</label>
        <input 
          type="text" 
          id="projectName" 
          placeholder="e.g. my-cool-application" 
          class="project-input"
          autocomplete="off"
          pattern="[a-zA-Z0-9-]+"
        />
        <div id="projectNameError" class="helper-text" style="display: none;">
          Use only letters, numbers, or dashes (e.g. vitruviux-app)
        </div>
      </div>
      <div class="form-actions">
        <button id="cancelBtn" class="cancel-btn">
          Cancel
        </button>
        <button id="confirmProjectBtn" class="generate-btn">
          Create Project
        </button>
      </div>
    </div>
    
    <div id="error" class="error-message"></div>
  `
}

function renderProjectsList(projects: Project[]) {
  if (projects.length === 0) {
    return '<p class="no-projects">No projects generated yet</p>'
  }
  
  return projects.map(project => `
    <div class="project-item">
      <div class="project-header">
        <h3>${project.name}</h3>
        ${renderCloudfrontLink(project)}
      </div>
      <div class="project-details">
        <p class="project-repo">Repository ID: ${project.github_repository_id}</p>
        <p class="project-date">Created: ${formatDate(project.created_at)}</p>
        ${renderInfra(project)}
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

function renderCloudfrontLink(project: Project) {
  const cloudfrontUrl = project.infra?.cloudfront_url
  if (!cloudfrontUrl) {
    return ''
  }

  const normalizedCloudfrontUrl = cloudfrontUrl.startsWith('http://') || cloudfrontUrl.startsWith('https://')
    ? cloudfrontUrl
    : `https://${cloudfrontUrl}`

  return `
    <p class="project-cloudfront">
      <a href="${normalizedCloudfrontUrl}" target="_blank" rel="noopener noreferrer">${cloudfrontUrl}</a>
    </p>
  `
}

function renderInfra(project: Project) {
  const infra = project.infra

  if (!infra) {
    return ''
  }

  const items = [
    { label: 'api', value: infra.is_api_running },
    { label: 'database', value: infra.is_database_running },
    { label: 'static website', value: infra.is_application_bucket_created },
  ]

  const listItems = items
    .map(item => `<li>${item.value ? '🟢' : '🔴'} <span>${item.label}</span></li>`)
    .join('')

  return `
    <div class="project-infra">
      <h4>Infra</h4>
      <ul>${listItems}</ul>
    </div>
  `
}
