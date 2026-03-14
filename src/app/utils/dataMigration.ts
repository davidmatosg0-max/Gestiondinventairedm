/**
 * Sistema de Migración de Datos localStorage
 * Banque Alimentaire - Protección contra pérdida de datos en actualizaciones
 */

import { marcarComoSistemaConDatosReales } from './inicializarDatosEjemplo';
import { 
  aplicarProteccionPostRestauracion, 
  verificarRestauracionProtegida, 
  mostrarResumenRestauracion 
} from './proteccionRestauracion';

// Versión actual del esquema de datos
const CURRENT_VERSION = '1.0.0';
const VERSION_KEY = 'data_schema_version';

/**
 * Ejecuta migraciones de datos cuando sea necesario
 */
export function runDataMigrations() {
  const currentVersion = localStorage.getItem(VERSION_KEY);

  // Si no hay versión, es la primera vez - no hacer nada
  if (!currentVersion) {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.log('✅ Sistema inicializado - Versión:', CURRENT_VERSION);
    return;
  }

  // Si la versión coincide, no hacer nada
  if (currentVersion === CURRENT_VERSION) {
    return;
  }

  console.log(`🔄 Migrando datos de ${currentVersion} a ${CURRENT_VERSION}...`);

  // Aquí puedes agregar migraciones específicas según la versión
  try {
    // Ejemplo de migración (descomentado cuando sea necesario):
    /*
    if (currentVersion === '0.9.0') {
      migrateFrom_0_9_0_to_1_0_0();
    }
    */

    // Actualizar versión
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en migración de datos:', error);
  }
}

/**
 * Ejemplo de función de migración
 * Renombra una clave de localStorage manteniendo los datos
 */
function renameLocalStorageKey(oldKey: string, newKey: string) {
  const data = localStorage.getItem(oldKey);
  if (data) {
    localStorage.setItem(newKey, data);
    localStorage.removeItem(oldKey);
    console.log(`✅ Migrado: ${oldKey} → ${newKey}`);
  }
}

/**
 * Ejemplo: Migración de versión 0.9.0 a 1.0.0
 * Descomenta y modifica según tus necesidades
 */
/*
function migrateFrom_0_9_0_to_1_0_0() {
  // Ejemplo: Renombrar clave
  renameLocalStorageKey('usuarios', 'usuarios_banco_alimentos');
  
  // Ejemplo: Transformar estructura de datos
  const organismos = localStorage.getItem('organismos_banco_alimentos');
  if (organismos) {
    const data = JSON.parse(organismos);
    // Agregar nuevo campo a todos los organismos
    const updated = data.map((org: any) => ({
      ...org,
      nuevoCampo: 'valorPorDefecto'
    }));
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify(updated));
  }
}
*/

/**
 * Backup completo de todos los datos en localStorage
 * Útil antes de hacer cambios importantes
 */
export function backupLocalStorage(): string {
  const backup: Record<string, string | null> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      backup[key] = localStorage.getItem(key);
    }
  }

  const backupString = JSON.stringify(backup, null, 2);
  console.log('📦 Backup creado - Tamaño:', (backupString.length / 1024).toFixed(2), 'KB');
  
  return backupString;
}

/**
 * Restaurar datos desde un backup
 * 🔒🔒🔒 PROTECCIÓN MÁXIMA: Al restaurar, marcar INMEDIATAMENTE como protegido
 */
export function restoreLocalStorage(backupString: string) {
  try {
    // 🔒🔒🔒 PASO 1: MARCAR INMEDIATAMENTE COMO PROTEGIDO ANTES DE RESTAURAR
    localStorage.setItem('sistema_con_datos_reales', 'true');
    localStorage.setItem('limpieza_completa_ejecutada', 'true');
    localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
    console.log('🔒🔒🔒 PRE-PROTECCIÓN ACTIVADA - Sistema marcado como CON DATOS REALES');
    
    const backup = JSON.parse(backupString);
    
    // 🔒 PASO 2: RESTAURAR LOS DATOS
    Object.entries(backup).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(key, value as string);
      }
    });
    
    console.log('✅ Datos restaurados exitosamente');
    
    // 🔒🔒🔒 PASO 3: MARCAR NUEVAMENTE COMO PROTEGIDO DESPUÉS DE RESTAURAR
    // (por si el backup tenía flags diferentes)
    localStorage.setItem('sistema_con_datos_reales', 'true');
    localStorage.setItem('limpieza_completa_ejecutada', 'true');
    localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
    
    // 🔒 PASO 4: Marcar usando la función oficial también
    try {
      marcarComoSistemaConDatosReales();
      console.log('🔒 Backup restaurado - Sistema RE-MARCADO como CON DATOS REALES');
    } catch (error) {
      console.warn('⚠️ No se pudo marcar el sistema como con datos reales:', error);
    }
    
    // 🔒 PASO 5: Aplicar protección post-restauración
    aplicarProteccionPostRestauracion();
    
    // 🔒 PASO 6: Verificar restauración protegida
    verificarRestauracionProtegida();
    
    // 🔒 PASO 7: Mostrar resumen de restauración
    mostrarResumenRestauracion();
    
    console.log('🔒🔒🔒 PROTECCIÓN POST-RESTAURACIÓN COMPLETA');
    console.log('🛡️ Limpieza automática PERMANENTEMENTE DESHABILITADA');
    
    // 🔄 PASO 8: Disparar evento para que los componentes recarguen sus datos
    try {
      window.dispatchEvent(new CustomEvent('backupRestored'));
      console.log('🔄 Evento backupRestored disparado - Componentes recargando datos...');
    } catch (error) {
      console.warn('⚠️ No se pudo disparar evento backupRestored:', error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al restaurar backup:', error);
    return false;
  }
}

/**
 * Exportar datos como archivo descargable
 */
export function downloadBackup() {
  const backup = backupLocalStorage();
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `banque-alimentaire-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('💾 Backup descargado');
}

/**
 * Lista todas las claves en localStorage con sus tamaños
 */
export function inspectLocalStorage() {
  console.log('🔍 Inspección de localStorage:');
  console.log('═══════════════════════════════════════');
  
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      const size = value ? value.length : 0;
      totalSize += size;
      
      console.log(`📝 ${key}: ${(size / 1024).toFixed(2)} KB`);
    }
  }
  
  console.log('═══════════════════════════════════════');
  console.log(`📊 Total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`💾 Espacio usado: ${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)}% de ~5MB`);
}