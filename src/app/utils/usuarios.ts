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

// Lista de usuarios predefinidos
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
    password: 'Demo2024!',
    nombre: 'Administrateur',
    apellido: 'Système',
    email: 'admin@banque-alimentaire.org',
    rol: 'administrador',
    permisos: ['administrador_general', 'administrador_liaison'],
    descripcion: 'Administrateur Démo - Accès Administrateur Complet (Sans Développeur)'
  },
  {
    id: '3',
    username: 'liaison',
    password: 'liaison123',
    nombre: 'Admin',
    apellido: 'Liaison',
    email: 'liaison@banque-alimentaire.org',
    rol: 'administrador',
    permisos: ['administrador_liaison'],
    descripcion: 'Administrateur Liaison - Gestion des Organismes'
  },
  {
    id: '4',
    username: 'coordinador',
    password: 'coord123',
    nombre: 'Coordinateur',
    apellido: 'Principal',
    email: 'coordinateur@banque-alimentaire.org',
    rol: 'coordinador',
    permisos: ['coordinador'],
    descripcion: 'Coordinateur - Accès en Lecture Seule'
  }
];

const STORAGE_KEY = 'banque_alimentaire_usuarios';
const VERSION_KEY = 'banque_alimentaire_usuarios_version';
const CURRENT_VERSION = '2.0'; // Versión con usuario admin sin permisos de desarrollador

// Migrar usuarios existentes para actualizar permisos del usuario admin
export function migrarUsuarios(): void {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version === CURRENT_VERSION) {
      return; // Ya está actualizado
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usuarios: Usuario[] = JSON.parse(stored);
      
      // Actualizar usuario admin (id: 2) para remover acceso_total
      const adminIndex = usuarios.findIndex(u => u.id === '2' || u.username.toLowerCase() === 'admin');
      if (adminIndex !== -1) {
        usuarios[adminIndex] = {
          ...usuarios[adminIndex],
          permisos: ['administrador_general', 'administrador_liaison'],
          descripcion: 'Administrateur Démo - Accès Administrateur Complet (Sans Développeur)'
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
        console.log('✅ Usuario admin actualizado: permisos de desarrollador removidos');
      }
      
      // Marcar como actualizado
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      console.log('✅ Migración de usuarios completada - Versión', CURRENT_VERSION);
    }
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
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
  // Si no hay usuarios, inicializar y retornar
  inicializarUsuarios();
  return USUARIOS_PREDEFINIDOS;
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

// Resetear a usuarios predefinidos
export function resetearUsuarios(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
  console.log('✅ Usuarios reseteados a valores predefinidos');
}

// Verificar si un usuario tiene un permiso específico
export function tienePermiso(usuario: Usuario, permiso: string): boolean {
  return usuario.permisos.includes(permiso) || usuario.permisos.includes('acceso_total');
}