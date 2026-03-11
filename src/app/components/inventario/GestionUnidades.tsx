import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { obtenerUnidades, guardarUnidad, eliminarUnidad, type Unidad } from '../../utils/unidadStorage';
import { cn } from '../ui/utils';

const iconosDisponibles = [
  { icono: '📦', nombre: 'Paleta' },
  { icono: '📦', nombre: 'Caja' },
  { icono: '💼', nombre: 'Saco' },
  { icono: '🏷️', nombre: 'Unidad' },
  { icono: '⚫', nombre: 'Bac Noir' },
  { icono: '⚖️', nombre: 'Kilogramo' },
  { icono: '📏', nombre: 'Metro' },
  { icono: '🥤', nombre: 'Litro' },
  { icono: '🧊', nombre: 'Pieza' },
  { icono: '🎯', nombre: 'Set' },
  { icono: '🗃️', nombre: 'Contenedor' },
  { icono: '📋', nombre: 'Lote' },
  { icono: '🧃', nombre: 'Botella' },
  { icono: '🥫', nombre: 'Lata' },
  { icono: '📦', nombre: 'Paquete' },
  { icono: '🛒', nombre: 'Carrito' },
  { icono: '🎁', nombre: 'Regalo' },
  { icono: '📮', nombre: 'Bolsa' },
  { icono: '🧺', nombre: 'Canasta' },
  { icono: '🪣', nombre: 'Cubeta' },
];

export function GestionUnidades() {
  const { t } = useTranslation();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [unidadEditando, setUnidadEditando] = useState<Unidad | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    icono: '📦'
  });

  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = () => {
    const unidadesCargadas = obtenerUnidades();
    setUnidades(unidadesCargadas);
  };

  const handleAbrirNuevo = () => {
    setModoEdicion(false);
    setUnidadEditando(null);
    setFormData({
      nombre: '',
      abreviatura: '',
      icono: '📦'
    });
    setDialogOpen(true);
  };

  const handleAbrirEditar = (unidad: Unidad) => {
    setModoEdicion(true);
    setUnidadEditando(unidad);
    setFormData({
      nombre: unidad.nombre,
      abreviatura: unidad.abreviatura,
      icono: unidad.icono || '📦'
    });
    setDialogOpen(true);
  };

  const handleGuardar = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.abreviatura.trim()) {
      toast.error('La abreviatura es requerida');
      return;
    }

    const unidad: Unidad = {
      id: modoEdicion && unidadEditando ? unidadEditando.id : Date.now().toString(),
      nombre: formData.nombre.trim(),
      abreviatura: formData.abreviatura.trim().toUpperCase(),
      icono: formData.icono
    };

    const guardado = guardarUnidad(unidad);
    
    if (guardado) {
      toast.success(modoEdicion ? 'Unidad actualizada correctamente' : 'Unidad creada correctamente');
      setDialogOpen(false);
      cargarUnidades();
    } else {
      toast.error('Error al guardar la unidad');
    }
  };

  const handleEliminar = (unidad: Unidad) => {
    if (confirm(`¿Está seguro de eliminar la unidad "${unidad.nombre}"?`)) {
      const eliminado = eliminarUnidad(unidad.id);
      
      if (eliminado) {
        toast.success('Unidad eliminada correctamente');
        cargarUnidades();
      } else {
        toast.error('Error al eliminar la unidad');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Unidades
          </h3>
          <p className="text-sm text-[#666666]">
            Gestiona las unidades de medida para el inventario
          </p>
        </div>
        <Button
          onClick={handleAbrirNuevo}
          className="bg-[#1E73BE] hover:bg-[#1557A0]"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Unidad
        </Button>
      </div>

      {/* Grid de Unidades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {unidades.map((unidad) => (
          <Card key={unidad.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-4xl">{unidad.icono || '📦'}</div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {unidad.nombre}
                </p>
                <p className="text-xs text-[#666666] mt-1">
                  {unidad.abreviatura}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAbrirEditar(unidad)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-[#DC3545] border-[#DC3545] hover:bg-red-50"
                  onClick={() => handleEliminar(unidad)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {unidades.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-[#666666] mb-2">No hay unidades registradas</p>
          <Button
            onClick={handleAbrirNuevo}
            variant="outline"
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear primera unidad
          </Button>
        </div>
      )}

      {/* Diálogo Crear/Editar Unidad */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? '✏️ Editar Unidad' : '✨ Nueva Unidad'}
            </DialogTitle>
            <DialogDescription id="gestion-unidad-description">
              {modoEdicion ? 'Modifica los datos de la unidad' : 'Define una nueva unidad de medida'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Paleta, Caja, Saco..."
              />
            </div>

            {/* Abreviatura */}
            <div className="space-y-2">
              <Label>Abreviatura *</Label>
              <Input
                value={formData.abreviatura}
                onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value.toUpperCase() })}
                placeholder="Ej: PLT, CJA, SAC..."
                maxLength={5}
              />
              <p className="text-xs text-[#666666]">
                Máximo 5 caracteres
              </p>
            </div>

            {/* Selector de Icono */}
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconosDisponibles.map((item) => (
                  <button
                    key={item.icono}
                    type="button"
                    onClick={() => setFormData({ ...formData, icono: item.icono })}
                    className={cn(
                      "p-3 text-2xl border rounded-lg hover:bg-gray-100 transition-colors",
                      formData.icono === item.icono ? 'border-[#1E73BE] bg-blue-50' : 'border-gray-200'
                    )}
                    title={item.nombre}
                  >
                    {item.icono}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista Previa */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-[#666666] mb-2">Vista Previa:</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{formData.icono}</div>
                <div>
                  <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formData.nombre || 'Nombre de la unidad'}
                  </p>
                  <p className="text-sm text-[#666666]">
                    {formData.abreviatura || 'ABR'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Save className="w-4 h-4 mr-2" />
              {modoEdicion ? 'Guardar Cambios' : 'Crear Unidad'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}