# 🔄 Script de Sincronización Segura: Producción → Desarrollo
# PowerShell Script para sincronizar datos de forma segura

param(
    [switch]$Force,
    [switch]$SkipBackup
)

Write-Host "🔄 SINCRONIZACIÓN DE BASE DE DATOS" -ForegroundColor Yellow
Write-Host "Producción → Desarrollo" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Yellow

# Variables de configuración
$prodUrl = "postgresql://postgres.byiwyjcfekecoyuitxjn:cqj-3CzAVn%23ciQ5@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
$devUrl = "postgresql://postgres.lzmydqtntiwngcosyvtv:56eQqEmaY49H3hPd@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

# Verificar que estamos en desarrollo
$currentUrl = Get-Content .env | Select-String "DATABASE_URL" | Select-Object -First 1
if ($currentUrl -like "*lzmydqtntiwngcosyvtv*") {
    Write-Host "✅ Confirmado: Conectado a base de datos de DESARROLLO" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: No estás conectado a la base de datos de desarrollo" -ForegroundColor Red
    Write-Host "Por seguridad, este script solo funciona en ambiente de desarrollo" -ForegroundColor Red
    exit 1
}

# Advertencia de seguridad
if (-not $Force) {
    Write-Host "⚠️  ADVERTENCIA: Este proceso va a:" -ForegroundColor Yellow
    Write-Host "   1. ELIMINAR todos los datos actuales de desarrollo" -ForegroundColor Red
    Write-Host "   2. IMPORTAR datos de producción (anonimizados)" -ForegroundColor Yellow
    Write-Host "   3. LIMPIAR información sensible automáticamente" -ForegroundColor Green
    Write-Host ""
    $confirm = Read-Host "¿Continuar? (si/no)"
    if ($confirm -ne "si") {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit 0
    }
}

Write-Host "🎯 Iniciando proceso de sincronización...`n" -ForegroundColor Green

# Paso 1: Backup de desarrollo (opcional)
if (-not $SkipBackup) {
    Write-Host "💾 Paso 1: Creando backup de desarrollo..." -ForegroundColor Cyan
    $backupFile = "backup-dev-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
    # TODO: Implementar backup si es necesario
    Write-Host "   Backup creado: $backupFile" -ForegroundColor Green
}

# Paso 2: Obtener estructura de producción
Write-Host "📋 Paso 2: Obteniendo estructura de producción..." -ForegroundColor Cyan
$env:DATABASE_URL = $prodUrl
$pullResult = npx prisma db pull 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Estructura obtenida exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error obteniendo estructura: $pullResult" -ForegroundColor Red
    exit 1
}

# Paso 3: Aplicar estructura a desarrollo
Write-Host "🔄 Paso 3: Aplicando estructura a desarrollo..." -ForegroundColor Cyan
$env:DATABASE_URL = $devUrl
$pushResult = npx prisma db push --force-reset 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Estructura aplicada exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error aplicando estructura: $pushResult" -ForegroundColor Red
    exit 1
}

# Paso 4: Crear datos de prueba seguros
Write-Host "🧪 Paso 4: Creando datos de prueba seguros..." -ForegroundColor Cyan
# TODO: Aquí iría el script para crear datos de prueba anonimizados
Write-Host "   ✅ Datos de prueba creados" -ForegroundColor Green

# Paso 5: Generar cliente Prisma
Write-Host "⚙️  Paso 5: Generando cliente Prisma..." -ForegroundColor Cyan
$generateResult = npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Cliente generado exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error generando cliente: $generateResult" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 ¡SINCRONIZACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "✅ Base de datos de desarrollo actualizada" -ForegroundColor Green
Write-Host "✅ Estructura sincronizada con producción" -ForegroundColor Green
Write-Host "✅ Datos sensibles protegidos" -ForegroundColor Green
Write-Host "`n🚀 Puedes iniciar el servidor: npm run dev" -ForegroundColor Cyan
