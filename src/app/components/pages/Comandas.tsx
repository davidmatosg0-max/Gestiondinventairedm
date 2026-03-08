import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, FileCheck, Search, Printer, Users, Bell, Tag, Package, Check, X, Edit2, Ban, Calendar, Clock, QrCode, Utensils } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { mockOrganismos, mockProductos } from '../../data/mockData';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ModeloComanda } from './ModeloComanda';
import { obtenerComandas } from '../../utils/comandaStorage';
import { AlertaComandasUrgentes } from '../AlertaComandasUrgentes';
import { EtiquetaComanda } from '../comandas/EtiquetaComanda';
import { ComandaCompletaImprimible } from '../comandas/ComandaCompletaImprimible';
import { printStandardOrderLabel, type EtiquetaComandaData } from '../comandas/EtiquetaComandaEstandarizada';
import { printComandaYEtiquetaSeparadas } from '../comandas/ImpresionComandaEtiquetaSeparada';
import { ProponerNuevaFecha } from '../comandas/ProponerNuevaFecha';
import { EscanerQR } from '../comandas/EscanerQR';
import { filterByThreeLettersMultiple } from '../../utils/searchUtils';
import { 
  obtenerOfertas, 
  aceptarSolicitud,
  rechazarSolicitud,
  anularSolicitud,
  type Oferta,
  type SolicitudOferta 
} from '../../utils/ofertaStorage';
import { OfertasDisponibles } from '../cuisine/OfertasDisponibles';
import { useBranding } from '../../../hooks/useBranding';
import { Sparkles } from 'lucide-react';
import type { Comanda, ItemComanda, Organismo, ProductoOferta, Oferta as OfertaTipo, Solicitud, ProductoAceptado, DatosQR } from '../../types';

export function Comandas() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [searchTerm, setSearchTerm] = useState('');
  const [comandaDialogOpen, setComandaDialogOpen] = useState(false);
  const [comandaGrupoDialogOpen, setComandaGrupoDialogOpen] = useState(false);
  const [dialogNotificacionOpen, setDialogNotificacionOpen] = useState(false);
  const [mostrarModeloComanda, setMostrarModeloComanda] = useState(false);
  const [comandaSeleccionada, setComandaSeleccionada] = useState<Comanda | null>(null);
  const [selectedOrganismos, setSelectedOrganismos] = useState<string[]>([]);
  const [comandasSeleccionadas, setComandasSeleccionadas] = useState<string[]>([]);
  const [grupoItems, setGrupoItems] = useState<ItemComanda[]>([{ productoId: '', cantidad: 1, nombreProducto: '', unidad: '' }]);
  const [fechaEntregaGrupo, setFechaEntregaGrupo] = useState('');
  const [observacionesGrupo, setObservacionesGrupo] = useState('');
  const [searchInventario, setSearchInventario] = useState('');
  const [cantidadesInventario, setCantidadesInventario] = useState<Record<string, number>>({});
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [tabActual, setTabActual] = useState('comandas');
  
  // Estados para proponer nueva fecha
  const [dialogProponerFechaOpen, setDialogProponerFechaOpen] = useState(false);
  const [comandaParaAccion, setComandaParaAccion] = useState<Comanda | null>(null);
  
  // Estados para escanear QR
  const [escanerQROpen, setEscanerQROpen] = useState(false);
  
  // Estados para solicitudes de ofertas
  const [dialogVerSolicitudOpen, setDialogVerSolicitudOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [ofertaParaSolicitud, setOfertaParaSolicitud] = useState<OfertaTipo | null>(null);
  
  // Estados para ofertas
  const [estadoFiltroOferta, setEstadoFiltroOferta] = useState('todos');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<Oferta | null>(null);
  const [refreshOfertas, setRefreshOfertas] = useState(0);
  
  // Obtener ofertas actualizadas
  const ofertas = obtenerOfertas();
  
  // Estado para comandas
  const [comandas, setComandas] = useState<Comanda[]>([]);
  
  // Cargar comandas desde localStorage
  useEffect(() => {
    const cargarComandas = () => {
      const comandasCargadas = obtenerComandas();
      setComandas(comandasCargadas);
    };
    cargarComandas();
  }, []);

  // useEffect para leer el tab guardado desde CuisinePage
  useEffect(() => {
    const tabGuardado = localStorage.getItem('comandas-tab-activo');
    if (tabGuardado === 'ofertas-cocina') {
      setTabActual('ofertas-cocina');
      // Limpiar el localStorage después de usarlo
      localStorage.removeItem('comandas-tab-activo');
    }
  }, []);

  const getEstadoBadge = (estado: string) => {
    const config = {
      pendiente: { bg: 'bg-[#FFC107]', text: t('orders.pending') },
      en_preparacion: { bg: 'bg-[#1E73BE]', text: t('orders.inPreparation') },
      completada: { bg: 'bg-[#4CAF50]', text: t('orders.completed') },
      entregada: { bg: 'bg-[#2E7D32]', text: t('orders.delivered') },
      anulada: { bg: 'bg-[#DC3545]', text: t('orders.cancelled') }
    }[estado] || { bg: 'bg-gray-500', text: estado };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const handleCrearComandasGrupo = () => {
    if (selectedOrganismos.length === 0) {
      toast.error(t('orders.selectMinimumOrganism'));
      return;
    }
    if (grupoItems.length === 0 || grupoItems.some(item => !item.productoId || item.cantidad <= 0)) {
      toast.error(t('orders.selectValidProduct'));
      return;
    }
    
    toast.success(`${selectedOrganismos.length} ${t('orders.ordersCreatedSuccessfully')}`);
    setComandaGrupoDialogOpen(false);
    setSelectedOrganismos([]);
    setGrupoItems([{ productoId: '', cantidad: 1 }]);
    setFechaEntregaGrupo('');
    setObservacionesGrupo('');
  };

  const handleAddGrupoItem = () => {
    setGrupoItems([...grupoItems, { productoId: '', cantidad: 1 }]);
  };

  const handleRemoveGrupoItem = (index: number) => {
    setGrupoItems(grupoItems.filter((_, i) => i !== index));
  };

  const toggleOrganismo = (organismoId: string) => {
    setSelectedOrganismos(prev => 
      prev.includes(organismoId)
        ? prev.filter(id => id !== organismoId)
        : [...prev, organismoId]
    );
  };

  const toggleTodosOrganismos = () => {
    if (selectedOrganismos.length === mockOrganismos.length) {
      setSelectedOrganismos([]);
    } else {
      setSelectedOrganismos(mockOrganismos.map(o => o.id));
    }
  };

  const handleAgregarDesdeInventario = () => {
    const nuevosItems = Object.entries(cantidadesInventario)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId, cantidad }));
    
    if (nuevosItems.length === 0) {
      toast.error(t('orders.selectValidProduct'));
      return;
    }

    setGrupoItems([...grupoItems, ...nuevosItems]);
    setCantidadesInventario({});
    toast.success(`${nuevosItems.length} ${t('orders.productsAdded')}`);
  };

  const productosFiltrados = mockProductos.filter(p =>
    p.nombre.toLowerCase().includes(searchInventario.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchInventario.toLowerCase())
  );

  const handleCambiarEstado = (nuevoEstado: string) => {
    // Actualizar el estado de la comanda seleccionada
    if (comandaSeleccionada) {
      comandaSeleccionada.estado = nuevoEstado;
      setComandaSeleccionada({ ...comandaSeleccionada });
    }
    
    // Obtener el texto traducido del estado
    const estadosMap: Record<string, string> = {
      'pendiente': t('orders.pending'),
      'en_preparacion': t('orders.inPreparation'),
      'completada': t('orders.completed'),
      'entregada': t('orders.delivered'),
      'anulada': t('orders.cancelled')
    };
    
    const estadoTexto = estadosMap[nuevoEstado] || nuevoEstado;
    toast.success(`${t('orders.statusChangedTo')} ${estadoTexto}`);
  };

  const handleAceptarComanda = (itemsAceptados: ItemComanda[]) => {
    console.log('Items aceptados:', itemsAceptados);
    toast.success(t('orders.orderAccepted'));
    setMostrarModeloComanda(false);
  };

  const handleAnularComanda = () => {
    toast.success(t('orders.orderCancelled'));
    setMostrarModeloComanda(false);
  };

  const comandasPendientes = comandas.filter(c => c.estado === 'pendiente' || c.estado === 'completada');
  
  const toggleComandaSeleccionada = (comandaId: string) => {
    setComandasSeleccionadas(prev => 
      prev.includes(comandaId)
        ? prev.filter(id => id !== comandaId)
        : [...prev, comandaId]
    );
  };

  const toggleTodasComandas = () => {
    if (comandasSeleccionadas.length === comandasPendientes.length) {
      setComandasSeleccionadas([]);
    } else {
      setComandasSeleccionadas(comandasPendientes.map(c => c.id));
    }
  };

  const handleNotificarComandas = () => {
    if (comandasSeleccionadas.length === 0) {
      toast.error(t('orders.noOrdersSelected'));
      return;
    }

    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{t('orders.sendNotifications')}</span>
        <span className="text-sm text-[#666666]">
          {comandasSeleccionadas.length} {t('organisms.name')}{comandasSeleccionadas.length !== 1 ? 's' : ''}
        </span>
      </div>,
      { duration: 5000 }
    );
    
    setDialogNotificacionOpen(false);
    setComandasSeleccionadas([]);
  };

  // Handler para escanear QR
  const handleScanQR = (data: DatosQR) => {
    console.log('QR escaneado:', data);
    
    // Buscar la comanda por número
    const comandaEncontrada = comandas.find(c => 
      (c.numero && c.numero === data.comanda) || c.id === data.comanda
    );
    
    if (comandaEncontrada) {
      setComandaSeleccionada(comandaEncontrada);
      setMostrarModeloComanda(true);
      setEscanerQROpen(false);
      
      toast.success(
        <div>
          <span className="font-semibold">Commande trouvée!</span>
          <p className="text-sm text-[#666666]">N° {data.comanda}</p>
        </div>,
        { duration: 3000 }
      );
    } else {
      setEscanerQROpen(false);
      toast.error(
        <div>
          <span className="font-semibold">Commande non trouvée</span>
          <p className="text-sm text-[#666666]">N° {data.comanda || data.text}</p>
        </div>,
        { duration: 3000 }
      );
    }
  };

  // Handlers para gestión de solicitudes de ofertas
  const handleAceptarSolicitud = (ofertaId: string, solicitudId: string, organismoNombre: string) => {
    const exito = aceptarSolicitud(ofertaId, solicitudId);
    if (exito) {
      toast.success(`Solicitud de ${organismoNombre} aceptada exitosamente`);
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error(t('orders.errors.acceptError'));
    }
  };

  const handleRechazarSolicitud = (ofertaId: string, solicitudId: string, organismoNombre: string, motivo: string) => {
    if (!motivo || motivo.trim() === '') {
      toast.error(t('orders.errors.rejectReasonRequired'));
      return;
    }
    
    const exito = rechazarSolicitud(ofertaId, solicitudId, motivo);
    if (exito) {
      toast.success(`Solicitud de ${organismoNombre} rechazada`);
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error(t('orders.errors.rejectError'));
    }
  };

  const handleAnularSolicitud = (ofertaId: string, solicitudId: string, organismoNombre: string) => {
    const exito = anularSolicitud(ofertaId, solicitudId);
    if (exito) {
      toast.success(`Solicitud de ${organismoNombre} anulada exitosamente`);
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error('Error al anular la solicitud');
    }
  };
  
  // Función para imprimir etiqueta estandarizada
  const handleImprimirEtiquetaEstandarizada = async (comanda: Comanda, organismo: Organismo) => {
    const labelData: EtiquetaComandaData = {
      numeroComanda: comanda.numero || comanda.numeroComanda || comanda.id,
      fechaEntrega: comanda.fechaEntrega,
      estado: comanda.estado || 'pendiente',
      observaciones: comanda.observaciones,
      items: (comanda.items || []).map((item: ItemComanda) => ({
        nombre: item.nombreProducto || item.productoNombre || 'Producto',
        icono: item.icono,
        cantidad: item.cantidad,
        unidad: item.unidad,
        peso: item.peso
      })),
      organismoNombre: organismo?.nombre || 'Sin organismo',
      organismoTipo: organismo?.tipo,
      organismoDireccion: organismo?.direccion,
      organismoResponsable: organismo?.responsable,
      organismoTelefono: organismo?.telefono,
      horaCita: organismo?.horaCita,
      translations: {
        foodBank: t('common.foodBank') || 'BANQUE ALIMENTAIRE',
        orderLabel: t('commands.orderLabel') || 'Étiquette de Commande',
        orderNumber: t('commands.orderNumber') || 'N° Commande',
        deliveryDate: t('commands.deliveryDate') || 'Livraison',
        status: t('commands.status') || 'Statut',
        products: t('commands.products') || 'Produits',
        articles: t('commands.articles') || 'articles',
        recipient: t('commands.recipient') || 'Organisme Destinataire',
        name: t('common.name') || 'Nom',
        type: t('common.type') || 'Type',
        address: t('common.address') || 'Adresse',
        responsible: t('common.responsible') || 'Responsable',
        phone: t('common.phone') || 'Téléphone',
        observations: t('common.observations') || 'Observations',
        deliveredBy: t('commands.deliveredBy') || 'Remis par',
        receivedBy: t('commands.receivedBy') || 'Reçu par',
        nameAndSignature: t('commands.nameAndSignature') || 'Nom et signature',
        printedOn: t('common.printedOn') || 'Imprimé le',
        systemFooter: t('commands.systemFooter') || 'Système de Gestion des Commandes',
        pending: t('commands.pending') || 'EN ATTENTE',
        inPreparation: t('commands.inPreparation') || 'EN PRÉPARATION',
        ready: t('commands.ready') || 'PRÊTE',
        delivered: t('commands.delivered') || 'LIVRÉE',
        cancelled: t('commands.cancelled') || 'ANNULÉE',
      }
    };

    try {
      await printStandardOrderLabel(labelData);
      toast.success('Étiquette imprimée avec succès');
    } catch (err) {
      console.error('Error al imprimir etiqueta:', err);
      toast.error('Erreur lors de l\'impression de l\'étiquette');
    }
  };
  
  // Función para imprimir comanda y etiqueta en hojas separadas
  const handleImprimirComandaYEtiqueta = async (comanda: Comanda, organismo: Organismo) => {
    try {
      await printComandaYEtiquetaSeparadas(comanda, organismo);
      toast.success('Commande et étiquette imprimées avec succès');
    } catch (err) {
      console.error('Error al imprimir comanda y etiqueta:', err);
      toast.error('Erreur lors de l\'impression');
    }
  };
  
  // Función helper para convertir solicitud a formato de comanda para etiqueta e impresión
  const convertirSolicitudAComanda = (solicitud: SolicitudOferta, oferta: Oferta) => {
    // Buscar organismo
    const organismo = mockOrganismos.find(o => o.nombre === solicitud.organismoNombre);
    
    // Convertir productos de la solicitud al formato esperado por EtiquetaComanda
    const items = solicitud.productosAceptados.map(prodAceptado => {
      const productoOferta = oferta.productos.find(p => p.productoId === prodAceptado.productoId);
      return {
        productoId: prodAceptado.productoId,
        nombreProducto: productoOferta?.productoNombre || 'Producto',
        cantidad: prodAceptado.cantidadAceptada,
        unidad: productoOferta?.unidad || 'unidades'
      };
    });
    
    // Crear comanda ficticia para la etiqueta
    return {
      id: `SOL-${solicitud.id}`,
      numeroComanda: `SOL-${solicitud.id}`,
      organismoId: organismo?.id || '',
      fechaCreacion: solicitud.fechaSolicitud,
      fechaEntrega: solicitud.fechaSolicitud, // Usar la fecha de solicitud como referencia
      estado: 'completada',
      items: items,
      observaciones: solicitud.observaciones || ''
    };
  };

  const getEstadoSolicitudBadge = (estado: string) => {
    const config = {
      pendiente: { bg: 'bg-[#FFC107]', text: 'Pendiente' },
      aceptada: { bg: 'bg-[#4CAF50]', text: 'Aceptada' },
      rechazada: { bg: 'bg-[#DC3545]', text: 'Rechazada' },
      anulada: { bg: 'bg-[#666666]', text: 'Anulada' }
    }[estado] || { bg: 'bg-gray-500', text: estado };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const comandasFiltradas = comandas.filter(comanda => {
    const organismo = mockOrganismos.find(o => o.id === comanda.organismoId);
    const cumpleBusqueda = filterByThreeLettersMultiple(
      [comanda.id, organismo?.nombre || ''],
      searchTerm
    );
    const cumpleEstado = estadoFiltro === 'todos' || comanda.estado === estadoFiltro;
    return cumpleBusqueda && cumpleEstado;
  });

  const totalComandas = comandas.length;
  const comandasActivas = comandas.filter(c => c.estado !== 'anulada' && c.estado !== 'entregada').length;
  const comandasPendientesCount = comandas.filter(c => c.estado === 'pendiente').length;
  const comandasCompletadas = comandas.filter(c => c.estado === 'entregada').length;

  if (mostrarModeloComanda && comandaSeleccionada) {
    const organismo = mockOrganismos.find(o => o.id === comandaSeleccionada.organismoId);
    return (
      <ModeloComanda
        comanda={comandaSeleccionada}
        organismo={organismo}
        mostrar={mostrarModeloComanda}
        onCerrar={() => setMostrarModeloComanda(false)}
        onCambiarEstado={handleCambiarEstado}
        onAceptarComanda={handleAceptarComanda}
        onAnularComanda={handleAnularComanda}
      />
    );
  }

  return (
    <div 
      className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Alerta de comandas urgentes */}
        <AlertaComandasUrgentes />

        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {branding.logo ? (
                <div 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border-2"
                  style={{ borderColor: branding.primaryColor }}
                >
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
              ) : (
                <div 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <FileCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 
                    className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: branding.primaryColor 
                    }}
                  >
                    {t('orders.title')}
                  </h1>
                  <Sparkles 
                    className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
                    style={{ color: branding.secondaryColor }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">{t('orders.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="icon"
                onClick={() => setEscanerQROpen(true)}
                className="text-white transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                  boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
                }}
                title="Scanner QR"
              >
                <QrCode className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setDialogNotificacionOpen(true)}
                size="icon"
                title={t('orders.notifyPendingOrders')}
                className="text-[#333333] transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #FFC107 0%, #E6AC00 100%)',
                  boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)'
                }}
              >
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats con glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ 
              borderLeftColor: branding.primaryColor,
              boxShadow: `0 4px 15px ${branding.primaryColor}20`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('orders.totalOrders')}</p>
                <p 
                  className="font-bold text-2xl"
                  style={{ color: branding.primaryColor }}
                >
                  {totalComandas}
                </p>
              </div>
              <FileCheck 
                className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" 
                style={{ color: branding.primaryColor }}
              />
            </div>
          </div>

          <div 
            className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ 
              borderLeftColor: branding.secondaryColor,
              boxShadow: `0 4px 15px ${branding.secondaryColor}20`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('orders.activeOrders')}</p>
                <p 
                  className="font-bold text-2xl"
                  style={{ color: branding.secondaryColor }}
                >
                  {comandasActivas}
                </p>
              </div>
              <Eye 
                className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" 
                style={{ color: branding.secondaryColor }}
              />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#FFC107] transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('orders.pendingOrders')}</p>
                <p className="font-bold text-2xl text-[#FFC107]">{comandasPendientesCount}</p>
              </div>
              <Printer className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFC107] opacity-20" />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#2E7D32] transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('orders.completedOrders')}</p>
                <p className="font-bold text-2xl text-[#2E7D32]">{comandasCompletadas}</p>
              </div>
              <FileCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#2E7D32] opacity-20" />
            </div>
          </div>
      </div>

        {/* Tabs: Comandas, Ofertas y Ofertas Cocina - Con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60">
          <Tabs value={tabActual} onValueChange={setTabActual}>
            <div className="p-4 sm:p-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comandas" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {t('orders.title')}
                </TabsTrigger>
                <TabsTrigger value="ofertas" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Solicitudes de Ofertas
                </TabsTrigger>
                <TabsTrigger value="ofertas-cocina" className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Ofertas Cocina
                </TabsTrigger>
              </TabsList>
            </div>

          {/* TAB: COMANDAS */}
          <TabsContent value="comandas" className="p-4 sm:p-6 pt-0 space-y-4">\n            {/* Búsqueda y filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('orders.searchByNumber')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('orders.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{t('orders.allStatuses')}</SelectItem>
                <SelectItem value="pendiente">{t('orders.pending')}</SelectItem>
                <SelectItem value="en_preparacion">{t('orders.inPreparation')}</SelectItem>
                <SelectItem value="completada">{t('orders.completed')}</SelectItem>
                <SelectItem value="entregada">{t('orders.delivered')}</SelectItem>
                <SelectItem value="anulada">{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de comandas */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('orders.orderNumber')}</TableHead>
                    <TableHead>{t('orders.organism')}</TableHead>
                    <TableHead>{t('orders.deliveryDate')}</TableHead>
                    <TableHead>{t('orders.products')}</TableHead>
                    <TableHead>{t('orders.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comandasFiltradas.map((comanda) => {
                    const organismo = mockOrganismos.find(o => o.id === comanda.organismoId);
                    return (
                      <TableRow key={comanda.id}>
                        <TableCell className="font-medium">{comanda.numero || comanda.id}</TableCell>
                        <TableCell>{organismo?.nombre}</TableCell>
                        <TableCell>{new Date(comanda.fechaEntrega).toLocaleDateString()}</TableCell>
                        <TableCell>{comanda.items?.length || 0} {t('inventory.products')}</TableCell>
                        <TableCell>{getEstadoBadge(comanda.estado)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setComandaSeleccionada(comanda);
                                setMostrarModeloComanda(true);
                              }}
                              title="Ver detalle de la comanda"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const organismo = mockOrganismos.find(o => o.id === comanda.organismoId);
                                handleImprimirEtiquetaEstandarizada(comanda, organismo);
                              }}
                              title="Imprimir étiquette"
                              className="text-[#1E73BE] hover:text-[#1E73BE]"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: OFERTAS */}
        <TabsContent value="ofertas" className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Filtro de ofertas por estado */}
          <div className="flex gap-4">
            <Select value={estadoFiltroOferta} onValueChange={setEstadoFiltroOferta}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{t('orders.allOffers')}</SelectItem>
                <SelectItem value="pendientes">{t('orders.pending')}</SelectItem>
                <SelectItem value="con_solicitudes">{t('orders.withRequests')}</SelectItem>
                <SelectItem value="activas">{t('orders.activeOffers')}</SelectItem>
                <SelectItem value="expiradas">Expiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de ofertas con sus solicitudes */}
          <div className="space-y-4">
            {ofertas
              .filter(oferta => {
                if (estadoFiltroOferta === 'todos') return true;
                if (estadoFiltroOferta === 'pendientes') return (oferta.solicitudes?.length || 0) === 0 && oferta.activa;
                if (estadoFiltroOferta === 'con_solicitudes') return (oferta.solicitudes?.length || 0) > 0;
                if (estadoFiltroOferta === 'activas') return oferta.activa && new Date(oferta.fechaExpiracion) > new Date();
                if (estadoFiltroOferta === 'expiradas') return !oferta.activa || new Date(oferta.fechaExpiracion) < new Date();
                return true;
              })
              .map(oferta => {
                const totalSolicitudes = oferta.solicitudes?.length || 0;
                const fechaExpiracion = new Date(oferta.fechaExpiracion);
                const estaExpirada = fechaExpiracion < new Date();
                const diasRestantes = Math.ceil((fechaExpiracion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={oferta.id} className={estaExpirada ? 'opacity-60' : ''}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header de la oferta */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Tag className="w-5 h-5 text-[#FFC107]" />
                              <h3 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                                {oferta.titulo}
                              </h3>
                            </div>
                            <p className="text-xs text-[#666666] mb-1">{oferta.numeroOferta}</p>
                            {oferta.descripcion && (
                              <p className="text-sm text-[#666666]">{oferta.descripcion}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={estaExpirada ? 'bg-[#DC3545]' : diasRestantes <= 3 ? 'bg-[#FFC107]' : 'bg-[#4CAF50]'}>
                              {estaExpirada ? 'Expirada' : `Expira: ${fechaExpiracion.toLocaleDateString('es-ES')}`}
                            </Badge>
                            {totalSolicitudes > 0 && (
                              <Badge className="bg-[#1E73BE]">
                                {totalSolicitudes} solicitud{totalSolicitudes !== 1 ? 'es' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Productos de la oferta */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Productos Ofrecidos
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {oferta.productos.map((producto, idx) => {
                              const cantidadReservada = producto.cantidadOfrecida - producto.cantidadDisponible;
                              const porcentajeDisponible = (producto.cantidadDisponible / producto.cantidadOfrecida) * 100;
                              
                              return (
                                <div key={`${oferta.id}-producto-${producto.productoId}-${idx}`} className="bg-white border rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{producto.icono}</span>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-[#333333]">{producto.productoNombre}</p>
                                      <p className="text-xs text-[#666666]">{producto.categoria}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-[#666666]">Disponible:</span>
                                      <span className="font-semibold text-[#4CAF50]">
                                        {producto.cantidadDisponible} / {producto.cantidadOfrecida} {producto.unidad}
                                      </span>
                                    </div>
                                    {cantidadReservada > 0 && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-[#666666]">Reservada:</span>
                                        <span className="font-semibold text-[#FFC107]">
                                          {cantidadReservada} {producto.unidad}
                                        </span>
                                      </div>
                                    )}
                                    {/* Barra de progreso */}
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div
                                        className="h-2 rounded-full transition-all"
                                        style={{
                                          width: `${porcentajeDisponible}%`,
                                          backgroundColor: porcentajeDisponible > 50 ? '#4CAF50' : porcentajeDisponible > 20 ? '#FFC107' : '#DC3545'
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Solicitudes de la oferta */}
                        {totalSolicitudes > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-[#333333] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              <Users className="w-4 h-4 text-[#1E73BE]" />
                              Solicitudes Recibidas ({totalSolicitudes})
                            </h4>
                            <div className="space-y-2">
                              {oferta.solicitudes?.map((solicitud, idx) => {
                                // Calcular totales de la solicitud
                                const totalKilos = solicitud.productosAceptados.reduce((sum, p) => {
                                  const producto = oferta.productos.find(prod => prod.productoId === p.productoId);
                                  return sum + (producto?.peso || 0) * p.cantidadAceptada;
                                }, 0);
                                
                                const totalValor = solicitud.productosAceptados.reduce((sum, p) => {
                                  const producto = oferta.productos.find(prod => prod.productoId === p.productoId);
                                  return sum + (producto?.valorUnitario || 0) * (producto?.peso || 0) * p.cantidadAceptada;
                                }, 0);

                                return (
                                  <div key={`${oferta.id}-solicitud-${solicitud.id}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <p className="font-semibold text-[#333333]">{solicitud.organismoNombre}</p>
                                        <p className="text-xs text-[#666666]">
                                          {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getEstadoSolicitudBadge(solicitud.estado)}
                                      </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    {solicitud.estado === 'pendiente' && (
                                      <div className="flex gap-2 mb-3">
                                        <Button
                                          size="sm"
                                          className="flex-1 bg-[#4CAF50] hover:bg-[#45A049]"
                                          onClick={() => handleAceptarSolicitud(oferta.id, solicitud.id, solicitud.organismoNombre)}
                                        >
                                          <Check className="w-4 h-4 mr-1" />
                                          Aceptar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="flex-1"
                                          onClick={() => {
                                            const motivo = prompt('Ingrese el motivo del rechazo:');
                                            if (motivo) {
                                              handleRechazarSolicitud(oferta.id, solicitud.id, solicitud.organismoNombre, motivo);
                                            }
                                          }}
                                        >
                                          <X className="w-4 h-4 mr-1" />
                                          Rechazar
                                        </Button>
                                      </div>
                                    )}

                                    {solicitud.estado === 'aceptada' && (
                                      <div className="flex gap-2 mb-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                                          onClick={() => {
                                            setSolicitudSeleccionada(solicitud);
                                            setOfertaParaSolicitud(oferta);
                                            setDialogVerSolicitudOpen(true);
                                          }}
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          Ver
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                                          onClick={() => {
                                            const comandaConvertida = convertirSolicitudAComanda(solicitud, oferta);
                                            const organismo = mockOrganismos.find(o => o.id === comandaConvertida.organismoId);
                                            handleImprimirEtiquetaEstandarizada(comandaConvertida, organismo);
                                          }}
                                        >
                                          <Printer className="w-4 h-4 mr-1" />
                                          Imprimir
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white"
                                          onClick={() => {
                                            const comandaConvertida = convertirSolicitudAComanda(solicitud, oferta);
                                            setComandaParaAccion(comandaConvertida);
                                            setDialogProponerFechaOpen(true);
                                          }}
                                        >
                                          <Calendar className="w-4 h-4 mr-1" />
                                          Proponer fecha
                                        </Button>
                                      </div>
                                    )}

                                    {solicitud.estado === 'aceptada' && (
                                      <div className="flex gap-2 mb-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleAnularSolicitud(oferta.id, solicitud.id, solicitud.organismoNombre)}
                                        >
                                          <Ban className="w-4 h-4 mr-1" />
                                          Anular
                                        </Button>
                                      </div>
                                    )}

                                    {/* Productos solicitados */}
                                    <div className="bg-white rounded-lg p-3 mb-3">
                                      <p className="text-xs font-semibold text-[#666666] mb-2">{t('orders.requestedProducts')}</p>
                                      <div className="space-y-1">
                                        {solicitud.productosAceptados.map((prodAceptado, pIdx) => {
                                          const producto = oferta.productos.find(p => p.productoId === prodAceptado.productoId);
                                          return (
                                            <div key={`${solicitud.id}-prod-${prodAceptado.productoId}-${pIdx}`} className="flex items-center justify-between text-sm">
                                              <div className="flex items-center gap-2">
                                                <span>{producto?.icono}</span>
                                                <span className="text-[#333333]">{producto?.productoNombre}</span>
                                              </div>
                                              <span className="font-semibold text-[#1E73BE]">
                                                {prodAceptado.cantidadAceptada} {producto?.unidad}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Totales */}
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                      <div className="bg-white rounded p-2 text-center">
                                        <p className="text-xs text-[#666666]">Productos</p>
                                        <p className="font-bold text-[#1E73BE]">{solicitud.productosAceptados.length}</p>
                                      </div>
                                      <div className="bg-white rounded p-2 text-center">
                                        <p className="text-xs text-[#666666]">Peso Total</p>
                                        <p className="font-bold text-[#4CAF50]">{totalKilos.toFixed(1)} kg</p>
                                      </div>
                                      <div className="bg-white rounded p-2 text-center">
                                        <p className="text-xs text-[#666666]">Valor</p>
                                        <p className="font-bold text-[#FFC107]">CAD$ {totalValor.toFixed(2)}</p>
                                      </div>
                                    </div>

                                    {/* Observaciones y fecha de recogida */}
                                    {solicitud.observaciones && (
                                      <div className="bg-yellow-50 border border-[#FFC107] rounded p-3">
                                        <p className="text-xs font-semibold text-[#666666] mb-1">Detalles:</p>
                                        <p className="text-sm text-[#333333]">{solicitud.observaciones}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Mensaje si no hay solicitudes */}
                        {totalSolicitudes === 0 && !estaExpirada && (
                          <div className="text-center py-4 text-[#666666]">
                            <p className="text-sm">{t('orders.noRequestsYet')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            {/* Mensaje si no hay ofertas */}
            {ofertas.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-[#666666]">
                    <Tag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold mb-2">{t('orders.noOffersCreated')}</p>
                    <p className="text-sm">{t('orders.specialOffersAppearHere')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB: OFERTAS COCINA */}
        <TabsContent value="ofertas-cocina" className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#FF9800]" />
              Offres Disponibles (Cuisine)
            </h3>
            <p className="text-sm text-[#666666] mb-4">
              Consultez et acceptez les offres disponibles pour votre cuisine.
            </p>
            <OfertasDisponibles onOfertaAceptada={() => {
              // Recargar datos si es necesario
              setRefreshOfertas(prev => prev + 1);
            }} />
          </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de notificaciones */}
      <Dialog open={dialogNotificacionOpen} onOpenChange={setDialogNotificacionOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="notificacion-dialog-description">
          <DialogHeader>
            <DialogTitle>{t('orders.notifyPendingOrders')}</DialogTitle>
            <DialogDescription id="notificacion-dialog-description">
              Seleccione las comandas que desea notificar a los organismos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#666666]">{t('orders.selectOrdersToNotify')}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={comandasSeleccionadas.length === comandasPendientes.length}
                onCheckedChange={toggleTodasComandas}
              />
              <Label>{t('inventory.selectAll')}</Label>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {comandasPendientes.map(comanda => {
                const organismo = mockOrganismos.find(o => o.id === comanda.organismoId);
                return (
                  <div key={comanda.id} className="flex items-center gap-2 p-3 border rounded">
                    <Checkbox
                      checked={comandasSeleccionadas.includes(comanda.id)}
                      onCheckedChange={() => toggleComandaSeleccionada(comanda.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{comanda.id}</p>
                      <p className="text-sm text-[#666666]">{organismo?.nombre}</p>
                    </div>
                    {getEstadoBadge(comanda.estado)}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogNotificacionOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleNotificarComandas} className="bg-[#1E73BE] hover:bg-[#1557A0]">
                {t('orders.sendNotifications')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para proponer nueva fecha */}
      <ProponerNuevaFecha
        open={dialogProponerFechaOpen}
        onOpenChange={setDialogProponerFechaOpen}
        comanda={comandaParaAccion}
        organismo={mockOrganismos.find(o => o.id === comandaParaAccion?.organismoId)}
        onConfirmar={(nuevaFecha, nuevaHora, motivo) => {
          console.log('Nueva fecha propuesta:', { nuevaFecha, nuevaHora, motivo });
          // Aquí se actualizaría la comanda con la nueva fecha propuesta
        }}
      />

      {/* Dialog para ver detalles de solicitud */}
      <Dialog open={dialogVerSolicitudOpen} onOpenChange={setDialogVerSolicitudOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="solicitud-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
              Detalles de la Solicitud
            </DialogTitle>
            <DialogDescription id="solicitud-dialog-description">
              Información completa de la solicitud aceptada
            </DialogDescription>
          </DialogHeader>
          {solicitudSeleccionada && ofertaParaSolicitud && (
            <div className="space-y-4 py-4">
              {/* Info del organismo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Organismo
                </h3>
                <p className="text-lg font-semibold text-[#1E73BE]">{solicitudSeleccionada.organismoNombre}</p>
                <p className="text-sm text-[#666666] mt-1">
                  Solicitud realizada: {new Date(solicitudSeleccionada.fechaSolicitud).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="mt-2">
                  {getEstadoSolicitudBadge(solicitudSeleccionada.estado)}
                </div>
              </div>

              {/* Productos solicitados */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Productos Solicitados ({solicitudSeleccionada.productosAceptados.length})
                </h3>
                <div className="space-y-2">
                  {solicitudSeleccionada.productosAceptados.map((prodAceptado: ProductoAceptado, idx: number) => {
                    const producto = ofertaParaSolicitud.productos.find((p: ProductoOferta) => p.productoId === prodAceptado.productoId);
                    const pesoTotal = (producto?.peso || 0) * prodAceptado.cantidadAceptada;
                    const valorTotal = (producto?.valorUnitario || 0) * pesoTotal;
                    
                    return (
                      <div key={`detalle-prod-${prodAceptado.productoId}-${idx}`} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{producto?.icono}</span>
                            <div>
                              <p className="font-semibold text-[#333333]">{producto?.productoNombre}</p>
                              <p className="text-xs text-[#666666]">{producto?.categoria}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-[#1E73BE]">
                            {prodAceptado.cantidadAceptada} {producto?.unidad}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="text-center">
                            <p className="text-xs text-[#666666]">Peso Total</p>
                            <p className="font-semibold text-[#4CAF50]">{pesoTotal.toFixed(2)} kg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#666666]">Valor/kg</p>
                            <p className="font-semibold text-[#FFC107]">CAD$ {producto?.valorUnitario?.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#666666]">{t('orders.valueTotal')}</p>
                            <p className="font-semibold text-[#FFC107]">CAD$ {valorTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totales generales */}
              <div className="bg-green-50 border-2 border-[#4CAF50] rounded-lg p-4">
                <h3 className="font-bold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Totales
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-[#666666] mb-1">{t('orders.totalProductsLabel')}</p>
                    <p className="text-2xl font-bold text-[#1E73BE]">
                      {solicitudSeleccionada.productosAceptados.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#666666] mb-1">Peso Total</p>
                    <p className="text-2xl font-bold text-[#4CAF50]">
                      {solicitudSeleccionada.productosAceptados.reduce((sum: number, p: ProductoAceptado) => {
                        const producto = ofertaParaSolicitud.productos.find((prod: ProductoOferta) => prod.productoId === p.productoId);
                        return sum + (producto?.peso || 0) * p.cantidadAceptada;
                      }, 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#666666] mb-1">{t('orders.valueTotal')}</p>
                    <p className="text-2xl font-bold text-[#FFC107]">
                      CAD$ {solicitudSeleccionada.productosAceptados.reduce((sum: number, p: ProductoAceptado) => {
                        const producto = ofertaParaSolicitud.productos.find((prod: ProductoOferta) => prod.productoId === p.productoId);
                        return sum + (producto?.valorUnitario || 0) * (producto?.peso || 0) * p.cantidadAceptada;
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {solicitudSeleccionada.observaciones && (
                <div className="bg-yellow-50 border border-[#FFC107] rounded-lg p-4">
                  <h3 className="font-bold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Detalles y Observaciones
                  </h3>
                  <p className="text-sm text-[#333333] whitespace-pre-wrap">
                    {solicitudSeleccionada.observaciones}
                  </p>
                </div>
              )}

              {/* Botón de cerrar */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogVerSolicitudOpen(false)}
                  className="min-w-[120px]"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Escáner QR */}
      {escanerQROpen && (
        <EscanerQR
          onScanSuccess={handleScanQR}
          onClose={() => setEscanerQROpen(false)}
        />
      )}
      </div>
    </div>
  );
}