export type TipoContacto = 'donador' | 'fournisseur' | 'benevole' | 'responsable-sante' | 'partenaire' | 'visiteur' | 'employe' | 'transportista';
export type IdiomaContacto = 'es' | 'fr' | 'en' | 'ar';
export type GeneroContacto = 'Homme' | 'Femme' | 'Autre' | 'Non spécifié';

export interface DisponibilidadDia {
  jour: string; // 'Lundi', 'Mardi', etc.
  am: boolean;
  pm: boolean;
}

export interface ContactoDepartamento {
  id: string;
  departamentoId: string; // Mantener para compatibilidad con contactos existentes
  departamentoIds?: string[]; // Nuevo: múltiples departamentos
  tipo: TipoContacto;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  fechaInicio?: string; // Fecha de inicio en el trabajo/rol
  genero?: GeneroContacto;
  email: string;
  telefono: string;
  cargo?: string;
  idiomas?: IdiomaContacto[];
  disponibilidad?: string;
  disponibilidades?: DisponibilidadDia[]; // Nueva estructura de disponibilidad
  notas?: string;
  activo: boolean;
  fechaIngreso: string;
  foto?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  numeroEmpleado?: string;
  horario?: string;
  heuresSemaines?: number; // Horas semanales
  reference?: string; // Referencia
  supervisor?: string;
  especialidad?: string;
  certificaciones?: string[];
  documents?: { 
    nom: string; // Nombre del archivo original
    tipo: string; // Código del tipo de documento
    tipoLabel: string; // Etiqueta del tipo
    tipoColor?: string; // Color del tipo
    tipoBgColor?: string; // Color de fondo del tipo
    tipoIcon?: string; // Icono del tipo
    url: string; // Base64 o URL
    date: string; // Fecha de subida
  }[]; // Documentos estandarizados
  // Casier judiciaire et éthique
  fechaConfirmacionCasier?: string; // Fecha de confirmación del casier judiciaire
  codigoEthiqueSigne?: boolean; // Code d'éthique signé (oui/non)
  
  // 🚚 PROGRAMA PRS - Identificador de participación
  participaPRS?: boolean; // Participa en el programa PRS
  fechaInicioPRS?: string; // Fecha de inicio en PRS
  frecuenciaPRS?: number; // Frecuencia de recolección (veces por semana)
  diasRecoleccionPRS?: string[]; // Días específicos de recolección ['Lundi', 'Mercredi', 'Vendredi']
  horarioRecoleccionPRS?: string; // Horario preferido de recolección
  contactoPRS?: string; // Persona de contacto específica para PRS
  telefonoPRS?: string; // Teléfono directo para coordinación PRS
  notasPRS?: string; // Notas especiales sobre el donador PRS
  
  // Campos adicionales para compatibilidad con Gestión de Contactos Entrepôt
  numeroID?: string; // ID único del contacto
  nombreEmpresa?: string; // Nombre de la empresa
  tipoEmpresa?: string; // Tipo de empresa (inc, ltee, senc, obnl)
  numeroRegistro?: string; // Número de registro
  numeroTVA?: string; // Número TVA
  emailPrincipal?: string; // Email principal (alternativo a email)
  emailSecundario?: string; // Email secundario
  telefonoPrincipal?: string; // Teléfono principal (alternativo a telefono)
  telefonoSecundario?: string; // Teléfono secundario
  sitioWeb?: string; // Sitio web
  pais?: string; // País
  provincia?: string; // Provincia
  banco?: string; // Banco
  numeroCuenta?: string; // Número de cuenta bancaria
  numeroRuta?: string; // Número de ruta bancaria
  categoriaProductos?: string[]; // Categorías de productos
  temperaturaEspecializada?: string[]; // Temperaturas especializadas
  diasOperacion?: string[]; // Días de operación
  tiempoEntrega?: string; // Tiempo de entrega
  metodoPago?: string[]; // Métodos de pago
  etiquetas?: string[]; // Etiquetas/tags
  ultimoContacto?: string; // Fecha último contacto
  imagen?: string | null; // Imagen/foto del contacto
}

const STORAGE_KEY = 'contactos_departamento'; // ✅ CORREGIDO: usar la misma clave que en el resto del código
const MAX_FOTO_SIZE = 100 * 1024; // 100KB max por foto
const MAX_DOCUMENT_SIZE = 200 * 1024; // 200KB max por documento

/**
 * 🗜️ OPTIMIZACIÓN: Comprime y optimiza imágenes base64 grandes
 */
function optimizarImagen(base64: string, maxSize: number = MAX_FOTO_SIZE): string {
  if (!base64 || !base64.startsWith('data:image')) return base64;
  
  // Calcular tamaño aproximado (base64 es ~1.37x el tamaño original)
  const sizeInBytes = (base64.length * 3) / 4;
  
  // Si es muy grande, retornar string vacío (la foto se perderá pero el sistema seguirá funcionando)
  if (sizeInBytes > maxSize) {
    console.warn(`⚠️ Foto demasiado grande (${Math.round(sizeInBytes / 1024)}KB), se eliminará para ahorrar espacio`);
    return '';
  }
  
  return base64;
}

/**
 * 🗜️ OPTIMIZACIÓN: Limpia y optimiza un contacto antes de guardarlo
 */
function optimizarContacto(contacto: ContactoDepartamento): ContactoDepartamento {
  const optimizado = { ...contacto };
  
  // Optimizar foto
  if (optimizado.foto) {
    optimizado.foto = optimizarImagen(optimizado.foto, MAX_FOTO_SIZE);
  }
  
  // Optimizar imagen alternativa
  if (optimizado.imagen) {
    optimizado.imagen = optimizarImagen(optimizado.imagen, MAX_FOTO_SIZE);
  }
  
  // Optimizar documentos
  if (optimizado.documents && optimizado.documents.length > 0) {
    optimizado.documents = optimizado.documents.map(doc => ({
      ...doc,
      url: optimizarImagen(doc.url, MAX_DOCUMENT_SIZE)
    })).filter(doc => doc.url); // Eliminar documentos sin URL
  }
  
  return optimizado;
}

/**
 * 💾 MANEJO DE CUOTA: Intenta guardar en localStorage con manejo de errores
 */
function guardarEnLocalStorage(key: string, data: any): boolean {
  try {
    const jsonString = JSON.stringify(data);
    const sizeInMB = (jsonString.length / 1024 / 1024).toFixed(2);
    console.log(`📦 Intentando guardar ${sizeInMB}MB en localStorage...`);
    
    localStorage.setItem(key, jsonString);
    console.log(`✅ Guardado exitoso (${sizeInMB}MB)`);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('❌ QuotaExceededError: localStorage lleno');
      
      // Intentar limpiar datos antiguos
      const contactos = data as ContactoDepartamento[];
      const contactosOptimizados = contactos.map(optimizarContacto);
      
      try {
        localStorage.setItem(key, JSON.stringify(contactosOptimizados));
        console.log('✅ Guardado exitoso después de optimizar');
        return true;
      } catch (secondError) {
        console.error('❌ No se pudo guardar ni después de optimizar');
        alert('⚠️ Espacio de almacenamiento lleno. Por favor, elimine algunos contactos o sus fotos/documentos para liberar espacio.');
        return false;
      }
    }
    console.error('❌ Error al guardar:', error);
    return false;
  }
}

/**
 * 🛡️ VALIDACIÓN: Garantiza que los contactos tengan el campo 'activo' definido
 * NOTA: Las reglas de auto-corrección de departamento están DESACTIVADAS para permitir
 * que cualquier tipo de contacto pueda ser asignado a cualquier departamento
 */
function validarYCorregirContacto<T extends Partial<ContactoDepartamento>>(contacto: T): T {
  const contactoValidado = { ...contacto };
  
  // 🔥 CRÍTICO: Garantizar que TODOS los contactos tengan el campo 'activo' definido
  if (contacto.activo === undefined) {
    (contactoValidado as any).activo = true;
  }
  
  // REGLAS DE AUTO-CORRECCIÓN DE DEPARTAMENTO - DESACTIVADAS
  // Cualquier departamento puede tener cualquier tipo de contacto
  // Las reglas anteriores limitaban innecesariamente la flexibilidad del sistema
  
  /*
  // REGLA 1: Donadores, Fournisseurs, Transportistas y Partenaires van a Entrepôt (ID='2')
  if (contacto.tipo === 'donador' || contacto.tipo === 'fournisseur' || 
      contacto.tipo === 'transportista' || contacto.tipo === 'partenaire') {
    if (contacto.departamentoId !== '2') {
      console.warn(`⚠️ AUTO-CORRECCIÓN: ${contacto.tipo} debe tener departamentoId='2' (Entrepôt). Corrigiendo...`);
      (contactoValidado as any).departamentoId = '2';
      (contactoValidado as any).departamentoIds = ['2'];
    }
  }
  
  // REGLA 2: Bénévoles y Employés van a Comptoir (ID='1')
  if (contacto.tipo === 'benevole' || contacto.tipo === 'employe') {
    if (contacto.departamentoId !== '1') {
      console.warn(`⚠️ AUTO-CORRECCIÓN: ${contacto.tipo} debe tener departamentoId='1' (Comptoir). Corrigiendo...`);
      (contactoValidado as any).departamentoId = '1';
      (contactoValidado as any).departamentoIds = ['1'];
    }
  }
  */
  
  return contactoValidado;
}

export function obtenerContactosDepartamento(departamentoId?: string): ContactoDepartamento[] {
  const contactosGuardados = localStorage.getItem(STORAGE_KEY);
  const contactos = contactosGuardados ? JSON.parse(contactosGuardados) : [];
  
  if (departamentoId) {
    return contactos.filter((c: ContactoDepartamento) => c.departamentoId === departamentoId);
  }
  
  return contactos;
}

export function obtenerContactoPorId(id: string): ContactoDepartamento | undefined {
  const contactos = obtenerContactosDepartamento();
  return contactos.find(c => c.id === id);
}

export function guardarContacto(contacto: Omit<ContactoDepartamento, 'id'>): ContactoDepartamento {
  const contactos = obtenerContactosDepartamento();
  const nuevoContacto: ContactoDepartamento = optimizarContacto({
    ...validarYCorregirContacto(contacto),
    id: `contacto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  } as ContactoDepartamento);
  
  console.log('💾 DEBUG - Guardando nuevo contacto:', nuevoContacto);
  console.log('  - Nombre:', nuevoContacto.nombre, nuevoContacto.apellido);
  console.log('  - Tipo:', nuevoContacto.tipo);
  console.log('  - Activo:', nuevoContacto.activo);
  console.log('  - DepartamentoId:', nuevoContacto.departamentoId);
  
  contactos.push(nuevoContacto);
  
  // Guardar con manejo de cuota
  const guardadoExitoso = guardarEnLocalStorage(STORAGE_KEY, contactos);
  if (!guardadoExitoso) {
    // Si falla, intentar sin el nuevo contacto
    throw new Error('No se pudo guardar el contacto por falta de espacio');
  }
  
  console.log('✅ DEBUG - Contacto guardado. Total contactos en sistema:', contactos.length);
  return nuevoContacto;
}

export function actualizarContacto(id: string, contactoActualizado: Partial<ContactoDepartamento>): boolean {
  const contactos = obtenerContactosDepartamento();
  const index = contactos.findIndex(c => c.id === id);
  
  if (index !== -1) {
    contactos[index] = optimizarContacto({
      ...contactos[index],
      ...validarYCorregirContacto(contactoActualizado)
    } as ContactoDepartamento);
    
    return guardarEnLocalStorage(STORAGE_KEY, contactos);
  }
  return false;
}

export function eliminarContacto(id: string): boolean {
  const contactos = obtenerContactosDepartamento();
  const contactosFiltrados = contactos.filter(c => c.id !== id);
  
  if (contactosFiltrados.length < contactos.length) {
    return guardarEnLocalStorage(STORAGE_KEY, contactosFiltrados);
  }
  return false;
}

export function obtenerContactosPorTipo(departamentoId: string, tipo: TipoContacto): ContactoDepartamento[] {
  return obtenerContactosDepartamento(departamentoId).filter(c => c.tipo === tipo && c.activo);
}

export function obtenerContactosPorDepartamentoYTipo(departamentoId: string, tipos: TipoContacto[]): ContactoDepartamento[] {
  return obtenerContactosDepartamento(departamentoId).filter(c => tipos.includes(c.tipo) && c.activo);
}

export function contarContactosPorTipo(departamentoId: string): Record<TipoContacto, number> {
  const contactos = obtenerContactosDepartamento(departamentoId);
  return {
    donador: contactos.filter(c => c.tipo === 'donador' && c.activo).length,
    fournisseur: contactos.filter(c => c.tipo === 'fournisseur' && c.activo).length,
    benevole: contactos.filter(c => c.tipo === 'benevole' && c.activo).length,
    'responsable-sante': contactos.filter(c => c.tipo === 'responsable-sante' && c.activo).length,
    partenaire: contactos.filter(c => c.tipo === 'partenaire' && c.activo).length,
    visiteur: contactos.filter(c => c.tipo === 'visiteur' && c.activo).length,
    employe: contactos.filter(c => c.tipo === 'employe' && c.activo).length,
    transportista: contactos.filter(c => c.tipo === 'transportista' && c.activo).length
  };
}

export function cambiarEstadoContacto(id: string, activo: boolean): boolean {
  return actualizarContacto(id, { activo });
}

// ===== FUNCIÓN DE LIMPIEZA (OBSOLETA - Restricción eliminada) =====
// NOTA: Esta función ya no se utiliza porque todos los departamentos ahora pueden tener
// contactos de tipo fournisseur y donateur. Se mantiene comentada por si se necesita en el futuro.
/*
export function eliminarFournisseursYDonateurs(departamentoId: string = '2'): number {
  const todosContactos = obtenerContactosDepartamento();
  const contactosAntesCount = todosContactos.length;
  
  // Filtrar eliminando fournisseurs et donateurs de CUALQUIER departamento que NO sea Entrepôt (id='2')
  const contactosFiltrados = todosContactos.filter(contacto => {
    // Si NO es del departamento Entrepôt (id='2') Y es fournisseur ou donateur, eliminarlo
    if (contacto.departamentoId !== '2' && 
        (contacto.tipo === 'fournisseur' || contacto.tipo === 'donador')) {
      return false; // No incluir en la lista filtrada (eliminar)
    }
    return true; // Mantener el contacto
  });
  
  const contactosEliminados = contactosAntesCount - contactosFiltrados.length;
  
  if (contactosEliminados > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosFiltrados));
    console.log(`🗑️ Eliminados ${contactosEliminados} contactos (fournisseur/donateur) de departamentos que NO son Entrepôt`);
  }
  
  return contactosEliminados;
}
*/

// Función para inicializar contactos de ejemplo
export function inicializarContactosEjemplo(departamentoId?: string): void {
  // Si se proporciona un departamentoId, crear contactos solo para ese departamento
  // Si no, crear contactos para todos los departamentos (solo si no existen contactos)
  
  if (departamentoId) {
    // Modo: restaurar contactos de ejemplo para un departamento específico
    // Eliminar contactos existentes de ese departamento
    const todosContactos = obtenerContactosDepartamento();
    const contactosFiltrados = todosContactos.filter(c => c.departamentoId !== departamentoId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosFiltrados));
    
    // Crear contactos de ejemplo según el departamento
    const contactosEjemplo = obtenerContactosEjemploPorDepartamento(departamentoId);
    contactosEjemplo.forEach(contacto => guardarContacto(contacto));
    return;
  }
  
  // Modo: inicialización global
  const contactosExistentes = obtenerContactosDepartamento();
  
  // Si no hay contactos en absoluto, inicializar con ejemplos para todos los departamentos
  if (contactosExistentes.length === 0) {
    console.log('🎯 Inicializando contactos de ejemplo para todos los departamentos...');
    
    // Crear contactos de ejemplo para departamentos principales
    const departamentosConEjemplos = ['1', '2', '3', '4']; // Direction, Entrepôt, Achats, Comptoir
    
    departamentosConEjemplos.forEach(deptId => {
      const contactosEjemplo = obtenerContactosEjemploPorDepartamento(deptId);
      contactosEjemplo.forEach(contacto => guardarContacto(contacto));
      console.log(`✅ Contactos de ejemplo creados para departamento ${deptId}`);
    });
    
    console.log('🎉 Inicialización de contactos completada');
  }
}

// ===== FUNCIÓN PARA INICIALIZACIÓN AUTOMÁTICA DE CONTACTOS =====
// DESACTIVADA PARA PRODUCCIÓN - Sistema comienza sin datos de ejemplo
export function reinicializarContactosEjemploCompleto(): void {
  const VERSION_CONTACTOS = 'v4.0-production-clean'; // Versión de producción sin ejemplos
  const VERSION_ACTUAL = localStorage.getItem('contactos_version');
  
  // Si ya se inicializó esta versión, no hacer nada
  if (VERSION_ACTUAL === VERSION_CONTACTOS) {
    return;
  }
  
  // Solo marcar la versión sin crear datos de ejemplo
  localStorage.setItem('contactos_version', VERSION_CONTACTOS);
  console.log('✅ Sistema de contactos inicializado - Listo para recibir datos reales');
}

// Función auxiliar para obtener contactos de ejemplo por departamento
function obtenerContactosEjemploPorDepartamento(departamentoId: string): Omit<ContactoDepartamento, 'id'>[] {
  const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  switch (departamentoId) {
    case '1': // Direction
      return [
        {
          departamentoId: '1',
          tipo: 'benevole',
          nombre: 'Sophie',
          apellido: 'Leblanc',
          fechaNacimiento: '1980-05-12',
          genero: 'Femme',
          email: 'sophie.leblanc@banquealimentaire.ca',
          telefono: '(514) 555-0201',
          cargo: 'Directrice Générale',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Responsable de la direction générale',
          activo: true,
          fechaIngreso: '2019-01-15'
        }
      ];
      
    case '2': // Entrepôt
      return [
        // ===== BÉNÉVOLES =====
        {
          departamentoId: '2',
          tipo: 'benevole',
          nombre: 'Jean',
          apellido: 'Dupont',
          fechaNacimiento: '1995-05-15',
          genero: 'Homme',
          email: 'jean.dupont@email.com',
          telefono: '(514) 555-1001',
          cargo: 'Bénévole Tri Alimentaire',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Bénévole expérimenté. Disponible principalement le matin.',
          activo: true,
          fechaIngreso: '2023-01-15',
          direccion: '123 Rue Principale, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H3B 2K4'
        },
        {
          departamentoId: '2',
          tipo: 'benevole',
          nombre: 'Amélie',
          apellido: 'Leblanc',
          fechaNacimiento: '1988-08-22',
          genero: 'Femme',
          email: 'amelie.leblanc@email.com',
          telefono: '(514) 555-1002',
          cargo: 'Bénévole Réception',
          idiomas: ['fr'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: true })),
          notas: 'Motivée et organisée. Excellente pour la réception des dons.',
          activo: true,
          fechaIngreso: '2023-03-20',
          direccion: '456 Boulevard Saint-Laurent, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H2W 1X9'
        },
        
        // ===== RESPONSABLE DE SANTÉ =====
        {
          departamentoId: '2',
          tipo: 'responsable-sante',
          nombre: 'Dr. François',
          apellido: 'Tremblay',
          fechaNacimiento: '1975-06-08',
          genero: 'Homme',
          email: 'f.tremblay@santealimentaire.ca',
          telefono: '(514) 555-4001',
          cargo: 'Inspecteur Sanitaire',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Responsable de la conformité sanitaire et des inspections HACCP.',
          activo: true,
          fechaIngreso: '2022-02-01',
          direccion: '567 Avenue Santé, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H2X 3B8'
        },
        
        // ===== PARTENAIRE =====
        {
          departamentoId: '2',
          tipo: 'partenaire',
          nombre: 'Isabelle',
          apellido: 'Morin',
          fechaNacimiento: '1990-09-14',
          genero: 'Femme',
          email: 'i.morin@partenaires.org',
          telefono: '(514) 555-5001',
          cargo: 'Coordinatrice Partenariat',
          idiomas: ['fr', 'en', 'es'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: true })),
          notas: 'Représentante d\'une organisation partenaire. Coordination de projets communs.',
          activo: true,
          fechaIngreso: '2023-05-20',
          direccion: '890 Rue Collaboration, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H3H 2M4'
        },
        
        // ===== VISITEUR =====
        {
          departamentoId: '2',
          tipo: 'visiteur',
          nombre: 'Thomas',
          apellido: 'Bergeron',
          fechaNacimiento: '1998-12-30',
          genero: 'Homme',
          email: 'thomas.bergeron@outlook.com',
          telefono: '(514) 555-6001',
          cargo: 'Étudiant Observateur',
          idiomas: ['fr'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Étudiant en travail social. Visite ponctuelle pour observation et apprentissage.',
          activo: true,
          fechaIngreso: '2024-01-10',
          direccion: '345 Chemin Université, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H3A 2T5'
        }
      ];
      
    case '3': // Achats
      return [
        {
          departamentoId: '3',
          tipo: 'fournisseur',
          nombre: 'Carlos',
          apellido: 'Rodriguez',
          fechaNacimiento: '1979-02-28',
          genero: 'Homme',
          email: 'carlos.rodriguez@wholesale.ca',
          telefono: '(450) 555-4004',
          cargo: 'Directeur des Ventes',
          idiomas: ['fr', 'es', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Grossiste en alimentation. Offre des prix préférentiels pour organisations.',
          activo: true,
          fechaIngreso: '2019-11-05',
          direccion: '321 Chemin Industriel, Longueuil',
          ciudad: 'Longueuil',
          codigoPostal: 'J4G 2H9'
        }
      ];
      
    case '4': // Comptoir
      return [
        // ===== BÉNÉVOLE =====
        {
          departamentoId: '4',
          tipo: 'benevole',
          nombre: 'Marie',
          apellido: 'Lefebvre',
          fechaNacimiento: '1985-07-10',
          genero: 'Femme',
          email: 'marie.lefebvre@banquealimentaire.ca',
          telefono: '(514) 555-0202',
          cargo: 'Responsable du Comptoir',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Responsable du comptoir de distribution des aliments.',
          activo: true,
          fechaIngreso: '2020-06-15',
          direccion: '100 Rue du Comptoir, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H2Y 1C6'
        },
        
        // ===== RESPONSABLE DE SANTÉ =====
        {
          departamentoId: '4',
          tipo: 'responsable-sante',
          nombre: 'Dr. Lucie',
          apellido: 'Bernard',
          fechaNacimiento: '1978-04-22',
          genero: 'Femme',
          email: 'l.bernard@santealimentaire.ca',
          telefono: '(514) 555-0203',
          cargo: 'Hygiéniste Alimentaire',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Supervise les normes d\'hygiène au comptoir de distribution.',
          activo: true,
          fechaIngreso: '2021-08-12',
          direccion: '200 Avenue Santé, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H3A 1A1'
        },
        
        // ===== PARTENAIRE =====
        {
          departamentoId: '4',
          tipo: 'partenaire',
          nombre: 'Jacques',
          apellido: 'Gendron',
          fechaNacimiento: '1992-11-05',
          genero: 'Homme',
          email: 'j.gendron@partenaires.org',
          telefono: '(514) 555-0204',
          cargo: 'Coordonnateur Communautaire',
          idiomas: ['fr', 'en', 'es'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: true })),
          notas: 'Liaison avec les organisations communautaires partenaires du comptoir.',
          activo: true,
          fechaIngreso: '2022-03-25',
          direccion: '300 Rue Communauté, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H4C 2M5'
        },
        
        // ===== VISITEUR =====
        {
          departamentoId: '4',
          tipo: 'visiteur',
          nombre: 'Émilie',
          apellido: 'Chartrand',
          fechaNacimiento: '2000-06-18',
          genero: 'Femme',
          email: 'emilie.chartrand@hotmail.com',
          telefono: '(514) 555-0205',
          cargo: 'Stagiaire Observatrice',
          idiomas: ['fr'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Étudiante en nutrition. Stage d\'observation au comptoir.',
          activo: true,
          fechaIngreso: '2024-02-01',
          direccion: '400 Chemin Étudiant, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H3B 4G7'
        }
      ];
      
    default:
      return [];
  }
}

// ===== FUNCIÓN DE MIGRACIÓN: Transferir contactos desde el sistema antiguo =====
export function migrarContactosDesdeEntrepot(): { migrados: number; errores: number } {
  let migrados = 0;
  let errores = 0;

  try {
    // Obtener contactos del sistema antiguo
    const STORAGE_KEY_ANTIGUO = 'banqueAlimentaire_contactosEntrepot';
    const contactosAntiguos = localStorage.getItem(STORAGE_KEY_ANTIGUO);
    
    if (!contactosAntiguos) {
      console.log('No hay contactos antiguos para migrar');
      return { migrados: 0, errores: 0 };
    }

    const contactosParseados = JSON.parse(contactosAntiguos);
    console.log(`Se encontraron ${contactosParseados.length} contactos para migrar`);

    // Mapear tipo de contacto antiguo al nuevo sistema
    const mapearTipo = (tipoAntiguo: string): TipoContacto => {
      switch (tipoAntiguo) {
        case 'proveedor':
          return 'fournisseur';
        case 'donador':
          return 'donador';
        default:
          return 'partenaire'; // Los transportistas y otros se marcan como partenaires
      }
    };

    // Mapear género antiguo al nuevo sistema
    const mapearGenero = (generoAntiguo?: string): GeneroContacto => {
      if (!generoAntiguo) return 'Non spécifié';
      switch (generoAntiguo.toLowerCase()) {
        case 'masculino':
        case 'homme':
        case 'male':
          return 'Homme';
        case 'femenino':
        case 'femme':
        case 'female':
          return 'Femme';
        case 'otro':
        case 'autre':
        case 'other':
          return 'Autre';
        default:
          return 'Non spécifié';
      }
    };

    const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // Obtener contactos existentes para evitar duplicados
    const contactosExistentes = obtenerContactosDepartamento('2');
    const emailsExistentes = new Set(contactosExistentes.map(c => c.email.toLowerCase()));

    // Migrar cada contacto
    contactosParseados.forEach((contactoAntiguo: any) => {
      try {
        // Solo migrar donadores y proveedores al Almacén (departamentoId = '2')
        if (contactoAntiguo.tipoContacto !== 'proveedor' && contactoAntiguo.tipoContacto !== 'donador') {
          console.log(`Omitiendo contacto ${contactoAntiguo.nombre} (tipo: ${contactoAntiguo.tipoContacto})`);
          return;
        }

        // Verificar si ya existe el email
        if (emailsExistentes.has(contactoAntiguo.emailPrincipal?.toLowerCase() || '')) {
          console.log(`Contacto duplicado omitido: ${contactoAntiguo.emailPrincipal}`);
          return;
        }

        const nuevoContacto: Omit<ContactoDepartamento, 'id'> = {
          departamentoId: '2', // Todos van al Almacén
          tipo: mapearTipo(contactoAntiguo.tipoContacto),
          nombre: contactoAntiguo.nombre || '',
          apellido: contactoAntiguo.apellido || '',
          fechaNacimiento: contactoAntiguo.fechaNacimiento || '',
          genero: mapearGenero(contactoAntiguo.genero),
          email: contactoAntiguo.emailPrincipal || '',
          telefono: contactoAntiguo.telefonoPrincipal || '',
          cargo: '', // El cargo no está en el sistema antiguo
          idiomas: [], // No hay idiomas en el sistema antiguo
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: contactoAntiguo.notas || '',
          activo: contactoAntiguo.activo !== undefined ? contactoAntiguo.activo : true,
          fechaIngreso: contactoAntiguo.fechaCreacion || new Date().toISOString().split('T')[0],
          foto: contactoAntiguo.imagen || '',
          direccion: contactoAntiguo.direccion || '',
          ciudad: contactoAntiguo.ciudad || '',
          codigoPostal: contactoAntiguo.codigoPostal || '',
          numeroEmpleado: contactoAntiguo.numeroID || '',
          horario: contactoAntiguo.horarioDisponible || '',
          heuresSemaines: 0,
          reference: contactoAntiguo.nombreEmpresa || '',
          supervisor: '',
          especialidad: '',
          certificaciones: contactoAntiguo.etiquetas || [],
          documents: [],
          // Campos adicionales para compatibilidad con Gestión de Contactos Entrepôt
          numeroID: contactoAntiguo.numeroID || '',
          nombreEmpresa: contactoAntiguo.nombreEmpresa || '',
          tipoEmpresa: contactoAntiguo.tipoEmpresa || '',
          numeroRegistro: contactoAntiguo.numeroRegistro || '',
          numeroTVA: contactoAntiguo.numeroTVA || '',
          emailPrincipal: contactoAntiguo.emailPrincipal || '',
          emailSecundario: contactoAntiguo.emailSecundario || '',
          telefonoPrincipal: contactoAntiguo.telefonoPrincipal || '',
          telefonoSecundario: contactoAntiguo.telefonoSecundario || '',
          sitioWeb: contactoAntiguo.sitioWeb || '',
          pais: contactoAntiguo.pais || '',
          provincia: contactoAntiguo.provincia || '',
          banco: contactoAntiguo.banco || '',
          numeroCuenta: contactoAntiguo.numeroCuenta || '',
          numeroRuta: contactoAntiguo.numeroRuta || '',
          categoriaProductos: contactoAntiguo.categoriaProductos || [],
          temperaturaEspecializada: contactoAntiguo.temperaturaEspecializada || [],
          diasOperacion: contactoAntiguo.diasOperacion || [],
          tiempoEntrega: contactoAntiguo.tiempoEntrega || '',
          metodoPago: contactoAntiguo.metodoPago || [],
          etiquetas: contactoAntiguo.etiquetas || [],
          ultimoContacto: contactoAntiguo.ultimoContacto || '',
          imagen: contactoAntiguo.imagen || null
        };

        guardarContacto(nuevoContacto);
        emailsExistentes.add(nuevoContacto.email.toLowerCase());
        migrados++;
        console.log(`✅ Migrado: ${nuevoContacto.nombre} ${nuevoContacto.apellido} (${nuevoContacto.tipo})`);
      } catch (error) {
        console.error('Error al migrar contacto:', contactoAntiguo, error);
        errores++;
      }
    });

    console.log(`\n🎉 MIGRACIÓN COMPLETADA: ${migrados} contactos migrados, ${errores} errores`);
    return { migrados, errores };
  } catch (error) {
    console.error('Error en la migración:', error);
    return { migrados, errores: 1 };
  }
}

// ===== FUNCIÓN DE DIAGNÓSTICO =====
export function diagnosticarContactos(): void {
  console.log('\n🔍 ===== DIAGNÓSTICO DE CONTACTOS =====\n');
  
  const todosContactos = obtenerContactosDepartamento();
  console.log(`📊 Total de contactos en el sistema: ${todosContactos.length}`);
  
  // Agrupar por departamento
  const porDepartamento: { [key: string]: ContactoDepartamento[] } = {};
  todosContactos.forEach(c => {
    const deptId = c.departamentoId || 'sin-departamento';
    if (!porDepartamento[deptId]) {
      porDepartamento[deptId] = [];
    }
    porDepartamento[deptId].push(c);
  });
  
  console.log('\n📂 Contactos por Departamento:');
  Object.entries(porDepartamento).forEach(([deptId, contactos]) => {
    const nombresDepts: { [key: string]: string } = {
      '1': 'Direction',
      '2': 'Entrepôt',
      '3': 'Achats',
      '4': 'Comptoir',
      '5': 'Finance',
      '6': 'Communication',
      '7': 'Recrutement',
      '8': 'Transport',
      '9': 'Qualité',
      '10': 'IT'
    };
    const nombreDept = nombresDepts[deptId] || `Dept ${deptId}`;
    console.log(`\n  📁 ${nombreDept} (ID: ${deptId}) - ${contactos.length} contactos:`);
    contactos.forEach(c => {
      console.log(`    • ${c.nombre} ${c.apellido} (tipo: ${c.tipo}, activo: ${c.activo}, email: ${c.email})`);
    });
  });
  
  // Verificar contactos con problemas
  console.log('\n⚠️  Verificación de problemas:');
  const sinActivo = todosContactos.filter(c => c.activo === undefined);
  const inactivos = todosContactos.filter(c => c.activo === false);
  const sinDepartamento = todosContactos.filter(c => !c.departamentoId);
  
  if (sinActivo.length > 0) {
    console.log(`  ⚠️  ${sinActivo.length} contactos sin campo 'activo' definido:`);
    sinActivo.forEach(c => console.log(`    - ${c.nombre} ${c.apellido} (${c.id})`));
  }
  
  if (inactivos.length > 0) {
    console.log(`  🚫 ${inactivos.length} contactos marcados como inactivos:`);
    inactivos.forEach(c => console.log(`    - ${c.nombre} ${c.apellido} (${c.id})`));
  }
  
  if (sinDepartamento.length > 0) {
    console.log(`  ⚠️  ${sinDepartamento.length} contactos sin departamento asignado:`);
    sinDepartamento.forEach(c => console.log(`    - ${c.nombre} ${c.apellido} (${c.id})`));
  }
  
  if (sinActivo.length === 0 && inactivos.length === 0 && sinDepartamento.length === 0) {
    console.log('  ✅ No se detectaron problemas');
  }
  
  console.log('\n🔍 ===== FIN DEL DIAGNÓSTICO =====\n');
}

// ===== FUNCIONES PARA GESTIÓN DE DONADORES PRS =====

/**
 * Obtiene todos los donadores participantes del programa PRS
 */
export function obtenerDonadoresPRS(): ContactoDepartamento[] {
  const todosContactos = obtenerContactosDepartamento();
  return todosContactos.filter(c => 
    c.tipo === 'donador' && 
    c.participaPRS === true && 
    c.activo
  );
}

/**
 * Obtiene donadores PRS por departamento
 */
export function obtenerDonadoresPRSPorDepartamento(departamentoId: string): ContactoDepartamento[] {
  return obtenerDonadoresPRS().filter(d => d.departamentoId === departamentoId);
}

/**
 * Activa la participación de un contacto en el programa PRS
 */
export function activarParticipacionPRS(
  contactoId: string, 
  datosPRS: {
    fechaInicioPRS?: string;
    frecuenciaPRS?: number;
    diasRecoleccionPRS?: string[];
    horarioRecoleccionPRS?: string;
    contactoPRS?: string;
    telefonoPRS?: string;
    notasPRS?: string;
  }
): boolean {
  const contacto = obtenerContactoPorId(contactoId);
  
  if (!contacto) {
    console.error(`Contacto no encontrado: ${contactoId}`);
    return false;
  }
  
  if (contacto.tipo !== 'donador') {
    console.error(`Solo los donadores pueden participar en PRS. Tipo actual: ${contacto.tipo}`);
    return false;
  }
  
  return actualizarContacto(contactoId, {
    participaPRS: true,
    fechaInicioPRS: datosPRS.fechaInicioPRS || new Date().toISOString().split('T')[0],
    frecuenciaPRS: datosPRS.frecuenciaPRS || 1,
    diasRecoleccionPRS: datosPRS.diasRecoleccionPRS || [],
    horarioRecoleccionPRS: datosPRS.horarioRecoleccionPRS || '',
    contactoPRS: datosPRS.contactoPRS || '',
    telefonoPRS: datosPRS.telefonoPRS || '',
    notasPRS: datosPRS.notasPRS || ''
  });
}

/**
 * Desactiva la participación de un contacto en el programa PRS
 */
export function desactivarParticipacionPRS(contactoId: string): boolean {
  return actualizarContacto(contactoId, {
    participaPRS: false,
    fechaInicioPRS: undefined,
    frecuenciaPRS: undefined,
    diasRecoleccionPRS: undefined,
    horarioRecoleccionPRS: undefined,
    contactoPRS: undefined,
    telefonoPRS: undefined,
    notasPRS: undefined
  });
}

/**
 * Actualiza la información PRS de un donador
 */
export function actualizarInformacionPRS(
  contactoId: string,
  datosPRS: Partial<{
    frecuenciaPRS: number;
    diasRecoleccionPRS: string[];
    horarioRecoleccionPRS: string;
    contactoPRS: string;
    telefonoPRS: string;
    notasPRS: string;
  }>
): boolean {
  const contacto = obtenerContactoPorId(contactoId);
  
  if (!contacto) {
    console.error(`Contacto no encontrado: ${contactoId}`);
    return false;
  }
  
  if (!contacto.participaPRS) {
    console.error(`El contacto ${contactoId} no participa en PRS`);
    return false;
  }
  
  return actualizarContacto(contactoId, datosPRS);
}

/**
 * Verifica si un contacto participa en el programa PRS
 */
export function esParticipantePRS(contactoId: string): boolean {
  const contacto = obtenerContactoPorId(contactoId);
  return contacto?.participaPRS === true && contacto?.activo === true;
}

/**
 * Obtiene estadísticas del programa PRS
 */
export function obtenerEstadisticasPRS(): {
  totalParticipantes: number;
  participantesPorDepartamento: Record<string, number>;
  frecuenciaPromedio: number;
  diasMasActivos: string[];
} {
  const donadoresPRS = obtenerDonadoresPRS();
  
  // Calcular participantes por departamento
  const participantesPorDept: Record<string, number> = {};
  donadoresPRS.forEach(d => {
    participantesPorDept[d.departamentoId] = (participantesPorDept[d.departamentoId] || 0) + 1;
  });
  
  // Calcular frecuencia promedio
  const frecuencias = donadoresPRS
    .filter(d => d.frecuenciaPRS && d.frecuenciaPRS > 0)
    .map(d => d.frecuenciaPRS!);
  const frecuenciaPromedio = frecuencias.length > 0
    ? frecuencias.reduce((sum, f) => sum + f, 0) / frecuencias.length
    : 0;
  
  // Calcular días más activos
  const contadorDias: Record<string, number> = {};
  donadoresPRS.forEach(d => {
    if (d.diasRecoleccionPRS && d.diasRecoleccionPRS.length > 0) {
      d.diasRecoleccionPRS.forEach(dia => {
        contadorDias[dia] = (contadorDias[dia] || 0) + 1;
      });
    }
  });
  
  const diasMasActivos = Object.entries(contadorDias)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dia]) => dia);
  
  return {
    totalParticipantes: donadoresPRS.length,
    participantesPorDepartamento: participantesPorDept,
    frecuenciaPromedio: Math.round(frecuenciaPromedio * 10) / 10,
    diasMasActivos
  };
}

/**
 * Obtiene donadores PRS por día de recolección
 */
export function obtenerDonadoresPRSPorDia(dia: string): ContactoDepartamento[] {
  const donadoresPRS = obtenerDonadoresPRS();
  return donadoresPRS.filter(d => 
    d.diasRecoleccionPRS && 
    d.diasRecoleccionPRS.includes(dia)
  );
}

/**
 * Busca donadores PRS por criterios
 */
export function buscarDonadoresPRS(criterios: {
  nombreEmpresa?: string;
  ciudad?: string;
  frecuenciaMin?: number;
  dia?: string;
}): ContactoDepartamento[] {
  let resultados = obtenerDonadoresPRS();
  
  if (criterios.nombreEmpresa) {
    const nombreLower = criterios.nombreEmpresa.toLowerCase();
    resultados = resultados.filter(d => 
      d.nombreEmpresa?.toLowerCase().includes(nombreLower) ||
      d.nombre.toLowerCase().includes(nombreLower) ||
      d.apellido.toLowerCase().includes(nombreLower)
    );
  }
  
  if (criterios.ciudad) {
    const ciudadLower = criterios.ciudad.toLowerCase();
    resultados = resultados.filter(d => 
      d.ciudad?.toLowerCase().includes(ciudadLower)
    );
  }
  
  if (criterios.frecuenciaMin !== undefined) {
    resultados = resultados.filter(d => 
      d.frecuenciaPRS && d.frecuenciaPRS >= criterios.frecuenciaMin!
    );
  }
  
  if (criterios.dia) {
    resultados = resultados.filter(d => 
      d.diasRecoleccionPRS && d.diasRecoleccionPRS.includes(criterios.dia!)
    );
  }
  
  return resultados;
}

// ===== FUNCIONES DE UTILIDAD Y MANTENIMIENTO =====

/**
 * 📊 Obtener información sobre el uso de localStorage
 */
export function obtenerInfoAlmacenamiento(): {
  totalContactos: number;
  tamañoMB: number;
  contactosConFotos: number;
  contactosConDocumentos: number;
  totalDocumentos: number;
} {
  const contactos = obtenerContactosDepartamento();
  const jsonString = JSON.stringify(contactos);
  const tamañoBytes = jsonString.length;
  const tamañoMB = tamañoBytes / 1024 / 1024;
  
  const contactosConFotos = contactos.filter(c => c.foto || c.imagen).length;
  const contactosConDocumentos = contactos.filter(c => c.documents && c.documents.length > 0).length;
  const totalDocumentos = contactos.reduce((sum, c) => sum + (c.documents?.length || 0), 0);
  
  return {
    totalContactos: contactos.length,
    tamañoMB: parseFloat(tamañoMB.toFixed(2)),
    contactosConFotos,
    contactosConDocumentos,
    totalDocumentos
  };
}

/**
 * 🗑️ Eliminar todas las fotos de los contactos (para liberar espacio)
 */
export function eliminarTodasLasFotos(): number {
  const contactos = obtenerContactosDepartamento();
  let fotosEliminadas = 0;
  
  contactos.forEach(contacto => {
    if (contacto.foto || contacto.imagen) {
      fotosEliminadas++;
      contacto.foto = '';
      contacto.imagen = null;
    }
  });
  
  if (fotosEliminadas > 0) {
    guardarEnLocalStorage(STORAGE_KEY, contactos);
  }
  
  return fotosEliminadas;
}

/**
 * 🗑️ Eliminar todos los documentos de los contactos (para liberar espacio)
 */
export function eliminarTodosLosDocumentos(): number {
  const contactos = obtenerContactosDepartamento();
  let documentosEliminados = 0;
  
  contactos.forEach(contacto => {
    if (contacto.documents && contacto.documents.length > 0) {
      documentosEliminados += contacto.documents.length;
      contacto.documents = [];
    }
  });
  
  if (documentosEliminados > 0) {
    guardarEnLocalStorage(STORAGE_KEY, contactos);
  }
  
  return documentosEliminados;
}

/**
 * 🗜️ Optimizar todos los contactos existentes
 */
export function optimizarTodosLosContactos(): void {
  const contactos = obtenerContactosDepartamento();
  const contactosOptimizados = contactos.map(optimizarContacto);
  guardarEnLocalStorage(STORAGE_KEY, contactosOptimizados);
}

/**
 * FUNCIÓN DE LIMPIEZA: Eliminar contactos fournisseur obsoletos
 * Elimina los contactos "Distribution Alimentaire QC" y "Aliments Secs Laval"
 * que fueron creados como ejemplos pero no deben aparecer en el sistema
 */
export function eliminarFournisseursObsoletos(): number {
  const todosContactos = obtenerContactosDepartamento();
  const emailsAEliminar = [
    'ventes@distalim-qc.ca',
    'commandes@aliments-secs.ca'
  ];
  
  const contactosAntesCount = todosContactos.length;
  
  // Filtrar eliminando los contactos con esos emails específicos
  const contactosFiltrados = todosContactos.filter(contacto => {
    const debeEliminar = emailsAEliminar.includes(contacto.email.toLowerCase());
    if (debeEliminar) {
      console.log(`🗑️ Eliminando fournisseur obsoleto: ${contacto.nombre} ${contacto.apellido} (${contacto.email})`);
    }
    return !debeEliminar;
  });
  
  const contactosEliminados = contactosAntesCount - contactosFiltrados.length;
  
  if (contactosEliminados > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosFiltrados));
    console.log(`🗑️ Eliminados ${contactosEliminados} fournisseurs obsoletos del sistema`);
  } else {
    console.log('✅ No se encontraron fournisseurs obsoletos para eliminar');
  }
  
  return contactosEliminados;
}

/**
 * FUNCIÓN DE REPARACIÓN: Corregir contactos con problemas
 * Garantiza que todos los contactos tengan el campo 'activo' definido
 */
export function repararContactosConProblemas(): { reparados: number; errores: number } {
  console.log('\n🔧 ===== INICIANDO REPARACIÓN DE CONTACTOS =====\n');
  
  const todosContactos = obtenerContactosDepartamento();
  let reparados = 0;
  let errores = 0;
  
  console.log(`📊 Total de contactos a verificar: ${todosContactos.length}`);
  
  const contactosReparados = todosContactos.map(contacto => {
    let necesitaReparacion = false;
    const contactoReparado = { ...contacto };
    
    // REPARACIÓN 1: Garantizar campo 'activo'
    if (contacto.activo === undefined) {
      console.log(`⚠️  Reparando contacto sin campo 'activo': ${contacto.nombre} ${contacto.apellido}`);
      contactoReparado.activo = true;
      necesitaReparacion = true;
    }
    
    // REPARACIÓN 2: Garantizar departamentoId
    if (!contacto.departamentoId) {
      console.log(`⚠️  Reparando contacto sin departamentoId: ${contacto.nombre} ${contacto.apellido}`);
      contactoReparado.departamentoId = '1'; // Asignar a Direction por defecto
      necesitaReparacion = true;
    }
    
    if (necesitaReparacion) {
      reparados++;
      console.log(`✅ Contacto reparado: ${contactoReparado.nombre} ${contactoReparado.apellido}`);
    }
    
    return contactoReparado;
  });
  
  if (reparados > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosReparados));
    console.log(`\n✅ Reparación completada: ${reparados} contactos reparados`);
  } else {
    console.log('\n✅ No se encontraron contactos que necesiten reparación');
  }
  
  console.log('\n🔧 ===== FIN DE LA REPARACIÓN =====\n');
  
  return { reparados, errores };
}