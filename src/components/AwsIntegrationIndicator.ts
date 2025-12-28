import type { AwsStatus } from '../types'

export function renderAwsIntegrationIndicator(status: AwsStatus, tooltip?: string) {
  const baseClasses = 'aws-integration-indicator'
  const stateClasses = `aws-indicator-${status}`
  
  let content = ''
  let icon = ''
  
  switch (status) {
    case 'loading':
      content = `
        <div class="aws-indicator-spinner"></div>
        <span>Checking AWS...</span>
      `
      break
    case 'not_configured':
      icon = `
        <svg class="aws-indicator-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          <path d="M14 10h-4"></path>
          <path d="M12 6v8"></path>
        </svg>
      `
      content = `
        ${icon}
        <span>Connect AWS</span>
        <div class="aws-indicator-dot"></div>
      `
      break
    case 'needs_attention':
      icon = `
        <svg class="aws-indicator-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          <path d="M14 10h-4"></path>
          <path d="M12 6v8"></path>
        </svg>
      `
      content = `
        ${icon}
        <span>Connect AWS</span>
        <div class="aws-indicator-dot"></div>
      `
      break
    case 'connected':
      icon = `
        <svg class="aws-indicator-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          <path d="M9 10l2 2 4-4"></path>
        </svg>
      `
      content = `
        ${icon}
        <span>AWS connected</span>
        <div class="aws-indicator-dot"></div>
      `
      break
  }
  
  const disabledAttr = status === 'loading' ? 'disabled' : ''
  const titleAttr = tooltip ? `title="${tooltip}"` : ''
  
  return `
    <button 
      class="${baseClasses} ${stateClasses}" 
      id="awsIntegrationIndicator"
      onclick="window.handleAwsIndicatorClick()"
      ${disabledAttr}
      ${titleAttr}
    >
      ${content}
    </button>
  `
}

