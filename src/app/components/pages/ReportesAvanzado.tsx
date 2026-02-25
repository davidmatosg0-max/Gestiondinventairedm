import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Download, Calendar, BarChart3, TrendingUp, 
  Package, Users, Truck, FileSpreadsheet, Filter,
  ArrowUp, ArrowDown, Activity, DollarSign, PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { mockProductos, mockComandas, mockOrganismos, mockMovimientos, mockRegistrosPRS } from '../../data/mockData';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function ReportesAvanzado() {
  const { t } = useTranslation();
  const [tipoReporte, setTipoReporte] = useState('general');
  const [fechaInicio, setFechaInicio] = useState('2025-01-01');
  const [fechaFin, setFechaFin] = useState('2025-01-31');
  const [periodoComparacion, setPeriodoComparacion] = useState('mes');

  // Cálculos de métricas
  const totalProductos = mockProductos.length;
  const totalComandas = mockComandas.length;
  const comandasCompletadas = mockComandas.filter(c => c.estado === 'completada' || c.estado === 'entregada').length;
  const tasaCumplimiento = totalComandas > 0 ? ((comandasCompletadas / totalComandas) * 100).toFixed(1) : 0;
  const totalBeneficiarios = mockOrganismos.reduce((sum, o) => sum + o.beneficiarios, 0);
  const organismosActivos = mockOrganismos.filter(o => o.activo).length;
  const totalKgPRS = mockRegistrosPRS.reduce((sum, r) => sum + r.totalKg, 0);

  // Datos de inventario por categoría
  const categorias = Array.from(new Set(mockProductos.map(p => p.categoria || 'Sin categoría')));
  const datosInventarioCategoria = categorias.map(cat => {
    const productos = mockProductos.filter(p => p.categoria === cat);
    const stockTotal = productos.reduce((sum, p) => sum + p.stockActual, 0);
    return {
      categoria: cat,
      stock: stockTotal,
      productos: productos.length
    };
  });

  // Datos de comandas por mes (últimos 6 meses)
  const datosComandasMes = [
    { mes: 'Ago', comandas: 38, completadas: 35, canceladas: 3 },
    { mes: 'Sep', comandas: 45, completadas: 42, canceladas: 3 },
    { mes: 'Oct', comandas: 52, completadas: 48, canceladas: 4 },
    { mes: 'Nov', comandas: 48, completadas: 45, canceladas: 3 },
    { mes: 'Dic', comandas: 58, completadas: 55, canceladas: 3 },
    { mes: 'Ene', comandas: 42, completadas: 38, canceladas: 4 }
  ];

  // Datos de organismos con beneficiarios
  const datosOrganismosBeneficiarios = mockOrganismos.map(org => ({
    nombre: org.nombre.length > 20 ? org.nombre.substring(0, 20) + '...' : org.nombre,
    beneficiarios: org.beneficiarios,
    activo: org.activo
  }));

  // Datos de PRS por mes
  const datosPRSMes = [
    { mes: 'Ago', kg: 980, rescates: 15 },
    { mes: 'Sep', kg: 1200, rescates: 18 },
    { mes: 'Oct', kg: 1450, rescates: 22 },
    { mes: 'Nov', kg: 1380, rescates: 20 },
    { mes: 'Dic', kg: 1590, rescates: 24 },
    { mes: 'Ene', kg: 1420, rescates: 21 }
  ];

  // Datos de movimientos de inventario
  const entradasMes = mockMovimientos.filter(m => m.tipo === 'entrada').length;
  const salidasMes = mockMovimientos.filter(m => m.tipo === 'salida').length;
  const transformacionesMes = mockMovimientos.filter(m => m.tipo === 'transformacion').length;

  const datosMovimientos = [
    { tipo: 'Entradas', cantidad: entradasMes, color: '#4CAF50' },
    { tipo: 'Salidas', cantidad: salidasMes, color: '#DC3545' },
    { tipo: 'Transformaciones', cantidad: transformacionesMes, color: '#1E73BE' }
  ];

  // Datos radar de rendimiento
  const datosRendimiento = [
    { metrica: 'Cumplimiento', valor: parseFloat(tasaCumplimiento) },
    { metrica: 'Rotación', valor: 75 },
    { metrica: 'Eficiencia', valor: 82 },
    { metrica: 'Cobertura', valor: 68 },
    { metrica: 'Rescates PRS', valor: 90 }
  ];

  // Top 5 productos más distribuidos
  const topProductos = mockProductos
    .map(p => ({
      nombre: p.nombre,
      distribuido: Math.floor(Math.random() * 500) + 100 // Simulado
    }))
    .sort((a, b) => b.distribuido - a.distribuido)
    .slice(0, 5);

  const COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#00BCD4'];

  const handleGenerarReporte = (formato: 'pdf' | 'excel') => {
    const nombreArchivo = `Reporte_${tipoReporte}_${fechaInicio}_${fechaFin}.${formato}`;
    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Reporte generado exitosamente</span>
        <span className="text-sm text-[#666666]">{nombreArchivo}</span>
      </div>,
      { duration: 4000 }
    );
  };

  const handleExportarDatos = () => {
    toast.success('Datos exportados en formato CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#333333' }}>
            {t('reports.title')}
          </h1>
          <p className="text-[#666666]">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportarDatos}
            variant="outline"
            className="border-[#1E73BE] text-[#1E73BE]"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      <Card className="border-l-4 border-l-[#1E73BE]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <Filter className="w-5 h-5" />
            {t('reports.generate')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>{t('reports.reportType')}</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Ejecutivo</SelectItem>
                  <SelectItem value="inventario">Inventario Detallado</SelectItem>
                  <SelectItem value="comandas">Comandas y Distribución</SelectItem>
                  <SelectItem value="prs">Rescates PRS</SelectItem>
                  <SelectItem value="organismos">Organismos y Beneficiarios</SelectItem>
                  <SelectItem value="transporte">Logística y Transporte</SelectItem>
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
              <Label>Período Comparación</Label>
              <Select value={periodoComparacion} onValueChange={setPeriodoComparacion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Día anterior</SelectItem>
                  <SelectItem value="semana">Semana anterior</SelectItem>
                  <SelectItem value="mes">Mes anterior</SelectItem>
                  <SelectItem value="anio">Año anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.export')}</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerarReporte('pdf')}
                  className="flex-1 bg-[#DC3545] hover:bg-[#c82333]"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleGenerarReporte('excel')}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Total Productos</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#1E73BE' }}>{totalProductos}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm text-[#4CAF50]">+12% vs mes anterior</span>
                </div>
              </div>
              <Package className="w-12 h-12 text-[#1E73BE] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Tasa Cumplimiento</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#4CAF50' }}>{tasaCumplimiento}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm text-[#4CAF50]">+5% vs mes anterior</span>
                </div>
              </div>
              <Activity className="w-12 h-12 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Total Beneficiarios</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#FFC107' }}>{totalBeneficiarios.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm text-[#4CAF50]">+8% vs mes anterior</span>
                </div>
              </div>
              <Users className="w-12 h-12 text-[#FFC107] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#9C27B0]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">PRS Rescatados (kg)</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#9C27B0' }}>{totalKgPRS.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown className="w-4 h-4 text-[#DC3545]" />
                  <span className="text-sm text-[#DC3545]">-3% vs mes anterior</span>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-[#9C27B0] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reportes Avanzados */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="general" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <BarChart3 className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="inventario" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Package className="w-4 h-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="comandas" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <FileText className="w-4 h-4 mr-2" />
            Comandas
          </TabsTrigger>
          <TabsTrigger value="prs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <TrendingUp className="w-4 h-4 mr-2" />
            PRS
          </TabsTrigger>
          <TabsTrigger value="organismos" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Users className="w-4 h-4 mr-2" />
            Organismos
          </TabsTrigger>
        </TabsList>

        {/* Tab General */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Rendimiento general - Radar chart */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Índice de Rendimiento General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={datosRendimiento}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metrica" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Rendimiento" dataKey="valor" stroke="#1E73BE" fill="#1E73BE" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución de movimientos */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Movimientos de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosMovimientos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.tipo}: ${entry.cantidad}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {datosMovimientos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 productos más distribuidos */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Top 5 Productos Más Distribuidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad Distribuida</TableHead>
                    <TableHead className="text-right">Tendencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductos.map((producto, index) => (
                    <TableRow key={`top-producto-${producto.nombre}-${index}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell className="text-right">{producto.distribuido} kg</TableCell>
                      <TableCell className="text-right">
                        {index % 2 === 0 ? (
                          <Badge className="bg-[#4CAF50]">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            +{Math.floor(Math.random() * 20) + 5}%
                          </Badge>
                        ) : (
                          <Badge className="bg-[#FFC107]">
                            <ArrowDown className="w-3 h-3 mr-1" />
                            -{Math.floor(Math.random() * 10) + 2}%
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Inventario */}
        <TabsContent value="inventario" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Stock por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosInventarioCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#1E73BE" name="Stock (kg)" />
                    <Bar dataKey="productos" fill="#4CAF50" name="# Productos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Distribución de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosInventarioCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.categoria}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="stock"
                    >
                      {datosInventarioCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Comandas */}
        <TabsContent value="comandas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Evolución de Comandas (Últimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={datosComandasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="comandas" stackId="1" stroke="#1E73BE" fill="#1E73BE" name="Total Comandas" />
                  <Area type="monotone" dataKey="completadas" stackId="2" stroke="#4CAF50" fill="#4CAF50" name="Completadas" />
                  <Area type="monotone" dataKey="canceladas" stackId="2" stroke="#DC3545" fill="#DC3545" name="Canceladas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Tasa de Éxito</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                  {tasaCumplimiento}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Tiempo Promedio Preparación</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                  2.3 días
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Comandas Pendientes</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>
                  {mockComandas.filter(c => c.estado === 'pendiente').length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab PRS */}
        <TabsContent value="prs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Rescates PRS por Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={datosPRSMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="kg" stroke="#4CAF50" strokeWidth={3} name="Kg Rescatados" />
                  <Line yAxisId="right" type="monotone" dataKey="rescates" stroke="#1E73BE" strokeWidth={3} name="# Rescates" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Total KG Rescatados</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                  {totalKgPRS.toLocaleString()} kg
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Organismos Participantes</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                  {mockOrganismos.filter(o => o.participaPRS).length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#9C27B0]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Promedio por Rescate</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#9C27B0' }}>
                  {mockRegistrosPRS.length > 0 ? (totalKgPRS / mockRegistrosPRS.length).toFixed(1) : '0.0'} kg
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Organismos */}
        <TabsContent value="organismos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Beneficiarios por Organismo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosOrganismosBeneficiarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="beneficiarios" fill="#4CAF50" name="Beneficiarios" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Total Organismos</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                  {mockOrganismos.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Activos</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                  {organismosActivos}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#DC3545]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Inactivos</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#DC3545' }}>
                  {mockOrganismos.length - organismosActivos}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Total Beneficiarios</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>
                  {totalBeneficiarios.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}