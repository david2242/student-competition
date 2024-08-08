# Student Competition
Student Competition app is created for schools, where school employees can track the competition results achieved by students.

This is an nx monorepo project, which contains the following applications:
- frontend: Angular application
- backend: .NET Core Web API application

## Development
### Running the backend API:
`nx serve backend`

### Running the frontend application:
`nx serve frontend`

### Building the image
from the root directory run the following command:
`./workspace/ci/image_creator.ps1`

### Running the app in docker
Docker compose file is created to run the backend in docker.
First, build the image (see above).

Then run the following command in the ./workspace/ci folder to start the backend in docker:
`docker-compose up`

This command does the following:
- starts a Microsoft SQL Server
- attaches a volume to the SQL Server to persist the data
- seeds the database with the initial data
- starts the backend API
- seeds the database with the initial authentication related tables
- creates a user with the following credentials:
  - username: admin
  - password: Admin123!
- the backend API is available at http://localhost:5157/api/Competition

### Swagger
http://localhost:5157/swagger/index.html
