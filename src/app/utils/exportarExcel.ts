import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Configuración de estilos para las hojas de Excel
 */
const estilosEncabezado = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '1E73BE' } },
  alignment: { horizontal: 'center', vertical: 'center' },
};

/**
 * Función auxiliar para crear un workbook con estilos
 */
function crearWorkbook(hojas: Array<{ nombre: string; datos: any[] }>) {
  const wb = XLSX.utils.book_new();

  hojas.forEach((hoja) => {
    const ws = XLSX.utils.json_to_sheet(hoja.datos);

    // Ajustar anchos de columna automáticamente
    const columnWidths = Object.keys(hoja.datos[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...hoja.datos.map((row) => String(row[key] || '').length)
      ),
    }));
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, hoja.nombre);
  });

  return wb;
}

/**
 * Función auxiliar para guardar el archivo
 */
function guardarWorkbook(wb: XLSX.WorkBook, nombreArchivo: string) {
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, nombreArchivo);
}

// ===== EXPORTACIONES ESPECÍFICAS =====

/**
 * Exportar inventario a Excel
 */
export function exportarInventarioExcel(productos: any[]) {
  const datosExcel = productos.map((p) => ({
    Código: p.codigo || 'N/A',
    Producto: p.nombre,
    Categoría: p.categoria,
    Subcategoría: p.subcategoria || 'N/A',
    'Stock Actual': p.stockActual,
    'Stock Mínimo': p.stockMinimo,
    Unidad: p.unidad,
    Ubicación: p.ubicacion || 'N/A',
    Estado: p.estado || 'Disponible',
    'Fecha Vencimiento': p.fechaVencimiento
      ? new Date(p.fechaVencimiento).toLocaleDateString('es-ES')
      : 'N/A',
    Lote: p.lote || 'N/A',
    'Valor por Kg': p.valorPorKg ? `$${p.valorPorKg}` : 'N/A',
  }));

  const wb = crearWorkbook([
    {
      nombre: 'Inventario',
      datos: datosExcel,
    },
  ]);

  guardarWorkbook(wb, `Inventario_${Date.now()}.xlsx`);
}

/**
 * Exportar comandas a Excel
 */
export function exportarComandasExcel(comandas: any[]) {
  // Hoja 1: Resumen de comandas
  const resumenComandas = comandas.map((c) => ({
    'N° Comanda': c.numero,
    Organismo: c.organismo?.nombre || 'N/A',
    Fecha: new Date(c.fecha).toLocaleDateString('es-ES'),
    'Total Productos': c.productos?.length || 0,
    'Valor Total': c.valorTotal ? `$${c.valorTotal.toFixed(2)}` : 'N/A',
    Estado: c.estado,
    'Fecha Entrega': c.fechaEntrega
      ? new Date(c.fechaEntrega).toLocaleDateString('es-ES')
      : 'Pendiente',
    Prioridad: c.prioridad || 'Normal',
  }));

  // Hoja 2: Detalle de productos por comanda
  const detalleProductos: any[] = [];
  comandas.forEach((c) => {
    c.productos?.forEach((p: any) => {
      detalleProductos.push({
        'N° Comanda': c.numero,
        Organismo: c.organismo?.nombre || 'N/A',
        Producto: p.nombre,
        Cantidad: p.cantidad,
        Unidad: p.unidad,
        'Valor Unitario': p.valorUnitario ? `$${p.valorUnitario}` : 'N/A',
        'Valor Total': p.valorTotal ? `$${p.valorTotal}` : 'N/A',
      });
    });
  });

  const wb = crearWorkbook([
    { nombre: 'Resumen Comandas', datos: resumenComandas },
    { nombre: 'Detalle Productos', datos: detalleProductos.length > 0 ? detalleProductos : [{ Nota: 'Sin productos' }] },
  ]);

  guardarWorkbook(wb, `Comandas_${Date.now()}.xlsx`);
}

/**
 * Exportar organismos a Excel
 */
export function exportarOrganismosExcel(organismos: any[]) {
  const datosExcel = organismos.map((o) => ({
    Nombre: o.nombre,
    Tipo: o.tipo || 'N/A',
    Beneficiarios: o.beneficiarios || 0,
    'Tipo Asistencia': o.tipoAsistencia || 'N/A',
    Frecuencia: o.frecuencia || 'N/A',
    Teléfono: o.contacto?.telefono || 'N/A',
    Email: o.contacto?.email || 'N/A',
    Dirección: o.direccion?.calle || 'N/A',
    Ciudad: o.direccion?.ciudad || 'N/A',
    'Código Postal': o.direccion?.codigoPostal || 'N/A',
    Estado: o.activo ? 'Activo' : 'Inactivo',
    'Fecha Registro': o.fechaRegistro
      ? new Date(o.fechaRegistro).toLocaleDateString('es-ES')
      : 'N/A',
  }));

  const wb = crearWorkbook([
    {
      nombre: 'Organismos',
      datos: datosExcel,
    },
  ]);

  guardarWorkbook(wb, `Organismos_${Date.now()}.xlsx`);
}

/**
 * Exportar transporte a Excel
 */
export function exportarTransporteExcel(rutas: any[]) {
  // Hoja 1: Rutas
  const datosRutas = rutas.map((r) => ({
    'N° Ruta': r.numero,
    Conductor: r.conductor?.nombre || 'N/A',
    Vehículo: r.vehiculo?.placa || 'N/A',
    Fecha: new Date(r.fecha).toLocaleDateString('es-ES'),
    'Total Paradas': r.paradas?.length || 0,
    Estado: r.estado,
    'Distancia Total': r.distanciaTotal ? `${r.distanciaTotal} km` : 'N/A',
    'Tiempo Estimado': r.tiempoEstimado || 'N/A',
  }));

  // Hoja 2: Detalle de paradas
  const detalleParadas: any[] = [];
  rutas.forEach((r) => {
    r.paradas?.forEach((p: any, index: number) => {
      detalleParadas.push({
        'N° Ruta': r.numero,
        Orden: index + 1,
        Organismo: p.organismo?.nombre || 'N/A',
        Dirección: p.direccion || 'N/A',
        'Hora Estimada': p.horaEstimada || 'N/A',
        'Hora Real': p.horaReal || 'Pendiente',
        Estado: p.estado || 'Pendiente',
      });
    });
  });

  const wb = crearWorkbook([
    { nombre: 'Rutas', datos: datosRutas },
    { nombre: 'Detalle Paradas', datos: detalleParadas.length > 0 ? detalleParadas : [{ Nota: 'Sin paradas' }] },
  ]);

  guardarWorkbook(wb, `Transporte_${Date.now()}.xlsx`);
}

/**
 * Exportar reportes estadísticos a Excel
 */
export function exportarEstadisticasExcel(datos: {
  resumen: any;
  inventario?: any[];
  comandas?: any[];
  organismos?: any[];
  periodo: string;
}) {
  const hojas: Array<{ nombre: string; datos: any[] }> = [];

  // Hoja 1: Resumen General
  const resumen = [
    { Métrica: 'Total Productos', Valor: datos.resumen.totalProductos },
    { Métrica: 'Stock Total', Valor: `${datos.resumen.totalStock} unidades` },
    { Métrica: 'Comandas Generadas', Valor: datos.resumen.totalComandas },
    { Métrica: 'Organismos Activos', Valor: datos.resumen.totalOrganismos },
    {
      Métrica: 'Valor Total Distribuido',
      Valor: `$${datos.resumen.valorTotal.toFixed(2)}`,
    },
    { Métrica: 'Período', Valor: datos.periodo },
  ];
  hojas.push({ nombre: 'Resumen', datos: resumen });

  // Agregar hojas adicionales si están disponibles
  if (datos.inventario && datos.inventario.length > 0) {
    hojas.push({ nombre: 'Inventario', datos: datos.inventario });
  }

  if (datos.comandas && datos.comandas.length > 0) {
    hojas.push({ nombre: 'Comandas', datos: datos.comandas });
  }

  if (datos.organismos && datos.organismos.length > 0) {
    hojas.push({ nombre: 'Organismos', datos: datos.organismos });
  }

  const wb = crearWorkbook(hojas);
  guardarWorkbook(wb, `Estadisticas_${Date.now()}.xlsx`);
}

/**
 * Exportar datos personalizados a Excel
 */
export function exportarDatosPersonalizados(
  nombreArchivo: string,
  hojas: Array<{ nombre: string; datos: any[] }>
) {
  const wb = crearWorkbook(hojas);
  guardarWorkbook(wb, `${nombreArchivo}_${Date.now()}.xlsx`);
}

/**
 * Exportar a CSV (formato simple)
 */
export function exportarCSV(datos: any[], nombreArchivo: string) {
  if (datos.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(datos);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${nombreArchivo}_${Date.now()}.csv`);
}
