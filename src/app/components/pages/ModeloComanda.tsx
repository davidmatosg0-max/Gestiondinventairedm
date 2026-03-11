import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Thermometer, Snowflake, Sun, Maximize2, Minimize2, Check, Ban, Edit2, Box } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import { NotificacionComanda } from '../NotificacionComanda';
import { obtenerPersonaPrincipal } from '../../utils/personasResponsablesStorage';
import { useTranslation } from 'react-i18next';

interface ModeloComandaProps {
  comanda: any;
  organismo: any;
  mostrar: boolean;
  onCerrar: () => void;
  onCambiarEstado?: (nuevoEstado: string) => void;
  onAceptarComanda?: (itemsAceptados: any[]) => void;
  onAnularComanda?: () => void;
  modoOrganismo?: boolean; // Para diferenciar si es vista de organismo o administrador
}

export function ModeloComanda({ 
  comanda, 
  organismo, 
  mostrar, 
  onCerrar,
  onCambiarEstado,
  onAceptarComanda,
  onAnularComanda,
  modoOrganismo = false
}: ModeloComandaProps) {
  const { t } = useTranslation();
  const comandaRef = useRef<HTMLDivElement>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(true); // Cambiado a true para abrir en pantalla completa por defecto
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cantidadesEditadas, setCantidadesEditadas] = useState<{[key: string]: number}>({});
  const [campoEditando, setCampoEditando] = useState<string | null>(null); // Para edición inline
  
  // 🎯 NUEVO: Estado para marcar productos como completados durante la preparación
  const [productosCompletados, setProductosCompletados] = useState<{[key: string]: boolean}>({});

  // 🎯 NUEVO: Función para alternar el estado de completado de un producto
  const toggleProductoCompletado = (itemKey: string) => {
    setProductosCompletados(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Función para imprimir
  const handleImprimir = () => {
    console.log('🖨️ Imprimiendo comanda completa desde modal...');
    window.print();
    
    // Cerrar el modal después de que termine la impresión
    const handleAfterPrint = () => {
      console.log('✅ Impresión completada - Cerrando modal...');
      onCerrar();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
  };

  // Agrupar productos por temperatura
  const productosOrdenados = React.useMemo(() => {
    const todosLosProductos = obtenerProductos();
    const items = comanda.items.map((item: any) => {
      const producto = todosLosProductos.find(p => p.id === item.productoId) || 
                      mockProductos.find(p => p.id === item.productoId);
      return {
        ...item,
        producto,
        temperatura: (producto as any)?.temperaturaAlmacenamiento || 'Temperatura Ambiente'
      };
    });

    // Ordenar por temperatura: Ambiente, Refrigerado, Congelado
    const ordenTemperatura = {
      'Temperatura Ambiente': 1,
      'Refrigerado': 2,
      'Congelado': 3
    };

    return items.sort((a: any, b: any) => {
      return (ordenTemperatura[a.temperatura as keyof typeof ordenTemperatura] || 0) - 
             (ordenTemperatura[b.temperatura as keyof typeof ordenTemperatura] || 0);
    });
  }, [comanda.items]);

  // 🎯 NUEVO: Calcular progreso de preparación (DESPUÉS de productosOrdenados)
  const totalProductos = productosOrdenados.length;
  const productosCompletadosCount = Object.values(productosCompletados).filter(Boolean).length;
  const porcentajeCompletado = totalProductos > 0 ? (productosCompletadosCount / totalProductos) * 100 : 0;

  // Agrupar por temperatura para mostrar secciones
  const productosAgrupados = React.useMemo(() => {
    const grupos: { [key: string]: any[] } = {
      'Temperatura Ambiente': [],
      'Refrigerado': [],
      'Congelado': []
    };

    productosOrdenados.forEach((item: any) => {
      grupos[item.temperatura].push(item);
    });

    return grupos;
  }, [productosOrdenados]);

  // Obtener fecha y hora actual
  const fechaActual = new Date();
  const dia = fechaActual.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const hora = fechaActual.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Generar datos para QR (información de la comanda)
  const qrData = JSON.stringify({
    comanda: comanda.numero,
    organismo: organismo?.nombre || 'Sin organismo',
    fecha: comanda.fecha,
    items: comanda.items.length
  });

  // Función para obtener icono de temperatura
  const getTemperaturaIcon = (temp: string) => {
    switch (temp) {
      case 'Temperatura Ambiente':
        return <Sun className="w-5 h-5 text-[#FFC107]" />;
      case 'Refrigerado':
        return <Thermometer className="w-5 h-5 text-[#1E73BE]" />;
      case 'Congelado':
        return <Snowflake className="w-5 h-5 text-[#4CAF50]" />;
      default:
        return null;
    }
  };

  // Estados disponibles
  const estadosDisponibles = [
    { valor: 'pendiente', label: 'Pendiente', color: 'bg-[#1E73BE]' },
    { valor: 'en_preparacion', label: 'En Preparación', color: 'bg-[#FFC107]' },
    { valor: 'completada', label: 'Completada', color: 'bg-[#4CAF50]' },
    { valor: 'entregada', label: 'Entregada', color: 'bg-[#2E7D32]' },
    { valor: 'anulada', label: 'Anulada', color: 'bg-[#DC3545]' }
  ];

  const estadoActual = estadosDisponibles.find(e => e.valor === comanda.estado);

  // Inicializar cantidades editadas
  useEffect(() => {
    if (mostrar && modoOrganismo) {
      const cantidadesIniciales: {[key: string]: number} = {};
      productosOrdenados.forEach((item: any, index: number) => {
        cantidadesIniciales[`${item.productoId}-${index}`] = item.cantidad;
      });
      setCantidadesEditadas(cantidadesIniciales);
    }
  }, [mostrar, modoOrganismo, productosOrdenados]);

  // Función para cambiar cantidad
  const handleCambioCantidad = (itemKey: string, nuevaCantidad: number, cantidadOriginal: number) => {
    // Solo permitir disminuir o mantener igual
    if (nuevaCantidad <= cantidadOriginal && nuevaCantidad >= 0) {
      setCantidadesEditadas(prev => ({
        ...prev,
        [itemKey]: nuevaCantidad
      }));
    }
  };

  // Función para aceptar toda la comanda
  const handleAceptarTodo = () => {
    if (onAceptarComanda) {
      const itemsAceptados = productosOrdenados.map((item: any, index: number) => ({
        ...item,
        cantidadAceptada: item.cantidad
      }));
      onAceptarComanda(itemsAceptados);
      setModoEdicion(false);
    }
  };

  // Función para aceptar con cantidades modificadas
  const handleAceptarModificado = () => {
    if (onAceptarComanda) {
      const itemsAceptados = productosOrdenados.map((item: any, index: number) => {
        const itemKey = `${item.productoId}-${index}`;
        return {
          ...item,
          cantidadAceptada: cantidadesEditadas[itemKey] || item.cantidad
        };
      });
      onAceptarComanda(itemsAceptados);
      setModoEdicion(false);
    }
  };

  // Función para anular comanda
  const handleAnular = () => {
    if (onAnularComanda && window.confirm('¿Está seguro que desea anular esta comanda?')) {
      onAnularComanda();
    }
  };

  // 🎯 NUEVO: Obtener persona autorizada para recoger la comanda
  const personaAutorizada = React.useMemo(() => {
    if (!organismo?.id) return null;
    const persona = obtenerPersonaPrincipal(organismo.id);
    return persona || null;
  }, [organismo?.id]);

  return (
    <Dialog open={mostrar} onOpenChange={onCerrar}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none !top-0 !left-0 !translate-x-0 !translate-y-0 p-0 overflow-y-auto print:max-w-full print:max-h-full m-0 rounded-none" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t('orders.dialog.title', { number: comanda.numero })}</DialogTitle>
          <DialogDescription>{t('orders.dialog.description')}</DialogDescription>
        </DialogHeader>
        {/* Botones de acción (no se imprimen) */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm flex flex-wrap justify-between items-center p-4 print:hidden gap-2">
          <h2 className="text-lg sm:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Comanda - {comanda.numero}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleImprimir}
              variant="outline"
              size="sm"
              className="bg-[#1E73BE] text-white hover:bg-[#1557A0] border-0"
            >
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              onClick={onCerrar}
              variant="outline"
              size="sm"
              className="bg-white text-[#1E73BE] hover:bg-blue-50 border-0"
            >
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar</span>
            </Button>
          </div>
        </div>

        {/* Cambiar Estado de Preparación (no se imprime) */}
        {onCambiarEstado && (
          <div className="mx-4 mb-4 p-4 bg-gray-50 rounded-lg print:hidden">
            <p className="font-medium text-[#333333] mb-3 text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Estado de Preparación
            </p>
            <div className="flex flex-wrap gap-2">
              {estadosDisponibles.map((estado) => (
                <Button
                  key={estado.valor}
                  onClick={() => onCambiarEstado(estado.valor)}
                  size="sm"
                  className={`${estado.color} text-white text-xs sm:text-sm ${
                    comanda.estado === estado.valor ? 'ring-2 ring-offset-2 ring-[#333333]' : ''
                  }`}
                >
                  {estado.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 NUEVO: Indicador de Progreso de Preparación (no se imprime) */}
        {comanda.estado === 'en_preparacion' && !modoOrganismo && (
          <div className="mx-4 mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-[#FFC107] rounded-lg print:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-[#F57C00] mb-1 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                  📦 Progreso de Preparación
                </p>
                <p className="text-sm text-[#666666]">
                  Marque los productos conforme los vaya preparando
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: porcentajeCompletado === 100 ? '#4CAF50' : porcentajeCompletado > 50 ? '#FFC107' : '#DC3545'
                }}>
                  {productosCompletadosCount}/{totalProductos}
                </p>
                <p className="text-xs text-[#666666] mt-1">Productos listos</p>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-out flex items-center justify-center text-white text-xs font-bold"
                style={{
                  width: `${porcentajeCompletado}%`,
                  backgroundColor: porcentajeCompletado === 100 ? '#4CAF50' : porcentajeCompletado > 50 ? '#FFC107' : '#1E73BE'
                }}
              >
                {porcentajeCompletado > 10 && `${Math.round(porcentajeCompletado)}%`}
              </div>
            </div>
            
            {porcentajeCompletado === 100 && (
              <div className="mt-3 flex items-center gap-2 text-[#4CAF50]">
                <Check className="w-5 h-5" />
                <p className="font-semibold text-sm">✨ ¡Todos los productos están preparados! Puede cambiar el estado a "Completada"</p>
              </div>
            )}
          </div>
        )}

        {/* Notificación al Organismo (no se imprime) */}
        {!modoOrganismo && comanda.estado === 'completada' && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-[#4CAF50] print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-[#4CAF50] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                  🎉 Comanda Completada - Lista para Notificar
                </p>
                <p className="text-sm text-[#666666]">
                  La comanda está lista. Envía una notificación al organismo con el link de acceso directo.
                </p>
              </div>
              <NotificacionComanda comanda={comanda} organismo={organismo} />
            </div>
          </div>
        )}

        {/* Acciones del Organismo (no se imprime) */}
        {modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-[#1E73BE] print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-[#1E73BE] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.2rem' }}>
                  Acciones de Comanda
                </p>
                <p className="text-sm text-[#666666]">
                  Haga clic directamente sobre cualquier cantidad para editarla, o acepte la comanda completa
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAceptarTodo}
                className="flex-1 bg-[#4CAF50] text-white hover:bg-green-600 border-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Check className="w-5 h-5 mr-2" />
                Aceptar Todo
              </Button>
              <Button
                onClick={handleAnular}
                variant="outline"
                className="flex-1 bg-[#DC3545] text-white hover:bg-red-700 border-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Ban className="w-5 h-5 mr-2" />
                Anular Comanda
              </Button>
            </div>

            {Object.values(cantidadesEditadas).some((cant, idx) => cant !== productosOrdenados[idx]?.cantidad) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-[#FFC107] rounded">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#333333] mb-1">Cantidades Modificadas</p>
                    <p className="text-sm text-[#666666] mb-3">
                      Ha modificado algunas cantidades. Puede continuar editando haciendo clic en otras cantidades o confirme los cambios.
                    </p>
                    <Button
                      onClick={handleAceptarModificado}
                      className="bg-[#4CAF50] text-white hover:bg-green-600"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar Cantidades Modificadas
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modelo de Comanda (se imprime) */}
        <div ref={comandaRef} className="bg-white p-8 print:p-0" data-comanda-print>
          {/* Encabezado */}
          <div className="border-b-4 border-[#1E73BE] pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="font-bold text-[#1E73BE] mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2.5rem' }}>
                  BANQUE ALIMENTAIRE
                </h1>
                <p className="text-[#666666] mb-1" style={{ fontSize: '1.1rem' }}>Sistema de Gestión de Comandas</p>
                <p className="text-[#666666]">Laval, Quebec, Canadá</p>
              </div>
              <div className="text-right">
                <div className="mb-4 bg-white p-2 rounded-lg shadow-md qrcode-container">
                  <QRCodeSVG 
                    value={qrData} 
                    size={120}
                    level="H"
                    includeMargin={true}
                    data-testid="qr-code"
                  />
                </div>
                <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.3rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {comanda.numero}
                </p>
              </div>
            </div>
          </div>

          {/* ORGANISMO EN GRANDE */}
          <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] border-4 border-[#1E73BE] rounded-xl shadow-lg">
            <p className="text-xs sm:text-sm text-[#666666] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              Organismo Destinatario
            </p>
            <h2 className="font-bold text-[#1E73BE] mb-3 text-xl sm:text-3xl lg:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif', lineHeight: '1.2' }}>
              {organismo?.nombre || 'Sin organismo'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#666666]"><strong>Dirección:</strong> {organismo?.direccion || 'N/A'}</p>
                <p className="text-[#666666]"><strong>Teléfono:</strong> {organismo?.telefono || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[#666666]"><strong>Responsable:</strong> {organismo?.responsable || 'N/A'}</p>
                <p className="text-[#666666]"><strong>Email:</strong> {organismo?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información de Cita y Preparación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-[#FFF8E1] border-2 border-[#FFC107] p-4 sm:p-5 rounded-lg">
              <p className="font-bold text-[#FFC107] mb-3 flex items-center gap-2 text-base sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📅 Cita de Recogida
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="text-[#333333]">
                  <strong>Día:</strong> {comanda.fechaEntrega ? 
                    new Date(comanda.fechaEntrega).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : dia}
                </p>
                <p className="text-[#333333]">
                  <strong>Hora:</strong> {comanda.horaRecogida || hora}
                </p>
                {comanda.fechaLimiteRespuesta && (
                  <p className="text-xs sm:text-sm text-[#DC3545] mt-2 font-medium">
                    ⚠️ Confirmar antes del: {new Date(comanda.fechaLimiteRespuesta).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-[#E8F5E9] border-2 border-[#4CAF50] p-4 sm:p-5 rounded-lg">
              <p className="font-bold text-[#4CAF50] mb-3 flex items-center gap-2 text-base sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                👤 Información de Preparación
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="text-[#333333]">
                  <strong>Preparada por:</strong> {comanda.usuarioCreacion || 'Por asignar'}
                </p>
                <p className="text-[#333333]">
                  <strong>Fecha creación:</strong> {new Date(comanda.fecha).toLocaleDateString('es-ES')}
                </p>
                <p className="text-[#333333]">
                  <strong>Hora creación:</strong> {new Date(comanda.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[#333333]">
                  <strong>Estado:</strong>{' '}
                  <Badge className={estadoActual?.color}>
                    {estadoActual?.label}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Productos organizados por temperatura */}
          <div className="mb-6">
            <h2 className="font-bold text-[#1E73BE] mb-4 pb-2 border-b-4 border-[#1E73BE] flex items-center gap-3" 
                style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
              <Thermometer className="w-6 h-6" />
              Productos por Temperatura de Almacenamiento
            </h2>

            {Object.entries(productosAgrupados).map(([temperatura, items]) => {
              if (items.length === 0) return null;
              
              const colorConfig = {
                'Temperatura Ambiente': { 
                  bg: 'bg-[#FFF8E1]', 
                  border: 'border-[#FFC107]', 
                  text: 'text-[#F57C00]',
                  icon: <Sun className="w-6 h-6 text-[#FFC107]" />
                },
                'Refrigerado': { 
                  bg: 'bg-[#E3F2FD]', 
                  border: 'border-[#1E73BE]', 
                  text: 'text-[#1E73BE]',
                  icon: <Thermometer className="w-6 h-6 text-[#1E73BE]" />
                },
                'Congelado': { 
                  bg: 'bg-[#E1F5FE]', 
                  border: 'border-[#0288D1]', 
                  text: 'text-[#0277BD]',
                  icon: <Snowflake className="w-6 h-6 text-[#0288D1]" />
                }
              };

              const config = colorConfig[temperatura as keyof typeof colorConfig];
              
              return (
                <div key={temperatura} className="mb-8 break-inside-avoid">
                  <div className={`flex items-center gap-3 mb-3 ${config.bg} border-2 ${config.border} p-4 rounded-lg`}>
                    {config.icon}
                    <h3 className={`font-bold ${config.text} text-base sm:text-lg lg:text-xl`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {temperatura}
                    </h3>
                    <Badge className="bg-[#4CAF50] ml-auto text-xs sm:text-sm" style={{ padding: '0.3rem 0.6rem' }}>
                      {items.length} producto{items.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <Table className="border-2 border-gray-300">
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          {/* 🎯 NUEVO: Columna para checkbox de progreso */}
                          {comanda.estado === 'en_preparacion' && !modoOrganismo && (
                            <TableHead className="font-bold text-center text-xs sm:text-sm w-16" style={{ fontFamily: 'Montserrat, sans-serif' }}>✓</TableHead>
                          )}
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Icono</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Código</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Producto</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Lote</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Vencimiento</TableHead>
                          <TableHead className="font-bold text-center text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cantidad</TableHead>
                          <TableHead className="font-bold text-center text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Unidad</TableHead>
                          {comanda.estado === 'completada' && (
                            <TableHead className="font-bold text-center text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Entregado</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item: any, index: number) => {
                          const itemKey = `${item.productoId}-${index}`;
                          return (
                            <TableRow key={itemKey} className="hover:bg-gray-50">
                              {/* 🎯 NUEVO: Checkbox para marcar producto como completado */}
                              {comanda.estado === 'en_preparacion' && !modoOrganismo && (
                                <TableCell className="text-center">
                                  <input
                                    type="checkbox"
                                    checked={productosCompletados[itemKey] || false}
                                    onChange={() => toggleProductoCompletado(itemKey)}
                                    className="w-5 h-5 cursor-pointer accent-[#4CAF50]"
                                    title="Marcar como completado"
                                  />
                                </TableCell>
                              )}
                              <TableCell className="text-center">
                                {item.producto?.icono ? (
                                  <span className="text-3xl">{item.producto.icono}</span>
                                ) : (
                                  <Box className="w-6 h-6 text-gray-400 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell className="font-mono font-medium">{item.producto?.codigo || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#333333]">
                                    {item.nombreProducto || item.producto?.nombre || 'Producto no encontrado'}
                                  </span>
                                  {item.producto?.categoria && (
                                    <span className="text-xs text-[#666666] mt-1">
                                      {item.producto.categoria}
                                      {(item.producto as any).subcategoria && ` › ${(item.producto as any).subcategoria}`}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-[#666666]">
                                {item.producto?.lote || 'N/A'}
                              </TableCell>
                              <TableCell className="text-sm text-[#666666]">
                                {item.producto?.fechaVencimiento ? 
                                  new Date(item.producto.fechaVencimiento).toLocaleDateString('es-ES') : 
                                  'N/A'
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                {modoEdicion || campoEditando === itemKey ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max={item.cantidad}
                                    value={cantidadesEditadas[itemKey] || item.cantidad}
                                    onChange={(e) => handleCambioCantidad(itemKey, parseInt(e.target.value) || 0, item.cantidad)}
                                    onBlur={() => setCampoEditando(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setCampoEditando(null);
                                      } else if (e.key === 'Escape') {
                                        // Restaurar cantidad original
                                        setCantidadesEditadas(prev => ({
                                          ...prev,
                                          [itemKey]: item.cantidad
                                        }));
                                        setCampoEditando(null);
                                      }
                                    }}
                                    autoFocus
                                    className="w-20 text-center font-bold text-[#1E73BE]"
                                  />
                                ) : (
                                  <span 
                                    className={`font-bold text-[#1E73BE] ${modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' ? 'cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors' : ''}`}
                                    style={{ fontSize: '1.2rem' }}
                                    onClick={() => {
                                      if (modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada') {
                                        setCampoEditando(itemKey);
                                      }
                                    }}
                                    title={modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' ? 'Clic para editar' : ''}
                                  >
                                    {cantidadesEditadas[itemKey] !== undefined && cantidadesEditadas[itemKey] !== item.cantidad ? (
                                      <span className="flex items-center justify-center gap-1">
                                        <span className="line-through text-gray-400 text-sm">{item.cantidad}</span>
                                        <span className="text-[#FFC107]">{cantidadesEditadas[itemKey]}</span>
                                      </span>
                                    ) : (
                                      item.cantidad
                                    )}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center text-[#666666] font-medium">
                                {item.producto?.unidad || 'N/A'}
                              </TableCell>
                              {comanda.estado === 'completada' && (
                                <TableCell className="text-center">
                                  <Badge className="bg-[#4CAF50]" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                                    {item.cantidadEntregada || item.cantidad}
                                  </Badge>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="border-t-4 border-[#1E73BE] pt-6 mb-8">
            <h3 className="font-bold text-[#333333] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.3rem' }}>
              Resumen de la Comanda
            </h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="bg-blue-50 border-2 border-[#1E73BE] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Total Productos</p>
                <p className="font-bold text-[#1E73BE]" style={{ fontSize: '2rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosOrdenados.length}
                </p>
              </div>
              <div className="bg-green-50 border-2 border-[#4CAF50] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Peso Total</p>
                <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosOrdenados.reduce((sum: number, item: any) => sum + (modoEdicion && cantidadesEditadas[item.productoId] !== undefined ? cantidadesEditadas[item.productoId] : item.cantidad), 0).toFixed(2)} kg
                </p>
              </div>
              <div className="bg-orange-50 border-2 border-[#FF9800] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Valor Monetario</p>
                <p className="font-bold text-[#FF9800]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  CAD$ {productosOrdenados.reduce((sum: number, item: any) => {
                    const cantidad = modoEdicion && cantidadesEditadas[item.productoId] !== undefined ? cantidadesEditadas[item.productoId] : item.cantidad;
                    return sum + (cantidad * (item.producto?.valorMonetario || 0));
                  }, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-50 border-2 border-[#FFC107] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Temp. Ambiente</p>
                <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosAgrupados['Temperatura Ambiente'].length}
                </p>
              </div>
              <div className="bg-blue-50 border-2 border-[#0288D1] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Refrigerado/Congelado</p>
                <p className="font-bold text-[#0288D1]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosAgrupados['Refrigerado'].length + productosAgrupados['Congelado'].length}
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {comanda.observaciones && (
            <div className="mb-8 p-5 bg-yellow-50 border-l-4 border-[#FFC107] rounded-lg">
              <p className="font-bold text-[#F57C00] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                📝 Observaciones Importantes
              </p>
              <p className="text-[#333333]">{comanda.observaciones}</p>
            </div>
          )}

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t-4 border-gray-300">
            <div className="bg-[#E8F5E9] p-5 rounded-lg border-2 border-[#4CAF50]">
              <p className="font-bold text-[#4CAF50] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                ✓ Preparado por
              </p>
              <div className="border-b-2 border-gray-400 mb-3" style={{ height: '60px' }}></div>
              <div className="text-sm text-[#333333] space-y-1">
                <p><strong>Nombre:</strong> {comanda.usuarioCreacion || '_____________________'}</p>
                <p><strong>Fecha:</strong> {new Date(comanda.fecha).toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> {new Date(comanda.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="bg-[#E3F2FD] p-5 rounded-lg border-2 border-[#1E73BE]">
              <p className="font-bold text-[#1E73BE] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                ✓ Recibido por ({organismo?.nombre})
              </p>
              <div className="border-b-2 border-gray-400 mb-3" style={{ height: '60px' }}></div>
              <div className="text-sm text-[#333333] space-y-1">
                <p><strong>Nombre:</strong> {personaAutorizada?.nombreCompleto || organismo?.responsable || '_____________________'}</p>
                {personaAutorizada && (
                  <>
                    <p><strong>Cargo:</strong> {personaAutorizada.cargo}</p>
                    <p><strong>Teléfono:</strong> {personaAutorizada.telefono}</p>
                  </>
                )}
                <p><strong>Fecha:</strong> _____________________</p>
                <p><strong>Hora:</strong> _____________________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 text-center text-xs text-[#666666]">
            <p className="font-medium">Ce document est un reçu officiel de la Banque Alimentaire</p>
            <p className="mt-1">Pour toute question, scannez le code QR ou contactez-nous au (514) 555-0100</p>
            <p className="mt-1">© 2026 Banque Alimentaire - Système de Gestion Intégral</p>
          </div>
        </div>
      </DialogContent>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 1cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          [role="dialog"] {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          
          [role="dialog"] * {
            visibility: visible;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          .print\\:max-h-full {
            max-height: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
}