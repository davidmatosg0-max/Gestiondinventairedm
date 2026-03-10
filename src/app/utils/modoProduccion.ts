/**
 * MODO PRODUCCIÓN - Sistema de Control
 * 
 * Controla el comportamiento de la aplicación en modo producción:
 * - Desactiva datos de ejemplo
 * - Solo acepta datos reales del usuario
 * - Mantiene solo el usuario David activo
 * - Previene carga automática de datos de prueba
 */

// Flag de modo producción
const FLAG_MODO_PRODUCCION = 'sistema_modo_produccion';
const FLAG_DATOS_REALES = 'sistema_con_datos_reales';

/**
 * Activa el modo producción del sistema
 */
export function activarModoProduccion(): void {
  console.log('🚀 ========================================');
  console.log('🚀 ACTIVANDO MODO PRODUCCIÓN');
  console.log('🚀 ========================================');
  
  // Marcar el sistema como en modo producción
  localStorage.setItem(FLAG_MODO_PRODUCCION, 'true');
  localStorage.setItem(FLAG_DATOS_REALES, 'true');
  localStorage.setItem('modo_produccion_fecha_activacion', new Date().toISOString());
  
  console.log('✅ Modo producción ACTIVADO');
  console.log('📋 Características activadas:');
  console.log('   ✓ Solo datos reales');
  console.log('   ✓ Sin datos de ejemplo');
  console.log('   ✓ Usuario David permanente activo');
  console.log('   ✓ Todas las creaciones son datos reales');
  console.log('🚀 ========================================');
}

/**
 * Desactiva el modo producción (volver a modo desarrollo)
 */
export function desactivarModoProduccion(): void {
  console.log('🔧 ========================================');
  console.log('🔧 DESACTIVANDO MODO PRODUCCIÓN');
  console.log('🔧 ========================================');
  
  localStorage.setItem(FLAG_MODO_PRODUCCION, 'false');
  
  console.log('✅ Modo producción DESACTIVADO');
  console.log('📋 Volviendo a modo desarrollo');
  console.log('🔧 ========================================');
}

/**
 * Verifica si el sistema está en modo producción
 */
export function esModoProduccion(): boolean {
  return localStorage.getItem(FLAG_MODO_PRODUCCION) === 'true';
}

/**
 * Obtiene el estado completo del modo producción
 */
export function obtenerEstadoModoProduccion() {
  const modoProduccion = esModoProduccion();
  const fechaActivacion = localStorage.getItem('modo_produccion_fecha_activacion');
  
  return {
    modoProduccion,
    fechaActivacion,
    descripcion: modoProduccion 
      ? '🚀 Sistema en MODO PRODUCCIÓN - Solo datos reales'
      : '🔧 Sistema en MODO DESARROLLO - Permite datos de ejemplo'
  };
}

/**
 * Configurar el sistema completo para modo producción
 * Limpia todos los datos de ejemplo y configura el sistema
 */
export function configurarSistemaProduccion(): void {
  console.log('⚙️ ========================================');
  console.log('⚙️ CONFIGURANDO SISTEMA PARA PRODUCCIÓN');
  console.log('⚙️ ========================================');
  
  // 1. Activar modo producción
  activarModoProduccion();
  
  // 2. Limpiar todos los datos de ejemplo
  limpiarTodosDatosEjemplo();
  
  // 3. Verificar usuario David
  verificarUsuarioDavid();
  
  console.log('✅ ========================================');
  console.log('✅ SISTEMA CONFIGURADO PARA PRODUCCIÓN');
  console.log('✅ ========================================');
  console.log('🎯 El sistema está listo para datos reales');
  console.log('💾 Todas las creaciones se guardarán como datos permanentes');
  console.log('🔒 Usuario David activo y protegido');
  console.log('✅ ========================================');
}

/**
 * Limpia todos los datos de ejemplo del sistema
 */
function limpiarTodosDatosEjemplo(): void {
  console.log('🗑️  Limpiando datos de ejemplo...');
  
  const clavesEjemplo = [
    // Datos de ejemplo
    'datos_ejemplo_inicializados',
    
    // Organismos de ejemplo
    'organismos_banco_alimentos',
    
    // Comandas de ejemplo
    'banco_alimentos_comandas',
    'ofertas_organismos',
    
    // Inventario de ejemplo
    'banco_alimentos_productos',
    'banco_alimentos_movimientos',
    'entradas_inventario',
    'inventario_cocina',
    
    // Transporte de ejemplo
    'banco_alimentos_vehiculos',
    'banco_alimentos_rutas',
    'banco_alimentos_transportes',
    
    // IDs Digitales de ejemplo
    'banco_alimentos_ids_digitales',
    
    // PRS de ejemplo
    'banco_alimentos_registros_prs',
    'registros_prs',
    
    // Contactos de ejemplo
    'contactos_departamentos',
    'contactos_entrepot',
    'personas_responsables',
    
    // Recetas de ejemplo
    'recetas_banco_alimentos',
    
    // Demandas de ejemplo
    'demandes_organismos',
    
    // Comunicaciones de ejemplo
    'comunicaciones_internas',
    
    // Notificaciones de ejemplo
    'notificaciones_sistema',
    
    // Verificaciones de ejemplo
    'verificaciones_organismos',
    
    // Paletas de ejemplo
    'paletas_banco_alimentos',
    
    // Tareas de ejemplo
    'tareas_personalizadas'
  ];
  
  let contadorLimpiados = 0;
  clavesEjemplo.forEach(clave => {
    try {
      const valor = localStorage.getItem(clave);
      if (valor && valor !== '[]') {
        localStorage.setItem(clave, JSON.stringify([]));
        contadorLimpiados++;
        console.log(`   ✓ ${clave} limpiado`);
      }
    } catch (e) {
      console.warn(`   ⚠️ Error limpiando ${clave}:`, e);
    }
  });
  
  console.log(`✅ ${contadorLimpiados} almacenamientos limpiados`);
}

/**
 * Verifica que el usuario David esté activo
 */
function verificarUsuarioDavid(): void {
  console.log('👤 Verificando usuario David...');
  
  try {
    const usuariosStr = localStorage.getItem('banco_alimentos_usuarios');
    let usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    
    // Buscar usuario David
    const davidIndex = usuarios.findIndex((u: any) => u.nombre === 'David');
    
    if (davidIndex === -1) {
      // Crear usuario David si no existe
      const usuarioDavid = {
        id: 'user-david-permanent',
        nombre: 'David',
        email: 'david@banquealimentaire.org',
        password: 'Lettycia26',
        rol: 'desarrollador' as const,
        activo: true,
        permisos: ['todos'],
        createdAt: new Date().toISOString(),
        observaciones: 'Usuario desarrollador permanente - SIEMPRE activo'
      };
      
      usuarios = [usuarioDavid];
      localStorage.setItem('banco_alimentos_usuarios', JSON.stringify(usuarios));
      console.log('   ✓ Usuario David creado');
    } else {
      // Asegurar que David esté activo
      usuarios[davidIndex].activo = true;
      usuarios[davidIndex].permisos = ['todos'];
      
      // Eliminar otros usuarios de ejemplo
      usuarios = usuarios.filter((u: any) => u.nombre === 'David' || u.nombre === 'admin');
      
      localStorage.setItem('banco_alimentos_usuarios', JSON.stringify(usuarios));
      console.log('   ✓ Usuario David verificado y activo');
    }
  } catch (error) {
    console.error('❌ Error verificando usuario David:', error);
  }
}

/**
 * Mostrar información del modo actual
 */
export function mostrarInfoModoProduccion(): void {
  const estado = obtenerEstadoModoProduccion();
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          INFORMACIÓN MODO PRODUCCIÓN                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Estado: ${estado.descripcion}`);
  console.log(`📅 Activado: ${estado.fechaActivacion || 'No activado aún'}`);
  console.log('');
  
  if (estado.modoProduccion) {
    console.log('✅ CARACTERÍSTICAS ACTIVAS:');
    console.log('   ✓ Solo datos reales guardados');
    console.log('   ✓ Sin datos de ejemplo');
    console.log('   ✓ Usuario David permanente');
    console.log('   ✓ Todas las creaciones son datos reales');
  } else {
    console.log('🔧 MODO DESARROLLO:');
    console.log('   • Permite datos de ejemplo');
    console.log('   • Útil para pruebas');
  }
  
  console.log('');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
}

// Exponer funciones globalmente para la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).modoProduccion = {
    activar: activarModoProduccion,
    desactivar: desactivarModoProduccion,
    estado: esModoProduccion,
    info: mostrarInfoModoProduccion,
    configurar: configurarSistemaProduccion,
    obtenerEstado: obtenerEstadoModoProduccion
  };
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 MODO PRODUCCIÓN - Funciones Disponibles                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 Funciones disponibles en consola:');
  console.log('');
  console.log('   🎯 RECOMENDADO (Todo en uno):');
  console.log('   modoProduccion.configurar()    - Configurar sistema para producción');
  console.log('                                    (Limpia + Activa + Verifica)');
  console.log('');
  console.log('   ⚙️  Control Manual:');
  console.log('   modoProduccion.activar()       - Solo activar modo producción');
  console.log('   modoProduccion.desactivar()    - Desactivar modo producción');
  console.log('');
  console.log('   📊 Información:');
  console.log('   modoProduccion.estado()        - Ver si está activo (true/false)');
  console.log('   modoProduccion.info()          - Información detallada');
  console.log('   modoProduccion.obtenerEstado() - Obtener objeto de estado');
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   📖 DOCUMENTACIÓN                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('   📄 /INICIO_RAPIDO_PRODUCCION.md   - Inicio rápido (3 pasos)');
  console.log('   📄 /MODO_PRODUCCION.md            - Guía completa');
  console.log('   📄 /INSTRUCCIONES_LIMPIEZA.md     - Limpiar datos ejemplo');
  console.log('   📄 /REDESPLIEGUE_VERCEL.md        - Redesplegar en Vercel');
  console.log('');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
}