import { 
  Usuario, 
  Producto, 
  MovimientoInventario, 
  Comanda, 
  Organismo, 
  Transporte,
  IDDigital,
  Vehiculo,
  Ruta,
  UsuarioInterno
} from '../types';

export const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nombre: 'Marie Dubois',
    email: 'marie.dubois@banquealimentaire.org',
    rol: 'administrador',
    activo: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Jean Tremblay',
    email: 'jean.tremblay@banquealimentaire.org',
    rol: 'almacenista',
    activo: true,
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    nombre: 'Pierre Gagnon',
    email: 'pierre.gagnon@banquealimentaire.org',
    rol: 'transportista',
    activo: true,
    createdAt: '2024-03-10'
  }
];

// Base de datos de productos - VACÍA (Configurar productos desde el módulo Configuración)
export const mockProductos: Producto[] = [];

export const mockMovimientos: MovimientoInventario[] = [
  {
    id: '1',
    tipo: 'entrada',
    productoId: '1',
    cantidad: 500,
    motivo: 'Don de l\'entreprise Metro Plus',
    usuario: 'Marie Dubois',
    fecha: '2025-01-02',
    documentoReferencia: 'DON-2025-001'
  },
  {
    id: '2',
    tipo: 'salida',
    productoId: '2',
    cantidad: 150,
    motivo: 'Commande #CMD-001',
    usuario: 'Jean Tremblay',
    fecha: '2025-01-02',
    documentoReferencia: 'CMD-001'
  },
  {
    id: '3',
    tipo: 'entrada',
    productoId: '4',
    cantidad: 100,
    motivo: 'Sauvetage PRS',
    usuario: 'Marie Dubois',
    fecha: '2025-01-03',
    documentoReferencia: 'PRS-2025-001'
  }
];

export const mockComandas: Comanda[] = [];

// 🏢 ORGANISMOS - VACÍO PARA PRODUCCIÓN
export const mockOrganismos: Organismo[] = [];

export const mockTransportes: Transporte[] = [
  {
    id: '1',
    comandaId: '1',
    vehiculo: 'Camion - ABC-123',
    conductor: 'Pierre Gagnon',
    estado: 'entregado',
    origen: 'Entrepôt Central',
    destino: 'Salle Communautaire Saint-Joseph',
    fechaSalida: '2025-01-02T08:00:00',
    fechaEntrega: '2025-01-02T10:30:00'
  },
  {
    id: '2',
    comandaId: '2',
    vehiculo: 'Camionnette - XYZ-456',
    conductor: 'Luc Morin',
    estado: 'en_ruta',
    origen: 'Entrepôt Central',
    destino: 'Fondation Espoir',
    fechaSalida: '2025-01-03T09:00:00',
    ubicacionActual: {
      lat: 45.5686,
      lng: -73.7097
    }
  },
  {
    id: '3',
    comandaId: '3',
    vehiculo: 'Camion - DEF-789',
    conductor: 'Pierre Gagnon',
    estado: 'pendiente',
    origen: 'Entrepôt Central',
    destino: 'Foyer pour Enfants La Paix',
    fechaSalida: '2025-01-05T07:30:00'
  }
];

export const mockIDsDigitales: IDDigital[] = [
  {
    id: '1',
    organismoId: '1',
    beneficiario: 'Pedro López',
    numeroID: 'BA-2024-001',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    qrCode: 'QR-BA-2024-001',
    activo: true,
    fechaEmision: '2024-06-01',
    fechaVencimiento: '2025-06-01'
  },
  {
    id: '2',
    organismoId: '1',
    beneficiario: 'María Fernández',
    numeroID: 'BA-2024-002',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    qrCode: 'QR-BA-2024-002',
    activo: true,
    fechaEmision: '2024-06-15',
    fechaVencimiento: '2025-06-15'
  },
  {
    id: '3',
    organismoId: '2',
    beneficiario: 'José Ramírez',
    numeroID: 'BA-2024-003',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    qrCode: 'QR-BA-2024-003',
    activo: true,
    fechaEmision: '2024-07-01',
    fechaVencimiento: '2025-07-01'
  }
];

export const mockVehiculos: Vehiculo[] = [
  {
    id: '1',
    tipo: 'camion',
    marca: 'Mercedes-Benz',
    modelo: 'Actros 2546',
    placa: 'ABC-123',
    capacidadKg: 10000,
    capacidadM3: 45,
    anio: 2022,
    estado: 'disponible',
    conductorAsignado: '3', // Pierre Gagnon
    ultimoMantenimiento: '2024-12-15',
    proximoMantenimiento: '2025-03-15',
    kilometraje: 45000,
    consumoCombustible: 8.5,
    activo: true,
    notas: 'Camión principal para rutas largas'
  },
  {
    id: '2',
    tipo: 'camioneta',
    marca: 'Ford',
    modelo: 'Transit Custom',
    placa: 'XYZ-456',
    capacidadKg: 1500,
    capacidadM3: 10,
    anio: 2023,
    estado: 'en_uso',
    conductorAsignado: '3',
    ultimoMantenimiento: '2024-11-20',
    proximoMantenimiento: '2025-02-20',
    kilometraje: 32000,
    consumoCombustible: 12.5,
    activo: true,
    notas: 'Ideal pour les livraisons urbaines rapides'
  },
  {
    id: '3',
    tipo: 'refrigerado',
    marca: 'Isuzu',
    modelo: 'NQR 75L',
    placa: 'DEF-789',
    capacidadKg: 4500,
    capacidadM3: 20,
    anio: 2021,
    estado: 'disponible',
    ultimoMantenimiento: '2024-12-01',
    proximoMantenimiento: '2025-03-01',
    kilometraje: 67000,
    consumoCombustible: 10.2,
    activo: true,
    notas: 'Camion réfrigéré pour les produits PRS et périssables'
  },
  {
    id: '4',
    tipo: 'furgoneta',
    marca: 'Renault',
    modelo: 'Master L3H2',
    placa: 'GHI-321',
    capacidadKg: 2000,
    capacidadM3: 13,
    anio: 2020,
    estado: 'mantenimiento',
    ultimoMantenimiento: '2025-01-02',
    proximoMantenimiento: '2025-04-02',
    kilometraje: 89000,
    consumoCombustible: 11.8,
    activo: true,
    notas: 'En maintenance préventif - Reviens le 10/01/2025'
  },
  {
    id: '5',
    tipo: 'camion',
    marca: 'Volvo',
    modelo: 'FH16',
    placa: 'JKL-654',
    capacidadKg: 12000,
    capacidadM3: 50,
    anio: 2019,
    estado: 'fuera_servicio',
    ultimoMantenimiento: '2024-10-15',
    proximoMantenimiento: '2025-01-15',
    kilometraje: 125000,
    consumoCombustible: 7.8,
    activo: false,
    notas: 'Requiert une réparation majeure du moteur - Hors service temporairement'
  }
];

export const mockRutas: Ruta[] = [
  {
    id: '1',
    nombre: 'Ruta Centro - Zona Norte',
    fecha: '2025-01-06',
    vehiculoId: '1',
    conductorId: '3',
    estado: 'planificada',
    paradas: [
      {
        id: '1-1',
        orden: 1,
        organismoId: '1',
        comandaId: '1',
        direccion: '1250 Boulevard Curé-Labelle, Chomedey, Laval, QC H7W 1A1',
        coordenadas: { lat: 45.5547, lng: -73.7253 },
        tiempoEstimadoLlegada: '09:00',
        tiempoEstimadoDescarga: 20,
        estado: 'pendiente'
      },
      {
        id: '1-2',
        orden: 2,
        organismoId: '4',
        comandaId: '4',
        direccion: '4500 Boulevard Sainte-Rose, Sainte-Rose, Laval, QC H7L 1A1',
        coordenadas: { lat: 45.6108, lng: -73.7897 },
        tiempoEstimadoLlegada: '10:00',
        tiempoEstimadoDescarga: 25,
        estado: 'pendiente'
      }
    ],
    distanciaTotal: 35,
    tiempoEstimado: 150,
    notas: 'Ruta planifiée pour la livraison matinale'
  },
  {
    id: '2',
    nombre: 'Ruta Express - Zona Este',
    fecha: '2025-01-04',
    vehiculoId: '2',
    conductorId: '3',
    estado: 'en_curso',
    paradas: [
      {
        id: '2-1',
        orden: 1,
        organismoId: '2',
        comandaId: '2',
        direccion: '2340 Boulevard Cartier Ouest, Laval-des-Rapides, Laval, QC H7N 1A1',
        coordenadas: { lat: 45.5686, lng: -73.7097 },
        tiempoEstimadoLlegada: '11:30',
        tiempoEstimadoDescarga: 15,
        estado: 'en_ruta',
        horaLlegada: '11:25'
      }
    ],
    distanciaTotal: 18,
    tiempoEstimado: 60,
    horaInicio: '11:00',
    notas: 'Livraison urgente en cours'
  },
  {
    id: '3',
    nombre: 'Ruta Completa - Semana 1',
    fecha: '2025-01-02',
    vehiculoId: '1',
    conductorId: '3',
    estado: 'completada',
    paradas: [
      {
        id: '3-1',
        orden: 1,
        organismoId: '1',
        comandaId: '1',
        direccion: '1250 Boulevard Curé-Labelle, Chomedey, Laval, QC H7W 1A1',
        coordenadas: { lat: 45.5547, lng: -73.7253 },
        tiempoEstimadoLlegada: '08:30',
        tiempoEstimadoDescarga: 20,
        estado: 'completada',
        horaLlegada: '08:25',
        horaSalida: '08:50',
        observaciones: 'Livraison reçue sans problème'
      },
      {
        id: '3-2',
        orden: 2,
        organismoId: '3',
        comandaId: '3',
        direccion: '875 Boulevard de la Concorde Est, Duvernay, Laval, QC H7A 1A1',
        coordenadas: { lat: 45.5883, lng: -73.6892 },
        tiempoEstimadoLlegada: '09:30',
        tiempoEstimadoDescarga: 18,
        estado: 'completada',
        horaLlegada: '09:35',
        horaSalida: '09:55',
        observaciones: 'Tout est conforme, signé par le responsable'
      }
    ],
    distanciaTotal: 42,
    tiempoEstimado: 120,
    horaInicio: '08:00',
    horaFin: '10:15',
    notas: 'Ruta complétée avec succès'
  },
  {
    id: '4',
    nombre: 'Ruta PRS - Productos Perecederos',
    fecha: '2025-01-07',
    vehiculoId: '3',
    conductorId: '3',
    estado: 'planificada',
    paradas: [
      {
        id: '4-1',
        orden: 1,
        organismoId: '1',
        direccion: '1250 Boulevard Curé-Labelle, Chomedey, Laval, QC H7W 1A1',
        coordenadas: { lat: 45.5547, lng: -73.7253 },
        tiempoEstimadoLlegada: '07:00',
        tiempoEstimadoDescarga: 30,
        estado: 'pendiente'
      },
      {
        id: '4-2',
        orden: 2,
        organismoId: '4',
        direccion: '4500 Boulevard Sainte-Rose, Sainte-Rose, Laval, QC H7L 1A1',
        coordenadas: { lat: 45.6108, lng: -73.7897 },
        tiempoEstimadoLlegada: '08:00',
        tiempoEstimadoDescarga: 25,
        estado: 'pendiente'
      },
      {
        id: '4-3',
        orden: 3,
        organismoId: '2',
        direccion: '2340 Boulevard Cartier Ouest, Laval-des-Rapides, Laval, QC H7N 1A1',
        coordenadas: { lat: 45.5686, lng: -73.7097 },
        tiempoEstimadoLlegada: '09:00',
        tiempoEstimadoDescarga: 20,
        estado: 'pendiente'
      }
    ],
    distanciaTotal: 52,
    tiempoEstimado: 180,
    notas: 'Requiert un camion réfrigéré - Produits PRS périssables'
  }
];

// Usuarios Internos (Contactos - incluyendo Donadores, Vendedores, Voluntarios, Empleados, etc.)
export const mockUsuariosInternos: UsuarioInterno[] = [
  {
    id: '1',
    numeroID: 'BDV-2024-001',
    nombre: 'Sophie',
    apellido: 'Martin',
    categoria: 'benevole',
    email: 'sophie.martin@email.com',
    telefono: '(514) 555-0101',
    direccion: '123 Rue Saint-Laurent, Laval, QC',
    fechaNacimiento: '1985-03-15',
    fechaIngreso: '2024-01-10',
    foto: null,
    activo: true,
    departamento: 'Cocina',
    horasSemanales: 8
  },
  {
    id: '2',
    numeroID: 'EMP-2024-001',
    nombre: 'Jean',
    apellido: 'Tremblay',
    categoria: 'empleado',
    email: 'jean.tremblay@bancoalimentos.org',
    telefono: '(514) 555-0102',
    direccion: '456 Boulevard Cartier, Laval, QC',
    fechaNacimiento: '1990-07-22',
    fechaIngreso: '2023-06-15',
    foto: null,
    activo: true,
    departamento: 'Almacén',
    puesto: 'Coordinador de Almacén'
  },
  {
    id: '3',
    numeroID: 'PRG-2024-001',
    nombre: 'Marie',
    apellido: 'Dubois',
    categoria: 'programa',
    email: 'marie.dubois@email.com',
    telefono: '(514) 555-0103',
    direccion: '789 Avenue des Pins, Laval, QC',
    fechaNacimiento: '1988-11-30',
    fechaIngreso: '2024-02-01',
    foto: null,
    activo: true,
    departamento: 'Ayuda Alimentaria',
    programa: 'Formación Profesional'
  },
  {
    id: '4',
    numeroID: 'PTC-2024-001',
    nombre: 'Pierre',
    apellido: 'Gagnon',
    categoria: 'ptc',
    email: 'pierre.gagnon@email.com',
    telefono: '(514) 555-0104',
    direccion: '321 Rue de la Paix, Laval, QC',
    fechaNacimiento: '1995-05-18',
    fechaIngreso: '2024-03-15',
    foto: null,
    activo: true,
    departamento: 'Oficina',
    horasSemanales: 20
  },
  {
    id: '5',
    numeroID: 'DON-2024-001',
    nombre: 'Supermarchés Metro',
    apellido: '',
    categoria: 'donador',
    email: 'dons@metro.ca',
    telefono: '(514) 555-0201',
    direccion: '1000 Boulevard Industriel, Laval, QC',
    fechaIngreso: '2023-03-10',
    foto: null,
    activo: true,
    empresa: 'Metro Plus Laval',
    tipo: 'Supermarché'
  },
  {
    id: '6',
    numeroID: 'DON-2024-002',
    nombre: 'IGA Laval',
    apellido: '',
    categoria: 'donador',
    email: 'contact@iga-laval.ca',
    telefono: '(514) 555-0202',
    direccion: '2500 Boulevard Saint-Martin Ouest, Laval, QC',
    fechaIngreso: '2023-05-20',
    foto: null,
    activo: true,
    empresa: 'IGA Extra',
    tipo: 'Supermarché'
  },
  {
    id: '7',
    numeroID: 'DON-2024-003',
    nombre: 'Boulangerie Le Fournil',
    apellido: '',
    categoria: 'donador',
    email: 'info@lefournil.ca',
    telefono: '(514) 555-0203',
    direccion: '850 Rue Principale, Laval, QC',
    fechaIngreso: '2024-01-15',
    foto: null,
    activo: true,
    empresa: 'Le Fournil Artisan',
    tipo: 'Boulangerie'
  },
  {
    id: '10',
    numeroID: 'BDV-2024-002',
    nombre: 'Luc',
    apellido: 'Morin',
    categoria: 'benevole',
    email: 'luc.morin@email.com',
    telefono: '(514) 555-0105',
    direccion: '555 Avenue du Parc, Laval, QC',
    fechaNacimiento: '1992-09-08',
    fechaIngreso: '2024-04-20',
    foto: null,
    activo: true,
    departamento: 'Transporte',
    horasSemanales: 12
  },
  {
    id: '11',
    numeroID: 'BDV-2024-003',
    nombre: 'Isabelle',
    apellido: 'Côté',
    categoria: 'benevole',
    email: 'isabelle.cote@email.com',
    telefono: '(514) 555-0106',
    direccion: '234 Rue des Érables, Laval, QC',
    fechaNacimiento: '1987-12-14',
    fechaIngreso: '2024-05-10',
    foto: null,
    activo: true,
    departamento: 'Almacén',
    horasSemanales: 10
  },
  {
    id: '12',
    numeroID: 'EMP-2024-002',
    nombre: 'Claire',
    apellido: 'Lefebvre',
    categoria: 'empleado',
    email: 'claire.lefebvre@bancoalimentos.org',
    telefono: '(514) 555-0107',
    direccion: '678 Boulevard des Prairies, Laval, QC',
    fechaNacimiento: '1984-06-25',
    fechaIngreso: '2023-09-01',
    foto: null,
    activo: true,
    departamento: 'Administración',
    puesto: 'Directora Administrativa'
  }
];

// Registros de PRS (Programa de Rescate de Supermercados)
export interface RegistroPRS {
  id: string;
  fecha: string;
  supermercado: string;
  responsable: string;
  totalKg: number;
  productos: number;
  valorEstimado: number;
}

export const mockRegistrosPRS: RegistroPRS[] = [
  {
    id: '1',
    fecha: '2025-01-02',
    supermercado: 'Supermercado Metro Plus',
    responsable: 'Carlos Rodríguez',
    totalKg: 125.5,
    productos: 45,
    valorEstimado: 450.75
  },
  {
    id: '2',
    fecha: '2025-01-03',
    supermercado: 'IGA Extra Laval',
    responsable: 'Marie Lafontaine',
    totalKg: 98.3,
    productos: 38,
    valorEstimado: 380.20
  },
  {
    id: '3',
    fecha: '2025-01-04',
    supermercado: 'Walmart Supercentre',
    responsable: 'Sophie Bergeron',
    totalKg: 156.8,
    productos: 52,
    valorEstimado: 520.15
  },
  {
    id: '4',
    fecha: '2025-01-05',
    supermercado: 'Costco Wholesale Laval',
    responsable: 'Linda Gagnon',
    totalKg: 210.2,
    productos: 68,
    valorEstimado: 680.50
  },
  {
    id: '5',
    fecha: '2025-01-06',
    supermercado: 'Provigo Le Marché',
    responsable: 'Alain Côté',
    totalKg: 87.5,
    productos: 32,
    valorEstimado: 320.80
  }
];