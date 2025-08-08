# 🔄 Sincronización de Base de Datos: Producción → Desarrollo

## ⚠️ PROCEDIMIENTO DE SEGURIDAD

### 🎯 **Objetivo**
Sincronizar datos de producción a desarrollo para testing realista, manteniendo la privacidad de usuarios.

### 🛡️ **Medidas de Seguridad**
- ✅ Proceso unidireccional: PRODUCCIÓN → DESARROLLO
- ✅ Datos sensibles anonimizados/eliminados
- ✅ Emails reemplazados por datos de prueba
- ✅ Contraseñas eliminadas
- ✅ Tokens de verificación eliminados

### 📋 **Pasos del Proceso**

#### 1. **Backup de Desarrollo** (por seguridad)
```bash
# Exportar datos actuales de desarrollo (por si acaso)
npx prisma db pull
```

#### 2. **Exportar Datos de Producción**
```bash
# Conectar temporalmente a producción y exportar
# DATABASE_URL="[PROD_URL]" npx prisma db pull
```

#### 3. **Limpiar Datos Sensibles**
- Anonimizar emails: `user1@diabify-dev.com`, `user2@diabify-dev.com`
- Eliminar contraseñas reales
- Limpiar tokens de verificación
- Remover información médica sensible

#### 4. **Aplicar a Desarrollo**
```bash
# Aplicar datos limpios a desarrollo
npx prisma db push --force-reset
```

### 🔧 **Comandos de Ejecución**

```bash
# 1. Backup actual
npm run db:backup-dev

# 2. Sync desde producción
npm run db:sync-from-prod

# 3. Verificar resultado
npm run dev
npx prisma studio
```

### ⚠️ **ADVERTENCIAS**
- ❌ NUNCA sincronizar DESARROLLO → PRODUCCIÓN
- ❌ NUNCA incluir datos médicos reales
- ❌ NUNCA incluir emails reales de usuarios
- ❌ NUNCA incluir contraseñas reales

### ✅ **Verificación Post-Sync**
- [ ] Servidor local funcionando
- [ ] Datos anonimizados correctamente
- [ ] No hay información sensible
- [ ] Estructura de datos correcta
