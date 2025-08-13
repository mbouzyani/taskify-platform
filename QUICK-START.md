# 🚀 Quick Setup Guide for New Machine

## Prerequisites
- Docker Desktop installed and running
- Node.js (version 16 or higher)
- .NET 9 SDK
- PowerShell (Windows) or Bash (Linux/Mac)

## Quick Start (3 Steps)

### Step 1: Clone Repository
```bash
git clone https://github.com/mbouzyani/taskify-platform.git
cd taskify-platform
```

### Step 2: Run Setup Verification (Windows)
```powershell
.\setup-verification.ps1
```

### Step 3: Start Frontend Development Server
```bash
cd taskify-frontend
npm run dev
```

## Service URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5217
- **Swagger Documentation**: http://localhost:5217/swagger
- **Health Check**: http://localhost:5217/health

## Login Credentials
- **Email**: admin@taskify.com
- **Password**: Admin123!

## Troubleshooting
If setup fails, check the main README.md for detailed troubleshooting steps.
