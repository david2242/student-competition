# Use the official .NET Core SDK as a parent image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY workspace/apps/backend/Workspace.Backend.csproj ./
RUN dotnet restore

COPY workspace/apps/backend .

RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

EXPOSE 5127
ENV ASPNETCORE_URLS=http://+:5157

# Start the application
ENTRYPOINT ["dotnet", "Workspace.Backend.dll"]
