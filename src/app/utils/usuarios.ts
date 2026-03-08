// Sistema de usuarios con credenciales
// Usuarios predefinidos del sistema

export interface Usuario {
  id: string;
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'administrador' | 'usuario' | 'coordinador';
  permisos: string[];
  foto?: string;
  descripcion?: string;
}

// Lista de usuarios predefinidos - MODO PRODUCCIÓN
const USUARIOS_PREDEFINIDOS: Usuario[] = [
  {
    id: '1',
    username: 'David',
    password: 'Lettycia26',
    nombre: 'David',
    apellido: 'Développeur',
    email: 'david@banque-alimentaire.org',
    rol: 'administrador',
    permisos: [
      'administrador_general', 
      'desarrollador',
      'acceso_total',
      'administrador_liaison',
      'coordinador'
    ],
    descripcion: 'Développeur Principal - Accès Total au Système'
  },
  {
    id: '2',
    username: 'admin',
    password: 'Admin2024!',
    nombre: 'Administrateur',
    apellido: 'Système',
    email: 'admin@banque-alimentaire.org',
    rol: 'administrador',
    permisos: [
      'administrador_general', 
      'acceso_total',
      'administrador_liaison',
      'coordinador'
    ],
    descripcion: 'Administrateur Principal - Accès Total au Système'
  }
];

const STORAGE_KEY = 'banque_alimentaire_usuarios';
const VERSION_KEY = 'banque_alimentaire_usuarios_version';
const CURRENT_VERSION = '4.1-production'; // Versión producción - David + admin

// Migrar usuarios existentes para actualizar permisos del usuario admin
export function migrarUsuarios(): void {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version === CURRENT_VERSION) {
      return; // Ya está actualizado
    }

    // MODO PRODUCCIÓN: Limpiar usuarios de ejemplo y mantener solo admin
    localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.log('✅ Modo Producción - Solo usuario administrador principal');
  } catch (error) {
    console.error('Error al migrar usuarios:', error);
  }
}

// Inicializar usuarios en localStorage si no existen
export function inicializarUsuarios(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      console.log('✅ Usuarios inicializados:', USUARIOS_PREDEFINIDOS.length, 'usuarios');
    } else {
      // Si ya existen usuarios, ejecutar migración
      migrarUsuarios();
    }
  } catch (error) {
    console.error('Error al inicializar usuarios:', error);
  }
}

// Obtener todos los usuarios
export function obtenerUsuarios(): Usuario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      // Si existe la clave (aunque sea un array vacío), usarla
      const usuarios = JSON.parse(stored);
      // Si hay usuarios, ejecutar migración si es necesaria
      if (usuarios.length > 0) {
        migrarUsuarios();
      }
      return usuarios;
    } else {
      // Solo inicializar si NO existe la clave en localStorage (primera vez)
      inicializarUsuarios();
      const nuevosUsuarios = localStorage.getItem(STORAGE_KEY);
      return nuevosUsuarios ? JSON.parse(nuevosUsuarios) : [];
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
  // Retornar array vacío si hay error
  return [];
}

// Guardar usuarios en localStorage
export function guardarUsuarios(usuarios: Usuario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    console.log('✅ Usuarios guardados:', usuarios.length, 'usuarios');
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
  }
}

// Validar credenciales de usuario
export function validarCredenciales(username: string, password: string): Usuario | null {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  
  if (usuario) {
    console.log('✅ Login exitoso:', usuario.username, '-', usuario.descripcion);
    // No retornar el password por seguridad
    const { password: _, ...usuarioSinPassword } = usuario;
    return usuario;
  }
  
  console.log('❌ Credenciales inválidas para:', username);
  return null;
}

// Obtener usuario por username
export function obtenerUsuarioPorUsername(username: string): Usuario | null {
  const usuarios = obtenerUsuarios();
  return usuarios.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

// Agregar nuevo usuario
export function agregarUsuario(usuario: Omit<Usuario, 'id'>): Usuario {
  const usuarios = obtenerUsuarios();
  const nuevoUsuario: Usuario = {
    ...usuario,
    id: Date.now().toString()
  };
  
  usuarios.push(nuevoUsuario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  console.log('✅ Usuario agregado:', nuevoUsuario.username);
  
  return nuevoUsuario;
}

// Actualizar usuario existente
export function actualizarUsuario(id: string, datosActualizados: Partial<Usuario>): boolean {
  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], ...datosActualizados };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    console.log('✅ Usuario actualizado:', usuarios[index].username);
    return true;
  }
  
  console.log('❌ Usuario no encontrado:', id);
  return false;
}

// Eliminar usuario
export function eliminarUsuario(id: string): boolean {
  const usuarios = obtenerUsuarios();
  const usuariosFiltrados = usuarios.filter(u => u.id !== id);
  
  if (usuariosFiltrados.length < usuarios.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosFiltrados));
    console.log('✅ Usuario eliminado');
    return true;
  }
  
  console.log('❌ Usuario no encontrado:', id);
  return false;
}

// Eliminar todos los usuarios (para producción)
export function eliminarTodosLosUsuarios(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    console.log('✅ Todos los usuarios eliminados');
    return true;
  } catch (error) {
    console.error('Error al eliminar todos los usuarios:', error);
    return false;
  }
}

// Resetear a usuarios predefinidos
export function resetearUsuarios(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
  console.log('✅ Usuarios reseteados a valores predefinidos');
}

// Verificar si un usuario tiene un permiso específico
export function tienePermiso(usuario: Usuario, permiso: string): boolean {
  return usuario.permisos.includes(permiso) || usuario.permisos.includes('acceso_total');
}