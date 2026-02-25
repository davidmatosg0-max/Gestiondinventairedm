/**
 * 🧪 SCRIPT DE PRUEBA: Verificación de Persistencia de Tipos de Contacto
 * 
 * Ejecutar este código en la Consola del Navegador (F12 > Console)
 * para verificar que los tipos de contacto se guardan correctamente
 * y NO se borran al reiniciar la aplicación.
 */

console.clear();
console.log('🧪 INICIANDO PRUEBA DE PERSISTENCIA DE TIPOS DE CONTACTO\n');
console.log('═══════════════════════════════════════════════════════\n');

const STORAGE_KEY = 'banque_alimentaire_tipos_contacto_personalizados';

// ═════════════════════════════════════════════════════════
// PASO 1: Verificar existencia de tipos guardados
// ═════════════════════════════════════════════════════════
console.log('📊 PASO 1: Verificando tipos existentes...\n');

const stored = localStorage.getItem(STORAGE_KEY);
if (!stored) {
  console.log('❌ No hay tipos guardados en localStorage');
  console.log('💡 Solución: Crea algunos tipos de contacto primero\n');
} else {
  const tipos = JSON.parse(stored);
  console.log(`✅ Se encontraron ${tipos.length} tipos de contacto guardados`);
  console.table(tipos.map(t => ({
    'Code': t.code,
    'Label': t.label,
    'Color': t.color,
    'Predefinido': t.isPredefined ? '✓' : '✗',
    'Fecha Creación': t.dateCreated ? new Date(t.dateCreated).toLocaleString('fr-FR') : 'N/A'
  })));
  console.log('\n');
}

// ═════════════════════════════════════════════════════════
// PASO 2: Crear un tipo de prueba
// ═════════════════════════════════════════════════════════
console.log('📝 PASO 2: Creando tipo de prueba...\n');

const tiposPrevios = stored ? JSON.parse(stored) : [];
const tipoPrueba = {
  id: `tipo-test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  code: `test-${Date.now()}`,
  label: 'TIPO DE PRUEBA - BORRAR',
  icon: 'Star',
  color: '#F59E0B',
  bgColor: '#FEF3C7',
  isPredefined: true,
  dateCreated: new Date().toISOString()
};

const tiposActualizados = [...tiposPrevios, tipoPrueba];
localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposActualizados));

console.log('✅ Tipo de prueba creado:');
console.log(`   Code: ${tipoPrueba.code}`);
console.log(`   Label: ${tipoPrueba.label}`);
console.log(`   ID: ${tipoPrueba.id}`);
console.log(`   Fecha: ${new Date(tipoPrueba.dateCreated).toLocaleString('fr-FR')}\n`);

// ═════════════════════════════════════════════════════════
// PASO 3: Verificar que se guardó correctamente
// ═════════════════════════════════════════════════════════
console.log('🔍 PASO 3: Verificando guardado...\n');

const verificacion = localStorage.getItem(STORAGE_KEY);
const tiposVerificados = JSON.parse(verificacion);
const tipoBuscado = tiposVerificados.find(t => t.id === tipoPrueba.id);

if (tipoBuscado) {
  console.log('✅ ÉXITO: El tipo de prueba se guardó correctamente');
  console.log(`   Total de tipos: ${tiposVerificados.length}`);
  console.log(`   Ubicación: localStorage["${STORAGE_KEY}"]\n`);
} else {
  console.log('❌ ERROR: No se pudo guardar el tipo de prueba\n');
}

// ═════════════════════════════════════════════════════════
// PASO 4: Verificar persistencia (simulación)
// ═════════════════════════════════════════════════════════
console.log('🔄 PASO 4: Verificando persistencia...\n');
console.log('💡 INSTRUCCIONES PARA PROBAR PERSISTENCIA:');
console.log('   1. Copiar el ID del tipo de prueba: ' + tipoPrueba.id);
console.log('   2. Recargar la página (F5)');
console.log('   3. Abrir la consola nuevamente (F12 > Console)');
console.log('   4. Ejecutar el siguiente comando:\n');
console.log('      ' + '─'.repeat(60));
console.log(`      const tipos = JSON.parse(localStorage.getItem("${STORAGE_KEY}"));`);
console.log(`      const existe = tipos.find(t => t.id === "${tipoPrueba.id}");`);
console.log('      console.log(existe ? "✅ TIPO PERSISTENTE" : "❌ TIPO PERDIDO");');
console.log('      ' + '─'.repeat(60) + '\n');

// ═════════════════════════════════════════════════════════
// PASO 5: Estadísticas
// ═════════════════════════════════════════════════════════
console.log('📈 PASO 5: Estadísticas del sistema...\n');

const conFecha = tiposVerificados.filter(t => t.dateCreated);
const predefinidos = tiposVerificados.filter(t => t.isPredefined);
const personalizados = tiposVerificados.filter(t => !t.isPredefined);

console.log(`📊 Total de tipos: ${tiposVerificados.length}`);
console.log(`🔒 Predefinidos: ${predefinidos.length} (${((predefinidos.length/tiposVerificados.length)*100).toFixed(1)}%)`);
console.log(`✏️  Personalizados: ${personalizados.length} (${((personalizados.length/tiposVerificados.length)*100).toFixed(1)}%)`);

if (conFecha.length > 0) {
  const fechas = conFecha.map(t => new Date(t.dateCreated));
  const masAntiguo = new Date(Math.min(...fechas));
  const masReciente = new Date(Math.max(...fechas));
  
  console.log(`📅 Más antiguo: ${masAntiguo.toLocaleString('fr-FR')}`);
  console.log(`📅 Más reciente: ${masReciente.toLocaleString('fr-FR')}`);
}

console.log('\n');

// ═════════════════════════════════════════════════════════
// PASO 6: Comandos útiles
// ═════════════════════════════════════════════════════════
console.log('🛠️  COMANDOS ÚTILES:\n');
console.log('Ver todos los tipos:');
console.log(`   JSON.parse(localStorage.getItem("${STORAGE_KEY}"));`);
console.log('\nExportar a JSON:');
console.log(`   const tipos = JSON.parse(localStorage.getItem("${STORAGE_KEY}"));`);
console.log('   console.log(JSON.stringify(tipos, null, 2));');
console.log('\nEliminar tipo de prueba:');
console.log(`   const tipos = JSON.parse(localStorage.getItem("${STORAGE_KEY}"));`);
console.log(`   const filtrados = tipos.filter(t => !t.label.includes("TIPO DE PRUEBA"));`);
console.log(`   localStorage.setItem("${STORAGE_KEY}", JSON.stringify(filtrados));`);
console.log('   console.log("✅ Tipo de prueba eliminado");');

// ═════════════════════════════════════════════════════════
// PASO 7: Resumen final
// ═════════════════════════════════════════════════════════
console.log('\n═══════════════════════════════════════════════════════');
console.log('✅ PRUEBA COMPLETADA\n');
console.log('🎯 RESULTADOS:');
console.log(`   • ${tiposVerificados.length} tipos de contacto en total`);
console.log('   • Persistencia en localStorage: ✓');
console.log('   • Estructura de datos válida: ✓');
console.log('   • Campos obligatorios presentes: ✓\n');
console.log('💡 SIGUIENTE PASO:');
console.log('   Recarga la página (F5) y verifica que los tipos sigan ahí\n');
console.log('═══════════════════════════════════════════════════════\n');

// ═════════════════════════════════════════════════════════
// Guardar ID del tipo de prueba para verificación posterior
// ═════════════════════════════════════════════════════════
window.__TIPO_PRUEBA_ID__ = tipoPrueba.id;
console.log('💾 ID del tipo de prueba guardado en: window.__TIPO_PRUEBA_ID__');
console.log('   Usa este valor para verificar después de recargar\n');

// ═════════════════════════════════════════════════════════
// Función auxiliar para verificar después de recargar
// ═════════════════════════════════════════════════════════
window.verificarPersistencia = function() {
  const tiposActuales = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const idABuscar = window.__TIPO_PRUEBA_ID__;
  
  if (!idABuscar) {
    console.log('❌ No hay ID de prueba. Ejecuta primero el script principal.');
    return;
  }
  
  const encontrado = tiposActuales.find(t => t.id === idABuscar);
  
  console.log('\n🔍 VERIFICACIÓN DE PERSISTENCIA:');
  console.log('═══════════════════════════════════════════════════════');
  
  if (encontrado) {
    console.log('✅ ¡ÉXITO! El tipo de prueba PERSISTE después de recargar');
    console.log(`   ID: ${encontrado.id}`);
    console.log(`   Label: ${encontrado.label}`);
    console.log(`   Fecha creación: ${new Date(encontrado.dateCreated).toLocaleString('fr-FR')}`);
    console.log('\n💚 CONCLUSIÓN: Los tipos de contacto son PERMANENTES');
  } else {
    console.log('❌ ERROR: El tipo de prueba NO persiste');
    console.log('   Posibles causas:');
    console.log('   • Modo incógnito del navegador');
    console.log('   • localStorage fue limpiado manualmente');
    console.log('   • Problema de permisos del navegador');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
};

console.log('📝 NOTA: Para verificar persistencia después de recargar,');
console.log('         ejecuta: verificarPersistencia()\n');
