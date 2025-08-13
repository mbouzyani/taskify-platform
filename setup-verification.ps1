# Taskify Platform - New Machine Setup Verification Script
# Run this script to verify the setup works correctly on a new machine

Write-Host "Taskify Platform Setup Verification" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check prerequisites
Write-Host "`nChecking Prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker not installed or not running" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not installed" -ForegroundColor Red
    exit 1
}

# Check .NET
try {
    $dotnetVersion = dotnet --version
    Write-Host "[OK] .NET: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] .NET SDK not installed" -ForegroundColor Red
    exit 1
}

Write-Host "`nStarting Backend Services..." -ForegroundColor Yellow
Set-Location "Taskify-Backend"

# Build and start Docker containers
Write-Host "Building and starting Docker containers..."
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend services started successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start backend services" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to be ready..."
Start-Sleep 30

# Check if API is responding
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5217/health" -TimeoutSec 10
    Write-Host "[OK] Backend API is healthy" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Backend API health check failed, but this might be normal on first run" -ForegroundColor Yellow
}

# Move to frontend directory
Set-Location "../taskify-frontend"

Write-Host "`nSetting up Frontend..." -ForegroundColor Yellow

# Install frontend dependencies
Write-Host "Installing npm dependencies..."
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5217" -ForegroundColor Cyan
Write-Host "Swagger UI: http://localhost:5217/swagger" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:5217/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start frontend development server:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan

# Return to root directory
Set-Location ".."
