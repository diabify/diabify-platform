# 🚨 CONFIGURACIÓN URGENTE: SEPARACIÓN DE BASES DE DATOS

## ⚠️ PROBLEMA CRÍTICO IDENTIFICADO
Actualmente estamos usando la **misma base de datos para desarrollo y producción**, lo cual es extremadamente peligroso.

## 🎯 SOLUCIÓN IMPLEMENTADA

### 1. **Crear Proyecto de Desarrollo en Supabase**

1. Ve a: https://supabase.com/dashboard
2. Crear nuevo proyecto:
   - **Name**: `diabify-development`
   - **Database Password**: (genera una nueva y guárdala)
   - **Region**: `eu-west-3` (misma que producción)

### 2. **Obtener Credenciales del Nuevo Proyecto**

Una vez creado el proyecto, ve a:
- **Settings** → **Database**
- Copia la **Connection String** (Pooler)
- Debe verse como: `postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

### 3. **Actualizar Variables de Ambiente**

#### 📁 `.env` (desarrollo local)
```bash
DATABASE_URL="postgresql://postgres.[DEV-PROJECT-ID]:[DEV-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

#### 📁 `.env.local` (desarrollo local)
```bash
DATABASE_URL="postgresql://postgres.[DEV-PROJECT-ID]:[DEV-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

#### 📁 `.env.development` (desarrollo)
```bash
DATABASE_URL="postgresql://postgres.[DEV-PROJECT-ID]:[DEV-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

#### 📁 `.env.production` (producción - NO CAMBIAR)
```bash
# MANTENER COMO ESTÁ - PRODUCCIÓN
DATABASE_URL="postgresql://postgres.byiwyjcfekecoyuitxjn:cqj-3CzAVn%23ciQ5@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

### 4. **Migrar Esquema a Nueva Base de Datos**

Una vez tengas las credenciales:

```bash
# 1. Reemplazar [DEV-PROJECT-ID] y [DEV-PASSWORD] en los archivos .env
# 2. Ejecutar migraciones
npx prisma db push

# 3. Generar cliente de Prisma
npx prisma generate

# 4. (Opcional) Crear datos de prueba
npx prisma db seed
```

### 5. **Verificar Configuración**

```bash
# Verificar que apunta a desarrollo
npx prisma studio
# Debe abrir la base de datos de DESARROLLO, no producción
```

## 🎯 CONFIGURACIÓN FINAL

### Desarrollo:
- **Local**: `diabify-development` project en Supabase
- **Variables**: `.env`, `.env.local`, `.env.development`

### Producción:
- **Vercel**: `diabify-production` project en Supabase  
- **Variables**: `.env.production` (ya configurado en Vercel)

## ✅ BENEFICIOS

✅ **Seguridad**: Datos de producción protegidos
✅ **Testing**: Pruebas sin riesgo
✅ **Desarrollo**: Datos de prueba independientes
✅ **Deploy**: Sin conflictos entre ambientes

## 🚨 PASOS INMEDIATOS REQUERIDOS

1. **Crear proyecto `diabify-development`** en Supabase
2. **Copiar credenciales** del nuevo proyecto
3. **Reemplazar `[DEV-PROJECT-ID]` y `[DEV-PASSWORD]`** en archivos .env
4. **Ejecutar `npx prisma db push`** para crear esquema
5. **Verificar** que desarrollo usa la nueva DB

---

**⏰ URGENTE**: Completar ANTES de continuar desarrollo para evitar corrupción de datos de producción.
