# Use the official .NET 9 runtime as base
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN groupadd -r taskify && useradd -r -g taskify taskify

EXPOSE 8080

# Use .NET 9 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["src/Taskify.API/Taskify.API.csproj", "src/Taskify.API/"]
COPY ["src/Taskify.Application/Taskify.Application.csproj", "src/Taskify.Application/"]
COPY ["src/Taskify.Domain/Taskify.Domain.csproj", "src/Taskify.Domain/"]
COPY ["src/Taskify.Infrastructure/Taskify.Infrastructure.csproj", "src/Taskify.Infrastructure/"]

RUN dotnet restore "src/Taskify.API/Taskify.API.csproj"

# Copy all source code
COPY . .
WORKDIR "/src/src/Taskify.API"

# Build the application
RUN dotnet build "Taskify.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Taskify.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Copy published files
COPY --from=publish /app/publish .

# Set ownership and switch to non-root user
RUN chown -R taskify:taskify /app
USER taskify

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Taskify.API.dll"]
