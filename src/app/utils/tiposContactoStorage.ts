import { TipoContacto } from './contactosDepartamentoStorage';

export interface TipoContactoPersonalizado {
  id: string;
  code: TipoContacto | string;
  label: string;
  icon: string; // Nombre del icono de lucide-react
  color: string;
  bgColor: string;
  isPredefined: boolean;
  dateCreated: string; // Nueva propiedad para rastrear cuándo fue creado
}

const STORAGE_KEY = 'banque_alimentaire_tipos_contacto_personalizados';

// ❌ DESHABILITADO: No inicializar tipos predefinidos automáticamente
// Los tipos de contacto deben ser creados manualmente por el usuario
// Esto permite que la limpieza completa del sistema funcione correctamente
function inicializarTiposPredefinidosInicial(): void {
  // Esta función ya no inicializa tipos automáticamente
  // El sistema empieza completamente vacío después de la limpieza
  return;
}

// Obtener todos los tipos de contacto
export function obtenerTiposContacto(): TipoContactoPersonalizado[] {
  try {
    // Ya NO llama a inicializarTiposPredefinidosInicial()
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener tipos de contacto:', error);
    return [];
  }
}

export function obtenerTiposPersonalizados(): TipoContactoPersonalizado[] {
  // Ahora todos los tipos son "personalizados" (creados por el usuario)
  return obtenerTiposContacto();
}

export function guardarTipoPersonalizado(tipo: Omit<TipoContactoPersonalizado, 'id' | 'isPredefined' | 'dateCreated'>): TipoContactoPersonalizado {
  const tipos = obtenerTiposContacto();
  const nuevoTipo: TipoContactoPersonalizado = {
    ...tipo,
    id: `tipo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    isPredefined: true, // Todos los tipos creados se guardan como predefinidos permanentes
    dateCreated: new Date().toISOString() // Registrar fecha de creación
  };
  
  tipos.push(nuevoTipo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
  
  console.log(`✅ Tipo de contacto "${nuevoTipo.label}" (${nuevoTipo.code}) guardado permanentemente`);
  console.log(`📊 Total de tipos de contacto: ${tipos.length}`);
  
  return nuevoTipo;
}

export function actualizarTipoPersonalizado(id: string, datos: Partial<TipoContactoPersonalizado>): void {
  const tipos = obtenerTiposContacto();
  const index = tipos.findIndex(t => t.id === id);
  
  if (index !== -1) {
    tipos[index] = { ...tipos[index], ...datos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
  }
}

export function eliminarTipoPersonalizado(id: string): void {
  const tipos = obtenerTiposContacto();
  const tiposFiltrados = tipos.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposFiltrados));
}

export function existeCodigoTipo(code: string, excludeId?: string): boolean {
  const todosTipos = obtenerTiposContacto();
  return todosTipos.some(t => t.code === code && t.id !== excludeId);
}

// Iconos disponibles para selección
export const ICONOS_DISPONIBLES = [
  'User', 'UserCheck', 'UserPlus', 'Users', 'Heart', 'Star', 
  'Building', 'Building2', 'Briefcase', 'Stethoscope', 
  'ShieldCheck', 'Award', 'Crown', 'Zap', 'Sparkles',
  'Phone', 'Mail', 'MessageCircle', 'Package', 'Truck'
];

// Colores predefinidos para selección
export const COLORES_DISPONIBLES = [
  { name: 'Azul', value: '#1a4d7a', bg: '#DBEAFE' },
  { name: 'Verde', value: '#2d9561', bg: '#D1FAE5' },
  { name: 'Rojo', value: '#DC2626', bg: '#FEE2E2' },
  { name: 'Amarillo', value: '#F59E0B', bg: '#FEF3C7' },
  { name: 'Púrpura', value: '#8B5CF6', bg: '#EDE9FE' },
  { name: 'Rosa', value: '#EC4899', bg: '#FCE7F3' },
  { name: 'Gris', value: '#6B7280', bg: '#F3F4F6' },
  { name: 'Naranja', value: '#F97316', bg: '#FFEDD5' },
  { name: 'Índigo', value: '#4F46E5', bg: '#E0E7FF' },
  { name: 'Turquesa', value: '#14B8A6', bg: '#CCFBF1' }
];

/**
 * Exportar todos los tipos de contacto a JSON
 * Útil para hacer respaldos o migrar configuraciones
 */
export function exportarTiposContacto(): string {
  const tipos = obtenerTiposContacto();
  return JSON.stringify(tipos, null, 2);
}

/**
 * Importar tipos de contacto desde JSON
 * @param jsonData - String JSON con los tipos de contacto
 * @param sobrescribir - Si true, reemplaza todos los tipos existentes. Si false, agrega sin duplicar
 */
export function importarTiposContacto(jsonData: string, sobrescribir: boolean = false): { success: boolean; message: string; count: number } {
  try {
    const tiposImportados: TipoContactoPersonalizado[] = JSON.parse(jsonData);
    
    if (!Array.isArray(tiposImportados)) {
      return { success: false, message: 'Format JSON invalide', count: 0 };
    }
    
    // Validar estructura de cada tipo
    const tiposValidos = tiposImportados.filter(tipo => 
      tipo.code && tipo.label && tipo.icon && tipo.color && tipo.bgColor
    );
    
    if (tiposValidos.length === 0) {
      return { success: false, message: 'Aucun type valide trouvé dans le JSON', count: 0 };
    }
    
    if (sobrescribir) {
      // Reemplazar todos los tipos existentes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposValidos));
      console.log(`✅ ${tiposValidos.length} tipos de contacto importados (sobrescribiendo existentes)`);
      return { success: true, message: `${tiposValidos.length} types importés avec succès (remplacé)`, count: tiposValidos.length };
    } else {
      // Agregar sin duplicar
      const tiposExistentes = obtenerTiposContacto();
      const codigosExistentes = new Set(tiposExistentes.map(t => t.code));
      
      const tiposNuevos = tiposValidos.filter(tipo => !codigosExistentes.has(tipo.code));
      
      if (tiposNuevos.length === 0) {
        return { success: false, message: 'Tous les types importés existent déjà', count: 0 };
      }
      
      const tiposCombinados = [...tiposExistentes, ...tiposNuevos];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposCombinados));
      console.log(`✅ ${tiposNuevos.length} nuevos tipos de contacto agregados (total: ${tiposCombinados.length})`);
      return { success: true, message: `${tiposNuevos.length} nouveaux types ajoutés avec succès`, count: tiposNuevos.length };
    }
  } catch (error) {
    console.error('❌ Error al importar tipos de contacto:', error);
    return { success: false, message: 'Erreur lors de l\'importation: ' + (error as Error).message, count: 0 };
  }
}

/**
 * Obtener estadísticas de los tipos de contacto
 */
export function obtenerEstadisticasTipos(): {
  total: number;
  predefinidos: number;
  personalizados: number;
  fechaCreacionMasAntigua: string | null;
  fechaCreacionMasReciente: string | null;
} {
  const tipos = obtenerTiposContacto();
  const conFecha = tipos.filter(t => t.dateCreated);
  
  return {
    total: tipos.length,
    predefinidos: tipos.filter(t => t.isPredefined).length,
    personalizados: tipos.filter(t => !t.isPredefined).length,
    fechaCreacionMasAntigua: conFecha.length > 0 
      ? conFecha.reduce((min, t) => t.dateCreated < min ? t.dateCreated : min, conFecha[0].dateCreated)
      : null,
    fechaCreacionMasReciente: conFecha.length > 0
      ? conFecha.reduce((max, t) => t.dateCreated > max ? t.dateCreated : max, conFecha[0].dateCreated)
      : null
  };
}