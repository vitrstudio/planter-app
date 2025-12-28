import { APP_VERSION } from '../version'
import { renderHeader } from './Header'
import { renderProjectsGrid, renderProjectForm } from './Projects'
import { renderAwsIntegrationModal } from './AwsIntegrationModal'
import type { GitHubUser } from '../types'
import type { AwsStatus, AwsIntegration } from '../types'

let currentAwsIntegration: AwsIntegration | null = null

export function getCurrentAwsIntegration(): AwsIntegration | null {
  return currentAwsIntegration
}

export function setCurrentAwsIntegration(integration: AwsIntegration | null) {
  currentAwsIntegration = integration
}

export { renderAwsIntegrationModal }

export function renderApp(currentUser: GitHubUser | null, awsStatus: AwsStatus = 'loading') {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    ${renderHeader(currentUser, awsStatus)}
    <div class="version-display">v${APP_VERSION}</div>
    <div class="container">
      <div id="actionBar" class="action-bar"></div>
      <div id="tabContent"></div>
    </div>
    ${renderAwsIntegrationModal(currentAwsIntegration)}
    <div id="patreonModal" class="patreon-modal" style="display: none;">
      <div class="patreon-modal-backdrop" onclick="window.handleClosePatreonModal()"></div>
      <div class="patreon-modal-content">
        <button class="patreon-modal-close" onclick="window.handleClosePatreonModal()" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 class="patreon-modal-title">I created this app for free, but I still need to pay my rent</h2>
        <div class="patreon-modal-image-container">
          <img src="/developer-photo.jpg" alt="Developer" class="patreon-modal-image" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'patreon-modal-image-placeholder\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'80\\' height=\\'80\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><path d=\\'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\\'></path><circle cx=\\'12\\' cy=\\'7\\' r=\\'4\\'></circle></svg></div>';">
        </div>
        <p class="patreon-modal-subtitle">I'm a developer, just like you. If this app was useful and you believe that my work should be rewarded, please consider supporting me through Patreon. Your support means the world to me and helps me continue developing more open-source projects! 🙏</p>
        <div class="patreon-modal-actions">
          <button class="patreon-modal-btn-secondary" onclick="window.handleClosePatreonModal()">
            Not right now
          </button>
          <a href="https://www.patreon.com" target="_blank" rel="noopener noreferrer" class="patreon-modal-btn-primary">
            Support on Patreon
          </a>
        </div>
      </div>
    </div>
  `
}

export function renderProjectsTab(projects: any[]) {
  const tabContent = document.getElementById('tabContent')
  const actionBar = document.getElementById('actionBar')
  if (!tabContent || !actionBar) return
  
  const hasProjects = projects.length > 0
  
  // Show the action bar with Patreon button (if projects exist) and Create new project button
  actionBar.innerHTML = `
    ${hasProjects ? `
      <button class="patreon-btn" id="patreonBtn" onclick="window.handlePatreonClick()">
        Patreon
      </button>
    ` : '<div></div>'}
    <button id="createProjectBtn" class="create-project-btn">
      Create new project
    </button>
  `
  
  // Show the projects grid
  tabContent.innerHTML = renderProjectsGrid(projects)
}

export function renderProjectFormView() {
  const tabContent = document.getElementById('tabContent')
  const actionBar = document.getElementById('actionBar')
  if (!tabContent || !actionBar) return
  
  // Hide the "Create new project" button
  actionBar.innerHTML = ''
  
  // Show the form
  tabContent.innerHTML = renderProjectForm()
}
