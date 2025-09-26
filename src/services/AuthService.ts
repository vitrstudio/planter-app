import { config } from '../config'
import type { GitHubUser, AuthState, SessionResponse } from '../types'

export class AuthService {
  private currentUser: GitHubUser | null = null
  private authToken: string | null = null
  private userId: string | null = null

  constructor() {
    this.loadStoredAuth()
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('github_token')
    const userData = localStorage.getItem('github_user')
    const userId = localStorage.getItem('user_id')
    
    if (token && userData && userId) {
      try {
        this.authToken = token
        this.currentUser = JSON.parse(userData) as GitHubUser
        this.userId = userId
      } catch {
        this.logout()
      }
    }
  }

  public async initiateLogin(): Promise<void> {
    try {
      // Call backend to get GitHub OAuth URL
      const response = await fetch(`${config.apiUrl}/auth/github/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initiate GitHub OAuth')
      }

      const data = await response.json()
      
      // Redirect to GitHub OAuth
      window.location.href = data.auth_url
    } catch (error) {
      console.error('Failed to initiate GitHub OAuth:', error)
      throw error
    }
  }

  public async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      console.log('Handling OAuth callback with code:', code ? 'present' : 'missing', 'state:', state ? 'present' : 'missing')
      
      // Exchange code for token via backend
      const response = await fetch(`${config.apiUrl}/auth/github/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const sessionData = await response.json()
      console.log('Received session data (full):', sessionData)
      
      // Check if the response has the expected structure (backend uses snake_case)
      if (!sessionData.user_id || !sessionData.access_token) {
        console.error('Invalid session response structure:', sessionData)
        throw new Error('Invalid session response from backend')
      }
      
      // Store authentication data (backend uses snake_case)
      this.authToken = sessionData.access_token
      this.userId = sessionData.user_id
      
      localStorage.setItem('github_token', sessionData.access_token)
      localStorage.setItem('user_id', sessionData.user_id)
      localStorage.setItem('refresh_token', sessionData.refresh_token)
      
      console.log('Stored auth data, now fetching user data...')
      
      // Fetch user data using the access token
      await this.fetchUserData()
      
      console.log('Successfully completed OAuth callback')
      return true
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error)
      return false
    }
  }

  private async fetchUserData(): Promise<void> {
    console.log('fetchUserData called. Token:', !!this.authToken, 'UserId:', this.userId)
    
    if (!this.authToken || !this.userId) {
      console.error('Missing auth data - Token:', !!this.authToken, 'UserId:', this.userId)
      throw new Error('No access token or user ID available')
    }

    try {
      console.log('Fetching user data from:', `${config.apiUrl}/users/${this.userId}`)
      const response = await fetch(`${config.apiUrl}/users/${this.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })

      console.log('User data response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch user data. Status:', response.status, 'Response:', errorText)
        throw new Error(`Failed to fetch user data: ${response.status}`)
      }

      const userData = await response.json()
      console.log('Received user data:', userData)
      this.currentUser = userData
      localStorage.setItem('github_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      throw error
    }
  }

  public async validateToken(): Promise<boolean> {
    if (!this.authToken || !this.userId) {
      return false
    }

    try {
      const response = await fetch(`${config.apiUrl}/users/${this.userId}`, {
        method: 'GET',
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
    console.log('Checking auth status. Token:', !!this.authToken, 'UserId:', !!this.userId, 'User:', !!this.currentUser)
    
    if (this.authToken && this.userId) {
      // If we have token and userId but no user data, fetch it
      if (!this.currentUser) {
        console.log('No user data found, fetching...')
        try {
          await this.fetchUserData()
          console.log('Successfully fetched user data')
        } catch (error) {
          console.error('Failed to fetch user data during auth check:', error)
          this.logout()
          return { isAuthenticated: false, user: null, token: null, userId: null }
        }
      }
      
      // Validate token with backend
      console.log('Validating token...')
      const isValid = await this.validateToken()
      if (!isValid) {
        console.log('Token validation failed, logging out')
        this.logout()
        return { isAuthenticated: false, user: null, token: null, userId: null }
      }
      
      console.log('User is authenticated')
      return {
        isAuthenticated: true,
        user: this.currentUser,
        token: this.authToken,
        userId: this.userId
      }
    }
    
    console.log('User is not authenticated')
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      userId: null
    }
  }

  public isUserAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null && this.userId !== null
  }

  public getCurrentUser(): GitHubUser | null {
    return this.currentUser
  }

  public getAuthToken(): string | null {
    return this.authToken
  }

  public getUserId(): string | null {
    return this.userId
  }

  public logout(): void {
    this.currentUser = null
    this.authToken = null
    this.userId = null
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_user')
    localStorage.removeItem('user_id')
    localStorage.removeItem('refresh_token')
  }
}
