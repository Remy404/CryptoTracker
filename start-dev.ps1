# ==========================================
# Chocolabs Dev Environment Launcher
# ==========================================
Write-Host "Inicializando Chocolabs CryptoTracker..." -ForegroundColor Cyan

# 1. Iniciar Base de Datos (Docker)
Write-Host "Arrancando contenedor PostgreSQL Docker Container (docker start crypto-db)..." -ForegroundColor Green
docker start crypto-db

# 2. Definir rutas (AJUSTA ESTAS SI TUS CARPETAS TIENEN OTRO NOMBRE)
$BackendPath = ".\backend"
$FrontendPath = ".\frontend"

# 3. Iniciar Spring Boot en una ventana nueva
Write-Host "Lanzando Spring Boot Backend (./mvnw spring-boot:run)..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $BackendPath; ./mvnw spring-boot:run" -PassThru

# 4. Iniciar Astro Frontend en una ventana nueva
Write-Host "astronauta Lanzando Astro Frontend (npm run dev)..." -ForegroundColor Magenta
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $FrontendPath; npm run dev" -PassThru

# 5. Modo de Espera (Control Center)
Write-Host "Todo corriendo. Presiona [ENTER] en esta ventana para APAGAR todo." -ForegroundColor White -BackgroundColor DarkBlue
Read-Host

Write-Host "Apagando servicios..." -ForegroundColor Red

# Matar procesos de ventanas
if ($backendProcess) { 
    Write-Host "Eliminando Backend y Java (PID: $($backendProcess.Id))..."
    taskkill /PID $backendProcess.Id /T /F 
}
if ($frontendProcess) { 
    Write-Host "Eliminando Frontend y Node (PID: $($frontendProcess.Id))..."
    taskkill /PID $frontendProcess.Id /T /F 
}

# Detener Docker (Opcional - Si quieres ahorrar RAM)
Write-Host "¿Quieres detener la base de datos también? (S/N)" -ForegroundColor Cyan
$response = Read-Host
if ($response -eq 'S' -or $response -eq 's') {
    docker stop crypto-db
    Write-Host "Base de datos detenida."
}

Write-Host "Bye bye!"
Start-Sleep -Seconds 2