import React, { useState, useEffect } from 'react';
import '../i18n/config'; // Inicializar i18n
import { useTranslation } from 'react-i18next';
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
import { inicializarAutoBackup } from './utils/autoBackupStorage';
import { inicializarFileSystem } from './utils/fileSystemAccess';
import { sistemaConDatosReales } from './utils/inicializarDatosEjemplo';
import { suppressFigmaWarningsConditional } from './utils/suppressFigmaWarnings';
import './utils/proteccionEmergencia'; // 🆘 Cargar funciones de emergencia en consola
import './utils/proteccionRestauracion'; // 🔒 Cargar funciones de protección de restauración
import { inicializarSincronizacionAutomatica } from './utils/sincronizarVoluntariosEntrepot'; // 🔄 Sincronización automática
import './utils/debugSincronizacion'; // 🐛 Funciones de debug para sincronización

// Suprimir warnings internos de Figma Make al inicio
suppressFigmaWarningsConditional();

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading, logout: logoutAuth } = useAuth();
  const { i18n } = useTranslation();

  // Crear ofertas de ejemplo e inicializar unidades al cargar la app
  useEffect(() => {
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
    
    // 📁 INICIALIZAR SISTEMA DE ARCHIVOS (File System Access API)
    inicializarFileSystem().then(() => {
      logger.info('📁 Sistema de archivos inicializado');
    }).catch((error) => {
      logger.warn('⚠️ No se pudo inicializar el sistema de archivos:', error);
    });
    
    // 🔄 INICIALIZAR SINCRONIZACIÓN AUTOMÁTICA DE VOLUNTARIOS ENTREPÔT
    inicializarSincronizacionAutomatica();
    logger.info('🔄 Sincronización automática de voluntarios Entrepôt inicializada');
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