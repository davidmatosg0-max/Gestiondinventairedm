import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Phone, Mail, MapPin, Users, Calendar, Package, History, TrendingUp, Award, CheckCircle, Eye, X, Printer, Edit2, Save, Plus, Thermometer, Download, FileText, FileSpreadsheet, Tag, ShoppingCart, Clock, AlertCircle, Minus, Trash2, Star, UserPlus, MessageSquare, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { mockComandas, mockProductos } from '../../data/mockData';
import { ModeloComanda } from './ModeloComanda';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { LanguageSelector } from '../organism-portal/LanguageSelector';
import { ConfirmacionComanda } from '../organismo/ConfirmacionComanda';
import { MesDemandes } from '../organismos/MesDemandes';
import { obtenerOfertas, aceptarOferta, anularSolicitud, type Oferta, type SolicitudOferta, type EstadoSolicitud } from '../../utils/ofertaStorage';
import { Checkbox } from '../ui/checkbox';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { useBranding } from '../../../hooks/useBranding';
import { 
  obtenerPersonasPorOrganismo, 
  guardarPersonaResponsable, 
  actualizarPersonaResponsable, 
  eliminarPersonaResponsable,
  marcarComoPrincipal,
  inicializarPersonasEjemplo,
  limpiarPersonasDuplicadas,
  type PersonaResponsable,
  type IdiomaPersona 
} from '../../utils/personasResponsablesStorage';

interface VistaPublicaOrganismoProps {
  organismo: any;
  onCerrarSesion: () => void;
}

export function VistaPublicaOrganismo({ organismo, onCerrarSesion }: VistaPublicaOrganismoProps) {
  const { t, i18n } = useTranslation();
  const branding = useBranding();

  // Estado para refrescar ofertas (DEBE estar antes de useMemo)
  const [refreshOfertas, setRefreshOfertas] = useState(0);

  // Obtener comandas del organismo
  const comandasOrganismo = mockComandas.filter(c => c.organismoId === organismo.id);

  // Obtener ofertas disponibles para el organismo (se actualiza con refreshOfertas)
  const todasLasOfertas = React.useMemo(() => obtenerOfertas(), [refreshOfertas]);
  const ofertasDelOrganismo = React.useMemo(() => todasLasOfertas.filter(oferta => {
    // Verificar si es visible
    if (!oferta.visible) return false;
    
    // Verificar si es para todos o si incluye este organismo
    if (oferta.organismosDestino === 'todos') return true;
    if (Array.isArray(oferta.organismosDestino) && oferta.organismosDestino.includes(organismo.id)) {
      return true;
    }
    
    return false;
  }), [todasLasOfertas, organismo.id, refreshOfertas]);

  // Calcular estado de una oferta
  const calcularEstadoOferta = (oferta: Oferta): {
    estado: 'activa' | 'expirada' | 'agotada';
    label: string;
    color: string;
    diasRestantes: number;
  } => {
    const ahora = new Date();
    const fechaExpiracion = new Date(oferta.fechaExpiracion);
    const diasRestantes = Math.ceil((fechaExpiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verificar si está expirada
    if (fechaExpiracion < ahora || !oferta.activa) {
      return {
        estado: 'expirada',
        label: 'Expirada',
        color: '#c23934',
        diasRestantes: 0
      };
    }
    
    // Verificar si tiene productos disponibles
    const tieneDisponibilidad = oferta.productos.some(p => p.cantidadDisponible > 0);
    if (!tieneDisponibilidad) {
      return {
        estado: 'agotada',
        label: 'Agotada',
        color: '#6c757d',
        diasRestantes
      };
    }
    
    return {
      estado: 'activa',
      label: diasRestantes <= 3 ? `Expira en ${diasRestantes} días` : 'Activa',
      color: diasRestantes <= 3 ? '#e8a419' : '#2d9561',
      diasRestantes
    };
  };

  // Calcular estadísticas
  const totalComandas = comandasOrganismo.length;
  const comandasCompletadas = comandasOrganismo.filter(c => c.estado === 'completada').length;

  // Calcular datos para el gráfico de categorías
  const calcularDatosCategorias = () => {
    const categorias: { [key: string]: { cantidad: number, icono: string } } = {};
    
    // Procesar comandas completadas
    comandasOrganismo
      .filter(c => c.estado === 'completada')
      .forEach(comanda => {
        comanda.items.forEach(item => {
          const producto = mockProductos.find(p => p.id === item.productoId);
          if (producto) {
            if (!categorias[producto.categoria]) {
              categorias[producto.categoria] = { 
                cantidad: 0, 
                icono: producto.icono || '📦' 
              };
            }
            categorias[producto.categoria].cantidad += item.cantidad;
          }
        });
      });

    // Convertir a array para el gráfico
    return Object.entries(categorias).map(([nombre, data]) => ({
      categoria: nombre,
      cantidad: Math.round(data.cantidad),
      icono: data.icono
    })).sort((a, b) => b.cantidad - a.cantidad);
  };

  const datosCategorias = calcularDatosCategorias();

  // Colores para las barras del gráfico
  const coloresGrafico = ['#1a4d7a', '#2d9561', '#e8a419', '#c23934', '#9C27B0', '#FF5722', '#00BCD4', '#795548'];

  // Estado para mostrar detalles de una comanda
  const [comandaSeleccionada, setComandaSeleccionada] = useState<any>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  
  // Estado para mostrar Mes Demandes
  const [mostrarDemandes, setMostrarDemandes] = useState(false);
  
  // Estados para edición de perfil
  const [editarPerfilOpen, setEditarPerfilOpen] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({
    responsable: organismo.responsable,
    telefono: organismo.telefono,
    email: organismo.email,
    beneficiarios: organismo.beneficiarios,
    direccion: organismo.direccion,
    codigoPostal: organismo.codigoPostal || ''
  });

  // Estados para Reportes
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estado para el diálogo de PRS (Registro de Servicios Prestados)
  const [prsDialogOpen, setPrsDialogOpen] = useState(false);

  // Estados para gestión de personas responsables
  const [personasResponsables, setPersonasResponsables] = useState<PersonaResponsable[]>([]);
  const [dialogPersonasOpen, setDialogPersonasOpen] = useState(false);
  const [dialogFormPersonaOpen, setDialogFormPersonaOpen] = useState(false);
  const [personaEditando, setPersonaEditando] = useState<PersonaResponsable | null>(null);
  const [formPersona, setFormPersona] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    cargo: '',
    notas: '',
    esPrincipal: false,
    joursDisponibles: [] as JourDisponible[],
    idiomas: [] as IdiomaPersona[]
  });

  // Cargar personas responsables
  useEffect(() => {
    // Limpiar duplicados si existen
    limpiarPersonasDuplicadas();
    
    // Solo inicializar personas de ejemplo si no hay ninguna persona para este organismo
    const personasExistentes = obtenerPersonasPorOrganismo(organismo.id);
    if (personasExistentes.length === 0) {
      inicializarPersonasEjemplo(organismo.id, organismo.nombre, organismo.responsable);
    }
    cargarPersonasResponsables();
  }, [organismo.id]);

  const cargarPersonasResponsables = () => {
    const personas = obtenerPersonasPorOrganismo(organismo.id);
    setPersonasResponsables(personas);
  };

  // Estados para edición de ofertas
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<Oferta | null>(null);
  const [editarOfertaOpen, setEditarOfertaOpen] = useState(false);
  const [fechaRecogida, setFechaRecogida] = useState('');
  const [personaRecogida, setPersonaRecogida] = useState('');
  const [telefonoRecogida, setTelefonoRecogida] = useState('');
  const [productosOferta, setProductosOferta] = useState<Array<{
    id: string;
    seleccionado: boolean;
    cantidadSolicitada: number;
    cantidadMaxima: number;
    productoNombre: string;
    icono: string;
    kilos: number;
    valorUnitario: number;
  }>>([]);

  // Abrir diálogo de edición de oferta
  const handleEditarOferta = (oferta: Oferta) => {
    setOfertaSeleccionada(oferta);
    
    // Inicializar productos con cantidades disponibles
    const productosIniciales = oferta.productos.map(p => ({
      id: p.productoId,
      seleccionado: p.cantidadDisponible > 0, // Pre-seleccionar si hay disponibilidad
      cantidadSolicitada: p.cantidadDisponible, // Por defecto, toda la cantidad disponible
      cantidadMaxima: p.cantidadDisponible,
      productoNombre: p.productoNombre || 'Producto sin nombre',
      icono: p.icono || '📦',
      kilos: p.peso || 0,
      valorUnitario: p.valorUnitario || 0
    }));
    
    setProductosOferta(productosIniciales);
    setEditarOfertaOpen(true);
  };

  // Actualizar selección de producto
  const toggleProductoSeleccionado = (productoId: string) => {
    setProductosOferta(prev => prev.map(p => 
      p.id === productoId ? { ...p, seleccionado: !p.seleccionado } : p
    ));
  };

  // Actualizar cantidad solicitada
  const actualizarCantidad = (productoId: string, cantidad: number) => {
    setProductosOferta(prev => prev.map(p => 
      p.id === productoId ? { 
        ...p, 
        cantidadSolicitada: Math.max(0, Math.min(cantidad, p.cantidadMaxima)) 
      } : p
    ));
  };

  // Calcular totales de la oferta editada
  const calcularTotalesOferta = () => {
    const productosSeleccionados = productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0);
    
    const totalProductos = productosSeleccionados.length;
    const totalKilos = productosSeleccionados.reduce((sum, p) => sum + ((p.kilos || 0) * p.cantidadSolicitada), 0);
    const totalValor = productosSeleccionados.reduce((sum, p) => sum + ((p.valorUnitario || 0) * (p.kilos || 0) * p.cantidadSolicitada), 0);
    
    return { totalProductos, totalKilos, totalValor };
  };

  // Confirmar solicitud de oferta
  const handleConfirmarSolicitudOferta = () => {
    const productosSeleccionados = productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0);
    
    if (productosSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un producto', {
        description: 'Seleccione los productos que desea solicitar de esta oferta.',
        duration: 4000
      });
      return;
    }
    
    if (!fechaRecogida) {
      toast.error('Fecha de recogida obligatoria', {
        description: 'Por favor, indique la fecha en que planea recoger los productos.',
        duration: 4000
      });
      return;
    }
    
    if (!personaRecogida.trim()) {
      toast.error('Persona de recogida obligatoria', {
        description: 'Por favor, indique quién recogerá los productos.',
        duration: 4000
      });
      return;
    }
    
    // Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(fechaRecogida);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      toast.error('Fecha inválida', {
        description: 'La fecha de recogida no puede ser anterior a hoy.',
        duration: 4000
      });
      return;
    }
    
    if (!ofertaSeleccionada) return;
    
    const totales = calcularTotalesOferta();
    
    // Preparar productos aceptados para el sistema de ofertas
    const productosAceptados = productosSeleccionados.map(p => ({
      productoId: p.id,
      cantidadAceptada: p.cantidadSolicitada
    }));
    
    // Aceptar la oferta y actualizar cantidades disponibles automáticamente
    const observacionesCompletas = `Solicitud desde el portal del organismo. Total: ${totales.totalProductos} productos, ${totales.totalKilos.toFixed(1)} kg. Fecha de recogida: ${new Date(fechaRecogida).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Persona que recogerá: ${personaRecogida}${telefonoRecogida ? ` (Tel: ${telefonoRecogida})` : ''}`;
    
    const exito = aceptarOferta(
      ofertaSeleccionada.id,
      organismo.id,
      productosAceptados,
      organismo.nombre,
      observacionesCompletas
    );
    
    if (exito) {
      toast.success('Solicitud de oferta confirmada', {
        description: `${totales.totalProductos} productos • ${totales.totalKilos.toFixed(1)} kg • Valor: CAD$ ${totales.totalValor.toFixed(2)} • Fecha de recogida: ${new Date(fechaRecogida).toLocaleDateString(i18n.language)} • Recogerá: ${personaRecogida}. Las cantidades han sido reservadas. La Banque Alimentaire se pondrá en contacto con usted.`,
        duration: 6000
      });
      
      setEditarOfertaOpen(false);
      setOfertaSeleccionada(null);
      setFechaRecogida('');
      setPersonaRecogida('');
      setTelefonoRecogida('');
      
      // Actualizar la vista de ofertas sin recargar la página
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error('Error al procesar la solicitud', {
        description: 'No se pudo procesar su solicitud. Por favor, verifique las cantidades e intente nuevamente.',
        duration: 4000
      });
    }
  };

  const handleGuardarCambios = () => {
    // Aquí se enviaría la actualización al servidor
    toast.success(t('organismPortal.profileUpdated'), {
      description: t('organismPortal.profileUpdatedDescription'),
      duration: 5000
    });
    setEditarPerfilOpen(false);
    
    // Actualizar el organismo localmente (en producción esto vendría del servidor)
    Object.assign(organismo, datosEdicion);
  };

  // Funciones para gestión de comandas
  const handleAceptarComanda = (itemsAceptados: any[]) => {
    console.log('Items aceptados:', itemsAceptados);
    toast.success(t('organismPortal.orderAccepted'), {
      description: t('organismPortal.orderAcceptedDescription'),
      duration: 5000
    });
    setMostrarDetalles(false);
    setComandaSeleccionada(null);
  };

  const handleAnularComanda = () => {
    toast.success(t('organismPortal.orderCancelled'), {
      description: t('organismPortal.orderCancelledDescription'),
      duration: 4000
    });
    setMostrarDetalles(false);
    setComandaSeleccionada(null);
  };

  // Funciones para gestión de personas responsables
  const handleAbrirFormPersona = (persona?: PersonaResponsable) => {
    if (persona) {
      setPersonaEditando(persona);
      setFormPersona({
        nombreCompleto: persona.nombreCompleto,
        telefono: persona.telefono,
        email: persona.email,
        cargo: persona.cargo || '',
        notas: persona.notas || '',
        esPrincipal: persona.esPrincipal,
        joursDisponibles: persona.joursDisponibles || [],
        idiomas: persona.idiomas || []
      });
    } else {
      setPersonaEditando(null);
      setFormPersona({
        nombreCompleto: '',
        telefono: '',
        email: '',
        cargo: '',
        notas: '',
        esPrincipal: false,
        joursDisponibles: [],
        idiomas: []
      });
    }
    setDialogFormPersonaOpen(true);
  };

  const handleGuardarPersona = () => {
    // Validaciones
    if (!formPersona.nombreCompleto.trim()) {
      toast.error('Nombre requerido', { description: 'Por favor ingrese el nombre completo.' });
      return;
    }
    if (!formPersona.telefono.trim()) {
      toast.error('Teléfono requerido', { description: 'Por favor ingrese un número de teléfono.' });
      return;
    }
    if (!formPersona.email.trim()) {
      toast.error('Email requerido', { description: 'Por favor ingrese un correo electrónico.' });
      return;
    }

    if (personaEditando) {
      // Actualizar persona existente
      actualizarPersonaResponsable(personaEditando.id, formPersona);
      toast.success('Persona actualizada', {
        description: `${formPersona.nombreCompleto} ha sido actualizado correctamente.`
      });
    } else {
      // Crear nueva persona
      guardarPersonaResponsable({
        organismoId: organismo.id,
        ...formPersona,
        activo: true
      });
      toast.success('Persona agregada', {
        description: `${formPersona.nombreCompleto} ha sido agregado a su lista de contactos.`
      });
    }

    setDialogFormPersonaOpen(false);
    cargarPersonasResponsables();
  };

  const handleEliminarPersona = (persona: PersonaResponsable) => {
    if (window.confirm(`¿Está seguro de eliminar a ${persona.nombreCompleto}?`)) {
      eliminarPersonaResponsable(persona.id);
      toast.success('Persona eliminada', {
        description: `${persona.nombreCompleto} ha sido eliminado de su lista.`
      });
      cargarPersonasResponsables();
    }
  };

  const handleMarcarPrincipal = (persona: PersonaResponsable) => {
    marcarComoPrincipal(persona.id);
    toast.success('Contacto principal actualizado', {
      description: `${persona.nombreCompleto} es ahora su contacto principal.`
    });
    cargarPersonasResponsables();
  };

  // Funciones para reportes
  const handleGenerarPDF = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error(t('organismPortal.selectBothDates'), {
        description: t('organismPortal.selectBothDatesDescription'),
        duration: 4000
      });
      return;
    }

    // Filtrar comandas completadas en el rango de fechas
    const comandasFiltradas = comandasOrganismo.filter(c => {
      if (c.estado !== 'completada') return false;
      const fechaComanda = new Date(c.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaComanda >= inicio && fechaComanda <= fin;
    });

    if (comandasFiltradas.length === 0) {
      toast.warning(t('organismPortal.noDataForReport'), {
        description: t('organismPortal.noDataForReportDescription'),
        duration: 4000
      });
      return;
    }

    toast.success(t('organismPortal.pdfReportGenerated'), {
      description: t('organismPortal.donationsFound', { count: comandasFiltradas.length }),
      duration: 4000
    });
  };

  const handleGenerarExcel = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error(t('organismPortal.selectBothDates'), {
        description: t('organismPortal.selectBothDatesDescription'),
        duration: 4000
      });
      return;
    }

    // Filtrar comandas completadas en el rango de fechas
    const comandasFiltradas = comandasOrganismo.filter(c => {
      if (c.estado !== 'completada') return false;
      const fechaComanda = new Date(c.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaComanda >= inicio && fechaComanda <= fin;
    });

    if (comandasFiltradas.length === 0) {
      toast.warning(t('organismPortal.noDataForReport'), {
        description: t('organismPortal.noDataForReportDescription'),
        duration: 4000
      });
      return;
    }

    toast.success(t('organismPortal.excelReportGenerated'), {
      description: t('organismPortal.donationsFound', { count: comandasFiltradas.length }),
      duration: 4000
    });
  };

  return (
    <>
      {mostrarDemandes ? (
        <MesDemandes
          organismeId={organismo.id}
          organismeNom={organismo.nombre}
          onRetour={() => setMostrarDemandes(false)}
        />
      ) : (
        <div 
          className="min-h-screen relative overflow-hidden"
          style={{ 
            fontFamily: 'Roboto, sans-serif',
            background: 'linear-gradient(135deg, #1a4d7a08 0%, #2d956108 100%)',
          }}
        >
          {/* Formas decorativas de fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
              style={{ backgroundColor: branding.primaryColor }}
            />
            <div 
              className="absolute bottom-0 -left-24 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
              style={{ backgroundColor: branding.secondaryColor }}
            />
          </div>

      {/* Header with glassmorphism */}
      <header 
        className="relative backdrop-blur-lg text-white shadow-xl border-b border-white/20"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
          boxShadow: `0 8px 32px 0 ${branding.primaryColor}40`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Glow effect detrás del icono */}
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-50"
                  style={{ backgroundColor: 'white' }}
                />
                <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg border-2 border-white/50">
                  {/* Icono del tipo de organismo */}
                  {organismo.tipo === 'Comedor' ? '🍽️' :
                   organismo.tipo === 'Fundación' ? '🏛️' :
                   organismo.tipo === 'Hogar' ? '🏠' : '🏘️'}
                </div>
              </div>
              <div>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.75rem' }}>
                  {organismo.nombre}
                </h1>
                <p className="text-white/90" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {organismo.tipo} • {t('organismPortal.registeredSince')} {new Date(organismo.fechaRegistro).toLocaleDateString(i18n.language, { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Button
                onClick={() => setMostrarDemandes(true)}
                variant="outline"
                className="bg-white/95 hover:bg-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  color: branding.primaryColor,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Mes Demandes
              </Button>
              <Button
                onClick={onCerrarSesion}
                variant="outline"
                className="bg-white/95 hover:bg-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  color: branding.primaryColor,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('organismPortal.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Comandas Pendientes de Confirmación */}
        <ConfirmacionComanda organismoId={organismo.id} organismo={organismo} />

        {/* Estado del Organismo */}
        {!organismo.activo && (
          <div 
            className="mb-6 p-4 rounded-lg border-l-4 backdrop-blur-sm"
            style={{
              backgroundColor: '#c2393410',
              borderColor: '#c23934',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#c23934' }}
              >
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#c23934' }}>{t('organisms.profileDialog.inactiveAlert.message')}</p>
                <p className="text-sm text-[#666666]">
                  {organismo.fechaInicioInactividad && `${t('organisms.profileDialog.inactiveAlert.from')}: ${new Date(organismo.fechaInicioInactividad).toLocaleDateString(i18n.language)}`}
                  {organismo.fechaFinInactividad && ` • ${t('organisms.profileDialog.inactiveAlert.until')}: ${new Date(organismo.fechaFinInactividad).toLocaleDateString(i18n.language)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de Estadísticas con nuevo estilo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="border-l-4 backdrop-blur-sm bg-white/90 hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ borderColor: branding.primaryColor }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.beneficiaries')}</p>
                  <p 
                    className="font-bold" 
                    style={{ fontSize: '2rem', color: branding.primaryColor }}
                  >
                    {organismo.beneficiarios}
                  </p>
                </div>
                <Users 
                  className="w-10 h-10 opacity-20" 
                  style={{ color: branding.primaryColor }}
                />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 backdrop-blur-sm bg-white/90 hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ borderColor: branding.secondaryColor }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.orders')}</p>
                  <p 
                    className="font-bold" 
                    style={{ fontSize: '2rem', color: branding.secondaryColor }}
                  >
                    {totalComandas}
                  </p>
                </div>
                <Package 
                  className="w-10 h-10 opacity-20" 
                  style={{ color: branding.secondaryColor }}
                />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 backdrop-blur-sm bg-white/90 hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ borderColor: '#e8a419' }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.completed')}</p>
                  <p 
                    className="font-bold text-[#e8a419]" 
                    style={{ fontSize: '2rem' }}
                  >
                    {comandasCompletadas}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-[#e8a419] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Personas Responsables */}
        <Card 
          className="mb-6 border-l-4 backdrop-blur-sm bg-white/90 shadow-lg hover:shadow-xl transition-shadow duration-300"
          style={{ borderColor: branding.secondaryColor }}
        >
          <CardHeader 
            className="rounded-t-lg"
            style={{ 
              background: `linear-gradient(135deg, ${branding.secondaryColor}15 0%, ${branding.secondaryColor}08 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <UserPlus 
                    className="w-6 h-6" 
                    style={{ color: branding.secondaryColor }}
                  />
                  {t('organisms.profileDialog.authorizedPersons.listTitle')}
                </CardTitle>
                <p className="text-sm text-[#666666] mt-2">
                  {t('organisms.profileDialog.authorizedPersons.listDescription')}
                </p>
              </div>
              <Button 
                onClick={() => handleAbrirFormPersona()}
                className="text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 500 
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('organisms.profileDialog.authorizedPersons.addPersonShort')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {personasResponsables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personasResponsables.map(persona => (
                  <Card 
                    key={persona.id} 
                    className={`border-2 transition-all duration-300 hover:shadow-lg ${persona.esPrincipal ? 'bg-green-50/50' : ''}`}
                    style={{ 
                      borderColor: persona.esPrincipal ? branding.secondaryColor : '#e0e0e0' 
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {persona.nombreCompleto}
                            </h4>
                            {persona.esPrincipal && (
                              <Badge 
                                className="text-white flex items-center gap-1"
                                style={{ backgroundColor: branding.secondaryColor }}
                              >
                                <Star className="w-3 h-3 fill-white" />
                                {t('organisms.profileDialog.authorizedPersons.principal')}
                              </Badge>
                            )}
                          </div>
                          {persona.cargo && (
                            <p className="text-sm text-[#666666] mb-2">{persona.cargo}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone 
                            className="w-4 h-4" 
                            style={{ color: branding.primaryColor }}
                          />
                          <span className="text-[#333333]">{persona.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail 
                            className="w-4 h-4" 
                            style={{ color: branding.primaryColor }}
                          />
                          <span className="text-[#333333]">{persona.email}</span>
                        </div>
                        {persona.notas && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-[#666666]">
                            {persona.notas}
                          </div>
                        )}
                        {persona.idiomas && persona.idiomas.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Languages className="w-3 h-3 text-[#666666]" />
                              <span className="text-xs text-[#666666]">Langues:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {persona.idiomas.map((code) => {
                                const idiomaInfo = [
                                  { code: 'fr', label: '🇫🇷 FR', color: '#1a4d7a' },
                                  { code: 'en', label: '🇬🇧 EN', color: '#2d9561' },
                                  { code: 'es', label: '🇪🇸 ES', color: '#8B5CF6' },
                                  { code: 'ar', label: '🇸🇦 AR', color: '#F59E0B' }
                                ].find(i => i.code === code);
                                return idiomaInfo ? (
                                  <Badge
                                    key={code}
                                    className="text-white text-xs"
                                    style={{ backgroundColor: idiomaInfo.color }}
                                  >
                                    {idiomaInfo.label}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        {!persona.esPrincipal && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarPrincipal(persona)}
                            className="flex-1 hover:shadow-md transition-all duration-200"
                            style={{ 
                              color: branding.secondaryColor,
                              borderColor: `${branding.secondaryColor}40`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${branding.secondaryColor}10`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {t('organisms.profileDialog.authorizedPersons.markAsPrincipalShort')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAbrirFormPersona(persona)}
                          className="flex-1"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          {t('organisms.profileDialog.authorizedPersons.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEliminarPersona(persona)}
                          className="hover:shadow-md transition-all duration-200"
                          style={{ 
                            color: '#c23934',
                            borderColor: '#c2393440'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#c2393410';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-[#666666] mb-4">{t('organisms.profileDialog.authorizedPersons.noPersonsRegistered')}</p>
                <Button 
                  onClick={() => handleAbrirFormPersona()}
                  className="text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('organisms.profileDialog.authorizedPersons.addFirstPerson')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de Reportes de Donaciones */}
        <Card 
          className="mb-6 border-l-4 backdrop-blur-sm bg-white/90 shadow-lg hover:shadow-xl transition-shadow duration-300"
          style={{ borderColor: '#e8a419' }}
        >
          <CardHeader 
            className="rounded-t-lg"
            style={{ background: 'linear-gradient(135deg, #e8a41915 0%, #e8a41908 100%)' }}
          >
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <FileText className="w-6 h-6 text-[#e8a419]" />
              {t('organismPortal.donationReports')}
            </CardTitle>
            <p className="text-sm text-[#666666] mt-2">
              {t('organismPortal.donationReportsDescription')}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar 
                    className="w-4 h-4" 
                    style={{ color: branding.primaryColor }}
                  />
                  {t('organismPortal.startDate')} *
                </Label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar 
                    className="w-4 h-4" 
                    style={{ color: branding.primaryColor }}
                  />
                  {t('organismPortal.endDate')} *
                </Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-transparent select-none">Formato</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerarPDF}
                    className="flex-1 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: '#c23934',
                      opacity: (!fechaInicio || !fechaFin) ? 0.5 : 1
                    }}
                    disabled={!fechaInicio || !fechaFin}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={handleGenerarExcel}
                    className="flex-1 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: branding.secondaryColor,
                      opacity: (!fechaInicio || !fechaFin) ? 0.5 : 1
                    }}
                    disabled={!fechaInicio || !fechaFin}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>

            <div 
              className="rounded-lg p-4 border-2"
              style={{
                backgroundColor: `${branding.primaryColor}08`,
                borderColor: `${branding.primaryColor}30`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[#333333] mb-1">{t('organismPortal.reportInfo')}</p>
                  <p className="text-sm text-[#666666]">
                    {t('organismPortal.reportDescription')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Organismo */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between rounded-t-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}08 0%, ${branding.secondaryColor}08 100%)` }}>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('organismPortal.organisInfo')}
              </CardTitle>
              <Button
                onClick={() => {
                  setDatosEdicion({
                    responsable: organismo.responsable,
                    telefono: organismo.telefono,
                    email: organismo.email,
                    beneficiarios: organismo.beneficiarios,
                    direccion: organismo.direccion,
                    codigoPostal: organismo.codigoPostal || ''
                  });
                  setEditarPerfilOpen(true);
                }}
                className="text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
                size="sm"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t('organismPortal.editProfile')}
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.address')}</p>
                  <p className="font-medium text-[#333333]">{organismo.direccion}</p>
                  {organismo.codigoPostal && (
                    <p className="text-sm text-[#666666]">{t('organismPortal.postalCode')}: {organismo.codigoPostal}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.responsible')}</p>
                  <p className="font-medium text-[#333333]">{organismo.responsable}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.phone')}</p>
                  <p className="font-medium text-[#333333]">{organismo.telefono}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.email')}</p>
                  <p className="font-medium text-[#333333]">{organismo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.registrationDate')}</p>
                  <p className="font-medium text-[#333333]">
                    {new Date(organismo.fechaRegistro).toLocaleDateString(i18n.language, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Badge 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '0.5rem 1rem',
                    backgroundColor: organismo.activo ? branding.secondaryColor : '#c23934'
                  }}
                >
                  {organismo.activo ? t('organismPortal.activeOrganism') : t('organismPortal.inactiveOrganism')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Comandas */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="rounded-t-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}08 0%, ${branding.secondaryColor}08 100%)` }}>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <History className="w-5 h-5" />
                {t('organismPortal.ordersHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {comandasOrganismo.length > 0 ? (
                <div className="space-y-3">
                  {comandasOrganismo.map(comanda => {
                    // Calcular totales de la comanda
                    const pesoTotal = comanda.items.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0);
                    const valorTotal = comanda.valorTotal || comanda.items.reduce((sum: number, item: any) => {
                      const producto = mockProductos.find(p => p.id === item.productoId);
                      return sum + ((item.cantidad || 0) * (producto?.valorMonetario || 0));
                    }, 0);
                    
                    return (
                    <div key={comanda.id} className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-[#333333]">{comanda.numero}</p>
                        <Badge 
                          style={{
                            backgroundColor: 
                              comanda.estado === 'completada' ? branding.secondaryColor :
                              comanda.estado === 'en_preparacion' ? '#e8a419' :
                              comanda.estado === 'pendiente' ? branding.primaryColor :
                              '#c23934'
                          }}
                        >
                          {comanda.estado === 'completada' ? t('orders.completed') :
                           comanda.estado === 'en_preparacion' ? t('orders.inPreparation') :
                           comanda.estado === 'pendiente' ? t('orders.pending') : t('orders.cancelled')}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#666666] space-y-1">
                        <p>{t('organismPortal.date')}: {new Date(comanda.fecha).toLocaleDateString(i18n.language)}</p>
                        <p>{t('organismPortal.products')}: {comanda.items.length}</p>
                        <div className="flex items-center gap-3 pt-1">
                          <p 
                            className="font-semibold"
                            style={{ color: branding.primaryColor }}
                          >
                            📦 {pesoTotal.toFixed(2)} kg
                          </p>
                          <p 
                            className="font-semibold"
                            style={{ color: branding.secondaryColor }}
                          >
                            💰 CAD$ {valorTotal.toFixed(2)}
                          </p>
                        </div>
                        {comanda.fechaEntrega && (
                          <p>{t('organismPortal.delivery')}: {new Date(comanda.fechaEntrega).toLocaleDateString(i18n.language)}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setComandaSeleccionada(comanda);
                          setMostrarDetalles(true);
                        }}
                        variant="outline"
                        className="mt-2 w-full hover:shadow-md transition-all duration-200"
                        style={{ 
                          color: branding.primaryColor,
                          borderColor: `${branding.primaryColor}40`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${branding.primaryColor}10`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('organismPortal.viewDetails')}
                      </Button>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[#666666]">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>{t('organismPortal.noOrders')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nueva Sección: Ofertas Disponibles */}
        {ofertasDelOrganismo.length > 0 && (
          <Card className="mt-6 border-l-4" style={{ borderLeftColor: branding.secondaryColor }}>
            <CardHeader 
              className="bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${branding.secondaryColor}10, ${branding.primaryColor}05)`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Tag className="w-6 h-6" style={{ color: branding.secondaryColor }} />
                    {t('organismPortal.specialOffersAvailable')}
                  </CardTitle>
                  <p className="text-sm text-[#666666] mt-2">
                    {t('organismPortal.specialOffersAvailableDesc')}
                  </p>
                </div>
                <Badge 
                  className="text-gray-900 hover:bg-opacity-90" 
                  style={{ 
                    backgroundColor: branding.secondaryColor, 
                    fontSize: '1rem', 
                    padding: '0.5rem 1rem' 
                  }}
                >
                  {ofertasDelOrganismo.filter(o => calcularEstadoOferta(o).estado === 'activa').length} {t('organismPortal.active')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ofertasDelOrganismo.map(oferta => {
                  const estadoOferta = calcularEstadoOferta(oferta);
                  const totalDisponible = oferta.productos.reduce((sum, p) => sum + (p.cantidadDisponible || 0), 0);
                  const totalOfrecido = oferta.productos.reduce((sum, p) => sum + (p.cantidadOfrecida || 0), 0);
                  const porcentajeDisponible = totalOfrecido > 0 ? (totalDisponible / totalOfrecido) * 100 : 0;
                  
                  // Verificar si el organismo ya ha solicitado esta oferta
                  const aceptacionOrganismo = oferta.aceptaciones.find(a => a.organismoId === organismo.id);
                  const yaSolicitada = !!aceptacionOrganismo;
                  const cantidadReservada = aceptacionOrganismo 
                    ? aceptacionOrganismo.productos.reduce((sum, p) => sum + p.cantidadAceptada, 0)
                    : 0;

                  return (
                    <div 
                      key={oferta.id} 
                      className={`border-2 rounded-lg p-4 transition-all ${
                        estadoOferta.estado === 'activa' 
                          ? 'hover:shadow-lg' 
                          : 'bg-gray-50'
                      }`}
                      style={{
                        borderColor: estadoOferta.estado === 'activa' ? branding.secondaryColor : '#d1d5db',
                        backgroundColor: estadoOferta.estado === 'activa' ? `${branding.secondaryColor}08` : undefined
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              style={{ backgroundColor: estadoOferta.color }}
                              className="text-white"
                            >
                              {estadoOferta.label}
                            </Badge>
                            {estadoOferta.diasRestantes <= 3 && estadoOferta.estado === 'activa' && (
                              <Badge style={{ backgroundColor: branding.secondaryColor }} className="text-gray-900">
                                <Clock className="w-3 h-3 mr-1" />
                                {t('organismPortal.expiresSoon')}
                              </Badge>
                            )}
                            {yaSolicitada && (
                              <Badge style={{ backgroundColor: branding.primaryColor }} className="text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t('organismPortal.alreadyRequested')}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-bold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {oferta.titulo}
                          </h4>
                          <p className="text-xs text-[#666666] mb-2">{oferta.numeroOferta}</p>
                        </div>
                        <div className="text-3xl">🏷️</div>
                      </div>

                      {oferta.descripcion && (
                        <p className="text-sm text-[#666666] mb-3 line-clamp-2">{oferta.descripcion}</p>
                      )}

                      {/* Información de la oferta */}
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" style={{ color: branding.primaryColor }} />
                          <span className="text-[#666666]">{t('organismPortal.products')}</span>
                          <span className="font-semibold">{oferta.totalProductos}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#666666]">{t('organismPortal.weight')}</span>
                          <span className="font-semibold">{(oferta.totalKilos || 0).toFixed(1)} kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#666666]">{t('organismPortal.expires')}</span>
                          <span className="font-semibold text-sm">
                            {new Date(oferta.fechaExpiracion).toLocaleDateString(i18n.language)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#666666]">{t('organismPortal.value')}</span>
                          <span className="font-semibold" style={{ color: branding.secondaryColor }}>CAD$ {(oferta.valorMonetarioTotal || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Barra de disponibilidad */}
                      {estadoOferta.estado === 'activa' && (
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-xs text-[#666666]">
                            <span>{t('organismPortal.availability')}</span>
                            <span className="font-semibold">{porcentajeDisponible.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${porcentajeDisponible}%`,
                                backgroundColor: porcentajeDisponible > 50 ? branding.secondaryColor : 
                                                 porcentajeDisponible > 20 ? '#FFC107' : 
                                                 '#DC3545'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Información de reserva si ya fue solicitada */}
                      {yaSolicitada && aceptacionOrganismo && (
                        <div className={`border rounded-lg p-3 mb-3 ${
                          aceptacionOrganismo.estado === 'aceptada' ? 'bg-green-50 border-green-200' :
                          aceptacionOrganismo.estado === 'rechazada' ? 'bg-red-50 border-red-200' :
                          aceptacionOrganismo.estado === 'anulada' ? 'bg-gray-50 border-gray-300' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start gap-2 mb-3">
                            <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                              aceptacionOrganismo.estado === 'aceptada' ? 'text-[#4CAF50]' :
                              aceptacionOrganismo.estado === 'rechazada' ? 'text-[#DC3545]' :
                              aceptacionOrganismo.estado === 'anulada' ? 'text-gray-500' :
                              'text-[#1E73BE]'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-[#333333]">{t('organismPortal.yourRequest')}</p>
                                <Badge className={
                                  aceptacionOrganismo.estado === 'aceptada' ? 'bg-[#4CAF50]' :
                                  aceptacionOrganismo.estado === 'rechazada' ? 'bg-[#DC3545]' :
                                  aceptacionOrganismo.estado === 'anulada' ? 'bg-gray-500' :
                                  'bg-[#FFC107] text-gray-900'
                                }>
                                  {aceptacionOrganismo.estado === 'aceptada' ? t('organismPortal.accepted') :
                                   aceptacionOrganismo.estado === 'rechazada' ? t('organismPortal.rejected') :
                                   aceptacionOrganismo.estado === 'anulada' ? t('organismPortal.cancelled') :
                                   t('organismPortal.pending')}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {aceptacionOrganismo.productos.map((prod, idx) => {
                                  const prodInfo = oferta.productos.find(p => p.productoId === prod.productoId);
                                  return (
                                    <p key={`reserva-${oferta.id}-${prod.productoId}-${idx}`} className="text-xs text-[#666666]">
                                      • {prodInfo?.productoNombre || t('organismPortal.product')}: {prod.cantidadAceptada} {t('organismPortal.unitsLower')}
                                    </p>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-[#666666] mt-2">
                                {t('organismPortal.requestedOn')} {new Date(aceptacionOrganismo.fechaSolicitud).toLocaleDateString(i18n.language)}
                              </p>
                              {aceptacionOrganismo.observaciones && (
                                <p className="text-xs text-[#666666] mt-1 italic">
                                  {aceptacionOrganismo.observaciones}
                                </p>
                              )}
                              {aceptacionOrganismo.motivoRechazo && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                                  <p className="text-xs font-semibold text-[#DC3545]">{t('organismPortal.rejectionReason')}</p>
                                  <p className="text-xs text-[#666666]">{aceptacionOrganismo.motivoRechazo}</p>
                                </div>
                              )}
                              
                              {/* Botón para anular solicitud si está pendiente o aceptada */}
                              {(aceptacionOrganismo.estado === 'pendiente' || aceptacionOrganismo.estado === 'aceptada') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 w-full border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                                  onClick={() => {
                                    if (confirm(t('organismPortal.confirmCancelRequest'))) {
                                      const exito = anularSolicitud(oferta.id, aceptacionOrganismo.id);
                                      if (exito) {
                                        toast.success(t('organismPortal.requestCancelled'));
                                        setRefreshOfertas(prev => prev + 1);
                                      } else {
                                        toast.error(t('organismPortal.errorCancellingRequest'));
                                      }
                                    }
                                  }}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  {t('organismPortal.cancelMyRequest')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Productos incluidos */}
                      <div className="border-t pt-3 mb-3">
                        <p className="text-xs text-[#666666] mb-2">{t('organismPortal.productsIncluded')}</p>
                        <div className="flex flex-wrap gap-1">
                          {oferta.productos.slice(0, 3).map((prod, idx) => (
                            <Badge key={`${oferta.id}-prod-${idx}`} variant="outline" className="text-xs">
                              {prod.icono} {prod.productoNombre}
                            </Badge>
                          ))}
                          {oferta.productos.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{oferta.productos.length - 3} {t('organismPortal.more')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Botón de acción */}
                      {estadoOferta.estado === 'activa' ? (
                        <Button
                          className="w-full text-white hover:opacity-90"
                          style={{ backgroundColor: branding.secondaryColor }}
                          onClick={() => handleEditarOferta(oferta)}
                          disabled={yaSolicitada}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {yaSolicitada ? t('organismPortal.alreadyRequestedBtn') : t('organismPortal.requestOffer')}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {estadoOferta.label}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div 
                className="mt-6 rounded-lg p-4 border-2"
                style={{
                  backgroundColor: `${branding.primaryColor}08`,
                  borderColor: `${branding.primaryColor}30`
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-white text-lg">ℹ️</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#333333] mb-1">{t('organismPortal.specialOffersTitle')}</p>
                    <p className="text-sm text-[#666666]">
                      {t('organismPortal.specialOffersDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de Ofertas Solicitadas */}
        {ofertasDelOrganismo.filter(o => o.aceptaciones.some(a => a.organismoId === organismo.id)).length > 0 && (
          <Card className="mt-6 border-l-4 border-l-[#1E73BE]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <History className="w-6 h-6 text-[#1E73BE]" />
                📋 Historial de Ofertas Solicitadas
              </CardTitle>
              <p className="text-sm text-[#666666] mt-2">
                Resumen de todas las ofertas especiales que ha solicitado y sus cantidades reservadas
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ofertasDelOrganismo
                  .filter(o => o.aceptaciones.some(a => a.organismoId === organismo.id))
                  .map(oferta => {
                    const aceptacion = oferta.aceptaciones.find(a => a.organismoId === organismo.id);
                    if (!aceptacion) return null;

                    const totalReservado = aceptacion.productos.reduce((sum, p) => sum + p.cantidadAceptada, 0);
                    const totalKilosReservados = aceptacion.productos.reduce((sum, p) => {
                      const prod = oferta.productos.find(op => op.productoId === p.productoId);
                      return sum + ((prod?.peso || 0) * p.cantidadAceptada);
                    }, 0);
                    const valorTotalReservado = aceptacion.productos.reduce((sum, p) => {
                      const prod = oferta.productos.find(op => op.productoId === p.productoId);
                      return sum + ((prod?.valorUnitario || 0) * (prod?.peso || 0) * p.cantidadAceptada);
                    }, 0);

                    return (
                      <div key={oferta.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#1E73BE] text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmada
                              </Badge>
                              <Badge variant="outline" className="bg-white">
                                {oferta.numeroOferta}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {oferta.titulo}
                            </h4>
                            <p className="text-xs text-[#666666]">
                              {t('organismPortal.requestedOnWithDate')} {new Date(aceptacion.fecha).toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-3xl">✅</div>
                        </div>

                        {/* Resumen de cantidades */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-white rounded-lg p-3 text-center border">
                            <p className="text-xs text-[#666666] mb-1">Productos</p>
                            <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.25rem' }}>
                              {totalReservado}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border">
                            <p className="text-xs text-[#666666] mb-1">Peso Total</p>
                            <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.25rem' }}>
                              {totalKilosReservados.toFixed(1)} kg
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border">
                            <p className="text-xs text-[#666666] mb-1">Valor Total</p>
                            <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.25rem' }}>
                              CAD$ {valorTotalReservado.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Lista de productos reservados */}
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-xs text-[#666666] mb-2 font-semibold">Productos Reservados:</p>
                          <div className="space-y-1">
                            {aceptacion.productos.map((prod, idx) => {
                              const prodInfo = oferta.productos.find(p => p.productoId === prod.productoId);
                              return (
                                <div key={`aceptacion-${aceptacion.organismoId}-${prod.productoId}-${idx}`} className="flex items-center justify-between text-sm">
                                  <span className="text-[#333333]">
                                    {prodInfo?.icono} {prodInfo?.productoNombre || 'Producto'}
                                  </span>
                                  <span className="font-semibold text-[#1E73BE]">
                                    {prod.cantidadAceptada} und.
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {aceptacion.observaciones && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-[#DC3545]">
                                <strong>Observaciones:</strong> {aceptacion.observaciones}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Donaciones por Categoría */}
        {datosCategorias.length > 0 && (
          <Card className="mt-6 border-l-4 border-l-[#1E73BE]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <TrendingUp className="w-6 h-6 text-[#1E73BE]" />
                Donaciones Recibidas por Categoría
              </CardTitle>
              <p className="text-sm text-[#666666] mt-2">
                Visualización de productos recibidos agrupados por categoría (solo comandas completadas)
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={datosCategorias}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis 
                      dataKey="categoria" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fill: '#333333', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#333333', fontSize: 12 }}
                      label={{ value: 'Cantidad (kg/litros)', angle: -90, position: 'insideLeft', style: { fill: '#666666' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #1E73BE',
                        borderRadius: '8px',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                      formatter={(value: any, name: string, props: any) => {
                        const icono = props.payload.icono;
                        return [`${icono} ${value} unidades`, 'Cantidad Recibida'];
                      }}
                      labelFormatter={(label: string) => `Categoría: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={() => 'Cantidad Recibida'}
                    />
                    <Bar 
                      dataKey="cantidad" 
                      radius={[8, 8, 0, 0]}
                      label={{ 
                        position: 'top', 
                        fill: '#333333',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    >
                      {datosCategorias.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={coloresGrafico[index % coloresGrafico.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {datosCategorias.slice(0, 4).map((cat, index) => (
                  <div 
                    key={cat.categoria}
                    className="bg-gray-50 rounded-lg p-3 border-l-4"
                    style={{ borderLeftColor: coloresGrafico[index % coloresGrafico.length] }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{cat.icono}</span>
                      <p className="text-xs text-[#666666] truncate">{cat.categoria}</p>
                    </div>
                    <p className="font-bold text-[#333333]" style={{ fontSize: '1.25rem' }}>
                      {cat.cantidad.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#666666]">{t('organismPortal.units')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje de Ayuda */}
        <Card className="mt-6 border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <p className="font-medium text-[#333333] mb-2">{t('organismPortal.needAssistance')}</p>
                <p className="text-sm text-[#666666] mb-3">
                  {t('organismPortal.assistanceDescription')}
                </p>
                <div className="flex gap-4 text-sm">
                  <p className="text-[#1E73BE]">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t('organismPortal.phone')}: (514) 555-0100
                  </p>
                  <p className="text-[#1E73BE]">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email: info@bancoalimentos.org
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-[#666666]">
          <p>{t('organismPortal.copyright')}</p>
          <p className="mt-1">{t('organismPortal.thankYou')}</p>
        </div>
      </footer>

      {/* Dialog para detalles de la comanda */}
      {comandaSeleccionada && (
        <ModeloComanda
          comanda={comandaSeleccionada}
          organismo={organismo}
          mostrar={mostrarDetalles}
          onCerrar={() => {
            setMostrarDetalles(false);
            setComandaSeleccionada(null);
          }}
          onAceptarComanda={handleAceptarComanda}
          onAnularComanda={handleAnularComanda}
          modoOrganismo={true}
        />
      )}

      {/* Dialog para edición de perfil */}
      <Dialog open={editarPerfilOpen} onOpenChange={setEditarPerfilOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Editar Perfil del Organismo
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666666] mt-2">
              Actualice la información de contacto de su organismo. Los cambios serán revisados por el administrador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-[#1E73BE]">
                <strong>📌 Nota:</strong> Solo puede editar información de contacto. Para cambios en el tipo de organismo o estado, 
                contacte al administrador.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E73BE]" />
                Responsable *
              </Label>
              <Input
                value={datosEdicion.responsable}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, responsable: e.target.value })}
                placeholder="Nombre del responsable"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1E73BE]" />
                Teléfono *
              </Label>
              <Input
                value={datosEdicion.telefono}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, telefono: e.target.value })}
                placeholder="(514) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1E73BE]" />
                Email *
              </Label>
              <Input
                type="email"
                value={datosEdicion.email}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, email: e.target.value })}
                placeholder="contacto@organismo.org"
              />
            </div>

            <div className="space-y-2">
              <AddressAutocomplete
                onAddressSelect={(address) => {
                  setDatosEdicion({ 
                    ...datosEdicion, 
                    direccion: address.street,
                    codigoPostal: address.postalCode 
                  });
                }}
                disabled={false}
                initialValue={datosEdicion.direccion}
                label="Dirección *"
                placeholder="Ex: 123 Boulevard Saint-Martin Est"
                required={true}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E73BE]" />
                Número de Beneficiarios *
              </Label>
              <Input
                type="number"
                value={datosEdicion.beneficiarios}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, beneficiarios: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-[#666666]">
                Cantidad aproximada de personas que atiende su organismo
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => setEditarPerfilOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarCambios}
                className="bg-[#4CAF50] hover:bg-[#45a049]"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para edición de ofertas */}
      <Dialog open={editarOfertaOpen} onOpenChange={setEditarOfertaOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-[#FFC107]" />
                Solicitar Oferta Especial
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666666] mt-2">
              Seleccione los productos que desea solicitar y ajuste las cantidades según sus necesidades.
            </DialogDescription>
          </DialogHeader>
          
          {ofertaSeleccionada && (
            <div className="space-y-4 py-4">
              {/* Información de la oferta */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-[#FFC107] rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                      {ofertaSeleccionada.titulo}
                    </h3>
                    <p className="text-xs text-[#666666] mb-2">{ofertaSeleccionada.numeroOferta}</p>
                    {ofertaSeleccionada.descripcion && (
                      <p className="text-sm text-[#666666]">{ofertaSeleccionada.descripcion}</p>
                    )}
                  </div>
                  <Badge className="bg-[#4CAF50] text-white">
                    {t('organismPortal.expiresOn')} {new Date(ofertaSeleccionada.fechaExpiracion).toLocaleDateString(i18n.language)}
                  </Badge>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Productos Disponibles ({productosOferta.length})
                  </Label>
                  <p className="text-xs text-[#666666]">
                    Seleccionados: {productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0).length}
                  </p>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={productosOferta.every(p => p.seleccionado)}
                            onCheckedChange={(checked) => {
                              setProductosOferta(prev => prev.map(p => ({
                                ...p,
                                seleccionado: checked as boolean
                              })));
                            }}
                          />
                        </TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Disponible</TableHead>
                        <TableHead className="text-right">Kilos/Und</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center w-[200px]">Cantidad Solicitada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosOferta.map((producto) => (
                        <TableRow key={producto.id} className={producto.seleccionado ? 'bg-green-50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={producto.seleccionado}
                              onCheckedChange={() => toggleProductoSeleccionado(producto.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{producto.icono}</span>
                              <span className="font-medium text-[#333333]">{producto.productoNombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-white">
                              {producto.cantidadMaxima}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-[#666666]">
                            {(producto.kilos || 0).toFixed(1)} kg
                          </TableCell>
                          <TableCell className="text-right text-[#4CAF50] font-semibold">
                            CAD$ {(producto.valorUnitario || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarCantidad(producto.id, producto.cantidadSolicitada - 1)}
                                disabled={!producto.seleccionado || producto.cantidadSolicitada <= 0}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                value={producto.cantidadSolicitada}
                                onChange={(e) => actualizarCantidad(producto.id, parseFloat(e.target.value) || 0)}
                                disabled={!producto.seleccionado}
                                className="w-20 text-center h-8"
                                min="0"
                                max={producto.cantidadMaxima}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarCantidad(producto.id, producto.cantidadSolicitada + 1)}
                                disabled={!producto.seleccionado || producto.cantidadSolicitada >= producto.cantidadMaxima}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Resumen de totales */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Resumen de la Solicitud
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-[#666666] mb-1">Productos</p>
                    <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.5rem' }}>
                      {calcularTotalesOferta().totalProductos}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-[#666666] mb-1">Peso Total</p>
                    <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.5rem' }}>
                      {calcularTotalesOferta().totalKilos.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-[#666666] mb-1">Valor Total</p>
                    <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.5rem' }}>
                      CAD$ {calcularTotalesOferta().totalValor.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de Fecha de Recogida */}
              <div className="bg-white border-2 border-[#1E73BE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-bold text-[#333333] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Fecha de Recogida <span className="text-[#DC3545]">*</span>
                    </Label>
                    <p className="text-sm text-[#666666] mb-3">
                      Indique la fecha en que planea recoger los productos. Esta información es obligatoria para procesar su solicitud.
                    </p>
                    <Input
                      type="date"
                      value={fechaRecogida}
                      onChange={(e) => setFechaRecogida(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="max-w-xs border-[#1E73BE]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Campo de Persona que Recogerá */}
              <div className="bg-white border-2 border-[#1E73BE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-bold text-[#333333] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Persona que Recogerá <span className="text-[#DC3545]">*</span>
                    </Label>
                    <p className="text-sm text-[#666666] mb-3">
                      Seleccione la persona autorizada que recogerá los productos en la fecha indicada.
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Select 
                          value={personaRecogida} 
                          onValueChange={(value) => {
                            setPersonaRecogida(value);
                            // Buscar la persona seleccionada y autocompletar el teléfono si existe
                            const personaSeleccionada = personasResponsables.find(p => p.nombreCompleto === value);
                            if (personaSeleccionada && personaSeleccionada.telefono) {
                              setTelefonoRecogida(personaSeleccionada.telefono);
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1 border-[#1E73BE]">
                            <SelectValue placeholder="Seleccione una persona autorizada" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {personasResponsables.length > 0 ? (
                              personasResponsables.map((persona) => (
                                <SelectItem key={persona.id} value={persona.nombreCompleto}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{persona.nombreCompleto}</span>
                                    {persona.cargo && (
                                      <span className="text-xs text-[#666666]">({persona.cargo})</span>
                                    )}
                                    {persona.esPrincipal && (
                                      <span className="text-xs">⭐</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-personas" disabled>
                                No hay personas autorizadas registradas
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogPersonasOpen(true)}
                          className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white whitespace-nowrap"
                          title="Gestionar personas autorizadas"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-sm text-[#666666] mb-1 block">
                          Teléfono de Contacto (Opcional)
                        </Label>
                        <Input
                          type="tel"
                          value={telefonoRecogida}
                          onChange={(e) => setTelefonoRecogida(e.target.value)}
                          placeholder="Ej: 555-1234"
                          className="max-w-xs border-[#1E73BE]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-yellow-50 border border-[#FFC107] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#333333] mb-1">Importante</p>
                    <p className="text-sm text-[#666666]">
                      <strong>La fecha de recogida indicada es una propuesta del organismo, pero la Banque Alimentaire 
                      se reserva el derecho de modificarla</strong> según disponibilidad y logística. Las cantidades 
                      solicitadas están sujetas a disponibilidad final.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setEditarOfertaOpen(false);
                    setOfertaSeleccionada(null);
                    setFechaRecogida('');
                    setPersonaRecogida('');
                    setTelefonoRecogida('');
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarSolicitudOferta}
                  className="bg-[#4CAF50] hover:bg-[#45a049]"
                  disabled={productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0).length === 0 || !fechaRecogida || !personaRecogida.trim()}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Confirmar Solicitud
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Formulario de Persona Responsable */}
      <Dialog open={dialogFormPersonaOpen} onOpenChange={setDialogFormPersonaOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-[#4CAF50]" />
                {personaEditando ? t('organisms.profileDialog.authorizedPersons.editPerson') : t('organisms.profileDialog.authorizedPersons.addPerson')}
              </div>
            </DialogTitle>
            <DialogDescription>
              {personaEditando 
                ? t('organisms.profileDialog.authorizedPersons.updatePersonDescription')
                : t('organisms.profileDialog.authorizedPersons.addPersonDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Completo */}
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Users className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.fullNameRequired')}
                </Label>
                <Input
                  value={formPersona.nombreCompleto}
                  onChange={(e) => setFormPersona({ ...formPersona, nombreCompleto: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.fullNamePlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Phone className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.phoneRequired')}
                </Label>
                <Input
                  type="tel"
                  value={formPersona.telefono}
                  onChange={(e) => setFormPersona({ ...formPersona, telefono: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.phonePlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Mail className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.emailRequired')}
                </Label>
                <Input
                  type="email"
                  value={formPersona.email}
                  onChange={(e) => setFormPersona({ ...formPersona, email: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.emailPlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Cargo */}
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Award className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.position')}
                </Label>
                <Input
                  value={formPersona.cargo}
                  onChange={(e) => setFormPersona({ ...formPersona, cargo: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.positionPlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Selección múltiple de idiomas */}
              <div className="md:col-span-2 space-y-3">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Languages className="w-4 h-4 text-[#1E73BE]" />
                  Langues parlées
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: 'fr' as IdiomaPersona, label: '🇫🇷 Français', color: '#1a4d7a' },
                    { code: 'en' as IdiomaPersona, label: '🇬🇧 English', color: '#2d9561' },
                    { code: 'es' as IdiomaPersona, label: '🇪🇸 Español', color: '#8B5CF6' },
                    { code: 'ar' as IdiomaPersona, label: '🇸🇦 العربية', color: '#F59E0B' }
                  ].map((idioma) => (
                    <label
                      key={idioma.code}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: formPersona.idiomas?.includes(idioma.code) ? idioma.color : '#e5e7eb',
                        backgroundColor: formPersona.idiomas?.includes(idioma.code) ? `${idioma.color}10` : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formPersona.idiomas?.includes(idioma.code) || false}
                        onChange={(e) => {
                          const currentIdiomas = formPersona.idiomas || [];
                          const newIdiomas = e.target.checked
                            ? [...currentIdiomas, idioma.code]
                            : currentIdiomas.filter(i => i !== idioma.code);
                          setFormPersona({ ...formPersona, idiomas: newIdiomas });
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: idioma.color }}
                      />
                      <span className="text-sm font-medium">{idioma.label}</span>
                    </label>
                  ))}
                </div>
                {formPersona.idiomas && formPersona.idiomas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formPersona.idiomas.map((code) => {
                      const idiomaInfo = [
                        { code: 'fr', label: '🇫🇷 Français', color: '#1a4d7a' },
                        { code: 'en', label: '🇬🇧 English', color: '#2d9561' },
                        { code: 'es', label: '🇪🇸 Español', color: '#8B5CF6' },
                        { code: 'ar', label: '🇸🇦 العربية', color: '#F59E0B' }
                      ].find(i => i.code === code);
                      return idiomaInfo ? (
                        <Badge
                          key={code}
                          className="text-white"
                          style={{ backgroundColor: idiomaInfo.color }}
                        >
                          {idiomaInfo.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[#333333]">
                  {t('organisms.profileDialog.authorizedPersons.additionalNotes')}
                </Label>
                <Textarea
                  value={formPersona.notas}
                  onChange={(e) => setFormPersona({ ...formPersona, notas: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.additionalNotesPlaceholder')}
                  rows={3}
                  className="border-gray-300"
                />
              </div>

              {/* Checkbox Principal */}
              <div className="md:col-span-2">
                <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Checkbox
                    id="es-principal"
                    checked={formPersona.esPrincipal}
                    onCheckedChange={(checked) => setFormPersona({ ...formPersona, esPrincipal: checked as boolean })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="es-principal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#4CAF50]" />
                        {t('organisms.profileDialog.authorizedPersons.markAsPrimary')}
                      </div>
                    </label>
                    <p className="text-xs text-[#666666]">
                      {t('organisms.profileDialog.authorizedPersons.primaryContactSuggestion')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disponibilidad - Días y Horarios */}
              <div className="md:col-span-2 mt-4 pt-4 border-t">
                <SelecteurJoursDisponibles
                  joursDisponibles={formPersona.joursDisponibles}
                  onChange={(nouveauxJours) => setFormPersona({ ...formPersona, joursDisponibles: nouveauxJours })}
                  showIcon={true}
                  label="Jours et horaires disponibles pour récupérer les commandes"
                />
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[#333333] mb-1">{t('organisms.profileDialog.authorizedPersons.importantInfo')}</p>
                  <ul className="text-sm text-[#666666] space-y-1 list-disc list-inside">
                    <li>{t('organisms.profileDialog.authorizedPersons.canIdentifyToPickUp')}</li>
                    <li>{t('organisms.profileDialog.authorizedPersons.keepListUpdated')}</li>
                    <li>{t('organisms.profileDialog.authorizedPersons.onlyAuthorizedPersons')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setDialogFormPersonaOpen(false);
                setPersonaEditando(null);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              {t('organisms.profileDialog.authorizedPersons.cancel')}
            </Button>
            <Button
              onClick={handleGuardarPersona}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              disabled={!formPersona.nombreCompleto.trim() || !formPersona.telefono.trim() || !formPersona.email.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {personaEditando ? t('organisms.profileDialog.authorizedPersons.updatePerson') : t('organisms.profileDialog.authorizedPersons.addPersonButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
      )}
    </>
  );
}