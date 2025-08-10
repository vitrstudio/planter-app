/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_PLANTER_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
