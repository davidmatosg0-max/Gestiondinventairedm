import React, { useState, useEffect } from 'react';
import '../i18n/config'; // Inicializar i18n
// Última actualización: 17/03/2026 - Actualización nombre completo en actividades
import { useTranslation } from 'react-i18next';
import '../utils/translationChecker'; // Verificador de sincronización de traducciones
import { Layout } from './components/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { DashboardMetricas } from './components/pages/DashboardMetricas';
import { Inventario } from './components/pages/Inventario';
import { Comandas } from './components/pages/Comandas';
import { Organismos } from './components/pages/Organismos';
import { Transporte } from './components/pages/Transporte';
import { Reportes } from './components/pages/Reportes';
import { Usuarios } from './components/pages/Usuarios';
import { UsuariosInternos } from './components/pages/UsuariosInternos';
import { IDDigital } from './components/pages/IDDigital';
import { Configuracion } from './components/pages/Configuracion';
import { AccesoOrganismo } from './components/pages/AccesoOrganismo';
import { PanelMarca } from './components/pages/PanelMarca';
import { Etiquetas } from './components/pages/Etiquetas';
import { OfertasOrganismo } from './components/pages/OfertasOrganismo';
import { Departamentos } from './components/pages/Departamentos';
import { Recrutement } from './components/pages/Recrutement';
import { Benevoles } from './components/pages/Benevoles';
import { EmailOrganismos } from './components/pages/EmailOrganismos';
import { Contact } from './components/pages/Contact';
import { Login } from './components/pages/Login';
import { CommunicationInterne } from './components/CommunicationInterne';
import { CuisinePage } from './components/pages/CuisinePage';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { APIKeysPage } from './components/pages/APIKeysPage';
import { DashboardPredictivo } from './components/pages/DashboardPredictivo';
import { GestionAutenticacion } from './components/pages/GestionAutenticacion';
import { GestionDonateursFournisseurs } from './components/entrepot/GestionDonateursFournisseurs';
import { ContactosAlmacenPage } from './components/pages/ContactosAlmacenPage';
import { Toaster } from './components/ui/sonner';
import { PWAInstaller } from './components/PWAInstaller';
// CACHE BUSTER v3.0 - TIMESTAMP: 2025-03-11-20-45 - Corrección de colores contactos
// LIMPIEZA COMPLETA DEL SISTEMA
import { ejecutarLimpiezaCompleta, yaEjecutadaLimpiezaCompleta } from './utils/limpiezaCompleta';
import { inicializarUnidades } from './utils/unidadStorage';
import { inicializarDepartamentos } from './utils/departamentosStorage';
import { migrarClavesDeAcceso } from './utils/organismosStorage';
import { cerrarSesionUsuario } from './utils/sesionStorage';
import { inicializarConfigSupport } from './utils/supportConfig';
import { BalanceProvider } from '../contexts/BalanceContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { logger, showWelcomeBanner } from './utils/logger';
import { runDataMigrations } from './utils/dataMigration';
import { inicializarAutoBackup, diagnosticarAutoBackup, ejecutarBackupAutomatico } from './utils/autoBackupStorage';
import { inicializarFileSystem } from './utils/fileSystemAccess';
// 🔍 Herramientas de verificación PRS
import './utils/verificarPRS';
import { useUpdateNotifications } from '../hooks/useUpdateNotifications';
import { useVersionCheck } from '../hooks/useVersionCheck';
import { sistemaConDatosReales } from './utils/inicializarDatosEjemplo';
import { suppressFigmaWarningsConditional } from './utils/suppressFigmaWarnings';
import './utils/proteccionEmergencia'; // 🆘 Cargar funciones de emergencia en consola
import './utils/proteccionRestauracion'; // 🔒 Cargar funciones de protección de restauración
import { inicializarSincronizacionAutomatica } from './utils/sincronizarVoluntariosEntrepot'; // 🔄 Sincronización automática
import './utils/debugSincronizacion'; // 🐛 Funciones de debug para sincronización
import { migrarFlagsCostco, yaMigradoCostco, marcarMigracionCostco } from './utils/migrateCostcoFlags';
import './utils/migrateCostcoFlags'; // 🆘 Cargar función de emergencia para migración manual
import { migrarProgramasEntrada, yaMigradoProgramas, marcarMigracionProgramas } from './utils/migrateProgramasEntrada';
import './utils/migrateProgramasEntrada'; // 🆘 Cargar funciones de emergencia para programas
import { migrarPesoUnitarioProductos } from './utils/productStorage';
import './utils/calcularValorMonetarioProductos'; // 💰 Cargar funciones de cálculo de valores monetarios
import { inicializarProteccionDatos } from './utils/proteccionDatos'; // 🛡️ Sistema de protección total de datos

// Suprimir warnings internos de Figma Make al inicio
suppressFigmaWarningsConditional();

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading, logout: logoutAuth } = useAuth();
  const { i18n } = useTranslation();

  // 🔔 Inicializar sistema de notificaciones de actualizaciones
  useUpdateNotifications();

  // 🔄 Verificar versión de la aplicación y mostrar notificación de actualización
  useVersionCheck();

  // Crear ofertas de ejemplo e inicializar unidades al cargar la app
  useEffect(() => {
    // 🛡️🛡️🛡️ ACTIVAR SISTEMA DE PROTECCIÓN TOTAL DE DATOS
    // DEBE SER LO PRIMERO QUE SE EJECUTE
    inicializarProteccionDatos();
    
    // 🔒🔒🔒 PROTECCIÓN MÁXIMA - MARCAR INMEDIATAMENTE COMO SISTEMA CON DATOS REALES
    // Esto previene CUALQUIER limpieza automática
    localStorage.setItem('sistema_con_datos_reales', 'true');
    localStorage.setItem('limpieza_completa_ejecutada', 'true');
    localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
    
    logger.info('🔒🔒🔒 PROTECCIÓN MÁXIMA ACTIVADA');
    logger.info('🛡️ Sistema marcado como CON DATOS REALES');
    logger.info('🛡️ Limpieza automática PERMANENTEMENTE DESHABILITADA');
    
    // 🔒 EJECUTAR MIGRACIONES DE DATOS PRIMERO
    runDataMigrations();
    
    // 🗑️ LIMPIEZA AUTOMÁTICA COMPLETAMENTE DESHABILITADA
    // La limpieza ya NO se ejecutará NUNCA para proteger tus datos
    logger.info('✅ Sistema protegido - Limpieza automática omitida');
    
    // ✅ INICIALIZAR COMPONENTES ESENCIALES
    inicializarUnidades();
    
    // Solo inicializar departamentos si no están ya inicializados
    if (!localStorage.getItem('departamentos_banco_alimentos')) {
      inicializarDepartamentos();
    }
    
    // Ejecutar migración de claves de acceso (para organismos existentes sin clave)
    migrarClavesDeAcceso();
    
    // Inicializar configuración de soporte (necesaria para el sistema)
    inicializarConfigSupport();
    
    // 🔄 INICIALIZAR SISTEMA DE BACKUP AUTOMÁTICO
    inicializarAutoBackup();
    logger.info('🔄 Sistema de backup automático inicializado');
    
    // 🔍 EXPONER FUNCIONES DE DIAGNÓSTICO GLOBALMENTE (para testing)
    if (typeof window !== 'undefined') {
      (window as any).diagnosticarBackup = diagnosticarAutoBackup;
      (window as any).ejecutarBackupManual = ejecutarBackupAutomatico;
      console.log('🔧 Funciones de diagnóstico de backup disponibles en consola:');
      console.log('  - diagnosticarBackup() - Ver estado completo del sistema');
      console.log('  - ejecutarBackupManual() - Ejecutar backup inmediato');
    }
    
    // 📁 INICIALIZAR SISTEMA DE ARCHIVOS (File System Access API)
    inicializarFileSystem().then(() => {
      logger.info('📁 Sistema de archivos inicializado');
    }).catch((error) => {
      logger.warn('⚠️ No se pudo inicializar el sistema de archivos:', error);
    });
    
    // 🔄 INICIALIZAR SINCRONIZACIÓN AUTOMÁTICA DE VOLUNTARIOS ENTREPÔT
    inicializarSincronizacionAutomatica();
    logger.info('🔄 Sincronización automática de voluntarios Entrepôt inicializada');
    
    // Migrar flags de Costco si no se ha hecho antes
    if (!yaMigradoCostco()) {
      migrarFlagsCostco();
      marcarMigracionCostco();
      logger.info('🔄 Flags de Costco migrados');
    }
    
    // Migrar programas de entrada si no se ha hecho antes
    if (!yaMigradoProgramas()) {
      migrarProgramasEntrada();
      marcarMigracionProgramas();
      logger.info('🔄 Programas de entrada migrados');
    }
    
    // 🔧 Migrar peso unitario de productos (ejecuta solo si hay productos sin pesoUnitario)
    const productosCorregidos = migrarPesoUnitarioProductos();
    if (productosCorregidos > 0) {
      logger.info(`🔄 Peso unitario de productos migrado: ${productosCorregidos} producto(s) corregido(s)`);
    }
  }, []);

  // Inicializar dirección RTL si el idioma es árabe
  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'dashboard-metricas':
        return <DashboardMetricas />;
      case 'dashboard-predictivo':
        return <DashboardPredictivo />;
      case 'inventario':
        return <Inventario />;
      case 'etiquetas':
        return <Etiquetas />;
      case 'comandas':
        return <Comandas />;
      case 'organismos':
        return <Organismos />;
      case 'ofertas-organismo':
        return <OfertasOrganismo />;
      case 'transporte':
        return <Transporte />;
      case 'reportes':
        return <Reportes />;
      case 'usuarios':
        return <Usuarios />;
      case 'usuarios-internos':
        return <UsuariosInternos />;
      case 'id-digital':
        return <IDDigital />;
      case 'api-keys':
        return <APIKeysPage />;
      case 'gestion-autenticacion':
        return <GestionAutenticacion />;
      case 'panel-marca':
        return <PanelMarca />;
      case 'configuracion':
        return <Configuracion />;
      case 'acceso-organismo':
        return <AccesoOrganismo />;
      case 'departamentos':
        return <Departamentos onNavigate={setCurrentPage} />;
      case 'recrutement':
        return <Benevoles />;
      case 'benevoles':
        return <Benevoles />;
      case 'liaison':
        return <EmailOrganismos onNavigate={setCurrentPage} />;
      case 'email-organismos':
        return <EmailOrganismos onNavigate={setCurrentPage} />;
      case 'contact':
        return <Contact />;
      case 'communication':
        return <CommunicationInterne />;
      case 'cuisine':
        return <CuisinePage onNavigate={setCurrentPage} />;
      case 'donateurs-fournisseurs':
        return <GestionDonateursFournisseurs />;
      case 'contactos-almacen':
        return <ContactosAlmacenPage onNavigate={setCurrentPage} />;
      case 'diagnosticos':
        return <SystemDiagnostics />;
      default:
        return <Dashboard />;
    }
  };

  // Si está en vista pública, mostrar directamente sin Layout
  if (currentPage === 'acceso-organismo') {
    return (
      <>
        <AccesoOrganismo />
        <Toaster position="top-right" />
      </>
    );
  }

  // Si está en vista pública de bénévoles (hojas de tiempo), mostrar sin autenticación
  if (currentPage === 'benevoles-public') {
    return (
      <>
        <Benevoles isPublicAccess={true} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <>
        <Login 
          onLogin={() => {
            setCurrentPage('dashboard');
          }}
          onAccessPublic={(page) => {
            setCurrentPage(page);
          }}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <BalanceProvider>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onLogout={() => {
          logoutAuth();
          cerrarSesionUsuario();
        }}
        hideSidebar={currentPage === 'departamentos'}
      >
        {renderPage()}
      </Layout>
      <Toaster position="top-right" />
      <PWAInstaller />
    </BalanceProvider>
  );
}

// Sistema Integral de Gestión - Banque Alimentaire v5.0 PRO (JWT + API Keys)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}