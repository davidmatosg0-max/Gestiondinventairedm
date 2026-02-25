/**
 * Vista de Reporte de Salidas
 * 
 * Reporte detallado de todas las salidas/distribuciones
 * con filtros, gráficos y análisis por programa.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownCircle,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  Download,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export function ExitReportView() {
  const { t } = useTranslation();

  const reportData = {
    summary: {
      totalExits: 132,
      totalProducts: 389,
      totalQuantity: 14230,
      totalValue: 118930,
      totalBeneficiaries: 3450,
      uniquePrograms: 12,
      averageExitValue: 901.01
    },
    byProgram: [
      { programId: '1', programName: 'Distribución Regular', totalExits: 45, totalValue: 42300, beneficiaries: 1250, percentage: 35.6 },
      { programId: '2', programName: 'Emergencia Alimentaria', totalExits: 28, totalValue: 31200, beneficiaries: 890, percentage: 26.2 },
      { programId: '3', programName: 'Programa Escolar', totalExits: 24, totalValue: 24100, beneficiaries: 680, percentage: 20.3 },
      { programId: '4', programName: 'Ayuda a Refugios', totalExits: 20, totalValue: 15800, beneficiaries: 430, percentage: 13.3 },
      { programId: '5', programName: 'Otros Programas', totalExits: 15, totalValue: 5530, beneficiaries: 200, percentage: 4.6 }
    ],
    byOrganism: [
      { organismName: 'Banque Alimentaire Nord', totalExits: 32, beneficiaries: 980, percentage: 24.2 },
      { organismName: 'Centro Comunitario Este', totalExits: 28, beneficiaries: 760, percentage: 21.2 },
      { organismName: 'Refugio Municipal', totalExits: 24, beneficiaries: 540, percentage: 18.2 },
      { organismName: 'Escuela Primaria Jean-Talon', totalExits: 22, beneficiaries: 620, percentage: 16.7 },
      { organismName: 'Cocina Social Montreal', totalExits: 26, beneficiaries: 550, percentage: 19.7 }
    ],
    recentExits: [
      { id: '1', exitNumber: 'SAL-2026-00132', date: new Date('2026-02-23'), programName: 'Distribución Regular', organismName: 'Banque Nord', productCount: 6, totalQuantity: 380, totalValue: 2890, beneficiaries: 85, status: 'delivered' },
      { id: '2', exitNumber: 'SAL-2026-00131', date: new Date('2026-02-23'), programName: 'Emergencia', organismName: 'Centro Este', productCount: 8, totalQuantity: 420, totalValue: 3210, beneficiaries: 120, status: 'prepared' },
      { id: '3', exitNumber: 'SAL-2026-00130', date: new Date('2026-02-22'), programName: 'Programa Escolar', organismName: 'Escuela J-T', productCount: 5, totalQuantity: 290, totalValue: 2450, beneficiaries: 60, status: 'delivered' },
      { id: '4', exitNumber: 'SAL-2026-00129', date: new Date('2026-02-22'), programName: 'Ayuda Refugios', organismName: 'Refugio Mun', productCount: 7, totalQuantity: 350, totalValue: 2780, beneficiaries: 95, status: 'completed' },
      { id: '5', exitNumber: 'SAL-2026-00128', date: new Date('2026-02-21'), programName: 'Distribución Regular', organismName: 'Cocina Social', productCount: 9, totalQuantity: 510, totalValue: 3650, beneficiaries: 140, status: 'delivered' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Salidas</span>
              <ArrowDownCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{reportData.summary.totalExits}</p>
            <p className="text-xs text-gray-500">{reportData.summary.totalProducts} productos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Cantidad Total</span>
              <Package className="w-5 h-5 text-[#2d9561]" />
            </div>
            <p className="text-2xl font-bold">{reportData.summary.totalQuantity.toLocaleString()}</p>
            <p className="text-xs text-gray-500">unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Valor Total</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">CAD$ {reportData.summary.totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Prom: CAD$ {reportData.summary.averageExitValue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Beneficiarios</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{reportData.summary.totalBeneficiaries.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{reportData.summary.uniquePrograms} programas activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1a4d7a]" />
              Distribución por Programa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.byProgram.map(program => (
                <div key={program.programId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{program.programName}</p>
                    <p className="text-xs text-gray-500">{program.totalExits} salidas • {program.beneficiaries} personas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">CAD$ {program.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{program.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2d9561]" />
              Top Organismos Beneficiarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.byOrganism.map((organism, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{organism.organismName}</span>
                    <span className="text-gray-600">{organism.beneficiaries} personas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2d9561]" style={{ width: `${organism.percentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{organism.percentage.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-gray-500">{organism.totalExits} entregas</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1a4d7a]" />
              Salidas Recientes
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />PDF</Button>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Excel</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Salida</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organismo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Productos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Beneficiarios</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.recentExits.map(exit => (
                  <tr key={exit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#1a4d7a]">{exit.exitNumber}</td>
                    <td className="px-4 py-3 text-sm">{exit.date.toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 text-sm">{exit.programName}</td>
                    <td className="px-4 py-3 text-sm">{exit.organismName}</td>
                    <td className="px-4 py-3 text-sm text-right">{exit.productCount}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">CAD$ {exit.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{exit.beneficiaries}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={
                        exit.status === 'delivered' ? 'bg-green-50 text-green-700' :
                        exit.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                        'bg-yellow-50 text-yellow-700'
                      }>
                        {exit.status === 'delivered' ? 'Entregado' :
                         exit.status === 'completed' ? 'Completado' : 'Preparado'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExitReportView;
