import { Comanda } from '../types';

const COMANDAS_KEY = 'banco_alimentos_comandas';

// Obtener todas las comandas
export function obtenerComandas(): Comanda[] {
  try {
    const comandasJSON = localStorage.getItem(COMANDAS_KEY);
    if (comandasJSON !== null) {
      return JSON.parse(comandasJSON);
    }
    return [];
  } catch (error) {
    console.error('Error al cargar comandas:', error);
    return [];
  }
}

// Guardar una nueva comanda
export function guardarComanda(comanda: Comanda): void {
  try {
    const comandas = obtenerComandas();
    comandas.push(comanda);
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandas));
  } catch (error) {
    console.error('Error al guardar comanda:', error);
    throw error;
  }
}

// Actualizar una comanda existente
export function actualizarComanda(comandaActualizada: Comanda): void {
  try {
    const comandas = obtenerComandas();
    const index = comandas.findIndex(c => c.id === comandaActualizada.id);
    
    if (index !== -1) {
      comandas[index] = comandaActualizada;
      localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandas));
    }
  } catch (error) {
    console.error('Error al actualizar comanda:', error);
    throw error;
  }
}

// Eliminar una comanda
export function eliminarComanda(comandaId: string): void {
  try {
    const comandas = obtenerComandas();
    const comandasFiltradas = comandas.filter(c => c.id !== comandaId);
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandasFiltradas));
  } catch (error) {
    console.error('Error al eliminar comanda:', error);
    throw error;
  }
}

// Obtener comanda por ID
export function obtenerComandaPorId(comandaId: string): Comanda | null {
  const comandas = obtenerComandas();
  return comandas.find(c => c.id === comandaId) || null;
}

// Obtener comandas por organismo
export function obtenerComandasPorOrganismo(organismoId: string): Comanda[] {
  const comandas = obtenerComandas();
  return comandas.filter(c => c.organismoId === organismoId);
}

// Obtener comandas por estado
export function obtenerComandasPorEstado(estado: Comanda['estado']): Comanda[] {
  const comandas = obtenerComandas();
  return comandas.filter(c => c.estado === estado);
}

// Generar número de comanda
export function generarNumeroComanda(): string {
  const comandas = obtenerComandas();
  const ultimoNumero = comandas.length > 0 
    ? Math.max(...comandas.map(c => {
        const match = c.numero.match(/CMD-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }))
    : 0;
  
  return `CMD-${String(ultimoNumero + 1).padStart(4, '0')}`;
}

// Obtener estadísticas de comandas
export function obtenerEstadisticasComandas() {
  const comandas = obtenerComandas();
  
  return {
    total: comandas.length,
    pendientes: comandas.filter(c => c.estado === 'pendiente').length,
    enPreparacion: comandas.filter(c => c.estado === 'en_preparacion').length,
    completadas: comandas.filter(c => c.estado === 'completada').length,
    entregadas: comandas.filter(c => c.estado === 'entregada').length,
    anuladas: comandas.filter(c => c.estado === 'anulada').length,
  };
}

// Limpiar todas las comandas (útil para producción)
export function limpiarTodasLasComandas(): void {
  try {
    localStorage.setItem(COMANDAS_KEY, JSON.stringify([]));
    console.log('✅ Todas las comandas han sido eliminadas');
  } catch (error) {
    console.error('Error al limpiar comandas:', error);
    throw error;
  }
}