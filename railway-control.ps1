# PathWise Railway Control Panel
Write-Host "PathWise Railway Control Panel" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

$frontendUrl = "https://frontend-production-752a.up.railway.app"
$backendUrl = "https://pathwise-production-0768.up.railway.app"
$railwayProject = "https://railway.app/project/678be5cc-b9e3-47a9-82e9-04d202016d68"

# Quick status check
Write-Host "`nCurrent Status:" -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri $frontendUrl -Method Head -TimeoutSec 3
    Write-Host "Frontend: ONLINE" -ForegroundColor Green
} catch {
    Write-Host "Frontend: OFFLINE" -ForegroundColor Red
}

try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 3
    Write-Host "Backend: ONLINE" -ForegroundColor Green
} catch {
    Write-Host "Backend: OFFLINE" -ForegroundColor Red
}

# Commands
Write-Host "`nAvailable Commands:" -ForegroundColor Cyan
Write-Host "1. .\railway-control.ps1 -OpenFrontend   # Open live website" -ForegroundColor White
Write-Host "2. .\railway-control.ps1 -OpenBackend    # Open backend health" -ForegroundColor White
Write-Host "3. .\railway-control.ps1 -OpenDashboard  # Open Railway dashboard" -ForegroundColor White
Write-Host "4. .\railway-control.ps1 -TestAPI        # Test API endpoints" -ForegroundColor White

# Handle parameters
param(
    [switch]$OpenFrontend,
    [switch]$OpenBackend,
    [switch]$OpenDashboard,
    [switch]$TestAPI
)

if ($OpenFrontend) {
    Write-Host "Opening frontend..." -ForegroundColor Green
    Start-Process $frontendUrl
}

if ($OpenBackend) {
    Write-Host "Opening backend health..." -ForegroundColor Green
    Start-Process "$backendUrl/health"
}

if ($OpenDashboard) {
    Write-Host "Opening Railway dashboard..." -ForegroundColor Green
    Start-Process $railwayProject
}

if ($TestAPI) {
    Write-Host "`nTesting API endpoints..." -ForegroundColor Yellow
    
    # Test health
    try {
        $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get
        Write-Host "Health endpoint: OK ($($health.status))" -ForegroundColor Green
    } catch {
        Write-Host "Health endpoint: FAILED" -ForegroundColor Red
    }
    
    # Test Study Buddy (should return 401)
    try {
        Invoke-RestMethod -Uri "$backendUrl/api/v1/study-buddy/chat" -Method Post -ContentType "application/json" -Body '{"message":"test"}'
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "Study Buddy endpoint: PROTECTED (working correctly)" -ForegroundColor Green
        } else {
            Write-Host "Study Buddy endpoint: ERROR" -ForegroundColor Red
        }
    }
}

Write-Host "`nProject URLs:" -ForegroundColor Cyan
Write-Host "Frontend: $frontendUrl" -ForegroundColor White
Write-Host "Backend:  $backendUrl" -ForegroundColor White
Write-Host "Railway:  $railwayProject" -ForegroundColor White
