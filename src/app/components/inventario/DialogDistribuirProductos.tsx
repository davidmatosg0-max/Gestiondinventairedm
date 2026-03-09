import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Building2, Calendar, FileText, Plus, Minus, 
  Trash2, Package, DollarSign, Scale, CheckCircle2, AlertCircle, Calculator, Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { mockOrganismos } from '../../data/mockData';
import { guardarComanda, generarNumeroComanda } from '../../utils/comandaStorage';
import { guardarNotificacion, crearNotificacionNuevaComanda } from '../../utils/notificacionStorage';
import { Comanda } from '../../types';
import { DialogCrearOferta } from './DialogCrearOferta';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

type ProductoEditableItem = {
  productoId: string;
  cantidad: number;
  nombre: string;
  codigo: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  valorUnitario: number;
  icono?: string;
};

type OrganismoConPorcentaje = {
  id: string;
  nombre: string;
  porcentaje: number;
};

interface DialogDistribuirProductosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: CarritoItem[];
  productos: any[];
  categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }>;
  onDistribucionCompletada: () => void;
}

export function DialogDistribuirProductos({
  open,
  onOpenChange,
  carrito,
  productos,
  categoriasInfo,
  onDistribucionCompletada
}: DialogDistribuirProductosProps) {
  const { t } = useTranslation();
  
  // Estados principales
  const [paso, setPaso] = useState<'seleccion_tipo' | 'editar_cantidades' | 'seleccionar_organismo' | 'distribuir_grupo'>('seleccion_tipo');
  const [tipoDistribucion, setTipoDistribucion] = useState<'individual' | 'grupo'>('individual');
  
  // Estados para productos editables
  const [productosEditables, setProductosEditables] = useState<ProductoEditableItem[]>([]);
  
  // Estados para distribución individual
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estados para distribución en grupo
  const [organismosConPorcentajes, setOrganismosConPorcentajes] = useState<OrganismoConPorcentaje[]>([]);
  
  // Estado para diálogo de ofertas
  const [ofertaDialogOpen, setOfertaDialogOpen] = useState(false);

  const usuarioActual = 'Usuario Sistema'; // En producción vendría del contexto de autenticación

  // Inicializar productos editables cuando se abre el diálogo y se va a editar cantidades
  React.useEffect(() => {
    if (paso === 'editar_cantidades' && productosEditables.length === 0) {
      const productosConInfo = carrito.map(item => {
        const producto = productos.find(p => p.id === item.productoId);
        const categoriaInfo = categoriasInfo[producto?.categoria || ''];
        return {
          productoId: item.productoId,
          cantidad: item.cantidad,
          nombre: producto?.nombre || '',
          codigo: producto?.codigo || '',
          categoria: producto?.categoria || '',
          unidad: producto?.unidad || '',
          stockActual: producto?.stockActual || 0,
          valorUnitario: categoriaInfo?.valorMonetario || 0,
          icono: categoriaInfo?.icono || ''
        };
      });
      setProductosEditables(productosConInfo);
    }
  }, [paso, productosEditables.length]); // Removemos dependencias problemáticas

  // Reiniciar productos editables cuando cambie el carrito o se cierre el diálogo
  React.useEffect(() => {
    if (!open) {
      setProductosEditables([]);
    }
  }, [open]);

  const calcularTotales = () => {
    const items = productosEditables.length > 0 ? productosEditables : carrito.map(item => {
      const producto = productos.find(p => p.id === item.productoId);
      const categoriaInfo = categoriasInfo[producto?.categoria || ''];
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        nombre: producto?.nombre || '',
        codigo: producto?.codigo || '',
        categoria: producto?.categoria || '',
        unidad: producto?.unidad || '',
        stockActual: producto?.stockActual || 0,
        valorUnitario: categoriaInfo?.valorMonetario || 0,
        icono: categoriaInfo?.icono || ''
      };
    });

    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
    const valorTotal = items.reduce((sum, item) => sum + (item.cantidad * item.valorUnitario), 0);
    const pesoTotal = items.reduce((sum, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      if (producto?.unidad === 'kg') {
        return sum + item.cantidad;
      }
      return sum;
    }, 0);

    return { totalItems, valorTotal, pesoTotal };
  };

  const actualizarCantidadProducto = (productoId: string, nuevaCantidad: number) => {
    setProductosEditables(prev => 
      prev.map(item => 
        item.productoId === productoId 
          ? { ...item, cantidad: Math.max(0, Math.min(nuevaCantidad, item.stockActual)) }
          : item
      )
    );
  };

  const eliminarProducto = (productoId: string) => {
    setProductosEditables(prev => prev.filter(item => item.productoId !== productoId));
  };

  const agregarOrganismoConPorcentaje = () => {
    setOrganismosConPorcentajes([...organismosConPorcentajes, { id: '', nombre: '', porcentaje: 0 }]);
  };

  const actualizarOrganismoPorcentaje = (index: number, campo: 'id' | 'porcentaje', valor: any) => {
    setOrganismosConPorcentajes(prev => {
      const nuevos = [...prev];
      if (campo === 'id') {
        const org = mockOrganismos.find(o => o.id === valor);
        nuevos[index] = { ...nuevos[index], id: valor, nombre: org?.nombre || '' };
      } else {
        nuevos[index] = { ...nuevos[index], porcentaje: parseFloat(valor) || 0 };
      }
      return nuevos;
    });
  };

  const eliminarOrganismoPorcentaje = (index: number) => {
    setOrganismosConPorcentajes(prev => prev.filter((_, i) => i !== index));
  };

  // Función para auto-calcular porcentajes según frecuencia de organismos activos y regulares
  const autoCalcularPorcentajesSegunFrecuencia = () => {
    const organismosActivosRegulares = mockOrganismos.filter(o => 
      o.activo && o.tipoAsistencia === 'regular'
    );

    if (organismosActivosRegulares.length === 0) {
      toast.error('No hay organismos activos y regulares disponibles');
      return;
    }

    const totalFrecuencia = organismosActivosRegulares.reduce((sum, org) => sum + (org.frecuencia || 1), 0);
    
    const nuevosOrganismos: OrganismoConPorcentaje[] = organismosActivosRegulares.map(org => ({
      id: org.id,
      nombre: org.nombre,
      porcentaje: ((org.frecuencia || 1) / totalFrecuencia) * 100
    }));

    setOrganismosConPorcentajes(nuevosOrganismos);
    
    toast.success(
      <div>
        <p className="font-semibold mb-1">Porcentajes calculados según frecuencia</p>
        <ul className="text-sm space-y-1">
          {nuevosOrganismos.map((org, i) => {
            const orgData = mockOrganismos.find(o => o.id === org.id);
            return (
              <li key={i}>• {org.nombre}: {(org.porcentaje || 0).toFixed(2)}% (Frecuencia: {orgData?.frecuencia}x/semana)</li>
            );
          })}
        </ul>
      </div>,
      { duration: 6000 }
    );
  };

  const calcularPorcentajeTotal = () => {
    return organismosConPorcentajes.reduce((sum, org) => sum + org.porcentaje, 0);
  };

  const validarDistribucionGrupo = () => {
    const porcentajeTotal = calcularPorcentajeTotal();
    const todosOrganismosSeleccionados = organismosConPorcentajes.every(org => org.id);
    const todosPorcentajesValidos = organismosConPorcentajes.every(org => org.porcentaje > 0);
    
    return {
      valido: Math.abs(porcentajeTotal - 100) < 0.01 && todosOrganismosSeleccionados && todosPorcentajesValidos,
      porcentajeTotal
    };
  };

  const crearComandaIndividual = () => {
    if (!organismoSeleccionado || !fechaEntrega) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const { valorTotal, pesoTotal } = calcularTotales();
    const numeroComanda = generarNumeroComanda();
    
    const comanda: Comanda = {
      id: `comanda-${Date.now()}`,
      numero: numeroComanda,
      organismoId: organismoSeleccionado,
      fecha: new Date().toISOString(),
      usuarioCreacion: usuarioActual,
      fechaEntrega: fechaEntrega,
      observaciones: observaciones,
      items: productosEditables.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        cantidadEntregada: 0
      })),
      valorTotal,
      pesoTotal,
      estado: 'pendiente'
    };

    try {
      guardarComanda(comanda);
      toast.success(`Comanda ${numeroComanda} creada correctamente`);
      // Guardar notificación
      const notificacion = crearNotificacionNuevaComanda(comanda.id, numeroComanda, organismoSeleccionado);
      guardarNotificacion(notificacion);
      cerrarYReiniciar();
      onDistribucionCompletada();
    } catch (error) {
      toast.error('Error al crear la comanda');
      console.error(error);
    }
  };

  const crearComandasGrupo = () => {
    const validacion = validarDistribucionGrupo();
    if (!validacion.valido) {
      if (Math.abs(validacion.porcentajeTotal - 100) >= 0.01) {
        toast.error(`El porcentaje total debe ser 100% (actual: ${validacion.porcentajeTotal.toFixed(2)}%)`);
      } else {
        toast.error('Por favor complete todos los campos correctamente');
      }
      return;
    }

    if (!fechaEntrega) {
      toast.error('Por favor seleccione una fecha de entrega');
      return;
    }

    const { valorTotal, pesoTotal } = calcularTotales();
    const comandasCreadas: string[] = [];

    try {
      organismosConPorcentajes.forEach(orgInfo => {
        const numeroComanda = generarNumeroComanda();
        
        const comanda: Comanda = {
          id: `comanda-${Date.now()}-${orgInfo.id}`,
          numero: numeroComanda,
          organismoId: orgInfo.id,
          fecha: new Date().toISOString(),
          usuarioCreacion: usuarioActual,
          fechaEntrega: fechaEntrega,
          observaciones: `Distribución en grupo (${orgInfo.porcentaje}% del total)${observaciones ? '\n' + observaciones : ''}`,
          items: productosEditables.map(item => ({
            productoId: item.productoId,
            cantidad: (item.cantidad * orgInfo.porcentaje) / 100,
            cantidadEntregada: 0
          })),
          valorTotal: (valorTotal * orgInfo.porcentaje) / 100,
          pesoTotal: (pesoTotal * orgInfo.porcentaje) / 100,
          estado: 'pendiente'
        };

        guardarComanda(comanda);
        comandasCreadas.push(numeroComanda);
        // Guardar notificación
        const notificacion = crearNotificacionNuevaComanda(comanda.id, numeroComanda, orgInfo.id);
        guardarNotificacion(notificacion);
      });

      toast.success(
        <div>
          <p className="font-semibold mb-1">Comandas creadas correctamente:</p>
          <ul className="text-sm space-y-1">
            {comandasCreadas.map((num, i) => (
              <li key={i}>• {num} - {organismosConPorcentajes[i].nombre} ({organismosConPorcentajes[i].porcentaje}%)</li>
            ))}
          </ul>
        </div>,
        { duration: 6000 }
      );
      
      cerrarYReiniciar();
      onDistribucionCompletada();
    } catch (error) {
      toast.error('Error al crear las comandas');
      console.error(error);
    }
  };

  const cerrarYReiniciar = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPaso('seleccion_tipo');
      setTipoDistribucion('individual');
      setProductosEditables([]);
      setOrganismoSeleccionado('');
      setFechaEntrega('');
      setObservaciones('');
      setOrganismosConPorcentajes([]);
    }, 300);
  };

  const avanzarPaso = () => {
    if (paso === 'seleccion_tipo') {
      setPaso('editar_cantidades');
    } else if (paso === 'editar_cantidades') {
      if (productosEditables.length === 0) {
        toast.error('Debe tener al menos un producto');
        return;
      }
      if (tipoDistribucion === 'individual') {
        setPaso('seleccionar_organismo');
      } else {
        setPaso('distribuir_grupo');
      }
    }
  };

  const retrocederPaso = () => {
    if (paso === 'editar_cantidades') {
      setPaso('seleccion_tipo');
    } else if (paso === 'seleccionar_organismo' || paso === 'distribuir_grupo') {
      setPaso('editar_cantidades');
    }
  };

  const totales = calcularTotales();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="distribuir-productos-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {paso === 'seleccion_tipo' && '📦 Distribuir Productos'}
              {paso === 'editar_cantidades' && '✏️ Editar Cantidades'}
              {paso === 'seleccionar_organismo' && '🏢 Seleccionar Organismo'}
              {paso === 'distribuir_grupo' && '👥 Distribución en Grupo'}
            </DialogTitle>
            <DialogDescription id="distribuir-productos-description">
              {paso === 'seleccion_tipo' && 'Seleccione cómo desea distribuir los productos'}
              {paso === 'editar_cantidades' && 'Ajuste las cantidades de productos antes de distribuir'}
              {paso === 'seleccionar_organismo' && 'Complete los detalles de la comanda'}
              {paso === 'distribuir_grupo' && 'Asigne porcentajes a cada organismo'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            {/* Paso 1: Selección de tipo de distribución */}
            {paso === 'seleccion_tipo' && (
              <div className="grid grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'individual' ? 'border-2 border-[#1E73BE] bg-[#E3F2FD]' : 'border-2 border-gray-200'}`}
                  onClick={() => setTipoDistribucion('individual')}
                >
                  <CardContent className="p-6 text-center">
                    <Building2 className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'individual' ? 'text-[#1E73BE]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Organismo Individual
                    </h3>
                    <p className="text-sm text-gray-600">
                      Asignar todos los productos a un solo organismo
                    </p>
                    {tipoDistribucion === 'individual' && (
                      <Badge className="mt-3 bg-[#1E73BE] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Seleccionado
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'grupo' ? 'border-2 border-[#4CAF50] bg-[#E8F5E9]' : 'border-2 border-gray-200'}`}
                  onClick={() => setTipoDistribucion('grupo')}
                >
                  <CardContent className="p-6 text-center">
                    <Users className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'grupo' ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Distribución en Grupo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Distribuir productos entre varios organismos con porcentajes
                    </p>
                    {tipoDistribucion === 'grupo' && (
                      <Badge className="mt-3 bg-[#4CAF50] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Seleccionado
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all hover:shadow-lg border-2 border-gray-200 hover:border-[#FFC107]"
                  onClick={() => {
                    setOfertaDialogOpen(true);
                    onOpenChange(false);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Tag className="w-16 h-16 mx-auto mb-4 text-[#FFC107]" />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Crear Oferta
                    </h3>
                    <p className="text-sm text-gray-600">
                      Publicar oferta para que organismos la acepten
                    </p>
                    <Badge className="mt-3 bg-[#FFC107] text-gray-900">
                      Nuevo
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Paso 2: Editar cantidades */}
            {paso === 'editar_cantidades' && (
              <div className="space-y-4">
                {/* Resumen de totales */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Card className="border-l-4 border-l-[#1E73BE]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#1E73BE]" />
                        <div>
                          <p className="text-xs text-gray-600">Items</p>
                          <p className="font-bold text-[#1E73BE]">{totales.totalItems.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-[#4CAF50]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                        <div>
                          <p className="text-xs text-gray-600">Valor</p>
                          <p className="font-bold text-[#4CAF50]">CAD$ {totales.valorTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-[#FFC107]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#FFC107]" />
                        <div>
                          <p className="text-xs text-gray-600">Peso</p>
                          <p className="font-bold text-[#FFC107]">{totales.pesoTotal.toFixed(2)} kg</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de productos editables */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {productosEditables.map(item => (
                    <Card key={item.productoId} className="border-2 border-gray-200 hover:border-[#1E73BE] transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {item.nombre}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{item.codigo}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className="bg-gray-100 text-gray-700">
                                {item.icono} {item.categoria}
                              </Badge>
                              <Badge className="bg-[#4CAF50] text-white">
                                💰 CAD$ {(item.cantidad * item.valorUnitario).toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarProducto(item.productoId)}
                            className="text-[#DC3545] hover:text-white hover:bg-[#DC3545]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 border-2 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                              onClick={() => actualizarCantidadProducto(item.productoId, item.cantidad - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md min-w-[100px] justify-center">
                              <Input
                                type="number"
                                value={item.cantidad}
                                onChange={(e) => actualizarCantidadProducto(item.productoId, parseFloat(e.target.value) || 0)}
                                className="w-16 h-7 text-center font-bold border-none bg-transparent p-0"
                                min="0.01"
                                step="0.01"
                                max={item.stockActual}
                              />
                              <span className="text-sm font-medium text-gray-600">{item.unidad}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                              onClick={() => actualizarCantidadProducto(item.productoId, item.cantidad + 1)}
                              disabled={item.cantidad >= item.stockActual}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-gray-600 text-right">
                            <p>Stock disponible:</p>
                            <p className="font-semibold text-gray-900">{item.stockActual} {item.unidad}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Seleccionar organismo (individual) */}
            {paso === 'seleccionar_organismo' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Organismo Beneficiario</Label>
                  <Select
                    value={organismoSeleccionado}
                    onValueChange={setOrganismoSeleccionado}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un organismo" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOrganismos.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Entrega</Label>
                  <Input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full"
                    placeholder="Ingrese observaciones adicionales (opcional)"
                    rows={3}
                  />
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Resumen:</p>
                  <div className="space-y-1 text-sm">
                    <p>{totales.totalItems.toFixed(2)} items • CAD$ {totales.valorTotal.toFixed(2)}</p>
                    <p>{totales.pesoTotal.toFixed(2)} kg</p>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Distribución en grupo */}
            {paso === 'distribuir_grupo' && (
              <div className="space-y-4">
                {/* Banner informativo sobre organismos activos y regulares */}
                <Card className="border-l-4 border-l-[#1E73BE] bg-[#E3F2FD]">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-[#1E73BE] flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-[#1E73BE] mb-1">Distribución basada en frecuencia</p>
                        <p className="text-gray-700">
                          La distribución en grupo considera únicamente organismos <strong>activos</strong> y <strong>regulares</strong>. 
                          Los porcentajes se calculan automáticamente según la frecuencia semanal de recogida de cada organismo.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botón de auto-calcular */}
                <div className="flex justify-center">
                  <Button
                    onClick={autoCalcularPorcentajesSegunFrecuencia}
                    className="bg-[#FFC107] hover:bg-[#FFA000] text-gray-900"
                    size="lg"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Auto-calcular Porcentajes según Frecuencia
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-3">
                    <Label>Organismos y Porcentajes</Label>
                    <Button
                      size="sm"
                      onClick={agregarOrganismoConPorcentaje}
                      className="bg-[#4CAF50] hover:bg-[#45a049]"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Organismo
                    </Button>
                  </div>

                  {organismosConPorcentajes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay organismos agregados</p>
                      <p className="text-sm">Haga clic en "Agregar Organismo" para comenzar</p>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {organismosConPorcentajes.map((org, index) => (
                      <Card key={index} className="border-2 border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex gap-3 items-start">
                            <div className="flex-1 space-y-2">
                              <Select
                                value={org.id}
                                onValueChange={(value) => actualizarOrganismoPorcentaje(index, 'id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione organismo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockOrganismos
                                    .filter(o => !organismosConPorcentajes.find((oc, i) => oc.id === o.id && i !== index))
                                    .map(organismo => (
                                      <SelectItem key={organismo.id} value={organismo.id}>
                                        {organismo.nombre}
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={org.porcentaje}
                                  onChange={(e) => actualizarOrganismoPorcentaje(index, 'porcentaje', e.target.value)}
                                  placeholder="Porcentaje"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  className="w-24"
                                />
                                <span className="text-gray-600">%</span>
                                {org.porcentaje > 0 && (
                                  <Badge className="bg-[#4CAF50] text-white">
                                    CAD$ {((totales.valorTotal * org.porcentaje) / 100).toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => eliminarOrganismoPorcentaje(index)}
                              className="text-[#DC3545] hover:text-white hover:bg-[#DC3545]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {organismosConPorcentajes.length > 0 && (
                    <Card className={`border-2 ${Math.abs(calcularPorcentajeTotal() - 100) < 0.01 ? 'border-[#4CAF50] bg-[#E8F5E9]' : 'border-[#FFC107] bg-[#FFF8E1]'}`}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Porcentaje Total:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${Math.abs(calcularPorcentajeTotal() - 100) < 0.01 ? 'text-[#4CAF50]' : 'text-[#FFC107]'}`}>
                              {calcularPorcentajeTotal().toFixed(2)}%
                            </span>
                            {Math.abs(calcularPorcentajeTotal() - 100) < 0.01 ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-[#FFC107]" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Entrega</Label>
                  <Input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observaciones (Opcional)</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full"
                    placeholder="Ingrese observaciones adicionales"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex justify-between items-center w-full">
              <div>
                {paso !== 'seleccion_tipo' && (
                  <Button variant="outline" onClick={retrocederPaso}>
                    Atrás
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cerrarYReiniciar}>
                  Cancelar
                </Button>
                {(paso === 'seleccion_tipo' || paso === 'editar_cantidades') && (
                  <Button onClick={avanzarPaso} className="bg-[#1E73BE] hover:bg-[#1557A0]">
                    Siguiente
                  </Button>
                )}
                {paso === 'seleccionar_organismo' && (
                  <Button 
                    onClick={crearComandaIndividual} 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    disabled={!organismoSeleccionado || !fechaEntrega}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Crear Comanda
                  </Button>
                )}
                {paso === 'distribuir_grupo' && (
                  <Button 
                    onClick={crearComandasGrupo} 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    disabled={!validarDistribucionGrupo().valido || !fechaEntrega}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Crear Comandas ({organismosConPorcentajes.length})
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DialogCrearOferta 
        open={ofertaDialogOpen} 
        onOpenChange={setOfertaDialogOpen}
        carrito={carrito}
        productos={productos}
        categoriasInfo={categoriasInfo}
        onOfertaCreada={() => {
          setOfertaDialogOpen(false);
          onDistribucionCompletada();
        }}
      />
    </>
  );
}