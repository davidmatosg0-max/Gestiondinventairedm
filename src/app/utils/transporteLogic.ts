/**
 * Lógica de negocio para el módulo de Transporte
 * Maneja vehículos, rutas y planificación de entregas
 */

import { toast } from 'sonner';
import { obtenerComandas } from './comandasLogic';
import { obtenerOrganismos } from './organismosLogic';

export type TipoVehiculo = 'furgoneta' | 'camion' | 'refrigerado';
export type EstadoVehiculo = 'disponible' | 'en_ruta' | 'mantenimiento';
export type EstadoRuta = 'planificada' | 'en_curso' | 'completada' | 'cancelada';

export interface Vehiculo {
  id: string;
  matricula: string;
  tipo: TipoVehiculo;
  marca?: string;
  modelo?: string;
  capacidadKg: number;
  capacidadM3: number;
  estado: EstadoVehiculo;
  activo: boolean;
  observaciones?: string;
  ultimoMantenimiento?: string;
  proximoMantenimiento?: string;
  kmActual?: number;
}

export interface ParadaRuta {
  organismoId: string;
  organismoNombre: string;
  direccion: string;
  orden: number;
  comandaId?: string;
  horaEstimada?: string;
  horaReal?: string;
  estado: 'pendiente' | 'entregado' | 'no_entregado';
  observaciones?: string;
  latitud?: number;
  longitud?: number;
}

export interface Ruta {
  id: string;
  numeroRuta: string;
  fecha: string;
  vehiculoId: string;
  vehiculoMatricula: string;
  conductorId?: string;
  conductorNombre?: string;
  estado: EstadoRuta;
  paradas: ParadaRuta[];
  observaciones?: string;
  horaSalida?: string;
  horaRegreso?: string;
  kmInicio?: number;
  kmFin?: number;
  pesoTotalKg: number;
  distanciaTotalKm?: number;
}

// ==================== STORAGE ====================

const VEHICULOS_KEY = 'banco_alimentos_vehiculos';
const RUTAS_KEY = 'banco_alimentos_rutas';

export function obtenerVehiculos(): Vehiculo[] {
  try {
    const datos = localStorage.getItem(VEHICULOS_KEY);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return [];
  }
}

export function guardarVehiculos(vehiculos: Vehiculo[]): boolean {
  try {
    localStorage.setItem(VEHICULOS_KEY, JSON.stringify(vehiculos));
    return true;
  } catch (error) {
    console.error('Error al guardar vehículos:', error);
    return false;
  }
}

export function obtenerRutas(): Ruta[] {
  try {
    const datos = localStorage.getItem(RUTAS_KEY);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    return [];
  }
}

export function guardarRutas(rutas: Ruta[]): boolean {
  try {
    localStorage.setItem(RUTAS_KEY, JSON.stringify(rutas));
    return true;
  } catch (error) {
    console.error('Error al guardar rutas:', error);
    return false;
  }
}

// ==================== VEHICULOS ====================

export function crearVehiculo(datos: Omit<Vehiculo, 'id'>): Vehiculo | null {
  if (!datos.matricula || !datos.tipo || !datos.capacidadKg) {
    toast.error('Datos incompletos para crear el vehículo');
    return null;
  }

  // Verificar que no exista un vehículo con la misma matrícula
  const vehiculos = obtenerVehiculos();
  const matriculaExiste = vehiculos.some(
    v => v.matricula.toLowerCase() === datos.matricula.toLowerCase()
  );

  if (matriculaExiste) {
    toast.error('Ya existe un vehículo con esta matrícula');
    return null;
  }

  const nuevoVehiculo: Vehiculo = {
    id: Date.now().toString(),
    ...datos,
  };

  vehiculos.push(nuevoVehiculo);
  guardarVehiculos(vehiculos);

  toast.success(`Vehículo ${nuevoVehiculo.matricula} creado correctamente`);
  return nuevoVehiculo;
}

export function actualizarVehiculo(id: string, datos: Partial<Vehiculo>): boolean {
  const vehiculos = obtenerVehiculos();
  const index = vehiculos.findIndex(v => v.id === id);
  
  if (index === -1) {
    toast.error('Vehículo no encontrado');
    return false;
  }

  vehiculos[index] = { ...vehiculos[index], ...datos };
  guardarVehiculos(vehiculos);
  
  toast.success('Vehículo actualizado correctamente');
  return true;
}

export function eliminarVehiculo(id: string): boolean {
  const vehiculos = obtenerVehiculos();
  const vehiculo = vehiculos.find(v => v.id === id);
  
  if (!vehiculo) {
    toast.error('Vehículo no encontrado');
    return false;
  }

  // Verificar si tiene rutas asociadas
  const rutas = obtenerRutas();
  const tieneRutas = rutas.some(r => r.vehiculoId === id);

  if (tieneRutas) {
    toast.error('No se puede eliminar un vehículo con rutas asociadas');
    return false;
  }

  const nuevosVehiculos = vehiculos.filter(v => v.id !== id);
  guardarVehiculos(nuevosVehiculos);
  
  toast.success('Vehículo eliminado correctamente');
  return true;
}

export function obtenerVehiculosDisponibles(fecha?: string): Vehiculo[] {
  const vehiculos = obtenerVehiculos();
  
  if (!fecha) {
    return vehiculos.filter(v => v.activo && v.estado === 'disponible');
  }

  // Verificar qué vehículos no tienen rutas en esa fecha
  const rutas = obtenerRutas();
  const vehiculosEnRuta = rutas
    .filter(r => r.fecha === fecha && r.estado !== 'cancelada')
    .map(r => r.vehiculoId);

  return vehiculos.filter(
    v => v.activo && !vehiculosEnRuta.includes(v.id)
  );
}

export function cambiarEstadoVehiculo(id: string, nuevoEstado: EstadoVehiculo): boolean {
  return actualizarVehiculo(id, { estado: nuevoEstado });
}

// ==================== RUTAS ====================

export function generarNumeroRuta(): string {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `RUT-${año}${mes}${dia}-${timestamp}`;
}

export function crearRuta(datos: Omit<Ruta, 'id' | 'numeroRuta'>): Ruta | null {
  if (!datos.fecha || !datos.vehiculoId || datos.paradas.length === 0) {
    toast.error('Datos incompletos para crear la ruta');
    return null;
  }

  // Verificar que el vehículo exista y esté disponible
  const vehiculos = obtenerVehiculos();
  const vehiculo = vehiculos.find(v => v.id === datos.vehiculoId);

  if (!vehiculo) {
    toast.error('Vehículo no encontrado');
    return null;
  }

  if (!vehiculo.activo) {
    toast.error('El vehículo no está activo');
    return null;
  }

  // Verificar capacidad
  if (datos.pesoTotalKg > vehiculo.capacidadKg) {
    toast.error(`El peso total (${datos.pesoTotalKg} kg) excede la capacidad del vehículo (${vehiculo.capacidadKg} kg)`);
    return null;
  }

  const nuevaRuta: Ruta = {
    id: Date.now().toString(),
    numeroRuta: generarNumeroRuta(),
    ...datos,
  };

  const rutas = obtenerRutas();
  rutas.push(nuevaRuta);
  guardarRutas(rutas);

  // Actualizar estado del vehículo
  cambiarEstadoVehiculo(datos.vehiculoId, 'en_ruta');

  toast.success(`Ruta ${nuevaRuta.numeroRuta} creada correctamente`);
  return nuevaRuta;
}

export function actualizarRuta(id: string, datos: Partial<Ruta>): boolean {
  const rutas = obtenerRutas();
  const index = rutas.findIndex(r => r.id === id);
  
  if (index === -1) {
    toast.error('Ruta no encontrada');
    return false;
  }

  rutas[index] = { ...rutas[index], ...datos };
  guardarRutas(rutas);
  
  toast.success('Ruta actualizada correctamente');
  return true;
}

export function cambiarEstadoRuta(id: string, nuevoEstado: EstadoRuta): boolean {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === id);
  
  if (!ruta) {
    toast.error('Ruta no encontrada');
    return false;
  }

  // Si la ruta se completa o cancela, liberar el vehículo
  if (nuevoEstado === 'completada' || nuevoEstado === 'cancelada') {
    cambiarEstadoVehiculo(ruta.vehiculoId, 'disponible');
  }

  // Si la ruta pasa a en_curso, marcar vehículo en ruta
  if (nuevoEstado === 'en_curso') {
    cambiarEstadoVehiculo(ruta.vehiculoId, 'en_ruta');
  }

  return actualizarRuta(id, { estado: nuevoEstado });
}

export function eliminarRuta(id: string): boolean {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === id);
  
  if (!ruta) {
    toast.error('Ruta no encontrada');
    return false;
  }

  // Si la ruta estaba en curso, liberar el vehículo
  if (ruta.estado === 'en_curso') {
    cambiarEstadoVehiculo(ruta.vehiculoId, 'disponible');
  }

  const nuevasRutas = rutas.filter(r => r.id !== id);
  guardarRutas(nuevasRutas);
  
  toast.success('Ruta eliminada correctamente');
  return true;
}

// ==================== PARADAS ====================

export function actualizarParada(
  rutaId: string,
  paradaIndex: number,
  datos: Partial<ParadaRuta>
): boolean {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === rutaId);
  
  if (!ruta || !ruta.paradas[paradaIndex]) {
    toast.error('Ruta o parada no encontrada');
    return false;
  }

  ruta.paradas[paradaIndex] = { ...ruta.paradas[paradaIndex], ...datos };
  
  return actualizarRuta(rutaId, { paradas: ruta.paradas });
}

export function marcarParadaComoEntregada(
  rutaId: string,
  paradaIndex: number,
  horaReal?: string
): boolean {
  return actualizarParada(rutaId, paradaIndex, {
    estado: 'entregado',
    horaReal: horaReal || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  });
}

export function marcarParadaComoNoEntregada(
  rutaId: string,
  paradaIndex: number,
  observaciones: string
): boolean {
  return actualizarParada(rutaId, paradaIndex, {
    estado: 'no_entregado',
    observaciones,
  });
}

// ==================== OPTIMIZACIÓN DE RUTAS ====================

export function optimizarRuta(paradas: ParadaRuta[]): ParadaRuta[] {
  // Algoritmo simple: ordenar por latitud y longitud
  // En una implementación real, usar un algoritmo de optimización de rutas (TSP)
  
  if (paradas.length <= 1) return paradas;

  const paradasOrdenadas = [...paradas].sort((a, b) => {
    if (!a.latitud || !b.latitud) return 0;
    if (a.latitud !== b.latitud) {
      return a.latitud - b.latitud;
    }
    if (!a.longitud || !b.longitud) return 0;
    return a.longitud - b.longitud;
  });

  // Actualizar orden
  return paradasOrdenadas.map((parada, index) => ({
    ...parada,
    orden: index + 1,
  }));
}

export function calcularDistanciaRuta(paradas: ParadaRuta[]): number {
  // Calcular distancia total aproximada entre paradas
  let distanciaTotal = 0;

  for (let i = 0; i < paradas.length - 1; i++) {
    const parada1 = paradas[i];
    const parada2 = paradas[i + 1];

    if (parada1.latitud && parada1.longitud && parada2.latitud && parada2.longitud) {
      const distancia = calcularDistanciaEntrePuntos(
        parada1.latitud,
        parada1.longitud,
        parada2.latitud,
        parada2.longitud
      );
      distanciaTotal += distancia;
    }
  }

  return Math.round(distanciaTotal * 100) / 100;
}

function calcularDistanciaEntrePuntos(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==================== ASIGNACIÓN AUTOMÁTICA ====================

export function asignarVehiculoOptimo(pesoTotalKg: number, fecha: string): Vehiculo | null {
  const vehiculosDisponibles = obtenerVehiculosDisponibles(fecha);
  
  // Filtrar vehículos con capacidad suficiente
  const vehiculosAptos = vehiculosDisponibles.filter(
    v => v.capacidadKg >= pesoTotalKg
  );

  if (vehiculosAptos.length === 0) {
    toast.error('No hay vehículos disponibles con capacidad suficiente');
    return null;
  }

  // Seleccionar el vehículo con menor capacidad que cumpla (optimización)
  const vehiculoOptimo = vehiculosAptos.reduce((mejor, actual) => 
    actual.capacidadKg < mejor.capacidadKg ? actual : mejor
  );

  return vehiculoOptimo;
}

// ==================== ESTADÍSTICAS ====================

export function obtenerEstadisticasTransporte() {
  const vehiculos = obtenerVehiculos();
  const rutas = obtenerRutas();
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  return {
    totalVehiculos: vehiculos.length,
    vehiculosDisponibles: vehiculos.filter(v => v.activo && v.estado === 'disponible').length,
    vehiculosEnRuta: vehiculos.filter(v => v.estado === 'en_ruta').length,
    vehiculosMantenimiento: vehiculos.filter(v => v.estado === 'mantenimiento').length,
    totalRutas: rutas.length,
    rutasEsteMes: rutas.filter(r => new Date(r.fecha) >= primerDiaMes).length,
    rutasCompletadas: rutas.filter(r => r.estado === 'completada').length,
    rutasEnCurso: rutas.filter(r => r.estado === 'en_curso').length,
    rutasPlanificadas: rutas.filter(r => r.estado === 'planificada').length,
    kmTotales: rutas.reduce((sum, r) => {
      if (r.kmFin && r.kmInicio) {
        return sum + (r.kmFin - r.kmInicio);
      }
      return sum;
    }, 0),
  };
}

// ==================== FILTROS ====================

export function obtenerRutasPorFecha(fecha: string): Ruta[] {
  return obtenerRutas().filter(r => r.fecha === fecha);
}

export function obtenerRutasPorVehiculo(vehiculoId: string): Ruta[] {
  return obtenerRutas().filter(r => r.vehiculoId === vehiculoId);
}

export function obtenerRutasPorEstado(estado: EstadoRuta): Ruta[] {
  return obtenerRutas().filter(r => r.estado === estado);
}

// ==================== EXPORTAR ====================

export function exportarRuta(rutaId: string): string {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === rutaId);
  
  if (!ruta) return '';
  
  return JSON.stringify(ruta, null, 2);
}
