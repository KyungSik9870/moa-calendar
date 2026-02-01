# CLAUDE.md - AI & Development Context Guide

## Project Type: Full Stack Application (Kotlin/Spring Boot + React Native/TypeScript)

### 1. Persona & Goal
- **Role**: You are a **Senior Full Stack Engineer**
- **Goal**: Produce clean, maintainable, and high-performance code
- **Compliance**: Follow conventions and best practices defined below

### 2. Architecture
- **Backend**: Kotlin + Spring Boot REST API
- **Frontend**: React Native mobile application (iOS + Android)
- **Pattern**: Monorepo structure with separate backend and frontend modules

---

## 🚀 Build & Run Commands

### Backend (Spring Boot + Kotlin)

```bash
# Navigate to backend directory
cd backend

# Build the project
./gradlew clean build

# Run the application (development mode)
./gradlew bootRun

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'

# Generate QueryDSL Q-classes (if using QueryDSL)
./gradlew compileQuerydsl

# Run database migrations (if using Flyway)
./gradlew flywayMigrate
```

**Default Backend URL**: `http://localhost:8080`
**Default API Base**: `http://localhost:8080/api/v1`

### Frontend (React Native + TypeScript)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Type check
npm run type-check

# Clear cache if needed
npm start -- --reset-cache
```

---

## 🧪 Test Commands

### Backend Tests

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests "com.example.api.SomeControllerTest"

# Run tests with coverage
./gradlew test jacocoTestReport

# Run integration tests only (if configured)
./gradlew integrationTest
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ComponentName.test.tsx
```

---

## 📐 Code Style & Conventions

### Backend (Kotlin)

**Naming Conventions**:
- **Classes**: PascalCase (`UserService`, `ProductEntity`)
- **Functions**: camelCase (`createItem`, `findById`)
- **Variables**: camelCase (`userId`, `itemName`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`)
- **Packages**: lowercase (`com.example.api.controller`)

**Code Quality Tools**:
```bash
# Format code with ktlint
./gradlew ktlintFormat

# Check code style
./gradlew ktlintCheck
```

**Design Patterns**:
- Use sealed classes for domain exceptions
- Prefer `Result<T>` over throwing exceptions for expected failures
- Use data classes for DTOs
- Extension functions in separate files (e.g., `DateExtensions.kt`)

### Frontend (TypeScript/React Native)

**Naming Conventions**:
- **Components**: PascalCase (`HomeScreen`, `ModalDialog`)
- **Hooks**: camelCase with 'use' prefix (`useAuth`, `useData`)
- **Functions**: camelCase (`handleSubmit`, `formatDate`)
- **Variables**: camelCase (`isLoading`, `userData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `SCREEN_WIDTH`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)

**React Patterns**:
- Use functional components with hooks
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed as props
- **ALWAYS** add safety checks for undefined data:
```typescript
const data = useMemo(() => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }
  return apiData.map(item => ({...}));
}, [apiData]);
```

---

## 📝 Git Commit Message Style

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functional changes)
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `style`: Code formatting (no logic changes)
- `perf`: Performance improvements

### Examples

```bash
# Feature
feat(api): add pagination support to list endpoint

# Bug fix
fix(auth): resolve token refresh infinite loop

# Multiple changes
feat: improve modal UI components

InputModal improvements:
- Updated tab styling for better UX
- Improved form validation
- Added loading states

DetailModal improvements:
- Updated action buttons with proper colors
- Improved layout and spacing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Always add** Co-Authoring line for AI-assisted commits:
```
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 🏗️ Architecture Overview

### Backend Structure

```
backend/
├── api/                          # REST API Layer
│   ├── src/main/kotlin/com/example/api/
│   │   ├── controller/          # REST Controllers
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── request/        # Request DTOs
│   │   │   └── response/       # Response DTOs
│   │   ├── exception/          # Exception Handlers
│   │   └── config/             # API Configuration
│   └── build.gradle.kts
│
├── core/                        # Business Logic Layer
│   ├── src/main/kotlin/com/example/core/
│   │   ├── domain/             # Domain Models
│   │   ├── service/            # Business Services
│   │   ├── repository/         # JPA Repositories
│   │   ├── exception/          # Domain Exceptions
│   │   └── util/              # Utilities
│   └── build.gradle.kts
│
├── build.gradle.kts            # Root build configuration
└── settings.gradle.kts
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/                    # API Client Layer
│   │   ├── client.ts          # Axios instance with interceptors
│   │   └── endpoints/         # API endpoint functions
│   │
│   ├── components/            # Reusable UI Components
│   │   ├── common/           # Generic components (Button, Input, Card)
│   │   ├── modals/           # Modal dialogs
│   │   └── widgets/          # Feature-specific widgets
│   │
│   ├── screens/              # Screen Components (Routes)
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── queries/        # React Query (read operations)
│   │   ├── mutations/      # React Query (write operations)
│   │   └── useTheme.ts     # Theme hook
│   │
│   ├── navigation/          # Navigation Configuration
│   │   ├── RootNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── AuthNavigator.tsx
│   │
│   ├── store/              # Zustand Stores (Client State)
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   │
│   ├── theme/              # Theme System
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   │
│   ├── types/              # TypeScript Type Definitions
│   └── App.tsx             # Root Component
│
├── android/                # Android native code
├── ios/                    # iOS native code
└── package.json
```

---

## 🔑 Key Development Rules

### 1. API Integration
- Use real backend APIs - avoid mock data in production code
- Use React Query for all server state management
- Handle loading and error states consistently
- Add safety checks for undefined data from React Query

### 2. Error Handling
- **Backend**: Use custom sealed classes for domain exceptions
- **Frontend**: Display user-friendly error messages
- Always log errors to console for debugging
- Use `@ControllerAdvice` for centralized exception handling (backend)

### 3. Type Safety
- **Backend**: Use Kotlin data classes for type-safe DTOs
- **Frontend**: Define TypeScript interfaces for all API responses
- Never use `any` type in TypeScript
- Use Jakarta Validation (`@Valid`) at controller layer (backend)

### 4. Security
- **NEVER** commit sensitive data (.env, credentials, API keys)
- **NEVER** log passwords, tokens, or PII
- **NEVER** run destructive git commands without user permission
- Use environment variables for configuration
- Enforce HTTPS in production

### 5. Component Design (Frontend)
- Keep components small and focused (Single Responsibility)
- Prefer composition over inheritance
- Use proper prop types and validation
- Avoid over-engineering - implement only what's requested

### 6. State Management (Frontend)
- **Server State**: React Query (all API data)
- **Client State**: Zustand (theme, auth tokens, UI state)
- **NEVER** store server data in Zustand
- Clear distinction between server and client state

### 7. Performance
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed as props
- Implement pagination for large lists
- Add database indexes for foreign keys and frequently queried fields

### 8. Testing
- Write unit tests for business logic
- Write integration tests for API endpoints
- Write component tests for UI components
- Aim for meaningful coverage, not just high numbers

---

## 🐛 Common Issues & Solutions

### Backend Issues

**Issue**: QueryDSL Q-classes not generated
**Solution**: Run `./gradlew compileQuerydsl`

**Issue**: Database connection failed
**Solution**: Check database is running and credentials in `application.yml`

**Issue**: JPA lazy loading exception
**Solution**: Use `@Transactional` or fetch join in query

### Frontend Issues

**Issue**: Metro bundler cache issues
**Solution**:
```bash
npm start -- --reset-cache
```

**Issue**: "cannot read map of undefined" errors
**Solution**: Add safety checks:
```typescript
const data = useMemo(() => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }
  return apiData.map(item => ({...}));
}, [apiData]);
```

**Issue**: Modal not appearing
**Solution**:
- Check modal `visible` prop is set correctly
- Ensure proper z-index/styling
- Check if modal is inside correct View hierarchy

**Issue**: React Query returns undefined
**Solution**: Query with `enabled` condition returns undefined when disabled. Always add safety checks.

---

## 📚 Technology Stack

### Backend
- **Language**: Kotlin 1.9+
- **Framework**: Spring Boot 4.0
- **Database**: MySQL 8.0, Redis
- **Persistence**: Spring Data JPA, QueryDSL
- **Build Tool**: Gradle (Kotlin DSL)
- **Authentication**: Spring Security, JWT, OAuth2

### Frontend
- **Language**: TypeScript 5.0+
- **Framework**: React Native 0.74+
- **State Management**:
  - TanStack Query (React Query) v5 for server state
  - Zustand for client state
- **Navigation**: React Navigation 6.x
- **HTTP Client**: Axios with interceptors
- **Styling**: React Native StyleSheet with typed theme system
- **Date Handling**: date-fns
- **Form Validation**: react-hook-form + zod

---

## 🎯 Quick Reference

### Start Development (Both Backend & Frontend)

```bash
# Terminal 1 - Backend
cd backend && ./gradlew bootRun

# Terminal 2 - Frontend Metro
cd frontend && npm start

# Terminal 3 - Run on device
cd frontend && npm run ios  # or npm run android
```

### Before Committing

```bash
# Backend
./gradlew ktlintFormat
./gradlew test

# Frontend
npm run type-check
npm test
```

### Common Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-new-feature

# Make changes and commit
git add .
git commit -m "feat(scope): add new feature

- Detailed description of changes
- Additional improvements made

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to remote
git push origin feature/add-new-feature
```

---

## 📋 API Design Principles

- **RESTful**: Resource-oriented URLs, proper HTTP methods
- **Versioning**: `/api/v1/...` prefix for all endpoints
- **Response Format**: Consistent JSON structure with standard error codes
- **Authentication**: JWT-based token authentication
- **Authorization**: Role-based or resource-based permissions

---

## 🗄️ Database Guidelines

- **Migrations**: Use Flyway or Liquibase for version control
- **Naming**: snake_case for tables and columns
- **Indexes**: Add indexes for foreign keys and frequently queried fields
- **Soft Delete**: Use `deleted_at` timestamp when needed

---

## 📊 Logging Policy

- **Framework**: SLF4J + Logback (Backend), Console (Frontend)
- **Levels**:
  - `ERROR`: System failures, unhandled exceptions
  - `WARN`: Business logic violations, deprecated usage
  - `INFO`: Key business events
  - `DEBUG`: Detailed flow for troubleshooting (dev/staging only)
- **Sensitive Data**: NEVER log passwords, tokens, or PII
- **Format**: Include timestamp, level, logger name, thread, message

---

## 📖 Additional Resources

- **Project Requirements**: See `docs/REQUIREMENTS.md`
- **API Documentation**: See `docs/API_EXAMPLES.md`
- **Design Specs**: See `docs/DESIGN.md`
- **Technical Details**: See `SKILLS.md`
- **Code Style Rules**: See `rules/` folder

---

**Last Updated**: 2026-02-01
**Maintained By**: Development Team + AI Assistant
