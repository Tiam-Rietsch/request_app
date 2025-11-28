# Development Server Startup Script
# This script starts both Django backend and Next.js frontend

Write-Host "Starting Development Servers..." -ForegroundColor Green
Write-Host ""

# Start Django backend
Write-Host "Starting Django backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'D:\PROJET GLO5'; venv\Scripts\activate; python manage.py runserver"
)

# Wait for backend to initialize
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Next.js frontend
Write-Host "Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'D:\PROJET GLO5\request_front_end'; npm run dev"
)

Write-Host ""
Write-Host "Development servers are starting!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

