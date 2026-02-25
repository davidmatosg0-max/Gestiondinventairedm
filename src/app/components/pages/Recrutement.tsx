import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
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
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

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
}

export function Recrutement() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, status: newStatus as Candidate['status'] } : c)
    );
    toast.success('Statut mis à jour avec succès');
  };

  return (
    <div 
      className="min-h-screen p-3 sm:p-4 md:p-6 relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
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

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Header con logo y título */}
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

          {/* Título con icono y efecto Sparkles */}
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

          {/* Lista de candidatos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCandidates.map((candidate, index) => {
              // Alternar colores
              const cardColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
              
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

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
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
                        className="hover:scale-105 transition-all duration-300 border-gray-300"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: cardColor,
                          borderColor: `${cardColor}30`
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Voir CV
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
    </div>
  );
}