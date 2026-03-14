// 🆕 FORMULARIO DE ENTRADA DON/ACHAT - VERSIÓN OPTIMIZADA Y FUNCIONAL
// Completamente reescrito para máxima funcionalidad y claridad
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Gift, Package, Building2, Plus, Check, ChevronsUpDown, Save, X, 
  Thermometer, Snowflake, Wind, ChevronDown, ChevronUp, Settings, 
  Package2, Printer, AlertTriangle, Info, Search, Trash2
} from 'lucide-react';
import { printStandardLabel, type ProductLabelData } from './etiquetas/StandardProductLabel';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { toast } from 'sonner';
import { cn } from './ui/utils';
import { obtenerProductosActivos, guardarProducto, type ProductoCreado } from '../utils/productStorage';
import { guardarEntrada } from '../utils/entradaInventarioStorage';
import { type Categoria } from '../data/configuracionData';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { filterByThreeLetters } from '../utils/searchUtils';
import { generarIconoAutomatico } from '../utils/iconoUtils';
import { 
  actualizarPesoUnitarioSubcategoria, 
  actualizarPesoUnitarioVariante, 
  obtenerCategorias, 
  obtenerPesoUnitario, 
  obtenerPesoPorUnidad, 
  agregarSubcategoria, 
  guardarCategorias 
} from '../utils/categoriaStorage';
import { obtenerUnidades, type Unidad } from '../utils/unidadStorage';
import { type Variante } from '../data/configuracionData';
import { 
  obtenerContactosDepartamento, 
  type ContactoDepartamento, 
  sincronizarDonateursFournisseurs 
} from '../utils/contactosDepartamentoStorage';
import { 
  debeRegistrarPaletasIndividuales, 
  registrarPaletasIndividuales, 
  type DatosEntradaPaleta 
} from '../utils/paletaStorage';

// ==================== TIPOS ====================
type TipoTemperatura = 'ambiente' | 'refrigerado' | 'congelado' | '';

interface FormDataDonAchat {
  tipoEntrada: string;
  donadorId: string;
  participantePRSId?: string;
  productoId: string;
  nombreProducto: string;
  productoCustom: string;
  categoria: string;
  subcategoria: string;
  varianteId?: string;
  productoIcono?: string;
  cantidad: number;
  unidad: string;
  peso: number;
  temperatura: TipoTemperatura;
  fechaCaducidad: string;
  lote: string;
  detallesEmpaque: string;
  observaciones: string;
}

interface ProductoAgregado {
  nombreProducto: string;
  productoIcono: string;
  cantidad: number;
  unidad: string;
  pesoTotal: number;
  temperatura: string;
  categoria?: string;
  subcategoria?: string;
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string;
}

interface FormSubcategoria {
  codigo: string;
  nombre: string;
  unidad: string;
  stockMinimo: number;
  icono: string;
  pesoUnitario: number;
  pesoPLT: number;
  pesoCJA: number;
  pesoUND: number;
  pesoSAC: number;
  pesoBN: number;
  pesoKg: number;
  descripcion: string;
}

interface FormVariante {
  nombre: string;
  codigo: string;
  icono: string;
  unidad: string;
  valorPorKg: string;
  pesoUnitario: string;
  descripcion: string;
}

// ==================== DATOS INICIALES ====================
const FORM_DATA_INICIAL: FormDataDonAchat = {
  tipoEntrada: '',
  donadorId: '',
  participantePRSId: '',
  productoId: '',
  nombreProducto: '',
  productoCustom: '',
  categoria: '',
  subcategoria: '',
  productoIcono: '',
  cantidad: 0,
  unidad: '',
  peso: 0,
  temperatura: '',
  fechaCaducidad: '',
  lote: '',
  detallesEmpaque: '',
  observaciones: '',
};

const FORM_SUBCATEGORIA_INICIAL: FormSubcategoria = {
  codigo: '',
  nombre: '',
  unidad: '',
  stockMinimo: 0,
  icono: '',
  pesoUnitario: 0,
  pesoPLT: 0,
  pesoCJA: 0,
  pesoUND: 0,
  pesoSAC: 0,
  pesoBN: 0,
  pesoKg: 0,
  descripcion: ''
};

const FORM_VARIANTE_INICIAL: FormVariante = {
  nombre: '',
  codigo: '',
  icono: '📦',
  unidad: '',
  valorPorKg: '',
  pesoUnitario: '',
  descripcion: ''
};

// ==================== COMPONENTE PRINCIPAL ====================
export function EntradaDonAchat() {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  
  // ========== Estados principales ==========
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormDataDonAchat>(FORM_DATA_INICIAL);
  const [productosAgregados, setProductosAgregados] = useState<ProductoAgregado[]>([]);
  
  // ========== Estados de datos ==========
  const [productosDB, setProductosDB] = useState<ProductoCreado[]>([]);
  const [categoriasDB, setCategoriasDB] = useState<Categoria[]>([]);
  const [programasDB, setProgramasDB] = useState<ProgramaEntrada[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [contactosAlmacen, setContactosAlmacen] = useState<ContactoDepartamento[]>([]);
  
  // ========== Estados de UI ==========
  const [comboboxProductoOpen, setComboboxProductoOpen] = useState(false);
  const [searchProductoQuery, setSearchProductoQuery] = useState('');
  const [selectContactoOpen, setSelectContactoOpen] = useState(false);
  const [searchContactoQuery, setSearchContactoQuery] = useState('');
  const [calcularPesoAuto, setCalcularPesoAuto] = useState(false);
  const [detallesOpcionalesAbiertos, setDetallesOpcionalesAbiertos] = useState(false);
  const [imprimirAutomaticamente, setImprimirAutomaticamente] = useState(true);
  
  // ========== Estados de diálogos ==========
  const [subcategoriaDialogOpen, setSubcategoriaDialogOpen] = useState(false);
  const [nuevaSubcategoriaDialogOpen, setNuevaSubcategoriaDialogOpen] = useState(false);
  const [nuevaVarianteDialogOpen, setNuevaVarianteDialogOpen] = useState(false);
  const [ayudaImpresionOpen, setAyudaImpresionOpen] = useState(false);
  
  // ========== Estados de formularios secundarios ==========
  const [formSubcategoria, setFormSubcategoria] = useState<FormSubcategoria>(FORM_SUBCATEGORIA_INICIAL);
  const [formVariante, setFormVariante] = useState<FormVariante>(FORM_VARIANTE_INICIAL);
  const [categoriaSeleccionadaParaNueva, setCategoriaSeleccionadaParaNueva] = useState('');
  const [categoriaBase, setCategoriaBase] = useState<Categoria | null>(null);

  // ==================== CARGA DE DATOS INICIAL ====================
  useEffect(() => {
    if (open) {
      console.log('🚪 Diálogo abierto - Cargando datos...');
      cargarDatosIniciales();
    } else {
      // Limpiar al cerrar
      setProductosAgregados([]);
    }
  }, [open]);

  const cargarDatosIniciales = useCallback(() => {
    try {
      // 1. Sincronizar donateurs/fournisseurs
      const resultado = sincronizarDonateursFournisseurs();
      console.log(`✅ Sincronización: ${resultado.sincronizados} donateurs/fournisseurs`);
      
      // 2. Cargar productos
      const productosActivos = obtenerProductosActivos();
      setProductosDB(productosActivos);
      console.log(`📦 ${productosActivos.length} productos cargados`);
      
      // 3. Cargar categorías
      const categoriasGuardadas = obtenerCategorias();
      setCategoriasDB(categoriasGuardadas);
      console.log(`🏷️ ${categoriasGuardadas.length} categorías cargadas`);
      
      // 4. Cargar programas
      const programasActivos = obtenerProgramasActivos();
      setProgramasDB(programasActivos);
      console.log(`🎯 ${programasActivos.length} programas cargados`);
      
      // 5. Cargar unidades
      const unidadesCargadas = obtenerUnidades();
      setUnidades(unidadesCargadas);
      console.log(`📏 ${unidadesCargadas.length} unidades cargadas`);
      
      // 6. Cargar contactos donadores/fournisseurs
      const todosContactos = obtenerContactosDepartamento();
      const contactosFiltrados = todosContactos.filter(c => 
        (c.isDonateur || c.isFournisseur || c.participaPRS) && c.activo
      );
      setContactosAlmacen(contactosFiltrados);
      console.log(`👥 ${contactosFiltrados.length} contactos cargados`);
      
      // 7. Cargar programa predeterminado
      const programaPredeterminado = localStorage.getItem('programaPredeterminado');
      if (programaPredeterminado) {
        setFormData(prev => ({ ...prev, tipoEntrada: programaPredeterminado }));
      }
      
      console.log('✅ Carga de datos completada');
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      toast.error('Error al cargar los datos del sistema');
    }
  }, []);

  // ==================== LISTENERS DE EVENTOS ====================
  useEffect(() => {
    const handleContactosActualizados = () => {
      console.log('🔄 Contactos actualizados');
      const todosContactos = obtenerContactosDepartamento();
      const contactosFiltrados = todosContactos.filter(c => 
        (c.isDonateur || c.isFournisseur || c.participaPRS) && c.activo
      );
      setContactosAlmacen(contactosFiltrados);
    };

    const handleProductosActualizados = () => {
      console.log('🔄 Productos actualizados');
      const productosActivos = obtenerProductosActivos();
      setProductosDB(productosActivos);
    };

    const handleUnidadesActualizadas = () => {
      console.log('🔄 Unidades actualizadas');
      const unidadesCargadas = obtenerUnidades();
      setUnidades(unidadesCargadas);
    };

    const handleProgramasActualizados = () => {
      console.log('🔄 Programas de entrada actualizados');
      const programasActivos = obtenerProgramasActivos();
      setProgramasDB(programasActivos);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contactos_departamentos' || e.key === null) {
        handleContactosActualizados();
      }
      if (e.key === 'banco_alimentos_productos' || e.key === null) {
        handleProductosActualizados();
      }
      if (e.key === 'bancoAlimentos_programasEntrada' || e.key === null) {
        handleProgramasActualizados();
      }
    };

    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    window.addEventListener('productos-actualizados', handleProductosActualizados);
    window.addEventListener('unidadesActualizadas', handleUnidadesActualizadas);
    window.addEventListener('programas-actualizados', handleProgramasActualizados);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('productos-actualizados', handleProductosActualizados);
      window.removeEventListener('unidadesActualizadas', handleUnidadesActualizadas);
      window.removeEventListener('programas-actualizados', handleProgramasActualizados);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ==================== EFECTOS DE SINCRONIZACIÓN ====================
  
  // Limpiar productos agregados cuando cambia el donador
  useEffect(() => {
    setProductosAgregados([]);
  }, [formData.donadorId]);

  // Limpiar producto seleccionado cuando cambia el programa
  useEffect(() => {
    if (formData.productoId) {
      const productoActual = productosDB.find(p => p.id === formData.productoId);
      const esProgramaPRS = formData.tipoEntrada === 'prs';
      
      if (productoActual) {
        const esProductoPRS = productoActual.esPRS === true;
        if (esProgramaPRS !== esProductoPRS) {
          setFormData(prev => ({
            ...prev,
            productoId: '',
            nombreProducto: '',
            productoCustom: '',
            productoIcono: '',
            categoria: '',
            subcategoria: '',
            varianteId: undefined
          }));
          toast.info(
            esProgramaPRS 
              ? '💡 Programme PRS sélectionné - Seuls les produits PRS sont disponibles'
              : '💡 Programme changé - Seuls les produits non-PRS sont disponibles',
            { duration: 4000 }
          );
        }
      }
    }
  }, [formData.tipoEntrada, formData.productoId, productosDB]);

  // Calcular peso automáticamente
  useEffect(() => {
    if (calcularPesoAuto && formData.cantidad > 0 && formData.unidad) {
      calcularPesoTotal();
    }
  }, [formData.cantidad, formData.unidad, calcularPesoAuto]);

  // ==================== DATOS COMPUTADOS ====================
  
  const programasActivos = useMemo(() => programasDB, [programasDB]);
  
  const programaSeleccionado = useMemo(() => 
    programasActivos.find(p => p.codigo.toLowerCase() === formData.tipoEntrada),
    [programasActivos, formData.tipoEntrada]
  );

  const contactosDisponibles = useMemo(() => {
    if (!formData.tipoEntrada) return [];
    
    const programa = formData.tipoEntrada.toLowerCase();
    
    // 🎯 FILTRADO POR PROGRAMA:
    // DON = Solo donadores EXCLUSIVOS
    // ACHAT = Solo proveedores EXCLUSIVOS (que NO sean donadores)
    // PRS = Solo participantes PRS
    // OCC = TODOS los proveedores (exclusivos + duales)
    
    switch (programa) {
      case 'don':
        // Mostrar solo donadores (que NO sean proveedores)
        return contactosAlmacen.filter(c => 
          c.isDonateur === true && c.isFournisseur !== true
        );
        
      case 'achat':
        // Mostrar solo proveedores EXCLUSIVOS (que NO sean donadores)
        return contactosAlmacen.filter(c => 
          c.isFournisseur === true && c.isDonateur !== true
        );
        
      case 'prs':
        // Mostrar solo participantes PRS
        return contactosAlmacen.filter(c => 
          c.participaPRS === true
        );
        
      case 'occ':
        // Mostrar TODOS los proveedores (exclusivos + duales)
        return contactosAlmacen.filter(c => 
          c.isFournisseur === true
        );
        
      default:
        // Para cualquier otro programa, mostrar donadores
        return contactosAlmacen.filter(c => 
          c.isDonateur === true
        );
    }
  }, [contactosAlmacen, formData.tipoEntrada]);

  const contactosFiltrados = useMemo(() => {
    if (!searchContactoQuery || searchContactoQuery.length < 3) {
      return contactosDisponibles;
    }
    return filterByThreeLetters(searchContactoQuery, contactosDisponibles, [
      'nombre', 
      'apellido', 
      'nombreEmpresa', 
      'telefono', 
      'email', 
      'direccion',
      'notas'
    ]);
  }, [searchContactoQuery, contactosDisponibles]);

  const productosFiltrados = useMemo(() => {
    const esProgramaPRS = formData.tipoEntrada === 'prs';
    let productos = productosDB.filter(p => {
      const esProductoPRS = p.esPRS === true;
      return esProgramaPRS ? esProductoPRS : !esProductoPRS;
    });

    if (searchProductoQuery && searchProductoQuery.length >= 3) {
      productos = filterByThreeLetters(searchProductoQuery, productos, ['nombre', 'codigo']);
    }

    return productos;
  }, [productosDB, formData.tipoEntrada, searchProductoQuery]);

  const categoriaSeleccionada = useMemo(() => 
    categoriasDB.find(c => c.codigo === formData.categoria),
    [categoriasDB, formData.categoria]
  );

  const subcategoriaSeleccionada = useMemo(() => 
    categoriaSeleccionada?.subcategorias?.find(s => s.codigo === formData.subcategoria),
    [categoriaSeleccionada, formData.subcategoria]
  );

  const varianteSeleccionada = useMemo(() => 
    subcategoriaSeleccionada?.variantes?.find(v => v.id === formData.varianteId),
    [subcategoriaSeleccionada, formData.varianteId]
  );

  // ==================== FUNCIONES DE CÁLCULO ====================
  
  const calcularPesoTotal = useCallback(() => {
    if (!formData.unidad || formData.cantidad <= 0) {
      setFormData(prev => ({ ...prev, peso: 0 }));
      return;
    }

    let pesoCalculado = 0;

    // Si hay variante seleccionada, usar su peso
    if (varianteSeleccionada?.pesoUnitario) {
      pesoCalculado = formData.cantidad * varianteSeleccionada.pesoUnitario;
    }
    // Si no hay variante pero hay subcategoría, usar su peso
    else if (subcategoriaSeleccionada) {
      const pesoUnitario = obtenerPesoPorUnidad(subcategoriaSeleccionada, formData.unidad);
      pesoCalculado = formData.cantidad * (pesoUnitario || 0);
    }

    setFormData(prev => ({ ...prev, peso: parseFloat(pesoCalculado.toFixed(3)) }));
  }, [formData.cantidad, formData.unidad, varianteSeleccionada, subcategoriaSeleccionada]);

  // ==================== FUNCIONES HELPER ====================
  
  const obtenerTipoContactoBadge = (contacto: ContactoDepartamento) => {
    const esAmbos = (contacto.isDonateur || contacto.tipo === 'donador') && 
                    (contacto.isFournisseur || contacto.tipo === 'fournisseur');
    const esPRS = contacto.participaPRS;
    
    if (esAmbos) {
      return { label: 'Donateur/Fournisseur', color: '#9333ea', bgColor: '#9333ea20' }; // Púrpura
    } else if (esPRS) {
      return { label: 'PRS', color: '#f59e0b', bgColor: '#f59e0b20' }; // Naranja
    } else if (contacto.isFournisseur || contacto.tipo === 'fournisseur') {
      return { label: 'Fournisseur', color: '#1a4d7a', bgColor: '#1a4d7a20' }; // Azul
    } else {
      return { label: 'Donateur', color: '#2d9561', bgColor: '#2d956120' }; // Verde
    }
  };
  
  // ==================== HANDLERS ====================
  
  const handleFieldChange = useCallback((field: keyof FormDataDonAchat, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProductoSelect = useCallback((productoId: string) => {
    const producto = productosDB.find(p => p.id === productoId);
    if (!producto) return;

    const nuevaCategoria = producto.categoria || '';
    const nuevaSubcategoria = producto.subcategoria || '';
    const categoriaEncontrada = categoriasDB.find(c => c.codigo === nuevaCategoria);
    const subcategoriaEncontrada = categoriaEncontrada?.subcategorias?.find(
      s => s.codigo === nuevaSubcategoria
    );

    setFormData(prev => ({
      ...prev,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      productoIcono: producto.icono || '📦',
      categoria: nuevaCategoria,
      subcategoria: nuevaSubcategoria,
      varianteId: undefined,
      unidad: producto.unidad || subcategoriaEncontrada?.unidad || '',
      temperatura: producto.temperatura || '',
    }));

    setComboboxProductoOpen(false);
    toast.success(`Produit sélectionné: ${producto.nombre}`);
  }, [productosDB, categoriasDB]);

  const handleContactoSelect = useCallback((contactoId: string) => {
    const contacto = contactosDisponibles.find(c => c.id === contactoId);
    if (!contacto) return;

    setFormData(prev => ({
      ...prev,
      donadorId: contactoId,
    }));

    setSelectContactoOpen(false);
    toast.success(`Contact sélectionné: ${contacto.nombre} ${contacto.apellido}`);
  }, [contactosDisponibles]);

  const handleCategoriaChange = useCallback((categoriaId: string) => {
    setFormData(prev => ({
      ...prev,
      categoria: categoriaId,
      subcategoria: '',
      varianteId: undefined,
      unidad: '',
    }));
  }, []);

  const handleSubcategoriaChange = useCallback((subcategoriaId: string) => {
    const categoria = categoriasDB.find(c => c.codigo === formData.categoria);
    const subcategoria = categoria?.subcategorias?.find(s => s.codigo === subcategoriaId);

    setFormData(prev => ({
      ...prev,
      subcategoria: subcategoriaId,
      varianteId: undefined,
      unidad: subcategoria?.unidad || prev.unidad,
    }));

    if (calcularPesoAuto && formData.cantidad > 0) {
      setTimeout(calcularPesoTotal, 100);
    }
  }, [categoriasDB, formData.categoria, formData.cantidad, calcularPesoAuto, calcularPesoTotal]);

  const handleVarianteChange = useCallback((varianteId: string) => {
    setFormData(prev => ({ ...prev, varianteId }));

    if (calcularPesoAuto && formData.cantidad > 0) {
      setTimeout(calcularPesoTotal, 100);
    }
  }, [formData.cantidad, calcularPesoAuto, calcularPesoTotal]);

  const agregarProductoALista = useCallback(async () => {
    // Validaciones
    if (!formData.tipoEntrada) {
      toast.error("Sélectionnez un type d'entrée");
      return;
    }

    if (!formData.donadorId) {
      toast.error("Sélectionnez un donateur/fournisseur");
      return;
    }

    if (!formData.nombreProducto && !formData.productoCustom) {
      toast.error("Le nom du produit est requis");
      return;
    }

    if (formData.cantidad <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return;
    }

    if (!formData.unidad) {
      toast.error("L'unité est requise");
      return;
    }

    if (!formData.temperatura) {
      toast.error("La température est requise");
      return;
    }

    try {
      const nombreFinal = formData.nombreProducto || formData.productoCustom;
      const iconoFinal = formData.productoIcono || generarIconoAutomatico(formData.categoria);

      // Agregar a la lista de productos
      const nuevoProducto: ProductoAgregado = {
        nombreProducto: nombreFinal,
        productoIcono: iconoFinal,
        cantidad: formData.cantidad,
        unidad: formData.unidad,
        pesoTotal: formData.peso,
        temperatura: formData.temperatura,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        lote: formData.lote,
        fechaCaducidad: formData.fechaCaducidad,
        detallesEmpaque: formData.detallesEmpaque,
      };

      setProductosAgregados(prev => [...prev, nuevoProducto]);

      // Si está activa la impresión automática, imprimir etiqueta
      if (imprimirAutomaticamente) {
        await imprimirEtiquetaProducto(nuevoProducto);
      }

      // Limpiar campos del producto
      setFormData(prev => ({
        ...prev,
        productoId: '',
        nombreProducto: '',
        productoCustom: '',
        productoIcono: '',
        categoria: '',
        subcategoria: '',
        varianteId: undefined,
        cantidad: 0,
        unidad: '',
        peso: 0,
        fechaCaducidad: '',
        lote: '',
        detallesEmpaque: '',
        observaciones: '',
      }));

      setSearchProductoQuery('');
      toast.success(`✅ Produit ajouté: ${nombreFinal}`);
    } catch (error) {
      console.error('Error agregando producto:', error);
      toast.error("Erreur lors de l'ajout du produit");
    }
  }, [formData, imprimirAutomaticamente]);

  const imprimirEtiquetaProducto = async (producto: ProductoAgregado) => {
    try {
      const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
      if (!contacto) return;

      const labelData: ProductLabelData = {
        productName: producto.nombreProducto,
        productIcon: producto.productoIcono,
        quantity: producto.cantidad,
        unit: producto.unidad,
        weight: producto.pesoTotal,
        temperature: producto.temperatura as 'ambient' | 'refrigerated' | 'frozen',
        donor: `${contacto.nombre} ${contacto.apellido}`,
        entryDate: new Date().toISOString(),
        lotNumber: producto.lote,
        expiryDate: producto.fechaCaducidad,
        packagingDetails: producto.detallesEmpaque,
      };

      await printStandardLabel(labelData);
      console.log('✅ Étiquette imprimée');
    } catch (error) {
      console.error('Erreur impression:', error);
      toast.error("Erreur lors de l'impression de l'étiquette");
    }
  };

  const finalizarEntrada = useCallback(async () => {
    if (productosAgregados.length === 0) {
      toast.error("Ajoutez au moins un produit avant de finaliser");
      return;
    }

    try {
      const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
      if (!contacto) {
        toast.error("Contact introuvable");
        return;
      }

      // Guardar cada producto en el inventario
      for (const prod of productosAgregados) {
        const productoData: ProductoCreado = {
          id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nombre: prod.nombreProducto,
          codigo: `P${Date.now()}`,
          icono: prod.productoIcono,
          categoria: prod.categoria || '',
          subcategoria: prod.subcategoria || '',
          cantidad: prod.cantidad,
          unidad: prod.unidad,
          peso: prod.pesoTotal,
          pesoUnitario: prod.cantidad > 0 ? prod.pesoTotal / prod.cantidad : 0,
          temperatura: prod.temperatura as any,
          stockMinimo: 0,
          stockMaximo: 1000,
          valorMonetario: 0,
          ubicacion: '',
          lote: prod.lote,
          fechaCaducidad: prod.fechaCaducidad,
          observaciones: formData.observaciones,
          activo: true,
          esPRS: formData.tipoEntrada === 'prs',
          fechaCreacion: new Date().toISOString(),
        };

        guardarProducto(productoData);

        // Registrar entrada en historial
        guardarEntrada({
          id: `ENTR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fecha: new Date().toISOString(),
          tipo: formData.tipoEntrada === 'achat' ? 'achat' : 'donation',
          donadorId: formData.donadorId,
          donadorNombre: `${contacto.nombre} ${contacto.apellido}`,
          productoId: productoData.id,
          productoNombre: prod.nombreProducto,
          categoria: prod.categoria || '',
          subcategoria: prod.subcategoria || '',
          cantidad: prod.cantidad,
          unidad: prod.unidad,
          pesoTotal: prod.pesoTotal,
          temperatura: prod.temperatura,
          lote: prod.lote,
          fechaCaducidad: prod.fechaCaducidad,
          detallesEmpaque: prod.detallesEmpaque,
          observaciones: formData.observaciones,
        });
      }

      // Manejar paletas si aplica
      if (debeRegistrarPaletasIndividuales(productosAgregados)) {
        const datosPaletas: DatosEntradaPaleta = {
          donadorId: formData.donadorId,
          donadorNombre: `${contacto.nombre} ${contacto.apellido}`,
          tipoEntrada: formData.tipoEntrada === 'achat' ? 'achat' : 'donation',
          productos: productosAgregados.map(p => ({
            nombreProducto: p.nombreProducto,
            cantidad: p.cantidad,
            unidad: p.unidad,
            pesoTotal: p.pesoTotal,
          })),
        };
        registrarPaletasIndividuales(datosPaletas);
      }

      toast.success(`✅ ${productosAgregados.length} produit(s) enregistré(s) avec succès!`);
      
      // Disparar evento de actualización
      window.dispatchEvent(new Event('productos-actualizados'));

      // Resetear formulario
      setFormData(FORM_DATA_INICIAL);
      setProductosAgregados([]);
      setOpen(false);
    } catch (error) {
      console.error('Error finalizando entrada:', error);
      toast.error("Erreur lors de la finalisation de l'entrée");
    }
  }, [productosAgregados, formData, contactosDisponibles]);

  const eliminarProductoAgregado = useCallback((index: number) => {
    setProductosAgregados(prev => prev.filter((_, i) => i !== index));
    toast.info('Produit retiré de la liste');
  }, []);

  // ==================== RENDER ====================
  
  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'ambiente': return <Wind className="w-4 h-4" />;
      case 'refrigerado': return <Thermometer className="w-4 h-4" />;
      case 'congelado': return <Snowflake className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'ambiente': return 'bg-amber-100 text-amber-700';
      case 'refrigerado': return 'bg-blue-100 text-blue-700';
      case 'congelado': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#2d9561] hover:bg-[#267d50] text-white shadow-md"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Entrée
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            📦 Enregistrer Entrée Don/Achat
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le type d'entrée et ajoutez les produits à enregistrer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SECTION 1: Type d'entrée - DINÁMICO desde configuración */}
          <div className="space-y-3">
            <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Type d'Entrée *
            </Label>
            
            {programasActivos.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Aucun programme d'entrée configuré</p>
                  <p className="text-sm">Créez des programmes d'entrée dans Configuration</p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "grid gap-3",
                programasActivos.length === 1 ? "grid-cols-1" :
                programasActivos.length === 2 ? "grid-cols-2" :
                programasActivos.length === 3 ? "grid-cols-3" :
                "grid-cols-2 lg:grid-cols-3"
              )}>
                {programasActivos.map((programa) => (
                  <button
                    key={programa.id}
                    type="button"
                    onClick={() => handleFieldChange('tipoEntrada', programa.codigo.toLowerCase())}
                    className={cn(
                      "p-4 border-2 rounded-lg transition-all hover:shadow-md text-left",
                      formData.tipoEntrada === programa.codigo.toLowerCase()
                        ? "border-current bg-opacity-10"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{
                      borderColor: formData.tipoEntrada === programa.codigo.toLowerCase() ? programa.color : undefined,
                      backgroundColor: formData.tipoEntrada === programa.codigo.toLowerCase() ? `${programa.color}10` : undefined
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{programa.icono || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{programa.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{programa.descripcion}</p>
                      </div>
                      {formData.tipoEntrada === programa.codigo.toLowerCase() && (
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: programa.color }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {formData.tipoEntrada && (
            <>
              {/* SECTION 2: Contact (Donateur/Fournisseur) */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {formData.tipoEntrada === 'achat' ? '📦 Fournisseur *' : 
                   formData.tipoEntrada === 'prs' ? '🚚 Participant PRS *' :
                   formData.tipoEntrada === 'occ' ? '🔄 Donateur/Fournisseur *' : 
                   '🎁 Donateur *'}
                </Label>
                
                <Popover open={selectContactoOpen} onOpenChange={setSelectContactoOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={selectContactoOpen}
                      className="w-full justify-between h-auto min-h-[44px] py-2"
                    >
                      {formData.donadorId ? (
                        <div className="flex-1 text-left">
                          {(() => {
                            const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
                            if (!contacto) return <span className="text-gray-500">Contact introuvable</span>;
                            
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-base">
                                    {contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`}
                                  </span>
                                  {(() => {
                                    const tipoBadge = obtenerTipoContactoBadge(contacto);
                                    return (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        style={{
                                          backgroundColor: tipoBadge.bgColor,
                                          color: tipoBadge.color
                                        }}
                                      >
                                        {tipoBadge.label}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                {contacto.nombreEmpresa && (
                                  <div className="text-sm text-gray-600">
                                    👤 {contacto.nombre} {contacto.apellido}
                                  </div>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {contacto.telefono && (
                                    <span>📞 {contacto.telefono}</span>
                                  )}
                                  {contacto.email && (
                                    <span>📧 {contacto.email}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {formData.tipoEntrada === 'achat' 
                            ? 'Sélectionner un fournisseur...' 
                            : formData.tipoEntrada === 'prs'
                            ? 'Sélectionner un participant PRS...'
                            : formData.tipoEntrada === 'occ'
                            ? 'Sélectionner un donateur/fournisseur...'
                            : 'Sélectionner un donateur...'}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[550px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher par nom, entreprise, téléphone, email..."
                        value={searchContactoQuery}
                        onValueChange={setSearchContactoQuery}
                      />
                      <CommandEmpty>Aucun contact trouvé</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {contactosFiltrados.map((contacto) => (
                            <CommandItem
                              key={contacto.id}
                              value={contacto.id}
                              onSelect={() => handleContactoSelect(contacto.id)}
                              className="py-3"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  formData.donadorId === contacto.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-base">
                                    {contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`}
                                  </p>
                                  {(() => {
                                    const tipoBadge = obtenerTipoContactoBadge(contacto);
                                    return (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs flex-shrink-0"
                                        style={{
                                          backgroundColor: tipoBadge.bgColor,
                                          color: tipoBadge.color
                                        }}
                                      >
                                        {tipoBadge.label}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                
                                {contacto.nombreEmpresa && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    👤 {contacto.nombre} {contacto.apellido}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                  {contacto.telefono && (
                                    <span className="flex items-center gap-1">
                                      📞 {contacto.telefono}
                                    </span>
                                  )}
                                  {contacto.email && (
                                    <span className="flex items-center gap-1 truncate">
                                      📧 {contacto.email}
                                    </span>
                                  )}
                                  {contacto.direccion && (
                                    <span className="flex items-center gap-1 truncate">
                                      📍 {contacto.direccion}
                                    </span>
                                  )}
                                </div>
                                
                                {contacto.notas && (
                                  <p className="text-xs text-gray-400 mt-1 italic truncate">
                                    💬 {contacto.notas}
                                  </p>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {contactosDisponibles.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <p>
                      Aucun {formData.tipoEntrada === 'achat' ? 'fournisseur' : 
                              formData.tipoEntrada === 'prs' ? 'participant PRS' :
                              formData.tipoEntrada === 'occ' ? 'donateur/fournisseur' :
                              'donateur'} trouvé. 
                      Créez-en un dans Contacts.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 3: Producto */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  📦 Produit *
                </Label>

                <Popover open={comboboxProductoOpen} onOpenChange={setComboboxProductoOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxProductoOpen}
                      className="w-full justify-between"
                    >
                      {formData.nombreProducto ? (
                        <span className="flex items-center gap-2">
                          <span>{formData.productoIcono}</span>
                          <span>{formData.nombreProducto}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">Sélectionner un produit...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher un produit..."
                        value={searchProductoQuery}
                        onValueChange={setSearchProductoQuery}
                      />
                      <CommandEmpty>
                        {searchProductoQuery.length < 3
                          ? 'Tapez au moins 3 lettres...'
                          : 'Aucun produit trouvé'}
                      </CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {productosFiltrados.map((producto) => (
                            <CommandItem
                              key={producto.id}
                              value={producto.id}
                              onSelect={() => handleProductoSelect(producto.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.productoId === producto.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="mr-2">{producto.icono}</span>
                              <div className="flex-1">
                                <p className="font-medium">{producto.nombre}</p>
                                <p className="text-xs text-gray-500">{producto.codigo}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Campos de cantidad y unidad */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantité *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.cantidad || ''}
                      onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Unité *</Label>
                    <Select value={formData.unidad} onValueChange={(value) => handleFieldChange('unidad', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map((unidad) => (
                          <SelectItem key={unidad.id} value={unidad.abreviatura}>
                            {unidad.nombre} ({unidad.abreviatura})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Peso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Poids Total (kg)</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="calcularPesoAuto"
                        checked={calcularPesoAuto}
                        onCheckedChange={(checked) => setCalcularPesoAuto(checked as boolean)}
                      />
                      <label htmlFor="calcularPesoAuto" className="text-sm cursor-pointer">
                        Calculer automatiquement
                      </label>
                    </div>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.peso || ''}
                    onChange={(e) => handleFieldChange('peso', parseFloat(e.target.value) || 0)}
                    placeholder="0.000"
                    disabled={calcularPesoAuto}
                  />
                </div>

                {/* Temperatura */}
                <div>
                  <Label>Température *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('temperatura', 'ambiente')}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all",
                        formData.temperatura === 'ambiente'
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <Wind className="w-5 h-5 mx-auto text-amber-600" />
                      <p className="text-xs mt-1">Ambiante</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('temperatura', 'refrigerado')}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all",
                        formData.temperatura === 'refrigerado'
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <Thermometer className="w-5 h-5 mx-auto text-blue-600" />
                      <p className="text-xs mt-1">Réfrigéré</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('temperatura', 'congelado')}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all",
                        formData.temperatura === 'congelado'
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <Snowflake className="w-5 h-5 mx-auto text-cyan-600" />
                      <p className="text-xs mt-1">Congelé</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Detalles opcionales */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setDetallesOpcionalesAbiertos(!detallesOpcionalesAbiertos)}
                  className="flex items-center justify-between w-full text-left font-semibold"
                >
                  <span>Détails Optionnels</span>
                  {detallesOpcionalesAbiertos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {detallesOpcionalesAbiertos && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Numéro de Lot</Label>
                        <Input
                          value={formData.lote}
                          onChange={(e) => handleFieldChange('lote', e.target.value)}
                          placeholder="LOT-12345"
                        />
                      </div>
                      <div>
                        <Label>Date d'Expiration</Label>
                        <Input
                          type="date"
                          value={formData.fechaCaducidad}
                          onChange={(e) => handleFieldChange('fechaCaducidad', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Détails d'Empaquetage</Label>
                      <Input
                        value={formData.detallesEmpaque}
                        onChange={(e) => handleFieldChange('detallesEmpaque', e.target.value)}
                        placeholder="Ex: 24x500ml, 12x1kg, etc."
                      />
                    </div>

                    <div>
                      <Label>Observations</Label>
                      <Textarea
                        value={formData.observaciones}
                        onChange={(e) => handleFieldChange('observaciones', e.target.value)}
                        placeholder="Notes supplémentaires..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Botones de acción */}
              <div className="flex gap-3">
                <Button
                  onClick={agregarProductoALista}
                  className="flex-1 bg-[#2d9561] hover:bg-[#267d50]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Produit
                </Button>
                
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Checkbox
                    id="imprimirAuto"
                    checked={imprimirAutomaticamente}
                    onCheckedChange={(checked) => setImprimirAutomaticamente(checked as boolean)}
                  />
                  <label htmlFor="imprimirAuto" className="text-sm cursor-pointer flex items-center gap-1">
                    <Printer className="w-4 h-4" />
                    Imprimer auto
                  </label>
                </div>
              </div>

              {/* SECTION 6: Lista de productos agregados */}
              {productosAgregados.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  {/* Información del contacto seleccionado */}
                  {formData.donadorId && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                      {(() => {
                        const contacto = contactosDisponibles.find(c => c.id === formData.donadorId);
                        const programa = programasActivos.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);
                        if (!contacto) return null;
                        
                        return (
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{programa?.icono || '📦'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-[#1a4d7a] text-base">
                                  {contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`}
                                </span>
                                <Badge 
                                  style={{
                                    backgroundColor: programa?.color + '20',
                                    color: programa?.color
                                  }}
                                  className="text-xs"
                                >
                                  {programa?.nombre}
                                </Badge>
                              </div>
                              {contacto.nombreEmpresa && (
                                <p className="text-sm text-gray-700">👤 {contacto.nombre} {contacto.apellido}</p>
                              )}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
                                {contacto.telefono && <span>📞 {contacto.telefono}</span>}
                                {contacto.email && <span>📧 {contacto.email}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Produits Ajoutés ({productosAgregados.length})
                    </h3>
                    <Badge variant="secondary">
                      {productosAgregados.reduce((sum, p) => sum + p.pesoTotal, 0).toFixed(2)} kg total
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {productosAgregados.map((producto, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-2xl">{producto.productoIcono}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{producto.nombreProducto}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{producto.cantidad} {producto.unidad}</span>
                            <span>•</span>
                            <span>{producto.pesoTotal.toFixed(2)} kg</span>
                            <span>•</span>
                            <Badge className={cn("text-xs", getTemperatureColor(producto.temperatura))}>
                              {getTemperatureIcon(producto.temperatura)}
                              <span className="ml-1">
                                {producto.temperatura === 'ambiente' ? 'AMB' :
                                 producto.temperatura === 'refrigerado' ? 'RÉF' : 'CONG'}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarProductoAgregado(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={finalizarEntrada}
                      className="flex-1 bg-[#1a4d7a] hover:bg-[#153d62]"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Finaliser l'Entrée ({productosAgregados.length} produits)
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}