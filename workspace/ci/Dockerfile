# Use the official .NET Core SDK as a parent image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Copy and build the Angular frontend
COPY workspace/ /workspace/
WORKDIR /workspace
RUN npm install
RUN npx nx build frontend
RUN mkdir -p /workspace/apps/backend/wwwroot
RUN cp -r /workspace/dist/apps/frontend/browser/* /workspace/apps/backend/wwwroot/

# Copy and build the .NET backend
WORKDIR /app
COPY workspace/apps/backend/Workspace.Backend.csproj ./
RUN dotnet restore
COPY workspace/apps/backend .
RUN dotnet publish -c Release -o out

# Use the official .NET Core runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

EXPOSE 5127
ENV ASPNETCORE_URLS=http://+:5157

# Start the application
ENTRYPOINT ["dotnet", "Workspace.Backend.dll"]
