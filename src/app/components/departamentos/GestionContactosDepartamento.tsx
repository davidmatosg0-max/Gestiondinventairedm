import React, { useState, useEffect, useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { validateImageFile, readFileAsDataURL } from '../../utils/fileValidation';
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
  Shield,
  Database,
  HardDrive
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
  diagnosticarContactos,
  repararContactosConProblemas,
  obtenerInfoAlmacenamiento,
  eliminarTodasLasFotos,
  eliminarTodosLosDocumentos,
  optimizarTodosLosContactos,
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

  // Estados para asignación de voluntarios existents
  const [dialogAsignarBenevole, setDialogAsignarBenevole] = useState(false);
  const [busquedaBenevole, setBusquedaBenevole] = useState('');
  const [benevolesDisponibles, setBenevolesDisponibles] = useState<any[]>([]);

  // Estado para editar departamentos
  const [dialogEditarDepartamentos, setDialogEditarDepartamentos] = useState(false);
  const [departamentosEditando, setDepartamentosEditando] = useState<string[]>([]);

  // NUEVO: Estados para asignar rol y acceso al système
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

  // Estados para modal de diagnóstico
  const [dialogDiagnostico, setDialogDiagnostico] = useState(false);
  const [diagnosticoResultado, setDiagnosticoResultado] = useState<{
    total: number;
    porDepartamento: { [key: string]: any[] };
    problemas: {
      sinActivo: any[];
      inactivos: any[];
      sinDepartamento: any[];
    };
  } | null>(null);

  // Estados para modal de información de almacenamiento
  const [dialogAlmacenamiento, setDialogAlmacenamiento] = useState(false);

  const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Roles disponibles du système
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

  // NUEVO: Definir types de contacto disponibles selon le département
  const getTiposPermitidos = (): TipoContacto[] => {
    // Obtener tipos de contacto creados para este departamento (incluye globales + específicos del departamento)
    const tiposCreados = obtenerTiposContacto(departamentoId);
    
    // Si no hay tipos creados, devolver array vacío
    if (tiposCreados.length === 0) {
      return [];
    }
    
    // Devolver los códigos de todos los tipos creados
    return tiposCreados.map(tipo => tipo.code as TipoContacto);
  };

  const tiposPermitidos = getTiposPermitidos();

  const [formulario, setFormulario] = useState<Omit<ContactoDepartamento, 'id'>>({
    departamentoId,
    departamentoIds: [departamentoId], // Initialiser avec le département actuel sélectionné
    tipo: tiposPermitidos[0] || 'employe', // Usar el primer tipo disponible o 'employe' por defecto
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
    // Initialiser les types de contact par défaut (si première fois)
    obtenerTiposContacto(departamentoId); // Cargar tipos globales + específicos del departamento
    cargarContactos();
    cargarIdiomasPersonalizados();
    cargarBenevolesDisponibles();
  }, [departamentoId]);

  const cargarContactos = () => {
    const contactosData = obtenerContactosDepartamento(departamentoId);
    console.log('🔍 DEBUG - Contactos cargados pour département', departamentoId, ':', contactosData);
    console.log('🔍 DEBUG - Total contactos:', contactosData.length);
    contactosData.forEach(c => {
      console.log(`  - ${c.nombre} ${c.apellido} (tipo: ${c.tipo}, activo: ${c.activo}, deptId: ${c.departamentoId})`);
    });
    setContactos(contactosData);
    
    // 🚨 DIAGNÓSTICO ADICIONAL: Verificar localStorage directamente
    const allContactosRaw = localStorage.getItem('contactos_departamento');
    if (allContactosRaw) {
      const allContactos = JSON.parse(allContactosRaw);
      console.log(`📦 DEBUG - Total contactos en localStorage: ${allContactos.length}`);
      console.log('📦 DEBUG - Contactos por departamento:');
      const byDept: any = {};
      allContactos.forEach((c: any) => {
        if (!byDept[c.departamentoId]) byDept[c.departamentoId] = [];
        byDept[c.departamentoId].push(`${c.nombre} ${c.apellido} (${c.tipo}, activo:${c.activo})`);
      });
      Object.entries(byDept).forEach(([dept, contacts]: [string, any]) => {
        console.log(`  📁 Dept ${dept}: ${contacts.length} contactos`);
        contacts.forEach((c: any) => console.log(`    ${c}`));
      });
    }
  };

  const cargarIdiomasPersonalizados = () => {
    const idiomasData = obtenerIdiomasPersonalizados();
    setIdiomasPersonalizados(idiomasData);
  };

  const cargarBenevolesDisponibles = () => {
    // Obtenir les bénévoles depuis localStorage (où ils sont stockés dans le module Benevoles)
    const benevolesData = localStorage.getItem('benevoles');
    if (benevolesData) {
      try {
        const benevoles = JSON.parse(benevolesData);
        setBenevolesDisponibles(benevoles);
      } catch (error) {
        console.error('Erreur lors du chargement des bénévoles:', error);
      }
    }
  };

  // Fonction pour obtenir dans quels départements un bénévole est assigné
  const obtenerDepartamentosAsignados = (email: string): string[] => {
    const departamentosAsignados: string[] = [];
    
    // Rechercher dans tous les départements
    const departamentosIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    departamentosIds.forEach(deptId => {
      const contactosDept = obtenerContactosDepartamento(deptId);
      const yaAsignado = contactosDept.some(c => c.email === email && c.tipo === 'benevole');
      if (yaAsignado) {
        // Obtenir le nom du département
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
    // Vérifier si le bénévole est déjà assigné à ce département
    const yaAsignado = contactos.some(c => 
      c.email === benevole.email && c.tipo === 'benevole'
    );

    if (yaAsignado) {
      toast.error('Ce bénévole est déjà assigné à ce département');
      return;
    }

    // Créer un contact basé sur le bénévole existant
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

    try {
      const contactoGuardado = guardarContacto(nuevoContacto);
      toast.success(`Bénévole ${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido} assigné avec succès`);
      
      // ✅ SOLUCIÓN DEFINITIVA: Agregar el contacto inmediatamente al estado
      setContactos(prevContactos => [...prevContactos, contactoGuardado]);
      
      setDialogAsignarBenevole(false);
    } catch (error) {
      console.error('❌ Error al asignar bénévole:', error);
      toast.error('Espace de stockage insuffisant. Veuillez supprimer des contacts, photos ou documents.');
    }
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
      tipo: tiposPermitidos[0] || 'employe', // Usar el primer tipo disponible o 'employe' por defecto
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
    if (!file) return;

    // ✅ Validar archivo usando utilidad centralizada
    if (!validateImageFile(file)) {
      e.target.value = ''; // Limpiar input
      return;
    }

    // ✅ Leer archivo con utilidad centralizada
    readFileAsDataURL(
      file,
      (dataUrl) => {
        setFotoPreview(dataUrl);
        setFormulario({ ...formulario, foto: dataUrl });
      },
      () => {
        e.target.value = ''; // Limpiar input en caso de error
      }
    );
  };

  const handleGuardar = () => {
    if (!formulario.nombre.trim() || !formulario.apellido.trim()) {
      toast.error('Le nom et prénom sont obligatoires');
      return;
    }

    console.log('🚀 DEBUG - Iniciando guardado de contacto...');
    console.log('  - Modo edición:', modoEdicion);
    console.log('  - Formulario completo:', formulario);
    console.log('  - Departamento actual (forzado):', departamentoId);

    if (modoEdicion && contactoSeleccionado) {
      actualizarContacto(contactoSeleccionado.id, formulario);
      toast.success('Contact mis à jour avec succès');
      cargarContactos();
    } else {
      // 🔒 FORZAR EL DEPARTAMENTO ACTUAL - No permitir cambios
      const contactoParaGuardar = {
        ...formulario,
        departamentoId: departamentoId, // ✅ FORZAR el departamento actual
        departamentoIds: [departamentoId], // ✅ FORZAR el departamento actual
        activo: true // ✅ GARANTIZAR que el campo activo esté definido
      };
      
      console.log('📝 DEBUG - Guardando contacto en departamento actual:', contactoParaGuardar);
      
      try {
        const contactoGuardado = guardarContacto(contactoParaGuardar);
        console.log(`✅ DEBUG - Contacto guardado con ID: ${contactoGuardado.id}`);
        
        // ✅ SOLUCIÓN DEFINITIVA: Agregar el contacto inmediatamente al estado
        setContactos(prevContactos => {
          const nuevosContactos = [...prevContactos, contactoGuardado];
          console.log('✅ Estado actualizado con nuevo contacto. Total:', nuevosContactos.length);
          return nuevosContactos;
        });
        
        toast.success('Contact créé avec succès');
      } catch (error) {
        console.error('❌ Error al guardar contacto:', error);
        toast.error('Espace de stockage insuffisant. Veuillez supprimer des photos ou documents.');
        return; // No cerrar el diálogo para que el usuario pueda modificar
      }
    }

    setDialogAbierto(false);
    limpiarFormulario();
  };

  const handleEliminar = () => {
    if (contactoSeleccionado) {
      eliminarContacto(contactoSeleccionado.id);
      
      // 🔄 Si es un bénévole, actualizar su lista de departamentos
      if (contactoSeleccionado.tipo === 'benevole' && contactoSeleccionado.email) {
        try {
          const benevolesData = localStorage.getItem('benevoles');
          if (benevolesData) {
            const benevoles = JSON.parse(benevolesData);
            const benevolesActualizados = benevoles.map((b: any) => {
              if (b.email === contactoSeleccionado.email) {
                // Quitar este departamento de la lista
                const depts = Array.isArray(b.departement) ? b.departement : (b.departement ? [b.departement] : []);
                return {
                  ...b,
                  departement: depts.filter((d: string) => d !== departamentoId)
                };
              }
              return b;
            });
            localStorage.setItem('benevoles', JSON.stringify(benevolesActualizados));
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du bénévole:', error);
        }
      }
      
      toast.success('Contact supprimé avec succès');
      
      // ✅ SOLUCIÓN DEFINITIVA: Actualizar el estado inmediatamente
      setContactos(prevContactos => prevContactos.filter(c => c.id !== contactoSeleccionado.id));
      
      setDialogEliminar(false);
      setContactoSeleccionado(null);
    }
  };

  const toggleIdioma = (idioma: IdiomaContacto) => {
    const idiomasActuels = formulario.idiomas || [];
    const nouveauxIdiomas = idiomasActuels.includes(idioma)
      ? idiomasActuels.filter(i => i !== idioma)
      : [...idiomasActuels, idioma];
    setFormulario({ ...formulario, idiomas: nouveauxIdiomas });
  };

  const updateDisponibilidad = (index: number, field: 'am' | 'pm', value: boolean) => {
    setFormulario(prev => {
      const nouvellesDisponibilites = [...(prev.disponibilidades || [])];
      nouvellesDisponibilites[index] = { ...nouvellesDisponibilites[index], [field]: value };
      return { ...prev, disponibilidades: nouvellesDisponibilites };
    });
  };

  const contactosFiltrados = contactos.filter(contacto => {
    // Filtrer seulement les contacts actifs (ou sans le champ activo défini pour la compatibilité)
    if (contacto.activo === false) {
      console.log(`❌ Filtrado contacto inactivo: ${contacto.nombre} ${contacto.apellido}`);
      return false;
    }
    
    const searchText = busqueda.toLowerCase();
    const matchBusqueda = busqueda === '' || 
      `${contacto.nombre} ${contacto.apellido}`.toLowerCase().includes(searchText) ||
      (contacto.nombreEmpresa || '').toLowerCase().includes(searchText) ||
      contacto.email.toLowerCase().includes(searchText) ||
      contacto.telefono.includes(busqueda);
    
    const matchTipo = tipoFiltro === 'todos' || contacto.tipo === tipoFiltro;
    
    if (!matchBusqueda) {
      console.log(`❌ Filtrado por búsqueda: ${contacto.nombre} ${contacto.apellido} (búsqueda: "${busqueda}")`);
    }
    if (!matchTipo) {
      console.log(`❌ Filtrado por tipo: ${contacto.nombre} ${contacto.apellido} (tipo: ${contacto.tipo}, filtro: ${tipoFiltro})`);
    }
    
    return matchBusqueda && matchTipo;
  });
  
  // Log final de resultados filtrados
  console.log(`✅ Contactos después de filtros: ${contactosFiltrados.length}/${contactos.length}`);

  const estadisticas = contarContactosPorTipo(departamentoId);

  const getTipoConfig = (tipo: TipoContacto) => {
    // D'abord rechercher dans les types personnalisés créés par l'utilisateur (globales + departamento)
    const tiposPersonalizados = obtenerTiposContacto(departamentoId);
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
    
    // Si n'existe pas dans les personnalisés, utiliser la configuration par défaut
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
        
        // Déclencher un événement personnalisé
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 space-y-6">
      {/* Header avec statistiques - Diseño Premium */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 p-4 sm:p-6 lg:p-8">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-green-500/5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" 
                     style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate" 
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Gestion des Contacts
                  </h2>
                  <p className="text-xs sm:text-sm font-medium truncate" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                    {departamentoNombre}
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 ml-0 sm:ml-15" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Gérez tous les contacts du département • <span className="font-semibold">{contactos.length} contacts</span> actifs
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <Button
                onClick={abrirDialogoAsignarBenevole}
                className="text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl w-full sm:w-auto text-sm sm:text-base"
                style={{ 
                  backgroundColor: branding.primaryColor,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <Link className="w-4 h-4 mr-2" />
                <span className="truncate">Assigner un bénévole</span>
              </Button>
              <Button
                onClick={abrirDialogoNuevo}
                className="text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl w-full sm:w-auto text-sm sm:text-base"
                style={{ 
                  backgroundColor: branding.secondaryColor,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Contact
              </Button>
              {/* BOTONES DE DIAGNÓSTICO REMOVIDOS - NO NECESARIOS EN PRODUCCIÓN */}
            </div>
          </div>

          {/* Statistiques */}
          {tiposPermitidos.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-2xl p-8 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Aucun type de contact créé
                </p>
                <p className="text-sm text-amber-700 mb-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Créez vos premiers types de contact pour commencer à gérer vos contacts.
                </p>
                <Button
                  onClick={abrirDialogoNuevo}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un contact
                </Button>
                <p className="text-xs text-amber-600 mt-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  💡 Les types de contact se créent automatiquement lors de la création du premier contact
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {Object.entries(estadisticas)
              .filter(([tipo]) => tiposPermitidos.includes(tipo as TipoContacto))
              .map(([tipo, count]) => {
              const config = getTipoConfig(tipo as TipoContacto);
              const Icon = config.icon;
              return (
                <div
                  key={tipo}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-200/60 hover:border-slate-300 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)` }} />
                  <div className="relative p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" 
                           style={{ backgroundColor: config.bgColor }}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: config.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-600 font-medium truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {config.label.split(' /')[0]}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold" style={{ color: config.color, fontFamily: 'Montserrat, sans-serif' }}>
                          {count}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 rounded-bl-full opacity-10" 
                       style={{ backgroundColor: config.color }} />
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Tabs: Liste et Calendrier */}
      <Tabs defaultValue="liste" className="w-full">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="relative z-10">
            <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-md bg-slate-100/80 p-1 rounded-xl">
              <TabsTrigger 
                value="liste" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Users className="w-4 h-4" />
                Liste des Contacts
              </TabsTrigger>
              <TabsTrigger 
                value="calendrier" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Calendar className="w-4 h-4" />
                Calendrier Horaires
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Liste */}
        <TabsContent value="liste" className="space-y-6 mt-0">
          {/* Recherche et filtres */}
          <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30 pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white/80"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {tiposPermitidos.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Aucun type de contact créé. Créez votre premier contact pour commencer.</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Liste de contacts */}
          <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 pointer-events-none" />
            <div className="relative z-10">
              {contactosFiltrados.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-700 text-xl font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Aucun contact trouvé
                  </p>
                  <p className="text-slate-500 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Créez un nouveau contact pour commencer
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {contactosFiltrados.map((contacto) => {
                    const config = getTipoConfig(contacto.tipo);
                    const Icon = config.icon;
                    return (
                      <div 
                        key={contacto.id} 
                        className="group relative overflow-hidden rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 border border-slate-200/60 hover:border-blue-300/60 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        {/* Decorative accent */}
                        <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2" 
                             style={{ backgroundColor: config.color }} />
                        
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-md flex-shrink-0 transition-transform duration-300 group-hover:scale-110" 
                                   style={{ borderColor: config.color }}>
                                {contacto.foto ? (
                                  <ImageWithFallback src={contacto.foto} alt={`${contacto.nombre} ${contacto.apellido}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br" 
                                       style={{ 
                                         background: `linear-gradient(135deg, ${config.bgColor}, ${config.color}20)` 
                                       }}>
                                    <User className="w-7 h-7" style={{ color: config.color }} />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shadow-sm" 
                                   style={{ backgroundColor: config.color }}>
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="font-bold text-slate-800 truncate text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {(contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa 
                                    ? contacto.nombreEmpresa 
                                    : `${contacto.nombre} ${contacto.apellido}`}
                                </h3>
                              </div>
                              
                              <Badge 
                                className="text-xs mb-2 font-medium rounded-lg" 
                                style={{ backgroundColor: `${config.color}15`, color: config.color, fontFamily: 'Roboto, sans-serif' }}
                              >
                                {config.label.split(' ')[0]}
                              </Badge>
                              
                              {/* Afficher la personne de contact si c'est une entreprise */}
                              {(contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa && (contacto.nombre || contacto.apellido) && (
                                <p className="text-xs text-slate-600 mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                  <User className="w-3.5 h-3.5" />
                                  Contact: {contacto.nombre} {contacto.apellido}
                                </p>
                              )}
                              {contacto.cargo && (
                                <p className="text-xs text-slate-600 mb-1.5 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                  {contacto.cargo}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{contacto.email}</span>
                              </div>
                              {contacto.telefono && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{contacto.telefono}</span>
                                </div>
                              )}
                              {contacto.idiomas && contacto.idiomas.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                  {contacto.idiomas.map(idioma => (
                                    <Badge 
                                      key={idioma} 
                                      variant="outline" 
                                      className="text-xs rounded-md border-slate-300"
                                      style={{ fontFamily: 'Roboto, sans-serif' }}
                                    >
                                      {idioma.toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirDialogoDetalle(contacto)}
                              className="flex-1 hover:bg-blue-50 rounded-lg transition-colors"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <Eye className="w-4 h-4 mr-1.5" style={{ color: branding.primaryColor }} />
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
                              className="hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Shield className="w-4 h-4" style={{ color: '#9C27B0' }} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirDialogoEditar(contacto)}
                              className="hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setContactoSeleccionado(contacto);
                                setDialogEliminar(true);
                              }}
                              className="hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" style={{ color: '#c23934' }} />
                            </Button>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Calendrier */}
        <TabsContent value="calendrier" className="mt-0">
          <CalendarioContactos
            contactos={contactos}
            onVerDetalle={abrirDialogoDetalle}
            getTipoConfig={getTipoConfig}
            departamentoNombre={departamentoNombre}
            departamentoId={departamentoId}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog Créer/Éditer - FORMULAIRE COMPACT */}
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
        departamentoNombre={departamentoNombre}
      />

      {/* Dialog Détails */}
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
                    <ImageWithFallback src={contactoSeleccionado.foto} alt="Foto" className="w-full h-full object-cover" />
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

      {/* Dialog Supprimer */}
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

      {/* Dialog Assigner Bénévole Existant */}
      <Dialog open={dialogAsignarBenevole} onOpenChange={setDialogAsignarBenevole}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="assign-benevole-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Assigner un bénévole existant
            </DialogTitle>
            <DialogDescription id="assign-benevole-description">
              Sélectionnez un bénévole enregistré dans le système pour l'assigner à ce département
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                placeholder="Rechercher un bénévole par nom, prénom ou email..."
                value={busquedaBenevole}
                onChange={(e) => setBusquedaBenevole(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Liste de bénévoles */}
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
                            <ImageWithFallback src={benevole.photo || benevole.foto} alt={`${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido}`} className="w-full h-full object-cover" />
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

      {/* Dialog: Assigner Rol à Contact */}
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

      {/* Dialog: Diagnostic du Système */}
      <Dialog open={dialogDiagnostico} onOpenChange={setDialogDiagnostico}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="diagnostic-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Diagnostic du Système de Contacts
            </DialogTitle>
            <DialogDescription id="diagnostic-description">
              Analyse complète de tous les contacts dans le système
            </DialogDescription>
          </DialogHeader>

          {diagnosticoResultado && (
            <div className="space-y-6">
              {/* Résumé */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: branding.primaryColor }}>
                  📊 Résumé Général
                </h3>
                <p className="text-2xl font-bold">{diagnosticoResultado.total} contacts au total</p>
              </Card>

              {/* Contacts par département */}
              <div>
                <h3 className="font-bold text-lg mb-3">📂 Contacts par Département</h3>
                <div className="space-y-2">
                  {Object.entries(diagnosticoResultado.porDepartamento).map(([deptId, contactos]) => {
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
                    const nombreDept = nombresDepts[deptId] || `Département ${deptId}`;
                    const esEsteDept = deptId === departamentoId;
                    
                    return (
                      <Card 
                        key={deptId} 
                        className={`p-3 ${esEsteDept ? 'border-2' : ''}`}
                        style={esEsteDept ? { borderColor: branding.secondaryColor } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" style={{ color: branding.primaryColor }} />
                            <span className="font-semibold">
                              {nombreDept} {esEsteDept && <Badge className="ml-2" style={{ backgroundColor: branding.secondaryColor }}>Actuel</Badge>}
                            </span>
                          </div>
                          <Badge variant="outline">{contactos.length} contacts</Badge>
                        </div>
                        <div className="mt-2 pl-6 space-y-1">
                          {contactos.slice(0, 5).map((c: any) => (
                            <div key={c.id} className="text-sm text-[#666666] flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span>{c.nombre} {c.apellido}</span>
                              <Badge variant="outline" className="text-xs">{c.tipo}</Badge>
                              {c.activo === undefined && <Badge variant="destructive" className="text-xs">⚠️ Pas de champ activo</Badge>}
                              {c.activo === false && <Badge variant="secondary" className="text-xs">Inactif</Badge>}
                            </div>
                          ))}
                          {contactos.length > 5 && (
                            <p className="text-xs text-[#999999] pl-5">... et {contactos.length - 5} autres</p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Problèmes détectés */}
              <div>
                <h3 className="font-bold text-lg mb-3">⚠️ Problèmes Détectés</h3>
                
                {diagnosticoResultado.problemas.sinActivo.length > 0 && (
                  <Card className="p-4 mb-3 border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      ⚠️ {diagnosticoResultado.problemas.sinActivo.length} contacts sans champ 'activo'
                    </h4>
                    <div className="space-y-1">
                      {diagnosticoResultado.problemas.sinActivo.map((c: any) => (
                        <p key={c.id} className="text-sm text-yellow-700">
                          • {c.nombre} {c.apellido} - {c.email}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {diagnosticoResultado.problemas.inactivos.length > 0 && (
                  <Card className="p-4 mb-3 border-l-4 border-gray-500 bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      🚫 {diagnosticoResultado.problemas.inactivos.length} contacts inactifs
                    </h4>
                    <div className="space-y-1">
                      {diagnosticoResultado.problemas.inactivos.map((c: any) => (
                        <p key={c.id} className="text-sm text-gray-700">
                          • {c.nombre} {c.apellido} - {c.email}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {diagnosticoResultado.problemas.sinDepartamento.length > 0 && (
                  <Card className="p-4 mb-3 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-2">
                      ⚠️ {diagnosticoResultado.problemas.sinDepartamento.length} contacts sans département
                    </h4>
                    <div className="space-y-1">
                      {diagnosticoResultado.problemas.sinDepartamento.map((c: any) => (
                        <p key={c.id} className="text-sm text-red-700">
                          • {c.nombre} {c.apellido} - {c.email}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {diagnosticoResultado.problemas.sinActivo.length === 0 && 
                 diagnosticoResultado.problemas.inactivos.length === 0 && 
                 diagnosticoResultado.problemas.sinDepartamento.length === 0 && (
                  <Card className="p-4 border-l-4 border-green-500 bg-green-50">
                    <p className="text-green-800 font-semibold">✅ Aucun problème détecté</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Información de Almacenamiento */}
      <Dialog open={dialogAlmacenamiento} onOpenChange={setDialogAlmacenamiento}>
        <DialogContent className="max-w-2xl" aria-describedby="almacenamiento-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Information sur le Stockage
            </DialogTitle>
            <DialogDescription id="almacenamiento-description">
              Gérez l'espace de stockage utilisé par les contacts
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const info = obtenerInfoAlmacenamiento();
            const limiteEstimado = 5; // 5MB est une estimation sûre pour localStorage
            const porcentajeUsado = (info.tamañoMB / limiteEstimado) * 100;
            
            return (
              <div className="space-y-6">
                {/* Información general */}
                <Card className="p-4 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
                  <h4 className="font-semibold text-[#333333] mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Résumé du Stockage
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#666666]">Total de contacts</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.totalContactos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Espace utilisé</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.tamañoMB} MB</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Contacts avec photos</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.contactosConFotos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Total documents</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.totalDocumentos}</p>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#666666]">Utilisation estimée</span>
                      <span className="text-sm font-semibold" style={{ 
                        color: porcentajeUsado > 80 ? '#dc2626' : porcentajeUsado > 60 ? '#f59e0b' : branding.secondaryColor 
                      }}>
                        {porcentajeUsado.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(porcentajeUsado, 100)}%`,
                          backgroundColor: porcentajeUsado > 80 ? '#dc2626' : porcentajeUsado > 60 ? '#f59e0b' : branding.secondaryColor
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Alertas */}
                {porcentajeUsado > 80 && (
                  <Card className="p-4 border-l-4 border-red-500 bg-red-50">
                    <p className="text-red-800 font-semibold">
                      ⚠️ Espace de stockage critique! Veuillez libérer de l'espace.
                    </p>
                  </Card>
                )}

                {porcentajeUsado > 60 && porcentajeUsado <= 80 && (
                  <Card className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <p className="text-orange-800 font-semibold">
                      ⚠️ Espace de stockage limité. Considérez libérer de l'espace.
                    </p>
                  </Card>
                )}

                {/* Acciones de limpieza */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#333333]">Actions de Nettoyage</h4>
                  
                  <Button
                    onClick={() => {
                      if (confirm('⚠️ Cela va supprimer TOUTES les photos des contacts.\n\nCette action est irréversible. Continuer?')) {
                        const fotosEliminadas = eliminarTodasLasFotos();
                        toast.success(`🗑️ ${fotosEliminadas} photo(s) supprimée(s)`);
                        setDialogAlmacenamiento(false);
                      }
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Supprimer toutes les photos ({info.contactosConFotos} contacts)
                  </Button>

                  <Button
                    onClick={() => {
                      if (confirm('⚠️ Cela va supprimer TOUS les documents des contacts.\n\nCette action est irréversible. Continuer?')) {
                        const docsEliminados = eliminarTodosLosDocumentos();
                        toast.success(`🗑️ ${docsEliminados} document(s) supprimé(s)`);
                        setDialogAlmacenamiento(false);
                      }
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: '#dc2626', color: '#dc2626' }}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Supprimer tous les documents ({info.totalDocumentos} documents)
                  </Button>

                  <Button
                    onClick={() => {
                      optimizarTodosLosContactos();
                      toast.success('✅ Contacts optimisés avec succès');
                      setDialogAlmacenamiento(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimiser tous les contacts
                  </Button>
                </div>

                {/* Información adicional */}
                <Card className="p-4 bg-blue-50 border-l-4 border-blue-500">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Conseil:</strong> Les photos et documents volumineux peuvent rapidement remplir l'espace de stockage. 
                    Limitez la taille des fichiers à moins de 200KB chacun.
                  </p>
                </Card>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}