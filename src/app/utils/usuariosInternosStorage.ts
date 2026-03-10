import type { UsuarioInterno } from '../types';
import { mockUsuariosInternos } from '../data/mockData';

const STORAGE_KEY = 'banque_alimentaire_usuarios_internos';

/**
 * Datos iniciales mínimos para el sistema
 * Se usan solo si no hay datos guardados y mockData está vacío
 */
const datosIniciales: UsuarioInterno[] = [
  {
    id: '1',
    numeroID: 'BDV-2024-001',
    nombre: 'Marie',
    apellido: 'Tremblay',
    categoria: 'benevole',
    email: 'marie.tremblay@example.com',
    telefono: '514-555-0101',
    direccion: '123 Rue Example, Laval, QC',
    fechaNacimiento: '1985-06-15',
    fechaIngreso: '2024-01-15',
    foto: null,
    activo: true,
    departamento: 'Distribution',
    puesto: '',
    horasSemanales: 10,
    programa: '',
    nombreEmpresa: '',
    contacto: '',
    notas: 'Bénévole régulière très engagée',
    documentoPDF: undefined,
    joursDisponibles: [],
    sexo: 'femme',
    idioma: 'fr'
  }
];

/**
 * Obtener usuarios internos del localStorage
 * Si no existen, retorna los datos mock iniciales o datos mínimos
 */
export function obtenerUsuariosInternos(): UsuarioInterno[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usuarios = JSON.parse(stored);
      // Validar que sea un array
      if (Array.isArray(usuarios) && usuarios.length > 0) {
        console.log('✅ Usuarios internos cargados desde localStorage:', usuarios.length);
        return usuarios;
      }
    }
    
    // Si hay datos mock, usarlos
    if (mockUsuariosInternos.length > 0) {
      console.log('📦 Inicializando usuarios internos con datos mock');
      guardarUsuariosInternos(mockUsuariosInternos);
      return mockUsuariosInternos;
    }
    
    // Si no hay nada, usar datos iniciales mínimos
    console.log('🌱 Inicializando usuarios internos con datos básicos');
    guardarUsuariosInternos(datosIniciales);
    return datosIniciales;
  } catch (error) {
    console.error('❌ Error al cargar usuarios internos:', error);
    return datosIniciales;
  }
}

/**
 * Guardar usuarios internos en localStorage
 */
export function guardarUsuariosInternos(usuarios: UsuarioInterno[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    console.log('💾 Usuarios internos guardados:', usuarios.length);
  } catch (error) {
    console.error('❌ Error al guardar usuarios internos:', error);
  }
}

/**
 * Agregar un nuevo usuario interno
 */
export function agregarUsuarioInterno(usuario: UsuarioInterno): void {
  const usuarios = obtenerUsuariosInternos();
  usuarios.push(usuario);
  guardarUsuariosInternos(usuarios);
}

/**
 * Actualizar un usuario interno existente
 */
export function actualizarUsuarioInterno(id: string, usuarioActualizado: UsuarioInterno): void {
  const usuarios = obtenerUsuariosInternos();
  const index = usuarios.findIndex(u => u.id === id);
  if (index !== -1) {
    usuarios[index] = usuarioActualizado;
    guardarUsuariosInternos(usuarios);
  }
}

/**
 * Eliminar un usuario interno
 */
export function eliminarUsuarioInterno(id: string): void {
  const usuarios = obtenerUsuariosInternos();
  const usuariosFiltrados = usuarios.filter(u => u.id !== id);
  guardarUsuariosInternos(usuariosFiltrados);
}

/**
 * Limpiar todos los usuarios internos (solo para desarrollo/pruebas)
 */
export function limpiarUsuariosInternos(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Usuarios internos limpiados');
}

/**
 * Resetear a datos mock iniciales
 */
export function resetearUsuariosInternos(): void {
  guardarUsuariosInternos(mockUsuariosInternos);
  console.log('🔄 Usuarios internos reseteados a datos mock');
}