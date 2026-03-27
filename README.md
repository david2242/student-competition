# Student Competition
Student Competition app is created for schools, where school employees can track the competition results achieved by students.

This is an nx monorepo project, which contains the following applications:
- frontend: Angular application
- backend: .NET Core Web API application

## Prerequisites
- .NET sdk (e.g.: `winget install Microsoft.DotNet.SDK.8`)
- Node.js (e.g.: `winget install -e --id OpenJS.NodeJS`)
- In `./workspace/` `npm install`

## Development

### Local Development Flow
For the best development experience, you can run the backend and frontend locally while using a Dockerized Postgres database.

1. **Start the database:**
   In the `./workspace/ci` folder, run:
   ```bash
   docker-compose up postgres
   ```

2. **Run the backend API:**
   In the root directory, run:
   ```bash
   nx serve backend
   ```
   The backend will be available at [http://localhost:5000](http://localhost:5000) (Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger)).

3. **Run the frontend application:**
   In the root directory, run:
   ```bash
   nx serve frontend
   ```
   The frontend will be available at [http://localhost:4200](http://localhost:4200). Requests starting with `/api` are automatically proxied to the local backend.

### Running Tests
Both frontend and backend have automated tests.

#### Backend
From the root directory, run:
```powershell
dotnet test workspace/apps/backend-test/Workspace.Backend.Test.csproj
```
For more advanced testing options (like filtering for integration tests), see the [Backend README](./workspace/apps/backend/README.md#running-tests).

#### Frontend
From the root directory, run:
```bash
nx test frontend
```

### Full Containerized Deployment (Frontend hosted in Backend)
This method creates a production-ready image where the Angular frontend is built and placed into the `.NET` `wwwroot` folder, being served directly by the backend.

1. **Building the image:**
   From the root directory, run:
   ```powershell
   ./workspace/ci/image_creator.ps1
   ```

2. **Running the full stack:**
   In the `./workspace/ci` folder, run:
   ```bash
   docker-compose up
   ```

This command does the following:
- Starts a PostgresSQL Server with a persistent volume.
- Seeds the database and creates a default admin user:
  - **Username:** `admin`
  - **Password:** `Admin123!`
- Starts the backend container (which hosts the frontend).
- **Access Points:**
  - **Frontend:** [http://localhost:8080](http://localhost:8080)
  - **Backend API:** [http://localhost:8080/competition](http://localhost:8080/competition)
  - **Swagger:** [http://localhost:8080/swagger](http://localhost:8080/swagger)

## CI/CD & Environments

### Branch Strategy
| Branch | Triggers | Environment |
|---|---|---|
| `feature/*` | Tests run on push | — |
| `develop` | Full deploy pipeline | **ref** (staging) |
| `main` | Full deploy pipeline | **prod** |

PRs should target `develop`. After validation on ref, merge `develop` → `main` to deploy to prod.

### Live Environments
| Environment | URL | Notes |
|---|---|---|
| Production | [gimisapp.otthonkapocs.hu](https://gimisapp.otthonkapocs.hu) | Swagger disabled |
| Ref (staging) | [gimisapp-ref.otthonkapocs.hu](https://gimisapp-ref.otthonkapocs.hu) | Swagger enabled at `/swagger` |

### Pipeline
Each deploy pipeline runs:
1. **Tests** — NUnit (backend) + Jest (frontend), parallel on GitHub-hosted runners
2. **Build** — Docker image built and pushed to GHCR (`ghcr.io/david2242/student-competition`)
3. **Deploy** — Self-hosted runner on LXC 101 pulls image and runs `docker compose up -d`

DB migrations run automatically on container startup via EF Core `Migrate()`.

### Adding a New Environment Variable
1. Add it to `workspace/ci/.env.template` (and `workspace/apps/backend/.env.template` if needed)
2. SSH to LXC 101 and update `/opt/student-competition/.env.prod` and/or `.env.ref`
3. The next deploy will pick it up

### Viewing Logs (SSH to LXC 101)
```bash
docker compose -p prod logs -f   # prod
docker compose -p ref logs -f    # ref
```
