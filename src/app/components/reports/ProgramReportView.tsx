/**
 * Vista de Reporte por Programa
 */

import React from 'react';
import { Activity, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export function ProgramReportView() {
  const programs = [
    { id: '1', name: 'Distribución Regular', type: 'regular', exits: 45, value: 42300, beneficiaries: 1250, effectiveness: 92, status: 'active' },
    { id: '2', name: 'Emergencia Alimentaria', type: 'emergency', exits: 28, value: 31200, beneficiaries: 890, effectiveness: 88, status: 'active' },
    { id: '3', name: 'Programa Escolar', type: 'seasonal', exits: 24, value: 24100, beneficiaries: 680, effectiveness: 95, status: 'active' },
    { id: '4', name: 'Ayuda a Refugios', type: 'special', exits: 20, value: 15800, beneficiaries: 430, effectiveness: 85, status: 'active' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Programas Activos</span>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-gray-500">4 emergencia</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Distribuciones</span>
            <Package className="w-5 h-5 text-[#2d9561]" />
          </div>
          <p className="text-2xl font-bold">132</p>
          <p className="text-xs text-gray-500">este mes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Beneficiarios</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">3,450</p>
          <p className="text-xs text-gray-500">personas atendidas</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Efectividad</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">90%</p>
          <p className="text-xs text-gray-500">promedio general</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Desempeño de Programas</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programs.map(program => (
              <div key={program.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={
                      program.type === 'emergency' ? 'bg-red-50 text-red-700' :
                      program.type === 'regular' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }>
                      {program.type}
                    </Badge>
                    <div>
                      <p className="font-bold text-gray-900">{program.name}</p>
                      <p className="text-sm text-gray-500">
                        {program.exits} entregas • {program.beneficiaries} personas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">CAD$ {program.value.toLocaleString()}</p>
                    <Badge className="bg-green-600">Activo</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Efectividad</span>
                    <span className="font-medium">{program.effectiveness}%</span>
                  </div>
                  <Progress value={program.effectiveness} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgramReportView;
