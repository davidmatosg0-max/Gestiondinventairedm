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
  { emoji: '🥯', nombre: 'Bagel', categoria: 'Granos y Cereales' },
  { emoji: '🫓', nombre: 'Pan Plano', categoria: 'Granos y Cereales' },
  { emoji: '🌾', nombre: 'Trigo/Granos', categoria: 'Granos y Cereales' },
  { emoji: '🍜', nombre: 'Fideos', categoria: 'Granos y Cereales' },
  
  // Legumbres
  { emoji: '🫘', nombre: 'Legumbres', categoria: 'Legumbres' },
  { emoji: '🥜', nombre: 'Cacahuetes', categoria: 'Legumbres' },
  { emoji: '🌰', nombre: 'Castañas', categoria: 'Legumbres' },
  
  // Conservas y Enlatados
  { emoji: '🥫', nombre: 'Conservas', categoria: 'Conservas' },
  { emoji: '🫙', nombre: 'Frascos/Mermeladas', categoria: 'Conservas' },
  
  // Lácteos
  { emoji: '🥛', nombre: 'Leche', categoria: 'Lácteos' },
  { emoji: '🧀', nombre: 'Queso', categoria: 'Lácteos' },
  { emoji: '🧈', nombre: 'Mantequilla', categoria: 'Lácteos' },
  { emoji: '🥤', nombre: 'Yogurt/Bebida', categoria: 'Lácteos' },
  { emoji: '🍦', nombre: 'Helado', categoria: 'Lácteos' },
  { emoji: '🍨', nombre: 'Helado Copa', categoria: 'Lácteos' },
  { emoji: '🧁', nombre: 'Postre Lácteo', categoria: 'Lácteos' },
  
  // Frutas
  { emoji: '🍎', nombre: 'Manzana', categoria: 'Frutas' },
  { emoji: '🍏', nombre: 'Manzana Verde', categoria: 'Frutas' },
  { emoji: '🍊', nombre: 'Naranja', categoria: 'Frutas' },
  { emoji: '🍋', nombre: 'Limón', categoria: 'Frutas' },
  { emoji: '🍌', nombre: 'Plátano', categoria: 'Frutas' },
  { emoji: '🍇', nombre: 'Uvas', categoria: 'Frutas' },
  { emoji: '🍓', nombre: 'Fresa', categoria: 'Frutas' },
  { emoji: '🫐', nombre: 'Arándanos', categoria: 'Frutas' },
  { emoji: '🍑', nombre: 'Durazno', categoria: 'Frutas' },
  { emoji: '🍒', nombre: 'Cerezas', categoria: 'Frutas' },
  { emoji: '🍉', nombre: 'Sandía', categoria: 'Frutas' },
  { emoji: '🍈', nombre: 'Melón', categoria: 'Frutas' },
  { emoji: '🍐', nombre: 'Pera', categoria: 'Frutas' },
  { emoji: '🍍', nombre: 'Piña', categoria: 'Frutas' },
  { emoji: '🥭', nombre: 'Mango', categoria: 'Frutas' },
  { emoji: '🥝', nombre: 'Kiwi', categoria: 'Frutas' },
  { emoji: '🍅', nombre: 'Tomate', categoria: 'Frutas' },
  { emoji: '🥑', nombre: 'Aguacate', categoria: 'Frutas' },
  { emoji: '🥥', nombre: 'Coco', categoria: 'Frutas' },
  
  // Verduras y Vegetales
  { emoji: '🥬', nombre: 'Verduras de Hoja', categoria: 'Verduras' },
  { emoji: '🥕', nombre: 'Zanahoria', categoria: 'Verduras' },
  { emoji: '🥔', nombre: 'Papa', categoria: 'Verduras' },
  { emoji: '🌽', nombre: 'Maíz', categoria: 'Verduras' },
  { emoji: '🥦', nombre: 'Brócoli', categoria: 'Verduras' },
  { emoji: '🫑', nombre: 'Pimiento', categoria: 'Verduras' },
  { emoji: '🌶️', nombre: 'Chile Picante', categoria: 'Verduras' },
  { emoji: '🥒', nombre: 'Pepino', categoria: 'Verduras' },
  { emoji: '🧅', nombre: 'Cebolla', categoria: 'Verduras' },
  { emoji: '🧄', nombre: 'Ajo', categoria: 'Verduras' },
  { emoji: '🍆', nombre: 'Berenjena', categoria: 'Verduras' },
  { emoji: '🫛', nombre: 'Guisantes', categoria: 'Verduras' },
  { emoji: '🥗', nombre: 'Ensalada', categoria: 'Verduras' },
  
  // Proteínas Cárnicas
  { emoji: '🥩', nombre: 'Carne Roja', categoria: 'Proteínas' },
  { emoji: '🍗', nombre: 'Pollo', categoria: 'Proteínas' },
  { emoji: '🍖', nombre: 'Carne con Hueso', categoria: 'Proteínas' },
  { emoji: '🥓', nombre: 'Tocino', categoria: 'Proteínas' },
  { emoji: '🌭', nombre: 'Salchicha', categoria: 'Proteínas' },
  { emoji: '🍔', nombre: 'Hamburguesa', categoria: 'Proteínas' },
  
  // Pescados y Mariscos
  { emoji: '🐟', nombre: 'Pescado', categoria: 'Pescados y Mariscos' },
  { emoji: '🐠', nombre: 'Pescado Tropical', categoria: 'Pescados y Mariscos' },
  { emoji: '🦐', nombre: 'Camarón', categoria: 'Pescados y Mariscos' },
  { emoji: '🦞', nombre: 'Langosta', categoria: 'Pescados y Mariscos' },
  { emoji: '🦑', nombre: 'Calamar', categoria: 'Pescados y Mariscos' },
  { emoji: '🦪', nombre: 'Ostras', categoria: 'Pescados y Mariscos' },
  { emoji: '🍤', nombre: 'Camarón Frito', categoria: 'Pescados y Mariscos' },
  
  // Huevos
  { emoji: '🥚', nombre: 'Huevos', categoria: 'Huevos y Derivados' },
  { emoji: '🍳', nombre: 'Huevo Frito', categoria: 'Huevos y Derivados' },
  
  // Aceites, Grasas y Condimentos
  { emoji: '🫒', nombre: 'Aceitunas/Aceite', categoria: 'Aceites y Condimentos' },
  { emoji: '🌻', nombre: 'Aceite de Girasol', categoria: 'Aceites y Condimentos' },
  { emoji: '🧂', nombre: 'Sal', categoria: 'Aceites y Condimentos' },
  { emoji: '🌿', nombre: 'Hierbas', categoria: 'Aceites y Condimentos' },
  
  // Bebidas Calientes
  { emoji: '☕', nombre: 'Café', categoria: 'Bebidas Calientes' },
  { emoji: '🍵', nombre: 'Té', categoria: 'Bebidas Calientes' },
  { emoji: '🫖', nombre: 'Tetera/Infusiones', categoria: 'Bebidas Calientes' },
  { emoji: '🧉', nombre: 'Mate', categoria: 'Bebidas Calientes' },
  
  // Bebidas Frías
  { emoji: '🧃', nombre: 'Jugo en Caja', categoria: 'Bebidas Frías' },
  { emoji: '🧊', nombre: 'Agua/Bebidas Frías', categoria: 'Bebidas Frías' },
  { emoji: '🥤', nombre: 'Refresco', categoria: 'Bebidas Frías' },
  { emoji: '🧋', nombre: 'Té Helado/Bubble Tea', categoria: 'Bebidas Frías' },
  { emoji: '🍹', nombre: 'Bebida Tropical', categoria: 'Bebidas Frías' },
  { emoji: '🍸', nombre: 'Cóctel', categoria: 'Bebidas Frías' },
  { emoji: '🍶', nombre: 'Sake/Bebida', categoria: 'Bebidas Frías' },
  { emoji: '🍾', nombre: 'Champagne', categoria: 'Bebidas Frías' },
  { emoji: '🍷', nombre: 'Vino', categoria: 'Bebidas Frías' },
  { emoji: '🍺', nombre: 'Cerveza', categoria: 'Bebidas Frías' },
  { emoji: '🍻', nombre: 'Cervezas', categoria: 'Bebidas Frías' },
  
  // Dulces y Postres
  { emoji: '🍯', nombre: 'Miel', categoria: 'Dulces y Postres' },
  { emoji: '🍫', nombre: 'Chocolate', categoria: 'Dulces y Postres' },
  { emoji: '🍬', nombre: 'Dulces', categoria: 'Dulces y Postres' },
  { emoji: '🍭', nombre: 'Paleta', categoria: 'Dulces y Postres' },
  { emoji: '🍮', nombre: 'Flan', categoria: 'Dulces y Postres' },
  { emoji: '🍰', nombre: 'Pastel', categoria: 'Dulces y Postres' },
  { emoji: '🎂', nombre: 'Torta', categoria: 'Dulces y Postres' },
  { emoji: '🧁', nombre: 'Cupcake', categoria: 'Dulces y Postres' },
  { emoji: '🥧', nombre: 'Pie', categoria: 'Dulces y Postres' },
  { emoji: '🍩', nombre: 'Dona', categoria: 'Dulces y Postres' },
  { emoji: '🍪', nombre: 'Galletas', categoria: 'Dulces y Postres' },
  { emoji: '🎂', nombre: 'Pastel de Cumpleaños', categoria: 'Dulces y Postres' },
  
  // Comidas Preparadas
  { emoji: '🍲', nombre: 'Sopa/Guiso', categoria: 'Comidas Preparadas' },
  { emoji: '🥘', nombre: 'Paella', categoria: 'Comidas Preparadas' },
  { emoji: '🍛', nombre: 'Curry', categoria: 'Comidas Preparadas' },
  { emoji: '🍜', nombre: 'Ramen', categoria: 'Comidas Preparadas' },
  { emoji: '🍝', nombre: 'Espagueti', categoria: 'Comidas Preparadas' },
  { emoji: '🍕', nombre: 'Pizza', categoria: 'Comidas Preparadas' },
  { emoji: '🌮', nombre: 'Taco', categoria: 'Comidas Preparadas' },
  { emoji: '🌯', nombre: 'Burrito', categoria: 'Comidas Preparadas' },
  { emoji: '🫔', nombre: 'Tamal', categoria: 'Comidas Preparadas' },
  { emoji: '🥙', nombre: 'Shawarma', categoria: 'Comidas Preparadas' },
  { emoji: '🥪', nombre: 'Sándwich', categoria: 'Comidas Preparadas' },
  { emoji: '🍱', nombre: 'Bento/Comida Preparada', categoria: 'Comidas Preparadas' },
  { emoji: '🍙', nombre: 'Onigiri', categoria: 'Comidas Preparadas' },
  { emoji: '🍘', nombre: 'Galleta de Arroz', categoria: 'Comidas Preparadas' },
  { emoji: '🍢', nombre: 'Oden', categoria: 'Comidas Preparadas' },
  { emoji: '🍡', nombre: 'Dango', categoria: 'Comidas Preparadas' },
  { emoji: '🥟', nombre: 'Dumpling', categoria: 'Comidas Preparadas' },
  { emoji: '🥠', nombre: 'Galleta de la Fortuna', categoria: 'Comidas Preparadas' },
  { emoji: '🥡', nombre: 'Comida para Llevar', categoria: 'Comidas Preparadas' },
  
  // Snacks y Aperitivos
  { emoji: '🥜', nombre: 'Maní', categoria: 'Snacks' },
  { emoji: '🍿', nombre: 'Palomitas', categoria: 'Snacks' },
  { emoji: '🥨', nombre: 'Pretzel', categoria: 'Snacks' },
  { emoji: '🍘', nombre: 'Crackers', categoria: 'Snacks' },
  { emoji: '🍢', nombre: 'Brochetas', categoria: 'Snacks' },
  { emoji: '🧆', nombre: 'Falafel', categoria: 'Snacks' },
  
  // Pan y Panadería
  { emoji: '🥖', nombre: 'Pan Francés', categoria: 'Panadería' },
  { emoji: '🥐', nombre: 'Croissant', categoria: 'Panadería' },
  { emoji: '🥯', nombre: 'Bagel', categoria: 'Panadería' },
  { emoji: '🍞', nombre: 'Pan de Molde', categoria: 'Panadería' },
  { emoji: '🫓', nombre: 'Pan Árabe', categoria: 'Panadería' },
  
  // Especias y Hierbas
  { emoji: '🧂', nombre: 'Sal/Especias', categoria: 'Especias' },
  { emoji: '🌿', nombre: 'Hierbas Aromáticas', categoria: 'Especias' },
  { emoji: '🌶️', nombre: 'Chile Seco', categoria: 'Especias' },
  
  // Genéricos y Múltiples
  { emoji: '📦', nombre: 'Paquete', categoria: 'Genérico' },
  { emoji: '🛒', nombre: 'Despensa', categoria: 'Genérico' },
  { emoji: '🍽️', nombre: 'Alimentos en General', categoria: 'Genérico' },
  { emoji: '🥄', nombre: 'Cucharada/Porción', categoria: 'Genérico' },
  { emoji: '🍴', nombre: 'Cubiertos', categoria: 'Genérico' },
  { emoji: '🥢', nombre: 'Palillos', categoria: 'Genérico' },
  { emoji: '🔪', nombre: 'Cuchillo/Corte', categoria: 'Genérico' },
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
  // Básicos
  '🍚', '🍝', '🍞', '🥖', '🥐', '🥣', '🌾',
  
  // Conservas y Lácteos
  '🥫', '🫙', '🥛', '🧀', '🧈', '🍦',
  
  // Frutas
  '🍎', '🍊', '🍌', '🍇', '🍓', '🥑', '🍅',
  
  // Verduras
  '🥬', '🥕', '🥔', '🌽', '🥦', '🧅', '🧄',
  
  // Proteínas
  '🥩', '🍗', '🐟', '🥚', '🍤',
  
  // Bebidas
  '☕', '🍵', '🧃', '🥤', '🧊', '🍷', '🍺',
  
  // Dulces
  '🍯', '🍫', '🍬', '🍪', '🍰', '🍩',
  
  // Comidas
  '🍲', '🍕', '🌮', '🥪', '🍱', '🥗',
  
  // Genéricos
  '📦', '🛒', '🍽️'
];

// Iconos para subcategorías (más específicos)
export const ICONOS_SUBCATEGORIAS = TODOS_LOS_ICONOS;