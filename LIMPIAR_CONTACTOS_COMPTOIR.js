// ===================================================================
// SCRIPT DE LIMPIEZA DE CONTACTOS - MÓDULO COMPTOIR (OBSOLETO)
// Banque Alimentaire - Sistema Integral de Gestión
// ===================================================================
// 
// ⚠️ ESTE SCRIPT ESTÁ OBSOLETO DESDE 2026-02-19
// 
// La restricción que limitaba los tipos "Fournisseur" y "Donateur" 
// solo al módulo Entrepôt ha sido eliminada.
//
// AHORA: Todos los departamentos pueden crear contactos de cualquier tipo.
//
// Este archivo se mantiene solo para referencia histórica.
//
// ===================================================================

(function() {
    console.log('🚀 Iniciando limpieza de contactos...\n');
    
    const STORAGE_KEY = 'contactos_departamentos';
    
    // Obtener todos los contactos
    const todosContactos = localStorage.getItem(STORAGE_KEY);
    
    if (!todosContactos) {
        console.log('❌ No se encontraron contactos en localStorage');
        return;
    }
    
    const contactosParseados = JSON.parse(todosContactos);
    console.log(`📊 Total de contactos en sistema: ${contactosParseados.length}`);
    
    // Contar contactos por departamento
    const contactosDept2 = contactosParseados.filter(c => c.departamentoId === '2');
    const contactosDept4 = contactosParseados.filter(c => c.departamentoId === '4');
    
    console.log(`\n📍 Contactos por Departamento:`);
    console.log(`   - Departamento 2 (Entrepôt): ${contactosDept2.length}`);
    console.log(`   - Departamento 4 (Comptoir): ${contactosDept4.length}`);
    
    // Contar por tipo en ambos departamentos
    const dept2Fournisseurs = contactosDept2.filter(c => c.tipo === 'fournisseur');
    const dept2Donateurs = contactosDept2.filter(c => c.tipo === 'donador');
    const dept4Fournisseurs = contactosDept4.filter(c => c.tipo === 'fournisseur');
    const dept4Donateurs = contactosDept4.filter(c => c.tipo === 'donador');
    
    console.log(`\n📋 Tipos de contactos:`);
    console.log(`   Entrepôt (Dept. 2):`);
    console.log(`      - Fournisseurs: ${dept2Fournisseurs.length} ✅ (PERMITIDOS)`);
    console.log(`      - Donateurs: ${dept2Donateurs.length} ✅ (PERMITIDOS)`);
    console.log(`   Comptoir (Dept. 4):`);
    console.log(`      - Fournisseurs: ${dept4Fournisseurs.length} ❌ (PROHIBIDOS - SE ELIMINARÁN)`);
    console.log(`      - Donateurs: ${dept4Donateurs.length} ❌ (PROHIBIDOS - SE ELIMINARÁN)`);
    
    // Filtrar: eliminar fournisseurs y donateurs de CUALQUIER departamento que NO sea Entrepôt (id='2')
    const contactosFiltrados = contactosParseados.filter(contacto => {
        if (contacto.departamentoId !== '2' && 
            (contacto.tipo === 'fournisseur' || contacto.tipo === 'donador')) {
            console.log(`   🗑️ Eliminando: ${contacto.nombre} ${contacto.apellido} (${contacto.tipo}) del Dept. ${contacto.departamentoId}`);
            return false; // No incluir
        }
        return true; // Mantener
    });
    
    const contactosEliminados = contactosParseados.length - contactosFiltrados.length;
    
    if (contactosEliminados > 0) {
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosFiltrados));
        
        console.log(`\n✅ LIMPIEZA COMPLETADA`);
        console.log(`   Total eliminados: ${contactosEliminados}`);
        console.log(`   Contactos restantes: ${contactosFiltrados.length}`);
        console.log(`\n📌 REGLA: Solo el módulo Entrepôt (Dept. 2) puede tener Fournisseurs y Donateurs`);
        console.log(`🔄 Por favor, recarga la página (F5) para ver los cambios`);
        
        // Intentar recargar automáticamente después de 2 segundos
        console.log('\n⏳ Recargando la página en 2 segundos...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        console.log(`\nℹ️ No se encontraron contactos fournisseur o donateur en departamentos prohibidos`);
        console.log(`✅ El sistema está limpio y cumple con la regla de negocio`);
    }
})();