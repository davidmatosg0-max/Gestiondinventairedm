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
import { Toaster } from './components/ui/sonner';
import { crearOfertasEjemplo } from './utils/ofertaStorage';
import { inicializarUnidades } from './utils/unidadStorage';
import { inicializarDepartamentos } from './utils/departamentosStorage';
import { inicializarOrganismos, migrarClavesDeAcceso } from './utils/organismosStorage';
import { cerrarSesionUsuario } from './utils/sesionStorage';
import { inicializarConfigSupport } from './utils/supportConfig';
import { inicializarTodosDatosEjemplo, datosEjemploInicializados } from './utils/inicializarDatosEjemplo';
import { BalanceProvider } from '../contexts/BalanceContext';

// Sistema Integral de Gestión - Banque Alimentaire v2.1
export default function App() {
  const [currentPage, setCurrentPage] = useState('departamentos');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { i18n } = useTranslation();

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const checkAuth = () => {
      const localAuth = localStorage.getItem('isAuthenticated');
      const sessionAuth = sessionStorage.getItem('isAuthenticated');
      const authTimestamp = localStorage.getItem('authTimestamp');
      
      // Si hay auth en localStorage, verificar que no haya expirado (30 días)
      if (localAuth === 'true' && authTimestamp) {
        const daysSinceLogin = (Date.now() - parseInt(authTimestamp)) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin < 30) {
          setIsAuthenticated(true);
          return;
        } else {
          // Expiró, limpiar localStorage
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('authTimestamp');
        }
      }
      
      // Si hay auth en sessionStorage
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, []);

  // Crear ofertas de ejemplo e inicializar unidades al cargar la app
  useEffect(() => {
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
    
    // LIMPIEZA ÚNICA: Borrar todos los datos de ejemplo al iniciar (solo primera vez)
    const limpiezaRealizada = localStorage.getItem('limpieza_produccion_realizada');
    if (!limpiezaRealizada) {
      // Limpiar contactos de ejemplo
      localStorage.removeItem('banque_alimentaire_contactos_departamento');
      localStorage.removeItem('contactos_version');
      
      // Limpiar productos de ejemplo
      localStorage.removeItem('productos_banco_alimentos');
      
      // Limpiar personas responsables de ejemplo
      localStorage.removeItem('personas_responsables_banco_alimentos');
      
      // Limpiar recetas de ejemplo
      localStorage.removeItem('recetas_banco_alimentos');
      
      // Limpiar comandas de ejemplo
      localStorage.removeItem('comandas_banco_alimentos');
      
      // Limpiar bénévoles de ejemplo
      localStorage.removeItem('benevoles');
      localStorage.removeItem('feuilles_temps');
      
      // Limpiar transportes de ejemplo
      localStorage.removeItem('transporte_banco_alimentos');
      
      // Limpiar ofertas de ejemplo
      localStorage.removeItem('ofertas_sistema');
      
      // Limpiar organismos de ejemplo
      localStorage.removeItem('organismos_banco_alimentos');
      
      // NO LIMPIAR: departamentos, unidades (necesarios para el funcionamiento)
      
      // Marcar limpieza como realizada
      localStorage.setItem('limpieza_produccion_realizada', 'v1.0');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  ✅ SYSTÈME PRÊT POUR LA PRODUCTION                     ║');
      console.log('║                                                          ║');
      console.log('║  📋 Données d\'exemple supprimées:                       ║');
      console.log('║     • Contacts                                           ║');
      console.log('║     • Produits                                           ║');
      console.log('║     • Personnes responsables                             ║');
      console.log('║     • Recettes                                           ║');
      console.log('║     • Commandes                                          ║');
      console.log('║     • Bénévoles                                          ║');
      console.log('║     • Feuilles de temps                                  ║');
      console.log('║     • Transports                                         ║');
      console.log('║     • Offres                                             ║');
      console.log('║     • Organismes                                         ║');
      console.log('║                                                          ║');
      console.log('║  💾 Données conservées:                                  ║');
      console.log('║     • Départements                                       ║');
      console.log('║     • Unités de mesure                                   ║');
      console.log('║     • Configuration du système                           ║');
      console.log('║                                                          ║');
      console.log('║  🚀 Le système est maintenant prêt à recevoir            ║');
      console.log('║     vos données réelles!                                 ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
    }
    
    // LIMPIEZA: Eliminar tipos de contacto predefinidos antiguos (ahora el sistema usa tipos creados por el usuario)
    const tiposPredefinidosAntiguo = localStorage.getItem('banque_alimentaire_tipos_contacto_predefinidos');
    if (tiposPredefinidosAntiguo) {
      localStorage.removeItem('banque_alimentaire_tipos_contacto_predefinidos');
    }
    
    // 🎯 INICIALIZAR DATOS DE EJEMPLO (solo si no se han inicializado antes)
    if (!datosEjemploInicializados()) {
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  🎯 CARGANDO DATOS DE EJEMPLO PARA PRUEBAS...           ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      inicializarTodosDatosEjemplo();
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  ✅ DATOS DE EJEMPLO CARGADOS EXITOSAMENTE              ║');
      console.log('║                                                          ║');
      console.log('║  📋 Datos disponibles:                                   ║');
      console.log('║     • 3 Usuarios del sistema                             ║');
      console.log('║     • 4 Organismos                                       ║');
      console.log('║     • 5 Comandas                                         ║');
      console.log('║     • 3 Movimientos de inventario                        ║');
      console.log('║     • 5 Vehículos                                        ║');
      console.log('║     • 4 Rutas                                            ║');
      console.log('║     • 3 Transportes                                      ║');
      console.log('║     • 3 IDs Digitales                                    ║');
      console.log('║     • 10 Usuarios internos (Dept. Entrepôt - ID 1):     ║');
      console.log('║       → 3 Bénévoles                                      ║');
      console.log('║       → 2 Employés                                       ║');
      console.log('║       → 3 Donateurs (sincronizados con formularios)      ║');
      console.log('║       → 2 Fournisseurs (sincronizados con formularios)   ║');
      console.log('║     • 5 Registros PRS                                    ║');
      console.log('║                                                          ║');
      console.log('║  🎯 Sincronización completa:                             ║');
      console.log('║     ✅ Entrepôt (Départements)                           ║');
      console.log('║     ✅ Contactos Almacén                                 ║');
      console.log('║     ✅ Entrada Don/Achat (donateurs/fournisseurs)        ║');
      console.log('║     ✅ Entrada PRS                                       ║');
      console.log('║                                                          ║');
      console.log('║  🚀 ¡El sistema está listo para pruebas!                ║');
      console.log('║                                                          ║');
      console.log('║  💡 Para reiniciar datos:                                ║');
      console.log('║     localStorage.removeItem("datos_ejemplo_inicializados"); location.reload(); ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
    } else {
      console.log('ℹ️ Datos de ejemplo ya inicializados. Para reiniciar: localStorage.removeItem("datos_ejemplo_inicializados") y recargar');
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
            setIsAuthenticated(true);
            setCurrentPage('departamentos');
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
          setIsAuthenticated(false);
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