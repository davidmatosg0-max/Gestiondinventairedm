// Datos compartidos de configuración del sistema

export type ProgramaEntrada = {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  color: string;
  activo: boolean;
  icono?: string;
};

// Pesos unitarios por tipo de unidad
export type PesosUnidad = {
  PLT?: number; // Paleta
  CJA?: number; // Caja
  UND?: number; // Unidad
  SAC?: number; // Saco
  BN?: number;  // Bac Noir
  kg?: number;  // Kilogramo
};

// Variante de una subcategoría (diferentes presentaciones del mismo producto)
export type Variante = {
  id: string;
  nombre: string; // Ej: "Grande", "500ml", "Marca A", "Orgánico"
  codigo?: string; // Código específico de la variante
  icono?: string;
  activa: boolean;
  unidad?: string; // Unidad de medida específica de esta variante (Paleta, Caja, Unidad, Saco, etc.)
  valorPorKg?: number; // Valor específico si difiere del producto base
  pesoUnitario?: number; // Peso específico de esta variante
  pesosUnidad?: PesosUnidad; // Pesos específicos para esta variante
  descripcion?: string;
  stockMinimo?: number; // Stock mínimo para alertas
};

export type Subcategoria = {
  id: string;
  nombre: string;
  icono?: string;
  activa: boolean;
  valorPorKg?: number;
  unidad?: string; // Unidad de medida por defecto (PLT, CJA, UND, SAC, BN, kg)
  pesoUnitario?: number; // DEPRECATED: Peso en kg de una unidad (mantener por compatibilidad)
  pesosUnidad?: PesosUnidad; // Nuevo: Pesos específicos para cada tipo de unidad
  descripcion?: string;
  variantes?: Variante[]; // Variantes del producto (opcional)
  stockMinimo?: number; // Stock mínimo para alertas
};

export type Categoria = {
  id: string;
  nombre: string;
  icono: string;
  activa: boolean;
  valorPorKg?: number;
  subcategorias?: Subcategoria[];
};

export const programasEntradaIniciales: ProgramaEntrada[] = [
  {
    id: '1',
    nombre: 'Achat',
    codigo: 'ACH',
    descripcion: 'Achat de produits pour la banque alimentaire',
    color: '#1E73BE',
    activo: true,
    icono: '🛒'
  },
  {
    id: '2',
    nombre: 'Don',
    codigo: 'DON',
    descripcion: 'Dons reçus des entreprises et particuliers',
    color: '#4CAF50',
    activo: true,
    icono: '🎁'
  },
  {
    id: '3',
    nombre: 'CPN',
    codigo: 'CPN',
    descripcion: 'Collecte Publique Nationale',
    color: '#FFC107',
    activo: true,
    icono: '📋'
  },
  {
    id: '6',
    nombre: 'PRS',
    codigo: 'PRS',
    descripcion: 'Programme de Récupération Spéciale',
    color: '#E91E63',
    activo: true,
    icono: '🚚'
  },
  {
    id: '4',
    nombre: 'PEAD',
    codigo: 'PEAD',
    descripcion: 'Programme Européen d\'Aide aux Démunis',
    color: '#9C27B0',
    activo: false,
    icono: '🇪🇺'
  },
  {
    id: '5',
    nombre: 'PAM',
    codigo: 'PAM',
    descripcion: 'Programme Alimentaire Mondial',
    color: '#FF5722',
    activo: false,
    icono: '🌍'
  },
];

export const categoriasIniciales: Categoria[] = [
  {
    id: '1',
    nombre: 'Fruits et Légumes',
    icono: '🥬',
    activa: true,
    valorPorKg: 15.0, // $15 par kg - exemple de base
    subcategorias: [
      { 
        id: '1-1', 
        nombre: 'Pommes', 
        icono: '🍎', 
        activa: true, 
        pesoUnitario: 0.15, 
        unidad: 'CJA', 
        descripcion: 'Pommes fraîches et délicieuses',
        pesosUnidad: {
          PLT: 500,
          CJA: 10.5,
          UND: 0.15,
          SAC: 25,
          BN: 15,
          kg: 1
        }
      },
      { id: '1-2', nombre: 'Oranges', icono: '🍊', activa: true, pesoUnitario: 0.1, unidad: 'CJA', descripcion: 'Oranges juteuses et rafraîchissantes' },
      { id: '1-3', nombre: 'Bananes', icono: '🍌', activa: true, pesoUnitario: 0.1, unidad: 'SAC', descripcion: 'Bananes mûres et sucrées' },
      { id: '1-4', nombre: 'Laitues', icono: '🥬', activa: true, pesoUnitario: 0.05, unidad: 'SAC', descripcion: 'Laitues fraîches et saines' },
      { id: '1-5', nombre: 'Tomates', icono: '🍅', activa: true, pesoUnitario: 0.1, unidad: 'CJA', descripcion: 'Tomates mûres et juteuses', valorPorKg: 18.0 }, // Valeur spécifique pour les tomates
    ]
  },
  {
    id: '2',
    nombre: 'Produits Laitiers',
    icono: '🥛',
    activa: true,
    valorPorKg: 25.0, // $25 par kg - produits laitiers
    subcategorias: [
      { id: '2-1', nombre: 'Lait', icono: '🥛', activa: true, pesoUnitario: 1, unidad: 'UND', descripcion: 'Lait frais et nutritif' },
      { id: '2-2', nombre: 'Fromage', icono: '🧀', activa: true, pesoUnitario: 0.5, unidad: 'kg', descripcion: 'Fromage frais et savoureux', valorPorKg: 35.0 }, // Fromage plus cher
      { id: '2-3', nombre: 'Yaourt', icono: '🍦', activa: true, pesoUnitario: 0.5, unidad: 'UND', descripcion: 'Yaourt crémeux et sain' },
    ]
  },
  {
    id: '3',
    nombre: 'Viandes et Poissons',
    icono: '🍖',
    activa: true,
    valorPorKg: 45.0, // $45 par kg - protéines
    subcategorias: [
      { id: '3-1', nombre: 'Poulet', icono: '🍗', activa: true, pesoUnitario: 0.5, unidad: 'kg', descripcion: 'Poulet frais et juteux', valorPorKg: 38.0 },
      { id: '3-2', nombre: 'Bœuf', icono: '🥩', activa: true, pesoUnitario: 0.5, unidad: 'kg', descripcion: 'Bœuf frais et savoureux', valorPorKg: 55.0 },
      { id: '3-3', nombre: 'Poisson', icono: '🐟', activa: true, pesoUnitario: 0.5, unidad: 'kg', descripcion: 'Poisson frais et sain', valorPorKg: 42.0 },
    ]
  },
  {
    id: '4',
    nombre: 'Boulangerie',
    icono: '🍞',
    activa: true,
    valorPorKg: 12.0, // $12 par kg - produits de boulangerie
    subcategorias: [
      { id: '4-1', nombre: 'Pain', icono: '🍞', activa: true, pesoUnitario: 0.5, unidad: 'UND', descripcion: 'Pain frais et délicieux' },
      { id: '4-2', nombre: 'Gâteaux', icono: '🎂', activa: true, pesoUnitario: 0.5, unidad: 'UND', descripcion: 'Gâteaux sucrés et savoureux', valorPorKg: 20.0 },
    ]
  },
  {
    id: '5',
    nombre: 'Conserves',
    icono: '🥫',
    activa: true,
    valorPorKg: 8.0, // $8 par kg - produits en conserve
    subcategorias: [
      { id: '5-1', nombre: 'Légumes en Conserve', icono: '🥫', activa: true, pesoUnitario: 0.5, unidad: 'UND', descripcion: 'Légumes en conserve et préservés' },
      { id: '5-2', nombre: 'Fruits en Conserve', icono: '🍑', activa: true, pesoUnitario: 0.5, unidad: 'UND', descripcion: 'Fruits en conserve et préservés' },
    ]
  },
];