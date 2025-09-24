Write-Host "🚀 Building and deploying frontend to backend..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend

try {
    npm run build:deploy
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed!"
    }
    
    Write-Host ""
    Write-Host "✅ Frontend built and deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 You can now access the app at:" -ForegroundColor Cyan
    Write-Host "   - Frontend (dev): http://localhost:5173" -ForegroundColor White
    Write-Host "   - Backend API: http://127.0.0.1:8000" -ForegroundColor White
    Write-Host "   - Full app (served by backend): http://127.0.0.1:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 To start the backend, run: uvicorn main:app --reload --port 8000" -ForegroundColor Yellow
    Write-Host "💡 To start the frontend dev server, run: npm run dev" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Set-Location ..
}

Write-Host ""
Read-Host "Press Enter to continue"
