/**
 * Vista de Reporte de Entradas
 * 
 * Reporte detallado de todas las entradas de productos
 * con filtros, gráficos y exportación.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  ChevronDown,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import type { ReportPeriod } from '../../types/reports';

export function EntryReportView() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ReportPeriod>('thisMonth');
  const [selectedDonor, setSelectedDonor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo (en producción vendrían del backend)
  const reportData = useMemo(() => ({
    summary: {
      totalEntries: 145,
      totalProducts: 432,
      totalQuantity: 15680,
      totalValue: 125420,
      uniqueDonors: 28,
      averageEntryValue: 865.10,
      topDonor: 'Costco Montreal',
      topCategory: 'Alimentos Secos'
    },
    byDonor: [
      {
        donorId: '1',
        donorName: 'Costco Montreal',
        donorType: 'company',
        totalEntries: 24,
        totalValue: 28450,
        percentage: 22.7
      },
      {
        donorId: '2',
        donorName: 'Metro Plus',
        donorType: 'company',
        totalEntries: 18,
        totalValue: 21200,
        percentage: 16.9
      },
      {
        donorId: '3',
        donorName: 'Loblaws',
        donorType: 'company',
        totalEntries: 16,
        totalValue: 18900,
        percentage: 15.1
      },
      {
        donorId: '4',
        donorName: 'IGA Extra',
        donorType: 'company',
        totalEntries: 14,
        totalValue: 16200,
        percentage: 12.9
      },
      {
        donorId: '5',
        donorName: 'Provigo',
        donorType: 'company',
        totalEntries: 12,
        totalValue: 14100,
        percentage: 11.2
      }
    ],
    byCategory: [
      { category: 'Alimentos Secos', totalValue: 42300, percentage: 33.7, totalQuantity: 8450 },
      { category: 'Productos Frescos', totalValue: 31200, percentage: 24.9, totalQuantity: 3210 },
      { category: 'Productos Enlatados', totalValue: 28900, percentage: 23.0, totalQuantity: 2890 },
      { category: 'Lácteos', totalValue: 15600, percentage: 12.4, totalQuantity: 890 },
      { category: 'Otros', totalValue: 7420, percentage: 5.9, totalQuantity: 240 }
    ],
    recentEntries: [
      {
        id: '1',
        entryNumber: 'ENT-2026-00145',
        date: new Date('2026-02-23'),
        donorName: 'Costco Montreal',
        warehouseName: 'Bodega Central',
        productCount: 8,
        totalQuantity: 450,
        totalValue: 3250,
        status: 'verified'
      },
      {
        id: '2',
        entryNumber: 'ENT-2026-00144',
        date: new Date('2026-02-22'),
        donorName: 'Metro Plus',
        warehouseName: 'Bodega Norte',
        productCount: 12,
        totalQuantity: 680,
        totalValue: 4120,
        status: 'received'
      },
      {
        id: '3',
        entryNumber: 'ENT-2026-00143',
        date: new Date('2026-02-22'),
        donorName: 'Loblaws',
        warehouseName: 'Bodega Central',
        productCount: 6,
        totalQuantity: 320,
        totalValue: 2890,
        status: 'verified'
      },
      {
        id: '4',
        entryNumber: 'ENT-2026-00142',
        date: new Date('2026-02-21'),
        donorName: 'IGA Extra',
        warehouseName: 'Bodega Sur',
        productCount: 10,
        totalQuantity: 520,
        totalValue: 3650,
        status: 'verified'
      },
      {
        id: '5',
        entryNumber: 'ENT-2026-00141',
        date: new Date('2026-02-21'),
        donorName: 'Provigo',
        warehouseName: 'Bodega Central',
        productCount: 7,
        totalQuantity: 380,
        totalValue: 2940,
        status: 'pending'
      }
    ]
  }), []);

  // Exportar reporte
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Exportando reporte en formato ${format.toUpperCase()}...`);
    // Aquí iría la lógica real de exportación
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#1a4d7a]" />
            {t('reports.filters', 'Filtros')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {/* Período */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('reports.period', 'Período')}
              </label>
              <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('reports.today', 'Hoy')}</SelectItem>
                  <SelectItem value="yesterday">{t('reports.yesterday', 'Ayer')}</SelectItem>
                  <SelectItem value="last7days">{t('reports.last7days', 'Últimos 7 días')}</SelectItem>
                  <SelectItem value="last30days">{t('reports.last30days', 'Últimos 30 días')}</SelectItem>
                  <SelectItem value="thisMonth">{t('reports.thisMonth', 'Este mes')}</SelectItem>
                  <SelectItem value="lastMonth">{t('reports.lastMonth', 'Mes pasado')}</SelectItem>
                  <SelectItem value="thisYear">{t('reports.thisYear', 'Este año')}</SelectItem>
                  <SelectItem value="custom">{t('reports.custom', 'Personalizado')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Donador */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('reports.donor', 'Donador')}
              </label>
              <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allDonors', 'Todos los donadores')}</SelectItem>
                  {reportData.byDonor.map(donor => (
                    <SelectItem key={donor.donorId} value={donor.donorId}>
                      {donor.donorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('reports.category', 'Categoría')}
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allCategories', 'Todas las categorías')}</SelectItem>
                  {reportData.byCategory.map((cat, index) => (
                    <SelectItem key={index} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('reports.search', 'Buscar')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('reports.searchPlaceholder', 'Buscar entrada...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm">
              {t('reports.clearFilters', 'Limpiar Filtros')}
            </Button>
            <Button size="sm" className="bg-[#1a4d7a] hover:bg-[#153d62]">
              {t('reports.applyFilters', 'Aplicar Filtros')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen General */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {t('reports.totalEntries', 'Total Entradas')}
              </span>
              <Package className="w-5 h-5 text-[#1a4d7a]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {reportData.summary.totalEntries}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {reportData.summary.totalProducts} productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {t('reports.totalQuantity', 'Cantidad Total')}
              </span>
              <BarChart3 className="w-5 h-5 text-[#2d9561]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {reportData.summary.totalQuantity.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {t('reports.totalValue', 'Valor Total')}
              </span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              CAD$ {reportData.summary.totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Promedio: CAD$ {reportData.summary.averageEntryValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {t('reports.uniqueDonors', 'Donadores Activos')}
              </span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {reportData.summary.uniqueDonors}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Top: {reportData.summary.topDonor}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Detalles */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Donadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2d9561]" />
              {t('reports.topDonors', 'Top 5 Donadores')}
            </CardTitle>
            <CardDescription>
              {t('reports.topDonorsDesc', 'Donadores con mayor valor de donaciones')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.byDonor.map((donor, index) => (
                <div key={donor.donorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-[#1a4d7a] text-white border-0">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{donor.donorName}</p>
                      <p className="text-xs text-gray-500">
                        {donor.totalEntries} entradas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      CAD$ {donor.totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {donor.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1a4d7a]" />
              {t('reports.byCategory', 'Distribución por Categoría')}
            </CardTitle>
            <CardDescription>
              {t('reports.byCategoryDesc', 'Valor total por categoría de producto')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.byCategory.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{category.category}</span>
                    <span className="text-gray-900 font-bold">
                      CAD$ {category.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1a4d7a] to-[#2d9561]"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {category.totalQuantity.toLocaleString()} unidades
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Entradas Recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1a4d7a]" />
                {t('reports.recentEntries', 'Entradas Recientes')}
              </CardTitle>
              <CardDescription>
                {t('reports.recentEntriesDesc', 'Últimas entradas registradas en el período')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    # Entrada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Donador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bodega
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Productos
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.recentEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-medium text-[#1a4d7a]">
                      {entry.entryNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.date.toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.donorName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.warehouseName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {entry.productCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {entry.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      CAD$ {entry.totalValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={
                          entry.status === 'verified'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : entry.status === 'received'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {entry.status === 'verified' ? 'Verificado' :
                         entry.status === 'received' ? 'Recibido' : 'Pendiente'}
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

export default EntryReportView;
