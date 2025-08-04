# Copilot Instructions - Diabify 2.0

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Proyecto: Diabify 2.0
Plataforma de asesoramiento y atención personalizada para personas con diabetes (tipo 1, tipo 2, infantil, prediabetes, gestacional) y problemas de sobrepeso.

## Stack Tecnológico
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Node.js
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Clerk o Auth0
- **Pagos**: Stripe (con Stripe Connect para colaboradores)
- **Hosting**: Vercel (frontend), Supabase (database)

## Arquitectura y Patrones
- Utilizar App Router de Next.js 14
- Componentes reutilizables con shadcn/ui
- Separación clara entre frontend y API
- Implementar arquitectura escalable por módulos
- Seguir principios de Clean Architecture

## Módulos Principales
1. **Autenticación y Usuarios** (visitantes, usuarios, profesionales, admins)
2. **Gestión de Profesionales** (perfiles, calendarios, sesiones)
3. **Recursos Descargables** (guías, menús, libros)
4. **Sistema de Pagos** (Stripe, comisiones, liquidaciones)
5. **Test/Encuesta Diagnóstica** (wizard, recomendaciones)
6. **Panel de Administración** (CRUD, estadísticas)
7. **Videollamadas** (Zoom API o Jitsi)

## Convenciones de Código
- Usar TypeScript en modo estricto
- Componentes funcionales con hooks
- Nomenclatura en inglés para código, español para contenido
- Implementar error boundaries y manejo de errores
- Usar Zod para validación de schemas
- Implementar tests con Jest y Cypress

## Estructura de Carpetas
```
src/
├── app/                 # App Router pages
├── components/          # Componentes reutilizables
├── lib/                # Utilidades y configuraciones
├── types/              # Definiciones de TypeScript
├── hooks/              # Custom hooks
├── store/              # Estado global (Zustand)
└── styles/             # Estilos globales
```

## Consideraciones de Seguridad
- Cumplimiento RGPD
- Cifrado de datos sensibles de salud
- Validación de entrada en cliente y servidor
- Rate limiting en APIs
- Autenticación robusta con roles y permisos

## Internacionalización
- Soporte para español (ES) como idioma principal
- Preparar estructura para futura expansión multiidioma
