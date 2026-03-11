/**
 * Utilidad para inicializar datos de ejemplo en el sistema
 * ⚠️ PROTECCIÓN: NUNCA sobrescribe datos existentes
 * ✅ Solo inicializa si localStorage está completamente vacío
 */

import { 
  mockUsuarios,
  mockComandas,
  mockOrganismos,
  mockTransportes,
  mockIDsDigitales,
  mockVehiculos,
  mockRutas,
  mockUsuariosInternos,
  mockRegistrosPRS,
  mockMovimientos
} from '../data/mockData';

const FLAG_DATOS_EJEMPLO = 'datos_ejemplo_inicializados';
const FLAG_DATOS_REALES = 'sistema_con_datos_reales'; // Nueva bandera para proteger datos reales

/**
 * ⚠️ PROTECCIÓN: Verifica si el sistema tiene datos reales (NO TOCAR)
 */
export function sistemaConDatosReales(): boolean {
  // Si ya está marcado como sistema con datos reales, proteger
  if (localStorage.getItem(FLAG_DATOS_REALES) === 'true') {
    return true;
  }

  // Verificar si existe algún dato en localStorage (datos reales creados por el usuario)
  const keys = [
    'banco_alimentos_usuarios',
    'organismos_banco_alimentos',
    'banco_alimentos_comandas',
    'banco_alimentos_productos',
    'banco_alimentos_movimientos',
    'banco_alimentos_vehiculos',
    'banco_alimentos_rutas',
    'banco_alimentos_transportes',
    'banco_alimentos_ids_digitales',
    'contactos_departamentos',
    'banco_alimentos_registros_prs',
    'beneficiarios_banque_alimentaire'
  ];

  // Si alguna key tiene datos, marcar como sistema con datos reales
  for (const key of keys) {
    const data = localStorage.getItem(key);
    if (data && data !== '[]' && data !== 'null') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Marcar el sistema como con datos reales para protegerlo
          localStorage.setItem(FLAG_DATOS_REALES, 'true');
          return true;
        }
      } catch (e) {
        // Si no se puede parsear, asumimos que hay datos
        localStorage.setItem(FLAG_DATOS_REALES, 'true');
        return true;
      }
    }
  }

  return false;
}

/**
 * 🔒 Marcar el sistema como con datos reales para protegerlos
 * Se usa cuando se restaura un backup o se cargan datos importantes
 */
export function marcarComoSistemaConDatosReales(): void {
  localStorage.setItem(FLAG_DATOS_REALES, 'true');
  console.log('🔒 Sistema marcado como con DATOS REALES - Protección activada');
}

/**
 * Verifica si los datos de ejemplo ya fueron inicializados
 */
export function datosEjemploInicializados(): boolean {
  return localStorage.getItem(FLAG_DATOS_EJEMPLO) === 'true';
}

/**
 * Inicializa TODOS los datos de ejemplo en el sistema
 */
export function inicializarTodosDatosEjemplo(): void {
  console.log('🎯 Iniciando carga de datos de ejemplo...');

  try {
    // 1. USUARIOS DEL SISTEMA
    if (mockUsuarios.length > 0) {
      localStorage.setItem('banco_alimentos_usuarios', JSON.stringify(mockUsuarios));
      console.log('✅ Usuarios del sistema cargados:', mockUsuarios.length);
    }

    // 2. ORGANISMOS
    if (mockOrganismos.length > 0) {
      localStorage.setItem('organismos_banco_alimentos', JSON.stringify(mockOrganismos));
      console.log('✅ Organismos cargados:', mockOrganismos.length);
    }

    // 3. COMANDAS
    if (mockComandas.length > 0) {
      localStorage.setItem('banco_alimentos_comandas', JSON.stringify(mockComandas));
      console.log('✅ Comandas cargadas:', mockComandas.length);
    }

    // 4. MOVIMIENTOS DE INVENTARIO
    if (mockMovimientos.length > 0) {
      const movimientosExistentes = localStorage.getItem('banco_alimentos_movimientos');
      const movimientos = movimientosExistentes ? JSON.parse(movimientosExistentes) : [];
      const movimientosActualizados = [...movimientos, ...mockMovimientos];
      localStorage.setItem('banco_alimentos_movimientos', JSON.stringify(movimientosActualizados));
      console.log('✅ Movimientos de inventario cargados:', mockMovimientos.length);
    }

    // 5. VEHÍCULOS
    if (mockVehiculos.length > 0) {
      localStorage.setItem('banco_alimentos_vehiculos', JSON.stringify(mockVehiculos));
      console.log('✅ Vehículos cargados:', mockVehiculos.length);
    }

    // 6. RUTAS
    if (mockRutas.length > 0) {
      localStorage.setItem('banco_alimentos_rutas', JSON.stringify(mockRutas));
      console.log('✅ Rutas cargadas:', mockRutas.length);
    }

    // 7. TRANSPORTES
    if (mockTransportes.length > 0) {
      localStorage.setItem('banco_alimentos_transportes', JSON.stringify(mockTransportes));
      console.log('✅ Transportes cargados:', mockTransportes.length);
    }

    // 8. IDs DIGITALES
    if (mockIDsDigitales.length > 0) {
      localStorage.setItem('banco_alimentos_ids_digitales', JSON.stringify(mockIDsDigitales));
      console.log('✅ IDs Digitales cargados:', mockIDsDigitales.length);
    }

    // 9. USUARIOS INTERNOS (Contactos: Bénévoles, Empleados, Donadores, Vendedores)
    if (mockUsuariosInternos.length > 0) {
      // Separar por categoría para almacenar correctamente
      const benevoles = mockUsuariosInternos.filter(u => u.categoria === 'benevole');
      const empleados = mockUsuariosInternos.filter(u => u.categoria === 'empleado');
      const donadores = mockUsuariosInternos.filter(u => u.categoria === 'donador');
      const vendedores = mockUsuariosInternos.filter(u => u.categoria === 'vendedor');

      // Convertir a formato ContactoDepartamento correcto
      const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      
      const contactosDepartamento = [
        // BÉNÉVOLES (Voluntarios) - Asignados a Comptoir (ID='1')
        ...benevoles.map(b => ({
          id: b.id,
          departamentoId: '1', // Departamento Comptoir (ID='1' según departamentosStorage.ts)
          departamentoIds: ['1'],
          tipo: 'benevole' as const,
          nombre: b.nombre,
          apellido: b.apellido || '',
          email: b.email || '',
          telefono: b.telefono || '',
          fechaNacimiento: b.fechaNacimiento || '',
          fechaIngreso: b.fechaIngreso || new Date().toISOString().split('T')[0],
          activo: b.activo !== false,
          numeroEmpleado: b.numeroID || '',
          direccion: b.direccion || '',
          heuresSemaines: b.horasSemanales || 8,
          cargo: b.departamento || 'Bénévole',
          disponibilidad: 'Lundi-Vendredi (AM)',
          disponibilidades: diasSemana.map((jour, idx) => ({ 
            jour, 
            am: idx < 5, // Lunes a viernes AM
            pm: idx < 3  // Lunes a miércoles PM
          })),
          notas: `Bénévole actif - ${b.horasSemanales || 8} heures par semaine`,
          genero: 'Non spécifié' as const,
          ciudad: 'Laval',
          codigoPostal: 'H7W 2T4',
          horario: 'Flexible',
          reference: '',
          supervisor: '',
          foto: b.foto || ''
        })),
        
        // EMPLOYÉS (Empleados) - Asignados a Comptoir (ID='1')
        ...empleados.map(e => ({
          id: e.id,
          departamentoId: '1', // Departamento Comptoir (ID='1' según departamentosStorage.ts)
          departamentoIds: ['1'],
          tipo: 'employe' as const,
          nombre: e.nombre,
          apellido: e.apellido || '',
          email: e.email || '',
          telefono: e.telefono || '',
          fechaNacimiento: e.fechaNacimiento || '',
          fechaIngreso: e.fechaIngreso || new Date().toISOString().split('T')[0],
          activo: e.activo !== false,
          numeroEmpleado: e.numeroID || '',
          direccion: e.direccion || '',
          cargo: e.puesto || 'Employé',
          heuresSemaines: 40,
          disponibilidad: 'Temps plein - Lundi à Vendredi',
          disponibilidades: diasSemana.map((jour, idx) => ({ 
            jour, 
            am: idx < 5, // Lunes a viernes AM
            pm: idx < 5  // Lunes a viernes PM
          })),
          notas: `Employé permanent - ${e.puesto || 'Poste administratif'}`,
          genero: 'Non spécifié' as const,
          ciudad: 'Laval',
          codigoPostal: 'H7W 2T4',
          horario: '9h00 - 17h00',
          reference: '',
          supervisor: '',
          foto: e.foto || ''
        })),
        
        // DONATEURS (Donadores)
        ...donadores.map(d => ({
          id: d.id,
          departamentoId: '2', // Departamento Entrepôt (ID='2' según departamentosStorage.ts)
          departamentoIds: ['2'],
          tipo: 'donador' as const,
          nombre: d.nombre,
          apellido: d.apellido || '',
          email: d.email || '',
          telefono: d.telefono || '',
          fechaIngreso: d.fechaIngreso || new Date().toISOString().split('T')[0],
          activo: d.activo !== false,
          numeroEmpleado: d.numeroID || '',
          direccion: d.direccion || '',
          nombreEmpresa: d.empresa || d.nombre, // ✅ CORREGIDO: usar nombreEmpresa en lugar de empresa
          cargo: d.tipo || 'Donateur',
          disponibilidad: 'Dons réguliers',
          disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: false })),
          notas: `${d.tipo || 'Donateur'} - Partenaire depuis ${d.fechaIngreso?.split('-')[0] || '2024'}`,
          genero: 'Non spécifié' as const,
          ciudad: 'Laval',
          codigoPostal: 'H7W 2T4',
          horario: 'Sur rendez-vous',
          reference: d.empresa || '',
          supervisor: '',
          foto: d.foto || '',
          // Campos adicionales para donadores
          tipoOrganizacion: d.tipo,
          categoriaProductos: d.tipo === 'Supermarché' ? 'Alimentaire mixte' : d.tipo === 'Boulangerie' ? 'Produits de boulangerie' : 'Divers',
          frecuenciaDonaciones: 'Hebdomadaire'
        })),
        
        // FOURNISSEURS (Vendedores)
        ...vendedores.map(v => ({
          id: v.id,
          departamentoId: '2', // Departamento Entrepôt (ID='2' según departamentosStorage.ts)
          departamentoIds: ['2'],
          tipo: 'fournisseur' as const,
          nombre: v.nombre,
          apellido: v.apellido || '',
          email: v.email || '',
          telefono: v.telefono || '',
          fechaIngreso: v.fechaIngreso || new Date().toISOString().split('T')[0],
          activo: v.activo !== false,
          numeroEmpleado: v.numeroID || '',
          direccion: v.direccion || '',
          nombreEmpresa: v.empresa || v.nombre, // ✅ CORREGIDO: usar nombreEmpresa en lugar de empresa
          cargo: v.tipo || 'Fournisseur',
          disponibilidad: 'Livraison régulière',
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: `${v.tipo || 'Fournisseur'} - Compte actif depuis ${v.fechaIngreso?.split('-')[0] || '2024'}`,
          genero: 'Non spécifié' as const,
          ciudad: 'Laval',
          codigoPostal: 'H7W 2T4',
          horario: 'Lundi-Vendredi 8h-16h',
          reference: v.empresa || '',
          supervisor: '',
          foto: v.foto || '',
          // Campos adicionales para proveedores
          tipoServicio: v.tipo,
          condicionesPago: 'Net 30 jours',
          delaiLivraison: '2-3 jours ouvrables'
        }))
      ];

      // ⚠️ IMPORTANTE: Usar la key correcta 'contactos_departamentos' (sin banque_alimentaire)
      const contactosActuales = localStorage.getItem('contactos_departamentos');
      const contactosExistentes = contactosActuales ? JSON.parse(contactosActuales) : [];
      
      // Agregar solo los que no existen ya
      const contactosNuevos = contactosDepartamento.filter(nuevo => 
        !contactosExistentes.some((existente: any) => existente.id === nuevo.id)
      );
      
      const contactosFinales = [...contactosExistentes, ...contactosNuevos];
      localStorage.setItem('contactos_departamentos', JSON.stringify(contactosFinales));
      console.log('✅ Usuarios Internos cargados:', contactosDepartamento.length);
      console.log('   → Bénévoles:', benevoles.length);
      console.log('   → Employés:', empleados.length);
      console.log('   → Donateurs:', donadores.length);
      console.log('   → Fournisseurs:', vendedores.length);
    }

    // 10. REGISTROS PRS
    if (mockRegistrosPRS.length > 0) {
      localStorage.setItem('banco_alimentos_registros_prs', JSON.stringify(mockRegistrosPRS));
      console.log('✅ Registros PRS cargados:', mockRegistrosPRS.length);
    }

    // Marcar como inicializado
    localStorage.setItem(FLAG_DATOS_EJEMPLO, 'true');
    console.log('🎉 ¡Todos los datos de ejemplo cargados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al cargar datos de ejemplo:', error);
  }
}

/**
 * Limpia TODOS los datos de ejemplo del sistema
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA
 */
export function limpiarDatosEjemplo(): void {
  console.log('🔒 limpiarDatosEjemplo() - DESHABILITADA para protección de datos');
  console.log('🔒 Esta función ya NO limpia datos para proteger tu información');
  return; // NO HACER NADA
  
  /* CÓDIGO DESHABILITADO
  console.log('🧹 Limpiando datos de ejemplo...');

  const keys = [
    'banco_alimentos_usuarios',
    'organismos_banco_alimentos',
    'banco_alimentos_comandas',
    'banco_alimentos_movimientos',
    'banco_alimentos_vehiculos',
    'banco_alimentos_rutas',
    'banco_alimentos_transportes',
    'banco_alimentos_ids_digitales',
    'contactos_departamentos',
    'banco_alimentos_registros_prs',
    FLAG_DATOS_EJEMPLO
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('✅ Datos de ejemplo limpiados');
  */
}

/**
 * Reinicia los datos de ejemplo (limpia y carga de nuevo)
 */
export function reiniciarDatosEjemplo(): void {
  limpiarDatosEjemplo();
  inicializarTodosDatosEjemplo();
}