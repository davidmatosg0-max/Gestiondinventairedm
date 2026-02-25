/**
 * Vista de Reporte por Donador
 */

import React from 'react';
import { Users, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function DonorReportView() {
  const donors = [
    { id: '1', name: 'Costco Montreal', type: 'company', donations: 24, value: 28450, frequency: 5.2, growth: 15.3 },
    { id: '2', name: 'Metro Plus', type: 'company', donations: 18, value: 21200, frequency: 3.9, growth: 8.7 },
    { id: '3', name: 'Loblaws', type: 'company', donations: 16, value: 18900, frequency: 3.5, growth: -2.1 },
    { id: '4', name: 'IGA Extra', type: 'company', donations: 14, value: 16200, frequency: 3.0, growth: 12.4 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Donadores Activos</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">28</p>
          <p className="text-xs text-gray-500">de 45 totales</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Donaciones</span>
            <Package className="w-5 h-5 text-[#2d9561]" />
          </div>
          <p className="text-2xl font-bold">145</p>
          <p className="text-xs text-gray-500">este mes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Valor Total</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">CAD$ 125,420</p>
          <p className="text-xs text-gray-500">promedio mensual</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Crecimiento</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">+12.5%</p>
          <p className="text-xs text-gray-500">vs mes anterior</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ranking de Donadores</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {donors.map((donor, index) => (
              <div key={donor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#1a4d7a] text-white">#{index + 1}</Badge>
                  <div>
                    <p className="font-bold text-gray-900">{donor.name}</p>
                    <p className="text-sm text-gray-500">{donor.donations} donaciones • Frecuencia: {donor.frequency}/mes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">CAD$ {donor.value.toLocaleString()}</p>
                  <p className={`text-sm ${donor.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {donor.growth >= 0 ? '+' : ''}{donor.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DonorReportView;
