/**
 * Sistema de Backup Automático
 * Gestiona la configuración y ejecución de backups automáticos
 */

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: BackupFrequency;
  time: string; // Formato HH:MM (24 horas)
  maxBackups: number; // Número máximo de backups a mantener
  lastBackup?: string; // ISO timestamp del último backup
  nextBackup?: string; // ISO timestamp del próximo backup
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
};

/**
 * Obtener la configuración de backup automático
 */
export function obtenerConfigAutoBackup(): AutoBackupConfig {
  try {
    const config = localStorage.getItem(AUTO_BACKUP_CONFIG_KEY);
    if (config) {
      return JSON.parse(config);
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
  
  if (!config.enabled) return false;
  
  const now = new Date();
  const nextBackup = config.nextBackup ? new Date(config.nextBackup) : null;
  
  if (!nextBackup) {
    return true; // Primera vez
  }
  
  return now >= nextBackup;
}

/**
 * Ejecutar backup automático
 */
export function ejecutarBackupAutomatico(): boolean {
  try {
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
    
    const backupData = JSON.stringify(backup, null, 2);
    guardarBackup(backupData, true);
    
    console.log('✅ Backup automático ejecutado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar backup automático:', error);
    return false;
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
  
  if (!config.enabled) return;
  
  // Verificar cada minuto si es momento de hacer backup
  setInterval(() => {
    if (debeEjecutarBackup()) {
      ejecutarBackupAutomatico();
    }
  }, 60000); // Cada minuto
  
  console.log('🔄 Sistema de backup automático inicializado');
}
