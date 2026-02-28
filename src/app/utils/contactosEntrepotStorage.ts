/**
 * Système de gestion des contacts de l'entrepôt (fournisseurs, transporteurs, partenaires)
 * avec synchronisation automatique vers les formulaires d'entrée de produits
 */

const STORAGE_KEY = 'banqueAlimentaire_contactosEntrepot';

export interface ContactoEntrepot {
  id: string;
  tipoContacto: 'proveedor' | 'donador' | 'transportista' | 'otro';
  nombre: string;
  apellido: string;
  numeroID: string;
  imagen: string | null;
  nombreEmpresa: string;
  tipoEmpresa: string;
  numeroRegistro: string;
  numeroTVA: string;
  emailPrincipal: string;
  emailSecundario: string;
  telefonoPrincipal: string;
  telefonoSecundario: string;
  sitioWeb: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  banco: string;
  numeroCuenta: string;
  numeroRuta: string;
  categoriaProductos: string[];
  temperaturaEspecializada: string[];
  horarioDisponible: string;
  diasOperacion: string[];
  tiempoEntrega: string;
  metodoPago: string[];
  notas: string;
  etiquetas: string[];
  activo: boolean;
  fechaCreacion: string;
  ultimoContacto?: string;
  fechaNacimiento?: string;
  genero?: string;
}

// Datos de ejemplo iniciales
const contactosIniciales: ContactoEntrepot[] = [
  {
    id: '1',
    tipoContacto: 'proveedor',
    nombre: 'Jean',
    apellido: 'Dupont',
    numeroID: 'PRV-2024-001',
    imagen: null,
    nombreEmpresa: 'Aliments Frais Inc.',
    tipoEmpresa: 'inc',
    numeroRegistro: '1234567890 RC',
    numeroTVA: '123456789 TQ',
    emailPrincipal: 'jean.dupont@aliments-frais.com',
    emailSecundario: '',
    telefonoPrincipal: '+1 (514) 123-4567',
    telefonoSecundario: '',
    sitioWeb: 'https://www.aliments-frais.com',
    direccion: '123 Rue Principale',
    ciudad: 'Montréal',
    provincia: 'QC',
    codigoPostal: 'H2X 3Y7',
    pais: 'CA',
    banco: 'Banque Nationale',
    numeroCuenta: '1234567',
    numeroRuta: '12345-001',
    categoriaProductos: ['fruits', 'legumes'],
    temperaturaEspecializada: ['fresco', 'refrigerado'],
    horarioDisponible: '8h00 - 17h00',
    diasOperacion: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    tiempoEntrega: '24-48 heures',
    metodoPago: ['transferencia', 'cheque'],
    notas: 'Fournisseur fiable avec livraisons ponctuelles',
    etiquetas: ['vip', 'fiable', 'bio'],
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimoContacto: '2024-02-10'
  },
  {
    id: '2',
    tipoContacto: 'transportista',
    nombre: 'Marie',
    apellido: 'Tremblay',
    numeroID: 'TRP-2024-001',
    imagen: null,
    nombreEmpresa: 'Transport Éclair Ltée',
    tipoEmpresa: 'ltee',
    numeroRegistro: '9876543210 RC',
    numeroTVA: '987654321 TQ',
    emailPrincipal: 'marie@transport-eclair.com',
    emailSecundario: '',
    telefonoPrincipal: '+1 (514) 987-6543',
    telefonoSecundario: '+1 (514) 987-6544',
    sitioWeb: 'https://www.transport-eclair.com',
    direccion: '456 Avenue du Transport',
    ciudad: 'Laval',
    provincia: 'QC',
    codigoPostal: 'H7L 5M2',
    pais: 'CA',
    banco: '',
    numeroCuenta: '',
    numeroRuta: '',
    categoriaProductos: [],
    temperaturaEspecializada: ['refrigerado', 'congelado'],
    horarioDisponible: '6h00 - 22h00',
    diasOperacion: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    tiempoEntrega: '2-4 heures',
    metodoPago: ['transferencia'],
    notas: 'Service rapide et efficace',
    etiquetas: ['rapide', 'refrigere'],
    activo: true,
    fechaCreacion: '2024-02-01',
    ultimoContacto: '2024-02-15'
  },
  {
    id: '3',
    tipoContacto: 'donador',
    nombre: 'Pierre',
    apellido: 'Lavoie',
    numeroID: 'DON-2024-001',
    imagen: null,
    nombreEmpresa: 'Fondation Bon Coeur',
    tipoEmpresa: 'obnl',
    numeroRegistro: '5555555555 RC',
    numeroTVA: '',
    emailPrincipal: 'pierre.lavoie@boncoeur.org',
    emailSecundario: 'info@boncoeur.org',
    telefonoPrincipal: '+1 (514) 555-1234',
    telefonoSecundario: '',
    sitioWeb: 'https://www.boncoeur.org',
    direccion: '789 Boulevard Solidaire',
    ciudad: 'Montréal',
    provincia: 'QC',
    codigoPostal: 'H3A 1B2',
    pais: 'CA',
    banco: '',
    numeroCuenta: '',
    numeroRuta: '',
    categoriaProductos: ['conserves', 'produits-secs'],
    temperaturaEspecializada: ['ambiente'],
    horarioDisponible: '9h00 - 16h00',
    diasOperacion: ['lunes', 'miercoles', 'viernes'],
    tiempoEntrega: 'Sur rendez-vous',
    metodoPago: [],
    notas: 'Donateur régulier de produits non périssables',
    etiquetas: ['donateur', 'regulier', 'fiable'],
    activo: true,
    fechaCreacion: '2024-01-20',
    ultimoContacto: '2024-02-18'
  }
];

// Obtener todos les contactos
export function obtenerContactosEntrepot(): ContactoEntrepot[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    } else {
      // Solo inicializar la primera vez avec contactos de ejemplo
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosIniciales));
      return contactosIniciales;
    }
  } catch (error) {
    console.error('Error al obtener contactos del entrepot:', error);
    return [];
  }
}

// Guardar todos los contactos
export function guardarContactosEntrepot(contactos: ContactoEntrepot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
  } catch (error) {
    console.error('Error al guardar contactos del entrepot:', error);
  }
}

// Agregar un nuevo contacto
export function agregarContactoEntrepot(contacto: Omit<ContactoEntrepot, 'id' | 'fechaCreacion'>): ContactoEntrepot;
export function agregarContactoEntrepot(contacto: ContactoEntrepot): ContactoEntrepot;
export function agregarContactoEntrepot(contacto: any): ContactoEntrepot {
  const contactos = obtenerContactosEntrepot();
  
  // Si el contacto ya tiene id y fechaCreacion, usarlos
  const nuevoContacto: ContactoEntrepot = contacto.id && contacto.fechaCreacion 
    ? contacto
    : {
        ...contacto,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
  
  contactos.push(nuevoContacto);
  guardarContactosEntrepot(contactos);
  return nuevoContacto;
}

// Actualizar un contacto existente
export function actualizarContactoEntrepot(id: string, datosActualizados: Partial<ContactoEntrepot>): boolean {
  const contactos = obtenerContactosEntrepot();
  const index = contactos.findIndex(c => c.id === id);
  if (index !== -1) {
    contactos[index] = { ...contactos[index], ...datosActualizados };
    guardarContactosEntrepot(contactos);
    return true;
  }
  return false;
}

// Eliminar un contacto
export function eliminarContactoEntrepot(id: string): boolean {
  const contactos = obtenerContactosEntrepot();
  const nuevoArray = contactos.filter(c => c.id !== id);
  if (nuevoArray.length !== contactos.length) {
    guardarContactosEntrepot(nuevoArray);
    return true;
  }
  return false;
}

// Obtener contacto por ID
export function obtenerContactoPorId(id: string): ContactoEntrepot | undefined {
  const contactos = obtenerContactosEntrepot();
  return contactos.find(c => c.id === id);
}

// Obtener contactos activos
export function obtenerContactosActivos(): ContactoEntrepot[] {
  return obtenerContactosEntrepot().filter(c => c.activo);
}

// Obtener solo proveedores
export function obtenerProveedores(): ContactoEntrepot[] {
  return obtenerContactosEntrepot().filter(c => c.tipoContacto === 'proveedor' && c.activo);
}

// Obtener TODOS los proveedores (incluyendo inactivos)
export function obtenerTodosProveedores(): ContactoEntrepot[] {
  return obtenerContactosEntrepot().filter(c => c.tipoContacto === 'proveedor');
}

// Obtener solo donadores
export function obtenerDonadores(): ContactoEntrepot[] {
  return obtenerContactosEntrepot().filter(c => c.tipoContacto === 'donador' && c.activo);
}

// Obtener TODOS los donadores (incluyendo inactivos)
export function obtenerTodosDonadores(): ContactoEntrepot[] {
  return obtenerContactosEntrepot().filter(c => c.tipoContacto === 'donador');
}

// Obtener solo transportistas
export function obtenerTransportistas(): ContactoEntrepot[] {
  return obtenerContactosEntrepot().filter(c => c.tipoContacto === 'transportista' && c.activo);
}

// Buscar contactos por nombre o empresa
export function buscarContactos(termino: string): ContactoEntrepot[] {
  const contactos = obtenerContactosEntrepot();
  const terminoLower = termino.toLowerCase();
  return contactos.filter(c => 
    c.nombre.toLowerCase().includes(terminoLower) ||
    c.apellido.toLowerCase().includes(terminoLower) ||
    c.nombreEmpresa.toLowerCase().includes(terminoLower) ||
    c.numeroID.toLowerCase().includes(terminoLower)
  );
}

// Obtener el nombre completo du contacto (entreprise ou nom + prénom)
export function obtenerNombreCompleto(contacto: ContactoEntrepot): string {
  if (contacto.nombreEmpresa) {
    return contacto.nombreEmpresa;
  }
  return `${contacto.nombre} ${contacto.apellido}`.trim();
}

// Actualizar dernière date de contact
export function actualizarUltimoContacto(id: string): void {
  actualizarContactoEntrepot(id, {
    ultimoContacto: new Date().toISOString().split('T')[0]
  });
}

// Obtener statistiques de contact
export function obtenerEstadisticasContactos() {
  const contactos = obtenerContactosEntrepot();
  return {
    total: contactos.length,
    activos: contactos.filter(c => c.activo).length,
    proveedores: contactos.filter(c => c.tipoContacto === 'proveedor').length,
    donadores: contactos.filter(c => c.tipoContacto === 'donador').length,
    transportistas: contactos.filter(c => c.tipoContacto === 'transportista').length,
    otros: contactos.filter(c => c.tipoContacto === 'otro').length
  };
}