# Setup Verification Guide

This guide helps verify that the Taskify platform works correctly after git cloning on a new machine.

## Prerequisites Check

### Required Software
- [ ] Docker Desktop installed and running
- [ ] Node.js (v18 or higher) installed
- [ ] Git installed

### Port Availability
Ensure these ports are free:
- [ ] Port 1433 (SQL Server)
- [ ] Port 5217 (Backend API)
- [ ] Port 5173 (Frontend Dev Server)

## Setup Steps

### 1. Clone Repository
```bash
git clone https://github.com/mbouzyani/taskify-platform.git
cd taskify-platform
```

### 2. Start Backend Services
```bash
cd Taskify-Backend
docker-compose up --build -d
```

**Expected Output:**
- Both containers (taskify-db, taskify-api) should be running and healthy
- Admin user should be automatically created

### 3. Verify Backend Health
```bash
# Check containers are running
docker ps

# Test API health endpoint
curl http://localhost:5217/health
# Expected: "Healthy"

# Test admin login
curl -X POST "http://localhost:5217/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@taskify.com", "password": "Admin123!"}'
# Expected: JSON response with accessToken
```

### 4. Setup Frontend
```bash
cd ../taskify-frontend
npm install
npm run dev
```

**Expected Output:**
- Frontend should start on http://localhost:5173
- No compilation errors
- No NaN warnings in console

### 5. Test Complete Integration
1. Open http://localhost:5173 in browser
2. Login with: admin@taskify.com / Admin123!
3. Dashboard should load without errors
4. Charts should display properly (no NaN errors)

## Troubleshooting

If any step fails, run:
```bash
cd Taskify-Backend
./troubleshoot-taskify.ps1
```

## Success Criteria

✅ All containers running and healthy
✅ API responds to health checks
✅ Admin login works
✅ Frontend loads without errors
✅ Dashboard displays correctly
✅ No React warnings in browser console

## Database Schema Verification

The following tables should exist in TaskifyDb:
- Users (with admin user)
- Projects
- Tasks
- ActivityLogs
- UserProjects
- __EFMigrationsHistory

## Common Issues

1. **Port conflicts**: Use `netstat -ano | findstr ":5217"` to check port usage
2. **Docker permission errors**: Ensure Docker Desktop is running as administrator
3. **Build failures**: Clear Docker cache with `docker system prune -f`
4. **Frontend NaN errors**: Should be fixed with latest BarChart updates
