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
import { ContactosAlmacen } from './components/pages/ContactosAlmacen';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { APIKeysPage } from './components/pages/APIKeysPage';
import { DashboardPredictivo } from './components/pages/DashboardPredictivo';
import { GestionAutenticacion } from './components/pages/GestionAutenticacion';
import { Toaster } from './components/ui/sonner';
// MODO PRODUCCIÓN: Funciones de limpieza de datos de ejemplo
import './utils/limpiarDatosProduccion';
import { crearOfertasEjemplo } from './utils/ofertaStorage';
import { inicializarUnidades } from './utils/unidadStorage';
import { inicializarDepartamentos } from './utils/departamentosStorage';
import { inicializarOrganismos, migrarClavesDeAcceso } from './utils/organismosStorage';
import { cerrarSesionUsuario } from './utils/sesionStorage';
import { inicializarConfigSupport } from './utils/supportConfig';
import { inicializarTodosDatosEjemplo, datosEjemploInicializados } from './utils/inicializarDatosEjemplo';
import { BalanceProvider } from '../contexts/BalanceContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { logger, showWelcomeBanner } from './utils/logger';
import { corregirContactosEntrepotAutomaticamente } from './utils/correccionContactosEntrepot';
import { runDataMigrations } from './utils/dataMigration';
import { inicializarAutoBackup } from './utils/autoBackupStorage';
import { inicializarFileSystem } from './utils/fileSystemAccess';

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading, logout: logoutAuth } = useAuth();
  const { i18n } = useTranslation();

  // Crear ofertas de ejemplo e inicializar unidades al cargar la app
  useEffect(() => {
    // 🔒 EJECUTAR MIGRACIONES DE DATOS PRIMERO
    runDataMigrations();
    
    // ===== DESACTIVADO: Ofertas de ejemplo =====
    // crearOfertasEjemplo();
    
    inicializarUnidades();
    // Solo inicializar departamentos si no están ya inicializados
    if (!localStorage.getItem('departamentos_banco_alimentos')) {
      inicializarDepartamentos();
    }
    // Solo inicializar organismos si no están ya inicializados
    if (!localStorage.getItem('organismos_banco_alimentos')) {
      inicializarOrganismos();
    }
    // Ejecutar migración de claves de acceso (para organismos existentes sin clave)
    migrarClavesDeAcceso();
    
    // Inicializar configuración de soporte (necesaria para el sistema)
    inicializarConfigSupport();
    
    // 🔧 CORRECCIÓN AUTOMÁTICA: Contactos Entrepôt (departamentoId correcto)
    corregirContactosEntrepotAutomaticamente();
    
    // 🔄 INICIALIZAR SISTEMA DE BACKUP AUTOMÁTICO
    inicializarAutoBackup();
    logger.info('🔄 Sistema de backup automático inicializado');
    
    // 📁 INICIALIZAR SISTEMA DE ARCHIVOS (File System Access API)
    inicializarFileSystem().then(() => {
      logger.info('📁 Sistema de archivos inicializado');
    }).catch((error) => {
      logger.warn('⚠️ No se pudo inicializar el sistema de archivos:', error);
    });
    
    // 🎯 INICIALIZAR DATOS DE EJEMPLO (solo si no se han inicializado antes)
    if (!datosEjemploInicializados()) {
      showWelcomeBanner('╔══════════════════════════════════════════════════════════╗');
      showWelcomeBanner('║  🎯 CARGANDO DATOS DE EJEMPLO PARA PRUEBAS...           ║');
      showWelcomeBanner('╚══════════════════════════════════════════════════════════╝');
      inicializarTodosDatosEjemplo();
      showWelcomeBanner('╔═════════════════════════════════════════════════════════╗');
      showWelcomeBanner('║  ✅ DATOS DE EJEMPLO CARGADOS EXITOSAMENTE              ║');
      showWelcomeBanner('║                                                          ║');
      showWelcomeBanner('║  📋 Datos disponibles:                                   ║');
      showWelcomeBanner('║     • 3 Usuarios del sistema                             ║');
      showWelcomeBanner('║     • 4 Organismos                                       ║');
      showWelcomeBanner('║     • 5 Comandas                                         ║');
      showWelcomeBanner('║     • 3 Movimientos de inventario                        ║');
      showWelcomeBanner('║     • 5 Vehículos                                        ║');
      showWelcomeBanner('║     • 4 Rutas                                            ║');
      showWelcomeBanner('║     • 3 Transportes                                      ║');
      showWelcomeBanner('║     • 3 IDs Digitales                                    ║');
      showWelcomeBanner('║     • 10 Usuarios internos (Dept. Entrepôt - ID 1):     ║');
      showWelcomeBanner('║       → 3 Bénévoles                                      ║');
      showWelcomeBanner('║       → 2 Employés                                       ║');
      showWelcomeBanner('║       → 3 Donateurs (sincronizados con formularios)      ║');
      showWelcomeBanner('║       → 2 Fournisseurs (sincronizados con formularios)   ║');
      showWelcomeBanner('║     • 5 Registros PRS                                    ║');
      showWelcomeBanner('║                                                          ║');
      showWelcomeBanner('║  🎯 Sincronización completa:                             ║');
      showWelcomeBanner('║     ✅ Entrepôt (Départements)                           ║');
      showWelcomeBanner('║     ✅ Contactos Almacén                                 ║');
      showWelcomeBanner('║     ✅ Entrada Don/Achat (donateurs/fournisseurs)        ║');
      showWelcomeBanner('║     ✅ Entrada PRS                                       ║');
      showWelcomeBanner('║                                                          ║');
      showWelcomeBanner('║  🚀 ¡El sistema está listo para pruebas!                ║');
      showWelcomeBanner('║                                                          ║');
      showWelcomeBanner('║  💡 Para reiniciar datos:                                ║');
      showWelcomeBanner('║     localStorage.removeItem("datos_ejemplo_inicializados"); location.reload(); ║');
      showWelcomeBanner('╚══════════════════════════════════════════════════════════╝');
    } else {
      logger.info('ℹ️ Datos de ejemplo ya inicializados. Para reiniciar: localStorage.removeItem("datos_ejemplo_inicializados") y recargar');
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
      case 'contactos-almacen':
        return <ContactosAlmacen />;
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