// ===================================================================
// VERIFICADOR DE ESTADO - TIPOS DE CONTACTO
// Banque Alimentaire - Sistema Integral de Gestión
// ===================================================================
// 
// Este script verifica el estado actual de los tipos de contacto
// y muestra información útil
//
// INSTRUCCIONES:
// 1. Abre la consola del navegador (F12)
// 2. Copia y pega este script
// 3. Presiona Enter
//
// ===================================================================

(function() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 VERIFICADOR DE ESTADO - TIPOS DE CONTACTO');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const STORAGE_KEY_OLD = 'banque_alimentaire_tipos_contacto_predefinidos';
    const STORAGE_KEY_NEW = 'banque_alimentaire_tipos_contacto_personalizados';
    
    const tiposAntiguos = localStorage.getItem(STORAGE_KEY_OLD);
    const tiposActuales = localStorage.getItem(STORAGE_KEY_NEW);
    
    // Estado de tipos antiguos
    console.log('📦 TIPOS PREDEFINIDOS ANTIGUOS:');
    if (tiposAntiguos) {
        const tipos = JSON.parse(tiposAntiguos);
        console.log(`   ⚠️  ENCONTRADOS: ${tipos.length} tipos antiguos (DEBEN ELIMINARSE)`);
        console.log('   ❌ Estado: OBSOLETOS - Ejecuta el script de limpieza');
    } else {
        console.log('   ✅ Estado: LIMPIOS - No hay tipos antiguos');
    }
    
    console.log('\n📝 TIPOS DE CONTACTO ACTUALES:');
    if (tiposActuales) {
        const tipos = JSON.parse(tiposActuales);
        console.log(`   ✅ Total: ${tipos.length} tipo(s) creado(s)\n`);
        
        if (tipos.length > 0) {
            console.log('   Lista de tipos:');
            tipos.forEach((tipo, index) => {
                console.log(`   ${index + 1}. ${tipo.label}`);
                console.log(`      - Code: ${tipo.code}`);
                console.log(`      - Icon: ${tipo.icon}`);
                console.log(`      - Color: ${tipo.color}`);
                console.log(`      - Predefinido: ${tipo.isPredefined ? 'Sí' : 'No'}`);
                console.log('');
            });
        } else {
            console.log('   ℹ️  No hay tipos creados todavía');
        }
    } else {
        console.log('   ⚠️  Estado: VACÍO');
        console.log('   ℹ️  El sistema está limpio - debes crear tus propios tipos');
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📌 RESUMEN:');
    console.log('═══════════════════════════════════════════════════════');
    
    const tieneAntiguos = !!tiposAntiguos;
    const tieneActuales = !!tiposActuales;
    const cantidadActuales = tiposActuales ? JSON.parse(tiposActuales).length : 0;
    
    if (!tieneAntiguos && cantidadActuales === 0) {
        console.log('✨ ESTADO: SISTEMA LIMPIO Y VACÍO');
        console.log('📝 ACCIÓN: Crea tus propios tipos de contacto');
        console.log('🎯 VE A: Gestion des Contacts → + Ajouter → Icono ⚙️');
    } else if (!tieneAntiguos && cantidadActuales > 0) {
        console.log('✅ ESTADO: PERFECTO');
        console.log(`📊 Tienes ${cantidadActuales} tipo(s) creado(s)`);
        console.log('🎉 El sistema funciona correctamente');
    } else if (tieneAntiguos) {
        console.log('⚠️  ESTADO: REQUIERE LIMPIEZA');
        console.log('🗑️  ACCIÓN: Ejecuta el script de limpieza');
        console.log('📄 ARCHIVO: /LIMPIAR_TIPOS_PREDEFINIDOS.js');
        console.log('\n🚀 SOLUCIÓN RÁPIDA:');
        console.log('   localStorage.removeItem("banque_alimentaire_tipos_contacto_predefinidos");');
        console.log('   location.reload();');
    }
    
    console.log('\n═══════════════════════════════════════════════════════\n');
})();
