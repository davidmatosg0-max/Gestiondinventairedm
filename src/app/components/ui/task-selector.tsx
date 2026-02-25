import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Trash2, Pencil, Settings } from 'lucide-react';
import { useBranding } from '../../../hooks/useBranding';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { toast } from 'sonner';
import {
  obtenerTareasPersonalizadas,
  guardarTareaPersonalizada,
  actualizarTareaPersonalizada,
  eliminarTareaPersonalizada,
  existeCodigoTarea,
  type TareaPersonalizada
} from '../../utils/tareasPersonalizadasStorage';

interface TaskSelectorProps {
  selectedTasks: string[];
  onChange: (tasks: string[]) => void;
  predefinedTasks?: Array<{
    code: string;
    label: string;
    icon: string;
    color: string;
  }>;
}

export function TaskSelector({ 
  selectedTasks, 
  onChange,
  predefinedTasks 
}: TaskSelectorProps) {
  const branding = useBranding();
  const [tareasPersonalizadas, setTareasPersonalizadas] = useState<TareaPersonalizada[]>([]);
  const [tareasPredeterminadasOcultas, setTareasPredeterminadasOcultas] = useState<string[]>([]);
  const [dialogNuevaTarea, setDialogNuevaTarea] = useState(false);
  const [dialogGestionTareas, setDialogGestionTareas] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({ code: '', label: '', icon: '', color: branding.primaryColor });
  const [tareaEditando, setTareaEditando] = useState<string | null>(null);

  const defaultTasks = predefinedTasks || [
    { code: 'accueil', label: 'Accueil et orientation', icon: '🤝', color: branding.primaryColor },
    { code: 'distribution', label: 'Distribution alimentaire', icon: '📦', color: branding.secondaryColor },
    { code: 'inventaire', label: 'Gestion d\'inventaire', icon: '📋', color: '#F59E0B' },
    { code: 'transport', label: 'Transport et logistique', icon: '🚛', color: '#8B5CF6' },
    { code: 'comptoir', label: 'Service au comptoir', icon: '🏪', color: '#EC4899' },
    { code: 'cuisine', label: 'Préparation cuisine', icon: '👨‍🍳', color: '#10B981' },
    { code: 'nettoyage', label: 'Entretien et nettoyage', icon: '🧹', color: '#6B7280' },
    { code: 'admin', label: 'Tâches administratives', icon: '📊', color: '#3B82F6' }
  ];

  useEffect(() => {
    cargarTareasPersonalizadas();
    cargarTareasPredeterminadasOcultas();
  }, []);

  const cargarTareasPersonalizadas = () => {
    const tareasData = obtenerTareasPersonalizadas();
    setTareasPersonalizadas(tareasData);
  };

  const cargarTareasPredeterminadasOcultas = () => {
    try {
      const ocultasData = localStorage.getItem('tareas_predeterminadas_ocultas');
      if (ocultasData) {
        setTareasPredeterminadasOcultas(JSON.parse(ocultasData));
      }
    } catch (error) {
      console.error('Error al cargar tareas ocultas:', error);
    }
  };

  const guardarTareasPredeterminadasOcultas = (codigos: string[]) => {
    try {
      localStorage.setItem('tareas_predeterminadas_ocultas', JSON.stringify(codigos));
      setTareasPredeterminadasOcultas(codigos);
    } catch (error) {
      console.error('Error al guardar tareas ocultas:', error);
    }
  };

  const handleEliminarTareaPredeterminada = (code: string) => {
    const nuevasOcultas = [...tareasPredeterminadasOcultas, code];
    guardarTareasPredeterminadasOcultas(nuevasOcultas);
    
    // Remover de las tareas seleccionadas si está presente
    if (selectedTasks.includes(code)) {
      onChange(selectedTasks.filter(t => t !== code));
    }
    
    toast.success('Tâche système masquée avec succès');
  };

  const handleActualizarTareaPredeterminada = (codeOriginal: string) => {
    // Ocultar la tarea predeterminada original
    const nuevasOcultas = [...tareasPredeterminadasOcultas, codeOriginal];
    guardarTareasPredeterminadasOcultas(nuevasOcultas);
    
    // Guardar como tarea personalizada
    guardarTareaPersonalizada(nuevaTarea);
    
    // Actualizar la selección si la tarea original estaba seleccionada
    if (selectedTasks.includes(codeOriginal)) {
      const nuevasSeleccionadas = selectedTasks.map(t => 
        t === codeOriginal ? nuevaTarea.code : t
      );
      onChange(nuevasSeleccionadas);
    }
    
    toast.success('Tâche système modifiée et sauvegardée comme personnalisée');
    cargarTareasPersonalizadas();
    setDialogNuevaTarea(false);
    setNuevaTarea({ code: '', label: '', icon: '', color: branding.primaryColor });
    setTareaEditando(null);
  };

  const toggleTarea = (code: string) => {
    const nuevasTareas = selectedTasks.includes(code)
      ? selectedTasks.filter(t => t !== code)
      : [...selectedTasks, code];
    onChange(nuevasTareas);
  };

  const handleAgregarTarea = () => {
    if (!nuevaTarea.code.trim() || !nuevaTarea.label.trim()) {
      toast.error('Le code et le nom de la tâche sont obligatoires');
      return;
    }

    const codigosPredefinidos = defaultTasks.map(t => t.code);
    if (existeCodigoTarea(nuevaTarea.code, codigosPredefinidos)) {
      toast.error('Ce code de tâche existe déjà');
      return;
    }

    guardarTareaPersonalizada(nuevaTarea);
    toast.success('Tâche ajoutée avec succès');
    cargarTareasPersonalizadas();
    setDialogNuevaTarea(false);
    setNuevaTarea({ code: '', label: '', icon: '', color: branding.primaryColor });
  };

  const handleEliminarTareaPersonalizada = (id: string, code: string) => {
    eliminarTareaPersonalizada(id);
    if (selectedTasks.includes(code)) {
      onChange(selectedTasks.filter(t => t !== code));
    }
    toast.success('Tâche supprimée avec succès');
    cargarTareasPersonalizadas();
  };

  const handleActualizarTareaPersonalizada = (id: string) => {
    actualizarTareaPersonalizada(id, nuevaTarea);
    toast.success('Tâche mise à jour avec succès');
    cargarTareasPersonalizadas();
    setDialogNuevaTarea(false);
    setNuevaTarea({ code: '', label: '', icon: '', color: branding.primaryColor });
    setTareaEditando(null);
  };

  const todasLasTareas = [
    ...defaultTasks.filter(t => !tareasPredeterminadasOcultas.includes(t.code)),
    ...tareasPersonalizadas.map(t => ({
      code: t.code,
      label: t.label,
      icon: t.icon,
      color: t.color,
      isCustom: true,
      customId: t.id
    }))
  ];

  return (
    <div>
      <Label className="mb-3 block flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ListTodo className="w-4 h-4" style={{ color: branding.primaryColor }} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Tâches assignées</span>
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDialogGestionTareas(true)}
            className="gap-1"
            style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
          >
            <Settings className="w-3 h-3" />
            <span className="text-xs">Gestion</span>
          </Button>
        </div>
      </Label>

      {/* Tareas seleccionadas con opciones de quitar */}
      {selectedTasks.length > 0 && (
        <div className="mb-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-purple-900 flex items-center gap-1">
              <ListTodo className="w-3 h-3" />
              {selectedTasks.length} tâche{selectedTasks.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-medium"
            >
              Tout supprimer
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTasks.map((code) => {
              const tarea = todasLasTareas.find((t: any) => t.code === code);
              if (!tarea) return null;
              return (
                <div
                  key={code}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-white text-[10px] font-medium shadow-sm"
                  style={{ backgroundColor: tarea.color }}
                >
                  <span className="text-xs">{tarea.icon || '✓'}</span>
                  <span>{tarea.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleTarea(code)}
                    className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    title="Retirer cette tâche"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {todasLasTareas.map((tarea: any) => {
          const isSelected = selectedTasks.includes(tarea.code);
          // Crear key única combinando código y tipo (custom o predefinido)
          const uniqueKey = tarea.isCustom ? `custom-${tarea.customId}` : `predefined-${tarea.code}`;
          return (
            <div key={uniqueKey} className="relative group">
              <button
                type="button"
                onClick={() => toggleTarea(tarea.code)}
                className={`w-full group relative p-1.5 border-2 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                  isSelected 
                    ? 'scale-105 shadow-lg' 
                    : 'hover:scale-102 hover:shadow-md'
                }`}
                style={{
                  borderColor: isSelected ? tarea.color : '#E0E0E0',
                  backgroundColor: isSelected ? `${tarea.color}15` : 'white',
                }}
              >
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                {/* Contenido */}
                <div className="relative flex flex-col items-center gap-0.5">
                  <span 
                    className={`text-lg transition-transform duration-300 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {tarea.icon || '✓'}
                  </span>
                  <span 
                    className="text-[9px] font-semibold transition-colors text-center leading-tight"
                    style={{ 
                      color: isSelected ? tarea.color : '#666666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {tarea.label}
                  </span>
                </div>
                
                {/* Checkmark animado */}
                {isSelected && (
                  <div 
                    className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full flex items-center justify-center animate-scaleIn"
                    style={{ backgroundColor: tarea.color }}
                  >
                    <svg 
                      className="w-2 h-2 text-white" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="3" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Badge indicador de tipo de tarea */}
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all z-10 shadow-sm"
                style={{ 
                  backgroundColor: tarea.isCustom ? branding.secondaryColor : branding.primaryColor,
                  color: 'white'
                }}
              >
                {tarea.isCustom ? 'Personnalisée' : 'Système'}
              </div>
              
              {/* Botones de editar/eliminar para TODAS las tareas */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tarea.isCustom) {
                    const tareaData = tareasPersonalizadas.find(t => t.id === tarea.customId);
                    if (tareaData) {
                      setNuevaTarea({
                        code: tareaData.code,
                        label: tareaData.label,
                        icon: tareaData.icon,
                        color: tareaData.color
                      });
                      setTareaEditando(tarea.customId);
                      setDialogNuevaTarea(true);
                    }
                  } else {
                    // Editar tarea predeterminada
                    setNuevaTarea({
                      code: tarea.code,
                      label: tarea.label,
                      icon: tarea.icon,
                      color: tarea.color
                    });
                    setTareaEditando(`predefined-${tarea.code}`);
                    setDialogNuevaTarea(true);
                  }
                }}
                className="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full bg-blue-500 text-white transition-all flex items-center justify-center hover:bg-blue-600 hover:scale-125 z-10 shadow-lg border-2 border-white"
                title="Modifier cette tâche"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Voulez-vous vraiment supprimer la tâche "${tarea.label}" ?`)) {
                    if (tarea.isCustom) {
                      handleEliminarTareaPersonalizada(tarea.customId, tarea.code);
                    } else {
                      handleEliminarTareaPredeterminada(tarea.code);
                    }
                  }
                }}
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white transition-all flex items-center justify-center hover:bg-red-600 hover:scale-125 z-10 shadow-lg border-2 border-white"
                title="Supprimer cette tâche"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Dialog Nueva Tarea */}
      <Dialog open={dialogNuevaTarea} onOpenChange={(open) => {
        setDialogNuevaTarea(open);
        if (!open) {
          setTareaEditando(null);
          setNuevaTarea({ code: '', label: '', icon: '', color: branding.primaryColor });
        }
      }}>
        <DialogContent className="max-w-md" aria-describedby="new-task-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {tareaEditando ? (
                <>
                  <Pencil className="w-5 h-5 inline mr-2" style={{ color: branding.primaryColor }} />
                  Modifier la tâche
                </>
              ) : (
                <>
                  <ListTodo className="w-5 h-5 inline mr-2" style={{ color: branding.primaryColor }} />
                  Ajouter une nouvelle tâche
                </>
              )}
            </DialogTitle>
            <DialogDescription id="new-task-description">
              {tareaEditando 
                ? 'Modifiez les informations de la tâche personnalisée'
                : 'Créez une nouvelle tâche personnalisée avec code, nom, icône et couleur'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="task-code">Code de tâche *</Label>
              <Input
                id="task-code"
                value={nuevaTarea.code}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, code: e.target.value })}
                placeholder="Ex: formation, reception, emballage"
                maxLength={30}
              />
              <p className="text-xs text-gray-500 mt-1">Code unique pour identifier la tâche</p>
            </div>

            <div>
              <Label htmlFor="task-label">Nom de la tâche *</Label>
              <Input
                id="task-label"
                value={nuevaTarea.label}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, label: e.target.value })}
                placeholder="Ex: Formation des bénévoles"
              />
            </div>

            <div>
              <Label htmlFor="task-icon">Icône (emoji)</Label>
              {/* Selector visual de iconos */}
              <div className="mb-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '📦', '🚛', '📋', '🤝', '🏪', '👨‍🍳', '🧹', '📊',
                    '📝', '💼', '🔧', '⚙️', '🎯', '📞', '📧', '💻',
                    '📅', '🗓️', '⏰', '✅', '❌', '🔔', '🔍', '🔑',
                    '📌', '📍', '🏷️', '💡', '⭐', '🎨', '📸', '🎥',
                    '🔒', '🔓', '💰', '💳', '🎁', '🛒', '🔨', '🧰',
                    '📱', '🖥️', '⌨️', '🖱️', '🖨️', '📡', '🌐', '🔗',
                    '📑', '📄', '📃', '🗂️', '📂', '📁', '📓', '📔',
                    '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '✂️',
                    '📐', '📏', '🔎', '👥', '👤', '🎓', '🏆', '🎪'
                  ].map((icon, index) => (
                    <button
                      key={`icon-${index}-${icon}`}
                      type="button"
                      onClick={() => setNuevaTarea({ ...nuevaTarea, icon })}
                      className={`text-2xl p-2 rounded hover:bg-white transition-all border-2 ${
                        nuevaTarea.icon === icon ? 'border-blue-500 bg-white scale-110' : 'border-transparent'
                      }`}
                      title={icon}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                id="task-icon"
                value={nuevaTarea.icon}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, icon: e.target.value })}
                placeholder="Ex: 📦, 🚛, 📋"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez une icône ci-dessus ou saisissez un emoji
              </p>
            </div>

            <div>
              <Label htmlFor="task-color">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  id="task-color"
                  type="color"
                  value={nuevaTarea.color}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={nuevaTarea.color}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, color: e.target.value })}
                  placeholder="#1a4d7a"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <Label className="text-xs text-gray-500 mb-2 block">Aperçu</Label>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="p-2.5 border-2 rounded-lg"
                  style={{
                    borderColor: nuevaTarea.color,
                    backgroundColor: `${nuevaTarea.color}15`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">
                      {nuevaTarea.icon || '✓'}
                    </span>
                    <span 
                      className="text-[10px] font-semibold text-center"
                      style={{ 
                        color: nuevaTarea.color,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {nuevaTarea.label || 'Tâche'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogNuevaTarea(false);
                setNuevaTarea({ code: '', label: '', icon: '', color: branding.primaryColor });
                setTareaEditando(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (tareaEditando) {
                  // Verificar si es una tarea predeterminada
                  if (tareaEditando.startsWith('predefined-')) {
                    const codeOriginal = tareaEditando.replace('predefined-', '');
                    handleActualizarTareaPredeterminada(codeOriginal);
                  } else {
                    // Es una tarea personalizada
                    handleActualizarTareaPersonalizada(tareaEditando);
                  }
                } else {
                  handleAgregarTarea();
                }
              }}
              className="text-white"
              style={{ backgroundColor: branding.secondaryColor }}
            >
              {tareaEditando ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Mettre à jour
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Gestión de Tareas */}
      <Dialog open={dialogGestionTareas} onOpenChange={setDialogGestionTareas}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" aria-describedby="manage-tasks-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Settings className="w-5 h-5 inline mr-2" style={{ color: branding.secondaryColor }} />
              Gestion des tâches personnalisées
            </DialogTitle>
            <DialogDescription id="manage-tasks-description">
              Gérez toutes vos tâches personnalisées : modifier, supprimer ou voir les détails
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg border-2" style={{ borderColor: branding.primaryColor, backgroundColor: `${branding.primaryColor}10` }}>
                <div className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                  {tareasPersonalizadas.length}
                </div>
                <div className="text-xs text-gray-600">Tâches créées</div>
              </div>
              <div className="p-3 rounded-lg border-2" style={{ borderColor: branding.secondaryColor, backgroundColor: `${branding.secondaryColor}10` }}>
                <div className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                  {tareasPersonalizadas.filter(t => selectedTasks.includes(t.code)).length}
                </div>
                <div className="text-xs text-gray-600">Tâches actives</div>
              </div>
              <div className="p-3 rounded-lg border-2 border-gray-300 bg-gray-50">
                <div className="text-2xl font-bold text-gray-700">
                  {defaultTasks.length}
                </div>
                <div className="text-xs text-gray-600">Tâches prédéfinies</div>
              </div>
            </div>

            {/* Lista de tareas */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {tareasPersonalizadas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune tâche personnalisée</p>
                  <p className="text-xs mt-1">Cliquez sur "Ajouter" pour créer votre première tâche</p>
                </div>
              ) : (
                tareasPersonalizadas.map((tarea) => {
                  const isActive = selectedTasks.includes(tarea.code);
                  return (
                    <div
                      key={tarea.id}
                      className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                      style={{
                        borderColor: isActive ? tarea.color : '#E0E0E0',
                        backgroundColor: isActive ? `${tarea.color}08` : 'white'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Icono */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${tarea.color}20` }}
                          >
                            {tarea.icon || '✓'}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className="font-semibold text-sm"
                                style={{ color: tarea.color, fontFamily: 'Montserrat, sans-serif' }}
                              >
                                {tarea.label}
                              </h4>
                              {isActive && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                                  style={{ backgroundColor: tarea.color }}
                                >
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{tarea.code}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: tarea.color }}
                                />
                                {tarea.color}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 ml-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNuevaTarea({
                                code: tarea.code,
                                label: tarea.label,
                                icon: tarea.icon,
                                color: tarea.color
                              });
                              setTareaEditando(tarea.id);
                              setDialogGestionTareas(false);
                              setDialogNuevaTarea(true);
                            }}
                            className="gap-1"
                            style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
                          >
                            <Pencil className="w-3 h-3" />
                            <span className="text-xs">Modifier</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Voulez-vous vraiment supprimer la tâche "${tarea.label}" ?`)) {
                                handleEliminarTareaPersonalizada(tarea.id, tarea.code);
                              }
                            }}
                            className="gap-1"
                            style={{ borderColor: '#EF4444', color: '#EF4444' }}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="text-xs">Supprimer</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogGestionTareas(false);
                setDialogNuevaTarea(true);
                setTareaEditando(null);
                setNuevaTarea({ code: '', label: '', icon: '', color: branding.primaryColor });
              }}
              className="gap-2"
              style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              Ajouter une nouvelle tâche
            </Button>
            <Button
              type="button"
              onClick={() => setDialogGestionTareas(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}