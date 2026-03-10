/**
 * Sistema de Notificación de Actualizaciones
 * 
 * Detecta cuando hay una nueva versión desplegada y notifica al usuario
 * Verifica cada 5 minutos si hay una actualización disponible
 */

// Versión actual de la aplicación (se actualiza automáticamente en cada build)
export const APP_VERSION = '__BUILD_TIME__'; // Será reemplazado en build
export const APP_VERSION_NUMBER = '5.0.0'; // Versión legible

// Intervalo de verificación (5 minutos)
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos en milisegundos

// Función de callback para notificaciones
let notificationCallback: ((newVersion: string, currentVersion: string) => void) | null = null;

/**
 * Obtiene la versión actual del servidor
 */
async function fetchCurrentVersion(): Promise<string | null> {
  try {
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await fetch(`/version.json?t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      // Si no existe version.json, usar el timestamp del HTML
      return await fetchVersionFromHTML();
    }
    
    const data = await response.json();
    return data.version || data.buildTime || null;
  } catch (error) {
    console.log('⚠️ No se pudo obtener versión del servidor, intentando desde HTML');
    return await fetchVersionFromHTML();
  }
}

/**
 * Obtiene la versión desde el HTML principal (como fallback)
 */
async function fetchVersionFromHTML(): Promise<string | null> {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/?t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Buscar el timestamp del build en el HTML
    const match = html.match(/data-build-time="([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Si no hay timestamp, usar el hash del contenido
    const contentHash = simpleHash(html);
    return contentHash;
  } catch (error) {
    console.error('❌ Error obteniendo versión desde HTML:', error);
    return null;
  }
}

/**
 * Hash simple para detectar cambios en el contenido
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Obtiene la versión almacenada localmente
 */
function getStoredVersion(): string | null {
  return localStorage.getItem('app_current_version');
}

/**
 * Guarda la versión actual
 */
function setStoredVersion(version: string): void {
  localStorage.setItem('app_current_version', version);
}

/**
 * Verifica si hay una actualización disponible
 */
async function checkForUpdate(): Promise<boolean> {
  const currentVersion = getStoredVersion();
  const serverVersion = await fetchCurrentVersion();
  
  if (!serverVersion) {
    console.log('⚠️ No se pudo obtener la versión del servidor');
    return false;
  }
  
  // Si no hay versión almacenada, guardar la actual
  if (!currentVersion) {
    setStoredVersion(serverVersion);
    console.log('📌 Versión inicial guardada:', serverVersion);
    return false;
  }
  
  // Comparar versiones
  if (currentVersion !== serverVersion) {
    console.log('🆕 Nueva versión detectada!');
    console.log('   Versión actual:', currentVersion);
    console.log('   Nueva versión:', serverVersion);
    
    // Notificar al callback
    if (notificationCallback) {
      notificationCallback(serverVersion, currentVersion);
    }
    
    return true;
  }
  
  console.log('✅ La aplicación está actualizada (v' + serverVersion + ')');
  return false;
}

/**
 * Inicia el verificador de actualizaciones
 */
export function startUpdateChecker(
  onUpdateAvailable?: (newVersion: string, currentVersion: string) => void
): () => void {
  console.log('🔄 Iniciando verificador de actualizaciones...');
  console.log(`   📅 Verificación cada ${CHECK_INTERVAL / 60000} minutos`);
  
  // Guardar el callback
  if (onUpdateAvailable) {
    notificationCallback = onUpdateAvailable;
  }
  
  // Verificar inmediatamente al iniciar (después de 10 segundos)
  const initialTimeout = setTimeout(() => {
    checkForUpdate();
  }, 10000); // 10 segundos después de cargar
  
  // Verificar periódicamente
  const intervalId = setInterval(() => {
    checkForUpdate();
  }, CHECK_INTERVAL);
  
  // Función para detener el verificador
  return () => {
    clearTimeout(initialTimeout);
    clearInterval(intervalId);
    console.log('⏹️ Verificador de actualizaciones detenido');
  };
}

/**
 * Fuerza una verificación inmediata
 */
export async function checkNow(): Promise<boolean> {
  console.log('🔍 Verificando actualizaciones ahora...');
  return await checkForUpdate();
}

/**
 * Recarga la página para aplicar la actualización
 */
export function applyUpdate(): void {
  console.log('🔄 Aplicando actualización...');
  
  // Limpiar caché del Service Worker si existe
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  // Limpiar cache del navegador
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Esperar 500ms y recargar con bypass de caché
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

/**
 * Obtiene información de la versión actual
 */
export function getVersionInfo() {
  return {
    version: APP_VERSION_NUMBER,
    buildTime: APP_VERSION,
    stored: getStoredVersion()
  };
}

/**
 * Marca que el usuario fue notificado de esta versión
 */
export function markAsNotified(version: string): void {
  localStorage.setItem('app_last_notified_version', version);
}

/**
 * Verifica si ya se notificó de esta versión
 */
export function wasNotified(version: string): boolean {
  return localStorage.getItem('app_last_notified_version') === version;
}

/**
 * Actualiza la versión almacenada (después de recargar)
 */
export function updateStoredVersion(version: string): void {
  setStoredVersion(version);
}

// Exponer funciones globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).updateNotifier = {
    check: checkNow,
    apply: applyUpdate,
    version: getVersionInfo,
    info: () => {
      const info = getVersionInfo();
      console.log('📱 Información de Versión:');
      console.log('   Versión:', info.version);
      console.log('   Build Time:', info.buildTime);
      console.log('   Almacenada:', info.stored);
    }
  };
}
