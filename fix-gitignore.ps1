# Taskify Platform - Essential GitIgnore Fix Script
# This script fixes .gitignore to track critical deployment files

Write-Host "Fixing .gitignore for deployment readiness..." -ForegroundColor Yellow

# Read current gitignore
$gitignorePath = ".gitignore"
$content = Get-Content $gitignorePath

# Find and update the migration section
$newContent = @()
$inMigrationSection = $false
$migrationSectionAdded = $false

foreach ($line in $content) {
    if ($line -match "# \.NET Core Entity Framework Migrations" -or $line -match "\*\*/Migrations/\[0-9\]") {
        if (-not $migrationSectionAdded) {
            # Add the corrected migration section
            $newContent += "# .NET Core Entity Framework Migrations"
            $newContent += "**/Migrations/[0-9]*_*.cs"
            $newContent += "**/Migrations/[0-9]*_*.Designer.cs"
            $newContent += ""
            $newContent += "# Exception: Track essential migration files for deployment"
            $newContent += "!**/Migrations/*InitialCreate*.cs"
            $newContent += "!**/Migrations/*InitialCreate*.Designer.cs"
            $migrationSectionAdded = $true
        }
        # Skip original migration lines
        if ($line -match "\*\*/Migrations/") {
            continue
        }
    }
    
    # Add all other lines normally
    if (-not ($line -match "\*\*/Migrations/\[0-9\]")) {
        $newContent += $line
    }
}

# Write the updated content
$newContent | Set-Content $gitignorePath -Encoding UTF8

Write-Host "[OK] .gitignore updated!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Cyan
Write-Host "  • Added exceptions for InitialCreate migration files" -ForegroundColor White
Write-Host "  • Migration files will now be tracked for deployment" -ForegroundColor White
Write-Host ""

# Force add the migration files
Write-Host "Adding migration files to git..." -ForegroundColor Yellow
$migrationPath = "Taskify-Backend/src/Taskify.Infrastructure/Migrations/"
$migrationFiles = Get-ChildItem "$migrationPath*InitialCreate*" -ErrorAction SilentlyContinue

if ($migrationFiles) {
    foreach ($file in $migrationFiles) {
        $relativePath = $file.FullName.Replace("$PWD\", "").Replace("\", "/")
        & git add -f $relativePath
        Write-Host "  [OK] Added: $($file.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "  [WARNING] No InitialCreate migration files found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Ready to commit!" -ForegroundColor Green
Write-Host "Run: git commit -m 'Fixed gitignore to track essential migration files'" -ForegroundColor Cyan
