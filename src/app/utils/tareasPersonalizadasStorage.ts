// Almacenamiento de tareas personalizadas en localStorage

export interface TareaPersonalizada {
  id: string;
  code: string;
  label: string;
  icon: string;
  color: string;
}

const STORAGE_KEY = 'tareasPersonalizadas';

export function obtenerTareasPersonalizadas(): TareaPersonalizada[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener tareas personalizadas:', error);
    return [];
  }
}

export function guardarTareaPersonalizada(tarea: Omit<TareaPersonalizada, 'id'>): void {
  try {
    const tareas = obtenerTareasPersonalizadas();
    const nuevaTarea: TareaPersonalizada = {
      ...tarea,
      id: `tarea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    tareas.push(nuevaTarea);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error al guardar tarea personalizada:', error);
  }
}

export function actualizarTareaPersonalizada(id: string, tareaActualizada: Omit<TareaPersonalizada, 'id'>): void {
  try {
    const tareas = obtenerTareasPersonalizadas();
    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
      tareas[index] = { ...tareaActualizada, id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    }
  } catch (error) {
    console.error('Error al actualizar tarea personalizada:', error);
  }
}

export function eliminarTareaPersonalizada(id: string): void {
  try {
    const tareas = obtenerTareasPersonalizadas();
    const tareasFiltradas = tareas.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareasFiltradas));
  } catch (error) {
    console.error('Error al eliminar tarea personalizada:', error);
  }
}

export function existeCodigoTarea(codigo: string, codigosPredefinidos: string[]): boolean {
  const tareas = obtenerTareasPersonalizadas();
  const todosLosCodigos = [
    ...codigosPredefinidos,
    ...tareas.map(t => t.code)
  ];
  return todosLosCodigos.includes(codigo);
}
