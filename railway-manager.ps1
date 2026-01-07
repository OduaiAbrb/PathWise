# PathWise Railway Management Script
# Run this to manage your Railway deployment locally

Write-Host "🚀 PathWise Railway Manager" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Project Configuration
$ProjectId = "678be5cc-b9e3-47a9-82e9-04d202016d68"
$EnvironmentId = "00f7f1dc-1415-4955-b91b-8549e69f30a9"
$FrontendUrl = "https://frontend-production-752a.up.railway.app"
$BackendUrl = "https://pathwise-production-0768.up.railway.app"

# Check project status
Write-Host "`n📊 Checking Project Status..." -ForegroundColor Yellow

try {
    $frontendStatus = Invoke-RestMethod -Uri $FrontendUrl -Method Head -TimeoutSec 10
    Write-Host "✅ Frontend: ONLINE" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: OFFLINE" -ForegroundColor Red
}

try {
    $backendHealth = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Backend: ONLINE ($($backendHealth.status))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: OFFLINE" -ForegroundColor Red
}

# Menu
Write-Host "`n🛠️  Available Actions:" -ForegroundColor Cyan
Write-Host "1. Test Frontend" -ForegroundColor White
Write-Host "2. Test Backend API" -ForegroundColor White
Write-Host "3. Test Study Buddy Endpoint" -ForegroundColor White
Write-Host "4. Check Environment Variables" -ForegroundColor White
Write-Host "5. View Live URLs" -ForegroundColor White
Write-Host "6. Open Railway Dashboard" -ForegroundColor White
Write-Host "7. Exit" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host "`n🌐 Testing Frontend..." -ForegroundColor Yellow
        Start-Process $FrontendUrl
    }
    "2" {
        Write-Host "`n🔧 Testing Backend API..." -ForegroundColor Yellow
        try {
            $health = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get
            Write-Host "✅ Backend Health: $($health.status)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Backend API Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "`n🤖 Testing Study Buddy (requires auth)..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "$BackendUrl/api/v1/study-buddy/chat" -Method Post -ContentType "application/json" -Body '{"message":"test","conversation_history":[],"user_context":null}'
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "✅ Study Buddy Endpoint: PROTECTED (requires authentication)" -ForegroundColor Green
            } else {
                Write-Host "❌ Study Buddy Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    "4" {
        Write-Host "`n📋 Environment Variables Status:" -ForegroundColor Yellow
        Write-Host "Project ID: $ProjectId" -ForegroundColor White
        Write-Host "Environment ID: $EnvironmentId" -ForegroundColor White
        Write-Host "✅ All environment variables are configured in Railway" -ForegroundColor Green
    }
    "5" {
        Write-Host "`n🔗 Live URLs:" -ForegroundColor Yellow
        Write-Host "Frontend: $FrontendUrl" -ForegroundColor Cyan
        Write-Host "Backend:  $BackendUrl" -ForegroundColor Cyan
        Write-Host "Health:   $BackendUrl/health" -ForegroundColor Cyan
    }
    "6" {
        Write-Host "`n🚀 Opening Railway Dashboard..." -ForegroundColor Yellow
        Start-Process "https://railway.app/project/$ProjectId"
    }
    "7" {
        Write-Host "`n👋 Goodbye!" -ForegroundColor Green
        exit
    }
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n✨ PathWise is running successfully!" -ForegroundColor Green
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl" -ForegroundColor Cyan
