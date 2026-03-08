/**
 * MODO PRODUCCIÓN: Limpieza de datos de ejemplo
 * Este archivo contiene funciones para eliminar todos los datos de demostración
 * y preparar el sistema para uso en producción
 */

/**
 * Limpiar todos los datos de ejemplo del localStorage
 * ADVERTENCIA: Esta acción es irreversible
 */
export function limpiarTodosDatosEjemplo(): void {
  const confirmacion = confirm(
    '⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos de ejemplo del sistema.\n\n' +
    'Se eliminarán:\n' +
    '- Organismos de ejemplo\n' +
    '- Comandas de ejemplo\n' +
    '- Productos de ejemplo\n' +
    '- Inventario de ejemplo\n' +
    '- Contactos de ejemplo\n' +
    '- Bénévoles de ejemplo\n' +
    '- Usuarios de ejemplo (excepto David y admin)\n' +
    '- Ofertas de ejemplo\n' +
    '- Notificaciones de ejemplo\n' +
    '- Personas responsables de ejemplo\n\n' +
    'Solo se mantendrá:\n' +
    '- Usuario David (Développeur)\n' +
    '- Usuario admin (Administrateur)\n' +
    '- Departamentos base\n' +
    '- Categorías y subcategorías\n' +
    '- Configuración del sistema\n\n' +
    '¿Está seguro de que desea continuar?'
  );

  if (!confirmacion) {
    console.log('❌ Limpieza cancelada por el usuario');
    return;
  }

  console.log('🧹 Iniciando limpieza de datos de producción...');

  try {
    // 1. Limpiar organismos
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([]));
    console.log('✅ Organismos limpiados');

    // 2. Limpiar comandas
    localStorage.setItem('comandas_banco_alimentos', JSON.stringify([]));
    console.log('✅ Comandas limpiadas');

    // 3. Limpiar productos
    localStorage.setItem('banque_alimentaire_productos', JSON.stringify([]));
    console.log('✅ Productos limpiados');

    // 4. Limpiar inventario
    localStorage.setItem('inventario_banco_alimentos', JSON.stringify([]));
    console.log('✅ Inventario limpiado');

    // 5. Limpiar movimientos de inventario
    localStorage.setItem('movimientos_banco_alimentos', JSON.stringify([]));
    console.log('✅ Movimientos de inventario limpiados');

    // 6. Limpiar contactos de departamento
    localStorage.setItem('banqueAlimentaire_contactosDepartamento', JSON.stringify([]));
    console.log('✅ Contactos de departamento limpiados');

    // 7. Limpiar contactos de entrepot
    localStorage.setItem('banqueAlimentaire_contactosEntrepot', JSON.stringify([]));
    console.log('✅ Contactos de entrepôt limpiados');

    // 8. Limpiar bénévoles
    localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify([]));
    console.log('✅ Bénévoles limpiados');

    // 9. Limpiar ofertas
    localStorage.setItem('ofertas_banco_alimentos', JSON.stringify([]));
    console.log('✅ Ofertas limpiadas');

    // 10. Limpiar solicitudes de ofertas
    localStorage.setItem('solicitudes_oferta_banco_alimentos', JSON.stringify([]));
    console.log('✅ Solicitudes de ofertas limpiadas');

    // 11. Limpiar notificaciones de ofertas
    localStorage.setItem('notificaciones_oferta_banco_alimentos', JSON.stringify([]));
    console.log('✅ Notificaciones de ofertas limpiadas');

    // 12. Limpiar personas responsables
    localStorage.setItem('personas_responsables_banco_alimentos', JSON.stringify([]));
    console.log('✅ Personas responsables limpiadas');

    // 13. Limpiar entradas de inventario
    localStorage.setItem('entradas_inventario_banco_alimentos', JSON.stringify([]));
    console.log('✅ Entradas de inventario limpiadas');

    // 14. Limpiar inventario de cocina
    localStorage.setItem('inventario_cocina_banco_alimentos', JSON.stringify([]));
    console.log('✅ Inventario de cocina limpiado');

    // 15. Limpiar movimientos de cocina
    localStorage.setItem('movimientos_cocina_banco_alimentos', JSON.stringify([]));
    console.log('✅ Movimientos de cocina limpiados');

    // 16. Limpiar demandes
    localStorage.setItem('banqueAlimentaire_demandes', JSON.stringify([]));
    console.log('✅ Demandes limpiadas');

    // 17. Limpiar direcciones y barrios
    localStorage.setItem('banqueAlimentaire_adresses', JSON.stringify([]));
    localStorage.setItem('banqueAlimentaire_quartiers', JSON.stringify([]));
    console.log('✅ Direcciones y barrios limpiados');

    // 18. Limpiar transacciones de usuarios internos
    localStorage.setItem('banqueAlimentaire_transacciones', JSON.stringify([]));
    console.log('✅ Transacciones limpiadas');

    // 19. Limpiar zonas de almacenamiento
    localStorage.setItem('zonas_almacenamiento', JSON.stringify([]));
    console.log('✅ Zonas de almacenamiento limpiadas');

    // 20. Resetear usuarios a David y admin (usuarios base del sistema)
    const usuariosBase = [
      {
        id: '1',
        username: 'David',
        password: 'Lettycia26',
        nombre: 'David',
        apellido: 'Développeur',
        email: 'david@banque-alimentaire.org',
        rol: 'administrador',
        permisos: [
          'administrador_general',
          'desarrollador',
          'acceso_total',
          'administrador_liaison',
          'coordinador'
        ],
        descripcion: 'Développeur Principal - Accès Total au Système'
      },
      {
        id: '2',
        username: 'admin',
        password: 'Admin2024!',
        nombre: 'Administrateur',
        apellido: 'Système',
        email: 'admin@banque-alimentaire.org',
        rol: 'administrador',
        permisos: [
          'administrador_general',
          'acceso_total',
          'administrador_liaison',
          'coordinador'
        ],
        descripcion: 'Administrateur Principal - Accès Total au Système'
      }
    ];
    localStorage.setItem('banque_alimentaire_usuarios', JSON.stringify(usuariosBase));
    localStorage.setItem('banque_alimentaire_usuarios_version', '4.1-production');
    console.log('✅ Usuarios reseteados (David + admin)');

    // 21. Actualizar versiones para evitar reinicialización automática
    localStorage.setItem('contactos_version', 'v4.0-production-clean');
    localStorage.setItem('ofertas_version', 'v2.0-production');
    console.log('✅ Versiones actualizadas');

    console.log('');
    console.log('🎉 ¡LIMPIEZA COMPLETADA CON ÉXITO!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('- Sistema listo para producción');
    console.log('- Usuario David disponible (username: David, password: Lettycia26)');
    console.log('- Usuario admin disponible (username: admin, password: Admin2024!)');
    console.log('- Todos los módulos vacíos y listos para datos reales');
    console.log('');
    console.log('⚠️  IMPORTANTE: Recargue la página para aplicar los cambios');

    // Recargar la página después de 3 segundos
    setTimeout(() => {
      window.location.reload();
    }, 3000);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    alert('Error al limpiar los datos. Por favor, contacte al soporte técnico.');
  }
}

/**
 * Limpiar solo datos de organismos
 */
export function limpiarOrganismos(): void {
  if (confirm('¿Eliminar todos los organismos de ejemplo?')) {
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([]));
    localStorage.setItem('personas_responsables_banco_alimentos', JSON.stringify([]));
    console.log('✅ Organismos y personas responsables limpiados');
    alert('Organismos eliminados correctamente');
  }
}

/**
 * Limpiar solo datos de comandas
 */
export function limpiarComandas(): void {
  if (confirm('¿Eliminar todas las comandas de ejemplo?')) {
    localStorage.setItem('comandas_banco_alimentos', JSON.stringify([]));
    console.log('✅ Comandas limpiadas');
    alert('Comandas eliminadas correctamente');
  }
}

/**
 * Limpiar solo datos de inventario y productos
 */
export function limpiarInventario(): void {
  if (confirm('¿Eliminar todo el inventario y productos de ejemplo?')) {
    localStorage.setItem('banque_alimentaire_productos', JSON.stringify([]));
    localStorage.setItem('inventario_banco_alimentos', JSON.stringify([]));
    localStorage.setItem('movimientos_banco_alimentos', JSON.stringify([]));
    localStorage.setItem('entradas_inventario_banco_alimentos', JSON.stringify([]));
    console.log('✅ Inventario y productos limpiados');
    alert('Inventario eliminado correctamente');
  }
}

/**
 * Limpiar solo contactos
 */
export function limpiarContactos(): void {
  if (confirm('¿Eliminar todos los contactos de ejemplo?')) {
    localStorage.setItem('banqueAlimentaire_contactosDepartamento', JSON.stringify([]));
    localStorage.setItem('banqueAlimentaire_contactosEntrepot', JSON.stringify([]));
    console.log('✅ Contactos limpiados');
    alert('Contactos eliminados correctamente');
  }
}

/**
 * Ver estado actual del sistema
 */
export function verEstadoSistema(): void {
  console.log('📊 ESTADO ACTUAL DEL SISTEMA');
  console.log('============================');
  
  const datos = {
    usuarios: JSON.parse(localStorage.getItem('banque_alimentaire_usuarios') || '[]').length,
    organismos: JSON.parse(localStorage.getItem('organismos_banco_alimentos') || '[]').length,
    comandas: JSON.parse(localStorage.getItem('comandas_banco_alimentos') || '[]').length,
    productos: JSON.parse(localStorage.getItem('banque_alimentaire_productos') || '[]').length,
    inventario: JSON.parse(localStorage.getItem('inventario_banco_alimentos') || '[]').length,
    contactosDept: JSON.parse(localStorage.getItem('banqueAlimentaire_contactosDepartamento') || '[]').length,
    contactosEntrepot: JSON.parse(localStorage.getItem('banqueAlimentaire_contactosEntrepot') || '[]').length,
    benevoles: JSON.parse(localStorage.getItem('banqueAlimentaire_benevoles') || '[]').length,
    ofertas: JSON.parse(localStorage.getItem('ofertas_banco_alimentos') || '[]').length,
  };

  console.log('Usuarios:', datos.usuarios);
  console.log('Organismos:', datos.organismos);
  console.log('Comandas:', datos.comandas);
  console.log('Productos:', datos.productos);
  console.log('Inventario:', datos.inventario);
  console.log('Contactos Departamento:', datos.contactosDept);
  console.log('Contactos Entrepôt:', datos.contactosEntrepot);
  console.log('Bénévoles:', datos.benevoles);
  console.log('Ofertas:', datos.ofertas);
  console.log('============================');
  
  return datos;
}

// Hacer las funciones disponibles en la consola del navegador para administradores
if (typeof window !== 'undefined') {
  (window as any).limpiarDatosProduccion = {
    limpiarTodo: limpiarTodosDatosEjemplo,
    limpiarOrganismos,
    limpiarComandas,
    limpiarInventario,
    limpiarContactos,
    verEstado: verEstadoSistema
  };
  
  console.log('🔧 Funciones de limpieza disponibles:');
  console.log('  - limpiarDatosProduccion.limpiarTodo()');
  console.log('  - limpiarDatosProduccion.limpiarOrganismos()');
  console.log('  - limpiarDatosProduccion.limpiarComandas()');
  console.log('  - limpiarDatosProduccion.limpiarInventario()');
  console.log('  - limpiarDatosProduccion.limpiarContactos()');
  console.log('  - limpiarDatosProduccion.verEstado()');
}