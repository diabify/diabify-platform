#!/bin/bash

# 🚨 Script de Configuración de Base de Datos de Desarrollo
# Ejecutar después de crear el proyecto diabify-development en Supabase

echo "🚨 CONFIGURACIÓN DE BASE DE DATOS DE DESARROLLO"
echo "==============================================="
echo ""

# Verificar que existen las variables reemplazables
if grep -q "\[DEV-PROJECT-ID\]" .env; then
    echo "⚠️  ATENCIÓN: Necesitas configurar las credenciales de desarrollo"
    echo ""
    echo "1. Ve a: https://supabase.com/dashboard"
    echo "2. Crea proyecto: diabify-development"
    echo "3. Copia la Connection String (Pooler)"
    echo "4. Reemplaza [DEV-PROJECT-ID] y [DEV-PASSWORD] en:"
    echo "   - .env"
    echo "   - .env.local" 
    echo "   - .env.development"
    echo ""
    echo "Ejemplo:"
    echo "DATABASE_URL=\"postgresql://postgres.abc123:password@aws-0-eu-west-3.pooler.supabase.com:5432/postgres\""
    echo ""
    exit 1
fi

echo "✅ Credenciales configuradas. Ejecutando setup..."

# Verificar que Prisma puede conectar
echo "🔍 Verificando conexión a base de datos..."
npx prisma db pull > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexión exitosa a base de datos de desarrollo"
else
    echo "❌ Error de conexión. Verifica DATABASE_URL"
    exit 1
fi

# Ejecutar migraciones
echo "📊 Aplicando esquema de base de datos..."
npx prisma db push

# Generar cliente
echo "⚙️  Generando cliente de Prisma..."
npx prisma generate

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "✅ Base de datos de desarrollo configurada"
echo "✅ Esquema aplicado"
echo "✅ Cliente Prisma generado"
echo ""
echo "🧪 Para verificar:"
echo "npx prisma studio"
echo ""
echo "🚀 Ahora puedes desarrollar sin riesgo a datos de producción"
