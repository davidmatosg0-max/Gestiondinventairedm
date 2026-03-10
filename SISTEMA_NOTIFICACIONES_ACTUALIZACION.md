# 🔔 Sistema de Notificaciones de Actualización

## 📋 Resumen

El sistema detecta automáticamente cuando se despliega una nueva versión de la aplicación y muestra una notificación al usuario con la opción de recargar la página para aplicar la actualización.

---

## ✨ Características

✅ **Detección automática** - Verifica cada 5 minutos si hay una nueva versión  
✅ **Notificación visual elegante** - Toast animado con los colores del sistema  
✅ **No intrusivo** - El usuario decide cuándo actualizar  
✅ **Versión basada en timestamp** - Cada build tiene un identificador único  
✅ **Limpieza de caché** - Al recargar, limpia el caché del navegador  
✅ **Consola de debug** - Funciones disponibles para testing  

---

## 🎯 Cómo Funciona

### **1. Al hacer Build:**
```bash
npm run build
```

El script `generate-version.js` crea un archivo `version.json` con:
- Versión: 5.0.0
- Build Time: Timestamp único
- Build Date: Fecha ISO

### **2. Al cargar la App:**
- Se guarda la versión actual en localStorage
- Se inicia el verificador (cada 5 minutos)

### **3. Al detectar actualización:**
- Compara el timestamp del servidor con el local
- Si son diferentes, muestra la notificación
- El usuario puede:
  - **Recharger maintenant** → Recarga inmediatamente
  - **Plus tard** → Cierra la notificación (se mostrará en el siguiente check)

---

## 🎨 Notificación Visual

La notificación aparece en la parte superior central con:

```
┌─────────────────────────────────────────────┐
│ 🎉  Nouvelle version disponible!           │
│                                             │
│ Une mise à jour de l'application est prête.│
│ Rechargez pour profiter des nouvelles      │
│ fonctionnalités.                            │
│                                             │
│ [🔄 Recharger maintenant] [✕ Plus tard]   │
│                                             │
│ ℹ️ La page se rechargera automatiquement   │
│   au prochain chargement                    │
└─────────────────────────────────────────────┘
```

**Características:**
- Fondo: Azul marino (#1a4d7a)
- Bordes: Verde (#2d9561)
- Iconos: Lucide React
- No se cierra automáticamente
- Animación suave

---

## ⚙️ Configuración

### **Intervalo de Verificación:**

Por defecto: **5 minutos**

Para cambiar, edita `/src/app/utils/updateNotifier.ts`:

```typescript
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
```

Opciones sugeridas:
- Desarrollo: `1 * 60 * 1000` (1 minuto)
- Producción: `5 * 60 * 1000` (5 minutos)
- Conservador: `15 * 60 * 1000` (15 minutos)

---

## 🛠️ Funciones de Debug en Consola

Abre la consola del navegador (F12) y usa:

### **Ver información de versión:**
```javascript
updateNotifier.info()
```

Muestra:
```
📱 Información de Versión:
   Versión: 5.0.0
   Build Time: 1710123456789
   Almacenada: 1710123456789
```

### **Verificar actualización ahora:**
```javascript
updateNotifier.check()
```

Fuerza una verificación inmediata (no espera los 5 minutos).

### **Aplicar actualización:**
```javascript
updateNotifier.apply()
```

Recarga la página con limpieza de caché.

### **Obtener objeto de versión:**
```javascript
updateNotifier.version()
```

Retorna:
```javascript
{
  version: "5.0.0",
  buildTime: "1710123456789",
  stored: "1710123456789"
}
```

---

## 📂 Archivos del Sistema

### **Creados:**

1. **`/src/app/utils/updateNotifier.ts`**
   - Sistema de detección de actualizaciones
   - Verificación periódica
   - Funciones de control

2. **`/src/app/components/UpdateNotification.tsx`**
   - Componente React de notificación
   - Toast visual con Sonner
   - Hook `useUpdateCheck()` para verificación manual

3. **`/scripts/generate-version.js`**
   - Script que genera version.json en cada build
   - Se ejecuta automáticamente antes de `vite build`

4. **`/public/version.json`**
   - Archivo con información de versión
   - Generado automáticamente en cada build

### **Modificados:**

1. **`/package.json`**
   - Script de build actualizado:
   ```json
   "build": "node scripts/generate-version.js && vite build"
   ```

2. **`/src/app/App.tsx`**
   - Importa y renderiza `<UpdateNotification />`

---

## 🔄 Flujo Completo

```
1. DESARROLLADOR HACE CAMBIOS
   ↓
2. EJECUTA: git push origin main
   ↓
3. VERCEL DETECTA CAMBIOS
   ↓
4. EJECUTA: npm run build
   ↓
5. SCRIPT generate-version.js
   → Crea version.json con nuevo timestamp
   ↓
6. VITE BUILD
   → Compila la app
   ↓
7. VERCEL DESPLIEGA
   → Nueva versión disponible
   ↓
8. USUARIO CON APP ABIERTA
   ↓
9. VERIFICADOR DETECTA CAMBIO
   → Cada 5 minutos compara timestamps
   ↓
10. MUESTRA NOTIFICACIÓN
    → "🎉 Nouvelle version disponible!"
    ↓
11. USUARIO ELIGE:
    a) Recharger maintenant → Recarga inmediatamente
    b) Plus tard → Espera al siguiente check
```

---

## ✅ Testing del Sistema

### **1. Testing Local:**

```bash
# Terminal 1: Compilar versión 1
npm run build

# Terminal 2: Servir la app
npm run preview

# Abre http://localhost:4173
# Verás la versión guardada en localStorage

# Terminal 1: Hacer cambios y compilar versión 2
# (Edita cualquier archivo)
npm run build

# El verificador detectará el cambio
# Aparecerá la notificación después de 10 segundos
```

### **2. Testing en Producción:**

```bash
# 1. Desplegar versión 1
git push origin main

# 2. Abrir la app en el navegador
# 3. Esperar 2-3 minutos (deployment)

# 4. Hacer un cambio pequeño (ej: agregar un console.log)
# 5. Desplegar versión 2
git push origin main

# 6. En la app abierta:
#    - Esperar 10 segundos (primera verificación)
#    - O ejecutar: updateNotifier.check()
#    - Aparecerá la notificación
```

### **3. Testing Manual en Consola:**

```javascript
// Forzar detección de nueva versión
localStorage.setItem('app_current_version', '0');
updateNotifier.check(); // Mostrará notificación

// Ver estado
updateNotifier.info();

// Aplicar actualización
updateNotifier.apply();
```

---

## 🎯 Casos de Uso

### **Caso 1: Usuario Activo Durante Deployment**

1. Usuario tiene la app abierta
2. Se despliega nueva versión
3. Después de 5 minutos (o menos), aparece notificación
4. Usuario decide cuándo actualizar

### **Caso 2: Usuario Abre App Después de Deployment**

1. Nueva versión ya está desplegada
2. Usuario abre la app
3. Automáticamente carga la nueva versión
4. No aparece notificación (ya está actualizado)

### **Caso 3: Múltiples Deployments Rápidos**

1. Se despliegan 3 versiones en 10 minutos
2. Usuario con app abierta
3. Solo recibe UNA notificación (la más reciente)
4. Al recargar, obtiene la última versión

---

## 🔒 Limpieza de Caché

Al hacer clic en "Recharger maintenant", se ejecuta:

1. **Desregistrar Service Workers** (si existen)
2. **Limpiar Cache API** del navegador
3. **Recargar con bypass de caché** (`location.reload()`)

Esto asegura que el usuario obtenga la versión más reciente sin residuos.

---

## 📊 Logs en Consola

### **Al iniciar la app:**
```
🔄 Iniciando verificador de actualizaciones...
   📅 Verificación cada 5 minutos
```

### **Al detectar actualización:**
```
╔════════════════════════════════════════════════════════╗
║   🎉 NOUVELLE VERSION DISPONIBLE!                    ║
╚════════════════════════════════════════════════════════╝

📱 Une nouvelle version est disponible
🔄 Rechargez la page pour mettre à jour

💡 Pour recharger automatiquement:
   updateNotifier.apply()

╚════════════════════════════════════════════════════════╝
```

### **Al estar actualizado:**
```
✅ La aplicación está actualizada (v1710123456789)
```

---

## 🎨 Personalización

### **Cambiar colores de la notificación:**

Edita `/src/app/components/UpdateNotification.tsx`:

```tsx
<div className="bg-[#1a4d7a] text-white ...">
  // Cambia #1a4d7a por tu color de fondo

<div className="bg-[#2d9561] rounded-full ...">
  // Cambia #2d9561 por tu color de acento
```

### **Cambiar textos:**

Los textos usan i18n. Para cambiar, edita las traducciones en:
- `/src/i18n/locales/fr.json`
- `/src/i18n/locales/es.json`
- `/src/i18n/locales/en.json`
- `/src/i18n/locales/ar.json`

O modifica directamente en el componente:
```tsx
{t('updateAvailable', 'Nouvelle version disponible!')}
```

---

## ⚠️ Consideraciones

### **Performance:**
- La verificación es ligera (< 1KB de datos)
- No afecta el rendimiento de la app
- Solo hace fetch cada 5 minutos

### **Navegadores:**
- Compatible con todos los navegadores modernos
- Fallback si `version.json` no existe
- Funciona sin Service Worker

### **Notificaciones:**
- No se muestran múltiples veces para la misma versión
- Usa localStorage para tracking
- No interfiere con otras notificaciones

---

## 🆘 Solución de Problemas

### **"No aparece la notificación"**

```javascript
// 1. Verificar que el verificador esté corriendo
console.log(window.updateNotifier);

// 2. Forzar verificación
updateNotifier.check();

// 3. Ver estado
updateNotifier.info();
```

### **"La notificación aparece siempre"**

```javascript
// Resetear versión almacenada
localStorage.removeItem('app_current_version');
localStorage.removeItem('app_last_notified_version');
location.reload();
```

### **"version.json no se genera"**

```bash
# Verificar que el script se ejecute
node scripts/generate-version.js

# Verificar que el archivo exista
ls -la public/version.json

# Verificar package.json
cat package.json | grep "build"
```

---

## 📈 Métricas Sugeridas

Para tracking (opcional):

```typescript
// En updateNotifier.ts, al detectar actualización:
if (currentVersion !== serverVersion) {
  // Enviar evento a analytics
  if (window.gtag) {
    window.gtag('event', 'app_update_detected', {
      old_version: currentVersion,
      new_version: serverVersion
    });
  }
}
```

---

## 🎊 Resumen Ejecutivo

**El sistema está listo para:**

✅ Detectar automáticamente nuevas versiones  
✅ Notificar elegantemente al usuario  
✅ Permitir actualización con un clic  
✅ Funcionar en todos los navegadores modernos  
✅ No interferir con el uso normal de la app  

**Próximo deployment:**

1. `git push origin main`
2. Usuario con app abierta recibirá notificación
3. Clic en "Recharger" → App actualizada ✨

---

**Versión del Sistema:** 5.0.0  
**Sistema:** Banque Alimentaire PRO  
**Feature:** Notificaciones de Actualización 🔔
