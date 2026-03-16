# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack school competition tracking system — Angular 18 frontend + ASP.NET Core 8 backend in an Nx monorepo. The working root for all commands is `workspace/`.

## Commands

All frontend commands run from the `workspace/` directory:

```bash
# Frontend
npx nx serve frontend              # Dev server at localhost:4200
npx nx build frontend
npx nx test frontend               # Run all tests
npx nx test frontend --testFile=path/to/spec.ts  # Single test file
npx nx test frontend --watch
npx nx lint frontend

# Backend
dotnet run --project apps/backend
dotnet test apps/backend-test/Workspace.Backend.Test.csproj
dotnet test apps/backend-test/Workspace.Backend.Test.csproj --filter "Category!=Integration"

# Docker (from workspace/ci/)
docker-compose up postgres         # Start DB only
docker-compose up                  # Full stack
```

Default admin credentials (seeded by `DatabaseInitializerService`): `admin` / `Admin123!`

Frontend proxies `/api/*` to `http://localhost:5000` via `proxy.conf.js`.

## Architecture

### Monorepo Layout
```
workspace/
├── apps/
│   ├── frontend/          # Angular 18 app
│   ├── backend/           # ASP.NET Core 8 API
│   ├── backend-test/      # NUnit test suite
│   └── frontend-e2e/      # Cypress tests
└── ci/                    # Docker configs
```

### Frontend (`workspace/apps/frontend/src/app/`)

**Angular 18 standalone components**, no NgModules. Key directories:

- `components/pages/` — Route-level features: `competition/`, `user/`, `welcome/`
- `components/shared/` — Reusable components: `error-message`, `loading-spinner`, `student-form`, `student-search`
- `services/` — API services: `auth`, `competition`, `student`, `user`, `notification`, `role-translator`
- `models/` — TypeScript interfaces: `competition.model.ts`, `student.model.ts`, `server-response.ts`, `current-user.ts`
- `core/` — HTTP interceptors (`unauthorizedInterceptor`)
- `guards/` — `adminGuard` for protected routes

**State management**: RxJS `BehaviorSubject` in services (`AuthService.$isLoggedIn`, `AuthService.$currentUser`). Components use `async` pipe or direct subscriptions.

**HTTP pattern**: All API calls return `ServerResponse<T>`. Use `handleBackendResponse<T>()` operator (in `server-response.ts`) for unified error handling.

**Competition editor** (`components/pages/competition/competition-editor/`): Recently underwent a 5-phase refactor into composed sub-components (field, checkbox, date, select, result, header, list). A `CompetitionFormService` manages form state.

### Backend (`workspace/apps/backend/`)

Layered Controller → Service → DTO architecture:

- `Controllers/` — HTTP endpoints: `Auth`, `Competition`, `Students`, `User`
- `Services/` — Business logic per domain
- `Dtos/` — Feature-based DTOs (no direct entity exposure)
- `Models/` — EF Core entities
- `Data/` — `DbContext` + migrations
- `AutoMapperProfile.cs` — All entity↔DTO mappings in one place
- `Extensions/` — DI registrations for database, identity, CORS, Swagger

**Auth**: Cookie-based via ASP.NET Identity. CORS allows `localhost:4200` and `localhost:3000`.

### Testing

**Frontend (Jest + jest-preset-angular)**: Test files colocated as `*.spec.ts`. Coverage output to `coverage/apps/frontend`.

**Backend (NUnit + Moq + FluentAssertions)**: Tests in `apps/backend-test/`. Integration tests are tagged `[Category("Integration")]` and require a running database.

## Key Libraries

| Purpose | Library |
|---------|---------|
| Data tables | ag-Grid Angular 33 |
| Date picker | Flatpickr + angularx-flatpickr |
| Notifications | ngx-toastr |
| UI | Bootstrap 5.3 + Bootstrap Icons |
| ORM | Entity Framework Core 8 (Npgsql provider) |
| Mapping | AutoMapper 12 |

## TypeScript Path Alias

`@/*` maps to `src/*` in the frontend app.
