/**
 * Sistema de Backup Automático
 * Gestiona la configuración y ejecución de backups automáticos
 */

import {
  soportaFileSystemAccess,
  guardarArchivoEnCarpeta,
  tieneCarpetaSeleccionada,
  obtenerNombreCarpeta
} from './fileSystemAccess';

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: BackupFrequency;
  time: string; // Formato HH:MM (24 horas)
  maxBackups: number; // Número máximo de backups a mantener
  lastBackup?: string; // ISO timestamp del último backup
  nextBackup?: string; // ISO timestamp del próximo backup
  autoDownload: boolean; // Auto-descargar backups automáticos
  filePrefix: string; // Prefijo personalizado para nombres de archivo
  customFolder: boolean; // Si usa carpeta personalizada
  folderName?: string; // Nombre de la carpeta seleccionada (solo para mostrar)
}

export interface StoredBackup {
  id: string;
  timestamp: string;
  data: string;
  size: number; // Tamaño en bytes
  automatic: boolean; // Si fue generado automáticamente
}

const AUTO_BACKUP_CONFIG_KEY = 'autoBackupConfig';
const STORED_BACKUPS_KEY = 'storedBackups';

// Configuración por defecto
const DEFAULT_CONFIG: AutoBackupConfig = {
  enabled: false,
  frequency: 'weekly',
  time: '02:00', // 2 AM por defecto
  maxBackups: 5,
  autoDownload: false,
  filePrefix: 'backup',
  customFolder: false
};

// Variable global para almacenar el ID del intervalo
let backupIntervalId: NodeJS.Timeout | null = null;

/**
 * Obtener la configuración de backup automático
 */
export function obtenerConfigAutoBackup(): AutoBackupConfig {
  try {
    const config = localStorage.getItem(AUTO_BACKUP_CONFIG_KEY);
    if (config) {
      const parsedConfig = JSON.parse(config);
      // Asegurar compatibilidad con configuraciones antiguas
      return {
        ...DEFAULT_CONFIG,
        ...parsedConfig
      };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error al obtener config de auto backup:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Guardar la configuración de backup automático
 */
export function guardarConfigAutoBackup(config: AutoBackupConfig): void {
  try {
    // Calcular el próximo backup
    config.nextBackup = calcularProximoBackup(config).toISOString();
    localStorage.setItem(AUTO_BACKUP_CONFIG_KEY, JSON.stringify(config));
    
    console.log('💾 Configuración de backup actualizada:', {
      enabled: config.enabled,
      frequency: config.frequency,
      time: config.time,
      nextBackup: config.nextBackup
    });
    
    // Re-inicializar el sistema de backup con la nueva configuración
    inicializarAutoBackup();
    
    // Dispatch event para notificar cambios
    window.dispatchEvent(new CustomEvent('autoBackupConfigUpdated', { detail: config }));
  } catch (error) {
    console.error('Error al guardar config de auto backup:', error);
  }
}

/**
 * Obtener todos los backups almacenados
 */
export function obtenerBackupsAlmacenados(): StoredBackup[] {
  try {
    const backups = localStorage.getItem(STORED_BACKUPS_KEY);
    if (backups) {
      return JSON.parse(backups);
    }
    return [];
  } catch (error) {
    console.error('Error al obtener backups almacenados:', error);
    return [];
  }
}

/**
 * Guardar un backup
 */
export function guardarBackup(data: string, automatic: boolean = false): StoredBackup {
  try {
    const backups = obtenerBackupsAlmacenados();
    const config = obtenerConfigAutoBackup();
    
    const newBackup: StoredBackup = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: data,
      size: new Blob([data]).size,
      automatic: automatic
    };
    
    // Agregar el nuevo backup al inicio
    backups.unshift(newBackup);
    
    // Mantener solo los últimos N backups
    const trimmedBackups = backups.slice(0, config.maxBackups);
    
    localStorage.setItem(STORED_BACKUPS_KEY, JSON.stringify(trimmedBackups));
    
    // Actualizar último backup en config
    if (automatic) {
      const updatedConfig = { ...config, lastBackup: newBackup.timestamp };
      guardarConfigAutoBackup(updatedConfig);
    }
    
    return newBackup;
  } catch (error) {
    console.error('Error al guardar backup:', error);
    throw error;
  }
}

/**
 * Eliminar un backup específico
 */
export function eliminarBackup(backupId: string): void {
  try {
    const backups = obtenerBackupsAlmacenados();
    const filteredBackups = backups.filter(b => b.id !== backupId);
    localStorage.setItem(STORED_BACKUPS_KEY, JSON.stringify(filteredBackups));
  } catch (error) {
    console.error('Error al eliminar backup:', error);
  }
}

/**
 * Limpiar todos los backups automáticos antiguos
 */
export function limpiarBackupsAntiguos(): void {
  try {
    const backups = obtenerBackupsAlmacenados();
    const config = obtenerConfigAutoBackup();
    
    // Mantener solo los backups manuales y los últimos N automáticos
    const backupsAutomaticos = backups.filter(b => b.automatic).slice(0, config.maxBackups);
    const backupsManuales = backups.filter(b => !b.automatic);
    
    const cleanedBackups = [...backupsManuales, ...backupsAutomaticos];
    localStorage.setItem(STORED_BACKUPS_KEY, JSON.stringify(cleanedBackups));
  } catch (error) {
    console.error('Error al limpiar backups antiguos:', error);
  }
}

/**
 * Calcular la fecha del próximo backup basado en la configuración
 */
export function calcularProximoBackup(config: AutoBackupConfig): Date {
  const now = new Date();
  const [hours, minutes] = config.time.split(':').map(Number);
  
  const nextBackup = new Date();
  nextBackup.setHours(hours, minutes, 0, 0);
  
  // Si la hora ya pasó hoy, programar para el siguiente período
  if (nextBackup <= now) {
    switch (config.frequency) {
      case 'daily':
        nextBackup.setDate(nextBackup.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(nextBackup.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        break;
    }
  }
  
  return nextBackup;
}

/**
 * Verificar si es momento de ejecutar un backup
 */
export function debeEjecutarBackup(): boolean {
  const config = obtenerConfigAutoBackup();
  
  if (!config.enabled) {
    return false;
  }
  
  const now = new Date();
  const nextBackup = config.nextBackup ? new Date(config.nextBackup) : null;
  
  if (!nextBackup) {
    console.log('⏰ Primera ejecución de backup - programando backup inmediato');
    return true; // Primera vez
  }
  
  const shouldBackup = now >= nextBackup;
  
  if (shouldBackup) {
    console.log('⏰ Es momento de ejecutar backup:', {
      ahora: now.toLocaleString('fr-CA'),
      programado: nextBackup.toLocaleString('fr-CA')
    });
  }
  
  return shouldBackup;
}

/**
 * Ejecutar backup automático
 */
export function ejecutarBackupAutomatico(): boolean {
  try {
    console.log('🔄 Iniciando backup automático...');
    const config = obtenerConfigAutoBackup();
    
    // Crear backup de todo el localStorage (excepto los backups mismos)
    const backup: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== STORED_BACKUPS_KEY) {
        const value = localStorage.getItem(key);
        if (value) {
          backup[key] = value;
        }
      }
    }
    
    console.log(`📦 Datos a respaldar: ${Object.keys(backup).length} claves`);
    
    const backupData = JSON.stringify(backup, null, 2);
    const savedBackup = guardarBackup(backupData, true);
    
    console.log(`✅ Backup guardado: ${savedBackup.id} (${formatearTamano(savedBackup.size)})`);
    
    // Auto-descargar si está configurado
    if (config.autoDownload) {
      console.log('📥 Auto-descargando backup...');
      descargarBackup(savedBackup, config.filePrefix);
    }
    
    // Limpiar backups antiguos
    limpiarBackupsAntiguos();
    
    console.log('✅ Backup automático ejecutado exitosamente');
    console.log(`📅 Próximo backup: ${config.nextBackup ? new Date(config.nextBackup).toLocaleString('fr-CA') : 'No programado'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar backup automático:', error);
    return false;
  }
}

/**
 * Descargar un backup específico
 */
export async function descargarBackup(backup: StoredBackup, customPrefix?: string): Promise<void> {
  try {
    const config = obtenerConfigAutoBackup();
    const prefix = customPrefix || config.filePrefix || 'backup';
    const fecha = new Date(backup.timestamp).toISOString().split('T')[0];
    const hora = new Date(backup.timestamp).toTimeString().split(' ')[0].replace(/:/g, '-');
    const tipo = backup.automatic ? 'auto' : 'manual';
    const nombreArchivo = `${prefix}-${tipo}-${fecha}-${hora}.json`;
    
    console.log('📥 Descargando backup:', {
      id: backup.id,
      tamaño: formatearTamano(backup.size),
      automático: backup.automatic,
      carpetaPersonalizada: config.customFolder,
      nombreArchivo: nombreArchivo
    });
    
    // Si está configurada carpeta personalizada y es soportada, intentar guardar ahí
    if (config.customFolder && soportaFileSystemAccess() && tieneCarpetaSeleccionada()) {
      console.log('📁 Intentando guardar en carpeta personalizada...');
      const resultado = await guardarArchivoEnCarpeta(nombreArchivo, backup.data);
      
      if (resultado.success) {
        console.log(`✅ Backup guardado en carpeta personalizada: ${nombreArchivo}`);
        return;
      } else {
        console.warn('⚠️ No se pudo guardar en carpeta personalizada, usando descarga normal');
        console.warn('Razón:', resultado.error || 'Desconocida');
      }
    } else {
      if (config.customFolder) {
        console.log('ℹ️ Carpeta personalizada configurada pero no disponible:');
        console.log('  - Soporta File System Access:', soportaFileSystemAccess());
        console.log('  - Carpeta seleccionada:', tieneCarpetaSeleccionada());
      }
    }
    
    // Fallback: Descarga normal
    console.log('📥 Usando descarga normal del navegador...');
    const blob = new Blob([backup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('✅ Descarga iniciada:', nombreArchivo);
  } catch (error) {
    console.error('❌ Error al descargar backup:', error);
    throw error;
  }
}

/**
 * Descargar todos los backups como archivos ZIP simulado
 * (Descarga cada uno individualmente debido a limitaciones del navegador)
 */
export function descargarTodosLosBackups(): number {
  try {
    const backups = obtenerBackupsAlmacenados();
    const config = obtenerConfigAutoBackup();
    
    backups.forEach((backup, index) => {
      // Pequeño delay entre descargas para evitar bloqueos del navegador
      setTimeout(() => {
        descargarBackup(backup, config.filePrefix);
      }, index * 200);
    });
    
    return backups.length;
  } catch (error) {
    console.error('Error al descargar todos los backups:', error);
    return 0;
  }
}

/**
 * Formatear tamaño de archivo
 */
export function formatearTamano(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatear fecha de manera legible
 */
export function formatearFecha(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtener el tiempo restante hasta el próximo backup
 */
export function obtenerTiempoRestante(config: AutoBackupConfig): string {
  if (!config.enabled || !config.nextBackup) {
    return 'Désactivé';
  }
  
  const now = new Date();
  const next = new Date(config.nextBackup);
  const diff = next.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Bientôt';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}j ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes}min`;
  }
}

/**
 * Inicializar el sistema de backup automático
 * Debe llamarse al cargar la aplicación
 */
export function inicializarAutoBackup(): void {
  const config = obtenerConfigAutoBackup();
  
  // Limpiar intervalo anterior si existe
  if (backupIntervalId) {
    clearInterval(backupIntervalId);
    backupIntervalId = null;
    console.log('🧹 Intervalo de backup anterior limpiado');
  }
  
  if (!config.enabled) {
    console.log('⏸️ Sistema de backup automático desactivado');
    return;
  }
  
  // Verificar inmediatamente si hay un backup pendiente
  if (debeEjecutarBackup()) {
    console.log('⏰ Ejecutando backup pendiente...');
    ejecutarBackupAutomatico();
  }
  
  // Verificar cada minuto si es momento de hacer backup
  backupIntervalId = setInterval(() => {
    const currentConfig = obtenerConfigAutoBackup();
    
    // Verificar si el backup sigue habilitado
    if (!currentConfig.enabled) {
      console.log('⏸️ Backup automático desactivado, deteniendo verificaciones');
      if (backupIntervalId) {
        clearInterval(backupIntervalId);
        backupIntervalId = null;
      }
      return;
    }
    
    if (debeEjecutarBackup()) {
      console.log('⏰ Es momento de ejecutar backup automático');
      ejecutarBackupAutomatico();
    }
  }, 60000); // Cada minuto
  
  console.log('🔄 Sistema de backup automático inicializado');
  console.log(`📅 Próximo backup: ${config.nextBackup ? new Date(config.nextBackup).toLocaleString('fr-CA') : 'No programado'}`);
}

/**
 * Detener el sistema de backup automático
 */
export function detenerAutoBackup(): void {
  if (backupIntervalId) {
    clearInterval(backupIntervalId);
    backupIntervalId = null;
    console.log('🛑 Sistema de backup automático detenido');
  }
}

/**
 * Función de diagnóstico para verificar el estado del sistema
 */
export function diagnosticarAutoBackup(): void {
  const config = obtenerConfigAutoBackup();
  const backups = obtenerBackupsAlmacenados();
  const now = new Date();
  const nextBackup = config.nextBackup ? new Date(config.nextBackup) : null;
  
  console.log('🔍 ==================== DIAGNÓSTICO DE BACKUP AUTOMÁTICO ====================');
  console.log('📊 Configuración actual:');
  console.log('  - Habilitado:', config.enabled);
  console.log('  - Frecuencia:', config.frequency);
  console.log('  - Hora programada:', config.time);
  console.log('  - Máximo de backups:', config.maxBackups);
  console.log('  - Auto-descarga:', config.autoDownload);
  console.log('  - Prefijo de archivo:', config.filePrefix);
  console.log('  - Carpeta personalizada:', config.customFolder);
  console.log('  - Nombre de carpeta:', config.folderName || 'No seleccionada');
  console.log('');
  console.log('⏰ Tiempos:');
  console.log('  - Último backup:', config.lastBackup ? new Date(config.lastBackup).toLocaleString('fr-CA') : 'Nunca');
  console.log('  - Próximo backup:', nextBackup ? nextBackup.toLocaleString('fr-CA') : 'No programado');
  console.log('  - Tiempo restante:', obtenerTiempoRestante(config));
  console.log('  - Fecha/hora actual:', now.toLocaleString('fr-CA'));
  console.log('');
  console.log('📦 Backups almacenados:');
  console.log('  - Total:', backups.length);
  console.log('  - Automáticos:', backups.filter(b => b.automatic).length);
  console.log('  - Manuales:', backups.filter(b => !b.automatic).length);
  console.log('');
  console.log('🔄 Estado del sistema:');
  console.log('  - Intervalo activo:', backupIntervalId !== null);
  console.log('  - Debe ejecutar backup ahora:', debeEjecutarBackup());
  console.log('===========================================================================');
}