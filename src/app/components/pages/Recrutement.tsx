import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { 
  UserPlus, 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Download,
  Filter,
  Search,
  Sparkles,
  ArrowLeft,
  Trash2,
  Link,
  UserMinus
} from 'lucide-react';
import { toast } from 'sonner';
import { guardarContacto, obtenerContactosPorDepartamento, eliminarContactosDuplicados, eliminarContacto } from '../../utils/contactosDepartamentoStorage';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  applicationDate: string;
  experience: string;
  availability: string;
  numeroArchivo?: string; // ✅ Agregar número de archivo
  adresse?: string; // ✅ Dirección completa
  appartement?: string; // ✅ Apartamento/Unidad
  ville?: string; // ✅ Ciudad
  codePostal?: string; // ✅ Código postal
  quartier?: string; // ✅ Quartier/Barrio
  departamentoIds?: string[]; // ✅ IDs de departamentos asignados
  contactoId?: string; // ✅ ID del contacto creado en departamento
}

export function Recrutement() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // 🎯 Estados para el diálogo de asignación a departamento
  const [dialogAssignerOpen, setDialogAssignerOpen] = useState(false);
  const [candidatoParaAssignar, setCandidatoParaAssignar] = useState<Candidate | null>(null);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  
  // 🎯 Estado para el diálogo de perfil detallado
  const [dialogPerfilOpen, setDialogPerfilOpen] = useState(false);
  const [candidatoParaPerfil, setCandidatoParaPerfil] = useState<Candidate | null>(null);

  // ✅ LISTA CORRECTA DE DEPARTAMENTOS CON IDs NUMÉRICOS (coinciden con departamentosStorage.ts)
  const departamentosDisponibles = [
    { id: '1', nombre: 'Entrepôt', icono: '📦', color: '#1a4d7a', codigo: 'ENTREPOT' },
    { id: '7', nombre: 'Transport', icono: '🚚', color: '#2d9561', codigo: 'TRANSPORT' },
    { id: '2', nombre: 'Comptoir', icono: '🏪', color: '#FF9800', codigo: 'COMPTOIR' },
    { id: '3', nombre: 'Cuisine', icono: '🍳', color: '#E91E63', codigo: 'CUISINE' },
    { id: '4', nombre: 'Liaison', icono: '🤝', color: '#9C27B0', codigo: 'LIAISON' },
    { id: '8', nombre: 'Bénévoles', icono: '👥', color: '#4CAF50', codigo: 'BENEVOLES' },
  ];

  // Mock data - Candidatos
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 1,
      name: 'Jean Tremblay',
      email: 'jean.tremblay@email.com',
      phone: '(514) 555-0101',
      position: 'Bénévole - Distribution',
      status: 'pending',
      applicationDate: '2024-02-08',
      experience: '2 ans d\'expérience en service communautaire',
      availability: 'Lundi, Mercredi, Vendredi'
    },
    {
      id: 2,
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '(514) 555-0102',
      position: 'Coordinateur bénévole',
      status: 'interview',
      applicationDate: '2024-02-06',
      experience: '5 ans en gestion d\'équipe',
      availability: 'Temps plein'
    },
    {
      id: 3,
      name: 'Pierre Gagnon',
      email: 'pierre.gagnon@email.com',
      phone: '(514) 555-0103',
      position: 'Bénévole - Entrepôt',
      status: 'accepted',
      applicationDate: '2024-02-05',
      experience: 'Expérience en logistique',
      availability: 'Samedi, Dimanche'
    },
    {
      id: 4,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      phone: '(514) 555-0104',
      position: 'Chauffeur bénévole',
      status: 'reviewed',
      applicationDate: '2024-02-07',
      experience: 'Permis classe 3, 10 ans d\'expérience',
      availability: 'Flexible'
    },
    {
      id: 5,
      name: 'Sylvain Forget',
      email: 'sylvain_forget@videotron.ca',
      phone: '514 718-1068',
      position: 'Bénévole - Entrepôt',
      status: 'accepted',
      applicationDate: '2026-03-16',
      experience: 'Bénévole expérimenté',
      availability: 'Variable',
      adresse: '7184 Boulevard des Mille-Îles',
      ville: 'Laval',
      codePostal: 'H7T 1C7'
    }
  ]);

  // Estadísticas
  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    interview: candidates.filter(c => c.status === 'interview').length,
    accepted: candidates.filter(c => c.status === 'accepted').length
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-[#FFC107] text-[#333333]' },
      reviewed: { label: 'Examiné', color: `text-white`, bgColor: branding.primaryColor },
      interview: { label: 'Entretien', color: 'bg-[#9C27B0] text-white' },
      accepted: { label: 'Accepté', color: `text-white`, bgColor: branding.secondaryColor },
      rejected: { label: 'Rejeté', color: 'bg-[#DC3545] text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (status === 'reviewed' || status === 'accepted') {
      return (
        <Badge 
          className={config.color} 
          style={{ backgroundColor: config.bgColor }}
        >
          {config.label}
        </Badge>
      );
    }
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (candidateId: number, newStatus: string) => {
    // Buscar el candidat pour obtenir ses datos
    const candidate = candidates.find(c => c.id === candidateId);
    
    // Actualizar el estado del candidat
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, status: newStatus as Candidate['status'] } : c)
    );
    
    // ✅ Si se acepta el candidat, crear automáticamente en el département correspondiente
    if (newStatus === 'accepted' && candidate) {
      try {
        // 🎯 Detectar département selon la position du candidat - USANDO IDs NUMÉRICOS CORRECTOS
        let departamentoId = '8'; // Par défaut: Bénévoles
        let departamentoNombre = 'Bénévoles';
        const positionLower = candidate.position.toLowerCase();
        
        if (positionLower.includes('entrepôt') || positionLower.includes('entrepo') || positionLower.includes('warehouse')) {
          departamentoId = '1'; // Entrepôt
          departamentoNombre = 'Entrepôt';
        } else if (positionLower.includes('chauffeur') || positionLower.includes('driver') || positionLower.includes('transport')) {
          departamentoId = '7'; // Transport
          departamentoNombre = 'Transport';
        } else if (positionLower.includes('comptoir') || positionLower.includes('counter')) {
          departamentoId = '2'; // Comptoir
          departamentoNombre = 'Comptoir';
        } else if (positionLower.includes('cuisine') || positionLower.includes('kitchen')) {
          departamentoId = '3'; // Cuisine
          departamentoNombre = 'Cuisine';
        } else if (positionLower.includes('liaison')) {
          departamentoId = '4'; // Liaison
          departamentoNombre = 'Liaison';
        }
        
        console.log(`🎯 Detectado département: ${departamentoNombre} (ID: ${departamentoId}) pour position: ${candidate.position}`);
        
        // Séparer nom complet en prénom (nombre) et nom de famille (apellido)
        // Format: "Prénom Nom" -> nombre="Prénom", apellido="Nom"
        const nombreParts = candidate.name.trim().split(' ');
        const nombre = nombreParts[0] || ''; // Premier mot = Prénom
        const apellido = nombreParts.slice(1).join(' ') || ''; // Reste = Nom de famille
        
        // Parser disponibilité en jours de la semaine
        const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const disponibilidades = diasSemana.map(jour => ({
          jour,
          am: candidate.availability.toLowerCase().includes(jour.toLowerCase()) || 
              candidate.availability.toLowerCase().includes('temps plein') ||
              candidate.availability.toLowerCase().includes('flexible'),
          pm: candidate.availability.toLowerCase().includes(jour.toLowerCase()) ||
              candidate.availability.toLowerCase().includes('temps plein') ||
              candidate.availability.toLowerCase().includes('flexible')
        }));
        
        // Créer événement de création
        const eventoCreacion = {
          id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'creation' as const,
          titre: 'Bénévole ajouté depuis Recrutement',
          description: `Candidat accepté et ajouté automatiquement au département ${departamentoNombre}`,
          date: new Date().toISOString(),
          utilisateur: 'Système',
          couleur: '#4CAF50'
        };
        
        // Créer contact dans le département correspondant
        const nuevoContacto = {
          departamentoId,
          departamentoIds: [departamentoId],
          tipo: 'benevole' as const,
          nombre,
          apellido,
          email: candidate.email,
          telefono: candidate.phone,
          activo: true,
          fechaIngreso: new Date().toISOString().split('T')[0],
          disponibilidades,
          notas: `${candidate.experience}\n\nCandidature du: ${new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}`,
          evenements: [eventoCreacion],
          // Champs optionnels
          direccion: candidate.adresse || '',
          apartamento: candidate.appartement || '',
          ciudad: candidate.ville || '',
          codigoPostal: candidate.codePostal || '',
          quartier: candidate.quartier || '', // ✅ CRÍTICO: Incluir quartier
          cargo: candidate.position,
          idiomas: [],
          documents: []
        };
        
        console.log('✅ Créant contact depuis Recrutement:', {
          département: `${departamentoNombre} (${departamentoId})`,
          contact: nuevoContacto
        });
        
        const contactoGuardado = guardarContacto(nuevoContacto);
        
        console.log('✅ Contacto sauvegardé avec succès:', contactoGuardado);
        
        // ✅ Guardar el ID del contacto en el candidato
        setCandidates(prev => 
          prev.map(c => c.id === candidateId ? { ...c, contactoId: contactoGuardado.id } : c)
        );
        
        // 🔥 Déclencher événement personnalisé pour synchroniser départements
        window.dispatchEvent(new CustomEvent('contactos-actualizados', {
          detail: { departamentoId, contactoId: contactoGuardado.id }
        }));
        
        toast.success(
          `${candidate.name} accepté et ajouté au département ${departamentoNombre}!`,
          {
            description: `Le contact est maintenant disponible dans la section ${departamentoNombre}. ID: ${contactoGuardado.id}`,
            duration: 5000
          }
        );
      } catch (error) {
        console.error('❌ Erreur lors de la création du contact depuis Recrutement:', error);
        toast.error('Le statut a été mis à jour mais il y a eu une erreur lors de l\'ajout au département.');
      }
    } else {
      toast.success('Statut mis à jour avec succès');
    }
  };

  const handleDeleteCandidate = (candidateId: number, candidateName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la candidature de ${candidateName}?\n\nCette action est irréversible.`)) {
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success('Candidature supprimée avec succès');
    }
  };

  // 🗑️ Fonction pour supprimer le contact créé depuis Recrutement
  const handleEliminarContacto = (candidate: Candidate) => {
    // Buscar el contacto asociado
    const contactoInfo = obtenerContactoCandidato(candidate);
    
    if (!contactoInfo) {
      toast.error('Aucun contact associé à ce candidat');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer le contact de ${candidate.name}?\n\nCette action supprimera le contact du département mais conservera la candidature.`)) {
      try {
        eliminarContacto(contactoInfo.id);
        
        // Actualizar el candidato para remover el contactoId
        setCandidates(prev => 
          prev.map(c => c.id === candidate.id ? { ...c, contactoId: undefined, status: 'reviewed' } : c)
        );

        // Notificar a los departamentos
        window.dispatchEvent(new CustomEvent('contactos-actualizados', {
          detail: { contactoId: contactoInfo.id }
        }));

        toast.success(`Contact de ${candidate.name} supprimé avec succès`, {
          description: 'Le candidat est maintenant disponible pour être assigné à nouveau'
        });

        // Cerrar el dialog de perfil
        setDialogPerfilOpen(false);
        setCandidatoParaPerfil(null);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du contact:', error);
        toast.error('Erreur lors de la suppression du contact');
      }
    }
  };

  // 🔍 Fonction pour vérifier si un candidat est déjà assigné à un département
  const verificarCandidatoAsignado = (candidate: Candidate, departamentoId: string): boolean => {
    const contactosExistentes = obtenerContactosPorDepartamento(departamentoId);
    return contactosExistentes.some(contacto => 
      contacto.email.toLowerCase() === candidate.email.toLowerCase() ||
      (contacto.nombre.toLowerCase() === candidate.name.split(' ')[0].toLowerCase() &&
       contacto.apellido.toLowerCase() === candidate.name.split(' ').slice(1).join(' ').toLowerCase())
    );
  };

  // 🔍 Fonction pour obtenir le numéro d'archive d'un candidat s'il est déjà assigné
  const obtenerNumeroArchivoCandidato = (candidate: Candidate): string | null => {
    // Buscar en tous les departamentos
    for (const dept of departamentosDisponibles) {
      const contactosExistentes = obtenerContactosPorDepartamento(dept.id);
      const contactoEncontrado = contactosExistentes.find(contacto => 
        contacto.email.toLowerCase() === candidate.email.toLowerCase() ||
        (contacto.nombre.toLowerCase() === candidate.name.split(' ')[0].toLowerCase() &&
         contacto.apellido.toLowerCase() === candidate.name.split(' ').slice(1).join(' ').toLowerCase())
      );
      
      if (contactoEncontrado && contactoEncontrado.numeroArchivo) {
        return contactoEncontrado.numeroArchivo;
      }
    }
    return null;
  };

  // 🔍 Fonction pour obtenir le contacto asociado a un candidato si existe
  const obtenerContactoCandidato = (candidate: Candidate): { id: string; departamentoId: string } | null => {
    // Buscar en tous les departamentos
    for (const dept of departamentosDisponibles) {
      const contactosExistentes = obtenerContactosPorDepartamento(dept.id);
      const contactoEncontrado = contactosExistentes.find(contacto => 
        contacto.email.toLowerCase() === candidate.email.toLowerCase() ||
        (contacto.nombre.toLowerCase() === candidate.name.split(' ')[0].toLowerCase() &&
         contacto.apellido.toLowerCase() === candidate.name.split(' ').slice(1).join(' ').toLowerCase())
      );
      
      if (contactoEncontrado) {
        return { id: contactoEncontrado.id, departamentoId: dept.id };
      }
    }
    return null;
  };

  // 🎯 Fonction pour assigner candidat à un département spécifique
  const handleAssignerCandidat = () => {
    if (!candidatoParaAssignar || !departamentoSeleccionado) {
      toast.error('Veuillez sélectionner un département');
      return;
    }

    // 🔒 VERIFIER SI LE CANDIDAT EST DÉJÀ ASSIGNÉ À CE DÉPARTEMENT
    const yaExiste = verificarCandidatoAsignado(candidatoParaAssignar, departamentoSeleccionado);

    if (yaExiste) {
      const departamento = departamentosDisponibles.find(d => d.id === departamentoSeleccionado);
      toast.error(
        `${candidatoParaAssignar.name} est déjà assigné au département ${departamento?.nombre}!`,
        {
          description: 'Veuillez sélectionner un autre département ou vérifier la liste des contacts.',
          duration: 5000
        }
      );
      return;
    }

    try {
      const departamento = departamentosDisponibles.find(d => d.id === departamentoSeleccionado);
      if (!departamento) {
        toast.error('Département non trouvé');
        return;
      }

      // Séparer nom complet en prénom (nombre) et nom de famille (apellido)
      // Format: "Prénom Nom" -> nombre="Prénom", apellido="Nom"
      const nombreParts = candidatoParaAssignar.name.trim().split(' ');
      const nombre = nombreParts[0] || ''; // Premier mot = Prénom
      const apellido = nombreParts.slice(1).join(' ') || ''; // Reste = Nom de famille
      
      // Parser disponibilité en jours de la semaine
      const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      const disponibilidades = diasSemana.map(jour => ({
        jour,
        am: candidatoParaAssignar.availability.toLowerCase().includes(jour.toLowerCase()) || 
            candidatoParaAssignar.availability.toLowerCase().includes('temps plein') ||
            candidatoParaAssignar.availability.toLowerCase().includes('flexible'),
        pm: candidatoParaAssignar.availability.toLowerCase().includes(jour.toLowerCase()) ||
            candidatoParaAssignar.availability.toLowerCase().includes('temps plein') ||
            candidatoParaAssignar.availability.toLowerCase().includes('flexible')
      }));
      
      // Créer événement de création
      const eventoCreacion = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'creation' as const,
        titre: 'Bénévole assigné depuis Recrutement',
        description: `Candidat assigné manuellement au département ${departamento.nombre}`,
        date: new Date().toISOString(),
        utilisateur: 'Système',
        couleur: departamento.color
      };
      
      // Créer contact dans le département sélectionné
      const nuevoContacto = {
        departamentoId: departamentoSeleccionado,
        departamentoIds: [departamentoSeleccionado],
        tipo: 'benevole' as const,
        nombre,
        apellido,
        email: candidatoParaAssignar.email,
        telefono: candidatoParaAssignar.phone,
        activo: true,
        fechaIngreso: new Date().toISOString().split('T')[0],
        disponibilidades,
        notas: `${candidatoParaAssignar.experience}\n\nCandidature du: ${new Date(candidatoParaAssignar.applicationDate).toLocaleDateString('fr-FR')}\n\nAssigné manuellement au département ${departamento.nombre}`,
        evenements: [eventoCreacion],
        // Champs optionnels
        direccion: candidatoParaAssignar.adresse || '',
        apartamento: candidatoParaAssignar.appartement || '',
        ciudad: candidatoParaAssignar.ville || '',
        codigoPostal: candidatoParaAssignar.codePostal || '',
        quartier: candidatoParaAssignar.quartier || '', // ✅ CRÍTICO: Incluir quartier
        cargo: candidatoParaAssignar.position,
        idiomas: [],
        documents: []
      };
      
      console.log('✅ Assignant candidat au département:', {
        département: `${departamento.nombre} (${departamentoSeleccionado})`,
        contact: nuevoContacto
      });
      
      const contactoGuardado = guardarContacto(nuevoContacto);
      
      console.log('✅ Contacto sauvegardé avec succès:', contactoGuardado);
      
      // ✅ Guardar el ID del contacto en el candidato
      setCandidates(prev => 
        prev.map(c => c.id === candidatoParaAssignar.id ? { ...c, contactoId: contactoGuardado.id } : c)
      );
      
      // 🔥 Déclencher événement personnalisé pour synchroniser départements
      window.dispatchEvent(new CustomEvent('contactos-actualizados', {
        detail: { departamentoId: departamentoSeleccionado, contactoId: contactoGuardado.id }
      }));
      
      toast.success(
        `${candidatoParaAssignar.name} assigné au département ${departamento.nombre}!`,
        {
          description: `Le contact est maintenant disponible dans la section ${departamento.nombre}`,
          duration: 5000
        }
      );

      // Fermer dialog et nettoyer états
      setDialogAssignerOpen(false);
      setCandidatoParaAssignar(null);
      setDepartamentoSeleccionado('');
    } catch (error) {
      console.error('❌ Erreur lors de l\'assignation du candidat:', error);
      toast.error('Erreur lors de l\'assignation au département');
    }
  };

  // 🔄 SINCRONIZAR números de archivo desde contactos a candidatos
  useEffect(() => {
    const sincronizarCandidatos = () => {
      const contactos = obtenerContactosPorDepartamento('8'); // Departamento Bénévoles
      let actualizado = false;
      
      const candidatosActualizados = candidates.map(candidate => {
        // Buscar contacto correspondiente por email
        const contacto = contactos.find(c => 
          c.email.toLowerCase() === candidate.email.toLowerCase()
        );
        
        // Si existe el contacto, sincronizar número de archivo y departamentos
        if (contacto) {
          const cambios: Partial<Candidate> = {};
          
          if (contacto.numeroArchivo && contacto.numeroArchivo !== candidate.numeroArchivo) {
            console.log(`🔄 Sincronizando número de archivo para candidato ${candidate.name}: ${contacto.numeroArchivo}`);
            cambios.numeroArchivo = contacto.numeroArchivo;
            actualizado = true;
          }
          
          // Sincronizar departamentos asignados
          const departamentosContacto = contacto.departamentoIds || (contacto.departamentoId ? [contacto.departamentoId] : []);
          const departamentosActuales = candidate.departamentoIds || [];
          
          if (JSON.stringify(departamentosContacto.sort()) !== JSON.stringify(departamentosActuales.sort())) {
            console.log(`🔄 Sincronizando departamentos para candidato ${candidate.name}:`, departamentosContacto);
            cambios.departamentoIds = departamentosContacto;
            actualizado = true;
          }
          
          if (Object.keys(cambios).length > 0) {
            return {
              ...candidate,
              ...cambios
            };
          }
        }
        
        return candidate;
      });
      
      if (actualizado) {
        console.log('✅ Sincronización de candidatos actualizada');
        setCandidates(candidatosActualizados);
      }
    };
    
    // Ejecutar sincronización al montar el componente
    sincronizarCandidatos();
    
    // Escuchar cambios en contactos
    const handleContactosUpdate = () => {
      console.log('🔔 Recrutement: Evento contactos-actualizados recibido');
      sincronizarCandidatos();
    };
    
    window.addEventListener('contactos-actualizados', handleContactosUpdate);
    
    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosUpdate);
    };
  }, [candidates]);

  return (
    <div 
      className="min-h-screen p-3 sm:p-4 md:p-6 relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      {/* Formas decorativas de fond */}
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

      {/* Conteneur principal avec glassmorphism */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Header avec logo et titre */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              {/* Glow effect detrás del logo */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div 
                className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                style={{ borderColor: branding.primaryColor }}
              >
                {branding.logo ? (
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full rounded-full"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                    }}
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Título con icono y effet Sparkles */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <UserPlus 
              className="w-6 h-6 sm:w-8 sm:h-8" 
              style={{ color: branding.primaryColor }}
            />
            <h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: branding.primaryColor 
              }}
            >
              {t('nav.recruitment')}
            </h1>
            <Sparkles 
              className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
              style={{ color: branding.secondaryColor }}
            />
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Total Candidats */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                boxShadow: `0 4px 15px ${branding.primaryColor}40`
              }}
            >
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Total Candidats</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.total}
                  </p>
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* En Attente */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">En Attente</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.pending}
                  </p>
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Entretiens */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Entretiens</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.interview}
                  </p>
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Acceptés */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                boxShadow: `0 4px 15px ${branding.secondaryColor}40`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Acceptés</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.accepted}
                  </p>
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="mb-6 border-gray-200/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" style={{ color: branding.primaryColor }} />
                  <Input
                    placeholder="Rechercher par nom, poste ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-[#1a4d7a] focus:ring-[#1a4d7a]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger 
                    className="w-full sm:w-56 h-11 border-gray-300"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="reviewed">Examiné</SelectItem>
                    <SelectItem value="interview">Entretien</SelectItem>
                    <SelectItem value="accepted">Accepté</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="h-11 px-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Nouvelle candidature
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de candidats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCandidates.map((candidate, index) => {
              // Alternar colores
              const cardColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
              
              // ✅ Obtener número de archivo si existe
              const numeroArchivo = obtenerNumeroArchivoCandidato(candidate);
              
              return (
                <Card 
                  key={candidate.id}
                  className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-gray-200/50 overflow-hidden group"
                >
                  {/* Barra de color superior */}
                  <div 
                    className="h-1.5 w-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}dd 100%)` 
                    }}
                  />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                          style={{ 
                            background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                            boxShadow: `0 4px 12px ${cardColor}30`
                          }}
                        >
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle 
                            className="text-base sm:text-lg truncate" 
                            style={{ 
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#333333'
                            }}
                          >
                            {candidate.name}
                          </CardTitle>
                          <p className="text-sm text-[#666666] truncate">{candidate.position}</p>
                          {/* ✅ Mostrar número de archivo si existe */}
                          {numeroArchivo && (
                            <div className="flex items-center gap-1 mt-1">
                              <FileText className="w-3 h-3" style={{ color: branding.primaryColor }} />
                              <span 
                                className="text-xs font-mono font-semibold tracking-wide"
                                style={{ color: branding.primaryColor }}
                              >
                                {numeroArchivo}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(candidate.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                      <Mail className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                      <Phone className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                      <span>Candidature: {new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                      <span>{candidate.availability}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                      <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                      <span className="line-clamp-1">{candidate.experience}</span>
                    </div>

                    {/* Mostrar departamentos asignados */}
                    {candidate.departamentoIds && candidate.departamentoIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200/50">
                        <span className="text-xs font-medium text-[#666666] flex items-center gap-1">
                          <Users className="w-3 h-3" style={{ color: branding.primaryColor }} />
                          Département{candidate.departamentoIds.length > 1 ? 's' : ''}:
                        </span>
                        {candidate.departamentoIds.map(deptId => {
                          const dept = departamentosDisponibles.find(d => d.id === deptId);
                          if (!dept) return null;
                          return (
                            <Badge 
                              key={deptId}
                              className="text-xs px-2 py-0.5 border-0 shadow-sm"
                              style={{ 
                                backgroundColor: `${dept.color}15`,
                                color: dept.color,
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 600
                              }}
                            >
                              <span className="mr-1">{dept.icono}</span>
                              {dept.nombre}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      {(() => {
                        const tieneContacto = obtenerContactoCandidato(candidate);
                        
                        if (tieneContacto) {
                          // Si tiene contacto, mostrar botón para eliminar contacto
                          return (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:scale-105 transition-all duration-300 hover:bg-orange-50 border-2"
                              style={{ 
                                fontFamily: 'Montserrat, sans-serif',
                                color: '#ff6b35',
                                borderColor: '#ff6b35'
                              }}
                              onClick={() => handleEliminarContacto(candidate)}
                              title="Supprimer le contact du département"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          );
                        } else {
                          // Si no tiene contacto, mostrar botón para asignar
                          return (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:scale-105 transition-all duration-300"
                              style={{ 
                                fontFamily: 'Montserrat, sans-serif',
                                color: branding.secondaryColor,
                                borderColor: `${branding.secondaryColor}40`,
                                backgroundColor: `${branding.secondaryColor}10`
                              }}
                              onClick={() => {
                                setCandidatoParaAssignar(candidate);
                                setDialogAssignerOpen(true);
                              }}
                              title="Assigner au département"
                            >
                              <Link className="w-4 h-4" />
                            </Button>
                          );
                        }
                      })()}
                      
                      <Select 
                        value={candidate.status}
                        onValueChange={(value) => handleStatusChange(candidate.id, value)}
                      >
                        <SelectTrigger 
                          className="flex-1 h-9 text-sm border-gray-300"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="reviewed">Examiné</SelectItem>
                          <SelectItem value="interview">Entretien</SelectItem>
                          <SelectItem value="accepted">Accepté</SelectItem>
                          <SelectItem value="rejected">Rejeté</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:scale-105 transition-all duration-300"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: cardColor,
                          borderColor: `${cardColor}30`
                        }}
                        onClick={() => {
                          setCandidatoParaPerfil(candidate);
                          setDialogPerfilOpen(true);
                        }}
                        title="Voir le profil détaillé"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:scale-105 transition-all duration-300 hover:bg-red-50 border-2"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#DC3545',
                          borderColor: '#DC3545'
                        }}
                        onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                        title="Supprimer la candidature"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Estado vacío */}
          {filteredCandidates.length === 0 && (
            <Card className="border-gray-200/50">
              <CardContent className="p-12 text-center">
                <div 
                  className="inline-flex p-6 rounded-full mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}20 0%, ${branding.secondaryColor}20 100%)`
                  }}
                >
                  <Users className="w-16 h-16" style={{ color: branding.primaryColor }} />
                </div>
                <p 
                  className="text-xl font-semibold mb-2" 
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    color: branding.primaryColor
                  }}
                >
                  Aucun candidat trouvé
                </p>
                <p className="text-[#666666] text-sm">
                  Essayez de modifier vos critères de recherche ou filtres
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog: Assigner au Département */}
      <Dialog open={dialogAssignerOpen} onOpenChange={setDialogAssignerOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="assigner-departement-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Assigner au Département
            </DialogTitle>
            <DialogDescription id="assigner-departement-description">
              Sélectionnez le département où {candidatoParaAssignar?.name} sera assigné comme bénévole
            </DialogDescription>
          </DialogHeader>

          {candidatoParaAssignar && (
            <div className="space-y-6">
              {/* Información del candidat */}
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: `${branding.primaryColor}10`, 
                  borderLeftColor: branding.primaryColor
                }}
              >
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  Candidat Sélectionné
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nom:</strong> {candidatoParaAssignar.name}</p>
                  <p><strong>Poste:</strong> {candidatoParaAssignar.position}</p>
                  <p><strong>Email:</strong> {candidatoParaAssignar.email}</p>
                  <p><strong>Téléphone:</strong> {candidatoParaAssignar.phone}</p>
                  <p><strong>Disponibilité:</strong> {candidatoParaAssignar.availability}</p>
                </div>
              </div>

              {/* Selector de département */}
              <div className="space-y-3">
                <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Sélectionner le Département
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {departamentosDisponibles.map((dept) => {
                    const yaAsignado = verificarCandidatoAsignado(candidatoParaAssignar, dept.id);
                    const esSeleccionado = departamentoSeleccionado === dept.id;
                    
                    return (
                      <button
                        key={dept.id}
                        onClick={() => !yaAsignado && setDepartamentoSeleccionado(dept.id)}
                        disabled={yaAsignado}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                          yaAsignado 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-105'
                        } ${
                          esSeleccionado 
                            ? 'shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        style={{
                          borderColor: esSeleccionado 
                            ? dept.color 
                            : yaAsignado 
                              ? '#DC3545' 
                              : '#e5e7eb',
                          backgroundColor: esSeleccionado 
                            ? `${dept.color}10` 
                            : yaAsignado 
                              ? '#DC354510' 
                              : 'white'
                        }}
                        title={yaAsignado ? `Déjà assigné au département ${dept.nombre}` : `Assigner au département ${dept.nombre}`}
                      >
                        {/* Indicador de ya asignado */}
                        {yaAsignado && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-[#DC3545]" />
                          </div>
                        )}
                        
                        <div className="text-3xl mb-2">{dept.icono}</div>
                        <p 
                          className="font-semibold text-sm"
                          style={{ 
                            fontFamily: 'Montserrat, sans-serif',
                            color: esSeleccionado 
                              ? dept.color 
                              : yaAsignado 
                                ? '#DC3545' 
                                : '#666666'
                          }}
                        >
                          {dept.nombre}
                        </p>
                        
                        {/* Texto de estado */}
                        {yaAsignado && (
                          <p className="text-xs mt-1" style={{ color: '#DC3545' }}>
                            Déjà assigné
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogAssignerOpen(false);
                    setCandidatoParaAssignar(null);
                    setDepartamentoSeleccionado('');
                  }}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Annuler
                </Button>
                <Button
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{\n                    background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,\n                    fontFamily: 'Montserrat, sans-serif'\n                  }}
                  onClick={handleAssignerCandidat}
                  disabled={!departamentoSeleccionado}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Assigner au Département
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Profil Détaillé du Candidat */}
      <Dialog open={dialogPerfilOpen} onOpenChange={setDialogPerfilOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="perfil-candidato-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Users className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Profil du Candidat
            </DialogTitle>
            <DialogDescription id="perfil-candidato-description">
              Détails complets de la candidature de {candidatoParaPerfil?.name}
            </DialogDescription>
          </DialogHeader>

          {candidatoParaPerfil && (() => {
            const numeroArchivo = obtenerNumeroArchivoCandidato(candidatoParaPerfil);
            const cardColor = branding.primaryColor;
            
            return (
              <div className="space-y-6">
                {/* En-tête du profil avec avatar */}
                <div 
                  className="p-6 rounded-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                        boxShadow: `0 4px 12px ${cardColor}30`
                      }}
                    >
                      <Users className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-2xl font-bold mb-1"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: branding.primaryColor
                        }}
                      >
                        {candidatoParaPerfil.name}
                      </h3>
                      <p className="text-lg mb-2" style={{ color: branding.secondaryColor }}>
                        {candidatoParaPerfil.position}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(candidatoParaPerfil.status)}
                        {numeroArchivo && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80">
                            <FileText className="w-4 h-4" style={{ color: branding.primaryColor }} />
                            <span 
                              className="text-sm font-mono font-semibold tracking-wide"
                              style={{ color: branding.primaryColor }}
                            >
                              {numeroArchivo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="space-y-3">
                  <h4 
                    className="font-semibold text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    <Mail className="w-5 h-5" />
                    Coordonnées
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Mail className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium">{candidatoParaPerfil.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Phone className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                        <p className="text-sm font-medium">{candidatoParaPerfil.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adresse (si disponible) */}
                {(candidatoParaPerfil.adresse || candidatoParaPerfil.ville || candidatoParaPerfil.codePostal || candidatoParaPerfil.appartement) && (
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <MapPin className="w-5 h-5" />
                      Adresse
                    </h4>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="space-y-2">
                        {candidatoParaPerfil.adresse && (
                          <p className="text-sm font-medium">{candidatoParaPerfil.adresse}</p>
                        )}
                        {candidatoParaPerfil.appartement && (
                          <p className="text-sm text-gray-600">Apt/Unité: {candidatoParaPerfil.appartement}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {candidatoParaPerfil.ville && <span>{candidatoParaPerfil.ville}</span>}
                          {candidatoParaPerfil.ville && candidatoParaPerfil.codePostal && <span>•</span>}
                          {candidatoParaPerfil.codePostal && <span>{candidatoParaPerfil.codePostal}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Détails de la candidature */}
                <div className="space-y-3">
                  <h4 
                    className="font-semibold text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    <Briefcase className="w-5 h-5" />
                    Détails de la candidature
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Calendar className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date de candidature</p>
                        <p className="text-sm font-medium">
                          {new Date(candidatoParaPerfil.applicationDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Disponibilité</p>
                        <p className="text-sm font-medium">{candidatoParaPerfil.availability}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expérience */}
                <div className="space-y-3">
                  <h4 
                    className="font-semibold text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Expérience
                  </h4>
                  <div 
                    className="p-4 rounded-xl border-l-4"
                    style={{ 
                      backgroundColor: `${branding.secondaryColor}10`,
                      borderLeftColor: branding.secondaryColor
                    }}
                  >
                    <p className="text-sm leading-relaxed">{candidatoParaPerfil.experience}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-between pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogPerfilOpen(false);
                        setCandidatoParaPerfil(null);
                      }}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Fermer
                    </Button>
                  </div>
                  
                  <div className="flex gap-3">
                    {(() => {
                      const tieneContacto = obtenerContactoCandidato(candidatoParaPerfil);
                      
                      if (tieneContacto) {
                        return (
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                            onClick={() => handleEliminarContacto(candidatoParaPerfil)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer le contact
                          </Button>
                        );
                      } else {
                        return (
                          <Button
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                            onClick={() => {
                              setDialogPerfilOpen(false);
                              setCandidatoParaAssignar(candidatoParaPerfil);
                              setDialogAssignerOpen(true);
                            }}
                          >
                            <Link className="w-4 h-4 mr-2" />
                            Assigner au département
                          </Button>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}