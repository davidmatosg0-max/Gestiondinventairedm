/**
 * 🔧 CORRECCIÓN AUTOMÁTICA DE CONTACTOS ENTREPÔT
 * 
 * Esta función se ejecuta al cargar la aplicación y corrige automáticamente:
 * 1. departamentoId incorrecto ('2' debe ser '1' para Entrepôt)
 * 2. Contactos donadores/fournisseurs inactivos por defecto
 * 
 * GARANTIZA que todos los contactos tipo donador y fournisseur:
 * - Tengan departamentoId = '1' (Entrepôt correcto)
 * - Estén activos para aparecer en formularios
 */

export function corregirContactosEntrepotAutomaticamente(): void {
  const STORAGE_KEY = 'contactos_departamentos';
  const CORRECCION_VERSION_KEY = 'contactos_correccion_v1';
  
  // Verificar si ya se ejecutó esta corrección
  const correccionRealizada = localStorage.getItem(CORRECCION_VERSION_KEY);
  if (correccionRealizada === 'true') {
    // Ya se ejecutó, no hacer nada
    return;
  }
  
  try {
    const contactosData = localStorage.getItem(STORAGE_KEY);
    if (!contactosData) {
      // No hay contactos, marcar como ejecutado y salir
      localStorage.setItem(CORRECCION_VERSION_KEY, 'true');
      return;
    }
    
    const contactos = JSON.parse(contactosData);
    let contactosCorregidos = 0;
    let contactosActivados = 0;
    
    const contactosActualizados = contactos.map((contacto: any) => {
      let modificado = false;
      const contactoNuevo = { ...contacto };
      
      // Corregir departamentoId para donadores y fournisseurs
      if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
          contacto.departamentoId !== '1') {
        contactoNuevo.departamentoId = '1'; // ✅ ID CORRECTO de Entrepôt
        modificado = true;
        contactosCorregidos++;
        console.log(`✅ Corregido departamentoId: ${contacto.nombre} ${contacto.apellido} (${contacto.tipo})`);
      }
      
      // Activar contactos donadores/fournisseurs si están inactivos
      if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
          contacto.activo === false) {
        contactoNuevo.activo = true; // ✅ Activar por defecto
        modificado = true;
        contactosActivados++;
        console.log(`✅ Activado: ${contacto.nombre} ${contacto.apellido} (${contacto.tipo})`);
      }
      
      return contactoNuevo;
    });
    
    // Si hubo cambios, guardar
    if (contactosCorregidos > 0 || contactosActivados > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosActualizados));
      console.log(`🔧 CORRECCIÓN AUTOMÁTICA APLICADA:`);
      console.log(`   • ${contactosCorregidos} contacto(s) con departamentoId corregido`);
      console.log(`   • ${contactosActivados} contacto(s) activado(s)`);
      
      // Disparar evento para sincronizar otros componentes
      window.dispatchEvent(new CustomEvent('contactos-restaurados', {
        detail: { departamentoId: '1', auto: true }
      }));
    }
    
    // Marcar corrección como ejecutada
    localStorage.setItem(CORRECCION_VERSION_KEY, 'true');
    
  } catch (error) {
    console.error('❌ Error en corrección automática de contactos:', error);
    // Marcar como ejecutada para no intentar de nuevo si hay error
    localStorage.setItem(CORRECCION_VERSION_KEY, 'true');
  }
}

/**
 * 🛡️ VALIDACIÓN AL GUARDAR CONTACTOS
 * 
 * Valida y corrige automáticamente antes de guardar un contacto
 */
export function validarContactoEntrepot(contacto: any): any {
  const contactoValidado = { ...contacto };
  
  // REGLA 1: Donadores y Fournisseurs SIEMPRE deben ir a Entrepôt (ID='1')
  if (contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') {
    if (contacto.departamentoId !== '1') {
      console.warn(`⚠️ Corrigiendo departamentoId: ${contacto.tipo} debe tener departamentoId='1'`);
      contactoValidado.departamentoId = '1';
    }
  }
  
  // REGLA 2: Donadores y Fournisseurs deben estar activos por defecto
  if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
      contacto.activo === undefined) {
    contactoValidado.activo = true;
  }
  
  return contactoValidado;
}

/**
 * 📊 OBTENER ESTADÍSTICAS DE CONTACTOS ENTREPÔT
 * 
 * Para debugging y monitoreo
 */
export function obtenerEstadisticasContactosEntrepot(): {
  total: number;
  donadores: number;
  fournisseurs: number;
  donadoresActivos: number;
  fournisseursActivos: number;
  conDepartamentoIncorrecto: number;
} {
  const STORAGE_KEY = 'contactos_departamentos';
  
  try {
    const contactosData = localStorage.getItem(STORAGE_KEY);
    if (!contactosData) {
      return {
        total: 0,
        donadores: 0,
        fournisseurs: 0,
        donadoresActivos: 0,
        fournisseursActivos: 0,
        conDepartamentoIncorrecto: 0
      };
    }
    
    const contactos = JSON.parse(contactosData);
    const donadores = contactos.filter((c: any) => c.tipo === 'donador');
    const fournisseurs = contactos.filter((c: any) => c.tipo === 'fournisseur');
    
    return {
      total: contactos.length,
      donadores: donadores.length,
      fournisseurs: fournisseurs.length,
      donadoresActivos: donadores.filter((c: any) => c.activo && c.departamentoId === '1').length,
      fournisseursActivos: fournisseurs.filter((c: any) => c.activo && c.departamentoId === '1').length,
      conDepartamentoIncorrecto: [...donadores, ...fournisseurs].filter((c: any) => c.departamentoId !== '1').length
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return {
      total: 0,
      donadores: 0,
      fournisseurs: 0,
      donadoresActivos: 0,
      fournisseursActivos: 0,
      conDepartamentoIncorrecto: 0
    };
  }
}
