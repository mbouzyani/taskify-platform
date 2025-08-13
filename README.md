
# Taskify - Task Management Platform :

-- Local Frontend + Docker Backend --

This guide explains how to run the Taskify platform with:

- **Frontend**: React + Vite application running locally (development server)

- **Backend**: ASP.NET Core Web API running in Docker

- **Database**: SQL Server running in Docker


## Prerequisites

- Docker Desktop installed and running
- Node.js (version 16 or higher)
- PowerShell (Windows) or Bash (Linux/Mac)

## Quick Start

### Step 1: Clone Repository (URL)

'git clone https://github.com/mbouzyani/taskify-platform.git'


### Step 2: Start Backend Services (Docker)

```powershell

cd Taskify-Backend
docker-compose up --build -d
```

### Step 3: Start Frontend (Local Development)

```powershell

cd taskify-frontend
npm install
npm run dev
```
Or
Run the setup script (Windows) :

.\setup-verification.ps1

## Service URLs

After starting the services:

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:5217
- **API Documentation**: http://localhost:5217/swagger
- **Health Check**: http://localhost:5217/health

## Architecture Overview

### Frontend (Port 5173)
- Built with React + TypeScript + Vite
- Runs locally using Vite development server
- Hot module replacement enabled for fast development
- Connects directly to Docker backend API

### Backend (Port 5217)
- ASP.NET9 Core Web API running in Docker
- Clean Architecture pattern
- JWT authentication
- Entity Framework Core with SQL Server
- Swagger documentation enabled

### Database (Port 1433)
- SQL Server 2022 Express running in Docker
- Database: `TaskifyDb`
- SA Password: `Taskify2025!`
- Health checks enabled


### Database Configuration
- **SA Password**: `Taskify2025!`
- **Memory Limit**: 2GB
- **Health Checks**: Enabled with 30s intervals
- **Persistent Storage**: Named volume `sqlserver_data`

## Database Connection (SSMS)

**Connection Details:**
- Server name: `localhost,1433`
- Authentication: SQL Server Authentication
- Login: `sa`
- Password: `Taskify2025!`

## Configuration Details

### Frontend Configuration
- **Development Server**: Vite with hot module replacement
- **API URL**: `http://localhost:5217/api` (points to Docker backend)
- **Environment File**: `.env.development` contains API configuration
- **Build Tool**: Vite with TypeScript support

### Backend Configuration
- **Environment**: Development mode with detailed errors
- **CORS**: Configured to allow all origins for development
- **Database**: Connection string points to `sqlserver` container
- **JWT**: Configured with development secrets


### Networking

- **Frontend to Backend**: Direct HTTP calls to `localhost:5217`
- **Backend to Database**: Container-to-container via `sqlserver:1433`
- **Docker Network**: `taskify-network` for backend services

## Development Workflow

### Making Frontend Changes
1. Edit files in `taskify-frontend/src/`
2. Changes are automatically reflected (hot reload)
3. No rebuild required

### Making Backend Changes
1. Edit files in `Taskify-Backend/src/`
2. Rebuild backend: `docker-compose up --build taskify-api`
3. Frontend will automatically reconnect to updated API

### Database Migrations
```powershell
# Access the backend container
docker exec -it taskify-API bash

# Run migrations (if implemented)
dotnet ef database update
```

## Troubleshooting

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

### Docker Issues
```bash
# Restart containers
docker-compose down
docker-compose up --build -d

# Clean up
docker system prune -f
```

### Service Not Starting
```bash
# Check service logs
docker-compose logs [service-name]

# Example: Check backend logs
docker-compose logs taskify-api
```

### Port Issues
```bash
# Check if ports are in use
netstat -ano | findstr :5173
netstat -ano | findstr :5217

### API Connection Issues
1. Verify backend is healthy: http://localhost:5217/health
2. Check CORS configuration in `Program.cs`
3. Verify frontend API configuration in `src/config/api.ts`

### Database Connection Issues
1. Check if SQL Server container is running: `docker ps`
2. Test database connection:
   ```bash
   docker exec taskify-database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Taskify2025!" -Q "SELECT 1"
   ```

### Port Conflicts
If ports 3000, 5217, or 1433 are in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`
   

** Technology Stack:**
- **Backend**: .NET 9 + ASP.NET Core
- **Frontend**: React 18 + TypeScript 5.5 + Vite
- **Database**: SQL Server 2022 + EF Core 8
- **Architecture**: Clean Architecture + DDD + CQRS
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Authentication**: JWT Bearer tokens

** Required & Additional Technologies Used:**
- **MediatR**: CQRS pattern implementation
- **Docker**: Containerized database and API
- **Swagger/OpenAPI**: API documentation
- **xUnit + Moq + FluentAssertions**: 100% test coverage (25 unit tests)
- **Tailwind CSS**: Frontend styling
- **Lucide React**: Icon library


### **Architecture Benefits Achieved**

1. **Separation of Concerns**: Each layer has specific responsibilities
2. **Testability**: 25 unit tests with 100% controller coverage
3. **Scalability**: CQRS allows read/write optimization
4. **Maintainability**: Clean dependencies and clear boundaries
5. **Domain-Driven**: Business logic centralized in Domain layer
6. **Technology Agnostic**: Infrastructure abstracted from business logic

******************************

## Testing Strategy Overview

### Testing Architecture
The Taskify platform follows the **Test Pyramid** approach with comprehensive testing across all Clean Architecture layers.

### Test Projects Structure
- **Taskify.Domain.Tests**: Core business logic and entities
- **Taskify.Application.Tests**: CQRS handlers and use cases
- **Taskify.Infrastructure.Tests**: Data access and repositories
- **Taskify.API.Tests**: Controllers and API endpoints


### Services Under Test & Current Results

####  **Taskify.API.Tests** - Controllers Testing ( 25/25 Tests Passed)

**Services Tested:**
- **AuthController** (6 tests)
  - Login with valid/invalid credentials
  - Token refresh functionality
  - Exception handling
- **ProjectsController** (4 tests)
  - Get projects list
  - Create, update, delete projects
- **TasksController** (4 tests)
  - Get tasks with pagination
  - Create, update, delete tasks
- **DashboardController** (6 tests)
  - Dashboard data retrieval
  - Dashboard statistics
  - Overview statistics
  - Error handling scenarios
- **TeamController** (5 tests)
  - Get team members with task stats
  - Invite and remove team members
  - Individual member operations

####  **Latest Test Results** (Last Run: August 12, 2025)
``
Test Run Successful.
Total tests: 25
     Passed: 25 
     Failed: 0 
     Skipped: 0 
 Total time: 12.9 seconds
``

#### **Test Implementation Details**
- **Authentication Tests**: JWT token validation, login flows
- **CRUD Operations**: Full create, read, update, delete testing
- **Error Handling**: Exception scenarios and edge cases
- **Data Validation**: Input validation and response formatting
- **Pagination**: List operations with proper paging

#### **Test Architecture Pattern**
``csharp
// Example: Controller Testing Pattern
[Fact]
public async Task Login_WithValidCredentials_ReturnsOkWithToken()
{
    // Arrange - Setup test data and mocks
    var loginRequest = new LoginRequest { ... };
    _mediatorMock.Setup(m => m.Send(...)).ReturnsAsync(expectedResponse);

    // Act - Execute the method under test
    var result = await _controller.Login(loginRequest);

    // Assert - Verify expected behavior
    result.Should().BeOfType<OkObjectResult>();
}
``

### Testing Stack
- **xUnit 2.4.2**: Primary testing framework
- **FluentAssertions 6.12.0**: Readable assertions
- **Moq 4.20.70**: Dependency mocking
- **Coverlet**: Code coverage collection


# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific project
dotnet test tests/Taskify.API.Tests/

### Coverage Targets
- Domain Layer: 95%+ (critical business logic)
- Application Layer: 90%+ (use cases)
- API Layer: 85%+ (controllers)
- Infrastructure Layer: 80%+ (data access)


     **********  ENJOY CODING :) ***********
	 
	 
	      





