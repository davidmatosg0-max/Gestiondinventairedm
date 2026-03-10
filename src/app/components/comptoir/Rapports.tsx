import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function Rapports() {
  const { t } = useTranslation();
  const [periode, setPeriode] = useState('month');
  const [typeAide, setTypeAide] = useState('all');

  // Données mock pour les graphiques - VACÍO PARA PRODUCCIÓN
  const stats = {
    totalBeneficiaires: 0,
    totalDistributions: 0,
    valeurTotale: '0.00',
    tendance: '0%'
  };

  const distributionsParType: Array<{ type: string; nombre: number; pourcentage: number }> = [];

  const evolutionMensuelle: Array<{ mois: string; distributions: number }> = [];

  return (
    <div className="space-y-6">
      {/* Barre de filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>{t('comptoir.period')}</Label>
                <Select value={periode} onValueChange={setPeriode}>
                  <SelectTrigger>
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">{t('comptoir.thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('comptoir.thisMonth')}</SelectItem>
                    <SelectItem value="quarter">{t('comptoir.thisQuarter')}</SelectItem>
                    <SelectItem value="year">{t('comptoir.thisYear')}</SelectItem>
                    <SelectItem value="custom">{t('comptoir.customPeriod')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('comptoir.aidType')}</Label>
                <Select value={typeAide} onValueChange={setTypeAide}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="panier-complet">{t('comptoir.completeBasket')}</SelectItem>
                    <SelectItem value="panier-familial">{t('comptoir.familyBasket')}</SelectItem>
                    <SelectItem value="aide-urgence">{t('comptoir.emergencyAid')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('comptoir.startDate')}</Label>
                <Input type="date" />
              </div>

              <div>
                <Label>{t('comptoir.endDate')}</Label>
                <Input type="date" />
              </div>
            </div>

            <Button className="bg-[#4CAF50] hover:bg-[#45a049] w-full lg:w-auto">
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')} PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4" style={{ borderLeftColor: '#1E73BE' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.totalBeneficiaries')}</p>
                <p className="text-3xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.totalBeneficiaires}
                </p>
              </div>
              <Users className="w-10 h-10 text-[#1E73BE] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: '#4CAF50' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.totalDistributions')}</p>
                <p className="text-3xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.totalDistributions}
                </p>
              </div>
              <Package className="w-10 h-10 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: '#FFC107' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.totalValue')}</p>
                <p className="text-3xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.valeurTotale}
                </p>
                <p className="text-xs text-[#666666]">CAD$</p>
              </div>
              <DollarSign className="w-10 h-10 text-[#FFC107] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: '#1E73BE' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.trend')}</p>
                <p className="text-3xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.tendance}
                </p>
                <p className="text-xs text-[#666666]">{t('comptoir.vsLastMonth')}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique - Distribution par type */}
        <Card>
          <CardHeader className="border-b bg-[#F4F4F4]">
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
              {t('comptoir.distributionByType')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {distributionsParType.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#333333]">{item.type}</span>
                    <span className="text-sm text-[#666666]">{item.nombre} ({item.pourcentage}%)</span>
                  </div>
                  <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${item.pourcentage}%`,
                        backgroundColor: ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545'][index % 4]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Graphique - Évolution mensuelle */}
        <Card>
          <CardHeader className="border-b bg-[#F4F4F4]">
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
              {t('comptoir.monthlyEvolution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end justify-between h-48 gap-2">
              {evolutionMensuelle.map((item, index) => {
                const maxValue = Math.max(...evolutionMensuelle.map(e => e.distributions));
                const height = (item.distributions / maxValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-[#1E73BE] to-[#4CAF50] rounded-t hover:opacity-80 transition-opacity cursor-pointer relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#333333] text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                          {item.distributions}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[#666666] mt-2 font-medium">{item.mois}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau résumé */}
      <Card>
        <CardHeader className="border-b bg-[#F4F4F4]">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
            {t('comptoir.summaryTable')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F4F4] border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.aidType')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.quantity')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.beneficiaries')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.averageValue')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.totalValue')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {distributionsParType.map((item, index) => (
                  <tr key={index} className="hover:bg-[#F4F4F4] transition-colors">
                    <td className="p-4 font-medium text-[#333333]">{item.type}</td>
                    <td className="p-4 text-[#666666]">{item.nombre}</td>
                    <td className="p-4 text-[#666666]">{Math.floor(item.nombre * 0.7)}</td>
                    <td className="p-4 text-[#666666]">45.50 CAD$</td>
                    <td className="p-4 font-semibold text-[#1E73BE]">
                      {(item.nombre * 45.5).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} CAD$
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#E3F2FD] font-semibold">
                  <td className="p-4">{t('common.total')}</td>
                  <td className="p-4">{stats.totalDistributions}</td>
                  <td className="p-4">{stats.totalBeneficiaires}</td>
                  <td className="p-4">-</td>
                  <td className="p-4 text-[#1E73BE]">{stats.valeurTotale} CAD$</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}