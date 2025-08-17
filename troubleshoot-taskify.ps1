# Check if required ports are in use
Write-Host 'Checking for port conflicts...'
$ports = @(5173, 5217, 1433)
foreach ($port in $ports) {
    netstat -ano | findstr ":$port"
}

# Check if Docker containers are running
Write-Host 'Checking Docker containers...'
docker ps

# Check backend health endpoint
Write-Host 'Checking backend health...'
try {
    Invoke-WebRequest -Uri 'http://localhost:5217/health' -UseBasicParsing
} catch {
    Write-Host 'Backend health endpoint not reachable.'
}


# Check SQL Server container health status
Write-Host 'Checking SQL Server container health status...'
$dbStatus = docker inspect --format='{{.State.Health.Status}}' taskify-database 2>$null
if ($dbStatus) {
    Write-Host "SQL Server container health: $dbStatus"
    if ($dbStatus -ne 'healthy') {
        Write-Host 'SQL Server is not healthy. Check Docker logs for details.'
    }
} else {
    Write-Host 'SQL Server container not found.'
}

# Check frontend API config
Write-Host 'Checking frontend API config...'
Get-Content ./taskify-frontend/.env.development | Select-String 'VITE_API_URL'
