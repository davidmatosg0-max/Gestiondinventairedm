/**
 * Módulo Principal de Reportes
 * 
 * Sistema completo de reportes para entradas, salidas,
 * donadores y programas con visualización y exportación.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { EntryReportView } from './EntryReportView';
import { ExitReportView } from './ExitReportView';
import { DonorReportView } from './DonorReportView';
import { ProgramReportView } from './ProgramReportView';
import type { ReportType } from '../../types/reports';

export function ReportsModule() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ReportType>('entries');

  // Estadísticas rápidas (datos de ejemplo)
  const quickStats = {
    entries: {
      total: 145,
      value: 125420,
      growth: 12.5
    },
    exits: {
      total: 132,
      value: 118930,
      growth: -3.2
    },
    donors: {
      active: 28,
      total: 45,
      growth: 8.7
    },
    programs: {
      active: 12,
      beneficiaries: 3450,
      growth: 15.3
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl text-white shadow-lg">
                    <FileText className="w-8 h-8" />
                  </div>
                  {t('reports.title', 'Reportes')}
                </h1>
                <p className="text-gray-600">
                  {t('reports.subtitle', 'Sistema completo de reportes y análisis')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('reports.period', 'Período')}
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {t('reports.filters', 'Filtros')}
                </Button>
                <Button className="bg-[#2d9561] hover:bg-[#257a4f]">
                  <Download className="w-4 h-4 mr-2" />
                  {t('reports.export', 'Exportar')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Entradas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.entries', 'Entradas')}
                </span>
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.entries.total}
                  </p>
                  <p className="text-xs text-gray-500">
                    CAD$ {quickStats.entries.value.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +{quickStats.entries.growth}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salidas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.exits', 'Salidas')}
                </span>
                <ArrowDownCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.exits.total}
                  </p>
                  <p className="text-xs text-gray-500">
                    CAD$ {quickStats.exits.value.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    {quickStats.exits.growth}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donadores */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.donors', 'Donadores')}
                </span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.donors.active}
                  </p>
                  <p className="text-xs text-gray-500">
                    de {quickStats.donors.total} totales
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +{quickStats.donors.growth}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.programs', 'Programas')}
                </span>
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.programs.active}
                  </p>
                  <p className="text-xs text-gray-500">
                    {quickStats.programs.beneficiaries.toLocaleString()} beneficiarios
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +{quickStats.programs.growth}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de reportes */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportType)} className="space-y-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl">
            <TabsList className="grid grid-cols-4 w-full p-1 bg-gray-100/50">
              <TabsTrigger value="entries" className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                {t('reports.entries', 'Entradas')}
              </TabsTrigger>
              <TabsTrigger value="exits" className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                {t('reports.exits', 'Salidas')}
              </TabsTrigger>
              <TabsTrigger value="donors" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('reports.donors', 'Donadores')}
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t('reports.programs', 'Programas')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Reporte de Entradas */}
          <TabsContent value="entries">
            <EntryReportView />
          </TabsContent>

          {/* Tab: Reporte de Salidas */}
          <TabsContent value="exits">
            <ExitReportView />
          </TabsContent>

          {/* Tab: Reporte de Donadores */}
          <TabsContent value="donors">
            <DonorReportView />
          </TabsContent>

          {/* Tab: Reporte de Programas */}
          <TabsContent value="programs">
            <ProgramReportView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ReportsModule;
