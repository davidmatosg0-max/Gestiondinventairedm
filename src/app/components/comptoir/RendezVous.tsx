import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { BoutonRetourHeader } from '../shared/BoutonRetour';

interface RendezVousProps {
  onNavigate: (view: string, id?: string) => void;
  aidRequests: any[];
  aidTypes: any[];
}

export function RendezVous({ onNavigate, aidRequests = [], aidTypes = [] }: RendezVousProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Función para obtener el color del tipo de ayuda
  const getAidTypeColor = (aidTypeName: string) => {
    if (!aidTypes || aidTypes.length === 0) return '#4CAF50';
    const aidType = aidTypes.find(type => type.name === aidTypeName);
    return aidType?.color || '#4CAF50';
  };

  // Mock data pour les rendez-vous réguliers - VACÍO PARA PRODUCCIÓN
  const rendezvous: any[] = [];

  // Convertir demandes aprobadas en citas
  const approvedAidAppointments = aidRequests
    .filter(req => req.status === 'approved' && req.appointmentDate && req.appointmentTime)
    .map(req => ({
      id: `aid-${req.id}`,
      beneficiaire: req.beneficiaire,
      beneficiaireId: req.beneficiaireId,
      date: req.appointmentDate,
      heure: req.appointmentTime,
      motif: `Distribution: ${req.type}`,
      statut: 'confirme',
      notes: req.notes || '',
      type: 'aidRequest',
      quantity: req.quantite,
      estimatedValue: req.estimatedValue,
      aidType: req.type
    }));

  // Combinar citas regulares con las de ayuda
  const allRendezvous = [...rendezvous, ...approvedAidAppointments];

  const handleCreateRdv = () => {
    toast.success(t('comptoir.appointmentCreated'));
    setDialogOpen(false);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'confirme':
        return <Badge className="bg-[#4CAF50] hover:bg-[#4CAF50]">{t('comptoir.confirmed')}</Badge>;
      case 'attente':
        return <Badge className="bg-[#FFC107] hover:bg-[#FFC107] text-[#333333]">{t('comptoir.pending')}</Badge>;
      case 'annule':
        return <Badge className="bg-[#DC3545] hover:bg-[#DC3545]">{t('comptoir.cancelled')}</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirme': return '#4CAF50';
      case 'attente': return '#FFC107';
      case 'annule': return '#DC3545';
      default: return '#1E73BE';
    }
  };

  // Grouper les rendez-vous par date
  const rdvParDate = allRendezvous.reduce((acc: any, rdv) => {
    if (!acc[rdv.date]) {
      acc[rdv.date] = [];
    }
    acc[rdv.date].push(rdv);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <BoutonRetourHeader 
        onClick={() => onNavigate('dashboard')} 
        titre="Rendez-vous"
      />
      {/* Barre supérieure */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {t('comptoir.day')}
              </Button>
              <Button variant="outline" size="sm" className="bg-[#1E73BE] text-white hover:bg-[#1557A0] hover:text-white">
                {t('comptoir.week')}
              </Button>
              <Button variant="outline" size="sm">
                {t('comptoir.month')}
              </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4CAF50] hover:bg-[#45a049] w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('comptoir.newAppointment')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.createAppointment')}
                  </DialogTitle>
                  <DialogDescription id="rdv-description">
                    {t('comptoir.fillAppointmentInfo')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>{t('comptoir.beneficiary')} *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('comptoir.selectBeneficiary')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Marie Dubois</SelectItem>
                        <SelectItem value="2">Jean Martin</SelectItem>
                        <SelectItem value="3">Sophie Bernard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('common.date')} *</Label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <Label>{t('comptoir.time')} *</Label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                  </div>

                  <div>
                    <Label>{t('comptoir.reason')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('comptoir.selectReason')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distribution">{t('comptoir.foodDistribution')}</SelectItem>
                        <SelectItem value="consultation">{t('comptoir.socialConsultation')}</SelectItem>
                        <SelectItem value="suivi">{t('comptoir.regularFollowup')}</SelectItem>
                        <SelectItem value="autre">{t('comptoir.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('comptoir.notes')}</Label>
                    <Textarea placeholder={t('comptoir.additionalNotes')} className="min-h-[80px]" />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleCreateRdv} className="bg-[#4CAF50] hover:bg-[#45a049]">
                      {t('common.confirm')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Vue calendrier semaine */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Liste des jours avec rendez-vous */}
        {Object.keys(rdvParDate).map((dateStr) => {
          const date = new Date(dateStr);
          const rdvJour = rdvParDate[dateStr];
          
          return (
            <Card key={dateStr} className="lg:col-span-1">
              <CardHeader className="bg-[#F4F4F4] pb-3">
                <div className="text-center">
                  <div className="text-xs text-[#666666] uppercase">
                    {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-2xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {date.getDate()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {rdvJour.map((rdv: any) => (
                  <div
                    key={rdv.id}
                    className="p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${getStatusColor(rdv.statut)}20`, borderLeft: `3px solid ${getStatusColor(rdv.statut)}` }}
                    onClick={() => setSelectedRdv(rdv)}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-[#666666]" />
                      <span className="text-xs font-medium">{rdv.heure}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {rdv.beneficiaire}
                    </div>
                    <div className="text-xs text-[#666666] truncate mt-0.5">
                      {rdv.motif}
                    </div>
                    {rdv.type === 'aidRequest' && rdv.aidType && (
                      <div className="mt-1 pt-1 border-t border-gray-200">
                        <Badge 
                          variant="outline" 
                          className="text-xs px-1.5 py-0 h-5"
                          style={{
                            backgroundColor: `${getAidTypeColor(rdv.aidType)}10`,
                            color: getAidTypeColor(rdv.aidType),
                            borderColor: `${getAidTypeColor(rdv.aidType)}50`
                          }}
                        >
                          {rdv.aidType}
                        </Badge>
                        {rdv.quantity && (
                          <span className="text-xs text-[#666666] ml-1">
                            × {rdv.quantity}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Jours vides pour compléter la semaine */}
        {Array.from({ length: 7 - Object.keys(rdvParDate).length }).map((_, i) => (
          <Card key={`empty-${i}`} className="lg:col-span-1 opacity-50">
            <CardHeader className="bg-[#F4F4F4] pb-3">
              <div className="text-center">
                <div className="text-xs text-[#666666] uppercase">-</div>
                <div className="text-2xl font-bold text-[#CCCCCC]">-</div>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-center text-sm text-[#999999]">
              {t('comptoir.noAppointments')}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Panneau latéral - Détails du RDV sélectionné */}
      {selectedRdv && (
        <Card className="border-2 border-[#1E73BE]">
          <CardHeader className="bg-[#E3F2FD]">
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {t('comptoir.appointmentDetails')}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedRdv(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#666666]" />
                <span className="text-sm text-[#666666]">{t('comptoir.beneficiary')}</span>
              </div>
              <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {selectedRdv.beneficiaire}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#666666]" />
                  <span className="text-sm text-[#666666]">{t('common.date')}</span>
                </div>
                <p className="font-medium">{selectedRdv.date}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#666666]" />
                  <span className="text-sm text-[#666666]">{t('comptoir.time')}</span>
                </div>
                <p className="font-medium">{selectedRdv.heure}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#666666]" />
                <span className="text-sm text-[#666666]">{t('comptoir.reason')}</span>
              </div>
              <p className="font-medium">{selectedRdv.motif}</p>
            </div>

            <div>
              <span className="text-sm text-[#666666] mb-2 block">{t('common.status')}</span>
              {getStatusBadge(selectedRdv.statut)}
            </div>

            {selectedRdv.notes && (
              <div>
                <span className="text-sm text-[#666666] mb-2 block">{t('comptoir.notes')}</span>
                <p className="text-sm bg-[#F4F4F4] p-3 rounded">{selectedRdv.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                className="flex-1 bg-[#1E73BE] hover:bg-[#1557A0]"
                onClick={() => onNavigate('fiche-beneficiaire', '1')}
              >
                {t('comptoir.viewBeneficiary')}
              </Button>
              <Button variant="outline" className="flex-1">
                {t('common.edit')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}