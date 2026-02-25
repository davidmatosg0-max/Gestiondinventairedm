// Sistema de almacenamiento de productos creados en Configuración

export type ProductoCreado = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  varianteId?: string;
  varianteNombre?: string;
  unidad: string;
  icono: string;
  peso: number;
  pesoUnitario?: number; // Peso en kg de una unidad del producto
  pesoRegistrado?: number; // Peso total registrado en kg
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  lote: string;
  fechaVencimiento: string;
  esPRS: boolean;
  activo: boolean;
  fechaCreacion: string;
  temperaturaAlmacenamiento?: 'Temperatura Ambiente' | 'Refrigerado' | 'Congelado';
  productoOrigenId?: string; // ID del producto origen en caso de conversión
  esConversion?: boolean; // Indica si es un producto resultado de conversión
};

const STORAGE_KEY = 'banco_alimentos_productos';

/**
 * Obtener todos los productos guardados
 */
export function obtenerProductos(): ProductoCreado[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const productos = JSON.parse(data);
    
    // Eliminar duplicados basándonos en el ID
    const productosUnicos = productos.reduce((acc: ProductoCreado[], producto: ProductoCreado) => {
      const existe = acc.find(p => p.id === producto.id);
      if (!existe) {
        acc.push(producto);
      }
      return acc;
    }, []);
    
    // Si se encontraron duplicados, guardar la versión limpia
    if (productosUnicos.length !== productos.length) {
      console.warn(`⚠️ Se encontraron ${productos.length - productosUnicos.length} productos duplicados. Limpiando...`);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productosUnicos));
    }
    
    return productosUnicos;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
}

/**
 * Guardar un nuevo producto
 */
export function guardarProducto(producto: ProductoCreado | Omit<ProductoCreado, 'id'>): ProductoCreado {
  try {
    const productos = obtenerProductos();
    
    // Generar ID si no existe
    const productoConId: ProductoCreado = 'id' in producto 
      ? producto as ProductoCreado
      : { ...producto, id: Date.now().toString() } as ProductoCreado;
    
    // Verificar si el producto ya existe para evitar duplicados
    const existeProducto = productos.find(p => p.id === productoConId.id);
    if (existeProducto) {
      console.warn(`⚠️ Producto con ID ${productoConId.id} ya existe. Use actualizarProducto() en su lugar.`);
      // Actualizar el producto existente en lugar de agregar uno duplicado
      actualizarProducto(productoConId.id, productoConId);
      return productoConId;
    }
    
    productos.push(productoConId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
    console.log('✅ Producto guardado exitosamente en localStorage:', productoConId.nombre);
    return productoConId;
  } catch (error) {
    console.error('❌ Error al guardar producto:', error);
    throw error;
  }
}

/**
 * Actualizar un producto existente
 */
export function actualizarProducto(id: string, productoActualizado: Partial<ProductoCreado>): void {
  try {
    const productos = obtenerProductos();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
      productos[index] = { ...productos[index], ...productoActualizado };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
  }
}

/**
 * Eliminar un producto
 */
export function eliminarProducto(id: string): void {
  try {
    const productos = obtenerProductos();
    const productosFiltrados = productos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productosFiltrados));
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}

/**
 * Obtener un producto por ID
 */
export function obtenerProductoPorId(id: string): ProductoCreado | undefined {
  const productos = obtenerProductos();
  return productos.find(p => p.id === id);
}

/**
 * Obtener productos activos
 */
export function obtenerProductosActivos(): ProductoCreado[] {
  return obtenerProductos().filter(p => p.activo);
}

/**
 * Buscar productos por nombre o código
 */
export function buscarProductos(query: string): ProductoCreado[] {
  const productos = obtenerProductosActivos();
  const queryLower = query.toLowerCase();
  return productos.filter(p => 
    p.nombre.toLowerCase().includes(queryLower) ||
    p.codigo.toLowerCase().includes(queryLower) ||
    p.categoria.toLowerCase().includes(queryLower) ||
    p.subcategoria.toLowerCase().includes(queryLower)
  );
}

/**
 * Limpiar todos los productos (útil para testing)
 */
export function limpiarProductos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar productos:', error);
  }
}