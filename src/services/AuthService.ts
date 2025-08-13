import { githubAuth } from '../auth'
import type { GitHubUser, AuthState } from '../types'

export class AuthService {
  private currentUser: GitHubUser | null = null
  private isAuthenticated = false

  async checkAuthStatus(): Promise<AuthState> {
    const authState = await githubAuth.checkAuthStatus()
    this.isAuthenticated = authState.isAuthenticated
    this.currentUser = authState.user
    return authState
  }

  initiateLogin(): void {
    githubAuth.initiateLogin()
  }

  logout(): void {
    githubAuth.logout()
    this.isAuthenticated = false
    this.currentUser = null
  }

  getCurrentUser(): GitHubUser | null {
    return this.currentUser
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated
  }

  async handleCallback(code: string, state: string): Promise<boolean> {
    return await githubAuth.handleCallback(code, state)
  }
}
