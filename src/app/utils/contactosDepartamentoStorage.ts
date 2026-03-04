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

const STORAGE_KEY = 'contactos_departamentos';

/**
 * 🛡️ VALIDACIÓN: Garantiza que donadores y fournisseurs siempre tengan departamentoId='2'
 */
function validarYCorregirContacto<T extends Partial<ContactoDepartamento>>(contacto: T): T {
  const contactoValidado = { ...contacto };
  
  // REGLA CRÍTICA: Donadores y Fournisseurs SIEMPRE deben ir a Entrepôt (ID='2')
  if (contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') {
    if (contacto.departamentoId !== '2') {
      console.warn(`⚠️ AUTO-CORRECCIÓN: ${contacto.tipo} debe tener departamentoId='2' (Entrepôt). Corrigiendo...`);
      (contactoValidado as any).departamentoId = '2';
    }
    
    // Por defecto, activar donadores y fournisseurs
    if (contacto.activo === undefined) {
      (contactoValidado as any).activo = true;
    }
  }
  
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
  const nuevoContacto: ContactoDepartamento = {
    ...validarYCorregirContacto(contacto),
    id: `contacto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  contactos.push(nuevoContacto);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
  return nuevoContacto;
}

export function actualizarContacto(id: string, contactoActualizado: Partial<ContactoDepartamento>): boolean {
  const contactos = obtenerContactosDepartamento();
  const index = contactos.findIndex(c => c.id === id);
  
  if (index !== -1) {
    contactos[index] = {
      ...contactos[index],
      ...validarYCorregirContacto(contactoActualizado)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
    return true;
  }
  return false;
}

export function eliminarContacto(id: string): boolean {
  const contactos = obtenerContactosDepartamento();
  const contactosFiltrados = contactos.filter(c => c.id !== id);
  
  if (contactosFiltrados.length < contactos.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosFiltrados));
    return true;
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
        
        // ===== DONATEURS (VARIOS EJEMPLOS) =====
        {
          departamentoId: '2',
          tipo: 'donador',
          nombre: 'Pierre',
          apellido: 'Boulanger',
          email: 'pierre.boulanger@boulangerie-pierre.ca',
          telefono: '(514) 555-2001',
          cargo: 'Propriétaire',
          idiomas: ['fr'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Fait des dons mensuels de produits frais (pain, pâtisseries). Contact préférentiel pour produits de boulangerie.',
          activo: true,
          fechaIngreso: '2021-04-10',
          direccion: '789 Rue des Érables, Montréal, QC H3C 1K7',
          ciudad: 'Montréal',
          codigoPostal: 'H3C 1K7',
          nombreEmpresa: 'Boulangerie Artisanale Pierre',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-1234567890',
          numeroTVA: 'TVQ-123456789RT0001',
          emailPrincipal: 'pierre.boulanger@boulangerie-pierre.ca',
          telefonoPrincipal: '(514) 555-2001',
          sitioWeb: 'www.boulangerie-pierre.ca',
          pais: 'Canada',
          provincia: 'Québec',
          categoriaProductos: ['Produits de Boulangerie', 'Pâtisseries', 'Viennoiseries'],
          temperaturaEspecializada: ['Ambiante'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
          tiempoEntrega: '24-48 heures',
          etiquetas: ['Donateur Régulier', 'Produits Frais', 'Bio'],
          ultimoContacto: '2024-02-15'
        },
        {
          departamentoId: '2',
          tipo: 'donador',
          nombre: 'Sylvie',
          apellido: 'Marchand',
          fechaNacimiento: '1985-07-22',
          genero: 'Femme',
          email: 'sylvie.marchand@supermarche.ca',
          telefono: '(514) 555-2002',
          cargo: 'Directrice Opérations',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Supermarché local qui donne produits proches de péremption. Volume important.',
          activo: true,
          fechaIngreso: '2020-08-05',
          direccion: '1234 Boulevard Métropolitain, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H1N 2B3',
          nombreEmpresa: 'Supermarché Marchand & Fils',
          tipoEmpresa: 'ltee',
          numeroRegistro: 'NEQ-2345678901',
          numeroTVA: 'TVQ-234567890RT0001',
          emailPrincipal: 'sylvie.marchand@supermarche.ca',
          emailSecundario: 'dons@supermarche.ca',
          telefonoPrincipal: '(514) 555-2002',
          telefonoSecundario: '(514) 555-2003',
          sitioWeb: 'www.supermarche-marchand.ca',
          pais: 'Canada',
          provincia: 'Québec',
          categoriaProductos: ['Fruits et Légumes', 'Produits Laitiers', 'Viandes', 'Épicerie Sèche', 'Surgelés'],
          temperaturaEspecializada: ['Réfrigéré', 'Congelé', 'Ambiante'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
          tiempoEntrega: 'Même jour',
          metodoPago: ['Reçu fiscal'],
          etiquetas: ['Grand Volume', 'Donateur Fiable', 'Récurrent'],
          ultimoContacto: '2024-02-18'
        },
        {
          departamentoId: '2',
          tipo: 'donador',
          nombre: 'Ahmed',
          apellido: 'Hassan',
          fechaNacimiento: '1978-11-30',
          genero: 'Homme',
          email: 'ahmed.hassan@restaurant.ca',
          telefono: '(514) 555-2003',
          cargo: 'Chef Propriétaire',
          idiomas: ['fr', 'en', 'ar'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: true })),
          notas: 'Restaurant qui fait dons d\'aliments non utilisés. Qualité excellente.',
          activo: true,
          fechaIngreso: '2022-03-12',
          direccion: '567 Rue Saint-Denis, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H2J 2L3',
          nombreEmpresa: 'Restaurant Le Jardin Méditerranéen',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-3456789012',
          numeroTVA: 'TVQ-345678901RT0001',
          emailPrincipal: 'ahmed.hassan@restaurant.ca',
          telefonoPrincipal: '(514) 555-2003',
          sitioWeb: 'www.jardin-mediterraneen.ca',
          pais: 'Canada',
          provincia: 'Québec',
          categoriaProductos: ['Plats Préparés', 'Légumes Frais', 'Viandes'],
          temperaturaEspecializada: ['Réfrigéré', 'Ambiante'],
          diasOperacion: ['Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
          tiempoEntrega: '4-6 heures',
          etiquetas: ['Halal', 'Produits Frais', 'Qualité Premium'],
          ultimoContacto: '2024-02-10'
        },
        {
          departamentoId: '2',
          tipo: 'donador',
          nombre: 'Louise',
          apellido: 'Gauthier',
          fechaNacimiento: '1965-04-15',
          genero: 'Femme',
          email: 'louise.gauthier@ferme.ca',
          telefono: '(450) 555-2004',
          cargo: 'Propriétaire Fermière',
          idiomas: ['fr'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Ferme biologique. Dons saisonniers de légumes et fruits. Excellent partenariat.',
          activo: true,
          fechaIngreso: '2019-05-20',
          direccion: '2500 Chemin de la Ferme, Saint-Hyacinthe',
          ciudad: 'Saint-Hyacinthe',
          codigoPostal: 'J2S 8H7',
          nombreEmpresa: 'Ferme Bio Gauthier',
          tipoEmpresa: 'senc',
          numeroRegistro: 'NEQ-4567890123',
          numeroTVA: 'TVQ-456789012RT0001',
          emailPrincipal: 'louise.gauthier@ferme.ca',
          telefonoPrincipal: '(450) 555-2004',
          sitioWeb: 'www.ferme-bio-gauthier.ca',
          pais: 'Canada',
          provincia: 'Québec',
          categoriaProductos: ['Légumes Biologiques', 'Fruits Biologiques', 'Œufs'],
          temperaturaEspecializada: ['Ambiante', 'Réfrigéré'],
          diasOperacion: ['Lundi', 'Mercredi', 'Vendredi'],
          tiempoEntrega: '48-72 heures',
          etiquetas: ['Biologique', 'Local', 'Saisonnier'],
          ultimoContacto: '2024-01-28'
        },
        {
          departamentoId: '2',
          tipo: 'donador',
          nombre: 'Marc',
          apellido: 'Dubois',
          fechaNacimiento: '1992-09-08',
          genero: 'Homme',
          email: 'marc.dubois@entreprise.ca',
          telefono: '(514) 555-2005',
          cargo: 'Responsable RSE',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Entreprise technologique avec programme de dons corporatifs. Dons financiers et alimentaires.',
          activo: true,
          fechaIngreso: '2023-01-10',
          direccion: '8000 Boulevard Décarie, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H4P 2N2',
          nombreEmpresa: 'TechVision Solutions Inc.',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-5678901234',
          numeroTVA: 'TVQ-567890123RT0001',
          emailPrincipal: 'marc.dubois@entreprise.ca',
          emailSecundario: 'dons@techvision.ca',
          telefonoPrincipal: '(514) 555-2005',
          sitioWeb: 'www.techvision.ca',
          pais: 'Canada',
          provincia: 'Québec',
          categoriaProductos: ['Dons Financiers', 'Snacks et Collations', 'Café et Thé'],
          temperaturaEspecializada: ['Ambiante'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
          tiempoEntrega: '1 semaine',
          metodoPago: ['Virement Bancaire', 'Chèque'],
          etiquetas: ['Corporate', 'Programme RSE', 'Dons Mixtes'],
          ultimoContacto: '2024-02-01'
        },
        
        // ===== FOURNISSEURS (VARIOS EJEMPLOS) =====
        {
          departamentoId: '2',
          tipo: 'fournisseur',
          nombre: 'Marie-Claire',
          apellido: 'Gagnon',
          email: 'mc.gagnon@alimentspro.ca',
          telefono: '(450) 555-3001',
          cargo: 'Responsable Commerciale',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Fournisseur principal de produits secs et conserves. Offre des prix compétitifs pour organisations caritatives. Excellent service client et livraison fiable.',
          activo: true,
          fechaIngreso: '2020-09-12',
          direccion: '234 Boulevard Industriel, Laval, QC H7L 3S5',
          ciudad: 'Laval',
          codigoPostal: 'H7L 3S5',
          nombreEmpresa: 'Aliments Pro Distribution Inc.',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-6789012345',
          numeroTVA: 'TVQ-678901234RT0001',
          emailPrincipal: 'mc.gagnon@alimentspro.ca',
          emailSecundario: 'commandes@alimentspro.ca',
          telefonoPrincipal: '(450) 555-3001',
          telefonoSecundario: '(450) 555-3002',
          sitioWeb: 'www.aliments-pro.ca',
          pais: 'Canada',
          provincia: 'Québec',
          banco: 'Banque Nationale du Canada',
          numeroCuenta: '012345678901',
          numeroRuta: '00006',
          categoriaProductos: ['Épicerie Sèche', 'Conserves', 'Pâtes et Riz', 'Huiles et Condiments'],
          temperaturaEspecializada: ['Ambiante'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
          tiempoEntrega: '2-3 jours ouvrables',
          metodoPago: ['Facture Net 30', 'Virement Bancaire', 'Chèque'],
          etiquetas: ['Fournisseur Principal', 'Prix Compétitifs', 'Fiable'],
          ultimoContacto: '2024-02-19'
        },
        {
          departamentoId: '2',
          tipo: 'fournisseur',
          nombre: 'Jean-François',
          apellido: 'Lavoie',
          fechaNacimiento: '1975-06-14',
          genero: 'Homme',
          email: 'jf.lavoie@frozenfoods.ca',
          telefono: '(514) 555-3002',
          cargo: 'Directeur des Ventes',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Spécialiste en produits surgelés. Grande variété de légumes, viandes et plats préparés congelés.',
          activo: true,
          fechaIngreso: '2019-07-22',
          direccion: '4500 Rue Industrielle, Brossard',
          ciudad: 'Brossard',
          codigoPostal: 'J4Y 2P4',
          nombreEmpresa: 'Québec Frozen Foods Distribution',
          tipoEmpresa: 'ltee',
          numeroRegistro: 'NEQ-7890123456',
          numeroTVA: 'TVQ-789012345RT0001',
          emailPrincipal: 'jf.lavoie@frozenfoods.ca',
          emailSecundario: 'ventes@frozenfoods.ca',
          telefonoPrincipal: '(514) 555-3002',
          telefonoSecundario: '(514) 555-3003',
          sitioWeb: 'www.qc-frozen-foods.ca',
          pais: 'Canada',
          provincia: 'Québec',
          banco: 'Desjardins',
          numeroCuenta: '987654321098',
          numeroRuta: '81510',
          categoriaProductos: ['Surgelés', 'Légumes Congelés', 'Viandes Congelées', 'Plats Préparés Congelés'],
          temperaturaEspecializada: ['Congelé'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
          tiempoEntrega: '1-2 jours ouvrables',
          metodoPago: ['Facture Net 30', 'Virement Bancaire'],
          etiquetas: ['Spécialiste Surgelés', 'Livraison Réfrigérée', 'Grand Volume'],
          ultimoContacto: '2024-02-17'
        },
        {
          departamentoId: '2',
          tipo: 'fournisseur',
          nombre: 'Isabelle',
          apellido: 'Tremblay',
          fechaNacimiento: '1988-03-19',
          genero: 'Femme',
          email: 'isabelle.tremblay@laiterie.ca',
          telefono: '(450) 555-3003',
          cargo: 'Responsable Comptes Institutionnels',
          idiomas: ['fr'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: false })),
          notas: 'Laiterie régionale. Fournisseur de produits laitiers frais (lait, fromage, yogourt, beurre).',
          activo: true,
          fechaIngreso: '2021-02-08',
          direccion: '1500 Chemin de la Laiterie, Drummondville',
          ciudad: 'Drummondville',
          codigoPostal: 'J2C 5M2',
          nombreEmpresa: 'Laiterie du Centre-du-Québec',
          tipoEmpresa: 'ltee',
          numeroRegistro: 'NEQ-8901234567',
          numeroTVA: 'TVQ-890123456RT0001',
          emailPrincipal: 'isabelle.tremblay@laiterie.ca',
          emailSecundario: 'commandes@laiterie.ca',
          telefonoPrincipal: '(450) 555-3003',
          sitioWeb: 'www.laiterie-centreqc.ca',
          pais: 'Canada',
          provincia: 'Québec',
          banco: 'Caisse Desjardins Centre-du-Québec',
          numeroCuenta: '123456789012',
          numeroRuta: '81520',
          categoriaProductos: ['Produits Laitiers', 'Lait', 'Fromages', 'Yogourt', 'Beurre'],
          temperaturaEspecializada: ['Réfrigéré'],
          diasOperacion: ['Lundi', 'Mercredi', 'Vendredi'],
          tiempoEntrega: '24 heures',
          metodoPago: ['Facture Net 30', 'Chèque'],
          etiquetas: ['Produits Laitiers', 'Local', 'Frais Quotidien'],
          ultimoContacto: '2024-02-16'
        },
        {
          departamentoId: '2',
          tipo: 'fournisseur',
          nombre: 'Roberto',
          apellido: 'Martinez',
          fechaNacimiento: '1980-10-05',
          genero: 'Homme',
          email: 'roberto.martinez@fruitslegumes.ca',
          telefono: '(514) 555-3004',
          cargo: 'Gérant Régional',
          idiomas: ['fr', 'en', 'es'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Distributeur de fruits et légumes frais. Approvisionnement local et importé. Excellente fraîcheur.',
          activo: true,
          fechaIngreso: '2018-11-30',
          direccion: '3200 Marché Central, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H4N 3M5',
          nombreEmpresa: 'Fruits & Légumes Martinez Distribution',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-9012345678',
          numeroTVA: 'TVQ-901234567RT0001',
          emailPrincipal: 'roberto.martinez@fruitslegumes.ca',
          emailSecundario: 'commandes@fruitslegumes.ca',
          telefonoPrincipal: '(514) 555-3004',
          telefonoSecundario: '(514) 555-3005',
          sitioWeb: 'www.martinez-distribution.ca',
          pais: 'Canada',
          provincia: 'Québec',
          banco: 'Banque Nationale du Canada',
          numeroCuenta: '456789012345',
          numeroRuta: '00006',
          categoriaProductos: ['Fruits Frais', 'Légumes Frais', 'Produits Biologiques'],
          temperaturaEspecializada: ['Réfrigéré', 'Ambiante'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
          tiempoEntrega: 'Même jour si commande avant 10h',
          metodoPago: ['Facture Net 15', 'Virement Bancaire', 'Comptant'],
          etiquetas: ['Fruits et Légumes', 'Fraîcheur Garantie', 'Grand Volume', 'Livraison Rapide'],
          ultimoContacto: '2024-02-20'
        },
        {
          departamentoId: '2',
          tipo: 'fournisseur',
          nombre: 'Catherine',
          apellido: 'Roy',
          fechaNacimiento: '1985-12-02',
          genero: 'Femme',
          email: 'catherine.roy@boucherie.ca',
          telefono: '(514) 555-3005',
          cargo: 'Directrice Achats',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Boucherie et charcuterie. Fournisseur de viandes fraîches et transformées. Certifiée HACCP.',
          activo: true,
          fechaIngreso: '2020-04-15',
          direccion: '789 Avenue des Bouchers, Montréal',
          ciudad: 'Montréal',
          codigoPostal: 'H3L 2B9',
          nombreEmpresa: 'Boucherie Roy & Associés Inc.',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-0123456789',
          numeroTVA: 'TVQ-012345678RT0001',
          emailPrincipal: 'catherine.roy@boucherie.ca',
          emailSecundario: 'achats@boucherie.ca',
          telefonoPrincipal: '(514) 555-3005',
          telefonoSecundario: '(514) 555-3006',
          sitioWeb: 'www.boucherie-roy.ca',
          pais: 'Canada',
          provincia: 'Québec',
          banco: 'Banque Laurentienne',
          numeroCuenta: '567890123456',
          numeroRuta: '03910',
          categoriaProductos: ['Viandes Fraîches', 'Charcuterie', 'Volaille', 'Porc', 'Bœuf'],
          temperaturaEspecializada: ['Réfrigéré', 'Congelé'],
          diasOperacion: ['Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
          tiempoEntrega: '24-48 heures',
          metodoPago: ['Facture Net 30', 'Virement Bancaire'],
          etiquetas: ['Viandes', 'Certifié HACCP', 'Qualité Premium'],
          ultimoContacto: '2024-02-14'
        },
        {
          departamentoId: '2',
          tipo: 'fournisseur',
          nombre: 'Michel',
          apellido: 'Benoit',
          fechaNacimiento: '1972-08-28',
          genero: 'Homme',
          email: 'michel.benoit@importateur.ca',
          telefono: '(450) 555-3006',
          cargo: 'Président',
          idiomas: ['fr', 'en'],
          disponibilidades: diasSemana.map(jour => ({ jour, am: true, pm: true })),
          notas: 'Importateur spécialisé en produits ethniques et internationaux. Grande variété de produits.',
          activo: true,
          fechaIngreso: '2017-06-20',
          direccion: '5500 Rue Importation, Saint-Laurent',
          ciudad: 'Saint-Laurent',
          codigoPostal: 'H4S 1X8',
          nombreEmpresa: 'Importations Benoit Global Foods',
          tipoEmpresa: 'inc',
          numeroRegistro: 'NEQ-1122334455',
          numeroTVA: 'TVQ-112233445RT0001',
          emailPrincipal: 'michel.benoit@importateur.ca',
          emailSecundario: 'info@importateurbenoit.ca',
          telefonoPrincipal: '(450) 555-3006',
          telefonoSecundario: '(450) 555-3007',
          sitioWeb: 'www.benoit-global-foods.ca',
          pais: 'Canada',
          provincia: 'Québec',
          banco: 'TD Canada Trust',
          numeroCuenta: '678901234567',
          numeroRuta: '00004',
          categoriaProductos: ['Produits Ethniques', 'Épices', 'Condiments Internationaux', 'Produits Halal', 'Produits Asiatiques'],
          temperaturaEspecializada: ['Ambiante', 'Réfrigéré'],
          diasOperacion: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
          tiempoEntrega: '3-5 jours ouvrables',
          metodoPago: ['Facture Net 30', 'Virement Bancaire', 'Lettre de Crédit'],
          etiquetas: ['Importateur', 'Produits Internationaux', 'Grande Variété'],
          ultimoContacto: '2024-02-12'
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