# PathWise Railway Deployment Manager
param(
    [string]$Action = "status"
)

$PROJECT_ID = "678be5cc-b9e3-47a9-82e9-04d202016d68"
$FRONTEND_SERVICE = "frontend"  
$BACKEND_SERVICE = "Backend"
$FRONTEND_URL = "https://frontend-production-752a.up.railway.app"
$BACKEND_URL = "https://pathwise-production-0768.up.railway.app"

Write-Host "PathWise Railway Manager" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

switch ($Action.ToLower()) {
    "status" {
        Write-Host "`nChecking deployment status..." -ForegroundColor Yellow
        
        # Frontend
        try {
            $null = Invoke-WebRequest -Uri $FRONTEND_URL -Method Head -TimeoutSec 5
            Write-Host "Frontend: ONLINE" -ForegroundColor Green
        } catch {
            Write-Host "Frontend: OFFLINE" -ForegroundColor Red
        }
        
        # Backend
        try {
            $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -TimeoutSec 5
            Write-Host "Backend: ONLINE ($($health.status))" -ForegroundColor Green
        } catch {
            Write-Host "Backend: OFFLINE" -ForegroundColor Red
        }
    }
    
    "open" {
        Write-Host "`nOpening PathWise application..." -ForegroundColor Yellow
        Start-Process $FRONTEND_URL
    }
    
    "dashboard" {
        Write-Host "`nOpening Railway dashboard..." -ForegroundColor Yellow  
        Start-Process "https://railway.app/project/$PROJECT_ID"
    }
    
    "logs" {
        Write-Host "`nOpening Railway logs..." -ForegroundColor Yellow
        Start-Process "https://railway.app/project/$PROJECT_ID/service/$FRONTEND_SERVICE"
        Start-Process "https://railway.app/project/$PROJECT_ID/service/$BACKEND_SERVICE"
    }
    
    "test" {
        Write-Host "`nTesting all endpoints..." -ForegroundColor Yellow
        
        # Health check
        try {
            $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get
            Write-Host "Health endpoint: OK" -ForegroundColor Green
        } catch {
            Write-Host "Health endpoint: FAILED" -ForegroundColor Red
        }
        
        # API test
        try {
            Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/study-buddy/chat" -Method Post -ContentType "application/json" -Body '{"message":"test"}'
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "Study Buddy API: PROTECTED (working)" -ForegroundColor Green
            } else {
                Write-Host "Study Buddy API: ERROR" -ForegroundColor Red
            }
        }
    }
    
    default {
        Write-Host "`nAvailable commands:" -ForegroundColor Cyan
        Write-Host "  .\railway-deploy.ps1 status     - Check deployment status" -ForegroundColor White
        Write-Host "  .\railway-deploy.ps1 open       - Open live website" -ForegroundColor White  
        Write-Host "  .\railway-deploy.ps1 dashboard  - Open Railway dashboard" -ForegroundColor White
        Write-Host "  .\railway-deploy.ps1 logs       - View service logs" -ForegroundColor White
        Write-Host "  .\railway-deploy.ps1 test       - Test all endpoints" -ForegroundColor White
    }
}

Write-Host "`nProject URLs:" -ForegroundColor Cyan
Write-Host "Live Site: $FRONTEND_URL" -ForegroundColor White
Write-Host "API: $BACKEND_URL" -ForegroundColor White
Write-Host "Railway: https://railway.app/project/$PROJECT_ID" -ForegroundColor White
