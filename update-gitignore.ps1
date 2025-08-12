# ============================================================================
# Update .gitignore Script for Taskify Platform
# Technology Stack: React+TypeScript+Vite + .NET 9 + SQL Server
# ============================================================================

Write-Host "🔧 Updating .gitignore file for Taskify Platform..." -ForegroundColor Cyan

# Backup the current .gitignore
$gitignorePath = ".\.gitignore"
$backupPath = ".\.gitignore.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

if (Test-Path $gitignorePath) {
    Copy-Item $gitignorePath $backupPath
    Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
}

# Define the new comprehensive .gitignore content
$newGitignoreContent = @"
# ==============================================
# Taskify Platform - Comprehensive .gitignore
# Technology Stack: React+TypeScript+Vite + .NET 9 + SQL Server
# Last Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ==============================================

# ==============================================
# .NET / C# Backend (Taskify-Backend/)
# ==============================================

# Build outputs
[Bb]in/
[Oo]bj/
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Ww][Ii][Nn]32/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Tt]est[Rr]esult*/
TestResults/

# Visual Studio / VS Code
.vs/
.vscode/settings.json
.vscode/launch.json
.vscode/tasks.json
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates
*.userprefs

# .NET Core
project.lock.json
project.fragment.lock.json
artifacts/

# ASP.NET Scaffolding
ScaffoldingReadMe.txt

# StyleCop
StyleCopReport.xml

# Files built by Visual Studio
*_i.c
*_p.c
*_h.h
*.ilk
*.meta
*.obj
*.iobj
*.pch
*.pdb
*.ipdb
*.pgc
*.pgd
*.rsp
*.sbr
*.tlb
*.tli
*.tlh
*.tmp
*.tmp_proj
*_wpftmp.csproj
*.log
*.tlog
*.vspscc
*.vssscc
.builds
*.pidb
*.svclog
*.scc

# Test Coverage
[Cc]overage/
coverage.json
coverage.xml
*.coverage
*.coveragexml
*.cobertura.xml

# NuGet packages
*.nupkg
*.snupkg
**/packages/*
!**/packages/build/
*.nuget.props
*.nuget.targets

# Entity Framework
**/Migrations/[0-9]*_*.cs
**/Migrations/[0-9]*_*.Designer.cs

# ==============================================
# React + TypeScript + Vite Frontend (taskify-frontend/)
# ==============================================

# Dependencies
node_modules/
/.pnp
.pnp.js
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Build outputs
dist/
build/
.vite/
*.tsbuildinfo
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.staging

# Vite
.vite/
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

# Testing
coverage/
.nyc_output
*.lcov

# ESLint
.eslintcache

# Prettier
.prettierignore

# TypeScript
*.tsbuildinfo

# Storybook build outputs
storybook-static

# ==============================================
# Package Managers
# ==============================================

# npm
package-lock.json
.npm

# Yarn
yarn.lock
.yarn-integrity

# pnpm
pnpm-lock.yaml

# ==============================================
# Database & Docker
# ==============================================

# SQL Server data files
*.mdf
*.ldf
*.ndf
*.bak

# Docker
.dockerignore
Dockerfile.prod
docker-compose.override.yml
docker-compose.prod.yml

# ==============================================
# Development Tools & IDEs
# ==============================================

# JetBrains Rider
.idea/
*.sln.iml

# VS Code extensions
.vscode/extensions.json

# Sublime Text
*.tmlanguage.cache
*.tmPreferences.cache
*.stTheme.cache
*.sublime-workspace
*.sublime-project

# ==============================================
# Operating System Files
# ==============================================

# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
Desktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk

# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent

# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*

# ==============================================
# Security & Credentials
# ==============================================

# Secrets and API keys
secrets.json
appsettings.secrets.json
.secrets/
*.key
*.pem
.env.secrets

# Certificate files
*.pfx
*.p12
*.crt
*.cer

# ==============================================
# Application-Specific
# ==============================================

# Logs
logs/
*.log

# Temporary files
temp/
tmp/
*.tmp
*.temp

# Backup files
*.bak
*.backup
*.old

# Archive files
*.zip
*.tar.gz
*.rar

# ==============================================
# Development Artifacts
# ==============================================

# Source maps (if you don't want to include them)
*.map

# Hot reload
.hot-reload

# Cache directories
.cache/
.parcel-cache/

# Editor directories and files
.idea
*.swp
*.swo
*~

# ==============================================
# Performance and Monitoring
# ==============================================

# Profiling data
*.prof
*.trace

# Monitoring
.nyc_output

# ==============================================
# End of .gitignore
# ==============================================
"@

# Write the new .gitignore content
Set-Content -Path $gitignorePath -Value $newGitignoreContent -Encoding UTF8

Write-Host "✅ .gitignore file has been updated successfully!" -ForegroundColor Green
Write-Host "📝 Added comprehensive coverage for:" -ForegroundColor Yellow
Write-Host "   • .NET 9 / C# Backend" -ForegroundColor White
Write-Host "   • React + TypeScript + Vite Frontend" -ForegroundColor White
Write-Host "   • SQL Server databases" -ForegroundColor White
Write-Host "   • Docker containers" -ForegroundColor White
Write-Host "   • Development tools (VS Code, Rider)" -ForegroundColor White
Write-Host "   • Operating system files" -ForegroundColor White
Write-Host "   • Security and credentials" -ForegroundColor White
Write-Host "   • Package managers (npm, yarn, pnpm)" -ForegroundColor White

# Show git status to see what changed
Write-Host "`n📊 Git status after update:" -ForegroundColor Cyan
git status --porcelain .gitignore

Write-Host "`n🔍 To see the differences, run:" -ForegroundColor Magenta
Write-Host "   git diff .gitignore" -ForegroundColor White

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review the changes: git diff .gitignore" -ForegroundColor White
Write-Host "   2. Test your build: npm run dev" -ForegroundColor White
Write-Host "   3. Commit the changes: git add .gitignore && git commit -m 'Update .gitignore with comprehensive coverage'" -ForegroundColor White

Write-Host "`n✨ .gitignore update completed!" -ForegroundColor Green
