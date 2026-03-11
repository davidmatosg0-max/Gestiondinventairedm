import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  MapPin,
  Package,
  Truck,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Star,
  Gift,
  RefreshCw,
  Zap,
  ChevronDown,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { toast } from 'sonner';
import { FormularioContactoEntrepotCompacto } from './FormularioContactoEntrepotCompacto';
import { FormularioContactoExpress } from './FormularioContactoExpress';
import { 
  obtenerContactosDepartamento,
  guardarContacto,
  actualizarContacto,
  eliminarContacto,
  type ContactoDepartamento,
  type TipoContacto,
  type GeneroContacto
} from '../../utils/contactosDepartamentoStorage';

export function GestionContactosEntrepot() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoContacto>('todos');
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [contactoEditando, setContactoEditando] = useState<string | null>(null);
  const [tipoFormulario, setTipoFormulario] = useState<'express' | 'completo'>('express'); // Nuevo estado

  // Estado inicial del formulario
  const formularioInicial = {
    tipoContacto: 'fournisseur' as 'fournisseur' | 'donador' | 'transportista' | 'partenaire',
    nombre: '',
    apellido: '',
    numeroID: '',
    imagen: null,
    nombreEmpresa: '',
    tipoEmpresa: '',
    numeroRegistro: '',
    numeroTVA: '',
    emailPrincipal: '',
    emailSecundario: '',
    telefonoPrincipal: '',
    telefonoSecundario: '',
    sitioWeb: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    pais: 'CA',
    banco: '',
    numeroCuenta: '',
    numeroRuta: '',
    categoriaProductos: [],
    temperaturaEspecializada: [],
    horarioDisponible: '',
    diasOperacion: [],
    tiempoEntrega: '',
    metodoPago: [],
    notas: '',
    etiquetas: [],
    activo: true,
    fechaNacimiento: '',
    genero: 'non-specifie',
    departamentosAsignados: ['1'] // Por defecto: Entrepôt (ID='1' según departamentosStorage.ts)
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  // Cargar contactos desde localStorage
  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);

  useEffect(() => {
    cargarContactos();
  }, []);

  const cargarContactos = () => {
    // Filtrar solo contactos de Entrepôt (departamentoId='1')
    setContactos(obtenerContactosDepartamento('1'));
  };

  const handleNuevoContacto = () => {
    setFormulario(formularioInicial);
    setModoEdicion(false);
    setContactoEditando(null);
    setDialogAbierto(true);
  };

  const handleEditarContacto = (contacto: ContactoDepartamento) => {
    setFormulario({
      tipoContacto: contacto.tipo as 'fournisseur' | 'donador' | 'transportista' | 'partenaire',
      nombre: contacto.nombre,
      apellido: contacto.apellido,
      numeroID: contacto.numeroID || '',
      imagen: contacto.imagen || null,
      nombreEmpresa: contacto.nombreEmpresa || '',
      tipoEmpresa: contacto.tipoEmpresa || '',
      numeroRegistro: contacto.numeroRegistro || '',
      numeroTVA: contacto.numeroTVA || '',
      emailPrincipal: contacto.emailPrincipal || contacto.email || '',
      emailSecundario: contacto.emailSecundario || '',
      telefonoPrincipal: contacto.telefonoPrincipal || contacto.telefono || '',
      telefonoSecundario: contacto.telefonoSecundario || '',
      sitioWeb: contacto.sitioWeb || '',
      direccion: contacto.direccion || '',
      ciudad: contacto.ciudad || '',
      provincia: contacto.provincia || '',
      codigoPostal: contacto.codigoPostal || '',
      pais: contacto.pais || 'CA',
      banco: contacto.banco || '',
      numeroCuenta: contacto.numeroCuenta || '',
      numeroRuta: contacto.numeroRuta || '',
      categoriaProductos: contacto.categoriaProductos || [],
      temperaturaEspecializada: contacto.temperaturaEspecializada || [],
      horarioDisponible: contacto.horario || '',
      diasOperacion: contacto.diasOperacion || [],
      tiempoEntrega: contacto.tiempoEntrega || '',
      metodoPago: contacto.metodoPago || [],
      notas: contacto.notas || '',
      etiquetas: contacto.etiquetas || [],
      activo: contacto.activo,
      fechaNacimiento: contacto.fechaNacimiento || '',
      genero: contacto.genero || 'Non spécifié',
      departamentosAsignados: contacto.departamentoIds && contacto.departamentoIds.length > 0 
        ? contacto.departamentoIds 
        : [contacto.departamentoId] // Compatibilidad con contactos antiguos
    });
    setModoEdicion(true);
    setContactoEditando(contacto.id);
    setDialogAbierto(true);
  };

  const handleGuardar = () => {
    // Validaciones
    if (!formulario.nombre || !formulario.apellido) {
      toast.error(t('warehouse.requiredFields'));
      return;
    }
    if (!formulario.emailPrincipal || !formulario.telefonoPrincipal) {
      toast.error(t('warehouse.requiredContact'));
      return;
    }

    if (modoEdicion && contactoEditando) {
      // Editar contacto existente
      const contactoActualizado: Partial<ContactoDepartamento> = {
        departamentoId: formulario.departamentosAsignados[0] || '1',
        departamentoIds: formulario.departamentosAsignados.length > 0 ? formulario.departamentosAsignados : ['1'],
        tipo: formulario.tipoContacto as TipoContacto,
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        numeroID: formulario.numeroID,
        imagen: formulario.imagen,
        nombreEmpresa: formulario.nombreEmpresa,
        tipoEmpresa: formulario.tipoEmpresa,
        numeroRegistro: formulario.numeroRegistro,
        numeroTVA: formulario.numeroTVA,
        email: formulario.emailPrincipal,
        emailPrincipal: formulario.emailPrincipal,
        emailSecundario: formulario.emailSecundario,
        telefono: formulario.telefonoPrincipal,
        telefonoPrincipal: formulario.telefonoPrincipal,
        telefonoSecundario: formulario.telefonoSecundario,
        sitioWeb: formulario.sitioWeb,
        direccion: formulario.direccion,
        ciudad: formulario.ciudad,
        provincia: formulario.provincia,
        codigoPostal: formulario.codigoPostal,
        pais: formulario.pais,
        banco: formulario.banco,
        numeroCuenta: formulario.numeroCuenta,
        numeroRuta: formulario.numeroRuta,
        categoriaProductos: formulario.categoriaProductos,
        temperaturaEspecializada: formulario.temperaturaEspecializada,
        horario: formulario.horarioDisponible,
        diasOperacion: formulario.diasOperacion,
        tiempoEntrega: formulario.tiempoEntrega,
        metodoPago: formulario.metodoPago,
        notas: formulario.notas,
        etiquetas: formulario.etiquetas,
        activo: formulario.activo,
        fechaNacimiento: formulario.fechaNacimiento,
        genero: formulario.genero as GeneroContacto
      };
      
      actualizarContacto(contactoEditando, contactoActualizado);
      cargarContactos();
      toast.success(t('warehouse.contactUpdated'));
      
      // Disparar evento para sincronizar con EntradaDonAchat
      window.dispatchEvent(new Event('contactos-restaurados'));
    } else {
      // Crear nuevo contacto
      const nuevoContacto: Omit<ContactoDepartamento, 'id'> = {
        departamentoId: formulario.departamentosAsignados[0] || '1', // Por defecto: Entrepôt (ID='1' según departamentosStorage.ts)
        departamentoIds: formulario.departamentosAsignados.length > 0 ? formulario.departamentosAsignados : ['1'], // Array de departamentos asignados
        tipo: formulario.tipoContacto as TipoContacto,
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        email: formulario.emailPrincipal,
        telefono: formulario.telefonoPrincipal,
        activo: formulario.activo,
        fechaIngreso: new Date().toISOString().split('T')[0],
        // Campos adicionales
        numeroID: formulario.numeroID,
        imagen: formulario.imagen,
        nombreEmpresa: formulario.nombreEmpresa,
        tipoEmpresa: formulario.tipoEmpresa,
        numeroRegistro: formulario.numeroRegistro,
        numeroTVA: formulario.numeroTVA,
        emailPrincipal: formulario.emailPrincipal,
        emailSecundario: formulario.emailSecundario,
        telefonoPrincipal: formulario.telefonoPrincipal,
        telefonoSecundario: formulario.telefonoSecundario,
        sitioWeb: formulario.sitioWeb,
        direccion: formulario.direccion,
        ciudad: formulario.ciudad,
        provincia: formulario.provincia,
        codigoPostal: formulario.codigoPostal,
        pais: formulario.pais,
        banco: formulario.banco,
        numeroCuenta: formulario.numeroCuenta,
        numeroRuta: formulario.numeroRuta,
        categoriaProductos: formulario.categoriaProductos,
        temperaturaEspecializada: formulario.temperaturaEspecializada,
        horario: formulario.horarioDisponible,
        diasOperacion: formulario.diasOperacion,
        tiempoEntrega: formulario.tiempoEntrega,
        metodoPago: formulario.metodoPago,
        notas: formulario.notas,
        etiquetas: formulario.etiquetas,
        fechaNacimiento: formulario.fechaNacimiento,
        genero: formulario.genero as GeneroContacto
      };
      
      guardarContacto(nuevoContacto);
      cargarContactos();
      toast.success(t('warehouse.contactCreated'));
      
      // Disparar evento para sincronizar con EntradaDonAchat
      window.dispatchEvent(new Event('contactos-restaurados'));
    }

    setDialogAbierto(false);
    setFormulario(formularioInicial);
  };

  const handleEliminar = (id: string) => {
    if (confirm(t('warehouse.confirmDelete'))) {
      eliminarContacto(id);
      cargarContactos();
      toast.success(t('warehouse.contactDeleted'));
      
      // Disparar evento para sincronizar con EntradaDonAchat
      window.dispatchEvent(new Event('contactos-restaurados'));
    }
  };

  // Filtrar contactos
  const contactosFiltrados = contactos.filter(contacto => {
    const matchBusqueda = busqueda === '' || 
      contacto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      contacto.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      (contacto.nombreEmpresa || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (contacto.numeroID || '').toLowerCase().includes(busqueda.toLowerCase());
    
    const matchTipo = filtroTipo === 'todos' || contacto.tipo === filtroTipo;
    
    return matchBusqueda && matchTipo;
  });

  const tipoConfig = {
    fournisseur: { icon: '📦', label: t('warehouse.supplier'), color: '#1E73BE' },
    donador: { icon: '🎁', label: t('warehouse.donor'), color: '#FF5722' },
    transportista: { icon: '🚚', label: t('warehouse.transporter'), color: '#4CAF50' },
    partenaire: { icon: '⭐', label: t('warehouse.partner'), color: '#FF9800' }
  };

  const estadisticas = {
    total: contactos.length,
    fournisseurs: contactos.filter(c => c.tipo === 'fournisseur').length,
    donadores: contactos.filter(c => c.tipo === 'donador').length,
    transportistas: contactos.filter(c => c.tipo === 'transportista').length,
    partenaires: contactos.filter(c => c.tipo === 'partenaire').length,
    activos: contactos.filter(c => c.activo).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
          >
            <Users className="w-7 h-7 inline mr-2" />
            {t('warehouse.contacts')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('warehouse.contactsDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="text-white shadow-md px-6 py-5 text-base"
                style={{ 
                  backgroundColor: branding.secondaryColor,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('warehouse.newContact')}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-500 mb-2 px-2">
                  CHOISIR LE TYPE DE FORMULAIRE
                </p>
                <DropdownMenuItem 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setTipoFormulario('express');
                    handleNuevoContacto();
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${branding.secondaryColor}15` }}
                    >
                      <Zap className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">Enregistrement Express</p>
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0" 
                          style={{ 
                            backgroundColor: `${branding.secondaryColor}20`,
                            color: branding.secondaryColor
                          }}
                        >
                          RECOMMANDÉ
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 leading-tight mb-1.5">
                        Formulaire simplifié avec 6-8 champs essentiels
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          &lt; 60 sec
                        </span>
                        <span>•</span>
                        <span>Donateurs & Fournisseurs</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setTipoFormulario('completo');
                    handleNuevoContacto();
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${branding.primaryColor}15` }}
                    >
                      <FileText className="w-5 h-5" style={{ color: branding.primaryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">Formulaire Complet</p>
                      <p className="text-xs text-gray-500 leading-tight mb-1.5">
                        Tous les champs disponibles avec 5 onglets
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>30+ champs</span>
                        <span>•</span>
                        <span>Tous les types</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mensaje informativo sobre tipos de contacto */}
      <div 
        className="p-4 rounded-lg border-l-4 bg-blue-50"
        style={{ borderColor: branding.primaryColor }}
      >
        <p className="text-sm text-gray-700">
          ℹ️ <strong>Module Entrepôt :</strong> Ce module permet de gérer les{' '}
          <span className="font-semibold">Fournisseurs</span>,{' '}
          <span className="font-semibold">Donateurs</span>,{' '}
          <span className="font-semibold">Transporteurs</span> et{' '}
          <span className="font-semibold">Partenaires</span>.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-5 gap-4">\n        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('warehouse.totalContacts')}</p>
                <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                  {estadisticas.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('warehouse.suppliers')}</p>
                <p className="text-2xl font-bold" style={{ color: '#1E73BE' }}>
                  {estadisticas.fournisseurs}
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('warehouse.donors')}</p>
                <p className="text-2xl font-bold" style={{ color: '#FF5722' }}>
                  {estadisticas.donadores}
                </p>
              </div>
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('warehouse.transporters')}</p>
                <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                  {estadisticas.transportistas}
                </p>
              </div>
              <Truck className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('warehouse.partners')}</p>
                <p className="text-2xl font-bold" style={{ color: '#FF9800' }}>
                  {estadisticas.partenaires}
                </p>
              </div>
              <Star className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('warehouse.searchContacts')}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtroTipo === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroTipo('todos')}
                style={{
                  backgroundColor: filtroTipo === 'todos' ? branding.primaryColor : undefined,
                  color: filtroTipo === 'todos' ? 'white' : undefined
                }}
              >
                {t('common.all')}
              </Button>
              <Button
                variant={filtroTipo === 'fournisseur' ? 'default' : 'outline'}
                onClick={() => setFiltroTipo('fournisseur')}
                style={{
                  backgroundColor: filtroTipo === 'fournisseur' ? '#1E73BE' : undefined,
                  color: filtroTipo === 'fournisseur' ? 'white' : undefined
                }}
              >
                📦 {t('warehouse.suppliers')}
              </Button>
              <Button
                variant={filtroTipo === 'donador' ? 'default' : 'outline'}
                onClick={() => setFiltroTipo('donador')}
                style={{
                  backgroundColor: filtroTipo === 'donador' ? '#FF5722' : undefined,
                  color: filtroTipo === 'donador' ? 'white' : undefined
                }}
              >
                🎁 {t('warehouse.donors')}
              </Button>
              <Button
                variant={filtroTipo === 'transportista' ? 'default' : 'outline'}
                onClick={() => setFiltroTipo('transportista')}
                style={{
                  backgroundColor: filtroTipo === 'transportista' ? '#4CAF50' : undefined,
                  color: filtroTipo === 'transportista' ? 'white' : undefined
                }}
              >
                🚚 {t('warehouse.transporters')}
              </Button>
              <Button
                variant={filtroTipo === 'partenaire' ? 'default' : 'outline'}
                onClick={() => setFiltroTipo('partenaire')}
                style={{
                  backgroundColor: filtroTipo === 'partenaire' ? '#FF9800' : undefined,
                  color: filtroTipo === 'partenaire' ? 'white' : undefined
                }}
              >
                ⭐ {t('warehouse.partners')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de contactos */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('warehouse.contactList')} ({contactosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('warehouse.type')}</TableHead>
                <TableHead>{t('warehouse.contact')}</TableHead>
                <TableHead>{t('warehouse.company')}</TableHead>
                <TableHead>{t('warehouse.phone')}</TableHead>
                <TableHead>{t('warehouse.email')}</TableHead>
                <TableHead>{t('warehouse.location')}</TableHead>
                <TableHead>{t('warehouse.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactosFiltrados.map((contacto) => {
                const config = tipoConfig[contacto.tipo as 'fournisseur' | 'donador' | 'transportista' | 'partenaire'];
                // Filtro defensivo: si el tipo no está en la configuración, no renderizar
                if (!config) return null;
                
                return (
                  <TableRow key={contacto.id}>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                          border: `1px solid ${config.color}50`
                        }}
                      >
                        {config.icon} {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: config.color }}
                        >
                          {contacto.nombre.charAt(0)}{contacto.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{contacto.nombre} {contacto.apellido}</p>
                          <p className="text-xs text-gray-500">{contacto.numeroID || '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contacto.nombreEmpresa || '-'}</p>
                        {contacto.numeroRegistro && (
                          <p className="text-xs text-gray-500">{contacto.numeroRegistro}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {contacto.telefonoPrincipal || contacto.telefono || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {contacto.emailPrincipal || contacto.email || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {contacto.ciudad || '-'}, {contacto.provincia || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={contacto.activo ? 'default' : 'secondary'}
                        style={{
                          backgroundColor: contacto.activo ? `${branding.secondaryColor}20` : '#DC354520',
                          color: contacto.activo ? branding.secondaryColor : '#DC3545'
                        }}
                      >
                        {contacto.activo ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditarContacto(contacto)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleEliminar(contacto.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formularios - Renderizado condicional según tipo seleccionado */}
      {tipoFormulario === 'express' ? (
        <FormularioContactoExpress
          abierto={dialogAbierto}
          onCerrar={() => {
            setDialogAbierto(false);
            setFormulario(formularioInicial);
          }}
          formulario={formulario}
          setFormulario={setFormulario}
          onGuardar={handleGuardar}
          modoEdicion={modoEdicion}
        />
      ) : (
        <FormularioContactoEntrepotCompacto
          abierto={dialogAbierto}
          onCerrar={() => {
            setDialogAbierto(false);
            setFormulario(formularioInicial);
          }}
          formulario={formulario}
          setFormulario={setFormulario}
          onGuardar={handleGuardar}
          modoEdicion={modoEdicion}
        />
      )}
    </div>
  );
}