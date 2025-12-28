export type ProjectType = 'ECOMMERCE' | 'BLOG' | 'PORTFOLIO' | 'UNKNOWN'

export interface ProjectInfra {
  is_api_running: boolean
  is_database_running: boolean
  is_application_bucket_created: boolean
}

export interface User {
  id: string
  github_user_id: number
  aws_account_id?: string
  aws_account_enabled: boolean
  avatar_url: string
  name: string
  created_at: number
}

export interface Project {
  id: string
  name: string
  github_repository_id: number
  type: ProjectType
  infra?: ProjectInfra
  created_at: number
  user: User
}

export interface CreateProjectRequest {
  name: string
  type: ProjectType
}

export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  name: string
  email?: string
}

export interface SessionResponse {
  userId: string
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: GitHubUser | null
  token: string | null
  userId: string | null
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export type AwsStatus = 'loading' | 'not_configured' | 'connected' | 'needs_attention'

export interface AwsIntegration {
  status: AwsStatus
  accountId?: string
  roleArn?: string
  externalId?: string
  defaultRegion?: string
  lastHealthCheck?: string
  permissions?: string[]
  resourceCounts?: {
    s3Buckets: number
    ec2Instances: number
    rdsDatabases: number
  }
}

export interface AwsIntegrationRequest {
  accountId: string
  roleArn: string
  externalId?: string
  defaultRegion: string
}
