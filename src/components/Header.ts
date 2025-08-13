import type { GitHubUser } from '../types'

export function renderHeader(currentUser: GitHubUser | null) {
  return `
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
  `
}
