import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Calendar, BarChart3, FileSpreadsheet, Sparkles, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockProductos, mockOrganismos } from '../../data/mockData';
import { toast } from 'sonner';
import { obtenerComandas } from '../../utils/comandaStorage';
import { 
  exportarInventarioPDF, 
  exportarComandasPDF, 
  exportarOrganismosPDF,
  exportarEstadisticasPDF 
} from '../../utils/exportarPDF';
import { 
  exportarInventarioExcel, 
  exportarComandasExcel, 
  exportarOrganismosExcel,
  exportarEstadisticasExcel 
} from '../../utils/exportarExcel';
import { useBranding } from '../../../hooks/useBranding';
import { AuditLogViewer } from '../auditoria/AuditLogViewer';

export function Reportes() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [tipoReporte, setTipoReporte] = useState('general');
  const [fechaInicio, setFechaInicio] = useState('2025-01-01');
  const [fechaFin, setFechaFin] = useState('2025-01-31');

  // Datos para gráficos
  const datosInventario = [
    { categoria: 'Cereales', stock: 2300 },
    { categoria: 'Legumbres', stock: 1800 },
    { categoria: 'Aceites', stock: 850 },
    { categoria: 'Verduras', stock: 450 },
    { categoria: 'Frutas', stock: 380 },
    { categoria: 'Lácteos', stock: 620 }
  ];

  const datosComandasMes = [
    { mes: 'Sep', comandas: 45 },
    { mes: 'Oct', comandas: 52 },
    { mes: 'Nov', comandas: 48 },
    { mes: 'Dic', comandas: 58 },
    { mes: 'Ene', comandas: 42 }
  ];

  const datosOrganismos = mockOrganismos.map((org, index) => ({
    id: org.id || `org-${index}`,
    nombre: org.nombre.length > 15 ? org.nombre.substring(0, 15) + '...' : org.nombre,
    beneficiarios: org.beneficiarios
  }));

  const datosPRS = [
    { mes: 'Sep', kg: 1200 },
    { mes: 'Oct', kg: 1450 },
    { mes: 'Nov', kg: 1380 },
    { mes: 'Dic', kg: 1590 },
    { mes: 'Ene', kg: 1420 }
  ];

  const COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#00BCD4'];

  const handleGenerarReporte = (formato: 'pdf' | 'excel') => {
    const comandas = obtenerComandas();
    
    try {
      switch (tipoReporte) {
        case 'inventario':
          if (formato === 'pdf') {
            exportarInventarioPDF(mockProductos);
          } else {
            exportarInventarioExcel(mockProductos);
          }
          break;
        
        case 'comandas':
          if (formato === 'pdf') {
            exportarComandasPDF(comandas);
          } else {
            exportarComandasExcel(comandas);
          }
          break;
        
        case 'organismos':
          if (formato === 'pdf') {
            exportarOrganismosPDF(mockOrganismos);
          } else {
            exportarOrganismosExcel(mockOrganismos);
          }
          break;
        
        case 'general':
        default:
          const estadisticas = {
            totalProductos: mockProductos.length,
            totalStock: mockProductos.reduce((sum, p) => sum + p.stockActual, 0),
            totalComandas: comandas.length,
            totalOrganismos: mockOrganismos.filter(o => o.activo).length,
            valorTotal: 25450.75,
            periodo: `${fechaInicio} - ${fechaFin}`,
          };
          
          if (formato === 'pdf') {
            exportarEstadisticasPDF(estadisticas);
          } else {
            exportarEstadisticasExcel({
              resumen: estadisticas,
              inventario: mockProductos.map(p => ({
                Código: p.codigo || 'N/A',
                Producto: p.nombre,
                Categoría: p.categoria,
                Stock: p.stockActual,
                Unidad: p.unidad,
              })),
              comandas: comandas.map(c => ({
                'N° Comanda': c.numero,
                Organismo: c.organismo?.nombre || 'N/A',
                Fecha: new Date(c.fecha).toLocaleDateString('es-ES'),
                Estado: c.estado,
              })),
              organismos: mockOrganismos.map(o => ({
                Nombre: o.nombre,
                Tipo: o.tipo || 'N/A',
                Beneficiarios: o.beneficiarios || 0,
                Estado: o.activo ? 'Activo' : 'Inactivo',
              })),
              periodo: `${fechaInicio} - ${fechaFin}`,
            });
          }
          break;
      }
      
      toast.success(`✅ Reporte ${formato.toUpperCase()} generado exitosamente`);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('❌ Error al generar el reporte');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado con colores del branding */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{
            bottom: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            animation: 'pulse 5s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            top: '50%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
            {t('reports.title')}
          </h1>
          <p className="text-gray-700">{t('reports.subtitle')}</p>
        </div>

      {/* Generador de Reportes con glassmorphism */}
      <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
          {t('reports.generate')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>{t('reports.reportType')}</Label>
            <Select value={tipoReporte} onValueChange={setTipoReporte}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">{t('reports.general')}</SelectItem>
                <SelectItem value="inventario">{t('nav.inventory')}</SelectItem>
                <SelectItem value="comandas">{t('nav.orders')}</SelectItem>
                <SelectItem value="prs">{t('nav.prs')}</SelectItem>
                <SelectItem value="organismos">{t('nav.organisms')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('reports.startDate')}</Label>
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('reports.endDate')}</Label>
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('common.export')}</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerarReporte('pdf')}
                className="flex-1 bg-[#DC3545] hover:bg-[#c82333]"
              >
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button
                onClick={() => handleGenerarReporte('excel')}
                className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]"
              >
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Reportes con glassmorphism */}
      <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full bg-transparent border-b rounded-none flex flex-wrap">
            <TabsTrigger value="general" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('reports.general')}
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.inventory')}
            </TabsTrigger>
            <TabsTrigger value="comandas" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.orders')}
            </TabsTrigger>
            <TabsTrigger value="prs" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.prs')}
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex-1 min-w-[120px] gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Shield className="w-4 h-4" />
              {t('audit.title', 'Auditoría')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 p-4 sm:p-6 pt-0">
            {/* Estadísticas con glassmorphism */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
                <p className="text-xs sm:text-sm text-gray-600">{t('reports.totalProducts')}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {mockProductos.length}
                </p>
              </div>

              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#4CAF50]">
                <p className="text-xs sm:text-sm text-gray-600">{t('reports.ordersMonth')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#4CAF50] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {obtenerComandas().length}
                </p>
              </div>

              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#FFC107]">
                <p className="text-xs sm:text-sm text-gray-600">{t('reports.organisms')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#FFC107] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {mockOrganismos.length}
                </p>
              </div>

              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#DC3545]">
                <p className="text-xs sm:text-sm text-gray-600">{t('reports.beneficiaries')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#DC3545] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {mockOrganismos.reduce((sum, o) => sum + o.beneficiarios, 0)}
                </p>
              </div>
            </div>

            {/* Gráficos con glassmorphism */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40">
                <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {t('reports.ordersMonth')}
                </h3>
                <ResponsiveContainer width="100%" height={300} key="linechart-comandas-mes">
                  <LineChart data={datosComandasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="comandas" stroke={branding.primaryColor} strokeWidth={2} name={t('nav.orders')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40">
                <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {t('reports.beneficiariesOrganism')}
                </h3>
                <ResponsiveContainer width="100%" height={300} key="barchart-organismos">
                  <BarChart data={datosOrganismos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiarios" fill="#4CAF50" name={t('reports.beneficiaries')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventario" className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40">
                <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {t('reports.stockCategory')}
                </h3>
                <ResponsiveContainer width="100%" height={300} key="barchart-inventario">
                  <BarChart data={datosInventario}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill={branding.primaryColor} name={t('reports.stockKg')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40">
                <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {t('reports.inventoryDistribution')}
                </h3>
                <ResponsiveContainer width="100%" height={300} key="piechart-inventario">
                  <PieChart>
                    <Pie
                      data={datosInventario}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.categoria}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="stock"
                    >
                      {datosInventario.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comandas" className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40">
              <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {t('reports.ordersEvolution')}
              </h3>
              <ResponsiveContainer width="100%" height={400} key="barchart-comandas">
                <BarChart data={datosComandasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="comandas" fill="#4CAF50" name={t('reports.completedOrders')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="prs" className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40">
              <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {t('reports.prsRescueMonth')}
              </h3>
              <ResponsiveContainer width="100%" height={400} key="linechart-prs">
                <LineChart data={datosPRS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kg" stroke="#4CAF50" strokeWidth={3} name={t('reports.rescuedKg')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-4 p-4 sm:p-6 pt-0">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}