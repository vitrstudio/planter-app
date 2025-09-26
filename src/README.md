# Planter App - Source Code Organization

This directory contains the organized source code for the Planter App, following a clean architecture pattern.

## Directory Structure

### `/components`
UI components that handle rendering and user interface logic:
- `Login.ts` - Login form and authentication UI
- `Header.ts` - Application header with user info and logout
- `Projects.ts` - Projects list and project creation form
- `App.ts` - Main application container and routing
- `index.ts` - Centralized exports for all components

### `/services`
Business logic and data management:
- `ProjectService.ts` - Handles project CRUD operations
- `AuthService.ts` - Manages authentication state and flow
- `index.ts` - Centralized exports for all services

### `/types`
TypeScript type definitions and interfaces:
- `index.ts` - All application types, interfaces, and classes

### `/utils`
Helper functions and utilities:
- `index.ts` - Common utility functions like date formatting and error display

### `/config`
Configuration and environment settings:
- `config.ts` - API URLs and application configuration

## Key Benefits of This Organization

1. **Separation of Concerns**: UI logic is separated from business logic
2. **Reusability**: Components and services can be easily reused
3. **Maintainability**: Clear structure makes code easier to maintain
4. **Testability**: Services can be easily unit tested
5. **Scalability**: Easy to add new features without cluttering existing code

## Import Patterns

```typescript
// Import components
import { renderLogin, renderApp } from './components'

// Import services
import { ProjectService, AuthService } from './services'

// Import types
import type { Project, User } from './types'

// Import utilities
import { formatDate, showError } from './utils'
```
