import type { GitHubUser } from '../types'
import { renderAwsIntegrationIndicator } from './AwsIntegrationIndicator'
import type { AwsStatus } from '../types'

export function renderHeader(currentUser: GitHubUser | null, awsStatus: AwsStatus = 'loading') {
  const tooltips: Record<AwsStatus, string> = {
    loading: '',
    not_configured: 'Connect your AWS account to create and monitor infrastructure.',
    connected: 'AWS account linked. Click to view details and resources.',
    needs_attention: 'AWS integration needs attention. Click to review and reconnect.'
  }
  
  return `
    <div class="header-fixed">
      <div class="header-content">
        <div class="header-left">
          <img src="/vitruviux-logo.png" alt="vitruviux" class="header-logo" />
        </div>
        <div class="header-right">
          ${renderAwsIntegrationIndicator(awsStatus, tooltips[awsStatus])}
          <div class="user-info">
            <span class="user-name">${currentUser?.name || 'User'}</span>
            <img src="${currentUser?.avatar_url || ''}" alt="${currentUser?.name || 'User'}" class="user-avatar" onerror="this.style.display='none'" />
          </div>
          <button class="logout-btn" onclick="window.handleLogout()">Logout</button>
        </div>
      </div>
    </div>
  `
}
