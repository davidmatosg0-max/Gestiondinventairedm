import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Calendar, TrendingUp, Database, RefreshCw, ShoppingCart, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  obtenerEntradasActivas, 
  obtenerEstadisticasEntradas,
  type EntradaInventario 
} from '../utils/entradaInventarioStorage';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { toast } from 'sonner';
import { mockProductos } from '../data/mockData';

export function HistorialEntradas() {
  const { t } = useTranslation();
  const [entradas, setEntradas] = useState<EntradaInventario[]>([]);
  const [estadisticas, setEstadisticas] = useState<ReturnType<typeof obtenerEstadisticasEntradas> | null>(null);
  const [productosConvertidos, setProductosConvertidos] = useState(0);
  const [programas, setProgramas] = useState<ProgramaEntrada[]>([]);

  const cargarDatos = () => {
    const entradasCargadas = obtenerEntradasActivas();
    const stats = obtenerEstadisticasEntradas();
    const programasActivos = obtenerProgramasActivos();
    
    // Ordenar por fecha más reciente primero
    entradasCargadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    // Contar cuántas entradas están convertidas en productos
    const convertidos = entradasCargadas.filter(entrada => 
      mockProductos.some(p => p.id === entrada.productoId)
    ).length;
    
    setEntradas(entradasCargadas);
    setEstadisticas(stats);
    setProductosConvertidos(convertidos);
    setProgramas(programasActivos);
  };

  useEffect(() => {
    cargarDatos();
    
    // 🔔 Escuchar eventos de nuevas entradas guardadas
    const handleEntradaGuardada = () => {
      console.log('📢 Nueva entrada detectada, actualizando historial...');
      cargarDatos();
    };
    
    window.addEventListener('entradaGuardada', handleEntradaGuardada);
    
    // Limpieza del evento al desmontar el componente
    return () => {
      window.removeEventListener('entradaGuardada', handleEntradaGuardada);
    };
  }, []);

  const formatearFecha = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAgregarAlCarrito = (entrada: EntradaInventario) => {
    // Crear evento personalizado para agregar al carrito
    const evento = new CustomEvent('agregarAlCarrito', {
      detail: {
        producto: {
          id: entrada.productoId,
          nombre: entrada.nombreProducto,
          codigo: entrada.productoCodigo,
          icono: entrada.productoIcono,
          categoria: entrada.categoria,
          subcategoria: entrada.subcategoria,
          temperatura: entrada.temperatura,
          unidad: entrada.unidad,
          pesoUnidad: entrada.pesoUnidad,
          stockDisponible: entrada.cantidad,
          pesoTotal: entrada.pesoTotal,
          lote: entrada.lote,
          fechaCaducidad: entrada.fechaCaducidad
        },
        origen: 'historial'
      }
    });
    
    window.dispatchEvent(evento);
    
    toast.success(
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-[#4CAF50]" />
        <div>
          <p className="font-semibold">Agregado al carrito</p>
          <p className="text-xs text-[#666666]">{entrada.nombreProducto}</p>
        </div>
      </div>,
      { duration: 2000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con Estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1E73BE] flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('inventory.entryHistory') || 'Historial de Entradas'}
            </h2>
            <p className="text-sm text-[#666666]">
              {entradas.length} {entradas.length === 1 ? 'entrada registrada' : 'entradas registradas'}
            </p>
          </div>
        </div>
        <Button
          onClick={cargarDatos}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total general */}
          <div className="p-4 bg-gradient-to-br from-[#E3F2FD] to-white rounded-lg border-2 border-[#1E73BE]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666]">Total Entradas</p>
                <p className="text-2xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {estadisticas.total}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#1E73BE] opacity-50" />
            </div>
          </div>

          {/* Tarjeta de Peso Total */}
          <div className="p-4 bg-gradient-to-br from-[#F3E5F5] to-white rounded-lg border-2 border-[#9C27B0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666]">Peso Total</p>
                <p className="text-2xl font-bold text-[#9C27B0]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {estadisticas.pesoTotal.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[#999999]">kg</p>
              </div>
              <span className="text-3xl">⚖️</span>
            </div>
          </div>

          {/* Tarjetas dinámicas por cada programa */}
          {programas.map((programa) => {
            const cantidad = entradas.filter(e => e.programaCodigo === programa.codigo).length;
            if (cantidad === 0) return null;
            
            return (
              <div 
                key={programa.id}
                className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2" 
                style={{ borderColor: programa.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#666666]">{programa.nombre}</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: programa.color }}>
                      {cantidad}
                    </p>
                  </div>
                  <span className="text-3xl">{programa.icono}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner informativo sobre conversión automática */}
      {entradas.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] rounded-lg border-2 border-[#4CAF50] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                ✅ Sistema de conversión automática activo
              </p>
              <p className="text-sm text-[#666666]">
                {productosConvertidos} de {entradas.length} entradas están convertidas en productos del inventario
                {productosConvertidos === entradas.length && ' - Todas las entradas están sincronizadas ✨'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Entradas */}
      <div className="space-y-3">
        {entradas.length === 0 ? (
          <div className="py-12 text-center bg-[#F4F4F4] rounded-lg border-2 border-dashed border-[#E0E0E0]">
            <Package className="w-16 h-16 mx-auto text-[#CCCCCC] mb-4" />
            <p className="text-[#666666] font-medium mb-2">No hay entradas registradas</p>
            <p className="text-sm text-[#999999]">
              Las entradas registradas aparecerán aquí
            </p>
          </div>
        ) : (
          entradas.map((entrada) => {
            // Verificar si esta entrada está convertida en producto
            const estaConvertida = mockProductos.some(p => p.id === entrada.productoId);
            
            return (
            <div
              key={entrada.id}
              className="p-4 bg-white rounded-lg border-2 border-[#E0E0E0] hover:border-[#1E73BE] transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Información Principal */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: entrada.programaColor }}
                    >
                      {entrada.programaIcono} {entrada.programaCodigo}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#666666]" />
                      <span className="text-[#666666]">{formatearFecha(entrada.fecha)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-[#F4F4F4]">
                      {entrada.id}
                    </Badge>
                    {estaConvertida && (
                      <Badge className="bg-[#4CAF50] text-white text-xs">
                        ✓ Producto activo
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Donador/Proveedor */}
                    <div>
                      <p className="text-xs text-[#999999] mb-1">
                        {entrada.programaNombre || 'Proveedor'}
                      </p>
                      <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {entrada.donadorNombre}
                      </p>
                      {entrada.donadorEsCustom && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Personalizado
                        </Badge>
                      )}
                    </div>

                    {/* Producto */}
                    <div>
                      <p className="text-xs text-[#999999] mb-1">Producto</p>
                      <div className="flex items-center gap-2">
                        {entrada.productoIcono && (
                          <span className="text-lg">{entrada.productoIcono}</span>
                        )}
                        <div>
                          <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {entrada.nombreProducto}
                          </p>
                          {entrada.productoCodigo && (
                            <p className="text-xs text-[#666666]">{entrada.productoCodigo}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cantidades y Detalles */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#666666]">Cantidad:</span>
                      <span className="font-bold text-[#333333]">
                        {entrada.cantidad} {entrada.unidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#666666]">Peso unité:</span>
                      <span className="font-medium text-[#333333]">
                        {entrada.pesoUnidad} kg
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚖️</span>
                      <div>
                        <p className="text-xs text-[#666666]">Peso Total</p>
                        <p className="font-bold text-[#1E73BE] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {(entrada.pesoTotal || 0).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Temperatura y Detalles Adicionales */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      className={`${
                        entrada.temperatura === 'ambiente' ? 'bg-[#FFC107]' :
                        entrada.temperatura === 'refrigerado' ? 'bg-[#2196F3]' :
                        'bg-[#00BCD4]'
                      } text-white`}
                    >
                      {entrada.temperatura === 'ambiente' ? '🌡️ Ambiente' :
                       entrada.temperatura === 'refrigerado' ? '❄️ Refrigerado' :
                       '🧊 Congelado'}
                    </Badge>
                    
                    {entrada.lote && (
                      <Badge variant="outline" className="text-xs">
                        Lote: {entrada.lote}
                      </Badge>
                    )}
                    
                    {entrada.fechaCaducidad && (
                      <Badge variant="outline" className="text-xs">
                        Caduca: {new Date(entrada.fechaCaducidad).toLocaleDateString('es-ES')}
                      </Badge>
                    )}
                  </div>

                  {/* Observaciones */}
                  {entrada.observaciones && (
                    <div className="p-3 bg-[#F4F4F4] rounded-md">
                      <p className="text-xs text-[#666666] mb-1">Observaciones</p>
                      <p className="text-sm text-[#333333]">{entrada.observaciones}</p>
                    </div>
                  )}
                </div>
                {/* Botón para agregar al carrito */}
                <Button
                  onClick={() => handleAgregarAlCarrito(entrada)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}