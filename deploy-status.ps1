# Quick deployment status checker
Write-Host "PathWise Deployment Status" -ForegroundColor Green

$frontendUrl = "https://frontend-production-752a.up.railway.app"
$backendUrl = "https://pathwise-production-0768.up.railway.app"

Write-Host "`nChecking services..." -ForegroundColor Yellow

# Frontend check
try {
    $null = Invoke-RestMethod -Uri $frontendUrl -Method Head -TimeoutSec 5
    Write-Host "Frontend: ONLINE - $frontendUrl" -ForegroundColor Green
} catch {
    Write-Host "Frontend: OFFLINE - $frontendUrl" -ForegroundColor Red
}

# Backend check
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 5
    Write-Host "Backend: ONLINE - $backendUrl (Status: $($health.status))" -ForegroundColor Green
} catch {
    Write-Host "Backend: OFFLINE - $backendUrl" -ForegroundColor Red
}

Write-Host "`nQuick Actions:" -ForegroundColor Cyan
Write-Host "Open Frontend: start $frontendUrl" -ForegroundColor White
Write-Host "Open Backend Health: start $backendUrl/health" -ForegroundColor White
Write-Host "Railway Dashboard: start https://railway.app/project/678be5cc-b9e3-47a9-82e9-04d202016d68" -ForegroundColor White
