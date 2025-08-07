# Configuración de Variables de Entorno

## 📁 Estructura de Archivos

- `.env.development` - Variables para desarrollo local
- `.env.production` - Template para producción (se configura en Vercel)
- `.env.local` - Variables locales (no se sube a git)

## 🚀 Configuración en Vercel

### Variables Requeridas en Vercel Dashboard:

```bash
# SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@diabify.com
SMTP_PASS=3LpGjLqVp7aHeRxXUEFE
EMAIL_FROM=info@diabify.com

# JWT Secret (CAMBIAR por uno seguro en producción)
JWT_SECRET=diabify-jwt-secret-2025-PRODUCTION-SECURE-KEY

# Database
DATABASE_URL=postgresql://postgres.byiwyjcfekecoyuitxjn:cqj-3CzAVn%23ciQ5@aws-0-eu-west-3.pooler.supabase.com:5432/postgres

# Preview/Sandbox
PREVIEW_SECRET_KEY=diabify-preview-2025-production
```

### Variables Automáticas de Vercel:

Vercel proporciona automáticamente:
- `VERCEL_URL` - URL del deployment actual
- `VERCEL_ENV` - Entorno (production, preview, development)
- `NODE_ENV` - Node environment

## 🔧 Detección Automática de URL

El sistema detecta automáticamente la URL base:

1. **Desarrollo local**: `http://localhost:3000`
2. **Vercel Preview**: `https://[deployment-url].vercel.app`
3. **Vercel Production**: `https://services.diabify.com`

### Función `getBaseUrl()`:

```typescript
import { getBaseUrl } from '@/lib/url';

// En cualquier parte del código
const baseUrl = getBaseUrl();
const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
```

## 🛠️ Pasos para Configurar:

### 1. En Vercel Dashboard:
1. Ir a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añadir todas las variables listadas arriba
4. Configurar para "Production" y "Preview"

### 2. Para Desarrollo Local:
```bash
# Copiar el archivo de desarrollo
cp .env.development .env.local

# Editar .env.local con valores específicos de desarrollo
nano .env.local
```

### 3. Verificar Configuración:
```bash
# En desarrollo local
npm run dev

# Verificar logs para ver qué URL se está usando
# La función debugUrls() mostrará la configuración actual
```

## 🔒 Seguridad:

- ❌ **NO** subir `.env.local` a git (contiene datos sensibles)
- ✅ **SÍ** subir `.env.development` y `.env.production` (como templates)
- 🔑 Cambiar `JWT_SECRET` en producción por algo más seguro
- 📧 Verificar que las credenciales SMTP sean correctas

## 🌐 URLs por Entorno:

| Entorno | URL Base | Configuración |
|---------|----------|---------------|
| Local | `http://localhost:3000` | Automática |
| Preview | `https://[branch]-diabify-platform.vercel.app` | Automática (VERCEL_URL) |
| Production | `https://services.diabify.com` | Automática (VERCEL_URL) |

## 🐛 Debug:

Para debuggear problemas de URL, añadir en el código:

```typescript
import { debugUrls } from '@/lib/url';
debugUrls(); // Imprime toda la configuración de URLs
```
