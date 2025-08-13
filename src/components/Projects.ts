import type { Project } from '../types'
import { formatDate } from '../utils'

export function renderProjects(projects: Project[]) {
  return `
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
