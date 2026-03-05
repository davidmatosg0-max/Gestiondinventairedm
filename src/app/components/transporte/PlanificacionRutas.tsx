import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, MapPin, Clock, Navigation, CheckCircle2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { mockRutas, mockVehiculos, mockUsuarios, mockOrganismos, mockComandas } from '../../data/mockData';
import { Ruta, Parada } from '../../types';
import { MapLink, DirectionsButton, EmbeddedMap } from '../ui/map-link';
import { getGoogleMapsMultipleStops } from '../../utils/maps';

export function PlanificacionRutas() {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState(mockRutas);
  const [rutaDialogOpen, setRutaDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rutaAEliminar, setRutaAEliminar] = useState<Ruta | null>(null);
  const [verDetallesDialogOpen, setVerDetallesDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const [formRuta, setFormRuta] = useState({
    nombre: '',
    fecha: '',
    vehiculoId: '',
    conductorId: '',
    notas: '',
    paradas: [] as Array<{
      organismoId: string;
      comandaId: string;
      tiempoEstimadoLlegada: string;
      tiempoEstimadoDescarga: number;
    }>
  });

  const rutasFiltradas = rutas.filter(r => {
    const matchSearch = r.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todas' || r.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      planificada: { bg: 'bg-[#FFC107]', text: t('transport.routes.planned') },
      en_curso: { bg: 'bg-[#1E73BE]', text: t('transport.inProgress') },
      completada: { bg: 'bg-[#4CAF50]', text: t('transport.routes.routeCompleted') },
      cancelada: { bg: 'bg-[#DC3545]', text: t('transport.cancelled') }
    }[estado] || { bg: 'bg-gray-500', text: estado };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const getEstadoParadaBadge = (estado: string) => {
    const config = {
      pendiente: { bg: 'bg-gray-400', text: t('transport.routes.stopPending'), icon: Clock },
      en_ruta: { bg: 'bg-[#1E73BE]', text: t('transport.routes.onRoute'), icon: Navigation },
      completada: { bg: 'bg-[#4CAF50]', text: t('transport.routes.stopCompleted'), icon: CheckCircle2 },
      omitida: { bg: 'bg-[#DC3545]', text: t('transport.routes.skipped'), icon: AlertCircle }
    }[estado] || { bg: 'bg-gray-500', text: estado, icon: Clock };

    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handleAbrirCreacion = () => {
    setFormRuta({
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      vehiculoId: '',
      conductorId: '',
      notas: '',
      paradas: []
    });
    setModoEdicion(false);
    setRutaSeleccionada(null);
    setRutaDialogOpen(true);
  };

  const handleAbrirEdicion = (ruta: Ruta) => {
    setRutaSeleccionada(ruta);
    setFormRuta({
      nombre: ruta.nombre,
      fecha: ruta.fecha,
      vehiculoId: ruta.vehiculoId,
      conductorId: ruta.conductorId,
      notas: ruta.notas || '',
      paradas: ruta.paradas.map(p => ({
        organismoId: p.organismoId,
        comandaId: p.comandaId || '',
        tiempoEstimadoLlegada: p.tiempoEstimadoLlegada,
        tiempoEstimadoDescarga: p.tiempoEstimadoDescarga
      }))
    });
    setModoEdicion(true);
    setRutaDialogOpen(true);
  };

  const handleGuardarRuta = () => {
    if (!formRuta.nombre || !formRuta.fecha || !formRuta.vehiculoId || !formRuta.conductorId) {
      toast.error(t('transport.routes.completeAllFields'));
      return;
    }

    if (formRuta.paradas.length === 0) {
      toast.error(t('transport.routes.addAtLeastOneStop'));
      return;
    }

    if (modoEdicion) {
      toast.success(`${t('transport.route')} "${formRuta.nombre}" ${t('transport.routes.routeUpdated')}`);
    } else {
      toast.success(`${t('transport.route')} "${formRuta.nombre}" ${t('transport.routes.routeCreated')}`);
    }
    setRutaDialogOpen(false);
  };

  const handleEliminarRuta = () => {
    if (rutaAEliminar) {
      toast.success(`${t('transport.route')} "${rutaAEliminar.nombre}" ${t('transport.routes.routeDeleted')}`);
      setDeleteDialogOpen(false);
      setRutaAEliminar(null);
    }
  };

  const handleAgregarParada = () => {
    setFormRuta({
      ...formRuta,
      paradas: [
        ...formRuta.paradas,
        {
          organismoId: '',
          comandaId: '',
          tiempoEstimadoLlegada: '',
          tiempoEstimadoDescarga: 15
        }
      ]
    });
  };

  const handleEliminarParada = (index: number) => {
    setFormRuta({
      ...formRuta,
      paradas: formRuta.paradas.filter((_, i) => i !== index)
    });
  };

  const handleVerDetalles = (ruta: Ruta) => {
    setRutaSeleccionada(ruta);
    setVerDetallesDialogOpen(true);
  };

  const stats = {
    total: rutas.length,
    planificadas: rutas.filter(r => r.estado === 'planificada').length,
    enCurso: rutas.filter(r => r.estado === 'en_curso').length,
    completadas: rutas.filter(r => r.estado === 'completada').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#333333' }}>
            {t('transport.routes.title')}
          </h2>
          <p className="text-[#666666]">{t('transport.routes.subtitle')}</p>
        </div>
        <Button onClick={handleAbrirCreacion} className="bg-[#1E73BE] hover:bg-[#1557A0]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
          <Plus className="w-4 h-4 mr-2" />
          {t('transport.routes.newRoute')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#333333]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.routes.totalRoutes')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#333333' }}>
                  {stats.total}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-[#333333]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.routes.planned')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>
                  {stats.planificadas}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-[#FFC107]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.inProgress')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                  {stats.enCurso}
                </p>
              </div>
              <Navigation className="w-8 h-8 text-[#1E73BE]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.routes.routeCompleted')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                  {stats.completadas}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={t('transport.routes.searchRoutes')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{t('transport.routes.allRoutes')}</SelectItem>
                <SelectItem value="planificada">{t('transport.routes.planned')}</SelectItem>
                <SelectItem value="en_curso">{t('transport.inProgress')}</SelectItem>
                <SelectItem value="completada">{t('transport.routes.routeCompleted')}</SelectItem>
                <SelectItem value="cancelada">{t('transport.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rutasFiltradas.map(ruta => {
          const vehiculo = mockVehiculos.find(v => v.id === ruta.vehiculoId);
          const conductor = mockUsuarios.find(u => u.id === ruta.conductorId);

          return (
            <Card key={ruta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                      {ruta.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-[#666666]">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(ruta.fecha).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  {getEstadoBadge(ruta.estado)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Vehículo y Conductor */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-[#666666]">{t('transport.vehicle')}</p>
                    <p className="text-sm font-medium">{vehiculo?.placa || 'N/A'}</p>
                    <p className="text-xs text-[#666666]">{vehiculo?.marca} {vehiculo?.modelo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#666666]">{t('transport.driver')}</p>
                    <p className="text-sm font-medium">{conductor?.nombre || 'N/A'}</p>
                  </div>
                </div>

                {/* Paradas */}
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('transport.stops')} ({ruta.paradas.length})
                  </p>
                  <div className="space-y-2">
                    {ruta.paradas.slice(0, 3).map((parada, index) => {
                      const organismo = mockOrganismos.find(o => o.id === parada.organismoId);
                      return (
                        <div key={parada.id} className="flex items-start gap-2 p-2 bg-white border border-gray-200 rounded">
                          <div className="w-6 h-6 rounded-full bg-[#1E73BE] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {parada.orden}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{organismo?.nombre || 'N/A'}</p>
                            <p className="text-xs text-[#666666] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {parada.tiempoEstimadoLlegada}
                            </p>
                          </div>
                          {getEstadoParadaBadge(parada.estado)}
                        </div>
                      );
                    })}
                    {ruta.paradas.length > 3 && (
                      <p className="text-xs text-center text-[#666666]">
                        +{ruta.paradas.length - 3} {t('transport.routes.moreStops')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Información de Ruta */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                  <div>
                    <p className="text-[#666666]">{t('transport.distance')}</p>
                    <p className="font-medium">{ruta.distanciaTotal} km</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">{t('transport.routes.estimatedTimeShort')}</p>
                    <p className="font-medium">{Math.floor(ruta.tiempoEstimado / 60)}h {ruta.tiempoEstimado % 60}m</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">{t('transport.status')}</p>
                    <p className="font-medium">
                      {ruta.paradas.filter(p => p.estado === 'completada').length}/{ruta.paradas.length}
                    </p>
                  </div>
                </div>

                {ruta.notas && (
                  <div className="p-2 bg-blue-50 rounded text-xs">
                    <p className="text-[#666666]">📝 {ruta.notas}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleVerDetalles(ruta)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    {t('transport.routes.viewDetails')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAbrirEdicion(ruta)}
                    disabled={ruta.estado === 'completada' || ruta.estado === 'cancelada'}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#DC3545]"
                    onClick={() => {
                      setRutaAEliminar(ruta);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={ruta.estado === 'en_curso'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo Crear/Editar Ruta */}
      <Dialog open={rutaDialogOpen} onOpenChange={setRutaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? t('transport.editRoute') : t('transport.routes.newDeliveryRoute')}
            </DialogTitle>
            <DialogDescription id="ruta-dialog-description">
              {t('transport.routes.configureRoute')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('transport.routes.routeInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('transport.routes.routeName')} *</Label>
                  <Input
                    placeholder={t('transport.routes.routeNamePlaceholder')}
                    value={formRuta.nombre}
                    onChange={(e) => setFormRuta({ ...formRuta, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.routes.date')} *</Label>
                  <Input
                    type="date"
                    value={formRuta.fecha}
                    onChange={(e) => setFormRuta({ ...formRuta, fecha: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicle')} *</Label>
                  <Select value={formRuta.vehiculoId} onValueChange={(value) => setFormRuta({ ...formRuta, vehiculoId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('transport.selectVehicle')} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehiculos.filter(v => v.estado === 'disponible' || v.id === formRuta.vehiculoId).map(vehiculo => (
                        <SelectItem key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.capacidadKg}kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.driver')} *</Label>
                  <Select value={formRuta.conductorId} onValueChange={(value) => setFormRuta({ ...formRuta, conductorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('transport.selectDriver')} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsuarios.filter(u => u.rol === 'transportista').map(conductor => (
                        <SelectItem key={conductor.id} value={conductor.id}>
                          {conductor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Paradas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('transport.stops')} ({formRuta.paradas.length})
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAgregarParada}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t('transport.routes.addStop')}
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formRuta.paradas.map((parada, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>{t('transport.routes.organism')} *</Label>
                              <Select
                                value={parada.organismoId}
                                onValueChange={(value) => {
                                  const newParadas = [...formRuta.paradas];
                                  newParadas[index].organismoId = value;
                                  setFormRuta({ ...formRuta, paradas: newParadas });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t('transport.routes.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockOrganismos.map(org => (
                                    <SelectItem key={org.id} value={org.id}>
                                      {org.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t('transport.routes.order')} ({t('transport.routes.optional')})</Label>
                              <Select
                                value={parada.comandaId}
                                onValueChange={(value) => {
                                  const newParadas = [...formRuta.paradas];
                                  newParadas[index].comandaId = value;
                                  setFormRuta({ ...formRuta, paradas: newParadas });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t('transport.routes.noOrder')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="noorder">{t('transport.routes.noOrder')}</SelectItem>
                                  {mockComandas.filter(c => c.estado === 'completada').map(comanda => (
                                    <SelectItem key={comanda.id} value={comanda.id}>
                                      {comanda.numero}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t('transport.routes.estimatedArrival')} *</Label>
                              <Input
                                type="time"
                                value={parada.tiempoEstimadoLlegada}
                                onChange={(e) => {
                                  const newParadas = [...formRuta.paradas];
                                  newParadas[index].tiempoEstimadoLlegada = e.target.value;
                                  setFormRuta({ ...formRuta, paradas: newParadas });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('transport.routes.unloadingTime')} *</Label>
                              <Input
                                type="number"
                                value={parada.tiempoEstimadoDescarga}
                                onChange={(e) => {
                                  const newParadas = [...formRuta.paradas];
                                  newParadas[index].tiempoEstimadoDescarga = parseInt(e.target.value);
                                  setFormRuta({ ...formRuta, paradas: newParadas });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[#DC3545]"
                          onClick={() => handleEliminarParada(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {formRuta.paradas.length === 0 && (
                  <div className="text-center py-8 text-[#666666]">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('transport.routes.noStops')}</p>
                    <p className="text-sm">{t('transport.routes.clickAddStop')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label>{t('transport.routes.notes')}</Label>
              <Textarea
                placeholder={t('transport.routes.notesPlaceholder')}
                value={formRuta.notas}
                onChange={(e) => setFormRuta({ ...formRuta, notas: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setRutaDialogOpen(false)}>
                {t('transport.routes.cancel')}
              </Button>
              <Button onClick={handleGuardarRuta} className="bg-[#1E73BE] hover:bg-[#1557A0]">
                {modoEdicion ? t('transport.routes.updateRoute') : t('transport.routes.createRoute')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Ver Detalles */}
      <Dialog open={verDetallesDialogOpen} onOpenChange={setVerDetallesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {rutaSeleccionada?.nombre}
            </DialogTitle>
            <DialogDescription id="ruta-detalles-description">
              {t('transport.routes.completeDetails')}
            </DialogDescription>
          </DialogHeader>
          {rutaSeleccionada && (
            <div className="space-y-4 py-4">
              {/* Botón para abrir ruta completa en Google Maps */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const paradas = rutaSeleccionada.paradas.map(p => p.direccion);
                    const origen = paradas[0];
                    const destino = paradas[paradas.length - 1];
                    const waypoints = paradas.slice(1, -1);
                    const url = getGoogleMapsMultipleStops(origen, waypoints, destino);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {t('transport.routes.openCompleteRoute')}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-[#666666]">{t('transport.vehicle')}</p>
                  <p className="font-medium">
                    {mockVehiculos.find(v => v.id === rutaSeleccionada.vehiculoId)?.placa || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#666666]">{t('transport.driver')}</p>
                  <p className="font-medium">
                    {mockUsuarios.find(u => u.id === rutaSeleccionada.conductorId)?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#666666]">{t('transport.routes.totalDistance')}</p>
                  <p className="font-medium">{rutaSeleccionada.distanciaTotal} km</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666]">{t('transport.routes.estimatedTimeLabel')}</p>
                  <p className="font-medium">
                    {Math.floor(rutaSeleccionada.tiempoEstimado / 60)}h {rutaSeleccionada.tiempoEstimado % 60}m
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('transport.stops')} ({rutaSeleccionada.paradas.length})
                </h3>
                <div className="space-y-3">
                  {rutaSeleccionada.paradas.map((parada) => {
                    const organismo = mockOrganismos.find(o => o.id === parada.organismoId);
                    return (
                      <Card key={parada.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0">
                              {parada.orden}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium">{organismo?.nombre || 'N/A'}</p>
                                  <MapLink 
                                    direccion={parada.direccion} 
                                    variant="inline"
                                    className="text-xs"
                                  />
                                </div>
                                {getEstadoParadaBadge(parada.estado)}
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div>
                                  <p className="text-[#666666]">{t('transport.routes.estimatedArrival').replace(' *', '')}</p>
                                  <p className="font-medium">{parada.tiempoEstimadoLlegada}</p>
                                </div>
                                <div>
                                  <p className="text-[#666666]">{t('transport.routes.unloadingTime').replace(' *', '').replace(' (min)', '')}</p>
                                  <p className="font-medium">{parada.tiempoEstimadoDescarga} min</p>
                                </div>
                                {parada.horaLlegada && (
                                  <div>
                                    <p className="text-[#666666]">{t('transport.routes.actualArrival')}</p>
                                    <p className="font-medium text-[#4CAF50]">{parada.horaLlegada}</p>
                                  </div>
                                )}
                                {parada.horaSalida && (
                                  <div>
                                    <p className="text-[#666666]">{t('transport.routes.departureTime')}</p>
                                    <p className="font-medium text-[#4CAF50]">{parada.horaSalida}</p>
                                  </div>
                                )}
                              </div>

                              {/* Mapa embebido de la parada */}
                              {parada.coordenadas && (
                                <EmbeddedMap 
                                  lat={parada.coordenadas.lat}
                                  lng={parada.coordenadas.lng}
                                  zoom={15}
                                  height="200px"
                                  className="mb-3"
                                />
                              )}

                              {parada.observaciones && (
                                <div className="mt-3 p-2 bg-blue-50 rounded">
                                  <p className="text-sm">📝 {parada.observaciones}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('transport.routes.deleteRoute')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {rutaAEliminar && (
                <div className="space-y-3">
                  <p>{t('transport.routes.deleteConfirm')} <strong>{rutaAEliminar.nombre}</strong>?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ {t('transport.routes.deleteWarning')}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('transport.routes.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarRuta}
              className="bg-[#DC3545] hover:bg-[#c82333]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('transport.routes.deleteButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}