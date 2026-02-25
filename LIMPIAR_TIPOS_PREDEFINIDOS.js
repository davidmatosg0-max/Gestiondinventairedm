// ===================================================================
// SCRIPT DE LIMPIEZA - TIPOS DE CONTACTO PREDEFINIDOS
// Banque Alimentaire - Sistema Integral de Gestión
// ===================================================================
// 
// INSTRUCCIONES:
// 1. Abre la consola del navegador (F12 o Ctrl+Shift+I)
// 2. Copia y pega este script completo
// 3. Presiona Enter
// 4. Recarga la página (F5)
//
// ===================================================================

(function() {
    console.log('🚀 Eliminando tipos de contacto predefinidos antiguos...\n');
    
    const STORAGE_KEY_OLD_PREDEFINIDOS = 'banque_alimentaire_tipos_contacto_predefinidos';
    const STORAGE_KEY_PERSONALIZADOS = 'banque_alimentaire_tipos_contacto_personalizados';
    
    // Verificar si existen tipos predefinidos antiguos
    const tiposPredefinidosAntiguo = localStorage.getItem(STORAGE_KEY_OLD_PREDEFINIDOS);
    const tiposPersonalizados = localStorage.getItem(STORAGE_KEY_PERSONALIZADOS);
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Tipos predefinidos antiguos: ${tiposPredefinidosAntiguo ? 'EXISTEN' : 'No existen'}`);
    console.log(`   - Tipos personalizados: ${tiposPersonalizados ? 'EXISTEN' : 'No existen'}`);
    
    // Eliminar la clave antigua de tipos predefinidos
    if (tiposPredefinidosAntiguo) {
        localStorage.removeItem(STORAGE_KEY_OLD_PREDEFINIDOS);
        console.log(`\n✅ Tipos predefinidos antiguos eliminados`);
    } else {
        console.log(`\nℹ️  No hay tipos predefinidos antiguos para eliminar`);
    }
    
    // Mostrar tipos personalizados actuales (ahora son los únicos)
    if (tiposPersonalizados) {
        const tipos = JSON.parse(tiposPersonalizados);
        console.log(`\n📋 Tipos de contacto actuales (${tipos.length}):`);
        tipos.forEach((tipo, index) => {
            console.log(`   ${index + 1}. ${tipo.label} (${tipo.code})`);
        });
    } else {
        console.log(`\n⚠️  ATENCIÓN: No hay tipos de contacto creados`);
        console.log(`   El sistema ahora inicia VACÍO - debes crear tus propios tipos`);
        console.log(`   Ve a "Gestion des Contacts" → Crear contacto → Icono de configuración (⚙️)`);
    }
    
    console.log(`\n✅ LIMPIEZA COMPLETADA`);
    console.log(`\n📌 Cambio importante:`);
    console.log(`   Ya NO hay tipos de contacto predefinidos`);
    console.log(`   Todos los tipos que crees se guardarán PERMANENTEMENTE`);
    console.log(`   Incluso después de reiniciar la aplicación`);
    console.log(`\n🔄 Recargando la página en 2 segundos...`);
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
})();
