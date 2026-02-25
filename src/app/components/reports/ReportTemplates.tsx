/**
 * Plantillas de Reportes
 * 
 * Colección de plantillas predefinidas para diferentes tipos de reportes
 * con configuración y estructura optimizada.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingCart,
  Building2,
  FileSearch,
  TrendingUp,
  Users,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { TableColumn } from '../utils/exportUtils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'inventory' | 'orders' | 'organisms' | 'audit' | 'statistics';
  columns: TableColumn[];
  suggestedFormat: 'pdf' | 'excel' | 'csv';
  filters?: string[];
  color: string;
}

interface ReportTemplatesProps {
  onSelectTemplate: (template: ReportTemplate) => void;
}

export function ReportTemplates({ onSelectTemplate }: ReportTemplatesProps) {
  const { t } = useTranslation();
  
  // Plantillas predefinidas
  const templates: ReportTemplate[] = [
    {
      id: 'inventory-full',
      name: t('reports.templates.inventoryFull', 'Inventario Completo'),
      description: t('reports.templates.inventoryFullDesc', 'Reporte detallado de todo el inventario'),
      icon: <Package className="w-5 h-5" />,
      category: 'inventory',
      suggestedFormat: 'excel',
      color: 'blue',
      filters: ['category', 'temperature', 'stock'],
      columns: [
        { header: 'Código', key: 'code', width: 80, align: 'center' },
        { header: 'Producto', key: 'name', width: 150 },
        { header: 'Categoría', key: 'category', width: 100 },
        { header: 'Subcategoría', key: 'subcategory', width: 100 },
        { header: 'Stock', key: 'stock', width: 60, align: 'right' },
        { header: 'Unidad', key: 'unit', width: 60, align: 'center' },
        { header: 'Peso (kg)', key: 'weight', width: 80, align: 'right' },
        { header: 'Temperatura', key: 'temperature', width: 90 },
        { header: 'Ubicación', key: 'location', width: 100 },
        { header: 'Valor', key: 'value', width: 80, align: 'right' }
      ]
    },
    {
      id: 'inventory-low-stock',
      name: t('reports.templates.lowStock', 'Stock Bajo'),
      description: t('reports.templates.lowStockDesc', 'Productos con stock por debajo del mínimo'),
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'inventory',
      suggestedFormat: 'pdf',
      color: 'red',
      filters: ['category'],
      columns: [
        { header: 'Código', key: 'code', width: 80, align: 'center' },
        { header: 'Producto', key: 'name', width: 150 },
        { header: 'Categoría', key: 'category', width: 100 },
        { header: 'Stock Actual', key: 'currentStock', width: 80, align: 'right' },
        { header: 'Stock Mínimo', key: 'minStock', width: 80, align: 'right' },
        { header: 'Diferencia', key: 'difference', width: 80, align: 'right' },
        { header: 'Estado', key: 'status', width: 80, align: 'center' }
      ]
    },
    {
      id: 'inventory-expiring',
      name: t('reports.templates.expiringSoon', 'Próximos a Vencer'),
      description: t('reports.templates.expiringSoonDesc', 'Productos próximos a fecha de vencimiento'),
      icon: <Calendar className="w-5 h-5" />,
      category: 'inventory',
      suggestedFormat: 'pdf',
      color: 'amber',
      filters: ['days', 'category'],
      columns: [
        { header: 'Código', key: 'code', width: 80, align: 'center' },
        { header: 'Producto', key: 'name', width: 150 },
        { header: 'Lote', key: 'lot', width: 100 },
        { header: 'Stock', key: 'stock', width: 60, align: 'right' },
        { header: 'F. Vencimiento', key: 'expiryDate', width: 100 },
        { header: 'Días Restantes', key: 'daysRemaining', width: 100, align: 'right' },
        { header: 'Prioridad', key: 'priority', width: 80, align: 'center' }
      ]
    },
    {
      id: 'orders-pending',
      name: t('reports.templates.pendingOrders', 'Pedidos Pendientes'),
      description: t('reports.templates.pendingOrdersDesc', 'Pedidos en estado pendiente o preparación'),
      icon: <ShoppingCart className="w-5 h-5" />,
      category: 'orders',
      suggestedFormat: 'excel',
      color: 'green',
      filters: ['status', 'organism', 'dateRange'],
      columns: [
        { header: 'N° Pedido', key: 'orderNumber', width: 100, align: 'center' },
        { header: 'Organismo', key: 'organism', width: 150 },
        { header: 'Fecha Pedido', key: 'orderDate', width: 100 },
        { header: 'F. Entrega', key: 'deliveryDate', width: 100 },
        { header: 'Estado', key: 'status', width: 90, align: 'center' },
        { header: 'Productos', key: 'productCount', width: 70, align: 'right' },
        { header: 'Peso Total', key: 'totalWeight', width: 90, align: 'right' },
        { header: 'Valor', key: 'totalValue', width: 90, align: 'right' }
      ]
    },
    {
      id: 'orders-completed',
      name: t('reports.templates.completedOrders', 'Pedidos Completados'),
      description: t('reports.templates.completedOrdersDesc', 'Historial de pedidos entregados'),
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'orders',
      suggestedFormat: 'excel',
      color: 'green',
      filters: ['dateRange', 'organism'],
      columns: [
        { header: 'N° Pedido', key: 'orderNumber', width: 100, align: 'center' },
        { header: 'Organismo', key: 'organism', width: 150 },
        { header: 'F. Pedido', key: 'orderDate', width: 90 },
        { header: 'F. Entrega', key: 'deliveryDate', width: 90 },
        { header: 'Productos', key: 'productCount', width: 70, align: 'right' },
        { header: 'Peso (kg)', key: 'totalWeight', width: 80, align: 'right' },
        { header: 'Valor Total', key: 'totalValue', width: 90, align: 'right' },
        { header: 'Responsable', key: 'responsible', width: 100 }
      ]
    },
    {
      id: 'organisms-active',
      name: t('reports.templates.activeOrganisms', 'Organismos Activos'),
      description: t('reports.templates.activeOrganismsDesc', 'Listado de organismos beneficiarios'),
      icon: <Building2 className="w-5 h-5" />,
      category: 'organisms',
      suggestedFormat: 'excel',
      color: 'purple',
      filters: ['type', 'status'],
      columns: [
        { header: 'Código', key: 'code', width: 80, align: 'center' },
        { header: 'Nombre', key: 'name', width: 150 },
        { header: 'Tipo', key: 'type', width: 100 },
        { header: 'Contacto', key: 'contact', width: 120 },
        { header: 'Teléfono', key: 'phone', width: 100 },
        { header: 'Email', key: 'email', width: 150 },
        { header: 'Barrio', key: 'neighborhood', width: 100 },
        { header: 'Estado', key: 'status', width: 80, align: 'center' }
      ]
    },
    {
      id: 'audit-logs',
      name: t('reports.templates.auditLogs', 'Registro de Auditoría'),
      description: t('reports.templates.auditLogsDesc', 'Actividad del sistema y usuarios'),
      icon: <FileSearch className="w-5 h-5" />,
      category: 'audit',
      suggestedFormat: 'csv',
      color: 'gray',
      filters: ['dateRange', 'module', 'user', 'severity'],
      columns: [
        { header: 'Fecha/Hora', key: 'timestamp', width: 130 },
        { header: 'Usuario', key: 'user', width: 100 },
        { header: 'Módulo', key: 'module', width: 100 },
        { header: 'Acción', key: 'action', width: 150 },
        { header: 'Severidad', key: 'severity', width: 80, align: 'center' },
        { header: 'Estado', key: 'status', width: 70, align: 'center' },
        { header: 'Detalles', key: 'details', width: 200 }
      ]
    },
    {
      id: 'statistics-monthly',
      name: t('reports.templates.monthlyStats', 'Estadísticas Mensuales'),
      description: t('reports.templates.monthlyStatsDesc', 'Resumen de actividad del mes'),
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'statistics',
      suggestedFormat: 'pdf',
      color: 'indigo',
      filters: ['month', 'year'],
      columns: [
        { header: 'Indicador', key: 'metric', width: 150 },
        { header: 'Valor', key: 'value', width: 100, align: 'right' },
        { header: 'Mes Anterior', key: 'previousMonth', width: 100, align: 'right' },
        { header: 'Variación', key: 'change', width: 80, align: 'right' },
        { header: 'Tendencia', key: 'trend', width: 80, align: 'center' }
      ]
    }
  ];
  
  // Agrupar por categoría
  const categories = {
    inventory: templates.filter(t => t.category === 'inventory'),
    orders: templates.filter(t => t.category === 'orders'),
    organisms: templates.filter(t => t.category === 'organisms'),
    audit: templates.filter(t => t.category === 'audit'),
    statistics: templates.filter(t => t.category === 'statistics')
  };
  
  // Colores según categoría
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'orders':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'organisms':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'audit':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'statistics':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Inventario */}
      {categories.inventory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {t('reports.categories.inventory', 'Inventario')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.inventory.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
                colorClass={getCategoryColor(template.category)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Pedidos */}
      {categories.orders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            {t('reports.categories.orders', 'Pedidos')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.orders.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
                colorClass={getCategoryColor(template.category)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Organismos */}
      {categories.organisms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            {t('reports.categories.organisms', 'Organismos')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.organisms.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
                colorClass={getCategoryColor(template.category)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Auditoría y Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.audit.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-gray-600" />
              {t('reports.categories.audit', 'Auditoría')}
            </h3>
            <div className="space-y-4">
              {categories.audit.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                  colorClass={getCategoryColor(template.category)}
                />
              ))}
            </div>
          </div>
        )}
        
        {categories.statistics.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              {t('reports.categories.statistics', 'Estadísticas')}
            </h3>
            <div className="space-y-4">
              {categories.statistics.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                  colorClass={getCategoryColor(template.category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de plantilla
interface TemplateCardProps {
  template: ReportTemplate;
  onSelect: () => void;
  colorClass: string;
}

function TemplateCard({ template, onSelect, colorClass }: TemplateCardProps) {
  const { t } = useTranslation();
  
  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${colorClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border">
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate">
                {template.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {template.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="uppercase">
            {template.suggestedFormat}
          </Badge>
          <span className="text-gray-500">
            {template.columns.length} {t('reports.columns', 'columnas')}
          </span>
        </div>
        
        {template.filters && template.filters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.filters.map((filter) => (
              <span
                key={filter}
                className="text-xs px-2 py-0.5 bg-white border rounded"
              >
                {filter}
              </span>
            ))}
          </div>
        )}
        
        <Button
          onClick={onSelect}
          className="w-full"
          size="sm"
        >
          {t('reports.useTemplate', 'Usar Plantilla')}
        </Button>
      </CardContent>
    </Card>
  );
}

export type { ReportTemplate };
