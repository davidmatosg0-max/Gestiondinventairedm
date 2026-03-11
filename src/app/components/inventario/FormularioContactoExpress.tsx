/**
 * ====================================================================
 * FORMULARIO EXPRESS: Registro Rápido de Contactos (Donador/Proveedor)
 * ====================================================================
 * 
 * MÓDULO: Entrepôt (Inventaire)
 * UBICACIÓN: /src/app/components/inventario/FormularioContactoExpress.tsx
 * TIPO: Formulario Simplificado - Nivel 1
 * 
 * PROPÓSITO:
 * - Registro ultra-rápido de donadores y proveedores simples
 * - Solo campos esenciales (8 campos máximo)
 * - Sin pestañas - Todo en una pantalla
 * - Tiempo de registro: < 1 minuto
 * 
 * TIPOS DE CONTACTO SOPORTADOS:
 * - Donateur (Donador) - 6 campos mínimos
 * - Fournisseur (Proveedor) - 8 campos con datos de empresa
 * 
 * CAMPOS INCLUIDOS:
 * 
 * DONATEUR (6 campos):
 * ✅ Tipo de contacto (selector visual)
 * ✅ Prénom + Nom (en línea)
 * ✅ Téléphone
 * ✅ Email
 * ✅ Ville
 * ✅ Notes (opcional)
 * 
 * FOURNISSEUR (8 campos):
 * ✅ Tipo de contacto (selector visual)
 * ✅ Prénom + Nom (en línea)
 * ✅ Entreprise
 * ✅ Téléphone
 * ✅ Email
 * ✅ Ville
 * ✅ Catégorie de produits
 * ✅ Notes (opcional)
 * 
 * STORAGE:
 * - Key: 'banqueAlimentaire_contactosDepartamento'
 * - Compatible con sistema unificado
 * 
 * ACCESIBILIDAD:
 * - aria-describedby: "contact-express-form-description"
 * 
 * VERSIÓN: 1.0
 * CREADO: 11 marzo 2026
 * ====================================================================
 */

import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Gift,
  Package,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

interface FormContactoExpressData {
  tipoContacto: 'fournisseur' | 'donador';
  nombre: string;
  apellido: string;
  nombreEmpresa: string; // Solo para Fournisseur
  emailPrincipal: string;
  telefonoPrincipal: string;
  ciudad: string;
  categoriaProductos: string[]; // Solo para Fournisseur
  notas: string;
  // Campos auto-completados
  activo: boolean;
  departamentosAsignados: string[];
  imagen: string | null;
  numeroID: string;
  // Resto de campos con valores por defecto
  apellido2?: string;
  tipoEmpresa: string;
  numeroRegistro: string;
  numeroTVA: string;
  emailSecundario: string;
  telefonoSecundario: string;
  sitioWeb: string;
  direccion: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  banco: string;
  numeroCuenta: string;
  numeroRuta: string;
  temperaturaEspecializada: string[];
  horarioDisponible: string;
  diasOperacion: string[];
  tiempoEntrega: string;
  metodoPago: string[];
  etiquetas: string[];
  fechaNacimiento: string;
  genero: string;
}

interface FormularioContactoExpressProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormContactoExpressData;
  setFormulario: React.Dispatch<React.SetStateAction<FormContactoExpressData>>;
  onGuardar: () => void;
  modoEdicion?: boolean;
}

export function FormularioContactoExpress({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  onGuardar,
  modoEdicion = false
}: FormularioContactoExpressProps) {
  const branding = useBranding();
  const [mostrarCampoOpcional, setMostrarCampoOpcional] = useState(false);

  // Efecto para auto-asignar departamento Entrepôt
  useEffect(() => {
    if (abierto && !formulario.departamentosAsignados.includes('1')) {
      setFormulario(prev => ({
        ...prev,
        departamentosAsignados: ['1']
      }));
    }
  }, [abierto]);

  const tiposContacto = [
    { 
      value: 'donador', 
      label: 'Donateur', 
      icon: Gift,
      color: '#FF5722',
      descripcion: 'Personne ou organisation qui fait des dons'
    },
    { 
      value: 'fournisseur', 
      label: 'Fournisseur', 
      icon: Package,
      color: '#1E73BE',
      descripcion: 'Entreprise qui fournit des produits'
    }
  ];

  const categoriesProductos = [
    { value: 'sec', label: '🥫 Produits secs', color: '#795548' },
    { value: 'frais', label: '🥬 Produits frais', color: '#4CAF50' },
    { value: 'refrigere', label: '❄️ Réfrigérés', color: '#2196F3' },
    { value: 'congele', label: '🧊 Congelés', color: '#00BCD4' },
    { value: 'boulangerie', label: '🍞 Boulangerie', color: '#FF9800' },
    { value: 'viande', label: '🥩 Viandes', color: '#E91E63' },
    { value: 'produits-laitiers', label: '🥛 Produits laitiers', color: '#9C27B0' },
    { value: 'fruits-legumes', label: '🍎 Fruits & Légumes', color: '#8BC34A' }
  ];

  const toggleCategoria = (categoria: string) => {
    if (formulario.categoriaProductos.includes(categoria)) {
      setFormulario({
        ...formulario,
        categoriaProductos: formulario.categoriaProductos.filter(c => c !== categoria)
      });
    } else {
      setFormulario({
        ...formulario,
        categoriaProductos: [...formulario.categoriaProductos, categoria]
      });
    }
  };

  const handleGuardarRapido = () => {
    // Validación mínima
    if (!formulario.nombre || !formulario.apellido) {
      alert('Prénom et Nom sont obligatoires');
      return;
    }

    if (!formulario.telefonoPrincipal && !formulario.emailPrincipal) {
      alert('Téléphone ou Email est obligatoire');
      return;
    }

    if (formulario.tipoContacto === 'fournisseur' && !formulario.nombreEmpresa) {
      alert('Le nom de l\'entreprise est obligatoire pour un fournisseur');
      return;
    }

    onGuardar();
  };

  const tipoSeleccionado = tiposContacto.find(t => t.value === formulario.tipoContacto);
  const IconoTipo = tipoSeleccionado?.icon || Package;

  // FORZAR RE-RENDER cuando cambia el tipo de contacto
  const [keyFormulario, setKeyFormulario] = React.useState(0);

  // Observar cambios en tipoContacto y forzar re-render
  React.useEffect(() => {
    setKeyFormulario(prev => prev + 1);
  }, [formulario.tipoContacto]);

  const validarFormulario = () => {
    // Validación mínima
    if (!formulario.nombre || !formulario.apellido) {
      alert('Prénom et Nom sont obligatoires');
      return false;
    }

    if (!formulario.telefonoPrincipal && !formulario.emailPrincipal) {
      alert('Téléphone ou Email est obligatoire');
      return false;
    }

    if (formulario.tipoContacto === 'fournisseur' && !formulario.nombreEmpresa) {
      alert('Le nom de l\'entreprise est obligatoire pour un fournisseur');
      return false;
    }

    return true;
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-2xl !max-h-[90vh] overflow-hidden p-0 rounded-xl"
      >
        {/* DialogHeader oculto visualmente pero presente para accesibilidad */}
        <DialogHeader className="sr-only">
          <DialogTitle>
            {modoEdicion ? 'Modifier le contact' : 'Enregistrement Express'}
          </DialogTitle>
          <DialogDescription>
            Ajoutez rapidement un nouveau contact en moins d&apos;une minute
          </DialogDescription>
        </DialogHeader>

        <div className="h-full flex flex-col bg-white">
          {/* Header con gradiente */}
          <div 
            className="px-6 py-5 text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
            }}
          >
            {/* Patrón decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                    aria-hidden="true"
                  >
                    {modoEdicion ? 'Modifier le contact' : 'Enregistrement Express'}
                  </h2>
                  <p 
                    className="text-white/90 text-sm mt-0.5"
                    aria-hidden="true"
                  >
                    Ajoutez rapidement un nouveau contact en moins d&apos;une minute
                  </p>
                </div>
              </div>

              {/* Badge de tiempo estimado */}
              <div className="flex items-center gap-2 mt-3">
                <Badge 
                  variant="secondary" 
                  className="bg-white/20 text-white border-0 backdrop-blur-sm"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Moins de 60 secondes
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="bg-white/20 text-white border-0 backdrop-blur-sm"
                >
                  {formulario.tipoContacto === 'donador' ? '6' : '8'} champs seulement
                </Badge>
              </div>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Selector de tipo de contacto - MUY VISIBLE */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Type de contact *
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {tiposContacto.map((tipo) => {
                  const isSelected = formulario.tipoContacto === tipo.value;
                  const Icono = tipo.icon;
                  
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setFormulario({ ...formulario, tipoContacto: tipo.value as any })}
                      className={`
                        p-6 rounded-xl border-3 transition-all duration-300 text-left
                        ${isSelected 
                          ? 'shadow-2xl scale-110 ring-4 ring-opacity-30' 
                          : 'hover:border-gray-300 hover:shadow-md opacity-60 hover:opacity-100'
                        }
                      `}
                      style={{
                        borderColor: isSelected ? tipo.color : '#E5E7EB',
                        backgroundColor: isSelected ? `${tipo.color}20` : '#FAFAFA',
                        borderWidth: isSelected ? '3px' : '2px',
                        ringColor: isSelected ? tipo.color : 'transparent'
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div 
                          className={`w-16 h-16 rounded-xl flex items-center justify-center transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}
                          style={{ backgroundColor: `${tipo.color}30` }}
                        >
                          <Icono className="w-8 h-8" style={{ color: tipo.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className={`font-bold text-lg mb-1 transition-all ${isSelected ? 'scale-105' : ''}`}
                            style={{ 
                              color: isSelected ? tipo.color : '#6B7280',
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            {tipo.label}
                          </div>
                          <div className="text-xs text-gray-600 leading-tight">
                            {tipo.descripcion}
                          </div>
                          {isSelected && (
                            <div className="mt-2">
                              <Badge 
                                style={{ 
                                  backgroundColor: tipo.color,
                                  color: 'white'
                                }}
                              >
                                ✓ SÉLECTIONNÉ
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MEGA Banner informativo - IMPOSIBLE DE NO VER */}
            <div 
              className="p-6 rounded-xl border-4 transition-all duration-500 transform"
              style={{ 
                backgroundColor: tipoSeleccionado ? `${tipoSeleccionado.color}15` : '#F3F4F6',
                borderColor: tipoSeleccionado?.color || '#9CA3AF',
                boxShadow: tipoSeleccionado ? `0 8px 30px ${tipoSeleccionado.color}40` : 'none'
              }}
            >
              <div className="flex items-start gap-4">
                {tipoSeleccionado && (
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse"
                    style={{ backgroundColor: `${tipoSeleccionado.color}30` }}
                  >
                    <IconoTipo className="w-7 h-7" style={{ color: tipoSeleccionado.color }} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg font-bold mb-2" style={{ 
                    color: tipoSeleccionado?.color || '#6B7280',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {formulario.tipoContacto === 'donador' 
                      ? '🎁 MODE DONATEUR ACTIVÉ'
                      : '📦 MODE FOURNISSEUR ACTIVÉ'
                    }
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    {formulario.tipoContacto === 'donador' 
                      ? 'Formulaire simplifié avec 6 champs essentiels pour un enregistrement rapide'
                      : 'Formulaire avec 8 champs incluant les informations d\'entreprise et catégories de produits'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" style={{ backgroundColor: `${tipoSeleccionado?.color}20`, color: tipoSeleccionado?.color }}>
                      {formulario.tipoContacto === 'donador' ? '6' : '8'} champs obligatoires
                    </Badge>
                    <Badge variant="secondary" style={{ backgroundColor: `${tipoSeleccionado?.color}20`, color: tipoSeleccionado?.color }}>
                      ⚡ &lt; 60 secondes
                    </Badge>
                    {formulario.tipoContacto === 'fournisseur' && (
                      <Badge variant="secondary" style={{ backgroundColor: `${tipoSeleccionado?.color}20`, color: tipoSeleccionado?.color }}>
                        + Entreprise & Catégories
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Separador visual */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-semibold text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  INFORMATIONS {formulario.tipoContacto === 'donador' ? 'DU DONATEUR' : 'DU FOURNISSEUR'}
                </span>
              </div>
            </div>

            {/* Campos esenciales */}
            <div className="space-y-4" key={`formulario-${formulario.tipoContacto}-${keyFormulario}`}>
              {/* SECCIÓN EXCLUSIVA PARA DONATEUR */}
              {formulario.tipoContacto === 'donador' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  {/* Banner DONATEUR */}
                  <div 
                    className="p-4 rounded-xl border-2 animate-pulse"
                    style={{ 
                      backgroundColor: '#FF572210',
                      borderColor: '#FF5722',
                      boxShadow: '0 0 20px #FF572230'
                    }}
                  >
                    <p className="text-center font-bold text-lg" style={{ color: '#FF5722', fontFamily: 'Montserrat, sans-serif' }}>
                      🎁 FORMULAIRE DONATEUR - 6 CHAMPS UNIQUEMENT
                    </p>
                  </div>

                  {/* Fila 1: Prénom + Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#FF5722' }} />
                        Prénom *
                      </Label>
                      <Input
                        id="nombre"
                        value={formulario.nombre}
                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                        placeholder="Jean"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.nombre ? '#FF5722' : '#E5E7EB',
                          boxShadow: formulario.nombre ? '0 0 0 3px #FF572220' : 'none'
                        }}
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#FF5722' }} />
                        Nom *
                      </Label>
                      <Input
                        id="apellido"
                        value={formulario.apellido}
                        onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                        placeholder="Dupont"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.apellido ? '#FF5722' : '#E5E7EB',
                          boxShadow: formulario.apellido ? '0 0 0 3px #FF572220' : 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Fila 2: Téléphone + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefonoPrincipal" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4" style={{ color: '#FF5722' }} />
                        Téléphone *
                      </Label>
                      <Input
                        id="telefonoPrincipal"
                        type="tel"
                        value={formulario.telefonoPrincipal}
                        onChange={(e) => setFormulario({ ...formulario, telefonoPrincipal: e.target.value })}
                        placeholder="(514) 555-0123"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.telefonoPrincipal ? '#FF5722' : '#E5E7EB',
                          boxShadow: formulario.telefonoPrincipal ? '0 0 0 3px #FF572220' : 'none'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailPrincipal" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: '#FF5722' }} />
                        Email *
                      </Label>
                      <Input
                        id="emailPrincipal"
                        type="email"
                        value={formulario.emailPrincipal}
                        onChange={(e) => setFormulario({ ...formulario, emailPrincipal: e.target.value })}
                        placeholder="contact@exemple.com"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.emailPrincipal ? '#FF5722' : '#E5E7EB',
                          boxShadow: formulario.emailPrincipal ? '0 0 0 3px #FF572220' : 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Ville */}
                  <div>
                    <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#FF5722' }} />
                      Ville
                    </Label>
                    <Input
                      id="ciudad"
                      value={formulario.ciudad}
                      onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
                      placeholder="Laval"
                      className="h-11 text-sm border-2"
                      style={{ 
                        borderColor: formulario.ciudad ? '#FF5722' : '#E5E7EB',
                        boxShadow: formulario.ciudad ? '0 0 0 3px #FF572220' : 'none'
                      }}
                    />
                  </div>

                  {/* Botón para mostrar campo opcional */}
                  {!mostrarCampoOpcional && (
                    <button
                      type="button"
                      onClick={() => setMostrarCampoOpcional(true)}
                      className="text-sm hover:text-gray-700 flex items-center gap-2 w-full p-3 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                      style={{ color: '#FF5722', borderColor: '#FF572240' }}
                    >
                      <FileText className="w-4 h-4" />
                      + Ajouter des notes (optionnel)
                    </button>
                  )}

                  {/* Notes (opcional) */}
                  {mostrarCampoOpcional && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="notas" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: '#FF5722' }} />
                        Notes
                        <span className="text-xs text-gray-400 font-normal ml-1">(optionnel)</span>
                      </Label>
                      <Textarea
                        id="notas"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder="Notes additionnelles..."
                        rows={3}
                        className="text-sm border-2 resize-none"
                        style={{ 
                          borderColor: formulario.notas ? '#FF5722' : '#E5E7EB',
                          boxShadow: formulario.notas ? '0 0 0 3px #FF572220' : 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SECCIÓN EXCLUSIVA PARA FOURNISSEUR */}
              {formulario.tipoContacto === 'fournisseur' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Banner FOURNISSEUR */}
                  <div 
                    className="p-4 rounded-xl border-2 animate-pulse"
                    style={{ 
                      backgroundColor: '#1E73BE10',
                      borderColor: '#1E73BE',
                      boxShadow: '0 0 20px #1E73BE30'
                    }}
                  >
                    <p className="text-center font-bold text-lg" style={{ color: '#1E73BE', fontFamily: 'Montserrat, sans-serif' }}>
                      📦 FORMULAIRE FOURNISSEUR - 8 CHAMPS + ENTREPRISE
                    </p>
                  </div>

                  {/* Fila 1: Prénom + Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#1E73BE' }} />
                        Prénom *
                      </Label>
                      <Input
                        id="nombre-f"
                        value={formulario.nombre}
                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                        placeholder="Jean"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.nombre ? '#1E73BE' : '#E5E7EB',
                          boxShadow: formulario.nombre ? '0 0 0 3px #1E73BE20' : 'none'
                        }}
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#1E73BE' }} />
                        Nom *
                      </Label>
                      <Input
                        id="apellido-f"
                        value={formulario.apellido}
                        onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                        placeholder="Dupont"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.apellido ? '#1E73BE' : '#E5E7EB',
                          boxShadow: formulario.apellido ? '0 0 0 3px #1E73BE20' : 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Empresa - CAMPO ÚNICO PARA FOURNISSEUR */}
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
                    <Label htmlFor="nombreEmpresa" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Building2 className="w-4 h-4" style={{ color: '#1E73BE' }} />
                      Nom de l&apos;entreprise *
                      <Badge style={{ backgroundColor: '#1E73BE', color: 'white' }}>REQUIS</Badge>
                    </Label>
                    <Input
                      id="nombreEmpresa"
                      value={formulario.nombreEmpresa}
                      onChange={(e) => setFormulario({ ...formulario, nombreEmpresa: e.target.value })}
                      placeholder="Aliments ABC Inc."
                      className="h-11 text-sm border-2"
                      style={{ 
                        borderColor: formulario.nombreEmpresa ? '#1E73BE' : '#E5E7EB',
                        boxShadow: formulario.nombreEmpresa ? '0 0 0 3px #1E73BE20' : 'none'
                      }}
                    />
                  </div>

                  {/* Fila 2: Téléphone + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefonoPrincipal-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4" style={{ color: '#1E73BE' }} />
                        Téléphone *
                      </Label>
                      <Input
                        id="telefonoPrincipal-f"
                        type="tel"
                        value={formulario.telefonoPrincipal}
                        onChange={(e) => setFormulario({ ...formulario, telefonoPrincipal: e.target.value })}
                        placeholder="(514) 555-0123"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.telefonoPrincipal ? '#1E73BE' : '#E5E7EB',
                          boxShadow: formulario.telefonoPrincipal ? '0 0 0 3px #1E73BE20' : 'none'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailPrincipal-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: '#1E73BE' }} />
                        Email *
                      </Label>
                      <Input
                        id="emailPrincipal-f"
                        type="email"
                        value={formulario.emailPrincipal}
                        onChange={(e) => setFormulario({ ...formulario, emailPrincipal: e.target.value })}
                        placeholder="contact@exemple.com"
                        className="h-11 text-sm border-2"
                        style={{ 
                          borderColor: formulario.emailPrincipal ? '#1E73BE' : '#E5E7EB',
                          boxShadow: formulario.emailPrincipal ? '0 0 0 3px #1E73BE20' : 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Ville */}
                  <div>
                    <Label htmlFor="ciudad-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#1E73BE' }} />
                      Ville
                    </Label>
                    <Input
                      id="ciudad-f"
                      value={formulario.ciudad}
                      onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
                      placeholder="Laval"
                      className="h-11 text-sm border-2"
                      style={{ 
                        borderColor: formulario.ciudad ? '#1E73BE' : '#E5E7EB',
                        boxShadow: formulario.ciudad ? '0 0 0 3px #1E73BE20' : 'none'
                      }}
                    />
                  </div>

                  {/* Catégories de produits - CAMPO ÚNICO PARA FOURNISSEUR */}
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: '#1E73BE' }} />
                      Catégories de produits
                      {formulario.categoriaProductos.length > 0 && (
                        <Badge style={{ backgroundColor: '#1E73BE', color: 'white' }}>
                          {formulario.categoriaProductos.length} sélectionnée{formulario.categoriaProductos.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {categoriesProductos.map((cat) => {
                        const isSelected = formulario.categoriaProductos.includes(cat.value);
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => toggleCategoria(cat.value)}
                            className={`\n                              px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all text-left\n                              ${isSelected ? 'shadow-lg scale-105' : 'hover:border-gray-300'}\n                            `}\n                            style={{\n                              borderColor: isSelected ? cat.color : '#E5E7EB',\n                              backgroundColor: isSelected ? `${cat.color}20` : '#FFFFFF',\n                              color: isSelected ? cat.color : '#6B7280'\n                            }}\n                          >\n                            {cat.label}\n                          </button>\n                        );\n                      })}\n                    </div>\n                  </div>

                  {/* Botón para mostrar campo opcional */}
                  {!mostrarCampoOpcional && (
                    <button
                      type="button"
                      onClick={() => setMostrarCampoOpcional(true)}
                      className="text-sm hover:text-gray-700 flex items-center gap-2 w-full p-3 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                      style={{ color: '#1E73BE', borderColor: '#1E73BE40' }}
                    >
                      <FileText className="w-4 h-4" />
                      + Ajouter des notes (optionnel)
                    </button>
                  )}

                  {/* Notes (opcional) */}
                  {mostrarCampoOpcional && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="notas-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: '#1E73BE' }} />
                        Notes
                        <span className="text-xs text-gray-400 font-normal ml-1">(optionnel)</span>
                      </Label>
                      <Textarea
                        id="notas-f"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder="Notes additionnelles..."
                        rows={3}
                        className="text-sm border-2 resize-none"
                        style={{ 
                          borderColor: formulario.notas ? '#1E73BE' : '#E5E7EB',
                          boxShadow: formulario.notas ? '0 0 0 3px #1E73BE20' : 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info box */}
            <div 
              className="p-4 rounded-lg border-l-4"
              style={{ 
                backgroundColor: `${branding.primaryColor}05`,
                borderColor: branding.primaryColor
              }}
            >
              <div className="flex gap-3">
                <Zap className="w-5 h-5 flex-shrink-0" style={{ color: branding.primaryColor }} />
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-700">Enregistrement rapide</p>
                  <p>
                    Ce formulaire simplifié enregistre les informations essentielles. 
                    Vous pourrez compléter les détails plus tard en éditant le contact.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
            <div className="text-xs text-gray-500">
              * Champs obligatoires
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCerrar}
                className="h-10 px-6 text-sm border-gray-300"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleGuardarRapido}
                className="h-10 px-8 text-white text-sm shadow-md hover:shadow-lg transition-shadow"
                style={{ 
                  backgroundColor: branding.secondaryColor,
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 600
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Enregistrer rapidement
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}