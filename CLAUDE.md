# CLAUDE.md - Moa Calendar Project Context

## Project Overview

**Name**: Moa Calendar (모아 캘린더)
**Type**: Full Stack Mobile Application
**Purpose**: Shared calendar with integrated ledger for personal and joint asset management

## Tech Stack

### Backend
- **Language**: Kotlin 1.9+
- **Framework**: Spring Boot 4.0
- **Database**: MySQL 8.0, Redis
- **ORM**: Spring Data JPA, QueryDSL
- **Build**: Gradle (Kotlin DSL)
- **Auth**: Spring Security, JWT, OAuth2

### Frontend
- **Language**: TypeScript 5.0+
- **Framework**: React Native 0.74+
- **Server State**: TanStack Query v5
- **Client State**: Zustand 4.5+
- **Navigation**: React Navigation 6.x
- **HTTP**: Axios
- **Forms**: react-hook-form + zod
- **Dates**: date-fns

## Quick Commands

```bash
# Backend
cd backend && ./gradlew clean build    # Build
cd backend && ./gradlew bootRun        # Run dev server
cd backend && ./gradlew test           # Run tests
cd backend && ./gradlew ktlintFormat   # Format code

# Frontend
cd frontend && npm install             # Install deps
cd frontend && npm start               # Start Metro
cd frontend && npm run ios             # Run iOS
cd frontend && npm run android         # Run Android
cd frontend && npm test                # Run tests
cd frontend && npm run type-check      # Type check
```

## Architecture

```
moa-calendar/
├── backend/
│   ├── api/                    # REST Controllers, DTOs
│   │   └── src/main/kotlin/com/moa/api/
│   │       ├── controller/     # REST endpoints
│   │       ├── dto/request/    # Request DTOs
│   │       ├── dto/response/   # Response DTOs
│   │       └── config/         # API config
│   └── core/                   # Business Logic
│       └── src/main/kotlin/com/moa/core/
│           ├── domain/         # Entities
│           ├── service/        # Business services
│           ├── repository/     # JPA repos
│           └── exception/      # Domain exceptions
├── frontend/
│   └── src/
│       ├── api/                # Axios client, endpoints
│       ├── components/         # UI components
│       ├── screens/            # Screen components
│       ├── hooks/queries/      # React Query hooks
│       ├── hooks/mutations/    # Mutation hooks
│       ├── store/              # Zustand stores
│       ├── navigation/         # Navigation config
│       └── types/              # TypeScript types
└── docs/                       # Requirements docs
```

## Domain Model

### Core Entities
- **User**: id, email, nickname, color_code
- **Group**: id, name, type (PERSONAL/SHARED), budget_start_day
- **Schedule**: id, group_id, user_id, title, date, type (PERSONAL/JOINT)
- **Transaction**: id, amount, category, asset_type (PERSONAL/JOINT), schedule_id (nullable)

### Key Business Rules
1. Each user gets a personal calendar on signup
2. Groups can have max 10 members
3. Host can invite members via email search
4. Joint transactions are visible to all group members
5. Personal transactions can be filtered by member

## Coding Standards

### Naming
| Type | Backend (Kotlin) | Frontend (TS) |
|------|------------------|---------------|
| Class/Component | PascalCase | PascalCase |
| Function | camelCase | camelCase |
| Variable | camelCase | camelCase |
| Constant | UPPER_SNAKE | UPPER_SNAKE |
| Package/Dir | lowercase | kebab-case |

### Patterns
- Backend: Sealed classes for exceptions, Result<T> for expected failures
- Frontend: Functional components, React Query for server state, Zustand for client state
- Always add undefined checks for React Query data

### Git Commits
```
<type>(<scope>): <subject>

Co-Authored-By: Claude <model>
```
Types: feat, fix, refactor, docs, test, chore, style, perf

## Critical Rules

1. **NEVER** commit .env, credentials, or API keys
2. **NEVER** use `any` type in TypeScript
3. **NEVER** store server data in Zustand (use React Query)
4. **ALWAYS** add safety checks for undefined data from queries
5. **ALWAYS** use @Valid for request validation in controllers
6. **ALWAYS** invalidate queries after mutations

## API Design

- Base: `/api/v1/{resource}`
- Auth endpoints: `/api/v1/auth/*`
- Group endpoints: `/api/v1/groups/*`
- Schedule/Transaction under groups: `/api/v1/groups/{id}/schedules`

## Resources

- Requirements: `docs/REQUIREMENTS.md`
- Detailed specs: `docs/REQUIREMENTS_DETAIL.md`
- User scenarios: `docs/REQUIREMENTS_SCENARIO.md`
- Technical patterns: `SKILLS.md`
