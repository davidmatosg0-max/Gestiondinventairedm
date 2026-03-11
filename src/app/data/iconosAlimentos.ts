/**
 * Iconos estandarizados para el sistema de Banco de Alimentos
 * Todos los iconos están organizados por categorías para facilitar su uso
 */

export type IconoAlimento = {
  emoji: string;
  nombre: string;
  categoria: string;
};

// Iconos principales de categorías
export const ICONOS_CATEGORIAS: IconoAlimento[] = [
  // Granos y Cereales
  { emoji: '🍚', nombre: 'Arroz', categoria: 'Granos y Cereales' },
  { emoji: '🍝', nombre: 'Pasta', categoria: 'Granos y Cereales' },
  { emoji: '🍞', nombre: 'Pan', categoria: 'Granos y Cereales' },
  { emoji: '🥖', nombre: 'Baguette', categoria: 'Granos y Cereales' },
  { emoji: '🥣', nombre: 'Cereales', categoria: 'Granos y Cereales' },
  { emoji: '🥐', nombre: 'Croissant', categoria: 'Granos y Cereales' },
  
  // Legumbres
  { emoji: '🫘', nombre: 'Legumbres', categoria: 'Legumbres' },
  
  // Conservas
  { emoji: '🥫', nombre: 'Conservas', categoria: 'Conservas' },
  
  // Lácteos
  { emoji: '🥛', nombre: 'Leche', categoria: 'Lácteos' },
  { emoji: '🧀', nombre: 'Queso', categoria: 'Lácteos' },
  { emoji: '🧈', nombre: 'Mantequilla', categoria: 'Lácteos' },
  { emoji: '🥤', nombre: 'Yogurt/Bebida', categoria: 'Lácteos' },
  
  // Frutas
  { emoji: '🍎', nombre: 'Manzana', categoria: 'Frutas' },
  { emoji: '🍊', nombre: 'Naranja', categoria: 'Frutas' },
  { emoji: '🍌', nombre: 'Plátano', categoria: 'Frutas' },
  { emoji: '🍇', nombre: 'Uvas', categoria: 'Frutas' },
  { emoji: '🍓', nombre: 'Fresa', categoria: 'Frutas' },
  { emoji: '🍑', nombre: 'Durazno', categoria: 'Frutas' },
  { emoji: '🍒', nombre: 'Cerezas', categoria: 'Frutas' },
  { emoji: '🍉', nombre: 'Sandía', categoria: 'Frutas' },
  { emoji: '🍋', nombre: 'Limón', categoria: 'Frutas' },
  
  // Verduras
  { emoji: '🥬', nombre: 'Verduras de Hoja', categoria: 'Verduras' },
  { emoji: '🥕', nombre: 'Zanahoria', categoria: 'Verduras' },
  { emoji: '🥔', nombre: 'Papa', categoria: 'Verduras' },
  { emoji: '🌽', nombre: 'Maíz', categoria: 'Verduras' },
  { emoji: '🥦', nombre: 'Brócoli', categoria: 'Verduras' },
  { emoji: '🍅', nombre: 'Tomate', categoria: 'Verduras' },
  { emoji: '🫑', nombre: 'Pimiento', categoria: 'Verduras' },
  { emoji: '🥒', nombre: 'Pepino', categoria: 'Verduras' },
  { emoji: '🧅', nombre: 'Cebolla', categoria: 'Verduras' },
  { emoji: '🧄', nombre: 'Ajo', categoria: 'Verduras' },
  
  // Proteínas
  { emoji: '🥩', nombre: 'Carne', categoria: 'Proteínas' },
  { emoji: '🍗', nombre: 'Pollo', categoria: 'Proteínas' },
  { emoji: '🐟', nombre: 'Pescado', categoria: 'Proteínas' },
  { emoji: '🍤', nombre: 'Camarón', categoria: 'Proteínas' },
  { emoji: '🥚', nombre: 'Huevos', categoria: 'Proteínas' },
  
  // Aceites y Grasas
  { emoji: '🫒', nombre: 'Aceitunas/Aceite', categoria: 'Aceites y Grasas' },
  { emoji: '🌻', nombre: 'Aceite de Girasol', categoria: 'Aceites y Grasas' },
  
  // Bebidas
  { emoji: '☕', nombre: 'Café', categoria: 'Bebidas' },
  { emoji: '🧃', nombre: 'Jugo', categoria: 'Bebidas' },
  { emoji: '🧊', nombre: 'Agua/Bebidas frías', categoria: 'Bebidas' },
  
  // Condimentos y Dulces
  { emoji: '🍯', nombre: 'Miel', categoria: 'Condimentos y Dulces' },
  { emoji: '🧂', nombre: 'Sal', categoria: 'Condimentos y Dulces' },
  { emoji: '🍫', nombre: 'Chocolate', categoria: 'Condimentos y Dulces' },
  { emoji: '🍬', nombre: 'Dulces', categoria: 'Condimentos y Dulces' },
  { emoji: '🍪', nombre: 'Galletas', categoria: 'Condimentos y Dulces' },
  
  // Comidas Preparadas
  { emoji: '🥗', nombre: 'Ensalada', categoria: 'Comidas Preparadas' },
  { emoji: '🍲', nombre: 'Sopa/Guiso', categoria: 'Comidas Preparadas' },
  { emoji: '🌮', nombre: 'Tacos', categoria: 'Comidas Preparadas' },
  { emoji: '🍕', nombre: 'Pizza', categoria: 'Comidas Preparadas' },
  { emoji: '🍱', nombre: 'Comida Preparada', categoria: 'Comidas Preparadas' },
  
  // Snacks
  { emoji: '🥜', nombre: 'Nueces/Maní', categoria: 'Snacks' },
  { emoji: '🍿', nombre: 'Palomitas', categoria: 'Snacks' },
  
  // Genéricos
  { emoji: '📦', nombre: 'Paquete Genérico', categoria: 'Genérico' },
  { emoji: '🛒', nombre: 'Despensa', categoria: 'Genérico' },
  { emoji: '🍽️', nombre: 'Alimentos en General', categoria: 'Genérico' },
];

// Exportar solo los emojis para uso rápido
export const TODOS_LOS_ICONOS = ICONOS_CATEGORIAS.map(icono => icono.emoji);

// Iconos organizados por categoría para selectores
export const ICONOS_POR_CATEGORIA = ICONOS_CATEGORIAS.reduce((acc, icono) => {
  if (!acc[icono.categoria]) {
    acc[icono.categoria] = [];
  }
  acc[icono.categoria].push(icono);
  return acc;
}, {} as Record<string, IconoAlimento[]>);

// Función helper para buscar un icono por nombre
export function buscarIconoPorNombre(nombre: string): string | undefined {
  const icono = ICONOS_CATEGORIAS.find(
    i => i.nombre.toLowerCase().includes(nombre.toLowerCase())
  );
  return icono?.emoji;
}

// Iconos más comunes para categorías principales
export const ICONOS_PRINCIPALES = [
  '🍚', '🍝', '🥫', '🥛', '🥬', '🫒', '🍞', '🥩', '🐟', '🧀', 
  '🥚', '🍎', '🥕', '🥔', '🌽', '🥤', '☕', '🍯', '🧈', '🥗', 
  '🌮', '📦', '🛒', '🍽️'
];

// Iconos para subcategorías (más específicos)
export const ICONOS_SUBCATEGORIAS = TODOS_LOS_ICONOS;
