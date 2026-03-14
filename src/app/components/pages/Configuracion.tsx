import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Settings, Plus, Edit, Trash2, DollarSign, Package, FolderTree, Save, Inbox, PackageSearch, Copy, Eye, ChevronDown, ChevronRight, EyeOff, Grid3x3, X, Download, Upload, RotateCcw, Database, Clock, TrendingDown, Percent, Calculator, BookmarkPlus, AlertTriangle, Mail, CheckCircle, AlertCircle, Send, Scale, MapPin, Map, LifeBuoy, HelpCircle, Info, Sparkles, Ruler } from 'lucide-react';
import '../../../styles/configuracion-elegante.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { mockProductos } from '../../data/mockData';
import { ICONOS_PRINCIPALES, ICONOS_SUBCATEGORIAS } from '../../data/iconosAlimentos';
import { 
  obtenerProductos, 
  guardarProducto, 
  actualizarProducto, 
  eliminarProducto,
  obtenerProductosActivos,
  type ProductoCreado 
} from '../../utils/productStorage';
import { generarIconoProducto, sugerirIconos } from '../../utils/iconoUtils';
import { obtenerCategorias, guardarCategorias, obtenerValorPorKg } from '../../utils/categoriaStorage';
import { 
  obtenerProgramasEntrada, 
  guardarProgramaEntrada, 
  actualizarProgramaEntrada, 
  eliminarProgramaEntrada 
} from '../../utils/programaEntradaStorage';
import { GestionVariantes } from '../inventario/GestionVariantes';
import { GestionUnidades } from '../inventario/GestionUnidades';
import { obtenerUnidades, type Unidad as UnidadDinamica } from '../../utils/unidadStorage';
import { ConfigurationBalance } from '../ConfigurationBalance';
import { GestionAdressesQuartiers } from '../GestionAdressesQuartiers';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { BackupManager } from '../BackupManager';
import type { Producto as ProductoTipo, Categoria as CategoriaTipo, Subcategoria as SubcategoriaTipo, Variante as VarianteTipo, Permiso } from '../../types';

type Unidad = {
  id: string;
  nombre: string;
  abreviatura: string;
  tipo: 'peso' | 'volumen' | 'cantidad' | 'empaque';
  equivalencia?: string;
  pesoEstandar?: number; // Peso en kilogramos
  icono?: string; // Emoji o ícono visual para la unidad
};

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  valorMonetario: number;
  color: string;
  icono: string;
  subcategorias: Subcategoria[];
  activa: boolean;
};

type Subcategoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  cantidad?: number;
  peso?: number;
  pesoUnitario?: number; // Peso en kg de una unidad (ej: 0.15 kg para una manzana)
  unidad?: string; // Unidad por defecto para productos de esta subcategoría
  unidadesPermitidas?: string[]; // IDs de unidades permitidas
  activa: boolean;
  stockMinimo?: number; // Stock mínimo para alertas
};

type ProgramaEntrada = {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  color: string;
  activo: boolean;
  icono?: string;
};

type Producto = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  lote: string;
  fechaVencimiento: string;
  esPRS: boolean;
  foto?: string;
  cantidadUnidades?: number;
  tipoUnidad?: string;
  pesoRegistrado?: number;
  esVariante?: boolean;
  productoBaseId?: string;
  productoBaseNombre?: string;
};

const unidadesIniciales: Unidad[] = [
  { id: '1', nombre: 'Paleta', abreviatura: 'PLT', tipo: 'empaque', equivalencia: 'Variable según producto', pesoEstandar: 500, icono: '🏗️' },
  { id: '2', nombre: 'Caja', abreviatura: 'CJA', tipo: 'empaque', equivalencia: 'Variable según producto', pesoEstandar: 10, icono: '📦' },
  { id: '3', nombre: 'Unidad', abreviatura: 'UND', tipo: 'cantidad', equivalencia: '1 unidad', pesoEstandar: 0, icono: '1️⃣' },
  { id: '4', nombre: 'Saco', abreviatura: 'SAC', tipo: 'empaque', equivalencia: 'Variable según producto', pesoEstandar: 25, icono: '💼' },
  { id: '5', nombre: 'Bac Noir', abreviatura: 'BN', tipo: 'empaque', equivalencia: 'Variable según producto', pesoEstandar: 15, icono: '🗃️' },
  { id: '6', nombre: 'Kilogramo', abreviatura: 'kg', tipo: 'peso', equivalencia: '1000 gramos', pesoEstandar: 1, icono: '⚖️' },
  { id: '7', nombre: 'Litro', abreviatura: 'L', tipo: 'volumen', equivalencia: '1000 mililitros', pesoEstandar: 1, icono: '🧴' },
];

// Definición temporal para evitar errores (se eliminará en futuras actualizaciones)
type UnidadMedidaPRS = {
  id: string;
  nombre: string;
  abreviacion: string;
  tipo: 'peso' | 'volumen' | 'unidad';
};

const unidadesMedidaPRS: UnidadMedidaPRS[] = [];

// Categorías iniciales con ejemplos de subcategorías
const categoriasIniciales: Categoria[] = [
  {
    id: 'cat-1',
    nombre: 'Cereales y Granos',
    descripcion: 'Productos de cereales, arroz, pasta y otros granos',
    icono: '🌾',
    color: '#FFC107',
    valorMonetario: 1.5,
    activa: true,
    subcategorias: [
      { id: 'sub-1-1', nombre: 'Arroz', descripcion: 'Arroz blanco, integral y variedades', icono: '🍚', cantidad: 100, peso: 50, pesoUnitario: 0.5, unidad: 'kg', unidadesPermitidas: ['6', '3'], activa: true },
      { id: 'sub-1-2', nombre: 'Pasta', descripcion: 'Espagueti, fideos y otros tipos de pasta', icono: '🍝', cantidad: 80, peso: 40, pesoUnitario: 0.5, unidad: 'kg', unidadesPermitidas: ['6', '2'], activa: true },
      { id: 'sub-1-3', nombre: 'Cereales de desayuno', descripcion: 'Cereales para desayuno variados', icono: '🥣', cantidad: 60, peso: 30, pesoUnitario: 0.5, unidad: 'CJA', unidadesPermitidas: ['2', '3'], activa: true }
    ]
  },
  {
    id: 'cat-2',
    nombre: 'Frutas y Verduras',
    descripcion: 'Frutas y vegetales frescos',
    icono: '🥬',
    color: '#4CAF50',
    valorMonetario: 2.0,
    activa: true,
    subcategorias: [
      { id: 'sub-2-1', nombre: 'Manzanas', descripcion: 'Manzanas frescas de diversas variedades', icono: '🍎', cantidad: 200, peso: 100, pesoUnitario: 0.5, unidad: 'kg', unidadesPermitidas: ['6', '3', '2'], activa: true },
      { id: 'sub-2-2', nombre: 'Naranjas', descripcion: 'Naranjas frescas para consumo', icono: '🍊', cantidad: 150, peso: 75, pesoUnitario: 0.5, unidad: 'CJA', unidadesPermitidas: ['6', '3', '2'], activa: true },
      { id: 'sub-2-3', nombre: 'Lechugas', descripcion: 'Lechugas y vegetales de hoja verde', icono: '🥬', cantidad: 50, peso: 25, pesoUnitario: 0.5, unidad: 'kg', unidadesPermitidas: ['6', '3'], activa: true }
    ]
  },
  {
    id: 'cat-3',
    nombre: 'Lácteos',
    descripcion: 'Productos lácteos y derivados',
    icono: '🥛',
    color: '#1E73BE',
    valorMonetario: 3.0,
    activa: true,
    subcategorias: [
      { id: 'sub-3-1', nombre: 'Leche', descripcion: 'Leche fresca y ultrapasteurizada', icono: '🥛', cantidad: 120, peso: 0, pesoUnitario: 1.0, unidad: 'L', unidadesPermitidas: ['7', '3'], activa: true },
      { id: 'sub-3-2', nombre: 'Queso', descripcion: 'Quesos variados', icono: '🧀', cantidad: 0, peso: 30, pesoUnitario: 0.5, unidad: 'kg', unidadesPermitidas: ['6', '3'], activa: true },
      { id: 'sub-3-3', nombre: 'Yogur', descripcion: 'Yogur natural y con sabores', icono: '🥤', cantidad: 90, peso: 0, pesoUnitario: 0.125, unidad: 'UND', unidadesPermitidas: ['7', '3'], activa: true }
    ]
  }
];

const programasEntradaIniciales: ProgramaEntrada[] = [
  {
    id: '1',
    nombre: 'Achat',
    codigo: 'ACH',
    descripcion: 'Achat de produits pour la banque alimentaire',
    color: '#1E73BE',
    activo: true
  },
  {
    id: '2',
    nombre: 'Don',
    codigo: 'DON',
    descripcion: 'Donaciones recibidas de empresas y particulares',
    color: '#4CAF50',
    activo: true
  },
  {
    id: '3',
    nombre: 'CPN',
    codigo: 'CPN',
    descripcion: 'Colecta Pública Nacional',
    color: '#FFC107',
    activo: true
  },
];

export function Configuracion() {
  const { t } = useTranslation();
  const branding = useBranding();
  
  // Verificar si el usuario actual es desarrollador
  const usuarioActual = obtenerUsuarioSesion();
  const esDesarrollador = usuarioActual?.permisos?.includes('desarrollador' as Permiso) || false;
  
  const [unidades, setUnidades] = useState<Unidad[]>(unidadesIniciales);
  const [unidadesDinamicas, setUnidadesDinamicas] = useState<UnidadDinamica[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [programasEntrada, setProgramasEntrada] = useState<ProgramaEntrada[]>([]);
  const [productos, setProductos] = useState<ProductoCreado[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar unidades dinámicas
  useEffect(() => {
    const cargarUnidadesDinamicas = () => {
      const unidadesCargadas = obtenerUnidades();
      setUnidadesDinamicas(unidadesCargadas);
    };

    cargarUnidadesDinamicas();

    // Escuchar cambios en las unidades
    const handleUnidadesActualizadas = (event: CustomEvent) => {
      setUnidadesDinamicas(event.detail);
    };

    window.addEventListener('unidadesActualizadas', handleUnidadesActualizadas as EventListener);

    return () => {
      window.removeEventListener('unidadesActualizadas', handleUnidadesActualizadas as EventListener);
    };
  }, []);

  // Cargar productos desde localStorage al montar el componente
  useEffect(() => {
    const productosGuardados = obtenerProductos();
    setProductos(productosGuardados);
  }, []);

  // Cargar categorías desde localStorage al montar el componente
  useEffect(() => {
    const categoriasGuardadas = obtenerCategorias();
    setCategorias(categoriasGuardadas);
  }, []);



  // Cargar programas de entrada desde localStorage al montar el componente
  useEffect(() => {
    const programasGuardados = obtenerProgramasEntrada();
    setProgramasEntrada(programasGuardados);
  }, []);

  // Sincronizar categorías a localStorage cada vez que cambien
  useEffect(() => {
    if (categorias.length > 0) {
      guardarCategorias(categorias);
    }
  }, [categorias]);
  
  // Verificar si existe el programa PRS
  const existeProgramaPRS = programasEntrada.some(
    programa => programa.nombre.toUpperCase() === 'PRS' && programa.activo
  );

  // Filtrar categorías según disponibilidad del programa PRS
  const categoriasVisibles = categorias.filter(categoria => {
    const esPRS = categoria.descripcion?.toLowerCase().includes('prs');
    // Si la categoría es PRS, solo mostrarla si existe el programa PRS
    if (esPRS) {
      return existeProgramaPRS;
    }
    // Las categorías no-PRS siempre se muestran
    return true;
  });
  
  // Estados para diálogos
  const [unidadDialogOpen, setUnidadDialogOpen] = useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [subcategoriaDialogOpen, setSubcategoriaDialogOpen] = useState(false);
  const [programaDialogOpen, setProgramaDialogOpen] = useState(false);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [varianteDialogOpen, setVarianteDialogOpen] = useState(false);
  const [varianteSubcategoriaDialogOpen, setVarianteSubcategoriaDialogOpen] = useState(false);
  const [dialogEliminarCategoria, setDialogEliminarCategoria] = useState(false);
  const [dialogEliminarSubcategoria, setDialogEliminarSubcategoria] = useState(false);
  const [editandoUnidad, setEditandoUnidad] = useState<Unidad | null>(null);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [editandoPrograma, setEditandoPrograma] = useState<ProgramaEntrada | null>(null);
  const [editandoSubcategoria, setEditandoSubcategoria] = useState<Subcategoria | null>(null);
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null);
  const [productoBase, setProductoBase] = useState<Producto | null>(null);
  const [subcategoriaBase, setSubcategoriaBase] = useState<{categoria: Categoria, subcategoria: Subcategoria} | null>(null);
  const [editandoVariante, setEditandoVariante] = useState<{variante: any, categoria: Categoria, subcategoria: Subcategoria} | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
  const [subcategoriaParaEliminar, setSubcategoriaParaEliminar] = useState<Subcategoria | null>(null);
  const [searchTermCategorias, setSearchTermCategorias] = useState('');
  const [productoPRSDialogOpen, setProductoPRSDialogOpen] = useState(false);
  const [editandoProductoPRS, setEditandoProductoPRS] = useState<ProductoCreado | null>(null);

  // Estados para formularios
  const [formUnidad, setFormUnidad] = useState({
    nombre: '',
    abreviatura: '',
    tipo: 'cantidad' as 'peso' | 'volumen' | 'cantidad' | 'empaque',
    equivalencia: '',
    pesoEstandar: 0
  });

  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    descripcion: '',
    valorMonetario: 0,
    color: '#1E73BE',
    icono: '📦',
    activa: true
  });

  const [formSubcategoria, setFormSubcategoria] = useState({
    nombre: '',
    descripcion: '',
    icono: '📦',
    pesoUnitario: 0,
    unidad: '',
    activa: true,
    stockMinimo: 0
  });

  const [formPrograma, setFormPrograma] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    color: '#1E73BE',
    activo: true,
    icono: '📦'
  });

  const [formProducto, setFormProducto] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    subcategoria: '',
    unidad: 'kg',
    icono: '📦',
    peso: 0,
    stockActual: 0,
    stockMinimo: 0,
    ubicacion: '',
    lote: '',
    fechaVencimiento: '',
    tipoProducto: 'normal' // 'normal' o 'prs'
  });

  const [formVarianteSubcategoria, setFormVarianteSubcategoria] = useState({
    nombre: '',
    codigo: '',
    icono: '📦',
    pesoUnitario: '',
    valorPorKg: '',
    descripcion: '',
    unidad: '',
    stockMinimo: 0
  });

  const [formProductoPRS, setFormProductoPRS] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    subcategoria: '',
    varianteId: '',
    varianteNombre: '',
    unidad: 'kg',
    icono: '📦',
    peso: 0,
    pesoUnitario: 0,
    ubicacion: ''
  });

  // Funciones para Unidades
  const handleGuardarUnidad = () => {
    if (!formUnidad.nombre || !formUnidad.abreviatura) {
      toast.error(t('configuration.completeAllFields'));
      return;
    }

    if (editandoUnidad) {
      setUnidades(unidades.map(u => 
        u.id === editandoUnidad.id 
          ? { ...u, ...formUnidad }
          : u
      ));
      toast.success(t('configuration.unitUpdated'));
    } else {
      const nueva: Unidad = {
        id: Date.now().toString(),
        ...formUnidad
      };
      setUnidades([...unidades, nueva]);
      toast.success(t('configuration.unitCreated'));
    }

    resetFormUnidad();
    setUnidadDialogOpen(false);
  };

  const handleEditarUnidad = (unidad: Unidad) => {
    setEditandoUnidad(unidad);
    setFormUnidad({
      nombre: unidad.nombre,
      abreviatura: unidad.abreviatura,
      tipo: unidad.tipo,
      equivalencia: unidad.equivalencia || '',
      pesoEstandar: unidad.pesoEstandar || 0
    });
    setUnidadDialogOpen(true);
  };

  const handleEliminarUnidad = (id: string) => {
    setUnidades(unidades.filter(u => u.id !== id));
    toast.success(t('configuration.unitDeleted'));
  };

  const resetFormUnidad = () => {
    setFormUnidad({
      nombre: '',
      abreviatura: '',
      tipo: 'cantidad',
      equivalencia: '',
      pesoEstandar: 0
    });
    setEditandoUnidad(null);
  };



  // Funciones para Categorías
  const handleGuardarCategoria = () => {
    if (!formCategoria.nombre || !formCategoria.descripcion) {
      toast.error(t('configuration.completeAllFields'));
      return;
    }

    // Generar icono automático si no hay uno definido
    const iconoFinal = formCategoria.icono || generarIconoProducto(formCategoria.nombre);
    
    if (editandoCategoria) {
      setCategorias(categorias.map(c => 
        c.id === editandoCategoria.id 
          ? { ...c, ...formCategoria, icono: iconoFinal }
          : c
      ));
      toast.success(t('configuration.categoryUpdated'));
    } else {
      const nueva: Categoria = {
        id: Date.now().toString(),
        ...formCategoria,
        icono: iconoFinal,
        subcategorias: []
      };
      setCategorias([...categorias, nueva]);
      toast.success(t('configuration.categoryCreated'));
    }

    resetFormCategoria();
    setCategoriaDialogOpen(false);
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setEditandoCategoria(categoria);
    setFormCategoria({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      valorMonetario: categoria.valorMonetario,
      color: categoria.color,
      icono: categoria.icono,
      activa: categoria.activa
    });
    setCategoriaDialogOpen(true);
  };

  const toggleCategoria = (categoriaId: string) => {
    setCategoriaExpandida(categoriaExpandida === categoriaId ? null : categoriaId);
  };

  const toggleActivaCategoria = (categoriaId: string) => {
    setCategorias(categorias.map(c => 
      c.id === categoriaId ? { ...c, activa: !c.activa } : c
    ));
    toast.success(t('configuration.categoryStatusUpdated'));
  };

  const toggleActivaSubcategoria = (categoriaId: string, subcategoriaId: string) => {
    setCategorias(categorias.map(c => 
      c.id === categoriaId 
        ? {
            ...c,
            subcategorias: c.subcategorias.map(s => 
              s.id === subcategoriaId ? { ...s, activa: !s.activa } : s
            )
          }
        : c
    ));
    toast.success(t('configuration.subcategoryStatusUpdated'));
  };



  const handleSolicitarEliminarCategoria = (categoria: Categoria) => {
    setEditandoCategoria(categoria);
    setDialogEliminarCategoria(true);
  };

  const handleEliminarCategoria = () => {
    if (!editandoCategoria) return;
    setCategorias(categorias.filter(c => c.id !== editandoCategoria.id));
    toast.success(t('configuration.categoryDeleted'));
    setDialogEliminarCategoria(false);
    setEditandoCategoria(null);
  };

  const resetFormCategoria = () => {
    setFormCategoria({
      nombre: '',
      descripcion: '',
      valorMonetario: 0,
      color: '#1E73BE',
      icono: '📦',
      activa: true
    });
    setEditandoCategoria(null);
  };

  // Funciones para Subcategorías
  const handleGuardarSubcategoria = () => {
    if (!formSubcategoria.nombre || !categoriaSeleccionada) {
      toast.error(t('configuration.completeAllFields'));
      return;
    }

    // Generar icono automático basado en el nombre de la subcategoría
    const categoriaObj = categorias.find(c => c.id === categoriaSeleccionada);
    const iconoAutomatico = generarIconoProducto(formSubcategoria.nombre, categoriaObj?.nombre);
    const iconoFinal = formSubcategoria.icono || iconoAutomatico;

    if (editandoSubcategoria) {
      // Editar subcategoría existente
      setCategorias(categorias.map(c => {
        if (c.id === categoriaSeleccionada) {
          return {
            ...c,
            subcategorias: c.subcategorias.map(s => 
              s.id === editandoSubcategoria.id
                ? { 
                    ...s, 
                    nombre: formSubcategoria.nombre, 
                    descripcion: formSubcategoria.descripcion,
                    icono: iconoFinal,
                    pesoUnitario: formSubcategoria.pesoUnitario,
                    unidad: formSubcategoria.unidad,
                    activa: formSubcategoria.activa,
                    stockMinimo: formSubcategoria.stockMinimo
                  }
                : s
            )
          };
        }
        return c;
      }));
      toast.success(t('configuration.subcategoryUpdated'));
    } else {
      // Crear nueva subcategoría
      setCategorias(categorias.map(c => {
        if (c.id === categoriaSeleccionada) {
          const nueva: Subcategoria = {
            id: `${c.id}-${Date.now()}`,
            ...formSubcategoria,
            icono: iconoFinal
          };
          return {
            ...c,
            subcategorias: [...c.subcategorias, nueva]
          };
        }
        return c;
      }));
      toast.success(t('configuration.subcategoryCreated'));
    }

    resetFormSubcategoria();
    setSubcategoriaDialogOpen(false);
  };

  const handleEditarSubcategoria = (categoriaId: string, subcategoria: Subcategoria) => {
    setEditandoSubcategoria(subcategoria);
    setCategoriaSeleccionada(categoriaId);
    setFormSubcategoria({
      nombre: subcategoria.nombre,
      descripcion: subcategoria.descripcion || '',
      icono: subcategoria.icono || '📦',
      pesoUnitario: subcategoria.pesoUnitario || 0,
      unidad: subcategoria.unidad || '',
      activa: subcategoria.activa,
      stockMinimo: subcategoria.stockMinimo || 0
    });
    setSubcategoriaDialogOpen(true);
  };

  const handleSolicitarEliminarSubcategoria = (categoria: Categoria, subcategoria: Subcategoria) => {
    setEditandoCategoria(categoria);
    setSubcategoriaParaEliminar(subcategoria);
    setDialogEliminarSubcategoria(true);
  };

  const handleEliminarSubcategoria = () => {
    if (!editandoCategoria || !subcategoriaParaEliminar) return;
    setCategorias(categorias.map(c => {
      if (c.id === editandoCategoria.id) {
        return {
          ...c,
          subcategorias: c.subcategorias.filter(s => s.id !== subcategoriaParaEliminar.id)
        };
      }
      return c;
    }));
    toast.success(t('configuration.subcategoryDeleted'));
    setDialogEliminarSubcategoria(false);
    setSubcategoriaParaEliminar(null);
    setEditandoCategoria(null);
  };

  const resetFormSubcategoria = () => {
    setFormSubcategoria({
      nombre: '',
      descripcion: '',
      icono: '📦',
      pesoUnitario: 0,
      unidad: '',
      activa: true
    });
    setCategoriaSeleccionada('');
    setEditandoSubcategoria(null);
  };

  // Funciones para Programas de Entrada
  const handleGuardarPrograma = () => {
    if (!formPrograma.nombre || !formPrograma.codigo || !formPrograma.descripcion) {
      toast.error(t('configuration.completeAllFields'));
      return;
    }

    if (editandoPrograma) {
      // Actualizar programa existente
      const programaActualizado = actualizarProgramaEntrada(editandoPrograma.id, formPrograma);
      if (programaActualizado) {
        // Recargar programas desde localStorage
        const programasActualizados = obtenerProgramasEntrada();
        setProgramasEntrada(programasActualizados);
        toast.success(t('configuration.programUpdatedSuccess'), {
          duration: 4000
        });
      } else {
        toast.error(t('configuration.errorUpdatingProgram'));
      }
    } else {
      // Crear nuevo programa
      const nuevoPrograma = guardarProgramaEntrada(formPrograma);
      // Recargar programas desde localStorage
      const programasActualizados = obtenerProgramasEntrada();
      setProgramasEntrada(programasActualizados);
      toast.success(t('configuration.programCreatedSuccessWithCode', { code: nuevoPrograma.codigo.toLowerCase() }), {
        duration: 5000
      });
    }

    resetFormPrograma();
    setProgramaDialogOpen(false);
  };

  const handleEditarPrograma = (programa: ProgramaEntrada) => {
    setEditandoPrograma(programa);
    setFormPrograma({
      nombre: programa.nombre,
      codigo: programa.codigo,
      descripcion: programa.descripcion,
      color: programa.color,
      activo: programa.activo,
      icono: programa.icono || '📦'
    });
    setProgramaDialogOpen(true);
  };

  const handleEliminarPrograma = (id: string) => {
    const eliminado = eliminarProgramaEntrada(id);
    if (eliminado) {
      // Recargar programas desde localStorage
      const programasActualizados = obtenerProgramasEntrada();
      setProgramasEntrada(programasActualizados);
      toast.success(t('configuration.programDeleted'));
    } else {
      toast.error(t('configuration.errorDeletingProgram'));
    }
  };

  const resetFormPrograma = () => {
    setFormPrograma({
      nombre: '',
      codigo: '',
      descripcion: '',
      color: '#1E73BE',
      activo: true,
      icono: '📦'
    });
    setEditandoPrograma(null);
  };

  // Funciones para Productos PRS
  const resetFormProductoPRS = () => {
    setFormProductoPRS({
      codigo: '',
      nombre: '',
      categoria: '',
      subcategoria: '',
      varianteId: '',
      varianteNombre: '',
      unidad: 'kg',
      icono: '📦',
      peso: 0,
      pesoUnitario: 0,
      ubicacion: ''
    });
    setEditandoProductoPRS(null);
  };

  const handleGuardarProductoPRS = () => {
    // Validaciones
    if (!formProductoPRS.codigo || !formProductoPRS.nombre || !formProductoPRS.categoria || !formProductoPRS.subcategoria) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formProductoPRS.peso <= 0) {
      toast.error('Le poids par unité doit être supérieur à 0');
      return;
    }

    if (editandoProductoPRS) {
      // Editar producto existente
      const productoActualizado: ProductoCreado = {
        ...editandoProductoPRS,
        codigo: formProductoPRS.codigo,
        nombre: formProductoPRS.nombre,
        categoria: formProductoPRS.categoria,
        subcategoria: formProductoPRS.subcategoria,
        varianteId: formProductoPRS.varianteId || undefined,
        varianteNombre: formProductoPRS.varianteNombre || undefined,
        unidad: formProductoPRS.unidad,
        icono: formProductoPRS.icono,
        peso: formProductoPRS.peso,
        pesoUnitario: formProductoPRS.pesoUnitario > 0 ? formProductoPRS.pesoUnitario : undefined,
        ubicacion: formProductoPRS.ubicacion || undefined,
        esPRS: true
      };

      actualizarProducto(editandoProductoPRS.id, productoActualizado);
      // Recargar productos desde localStorage
      setProductos(obtenerProductos());
      toast.success(`✅ Produit PRS "${formProductoPRS.nombre}" mis à jour avec succès`, {
        duration: 3000
      });
    } else {
      // Crear nuevo producto PRS
      const nuevoProducto: Omit<ProductoCreado, 'id'> = {
        codigo: formProductoPRS.codigo,
        nombre: formProductoPRS.nombre,
        categoria: formProductoPRS.categoria,
        subcategoria: formProductoPRS.subcategoria,
        varianteId: formProductoPRS.varianteId || undefined,
        varianteNombre: formProductoPRS.varianteNombre || undefined,
        unidad: formProductoPRS.unidad,
        icono: formProductoPRS.icono,
        peso: formProductoPRS.peso,
        pesoUnitario: formProductoPRS.pesoUnitario > 0 ? formProductoPRS.pesoUnitario : undefined,
        ubicacion: formProductoPRS.ubicacion || undefined,
        esPRS: true,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        stockActual: 0,
        stockMinimo: 0,
        lote: '',
        fechaVencimiento: ''
      };

      const productoGuardado = guardarProducto(nuevoProducto);
      // Recargar productos desde localStorage
      setProductos(obtenerProductos());
      toast.success(`✨ Produit PRS "${formProductoPRS.nombre}" créé avec succès`, {
        duration: 3000
      });
    }

    // Recargar lista de productos y cerrar dialog
    resetFormProductoPRS();
    setProductoPRSDialogOpen(false);
  };

  const handleEditarProductoPRS = (producto: ProductoCreado) => {
    setEditandoProductoPRS(producto);
    setFormProductoPRS({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      varianteId: producto.varianteId || '',
      varianteNombre: producto.varianteNombre || '',
      unidad: producto.unidad,
      icono: producto.icono,
      peso: producto.peso,
      pesoUnitario: producto.pesoUnitario || 0,
      ubicacion: producto.ubicacion || ''
    });
    setProductoPRSDialogOpen(true);
  };

  const handleEliminarProductoPRS = (id: string, nombre: string) => {
    if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le produit PRS "${nombre}"?\n\nCette action est irréversible.`)) {
      eliminarProducto(id);
      toast.success(`🗑️ Produit PRS "${nombre}" supprimé`, { duration: 3000 });
      setProductos(obtenerProductos());
    }
  };

  // Funciones para Productos
  const handleEditarProducto = (producto: any) => {
    setEditandoProducto(producto);
    setFormProducto({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria || '',
      unidad: producto.unidad || 'kg',
      icono: producto.icono || '📦',
      peso: producto.peso || 0,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      ubicacion: producto.ubicacion,
      lote: producto.lote,
      fechaVencimiento: producto.fechaVencimiento,
      tipoProducto: producto.esPRS ? 'prs' : 'normal'
    });
    setProductoDialogOpen(true);
  };

  const handleCrearVariante = (producto: any) => {
    setProductoBase(producto);
    setFormProducto({
      codigo: producto.codigo + '-VAR',
      nombre: producto.nombre + ' (Variante)',
      categoria: producto.categoria,
      subcategoria: producto.subcategoria || '', // Heredar automáticamente la subcategoría del producto base
      unidad: producto.unidad,
      icono: '📦',
      peso: 0,
      stockActual: 0,
      stockMinimo: producto.stockMinimo,
      ubicacion: producto.ubicacion,
      lote: '',
      fechaVencimiento: '',
      tipoProducto: producto.esPRS ? 'prs' : 'normal'
    });
    setVarianteDialogOpen(true);
  };

  const handleCrearVarianteDesdeSubcategoria = (categoria: Categoria, subcategoria: Subcategoria) => {
    setSubcategoriaBase({ categoria, subcategoria });
    setEditandoVariante(null); // Limpiar edición
    setFormVarianteSubcategoria({
      nombre: subcategoria.nombre || '',
      codigo: '',
      icono: subcategoria.icono || '📦',
      pesoUnitario: '',
      valorPorKg: '',
      descripcion: subcategoria.descripcion || '',
      unidad: subcategoria.unidad || '',
      stockMinimo: subcategoria.stockMinimo || 0
    });
    setVarianteSubcategoriaDialogOpen(true);
  };

  const handleEditarVariante = (variante: any, categoria: Categoria, subcategoria: Subcategoria) => {
    setEditandoVariante({ variante, categoria, subcategoria });
    setSubcategoriaBase({ categoria, subcategoria });
    setFormVarianteSubcategoria({
      nombre: variante.nombre || '',
      codigo: variante.codigo || '',
      icono: variante.icono || '📦',
      pesoUnitario: variante.pesoUnitario?.toString() || '',
      valorPorKg: variante.valorPorKg?.toString() || '',
      descripcion: variante.descripcion || '',
      unidad: variante.unidad || '',
      stockMinimo: variante.stockMinimo || 0
    });
    setVarianteSubcategoriaDialogOpen(true);
  };

  const handleGuardarProducto = () => {
    if (!formProducto.categoria || !formProducto.subcategoria || !formProducto.nombre.trim()) {
      toast.error(t('configuration.completeAllFields'));
      return;
    }

    // Usar el nombre del formulario o generar uno automáticamente como fallback
    const categoriaObj = categorias.find(c => c.nombre === formProducto.categoria);
    const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formProducto.subcategoria);
    const codigoFinal = formProducto.codigo || `${formProducto.categoria.substring(0, 3).toUpperCase()}-${formProducto.subcategoria.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const nombreFinal = formProducto.nombre.trim();
    
    // Generar icono automáticamente si no hay uno definido
    const iconoAutomatico = generarIconoProducto(nombreFinal, formProducto.categoria, formProducto.subcategoria);
    const iconoGenerado = subcategoriaObj?.icono || categoriaObj?.icono || iconoAutomatico;

    if (editandoProducto) {
      // Actualizar producto existente
      const productoActualizado: ProductoCreado = {
        ...editandoProducto,
        codigo: codigoFinal,
        nombre: nombreFinal,
        categoria: formProducto.categoria,
        subcategoria: formProducto.subcategoria,
        unidad: formProducto.unidad,
        icono: formProducto.icono || iconoGenerado,
        peso: formProducto.peso,
        pesoUnitario: formProducto.peso, // Peso unitario es el peso del producto
        stockActual: formProducto.stockActual,
        stockMinimo: formProducto.stockMinimo,
        ubicacion: formProducto.ubicacion,
        lote: formProducto.lote,
        fechaVencimiento: formProducto.fechaVencimiento,
        esPRS: formProducto.tipoProducto === 'prs'
      };
      
      // Actualizar en localStorage
      actualizarProducto(editandoProducto.id, productoActualizado);
      
      // Actualizar en estado local
      setProductos(productos.map(p => 
        p.id === editandoProducto.id ? productoActualizado : p
      ));
      
      toast.success(t('configuration.productUpdated') || 'Producto actualizado correctamente');
    } else {
      // Crear nuevo producto
      const nuevoProducto: ProductoCreado = {
        id: Date.now().toString(),
        codigo: codigoFinal,
        nombre: nombreFinal,
        categoria: formProducto.categoria,
        subcategoria: formProducto.subcategoria,
        unidad: formProducto.unidad,
        icono: formProducto.icono || iconoGenerado,
        peso: formProducto.peso,
        pesoUnitario: formProducto.peso, // Peso unitario es el peso del producto
        stockActual: formProducto.stockActual,
        stockMinimo: formProducto.stockMinimo,
        ubicacion: formProducto.ubicacion,
        lote: formProducto.lote,
        fechaVencimiento: formProducto.fechaVencimiento,
        esPRS: formProducto.tipoProducto === 'prs',
        activo: true,
        fechaCreacion: new Date().toISOString()
      };
      
      // Guardar en localStorage
      guardarProducto(nuevoProducto);
      
      // Actualizar en estado local
      setProductos([...productos, nuevoProducto]);
      
      toast.success(t('configuration.productCreated') || 'Producto creado correctamente');
    }

    resetFormProducto();
    setProductoDialogOpen(false);
  };

  const handleGuardarVariante = () => {
    if (!formProducto.codigo || !formProducto.nombre || !formProducto.categoria || !formProducto.subcategoria) {
      toast.error(t('configuration.completeAllFields'));
      return;
    }

    // Usar el nombre del formulario o generar uno automáticamente como fallback
    const categoriaObj = categorias.find(c => c.nombre === formProducto.categoria);
    const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formProducto.subcategoria);
    const codigoFinal = formProducto.codigo;
    const nombreFinal = formProducto.nombre.trim();
    
    // Generar icono automáticamente si no hay uno definido
    const iconoAutomatico = generarIconoProducto(nombreFinal, formProducto.categoria, formProducto.subcategoria);
    const iconoGenerado = subcategoriaObj?.icono || categoriaObj?.icono || iconoAutomatico;

    // Crear variante como un nuevo producto
    const varianteProducto: ProductoCreado = {
      id: Date.now().toString(),
      codigo: codigoFinal,
      nombre: nombreFinal,
      categoria: formProducto.categoria,
      subcategoria: formProducto.subcategoria,
      unidad: formProducto.unidad,
      icono: formProducto.icono || iconoGenerado,
      peso: formProducto.peso,
      pesoUnitario: formProducto.peso, // Peso unitario es el peso del producto
      stockActual: formProducto.stockActual,
      stockMinimo: formProducto.stockMinimo,
      ubicacion: formProducto.ubicacion,
      lote: formProducto.lote,
      fechaVencimiento: formProducto.fechaVencimiento,
      esPRS: formProducto.tipoProducto === 'prs',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      esVariante: true,
      productoBaseId: productoBase?.id,
      productoBaseNombre: productoBase?.nombre
    };
    
    // Guardar en localStorage
    guardarProducto(varianteProducto);
    
    // Actualizar en estado local
    setProductos([...productos, varianteProducto]);

    toast.success(t('configuration.variantCreated') || `Variante creada basada en: ${productoBase?.nombre}`);
    resetFormProducto();
    setProductoBase(null);
    setVarianteDialogOpen(false);
  };

  const handleGuardarVarianteSubcategoria = () => {
    if (!formVarianteSubcategoria.nombre.trim()) {
      toast.error(t('configuration.variantNameRequired'));
      return;
    }

    if (!subcategoriaBase) {
      toast.error(t('configuration.noSubcategorySelected'));
      return;
    }

    const { categoria, subcategoria } = subcategoriaBase;

    // Generar código automáticamente si no se proporcionó uno
    const codigoGenerado = formVarianteSubcategoria.codigo.trim() || 
      `${categoria.nombre.substring(0, 3).toUpperCase()}-${subcategoria.nombre.substring(0, 3).toUpperCase()}-VAR-${Date.now().toString().slice(-4)}`;

    if (editandoVariante) {
      // Actualizar variante existente
      const varianteActualizada: any = {
        ...editandoVariante.variante,
        nombre: formVarianteSubcategoria.nombre.trim(),
        codigo: codigoGenerado,
        icono: formVarianteSubcategoria.icono,
        unidad: formVarianteSubcategoria.unidad.trim() || undefined,
        valorPorKg: formVarianteSubcategoria.valorPorKg ? parseFloat(formVarianteSubcategoria.valorPorKg) : undefined,
        pesoUnitario: formVarianteSubcategoria.pesoUnitario ? parseFloat(formVarianteSubcategoria.pesoUnitario) : undefined,
        descripcion: formVarianteSubcategoria.descripcion.trim() || undefined,
        stockMinimo: formVarianteSubcategoria.stockMinimo || 0
      };

      const categoriasActualizadas = categorias.map(cat => {
        if (cat.id === categoria.id) {
          const subcategoriasActualizadas = cat.subcategorias.map(sub => {
            if (sub.id === subcategoria.id) {
              const variantesActualizadas = (sub.variantes || []).map(v => 
                v.id === editandoVariante.variante.id ? varianteActualizada : v
              );
              return { ...sub, variantes: variantesActualizadas };
            }
            return sub;
          });
          return { ...cat, subcategorias: subcategoriasActualizadas };
        }
        return cat;
      });

      guardarCategorias(categoriasActualizadas);
      setCategorias(categoriasActualizadas);
      toast.success(t('configuration.variantUpdatedSuccess'));
      setEditandoVariante(null);
    } else {
      // Crear nueva variante
      const nuevaVariante: any = {
        id: `var-${Date.now()}`,
        nombre: formVarianteSubcategoria.nombre.trim(),
        codigo: codigoGenerado,
        icono: formVarianteSubcategoria.icono,
        activa: true,
        unidad: formVarianteSubcategoria.unidad.trim() || undefined,
        valorPorKg: formVarianteSubcategoria.valorPorKg ? parseFloat(formVarianteSubcategoria.valorPorKg) : undefined,
        pesoUnitario: formVarianteSubcategoria.pesoUnitario ? parseFloat(formVarianteSubcategoria.pesoUnitario) : undefined,
        descripcion: formVarianteSubcategoria.descripcion.trim() || undefined,
        stockMinimo: formVarianteSubcategoria.stockMinimo || 0
      };

      const categoriasActualizadas = categorias.map(cat => {
        if (cat.id === categoria.id) {
          const subcategoriasActualizadas = cat.subcategorias.map(sub => {
            if (sub.id === subcategoria.id) {
              const variantesActualizadas = [...(sub.variantes || []), nuevaVariante];
              return { ...sub, variantes: variantesActualizadas };
            }
            return sub;
          });
          return { ...cat, subcategorias: subcategoriasActualizadas };
        }
        return cat;
      });

      guardarCategorias(categoriasActualizadas);
      setCategorias(categoriasActualizadas);
      toast.success(t('configuration.variantCreatedSuccess'));
    }
    setFormVarianteSubcategoria({
      nombre: '',
      codigo: '',
      icono: '📦',
      pesoUnitario: '',
      valorPorKg: '',
      descripcion: '',
      unidad: ''
    });
    setSubcategoriaBase(null);
    setEditandoVariante(null);
    setVarianteSubcategoriaDialogOpen(false);
  };

  // Funciones para configuración de soporte
  const handleGuardarConfigSupport = () => {
    guardarConfigSupport(formSupport);
    setSupportConfig(formSupport);
    toast.success('✅ Configuration de support enregistrée avec succès', {
      description: '🔄 Tous les modules sont maintenant synchronisés avec la nouvelle configuration',
      duration: 5000
    });
    setSupportDialogOpen(false);
  };

  const handleProbarConfigSupport = () => {
    const { chatAide, support, reportBug } = formSupport;
    
    let mensaje = '📋 Configuration actuelle:\n\n';
    
    if (chatAide.enabled) {
      mensaje += `💬 Chat d'Aide: ${chatAide.type === 'email' ? '📧' : chatAide.type === 'url' ? '🔗' : '📞'} ${chatAide.value}\n\n`;
    }
    
    if (support.enabled) {
      mensaje += `📞 Support:\n`;
      if (support.email) {
        mensaje += `   📧 Email principal: ${support.email}\n`;
      }
      if (support.emailSecondaire) {
        mensaje += `   📧 Email secondaire: ${support.emailSecondaire}\n`;
      }
      if (support.phone) {
        mensaje += `   ☎️ Téléphone: ${support.phone}\n`;
      }
      mensaje += '\n';
    }
    
    if (reportBug.enabled) {
      mensaje += `🐛 Signaler un problème:\n`;
      mensaje += `   ${reportBug.type === 'email' ? '📧' : '🔗'} Principal: ${reportBug.value}\n`;
      if (reportBug.type === 'email' && reportBug.emailSecondaire) {
        mensaje += `   📧 Email secondaire: ${reportBug.emailSecondaire}\n`;
      }
    }
    
    toast.success(mensaje, { duration: 8000 });
  };

  const resetFormProducto = () => {
    setFormProducto({
      codigo: '',
      nombre: '',
      categoria: '',
      subcategoria: '',
      unidad: 'kg',
      icono: '📦',
      peso: 0,
      stockActual: 0,
      stockMinimo: 0,
      ubicacion: '',
      lote: '',
      fechaVencimiento: '',
      tipoProducto: 'normal'
    });
    setEditandoProducto(null);
    setProductoBase(null);
  };

  // Función para generar producto rápidamente desde categoría y subcategoría
  const handleGenerarProductoRapido = (categoria: Categoria, subcategoria: Subcategoria) => {
    // Usar el nombre de la subcategoría como nombre del producto
    const nombre = subcategoria.nombre;
    const unidad = subcategoria.unidad || 'kg';
    const pesoUnitario = subcategoria.pesoUnitario;
    
    // Verificar si ya existe un producto con las mismas características
    const productoExistente = productos.find(
      p => p.nombre === nombre && 
           p.categoria === categoria.nombre && 
           p.subcategoria === subcategoria.nombre &&
           p.unidad === unidad &&
           p.pesoUnitario === pesoUnitario &&
           p.activo === true
    );
    
    // Si ya existe un producto con las mismas características, informar sin bloquear
    if (productoExistente) {
      toast.info(`⚠️ ${t('configuration.productAlreadyExists')}: \"${nombre}\"`, {
        description: `📦 ${t('common.code')}: ${productoExistente.codigo} | ⚖️ ${productoExistente.pesoUnitario || ''}${productoExistente.unidad || ''} | 💾 ${t('configuration.productExistsInInventory')}`,
        duration: 6000
      });
      return;
    }
    
    // Auto-generar código único
    const codigo = `${categoria.nombre.substring(0, 3).toUpperCase()}-${subcategoria.nombre.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    // Crear producto automáticamente con datos heredados de la subcategoría
    const nuevoProducto: ProductoCreado = {
        id: Date.now().toString(),
      codigo: codigo,
      nombre: nombre,
      categoria: categoria.nombre,
      subcategoria: subcategoria.nombre,
      unidad: subcategoria.unidad || 'kg',
      icono: subcategoria.icono || categoria.icono || '📦',
      peso: 0,
      pesoUnitario: subcategoria.pesoUnitario,
      stockActual: 0,
      stockMinimo: 0,
      ubicacion: '',
      lote: '',
      fechaVencimiento: '',
      esPRS: true,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
    
    guardarProducto(nuevoProducto);
    setProductos([...productos, nuevoProducto]);
    
    toast.success(`✅ ${t('configuration.productGeneratedAuto')}: \"${nombre}\"`, {
      description: `📦 ${t('common.code')}: ${codigo} | 📂 ${t('configuration.category')}: ${categoria.nombre}`,
      duration: 5000
    });
  };

  // Función para contar productos por subcategoría
  const contarProductosPorSubcategoria = (categoriaNombre: string, subcategoriaNombre: string) => {
    return productos.filter(
      p => p.categoria === categoriaNombre && p.subcategoria === subcategoriaNombre
    ).length;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      peso: t('configuration.weightType'),
      volumen: t('configuration.volumeType'),
      cantidad: t('configuration.quantityType'),
      empaque: t('configuration.packageType')
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      peso: 'bg-[#FFC107]',
      volumen: 'bg-[#1E73BE]',
      cantidad: 'bg-[#4CAF50]',
      empaque: 'bg-[#DC3545]'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  return (
    <div 
      className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f1f5f9 100%)`,
      }}
    >
      {/* Formas decorativas de fondo mejoradas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Header con logo y título */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              {/* Glow effect detrás del logo */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div 
                className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                style={{ borderColor: branding.primaryColor }}
              >
                {branding.logo ? (
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full rounded-full"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                    }}
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Título con diseño elegante */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <Settings 
                  className="relative w-7 h-7 sm:w-9 sm:h-9 text-[#1a4d7a]" 
                />
              </div>
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#1a4d7a] via-[#1a4d7a] to-[#2d9561] bg-clip-text text-transparent" 
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700
                }}
              >
                {t('configuration.systemTitle')}
              </h1>
              <Sparkles 
                className="w-6 h-6 sm:w-7 sm:h-7 text-[#2d9561] animate-pulse" 
              />
            </div>

            <p className="text-center text-gray-600 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {t('configuration.subtitle')}
            </p>
          </div>

      {/* Tabs con diseño moderno y elegante */}
      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="inline-flex backdrop-blur-xl bg-white/70 border-2 border-white/60 shadow-2xl rounded-2xl flex-wrap h-auto gap-2 p-2">
          <TabsTrigger 
            value="categorias" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ 
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600
            }}
          >
            <FolderTree className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">{t('configuration.categoriesAndSubcategories')}</span>
            <span className="sm:hidden">Catégories</span>
          </TabsTrigger>
          <TabsTrigger 
            value="programas" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Inbox className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">{t('configuration.entryPrograms')}</span>
            <span className="sm:hidden">Programmes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="productos-prs" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Produits PRS</span>
            <span className="sm:hidden">PRS</span>
          </TabsTrigger>
          <TabsTrigger 
            value="sauvegardes" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>Sauvegardes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="unidades" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Ruler className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>Unités</span>
          </TabsTrigger>
          <TabsTrigger 
            value="balance" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>Balance</span>
          </TabsTrigger>
          {esDesarrollador && (
            <TabsTrigger 
              value="adresses" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden lg:inline">Adresses et Quartiers</span>
              <span className="lg:hidden">Adresses</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab: Categorías y Subcategorías */}
        <TabsContent value="categorias" className="fade-in">
          <div className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/60 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#1a4d7a]/5 to-[#2d9561]/5 border-b border-gray-200/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}>
                  <div className="p-2 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl shadow-lg">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  {t('configuration.productCategories')}
                </CardTitle>
                <div className="flex gap-3">
                  <Dialog open={subcategoriaDialogOpen} onOpenChange={(open) => {
                    setSubcategoriaDialogOpen(open);
                    if (!open) resetFormSubcategoria();
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-gradient-to-r from-[#2d9561] to-[#258a54] hover:from-[#258a54] hover:to-[#1f7547] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('configuration.newSubcategory')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="subcategoria-dialog-description">
                      <DialogHeader>
                        <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                          {editandoSubcategoria ? t('configuration.editSubcategory') : t('configuration.newSubcategoryForm')}
                        </DialogTitle>
                        <DialogDescription id="subcategoria-dialog-description">
                          {editandoSubcategoria ? 'Modifique los datos de la subcategoría' : 'Complete la información de la nueva subcategoría'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t('configuration.parentCategory')}</Label>
                          <Select 
                            value={categoriaSeleccionada}
                            disabled={editandoSubcategoria !== null}
                            onValueChange={(catId) => {
                              const categoriaPadre = categorias.find(c => c.id === catId);
                              setCategoriaSeleccionada(catId);
                              // Copiar automáticamente el icono de la categoría seleccionada
                              if (!editandoSubcategoria && categoriaPadre) {
                                setFormSubcategoria({
                                  ...formSubcategoria,
                                  icono: categoriaPadre.icono
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('configuration.selectCategory')} />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriasVisibles.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{cat.icono}</span>
                                    <span>{cat.nombre}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('configuration.subcategoryName')}</Label>
                          <Input
                            placeholder={t('configuration.subcategoryNamePlaceholder')}
                            value={formSubcategoria.nombre || ''}
                            onChange={(e) => setFormSubcategoria({ ...formSubcategoria, nombre: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>{t('configuration.subcategoryDescription')}</Label>
                          <Textarea
                            placeholder={t('configuration.subcategoryDescriptionPlaceholder')}
                            value={formSubcategoria.descripcion || ''}
                            onChange={(e) => setFormSubcategoria({ ...formSubcategoria, descripcion: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Peso Unitario (kg)
                            <span className="text-xs text-gray-500">(Opcional)</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ej: 0.15 kg para una manzana"
                            value={formSubcategoria.pesoUnitario === 0 ? '' : formSubcategoria.pesoUnitario || ''}
                            onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoUnitario: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                          />
                          {!formSubcategoria.pesoUnitario || formSubcategoria.pesoUnitario === 0 ? (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-blue-500 text-lg">💡</div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-[#1E73BE]">
                                  Memorización Automática Activa
                                </p>
                                <p className="text-xs text-[#666666]">
                                  Al crear un producto con esta subcategoría, el sistema calculará y guardará automáticamente el peso unitario
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-[#4CAF50] font-medium">
                              ✓ Peso unitario definido: {(formSubcategoria.pesoUnitario || 0).toFixed(1)} kg
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            📏 {t('common.unit')} *
                          </Label>
                          <Select
                            value={formSubcategoria.unidad}
                            onValueChange={(value) => setFormSubcategoria({ ...formSubcategoria, unidad: value })}
                          >
                            <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                              <SelectValue placeholder={t('configuration.selectUnit') || 'Selecciona una unidad'} />
                            </SelectTrigger>
                            <SelectContent>
                              {unidades.map(unidad => (
                                <SelectItem key={unidad.id} value={unidad.abreviatura}>
                                  {unidad.icono && `${unidad.icono} `}{unidad.nombre} ({unidad.abreviatura})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-[#666666]">
                            💡 {t('configuration.unitForSubcategory') || 'Esta unidad se usará por defecto para todos los productos de esta subcategoría'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            📊 Stock Mínimo
                            <span className="text-xs text-gray-500">(Opcional)</span>
                          </Label>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="Ej: 10"
                            value={formSubcategoria.stockMinimo === 0 ? '' : formSubcategoria.stockMinimo || ''}
                            onChange={(e) => setFormSubcategoria({ ...formSubcategoria, stockMinimo: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                          />
                          <p className="text-xs text-gray-500">
                            💡 Se mostrará una alerta cuando el stock esté por debajo de este valor
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>{t('configuration.icon')}</Label>
                          {!editandoSubcategoria && categoriaSeleccionada && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xl">
                                {formSubcategoria.icono}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {t('configuration.iconAutoCopied')}
                                </p>
                                <p className="text-xs text-[#666666]">
                                  {t('configuration.iconAutoCopiedDescription')}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-8 gap-2 p-4 border rounded-lg max-h-40 overflow-y-auto">
                            {ICONOS_SUBCATEGORIAS.map(icono => (
                              <button
                                key={icono}
                                onClick={() => setFormSubcategoria({ ...formSubcategoria, icono })}
                                className={`text-xl p-2 rounded hover:bg-gray-100 ${
                                  formSubcategoria.icono === icono ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                                }`}
                                type="button"
                              >
                                {icono}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-[#F4F4F4]">
                            <div>
                              <Label className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {t('configuration.subcategoryActive')}
                              </Label>
                              <p className="text-sm text-[#666666] mt-1">
                                {formSubcategoria.activa 
                                  ? t('configuration.subcategoryIsActive')
                                  : t('configuration.subcategoryIsInactive')}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormSubcategoria({ ...formSubcategoria, activa: !formSubcategoria.activa })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                formSubcategoria.activa ? 'bg-[#4CAF50]' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  formSubcategoria.activa ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Gestión de Variantes - Solo mostrar al editar */}
                        {editandoSubcategoria && categoriaSeleccionada && (
                          <div className="pt-4 border-t">
                            <GestionVariantes 
                              subcategoria={editandoSubcategoria} 
                              categoriaId={categoriaSeleccionada}
                              onActualizar={() => {
                                // Recargar categorías para reflejar cambios
                                setCategorias(obtenerCategorias());
                              }}
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => {
                            setSubcategoriaDialogOpen(false);
                            resetFormSubcategoria();
                          }}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleGuardarSubcategoria} className="bg-[#4CAF50] hover:bg-[#45a049]">
                            <Save className="w-4 h-4 mr-2" />
                            {editandoSubcategoria ? t('common.update') : t('common.save')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={categoriaDialogOpen} onOpenChange={(open) => {
                    setCategoriaDialogOpen(open);
                    if (!open) resetFormCategoria();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('configuration.newCategory')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby="categoria-dialog-description">
                      <DialogHeader>
                        <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                          {editandoCategoria ? t('configuration.editCategory') : t('configuration.newCategory')}
                        </DialogTitle>
                        <DialogDescription id="categoria-dialog-description">
                          {editandoCategoria ? 'Modifique los datos de la categoría' : 'Complete la información de la nueva categoría'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t('configuration.categoryName')}</Label>
                          <Input
                            placeholder={t('configuration.categoryNamePlaceholder')}
                            value={formCategoria.nombre || ''}
                            onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('configuration.description')}</Label>
                          <Textarea
                            placeholder={t('configuration.descriptionPlaceholder')}
                            value={formCategoria.descripcion || ''}
                            onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                          />
                          {formCategoria.descripcion?.toLowerCase().includes('prs') && (
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-xs text-purple-800 flex items-start gap-2">
                                <span className="text-base">🔒</span>
                                <span>
                                  <strong>Categoría PRS:</strong> Esta categoría solo será visible cuando exista un programa de entrada activo llamado "PRS".
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>{t('configuration.baseMonetaryValue')}</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={formCategoria.valorMonetario || 0}
                              onChange={(e) => setFormCategoria({ ...formCategoria, valorMonetario: parseFloat(e.target.value) || 0 })}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('configuration.icon')}</Label>
                            <div className="grid grid-cols-6 gap-2 p-4 border rounded-lg max-h-40 overflow-y-auto">
                              {ICONOS_PRINCIPALES.map(icono => (
                                <button
                                  key={icono}
                                  onClick={() => setFormCategoria({ ...formCategoria, icono })}
                                  className={`text-2xl p-2 rounded hover:bg-gray-100 ${
                                    formCategoria.icono === icono ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                                  }`}
                                  type="button"
                                >
                                  {icono}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>{t('configuration.identificationColor')}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={formCategoria.color || '#1E73BE'}
                                onChange={(e) => setFormCategoria({ ...formCategoria, color: e.target.value })}
                                className="w-20 h-10"
                              />
                              <Input
                                type="text"
                                value={formCategoria.color || ''}
                                onChange={(e) => setFormCategoria({ ...formCategoria, color: e.target.value })}
                                placeholder="#1E73BE"
                                className="flex-1"
                              />
                            </div>
                            <div className="mt-3 p-4 border rounded-lg text-center">
                              <div 
                                className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: formCategoria.color + '20', fontSize: '2rem' }}
                              >
                                {formCategoria.icono}
                              </div>
                              <p className="text-xs text-[#666666] mt-2">{t('configuration.preview')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => {
                            setCategoriaDialogOpen(false);
                            resetFormCategoria();
                          }}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleGuardarCategoria} className="bg-[#4CAF50] hover:bg-[#45a049]">
                            <Save className="w-4 h-4 mr-2" />
                            {editandoCategoria ? t('common.update') : t('common.save')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Alerta informativa sobre generación rápida */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#1E73BE] rounded-lg flex items-center justify-center">
                      <FolderTree className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {t('configuration.hierarchicalSystemTitle')}
                      </h4>
                      <p className="text-sm text-[#666666] mb-3">
                        {t('configuration.hierarchicalSystemDescription')}
                      </p>
                      <div className="space-y-3">
                        {/* Nivel 1: Categorías */}
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#1E73BE] rounded flex items-center justify-center text-white text-xs font-bold">
                            1
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {t('configuration.level1Title')}
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                              {t('configuration.level1Description')} <span className="font-medium">{t('configuration.level1Examples')}</span>
                            </p>
                            <p className="text-xs text-[#4CAF50] mt-1">
                              {t('configuration.level1MonetaryNote')}
                            </p>
                          </div>
                        </div>

                        {/* Nivel 2: Subcategorías */}
                        <div className="flex items-start gap-2 pl-8">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#4CAF50] rounded flex items-center justify-center text-white text-xs font-bold">
                            2
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {t('configuration.level2Title')}
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                              {t('configuration.level2Description')} <span className="font-medium">{t('configuration.level1Examples')}</span> → <span className="font-medium">{t('configuration.level2Examples')}</span>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {t('configuration.level2WeightNote')}
                            </p>
                          </div>
                        </div>

                        {/* Nivel 3: Variantes */}
                        <div className="flex items-start gap-2 pl-16">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#9C27B0] rounded flex items-center justify-center text-white text-xs font-bold">
                            3
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#9C27B0]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {t('configuration.level3Title')}
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                              {t('configuration.level3Description')} <span className="font-medium">{t('configuration.level2Examples').split(', ')[0]}</span> → <span className="font-medium">{t('configuration.level3Examples')}</span>
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              {t('configuration.level3CharacteristicsNote')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ejemplo visual */}
                      <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs font-semibold text-[#333333] mb-1">
                          {t('configuration.fullExampleTitle')}
                        </p>
                        <p className="text-xs text-[#666666] font-mono">
                          {t('configuration.fullExampleText')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!existeProgramaPRS && categorias.some(c => c.descripcion?.toLowerCase().includes('prs')) && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          {t('configuration.prsNotAvailableTitle')}
                        </p>
                        <p className="text-xs text-amber-700">
                          {t('configuration.prsNotAvailableDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {categoriasVisibles.map(categoria => (
                    <div key={categoria.id} className="backdrop-blur-lg bg-white/70 border-2 border-white/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      {/* Categoría Principal */}
                      <div 
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50/50 to-transparent cursor-pointer hover:from-gray-100/70 hover:to-transparent transition-all duration-300 group"
                        onClick={() => toggleCategoria(categoria.id)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent group-hover:scale-110 transition-transform">
                            {categoriaExpandida === categoria.id ? (
                              <ChevronDown className="w-6 h-6 text-[#1a4d7a]" />
                            ) : (
                              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#1a4d7a] transition-colors" />
                            )}
                          </Button>
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                            style={{ backgroundColor: categoria.color + '30', fontSize: '1.75rem' }}
                          >
                            {categoria.icono}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {categoria.nombre}
                            </h4>
                            <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          {categoria.descripcion?.toLowerCase().includes('prs') && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
                              {t('configuration.prsBadge')}
                            </Badge>
                          )}
                          {categoria.valorPorKg && (
                            <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-[#2d9561] border-2 border-[#2d9561]/30 px-3 py-1 rounded-full font-semibold shadow-sm">
                              {t('configuration.valuePerKgBadge', { value: categoria.valorPorKg.toFixed(2) })}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50 hover:text-[#1a4d7a] rounded-xl transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarCategoria(categoria);
                            }}
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 hover:text-[#DC3545] rounded-xl transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSolicitarEliminarCategoria(categoria);
                            }}
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 hover:text-[#DC3545]" />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategorías */}
                      {categoriaExpandida === categoria.id && (
                        <div className="p-5 bg-gradient-to-br from-gray-50/30 to-transparent border-t-2 border-gray-100/50">
                          {categoria.subcategorias.length > 0 ? (
                            <div className="space-y-3">
                              {categoria.subcategorias.map(sub => (
                                <div key={sub.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200/50 shadow-sm hover:shadow-md hover:border-[#2d9561]/30 transition-all duration-300">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3 flex-1">
                                      {sub.icono && (
                                        <div 
                                          className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                                          style={{ backgroundColor: categoria.color + '20', fontSize: '1.2rem' }}
                                        >
                                          {sub.icono}
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                            {sub.nombre}
                                          </span>
                                          {(() => {
                                            const cantidadProductos = contarProductosPorSubcategoria(categoria.nombre, sub.nombre);
                                            return cantidadProductos > 0 ? (
                                              <Badge className="bg-[#1E73BE] text-white text-xs">
                                                <Package className="w-3 h-3 mr-1" />
                                                {cantidadProductos} {cantidadProductos === 1 ? t('common.product') : t('configuration.products')}
                                              </Badge>
                                            ) : null;
                                          })()}
                                          {sub.activa ? (
                                            <Badge className="bg-[#4CAF50] text-white text-xs">
                                              <Eye className="w-3 h-3 mr-1" />
                                              {t('configuration.active')}
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-gray-400 text-white text-xs">
                                              <EyeOff className="w-3 h-3 mr-1" />
                                              {t('configuration.inactive')}
                                            </Badge>
                                          )}
                                        </div>
                                        {sub.descripcion && (
                                          <p className="text-xs text-[#666666] mb-2">{sub.descripcion}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 items-center">
                                          {sub.unidad && (() => {
                                            const unidadObj = unidades.find(u => u.abreviatura === sub.unidad);
                                            return (
                                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                                {unidadObj?.icono || '📏'} {unidadObj?.nombre || sub.unidad}
                                              </Badge>
                                            );
                                          })()}
                                          {sub.pesoUnitario && sub.pesoUnitario > 0 && (
                                            <Badge className="bg-blue-100 text-[#1E73BE] border-[#1E73BE] text-xs">
                                              ⚖️ {(sub.pesoUnitario || 0).toFixed(1)} kg/unidad
                                            </Badge>
                                          )}
                                          {(!sub.pesoUnitario || sub.pesoUnitario === 0) && (
                                            <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
                                              {t('configuration.autoMemorizable')}
                                            </Badge>
                                          )}
                                          {(() => {
                                            // Obtener el valor por kg efectivo (heredado o propio)
                                            const valorPorKg = obtenerValorPorKg(categoria.nombre, sub.nombre);
                                            const esHeredado = !sub.valorPorKg;
                                            
                                            if (valorPorKg) {
                                              return (
                                                <Badge className={esHeredado ? "bg-amber-100 text-amber-700 border-amber-300 text-xs" : "bg-blue-100 text-[#1E73BE] border-[#1E73BE] text-xs"}>
                                                  {t('configuration.valuePerKgBadge', { value: valorPorKg.toFixed(2) })} {esHeredado && t('configuration.inheritedBadge')}
                                                </Badge>
                                              );
                                            }
                                            return null;
                                          })()}
                                          {sub.stockMinimo && sub.stockMinimo > 0 && (
                                            <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                              {t('configuration.minStockBadge', { value: sub.stockMinimo })}
                                            </Badge>
                                          )}
                                          {sub.unidadesPermitidas && sub.unidadesPermitidas.length > 0 && (
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs text-[#666666]">{t('configuration.allowedUnits')}:</span>
                                              {sub.unidadesPermitidas.slice(0, 3).map(unidadId => {
                                                const unidad = unidades.find(u => u.id === unidadId);
                                                return unidad ? (
                                                  <Badge key={unidadId} variant="outline" className="text-xs">
                                                    {unidad.abreviatura}
                                                  </Badge>
                                                ) : null;
                                              })}
                                              {sub.unidadesPermitidas.length > 3 && (
                                                <span className="text-xs text-[#666666]">+{sub.unidadesPermitidas.length - 3}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCrearVarianteDesdeSubcategoria(categoria, sub);
                                        }}
                                        className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white shadow-sm hover:shadow-md transition-all"
                                        title={t('configuration.variantButton')}
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        {t('configuration.variantButton')}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleActivaSubcategoria(categoria.id, sub.id);
                                        }}
                                        title={sub.activa ? t('configuration.deactivate') : t('configuration.activate')}
                                      >
                                        {sub.activa ? <Eye className="w-4 h-4 text-[#4CAF50]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditarSubcategoria(categoria.id, sub)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSolicitarEliminarSubcategoria(categoria, sub)}
                                      >
                                        <Trash2 className="w-4 h-4 text-[#DC3545]" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Variantes de la subcategoría */}
                                  {sub.variantes && sub.variantes.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-[#9C27B0] space-y-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-[#9C27B0]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                          {t('configuration.variantsCount', { count: sub.variantes.length })}
                                        </span>
                                      </div>
                                      {sub.variantes.map((variante: any) => (
                                        <div key={variante.id} className="p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                              <div 
                                                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: '#9C27B020', fontSize: '1rem' }}
                                              >
                                                {variante.icono || '📦'}
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-medium text-sm text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                                    {variante.nombre}
                                                  </span>
                                                  {variante.codigo && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {variante.codigo}
                                                    </Badge>
                                                  )}
                                                </div>
                                                {variante.descripcion && (
                                                  <p className="text-xs text-[#666666] mb-1">{variante.descripcion}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 items-center">
                                                  {variante.unidad && (() => {
                                                    const unidadObj = unidades.find(u => u.abreviatura === variante.unidad);
                                                    return (
                                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                                        {unidadObj?.icono || '📏'} {unidadObj?.nombre || variante.unidad}
                                                      </Badge>
                                                    );
                                                  })()}
                                                  {variante.pesoUnitario && variante.pesoUnitario > 0 && (
                                                    <Badge className="bg-purple-100 text-[#9C27B0] border-[#9C27B0] text-xs">
                                                      ⚖️ {(variante.pesoUnitario || 0).toFixed(1)} kg/unidad
                                                    </Badge>
                                                  )}
                                                  {(() => {
                                                    // Obtener el valor por kg efectivo (heredado o propio)
                                                    const valorPorKg = obtenerValorPorKg(categoria.nombre, sub.nombre, variante.id);
                                                    const esHeredado = !variante.valorPorKg;
                                                    
                                                    if (valorPorKg) {
                                                      return (
                                                        <Badge className={esHeredado ? "bg-amber-100 text-amber-700 border-amber-300 text-xs" : "bg-blue-100 text-[#1E73BE] border-[#1E73BE] text-xs"}>
                                                          {t('configuration.valuePerKgBadge', { value: valorPorKg.toFixed(2) })} {esHeredado && t('configuration.inheritedBadge')}
                                                        </Badge>
                                                      );
                                                    }
                                                    return null;
                                                  })()}
                                                  {variante.stockMinimo && variante.stockMinimo > 0 && (
                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                                      {t('configuration.minStockBadge', { value: variante.stockMinimo })}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditarVariante(variante, categoria, sub)}
                                                title={t('configuration.editProduct')}
                                              >
                                                <Edit className="w-3 h-3 text-[#9C27B0]" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  if (window.confirm(t('configuration.confirmDeleteVariant'))) {
                                                    const categoriasActualizadas = categorias.map(cat => {
                                                      if (cat.id === categoria.id) {
                                                        const subcategoriasActualizadas = cat.subcategorias.map(subcat => {
                                                          if (subcat.id === sub.id) {
                                                            const variantesActualizadas = (subcat.variantes || []).filter(v => v.id !== variante.id);
                                                            return { ...subcat, variantes: variantesActualizadas };
                                                          }
                                                          return subcat;
                                                        });
                                                        return { ...cat, subcategorias: subcategoriasActualizadas };
                                                      }
                                                      return cat;
                                                    });
                                                    guardarCategorias(categoriasActualizadas);
                                                    setCategorias(categoriasActualizadas);
                                                    toast.success(t('configuration.variantDeletedSuccess'));
                                                  }
                                                }}
                                                title={t('common.delete')}
                                              >
                                                <Trash2 className="w-3 h-3 text-[#DC3545]" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-[#999999] mb-3">{t('configuration.noSubcategoriesInCategory')}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCategoriaSeleccionada(categoria.id);
                                  setFormSubcategoria({
                                    nombre: '',
                                    descripcion: '',
                                    icono: categoria.icono,
                                    activa: true
                                  });
                                  setSubcategoriaDialogOpen(true);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {t('configuration.addSubcategory')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Programas de Entrada */}
        <TabsContent value="programas" className="fade-in">
          <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/60 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#1a4d7a]/5 to-[#2d9561]/5 border-b border-gray-200/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}>
                <div className="p-2 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl shadow-lg">
                  <Inbox className="w-6 h-6 text-white" />
                </div>
                {t('configuration.entryPrograms')}
              </CardTitle>
              <Dialog open={programaDialogOpen} onOpenChange={(open) => {
                setProgramaDialogOpen(open);
                if (!open) resetFormPrograma();
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] hover:from-[#2d9561] hover:to-[#1a4d7a] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('configuration.newProgram')}
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="programa-dialog-description">
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {editandoPrograma ? t('configuration.editProgram') : t('configuration.newProgramForm')}
                    </DialogTitle>
                    <DialogDescription id="programa-dialog-description">
                      {editandoPrograma ? t('configuration.modifyProgramData') : t('configuration.completeProgramInfo')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('configuration.programName')}</Label>
                      <Input
                        placeholder={t('configuration.programNamePlaceholder')}
                        value={formPrograma.nombre || ''}
                        onChange={(e) => setFormPrograma({ ...formPrograma, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('configuration.programCode')}</Label>
                      <Input
                        placeholder={t('configuration.programCodePlaceholder')}
                        value={formPrograma.codigo || ''}
                        onChange={(e) => setFormPrograma({ ...formPrograma, codigo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('configuration.description')}</Label>
                      <Textarea
                        placeholder={t('configuration.descriptionPlaceholder')}
                        value={formPrograma.descripcion || ''}
                        onChange={(e) => setFormPrograma({ ...formPrograma, descripcion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('configuration.icon')}</Label>
                      <div className="space-y-3">
                        {/* Input para mostrar el icono seleccionado */}
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg border-2 border-[#E0E0E0] flex items-center justify-center text-2xl bg-white">
                            {formPrograma.icono || '📦'}
                          </div>
                          <Input
                            placeholder={t('configuration.enterEmoji')}
                            value={formPrograma.icono || ''}
                            onChange={(e) => setFormPrograma({ ...formPrograma, icono: e.target.value })}
                            maxLength={2}
                            className="flex-1"
                          />
                        </div>
                        
                        {/* Selector visual de iconos */}
                        <div className="border-2 border-[#E0E0E0] rounded-lg p-3 bg-[#FAFAFA] max-h-48 overflow-y-auto">
                          <p className="text-xs text-[#666666] mb-2 font-medium">{t('configuration.selectAnIcon')}</p>
                          <div className="grid grid-cols-8 gap-2">
                            {/* Iconos para programas de entrada */}
                            {['📦', '🎁', '🛒', '🚚', '📋', '✅', '🏪', '🏭', '🌾', '🥫', '🍽️', '📊', '💼', '🏢', '🏬', '🎯', '📝', '📌', '🔖', '💰', '🤝', '👥', '🌟', '⭐', '✨', '🎉', '🎊', '📮', '📬', '📪', '📫', '🗂️', '📁'].map((icono, index) => (
                              <button
                                key={`${icono}-${index}`}
                                type="button"
                                onClick={() => setFormPrograma({ ...formPrograma, icono })}
                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-2xl transition-all hover:border-[#1E73BE] hover:bg-white ${
                                  formPrograma.icono === icono 
                                    ? 'border-[#1E73BE] bg-blue-50' 
                                    : 'border-[#E0E0E0] bg-white'
                                }`}
                              >
                                {icono}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('configuration.identificationColor')}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formPrograma.color || '#1E73BE'}
                          onChange={(e) => setFormPrograma({ ...formPrograma, color: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={formPrograma.color || ''}
                          onChange={(e) => setFormPrograma({ ...formPrograma, color: e.target.value })}
                          placeholder="#1E73BE"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('configuration.status')}</Label>
                      <Select value={formPrograma.activo ? 'activo' : 'inactivo'} onValueChange={(value: any) => setFormPrograma({ ...formPrograma, activo: value === 'activo' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">{t('configuration.active')}</SelectItem>
                          <SelectItem value="inactivo">{t('configuration.inactive')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => {
                        setProgramaDialogOpen(false);
                        resetFormPrograma();
                      }}>
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleGuardarPrograma} className="bg-[#4CAF50] hover:bg-[#45a049]">
                        <Save className="w-4 h-4 mr-2" />
                        {editandoPrograma ? t('common.update') : t('common.save')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programasEntrada.map(programa => (
                  <div key={programa.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl" 
                          style={{ backgroundColor: programa.color + '20' }}
                        >
                          {programa.icono || '📦'}
                        </div>
                        <div>
                          <h3 className="font-medium text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {programa.nombre} ({programa.codigo})
                          </h3>
                          <p className="text-sm text-[#666666] mb-2">{programa.descripcion}</p>
                          <div className="flex gap-2 items-center">
                            <Badge className={programa.activo ? 'bg-[#4CAF50] hover:bg-[#4CAF50]' : 'bg-[#DC3545] hover:bg-[#DC3545]'}>
                              {programa.activo ? t('configuration.active') : t('configuration.inactive')}
                            </Badge>
                            <span className="text-xs text-[#999999]">
                              Tipo de entrada: <code className="bg-gray-100 px-2 py-0.5 rounded">{programa.codigo.toLowerCase()}</code>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarPrograma(programa)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEliminarPrograma(programa.id)}
                          className="text-[#DC3545] border-[#DC3545] hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Productos PRS */}
        <TabsContent value="productos-prs" className="fade-in">
          <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/60 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-gray-200/50 pb-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#E91E63' }}>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Gestion des Produits PRS
                </CardTitle>
                <p className="text-sm text-gray-600 ml-14" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Gérez les produits du Programme de Récupération Spéciale (PRS)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="text-sm bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-300/50 px-4 py-2 rounded-full shadow-sm">
                  {productos.filter(p => p.esPRS === true).length} produits PRS
                </Badge>
                <Button 
                  onClick={() => {
                    resetFormProductoPRS();
                    setProductoPRSDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl" 
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Produit PRS
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E91E63] to-[#C2185B] flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#E91E63]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {productos.filter(p => p.esPRS === true).length}
                      </p>
                      <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Total Produits PRS
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] flex items-center justify-center">
                      <FolderTree className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#9C27B0]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {new Set(productos.filter(p => p.esPRS === true).map(p => p.categoria)).size}
                      </p>
                      <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Catégories utilisées
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2196F3] to-[#1976D2] flex items-center justify-center">
                      <PackageSearch className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#2196F3]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {productos.filter(p => p.esPRS === true).reduce((sum, p) => sum + (p.peso || 0), 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Total kg/unité
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de productos PRS */}
              <div className="space-y-3">
                {productos.filter(p => p.esPRS === true).length === 0 ? (
                  <div className="text-center py-12 bg-pink-50 border-2 border-dashed border-pink-200 rounded-xl">
                    <Package className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Aucun produit PRS créé
                    </h3>
                    <p className="text-sm text-[#666666] mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Les produits PRS se créent automatiquement lors de l'enregistrement d'une entrée dans le Programme PRS
                    </p>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      💡 Astuce: Allez dans "Entrée Don/Achat" et sélectionnez le programme "PRS"
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productos
                      .filter(p => p.esPRS === true)
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((producto) => (
                        <div 
                          key={producto.id} 
                          className="bg-white border-2 border-pink-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            {/* Icono del producto */}
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-pink-300 flex items-center justify-center shrink-0">
                              <span className="text-3xl">{producto.icono}</span>
                            </div>

                            {/* Información del producto */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      {producto.nombre}
                                    </h3>
                                    <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-300 shrink-0">
                                      PRS
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    📦 Code: <span className="font-semibold text-[#333333]">{producto.codigo}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Badges de información */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  📁 {producto.categoria}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  🏷️ {producto.subcategoria}
                                </Badge>
                                {producto.varianteNombre && (
                                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                    ✨ {producto.varianteNombre}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  ⚖️ {producto.peso} kg / {producto.unidad}
                                </Badge>
                                {producto.pesoUnitario && producto.pesoUnitario > 0 && (
                                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                    📏 Poids unitaire: {producto.pesoUnitario} kg
                                  </Badge>
                                )}
                              </div>

                              {/* Metadatos adicionales */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#999999]" />
                                  Créé le: {new Date(producto.fechaCreacion || Date.now()).toLocaleDateString('fr-FR')}
                                </div>
                                {producto.ubicacion && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#999999]" />
                                    {producto.ubicacion}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditarProductoPRS(producto)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Modifier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Copiar información del producto al portapapeles
                                  const info = `Produit PRS: ${producto.nombre}\nCode: ${producto.codigo}\nCatégorie: ${producto.categoria} → ${producto.subcategoria}\nPoids: ${producto.peso} kg/${producto.unidad}`;
                                  copiarAlPortapapeles(info);
                                  toast.success('✅ Information copiée au presse-papiers', { duration: 2000 });
                                }}
                                className="border-pink-300 text-pink-700 hover:bg-pink-50"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEliminarProductoPRS(producto.id, producto.nombre)}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#2196F3] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      À propos des Produits PRS
                    </h4>
                    <ul className="text-sm text-[#666666] space-y-1 list-disc pl-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <li>Les produits PRS sont créés automatiquement lors de l'enregistrement d'une entrée dans le Programme de Récupération Spéciale</li>
                      <li>Ces produits sont marqués avec l'attribut <code className="bg-pink-100 text-pink-700 px-1 rounded">esPRS: true</code></li>
                      <li>Ils peuvent être réutilisés pour de nouvelles entrées PRS via le sélecteur de produits</li>
                      <li>La suppression d'un produit PRS n'affecte pas les entrées d'inventaire existantes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dialog: Formulario de Producto PRS */}
        <Dialog open={productoPRSDialogOpen} onOpenChange={(open) => {
          setProductoPRSDialogOpen(open);
          if (!open) resetFormProductoPRS();
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="producto-prs-description">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                <div className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#E91E63]" />
                  {editandoProductoPRS ? 'Modifier le Produit PRS' : 'Nouveau Produit PRS'}
                </div>
              </DialogTitle>
              <DialogDescription id="producto-prs-description">
                {editandoProductoPRS 
                  ? 'Modifiez les informations du produit PRS' 
                  : 'Créez un nouveau produit pour le Programme de Récupération Spéciale'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Información sobre PRS */}
              <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#E91E63] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <strong className="text-[#E91E63]">Programme PRS:</strong> Les produits créés ici seront marqués comme produits du Programme de Récupération Spéciale et pourront être sélectionnés dans les entrées de dons/achats.
                  </p>
                </div>
              </div>

              {/* Campos del formulario en grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Código */}
                <div className="space-y-2">
                  <Label>
                    Code du produit <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: PRS-001"
                    value={formProductoPRS.codigo}
                    onChange={(e) => setFormProductoPRS({ ...formProductoPRS, codigo: e.target.value.toUpperCase() })}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label>
                    Nom du produit <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: Pommes Royal Gala"
                    value={formProductoPRS.nombre}
                    onChange={(e) => setFormProductoPRS({ ...formProductoPRS, nombre: e.target.value })}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label>
                    Catégorie <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formProductoPRS.categoria}
                    onValueChange={(value) => {
                      setFormProductoPRS({ 
                        ...formProductoPRS, 
                        categoria: value,
                        subcategoria: '', // Reset subcategoría
                        varianteId: '',
                        varianteNombre: ''
                      });
                    }}
                  >
                    <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.filter(c => c.activa).map((cat) => (
                        <SelectItem key={cat.id} value={cat.nombre}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icono}</span>
                            <span>{cat.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label>
                    Sous-catégorie <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formProductoPRS.subcategoria}
                    onValueChange={(value) => {
                      setFormProductoPRS({ 
                        ...formProductoPRS, 
                        subcategoria: value,
                        varianteId: '',
                        varianteNombre: ''
                      });
                    }}
                    disabled={!formProductoPRS.categoria}
                  >
                    <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <SelectValue placeholder="Sélectionner une sous-catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {formProductoPRS.categoria && 
                        categorias
                          .find(c => c.nombre === formProductoPRS.categoria)
                          ?.subcategorias.filter(s => s.activa)
                          ?.map((sub) => (
                            <SelectItem key={sub.id} value={sub.nombre}>
                              <div className="flex items-center gap-2">
                                <span>{sub.icono}</span>
                                <span>{sub.nombre}</span>
                              </div>
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* Variante (opcional) */}
                <div className="space-y-2">
                  <Label>
                    Variante (optionnel)
                  </Label>
                  <Select
                    value={formProductoPRS.varianteId}
                    onValueChange={(value) => {
                      const categoria = categorias.find(c => c.nombre === formProductoPRS.categoria);
                      const subcategoria = categoria?.subcategorias.find(s => s.nombre === formProductoPRS.subcategoria);
                      const variante = subcategoria?.variantes?.find(v => v.id === value);
                      
                      setFormProductoPRS({ 
                        ...formProductoPRS, 
                        varianteId: value,
                        varianteNombre: variante?.nombre || ''
                      });
                    }}
                    disabled={!formProductoPRS.subcategoria}
                  >
                    <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <SelectValue placeholder="Sélectionner une variante" />
                    </SelectTrigger>
                    <SelectContent>
                      {formProductoPRS.subcategoria && 
                        categorias
                          .find(c => c.nombre === formProductoPRS.categoria)
                          ?.subcategorias.find(s => s.nombre === formProductoPRS.subcategoria)
                          ?.variantes?.map((variante) => (
                            <SelectItem key={variante.id} value={variante.id}>
                              <div className="flex items-center gap-2">
                                <span>{variante.icono}</span>
                                <span>{variante.nombre}</span>
                              </div>
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* Unidad */}
                <div className="space-y-2">
                  <Label>
                    Unité <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formProductoPRS.unidad}
                    onValueChange={(value) => setFormProductoPRS({ ...formProductoPRS, unidad: value })}
                  >
                    <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((unidad) => (
                        <SelectItem key={unidad.id} value={unidad.abreviatura}>
                          <div className="flex items-center gap-2">
                            <span>{unidad.icono}</span>
                            <span>{unidad.nombre}</span>
                            <span className="text-xs text-gray-500">({unidad.abreviatura})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Peso por unidad */}
                <div className="space-y-2">
                  <Label>
                    Poids par unité (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 0.15"
                    value={formProductoPRS.peso || ''}
                    onChange={(e) => setFormProductoPRS({ ...formProductoPRS, peso: parseFloat(e.target.value) || 0 })}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <p className="text-xs text-[#666666]">
                    Le poids d'une seule unité de ce produit
                  </p>
                </div>

                {/* Peso unitario (opcional) */}
                <div className="space-y-2">
                  <Label>
                    Poids unitaire individuel (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 0.15"
                    value={formProductoPRS.pesoUnitario || ''}
                    onChange={(e) => setFormProductoPRS({ ...formProductoPRS, pesoUnitario: parseFloat(e.target.value) || 0 })}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <p className="text-xs text-[#666666]">
                    Pour calculer automatiquement les quantités
                  </p>
                </div>
              </div>

              {/* Icono y Ubicación */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icono */}
                <div className="space-y-2">
                  <Label>Icône</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg border-2 border-pink-200 flex items-center justify-center text-2xl bg-pink-50">
                      {formProductoPRS.icono || '📦'}
                    </div>
                    <Input
                      placeholder="Emoji"
                      value={formProductoPRS.icono}
                      onChange={(e) => setFormProductoPRS({ ...formProductoPRS, icono: e.target.value })}
                      maxLength={2}
                      className="flex-1"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>
                  {/* Selector visual de iconos */}
                  <div className="border-2 border-pink-200 rounded-lg p-3 bg-pink-50 max-h-32 overflow-y-auto">
                    <p className="text-xs text-[#666666] mb-2 font-medium">Sélectionner un icône:</p>
                    <div className="grid grid-cols-8 gap-2">
                      {['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍈', '🍏', '🥝', '🥭', '🍍', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🍄', '🥜', '🌰', '🍞', '🥖', '🥨', '🥯', '🧀', '🥚', '🍖', '🍗', '🥩', '🍤', '🐟', '🥫', '🍝', '🍚', '🧈', '🥛', '🧃', '☕', '🧊', '📦', '🎁'].map((icono, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormProductoPRS({ ...formProductoPRS, icono: icono })}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xl hover:bg-pink-200 transition-colors ${
                            formProductoPRS.icono === icono ? 'bg-pink-200 ring-2 ring-pink-500' : 'bg-white'
                          }`}
                        >
                          {icono}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label>Emplacement (optionnel)</Label>
                  <Input
                    placeholder="Ex: Allée A, Étagère 3"
                    value={formProductoPRS.ubicacion}
                    onChange={(e) => setFormProductoPRS({ ...formProductoPRS, ubicacion: e.target.value })}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <p className="text-xs text-[#666666]">
                    Localisation physique du produit dans l'entrepôt
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setProductoPRSDialogOpen(false);
                    resetFormProductoPRS();
                  }}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleGuardarProductoPRS}
                  className="bg-[#E91E63] hover:bg-[#C2185B]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editandoProductoPRS ? 'Mettre à jour' : 'Créer le produit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tab: Sauvegardes (Backups) */}
        <TabsContent value="sauvegardes" className="fade-in">
          <BackupManager />
        </TabsContent>

        {/* Tab: Unités */}
        <TabsContent value="unidades" className="fade-in">
          <GestionUnidades />
        </TabsContent>

        {/* Tab: Balance */}
        <TabsContent value="balance" className="fade-in">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                <div className="flex items-center gap-3">
                  <Scale className="w-6 h-6 text-[#1E73BE]" />
                  Configuration de Balance Électronique
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigurationBalance />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Adresses et Quartiers */}
        {esDesarrollador && (
          <TabsContent value="adresses" className="fade-in">
            <GestionAdressesQuartiers />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog Eliminar Categoría */}
      <Dialog open={dialogEliminarCategoria} onOpenChange={setDialogEliminarCategoria}>
        <DialogContent className="max-w-md" aria-describedby="eliminar-categoria-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', color: '#DC3545' }}>
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t('configuration.deleteCategory')}
              </div>
            </DialogTitle>
            <DialogDescription id="eliminar-categoria-description">
              Esta acción no se puede deshacer. Se eliminarán todas las subcategorías asociadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editandoCategoria && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: editandoCategoria.color + '20', fontSize: '1.5rem' }}
                    >
                      {editandoCategoria.icono}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {editandoCategoria.nombre}
                      </p>
                      <p className="text-sm text-[#666666] mt-1">
                        {editandoCategoria.descripcion}
                      </p>
                      <p className="text-xs text-[#999999] mt-1">
                        {editandoCategoria.subcategorias.length} {t('configuration.subcategories')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#856404] mb-2">⚠️ {t('common.warning')}:</p>
                  <ul className="text-sm text-[#856404] space-y-1 list-disc pl-5">
                    <li>{t('users.cannotUndo')}</li>
                    <li>{t('configuration.allSubcategoriesWillBeDeleted')}</li>
                    <li>{t('configuration.productsWillLoseCategory')}</li>
                  </ul>
                </div>

                <p className="text-sm text-[#666666]">
                  {t('configuration.deleteCategoryConfirm')} "{editandoCategoria.nombre}"?
                </p>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogEliminarCategoria(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleEliminarCategoria} 
                className="bg-[#DC3545] hover:bg-[#c82333]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('configuration.deleteCategory')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Subcategoría */}
      <Dialog open={dialogEliminarSubcategoria} onOpenChange={setDialogEliminarSubcategoria}>
        <DialogContent className="max-w-md" aria-describedby="eliminar-subcategoria-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', color: '#DC3545' }}>
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t('configuration.deleteSubcategory')}
              </div>
            </DialogTitle>
            <DialogDescription id="eliminar-subcategoria-description">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {subcategoriaParaEliminar && editandoCategoria && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="mb-3">
                    <Badge className="bg-[#1E73BE]">
                      {editandoCategoria.icono} {editandoCategoria.nombre}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {subcategoriaParaEliminar.icono && (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: editandoCategoria.color + '20', fontSize: '1.25rem' }}
                      >
                        {subcategoriaParaEliminar.icono}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {subcategoriaParaEliminar.nombre}
                      </p>
                      <p className="text-xs text-[#999999] mt-1">
                        {t('configuration.inheritedValue')}: ${(editandoCategoria?.valorMonetario || 0).toFixed(2)} / kg
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#856404] mb-2">⚠️ {t('common.warning')}:</p>
                  <ul className="text-sm text-[#856404] space-y-1 list-disc pl-5">
                    <li>{t('users.cannotUndo')}</li>
                    <li>{t('configuration.productsWillLoseSubcategory')}</li>
                  </ul>
                </div>

                <p className="text-sm text-[#666666]">
                  {t('configuration.deleteSubcategoryConfirm')} "{subcategoriaParaEliminar.nombre}"?
                </p>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogEliminarSubcategoria(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleEliminarSubcategoria} 
                className="bg-[#DC3545] hover:bg-[#c82333]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('configuration.deleteSubcategory')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Crear Variante */}
      <Dialog open={varianteDialogOpen} onOpenChange={setVarianteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="variante-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', color: '#1E73BE' }}>
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                {t('configuration.createVariant') || 'Crear Variante de Producto'}
              </div>
            </DialogTitle>
            <DialogDescription id="variante-description">
              {t('configuration.variantDescription') || 'Crea una variante basada en un producto existente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Producto Base */}
            {productoBase && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-[#1E73BE] mb-2">
                  📦 {t('configuration.baseProduct') || 'Producto Base'}:
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{productoBase.icono || '📦'}</div>
                  <div>
                    <p className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {productoBase.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {productoBase.codigo}
                      </Badge>
                      <span className="text-xs text-[#666666]">
                        {productoBase.categoria} - {productoBase.subcategoria}
                      </span>
                      <Badge variant="outline" className="text-xs bg-[#4CAF50] text-white border-[#4CAF50]">
                        📏 {productoBase.unidad}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="variantCodigo" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {t('common.code')} *
              </Label>
              <Input
                id="variantCodigo"
                value={formProducto.codigo}
                onChange={(e) => setFormProducto({ ...formProducto, codigo: e.target.value })}
                placeholder={t('configuration.enterCode') || 'Ej: PROD-VAR-001'}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="variantNombre" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {t('common.name')} *
              </Label>
              <Input
                id="variantNombre"
                value={formProducto.nombre}
                onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                placeholder={t('configuration.enterVariantName') || 'Ej: Manzanas Verdes (Variante)'}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>

            {/* Categoría y Subcategoría */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  {t('common.category')} *
                </Label>
                <Select
                  value={formProducto.categoria}
                  onValueChange={(value) => setFormProducto({ ...formProducto, categoria: value, subcategoria: '' })}
                >
                  <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <SelectValue placeholder={t('configuration.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasVisibles.filter(c => c.activa).map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.nombre}>
                        {categoria.icono} {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  {t('common.subcategory')} *
                </Label>
                <Select
                  value={formProducto.subcategoria}
                  onValueChange={(value) => setFormProducto({ ...formProducto, subcategoria: value })}
                  disabled={!formProducto.categoria}
                >
                  <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <SelectValue placeholder={t('configuration.selectSubcategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias
                      .find(c => c.nombre === formProducto.categoria)
                      ?.subcategorias?.map(sub => (
                        <SelectItem key={sub.id} value={sub.nombre}>
                          {sub.icono} {sub.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unidad */}
            <div className="space-y-2">
              <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                📏 {t('common.unit')} *
              </Label>
              <Select
                value={formProducto.unidad}
                onValueChange={(value) => setFormProducto({ ...formProducto, unidad: value })}
              >
                <SelectTrigger className="bg-purple-50 border-purple-300" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map(unidad => (
                    <SelectItem key={unidad.id} value={unidad.abreviatura}>
                      {unidad.icono && `${unidad.icono} `}{unidad.nombre} ({unidad.abreviatura})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-purple-600 flex items-center gap-1">
                ✏️ {t('configuration.variantUnitEditable') || 'Puedes elegir cualquier unidad para esta variante'}
              </p>
              {productoBase && productoBase.unidad === formProducto.unidad && (
                <p className="text-xs text-[#4CAF50] flex items-center gap-1">
                  ✓ {t('configuration.copiedFromBase') || 'Copiado del producto base'}
                </p>
              )}
            </div>

            {/* Icono */}
            <div className="space-y-2">
              <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {t('common.icon')}
              </Label>
              <Input
                value={formProducto.icono}
                onChange={(e) => setFormProducto({ ...formProducto, icono: e.target.value })}
                placeholder="📦"
                className="text-2xl text-center"
              />
            </div>

            {/* Stock y Ubicación */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  {t('inventory.currentStock')}
                </Label>
                <Input
                  type="number"
                  value={formProducto.stockActual}
                  onChange={(e) => setFormProducto({ ...formProducto, stockActual: parseFloat(e.target.value) || 0 })}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  {t('inventory.minStock')}
                </Label>
                <Input
                  type="number"
                  value={formProducto.stockMinimo}
                  onChange={(e) => setFormProducto({ ...formProducto, stockMinimo: parseFloat(e.target.value) || 0 })}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  {t('common.location')}
                </Label>
                <Input
                  value={formProducto.ubicacion}
                  onChange={(e) => setFormProducto({ ...formProducto, ubicacion: e.target.value })}
                  placeholder={t('configuration.locationPlaceholder') || 'Ej: A-12'}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
            </div>

            {/* Tipo de Producto */}
            <div className="space-y-2">
              <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {t('configuration.productType')}
              </Label>
              <Select
                value={formProducto.tipoProducto}
                onValueChange={(value: 'normal' | 'prs') => setFormProducto({ ...formProducto, tipoProducto: value })}
              >
                <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('configuration.normalProduct') || 'Producto Normal'}</SelectItem>
                  <SelectItem value="prs">{t('configuration.prsProduct') || 'Producto PRS'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setVarianteDialogOpen(false);
                resetFormProducto();
                setProductoBase(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleGuardarVariante}
              disabled={!formProducto.codigo || !formProducto.nombre || !formProducto.categoria || !formProducto.subcategoria}
              className="bg-[#1E73BE] hover:bg-[#1557a0] disabled:bg-gray-300"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Copy className="w-4 h-4 mr-2" />
              {t('configuration.createVariant') || 'Crear Variante'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Crear Variante desde Subcategoría */}
      <Dialog open={varianteSubcategoriaDialogOpen} onOpenChange={(open) => {
        setVarianteSubcategoriaDialogOpen(open);
        if (!open) {
          setEditandoVariante(null);
          setSubcategoriaBase(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="variante-subcategoria-description">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] flex items-center justify-center text-white text-2xl">
                ✨
              </div>
              <div>
                <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl">
                  {editandoVariante ? 'Editar Variante' : 'Nueva Variante de Subcategoría'}
                </DialogTitle>
                <DialogDescription id="variante-subcategoria-description" className="text-sm mt-1">
                  {editandoVariante ? 'Editando' : 'Creando'} variante para: <span className="font-medium text-[#9C27B0]">{subcategoriaBase?.subcategoria.nombre}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Sección: Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-5 bg-[#9C27B0] rounded-full"></div>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-sm text-[#333333]">
                  INFORMACIÓN BÁSICA
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-2 col-span-full">
                  <Label className="text-sm flex items-center gap-1">
                    Nombre de la Variante
                    <span className="text-[#DC3545]">*</span>
                  </Label>
                  <Input
                    value={formVarianteSubcategoria.nombre || ''}
                    onChange={(e) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, nombre: e.target.value })}
                    placeholder="Ej: Grande, 500ml, Marca Premium, Orgánico..."
                    className="h-11 text-base"
                  />
                </div>

                {/* Código */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <span className="text-[#666666]">📋</span> Código SKU
                    <span className="text-xs text-[#999999] font-normal">(opcional)</span>
                  </Label>
                  <Input
                    value={formVarianteSubcategoria.codigo || ''}
                    onChange={(e) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, codigo: e.target.value })}
                    placeholder="VAR-001"
                    className="h-11"
                  />
                </div>

                {/* Icono Visual */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('configuration.visualIcon')}</Label>
                  <button
                    type="button"
                    className="w-full h-11 px-4 border rounded-lg flex items-center gap-3 hover:border-[#9C27B0] transition-colors bg-white"
                    onClick={() => {
                      const iconPicker = document.getElementById('iconPickerVarianteConfig');
                      if (iconPicker) {
                        iconPicker.classList.toggle('hidden');
                      }
                    }}
                  >
                    <span className="text-2xl">{formVarianteSubcategoria.icono}</span>
                    <span className="text-sm text-[#666666]">{t('configuration.selectIcon2')}</span>
                  </button>
                </div>
              </div>

              {/* Selector de Icono Expandible */}
              <div id="iconPickerVarianteConfig" className="hidden p-4 bg-[#F4F4F4] rounded-lg border border-gray-200">
                <p className="text-xs text-[#666666] mb-3">Selecciona un icono para identificar esta variante:</p>
                <div className="grid grid-cols-10 md:grid-cols-12 gap-2">
                  {['📦', '🏷️', '⭐', '💎', '🎯', '🔵', '🟢', '🟡', '🟠', '🔴', '🟣', '🟤', '⚫', '⚪', '🔸', '🔹', '💠', '🎨', '✨', '🌟', '🍎', '🥕', '🥖', '🥛'].map((icono) => (
                    <button
                      key={icono}
                      type="button"
                      onClick={() => {
                        setFormVarianteSubcategoria({ ...formVarianteSubcategoria, icono });
                        document.getElementById('iconPickerVarianteConfig')?.classList.add('hidden');
                      }}
                      className={`p-2.5 text-xl border rounded-lg hover:scale-110 transition-transform ${
                        formVarianteSubcategoria.icono === icono 
                          ? 'border-[#9C27B0] bg-white shadow-md ring-2 ring-[#9C27B0] ring-opacity-30' 
                          : 'border-gray-300 bg-white hover:border-[#9C27B0]'
                      }`}
                    >
                      {icono}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sección: Especificaciones Técnicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-5 bg-[#1E73BE] rounded-full"></div>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-sm text-[#333333]">
                  ESPECIFICACIONES TÉCNICAS
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Unidad */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <span>📏</span> Unidad
                  </Label>
                  <Select 
                    value={formVarianteSubcategoria.unidad} 
                    onValueChange={(value) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, unidad: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={`Usar unidad de subcategoría (${subcategoriaBase?.subcategoria.unidad || 'No definida'})`} />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesDinamicas.map((unidad) => (
                        <SelectItem key={unidad.id} value={unidad.nombre}>
                          {unidad.icono} {unidad.nombre} ({unidad.abreviatura})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                    {formVarianteSubcategoria.unidad ? `Unidad específica: ${formVarianteSubcategoria.unidad}` : `Se usará la unidad de la subcategoría: ${subcategoriaBase?.subcategoria.unidad || 'No definida'}`}
                  </p>
                </div>

                {/* Peso Unitario */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <span>⚖️</span> Peso Unitario (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formVarianteSubcategoria.pesoUnitario}
                    onChange={(e) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, pesoUnitario: e.target.value })}
                    placeholder="0.00"
                    className="h-11"
                  />
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                    Dejar vacío para heredar
                  </p>
                </div>

                {/* Valor por Kg */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <span>💰</span> Valor por Kg ($)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formVarianteSubcategoria.valorPorKg}
                    onChange={(e) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, valorPorKg: e.target.value })}
                    placeholder="0.00"
                    className="h-11"
                  />
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                    Dejar vacío para heredar
                  </p>
                </div>

                {/* Stock Mínimo */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <span>📊</span> Stock Mínimo
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formVarianteSubcategoria.stockMinimo === 0 ? '' : formVarianteSubcategoria.stockMinimo}
                    onChange={(e) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, stockMinimo: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                    placeholder="10"
                    className="h-11"
                  />
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                    Alerta cuando el stock esté por debajo de este valor
                  </p>
                </div>
              </div>
            </div>

            {/* Sección: Información Adicional */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-5 bg-[#4CAF50] rounded-full"></div>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-sm text-[#333333]">
                  INFORMACIÓN ADICIONAL
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <span>📝</span> Descripción
                  <span className="text-xs text-[#999999] font-normal">(opcional)</span>
                </Label>
                <Input
                  value={formVarianteSubcategoria.descripcion}
                  onChange={(e) => setFormVarianteSubcategoria({ ...formVarianteSubcategoria, descripcion: e.target.value })}
                  placeholder="Información adicional sobre esta variante..."
                  className="h-11"
                />
              </div>
            </div>

            {/* Vista Previa Mejorada */}
            <div className="p-5 bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-xl border-2 border-[#9C27B0] border-opacity-20 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-[#9C27B0] uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  👁️ Vista Previa
                </p>
                <Badge variant="outline" className="text-xs bg-white">En Vivo</Badge>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                {/* Icono */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] flex items-center justify-center text-3xl shadow-md">
                  {formVarianteSubcategoria.icono}
                </div>
                
                {/* Información */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-lg text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {formVarianteSubcategoria.nombre || 'Nombre de la variante'}
                    </h4>
                    {formVarianteSubcategoria.codigo && (
                      <Badge variant="outline" className="text-xs bg-[#F4F4F4]">
                        {formVarianteSubcategoria.codigo}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-[#666666] mt-1 flex items-center gap-1">
                    <span className="text-[#9C27B0]">↳</span>
                    {subcategoriaBase?.subcategoria.nombre}
                  </p>
                  
                  {formVarianteSubcategoria.descripcion && (
                    <p className="text-xs text-[#666666] mt-2 italic">
                      "{formVarianteSubcategoria.descripcion}"
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {formVarianteSubcategoria.unidad && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F4] rounded-lg">
                        <span className="text-sm">📏</span>
                        <span className="text-sm font-medium">{formVarianteSubcategoria.unidad}</span>
                      </div>
                    )}
                    {formVarianteSubcategoria.pesoUnitario && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F4] rounded-lg">
                        <span className="text-sm">⚖️</span>
                        <span className="text-sm font-medium">{formVarianteSubcategoria.pesoUnitario} kg</span>
                      </div>
                    )}
                    {formVarianteSubcategoria.valorPorKg && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F4] rounded-lg">
                        <span className="text-sm">💰</span>
                        <span className="text-sm font-medium">${formVarianteSubcategoria.valorPorKg}/kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t">
            <p className="text-xs text-[#666666]">
              <span className="text-[#DC3545]">*</span> Campos obligatorios
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setVarianteSubcategoriaDialogOpen(false);
                  setFormVarianteSubcategoria({
                    nombre: '',
                    codigo: '',
                    icono: '📦',
                    pesoUnitario: '',
                    valorPorKg: '',
                    descripcion: '',
                    unidad: ''
                  });
                  setSubcategoriaBase(null);
                  setEditandoVariante(null);
                }}
                className="h-11 px-6"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarVarianteSubcategoria}
                className="h-11 px-6 bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] hover:from-[#7B1FA2] hover:to-[#6A1B9A] text-white shadow-md"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <Save className="w-4 h-4 mr-2" />
                {editandoVariante ? 'Actualizar Variante' : 'Crear Variante'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
