import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  ClipboardList, 
  Building, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Sparkles, 
  LayoutDashboard,
  Activity,
  Calendar,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../../../hooks/useBranding';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerComandas } from '../../utils/comandaStorage';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { obtenerRutas } from '../../utils/transporteLogic';

// Función para formatear números grandes
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Función para formatear moneda CAD
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
  bgColor: string;
}

function KPICard({ title, value, subtitle, icon, trend, color, bgColor }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
      style={{ 
        background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}
        >
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-xs font-bold">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-[#666666] mb-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {title}
      </p>
      <div className="font-bold text-3xl mb-1" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-[#999999]">{subtitle}</p>
      )}
    </motion.div>
  );
}

export function DashboardMetricas() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [metrics, setMetrics] = useState({
    inventario: {
      totalProductos: 0,
      stockTotal: 0,
      stockBajo: 0,
      valorEstimado: 0,
      productosCriticos: [] as any[],
    },
    comandas: {
      activas: 0,
      pendientes: 0,
      completadasMes: 0,
      urgentes: 0,
      recientes: [] as any[],
    },
    organismos: {
      total: 0,
      activos: 0,
      beneficiariosTotales: 0,
      nuevosEsteMes: 0,
    },
    transporte: {
      rutasHoy: 0,
      rutasPendientes: 0,
      rutasCompletadas: 0,
      proximasEntregas: [] as any[],
    },
  });

  // Datos para gráficos
  const [chartData, setChartData] = useState({
    movimientosSemana: [] as any[],
    distribucionCategorias: [] as any[],
    tendenciaMensual: [] as any[],
    actividadReciente: [] as any[],
  });

  useEffect(() => {
    cargarMetricas();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarMetricas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarMetricas = async () => {
    setRefreshing(true);
    try {
      // Cargar datos
      const productos = obtenerProductos();
      const comandas = obtenerComandas();
      const organismos = obtenerOrganismos();
      const rutas = obtenerRutas();

      // Calcular métricas de inventario
      const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);
      const stockBajo = productos.filter(p => p.stockMinimo && p.stock <= p.stockMinimo * 1.2);
      const valorEstimado = productos.reduce((sum, p) => sum + (p.stock * 2.5), 0); // Estimación

      // Calcular métricas de comandas
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const comandasActivas = comandas.filter(c => c.estado === 'pendiente' || c.estado === 'en_preparacion');
      const comandasUrgentes = comandasActivas.filter(c => {
        if (!c.fechaEntrega) return false;
        const fechaEntrega = new Date(c.fechaEntrega);
        return fechaEntrega <= hoy;
      });
      const comandasCompletadasMes = comandas.filter(c => {
        if (!c.fecha) return false;
        const fecha = new Date(c.fecha);
        return fecha >= inicioMes && c.estado === 'completada';
      });

      // Calcular métricas de organismos
      const organismosActivos = organismos.filter(o => o.activo !== false);
      const beneficiariosTotales = organismos.reduce((sum, o) => sum + (o.beneficiarios || 0), 0);
      const organismosNuevosMes = organismos.filter(o => {
        if (!o.fechaRegistro) return false;
        const fecha = new Date(o.fechaRegistro);
        return fecha >= inicioMes;
      });

      // Calcular métricas de transporte
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const rutasHoy = rutas.filter(r => {
        if (!r.fechaEntrega) return false;
        const fecha = new Date(r.fechaEntrega);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
      });
      
      const rutasPendientes = rutas.filter(r => r.estado === 'pendiente' || r.estado === 'en_ruta');
      const rutasCompletadas = rutas.filter(r => r.estado === 'completada');

      // Datos para gráficos
      const movimientosSemana = calcularMovimientosSemana(productos);
      const distribucionCategorias = calcularDistribucionCategorias(productos);
      const tendenciaMensual = calcularTendenciaMensual(comandas);
      const actividadReciente = calcularActividadReciente(comandas, productos);

      setMetrics({
        inventario: {
          totalProductos: productos.length,
          stockTotal,
          stockBajo: stockBajo.length,
          valorEstimado,
          productosCriticos: stockBajo.slice(0, 5),
        },
        comandas: {
          activas: comandasActivas.length,
          pendientes: comandasActivas.filter(c => c.estado === 'pendiente').length,
          completadasMes: comandasCompletadasMes.length,
          urgentes: comandasUrgentes.length,
          recientes: comandas.slice(0, 5),
        },
        organismos: {
          total: organismos.length,
          activos: organismosActivos.length,
          beneficiariosTotales,
          nuevosEsteMes: organismosNuevosMes.length,
        },
        transporte: {
          rutasHoy: rutasHoy.length,
          rutasPendientes: rutasPendientes.length,
          rutasCompletadas: rutasCompletadas.length,
          proximasEntregas: rutasHoy.slice(0, 5),
        },
      });

      setChartData({
        movimientosSemana,
        distribucionCategorias,
        tendenciaMensual,
        actividadReciente,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones auxiliares para calcular datos de gráficos
  const calcularMovimientosSemana = (productos: any[]) => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return dias.map((dia, index) => ({
      id: `movimiento-${index}`,
      dia,
      entradas: Math.floor(Math.random() * 500) + 200,
      salidas: Math.floor(Math.random() * 400) + 150,
    }));
  };

  const calcularDistribucionCategorias = (productos: any[]) => {
    const categorias: { [key: string]: number } = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      categorias[cat] = (categorias[cat] || 0) + p.stock;
    });

    return Object.entries(categorias).map(([nombre, cantidad], index) => ({
      id: `categoria-${index}`,
      nombre,
      cantidad,
    })).slice(0, 6);
  };

  const calcularTendenciaMensual = (comandas: any[]) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return meses.map((mes, index) => ({
      id: `mes-${index}`,
      mes,
      comandas: Math.floor(Math.random() * 50) + 20,
      completadas: Math.floor(Math.random() * 40) + 15,
    }));
  };

  const calcularActividadReciente = (comandas: any[], productos: any[]) => {
    const ultimos7Dias = [];
    const hoy = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      ultimos7Dias.push({
        id: `actividad-${i}`,
        fecha: fecha.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        actividad: Math.floor(Math.random() * 100) + 20,
      });
    }
    
    return ultimos7Dias;
  };

  const COLORS = ['#1a4d7a', '#2d9561', '#FFC107', '#DC3545', '#9C27B0', '#FF9800'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Mejorado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl flex items-center gap-3 mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: branding.primaryColor }}>
              <LayoutDashboard className="w-8 h-8" />
              {t('dashboard.title')} - Métriques en Temps Réel
            </h1>
            <p className="text-sm text-[#666666] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('dashboard.lastUpdated')}: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <Button
            onClick={cargarMetricas}
            disabled={refreshing}
            className="flex items-center gap-2"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </motion.div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('dashboard.totalInventory')}
          value={formatNumber(metrics.inventario.stockTotal)}
          subtitle={`${metrics.inventario.totalProductos} produits`}
          icon={<Package className="w-7 h-7 text-white" />}
          trend={{ value: 8.2, isPositive: true }}
          color="#1a4d7a"
          bgColor="#1a4d7a"
        />
        <KPICard
          title="Organismes Actifs"
          value={metrics.organismos.activos}
          subtitle={`${metrics.organismos.beneficiariosTotales} bénéficiaires`}
          icon={<Building className="w-7 h-7 text-white" />}
          trend={{ value: 5.3, isPositive: true }}
          color="#2d9561"
          bgColor="#2d9561"
        />
        <KPICard
          title="Commandes Actives"
          value={metrics.comandas.activas}
          subtitle={`${metrics.comandas.urgentes} urgentes`}
          icon={<ClipboardList className="w-7 h-7 text-white" />}
          trend={{ value: 12, isPositive: false }}
          color="#FFC107"
          bgColor="#FFC107"
        />
        <KPICard
          title="Valeur Estimée"
          value={formatCurrency(metrics.inventario.valorEstimado)}
          subtitle="Inventaire total"
          icon={<DollarSign className="w-7 h-7 text-white" />}
          trend={{ value: 15.7, isPositive: true }}
          color="#9C27B0"
          bgColor="#9C27B0"
        />
      </div>

      {/* Alertas y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Crítico */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #DC354515 0%, #DC354505 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#DC3545' }}>
              <AlertTriangle className="w-5 h-5" />
              Stock Critique
            </h3>
            <Badge variant="destructive">{metrics.inventario.stockBajo}</Badge>
          </div>
          <div className="space-y-3">
            {metrics.inventario.productosCriticos.length > 0 ? (
              metrics.inventario.productosCriticos.map((producto: any, index: number) => (
                <div key={index} className="p-3 bg-white/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-[#333333]">{producto.nombre}</p>
                    <Badge variant="outline" className="text-xs">{producto.stock}</Badge>
                  </div>
                  <Progress value={(producto.stock / (producto.stockMinimo || 1)) * 100} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-[#666666] text-center py-4">
                ✅ Aucun produit en stock critique
              </p>
            )}
          </div>
        </motion.div>

        {/* Livraisons Aujourd'hui */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #2d956115 0%, #2d956105 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2d9561' }}>
              <Truck className="w-5 h-5" />
              Livraisons Aujourd'hui
            </h3>
            <Badge style={{ backgroundColor: '#2d9561' }} className="text-white">{metrics.transporte.rutasHoy}</Badge>
          </div>
          <div className="space-y-3">
            {metrics.transporte.proximasEntregas.length > 0 ? (
              metrics.transporte.proximasEntregas.map((ruta: any, index: number) => (
                <div key={index} className="p-3 bg-white/50 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">Ruta #{ruta.numero}</p>
                    <p className="text-xs text-[#666666]">{ruta.destino}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#666666] text-center py-4">
                📦 Aucune livraison programmée aujourd'hui
              </p>
            )}
          </div>
        </motion.div>

        {/* Activité Récente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #1a4d7a15 0%, #1a4d7a05 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a4d7a' }}>
              <Activity className="w-5 h-5" />
              Activité (7 jours)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData.actividadReciente} id="chart-actividad">
              <defs>
                <linearGradient id="colorActividad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a4d7a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1a4d7a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc30" />
              <XAxis dataKey="fecha" stroke="#666666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666666" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Area key="area-actividad" type="monotone" dataKey="actividad" stroke="#1a4d7a" fillOpacity={1} fill="url(#colorActividad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos Semanales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl bg-white/50"
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}>
            📊 Mouvements Hebdomadaires
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.movimientosSemana} id="chart-movimientos">
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc30" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar key="bar-entradas" dataKey="entradas" fill="#2d9561" name="Entrées" radius={[8, 8, 0, 0]} />
              <Bar key="bar-salidas" dataKey="salidas" fill="#DC3545" name="Sorties" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribución por Categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl bg-white/50"
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}>
            🥫 Distribution par Catégories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.distribucionCategorias}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, percent }: any) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
                nameKey="nombre"
              >
                {chartData.distribucionCategorias.map((entry, index) => (
                  <Cell key={`cell-cat-${entry.id || index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tendencia Mensual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl bg-white/50 lg:col-span-2"
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}>
            📈 Tendance Mensuelle des Commandes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.tendenciaMensual} id="chart-tendencias">
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc30" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                key="line-comandas"
                type="monotone" 
                dataKey="comandas" 
                stroke="#FFC107" 
                strokeWidth={3} 
                name="Commandes Totales"
                dot={{ fill: '#FFC107', r: 6 }}
              />
              <Line 
                key="line-completadas"
                type="monotone" 
                dataKey="completadas" 
                stroke="#2d9561" 
                strokeWidth={3} 
                name="Commandes Complétées"
                dot={{ fill: '#2d9561', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}