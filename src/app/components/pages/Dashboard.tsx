import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ClipboardList, Building, TrendingUp, Clock, Users, DollarSign, AlertTriangle, Sparkles, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockProductos, mockComandas, mockOrganismos, mockMovimientos } from '../../data/mockData';
import { AlertaComandasUrgentes } from '../AlertaComandasUrgentes';
import { EntradaDonAchat } from '../EntradaDonAchat';
import { VerificacionesRecientes } from '../VerificacionesRecientes';
import { AlertasInteligentes } from '../inventario/AlertasInteligentes';
import { useBranding } from '../../../hooks/useBranding';
import { 
  obtenerProductosActivos, 
  type ProductoCreado 
} from '../../utils/productStorage';
import type { Comanda } from '../../types';

export function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalOrganismos: 0,
    organismosActivos: 0,
    totalProductos: 0,
    totalStock: 0,
    stockBajo: 0,
    comandasPendientes: 0,
    comandasMes: 0,
    valorTotalInventario: 0,
    personasAtendidas: 0,
  });
  const [productosStockBajo, setProductosStockBajo] = useState<ProductoCreado[]>([]);
  const [comandasRecientes, setComandasRecientes] = useState<Comanda[]>([]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    // Obtener datos de localStorage
    const productos = obtenerProductosActivos();
    const comandas = mockComandas; // Temporal: usar mockComandas hasta implementar obtenerComandas
    const organismos = mockOrganismos; // Temporal: usar mockOrganismos hasta implementar obtenerOrganismos

    // Calcular estadísticas
    const totalStock = productos.reduce((sum, p) => sum + p.stockActual, 0);
    const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo);
    const comandasPendientes = comandas.filter(c => c.estado === 'pendiente' || c.estado === 'en_preparacion').length;
    
    // Calcular valor total del inventario
    const valorTotal = productos.reduce((sum, p) => {
      const categoria = p.categoria; // Aquí deberías obtener el valorMonetario de la categoría
      return sum + (p.stockActual * 1.5); // Valor temporal, debe venir de categoría
    }, 0);

    setStats({
      totalOrganismos: organismos.length,
      organismosActivos: organismos.filter(o => o.activo).length,
      totalProductos: productos.length,
      totalStock: Math.round(totalStock),
      stockBajo: stockBajo.length,
      comandasPendientes,
      comandasMes: comandas.length,
      valorTotalInventario: Math.round(valorTotal),
      personasAtendidas: organismos.reduce((sum, o) => sum + (o.beneficiarios || 0), 0),
    });

    setProductosStockBajo(stockBajo.slice(0, 5));
    setComandasRecientes(comandas.slice(0, 5));
  };

  const totalProductos = stats.totalProductos;
  const stockTotal = stats.totalStock;
  const comandasPendientes = stats.comandasPendientes;
  const organismosActivos = stats.organismosActivos;

  // Datos para gráfico de movimientos
  const movimientosPorDia = [
    { id: 'lun', dia: 'Lun', entradas: 450, salidas: 280 },
    { id: 'mar', dia: 'Mar', entradas: 380, salidas: 320 },
    { id: 'mie', dia: 'Mié', entradas: 520, salidas: 290 },
    { id: 'jue', dia: 'Jue', entradas: 410, salidas: 350 },
    { id: 'vie', dia: 'Vie', entradas: 480, salidas: 310 },
    { id: 'sab', dia: 'Sáb', entradas: 320, salidas: 180 },
    { id: 'dom', dia: 'Dom', entradas: 290, salidas: 150 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header con diseño moderno */}
      <div className="card-glass rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl md:text-3xl flex items-center gap-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}>
              <LayoutDashboard className="w-8 h-8" />
              {t('dashboard.title')} - Entrepôt
            </h1>
            <p className="text-sm sm:text-base text-[#666666]">{t('dashboard.viewOverview') || 'Vue d\'ensemble du système de la Banque Alimentaire'}</p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <VerificacionesRecientes />
            <EntradaDonAchat />
          </div>
        </div>
      </div>

      {/* Stats Cards - Modernizadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inventario */}
        <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: '#1a4d7a' }}>
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}
            >
              <Package className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            {t('dashboard.totalInventory')}
          </p>
          <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#1a4d7a', fontFamily: 'Montserrat, sans-serif' }}>
            {stockTotal.toLocaleString()}
          </div>
          <div className="badge-primary text-xs">
            {totalProductos} {t('dashboard.differentProducts')}
          </div>
        </div>

        {/* Card 2: Organismos */}
        <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: '#2d9561' }}>
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2d9561 0%, #268650 100%)' }}
            >
              <Building className="w-6 h-6 text-white" />
            </div>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            {t('dashboard.activeOrganisms')}
          </p>
          <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#2d9561', fontFamily: 'Montserrat, sans-serif' }}>
            {organismosActivos}
          </div>
          <div className="badge-secondary text-xs">
            {t('organisms.totalBeneficiaries')}: {stats.personasAtendidas}
          </div>
        </div>

        {/* Card 3: Comandas */}
        <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4 border-l-[#FFC107]">
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
            >
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            {t('dashboard.activeOrders')}
          </p>
          <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#FFC107', fontFamily: 'Montserrat, sans-serif' }}>
            {comandasPendientes}
          </div>
          <div className="badge-warning text-xs">
            {t('dashboard.inPreparationAndPending') || 'En preparación y pendientes'}
          </div>
        </div>

        {/* Card 4: Stock Bajo */}
        <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4 border-l-[#DC3545]">
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #DC3545 0%, #C82333 100%)' }}
            >
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
          </div>
          <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            {t('inventory.stockAlert')}
          </p>
          <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#DC3545', fontFamily: 'Montserrat, sans-serif' }}>
            {stats.stockBajo}
          </div>
          <div className="badge-danger text-xs">
            {t('inventory.lowStock')}
          </div>
        </div>
      </div>

      {/* Alerta de Comandas Urgentes */}
      <AlertaComandasUrgentes />

      {/* Alertas Inteligentes - NUEVO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertasInteligentes />
        
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              📊 {t('dashboard.quickSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#1E73BE]" />
                  <span className="text-sm font-medium">{t('dashboard.totalProducts')}</span>
                </div>
                <span className="text-xl font-bold text-[#1E73BE]">{stats.totalProductos}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-[#4CAF50]" />
                  <span className="text-sm font-medium">{t('dashboard.activeOrganisms')}</span>
                </div>
                <span className="text-xl font-bold text-[#4CAF50]">{stats.organismosActivos}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-[#FFC107]" />
                  <span className="text-sm font-medium">{t('dashboard.pendingOrders')}</span>
                </div>
                <span className="text-xl font-bold text-[#FFC107]">{stats.comandasPendientes}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#DC3545]" />
                  <span className="text-sm font-medium">{t('dashboard.lowStock')}</span>
                </div>
                <span className="text-xl font-bold text-[#DC3545]">{stats.stockBajo}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('dashboard.inventoryMovements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart key="bar-chart-movimientos" data={movimientosPorDia}>
                <CartesianGrid key="grid-bar" strokeDasharray="3 3" />
                <XAxis key="xaxis-bar" dataKey="dia" />
                <YAxis key="yaxis-bar" />
                <Tooltip key="tooltip-bar" />
                <Bar key="entradas-bar" dataKey="entradas" fill="#4CAF50" name={t('common.incoming')} />
                <Bar key="salidas-bar" dataKey="salidas" fill="#DC3545" name={t('common.outgoing')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('dashboard.stockTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart key="line-chart-tendencia" data={movimientosPorDia}>
                <CartesianGrid key="grid-line" strokeDasharray="3 3" />
                <XAxis key="xaxis-line" dataKey="dia" />
                <YAxis key="yaxis-line" />
                <Tooltip key="tooltip-line" />
                <Line key="entradas-line" type="monotone" dataKey="entradas" stroke="#1E73BE" strokeWidth={2} name="Stock" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos con stock bajo */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('dashboard.lowStockProducts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productosStockBajo.length === 0 ? (
                <p className="text-center text-[#666666] py-4">{t('dashboard.noLowStockProducts')}</p>
              ) : (
                productosStockBajo.map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-3 bg-[#FFF3CD] rounded-lg">
                    <div>
                      <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-[#666666]">{producto.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#DC3545]">
                        {producto.stockActual} {producto.unidad}
                      </p>
                      <p className="text-xs text-[#666666]">{t('dashboard.min')}: {producto.stockMinimo}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comandas recientes */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('dashboard.recentOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comandasRecientes.map((comanda) => {
                const organismo = mockOrganismos.find(o => o.id === comanda.organismoId);
                const estadoColor = {
                  pendiente: '#FFC107',
                  en_preparacion: '#1E73BE',
                  completada: '#4CAF50',
                  anulada: '#DC3545'
                }[comanda.estado];

                return (
                  <div key={comanda.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {comanda.numero}
                      </p>
                      <p className="text-sm text-[#666666]">{organismo?.nombre}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#666666]" />
                      <span className="text-sm text-[#666666]">{comanda.fecha}</span>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium ml-3"
                      style={{ 
                        backgroundColor: `${estadoColor}20`, 
                        color: estadoColor,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {comanda.estado === 'pendiente' ? t('orders.pending') :
                       comanda.estado === 'en_preparacion' ? t('orders.inPreparation') :
                       comanda.estado === 'completada' ? t('orders.completed') :
                       comanda.estado === 'anulada' ? t('orders.cancelled') :
                       comanda.estado}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}