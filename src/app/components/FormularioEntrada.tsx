import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PackagePlus, Save, X, Plus, Scale } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { guardarEntrada } from '../utils/entradaInventarioStorage';
import { obtenerCategorias, agregarSubcategoria, obtenerPesoUnitario, actualizarPesoUnitarioSubcategoria, obtenerDatosSubcategoria } from '../utils/categoriaStorage';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { obtenerContactosPorDepartamentoYTipo, type ContactoDepartamento } from '../utils/contactosDepartamentoStorage';
import type { Categoria, Subcategoria } from '../data/configuracionData';
import { generarIconoAutomatico } from '../utils/iconoUtils';
import { useBalanceContext } from '../../contexts/BalanceContext';

type FormularioEntradaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormEntrada = {
  // Información básica
  tipoEntrada: string;
  donadorId: string;
  
  // Producto
  categoria: string;
  subcategoria: string;
  
  // Cantidades
  cantidad: number;
  unidad: string;
  peso: number;
  
  // Detalles adicionales
  temperatura: 'ambiente' | 'refrigerado' | 'congelado' | '';
  fechaCaducidad: string;
  lote: string;
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

export function FormularioEntrada({ open, onOpenChange }: FormularioEntradaProps) {
  const { t } = useTranslation();
  
  // Hook de balanza desde context
  const { isConnected, currentWeight } = useBalanceContext();
  
  // Estados
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [programas, setProgramas] = useState<ProgramaEntrada[]>([]);
  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [dialogSubcategoria, setDialogSubcategoria] = useState(false);
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState({
    nombre: '',
    icono: '',
    unidad: '',
    pesoUnitario: 0,
    descripcion: ''
  });
  
  // Estado para datos heredados de la subcategoría
  const [datosHeredados, setDatosHeredados] = useState<{
    unidad?: string;
    pesoUnitario?: number;
    icono?: string;
    descripcion?: string;
  } | null>(null);
  
  const [formData, setFormData] = useState<FormEntrada>({
    tipoEntrada: '',
    donadorId: '',
    categoria: '',
    subcategoria: '',
    cantidad: 0,
    unidad: '',
    peso: 0,
    temperatura: '',
    fechaCaducidad: '',
    lote: '',
    observaciones: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      const cats = obtenerCategorias();
      const progs = obtenerProgramasActivos();
      
      // 🎯 OBTENER CONTACTOS REALES: donadores y fournisseurs del departamento Entrepôt (ID='2')
      const contactosEntrepot = obtenerContactosPorDepartamentoYTipo('2', ['donador', 'fournisseur']);
      
      setCategorias(cats.filter(c => c.activa));
      setProgramas(progs);
      setContactos(contactosEntrepot);
      
      console.log('📋 Contactos cargados:', contactosEntrepot.length, contactosEntrepot);
    }
  }, [open]);

  // 🔄 Escuchar cambios en contactos (cuando se agregan/editan desde Gestión de Contactos)
  useEffect(() => {
    const handleContactosActualizados = () => {
      const contactosActualizados = obtenerContactosPorDepartamentoYTipo('2', ['donador', 'fournisseur']);
      setContactos(contactosActualizados);
      console.log('🔄 Contactos actualizados automáticamente:', contactosActualizados.length);
    };

    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    window.addEventListener('contactos-restaurados', handleContactosActualizados);

    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('contactos-restaurados', handleContactosActualizados);
    };
  }, []);

  // Limpiar donadorId cuando cambia el tipo de entrada y el contacto seleccionado ya no es válido
  useEffect(() => {
    if (formData.tipoEntrada && formData.donadorId) {
      const contactoSeleccionado = contactos.find(c => c.id === formData.donadorId);
      
      // Si el contacto seleccionado no es del tipo permitido, limpiarlo
      if (contactoSeleccionado) {
        const tipoPermitido = 
          formData.tipoEntrada.toLowerCase() === 'ach' || formData.tipoEntrada.toLowerCase() === 'achat'
            ? 'fournisseur'
            : formData.tipoEntrada.toLowerCase() === 'don'
              ? 'donador'
              : null;
        
        if (tipoPermitido && contactoSeleccionado.tipo !== tipoPermitido) {
          const nombreContacto = contactoSeleccionado.nombreEmpresa || `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}`;
          const tipoContactoTexto = contactoSeleccionado.tipo === 'donador' ? 'donateur' : 'fournisseur';
          const tipoRequeridoTexto = tipoPermitido === 'donador' ? 'donateur' : 'fournisseur';
          
          toast.info(
            `🔄 "${nombreContacto}" est un ${tipoContactoTexto}. Veuillez sélectionner un ${tipoRequeridoTexto} pour ce type d'entrée.`,
            { duration: 4000 }
          );
          
          setFormData(prev => ({ ...prev, donadorId: '' }));
        }
      }
    }
  }, [formData.tipoEntrada, formData.donadorId, contactos]);

  // Cuando cambia la categoría, actualizar subcategorías y limpiar datos heredados
  useEffect(() => {
    if (formData.categoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      if (categoriaSeleccionada && categoriaSeleccionada.subcategorias) {
        setSubcategorias(categoriaSeleccionada.subcategorias.filter(s => s.activa));
      } else {
        setSubcategorias([]);
      }
      setFormData(prev => ({ ...prev, subcategoria: '', unidad: '', peso: 0 }));
      setDatosHeredados(null);
    }
  }, [formData.categoria, categorias]);

  // Actualizar automáticamente unidad y peso cuando se selecciona una subcategoría
  useEffect(() => {
    if (formData.categoria && formData.subcategoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      const subcategoriaSeleccionada = categoriaSeleccionada?.subcategorias?.find(
        s => s.nombre === formData.subcategoria
      );
      
      if (subcategoriaSeleccionada) {
        // Guardar TODOS los datos heredados para mostrar en badges
        const nuevosHeredados = {
          unidad: subcategoriaSeleccionada.unidad,
          pesoUnitario: subcategoriaSeleccionada.pesoUnitario,
          icono: subcategoriaSeleccionada.icono,
          descripcion: subcategoriaSeleccionada.descripcion
        };
        
        setDatosHeredados(nuevosHeredados);
        
        // FORZAR actualización inmediata del formData
        setFormData(prev => {
          const actualizado = { ...prev };
          
          // Si la subcategoría tiene una unidad definida, auto-llenar el campo unidad
          if (subcategoriaSeleccionada.unidad && subcategoriaSeleccionada.unidad.trim() !== '') {
            actualizado.unidad = subcategoriaSeleccionada.unidad;
          }
          
          // ⚠️ EXCEPCIÓN PALETA: NO auto-calcular peso para PLT
          // El peso de paleta siempre se ingresa manualmente o desde balanza
          if (subcategoriaSeleccionada.unidad === 'PLT') {
            actualizado.peso = 0; // Resetear peso para entrada manual
          } else if (subcategoriaSeleccionada.pesoUnitario && subcategoriaSeleccionada.pesoUnitario > 0 && prev.cantidad > 0) {
            // Si tiene peso unitario Y ya hay cantidad, auto-calcular peso (solo para NO paletas)
            const pesoCalculado = prev.cantidad * subcategoriaSeleccionada.pesoUnitario;
            actualizado.peso = parseFloat(pesoCalculado.toFixed(1));
          }
          
          return actualizado;
        });
      } else {
        setDatosHeredados(null);
      }
    } else {
      setDatosHeredados(null);
    }
  }, [formData.categoria, formData.subcategoria, categorias]);

  // Auto-capturar peso de balanza cuando la unidad es PLT
  // El peso capturado se considera como PESO UNITARIO (peso de 1 paleta)
  // Si hay cantidad, se multiplica automáticamente
  useEffect(() => {
    if (formData.unidad === 'PLT' && isConnected && currentWeight && currentWeight.stable && currentWeight.weight > 0) {
      // Calcular el peso total esperado basado en la cantidad
      const pesoUnitarioBalanza = currentWeight.weight;
      const cantidadActual = formData.cantidad > 0 ? formData.cantidad : 1;
      const pesoTotalCalculado = pesoUnitarioBalanza * cantidadActual;
      
      // Solo actualizar si el peso cambió significativamente (más de 0.01 kg de diferencia = 10g)
      const diferencia = Math.abs(formData.peso - pesoTotalCalculado);
      if (diferencia > 0.01) {
        setFormData(prev => {
          // Si no hay cantidad, establecer 1 paleta por defecto
          const nuevaCantidad = prev.cantidad > 0 ? prev.cantidad : 1;
          
          return {
            ...prev,
            cantidad: nuevaCantidad,
            peso: parseFloat(pesoTotalCalculado.toFixed(3))
          };
        });
        
        if (cantidadActual === 1) {
          toast.success(`⚖️ Peso unitario capturado: ${pesoUnitarioBalanza.toFixed(3)} kg/PLT`, {
            duration: 2000
          });
        } else {
          toast.success(`⚖️ Peso capturado: ${pesoUnitarioBalanza.toFixed(3)} kg × ${cantidadActual} PLT = ${pesoTotalCalculado.toFixed(3)} kg`, {
            duration: 3000
          });
        }
      }
    }
  }, [formData.unidad, isConnected, currentWeight?.stable, currentWeight?.weight, formData.cantidad]);

  // Auto-calcular peso cuando cambia la cantidad (si existe peso unitario)
  // ⚠️ EXCEPCIÓN: NO auto-calcular para PALETA (PLT)
  useEffect(() => {
    if (formData.categoria && formData.subcategoria && formData.cantidad > 0) {
      // Buscar la subcategoría directamente en el estado
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      const subcategoriaSeleccionada = categoriaSeleccionada?.subcategorias?.find(
        s => s.nombre === formData.subcategoria
      );
      
      // ⚠️ NO calcular peso automáticamente para PALETA
      if (formData.unidad === 'PLT') {
        return;
      }
      
      if (subcategoriaSeleccionada && subcategoriaSeleccionada.pesoUnitario && subcategoriaSeleccionada.pesoUnitario > 0) {
        const pesoCalculado = formData.cantidad * subcategoriaSeleccionada.pesoUnitario;
        setFormData(prev => ({ 
          ...prev, 
          peso: parseFloat(pesoCalculado.toFixed(1)) 
        }));
      }
    }
  }, [formData.cantidad, formData.categoria, formData.subcategoria, formData.unidad, categorias]);

  const limpiarFormulario = useCallback(() => {
    setFormData({
      tipoEntrada: '',
      donadorId: '',
      categoria: '',
      subcategoria: '',
      cantidad: 0,
      unidad: '',
      peso: 0,
      temperatura: '',
      fechaCaducidad: '',
      lote: '',
      observaciones: ''
    });
  }, []);

  const abrirDialogSubcategoria = useCallback(() => {
    if (!formData.categoria) {
      toast.error('Primero selecciona una categoría');
      return;
    }
    
    const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
    setNuevaSubcategoria({
      nombre: '',
      icono: categoriaSeleccionada?.icono || '📦',
      unidad: '',
      pesoUnitario: 0,
      descripcion: ''
    });
    setDialogSubcategoria(true);
  }, [formData.categoria, categorias]);

  // 🤖 Auto-generar icono cuando se escribe el nombre de la subcategoría
  useEffect(() => {
    if (nuevaSubcategoria.nombre && nuevaSubcategoria.nombre.length > 2) {
      const iconoGenerado = generarIconoAutomatico(nuevaSubcategoria.nombre);
      const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
      const iconoPorDefecto = categoriaSeleccionada?.icono || '📦';
      
      // Si encontró un icono específico diferente al genérico, usarlo
      if (iconoGenerado !== '📦') {
        setNuevaSubcategoria(prev => ({
          ...prev,
          icono: iconoGenerado
        }));
      } else if (nuevaSubcategoria.icono === '📦') {
        // Si no encontró uno específico, mantener el de la categoría
        setNuevaSubcategoria(prev => ({
          ...prev,
          icono: iconoPorDefecto
        }));
      }
    }
  }, [nuevaSubcategoria.nombre, formData.categoria, categorias]);

  const guardarNuevaSubcategoria = useCallback(() => {
    if (!nuevaSubcategoria.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
    if (!categoriaSeleccionada) {
      toast.error('No se encontró la categoría');
      return;
    }

    const subcategoriaCreada = agregarSubcategoria(categoriaSeleccionada.id, {
      nombre: nuevaSubcategoria.nombre,
      icono: nuevaSubcategoria.icono || categoriaSeleccionada.icono,
      activa: true,
      pesoUnitario: nuevaSubcategoria.pesoUnitario,
      unidad: nuevaSubcategoria.unidad,
      descripcion: nuevaSubcategoria.descripcion
    });

    if (subcategoriaCreada) {
      toast.success('✅ Subcategoría creada: ' + nuevaSubcategoria.nombre);
      
      const categoriasActualizadas = obtenerCategorias();
      setCategorias(categoriasActualizadas.filter(c => c.activa));
      
      setFormData(prev => ({ ...prev, subcategoria: subcategoriaCreada.nombre }));
      
      setDialogSubcategoria(false);
    } else {
      toast.error('❌ Ya existe una subcategoría con ese nombre y peso unitario');
    }
  }, [nuevaSubcategoria, categorias, formData.categoria]);

  const generarCodigoProducto = useCallback((): string => {
    const timestamp = Date.now().toString().slice(-6);
    const categoriaInicial = formData.categoria.substring(0, 3).toUpperCase();
    return `${categoriaInicial}-${timestamp}`;
  }, [formData.categoria]);

  const handleSubmit = useCallback((mantenerAbierto: boolean = false) => {
    // Validaciones
    if (!formData.tipoEntrada) {
      toast.error('El tipo de entrada es requerido');
      return;
    }
    
    if (!formData.donadorId) {
      toast.error('El donador/proveedor es requerido');
      return;
    }
    
    if (!formData.categoria) {
      toast.error('La categoría es requerida');
      return;
    }
    
    if (!formData.subcategoria) {
      toast.error('La subcategoría es requerida');
      return;
    }
    
    if (formData.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (!formData.unidad) {
      toast.error('La unidad es requerida');
      return;
    }

    if (formData.peso <= 0) {
      toast.error('El peso debe ser mayor a 0');
      return;
    }

    // Actualizar peso unitario en la configuración para futuras entradas
    const actualizado = actualizarPesoUnitarioSubcategoria(
      formData.categoria,
      formData.subcategoria,
      formData.cantidad,
      formData.peso,
      formData.unidad
    );

    if (actualizado) {
      const categoriasActualizadas = obtenerCategorias();
      setCategorias(categoriasActualizadas.filter(c => c.activa));
      
      // Solo mostrar mensaje de memorización si no es paleta (PLT no se memoriza)
      if (formData.unidad !== 'PLT') {
        toast.success(`💡 Peso unitario memorizado para ${formData.subcategoria}`);
      }
    }

    // Obtener datos necesarios
    const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
    const subcategoriaSeleccionada = subcategorias.find(s => s.nombre === formData.subcategoria);
    const programaSeleccionado = programas.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);
    const donadorSeleccionado = contactos.find(c => c.id === formData.donadorId);

    if (!categoriaSeleccionada || !subcategoriaSeleccionada) {
      toast.error('Error: categoría o subcategoría no encontrada');
      return;
    }

    // Calcular peso unitario (kg por unidad)
    const pesoUnitario = formData.cantidad > 0 ? formData.peso / formData.cantidad : 0;

    // Construir el objeto de entrada completo con TODOS los campos requeridos
    const entrada = {
      fecha: new Date().toISOString(),
      tipoEntrada: formData.tipoEntrada,
      programaNombre: programaSeleccionado?.nombre || formData.tipoEntrada,
      programaCodigo: programaSeleccionado?.codigo || formData.tipoEntrada.toUpperCase(),
      programaColor: programaSeleccionado?.color || '#1E73BE',
      programaIcono: programaSeleccionado?.icono || '📦',
      
      // Información del donador/proveedor
      donadorId: formData.donadorId,
      donadorNombre: donadorSeleccionado 
        ? (donadorSeleccionado.nombreEmpresa || `${donadorSeleccionado.nombre} ${donadorSeleccionado.apellido || ''}`.trim())
        : 'Donador no registrado',
      donadorEsCustom: false,
      
      // Información del producto
      productoId: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nombreProducto: `${formData.categoria} - ${formData.subcategoria}`,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria,
      productoCategoria: formData.categoria,
      productoSubcategoria: formData.subcategoria,
      productoIcono: subcategoriaSeleccionada.icono || categoriaSeleccionada.icono,
      productoCodigo: generarCodigoProducto(),
      
      // Cantidades
      cantidad: formData.cantidad,
      unidad: formData.unidad,
      pesoUnidad: pesoUnitario,
      pesoTotal: formData.peso,
      
      // Temperatura
      temperatura: (formData.temperatura || 'ambiente') as 'ambiente' | 'refrigerado' | 'congelado',
      
      // Detalles opcionales
      lote: formData.lote,
      fechaCaducidad: formData.fechaCaducidad,
      observaciones: formData.observaciones,
      
      // Metadata
      creadoPor: 'Usuario Actual'
    };

    // ✅ SOLO llamar a guardarEntrada() - Esta función hace TODO automáticamente:
    // - Crea o actualiza el producto en localStorage
    // - Actualiza el stock
    // - Registra el movimiento
    // - Guarda en el historial
    guardarEntrada(entrada);

    toast.success('✅ Entrada registrada correctamente');
    
    // Emitir evento para actualizar el historial en tiempo real
    window.dispatchEvent(new Event('entradaGuardada'));
    
    if (!mantenerAbierto) {
      limpiarFormulario();
      onOpenChange(false);
    } else {
      // Si se mantiene abierto, limpiar solo los campos del producto, manteniendo donador y tipo
      const donadorId = formData.donadorId;
      const tipoEntrada = formData.tipoEntrada;
      
      limpiarFormulario();
      
      // Restaurar donador y tipo de entrada
      setFormData(prev => ({
        ...prev,
        donadorId,
        tipoEntrada
      }));
      
      toast.info('📝 Listo para registrar otra entrada al mismo donador');
    }
  }, [formData, categorias, subcategorias, programas, generarCodigoProducto, limpiarFormulario, onOpenChange]);

  const categoriaSeleccionada = categorias.find(c => c.nombre === formData.categoria);
  const programaSeleccionado = programas.find(p => p.codigo.toLowerCase() === formData.tipoEntrada);

  // Determinar qué tipos de contactos mostrar según el programa de entrada
  const tipoContactoPermitido = useMemo(() => {
    if (!formData.tipoEntrada) return null;
    
    const tipoLower = formData.tipoEntrada.toLowerCase();
    
    // ACH/ACHAT → solo fournisseurs
    if (tipoLower === 'ach' || tipoLower === 'achat') {
      return 'fournisseur';
    }
    
    // DON → solo donadores
    if (tipoLower === 'don') {
      return 'donador';
    }
    
    // CPN → ambos tipos (donadores y fournisseurs)
    if (tipoLower === 'cpn') {
      return null; // null = mostrar todos
    }
    
    // Otros programas → mostrar ambos
    return null;
  }, [formData.tipoEntrada]);

  // Filtrar contactos según el tipo de entrada
  const contactosFiltrados = useMemo(() => {
    if (!tipoContactoPermitido) return contactos;
    return contactos.filter(c => c.tipo === tipoContactoPermitido);
  }, [contactos, tipoContactoPermitido]);
  
  // Debug: Mostrar información de filtrado en consola
  useEffect(() => {
    if (formData.tipoEntrada) {
      console.log('🔍 Filtrado de contactos:', {
        tipoEntrada: formData.tipoEntrada,
        tipoPermitido: tipoContactoPermitido,
        totalContactos: contactos.length,
        contactosFiltrados: contactosFiltrados.length,
        contactosFiltradosDetalle: contactosFiltrados.map(c => ({
          id: c.id,
          nombre: c.nombreEmpresa || `${c.nombre} ${c.apellido}`,
          tipo: c.tipo
        }))
      });
    }
  }, [formData.tipoEntrada, tipoContactoPermitido, contactos, contactosFiltrados]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-white to-gray-50" aria-describedby="formulario-entrada-description">
          {/* Header Moderno */}
          <DialogHeader className="px-8 pt-6 pb-4 border-b bg-white/80 backdrop-blur-sm shrink-0">
            <DialogDescription id="formulario-entrada-description" className="sr-only">
              Formulario para registrar nuevas entradas de inventario en el almacén
            </DialogDescription>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1E73BE] to-[#1557a0] flex items-center justify-center shadow-lg">
                <PackagePlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                  {t('inventory.newEntry') || 'Nueva Entrada de Inventario'}
                </DialogTitle>
                <p className="text-sm text-[#666666] mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Registra productos recibidos en el almacén
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Contenido del formulario con scroll */}
          <div className="px-8 py-6 flex-1 overflow-y-auto space-y-6">
            {/* Sección 1: Información Básica */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Información Básica
                  </h3>
                  <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Tipo de entrada y procedencia
                  </p>
                </div>
              </div>
                
              <div className="grid grid-cols-2 gap-5">
                {/* Tipo de Entrada */}
                <div className="space-y-2">
                  <Label htmlFor="tipoEntrada" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.entryType') || 'Tipo de Entrada'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <Select 
                    value={formData.tipoEntrada} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipoEntrada: value }))}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                      <SelectValue placeholder="Seleccionar tipo de entrada..." />
                    </SelectTrigger>
                    <SelectContent>
                      {programas.map(programa => (
                        <SelectItem key={programa.id} value={programa.codigo.toLowerCase()}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{programa.icono}</span>
                            <span>{programa.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {programaSeleccionado && (
                    <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{programaSeleccionado.icono}</span>
                        <span className="text-xs text-[#1E73BE] font-medium">{programaSeleccionado.nombre}</span>
                      </div>
                      {tipoContactoPermitido && (
                        <Badge 
                          variant="secondary" 
                          className="text-[9px] px-2 py-0.5"
                          style={{
                            backgroundColor: tipoContactoPermitido === 'fournisseur' ? '#E3F2FD' : '#E8F5E9',
                            color: tipoContactoPermitido === 'fournisseur' ? '#1976D2' : '#2E7D32'
                          }}
                        >
                          {tipoContactoPermitido === 'fournisseur' ? '📦 Fournisseurs' : '🎁 Donateurs'}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Donador/Proveedor */}
                <div className="space-y-2">
                  <Label htmlFor="donador" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {tipoContactoPermitido === 'fournisseur' 
                      ? '📦 Fournisseur' 
                      : tipoContactoPermitido === 'donador' 
                        ? '🎁 Donateur' 
                        : (t('common.donorProvider') || 'Fournisseur / Donateur')}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                    {tipoContactoPermitido && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: tipoContactoPermitido === 'fournisseur' ? '#E3F2FD' : '#E8F5E9',
                          borderColor: tipoContactoPermitido === 'fournisseur' ? '#2196F3' : '#4CAF50',
                          color: tipoContactoPermitido === 'fournisseur' ? '#1976D2' : '#2E7D32'
                        }}
                      >
                        Filtré: {tipoContactoPermitido === 'fournisseur' ? 'Fournisseurs seulement' : 'Donateurs seulement'}
                      </Badge>
                    )}
                  </Label>
                  <Select 
                    value={formData.donadorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, donadorId: value }))}
                    disabled={!formData.tipoEntrada}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                      <SelectValue placeholder={
                        !formData.tipoEntrada 
                          ? "Sélectionner d'abord un type d'entrée..."
                          : tipoContactoPermitido === 'fournisseur'
                            ? "Sélectionner un fournisseur..."
                            : tipoContactoPermitido === 'donador'
                              ? "Sélectionner un donateur..."
                              : "Sélectionner fournisseur ou donateur..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {contactosFiltrados.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          {tipoContactoPermitido === 'fournisseur' 
                            ? 'Aucun fournisseur disponible'
                            : tipoContactoPermitido === 'donador'
                              ? 'Aucun donateur disponible'
                              : 'Aucun contact disponible'}
                        </SelectItem>
                      ) : (
                        <>
                          {contactosFiltrados
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
                                    <span>{icono}</span>
                                    <span className="font-medium">{nombreCompleto}</span>
                                    {contacto.telefono && (
                                      <span className="text-xs text-gray-500">• {contacto.telefono}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {/* Contador de contactos */}
                  {formData.tipoEntrada && contactosFiltrados.length > 0 && (
                    <div className="flex gap-3 text-xs text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        {tipoContactoPermitido === 'fournisseur' && <span>📦</span>}
                        {tipoContactoPermitido === 'donador' && <span>🎁</span>}
                        <span>{contactosFiltrados.length} {tipoContactoPermitido === 'fournisseur' ? 'fournisseur(s)' : 'donateur(s)'} disponible(s)</span>
                      </span>
                    </div>
                  )}
                  {formData.tipoEntrada && contactosFiltrados.length === 0 && (
                    <div className="flex gap-2 text-xs text-orange-600 mt-1 bg-orange-50 p-2 rounded border border-orange-200">
                      <span>⚠️</span>
                      <span>Aucun {tipoContactoPermitido === 'fournisseur' ? 'fournisseur' : 'donateur'} disponible. Veuillez ajouter un contact dans Gestion de Contactos.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Producto */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Información del Producto
                  </h3>
                  <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Categoría y subcategoría del producto
                  </p>
                </div>
              </div>
                
              <div className="grid grid-cols-2 gap-5">
                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.category') || 'Categoría'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                      <SelectValue placeholder="Seleccionar categoría..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.nombre}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{categoria.icono}</span>
                            <span>{categoria.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoriaSeleccionada && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-lg">{categoriaSeleccionada.icono}</span>
                      <span className="text-xs text-[#4CAF50] font-medium">{categoriaSeleccionada.nombre}</span>
                    </div>
                  )}
                </div>

                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label htmlFor="subcategoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.subcategory') || 'Subcategoría'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.subcategoria} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoria: value }))}
                      disabled={!formData.categoria}
                    >
                      <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE] flex-1">
                        <SelectValue placeholder="Seleccionar subcategoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategorias.map(subcategoria => {
                          // Obtener datos guardados de la subcategoría
                          const datosGuardados = obtenerDatosSubcategoria(formData.categoria, subcategoria.nombre);
                          
                          return (
                            <SelectItem key={subcategoria.id} value={subcategoria.nombre}>
                              <div className="flex items-center gap-2 w-full justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{subcategoria.icono}</span>
                                  <span>{subcategoria.nombre}</span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  {/* Mostrar unidad directamente de subcategoria o de datosGuardados */}
                                  {(subcategoria.unidad || datosGuardados?.unidad) && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                      {subcategoria.unidad || datosGuardados?.unidad}
                                    </Badge>
                                  )}
                                  {/* Mostrar peso unitario */}
                                  {((subcategoria.pesoUnitario && subcategoria.pesoUnitario > 0) || 
                                    (datosGuardados?.pesoUnitario && datosGuardados.pesoUnitario > 0)) && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200 font-medium">
                                      {(subcategoria.pesoUnitario || datosGuardados?.pesoUnitario)?.toFixed(1)} kg
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={abrirDialogSubcategoria}
                      disabled={!formData.categoria}
                      className="h-11 w-11 flex items-center justify-center rounded-md bg-[#4CAF50] hover:bg-[#388E3C] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Crear nueva subcategoría"
                      style={{ minWidth: '44px' }}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {!formData.categoria && (
                    <p className="text-xs text-[#999999]">Primero selecciona una categoría</p>
                  )}
                  {/* Mostrar badge si hay datos heredados */}
                  {datosHeredados && (formData.subcategoria) && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-blue-600">💾</span>
                      <div className="flex-1 text-xs">
                        {datosHeredados.unidad && (
                          <span className="text-blue-700 font-medium">
                            Unidad guardada: <strong>{datosHeredados.unidad}</strong>
                          </span>
                        )}
                        {datosHeredados.unidad && datosHeredados.pesoUnitario && datosHeredados.pesoUnitario > 0 && (
                          <span className="text-blue-700"> • </span>
                        )}
                        {datosHeredados.pesoUnitario && datosHeredados.pesoUnitario > 0 && (
                          <span className="text-blue-700 font-medium">
                            Peso: <strong>{datosHeredados.pesoUnitario.toFixed(1)} kg</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
                
              {/* Botón Grande para Nueva Subcategoría */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {formData.categoria ? (
                  <button
                    type="button"
                    onClick={abrirDialogSubcategoria}
                    className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#4CAF50] bg-green-50 hover:bg-green-100 text-[#4CAF50] hover:text-[#388E3C] transition-all group"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-[#4CAF50] group-hover:bg-[#388E3C] flex items-center justify-center transition-colors">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm">
                      ¿No encuentras la subcategoría? Crear nueva en "{categoriaSeleccionada?.nombre}"
                    </span>
                  </button>
                ) : (
                  <div className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                      Selecciona una categoría para crear subcategorías
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 3: Cantidades */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Cantidades
                  </h3>
                  <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Cantidad, unidad y peso del producto
                  </p>
                </div>
              </div>
                
              <div className="grid grid-cols-3 gap-5">
                {/* Cantidad */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.quantity') || 'Cantidad'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cantidad"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.cantidad || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      className="h-11 text-sm pr-10 border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-xs">
                      #
                    </div>
                  </div>
                </div>

                {/* Unidad */}
                <div className="space-y-2">
                  <Label htmlFor="unidad" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.unit') || 'Unidad'}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                  </Label>
                  <Select 
                    key={`unidad-${formData.unidad}-${formData.subcategoria}`}
                    value={formData.unidad} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unidad: value }))}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                      <SelectValue placeholder="Unidad..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map(unidad => (
                        <SelectItem key={unidad.id} value={unidad.abreviatura}>
                          <div className="flex items-center justify-between gap-3">
                            <span>{unidad.nombre}</span>
                            <Badge variant="outline" className="text-[10px]">{unidad.abreviatura}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.unidad && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <span>✓</span>
                      <span>Unidad seleccionada: {formData.unidad}</span>
                    </div>
                  )}
                </div>

                {/* Peso */}
                <div className="space-y-2">
                  <Label htmlFor="peso" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formData.unidad === 'PLT' ? 'Peso Total' : (t('common.weight') || 'Peso')}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                    {formData.unidad === 'PLT' && isConnected && currentWeight && currentWeight.stable && (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 animate-pulse">
                        ⚖️ Peso unitario: {currentWeight.weight.toFixed(3)} kg/PLT
                      </Badge>
                    )}
                    {formData.unidad === 'PLT' && isConnected && currentWeight && !currentWeight.stable && (
                      <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                        ⚖️ Estabilizando...
                      </Badge>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="peso"
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.peso || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, peso: parseFloat(e.target.value) || 0 }))}
                      placeholder={formData.unidad === 'PLT' ? 'Peso calculado automáticamente...' : '0.000'}
                      className="h-11 text-sm pr-10 border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE] bg-white"
                      readOnly={formData.unidad === 'PLT' && isConnected && currentWeight?.stable}
                      style={formData.unidad === 'PLT' && isConnected && currentWeight?.stable ? { backgroundColor: '#f0fdf4' } : {}}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-xs font-medium pointer-events-none">
                      kg
                    </div>
                  </div>
                  
                  {/* Indicador de estado de balanza */}
                  {formData.unidad === 'PLT' && (
                    <div className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-green-50">
                      {isConnected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                            <span className="text-sm text-green-700 font-semibold">⚖️ Balance connectée - Captura automática activée</span>
                          </div>
                          {currentWeight && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 ml-5">
                              <Scale className="h-3 w-3" />
                              <span>
                                Poids unitaire (1 PLT): <strong className="text-green-700">{currentWeight.weight.toFixed(3)} {currentWeight.unit}</strong>
                                {currentWeight.stable ? (
                                  <span className="ml-2 text-green-600">✓ Stable</span>
                                ) : (
                                  <span className="ml-2 text-yellow-600">⏳ Stabilisation en cours...</span>
                                )}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 ml-5 space-y-1">
                            <div>💡 Le poids unitaire se capture automatiquement depuis la balance</div>
                            <div className="ml-4">→ Poids total = Poids unitaire × Quantité de palettes</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-orange-400"></div>
                          <span className="text-sm text-orange-700">
                            ⚠️ Balance déconnectée - 
                            <button 
                              type="button" 
                              onClick={() => toast.info('Allez dans Configuración → Balance pour connecter la balance', { duration: 4000 })} 
                              className="ml-1 underline hover:text-orange-800 font-medium"
                            >
                              Connecter maintenant
                            </button>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info de peso calculado */}
              {formData.cantidad > 0 && formData.peso > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">💡</span>
                    <div className="text-xs text-purple-700 font-medium space-y-1">
                      <div>Peso unitario: {(formData.peso / formData.cantidad).toFixed(3)} kg/{formData.unidad || 'unidad'}</div>
                      {formData.unidad === 'PLT' && formData.cantidad > 1 && (
                        <div className="text-purple-600">
                          → {formData.cantidad} palettes × {(formData.peso / formData.cantidad).toFixed(3)} kg = {formData.peso.toFixed(3)} kg total
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 4: Detalles Adicionales */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Detalles Adicionales
                  </h3>
                  <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Información complementaria (opcional)
                  </p>
                </div>
              </div>
                
              <div className="grid grid-cols-3 gap-5">
                {/* Temperatura */}
                <div className="space-y-2">
                  <Label htmlFor="temperatura" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.temperature') || 'Temperatura'}
                  </Label>
                  <Select 
                    value={formData.temperatura} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, temperatura: value }))}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambiente">
                        <div className="flex items-center gap-2">
                          <span>🌡️</span>
                          <span>Ambiente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="refrigerado">
                        <div className="flex items-center gap-2">
                          <span>❄️</span>
                          <span>Refrigerado</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="congelado">
                        <div className="flex items-center gap-2">
                          <span>🧊</span>
                          <span>Congelado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha de Caducidad */}
                <div className="space-y-2">
                  <Label htmlFor="fechaCaducidad" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.expiryDate') || 'Fecha Caducidad'}
                  </Label>
                  <Input
                    id="fechaCaducidad"
                    type="date"
                    value={formData.fechaCaducidad}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaCaducidad: e.target.value }))}
                    className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                    placeholder="AAAA-MM-JJ"
                    title="Vous pouvez écrire directement (ex: 2025-12-31)"
                    lang="fr-CA"
                  />
                </div>

                {/* Lote */}
                <div className="space-y-2">
                  <Label htmlFor="lote" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('common.batch') || 'Lote'}
                  </Label>
                  <Input
                    id="lote"
                    value={formData.lote}
                    onChange={(e) => setFormData(prev => ({ ...prev, lote: e.target.value }))}
                    placeholder="Ej: LOTE-2024-001"
                    className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2 mt-5">
                <Label htmlFor="observaciones" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('common.observations') || 'Observaciones'}
                </Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Notas adicionales sobre esta entrada..."
                  rows={3}
                  className="text-sm resize-none border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción - Fijos con gradiente */}
          <div className="flex justify-between gap-3 border-t px-8 py-5 bg-gradient-to-r from-white to-gray-50 shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                limpiarFormulario();
                onOpenChange(false);
              }}
              className="h-11 px-6 border-gray-300 hover:bg-gray-50"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel') || 'Cancelar'}
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={() => handleSubmit(true)}
                variant="outline"
                className="h-11 px-6 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-all"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Guardar y Agregar Otra
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                className="h-11 px-8 bg-gradient-to-r from-[#1E73BE] to-[#1557a0] hover:from-[#1557a0] hover:to-[#0d3a6e] shadow-lg hover:shadow-xl transition-all"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar y Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear nueva subcategoría */}
      <Dialog open={dialogSubcategoria} onOpenChange={setDialogSubcategoria}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <span>Crear Nueva Subcategoría</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666666] pl-16">
              Añadir una nueva subcategoría a: <span className="font-medium text-[#1E73BE]">{categoriaSeleccionada?.nombre}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Info de la categoría */}
            {categoriaSeleccionada && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{categoriaSeleccionada.icono}</span>
                  <div>
                    <p className="font-semibold text-[#333333] text-base">{categoriaSeleccionada.nombre}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      {categoriaSeleccionada.subcategorias?.length || 0} subcategorías existentes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de campos */}
            <div className="grid grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombreSubcategoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Nombre
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Requerido</Badge>
                </Label>
                <Input
                  id="nombreSubcategoria"
                  value={nuevaSubcategoria.nombre}
                  onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Manzanas Golden"
                  className="h-11 border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  autoFocus
                />
              </div>

              {/* Ícono */}
              <div className="space-y-2">
                <Label htmlFor="iconoSubcategoria" className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Ícono (Emoji)
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                    🤖 Auto-generado
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="iconoSubcategoria"
                    value={nuevaSubcategoria.icono}
                    onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, icono: e.target.value }))}
                    placeholder="🍎"
                    maxLength={2}
                    className="h-11 text-2xl text-center border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  />
                  {nuevaSubcategoria.icono && nuevaSubcategoria.icono !== '📦' && (
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2">
                      <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-2 border-green-300 shadow-sm">
                        <span className="text-2xl">{nuevaSubcategoria.icono}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666666]">
                    {nuevaSubcategoria.nombre && nuevaSubcategoria.nombre.length > 2 
                      ? '✨ Icono detectado automáticamente' 
                      : `Por defecto: ${categoriaSeleccionada?.icono}`}
                  </span>
                </div>
              </div>

              {/* Unidad */}
              <div className="space-y-2">
                <Label htmlFor="unidadSubcategoria" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Unidad de Medida
                </Label>
                <Select 
                  value={nuevaSubcategoria.unidad} 
                  onValueChange={(value) => setNuevaSubcategoria(prev => ({ ...prev, unidad: value }))}
                >
                  <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map(unidad => (
                      <SelectItem key={unidad.id} value={unidad.abreviatura}>
                        {unidad.nombre} ({unidad.abreviatura})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Peso Unitario */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="pesoUnitario" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Peso Unitario
                </Label>
                <div className="relative">
                  <Input
                    id="pesoUnitario"
                    type="number"
                    step="0.001"
                    min="0"
                    value={nuevaSubcategoria.pesoUnitario || ''}
                    onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, pesoUnitario: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.000"
                    className="h-11 pr-10 border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-xs font-medium">
                    kg
                  </div>
                </div>
                <p className="text-xs text-[#666666]">
                  Se calculará automáticamente si se deja en 0.
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="descripcionSubcategoria" className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Descripción
                </Label>
                <Textarea
                  id="descripcionSubcategoria"
                  value={nuevaSubcategoria.descripcion}
                  onChange={(e) => setNuevaSubcategoria(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción opcional de la subcategoría..."
                  rows={3}
                  className="resize-none border-gray-300 focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button 
              variant="outline" 
              onClick={() => {
                setDialogSubcategoria(false);
                setNuevaSubcategoria({
                  nombre: '',
                  icono: '',
                  unidad: '',
                  pesoUnitario: 0,
                  descripcion: ''
                });
              }}
              className="h-11 px-6 border-gray-300 hover:bg-gray-50"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarNuevaSubcategoria}
              disabled={!nuevaSubcategoria.nombre}
              className="h-11 px-8 bg-gradient-to-r from-[#4CAF50] to-[#388E3C] hover:from-[#388E3C] hover:to-[#2E7D32] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Subcategoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}