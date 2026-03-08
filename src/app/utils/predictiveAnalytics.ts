/**
 * Sistema de Analítica Predictiva con IA
 * Banque Alimentaire PRO - v5.0
 */

import { obtenerComandas } from './comandaStorage';
import { obtenerProductos } from './productStorage';

export interface Prediccion {
  tipo: 'demanda' | 'reabastecimiento' | 'desperdicio' | 'tendencia';
  producto: string;
  valor: number;
  confianza: number; // 0-100
  periodo: string;
  mensaje: string;
  nivel: 'info' | 'warning' | 'danger' | 'success';
  acciones: string[];
}

export interface TendenciaProducto {
  producto: string;
  tendencia: 'ascendente' | 'descendente' | 'estable';
  cambio: number; // Porcentaje
  demandaPromedio: number;
  prediccionProximoMes: number;
}

export interface AlertaInteligente {
  id: string;
  tipo: 'stock_bajo' | 'alta_demanda' | 'desperdicio' | 'estacionalidad';
  titulo: string;
  mensaje: string;
  nivel: 'info' | 'warning' | 'danger';
  producto?: string;
  valor: number;
  fecha: Date;
}

/**
 * Predice la demanda de productos basándose en histórico
 */
export function predecirDemanda(mesesHistorico: number = 3): Prediccion[] {
  const comandas = obtenerComandas();
  const ahora = new Date();
  const predicciones: Prediccion[] = [];

  // Filtrar comandas de los últimos meses
  const fechaLimite = new Date();
  fechaLimite.setMonth(fechaLimite.getMonth() - mesesHistorico);

  const comandasRecientes = comandas.filter(c => 
    new Date(c.fechaSolicitud) >= fechaLimite
  );

  // Agrupar productos por frecuencia
  const productosMap = new Map<string, number[]>();

  comandasRecientes.forEach(comanda => {
    comanda.productos.forEach(prod => {
      if (!productosMap.has(prod.nombre)) {
        productosMap.set(prod.nombre, []);
      }
      productosMap.get(prod.nombre)!.push(prod.cantidad);
    });
  });

  // Calcular predicciones
  productosMap.forEach((cantidades, producto) => {
    const promedio = cantidades.reduce((a, b) => a + b, 0) / cantidades.length;
    const desviacion = Math.sqrt(
      cantidades.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / cantidades.length
    );

    // Predicción simple usando promedio móvil ponderado
    const ultimosMeses = cantidades.slice(-3);
    const prediccion = ultimosMeses.reduce((sum, val, idx) => 
      sum + val * (idx + 1), 0
    ) / (ultimosMeses.length * (ultimosMeses.length + 1) / 2);

    // Calcular confianza basada en consistencia
    const coeficienteVariacion = (desviacion / promedio) * 100;
    const confianza = Math.max(0, Math.min(100, 100 - coeficienteVariacion));

    // Determinar nivel
    let nivel: 'info' | 'warning' | 'danger' | 'success' = 'info';
    if (prediccion > promedio * 1.5) nivel = 'warning';
    if (prediccion > promedio * 2) nivel = 'danger';
    if (prediccion < promedio * 0.5) nivel = 'success';

    predicciones.push({
      tipo: 'demanda',
      producto,
      valor: Math.round(prediccion),
      confianza: Math.round(confianza),
      periodo: 'Próximo mes',
      mensaje: `Se espera una demanda de ${Math.round(prediccion)} unidades de ${producto} el próximo mes`,
      nivel,
      acciones: generarAccionesDemanda(prediccion, promedio, producto)
    });
  });

  return predicciones.sort((a, b) => b.confianza - a.confianza);
}

/**
 * Predice cuándo reabastecer productos
 */
export function predecirReabastecimiento(): Prediccion[] {
  const productos = obtenerProductos();
  const demanda = predecirDemanda();
  const predicciones: Prediccion[] = [];

  productos.forEach(item => {
    const demandaProducto = demanda.find(d => d.producto === item.nombre);
    if (!demandaProducto) return;

    const stockActual = item.stockActual;
    const demandaMensual = demandaProducto.valor;
    const diasHastaAgotamiento = (stockActual / demandaMensual) * 30;

    if (diasHastaAgotamiento < 30) {
      let nivel: 'warning' | 'danger' | 'info' = 'info';
      if (diasHastaAgotamiento < 7) nivel = 'danger';
      else if (diasHastaAgotamiento < 15) nivel = 'warning';

      predicciones.push({
        tipo: 'reabastecimiento',
        producto: item.nombre,
        valor: Math.round(diasHastaAgotamiento),
        confianza: demandaProducto.confianza,
        periodo: `${Math.round(diasHastaAgotamiento)} días`,
        mensaje: `Stock de ${item.nombre} se agotará en ${Math.round(diasHastaAgotamiento)} días`,
        nivel,
        acciones: [
          `Ordenar ${Math.round(demandaMensual * 2)} unidades`,
          'Contactar proveedores',
          'Verificar presupuesto disponible'
        ]
      });
    }
  });

  return predicciones.sort((a, b) => a.valor - b.valor);
}

/**
 * Detecta productos con riesgo de desperdicio
 */
export function detectarDesperdicio(): Prediccion[] {
  const productos = obtenerProductos();
  const demanda = predecirDemanda();
  const predicciones: Prediccion[] = [];

  productos.forEach(item => {
    const demandaProducto = demanda.find(d => d.producto === item.nombre);
    
    // Producto sin demanda reciente
    if (!demandaProducto && item.stockActual > 10) {
      predicciones.push({
        tipo: 'desperdicio',
        producto: item.nombre,
        valor: item.stockActual,
        confianza: 80,
        periodo: 'Inmediato',
        mensaje: `${item.nombre} tiene ${item.stockActual} unidades sin demanda reciente`,
        nivel: 'warning',
        acciones: [
          'Crear oferta especial',
          'Notificar organismos',
          'Considerar donación directa',
          'Verificar fecha de vencimiento'
        ]
      });
    }

    // Exceso de stock comparado con demanda
    if (demandaProducto && item.stockActual > demandaProducto.valor * 3) {
      predicciones.push({
        tipo: 'desperdicio',
        producto: item.nombre,
        valor: item.stockActual - (demandaProducto.valor * 2),
        confianza: demandaProducto.confianza,
        periodo: '2-3 meses',
        mensaje: `Exceso de ${Math.round(item.stockActual - demandaProducto.valor * 2)} unidades de ${item.nombre}`,
        nivel: 'warning',
        acciones: [
          'Reducir órdenes de compra',
          'Crear campaña de distribución',
          'Ofrecer a otros bancos alimentarios'
        ]
      });
    }
  });

  return predicciones;
}

/**
 * Analiza tendencias de productos
 */
export function analizarTendencias(): TendenciaProducto[] {
  const comandas = obtenerComandas();
  const tendencias: TendenciaProducto[] = [];

  // Dividir en dos periodos
  const ahora = new Date();
  const hace3Meses = new Date();
  hace3Meses.setMonth(hace3Meses.getMonth() - 3);
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);

  const comandasPeriodo1 = comandas.filter(c => {
    const fecha = new Date(c.fechaSolicitud);
    return fecha >= hace6Meses && fecha < hace3Meses;
  });

  const comandasPeriodo2 = comandas.filter(c => {
    const fecha = new Date(c.fechaSolicitud);
    return fecha >= hace3Meses;
  });

  // Agrupar productos
  const productosP1 = new Map<string, number>();
  const productosP2 = new Map<string, number>();

  comandasPeriodo1.forEach(c => {
    c.productos.forEach(p => {
      productosP1.set(p.nombre, (productosP1.get(p.nombre) || 0) + p.cantidad);
    });
  });

  comandasPeriodo2.forEach(c => {
    c.productos.forEach(p => {
      productosP2.set(p.nombre, (productosP2.get(p.nombre) || 0) + p.cantidad);
    });
  });

  // Analizar cambios
  const todosProductos = new Set([...productosP1.keys(), ...productosP2.keys()]);

  todosProductos.forEach(producto => {
    const cantidadP1 = productosP1.get(producto) || 0;
    const cantidadP2 = productosP2.get(producto) || 0;

    if (cantidadP1 === 0 && cantidadP2 === 0) return;

    const cambio = cantidadP1 === 0 
      ? 100 
      : ((cantidadP2 - cantidadP1) / cantidadP1) * 100;

    let tendencia: 'ascendente' | 'descendente' | 'estable' = 'estable';
    if (cambio > 10) tendencia = 'ascendente';
    if (cambio < -10) tendencia = 'descendente';

    // Predicción simple para próximo mes
    const prediccion = cantidadP2 + (cantidadP2 * (cambio / 100));

    tendencias.push({
      producto,
      tendencia,
      cambio: Math.round(cambio),
      demandaPromedio: Math.round((cantidadP1 + cantidadP2) / 2),
      prediccionProximoMes: Math.round(prediccion)
    });
  });

  return tendencias.sort((a, b) => Math.abs(b.cambio) - Math.abs(a.cambio));
}

/**
 * Genera alertas inteligentes
 */
export function generarAlertasInteligentes(): AlertaInteligente[] {
  const alertas: AlertaInteligente[] = [];
  const reabastecimientos = predecirReabastecimiento();
  const desperdicios = detectarDesperdicio();
  const tendencias = analizarTendencias();

  // Alertas de reabastecimiento urgente
  reabastecimientos
    .filter(r => r.valor < 7)
    .forEach(r => {
      alertas.push({
        id: `reab_${Date.now()}_${Math.random()}`,
        tipo: 'stock_bajo',
        titulo: '⚠️ Stock Crítico',
        mensaje: `${r.producto} se agotará en ${r.valor} días`,
        nivel: 'danger',
        producto: r.producto,
        valor: r.valor,
        fecha: new Date()
      });
    });

  // Alertas de alta demanda
  tendencias
    .filter(t => t.tendencia === 'ascendente' && t.cambio > 50)
    .forEach(t => {
      alertas.push({
        id: `demanda_${Date.now()}_${Math.random()}`,
        tipo: 'alta_demanda',
        titulo: '📈 Demanda en Aumento',
        mensaje: `${t.producto} ha aumentado ${t.cambio}% en demanda`,
        nivel: 'warning',
        producto: t.producto,
        valor: t.cambio,
        fecha: new Date()
      });
    });

  // Alertas de desperdicio
  desperdicios.slice(0, 3).forEach(d => {
    alertas.push({
      id: `desp_${Date.now()}_${Math.random()}`,
      tipo: 'desperdicio',
      titulo: '🗑️ Riesgo de Desperdicio',
      mensaje: d.mensaje,
      nivel: 'warning',
      producto: d.producto,
      valor: d.valor,
      fecha: new Date()
    });
  });

  return alertas;
}

/**
 * Genera acciones recomendadas según demanda
 */
function generarAccionesDemanda(prediccion: number, promedio: number, producto: string): string[] {
  const acciones: string[] = [];

  if (prediccion > promedio * 1.5) {
    acciones.push(`Aumentar stock de ${producto} en un 50%`);
    acciones.push('Contactar proveedores con anticipación');
    acciones.push('Considerar promociones para distribución anticipada');
  } else if (prediccion > promedio) {
    acciones.push(`Mantener stock estable de ${producto}`);
    acciones.push('Monitorear demanda semanalmente');
  } else if (prediccion < promedio * 0.5) {
    acciones.push(`Reducir órdenes de ${producto}`);
    acciones.push('Crear ofertas especiales');
    acciones.push('Verificar cambios en necesidades de organismos');
  }

  return acciones;
}

/**
 * Calcula el impacto económico y social
 */
export function calcularImpacto(periodo: 'mes' | 'trimestre' | 'año' = 'mes'): {
  valorMonetario: number;
  personasAlimentadas: number;
  kgDistribuidos: number;
  co2Evitado: number;
  numeroComandas: number;
  organismosBeneficiados: number;
} {
  const comandas = obtenerComandas();
  const ahora = new Date();
  const fechaLimite = new Date();

  switch (periodo) {
    case 'mes':
      fechaLimite.setMonth(fechaLimite.getMonth() - 1);
      break;
    case 'trimestre':
      fechaLimite.setMonth(fechaLimite.getMonth() - 3);
      break;
    case 'año':
      fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
      break;
  }

  const comandasPeriodo = comandas.filter(c => 
    new Date(c.fechaSolicitud) >= fechaLimite &&
    (c.estado === 'completada' || c.estado === 'entregada')
  );

  const organismos = new Set(comandasPeriodo.map(c => c.nombreOrganismo));
  
  // Cálculos estimados
  const totalProductos = comandasPeriodo.reduce((sum, c) => 
    sum + c.productos.reduce((pSum, p) => pSum + p.cantidad, 0), 0
  );

  const valorMonetario = totalProductos * 2.5; // CAD$ 2.5 por producto promedio
  const kgDistribuidos = totalProductos * 0.8; // 0.8 kg por producto promedio
  const personasAlimentadas = Math.round(totalProductos / 25); // 25 productos = 1 persona/mes
  const co2Evitado = kgDistribuidos * 2.5; // 2.5 kg CO2 por kg de alimento rescatado

  return {
    valorMonetario: Math.round(valorMonetario),
    personasAlimentadas,
    kgDistribuidos: Math.round(kgDistribuidos),
    co2Evitado: Math.round(co2Evitado),
    numeroComandas: comandasPeriodo.length,
    organismosBeneficiados: organismos.size
  };
}