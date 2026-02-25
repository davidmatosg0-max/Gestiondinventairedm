import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { mockTransportes } from '../../data/mockData';
import { GestionVehiculos } from '../transporte/GestionVehiculos';
import { PlanificacionRutas } from '../transporte/PlanificacionRutas';
import { VerificacionVehiculo } from '../transporte/VerificacionVehiculo';
import { GestionChoferes } from '../transporte/GestionChoferes';
import { useBranding } from '../../../hooks/useBranding';

export function Transporte() {
  const { t } = useTranslation();
  const branding = useBranding();
  const transportesPendientes = mockTransportes.filter(t => t.estado === 'pendiente').length;
  const transportesEnRuta = mockTransportes.filter(t => t.estado === 'en_ruta').length;
  const transportesEntregados = mockTransportes.filter(t => t.estado === 'entregado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glass rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
          >
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '2rem', color: branding.primaryColor }}>
                {t('transport.title')}
              </h1>
              <Sparkles className="w-5 h-5 animate-pulse" style={{ color: branding.secondaryColor }} />
            </div>
            <p className="text-[#666666]">{t('transport.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4 border-l-[#FFC107]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.pending')}</p>
              <p className="text-2xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {transportesPendientes}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
            >
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.onRoute')}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {transportesEnRuta}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: branding.secondaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.delivered')}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                {transportesEntregados}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
            >
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4 border-l-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.totalVehicles')}</p>
              <p className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                5
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #333333 0%, #555555 100%)' }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rutas" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="rutas" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            🗺️ {t('transport.routePlanning')}
          </TabsTrigger>
          <TabsTrigger value="vehiculos" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            🚛 {t('transport.vehicleManagement')}
          </TabsTrigger>
          <TabsTrigger value="choferes" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            👨‍✈️ Choferes
          </TabsTrigger>
          <TabsTrigger value="verificacion" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            🔍 Verificación SAAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rutas">
          <PlanificacionRutas />
        </TabsContent>

        <TabsContent value="vehiculos">
          <GestionVehiculos />
        </TabsContent>

        <TabsContent value="choferes">
          <GestionChoferes />
        </TabsContent>

        <TabsContent value="verificacion">
          <VerificacionVehiculo />
        </TabsContent>
      </Tabs>
    </div>
  );
}