import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useBranding } from '../../../hooks/useBranding';

interface ComptoirDashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export function ComptoirDashboard({ onNavigate }: ComptoirDashboardProps) {
  const { t } = useTranslation();
  const branding = useBranding();

  // Données mock - VACÍO PARA PRODUCCIÓN
  const stats = {
    beneficiairesActifs: 0,
    rdvAujourdhui: 0,
    aidesDistribuees: 0
  };

  const activitesRecentes: any[] = [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'beneficiaire': return <Users className="w-4 h-4" />;
      case 'rdv': return <Calendar className="w-4 h-4" />;
      case 'aide': return <Package className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'haute': return '#DC3545';
      case 'normale': return '#1E73BE';
      case 'basse': return '#666666';
      default: return '#666666';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Ligne 1 — Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
          style={{ borderLeftColor: '#1E73BE' }}
          onClick={() => onNavigate('beneficiaires')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.activeBeneficiaries')}</p>
                <p className="text-3xl font-bold" style={{ color: '#1E73BE', fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.beneficiairesActifs}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-[#4CAF50]" />
                  <span className="text-xs text-[#4CAF50]">+12% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
                <Users className="w-6 h-6" style={{ color: '#1E73BE' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
          style={{ borderLeftColor: '#4CAF50' }}
          onClick={() => onNavigate('rendez-vous')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.appointmentsToday')}</p>
                <p className="text-3xl font-bold" style={{ color: '#4CAF50', fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.rdvAujourdhui}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-[#666666]" />
                  <span className="text-xs text-[#666666]">3 en attente</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                <Calendar className="w-6 h-6" style={{ color: '#4CAF50' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
          style={{ borderLeftColor: '#FFC107' }}
          onClick={() => onNavigate('aide-alimentaire')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.aidsDistributed')}</p>
                <p className="text-3xl font-bold" style={{ color: '#FFC107', fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.aidesDistribuees}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-[#4CAF50]" />
                  <span className="text-xs text-[#4CAF50]">+8% cette semaine</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                <Package className="w-6 h-6" style={{ color: '#FFC107' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ligne 2 — Activités récentes */}
      <Card>
        <CardHeader className="border-b bg-[#F4F4F4]">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.125rem' }}>
            {t('comptoir.recentActivities')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {activitesRecentes.map((activite) => (
              <div 
                key={activite.id} 
                className="p-4 hover:bg-[#F4F4F4] transition-colors cursor-pointer"
                onClick={() => {
                  if (activite.type === 'beneficiaire') onNavigate('beneficiaires', activite.id.toString());
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: `${getPriorityColor(activite.priorite)}20` }}
                  >
                    <div style={{ color: getPriorityColor(activite.priorite) }}>
                      {getActivityIcon(activite.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {activite.nom}
                        </p>
                        <p className="text-sm text-[#666666] mt-0.5">
                          {activite.action}
                        </p>
                      </div>
                      <span className="text-xs text-[#999999] whitespace-nowrap">
                        {activite.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ligne 3 — Actions rapides */}
      <Card className="bg-gradient-to-br from-[#1E73BE] to-[#1557A0]">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
            {t('comptoir.quickActions')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              className="bg-white text-[#1E73BE] hover:bg-gray-100 h-auto py-4 justify-start"
              onClick={() => onNavigate('beneficiaires')}
            >
              <Users className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('comptoir.newBeneficiary')}
                </div>
                <div className="text-xs opacity-75">
                  {t('comptoir.createNewRecord')}
                </div>
              </div>
            </Button>
            <Button 
              className="bg-white text-[#1E73BE] hover:bg-gray-100 h-auto py-4 justify-start"
              onClick={() => onNavigate('rendez-vous')}
            >
              <Calendar className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('comptoir.newAppointment')}
                </div>
                <div className="text-xs opacity-75">
                  {t('comptoir.scheduleAppointment')}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}