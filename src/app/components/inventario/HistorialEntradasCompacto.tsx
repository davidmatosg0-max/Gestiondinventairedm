import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Package, Edit } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  obtenerEntradasActivas,
  type EntradaInventario 
} from '../../utils/entradaInventarioStorage';
import { EditarEntradaDialog } from './EditarEntradaDialog';

interface HistorialEntradasCompactoProps {
  onAgregarAlCarrito: (entrada: EntradaInventario) => void;
}

export function HistorialEntradasCompacto({ onAgregarAlCarrito }: HistorialEntradasCompactoProps) {
  const [entradas, setEntradas] = useState<EntradaInventario[]>([]);
  const [entradaParaEditar, setEntradaParaEditar] = useState<EntradaInventario | null>(null);
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false);

  const cargarDatos = () => {
    const entradasCargadas = obtenerEntradasActivas();
    // Ordenar por fecha más reciente primero
    entradasCargadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    setEntradas(entradasCargadas);
  };

  const abrirEditarEntrada = (entrada: EntradaInventario) => {
    setEntradaParaEditar(entrada);
    setDialogoEditarAbierto(true);
  };

  const handleActualizarEntrada = () => {
    cargarDatos();
    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new Event('entradaGuardada'));
  };

  useEffect(() => {
    cargarDatos();
    
    // 🔔 Escuchar eventos de nuevas entradas guardadas
    const handleEntradaGuardada = () => {
      console.log('📢 Nueva entrada detectada, actualizando historial compacto...');
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
      year: 'numeric'
    });
  };

  if (entradas.length === 0) {
    return (
      <div className="py-12 text-center bg-[#F4F4F4] rounded-lg border-2 border-dashed border-[#E0E0E0]">
        <Package className="w-16 h-16 mx-auto text-[#CCCCCC] mb-4" />
        <p className="text-[#666666] font-medium mb-2">No hay entradas registradas</p>
        <p className="text-sm text-[#999999]">
          Las entradas registradas aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#666666]">
          {entradas.length} {entradas.length === 1 ? 'entrada registrada' : 'entradas registradas'}
        </p>
        <Button
          onClick={cargarDatos}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Actualizar
        </Button>
      </div>

      {entradas.map((entrada) => (
        <div
          key={entrada.id}
          className="p-3 bg-white rounded-lg border-2 border-[#E0E0E0] hover:border-purple-400 transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            {/* Información Principal */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Header con Badge y Fecha */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className="text-white text-xs"
                  style={{ backgroundColor: entrada.programaColor }}
                >
                  {entrada.programaIcono} {entrada.programaCodigo}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-[#666666]">
                  <Calendar className="w-3 h-3" />
                  <span>{formatearFecha(entrada.fecha)}</span>
                </div>
              </div>

              {/* Información del Producto */}
              <div className="flex items-center gap-2">
                {entrada.productoIcono && (
                  <span className="text-2xl">{entrada.productoIcono}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {entrada.nombreProducto}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {entrada.donadorNombre}
                  </p>
                </div>
              </div>

              {/* Cantidades */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#666666]">Cantidad:</span>
                  <span className="font-bold text-sm text-[#333333]">
                    {entrada.cantidad} {entrada.unidad}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">⚖️</span>
                  <span className="font-medium text-sm text-[#1E73BE]">
                    {(entrada.pesoTotal || 0).toFixed(2)} kg
                  </span>
                </div>
              </div>

              {/* Temperatura */}
              <Badge
                className={`text-xs ${
                  entrada.temperatura === 'ambiente' ? 'bg-[#FFC107]' :
                  entrada.temperatura === 'refrigerado' ? 'bg-[#2196F3]' :
                  'bg-[#00BCD4]'
                } text-white`}
              >
                {entrada.temperatura === 'ambiente' ? '🌡️ Ambiente' :
                 entrada.temperatura === 'refrigerado' ? '❄️ Refrigerado' :
                 '🧊 Congelado'}
              </Badge>
            </div>

            {/* Botón de Editar */}
            <Button
              onClick={() => abrirEditarEntrada(entrada)}
              variant="outline"
              size="sm"
              className="gap-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white flex-shrink-0"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </div>
        </div>
      ))}

      {/* Dialogo de Editar Entrada */}
      <EditarEntradaDialog
        entrada={entradaParaEditar}
        open={dialogoEditarAbierto}
        onOpenChange={setDialogoEditarAbierto}
        onActualizar={handleActualizarEntrada}
      />
    </div>
  );
}