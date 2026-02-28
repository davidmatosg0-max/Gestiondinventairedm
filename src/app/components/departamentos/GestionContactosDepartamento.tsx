import React, { useState, useEffect, useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  User,
  UserCheck,
  Building,
  Filter,
  X,
  Eye,
  Languages,
  Camera,
  Heart,
  Star,
  ShieldPlus,
  Stethoscope,
  Building2,
  UserPlus,
  FileUp,
  Download,
  Upload,
  Settings,
  Link,
  RefreshCw,
  Shield
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Checkbox } from '../ui/checkbox';
import { LanguageSelector } from '../ui/language-selector';
import {
  obtenerContactosDepartamento,
  guardarContacto,
  actualizarContacto,
  eliminarContacto,
  contarContactosPorTipo,
  migrarContactosDesdeEntrepot,
  type ContactoDepartamento,
  type TipoContacto,
  type IdiomaContacto,
  type GeneroContacto,
  type DisponibilidadDia
} from '../../utils/contactosDepartamentoStorage';
import {
  obtenerIdiomasPersonalizados,
  guardarIdiomaPersonalizado,
  eliminarIdiomaPersonalizado,
  existeCodigoIdioma,
  type IdiomaPersonalizado
} from '../../utils/idiomasPersonalizadosStorage';
import { obtenerTiposContacto } from '../../utils/tiposContactoStorage';
import { FormularioContactoCompacto } from './FormularioContactoCompacto';
import { CalendarioContactos } from './CalendarioContactos';
import { AsignarRolContacto } from '../AsignarRolContacto';

// Mapeo de iconos para tipos personalizados
const ICON_MAP: Record<string, any> = {
  User, UserCheck, UserPlus, Users, Heart, Star,
  Building, Building2, Briefcase, Stethoscope,
  ShieldPlus, Eye, Phone, Mail, MapPin, Calendar
};

interface GestionContactosDepartamentoProps {
  departamentoId: string;
  departamentoNombre: string;
}

export function GestionContactosDepartamento({ departamentoId, departamentoNombre }: GestionContactosDepartamentoProps) {
  const branding = useBranding();
  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [dialogDetalle, setDialogDetalle] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<ContactoDepartamento | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoContacto | 'todos'>('todos');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para idiomas personalizados
  const [idiomasPersonalizados, setIdiomasPersonalizados] = useState<IdiomaPersonalizado[]>([]);
  const [dialogNuevoIdioma, setDialogNuevoIdioma] = useState(false);
  const [nuevoIdioma, setNuevoIdioma] = useState({ code: '', label: '', flag: '', color: branding.primaryColor });

  // Estados para asignación de voluntarios existentes
  const [dialogAsignarBenevole, setDialogAsignarBenevole] = useState(false);
  const [busquedaBenevole, setBusquedaBenevole] = useState('');
  const [benevolesDisponibles, setBenevolesDisponibles] = useState<any[]>([]);

  // Estado para editar departamentos
  const [dialogEditarDepartamentos, setDialogEditarDepartamentos] = useState(false);
  const [departamentosEditando, setDepartamentosEditando] = useState<string[]>([]);

  // NUEVO: Estados para asignar rol y acceso al sistema
  const [dialogAsignarRolOpen, setDialogAsignarRolOpen] = useState(false);
  const [contactoParaRol, setContactoParaRol] = useState<{
    id: string;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
    cargo: string;
    modulo: 'organismo' | 'benevole' | 'donador' | 'vendedor';
  } | null>(null);

  const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Roles disponibles del sistema
  const rolesDisponibles = [
    {
      id: 'admin',
      nombre: 'Administrateur',
      descripcion: 'Accès complet à toutes les fonctionnalités du système',
      color: '#DC3545'
    },
    {
      id: 'coordinador',
      nombre: 'Coordinateur',
      descripcion: 'Gestion de l\'inventaire, des commandes et des organismes',
      color: '#FF9800'
    },
    {
      id: 'benevole',
      nombre: 'Bénévole',
      descripcion: 'Accès limité aux fonctions assignées',
      color: '#9C27B0'
    },
    {
      id: 'responsable-departement',
      nombre: 'Responsable de Département',
      descripcion: 'Gestion d\'un département spécifique',
      color: branding.primaryColor
    }
  ];

  // NUEVO: Definir tipos de contacto disponibles según el departamento
  const getTiposPermitidos = (): TipoContacto[] => {
    // TODOS los departamentos ahora tienen acceso a TODOS los tipos de contacto
    return ['donador', 'fournisseur', 'benevole', 'responsable-sante', 'partenaire', 'visiteur', 'employe'];
  };

  const tiposPermitidos = getTiposPermitidos();

  const [formulario, setFormulario] = useState<Omit<ContactoDepartamento, 'id'>>({
    departamentoId,
    departamentoIds: [departamentoId], // Inicializar con el departamento actual seleccionado
    tipo: 'benevole',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    genero: 'Non spécifié',
    email: '',
    telefono: '',
    cargo: '',
    disponibilidad: '',
    disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: false })),
    notas: '',
    activo: true,
    fechaIngreso: new Date().toISOString().split('T')[0],
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    numeroEmpleado: '',
    horario: '',
    heuresSemaines: 0,
    reference: '',
    supervisor: '',
    especialidad: '',
    certificaciones: [],
    idiomas: [],
    foto: '',
    documents: []
  });

  useEffect(() => {
    // Inicializar tipos de contacto predeterminados (si es primera vez)
    obtenerTiposContacto(); // Esto ejecuta la función de inicialización automáticamente
    cargarContactos();
    cargarIdiomasPersonalizados();
    cargarBenevolesDisponibles();
  }, [departamentoId]);

  const cargarContactos = () => {
    const contactosData = obtenerContactosDepartamento(departamentoId);
    setContactos(contactosData);
  };

  const cargarIdiomasPersonalizados = () => {
    const idiomasData = obtenerIdiomasPersonalizados();
    setIdiomasPersonalizados(idiomasData);
  };

  const cargarBenevolesDisponibles = () => {
    // Obtener voluntarios desde localStorage (donde se guardan en le módulo Benevoles)
    const benevolesData = localStorage.getItem('benevoles');
    if (benevolesData) {
      try {
        const benevoles = JSON.parse(benevolesData);
        setBenevolesDisponibles(benevoles);
      } catch (error) {
        console.error('Error al cargar benevoles:', error);
      }
    }
  };

  // Función para obtener en qué departamentos está asignado un voluntario
  const obtenerDepartamentosAsignados = (email: string): string[] => {
    const departamentosAsignados: string[] = [];
    
    // Buscar en todos les departamentos
    const departamentosIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    departamentosIds.forEach(deptId => {
      const contactosDept = obtenerContactosDepartamento(deptId);
      const yaAsignado = contactosDept.some(c => c.email === email && c.tipo === 'benevole');
      if (yaAsignado) {
        // Obtener le nom du département
        const nombresDepts: { [key: string]: string } = {
          '1': 'Direction',
          '2': 'Entrepôt',
          '3': 'Achats',
          '4': 'Comptoir',
          '5': 'Finance',
          '6': 'Communication',
          '7': 'Recrutement',
          '8': 'Transport',
          '9': 'Qualité',
          '10': 'IT'
        };
        departamentosAsignados.push(nombresDepts[deptId] || `Dept ${deptId}`);
      }
    });
    
    return departamentosAsignados;
  };

  const abrirDialogoAsignarBenevole = () => {
    cargarBenevolesDisponibles();
    setBusquedaBenevole('');
    setDialogAsignarBenevole(true);
  };

  const asignarBenevoleExistente = (benevole: any) => {
    // Verificar si el voluntario ya está asignado a este departamento
    const yaAsignado = contactos.some(c => 
      c.email === benevole.email && c.tipo === 'benevole'
    );

    if (yaAsignado) {
      toast.error('Ce bénévole est déjà assigné à ce département');
      return;
    }

    // Crear contacto basado en le voluntario existente
    const nuevoContacto: Omit<ContactoDepartamento, 'id'> = {
      departamentoId,
      tipo: 'benevole',
      nombre: benevole.nom || benevole.nombre || '',
      apellido: benevole.prenom || benevole.apellido || '',
      fechaNacimiento: benevole.dateNaissance || benevole.fechaNacimiento || '',
      genero: benevole.sexe || benevole.genero || 'Non spécifié',
      email: benevole.email || '',
      telefono: benevole.telephone || benevole.telefono || '',
      cargo: benevole.poste || benevole.cargo || '',
      disponibilidad: benevole.disponibilites || benevole.disponibilidad || '',
      disponibilidades: benevole.disponibilidadesSemanal || benevole.joursDisponibles?.map((j: any) => ({
        jour: j.jour,
        am: j.am || false,
        pm: j.pm || false
      })) || diasSemana.map(jour => ({ jour, am: false, pm: false })),
      notas: benevole.notasGenerales || benevole.notas || '',
      activo: benevole.statut === 'actif',
      fechaIngreso: benevole.dateInscription || benevole.fechaIngreso || new Date().toISOString().split('T')[0],
      direccion: benevole.adresse || benevole.direccion || '',
      ciudad: benevole.ville || benevole.ciudad || '',
      codigoPostal: benevole.codePostal || benevole.codigoPostal || '',
      numeroEmpleado: '',
      horario: '',
      heuresSemaines: benevole.heuresSemaines || 0,
      reference: benevole.reference || '',
      supervisor: '',
      especialidad: '',
      certificaciones: [],
      idiomas: benevole.langues || benevole.idiomas || [],
      foto: benevole.photo || benevole.foto || '',
      documents: benevole.documents || []
    };

    guardarContacto(nuevoContacto);
    toast.success(`Bénévole ${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido} assigné avec succès`);
    cargarContactos();
    setDialogAsignarBenevole(false);
  };

  const abrirDialogoNuevo = () => {
    limpiarFormulario();
    setDialogAbierto(true);
  };

  const abrirDialogoEditar = (contacto: ContactoDepartamento) => {
    setFormulario(contacto);
    setContactoSeleccionado(contacto);
    setModoEdicion(true);
    setFotoPreview(contacto.foto || null);
    setDialogAbierto(true);
  };

  const abrirDialogoDetalle = (contacto: ContactoDepartamento) => {
    setContactoSeleccionado(contacto);
    setDialogDetalle(true);
  };

  const limpiarFormulario = () => {
    setFormulario({
      departamentoId,
      departamentoIds: [departamentoId],
      tipo: 'benevole',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      genero: 'Non spécifié',
      email: '',
      telefono: '',
      cargo: '',
      disponibilidad: '',
      disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: false })),
      notas: '',
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0],
      direccion: '',
      ciudad: '',
      codigoPostal: '',
      numeroEmpleado: '',
      horario: '',
      heuresSemaines: 0,
      reference: '',
      supervisor: '',
      especialidad: '',
      certificaciones: [],
      idiomas: [],
      foto: '',
      documents: []
    });
    setModoEdicion(false);
    setContactoSeleccionado(null);
    setFotoPreview(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFotoPreview(result);
        setFormulario({ ...formulario, foto: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = () => {
    if (!formulario.nombre.trim() || !formulario.apellido.trim()) {
      toast.error('Le nom et prénom sont obligatoires');
      return;
    }

    // Validar que al menos un departamento esté seleccionado
    if (!formulario.departamentoIds || formulario.departamentoIds.length === 0) {
      toast.error('⚠️ Vous devez sélectionner au moins un département');
      return;
    }

    if (modoEdicion && contactoSeleccionado) {
      actualizarContacto(contactoSeleccionado.id, formulario);
      toast.success('Contact mis à jour avec succès');
    } else {
      // Si el contacto tiene departamentoIds (múltiples departamentos seleccionados)
      if (formulario.departamentoIds && formulario.departamentoIds.length > 0) {
        // Guardar el contacto en cada departamento seleccionado
        formulario.departamentoIds.forEach((deptId) => {
          const contactoParaDept = {
            ...formulario,
            departamentoId: deptId, // Asignar el departamento específico
            departamentoIds: formulario.departamentoIds // Mantener la lista de todos los departamentos
          };
          guardarContacto(contactoParaDept);
        });
        toast.success(`Contact créé dans ${formulario.departamentoIds.length} département(s)`);
      } else {
        // Si no hay departamentoIds, guardar normalmente en el departamento actual
        guardarContacto(formulario);
        toast.success('Contact créé avec succès');
      }
    }

    cargarContactos();
    setDialogAbierto(false);
    limpiarFormulario();
  };

  const handleEliminar = () => {
    if (contactoSeleccionado) {
      eliminarContacto(contactoSeleccionado.id);
      toast.success('Contact supprimé avec succès');
      cargarContactos();
      setDialogEliminar(false);
      setContactoSeleccionado(null);
    }
  };

  const toggleIdioma = (idioma: IdiomaContacto) => {
    const idiomasActuales = formulario.idiomas || [];
    const nuevosIdiomas = idiomasActuales.includes(idioma)
      ? idiomasActuales.filter(i => i !== idioma)
      : [...idiomasActuales, idioma];
    setFormulario({ ...formulario, idiomas: nuevosIdiomas });
  };

  const updateDisponibilidad = (index: number, field: 'am' | 'pm', value: boolean) => {
    setFormulario(prev => {
      const nuevasDisponibilidades = [...(prev.disponibilidades || [])];
      nuevasDisponibilidades[index] = { ...nuevasDisponibilidades[index], [field]: value };
      return { ...prev, disponibilidades: nuevasDisponibilidades };
    });
  };

  const contactosFiltrados = contactos.filter(contacto => {
    // Filtrar solo contactos activos
    if (!contacto.activo) return false;
    
    const searchText = busqueda.toLowerCase();
    const matchBusqueda = busqueda === '' || 
      `${contacto.nombre} ${contacto.apellido}`.toLowerCase().includes(searchText) ||
      (contacto.nombreEmpresa || '').toLowerCase().includes(searchText) ||
      contacto.email.toLowerCase().includes(searchText) ||
      contacto.telefono.includes(busqueda);
    
    const matchTipo = tipoFiltro === 'todos' || contacto.tipo === tipoFiltro;
    
    return matchBusqueda && matchTipo;
  });

  const estadisticas = contarContactosPorTipo(departamentoId);

  const getTipoConfig = (tipo: TipoContacto) => {
    // Primero buscar en tipos personalizados creados por el usuario
    const tiposPersonalizados = obtenerTiposContacto();
    const tipoPersonalizado = tiposPersonalizados.find(t => t.code === tipo);
    
    if (tipoPersonalizado) {
      const IconComponent = ICON_MAP[tipoPersonalizado.icon] || User;
      return {
        color: tipoPersonalizado.color,
        icon: IconComponent,
        label: tipoPersonalizado.label,
        bgColor: tipoPersonalizado.bgColor
      };
    }
    
    // Si no existe en personalizados, usar configuración predeterminada
    const configs = {
      donador: { 
        color: '#FCD34D', 
        icon: Heart, 
        label: 'Donateur de la Banque',
        bgColor: '#FEF3C7'
      },
      fournisseur: { 
        color: branding.primaryColor, 
        icon: Building2, 
        label: 'Fournisseur',
        bgColor: '#DBEAFE'
      },
      benevole: { 
        color: '#9CA3AF', 
        icon: UserCheck, 
        label: 'Bénévole / Professionnel administratif',
        bgColor: '#F3F4F6'
      },
      'responsable-sante': { 
        color: '#EC4899', 
        icon: Stethoscope, 
        label: 'Responsable de Santé Alimentaire',
        bgColor: '#FCE7F3'
      },
      partenaire: { 
        color: '#F59E0B', 
        icon: Star, 
        label: 'Partenaire / Bénévole informel',
        bgColor: '#FEF3C7'
      },
      visiteur: { 
        color: branding.secondaryColor, 
        icon: UserPlus, 
        label: 'Visitante ou Invité',
        bgColor: '#D1FAE5'
      },
      employe: { 
        color: '#65A30D', 
        icon: User, 
        label: 'Employé',
        bgColor: '#ECF9EE'
      }
    };
    return configs[tipo] || {
      color: branding.primaryColor,
      icon: User,
      label: tipo,
      bgColor: '#F3F4F6'
    };
  };

  const handleMigrarContactos = () => {
    if (confirm('🔄 Voulez-vous migrer les contacts depuis l\'ancien système?\n\nCeci va transférer tous les donateurs et fournisseurs au nouveau système de Gestion des Contacts.')) {
      const resultado = migrarContactosDesdeEntrepot();
      
      if (resultado.migrados > 0) {
        cargarContactos();
        toast.success(`✅ Migration réussie! ${resultado.migrados} contact(s) migré(s).`);
        
        // Disparer evento personalizado
        window.dispatchEvent(new CustomEvent('contactos-migrados', { 
          detail: { departamentoId, migrados: resultado.migrados } 
        }));
      } else {
        toast.info('ℹ️ Aucun contact à migrer.');
      }
      
      if (resultado.errores > 0) {
        toast.error(`⚠️ ${resultado.errores} erreur(s) lors de la migration.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="card-glass rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#333333] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Users className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Gestion des Contacts - {departamentoNombre}
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              Gérez tous les contacts du département ({contactos.length} contacts)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={abrirDialogoAsignarBenevole}
              className="text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Link className="w-4 h-4 mr-2" />
              Assigner un bénévole
            </Button>
            <Button
              onClick={abrirDialogoNuevo}
              className="text-white"
              style={{ backgroundColor: branding.secondaryColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Contact
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(estadisticas)
            .filter(([tipo]) => tiposPermitidos.includes(tipo as TipoContacto))
            .map(([tipo, count]) => {
            const config = getTipoConfig(tipo as TipoContacto);
            const Icon = config.icon;
            return (
              <Card key={tipo} className="p-3 border-l-4" style={{ borderLeftColor: config.color }}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: config.bgColor }}>
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-[#666666] truncate">{config.label.split(' /')[0]}</p>
                    <p className="text-xl font-bold" style={{ color: config.color }}>{count}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs: Lista y Calendario */}
      <Tabs defaultValue="liste" className="w-full">
        <div className="card-glass rounded-2xl shadow-xl p-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="liste" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Liste des Contacts
            </TabsTrigger>
            <TabsTrigger value="calendrier" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendrier Horaires
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Liste */}
        <TabsContent value="liste" className="space-y-4 mt-0">
          {/* Búsqueda y filtros */}
          <div className="card-glass rounded-2xl shadow-xl p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={tipoFiltro === 'todos' ? 'default' : 'outline'}
                  onClick={() => setTipoFiltro('todos')}
                  size="sm"
                  style={tipoFiltro === 'todos' ? { backgroundColor: branding.primaryColor } : {}}
                >
                  Tous ({contactos.filter(c => c.activo).length})
                </Button>
                {Object.entries(estadisticas)
                  .filter(([tipo]) => tiposPermitidos.includes(tipo as TipoContacto))
                  .map(([tipo, count]) => {
                  const config = getTipoConfig(tipo as TipoContacto);
                  return (
                    <Button
                      key={tipo}
                      variant={tipoFiltro === tipo ? 'default' : 'outline'}
                      onClick={() => setTipoFiltro(tipo as TipoContacto)}
                      size="sm"
                      style={tipoFiltro === tipo ? { backgroundColor: config.color } : {}}
                    >
                      {config.label.split(' ')[0]} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lista de contactos */}
          <div className="card-glass rounded-2xl shadow-xl p-6">
            {contactosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
                <p className="text-[#666666] text-lg">Aucun contact trouvé</p>
                <p className="text-[#999999] text-sm mt-2">Créez un nouveau contact pour commencer</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contactosFiltrados.map((contacto) => {
                  const config = getTipoConfig(contacto.tipo);
                  const Icon = config.icon;
                  return (
                    <Card key={contacto.id} className="p-4 hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: config.color }}>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: config.color }}>
                          {contacto.foto ? (
                            <img src={contacto.foto} alt={`${contacto.nombre} ${contacto.apellido}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                              <User className="w-6 h-6" style={{ color: config.color }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#333333] truncate">
                              {(contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa 
                                ? contacto.nombreEmpresa 
                                : `${contacto.nombre} ${contacto.apellido}`}
                            </h3>
                            <Badge className="text-xs" style={{ backgroundColor: config.color, color: 'white' }}>
                              <Icon className="w-3 h-3 mr-1" />
                              {config.label.split(' ')[0]}
                            </Badge>
                          </div>
                          {/* Mostrar persona de contacto si es empresa */}
                          {(contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa && (contacto.nombre || contacto.apellido) && (
                            <p className="text-xs text-[#666666] mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Contact: {contacto.nombre} {contacto.apellido}
                            </p>
                          )}
                          {contacto.cargo && (
                            <p className="text-xs text-[#666666] mb-1">{contacto.cargo}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-[#999999] mb-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{contacto.email}</span>
                          </div>
                          {contacto.telefono && (
                            <div className="flex items-center gap-1 text-xs text-[#999999] mb-2">
                              <Phone className="w-3 h-3" />
                              <span>{contacto.telefono}</span>
                            </div>
                          )}
                          {contacto.idiomas && contacto.idiomas.length > 0 && (
                            <div className="flex gap-1 mb-2">
                              {contacto.idiomas.map(idioma => (
                                <Badge key={idioma} variant="outline" className="text-xs">
                                  {idioma.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirDialogoDetalle(contacto)}
                          className="flex-1"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" style={{ color: branding.primaryColor }} />
                          Voir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContactoParaRol({
                              id: contacto.id.toString(),
                              nombre: contacto.nombre,
                              apellido: contacto.apellido,
                              nombreCompleto: `${contacto.nombre} ${contacto.apellido}`,
                              email: contacto.email,
                              telefono: contacto.telefono || '',
                              cargo: contacto.cargo || 'Contact',
                              modulo: contacto.tipo === 'benevole' ? 'benevole' : contacto.tipo === 'donador' ? 'donador' : 'vendedor'
                            });
                            setDialogAsignarRolOpen(true);
                          }}
                          title="Créer un accès au système"
                        >
                          <Shield className="w-3.5 h-3.5" style={{ color: '#9C27B0' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirDialogoEditar(contacto)}
                        >
                          <Edit2 className="w-3.5 h-3.5" style={{ color: branding.primaryColor }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContactoSeleccionado(contacto);
                            setDialogEliminar(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: '#c23934' }} />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Calendario */}
        <TabsContent value="calendrier" className="mt-0">
          <CalendarioContactos
            contactos={contactos}
            onVerDetalle={abrirDialogoDetalle}
            getTipoConfig={getTipoConfig}
            departamentoNombre={departamentoNombre}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog Crear/Editar - FORMULARIO COMPACTO */}
      <FormularioContactoCompacto
        abierto={dialogAbierto}
        onCerrar={() => {
          setDialogAbierto(false);
          limpiarFormulario();
        }}
        formulario={formulario}
        setFormulario={setFormulario}
        modoEdicion={modoEdicion}
        onGuardar={handleGuardar}
        fotoPreview={fotoPreview}
        onFotoChange={handleFotoChange}
        getTipoConfig={getTipoConfig}
        updateDisponibilidad={updateDisponibilidad}
        tiposPermitidos={tiposPermitidos}
        departamentoId={departamentoId}
      />

      {/* Dialog Detalles */}
      <Dialog open={dialogDetalle} onOpenChange={setDialogDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="contact-detail-description">
          <DialogHeader>
            <DialogTitle>Détails du contact</DialogTitle>
            <DialogDescription id="contact-detail-description">
              Informations complètes du contact sélectionné
            </DialogDescription>
          </DialogHeader>
          {contactoSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4" style={{ borderColor: getTipoConfig(contactoSeleccionado.tipo).color }}>
                  {contactoSeleccionado.foto ? (
                    <img src={contactoSeleccionado.foto} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{contactoSeleccionado.nombre} {contactoSeleccionado.apellido}</h3>
                  <Badge style={{ backgroundColor: getTipoConfig(contactoSeleccionado.tipo).color }}>
                    {getTipoConfig(contactoSeleccionado.tipo).label}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {contactoSeleccionado.email && (
                  <div>
                    <span className="font-semibold">Email:</span>
                    <p>{contactoSeleccionado.email}</p>
                  </div>
                )}
                {contactoSeleccionado.telefono && (
                  <div>
                    <span className="font-semibold">Téléphone:</span>
                    <p>{contactoSeleccionado.telefono}</p>
                  </div>
                )}
                {contactoSeleccionado.cargo && (
                  <div>
                    <span className="font-semibold">Poste:</span>
                    <p>{contactoSeleccionado.cargo}</p>
                  </div>
                )}
                {contactoSeleccionado.fechaNacimiento && (
                  <div>
                    <span className="font-semibold">Date de Naissance:</span>
                    <p>{new Date(contactoSeleccionado.fechaNacimiento).toLocaleDateString('fr-CA')}</p>
                  </div>
                )}
                {contactoSeleccionado.genero && (
                  <div>
                    <span className="font-semibold">Genre:</span>
                    <p>{contactoSeleccionado.genero}</p>
                  </div>
                )}
                {contactoSeleccionado.direccion && (
                  <div className="col-span-2">
                    <span className="font-semibold">Adresse:</span>
                    <p>{contactoSeleccionado.direccion}</p>
                    {contactoSeleccionado.ciudad && <p>{contactoSeleccionado.ciudad}, {contactoSeleccionado.codigoPostal}</p>}
                  </div>
                )}
              </div>

              {contactoSeleccionado.idiomas && contactoSeleccionado.idiomas.length > 0 && (
                <div>
                  <span className="font-semibold text-sm">Langues:</span>
                  <div className="flex gap-2 mt-1">
                    {contactoSeleccionado.idiomas.map(idioma => (
                      <Badge key={idioma} variant="outline">{idioma.toUpperCase()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {contactoSeleccionado.notas && (
                <div>
                  <span className="font-semibold text-sm">Notes:</span>
                  <p className="text-sm mt-1 p-3 bg-[#F9FAFB] rounded">{contactoSeleccionado.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog open={dialogEliminar} onOpenChange={setDialogEliminar}>
        <DialogContent aria-describedby="delete-confirmation-description">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription id="delete-confirmation-description">
              Cette action est irréversible. Le contact sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer ce contact ?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDialogEliminar(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleEliminar}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Asignar Bénévole Existente */}
      <Dialog open={dialogAsignarBenevole} onOpenChange={setDialogAsignarBenevole}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Assigner un bénévole existant
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un bénévole enregistré dans le système pour l'assigner à ce département
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                placeholder="Rechercher un bénévole par nom, prénom ou email..."
                value={busquedaBenevole}
                onChange={(e) => setBusquedaBenevole(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de voluntarios */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {benevolesDisponibles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
                  <p className="text-[#666666] text-lg">Aucun bénévole trouvé</p>
                  <p className="text-[#999999] text-sm mt-2">Les bénévoles doivent être créés depuis le module de Gestion des Bénévoles</p>
                </div>
              ) : (
                benevolesDisponibles
                  .filter(b => {
                    const searchLower = busquedaBenevole.toLowerCase();
                    return (
                      busquedaBenevole === '' ||
                      (b.nom || b.nombre || '').toLowerCase().includes(searchLower) ||
                      (b.prenom || b.apellido || '').toLowerCase().includes(searchLower) ||
                      (b.email || '').toLowerCase().includes(searchLower) ||
                      (b.departement || b.departamento || '').toLowerCase().includes(searchLower)
                    );
                  })
                  .map((benevole) => {
                    const departamentosAsignados = obtenerDepartamentosAsignados(benevole.email);
                    const yaAsignadoAqui = departamentosAsignados.includes(departamentoNombre);
                    
                    return (
                    <Card key={benevole.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => asignarBenevoleExistente(benevole)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: branding.primaryColor }}>
                          {(benevole.photo || benevole.foto) ? (
                            <img src={benevole.photo || benevole.foto} alt={`${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#333333]">
                              {benevole.nom || benevole.nombre} {benevole.prenom || benevole.apellido}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: benevole.statut === 'actif' ? branding.secondaryColor : '#999999',
                                color: benevole.statut === 'actif' ? branding.secondaryColor : '#999999'
                              }}
                            >
                              {benevole.statut || 'actif'}
                            </Badge>
                            {yaAsignadoAqui && (
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: '#FCD34D',
                                  color: '#78350F'
                                }}
                              >
                                Déjà assigné ici
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#666666] mb-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {benevole.email}
                            </span>
                            {(benevole.telephone || benevole.telefono) && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {benevole.telephone || benevole.telefono}
                              </span>
                            )}
                            {(benevole.departement || benevole.departamento) && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {benevole.departement || benevole.departamento}
                              </span>
                            )}
                          </div>
                          {departamentosAsignados.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#999999]">
                              <Users className="w-3 h-3" />
                              <span>Travaille aussi dans: {departamentosAsignados.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            asignarBenevoleExistente(benevole);
                          }}
                          disabled={yaAsignadoAqui}
                          style={{ backgroundColor: yaAsignadoAqui ? '#CCCCCC' : branding.primaryColor }}
                          className="text-white"
                        >
                          <Link className="w-4 h-4 mr-1" />
                          {yaAsignadoAqui ? 'Assigné' : 'Assigner'}
                        </Button>
                      </div>
                    </Card>
                  );
                  })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Asignar Rol a Contacto */}
      {contactoParaRol && (
        <AsignarRolContacto
          open={dialogAsignarRolOpen}
          onOpenChange={setDialogAsignarRolOpen}
          contacto={contactoParaRol}
          rolesDisponibles={rolesDisponibles}
          onGuardar={(datosAcceso) => {
            console.log('✅ Accès créé pour contact:', datosAcceso);
            toast.success(`🔐 Accès au système créé pour ${contactoParaRol.nombreCompleto}!`);
            setContactoParaRol(null);
          }}
        />
      )}
    </div>
  );
}