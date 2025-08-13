// Handle GitHub OAuth callback
import { githubAuth } from '../auth'

export function handleAuthCallback(): void {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  const error = urlParams.get('error')

  if (error) {
    console.error('GitHub OAuth error:', error)
    // Redirect back to login with error
    window.location.href = '/?error=' + encodeURIComponent(error)
    return
  }

  if (code && state) {
    githubAuth.handleCallback(code, state).then((success: boolean) => {
      if (success) {
        // Redirect back to main app
        window.location.href = '/'
      } else {
        // Redirect back to login with error
        window.location.href = '/?error=auth_failed'
      }
    }).catch(() => {
      window.location.href = '/?error=auth_failed'
    })
  } else {
    // No code or state, redirect to login
    window.location.href = '/'
  }
}

// Auto-execute if this script is loaded on the callback page
if (window.location.pathname === '/auth/callback') {
  handleAuthCallback()
}
