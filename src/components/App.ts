import { APP_VERSION } from '../version'
import { renderHeader } from './Header'
import { renderProjects } from './Projects'
import type { GitHubUser } from '../types'

export function renderApp(currentUser: GitHubUser | null) {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    ${renderHeader(currentUser)}
    <div class="version-display">v${APP_VERSION}</div>
    <div class="container">
      <div id="tabContent"></div>
    </div>
  `
}

export function renderProjectsTab(projects: any[]) {
  const tabContent = document.getElementById('tabContent')
  if (!tabContent) return
  
  tabContent.innerHTML = renderProjects(projects)
}
