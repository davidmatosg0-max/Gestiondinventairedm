// Formulario de registro de nueva entrada al inventario
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Package, Building2, Plus, Check, ChevronsUpDown, Save, X, Copy, Thermometer, Snowflake, Wind, ChevronDown, ChevronUp, Settings, Package2, Printer, LayoutDashboard, ExternalLink, Info, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
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
import { categoriasIniciales, type Categoria } from '../data/configuracionData';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { mockUsuariosInternos } from '../data/mockData';
import { filterByThreeLetters } from '../utils/searchUtils';
import { generarIconoProducto, generarIconoAutomatico } from '../utils/iconoUtils';
import { actualizarPesoUnitarioSubcategoria, actualizarPesoUnitarioVariante, obtenerCategorias, obtenerPesoUnitario, obtenerPesoPorUnidad, agregarSubcategoria, guardarCategorias } from '../utils/categoriaStorage';
import { obtenerUnidades, type Unidad, inicializarUnidades } from '../utils/unidadStorage';
import { GestionUnidades } from './inventario/GestionUnidades';
import { type Variante } from '../data/configuracionData';
import { obtenerContactosDepartamento, type ContactoDepartamento, eliminarFournisseursObsoletos, diagnosticarContactos, sincronizarDonateursFournisseurs } from '../utils/contactosDepartamentoStorage';
import { debeRegistrarPaletasIndividuales, registrarPaletasIndividuales, type DatosEntradaPaleta } from '../utils/paletaStorage';

type FormDataDonAchat = {
  tipoEntrada: string;
  donadorId: string;
  participantePRSId?: string; // Donador participante del programa PRS
  // donadorCustom eliminado - solo contactos existentes permitidos
  productoId: string;
  nombreProducto: string;
  productoCustom: string;
  categoria: string;
  subcategoria: string;
  varianteId?: string; // ID de la variante seleccionada (opcional)
  productoIcono?: string;
  cantidad: number;
  unidad: string;
  peso: number;
  temperatura: 'ambiente' | 'refrigerado' | 'congelado' | '';
  fechaCaducidad: string;
  lote: string;
  detallesEmpaque: string; // Ejemplo: "45x900ml", "24x500g", etc.
  observaciones: string;
};

const unidades = [
  { id: '1', nombre: 'Paleta', abreviatura: 'PLT' },
  { id: '2', nombre: 'Caja', abreviatura: 'CJA' },
  { id: '3', nombre: 'Unidad', abreviatura: 'UND' },
  { id: '4', nombre: 'Saco', abreviatura: 'SAC' },
  { id: '5', nombre: 'Bac Noir', abreviatura: 'BN' },
  { id: '6', nombre: 'Kilogramo', abreviatura: 'kg' },
];

export function EntradaDonAchat() {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [comboboxProductoOpen, setComboboxProductoOpen] = useState(false);
  const [searchProductoQuery, setSearchProductoQuery] = useState('');
  const [productosDB, setProductosDB] = useState<ProductoCreado[]>([]);
  const [categoriasDB, setCategoriasDB] = useState<Categoria[]>([]);
  const [programasDB, setProgramasDB] = useState<ProgramaEntrada[]>([]);
  const [calcularPesoAuto, setCalcularPesoAuto] = useState(false);
  const [detallesOpcionalesAbiertos, setDetallesOpcionalesAbiertos] = useState(false);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [gestionUnidadesOpen, setGestionUnidadesOpen] = useState(false);
  const [imprimirAutomaticamente, setImprimirAutomaticamente] = useState(true);
  const [contactosAlmacen, setContactosAlmacen] = useState<ContactoDepartamento[]>([]);
  const [contactoDialogOpen, setContactoDialogOpen] = useState(false);
  const [searchContactoQuery, setSearchContactoQuery] = useState('');
  const [selectContactoOpen, setSelectContactoOpen] = useState(false);
  
  // Estado para productos agregados en la sesión actual
  const [productosAgregados, setProductosAgregados] = useState<Array<{
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
  }>>([]);
  
  const [ayudaImpresionOpen, setAyudaImpresionOpen] = useState(false);
  const [subcategoriaDialogOpen, setSubcategoriaDialogOpen] = useState(false);
  const [categoriaBase, setCategoriaBase] = useState<Categoria | null>(null);
  const [nuevaSubcategoriaDialogOpen, setNuevaSubcategoriaDialogOpen] = useState(false);
  const [categoriaSeleccionadaParaNueva, setCategoriaSeleccionadaParaNueva] = useState('');
  const [nuevaVarianteDialogOpen, setNuevaVarianteDialogOpen] = useState(false);
  const [crearProductoPRSOpen, setCrearProductoPRSOpen] = useState(false);
  const [formProductoPRS, setFormProductoPRS] = useState({
    nombre: '',
    categoria: '',
    subcategoria: '',
    varianteNombre: '',
    unidad: '',
    peso: 0,
    icono: '📦'
  });
  const [formVariante, setFormVariante] = useState({
    nombre: '',
    codigo: '',
    icono: '📦',
    unidad: '',
    valorPorKg: '',
    pesoUnitario: '',
    descripcion: ''
  });
  const [formSubcategoria, setFormSubcategoria] = useState({
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
  });
  
  const [formData, setFormData] = useState<FormDataDonAchat>({
    tipoEntrada: '',
    donadorId: '',
    participantePRSId: '',
    // donadorCustom eliminado
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
  });

  useEffect(() => {
    if (open) {
      console.log('🚪 Diálogo abierto, cargando datos...');
      
      // ✅ SINCRONIZAR DONATEURS/FOURNISSEURS CON CONTACTOS PRIMERO
      const resultado = sincronizarDonateursFournisseurs();
      console.log(`✅ Sincronización: ${resultado.sincronizados} donateurs/fournisseurs sincronizados, ${resultado.errores} errores`);
      
      const productosActivos = obtenerProductosActivos();
      const categoriasGuardadas = obtenerCategorias();
      const programasActivos = obtenerProgramasActivos();
      const unidadesCargadas = obtenerUnidades();
      // 🔧 CORRECCIÓN: Cargar TODOS los contactos, no solo del departamento Entrepôt
      // Los donadores y fournisseurs pueden estar en cualquier departamento
      const todosContactos = obtenerContactosDepartamento(); // Sin filtro de departamento
      console.log('🔍 Total de contactos en el sistema:', todosContactos.length);
      console.log('🔍 Tipos de contactos:', todosContactos.map(c => `${c.nombre}: ${c.tipo}`));
      
      const contactosEntrepot = todosContactos.filter(c => 
        c.tipo === 'donador' || c.tipo === 'fournisseur'
      );
      
      console.log('📦 Productos cargados:', productosActivos.length);
      console.log('🏷️ Productos PRS:', productosActivos.filter(p => p.esPRS).length);
      console.log('📋 Detalle productos PRS:', productosActivos.filter(p => p.esPRS).map(p => ({ nombre: p.nombre, peso: p.peso, pesoUnitario: p.pesoUnitario })));
      
      // 🔍 DIAGNÓSTICO: Log detallado de contactos cargados
      console.log('👥 Total contactos donador/fournisseur cargados:', contactosEntrepot.length);
      console.log('🔍 Desglose de contactos:');
      contactosEntrepot.forEach(c => {
        console.log(`  - ${c.nombre} ${c.apellido}: tipo="${c.tipo}", activo=${c.activo}, dept="${c.departamentoId}"`);
      });
      
      const donadores = contactosEntrepot.filter(c => c.tipo === 'donador' && c.activo);
      const fournisseurs = contactosEntrepot.filter(c => c.tipo === 'fournisseur' && c.activo);
      
      console.log(`✅ Donadores activos: ${donadores.length}`);
      console.log(`✅ Fournisseurs activos: ${fournisseurs.length}`);
      
      setProductosDB(productosActivos);
      setCategoriasDB(categoriasGuardadas);
      setProgramasDB(programasActivos);
      setUnidades(unidadesCargadas);
      setContactosAlmacen(contactosEntrepot);
      
      // Cargar programa predeterminado desde localStorage
      const programaPredeterminado = localStorage.getItem('programaPredeterminado');
      if (programaPredeterminado) {
        setFormData(prev => ({ ...prev, tipoEntrada: programaPredeterminado }));
      }
    } else {
      // Limpiar lista de productos agregados al cerrar el diálogo
      setProductosAgregados([]);
    }
  }, [open]);
  
  // Limpiar lista de productos cuando cambia el donador
  useEffect(() => {
    setProductosAgregados([]);
  }, [formData.donadorId]);

  // Limpiar producto seleccionado cuando se cambia de programa (PRS <-> otros)
  useEffect(() => {
    if (formData.productoId) {
      const productoActual = productosDB.find(p => p.id === formData.productoId);
      const esProgramaPRS = formData.tipoEntrada === 'prs';
      
      // Si el producto actual no coincide con el programa seleccionado, limpiar
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
  }, [formData.tipoEntrada]);

  // ELIMINADO: Listener de categoriasActualizadas ya que guardarCategorias ya no dispara eventos
  // Las categorías se actualizan automáticamente cuando se guardan en localStorage

  // Escuchar cambios en las unidades
  useEffect(() => {
    const handleUnidadesActualizadas = () => {
      const unidadesCargadas = obtenerUnidades();
      setUnidades(unidadesCargadas);
    };

    window.addEventListener('unidadesActualizadas', handleUnidadesActualizadas);
    
    return () => {
      window.removeEventListener('unidadesActualizadas', handleUnidadesActualizadas);
    };
  }, []);

  // 🔧 CARGAR CONTACTOS INICIALMENTE Y ESCUCHAR CAMBIOS
  useEffect(() => {
    // ✅ CARGA INICIAL INMEDIATA de contactos
    console.log('🚀 Cargando contactos inicialmente...');
    const todosContactosInicial = obtenerContactosDepartamento();
    const contactosIniciales = todosContactosInicial.filter(c => 
      (c.tipo === 'donador' || c.tipo === 'fournisseur') && c.activo
    );
    console.log('✅ Contactos iniciales cargados:', contactosIniciales.length);
    console.log('📋 Detalle:', contactosIniciales.map(c => `${c.nombre} ${c.apellido} (${c.tipo})`));
    setContactosAlmacen(contactosIniciales);
    
    const handleContactosRestaurados = (event: any) => {
      const { departamentoId } = event.detail || {};
      console.log('🔄 Evento contactos-restaurados recibido', { departamentoId });
      // Recargar todos los contactos donador/fournisseur ACTIVOS
      const todosContactos = obtenerContactosDepartamento();
      const contactosDonadoresFournisseurs = todosContactos.filter(c => 
        (c.tipo === 'donador' || c.tipo === 'fournisseur') && c.activo
      );
      console.log('📋 Contactos donador/fournisseur recargados:', contactosDonadoresFournisseurs.length);
      setContactosAlmacen(contactosDonadoresFournisseurs);
      toast.success('🔄 Contacts synchronisés automatiquement');
    };

    const handleContactosActualizados = () => {
      // Recargar contactos cuando se crea o edita uno nuevo
      console.log('🔄 Evento contactos-actualizados recibido');
      const todosContactos = obtenerContactosDepartamento();
      const contactosDonadoresFournisseurs = todosContactos.filter(c => 
        (c.tipo === 'donador' || c.tipo === 'fournisseur') && c.activo
      );
      console.log('📋 Contactos donador/fournisseur recargados:', contactosDonadoresFournisseurs.length);
      setContactosAlmacen(contactosDonadoresFournisseurs);
    };

    // Listener para productos actualizados
    const handleProductosActualizados = () => {
      console.log('📦 Productos actualizados, recargando...');
      const productosActivos = obtenerProductosActivos();
      console.log('📋 Productos recargados:', productosActivos.length);
      setProductosDB(productosActivos);
    };

    // Listener para storage changes (por si se actualiza desde otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contactos_departamentos' || e.key === null) {
        console.log('💾 Storage actualizado, recargando contactos');
        const todosContactos = obtenerContactosDepartamento();
        const contactosDonadoresFournisseurs = todosContactos.filter(c => 
          (c.tipo === 'donador' || c.tipo === 'fournisseur') && c.activo
        );
        console.log('📋 Contactos donador/fournisseur recargados desde storage:', contactosDonadoresFournisseurs.length);
        setContactosAlmacen(contactosDonadoresFournisseurs);
      }
      if (e.key === 'banco_alimentos_productos' || e.key === null) {
        console.log('💾 Storage actualizado, recargando productos');
        const productosActivos = obtenerProductosActivos();
        console.log('📋 Productos recargados desde storage:', productosActivos.length);
        setProductosDB(productosActivos);
      }
    };

    window.addEventListener('contactos-restaurados', handleContactosRestaurados);
    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    window.addEventListener('productos-actualizados', handleProductosActualizados);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('contactos-restaurados', handleContactosRestaurados);
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('productos-actualizados', handleProductosActualizados);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const programasActivos = programasDB;
  const programaSeleccionado = programasActivos.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);
  
  // ✅ FILTRAR CONTACTOS SEGÚN EL TIPO DE ENTRADA SELECCIONADO
  const contactosDisponibles = React.useMemo(() => {
    console.log('🔄 Recalculando contactosDisponibles...');
    console.log(`   - contactosAlmacen.length: ${contactosAlmacen.length}`);
    console.log(`   - tipoEntrada: "${formData.tipoEntrada}"`);
    
    const filtrados = contactosAlmacen.filter(contacto => {
      if (!contacto.activo) {
        console.log(`⏭️ Contacto "${contacto.nombre} ${contacto.apellido}" excluido: activo=false`);
        return false;
      }
      
      // Si se seleccionó "Don", solo mostrar donadores
      if (formData.tipoEntrada === 'don') {
        const esDonador = contacto.tipo === 'donador';
        if (!esDonador) {
          console.log(`⏭️ Contacto "${contacto.nombre} ${contacto.apellido}" excluido en "Don": tipo="${contacto.tipo}" (esperado: "donador")`);
        }
        return esDonador;
      }
      
      // Si se seleccionó "Achat", solo mostrar proveedores (fournisseurs)
      if (formData.tipoEntrada === 'achat') {
        const esFournisseur = contacto.tipo === 'fournisseur';
        if (!esFournisseur) {
          console.log(`⏭️ Contacto "${contacto.nombre} ${contacto.apellido}" excluido en "Achat": tipo="${contacto.tipo}" (esperado: "fournisseur")`);
        } else {
          console.log(`✅ Contacto fournisseur INCLUIDO: "${contacto.nombre} ${contacto.apellido}"`);
        }
        return esFournisseur;
      }
      
      // Si no hay tipo seleccionado, no mostrar ningún contacto
      console.log(`⏭️ Contacto "${contacto.nombre} ${contacto.apellido}" excluido: sin tipo de entrada seleccionado`);
      return false;
    });
    
    console.log(`🎯 Filtro final: ${filtrados.length} contactos disponibles para tipoEntrada="${formData.tipoEntrada}"`);
    return filtrados;
  }, [contactosAlmacen, formData.tipoEntrada]);

  const contactoSeleccionado = contactosAlmacen.find(c => c.id === formData.donadorId);
  
  // Filtrar productos según el programa seleccionado
  const productosDisponibles = formData.tipoEntrada === 'prs'
    ? productosDB.filter(p => p.esPRS === true)  // Solo productos PRS
    : productosDB.filter(p => !p.esPRS);  // Solo productos NO-PRS

  const productosFiltrados = searchProductoQuery.length > 0
    ? productosDisponibles.filter(producto => {
        return filterByThreeLetters(producto.nombre, searchProductoQuery) || 
               filterByThreeLetters(producto.codigo, searchProductoQuery) || 
               filterByThreeLetters(producto.categoria, searchProductoQuery);
      })
    : productosDisponibles;

  const categoriasFiltradas = searchProductoQuery.length > 0
    ? categoriasDB.filter(cat => cat.activa).filter(cat => {
        const subcatsMatch = cat.subcategorias?.some(sub => {
          return filterByThreeLetters(sub.nombre, searchProductoQuery) && sub.activa;
        });
        return filterByThreeLetters(cat.nombre, searchProductoQuery) || subcatsMatch;
      })
    : categoriasDB.filter(cat => cat.activa);

  const productoSeleccionado = productosDB.find(p => p.id === formData.productoId);

  useEffect(() => {
    if (formData.productoId && productoSeleccionado) {
      const updates: any = {};
      
      // Actualizar unidad si existe
      if (productoSeleccionado.unidad) {
        updates.unidad = productoSeleccionado.unidad;
      }
      
      // Actualizar peso si existe (pesoUnitario o peso)
      if (productoSeleccionado.pesoUnitario) {
        updates.peso = productoSeleccionado.pesoUnitario;
      } else if (productoSeleccionado.peso) {
        updates.peso = productoSeleccionado.peso;
      }
      
      // Aplicar actualizaciones si hay cambios
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updates
        }));
      }
    }
  }, [formData.productoId, productoSeleccionado?.unidad, productoSeleccionado?.peso, productoSeleccionado?.pesoUnitario]);

  useEffect(() => {
    if (!formData.productoId && formData.categoria && formData.subcategoria) {
      const nombreGenerado = `${formData.categoria} - ${formData.subcategoria}`;
      setFormData(prev => ({
        ...prev,
        nombreProducto: nombreGenerado
      }));
    }
  }, [formData.categoria, formData.subcategoria, formData.productoId]);

  // ���� Auto-rellenar unidad y peso cuando se selecciona una subcategoría
  useEffect(() => {
    // ⚠️ NO sobrescribir si hay un producto PRS seleccionado
    if (formData.productoId) {
      const producto = productosDB.find(p => p.id === formData.productoId);
      if (producto?.esPRS) {
        console.log('🚫 Producto PRS seleccionado - No auto-rellenar peso desde subcategoría');
        return;
      }
    }
    
    if (formData.categoria && formData.subcategoria) {
      const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
      
      if (subcategoriaObj) {
        // Auto-rellenar unidad SIEMPRE que la subcategoría tenga una unidad predeterminada
        if (subcategoriaObj.unidad) {
          setFormData(prev => ({
            ...prev,
            unidad: subcategoriaObj.unidad!
          }));
          console.log(`📏 Unidad auto-actualizada: ${subcategoriaObj.unidad} para ${formData.subcategoria}`);
        }
        
        // ⚠️ EXCEPCIÓN PALETA: NO auto-rellenar peso para PLT (manual/balanza)
        if (subcategoriaObj.unidad === 'PLT') {
          console.log('⚠️ Unidad PALETA - Peso manual/balanza requerido');
          setFormData(prev => ({
            ...prev,
            peso: 0
          }));
        } else {
          // Auto-rellenar peso unitario si existe (solo para NO paletas)
          const pesoUnitarioGuardado = obtenerPesoUnitario(formData.categoria, formData.subcategoria);
          if (pesoUnitarioGuardado && pesoUnitarioGuardado > 0) {
            setFormData(prev => ({
              ...prev,
              peso: pesoUnitarioGuardado
            }));
            console.log(`⚖️ Peso unitario auto-actualizado: ${pesoUnitarioGuardado} kg para ${formData.subcategoria}`);
          } else {
            // Si no hay peso unitario, intentar obtener peso por la unidad predeterminada
            if (subcategoriaObj.unidad) {
              const pesoGuardado = obtenerPesoPorUnidad(formData.categoria, formData.subcategoria, subcategoriaObj.unidad);
              if (pesoGuardado && pesoGuardado > 0) {
                setFormData(prev => ({
                  ...prev,
                  peso: pesoGuardado
                }));
                console.log(`⚖️ Peso por unidad auto-actualizado: ${pesoGuardado} kg para ${formData.subcategoria} (${subcategoriaObj.unidad})`);
              }
            }
          }
        }
      }
    }
  }, [formData.categoria, formData.subcategoria, categoriasDB, formData.productoId, productosDB]);

  useEffect(() => {
    // ⚠️ NO sobrescribir si hay un producto PRS seleccionado
    if (formData.productoId) {
      const producto = productosDB.find(p => p.id === formData.productoId);
      if (producto?.esPRS) {
        console.log('🚫 Producto PRS seleccionado - No auto-rellenar peso desde unidad');
        return;
      }
    }
    
    if (formData.categoria && formData.subcategoria && formData.unidad) {
      // ⚠️ EXCEPCIÓN PALETA: NO auto-rellenar peso para PLT
      if (formData.unidad === 'PLT') {
        console.log('⚠️ Unidad PALETA - Peso manual/balanza requerido');
        setFormData(prev => ({
          ...prev,
          peso: 0
        }));
        return;
      }
      
      const pesoGuardado = obtenerPesoPorUnidad(formData.categoria, formData.subcategoria, formData.unidad);
      
      if (pesoGuardado && pesoGuardado > 0) {
        setFormData(prev => ({
          ...prev,
          peso: pesoGuardado
        }));
        console.log(`✨ Peso auto-actualizado: ${pesoGuardado} kg para ${formData.subcategoria} (${formData.unidad})`);
      } else {
        const pesoUnitarioGuardado = obtenerPesoUnitario(formData.categoria, formData.subcategoria);
        if (pesoUnitarioGuardado && pesoUnitarioGuardado > 0) {
          setFormData(prev => ({
            ...prev,
            peso: pesoUnitarioGuardado
          }));
          console.log(`✨ Peso unitario auto-actualizado: ${pesoUnitarioGuardado} kg para ${formData.subcategoria}`);
        } else {
          setFormData(prev => ({
            ...prev,
            peso: 0
          }));
        }
      }
    }
  }, [formData.categoria, formData.subcategoria, formData.unidad, formData.productoId, productosDB]);

  // 🎯 Auto-rellenar peso e icono cuando se selecciona una variante
  // ⚠️ EXCEPCIÓN: Resetear peso a 0 para variantes nuevas, excepto PLT que siempre es manual
  useEffect(() => {
    if (formData.varianteId && formData.categoria && formData.subcategoria) {
      const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
      const varianteObj = subcategoriaObj?.variantes?.find(v => v.id === formData.varianteId);
      
      if (varianteObj) {
        console.log(`🔄 Variante cambiada: ${varianteObj.nombre} - Refrescando campos...`);
        
        // ⚠️ EXCEPCIÓN PALETA: NO auto-llenar peso (siempre manual/balanza)
        if (varianteObj.unidad === 'PLT' || formData.unidad === 'PLT') {
          console.log('⚠️ Variante PALETA - Peso manual/balanza requerido');
          setFormData(prev => ({
            ...prev,
            unidad: varianteObj.unidad || prev.unidad,
            peso: 0,
            cantidad: 0,
            fechaCaducidad: '',
            lote: '',
            detallesEmpaque: '',
            observaciones: '',
            temperatura: '',
            productoIcono: varianteObj.icono || prev.productoIcono
          }));
        } else if (varianteObj.pesoUnitario) {
          // Actualizar peso si la variante tiene peso unitario definido (NO paleta)
          setFormData(prev => ({
            ...prev,
            unidad: varianteObj.unidad || prev.unidad,
            peso: varianteObj.pesoUnitario!,
            cantidad: 0,
            fechaCaducidad: '',
            lote: '',
            detallesEmpaque: '',
            observaciones: '',
            temperatura: '',
            productoIcono: varianteObj.icono || prev.productoIcono
          }));
          console.log(`⚖️ Peso de variante auto-actualizado: ${varianteObj.pesoUnitario} kg para ${varianteObj.nombre}`);
        } else {
          // Variante nueva SIN peso unitario → Resetear a 0 para entrada manual
          console.log(`🆕 Variante nueva detectada: ${varianteObj.nombre} - Peso resetado a 0 para entrada manual`);
          setFormData(prev => ({
            ...prev,
            unidad: varianteObj.unidad || prev.unidad,
            peso: 0,
            cantidad: 0,
            fechaCaducidad: '',
            lote: '',
            detallesEmpaque: '',
            observaciones: '',
            temperatura: '',
            productoIcono: varianteObj.icono || prev.productoIcono
          }));
        }
        
        console.log('✅ Campos refrescados: unidad, peso, cantidad, fechaCaducidad, lote, detallesEmpaque, observaciones, temperatura, icono');
      }
    }
  }, [formData.varianteId, formData.categoria, formData.subcategoria, categoriasDB]);

  const abrirCrearSubcategoria = (producto: ProductoCreado) => {
    const categoria = categoriasDB.find(c => c.nombre === producto.categoria);
    if (categoria) {
      setCategoriaBase(categoria);
      setFormSubcategoria({
        codigo: '',
        nombre: producto.nombre,
        unidad: producto.unidad,
        stockMinimo: 0,
        icono: producto.icono || categoria.icono,
        pesoUnitario: producto.peso || 0,
        pesoPLT: 0,
        pesoCJA: 0,
        pesoUND: 0,
        pesoSAC: 0,
        pesoBN: 0,
        pesoKg: 0,
        descripcion: ''
      });
      setSubcategoriaDialogOpen(true);
    }
  };

  const cerrarSubcategoriaDialog = () => {
    setSubcategoriaDialogOpen(false);
    setCategoriaBase(null);
    setFormSubcategoria({
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
    });
  };

  const guardarSubcategoria = () => {
    if (!formSubcategoria.nombre || !categoriaBase) {
      toast.error('Complete todos los campos requeridos');
      return;
    }
    
    const nuevaSubcategoria = agregarSubcategoria(categoriaBase.id, {
      nombre: formSubcategoria.nombre,
      icono: formSubcategoria.icono || categoriaBase.icono,
      activa: true,
      pesoUnitario: formSubcategoria.pesoUnitario,
      descripcion: formSubcategoria.descripcion
    });
    
    if (!nuevaSubcategoria) {
      toast.error('❌ Ya existe una subcategoría con ese nombre y peso unitario');
      return;
    }
    toast.success(`✅ Subcategoría creada: "${formSubcategoria.nombre}"`);
    cerrarSubcategoriaDialog();
    
    const categoriasActualizadas = obtenerCategorias();
    setCategoriasDB(categoriasActualizadas);
  };

  const abrirNuevaSubcategoria = () => {
    setNuevaSubcategoriaDialogOpen(true);
    setComboboxProductoOpen(false);
    setFormSubcategoria({
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
    });
  };

  const guardarNuevaSubcategoria = () => {
    if (!formSubcategoria.nombre || !categoriaSeleccionadaParaNueva) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    // Buscar categoría por ID o por nombre
    const categoriaObj = categoriasDB.find(c => c.id === categoriaSeleccionadaParaNueva || c.nombre === categoriaSeleccionadaParaNueva);
    if (!categoriaObj) {
      toast.error('Categoría no encontrada');
      return;
    }

    const pesosUnidad: any = {};
    if (formSubcategoria.pesoPLT > 0) pesosUnidad.PLT = formSubcategoria.pesoPLT;
    if (formSubcategoria.pesoCJA > 0) pesosUnidad.CJA = formSubcategoria.pesoCJA;
    if (formSubcategoria.pesoUND > 0) pesosUnidad.UND = formSubcategoria.pesoUND;
    if (formSubcategoria.pesoSAC > 0) pesosUnidad.SAC = formSubcategoria.pesoSAC;
    if (formSubcategoria.pesoBN > 0) pesosUnidad.BN = formSubcategoria.pesoBN;
    if (formSubcategoria.pesoKg > 0) pesosUnidad.kg = formSubcategoria.pesoKg;

    const nuevaSubcategoria = agregarSubcategoria(categoriaObj.id, {
      nombre: formSubcategoria.nombre,
      icono: formSubcategoria.icono || categoriaObj.icono,
      activa: true,
      pesoUnitario: formSubcategoria.pesoUnitario,
      pesosUnidad: Object.keys(pesosUnidad).length > 0 ? pesosUnidad : undefined,
      descripcion: formSubcategoria.descripcion
    });

    if (!nuevaSubcategoria) {
      toast.error('❌ Ya existe una subcategoría con ese nombre y peso unitario');
      return;
    }

    toast.success(`✅ Subcategoría "${formSubcategoria.nombre}" creada en ${categoriaObj.nombre}`);
    
    const categoriasActualizadas = obtenerCategorias();
    setCategoriasDB(categoriasActualizadas);
    
    const iconoGenerado = generarIconoProducto(
      formSubcategoria.nombre,
      categoriaObj.nombre,
      formSubcategoria.nombre
    );
    const iconoFinal = formSubcategoria.icono || categoriaObj.icono || iconoGenerado;
    
    setFormData({
      ...formData,
      productoId: '',
      categoria: categoriaObj.nombre,
      subcategoria: formSubcategoria.nombre,
      nombreProducto: `${categoriaObj.nombre} - ${formSubcategoria.nombre}`,
      productoIcono: iconoFinal
    });

    setNuevaSubcategoriaDialogOpen(false);
    setCategoriaSeleccionadaParaNueva('');
    setFormSubcategoria({
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
    });
    setDetallesOpcionalesAbiertos(false);
  };

  const guardarNuevaVariante = () => {
    if (!formVariante.nombre.trim()) {
      toast.error('El nombre de la variante es requerido');
      return;
    }

    if (!formData.categoria || !formData.subcategoria) {
      toast.error('Debe seleccionar una categoría y subcategoría primero');
      return;
    }

    const categorias = obtenerCategorias();
    const categoriaObj = categorias.find(c => c.nombre === formData.categoria);
    
    if (!categoriaObj) {
      toast.error('Categoría no encontrada');
      return;
    }

    const subcategoriaObj = categoriaObj.subcategorias?.find(s => s.nombre === formData.subcategoria);
    
    if (!subcategoriaObj) {
      toast.error('Subcategoría no encontrada');
      return;
    }

    const nuevaVariante: Variante = {
      id: `var-${Date.now()}`,
      nombre: formVariante.nombre.trim(),
      codigo: formVariante.codigo.trim() || undefined,
      icono: formVariante.icono,
      activa: true,
      unidad: formVariante.unidad.trim() || undefined,
      valorPorKg: formVariante.valorPorKg ? parseFloat(formVariante.valorPorKg) : undefined,
      pesoUnitario: formVariante.pesoUnitario ? parseFloat(formVariante.pesoUnitario) : undefined,
      descripcion: formVariante.descripcion.trim() || undefined
    };

    // Actualizar las variantes en la subcategoría
    const variantesActualizadas = [...(subcategoriaObj.variantes || []), nuevaVariante];
    
    // Actualizar en la base de datos
    const categoriaIndex = categorias.findIndex(c => c.id === categoriaObj.id);
    if (categoriaIndex >= 0) {
      const subIndex = categorias[categoriaIndex].subcategorias?.findIndex(s => s.id === subcategoriaObj.id);
      if (subIndex !== undefined && subIndex >= 0 && categorias[categoriaIndex].subcategorias) {
        categorias[categoriaIndex].subcategorias![subIndex].variantes = variantesActualizadas;
        guardarCategorias(categorias);
        
        toast.success(`✅ Variante "${formVariante.nombre}" creada en ${formData.subcategoria}`);
        
        console.log(`🆕 Nueva variante creada: ${nuevaVariante.nombre}`);
        console.log(`   → ID: ${nuevaVariante.id}`);
        console.log(`   → Unidad guardada: ${nuevaVariante.unidad || 'sin definir'}`);
        console.log(`   → Peso guardado: ${nuevaVariante.pesoUnitario || 0} kg`);
        
        // Cerrar el diálogo
        setNuevaVarianteDialogOpen(false);
        
        // Resetear formulario de variante
        setFormVariante({
          nombre: '',
          codigo: '',
          icono: '📦',
          unidad: '',
          valorPorKg: '',
          pesoUnitario: '',
          descripcion: ''
        });
        
        // Actualizar las categorías primero para que el useEffect tenga los datos frescos
        const categoriasActualizadas = obtenerCategorias();
        setCategoriasDB(categoriasActualizadas);
        
        // Pequeño delay para asegurar que React procese la actualización de categoriasDB
        setTimeout(() => {
          // IMPORTANTE: Actualizar SOLO el varianteId
          // El useEffect se encargará de refrescar todos los demás campos automáticamente
          console.log(`🔄 Seleccionando variante: ${nuevaVariante.id}`);
          setFormData(prev => ({
            ...prev,
            varianteId: nuevaVariante.id
          }));
        }, 100);
      }
    }
  };

  const handlePrint = async (producto: {
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
  }) => {
    const entradaId = `ENT-${Date.now()}`;

    const donadorNombre = contactoSeleccionado 
      ? `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}` 
      : 'Sin especificar';

    // Obtener traducciones para la etiqueta
    const labelData: ProductLabelData = {
      id: entradaId,
      nombreProducto: producto.nombreProducto,
      productoIcono: producto.productoIcono,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      cantidad: producto.cantidad,
      unidad: producto.unidad,
      pesoTotal: producto.pesoTotal,
      pesoUnidad: formData.peso,
      temperatura: producto.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      lote: producto.lote,
      fechaCaducidad: producto.fechaCaducidad,
      detallesEmpaque: producto.detallesEmpaque,
      programa: donadorNombre,
      programaIcono: formData.tipoEntrada === 'donacion' ? '👤' : formData.tipoEntrada === 'compra' ? '🏢' : '📋',
      programaColor: '#1E73BE',
      donadorNombre: donadorNombre,
      fechaEntrada: new Date().toISOString(),
      translations: {
        foodBank: t('common.foodBank'),
        productLabel: t('common.productLabel'),
        quantity: t('common.amount'),
        temperature: t('common.temperature'),
        lot: t('common.lot'),
        expiryDate: t('common.expiryDate'),
        weight: t('common.weight'),
        program: t('common.program'),
        entryDate: t('common.entryDate'),
        systemFooter: t('common.inventoryManagementSystem'),
        ambient: t('common.ambient'),
        refrigerated: t('common.refrigerated'),
        frozen: t('common.frozen'),
        packagingDetails: t('common.packagingDetails'),
      }
    };

    try {
      await printStandardLabel(labelData, imprimirAutomaticamente);
    } catch (err) {
      console.error('Error al imprimir etiqueta:', err);
      toast.error(t('common.printError') || 'Error al imprimir la etiqueta');
    }
  };

  const handleSubmitAndPrint = (mantenerAbierto: boolean = false) => {
    console.log('🖨️ === REGISTRAR E IMPRIMIR CON CONTINUACIÓN ===');
    
    // Validar igual que handleSubmit
    if (!formData.tipoEntrada) {
      toast.error(t('common.typeRequired') || 'El tipo de entrada es requerido');
      return;
    }
    
    // Validar donador según el programa
    if (formData.tipoEntrada === 'prs') {
      if (!formData.participantePRSId) {
        toast.error('Le participant PRS est requis');
        return;
      }
    } else {
      if (!formData.donadorId) {
        toast.error(t('common.donorRequired') || 'El donador/proveedor es requerido');
        return;
      }
    }
    
    if (!formData.productoId && !formData.productoCustom.trim() && !formData.nombreProducto.trim()) {
      toast.error(t('common.productRequired') || 'El producto es requerido');
      return;
    }
    if (formData.cantidad <= 0) {
      toast.error(t('common.quantityRequired') || 'La cantidad debe ser mayor a 0');
      return;
    }
    if (!formData.unidad) {
      toast.error(t('common.unitRequired') || 'La unidad es requerida');
      return;
    }
    if (formData.peso <= 0) {
      toast.error(t('common.weightRequired') || 'El peso debe ser mayor a 0');
      return;
    }
    if (!formData.temperatura) {
      toast.error(t('common.temperatureRequired') || 'La temperatura es requerida');
      return;
    }

    console.log('✅ Validación completada');

    // Verificar si es paleta
    const debeRegistrarIndividualmente = debeRegistrarPaletasIndividuales(formData.unidad, formData.cantidad);
    const pesoTotal = formData.cantidad * formData.peso;
    
    // Obtener información de la variante si está seleccionada
    let varianteInfo = undefined;
    if (formData.varianteId && formData.categoria && formData.subcategoria) {
      const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
      const varianteObj = subcategoriaObj?.variantes?.find(v => v.id === formData.varianteId);
      
      if (varianteObj) {
        varianteInfo = {
          id: varianteObj.id,
          nombre: varianteObj.nombre,
          codigo: varianteObj.codigo,
          icono: varianteObj.icono
        };
      }
    }
    
    // Obtener objetos de contexto
    const contacto = formData.tipoEntrada === 'prs' 
      ? contactosAlmacen.find(c => c.id === formData.participantePRSId)
      : contactosAlmacen.find(c => c.id === formData.donadorId);
    const participantePRS = formData.participantePRSId 
      ? contactosAlmacen.find(c => c.id === formData.participantePRSId) 
      : undefined;
    const programaSeleccionado = programasDB.find(p => p.codigo === formData.tipoEntrada);
    const productoSeleccionado = productosDB.find(p => p.id === formData.productoId);
    
    // Obtener nombre del contacto
    const donadorNombre = contacto ? `${contacto.nombre} ${contacto.apellido}` : '';
    const participantePRSNombre = participantePRS ? `${participantePRS.nombre} ${participantePRS.apellido}` : '';
    
    // Preparar datos de entrada
    const entradaData = {
      fecha: new Date().toISOString(),
      tipoEntrada: formData.tipoEntrada,
      programaNombre: programaSeleccionado?.nombre || '',
      programaCodigo: programaSeleccionado?.codigo || '',
      programaColor: programaSeleccionado?.color || '#1E73BE',
      programaIcono: programaSeleccionado?.icono || '📦',
      
      // Para PRS, usar participantePRSId como donadorId
      donadorId: formData.tipoEntrada === 'prs' ? formData.participantePRSId : formData.donadorId,
      donadorNombre: donadorNombre,
      donadorEsCustom: false,
      
      // Información del participante PRS (solo para programa PRS)
      participantePRSId: formData.participantePRSId || undefined,
      participantePRSNombre: participantePRSNombre || undefined,
      
      productoId: formData.productoId || 'custom',
      nombreProducto: formData.nombreProducto,
      categoria: formData.categoria || productoSeleccionado?.categoria,
      subcategoria: formData.subcategoria || productoSeleccionado?.subcategoria,
      productoCategoria: formData.categoria || productoSeleccionado?.categoria,
      productoSubcategoria: formData.subcategoria || productoSeleccionado?.subcategoria,
      productoIcono: formData.productoIcono || productoSeleccionado?.icono || '📦',
      productoCodigo: productoSeleccionado?.codigo,
      varianteId: formData.varianteId,
      variante: varianteInfo,
      
      cantidad: formData.cantidad,
      unidad: formData.unidad,
      pesoUnidad: formData.peso,
      pesoTotal: pesoTotal,
      
      temperatura: formData.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      
      lote: formData.lote || undefined,
      fechaCaducidad: formData.fechaCaducidad || undefined,
      detallesEmpaque: formData.detallesEmpaque || undefined,
      observaciones: formData.observaciones || undefined,
    };

    if (debeRegistrarIndividualmente) {
      // MODO PALETA
      console.log(`🎯 MODO PALETA: Registrando ${formData.cantidad} paletas`);
      
      const datosEntrada: DatosEntradaPaleta = {
        formData,
        contactoSeleccionado: contacto,
        programaSeleccionado: programaSeleccionado,
        productoSeleccionado: productoSeleccionado,
        varianteInfo
      };
      
      const paletasAgregadas = registrarPaletasIndividuales(datosEntrada);
      
      // Agregar todas las paletas a la lista de productos agregados
      paletasAgregadas.forEach((paleta, index) => {
        setProductosAgregados(prev => [...prev, paleta]);
        
        // Imprimir cada paleta con delay
        setTimeout(() => {
          handlePrint(paleta);
        }, 500 * (index + 1));
      });
      
      toast.success(
        `✅ ${formData.cantidad} paletas registradas e impresas\n${formData.nombreProducto} (${pesoTotal.toFixed(2)} kg total)`,
        { duration: 6000 }
      );
    } else {
      // MODO NORMAL
      const entradaGuardada = guardarEntrada(entradaData);

      window.dispatchEvent(new CustomEvent('entradaGuardada', { 
        detail: entradaGuardada 
      }));
      
      const nuevoProductoAgregado = {
        nombreProducto: formData.nombreProducto,
        productoIcono: formData.productoIcono || '📦',
        cantidad: formData.cantidad,
        unidad: formData.unidad,
        pesoTotal: pesoTotal,
        temperatura: formData.temperatura,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        lote: formData.lote,
        fechaCaducidad: formData.fechaCaducidad,
        detallesEmpaque: formData.detallesEmpaque
      };
      
      // Agregar producto a la lista de productos agregados en esta sesión
      console.log('📋 PRODUCTO A AGREGAR:', nuevoProductoAgregado);
      setProductosAgregados(prev => [...prev, nuevoProductoAgregado]);
      
      // Imprimir etiqueta
      setTimeout(() => {
        handlePrint(nuevoProductoAgregado);
      }, 300);
      
      toast.success(
        `✅ Producto registrado e impreso\n${formData.nombreProducto} (${pesoTotal.toFixed(2)} kg)`,
        { duration: 4000 }
      );
    }

    console.log('✅ Entrada(s) guardada(s) e impresa(s)');
    
    // Mantener abierto y preservar donador
    if (mantenerAbierto) {
      const donadorId = formData.donadorId;
      const tipoEntrada = formData.tipoEntrada;
      const participantePRSId = formData.participantePRSId;
      
      // Limpiar solo campos de producto
      resetForm();
      
      // Restaurar donador, tipo de entrada y participante PRS
      setFormData(prev => ({
        ...prev,
        donadorId: donadorId,
        tipoEntrada: tipoEntrada,
        participantePRSId: participantePRSId
      }));
      
      toast.info('💡 Continúa registrando productos del mismo donador', { duration: 3000 });
    } else {
      resetForm();
      setOpen(false);
      setProductosAgregados([]);
    }
  };

  const handleSubmit = (mantenerAbierto: boolean = false) => {
    console.log('🔍 === INICIANDO VALIDACIÓN ===');
    console.log('FormData completo:', formData);
    
    if (!formData.tipoEntrada) {
      console.log('❌ ERROR: Tipo de entrada no seleccionado');
      toast.error(t('common.typeRequired') || 'El tipo de entrada es requerido');
      return;
    }
    
    // Validar donador según el programa
    if (formData.tipoEntrada === 'prs') {
      if (!formData.participantePRSId) {
        console.log('❌ ERROR: Participant PRS no seleccionado');
        toast.error('Le participant PRS est requis');
        return;
      }
    } else {
      if (!formData.donadorId) {
        console.log('❌ ERROR: Donador no seleccionado');
        toast.error(t('common.donorRequired') || 'El donador/proveedor es requerido');
        return;
      }
    }
    
    if (!formData.productoId && !formData.productoCustom.trim() && !formData.nombreProducto.trim()) {
      console.log('❌ ERROR: Producto no seleccionado/ingresado');
      toast.error(t('common.productRequired') || 'El producto es requerido');
      return;
    }
    if (formData.cantidad <= 0) {
      console.log('❌ ERROR: Cantidad inválida:', formData.cantidad);
      toast.error(t('common.quantityRequired') || 'La cantidad debe ser mayor a 0');
      return;
    }
    if (!formData.unidad) {
      console.log('❌ ERROR: Unidad no seleccionada');
      toast.error(t('common.unitRequired') || 'La unidad es requerida');
      return;
    }
    if (formData.peso <= 0) {
      console.log('❌ ERROR: Peso inválido:', formData.peso);
      toast.error(t('common.weightRequired') || 'El peso debe ser mayor a 0');
      return;
    }
    if (!formData.temperatura) {
      console.log('❌ ERROR: Temperatura no seleccionada');
      toast.error(t('common.temperatureRequired') || 'La temperatura es requerida');
      return;
    }

    console.log('✅ Validación completada exitosamente');

    // ===== VERIFICAR SI ES PALETA - REGISTRAR INDIVIDUALMENTE =====
    const debeRegistrarIndividualmente = debeRegistrarPaletasIndividuales(formData.unidad, formData.cantidad);
    
    if (debeRegistrarIndividualmente) {
      console.log(`🎯 MODO PALETA: Registrando ${formData.cantidad} paletas individualmente`);
      toast.info(`Registrando ${formData.cantidad} paletas individualmente con etiquetas únicas...`, { duration: 3000 });
    }

    const pesoTotal = formData.cantidad * formData.peso;
    console.log('📊 Peso total calculado:', pesoTotal, 'kg');
    
    // Obtener información de la variante si está seleccionada
    let varianteInfo = undefined;
    if (formData.varianteId && formData.categoria && formData.subcategoria) {
      const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
      const varianteObj = subcategoriaObj?.variantes?.find(v => v.id === formData.varianteId);
      
      if (varianteObj) {
        varianteInfo = {
          id: varianteObj.id,
          nombre: varianteObj.nombre,
          codigo: varianteObj.codigo,
          icono: varianteObj.icono
        };
      }
    }
    
    const entradaData = {
      fecha: new Date().toISOString(),
      tipoEntrada: formData.tipoEntrada,
      programaNombre: programaSeleccionado?.nombre || '',
      programaCodigo: programaSeleccionado?.codigo || '',
      programaColor: programaSeleccionado?.color || '#1E73BE',
      programaIcono: programaSeleccionado?.icono || '📦',
      
      // Para PRS, usar participantePRSId como donadorId
      donadorId: formData.tipoEntrada === 'prs' ? formData.participantePRSId : formData.donadorId,
      donadorNombre: formData.tipoEntrada === 'prs'
        ? (() => {
            const participant = contactosAlmacen.find(c => c.id === formData.participantePRSId);
            return participant ? `${participant.nombre} ${participant.apellido}` : '';
          })()
        : contactoSeleccionado 
          ? `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}` 
          : '',
      donadorEsCustom: false,
      
      // Información del participante PRS (solo para programa PRS)
      participantePRSId: formData.tipoEntrada === 'prs' ? formData.participantePRSId : undefined,
      participantePRSNombre: formData.tipoEntrada === 'prs'
        ? (() => {
            const participant = contactosAlmacen.find(c => c.id === formData.participantePRSId);
            return participant ? `${participant.nombre} ${participant.apellido}` : '';
          })()
        : undefined,
      
      productoId: formData.productoId || 'custom',
      nombreProducto: formData.nombreProducto,
      categoria: formData.categoria || productoSeleccionado?.categoria,
      subcategoria: formData.subcategoria || productoSeleccionado?.subcategoria,
      productoCategoria: formData.categoria || productoSeleccionado?.categoria,
      productoSubcategoria: formData.subcategoria || productoSeleccionado?.subcategoria,
      productoIcono: formData.productoIcono || productoSeleccionado?.icono || '📦',
      productoCodigo: productoSeleccionado?.codigo,
      varianteId: formData.varianteId,
      variante: varianteInfo,
      
      cantidad: formData.cantidad,
      unidad: formData.unidad,
      pesoUnidad: formData.peso,
      pesoTotal: pesoTotal,
      
      temperatura: formData.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      
      lote: formData.lote || undefined,
      fechaCaducidad: formData.fechaCaducidad || undefined,
      detallesEmpaque: formData.detallesEmpaque || undefined,
      observaciones: formData.observaciones || undefined,
    };

    console.log('🔍 === DATOS A GUARDAR ===');
    console.log('FormData:', formData);
    console.log('EntradaData:', entradaData);
    console.log('Producto seleccionado:', productoSeleccionado);
    console.log('========================');

    // ===== REGISTRO: Modo Paleta Individual o Modo Normal =====
    if (debeRegistrarIndividualmente) {
      // MODO PALETA: Registrar cada paleta individualmente
      const datosEntrada: DatosEntradaPaleta = {
        formData,
        contactoSeleccionado,
        programaSeleccionado,
        productoSeleccionado,
        varianteInfo
      };
      
      const paletasAgregadas = registrarPaletasIndividuales(datosEntrada);
      
      // Agregar todas las paletas a la lista de productos agregados
      paletasAgregadas.forEach((paleta, index) => {
        setProductosAgregados(prev => [...prev, paleta]);
        
        // Imprimir etiqueta automáticamente si está activado
        if (imprimirAutomaticamente) {
          setTimeout(() => {
            handlePrint(paleta);
          }, 500 * (index + 1)); // Delay reducido para modo silencioso
        }
      });
      
      toast.success(
        `✅ ${formData.cantidad} paletas registradas individualmente\n${formData.nombreProducto} (${pesoTotal.toFixed(2)} kg total)`,
        { duration: 6000 }
      );
    } else {
      // MODO NORMAL: Registrar como entrada única
      const entradaGuardada = guardarEntrada(entradaData);

      window.dispatchEvent(new CustomEvent('entradaGuardada', { 
        detail: entradaGuardada 
      }));
      
      // Agregar producto a la lista de productos agregados en esta sesión
      const nuevoProductoAgregado = {
        nombreProducto: formData.nombreProducto,
        productoIcono: formData.productoIcono || '📦',
        cantidad: formData.cantidad,
        unidad: formData.unidad,
        pesoTotal: pesoTotal,
        temperatura: formData.temperatura,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        lote: formData.lote,
        fechaCaducidad: formData.fechaCaducidad,
        detallesEmpaque: formData.detallesEmpaque
      };
      
      // DEBUG: Verificar datos antes de agregar
      console.log('📋 PRODUCTO A AGREGAR:', nuevoProductoAgregado);
      setProductosAgregados(prev => [...prev, nuevoProductoAgregado]);
      
      // Imprimir automáticamente si la opción está activada
      if (imprimirAutomaticamente) {
        setTimeout(() => {
          handlePrint(nuevoProductoAgregado);
        }, 500);
      }
      
      toast.success(
        formData.tipoEntrada === 'don' 
          ? `✅ Donación registrada y agregada al inventario\n${formData.cantidad} ${formData.unidad} de ${formData.nombreProducto} (${pesoTotal.toFixed(2)} kg)`
          : `✅ Compra registrada y agregada al inventario\n${formData.cantidad} ${formData.unidad} de ${formData.nombreProducto} (${pesoTotal.toFixed(2)} kg)`,
        { duration: 5000 }
      );
    }

    // Memorizar pesos (solo en modo normal, no en modo paleta individual)
    if (!debeRegistrarIndividualmente && entradaData.categoria && entradaData.subcategoria) {
      // Memorizar peso de subcategoría (si NO es variante)
      if (!formData.varianteId) {
        const pesoUnitarioMemorizado = actualizarPesoUnitarioSubcategoria(
          entradaData.categoria,
          entradaData.subcategoria,
          formData.cantidad,
          formData.peso,
          formData.unidad  // ✅ Pasar la unidad para memorizar el peso específico
        );
        
        // Solo mostrar mensaje de memorización si no es paleta (PLT no se memoriza)
        if (pesoUnitarioMemorizado && formData.unidad !== 'PLT') {
          const pesoCalculado = formData.cantidad > 0 ? (formData.peso / formData.cantidad).toFixed(3) : 0;
          toast.success(
            `💡 Peso memorizado: ${pesoCalculado} kg por ${formData.unidad} de ${entradaData.subcategoria}`,
            { duration: 4000 }
          );
        }
      } else {
        // Memorizar peso de VARIANTE específica
        const pesoVarianteMemorizado = actualizarPesoUnitarioVariante(
          entradaData.categoria,
          entradaData.subcategoria,
          formData.varianteId,
          formData.cantidad,
          formData.peso,
          formData.unidad
        );
        
        // Solo mostrar mensaje si se memorizó correctamente (NO paleta)
        if (pesoVarianteMemorizado && formData.unidad !== 'PLT') {
          const pesoCalculado = formData.cantidad > 0 ? (formData.peso / formData.cantidad).toFixed(3) : 0;
          const varianteObj = categoriasDB
            .find(c => c.nombre === entradaData.categoria)
            ?.subcategorias?.find(s => s.nombre === entradaData.subcategoria)
            ?.variantes?.find(v => v.id === formData.varianteId);
          
          toast.success(
            `💡 Peso memorizado para variante "${varianteObj?.nombre}": ${pesoCalculado} kg por ${formData.unidad}`,
            { duration: 4000 }
          );
        }
      }
    }

    console.log('✅ Entrada(s) guardada(s)');
    console.log('📦 Producto:', formData.nombreProducto);
    console.log('📁 Categoría:', formData.categoria, '→', formData.subcategoria);
    console.log('📊 Stock agregado al inventario');
    
    // Si la impresión automática está activada, SIEMPRE cerrar después de registrar
    const deberaCerrar = !mantenerAbierto || imprimirAutomaticamente;
    
    if (deberaCerrar) {
      // Esperar a que terminen las impresiones antes de cerrar
      const tiempoEspera = imprimirAutomaticamente 
        ? (debeRegistrarIndividualmente ? formData.cantidad * 600 + 800 : 1000)
        : 0;
        
      setTimeout(() => {
        resetForm();
        setOpen(false);
        setProductosAgregados([]); // Limpiar lista al cerrar
      }, tiempoEspera);
      
      if (imprimirAutomaticamente) {
        const mensajeImpresion = debeRegistrarIndividualmente 
          ? `🖨️ Imprimiendo ${formData.cantidad} etiquetas automáticamente...`
          : '🖨️ Imprimiendo etiqueta automáticamente...';
        toast.success(mensajeImpresion, { duration: 4000 });
      }
    } else {
      // Mantener abierto - preservar donador/participante y tipo de entrada
      const donadorId = formData.donadorId;
      const participantePRSId = formData.participantePRSId;
      const tipoEntrada = formData.tipoEntrada;
      
      resetForm();
      
      // Restaurar donador/participante y tipo de entrada
      setFormData(prev => ({
        ...prev,
        donadorId,
        participantePRSId,
        tipoEntrada
      }));
      
      toast.info('📝 Listo para registrar otra entrada al mismo donador');
    }
  };

  const resetForm = () => {
    setFormData({
      tipoEntrada: '',
      donadorId: '',
      // donadorCustom eliminado
      productoId: '',
      nombreProducto: '',
      productoCustom: '',
      categoria: '',
      subcategoria: '',
      varianteId: undefined,
      productoIcono: '',
      cantidad: 0,
      unidad: '',
      peso: 0,
      temperatura: '',
      fechaCaducidad: '',
      lote: '',
      detallesEmpaque: '',
      observaciones: '',
    });
  };

  const subcategoriasFiltradas = formData.categoria
    ? categoriasDB
        .find(c => c.nombre === formData.categoria)
        ?.subcategorias?.filter(s => s.activa) || []
    : [];

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#4CAF50] hover:bg-[#45a049]"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('common.newEntry')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none !w-[95vw] !h-[95vh] overflow-hidden !p-0" aria-describedby="entrada-don-description">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#1E73BE] to-[#155a99]">
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white' }}>
            ✨ {t('common.registerNewEntry')}
          </DialogTitle>
          <DialogDescription id="entrada-don-description" className="text-white/80 text-sm mt-1">
            {t('common.selectDonorOrProgramDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[calc(95vh-180px)] overflow-y-auto px-6 py-4 bg-gradient-to-b from-[#F8F9FA] to-white"><div className="space-y-4">
          {/* FILA 1: Tipo de Entrada + Información del Donador/Proveedor + Información del Producto */}
          <div className="grid grid-cols-12 gap-4">
            {/* Tipo de Entrada */}
            <div className="col-span-3 border-2 border-[#E3F2FD] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E73BE] to-[#155a99] flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-[#333333] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.entryTypeRequired')}
                </h3>
              </div>
              <div className="space-y-2">
                {programasActivos.map((programa) => (
                  <button
                    key={programa.id}
                    type="button"
                    onClick={() => {
                      const codigoPrograma = programa.codigo.toLowerCase();
                      setFormData({ ...formData, tipoEntrada: codigoPrograma });
                      localStorage.setItem('programaPredeterminado', codigoPrograma);
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 group ${
                      formData.tipoEntrada === programa.codigo.toLowerCase()
                        ? 'shadow-lg scale-[1.02]'
                        : 'border-[#E0E0E0] hover:border-[#CCCCCC] hover:scale-[1.01]'
                    }`}
                    style={{
                      borderColor: formData.tipoEntrada === programa.codigo.toLowerCase() ? programa.color : undefined,
                      backgroundColor: formData.tipoEntrada === programa.codigo.toLowerCase() ? `${programa.color}10` : 'white'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                      style={{
                        background: formData.tipoEntrada === programa.codigo.toLowerCase() 
                          ? `linear-gradient(135deg, ${programa.color}, ${programa.color}DD)` 
                          : '#F5F5F5',
                        color: formData.tipoEntrada === programa.codigo.toLowerCase() ? 'white' : '#999999'
                      }}
                    >
                      {programa.icono || '📦'}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-[#333333] text-sm leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {programa.nombre}
                      </p>
                      <p className="text-[10px] text-[#999999] font-medium">
                        {programa.codigo}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Información del Donador/Proveedor - Oculto cuando es PRS */}
            {formData.tipoEntrada !== 'prs' && (
              <div className="col-span-4 border-2 border-[#E8F5E9] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4CAF50] to-[#45a049] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-[#333333] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('entradaDonAchat.informationDonateur')}
                </h3>
              </div>
              
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-[#555555] text-xs font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {formData.tipoEntrada === 'don' 
                    ? '🎁 Donateur' 
                    : formData.tipoEntrada === 'achat'
                      ? '📦 Fournisseur'
                      : t('entradaDonAchat.nomDonateur')}
                  {formData.tipoEntrada && (
                    <Badge 
                      variant="outline" 
                      className="text-[9px] px-1.5 py-0"
                      style={{
                        backgroundColor: formData.tipoEntrada === 'achat' ? '#E3F2FD' : '#E8F5E9',
                        borderColor: formData.tipoEntrada === 'achat' ? '#2196F3' : '#4CAF50',
                        color: formData.tipoEntrada === 'achat' ? '#1976D2' : '#2E7D32'
                      }}
                    >
                      Filtré: {formData.tipoEntrada === 'achat' ? 'Fournisseurs' : 'Donateurs'}
                    </Badge>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {contactosDisponibles.length} disponible{contactosDisponibles.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {contactosAlmacen.length > 0 && contactosDisponibles.length === 0 && formData.tipoEntrada && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 Aucun donateur ou fournisseur trouvé. 
                    Créez-en un dans <strong>Inventaire → Contactos</strong>
                  </p>
                </div>
              )}
              
              {/* Selector de contacto con botón de crear */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={formData.donadorId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, donadorId: value }));
                      const contacto = contactosAlmacen.find(c => c.id === value);
                      if (contacto) {
                        const tipo = contacto.tipo === 'donador' ? 'donateur' : 'fournisseur';
                        toast.success(`✅ ${contacto.nombre} ${contacto.apellido} (${tipo}) sélectionné`);
                      }
                    }}
                    open={selectContactoOpen}
                    onOpenChange={(open) => {
                      console.log('🔵 Select onOpenChange:', open);
                      console.log('   - contactosDisponibles.length:', contactosDisponibles.length);
                      setSelectContactoOpen(open);
                    }}
                    disabled={!formData.tipoEntrada}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full h-10 border-2 transition-all",
                        contactoSeleccionado
                          ? "border-[#4CAF50] bg-[#F1F8F4]"
                          : "border-[#E0E0E0] hover:border-[#4CAF50]"
                      )}
                    >
                      <SelectValue 
                        placeholder={
                          !formData.tipoEntrada
                            ? "Sélectionner d'abord un type d'entrée..."
                            : formData.tipoEntrada === 'don' 
                              ? 'Sélectionner un donateur...' 
                              : formData.tipoEntrada === 'achat'
                                ? 'Sélectionner un fournisseur...'
                                : t('entradaDonAchat.rechercherContact')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent 
                      className="max-h-[400px]"
                      position="popper"
                      side="bottom"
                      align="start"
                    >
                      {contactosDisponibles.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          {formData.tipoEntrada === 'don' 
                            ? 'Aucun donateur disponible. Créez-en un dans Inventaire → Contactos' 
                            : formData.tipoEntrada === 'achat'
                              ? 'Aucun fournisseur disponible. Créez-en un dans Inventaire → Contactos'
                              : 'Sélectionner un type d\'entrée d\'abord'}
                        </div>
                      ) : (
                        contactosDisponibles
                          .sort((a, b) => {
                            const nombreA = a.nombreEmpresa || `${a.nombre} ${a.apellido}`;
                            const nombreB = b.nombreEmpresa || `${b.nombre} ${b.apellido}`;
                            return nombreA.localeCompare(nombreB);
                          })
                          .map((contacto) => {
                            const nombreCompleto = contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`;
                            const icono = contacto.tipo === 'donador' ? '🎁' : '📦';
                            
                            return (
                              <SelectItem key={contacto.id} value={contacto.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-[#4CAF50]" />
                                  <span>{icono}</span>
                                  <span className="font-medium">{nombreCompleto}</span>
                                  {contacto.telefono && (
                                    <span className="text-xs text-gray-500">• {contacto.telefono}</span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Botón para crear nuevo contacto */}
                {formData.tipoEntrada && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tipoCrear = formData.tipoEntrada === 'don' ? 'donador' : 'fournisseur';
                      const tipoLabel = formData.tipoEntrada === 'don' ? 'donateur' : 'fournisseur';
                      
                      toast.info(
                        `💡 Pour créer un nouveau ${tipoLabel}, allez dans:\nInventaire → Gestion de Contactos → Entrepôt`,
                        { duration: 6000 }
                      );
                      
                      // Disparar evento personalizado para que otros componentes puedan reaccionar
                      window.dispatchEvent(new CustomEvent('solicitar-creacion-contacto', {
                        detail: { tipo: tipoCrear }
                      }));
                    }}
                    className="shrink-0 h-10 border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                    title={`Créer un nouveau ${formData.tipoEntrada === 'don' ? 'donateur' : 'fournisseur'}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <Building2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Información del contacto seleccionado */}
              {contactoSeleccionado && (
                <div className="mt-2 p-3 bg-gradient-to-r from-[#F1F8F4] to-white border-l-4 border-[#4CAF50] rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-[#4CAF50]" />
                        <span className="font-semibold text-sm text-[#2d9561]">
                          {contactoSeleccionado.nombreEmpresa || `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {contactoSeleccionado.tipo === 'donador' ? '🎁 Donateur' : '📦 Fournisseur'}
                        </Badge>
                      </div>
                      {contactoSeleccionado.telefono && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          📞 {contactoSeleccionado.telefono}
                        </p>
                      )}
                      {contactoSeleccionado.email && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          📧 {contactoSeleccionado.email}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, donadorId: '' }))}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Dialog de búsqueda mantenido pero oculto */}
              {false && (
              <Dialog open={contactoDialogOpen} onOpenChange={setContactoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="hidden">Hidden</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[600px]" aria-describedby="seleccionar-contacto-description">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#4CAF50]" />
                      Sélectionner un contact
                    </DialogTitle>
                    <DialogDescription id="seleccionar-contacto-description" className="text-sm text-gray-600">
                      Recherchez et sélectionnez un donateur ou fournisseur dans la liste ci-dessous
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Buscador */}
                    <div className="relative">
                      <Input
                        placeholder="Rechercher un donateur ou fournisseur..."
                        value={searchContactoQuery}
                        onChange={(e) => setSearchContactoQuery(e.target.value)}
                        className="pl-10"
                      />
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    
                    {/* Lista de contactos */}
                    <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                      {contactosDisponibles
                        .filter(contacto => {
                          // Filtrar por búsqueda
                          if (!searchContactoQuery) return true;
                          const search = searchContactoQuery.toLowerCase();
                          return (
                            contacto.nombre.toLowerCase().includes(search) ||
                            contacto.apellido?.toLowerCase().includes(search) ||
                            contacto.empresa?.toLowerCase().includes(search) ||
                            contacto.nombreEmpresa?.toLowerCase().includes(search) ||
                            contacto.email?.toLowerCase().includes(search) ||
                            contacto.telefono?.toLowerCase().includes(search)
                          );
                        })
                        .map((contacto) => (
                          <button
                            key={contacto.id}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                donadorId: contacto.id
                              }));
                              setContactoDialogOpen(false);
                              setSearchContactoQuery('');
                              toast.success(`✅ ${contacto.nombre} sélectionné`);
                            }}
                            className={cn(
                              "w-full text-left p-4 border-b hover:bg-gray-50 transition-colors flex items-start gap-3",
                              formData.donadorId === contacto.id && "bg-green-50 hover:bg-green-100"
                            )}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2d9561] flex items-center justify-center text-white font-bold shrink-0">
                              {((contacto.empresa || contacto.nombreEmpresa) || contacto.nombre).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-[#333333]">
                                  {(contacto.empresa || contacto.nombreEmpresa) ? (
                                    <>🏢 {contacto.empresa || contacto.nombreEmpresa}</>
                                  ) : (
                                    contacto.nombre
                                  )}
                                </span>
                                {formData.donadorId === contacto.id && (
                                  <Check className="h-4 w-4 text-[#4CAF50]" />
                                )}
                              </div>
                              {(contacto.empresa || contacto.nombreEmpresa) && (
                                <p className="text-sm text-gray-600 mb-1">
                                  👤 {contacto.nombre}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {contacto.email && (
                                  <span>📧 {contacto.email}</span>
                                )}
                                {contacto.telefono && (
                                  <span>📞 {contacto.telefono}</span>
                                )}
                              </div>
                              {contacto.direccion && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📍 {contacto.direccion}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "shrink-0",
                                contacto.tipo === 'donador' 
                                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              )}
                            >
                              {contacto.tipo === 'donador' ? '🎁 Donateur' : '🏪 Fournisseur'}
                            </Badge>
                          </button>
                        ))}
                      
                      {contactosDisponibles.filter(contacto => {
                        // Filtrar por búsqueda
                        if (!searchContactoQuery) return true;
                        const search = searchContactoQuery.toLowerCase();
                        return (
                          contacto.nombre.toLowerCase().includes(search) ||
                          contacto.apellido?.toLowerCase().includes(search) ||
                          contacto.empresa?.toLowerCase().includes(search) ||
                          contacto.nombreEmpresa?.toLowerCase().includes(search) ||
                          contacto.email?.toLowerCase().includes(search) ||
                          contacto.telefono?.toLowerCase().includes(search)
                        );
                      }).length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium mb-1">Aucun contact trouvé</p>
                          <p className="text-sm">
                            {searchContactoQuery 
                              ? "Essayez une autre recherche" 
                              : "Créez un donateur ou fournisseur dans Inventaire → Contactos"
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón para ir a gestión de contactos */}
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setContactoDialogOpen(false);
                          toast.info('💡 Pour créer de nouveaux contacts, allez dans Inventaire → Tab Contactos', { duration: 4000 });
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un nouveau contact
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              )}

              {/* ELIMINADO: Campo personalizado - ahora solo se pueden seleccionar contactos existentes */}
              {/* La creación de donadores y proveedores solo está disponible en Gestión de Contactos del Almacén */}
              </div>
            )}

            {/* Participante del Programa PRS - Solo visible cuando tipoEntrada === 'prs' */}
            {formData.tipoEntrada === 'prs' && (
              <div className="col-span-4 border-2 border-[#FCE4EC] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E91E63] to-[#C2185B] flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-[#333333] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    🚚 Donateurs participant
                  </h3>
                </div>
                
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[#555555] text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Sélectionner le donateur
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                      {contactosAlmacen.filter(c => c.activo && c.tipo === 'donador').length} donateurs
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {productosDB.filter(p => p.esPRS === true).length} produits PRS
                    </Badge>
                  </div>
                </div>

                {/* Mensaje si no hay productos PRS */}
                {productosDB.filter(p => p.esPRS === true).length === 0 && (
                  <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                      <div className="text-xs text-orange-800">
                        <p className="font-medium mb-1">Aucun produit PRS disponible</p>
                        <p>
                          Créez votre premier produit PRS en utilisant le bouton ci-dessous pour commencer à enregistrer des entrées dans ce programme.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#666666] mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Sélectionnez le donateur qui participe au Programme de Récupération Spéciale (PRS)
                </p>
                
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    onClick={() => setCrearProductoPRSOpen(true)}
                    className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer Produit PRS
                  </Button>
                </div>
                
                {/* Selector de productos PRS existentes */}
                {productosDB.filter(p => p.esPRS === true).length > 0 && (
                  <div className="mb-3">
                    <Label className="text-[#555555] text-xs mb-2 block font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      📦 Ou sélectionner un produit PRS existant
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {productosDB.filter(p => p.esPRS === true).length} disponibles
                      </Badge>
                    </Label>
                    <Popover open={comboboxProductoOpen} onOpenChange={setComboboxProductoOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxProductoOpen}
                          className="w-full justify-between h-11 border-2 border-[#FCE4EC] hover:border-[#E91E63] transition-colors"
                        >
                          {formData.productoId && productoSeleccionado ? (
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-lg">{productoSeleccionado.icono}</span>
                              <span className="font-medium truncate">{productoSeleccionado.nombre}</span>
                              <Badge variant="outline" className="text-xs shrink-0">
                                ⚖️ {productoSeleccionado.peso}kg
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-[#999999]">Sélectionner un produit PRS...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Rechercher un produit PRS..."
                            value={searchProductoQuery}
                            onValueChange={setSearchProductoQuery}
                          />
                          <CommandList>
                            <CommandEmpty>Aucun produit PRS trouvé.</CommandEmpty>
                            <CommandGroup heading="Produits PRS disponibles">
                              {productosFiltrados.map((producto) => (
                                <CommandItem
                                  key={producto.id}
                                  value={producto.nombre}
                                  onSelect={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      productoId: producto.id,
                                      nombreProducto: producto.nombre,
                                      categoria: producto.categoria,
                                      subcategoria: producto.subcategoria,
                                      unidad: producto.unidad,
                                      productoIcono: producto.icono,
                                      peso: producto.peso
                                    }));
                                    setComboboxProductoOpen(false);
                                    setSearchProductoQuery('');
                                    toast.success(`✅ Produit sélectionné: ${producto.nombre}`, { duration: 3000 });
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <span className="text-2xl">{producto.icono}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold truncate">{producto.nombre}</span>
                                        <Badge variant="outline" className="text-xs shrink-0">
                                          {producto.codigo}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-[#666666]">
                                          📁 {producto.categoria} → {producto.subcategoria}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                          ⚖️ {producto.peso}kg / {producto.unidad}
                                        </Badge>
                                        {producto.varianteNombre && (
                                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                            🏷️ {producto.varianteNombre}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {formData.productoId === producto.id && (
                                      <Check className="h-5 w-5 text-[#E91E63] shrink-0" />
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                
                <Select
                  value={formData.participantePRSId || ''}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, participantePRSId: value }));
                    const donadorSeleccionado = contactosAlmacen.find(c => c.id === value);
                    if (donadorSeleccionado) {
                      toast.success(`✅ Donateur sélectionné: ${donadorSeleccionado.nombre} ${donadorSeleccionado.apellido}`);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 border-2 border-[#FCE4EC] hover:border-[#E91E63] transition-colors">
                    <SelectValue placeholder="Sélectionner un donateur participant" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {contactosAlmacen
                      .filter(c => c.activo && c.tipo === 'donador' && c.participaPRS === true)
                      .map((contacto) => (
                        <SelectItem key={contacto.id} value={contacto.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contacto.nombre} {contacto.apellido}</span>
                            {contacto.nombreEmpresa && (
                              <span className="text-xs text-gray-500">({contacto.nombreEmpresa})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    {contactosAlmacen.filter(c => c.activo && c.tipo === 'donador' && c.participaPRS === true).length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Aucun donateur participant au PRS disponible
                      </div>
                    )}
                  </SelectContent>
                </Select>
                
                {formData.participantePRSId && (
                  <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-pink-600 mt-0.5 shrink-0" />
                      <div className="text-xs text-pink-800">
                        <p className="font-medium mb-1">Participant enregistré</p>
                        <p>
                          {(() => {
                            const participant = contactosAlmacen.find(c => c.id === formData.participantePRSId);
                            return participant ? `${participant.nombre} ${participant.apellido}${participant.nombreEmpresa ? ` - ${participant.nombreEmpresa}` : ''}` : '';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Información del Producto */}
            <div className="col-span-5 border-2 border-[#FFF8E1] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC107] to-[#FFA000] flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-[#333333] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.addedProductsList')}
                </h3>
              </div>
              
              <p className="text-xs text-[#666666] mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {t('common.addedProductsDescription')}
              </p>
              
              {/* Lista de Productos Agregados */}
              {productosAgregados.length > 0 && (
                <div className="mt-4 border-t-2 border-[#E3F2FD] pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-[#4CAF50]" />
                    <span className="text-xs font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('common.addedProducts')} ({productosAgregados.length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {productosAgregados.map((producto, index) => {
                      const iconoTemperatura = producto.temperatura === 'refrigerado' 
                        ? '❄️' 
                        : producto.temperatura === 'congelado' 
                        ? '🧊' 
                        : '🌡️';
                      
                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-green-300 shrink-0">
                            <span className="text-lg">{producto.productoIcono}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {producto.nombreProducto}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white border-green-300 text-green-700">
                                {producto.cantidad} {producto.unidad}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white border-blue-300 text-blue-700">
                                {producto.pesoTotal.toFixed(2)} kg
                              </Badge>
                              {producto.detallesEmpaque && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white border-purple-300 text-purple-700">
                                  📦 {producto.detallesEmpaque}
                                </Badge>
                              )}
                              <span className="text-xs" title={producto.temperatura}>
                                {iconoTemperatura}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 flex gap-1">
                            <button
                              onClick={() => handlePrint(producto)}
                              className="w-7 h-7 rounded-full bg-[#1E73BE] hover:bg-[#155a99] flex items-center justify-center transition-colors"
                              title="Imprimir etiqueta"
                            >
                              <Printer className="w-3.5 h-3.5 text-white" />
                            </button>
                            <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Total acumulado:
                      </span>
                      <span className="font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {productosAgregados.reduce((sum, p) => sum + p.pesoTotal, 0).toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FILA 2: Categoría, Cantidad, Unidad, Peso unitario, Temperatura */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#1E73BE]">📁</span> {t('common.categoryRequired')}
              </Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData({ ...formData, categoria: value, subcategoria: '' })}
              >
                <SelectTrigger className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#1E73BE] rounded-lg transition-colors">
                  <SelectValue placeholder={t('common.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categoriasDB.filter(c => c.activa).map(cat => (
                    <SelectItem key={cat.id} value={cat.nombre} className="text-sm">
                      {cat.icono} {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#4CAF50]">🔢</span> {t('common.quantity')} *
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.cantidad || ''}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#4CAF50] rounded-lg transition-colors font-semibold"
              />
            </div>

            <div className="col-span-1">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5 justify-between" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#FFC107]">📦</span> {t('common.unit')} *
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setGestionUnidadesOpen(true)}
                  className="h-5 w-5 p-0 hover:bg-[#FFC107]/10"
                  title={t('common.manageUnits')}
                >
                  <Settings className="h-3 w-3 text-[#FFC107]" />
                </Button>
              </Label>
              <Select 
                value={formData.unidad} 
                onValueChange={(value) => setFormData({ ...formData, unidad: value })}
              >
                <SelectTrigger className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#FFC107] rounded-lg transition-colors font-medium">
                  <SelectValue placeholder={t('common.unit')} />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map(unidad => (
                    <SelectItem key={unidad.id} value={unidad.abreviatura} className="text-sm">
                      {unidad.icono && <span className="mr-2">{unidad.icono}</span>}
                      {unidad.abreviatura}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#DC3545]">⚖️</span> {t('common.unitWeightKg')}
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.peso || ''}
                onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) || 0 })}
                className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#DC3545] rounded-lg transition-colors font-semibold"
              />
            </div>

            <div className="col-span-1">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#1E73BE]">💯</span> {t('common.totalWeightShort')}
              </Label>
              <div className="h-11 px-4 rounded-lg border-2 border-[#E3F2FD] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center shadow-sm">
                <span className="text-sm font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {(formData.cantidad * formData.peso).toFixed(2)} kg
                </span>
              </div>
            </div>

            <div className="col-span-3">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#00BCD4]">🌡️</span> {t('common.temperature')} *
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, temperatura: 'ambiente' })}
                  className={`flex-1 p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${
                    formData.temperatura === 'ambiente'
                      ? 'border-[#FFC107] bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] shadow-md scale-105'
                      : 'border-[#FFE082] bg-gradient-to-br from-[#FFFDE7] to-[#FFF9C4] hover:border-[#FFC107] hover:scale-105'
                  }`}
                  title={t('common.ambient')}
                >
                  <Thermometer className={`w-6 h-6 ${formData.temperatura === 'ambiente' ? 'text-[#FFC107]' : 'text-[#FFB300]'}`} />
                  <span className={`text-[9px] font-bold ${formData.temperatura === 'ambiente' ? 'text-[#F57C00]' : 'text-[#F9A825]'}`}>
                    {t('common.amb')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, temperatura: 'refrigerado' })}
                  className={`flex-1 p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${
                    formData.temperatura === 'refrigerado'
                      ? 'border-[#2196F3] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] shadow-md scale-105'
                      : 'border-[#90CAF9] bg-gradient-to-br from-[#F1F8FF] to-[#E3F2FD] hover:border-[#2196F3] hover:scale-105'
                  }`}
                  title={t('common.refrigerated')}
                >
                  <Wind className={`w-6 h-6 ${formData.temperatura === 'refrigerado' ? 'text-[#2196F3]' : 'text-[#42A5F5]'}`} />
                  <span className={`text-[9px] font-bold ${formData.temperatura === 'refrigerado' ? 'text-[#1976D2]' : 'text-[#1E88E5]'}`}>
                    {t('common.ref')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, temperatura: 'congelado' })}
                  className={`flex-1 p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${
                    formData.temperatura === 'congelado'
                      ? 'border-[#00BCD4] bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2] shadow-md scale-105'
                      : 'border-[#80DEEA] bg-gradient-to-br from-[#F0F9FF] to-[#E0F7FA] hover:border-[#00BCD4] hover:scale-105'
                  }`}
                  title={t('common.frozen')}
                >
                  <Snowflake className={`w-6 h-6 ${formData.temperatura === 'congelado' ? 'text-[#00BCD4]' : 'text-[#26C6DA]'}`} />
                  <span className={`text-[9px] font-bold ${formData.temperatura === 'congelado' ? 'text-[#0097A7]' : 'text-[#00ACC1]'}`}>
                    {t('common.cong')}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* FILA 3: Subcategoría */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#FFC107]">🏷️</span> {t('common.subcategoryRequired')}
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.subcategoria} 
                  onValueChange={(value) => setFormData({ ...formData, subcategoria: value })}
                  disabled={!formData.categoria}
                >
                  <SelectTrigger className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#FFC107] rounded-lg transition-colors flex-1">
                    <SelectValue placeholder={t('common.selectSubcategory')}>
                      {formData.subcategoria && (() => {
                        const subcatObj = subcategoriasFiltradas.find(s => s.nombre === formData.subcategoria);
                        return subcatObj ? (
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{subcatObj.icono}</span>
                            <span className="font-medium">{subcatObj.nombre}</span>
                          </span>
                        ) : formData.subcategoria;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoriasFiltradas.map(sub => (
                      <SelectItem key={sub.id} value={sub.nombre} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sub.icono}</span>
                          <span className="font-medium">{sub.nombre}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    if (!formData.subcategoria) {
                      toast.error(t('common.selectFirstSubcategory'));
                      return;
                    }
                    
                    // Obtener datos de la subcategoría seleccionada
                    const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
                    const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
                    
                    if (subcategoriaObj) {
                      // Pre-rellenar el formulario con datos de la subcategoría
                      setFormVariante({
                        nombre: subcategoriaObj.nombre,
                        codigo: '',
                        icono: subcategoriaObj.icono || '📦',
                        unidad: subcategoriaObj.unidad || '',
                        valorPorKg: '',
                        pesoUnitario: '',
                        descripcion: ''
                      });
                    }
                    
                    setNuevaVarianteDialogOpen(true);
                  }}
                  disabled={!formData.subcategoria}
                  className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white shadow-sm hover:shadow-md transition-all"
                  title={t('common.createVariantOfSubcategory')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('common.variant')}
                </Button>
              </div>
            </div>
          </div>

          {/* Selector de Variantes (si hay variantes disponibles) */}
          {formData.subcategoria && (() => {
            const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
            const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
            const variantes = subcategoriaObj?.variantes?.filter(v => v.activa) || [];
            
            if (variantes.length === 0) return null;
            
            return (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="text-[#9C27B0]">📦</span> {t('common.variantOptional')}
                  </Label>
                  <Select 
                    value={formData.varianteId || 'sin-variante'} 
                    onValueChange={(value) => setFormData({ ...formData, varianteId: value === 'sin-variante' ? undefined : value })}
                  >
                    <SelectTrigger className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#9C27B0] rounded-lg transition-colors">
                      <SelectValue placeholder={t('common.noSpecificVariant')}>
                        {formData.varianteId && (() => {
                          const varianteObj = variantes.find(v => v.id === formData.varianteId);
                          return varianteObj ? (
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{varianteObj.icono}</span>
                              <span className="font-medium">{varianteObj.nombre}</span>
                              {varianteObj.codigo && (
                                <Badge variant="outline" className="text-xs ml-1">{varianteObj.codigo}</Badge>
                              )}
                            </span>
                          ) : 'Sin variante';
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin-variante" className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚫</span>
                          <span className="font-medium">{t('common.noSpecificVariant')}</span>
                        </div>
                      </SelectItem>
                      {variantes.map(variante => (
                        <SelectItem key={variante.id} value={variante.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{variante.icono}</span>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{variante.nombre}</span>
                                {variante.codigo && (
                                  <Badge variant="outline" className="text-xs">{variante.codigo}</Badge>
                                )}
                              </div>
                              {(variante.pesoUnitario || variante.valorPorKg) && (
                                <div className="flex gap-2 text-xs text-[#666666] mt-0.5">
                                  {variante.pesoUnitario && <span>⚖️ {variante.pesoUnitario}kg</span>}
                                  {variante.valorPorKg && <span>💰 ${variante.valorPorKg}/kg</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })()}

          {/* FILA 4: Nombre del Producto */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <Label className="text-[#555555] text-xs mb-2 block font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-[#4CAF50]">✏️</span> {t('common.productName')} *
              </Label>
              <Input
                placeholder={t('common.productNamePlaceholder')}
                value={formData.nombreProducto}
                onChange={(e) => setFormData({ ...formData, nombreProducto: e.target.value })}
                className="h-11 text-sm border-2 border-[#E0E0E0] hover:border-[#4CAF50] rounded-lg transition-colors font-medium"
              />
            </div>
          </div>

          {/* FILA 5: Detalles Opcionales */}
          <div className="border-2 border-[#F3E5F5] rounded-xl p-4 bg-gradient-to-br from-white to-[#FAFAFA] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <h3 className="font-bold text-[#333333] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('common.optionalDetails')}
              </h3>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <Label className="text-[#555555] text-xs mb-2 block font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.lotNumber')}
                </Label>
                <Input
                  placeholder="LOT-2024-001"
                  value={formData.lote}
                  onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                  className="h-10 text-sm border-2 rounded-lg"
                />
              </div>

              <div className="col-span-3">
                <Label className="text-[#555555] text-xs mb-2 block font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.expirationDate')}
                </Label>
                <Input
                  type="date"
                  value={formData.fechaCaducidad}
                  onChange={(e) => setFormData({ ...formData, fechaCaducidad: e.target.value })}
                  className="h-10 text-sm border-2 rounded-lg"
                />
              </div>

              <div className="col-span-3">
                <Label className="text-[#555555] text-xs mb-2 block font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Détails d'Emballage
                </Label>
                <Input
                  placeholder="Ex: 45x900ml, 24x500g"
                  value={formData.detallesEmpaque}
                  onChange={(e) => setFormData({ ...formData, detallesEmpaque: e.target.value })}
                  className="h-10 text-sm border-2 rounded-lg"
                />
              </div>

              <div className="col-span-3">
                <Label className="text-[#555555] text-xs mb-2 block font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.observations')}
                </Label>
                <Input
                  placeholder={t('common.observationsPlaceholder')}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="h-10 text-sm border-2 rounded-lg"
                />
              </div>
            </div>
          </div>

          </div>
          {/* Opciones y Botones de Acción */}
          <div className="border-t-2 border-[#E0E0E0] bg-white">
            <div className="px-6 py-3 bg-[#F9F9F9] border-b border-[#E0E0E0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="imprimir-auto"
                      checked={imprimirAutomaticamente}
                      onCheckedChange={(checked) => setImprimirAutomaticamente(checked as boolean)}
                    />
                    <label 
                      htmlFor="imprimir-auto" 
                      className="text-sm text-[#555555] cursor-pointer select-none flex items-center gap-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <Printer className="w-4 h-4 text-[#1E73BE]" />
                      <span>{t('common.printAutomatically')}</span>
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAyudaImpresionOpen(true)}
                    className="h-7 w-7 p-0 text-[#1E73BE] hover:bg-[#E3F2FD]"
                    title="Ayuda: Configuración de impresión automática"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
                {imprimirAutomaticamente && (
                  <Badge variant="default" className="bg-[#1E73BE] text-white text-xs animate-pulse">
                    🖨️ Se cerrará automáticamente tras imprimir
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between gap-4 px-6 py-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setProductosAgregados([]);
                    setOpen(false);
                  }}
                  className="h-11 px-8 border-2 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  ✖ {t('common.cancel')}
                </Button>
              </div>
              <div className="flex gap-3">
                {!imprimirAutomaticamente ? (
                  <>
                    <Button
                      onClick={() => handleSubmitAndPrint(true)}
                      variant="outline"
                      className="h-11 px-6 border-2 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir y Continuar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleSubmitAndPrint(true)}
                    variant="outline"
                    className="h-11 px-6 border-2 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir y Continuar
                  </Button>
                )}
                <Button
                  onClick={() => handleSubmit(false)}
                  className="h-11 px-8 bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#3d8b40] text-white text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  {imprimirAutomaticamente ? (
                    <>
                      <Printer className="w-4 h-4 mr-2" />
                      Registrar e Imprimir
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t('common.finishAndClose')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Diálogo para Nueva Subcategoría */}
    <Dialog open={nuevaSubcategoriaDialogOpen} onOpenChange={setNuevaSubcategoriaDialogOpen}>
      <DialogContent className="max-w-2xl" aria-describedby="nueva-subcategoria-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
            {categoriaSeleccionadaParaNueva ? (() => {
              const catObj = categoriasDB.find(c => c.id === categoriaSeleccionadaParaNueva || c.nombre === categoriaSeleccionadaParaNueva);
              return catObj ? `${catObj.icono} ${t('common.newSubcategoryIn')} ${catObj.nombre}` : t('common.newSubcategory');
            })() : t('common.newSubcategory')}
          </DialogTitle>
          <DialogDescription id="nueva-subcategoria-description" className="text-sm text-[#666666]">
            {categoriaSeleccionadaParaNueva 
              ? t('common.newSubcategoryDescription')
              : t('common.createNewSubcategory')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Seleccionar Categoría *</Label>
            <Select 
              value={categoriaSeleccionadaParaNueva} 
              onValueChange={setCategoriaSeleccionadaParaNueva}
              disabled={!!categoriaSeleccionadaParaNueva}
            >
              <SelectTrigger className={categoriaSeleccionadaParaNueva ? 'bg-[#F5F5F5]' : ''}>
                <SelectValue placeholder="Seleccionar categoría">
                  {categoriaSeleccionadaParaNueva && (() => {
                    const catObj = categoriasDB.find(c => c.id === categoriaSeleccionadaParaNueva || c.nombre === categoriaSeleccionadaParaNueva);
                    return catObj ? `${catObj.icono} ${catObj.nombre}` : categoriaSeleccionadaParaNueva;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categoriasDB.filter(c => c.activa).map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icono} {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoriaSeleccionadaParaNueva && (
              <p className="text-xs text-[#666666] mt-1">
                ℹ️ La categoría está bloqueada porque se seleccionó desde el formulario
              </p>
            )}
          </div>

          <div>
            <Label>Nombre de la Subcategoría *</Label>
            <Input
              value={formSubcategoria.nombre}
              onChange={(e) => {
                const nuevoNombre = e.target.value;
                const iconoGenerado = nuevoNombre ? generarIconoAutomatico(nuevoNombre) : '';
                setFormSubcategoria({ 
                  ...formSubcategoria, 
                  nombre: nuevoNombre,
                  icono: iconoGenerado
                });
              }}
              placeholder="Ej: Manzanas, Arroz, etc."
            />
            <p className="text-xs text-[#666666] mt-1.5 flex items-start gap-1.5">
              <span className="text-[#1E73BE]">ℹ️</span>
              <span>Puedes crear múltiples subcategorías con el mismo nombre pero diferente peso unitario</span>
            </p>
          </div>

          <div>
            <Label>Icono (Emoji) - Auto-generado</Label>
            <Input
              value={formSubcategoria.icono}
              onChange={(e) => setFormSubcategoria({ ...formSubcategoria, icono: e.target.value })}
              placeholder="🍎"
            />
            <p className="text-xs text-[#4CAF50] mt-1">✨ Icono generado automáticamente, puedes modificarlo si lo deseas</p>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formSubcategoria.descripcion}
              onChange={(e) => setFormSubcategoria({ ...formSubcategoria, descripcion: e.target.value })}
              placeholder="Descripción opcional..."
              rows={2}
            />
          </div>

          {/* Peso Unitario */}
          <div>
            <Label>Peso Unitario (kg) - Opcional</Label>
            <Input
              type="number"
              step="0.01"
              value={formSubcategoria.pesoUnitario || ''}
              onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoUnitario: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <p className="text-xs text-[#666666] mt-1">
              Peso predeterminado para esta subcategoría
            </p>
          </div>

          {/* Pesos por Unidad - Sección Expandible */}
          <div className="border rounded-lg p-3 bg-[#F8F9FA]">
            <button
              type="button"
              onClick={() => setDetallesOpcionalesAbiertos(!detallesOpcionalesAbiertos)}
              className="flex items-center justify-between w-full text-left"
            >
              <Label className="text-sm font-semibold text-[#333333] cursor-pointer">
                ⚖️ Pesos por Unidad (Opcional)
              </Label>
              {detallesOpcionalesAbiertos ? (
                <ChevronUp className="w-4 h-4 text-[#666666]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#666666]" />
              )}
            </button>
            
            {detallesOpcionalesAbiertos && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <Label className="text-xs">Paleta (PLT)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSubcategoria.pesoPLT || ''}
                    onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoPLT: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Caja (CJA)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSubcategoria.pesoCJA || ''}
                    onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoCJA: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Unidad (UND)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSubcategoria.pesoUND || ''}
                    onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoUND: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Saco (SAC)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSubcategoria.pesoSAC || ''}
                    onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoSAC: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Bac Noir (BN)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSubcategoria.pesoBN || ''}
                    onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoBN: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Kilogramo (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSubcategoria.pesoKg || ''}
                    onChange={(e) => setFormSubcategoria({ ...formSubcategoria, pesoKg: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setNuevaSubcategoriaDialogOpen(false);
                setCategoriaSeleccionadaParaNueva('');
                setFormSubcategoria({
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
                });
                setDetallesOpcionalesAbiertos(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={guardarNuevaSubcategoria} className="bg-[#4CAF50] hover:bg-[#45a049]">
              <Plus className="w-4 h-4 mr-2" />
              {t('common.createSubcategory')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Diálogo Nueva Variante */}
    <Dialog open={nuevaVarianteDialogOpen} onOpenChange={setNuevaVarianteDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="nueva-variante-description">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] flex items-center justify-center text-white text-2xl">
              ✨
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl">
                {t('common.newVariant')}
              </DialogTitle>
              <DialogDescription id="nueva-variante-description" className="text-sm mt-1">
                {t('common.newVariantDescription')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Nota informativa sobre productos y pesos */}
          <div className="bg-[#E3F2FD] border border-[#1E73BE] rounded-lg p-4 flex gap-3">
            <div className="text-[#1E73BE] mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#1E73BE]">
                <span className="font-medium">Nota importante:</span> Cuando la variante tiene un peso diferente se genera un producto diferente en el inventario.
              </p>
            </div>
          </div>

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
                  {t('common.variantName')}
                  <span className="text-[#DC3545]">*</span>
                </Label>
                <Input
                  value={formVariante.nombre}
                  onChange={(e) => setFormVariante({ ...formVariante, nombre: e.target.value })}
                  placeholder="Ej: Grande, 500ml, Marca Premium, Orgánico..."
                  className="h-11 text-base"
                />
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <span className="text-[#666666]">📋</span> {t('common.variantCode')}
                  <span className="text-xs text-[#999999] font-normal">({t('common.optional')})</span>
                </Label>
                <Input
                  value={formVariante.codigo}
                  onChange={(e) => setFormVariante({ ...formVariante, codigo: e.target.value })}
                  placeholder="VAR-001"
                  className="h-11"
                />
              </div>

              {/* Icono Visual */}
              <div className="space-y-2">
                <Label className="text-sm">{t('common.variantIcon')}</Label>
                <button
                  type="button"
                  className="w-full h-11 px-4 border rounded-lg flex items-center gap-3 hover:border-[#9C27B0] transition-colors bg-white"
                  onClick={() => {
                    const iconPicker = document.getElementById('iconPickerVariante');
                    if (iconPicker) {
                      iconPicker.classList.toggle('hidden');
                    }
                  }}
                >
                  <span className="text-2xl">{formVariante.icono}</span>
                  <span className="text-sm text-[#666666]">Seleccionar icono</span>
                </button>
              </div>
            </div>

            {/* Selector de Icono Expandible */}
            <div id="iconPickerVariante" className="hidden p-4 bg-[#F4F4F4] rounded-lg border border-gray-200">
              <p className="text-xs text-[#666666] mb-3">Selecciona un icono para identificar esta variante:</p>
              <div className="grid grid-cols-10 md:grid-cols-12 gap-2">
                {['📦', '🏷️', '⭐', '💎', '🎯', '🔵', '🟢', '🟡', '🟠', '🔴', '🟣', '🟤', '⚫', '⚪', '🔸', '🔹', '💠', '🎨', '✨', '🌟', '🍎', '🥕', '🥖', '🥛'].map((icono) => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => {
                      setFormVariante({ ...formVariante, icono });
                      document.getElementById('iconPickerVariante')?.classList.add('hidden');
                    }}
                    className={`p-2.5 text-xl border rounded-lg hover:scale-110 transition-transform ${
                      formVariante.icono === icono 
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
            
            {/* Unidad de Medida */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <span>📏</span> Unidad de Medida
              </Label>
              <Select 
                value={formVariante.unidad} 
                onValueChange={(value) => setFormVariante({ ...formVariante, unidad: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={`Usar unidad de subcategoría (${(() => {
                    const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
                    const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
                    return subcategoriaObj?.unidad || 'No definida';
                  })()})`} />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((unidad) => (
                    <SelectItem key={unidad.id} value={unidad.abreviatura}>
                      {unidad.icono} {unidad.nombre} ({unidad.abreviatura})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#666666] flex items-center gap-1">
                <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                {formVariante.unidad ? `Unidad específica: ${formVariante.unidad}` : `Se usará la unidad de la subcategoría: ${(() => {
                  const categoriaObj = categoriasDB.find(c => c.nombre === formData.categoria);
                  const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formData.subcategoria);
                  return subcategoriaObj?.unidad || 'No definida';
                })()}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso Unitario */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <span>⚖️</span> Peso Unitario (kg)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formVariante.pesoUnitario}
                  onChange={(e) => setFormVariante({ ...formVariante, pesoUnitario: e.target.value })}
                  placeholder="0.00"
                  className="h-11"
                />
                <p className="text-xs text-[#666666] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                  Dejar vacío para heredar de la subcategoría
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
                  value={formVariante.valorPorKg}
                  onChange={(e) => setFormVariante({ ...formVariante, valorPorKg: e.target.value })}
                  placeholder="0.00"
                  className="h-11"
                />
                <p className="text-xs text-[#666666] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#666666] rounded-full"></span>
                  Dejar vacío para heredar de la categoría
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
                value={formVariante.descripcion}
                onChange={(e) => setFormVariante({ ...formVariante, descripcion: e.target.value })}
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
                {formVariante.icono}
              </div>
              
              {/* Información */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-lg text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formVariante.nombre || 'Nombre de la variante'}
                  </h4>
                  {formVariante.codigo && (
                    <Badge variant="outline" className="text-xs bg-[#F4F4F4]">
                      {formVariante.codigo}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-[#666666] mt-1 flex items-center gap-1">
                  <span className="text-[#9C27B0]">↳</span>
                  {formData.subcategoria}
                </p>
                
                {formVariante.descripcion && (
                  <p className="text-xs text-[#666666] mt-2 italic">
                    "{formVariante.descripcion}"
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {formVariante.unidad && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F4] rounded-lg">
                      <span className="text-sm">📏</span>
                      <span className="text-sm font-medium">{formVariante.unidad}</span>
                    </div>
                  )}
                  {formVariante.pesoUnitario && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F4] rounded-lg">
                      <span className="text-sm">⚖️</span>
                      <span className="text-sm font-medium">{formVariante.pesoUnitario} kg</span>
                    </div>
                  )}
                  {formVariante.valorPorKg && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F4] rounded-lg">
                      <span className="text-sm">💰</span>
                      <span className="text-sm font-medium">${formVariante.valorPorKg}/kg</span>
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
                setNuevaVarianteDialogOpen(false);
                setFormVariante({
                  nombre: '',
                  codigo: '',
                  icono: '📦',
                  unidad: '',
                  valorPorKg: '',
                  pesoUnitario: '',
                  descripcion: ''
                });
              }}
              className="h-11 px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={guardarNuevaVariante}
              className="h-11 px-6 bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] hover:from-[#7B1FA2] hover:to-[#6A1B9A] text-white shadow-md"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <Save className="w-4 h-4 mr-2" />
              Crear Variante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Diálogo Gestión de Unidades */}
    <Dialog open={gestionUnidadesOpen} onOpenChange={setGestionUnidadesOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="gestion-unidades-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            📦 Gestión de Unidades
          </DialogTitle>
          <DialogDescription id="gestion-unidades-description">
            Administra las unidades de medida disponibles para el inventario
          </DialogDescription>
        </DialogHeader>
        <GestionUnidades />
      </DialogContent>
    </Dialog>

    {/* Diálogo de Ayuda - Configuración de Impresión Automática */}
    <Dialog open={ayudaImpresionOpen} onOpenChange={setAyudaImpresionOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="ayuda-impresion-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }} className="flex items-center gap-2 text-xl">
            <Printer className="w-6 h-6 text-[#1E73BE]" />
            Impresión Automática - Guía de Configuración
          </DialogTitle>
          <DialogDescription id="ayuda-impresion-description" className="text-sm mt-2">
            Cómo lograr impresión completamente automática sin diálogos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Funcionamiento Actual */}
          <div className="bg-[#E3F2FD] border-l-4 border-[#1E73BE] p-4 rounded">
            <h3 className="font-bold text-[#1E73BE] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Info className="w-4 h-4" />
              Funcionamiento Actual
            </h3>
            <p className="text-[#555555]">
              El sistema usa <strong>modo silencioso con iframe invisible</strong> para minimizar ventanas emergentes. 
              Sin embargo, por seguridad, los navegadores modernos pueden mostrar un diálogo de impresión la primera vez.
            </p>
          </div>

          {/* Google Chrome / Edge */}
          <div className="border-2 border-[#E0E0E0] rounded-lg p-4">
            <h3 className="font-bold text-[#333333] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              🌐 Google Chrome / Microsoft Edge
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-[#555555] ml-2">
              <li>Ve a <code className="bg-[#F4F4F4] px-2 py-1 rounded">chrome://settings/printing</code></li>
              <li>Selecciona tu <strong>impresora predeterminada</strong></li>
              <li>Activa <strong>"Usar configuración del sistema"</strong></li>
              <li>Reinicia el navegador</li>
            </ol>
          </div>

          {/* Firefox */}
          <div className="border-2 border-[#E0E0E0] rounded-lg p-4">
            <h3 className="font-bold text-[#333333] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              🦊 Mozilla Firefox
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-[#555555] ml-2">
              <li>Ve a <code className="bg-[#F4F4F4] px-2 py-1 rounded">about:config</code></li>
              <li>Busca <code className="bg-[#F4F4F4] px-2 py-1 rounded">print.always_print_silent</code></li>
              <li>Cámbialo a <strong>true</strong></li>
              <li>Reinicia Firefox</li>
            </ol>
          </div>

          {/* Modo Kiosco (Recomendado) */}
          <div className="bg-[#E8F5E9] border-l-4 border-[#4CAF50] p-4 rounded">
            <h3 className="font-bold text-[#4CAF50] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              ✨ Modo Kiosco (Recomendado para Terminales)
            </h3>
            <p className="text-[#555555] mb-2">
              Para impresión <strong>totalmente automática sin diálogos</strong>, ejecuta Chrome en modo kiosco:
            </p>
            <div className="bg-[#333333] text-[#4CAF50] p-3 rounded font-mono text-xs overflow-x-auto">
              chrome.exe --kiosk "http://tu-sistema.com" --kiosk-printing --disable-print-preview
            </div>
            <p className="text-xs text-[#666666] mt-2">
              ⚠️ Ideal para computadoras dedicadas al registro de entradas
            </p>
          </div>

          {/* Ventajas del Sistema */}
          <div className="border-2 border-[#4CAF50] rounded-lg p-4">
            <h3 className="font-bold text-[#4CAF50] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              ✅ Ventajas del Sistema Actual
            </h3>
            <ul className="space-y-1.5 text-[#555555]">
              <li className="flex items-start gap-2">
                <span className="text-[#4CAF50] mt-0.5">•</span>
                <span>Impresión automática con iframe invisible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4CAF50] mt-0.5">•</span>
                <span>No abre ventanas emergentes visibles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4CAF50] mt-0.5">•</span>
                <span>Cierre automático del formulario tras imprimir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4CAF50] mt-0.5">•</span>
                <span>Gestión individual de paletas con etiquetas únicas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4CAF50] mt-0.5">•</span>
                <span>Delay inteligente entre impresiones múltiples</span>
              </li>
            </ul>
          </div>

          {/* Notas Importantes */}
          <div className="bg-[#FFF3E0] border-l-4 border-[#FFC107] p-4 rounded">
            <h3 className="font-bold text-[#F57C00] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              ⚠️ Notas Importantes
            </h3>
            <ul className="space-y-1.5 text-[#555555] text-xs">
              <li>• Por seguridad, los navegadores pueden mostrar un diálogo la <strong>primera vez</strong></li>
              <li>• Asegúrate de tener una <strong>impresora predeterminada</strong> configurada</li>
              <li>• Para impresión 100% silenciosa, usa <strong>Modo Kiosco</strong></li>
              <li>• El sistema requiere que el navegador permita ventanas emergentes</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => setAyudaImpresionOpen(false)}
            className="bg-[#1E73BE] hover:bg-[#1565C0]"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Diálogo Crear Producto PRS */}
    <Dialog open={crearProductoPRSOpen} onOpenChange={setCrearProductoPRSOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="crear-producto-prs-description">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63] to-[#C2185B] flex items-center justify-center text-white text-2xl">
              🚚
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl">
                Créer un Produit PRS
              </DialogTitle>
              <DialogDescription id="crear-producto-prs-description" className="text-sm mt-1">
                Créez rapidement un produit dédié au Programme de Récupération Spéciale
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Información PRS */}
          <div className="bg-[#FCE4EC] border border-[#E91E63] rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-[#E91E63] mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#C2185B] font-medium mb-1">
                Produit Programme PRS
              </p>
              <p className="text-xs text-[#AD1457]">
                Les produits PRS sont automatiquement marqués et seront disponibles pour les entrées du programme de récupération spéciale.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nom du produit */}
            <div className="col-span-2">
              <Label className="text-sm font-medium">Nom du produit *</Label>
              <Input
                value={formProductoPRS.nombre}
                onChange={(e) => setFormProductoPRS({ ...formProductoPRS, nombre: e.target.value })}
                placeholder="Ex: Pain de blé entier"
                className="mt-1.5"
              />
            </div>

            {/* Catégorie */}
            <div>
              <Label className="text-sm font-medium">Catégorie *</Label>
              <Select
                value={formProductoPRS.categoria}
                onValueChange={(value) => {
                  setFormProductoPRS({ ...formProductoPRS, categoria: value, subcategoria: '' });
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasDB
                    .filter(cat => cat.activa)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.nombre}>
                        {cat.icono} {cat.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sous-catégorie */}
            <div>
              <Label className="text-sm font-medium">Sous-catégorie *</Label>
              <Select
                value={formProductoPRS.subcategoria}
                onValueChange={(value) => {
                  setFormProductoPRS({ ...formProductoPRS, subcategoria: value });
                  
                  // Auto-remplir unité depuis la subcategoría
                  const categoriaObj = categoriasDB.find(c => c.nombre === formProductoPRS.categoria);
                  const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === value);
                  if (subcategoriaObj?.unidad) {
                    setFormProductoPRS(prev => ({ ...prev, unidad: subcategoriaObj.unidad! }));
                  }
                }}
                disabled={!formProductoPRS.categoria}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner sous-catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {formProductoPRS.categoria &&
                    categoriasDB
                      .find(c => c.nombre === formProductoPRS.categoria)
                      ?.subcategorias?.filter(sub => sub.activa)
                      .map((sub) => (
                        <SelectItem key={sub.id} value={sub.nombre}>
                          {sub.icono} {sub.nombre}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variante (opcional) */}
            <div>
              <Label className="text-sm font-medium">Variante (optionnel)</Label>
              <Input
                value={formProductoPRS.varianteNombre}
                onChange={(e) => setFormProductoPRS({ ...formProductoPRS, varianteNombre: e.target.value })}
                placeholder="Ex: 500g, 1kg, Bio..."
                className="mt-1.5"
              />
            </div>

            {/* Unité */}
            <div>
              <Label className="text-sm font-medium">Unité *</Label>
              <Select
                value={formProductoPRS.unidad}
                onValueChange={(value) => setFormProductoPRS({ ...formProductoPRS, unidad: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner unité" />
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

            {/* Poids */}
            <div className="col-span-2">
              <Label className="text-sm font-medium">Poids unitaire (kg) *</Label>
              <Input
                type="number"
                step="0.001"
                value={formProductoPRS.peso}
                onChange={(e) => setFormProductoPRS({ ...formProductoPRS, peso: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 1.5"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Poids en kilogrammes d'une {formProductoPRS.unidad || 'unité'}
              </p>
            </div>

            {/* Icône */}
            <div className="col-span-2">
              <Label className="text-sm font-medium">Icône (optionnel)</Label>
              <Input
                value={formProductoPRS.icono}
                onChange={(e) => setFormProductoPRS({ ...formProductoPRS, icono: e.target.value })}
                placeholder="Ex: 🍞"
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setCrearProductoPRSOpen(false);
              setFormProductoPRS({
                nombre: '',
                categoria: '',
                subcategoria: '',
                varianteNombre: '',
                unidad: '',
                peso: 0,
                icono: '📦'
              });
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              // Validar
              if (!formProductoPRS.nombre || !formProductoPRS.categoria || !formProductoPRS.subcategoria || !formProductoPRS.unidad) {
                toast.error('Veuillez remplir tous les champs obligatoires');
                return;
              }
              if (formProductoPRS.peso <= 0) {
                toast.error('Le poids doit être supérieur à 0');
                return;
              }

              // Crear producto
              const categoriaObj = categoriasDB.find(c => c.nombre === formProductoPRS.categoria);
              const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === formProductoPRS.subcategoria);
              const iconoFinal = formProductoPRS.icono || subcategoriaObj?.icono || categoriaObj?.icono || '📦';
              
              const nombreFinal = formProductoPRS.varianteNombre 
                ? `${formProductoPRS.nombre} - ${formProductoPRS.varianteNombre}`
                : formProductoPRS.nombre;
              
              const codigoFinal = `PRS-${formProductoPRS.categoria.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

              const nuevoProducto: ProductoCreado = {
                id: Date.now().toString(),
                codigo: codigoFinal,
                nombre: nombreFinal,
                categoria: formProductoPRS.categoria,
                subcategoria: formProductoPRS.subcategoria,
                varianteNombre: formProductoPRS.varianteNombre || undefined,
                unidad: formProductoPRS.unidad,
                icono: iconoFinal,
                peso: formProductoPRS.peso,
                pesoUnitario: formProductoPRS.peso,
                stockActual: 0,
                stockMinimo: 0,
                ubicacion: 'PRS',
                lote: '',
                fechaVencimiento: '',
                esPRS: true,
                activo: true,
                fechaCreacion: new Date().toISOString()
              };

              console.log('💾 Guardando producto PRS:', nuevoProducto);
              guardarProducto(nuevoProducto);
              console.log('✅ Producto PRS guardado en localStorage');
              
              // Verificar que se guardó correctamente
              const productosEnStorage = obtenerProductosActivos();
              console.log('📦 Total productos en storage después de guardar:', productosEnStorage.length);
              console.log('🏷️ Productos PRS en storage:', productosEnStorage.filter(p => p.esPRS).length);
              
              // Disparar evento para actualizar la lista de productos
              window.dispatchEvent(new Event('productos-actualizados'));
              
              // Actualizar lista de productos
              setProductosDB(prev => [...prev, nuevoProducto]);
              
              // Seleccionar automáticamente el producto recién creado
              setFormData(prev => ({
                ...prev,
                productoId: nuevoProducto.id,
                nombreProducto: nuevoProducto.nombre,
                categoria: nuevoProducto.categoria,
                subcategoria: nuevoProducto.subcategoria,
                unidad: nuevoProducto.unidad,
                productoIcono: nuevoProducto.icono,
                peso: nuevoProducto.peso
              }));

              toast.success(`✅ Produit PRS créé: ${nombreFinal}`, { duration: 4000 });
              
              // Cerrar diálogo y limpiar
              setCrearProductoPRSOpen(false);
              setFormProductoPRS({
                nombre: '',
                categoria: '',
                subcategoria: '',
                varianteNombre: '',
                unidad: '',
                peso: 0,
                icono: '📦'
              });
            }}
            className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Save className="w-4 h-4 mr-2" />
            Créer le Produit PRS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}