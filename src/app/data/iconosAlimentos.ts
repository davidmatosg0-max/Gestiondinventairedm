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
  
  // Verduras
  { emoji: '🥬', nombre: 'Verduras de Hoja', categoria: 'Verduras' },
  { emoji: '🥕', nombre: 'Zanahoria', categoria: 'Verduras' },
  { emoji: '🥔', nombre: 'Papa', categoria: 'Verduras' },
  { emoji: '🌽', nombre: 'Maíz', categoria: 'Verduras' },
  { emoji: '🥦', nombre: 'Brócoli', categoria: 'Verduras' },
  { emoji: '🧅', nombre: 'Cebolla', categoria: 'Verduras' },
  { emoji: '🧄', nombre: 'Ajo', categoria: 'Verduras' },
  
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
  
  // ==================== PRODUCTOS NO COMESTIBLES ====================
  
  // Higiene Personal
  { emoji: '🧴', nombre: 'Loción/Crema', categoria: 'Higiene Personal' },
  { emoji: '🧼', nombre: 'Jabón', categoria: 'Higiene Personal' },
  { emoji: '🧽', nombre: 'Esponja', categoria: 'Higiene Personal' },
  { emoji: '🪥', nombre: 'Cepillo de Dientes', categoria: 'Higiene Personal' },
  { emoji: '🪒', nombre: 'Rastrillo/Afeitadora', categoria: 'Higiene Personal' },
  { emoji: '💄', nombre: 'Cosmético/Lápiz Labial', categoria: 'Higiene Personal' },
  { emoji: '🧻', nombre: 'Papel Higiénico', categoria: 'Higiene Personal' },
  { emoji: '🪮', nombre: 'Peine', categoria: 'Higiene Personal' },
  { emoji: '💅', nombre: 'Esmalte de Uñas', categoria: 'Higiene Personal' },
  { emoji: '🧴', nombre: 'Champú/Gel', categoria: 'Higiene Personal' },
  { emoji: '🪮', nombre: 'Cepillo de Pelo', categoria: 'Higiene Personal' },
  { emoji: '🧖', nombre: 'Producto de Spa', categoria: 'Higiene Personal' },
  { emoji: '💆', nombre: 'Masaje/Cuidado Personal', categoria: 'Higiene Personal' },
  { emoji: '🧴', nombre: 'Desodorante', categoria: 'Higiene Personal' },
  
  // Productos de Limpieza
  { emoji: '🧹', nombre: 'Escoba', categoria: 'Productos de Limpieza' },
  { emoji: '🧺', nombre: 'Canasta/Lavandería', categoria: 'Productos de Limpieza' },
  { emoji: '🧽', nombre: 'Esponja de Limpieza', categoria: 'Productos de Limpieza' },
  { emoji: '🧴', nombre: 'Detergente', categoria: 'Productos de Limpieza' },
  { emoji: '🧼', nombre: 'Jabón de Ropa', categoria: 'Productos de Limpieza' },
  { emoji: '🪣', nombre: 'Cubeta', categoria: 'Productos de Limpieza' },
  { emoji: '🧹', nombre: 'Trapeador', categoria: 'Productos de Limpieza' },
  { emoji: '🗑️', nombre: 'Bolsas de Basura', categoria: 'Productos de Limpieza' },
  { emoji: '♻️', nombre: 'Reciclaje', categoria: 'Productos de Limpieza' },
  
  // Artículos para Bebés
  { emoji: '🍼', nombre: 'Biberón', categoria: 'Artículos para Bebés' },
  { emoji: '👶', nombre: 'Bebé/Artículos', categoria: 'Artículos para Bebés' },
  { emoji: '🧷', nombre: 'Pañal/Seguro', categoria: 'Artículos para Bebés' },
  { emoji: '🧸', nombre: 'Juguete', categoria: 'Artículos para Bebés' },
  { emoji: '🎀', nombre: 'Accesorios Bebé', categoria: 'Artículos para Bebés' },
  { emoji: '👼', nombre: 'Ropa de Bebé', categoria: 'Artículos para Bebés' },
  { emoji: '🧴', nombre: 'Loción para Bebé', categoria: 'Artículos para Bebés' },
  { emoji: '🛁', nombre: 'Productos de Baño', categoria: 'Artículos para Bebés' },
  
  // Productos de Salud y Bienestar
  { emoji: '💊', nombre: 'Medicamento/Píldora', categoria: 'Salud y Bienestar' },
  { emoji: '💉', nombre: 'Vacuna/Inyección', categoria: 'Salud y Bienestar' },
  { emoji: '🩹', nombre: 'Curita/Vendaje', categoria: 'Salud y Bienestar' },
  { emoji: '🩺', nombre: 'Estetoscopio/Salud', categoria: 'Salud y Bienestar' },
  { emoji: '🌡️', nombre: 'Termómetro', categoria: 'Salud y Bienestar' },
  { emoji: '💉', nombre: 'Jeringa', categoria: 'Salud y Bienestar' },
  { emoji: '🧬', nombre: 'ADN/Suplementos', categoria: 'Salud y Bienestar' },
  { emoji: '🧪', nombre: 'Laboratorio/Prueba', categoria: 'Salud y Bienestar' },
  { emoji: '⚕️', nombre: 'Medicina General', categoria: 'Salud y Bienestar' },
  { emoji: '🩼', nombre: 'Muleta/Apoyo', categoria: 'Salud y Bienestar' },
  { emoji: '🦽', nombre: 'Silla de Ruedas', categoria: 'Salud y Bienestar' },
  { emoji: '🦯', nombre: 'Bastón', categoria: 'Salud y Bienestar' },
  { emoji: '😷', nombre: 'Mascarilla', categoria: 'Salud y Bienestar' },
  { emoji: '🧤', nombre: 'Guantes', categoria: 'Salud y Bienestar' },
  
  // Ropa y Textiles
  { emoji: '👕', nombre: 'Camiseta', categoria: 'Ropa y Textiles' },
  { emoji: '👔', nombre: 'Corbata/Ropa Formal', categoria: 'Ropa y Textiles' },
  { emoji: '👖', nombre: 'Pantalón/Jeans', categoria: 'Ropa y Textiles' },
  { emoji: '👗', nombre: 'Vestido', categoria: 'Ropa y Textiles' },
  { emoji: '🧥', nombre: 'Abrigo/Chaqueta', categoria: 'Ropa y Textiles' },
  { emoji: '🧦', nombre: 'Calcetines', categoria: 'Ropa y Textiles' },
  { emoji: '👟', nombre: 'Zapatos Deportivos', categoria: 'Ropa y Textiles' },
  { emoji: '👞', nombre: 'Zapatos Formales', categoria: 'Ropa y Textiles' },
  { emoji: '🥾', nombre: 'Botas', categoria: 'Ropa y Textiles' },
  { emoji: '👠', nombre: 'Tacones', categoria: 'Ropa y Textiles' },
  { emoji: '👒', nombre: 'Sombrero', categoria: 'Ropa y Textiles' },
  { emoji: '🧢', nombre: 'Gorra', categoria: 'Ropa y Textiles' },
  { emoji: '🧣', nombre: 'Bufanda', categoria: 'Ropa y Textiles' },
  { emoji: '🧤', nombre: 'Guantes de Invierno', categoria: 'Ropa y Textiles' },
  { emoji: '👜', nombre: 'Bolso', categoria: 'Ropa y Textiles' },
  { emoji: '🎒', nombre: 'Mochila', categoria: 'Ropa y Textiles' },
  { emoji: '👓', nombre: 'Lentes', categoria: 'Ropa y Textiles' },
  { emoji: '🕶️', nombre: 'Lentes de Sol', categoria: 'Ropa y Textiles' },
  { emoji: '👑', nombre: 'Accesorios', categoria: 'Ropa y Textiles' },
  { emoji: '💍', nombre: 'Joyería/Anillo', categoria: 'Ropa y Textiles' },
  { emoji: '⌚', nombre: 'Reloj', categoria: 'Ropa y Textiles' },
  
  // Útiles Escolares y Papelería
  { emoji: '📚', nombre: 'Libros', categoria: 'Útiles Escolares' },
  { emoji: '📖', nombre: 'Libro Abierto', categoria: 'Útiles Escolares' },
  { emoji: '📓', nombre: 'Cuaderno', categoria: 'Útiles Escolares' },
  { emoji: '📝', nombre: 'Nota/Papel', categoria: 'Útiles Escolares' },
  { emoji: '✏️', nombre: 'Lápiz', categoria: 'Útiles Escolares' },
  { emoji: '✒️', nombre: 'Pluma', categoria: 'Útiles Escolares' },
  { emoji: '🖊️', nombre: 'Bolígrafo', categoria: 'Útiles Escolares' },
  { emoji: '🖍️', nombre: 'Crayón', categoria: 'Útiles Escolares' },
  { emoji: '🖌️', nombre: 'Pincel', categoria: 'Útiles Escolares' },
  { emoji: '📏', nombre: 'Regla', categoria: 'Útiles Escolares' },
  { emoji: '📐', nombre: 'Escuadra', categoria: 'Útiles Escolares' },
  { emoji: '✂️', nombre: 'Tijeras', categoria: 'Útiles Escolares' },
  { emoji: '📌', nombre: 'Chinche', categoria: 'Útiles Escolares' },
  { emoji: '📎', nombre: 'Clip', categoria: 'Útiles Escolares' },
  { emoji: '🖇️', nombre: 'Clips', categoria: 'Útiles Escolares' },
  { emoji: '📍', nombre: 'Alfiler', categoria: 'Útiles Escolares' },
  { emoji: '🗂️', nombre: 'Carpeta', categoria: 'Útiles Escolares' },
  { emoji: '📂', nombre: 'Folder', categoria: 'Útiles Escolares' },
  { emoji: '📁', nombre: 'Archivo', categoria: 'Útiles Escolares' },
  { emoji: '🎨', nombre: 'Pintura/Arte', categoria: 'Útiles Escolares' },
  { emoji: '🖍️', nombre: 'Colores', categoria: 'Útiles Escolares' },
  { emoji: '📊', nombre: 'Gráfica', categoria: 'Útiles Escolares' },
  { emoji: '📈', nombre: 'Estadísticas', categoria: 'Útiles Escolares' },
  { emoji: '🎓', nombre: 'Graduación/Educación', categoria: 'Útiles Escolares' },
  { emoji: '🎒', nombre: 'Mochila Escolar', categoria: 'Útiles Escolares' },
  
  // Artículos para el Hogar
  { emoji: '🛋️', nombre: 'Sofá/Mueble', categoria: 'Artículos para el Hogar' },
  { emoji: '🪑', nombre: 'Silla', categoria: 'Artículos para el Hogar' },
  { emoji: '🛏️', nombre: 'Cama', categoria: 'Artículos para el Hogar' },
  { emoji: '🛁', nombre: 'Tina/Baño', categoria: 'Artículos para el Hogar' },
  { emoji: '🚿', nombre: 'Ducha', categoria: 'Artículos para el Hogar' },
  { emoji: '🚽', nombre: 'Inodoro/Baño', categoria: 'Artículos para el Hogar' },
  { emoji: '🪞', nombre: 'Espejo', categoria: 'Artículos para el Hogar' },
  { emoji: '🪟', nombre: 'Ventana/Cortinas', categoria: 'Artículos para el Hogar' },
  { emoji: '🚪', nombre: 'Puerta', categoria: 'Artículos para el Hogar' },
  { emoji: '🛗', nombre: 'Elevador', categoria: 'Artículos para el Hogar' },
  { emoji: '🧯', nombre: 'Extintor', categoria: 'Artículos para el Hogar' },
  { emoji: '🔦', nombre: 'Linterna', categoria: 'Artículos para el Hogar' },
  { emoji: '💡', nombre: 'Foco/Iluminación', categoria: 'Artículos para el Hogar' },
  { emoji: '🕯️', nombre: 'Vela', categoria: 'Artículos para el Hogar' },
  { emoji: '🪔', nombre: 'Lámpara', categoria: 'Artículos para el Hogar' },
  { emoji: '🔌', nombre: 'Enchufe/Eléctrico', categoria: 'Artículos para el Hogar' },
  { emoji: '🔋', nombre: 'Batería/Pila', categoria: 'Artículos para el Hogar' },
  { emoji: '🧰', nombre: 'Caja de Herramientas', categoria: 'Artículos para el Hogar' },
  { emoji: '🔧', nombre: 'Llave/Herramienta', categoria: 'Artículos para el Hogar' },
  { emoji: '🔨', nombre: 'Martillo', categoria: 'Artículos para el Hogar' },
  { emoji: '🪛', nombre: 'Destornillador', categoria: 'Artículos para el Hogar' },
  { emoji: '⚙️', nombre: 'Engrane/Mecánico', categoria: 'Artículos para el Hogar' },
  { emoji: '🪚', nombre: 'Sierra', categoria: 'Artículos para el Hogar' },
  { emoji: '🔩', nombre: 'Tornillo/Tuerca', categoria: 'Artículos para el Hogar' },
  { emoji: '⛏️', nombre: 'Pico', categoria: 'Artículos para el Hogar' },
  { emoji: '🪓', nombre: 'Hacha', categoria: 'Artículos para el Hogar' },
  
  // Electrónica y Tecnología
  { emoji: '📱', nombre: 'Celular/Móvil', categoria: 'Electrónica' },
  { emoji: '💻', nombre: 'Computadora Portátil', categoria: 'Electrónica' },
  { emoji: '⌨️', nombre: 'Teclado', categoria: 'Electrónica' },
  { emoji: '🖱️', nombre: 'Mouse', categoria: 'Electrónica' },
  { emoji: '🖥️', nombre: 'Computadora de Escritorio', categoria: 'Electrónica' },
  { emoji: '🖨️', nombre: 'Impresora', categoria: 'Electrónica' },
  { emoji: '📷', nombre: 'Cámara', categoria: 'Electrónica' },
  { emoji: '📹', nombre: 'Videocámara', categoria: 'Electrónica' },
  { emoji: '📺', nombre: 'Televisión', categoria: 'Electrónica' },
  { emoji: '📻', nombre: 'Radio', categoria: 'Electrónica' },
  { emoji: '🎙️', nombre: 'Micrófono', categoria: 'Electrónica' },
  { emoji: '🎧', nombre: 'Audífonos', categoria: 'Electrónica' },
  { emoji: '🔊', nombre: 'Bocina/Altavoz', categoria: 'Electrónica' },
  { emoji: '📞', nombre: 'Teléfono', categoria: 'Electrónica' },
  { emoji: '☎️', nombre: 'Teléfono Fijo', categoria: 'Electrónica' },
  { emoji: '⏰', nombre: 'Reloj Despertador', categoria: 'Electrónica' },
  { emoji: '⏱️', nombre: 'Cronómetro', categoria: 'Electrónica' },
  { emoji: '⏲️', nombre: 'Temporizador', categoria: 'Electrónica' },
  { emoji: '🧮', nombre: 'Calculadora', categoria: 'Electrónica' },
  { emoji: '💾', nombre: 'Disco/Almacenamiento', categoria: 'Electrónica' },
  { emoji: '💿', nombre: 'CD', categoria: 'Electrónica' },
  { emoji: '📀', nombre: 'DVD', categoria: 'Electrónica' },
  { emoji: '🎮', nombre: 'Videojuego/Consola', categoria: 'Electrónica' },
  { emoji: '🕹️', nombre: 'Joystick', categoria: 'Electrónica' },
  
  // Artículos para Mascotas
  { emoji: '🐕', nombre: 'Perro/Alimento', categoria: 'Artículos para Mascotas' },
  { emoji: '🐈', nombre: 'Gato/Alimento', categoria: 'Artículos para Mascotas' },
  { emoji: '🐾', nombre: 'Huellas/Mascota', categoria: 'Artículos para Mascotas' },
  { emoji: '🦴', nombre: 'Hueso/Juguete', categoria: 'Artículos para Mascotas' },
  { emoji: '🐟', nombre: 'Pez/Acuario', categoria: 'Artículos para Mascotas' },
  { emoji: '🐦', nombre: 'Pájaro/Jaula', categoria: 'Artículos para Mascotas' },
  { emoji: '🐇', nombre: 'Conejo', categoria: 'Artículos para Mascotas' },
  { emoji: '🐹', nombre: 'Hámster', categoria: 'Artículos para Mascotas' },
  { emoji: '🦜', nombre: 'Loro', categoria: 'Artículos para Mascotas' },
  
  // Deportes y Recreación
  { emoji: '⚽', nombre: 'Fútbol/Balón', categoria: 'Deportes y Recreación' },
  { emoji: '🏀', nombre: 'Básquetbol', categoria: 'Deportes y Recreación' },
  { emoji: '🏈', nombre: 'Fútbol Americano', categoria: 'Deportes y Recreación' },
  { emoji: '⚾', nombre: 'Béisbol', categoria: 'Deportes y Recreación' },
  { emoji: '🎾', nombre: 'Tenis', categoria: 'Deportes y Recreación' },
  { emoji: '🏐', nombre: 'Voleibol', categoria: 'Deportes y Recreación' },
  { emoji: '🏓', nombre: 'Ping Pong', categoria: 'Deportes y Recreación' },
  { emoji: '🏸', nombre: 'Bádminton', categoria: 'Deportes y Recreación' },
  { emoji: '🥏', nombre: 'Frisbee', categoria: 'Deportes y Recreación' },
  { emoji: '🏏', nombre: 'Cricket', categoria: 'Deportes y Recreación' },
  { emoji: '🏑', nombre: 'Hockey', categoria: 'Deportes y Recreación' },
  { emoji: '🥅', nombre: 'Portería', categoria: 'Deportes y Recreación' },
  { emoji: '🎯', nombre: 'Dardos/Diana', categoria: 'Deportes y Recreación' },
  { emoji: '🪀', nombre: 'Yoyo', categoria: 'Deportes y Recreación' },
  { emoji: '🪁', nombre: 'Cometa', categoria: 'Deportes y Recreación' },
  { emoji: '🎣', nombre: 'Pesca', categoria: 'Deportes y Recreación' },
  { emoji: '🎽', nombre: 'Ropa Deportiva', categoria: 'Deportes y Recreación' },
  { emoji: '🥇', nombre: 'Medalla Oro', categoria: 'Deportes y Recreación' },
  { emoji: '🥈', nombre: 'Medalla Plata', categoria: 'Deportes y Recreación' },
  { emoji: '🥉', nombre: 'Medalla Bronce', categoria: 'Deportes y Recreación' },
  { emoji: '🏆', nombre: 'Trofeo', categoria: 'Deportes y Recreación' },
  
  // Juguetes y Entretenimiento
  { emoji: '🧸', nombre: 'Osito de Peluche', categoria: 'Juguetes' },
  { emoji: '🪀', nombre: 'Yoyo', categoria: 'Juguetes' },
  { emoji: '🪁', nombre: 'Cometa', categoria: 'Juguetes' },
  { emoji: '🎲', nombre: 'Dado/Juego de Mesa', categoria: 'Juguetes' },
  { emoji: '🧩', nombre: 'Rompecabezas', categoria: 'Juguetes' },
  { emoji: '🎭', nombre: 'Teatro/Máscaras', categoria: 'Juguetes' },
  { emoji: '🎪', nombre: 'Circo', categoria: 'Juguetes' },
  { emoji: '🎨', nombre: 'Arte/Manualidades', categoria: 'Juguetes' },
  { emoji: '🎬', nombre: 'Cine/Película', categoria: 'Juguetes' },
  { emoji: '🎤', nombre: 'Karaoke', categoria: 'Juguetes' },
  { emoji: '🎹', nombre: 'Piano/Música', categoria: 'Juguetes' },
  { emoji: '🎸', nombre: 'Guitarra', categoria: 'Juguetes' },
  { emoji: '🥁', nombre: 'Batería', categoria: 'Juguetes' },
  { emoji: '🎺', nombre: 'Trompeta', categoria: 'Juguetes' },
  { emoji: '🎻', nombre: 'Violín', categoria: 'Juguetes' },
  { emoji: '🪘', nombre: 'Tambor', categoria: 'Juguetes' },
  { emoji: '🎼', nombre: 'Partitura/Música', categoria: 'Juguetes' },
  { emoji: '🎵', nombre: 'Nota Musical', categoria: 'Juguetes' },
  { emoji: '🎶', nombre: 'Notas Musicales', categoria: 'Juguetes' },
  
  // Jardinería y Plantas
  { emoji: '🌱', nombre: 'Planta/Brote', categoria: 'Jardinería' },
  { emoji: '🌿', nombre: 'Hierba', categoria: 'Jardinería' },
  { emoji: '🌾', nombre: 'Cultivo', categoria: 'Jardinería' },
  { emoji: '🌵', nombre: 'Cactus', categoria: 'Jardinería' },
  { emoji: '🌲', nombre: 'Árbol', categoria: 'Jardinería' },
  { emoji: '🌳', nombre: 'Árbol Frondoso', categoria: 'Jardinería' },
  { emoji: '🌴', nombre: 'Palmera', categoria: 'Jardinería' },
  { emoji: '🪴', nombre: 'Maceta/Planta', categoria: 'Jardinería' },
  { emoji: '🌻', nombre: 'Girasol', categoria: 'Jardinería' },
  { emoji: '🌺', nombre: 'Flor Tropical', categoria: 'Jardinería' },
  { emoji: '🌸', nombre: 'Flor de Cerezo', categoria: 'Jardinería' },
  { emoji: '🌼', nombre: 'Margarita', categoria: 'Jardinería' },
  { emoji: '🌷', nombre: 'Tulipán', categoria: 'Jardinería' },
  { emoji: '🏵️', nombre: 'Roseta', categoria: 'Jardinería' },
  { emoji: '🌹', nombre: 'Rosa', categoria: 'Jardinería' },
  { emoji: '💐', nombre: 'Ramo de Flores', categoria: 'Jardinería' },
  { emoji: '🥀', nombre: 'Flor Marchita', categoria: 'Jardinería' },
  { emoji: '🪨', nombre: 'Piedra/Roca', categoria: 'Jardinería' },
  { emoji: '🪵', nombre: 'Madera/Tronco', categoria: 'Jardinería' },
  
  // Transporte y Vehículos
  { emoji: '🚗', nombre: 'Automóvil', categoria: 'Transporte' },
  { emoji: '🚕', nombre: 'Taxi', categoria: 'Transporte' },
  { emoji: '🚙', nombre: 'SUV', categoria: 'Transporte' },
  { emoji: '🚌', nombre: 'Autobús', categoria: 'Transporte' },
  { emoji: '🚎', nombre: 'Trolebús', categoria: 'Transporte' },
  { emoji: '🚐', nombre: 'Camioneta', categoria: 'Transporte' },
  { emoji: '🚚', nombre: 'Camión de Carga', categoria: 'Transporte' },
  { emoji: '🚛', nombre: 'Camión Articulado', categoria: 'Transporte' },
  { emoji: '🚜', nombre: 'Tractor', categoria: 'Transporte' },
  { emoji: '🚲', nombre: 'Bicicleta', categoria: 'Transporte' },
  { emoji: '🛴', nombre: 'Scooter', categoria: 'Transporte' },
  { emoji: '🛵', nombre: 'Motoneta', categoria: 'Transporte' },
  { emoji: '🏍️', nombre: 'Motocicleta', categoria: 'Transporte' },
  { emoji: '🛞', nombre: 'Llanta/Rueda', categoria: 'Transporte' },
  { emoji: '⛽', nombre: 'Gasolina/Combustible', categoria: 'Transporte' },
  { emoji: '🛢️', nombre: 'Barril/Aceite', categoria: 'Transporte' },
  
  // Otros No Comestibles
  { emoji: '📿', nombre: 'Rosario/Religioso', categoria: 'Otros' },
  { emoji: '⚰️', nombre: 'Ataúd/Funeral', categoria: 'Otros' },
  { emoji: '⚱️', nombre: 'Urna', categoria: 'Otros' },
  { emoji: '🗿', nombre: 'Estatua', categoria: 'Otros' },
  { emoji: '🎁', nombre: 'Regalo/Donación', categoria: 'Otros' },
  { emoji: '🎈', nombre: 'Globo/Fiesta', categoria: 'Otros' },
  { emoji: '🎀', nombre: 'Moño/Decoración', categoria: 'Otros' },
  { emoji: '🎊', nombre: 'Confeti/Celebración', categoria: 'Otros' },
  { emoji: '🎉', nombre: 'Fiesta', categoria: 'Otros' },
  { emoji: '🪅', nombre: 'Piñata', categoria: 'Otros' },
  { emoji: '🎏', nombre: 'Bandera/Decoración', categoria: 'Otros' },
  { emoji: '🎐', nombre: 'Campana de Viento', categoria: 'Otros' },
  { emoji: '🧧', nombre: 'Sobre Rojo/Regalo', categoria: 'Otros' },
  { emoji: '✉️', nombre: 'Sobre/Correo', categoria: 'Otros' },
  { emoji: '📮', nombre: 'Buzón', categoria: 'Otros' },
  { emoji: '📬', nombre: 'Buzón Abierto', categoria: 'Otros' },
  { emoji: '📫', nombre: 'Buzón con Correo', categoria: 'Otros' },
  { emoji: '🔑', nombre: 'Llave', categoria: 'Otros' },
  { emoji: '🔒', nombre: 'Candado', categoria: 'Otros' },
  { emoji: '🔓', nombre: 'Candado Abierto', categoria: 'Otros' },
  { emoji: '🔐', nombre: 'Candado con Llave', categoria: 'Otros' },
  { emoji: '🧲', nombre: 'Imán', categoria: 'Otros' },
  { emoji: '🧿', nombre: 'Ojo Turco/Amuleto', categoria: 'Otros' },
  { emoji: '🪬', nombre: 'Hamsa', categoria: 'Otros' },
  { emoji: '🔮', nombre: 'Bola de Cristal', categoria: 'Otros' },
  { emoji: '📿', nombre: 'Cuentas/Collar', categoria: 'Otros' },
  { emoji: '💎', nombre: 'Gema/Diamante', categoria: 'Otros' },
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
  // Básicos Alimentos
  '🍚', '🍝', '🍞', '🥖', '🥐', '🥣', '🌾',
  
  // Conservas y Lácteos
  '🥫', '🫙', '🥛', '🧀', '🧈', '🍦',
  
  // Frutas
  '🍎', '🍊', '🍌', '🍇', '🍓', '🥑', '🍅',
  
  // Verduras
  '🥬', '🥕', '🥔', '玉米', '🥦', '🧅', '🧄',
  
  // Proteínas
  '🥩', '🍗', '🐟', '🥚', '🍤',
  
  // Bebidas
  '☕', '🍵', '🧃', '🥤', '🧊', '🍷', '🍺',
  
  // Dulces
  '🍯', '🍫', '🍬', '🍪', '🍰', '🍩',
  
  // Comidas
  '🍲', '🍕', '🌮', '🥪', '🍱', '🥗',
  
  // Genéricos Alimentos
  '📦', '🛒', '🍽️',
  
  // Higiene Personal
  '🧴', '🧼', '🪥', '🧻', '🪒', '💄',
  
  // Limpieza
  '🧹', '🧺', '🧽', '🪣', '🗑️',
  
  // Bebés
  '🍼', '👶', '🧷', '🧸',
  
  // Salud
  '💊', '💉', '🩹', '😷', '🌡️',
  
  // Ropa
  '👕', '👖', '👗', '🧥', '👟', '👞',
  
  // Escolares
  '📚', '📓', '✏️', '🖊️', '📏', '✂️', '🎒',
  
  // Hogar
  '🔦', '💡', '🔋', '🔧', '🔨',
  
  // Electrónica
  '📱', '💻', '🖨️', '📺', '📻',
  
  // Mascotas
  '🐕', '🐈', '🐾', '🦴',
  
  // Deportes
  '⚽', '🏀', '🎾', '🏆',
  
  // Juguetes
  '🧸', '🎲', '🧩', '🎨',
  
  // Otros
  '🎁', '🎈', '🎉', '🪴', '🚗'
];

// Iconos para subcategorías (más específicos)
export const ICONOS_SUBCATEGORIAS = TODOS_LOS_ICONOS;