import type { Project } from '../types'
import { formatDate } from '../utils'

export function renderProjects(projects: Project[]) {
  return `
    <div class="project-form">
      <div class="form-group">
        <label for="projectName">Project Name</label>
        <input 
          type="text" 
          id="projectName" 
          placeholder="Enter your project name..." 
          class="project-input"
          autocomplete="off"
        />
      </div>
      <div class="form-group">
        <label for="projectType">Project Type</label>
        <div class="select-wrapper">
          <select id="projectType" class="project-select">
            <option value="ECOMMERCE">E-commerce</option>
            <option value="BLOG">Blog</option>
            <option value="PORTFOLIO">Portfolio</option>
            <option value="DASHBOARD">Dashboard</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
          <div class="select-arrow"></div>
        </div>
      </div>
      <div class="form-group">
        <label for="deploymentPlatform">Deployment Platform</label>
        <div class="select-wrapper">
          <select id="deploymentPlatform" class="project-select">
            <option value="NONE">None</option>
            <option value="AWS">AWS</option>
            <option value="VERCEL" disabled>Vercel (Coming soon)</option>
          </select>
          <div class="select-arrow"></div>
        </div>
      </div>
      <div id="awsFields" class="aws-fields" style="display: none;">
        <div class="aws-fields-header">
          <div class="info-icon-wrapper">
            <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="tooltip">We won't store any of your environment values. They will be stored directly on github under the repository scope. If you prefer it, you can also set the variables directly on Github.</div>
          </div>
        </div>
        <div class="form-group">
          <label for="awsAccessKeyId">AWS Access Key</label>
          <input 
            type="text" 
            id="awsAccessKeyId" 
            placeholder="Enter your AWS Access Key ID" 
            class="project-input"
            autocomplete="off"
          />
        </div>
        <div class="form-group">
          <label for="awsSecretAccessKey">AWS Secret Access Key</label>
          <input 
            type="password" 
            id="awsSecretAccessKey" 
            placeholder="Enter your AWS Secret Access Key" 
            class="project-input"
            autocomplete="new-password"
          />
        </div>
      </div>
      <button id="generateBtn" class="generate-btn">
        Generate
      </button>
    </div>
    
    <div id="error" class="error-message"></div>
    
    <div class="projects-section">
      <h2>Your Projects</h2>
      <div id="projectsList" class="projects-list">
        ${renderProjectsList(projects)}
      </div>
    </div>
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
      </div>
      <div class="project-details">
        <p class="project-type">${project.type}</p>
        <p class="project-repo">Repository ID: ${project.github_repository_id}</p>
        <p class="project-date">Created: ${formatDate(project.created_at)}</p>
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
