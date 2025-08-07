# 🚨 Script de Configuración de Base de Datos de Desarrollo (PowerShell)
# Ejecutar después de crear el proyecto diabify-development en Supabase

Write-Host "🚨 CONFIGURACIÓN DE BASE DE DATOS DE DESARROLLO" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

# Verificar que existen las variables reemplazables
$envContent = Get-Content .env -Raw
if ($envContent -like "*[DEV-PROJECT-ID]*") {
    Write-Host "⚠️  ATENCIÓN: Necesitas configurar las credenciales de desarrollo" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Ve a: https://supabase.com/dashboard" -ForegroundColor Cyan
    Write-Host "2. Crea proyecto: diabify-development" -ForegroundColor Cyan
    Write-Host "3. Copia la Connection String (Pooler)" -ForegroundColor Cyan
    Write-Host "4. Reemplaza [DEV-PROJECT-ID] y [DEV-PASSWORD] en:" -ForegroundColor Cyan
    Write-Host "   - .env" -ForegroundColor White
    Write-Host "   - .env.local" -ForegroundColor White
    Write-Host "   - .env.development" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplo:" -ForegroundColor Green
    Write-Host 'DATABASE_URL="postgresql://postgres.abc123:password@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Credenciales configuradas. Ejecutando setup..." -ForegroundColor Green

# Verificar que Prisma puede conectar
Write-Host "🔍 Verificando conexión a base de datos..." -ForegroundColor Cyan
$dbTest = npx prisma db pull 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión exitosa a base de datos de desarrollo" -ForegroundColor Green
} else {
    Write-Host "❌ Error de conexión. Verifica DATABASE_URL" -ForegroundColor Red
    Write-Host $dbTest -ForegroundColor Red
    exit 1
}

# Ejecutar migraciones
Write-Host "📊 Aplicando esquema de base de datos..." -ForegroundColor Cyan
npx prisma db push

# Generar cliente
Write-Host "⚙️  Generando cliente de Prisma..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Base de datos de desarrollo configurada" -ForegroundColor Green
Write-Host "✅ Esquema aplicado" -ForegroundColor Green
Write-Host "✅ Cliente Prisma generado" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Para verificar:" -ForegroundColor Cyan
Write-Host "npx prisma studio" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Ahora puedes desarrollar sin riesgo a datos de producción" -ForegroundColor Green
