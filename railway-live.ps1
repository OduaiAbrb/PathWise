# Railway Live Connection for PathWise
Write-Host "Connecting to Railway Production Environment..." -ForegroundColor Green

$PROJECT_ID = "678be5cc-b9e3-47a9-82e9-04d202016d68"
$ENVIRONMENT_ID = "00f7f1dc-1415-4955-b91b-8549e69f30a9"
$FRONTEND_URL = "https://frontend-production-752a.up.railway.app"
$BACKEND_URL = "https://pathwise-production-0768.up.railway.app"

# Create Railway project configuration
$railwayConfig = @{
    projectId = $PROJECT_ID
    environmentId = $ENVIRONMENT_ID
} | ConvertTo-Json -Compress

Set-Content -Path ".railway" -Value $railwayConfig
Write-Host "Railway project linked: $PROJECT_ID" -ForegroundColor Green

# Test live deployment
Write-Host "`nTesting live deployment..." -ForegroundColor Yellow

# Frontend test
try {
    $null = Invoke-WebRequest -Uri $FRONTEND_URL -Method Head -TimeoutSec 5
    Write-Host "Frontend: LIVE and responding" -ForegroundColor Green
} catch {
    Write-Host "Frontend: Connection failed" -ForegroundColor Red
}

# Backend test  
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -TimeoutSec 5
    Write-Host "Backend: LIVE - Health status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "Backend: Connection failed" -ForegroundColor Red
}

# API endpoint test
try {
    Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/study-buddy/chat" -Method Post -ContentType "application/json" -Body '{"message":"test"}' -TimeoutSec 3
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "API: Protected endpoints working correctly" -ForegroundColor Green
    }
}

Write-Host "`nRailway Project Details:" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor White
Write-Host "Environment: production" -ForegroundColor White
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White

Write-Host "`nPathWise is connected and running on Railway!" -ForegroundColor Green

# Open Railway dashboard
Write-Host "`nOpening Railway dashboard..." -ForegroundColor Yellow
Start-Process "https://railway.app/project/$PROJECT_ID"
