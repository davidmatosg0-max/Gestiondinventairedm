import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownToLine, Save, X, Upload, Image as ImageIcon, Plus, Printer, Package, Copy, Building2, Mail, Phone, User, Search, Thermometer } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ICONOS_PRINCIPALES } from '../data/iconosAlimentos';
import { obtenerCategorias, type Categoria } from '../utils/categoriaStorage';
import { obtenerProgramasActivos, type ProgramaEntrada } from '../utils/programaEntradaStorage';
import { obtenerContactosPorDepartamentoYTipo, type ContactoDepartamento } from '../utils/contactosDepartamentoStorage';
import { guardarEntrada } from '../utils/entradaInventarioStorage';

type Producto = {
  id: string;
  categoriaId: string;
  subcategoriaId: string;
  nombre: string; // Generado automáticamente a partir de categoría + subcategoría
};

type FormData = {
  categoriaId: string;
  subcategoriaId: string;
  unidadId: string;
  cantidad: number; // Cantidad de unidades (ej: 10 cajas)
  multiplicador: number; // Contenido de cada unidad (ej: 24 unidades por caja)
  peso: number;
  temperatura: string;
  programaEntradaId: string;
  lote: string;
  fechaCaducidad: string;
  donadorId: string; // Cambiado de 'proveedor' a 'donadorId'
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

const temperaturasAlmacenamiento = [
  { value: 'ambiente', label: 'Temperatura Ambiente (15°C - 25°C)' },
  { value: 'refrigerado', label: 'Refrigerado (0°C - 8°C)' },
  { value: 'congelado', label: 'Congelado (-18°C o menos)' },
  { value: 'fresco', label: 'Fresco (8°C - 15°C)' },
];

export function EntradaProducto() {
  const [open, setOpen] = useState(false);
  const [nuevoProductoDialogOpen, setNuevoProductoDialogOpen] = useState(false);
  const [imprimirDialogOpen, setImprimirDialogOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoRegistrado, setProductoRegistrado] = useState<FormData | null>(null);
  
  // 🔄 Estados sincronizados con localStorage
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [programas, setProgramas] = useState<ProgramaEntrada[]>([]);
  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    categoriaId: '',
    subcategoriaId: '',
    unidadId: '',
    cantidad: 0,
    multiplicador: 0,
    peso: 0,
    temperatura: '',
    programaEntradaId: '',
    lote: '',
    fechaCaducidad: '',
    donadorId: '', // Cambiado de 'proveedor'
    observaciones: '',
  });

  // Estado para nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    categoriaId: '',
    subcategoriaId: '',
    unidadId: '',
    peso: 0,
    temperatura: '',
    icono: '📦', // Icono del producto
    imagen: null as string | null,
  });

  const [imagenPreviewNuevo, setImagenPreviewNuevo] = useState<string | null>(null);

  // 🔄 Cargar datos iniciales desde localStorage
  useEffect(() => {
    if (open) {
      const cats = obtenerCategorias();
      const progs = obtenerProgramasActivos();
      
      // 🎯 OBTENER CONTACTOS REALES: donadores y fournisseurs del departamento Entrepôt (ID='2')
      const contactosEntrepot = obtenerContactosPorDepartamentoYTipo('2', ['donador', 'fournisseur']);
      
      setCategorias(cats.filter(c => c.activa));
      setProgramas(progs);
      setContactos(contactosEntrepot);
      
      console.log('📋 Contactos cargados en EntradaProducto:', contactosEntrepot.length, contactosEntrepot);
    }
  }, [open]);

  // 🔄 Escuchar cambios en contactos (cuando se agregan/editan desde Gestión de Contactos)
  useEffect(() => {
    const handleContactosActualizados = () => {
      const contactosActualizados = obtenerContactosPorDepartamentoYTipo('2', ['donador', 'fournisseur']);
      setContactos(contactosActualizados);
      console.log('🔄 Contactos actualizados en EntradaProducto:', contactosActualizados.length);
    };

    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    window.addEventListener('contactos-restaurados', handleContactosActualizados);

    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('contactos-restaurados', handleContactosActualizados);
    };
  }, []);

  // Determinar qué tipos de contactos mostrar según el programa de entrada
  const tipoContactoPermitido = useMemo(() => {
    if (!formData.programaEntradaId) return null;
    
    const programaSeleccionado = programas.find(p => p.id === formData.programaEntradaId);
    if (!programaSeleccionado) return null;
    
    // ACH/ACHAT → solo fournisseurs
    if (programaSeleccionado.codigo.toLowerCase() === 'ach' || programaSeleccionado.codigo.toLowerCase() === 'achat') {
      return 'fournisseur';
    }
    
    // DON → solo donadores
    if (programaSeleccionado.codigo.toLowerCase() === 'don') {
      return 'donador';
    }
    
    // CPN → ambos tipos (donadores y fournisseurs)
    if (programaSeleccionado.codigo.toLowerCase() === 'cpn') {
      return null; // null = mostrar todos
    }
    
    // Otros programas → mostrar ambos
    return null;
  }, [formData.programaEntradaId, programas]);

  // Filtrar contactos según el tipo de entrada
  const contactosFiltrados = useMemo(() => {
    if (!tipoContactoPermitido) return contactos;
    return contactos.filter(c => c.tipo === tipoContactoPermitido);
  }, [contactos, tipoContactoPermitido]);

  const categoriaSeleccionada = categorias.find(c => c.id === formData.categoriaId);
  const subcategoriasDisponibles = categoriaSeleccionada?.subcategorias || [];

  const categoriaSeleccionadaNuevo = categorias.find(c => c.id === nuevoProducto.categoriaId);
  const subcategoriasDisponiblesNuevo = categoriaSeleccionadaNuevo?.subcategorias || [];

  const handleCrearProducto = () => {
    if (!nuevoProducto.categoriaId || !nuevoProducto.subcategoriaId) {
      toast.error('Selecciona categoría y subcategoría');
      return;
    }
    if (!nuevoProducto.unidadId) {
      toast.error('Selecciona la unidad de medida');
      return;
    }
    if (nuevoProducto.peso <= 0) {
      toast.error('El peso debe ser mayor a 0');
      return;
    }
    if (!nuevoProducto.temperatura) {
      toast.error('Selecciona la temperatura de almacenamiento');
      return;
    }

    const categoria = categorias.find(c => c.id === nuevoProducto.categoriaId);
    const subcategoria = categoria?.subcategorias.find(s => s.id === nuevoProducto.subcategoriaId);

    if (!categoria || !subcategoria) return;

    const producto: Producto = {
      id: `${Date.now()}`,
      categoriaId: nuevoProducto.categoriaId,
      subcategoriaId: nuevoProducto.subcategoriaId,
      nombre: `${categoria.nombre} - ${subcategoria.nombre}`,
    };

    setProductos([...productos, producto]);
    setFormData({ 
      ...formData, 
      categoriaId: producto.categoriaId,
      subcategoriaId: producto.subcategoriaId,
      unidadId: nuevoProducto.unidadId,
      peso: nuevoProducto.peso,
      temperatura: nuevoProducto.temperatura,
    });
    
    toast.success('Producto creado correctamente');
    setNuevoProducto({ categoriaId: '', subcategoriaId: '', unidadId: '', peso: 0, temperatura: '', icono: '📦', imagen: null });
    setImagenPreviewNuevo(null);
    setNuevoProductoDialogOpen(false);
  };

  const handleSubmit = () => {
    // Validaciones
    if (!formData.categoriaId) {
      toast.error('La categoría es requerida');
      return;
    }
    if (!formData.subcategoriaId) {
      toast.error('La subcategoría es requerida');
      return;
    }
    if (!formData.unidadId) {
      toast.error('La unidad es requerida');
      return;
    }
    if (formData.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    if (formData.peso <= 0) {
      toast.error('El peso debe ser mayor a 0');
      return;
    }
    if (!formData.temperatura) {
      toast.error('La temperatura de almacenamiento es requerida');
      return;
    }
    if (!formData.programaEntradaId) {
      toast.error('El programa de entrada es requerido');
      return;
    }
    if (!formData.donadorId) {
      toast.error('El donador/fournisseur es requerido');
      return;
    }

    // Aquí iría la lógica para guardar el producto
    console.log('Datos del producto:', formData);
    
    // Guardar datos antes de resetear
    setProductoRegistrado({ ...formData });
    
    // Resetear formulario
    resetForm();
    setOpen(false);
    
    // Abrir diálogo de impresión
    setImprimirDialogOpen(true);
  };

  const handleImprimir = () => {
    if (productoRegistrado) {
      const categoria = categorias.find(c => c.id === productoRegistrado.categoriaId);
      const subcategoria = categoria?.subcategorias.find(s => s.id === productoRegistrado.subcategoriaId);
      const unidad = unidades.find(u => u.id === productoRegistrado.unidadId);
      const programa = programas.find(p => p.id === productoRegistrado.programaEntradaId);
      
      console.log('Imprimiendo etiqueta:', productoRegistrado);
      toast.success('Etiqueta enviada a impresión');
    }
    setImprimirDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      categoriaId: '',
      subcategoriaId: '',
      unidadId: '',
      cantidad: 0,
      multiplicador: 0,
      peso: 0,
      temperatura: '',
      programaEntradaId: '',
      lote: '',
      fechaCaducidad: '',
      donadorId: '', // Cambiado de 'proveedor'
      observaciones: '',
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-[#4CAF50] hover:bg-[#45a049]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Entrada de Producto
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
              Registrar Entrada de Producto
            </DialogTitle>
            <DialogDescription>
              Complete la información del producto que está ingresando al inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Sección: Información Básica */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#333333] pb-2 border-b" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Información del Producto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select 
                    value={formData.categoriaId} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, categoriaId: value, subcategoriaId: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icono} {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategoría *</Label>
                  <Select 
                    value={formData.subcategoriaId} 
                    onValueChange={(value) => setFormData({ ...formData, subcategoriaId: value })}
                    disabled={!formData.categoriaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoriasDisponibles.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.icono} {sub.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unidad de Medida *</Label>
                  <Select 
                    value={formData.unidadId} 
                    onValueChange={(value) => setFormData({ ...formData, unidadId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map(unidad => (
                        <SelectItem key={unidad.id} value={unidad.id}>
                          {unidad.nombre} ({unidad.abreviatura})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Ej: 10"
                    value={formData.cantidad || ''}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Peso Total (kg) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.peso || ''}
                    onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* Selector de Temperatura con tres botones interactivos - Ocupa todo el ancho */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Temperatura de Almacenamiento *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, temperatura: 'ambiente' })}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center ${
                        formData.temperatura === 'ambiente'
                          ? 'border-[#FFC107] bg-[#FFF8E1] text-[#F57C00]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Thermometer className="w-4 h-4" />
                      <span className="font-medium text-sm">Ambiente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, temperatura: 'refrigerado' })}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center ${
                        formData.temperatura === 'refrigerado'
                          ? 'border-[#2196F3] bg-[#E3F2FD] text-[#1976D2]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Thermometer className="w-4 h-4" />
                      <span className="font-medium text-sm">Refrigerado</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, temperatura: 'congelado' })}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center ${
                        formData.temperatura === 'congelado'
                          ? 'border-[#00BCD4] bg-[#E0F7FA] text-[#00838F]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Thermometer className="w-4 h-4" />
                      <span className="font-medium text-sm">Congelado</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Programa de Entrada y Donador/Fournisseur */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#333333] pb-2 border-b" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Programa y Procedencia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Programa de Entrada *</Label>
                  <Select 
                    value={formData.programaEntradaId} 
                    onValueChange={(value) => setFormData({ ...formData, programaEntradaId: value, donadorId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {programas.map(programa => (
                        <SelectItem key={programa.id} value={programa.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: programa.color }}
                            />
                            {programa.nombre} ({programa.codigo})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {tipoContactoPermitido === 'fournisseur' 
                      ? '📦 Fournisseur *' 
                      : tipoContactoPermitido === 'donador' 
                        ? '🎁 Donateur *' 
                        : 'Fournisseur / Donateur *'}
                  </Label>
                  <Select 
                    value={formData.donadorId} 
                    onValueChange={(value) => setFormData({ ...formData, donadorId: value })}
                    disabled={!formData.programaEntradaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.programaEntradaId 
                          ? "Sélectionner d'abord un programme..."
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
                                    <span className="truncate">{nombreCompleto}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {contactosFiltrados.length === 0 && formData.programaEntradaId && (
                    <p className="text-xs text-amber-600 mt-1">
                      💡 Ajouter des contacts depuis le module &quot;Entrepôt &gt; Gestion des Contacts&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Detalles Opcionales */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#333333] pb-2 border-b" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Detalles Opcionales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Lote</Label>
                  <Input
                    placeholder="Ej: LOT-2024-001"
                    value={formData.lote}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Caducidad</Label>
                  <Input
                    type="date"
                    value={formData.fechaCaducidad}
                    onChange={(e) => setFormData({ ...formData, fechaCaducidad: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    placeholder="Notas adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-between pt-4 border-t">
              <Dialog open={nuevoProductoDialogOpen} onOpenChange={setNuevoProductoDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-[#1E73BE] border-[#1E73BE] hover:bg-blue-50 w-10 h-10"
                    title="Crear Nuevo Producto"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      Crear Nuevo Producto
                    </DialogTitle>
                    <DialogDescription>
                      Configure la información básica del nuevo producto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Categoría *</Label>
                      <Select 
                        value={nuevoProducto.categoriaId} 
                        onValueChange={(value) => {
                          setNuevoProducto({ ...nuevoProducto, categoriaId: value, subcategoriaId: '' });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Subcategoría *</Label>
                      <Select 
                        value={nuevoProducto.subcategoriaId} 
                        onValueChange={(value) => setNuevoProducto({ ...nuevoProducto, subcategoriaId: value })}
                        disabled={!nuevoProducto.categoriaId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategoriasDisponiblesNuevo.map(sub => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Unidad de Medida *</Label>
                      <Select 
                        value={nuevoProducto.unidadId} 
                        onValueChange={(value) => setNuevoProducto({ ...nuevoProducto, unidadId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map(unidad => (
                            <SelectItem key={unidad.id} value={unidad.id}>
                              {unidad.nombre} ({unidad.abreviatura})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Peso (kg) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={nuevoProducto.peso || ''}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, peso: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Temperatura de Almacenamiento *</Label>
                      <Select 
                        value={nuevoProducto.temperatura} 
                        onValueChange={(value) => setNuevoProducto({ ...nuevoProducto, temperatura: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar temperatura" />
                        </SelectTrigger>
                        <SelectContent>
                          {temperaturasAlmacenamiento.map(temp => (
                            <SelectItem key={temp.value} value={temp.value}>
                              {temp.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selector de Iconos */}
                    <div className="space-y-2">
                      <Label>Icono del Producto</Label>
                      <div className="border rounded-lg p-4 bg-[#F4F4F4]">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 rounded-lg bg-white border-2 border-[#1E73BE] flex items-center justify-center text-4xl shadow-sm">
                            {nuevoProducto.icono}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              Selecciona un icono para el producto
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                              El icono se mostrará cuando el producto no tenga foto
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded border">
                          {ICONOS_PRINCIPALES.map((icono, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setNuevoProducto({ ...nuevoProducto, icono })}
                              className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg hover:bg-blue-50 transition-colors ${
                                nuevoProducto.icono === icono ? 'bg-[#1E73BE] bg-opacity-10 ring-2 ring-[#1E73BE]' : 'bg-gray-50'
                              }`}
                              title={icono}
                            >
                              {icono}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sección de Imagen */}
                    <div className="space-y-2">
                      <Label>Imagen del Producto</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        {imagenPreviewNuevo ? (
                          <div className="relative">
                            <img 
                              src={imagenPreviewNuevo} 
                              alt="Preview" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImagenPreviewNuevo(null);
                                setNuevoProducto({ ...nuevoProducto, imagen: null });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8">
                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-3">Arrastra una imagen o haz clic para seleccionar</p>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="imagen-upload-nuevo"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const result = reader.result as string;
                                    setImagenPreviewNuevo(result);
                                    setNuevoProducto({ ...nuevoProducto, imagen: result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('imagen-upload-nuevo')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Subir Imagen
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {nuevoProducto.categoriaId && nuevoProducto.subcategoriaId && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-[#666666] mb-1">El producto se creará como:</p>
                        <p className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {categorias.find(c => c.id === nuevoProducto.categoriaId)?.nombre} - {
                            categorias.find(c => c.id === nuevoProducto.categoriaId)?.subcategorias.find(s => s.id === nuevoProducto.subcategoriaId)?.nombre
                          }
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNuevoProducto({ categoriaId: '', subcategoriaId: '', unidadId: '', peso: 0, temperatura: '', icono: '📦', imagen: null });
                          setNuevoProductoDialogOpen(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCrearProducto}
                        className="bg-[#1E73BE] hover:bg-[#1a5fa0]"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Producto
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  className="w-10 h-10"
                  title="Cancelar"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  size="icon"
                  className="bg-[#4CAF50] hover:bg-[#45a049] w-10 h-10"
                  title="Registrar Entrada"
                >
                  <Save className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  title="Imprimir"
                >
                  <Printer className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación para Imprimir */}
      <Dialog open={imprimirDialogOpen} onOpenChange={setImprimirDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Producto Registrado Exitosamente
            </DialogTitle>
            <DialogDescription>
              El producto se ha registrado correctamente en el inventario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Save className="w-8 h-8 text-[#4CAF50]" />
              </div>
            </div>
            
            <p className="text-center text-[#666666]">
              El producto ha sido registrado correctamente en el sistema.
            </p>

            {productoRegistrado && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Producto:</span>{' '}
                  {categorias.find(c => c.id === productoRegistrado.categoriaId)?.nombre} -{' '}
                  {categorias.find(c => c.id === productoRegistrado.categoriaId)?.subcategorias.find(s => s.id === productoRegistrado.subcategoriaId)?.nombre}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Peso:</span> {productoRegistrado.peso} kg
                </p>
                {productoRegistrado.lote && (
                  <p className="text-sm">
                    <span className="font-medium">Lote:</span> {productoRegistrado.lote}
                  </p>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-center text-[#333333] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                ¿Desea imprimir la etiqueta de identificación del producto?
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setImprimirDialogOpen(false)}
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  No, Gracias
                </Button>
                <Button
                  onClick={handleImprimir}
                  className="bg-[#1E73BE] hover:bg-[#1a5fa0]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Etiqueta
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}