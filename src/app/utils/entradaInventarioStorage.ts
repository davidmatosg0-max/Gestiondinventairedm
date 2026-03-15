/**
 * Sistema de Almacenamiento de Entradas de Inventario
 * Gestiona el almacenamiento persistente en localStorage de todas las entradas
 * de productos (Don/Achat) registradas en el sistema
 */

import { mockProductos, mockMovimientos } from '../data/mockData';
import { 
  guardarProducto, 
  actualizarProducto, 
  obtenerProductoPorId,
  obtenerProductosActivos,
  type ProductoCreado 
} from './productStorage';
import { registrarEntrada as registrarMovimientoEntrada } from './movimientoStorage';

export type EntradaInventario = {
  id: string;
  fecha: string; // ISO string
  tipoEntrada: string; // 'don', 'achat', etc.
  programaNombre: string;
  programaCodigo: string;
  programaColor: string;
  programaIcono: string;
  
  // Información del donador/proveedor
  donadorId: string;
  donadorNombre: string;
  donadorEsCustom: boolean;
  
  // Información del participante PRS (opcional, solo para programa PRS)
  participantePRSId?: string;
  participantePRSNombre?: string;
  
  // Información del producto
  productoId: string;
  nombreProducto: string;
  categoria?: string; // Alias para compatibilidad
  subcategoria?: string; // Alias para compatibilidad
  productoCategoria?: string;
  productoSubcategoria?: string;
  productoIcono?: string;
  productoCodigo?: string;
  varianteId?: string;
  variante?: {
    id: string;
    nombre: string;
    codigo?: string;
    icono?: string;
  };
  
  // Cantidades
  cantidad: number;
  unidad: string;
  pesoUnidad: number; // kg por unidad
  pesoTotal: number; // cantidad × pesoUnidad
  
  // Temperatura
  temperatura: 'ambiente' | 'refrigerado' | 'congelado';
  
  // Detalles opcionales
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string; // Ejemplo: "45x900ml", "24x500g"
  observaciones?: string;
  
  // Metadata
  creadoPor?: string;
  fechaCreacion: string;
  activo: boolean;
};

const STORAGE_KEY = 'banco_alimentos_entradas_inventario';

/**
 * Obtener todas las entradas de inventario
 */
export function obtenerTodasLasEntradas(): EntradaInventario[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener entradas de inventario:', error);
    return [];
  }
}

/**
 * Alias para obtenerTodasLasEntradas (compatibilidad)
 */
export const obtenerEntradas = obtenerTodasLasEntradas;

/**
 * Obtener solo las entradas activas
 */
export function obtenerEntradasActivas(): EntradaInventario[] {
  return obtenerTodasLasEntradas().filter(entrada => entrada.activo);
}

/**
 * Obtener una entrada por ID
 */
export function obtenerEntradaPorId(id: string): EntradaInventario | undefined {
  return obtenerTodasLasEntradas().find(entrada => entrada.id === id);
}

/**
 * Guardar una nueva entrada de inventario
 * ✅ AUTOMÁTICAMENTE registra el producto en el inventario (mockProductos)
 * ✅ AUTOMÁTICAMENTE crea el movimiento de inventario (mockMovimientos)
 * ✅ AUTOMÁTICAMENTE guarda en el historial de entradas (localStorage)
 * 
 * Esta función hace TODO el trabajo necesario:
 * - Si el producto existe: actualiza su stock
 * - Si es nuevo: lo crea con todos sus datos
 * - Registra el movimiento de entrada
 * - Guarda en el historial persistente
 * 
 * NO es necesario hacer ningún registro manual adicional.
 */
export function guardarEntrada(entrada: Omit<EntradaInventario, 'id' | 'fechaCreacion' | 'activo'>): EntradaInventario {
  const entradas = obtenerTodasLasEntradas();
  
  const nuevaEntrada: EntradaInventario = {
    ...entrada,
    id: `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fechaCreacion: new Date().toISOString(),
    activo: true,
  };
  
  entradas.push(nuevaEntrada);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
  
  // ✅ REGISTRAR AUTOMÁTICAMENTE EN EL INVENTARIO
  registrarEnInventario(nuevaEntrada);
  
  return nuevaEntrada;
}

/**
 * Función auxiliar para registrar una entrada en el inventario automáticamente
 * ✅ ACTUALIZADO: Ahora guarda productos persistentemente en localStorage
 */
function registrarEnInventario(entrada: EntradaInventario) {
  // Determinar la categoría correcta (puede venir en varios campos)
  const categoriaFinal = entrada.categoria || entrada.productoCategoria || 'Sin categoría';
  const subcategoriaFinal = entrada.subcategoria || entrada.productoSubcategoria || '';
  
  console.log(`📦 Registrando en inventario: ${entrada.nombreProducto} (${entrada.cantidad} ${entrada.unidad})`);
  
  // 🔄 PASO 1: Verificar si el producto ya existe en localStorage (persistente)
  // ⚠️ REGLA IMPORTANTE: Productos con diferente peso unitario o variante son productos DIFERENTES
  const productosLocalStorage = obtenerProductosActivos();
  
  // Tolerancia para comparar pesos (0.001 kg = 1 gramo)
  const TOLERANCIA_PESO = 0.001;
  
  const productoExistenteLS = productosLocalStorage.find((p) => {
    const nombreCoincide = p.nombre.toLowerCase() === entrada.nombreProducto.toLowerCase();
    const categoriaCoincide = p.categoria === categoriaFinal;
    const subcategoriaCoincide = p.subcategoria === subcategoriaFinal;
    
    // Verificar si el peso unitario es el mismo (con tolerancia)
    const pesoUnitarioProducto = p.pesoUnitario || 0;
    const pesoCoincide = Math.abs(pesoUnitarioProducto - entrada.pesoUnidad) < TOLERANCIA_PESO;
    
    // Si todo coincide (nombre, categoría, subcategoría y peso unitario), es el MISMO producto
    return nombreCoincide && categoriaCoincide && subcategoriaCoincide && pesoCoincide;
  });
  
  console.log(`🔍 Producto existente encontrado: ${productoExistenteLS ? productoExistenteLS.nombre : 'NO'} (Total productos en localStorage: ${productosLocalStorage.length})`);

  // 🔄 PASO 2: Verificar si el producto existe en mockProductos (memoria)
  const productoExistenteMock = mockProductos.find((p: any) => {
    const nombreCoincide = p.nombre.toLowerCase() === entrada.nombreProducto.toLowerCase();
    const categoriaCoincide = p.categoria === categoriaFinal;
    const subcategoriaCoincide = p.subcategoria === subcategoriaFinal;
    const pesoUnitarioProducto = p.pesoUnitario || 0;
    const pesoCoincide = Math.abs(pesoUnitarioProducto - entrada.pesoUnidad) < TOLERANCIA_PESO;
    
    return nombreCoincide && categoriaCoincide && subcategoriaCoincide && pesoCoincide;
  });

  let productoId = '';

  if (productoExistenteLS) {
    // ✅ CASO A: El producto YA EXISTE en localStorage - ACTUALIZAR STOCK
    productoId = productoExistenteLS.id;
    
    // Actualizar en localStorage (persistente)
    actualizarProducto(productoId, {
      stockActual: productoExistenteLS.stockActual + entrada.cantidad,
      lote: entrada.lote || productoExistenteLS.lote,
      fechaVencimiento: entrada.fechaCaducidad || productoExistenteLS.fechaVencimiento,
      pesoRegistrado: (productoExistenteLS.pesoRegistrado || 0) + entrada.pesoTotal
    });
    
    // Actualizar también en mockProductos (memoria) para reflejar cambios inmediatamente
    const indexMock = mockProductos.findIndex((p: any) => p.id === productoId);
    if (indexMock !== -1) {
      mockProductos[indexMock] = {
        ...mockProductos[indexMock],
        stockActual: mockProductos[indexMock].stockActual + entrada.cantidad,
        lote: entrada.lote || mockProductos[indexMock].lote,
        fechaVencimiento: entrada.fechaCaducidad || mockProductos[indexMock].fechaVencimiento,
        pesoRegistrado: (mockProductos[indexMock].pesoRegistrado || 0) + entrada.pesoTotal
      };
    } else {
      // Si no está en mockProductos, agregarlo desde localStorage
      const productoActualizado = obtenerProductoPorId(productoId);
      if (productoActualizado) {
        mockProductos.push(productoActualizado as any);
      }
    }
    
    console.log(`✅ Stock actualizado (localStorage + memoria): ${entrada.nombreProducto} +${entrada.cantidad} ${entrada.unidad}`);
    
  } else if (productoExistenteMock) {
    // 🔄 CASO B: El producto existe en mockProductos pero NO en localStorage
    // Esto puede pasar con productos mock iniciales - migrar a localStorage
    productoId = productoExistenteMock.id;
    
    const productoParaGuardar: ProductoCreado = {
      id: productoId,
      codigo: productoExistenteMock.codigo || `AUTO-${Date.now()}`,
      nombre: productoExistenteMock.nombre,
      categoria: categoriaFinal,
      subcategoria: subcategoriaFinal,
      stockActual: productoExistenteMock.stockActual + entrada.cantidad,
      stockMinimo: productoExistenteMock.stockMinimo || Math.round(entrada.cantidad * 0.2),
      unidad: entrada.unidad,
      peso: entrada.pesoUnidad,
      pesoUnitario: entrada.pesoUnidad,
      pesoRegistrado: entrada.pesoTotal,
      lote: entrada.lote || productoExistenteMock.lote || '',
      fechaVencimiento: entrada.fechaCaducidad || productoExistenteMock.fechaVencimiento || '',
      icono: entrada.productoIcono || productoExistenteMock.icono || '📦',
      ubicacion: productoExistenteMock.ubicacion || 'Almacén Principal',
      esPRS: false,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
    
    // Guardar en localStorage
    guardarProducto(productoParaGuardar);
    
    // Actualizar mockProductos
    const indexMock = mockProductos.findIndex((p: any) => p.id === productoId);
    if (indexMock !== -1) {
      mockProductos[indexMock] = {
        ...mockProductos[indexMock],
        stockActual: mockProductos[indexMock].stockActual + entrada.cantidad,
        pesoUnitario: entrada.pesoUnidad,
        pesoRegistrado: (mockProductos[indexMock].pesoRegistrado || 0) + entrada.pesoTotal,
        lote: entrada.lote || mockProductos[indexMock].lote,
        fechaVencimiento: entrada.fechaCaducidad || mockProductos[indexMock].fechaVencimiento
      };
    }
    
    console.log(`✅ Producto migrado a localStorage y stock actualizado: ${entrada.nombreProducto}`);
    
  } else {
    // ✅ CASO C: El producto NO EXISTE - CREAR NUEVO en localStorage y mockProductos
    productoId = entrada.productoId && entrada.productoId !== 'custom' 
      ? entrada.productoId 
      : `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const nuevoProducto: ProductoCreado = {
      id: productoId,
      codigo: entrada.productoCodigo || `AUTO-${Date.now()}`,
      nombre: entrada.nombreProducto,
      categoria: categoriaFinal,
      subcategoria: subcategoriaFinal,
      varianteId: entrada.varianteId,
      varianteNombre: entrada.variante?.nombre,
      stockActual: entrada.cantidad,
      stockMinimo: Math.round(entrada.cantidad * 0.2), // 20% del stock inicial
      unidad: entrada.unidad,
      peso: entrada.pesoUnidad,
      pesoUnitario: entrada.pesoUnidad,
      pesoRegistrado: entrada.pesoTotal,
      lote: entrada.lote || '',
      fechaVencimiento: entrada.fechaCaducidad || '',
      icono: entrada.variante?.icono || entrada.productoIcono || '📦', // Usar icono de la variante si existe
      ubicacion: 'Almacén Principal',
      esPRS: false,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
    
    // Guardar en localStorage (persistente)
    guardarProducto(nuevoProducto);
    
    // Agregar también a mockProductos (memoria) para visualización inmediata
    const nuevoProductoMock = {
      ...nuevoProducto,
      estado: 'Disponible' as const,
      temperatura: entrada.temperatura || 'ambiente' as const,
      programaEntrada: entrada.tipoEntrada,
      documentoReferencia: entrada.id,
      esTemporal: false
    };
    mockProductos.push(nuevoProductoMock);
  }

  // 📝 PASO 3: Registrar movimiento de entrada
  registrarMovimientoEntrada(
    productoId,
    entrada.cantidad,
    `Entrada ${entrada.programaCodigo} - ${entrada.donadorNombre}`,
    entrada.creadoPor || 'Usuario Actual',
    entrada.id, // documentoReferencia
    undefined, // cantidadAnterior
    undefined, // cantidadActual
    entrada.pesoUnidad, // pesoUnitario
    entrada.fecha // fechaEntrada - usar la fecha de la entrada, no la fecha de caducidad
  );
  
  console.log(`✅ Movimiento registrado: ${entrada.programaCodigo} - ${entrada.nombreProducto}`);
  console.log(`📊 Resumen: Producto ID ${productoId} ahora tiene stock actualizado en localStorage`);
}

/**
 * Actualizar una entrada existente
 */
export function actualizarEntrada(id: string, datos: Partial<EntradaInventario>): boolean {
  const entradas = obtenerTodasLasEntradas();
  const index = entradas.findIndex(e => e.id === id);
  
  if (index === -1) return false;
  
  entradas[index] = {
    ...entradas[index],
    ...datos,
    id: entradas[index].id, // Prevenir cambio de ID
    fechaCreacion: entradas[index].fechaCreacion, // Prevenir cambio de fecha
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
  return true;
}

/**
 * Eliminar una entrada (soft delete)
 */
export function eliminarEntrada(id: string): boolean {
  return actualizarEntrada(id, { activo: false });
}

/**
 * Eliminar permanentemente una entrada
 */
export function eliminarEntradaPermanente(id: string): boolean {
  const entradas = obtenerTodasLasEntradas();
  const nuevasEntradas = entradas.filter(e => e.id !== id);
  
  if (nuevasEntradas.length === entradas.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasEntradas));
  return true;
}

/**
 * Obtener entradas filtradas por tipo
 */
export function obtenerEntradasPorTipo(tipo: string): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => entrada.tipoEntrada === tipo);
}

/**
 * Obtener entradas filtradas por rango de fechas
 */
export function obtenerEntradasPorFechas(fechaInicio: Date, fechaFin: Date): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => {
    const fecha = new Date(entrada.fecha);
    return fecha >= fechaInicio && fecha <= fechaFin;
  });
}

/**
 * Obtener entradas filtradas por producto
 */
export function obtenerEntradasPorProducto(productoId: string): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => entrada.productoId === productoId);
}

/**
 * Obtener entradas filtradas por donador/proveedor
 */
export function obtenerEntradasPorDonador(donadorId: string): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => entrada.donadorId === donadorId);
}

/**
 * Obtener estadísticas de entradas
 */
export function obtenerEstadisticasEntradas() {
  const entradas = obtenerEntradasActivas();
  
  return {
    total: entradas.length,
    porTipo: {
      don: entradas.filter(e => e.tipoEntrada === 'don').length,
      achat: entradas.filter(e => e.tipoEntrada === 'achat').length,
      otros: entradas.filter(e => e.tipoEntrada !== 'don' && e.tipoEntrada !== 'achat').length,
    },
    pesoTotal: entradas.reduce((sum, e) => sum + e.pesoTotal, 0),
    porTemperatura: {
      ambiente: entradas.filter(e => e.temperatura === 'ambiente').length,
      refrigerado: entradas.filter(e => e.temperatura === 'refrigerado').length,
      congelado: entradas.filter(e => e.temperatura === 'congelado').length,
    },
  };
}

/**
 * Exportar todas las entradas a JSON
 */
export function exportarEntradasJSON(): string {
  return JSON.stringify(obtenerTodasLasEntradas(), null, 2);
}

/**
 * Importar entradas desde JSON
 */
export function importarEntradasJSON(json: string): boolean {
  try {
    const entradas = JSON.parse(json);
    if (!Array.isArray(entradas)) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
    return true;
  } catch (error) {
    console.error('Error al importar entradas:', error);
    return false;
  }
}

/**
 * Limpiar todas las entradas (requiere confirmación)
 */
export function limpiarTodasLasEntradas(): boolean {
  localStorage.removeItem(STORAGE_KEY);
  return true;
}