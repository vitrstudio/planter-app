import './style.css'
import { config, setDefaultUserId, getDefaultUserId } from './config'
import { ProjectService, AuthService } from './services'
import { renderLogin, renderApp, renderProjectsTab, renderProjectFormView } from './components'
import { setCurrentAwsIntegration, getCurrentAwsIntegration } from './components/App'
import { renderAwsIntegrationModal } from './components'
import { renderHeader } from './components'
import { showError } from './utils'
import { api } from './api'
import type { AwsStatus } from './types'

console.log("API URL is", config.apiUrl)

// Declare the global function type
declare global {
  interface Window {
    handleDelete: (project: any) => Promise<void>
    handleGitHubLogin: () => void
    handleLogout: () => void
    handlePatreonClick: () => void
    handleClosePatreonModal: () => void
    handleAwsIndicatorClick: () => void
    handleCloseAwsModal: () => void
    handleAwsSetup: () => Promise<void>
    handleCheckAwsStatus: () => Promise<void>
    handleSwitchTab: (tab: string) => void
    handleCopyCommand: () => void
  }
}

let currentAwsStatus: AwsStatus = 'loading'
let currentUser: any = null

// Initialize services
const projectService = new ProjectService()
const authService = new AuthService()

async function loadAwsIntegration() {
  try {
    const userId = getDefaultUserId()
    if (!userId) {
      currentAwsStatus = 'not_configured'
      setCurrentAwsIntegration({ status: 'not_configured' })
      updateHeaderAwsStatus()
      return
    }
    
    const user = await api.getUser(userId)
    
    // Update current user with latest data
    currentUser = user
    
    // Determine AWS status based on aws_account_enabled
    if (user.aws_account_enabled) {
      currentAwsStatus = 'connected'
      setCurrentAwsIntegration({
        status: 'connected',
        accountId: user.aws_account_id
      })
    } else {
      // aws_account_enabled is false - show yellow (needs_attention)
      currentAwsStatus = 'needs_attention'
      setCurrentAwsIntegration({
        status: 'needs_attention',
        accountId: user.aws_account_id
      })
    }
    
    updateHeaderAwsStatus()
  } catch (error: any) {
    console.error('Failed to load AWS integration:', error)
    currentAwsStatus = 'needs_attention'
    setCurrentAwsIntegration({ status: 'needs_attention' })
    updateHeaderAwsStatus()
  }
}

function updateHeaderAwsStatus() {
  if (currentUser) {
    const header = document.querySelector('.header-fixed')
    if (header) {
      const headerContent = document.querySelector('.header-content')
      if (headerContent) {
        const newHeaderHTML = renderHeader(currentUser, currentAwsStatus)
        const match = newHeaderHTML.match(/<div class="header-content">[\s\S]*<\/div>/)?.[0]
        if (match) {
          headerContent.outerHTML = match
          // Re-attach event listeners
          setTimeout(() => {
            const indicator = document.getElementById('awsIntegrationIndicator')
            if (indicator && currentAwsStatus !== 'loading') {
              indicator.onclick = () => window.handleAwsIndicatorClick()
            }
          }, 10)
        }
      }
    }
  }
}

async function loadProjects() {
  try {
    await projectService.loadProjects()
    renderProjectsTab(projectService.getProjects())
    // Re-attach event listeners after rendering
    setTimeout(() => {
      setupViewListeners()
    }, 50)
  } catch (error) {
    console.error('Failed to load projects:', error)
    showError('Failed to load projects')
  }
}

async function checkAuthStatus() {
  try {
    const authState = await authService.checkAuthStatus()
    
    if (authState.isAuthenticated) {
      // Set the user ID for API calls
      if (authState.userId) {
        setDefaultUserId(authState.userId)
      }
      currentUser = authState.user
      renderApp(authState.user, currentAwsStatus)
      await Promise.all([
        loadProjects(),
        loadAwsIntegration()
      ])
    } else {
      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      
      if (code && state) {
        // Handle OAuth callback
        const success = await authService.handleCallback(code, state)
        if (success) {
          // Clear URL parameters and redirect
          window.history.replaceState({}, document.title, window.location.pathname)
          await checkAuthStatus() // Re-check auth status
          return
        } else {
          renderLogin('GitHub authentication failed. Please try again.')
        }
      } else if (error) {
        let errorMessage = ''
        if (error === 'access_denied') {
          errorMessage = 'GitHub access was denied. Please try again.'
        } else if (error === 'auth_failed') {
          errorMessage = 'Authentication failed. Please try again.'
        } else {
          errorMessage = `Authentication error: ${error}`
        }
        renderLogin(errorMessage)
      } else {
        renderLogin()
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    renderLogin('Authentication check failed. Please try again.')
  }
}

async function handleGitHubLogin() {
  try {
    await authService.initiateLogin()
  } catch (error) {
    console.error('Failed to initiate GitHub login:', error)
    showError('Failed to start GitHub authentication. Please try again.')
  }
}

async function handleDelete(project: any) {
  try {
    await projectService.deleteProject(project)
    renderProjectsTab(projectService.getProjects())
    // Re-attach event listeners after rendering
    setTimeout(() => {
      setupViewListeners()
    }, 50)
  } catch (error) {
    console.error('Failed to delete project:', error)
    showError('Failed to delete project')
  }
}

function showProjectsView() {
  renderProjectsTab(projectService.getProjects())
  setTimeout(() => {
    setupViewListeners()
  }, 50)
}

function showFormView() {
  renderProjectFormView()
  setTimeout(() => {
    setupProjectFormListeners()
  }, 50)
}

function handleLogout() {
  authService.logout()
  renderLogin()
}

// Set up event listeners for view switching
function setupViewListeners() {
  const createProjectBtn = document.getElementById('createProjectBtn')
  if (createProjectBtn) {
    createProjectBtn.addEventListener('click', () => {
      showFormView()
    })
  }
}

// Validate AWS Account ID (must be 12 digits)
function isValidAwsAccountId(accountId: string): boolean {
  return /^\d{12}$/.test(accountId)
}

// Set up event listeners for project generation
function setupProjectFormListeners() {
  const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement | null
  const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement | null
  const projectInput = document.getElementById('projectName') as HTMLInputElement | null
  const projectTypeSelect = document.getElementById('projectType') as HTMLSelectElement | null
  const deploymentPlatformSelect = document.getElementById('deploymentPlatform') as HTMLSelectElement | null
  const awsFields = document.getElementById('awsFields')
  const awsAccountIdInput = document.getElementById('awsAccountId') as HTMLInputElement | null
  const awsAccountIdHelper = document.getElementById('awsAccountIdHelper')
  
  // Handle cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      showProjectsView()
    })
  }
  
  // Update button state based on AWS Account ID validation
  function updateButtonState() {
    if (!generateBtn || !deploymentPlatformSelect) return
    
    const platform = deploymentPlatformSelect.value
    const projectName = projectInput?.value.trim() || ''
    
    if (platform === 'AWS') {
      const awsAccountId = awsAccountIdInput?.value.trim() || ''
      const isValid = isValidAwsAccountId(awsAccountId)
      generateBtn.disabled = !isValid
      generateBtn.textContent = 'Launch AWS Setup'
      
      // Show/hide helper text
      if (awsAccountIdHelper) {
        if (awsAccountId && !isValid) {
          awsAccountIdHelper.style.display = 'block'
        } else {
          awsAccountIdHelper.style.display = 'none'
        }
      }
    } else {
      generateBtn.disabled = !projectName
      generateBtn.textContent = 'Generate'
    }
  }
  
  if (generateBtn && projectInput && projectTypeSelect && deploymentPlatformSelect) {
    // Remove focus from dropdown after selection
    projectTypeSelect.addEventListener('change', () => {
      projectTypeSelect.blur()
      updateButtonState()
    })
    
    // Handle AWS Account ID input changes
    if (awsAccountIdInput) {
      // Only allow numeric input
      awsAccountIdInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        target.value = target.value.replace(/\D/g, '')
        updateButtonState()
      })
      awsAccountIdInput.addEventListener('paste', (e) => {
        e.preventDefault()
        const paste = (e.clipboardData || (window as any).clipboardData).getData('text')
        const numericOnly = paste.replace(/\D/g, '')
        awsAccountIdInput.value = numericOnly
        updateButtonState()
      })
    }
    
    // Handle project name input changes
    projectInput.addEventListener('input', () => {
      updateButtonState()
    })
    
    // Handle deployment platform selection
    deploymentPlatformSelect.addEventListener('change', () => {
      deploymentPlatformSelect.blur()
      const platform = deploymentPlatformSelect.value
      console.log('Deployment platform changed to:', platform)
      
      // Get awsFields element dynamically in case it wasn't found initially
      const awsFieldsElement = document.getElementById('awsFields')
      console.log('AWS fields element found:', !!awsFieldsElement)
      
      if (awsFieldsElement) {
        if (platform === 'AWS') {
          console.log('Showing AWS fields')
          awsFieldsElement.style.display = 'block'
        } else {
          console.log('Hiding AWS fields')
          awsFieldsElement.style.display = 'none'
          // Clear AWS Account ID when hidden
          if (awsAccountIdInput) awsAccountIdInput.value = ''
          if (awsAccountIdHelper) awsAccountIdHelper.style.display = 'none'
        }
      } else {
        console.error('AWS fields element not found!')
      }
      updateButtonState()
    })
    
    generateBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      
      const projectName = projectInput.value.trim()
      const projectType = projectTypeSelect.value
      const platform = deploymentPlatformSelect.value

      // Handle AWS setup
      if (platform === 'AWS') {
        const awsAccountId = awsAccountIdInput?.value.trim() || ''
        
        if (!isValidAwsAccountId(awsAccountId)) {
          showError('AWS Account ID must be a 12-digit number.')
          return
        }
        
        // AWS setup is now handled through the AWS integration modal
        // Remove this old code path
        showError('Please connect your AWS account first using the AWS integration button in the header.')
        return
      }

      // Handle regular project creation
      if (projectName) {
        try {
          await projectService.createProject({
            name: projectName,
            type: projectType as 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO' | 'UNKNOWN'
          })
          
          // Clear form
          projectInput.value = ''
          deploymentPlatformSelect.value = 'NONE'
          if (awsFields) awsFields.style.display = 'none'
          if (awsAccountIdInput) awsAccountIdInput.value = ''
          if (awsAccountIdHelper) awsAccountIdHelper.style.display = 'none'
          
          // Go back to projects view after successful creation
          showProjectsView()
        } catch (error) {
          console.error('Failed to create project:', error)
          showError('Failed to create project')
        }
      } else {
        showError('Please provide a project name')
      }
    })
    
    // Initial button state
    updateButtonState()
  }
}

function handlePatreonClick() {
  const modal = document.getElementById('patreonModal')
  if (modal) {
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
    
    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePatreonModal()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  }
}

function handleClosePatreonModal() {
  const modal = document.getElementById('patreonModal')
  if (modal) {
    modal.style.display = 'none'
    document.body.style.overflow = ''
  }
}

function handleAwsIndicatorClick() {
  const modal = document.getElementById('awsIntegrationModal')
  if (modal) {
    // Update modal content if needed
    const currentIntegration = getCurrentAwsIntegration()
    const newModalHTML = renderAwsIntegrationModal(currentIntegration)
    modal.outerHTML = newModalHTML
    
    // Get the new modal element
    const newModal = document.getElementById('awsIntegrationModal')
    if (newModal) {
      newModal.style.display = 'flex'
    }
    
    document.body.style.overflow = 'hidden'
    
    // Re-attach event listeners
    setupAwsModalListeners()
    
    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseAwsModal()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  }
}

function setupAwsModalListeners() {
  setTimeout(() => {
    const closeBtn = document.querySelector('.aws-modal-close')
    if (closeBtn) {
      closeBtn.removeAttribute('onclick')
      closeBtn.addEventListener('click', handleCloseAwsModal)
    }
    const backdrop = document.querySelector('.aws-modal-backdrop')
    if (backdrop) {
      backdrop.removeAttribute('onclick')
      backdrop.addEventListener('click', handleCloseAwsModal)
    }
    
    // Setup button for initial form
    const setupBtn = document.getElementById('awsSetupBtn')
    if (setupBtn) {
      setupBtn.removeAttribute('onclick')
      setupBtn.addEventListener('click', handleAwsSetup)
    }
    
    // Setup button for CloudFormation steps
    const openConsoleBtn = document.getElementById('awsOpenConsoleBtn')
    if (openConsoleBtn) {
      // Link already has href, no additional handler needed
    }
    
    const checkBtn = document.querySelector('.aws-refresh-btn')
    if (checkBtn) {
      checkBtn.removeAttribute('onclick')
      checkBtn.addEventListener('click', handleCheckAwsStatus)
    }
    
    // Add validation for Account ID input
    const accountIdInput = document.getElementById('awsAccountId') as HTMLInputElement
    const setupButton = document.getElementById('awsSetupBtn') as HTMLButtonElement
    if (accountIdInput && setupButton) {
      const updateButtonState = () => {
        const accountId = accountIdInput.value.trim()
        const isValid = /^\d{12}$/.test(accountId)
        setupButton.disabled = !isValid
      }
      accountIdInput.addEventListener('input', updateButtonState)
      updateButtonState()
    }
  }, 10)
}

function handleCloseAwsModal() {
  const modal = document.getElementById('awsIntegrationModal')
  if (modal) {
    modal.style.display = 'none'
    document.body.style.overflow = ''
  }
}

async function handleAwsSetup() {
  const accountIdInput = document.getElementById('awsAccountId') as HTMLInputElement | null
  const setupBtn = document.getElementById('awsSetupBtn') as HTMLButtonElement | null
  
  if (!accountIdInput || !setupBtn) {
    console.error('Could not find Account ID input or button')
    return
  }
  
  const accountId = accountIdInput.value.trim()
  
  // Validation
  if (!/^\d{12}$/.test(accountId)) {
    showError('AWS Account ID must be a 12-digit number')
    return
  }
  
  // Set loading state
  setupBtn.disabled = true
  const originalText = setupBtn.textContent
  setupBtn.textContent = 'Setting up...'
  
  try {
    const userId = getDefaultUserId()
    if (!userId) {
      throw new Error('User ID not found. Please log in again.')
    }
    
    console.log('Requesting CloudFormation URL for account:', accountId)
    const response = await api.setupAwsAccount(userId, accountId)
    console.log('Received CloudFormation URL:', response.url)
    
    if (!response.url || response.url.trim() === '') {
      throw new Error('No URL returned from server')
    }
    
    // Update modal to show CloudFormation steps with tabs
    const modal = document.getElementById('awsIntegrationModal')
    if (modal) {
      const currentIntegration = getCurrentAwsIntegration() || { status: 'not_configured' as const, accountId }
      currentIntegration.accountId = accountId
      setCurrentAwsIntegration(currentIntegration)
      modal.outerHTML = renderAwsIntegrationModal(currentIntegration, response.url)
      
      // Get the new modal element and ensure it's visible
      const newModal = document.getElementById('awsIntegrationModal')
      if (newModal) {
        newModal.style.display = 'flex'
      }
      
      // Re-attach event listeners
      setupAwsModalListeners()
    }
  } catch (error: any) {
    console.error('Failed to setup AWS account:', error)
    const errorMessage = error.message || error.statusText || 'Failed to setup AWS account. Please try again.'
    showError(errorMessage)
    
    // Restore button
    setupBtn.disabled = false
    if (originalText) {
      setupBtn.textContent = originalText
    }
  }
}

async function handleCheckAwsStatus() {
  const checkBtn = document.querySelector('.aws-refresh-btn') as HTMLButtonElement
  const statusResult = document.getElementById('awsStatusResult')
  const originalText = checkBtn?.textContent
  
  // Hide previous result
  if (statusResult) {
    statusResult.style.display = 'none'
    statusResult.className = 'aws-status-result'
  }
  
  if (checkBtn) {
    checkBtn.disabled = true
    checkBtn.textContent = 'Checking...'
  }
  
  try {
    await loadAwsIntegration()
    
    // Show result in the UI
    if (statusResult) {
      if (currentAwsStatus === 'connected') {
        // Success state
        statusResult.className = 'aws-status-result aws-status-success'
        statusResult.innerHTML = `
          <div class="aws-status-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div class="aws-status-text">
              <strong>Connection Successful!</strong>
              <p>AWS account is now connected and ready to use.</p>
            </div>
          </div>
        `
      } else {
        // Not connected yet
        statusResult.className = 'aws-status-result aws-status-warning'
        statusResult.innerHTML = `
          <div class="aws-status-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div class="aws-status-text">
              <strong>Connection Not Complete</strong>
              <p>Please ensure the CloudFormation stack has been created successfully. The stack status should show "CREATE_COMPLETE" in the AWS Console.</p>
            </div>
          </div>
        `
      }
      statusResult.style.display = 'block'
    }
  } catch (error) {
    console.error('Failed to check AWS status:', error)
    // Show error state
    if (statusResult) {
      statusResult.className = 'aws-status-result aws-status-error'
      statusResult.innerHTML = `
        <div class="aws-status-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="aws-status-text">
            <strong>Error Checking Connection</strong>
            <p>Could not verify AWS integration. Please ensure the stack was created successfully and try again.</p>
          </div>
        </div>
      `
      statusResult.style.display = 'block'
    }
  } finally {
    if (checkBtn && originalText) {
      checkBtn.disabled = false
      checkBtn.textContent = originalText
    }
  }
}

function handleSwitchTab(tab: string) {
  const consoleTab = document.getElementById('awsTabConsole')
  const terminalTab = document.getElementById('awsTabTerminal')
  const consoleBtn = document.querySelector('[data-tab="console"]')
  const terminalBtn = document.querySelector('[data-tab="terminal"]')
  
  if (tab === 'console') {
    if (consoleTab) consoleTab.style.display = 'block'
    if (terminalTab) terminalTab.style.display = 'none'
    if (consoleBtn) consoleBtn.classList.add('aws-tab-active')
    if (terminalBtn) terminalBtn.classList.remove('aws-tab-active')
  } else if (tab === 'terminal') {
    if (consoleTab) consoleTab.style.display = 'none'
    if (terminalTab) terminalTab.style.display = 'block'
    if (consoleBtn) consoleBtn.classList.remove('aws-tab-active')
    if (terminalBtn) terminalBtn.classList.add('aws-tab-active')
  }
}

function handleCopyCommand() {
  const commandElement = document.getElementById('awsCliCommand')
  if (!commandElement) return
  
  const command = commandElement.textContent || ''
  navigator.clipboard.writeText(command).then(() => {
    const copyBtn = document.querySelector('.aws-copy-btn')
    if (copyBtn) {
      const originalHTML = copyBtn.innerHTML
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML
      }, 2000)
    }
  }).catch(err => {
    console.error('Failed to copy command:', err)
  })
}

// Make functions available globally for the onclick handlers
window.handleDelete = handleDelete
window.handleLogout = handleLogout
window.handleGitHubLogin = handleGitHubLogin
window.handlePatreonClick = handlePatreonClick
window.handleClosePatreonModal = handleClosePatreonModal
window.handleAwsIndicatorClick = handleAwsIndicatorClick
window.handleCloseAwsModal = handleCloseAwsModal
window.handleAwsSetup = handleAwsSetup
window.handleCheckAwsStatus = handleCheckAwsStatus
window.handleSwitchTab = handleSwitchTab
window.handleCopyCommand = handleCopyCommand

// Initial render
checkAuthStatus()

// Set up event listeners after initial render
setTimeout(() => {
  setupViewListeners()
}, 100)
