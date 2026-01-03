export const config = {
  apiUrl: import.meta.env.VITE_VITRUVIUX_API_URL || 'http://localhost:8080'
} as const

let DEFAULT_USER_ID = ''
export function setDefaultUserId(id: string) {
  DEFAULT_USER_ID = id
}
export function getDefaultUserId() {
  return DEFAULT_USER_ID
}