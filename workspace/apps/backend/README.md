# Backend Application: Student Competition

This application serves as the backend for the Student Competition management system. It provides API endpoints for managing students, competitions, and user authentication.

## Project Overview
The backend is an ASP.NET Core 8 Web API that manages student information, competition participation, and user authentication. It uses PostgreSQL as the primary data store and follows best practices for security and performance.

## Tech Stack
- **Framework**: .NET 8 (ASP.NET Core)
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core 8
- **Authentication**: ASP.NET Core Identity with Cookie-based authentication.
- **Mapping**: AutoMapper for DTO-Model transformations.
- **Environment Management**: `DotNetEnv` for loading `.env` files.
- **Documentation**: Swagger/OpenAPI (Swashbuckle).

## Architecture & Patterns
The project follows a modular architecture using the **Controller-Service-DTO** pattern:
- **Controllers**: Handle HTTP requests, manage routing, and return DTOs or ActionResults.
- **Services**: Contain business logic and interact with the data layer. Interfaces (e.g., `IStudentService`) are used for dependency injection.
- **DTOs (Data Transfer Objects)**: Used for data exchange between the API and clients, ensuring internal models are not exposed directly.
- **Models**: EF Core entities representing the database schema.
- **Data Layer**: `DataContext` (inheriting from `IdentityDbContext`) manages database interactions.

## Key Directory Structure
- `/Controllers`: API endpoints (e.g., `StudentsController`, `CompetitionController`).
- `/Services`: Business logic implementation (e.g., `StudentService`).
- `/Dtos`: Data transfer objects categorized by feature.
- `/Models`: Entity types and database models.
- `/Data`: `DataContext` and database-specific configurations.
- `/Migrations`: EF Core database migrations.
- `/Exceptions`: Custom exception types for business logic errors.

## Core Configurations
- **Program.cs**: Main entry point. Configures DI, Identity, CORS, Swagger, and database migrations on startup.
- **AutoMapperProfile.cs**: Configures mappings between entities and DTOs.
- **Identity**: Configured with strict password requirements and unique emails. Cookies are set with `HttpOnly`, `SecurePolicy.Always`, and `SameSiteMode.None` for cross-origin support.
- **CORS**: Allows specific origins (`localhost:4200`, `localhost:3000`) with credentials.

## Testing
The codebase is covered by a comprehensive suite of unit tests.

- **Test Project**: `workspace/apps/backend-test/Workspace.Backend.Test.csproj`
- **Frameworks**: NUnit, Moq (for mocking), and FluentAssertions (for readable assertions).
- **Base Class**: `Workspace.Backend.Test.Infrastructure.TestBase<T>` provides common setup for `AutoMapper` and Logging mocks.

### Running Tests
To run the backend tests, use the following command from the project root:
```powershell
dotnet test workspace/apps/backend-test/Workspace.Backend.Test.csproj
```

### Coverage
Tests cover the following areas:
- **Services**: Business logic in `StudentService`, `CompetitionService`, `UserService`, and `AuthService`.
- **Logic**: String similarity algorithms and other utility functions.
- **Mapping**: Correctness of `AutoMapper` profiles.

## Development Patterns
- **Async/Await**: Used consistently throughout services and controllers for non-blocking I/O.
- **Global Usings**: Common namespaces are defined as global usings where appropriate.
- **Database Initialization**: `DatabaseInitializerService` is used for seeding initial data (roles, admin users).
- **Environment Variables**: Crucial secrets and configurations (DB connection, Swagger toggle) are managed via environment variables.

## Common Tasks
- **Adding a Migration**: `dotnet ef migrations add <Name> --project workspace/apps/backend`
- **Updating Database**: Handled automatically on application startup.
- **Adding a Service**: Define an interface in the service folder, implement it, and register it in `Program.cs`.
