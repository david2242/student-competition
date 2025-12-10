FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

COPY workspace/ /workspace/
WORKDIR /workspace
RUN npm install
RUN npx nx build frontend --skip-nx-cache
RUN mkdir -p /workspace/apps/backend/wwwroot

WORKDIR /app
COPY workspace/apps/backend/Workspace.Backend.csproj ./
RUN dotnet restore
COPY workspace/apps/backend .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./
COPY --from=build /workspace/dist/apps/frontend/browser/ /app/wwwroot/
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

ENTRYPOINT ["dotnet", "Workspace.Backend.dll"]
