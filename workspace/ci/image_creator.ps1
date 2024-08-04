cd workspace
nx build frontend
Copy-Item -Path "dist/apps/frontend/browser/**.*" -Destination "apps/backend/wwwroot" -Recurse -Force
cd ..
docker build -t student-competition:latest -f workspace/ci/Dockerfile .
