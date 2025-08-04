# Diabify 2.0 - Plataforma de Asesoramiento para Diabetes

Una plataforma integral especializada en asesoramiento y atención personalizada para personas con diabetes tipo 1, tipo 2, diabetes infantil, prediabetes, diabetes gestacional, y también para personas con problemas de sobrepeso.

## 🎯 Características Principales

### 👥 Para Usuarios
- **Test Personalizado**: Evaluación guiada para descubrir qué servicios necesitas
- **Profesionales Especializados**: Acceso a dietistas, nutricionistas, educadores y entrenadores
- **Recursos Descargables**: Guías, menús, libros y material educativo
- **Sesiones Online**: Videollamadas con profesionales verificados
- **Seguimiento**: Historial de sesiones y progreso personalizado

### 👨‍⚕️ Para Profesionales
- **Perfil Profesional**: Gestiona tu experiencia, especialidades y tarifas
- **Calendario Integrado**: Sistema de reservas y disponibilidad
- **Panel de Gestión**: Clientes, sesiones y estadísticas
- **Liquidaciones Automáticas**: Pagos y comisiones via Stripe Connect

### 🏥 Tipos de Diabetes Cubiertos
- Diabetes Tipo 1
- Diabetes Tipo 2  
- Diabetes Gestacional
- Prediabetes
- Diabetes Infantil
- Problemas de Sobrepeso

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - API endpoints
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional

### Servicios Externos
- **Stripe** - Pagos y suscripciones
- **Stripe Connect** - Split payments para profesionales
- **Supabase** - Hosting de PostgreSQL
- **Vercel** - Hosting frontend
- **Cloudinary** - Almacenamiento de archivos

## 🚀 Desarrollo Local

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- PostgreSQL (local o Supabase)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd diabify-platform
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales:
- `DATABASE_URL`: URL de PostgreSQL
- `NEXTAUTH_SECRET`: Clave secreta para autenticación
- `STRIPE_*`: Claves de Stripe
- Otras variables según necesidades

4. **Configurar base de datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos de ejemplo
npx prisma db seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📂 Estructura del Proyecto

```
src/
├── app/                 # App Router (Next.js 14)
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página de inicio
│   ├── profesionales/  # Páginas de profesionales
│   ├── recursos/       # Páginas de recursos
│   └── api/           # API routes
├── components/         # Componentes React
│   ├── ui/            # Componentes shadcn/ui
│   ├── layout/        # Header, Footer, etc.
│   └── features/      # Componentes por funcionalidad
├── lib/               # Utilidades y configuraciones
│   ├── prisma.ts      # Cliente de Prisma
│   └── utils.ts       # Utilidades generales
├── types/             # Definiciones TypeScript
├── hooks/             # Custom hooks
└── store/             # Estado global (Zustand)
```

## 🗄️ Modelo de Datos

### Entidades Principales
- **User**: Usuarios de la plataforma
- **Professional**: Profesionales sanitarios
- **HealthProfile**: Perfiles de salud de usuarios
- **Session**: Sesiones entre usuarios y profesionales
- **Resource**: Recursos descargables
- **Payment**: Pagos y transacciones
- **Assessment**: Tests y evaluaciones

### Tipos de Usuario
- `VISITOR`: Visitante no registrado
- `USER`: Usuario registrado
- `PROFESSIONAL`: Profesional verificado
- `ADMIN`: Administrador del sistema

## 🔒 Seguridad y Privacidad

- **Cumplimiento RGPD**: Protección de datos personales
- **Datos de salud cifrados**: Información médica segura
- **Autenticación robusta**: NextAuth.js con múltiples proveedores
- **Validación de entrada**: Zod para validación de schemas
- **Rate limiting**: Protección contra ataques

## 📱 Funcionalidades Futuras

- **App móvil**: React Native o Flutter
- **Telemedicina avanzada**: Integración con dispositivos médicos
- **IA y Machine Learning**: Recomendaciones personalizadas
- **Integración con IoT**: Glucómetros y wearables
- **Multiidioma**: Expansión internacional

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- Email: soporte@diabify.com
- Documentación: [docs.diabify.com](https://docs.diabify.com)
- Issues: [GitHub Issues](https://github.com/diabify/platform/issues)

---

**Diabify 2.0** - Transformando el cuidado de la diabetes mediante tecnología y atención personalizada.
