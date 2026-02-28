import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Save, FileText, Calendar, User, Gauge, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { mockVehiculos, mockUsuarios } from '../../data/mockData';
import { checklistSAAQ, type VerificacionVehiculo, type ItemVerificacion, type EstadoVerificacion, type CategoriaVerificacion } from '../../types/verificacion';
import { guardarVerificacion, generarIdVerificacion, obtenerVerificaciones } from '../../utils/verificacionStorage';

export function VerificacionVehiculo() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoriasExpanded, setCategoriasExpanded] = useState<{ [key: string]: boolean }>({
    exterior: true,
    cabina: false,
    motor: false,
    frenos: false,
    luces: false,
    neumaticos: false,
    carga: false,
    documentacion: false,
  });

  const [formData, setFormData] = useState({
    vehiculoId: '',
    conductorId: '',
    tipoVerificacion: 'pre_viaje' as const,
    odometro: 0,
    observacionesGenerales: '',
  });

  const [items, setItems] = useState<ItemVerificacion[]>([]);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [verificaciones, setVerificaciones] = useState<VerificacionVehiculo[]>([]);
  const [verDetalle, setVerDetalle] = useState<VerificacionVehiculo | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [tipoImpresion, setTipoImpresion] = useState<'resumen' | 'completo'>('resumen');

  // Cargar historial
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = () => {
    const historial = obtenerVerificaciones();
    setVerificaciones(historial);
  };

  const inicializarItems = () => {
    const nuevosItems: ItemVerificacion[] = [];
    Object.entries(checklistSAAQ).forEach(([categoria, itemsCategoria]) => {
      itemsCategoria.forEach(item => {
        nuevosItems.push({
          id: item.id,
          categoria,
          descripcion: item.descripcion,
          estado: 'conforme',
          observaciones: '',
        });
      });
    });
    setItems(nuevosItems);
  };

  const handleAbrirDialog = () => {
    setFormData({
      vehiculoId: '',
      conductorId: '',
      tipoVerificacion: 'pre_viaje',
      odometro: 0,
      observacionesGenerales: '',
    });
    inicializarItems();
    setDialogOpen(true);
  };

  const toggleCategoria = (categoria: string) => {
    setCategoriasExpanded({
      ...categoriasExpanded,
      [categoria]: !categoriasExpanded[categoria],
    });
  };

  const actualizarEstadoItem = (itemId: string, estado: EstadoVerificacion) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, estado } : item
    ));
  };

  const actualizarObservacionItem = (itemId: string, observaciones: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, observaciones } : item
    ));
  };

  const calcularEstadoGeneral = (): 'apto' | 'apto_con_observaciones' | 'no_apto' => {
    const itemsNoConformes = items.filter(i => i.estado === 'no_conforme');
    const itemsReparar = items.filter(i => i.estado === 'reparar');

    if (itemsNoConformes.length > 0) return 'no_apto';
    if (itemsReparar.length > 0) return 'apto_con_observaciones';
    return 'apto';
  };

  const handleGuardarVerificacion = () => {
    if (!formData.vehiculoId || !formData.conductorId) {
      toast.error(t('transport.saaqVerification.completeRequired'));
      return;
    }

    const vehiculo = mockVehiculos.find(v => v.id === formData.vehiculoId);
    const conductor = mockUsuarios.find(u => u.id === formData.conductorId);

    if (!vehiculo || !conductor) {
      toast.error(t('transport.saaqVerification.vehicleNotFound'));
      return;
    }

    const estadoGeneral = calcularEstadoGeneral();
    const accionesRequeridas = items
      .filter(i => i.estado === 'reparar' || i.estado === 'no_conforme')
      .map(i => `${i.descripcion}: ${i.observaciones || 'Requiere atención'}`);

    const verificacion: VerificacionVehiculo = {
      id: generarIdVerificacion(),
      vehiculoId: formData.vehiculoId,
      vehiculoPlaca: vehiculo.placa,
      conductorId: formData.conductorId,
      conductorNombre: conductor.nombre,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      tipoVerificacion: formData.tipoVerificacion,
      odometro: formData.odometro,
      items,
      estadoGeneral,
      observacionesGenerales: formData.observacionesGenerales,
      accionesRequeridas: accionesRequeridas.length > 0 ? accionesRequeridas : undefined,
    };

    const guardado = guardarVerificacion(verificacion);
    
    if (guardado) {
      const mensajes = {
        apto: `✅ ${t('transport.saaqVerification.verificationCompleteApt')}`,
        apto_con_observaciones: `⚠️ ${t('transport.saaqVerification.verificationCompleteAptObs')}`,
        no_apto: `❌ ${t('transport.saaqVerification.verificationCompleteNotApt')}`,
      };
      
      toast.success(mensajes[estadoGeneral]);
      setDialogOpen(false);
      cargarHistorial();
    } else {
      toast.error(t('transport.saaqVerification.saveError'));
    }
  };

  const getCategoriaIcono = (categoria: string) => {
    const iconos: { [key: string]: string } = {
      exterior: '🚗',
      cabina: '🪑',
      motor: '⚙️',
      frenos: '🛑',
      luces: '💡',
      neumaticos: '⚫',
      carga: '📦',
      documentacion: '📄',
    };
    return iconos[categoria] || '✓';
  };

  const getCategoriaProgreso = (categoria: string) => {
    const itemsCategoria = items.filter(i => i.categoria === categoria);
    const itemsConforme = itemsCategoria.filter(i => i.estado === 'conforme');
    return itemsCategoria.length > 0 
      ? Math.round((itemsConforme.length / itemsCategoria.length) * 100)
      : 0;
  };

  const getEstadoBadge = (estado: EstadoVerificacion) => {
    const config = {
      conforme: { bg: 'bg-[#4CAF50]', text: '✓ Conforme', icon: CheckCircle2 },
      no_conforme: { bg: 'bg-[#DC3545]', text: '✗ No Conforme', icon: XCircle },
      reparar: { bg: 'bg-[#FFC107]', text: '⚠ Reparar', icon: AlertTriangle },
    };
    const c = config[estado];
    const Icon = c.icon;
    return (
      <Badge className={`${c.bg} hover:${c.bg} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {c.text}
      </Badge>
    );
  };

  const getEstadoGeneralBadge = (estado: 'apto' | 'apto_con_observaciones' | 'no_apto') => {
    const config = {
      apto: { bg: 'bg-[#4CAF50]', text: 'APTO' },
      apto_con_observaciones: { bg: 'bg-[#FFC107]', text: 'APTO CON OBSERVACIONES' },
      no_apto: { bg: 'bg-[#DC3545]', text: 'NO APTO' },
    };
    const c = config[estado];
    return <Badge className={`${c.bg} hover:${c.bg} text-white text-sm px-3 py-1`}>{c.text}</Badge>;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      exterior: 'Exterior del Vehículo',
      cabina: 'Cabina del Conductor',
      motor: 'Motor y Fluidos',
      frenos: 'Sistema de Frenos',
      luces: 'Luces y Señalización',
      neumaticos: 'Neumáticos y Ruedas',
      carga: 'Carga y Equipamiento',
      documentacion: 'Documentación y Permisos',
    };
    return labels[categoria] || categoria;
  };

  const progresoTotal = items.length > 0 
    ? Math.round((items.filter(i => i.estado === 'conforme').length / items.length) * 100)
    : 0;

  const handleDescargarPDF = () => {
    // Establecer el modo de impresión en el body
    document.body.setAttribute('data-print-mode', tipoImpresion);
    
    // Expandir todas las categorías antes de imprimir
    const todasExpandidas: { [key: string]: boolean } = {};
    Object.keys(checklistSAAQ).forEach(cat => {
      todasExpandidas[cat] = true;
    });
    setCategoriasExpanded(todasExpandidas);
    
    // Dar tiempo para que se expandan las categorías antes de imprimir
    setTimeout(() => {
      window.print();
      // Limpiar el atributo después de imprimir
      document.body.removeAttribute('data-print-mode');
    }, 100);
  };

  // Efecto para expandir todas las categorías cuando se abre el diálogo de detalle
  useEffect(() => {
    if (detalleOpen) {
      const todasExpandidas: { [key: string]: boolean } = {};
      Object.keys(checklistSAAQ).forEach(cat => {
        todasExpandidas[cat] = true;
      });
      setCategoriasExpanded(todasExpandidas);
    }
  }, [detalleOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#333333' }}>
            🔍 {t('transport.saaqVerification.title')}
          </h2>
          <p className="text-[#666666]">{t('transport.saaqVerification.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setHistorialOpen(true)}
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('transport.saaqVerification.history')} ({verificaciones.length})
          </Button>
          <Button 
            onClick={handleAbrirDialog} 
            className="bg-[#1E73BE] hover:bg-[#1557A0]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            {t('transport.saaqVerification.newVerification')}
          </Button>
        </div>
      </div>

      {/* Últimas verificaciones */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('transport.saaqVerification.recentVerifications')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verificaciones.length === 0 ? (
            <div className="text-center py-8 text-[#666666]">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('transport.saaqVerification.noVerifications')}</p>
              <p className="text-sm">{t('transport.saaqVerification.firstVerification')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verificaciones.slice(0, 5).map(ver => {
                const vehiculo = mockVehiculos.find(v => v.id === ver.vehiculoId);
                return (
                  <div key={ver.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-8 h-8 text-[#1E73BE]" />
                      <div>
                        <p className="font-medium">{ver.vehiculoPlaca} - {vehiculo?.marca} {vehiculo?.modelo}</p>
                        <p className="text-sm text-[#666666]">
                          {ver.conductorNombre} • {new Date(ver.fecha).toLocaleDateString('es-ES')} {ver.hora}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-200 text-gray-700">
                        {ver.tipoVerificacion === 'pre_viaje' ? t('transport.saaqVerification.preTrip') : ver.tipoVerificacion === 'post_viaje' ? t('transport.saaqVerification.postTrip') : t('transport.saaqVerification.monthly')}
                      </Badge>
                      {getEstadoGeneralBadge(ver.estadoGeneral)}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#E3F2FD]"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                        onClick={() => {
                          setVerDetalle(ver);
                          setDetalleOpen(true);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {t('transport.saaqVerification.viewDetails')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo Nueva Verificación */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="verificacion-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              🔍 {t('transport.saaqVerification.newVerificationSAAQ')}
            </DialogTitle>
            <DialogDescription id="verificacion-dialog-description">
              {t('transport.saaqVerification.inspectionDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <Card className="border-2 border-[#1E73BE]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('transport.saaqVerification.verificationInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.vehicle')} *</Label>
                  <Select value={formData.vehiculoId} onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('transport.saaqVerification.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehiculos.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.driver')} *</Label>
                  <Select value={formData.conductorId} onValueChange={(value) => setFormData({ ...formData, conductorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('transport.saaqVerification.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsuarios.filter(u => u.rol === 'transportista').map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.verificationType')} *</Label>
                  <Select value={formData.tipoVerificacion} onValueChange={(value: any) => setFormData({ ...formData, tipoVerificacion: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_viaje">{t('transport.saaqVerification.preTrip')}</SelectItem>
                      <SelectItem value="post_viaje">{t('transport.saaqVerification.postTrip')}</SelectItem>
                      <SelectItem value="mensual">{t('transport.saaqVerification.monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.odometer')} *</Label>
                  <Input
                    type="number"
                    value={formData.odometro || ''}
                    onChange={(e) => setFormData({ ...formData, odometro: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Progreso General */}
            <div className="bg-gradient-to-r from-[#1E73BE] to-[#4CAF50] p-4 rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('transport.saaqVerification.inspectionProgress')}
                </span>
                <span className="text-2xl font-bold">{progresoTotal}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-300"
                  style={{ width: `${progresoTotal}%` }}
                />
              </div>
            </div>

            {/* Checklist por Categorías */}
            <div className="space-y-3">
              {Object.keys(checklistSAAQ).map((categoria) => {
                const itemsCategoria = items.filter(i => i.categoria === categoria);
                const progreso = getCategoriaProgreso(categoria);
                const expanded = categoriasExpanded[categoria];

                return (
                  <Card key={categoria} className="border-l-4 border-l-[#1E73BE]">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                      onClick={() => toggleCategoria(categoria)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoriaIcono(categoria)}</span>
                          <div>
                            <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {getCategoriaLabel(categoria)}
                            </CardTitle>
                            <p className="text-xs text-[#666666] mt-1">
                              {itemsCategoria.length} {t('transport.saaqVerification.elements')} • {progreso}% {t('transport.saaqVerification.completed')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#4CAF50] rounded-full h-2 transition-all"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </CardHeader>

                    {expanded && (
                      <CardContent className="space-y-3">
                        {itemsCategoria.map((item) => (
                          <div key={item.id} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium flex-1">{item.descripcion}</p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant={item.estado === 'conforme' ? 'default' : 'outline'}
                                  className={item.estado === 'conforme' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
                                  onClick={() => actualizarEstadoItem(item.id, 'conforme')}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={item.estado === 'reparar' ? 'default' : 'outline'}
                                  className={item.estado === 'reparar' ? 'bg-[#FFC107] hover:bg-[#e6ad06]' : ''}
                                  onClick={() => actualizarEstadoItem(item.id, 'reparar')}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={item.estado === 'no_conforme' ? 'default' : 'outline'}
                                  className={item.estado === 'no_conforme' ? 'bg-[#DC3545] hover:bg-[#c82333]' : ''}
                                  onClick={() => actualizarEstadoItem(item.id, 'no_conforme')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {item.estado !== 'conforme' && (
                              <Input
                                placeholder={t('transport.saaqVerification.observationsPlaceholder')}
                                value={item.observaciones || ''}
                                onChange={(e) => actualizarObservacionItem(item.id, e.target.value)}
                                className="text-sm"
                              />
                            )}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Observaciones Generales */}
            <div className="space-y-2">
              <Label>{t('transport.saaqVerification.generalObservations')}</Label>
              <Textarea
                placeholder={t('transport.saaqVerification.additionalComments')}
                value={formData.observacionesGenerales}
                onChange={(e) => setFormData({ ...formData, observacionesGenerales: e.target.value })}
                rows={3}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('transport.saaqVerification.cancel')}
              </Button>
              <Button 
                onClick={handleGuardarVerificacion} 
                className="bg-[#4CAF50] hover:bg-[#45a049]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <Save className="w-4 h-4 mr-2" />
                {t('transport.saaqVerification.saveVerification')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Historial */}
      <Dialog open={historialOpen} onOpenChange={setHistorialOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="historial-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              📋 Historial de Verificaciones SAAQ
            </DialogTitle>
            <DialogDescription id="historial-dialog-description">
              Registro completo de todas las inspecciones realizadas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {verificaciones.map(ver => {
              const vehiculo = mockVehiculos.find(v => v.id === ver.vehiculoId);
              const itemsNoConformes = ver.items.filter(i => i.estado === 'no_conforme');
              const itemsReparar = ver.items.filter(i => i.estado === 'reparar');

              return (
                <Card key={ver.id} className="border-l-4 border-l-[#1E73BE]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {ver.vehiculoPlaca} - {vehiculo?.marca} {vehiculo?.modelo}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-[#666666]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(ver.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {ver.hora}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {ver.conductorNombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge className="w-4 h-4" />
                            {ver.odometro.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getEstadoGeneralBadge(ver.estadoGeneral)}
                        <Badge className="bg-gray-200 text-gray-700">
                          {ver.tipoVerificacion === 'pre_viaje' ? 'Pre-Viaje' : ver.tipoVerificacion === 'post_viaje' ? 'Post-Viaje' : 'Mensual'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Resumen */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#4CAF50]">
                          {ver.items.filter(i => i.estado === 'conforme').length}
                        </p>
                        <p className="text-xs text-[#666666]">Conformes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#FFC107]">
                          {itemsReparar.length}
                        </p>
                        <p className="text-xs text-[#666666]">A Reparar</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#DC3545]">
                          {itemsNoConformes.length}
                        </p>
                        <p className="text-xs text-[#666666]">No Conformes</p>
                      </div>
                    </div>

                    {/* Acciones Requeridas */}
                    {ver.accionesRequeridas && ver.accionesRequeridas.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800 mb-2">⚠️ Acciones Requeridas:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {ver.accionesRequeridas.map((accion, idx) => (
                            <li key={`accion-ver-${ver.vehiculoId}-${idx}`}>{accion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Observaciones */}
                    {ver.observacionesGenerales && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">📝 <strong>Observaciones:</strong> {ver.observacionesGenerales}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Detalle */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="detalle-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              📋 Detalle de Verificación SAAQ
            </DialogTitle>
            <DialogDescription id="detalle-dialog-description">
              Detalles completos de la inspección realizada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {verDetalle && (
              <Card key={verDetalle.id} className="border-l-4 border-l-[#1E73BE]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {verDetalle.vehiculoPlaca} - {mockVehiculos.find(v => v.id === verDetalle.vehiculoId)?.marca} {mockVehiculos.find(v => v.id === verDetalle.vehiculoId)?.modelo}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-[#666666]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(verDetalle.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {verDetalle.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {verDetalle.conductorNombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          {verDetalle.odometro.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getEstadoGeneralBadge(verDetalle.estadoGeneral)}
                      <Badge className="bg-gray-200 text-gray-700">
                        {verDetalle.tipoVerificacion === 'pre_viaje' ? 'Pre-Viaje' : verDetalle.tipoVerificacion === 'post_viaje' ? 'Post-Viaje' : 'Mensual'}
                      </Badge>
                      <div className="flex gap-2 print:hidden">
                        <Select value={tipoImpresion} onValueChange={(value: 'resumen' | 'completo') => setTipoImpresion(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resumen">Resumen</SelectItem>
                            <SelectItem value="completo">Completo</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={handleDescargarPDF}
                          className="bg-[#1E73BE] hover:bg-[#1557A0]"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Imprimir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Resumen */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#4CAF50]">
                        {verDetalle.items.filter(i => i.estado === 'conforme').length}
                      </p>
                      <p className="text-xs text-[#666666]">Conformes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#FFC107]">
                        {verDetalle.items.filter(i => i.estado === 'reparar').length}
                      </p>
                      <p className="text-xs text-[#666666]">A Reparar</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#DC3545]">
                        {verDetalle.items.filter(i => i.estado === 'no_conforme').length}
                      </p>
                      <p className="text-xs text-[#666666]">No Conformes</p>
                    </div>
                  </div>

                  {/* Acciones Requeridas */}
                  {verDetalle.accionesRequeridas && verDetalle.accionesRequeridas.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800 mb-2">⚠️ Acciones Requeridas:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {verDetalle.accionesRequeridas.map((accion, idx) => (
                          <li key={`accion-detalle-${verDetalle.id}-${idx}`}>{accion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Observaciones */}
                  {verDetalle.observacionesGenerales && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm">📝 <strong>Observaciones:</strong> {verDetalle.observacionesGenerales}</p>
                    </div>
                  )}

                  {/* Checklist por Categorías */}
                  <div className="space-y-3">
                    {Object.keys(checklistSAAQ).map((categoria) => {
                      const itemsCategoria = verDetalle.items.filter(i => i.categoria === categoria);
                      const itemsConProblemas = itemsCategoria.filter(i => i.estado !== 'conforme');
                      const tieneProblemas = itemsConProblemas.length > 0;
                      const progreso = getCategoriaProgreso(categoria);
                      const expanded = categoriasExpanded[categoria];

                      return (
                        <Card 
                          key={categoria} 
                          className={`border-l-4 border-l-[#1E73BE] ${!tieneProblemas ? 'print-categoria-sin-problemas' : ''}`}
                        >
                          <CardHeader 
                            className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                            onClick={() => toggleCategoria(categoria)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getCategoriaIcono(categoria)}</span>
                                <div>
                                  <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {getCategoriaLabel(categoria)}
                                  </CardTitle>
                                  <p className="text-xs text-[#666666] mt-1">
                                    {itemsCategoria.length} elementos • {progreso}% completado
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-[#4CAF50] rounded-full h-2 transition-all"
                                    style={{ width: `${progreso}%` }}
                                  />
                                </div>
                                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </CardHeader>

                          {expanded && (
                            <CardContent className="space-y-3">
                              {itemsCategoria.map((item) => (
                                <div 
                                  key={item.id} 
                                  className={`p-3 border rounded-lg bg-gray-50 ${item.estado === 'conforme' ? 'print-ocultar-conforme' : 'print-solo-problemas'}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm font-medium flex-1">{item.descripcion}</p>
                                    <div className="flex gap-1 print:hidden">
                                      <Button
                                        size="sm"
                                        variant={item.estado === 'conforme' ? 'default' : 'outline'}
                                        className={item.estado === 'conforme' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
                                        onClick={() => actualizarEstadoItem(item.id, 'conforme')}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={item.estado === 'reparar' ? 'default' : 'outline'}
                                        className={item.estado === 'reparar' ? 'bg-[#FFC107] hover:bg-[#e6ad06]' : ''}
                                        onClick={() => actualizarEstadoItem(item.id, 'reparar')}
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={item.estado === 'no_conforme' ? 'default' : 'outline'}
                                        className={item.estado === 'no_conforme' ? 'bg-[#DC3545] hover:bg-[#c82333]' : ''}
                                        onClick={() => actualizarEstadoItem(item.id, 'no_conforme')}
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {/* Estado visible solo en PDF */}
                                    <div className="hidden print:block ml-2">
                                      {getEstadoBadge(item.estado)}
                                    </div>
                                  </div>
                                  {item.observaciones && item.observaciones.trim() !== '' && (
                                    <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                                      <strong>Observaciones:</strong> {item.observaciones}
                                    </div>
                                  )}
                                  {item.estado !== 'conforme' && (
                                    <Input
                                      placeholder="Observaciones..."
                                      value={item.observaciones || ''}
                                      onChange={(e) => actualizarObservacionItem(item.id, e.target.value)}
                                      className="text-sm print:hidden"
                                    />
                                  )}
                                </div>
                              ))}
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}