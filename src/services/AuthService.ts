import { config } from '../config'
import type { GitHubUser, AuthState } from '../types'

export class AuthService {
  private currentUser: GitHubUser | null = null
  private authToken: string | null = null

  constructor() {
    this.loadStoredAuth()
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('github_token')
    const userData = localStorage.getItem('github_user')
    
    if (token && userData) {
      try {
        this.authToken = token
        this.currentUser = JSON.parse(userData) as GitHubUser
      } catch {
        this.logout()
      }
    }
  }

  public async initiateLogin(): Promise<void> {
    try {
      // Call backend to get GitHub OAuth URL
      const response = await fetch(`${config.apiUrl}/auth/github/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initiate GitHub OAuth')
      }

      const data = await response.json()
      
      // Redirect to GitHub OAuth
      window.location.href = data.authUrl
    } catch (error) {
      console.error('Failed to initiate GitHub OAuth:', error)
      throw error
    }
  }

  public async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      // Exchange code for token via backend
      const response = await fetch(`${config.apiUrl}/auth/github/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      
      // Store authentication data
      this.authToken = data.accessToken
      this.currentUser = data.user
      
      localStorage.setItem('github_token', data.accessToken)
      localStorage.setItem('github_user', JSON.stringify(data.user))
      
      return true
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error)
      return false
    }
  }

  public async validateToken(): Promise<boolean> {
    if (!this.authToken) {
      return false
    }

    try {
      const response = await fetch(`${config.apiUrl}/auth/github/success`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })

      if (!response.ok) {
        this.logout()
        return false
      }

      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      this.logout()
      return false
    }
  }

  public async checkAuthStatus(): Promise<AuthState> {
    if (this.authToken && this.currentUser) {
      // Validate token with backend
      const isValid = await this.validateToken()
      if (!isValid) {
        this.logout()
        return { isAuthenticated: false, user: null, token: null }
      }
      
      return {
        isAuthenticated: true,
        user: this.currentUser,
        token: this.authToken
      }
    }
    
    return {
      isAuthenticated: false,
      user: null,
      token: null
    }
  }

  public isUserAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null
  }

  public getCurrentUser(): GitHubUser | null {
    return this.currentUser
  }

  public getAuthToken(): string | null {
    return this.authToken
  }

  public logout(): void {
    this.currentUser = null
    this.authToken = null
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_user')
  }
}
