/**
 * ====================================================================
 * FORMULARIO EXPRESS: Registro Rápido de Contactos (Donador/Proveedor)
 * ====================================================================
 * VERSIÓN: 2.0 - SOLUCIÓN DEFINITIVA
 * GARANTIZA: Formularios completamente diferentes y visibles
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
  nombreEmpresa: string;
  emailPrincipal: string;
  telefonoPrincipal: string;
  ciudad: string;
  categoriaProductos: string[];
  notas: string;
  activo: boolean;
  departamentosAsignados: string[];
  imagen: string | null;
  numeroID: string;
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

// ==========================================
// COMPONENTE PARA DONATEUR (VERDE)
// ==========================================
function FormularioDonateur({ 
  formulario, 
  setFormulario,
  mostrarCampoOpcional,
  setMostrarCampoOpcional 
}: {
  formulario: FormContactoExpressData;
  setFormulario: React.Dispatch<React.SetStateAction<FormContactoExpressData>>;
  mostrarCampoOpcional: boolean;
  setMostrarCampoOpcional: (val: boolean) => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Banner DONATEUR VERDE */}
      <div 
        className="p-4 rounded-xl border-2 animate-pulse"
        style={{ 
          backgroundColor: '#4CAF5010',
          borderColor: '#4CAF50',
          boxShadow: '0 0 20px #4CAF5030'
        }}
      >
        <p className="text-center font-bold text-lg" style={{ color: '#4CAF50', fontFamily: 'Montserrat, sans-serif' }}>
          🎁 FORMULAIRE DONATEUR - 6 CHAMPS UNIQUEMENT
        </p>
      </div>

      {/* Prénom + Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre-d" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: '#4CAF50' }} />
            Prénom *
          </Label>
          <Input
            id="nombre-d"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            placeholder="Jean"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.nombre ? '#4CAF50' : '#E5E7EB',
              boxShadow: formulario.nombre ? '0 0 0 3px #4CAF5020' : 'none'
            }}
          />
        </div>
        <div>
          <Label htmlFor="apellido-d" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: '#4CAF50' }} />
            Nom *
          </Label>
          <Input
            id="apellido-d"
            value={formulario.apellido}
            onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
            placeholder="Dupont"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.apellido ? '#4CAF50' : '#E5E7EB',
              boxShadow: formulario.apellido ? '0 0 0 3px #4CAF5020' : 'none'
            }}
          />
        </div>
      </div>

      {/* Téléphone + Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tel-d" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Phone className="w-4 h-4" style={{ color: '#4CAF50' }} />
            Téléphone *
          </Label>
          <Input
            id="tel-d"
            type="tel"
            value={formulario.telefonoPrincipal}
            onChange={(e) => setFormulario({ ...formulario, telefonoPrincipal: e.target.value })}
            placeholder="(514) 555-0123"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.telefonoPrincipal ? '#4CAF50' : '#E5E7EB',
              boxShadow: formulario.telefonoPrincipal ? '0 0 0 3px #4CAF5020' : 'none'
            }}
          />
        </div>
        <div>
          <Label htmlFor="email-d" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: '#4CAF50' }} />
            Email *
          </Label>
          <Input
            id="email-d"
            type="email"
            value={formulario.emailPrincipal}
            onChange={(e) => setFormulario({ ...formulario, emailPrincipal: e.target.value })}
            placeholder="contact@exemple.com"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.emailPrincipal ? '#4CAF50' : '#E5E7EB',
              boxShadow: formulario.emailPrincipal ? '0 0 0 3px #4CAF5020' : 'none'
            }}
          />
        </div>
      </div>

      {/* Ville */}
      <div>
        <Label htmlFor="ciudad-d" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: '#4CAF50' }} />
          Ville
        </Label>
        <Input
          id="ciudad-d"
          value={formulario.ciudad}
          onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
          placeholder="Laval"
          className="h-11 text-sm border-2"
          style={{ 
            borderColor: formulario.ciudad ? '#4CAF50' : '#E5E7EB',
            boxShadow: formulario.ciudad ? '0 0 0 3px #4CAF5020' : 'none'
          }}
        />
      </div>

      {/* Botón para notas */}
      {!mostrarCampoOpcional && (
        <button
          type="button"
          onClick={() => setMostrarCampoOpcional(true)}
          className="text-sm hover:text-gray-700 flex items-center gap-2 w-full p-3 rounded-lg border-2 border-dashed hover:border-solid transition-all"
          style={{ color: '#4CAF50', borderColor: '#4CAF5040' }}
        >
          <FileText className="w-4 h-4" />
          + Ajouter des notes (optionnel)
        </button>
      )}

      {/* Notes */}
      {mostrarCampoOpcional && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <Label htmlFor="notas-d" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#4CAF50' }} />
            Notes
            <span className="text-xs text-gray-400 font-normal ml-1">(optionnel)</span>
          </Label>
          <Textarea
            id="notas-d"
            value={formulario.notas}
            onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
            placeholder="Notes additionnelles..."
            rows={3}
            className="text-sm border-2 resize-none"
            style={{ 
              borderColor: formulario.notas ? '#4CAF50' : '#E5E7EB',
              boxShadow: formulario.notas ? '0 0 0 3px #4CAF5020' : 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PARA FOURNISSEUR (NARANJA)
// ==========================================
function FormularioFournisseur({ 
  formulario, 
  setFormulario,
  mostrarCampoOpcional,
  setMostrarCampoOpcional 
}: {
  formulario: FormContactoExpressData;
  setFormulario: React.Dispatch<React.SetStateAction<FormContactoExpressData>>;
  mostrarCampoOpcional: boolean;
  setMostrarCampoOpcional: (val: boolean) => void;
}) {
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

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Banner FOURNISSEUR NARANJA */}
      <div 
        className="p-4 rounded-xl border-2 animate-pulse"
        style={{ 
          backgroundColor: '#FF980010',
          borderColor: '#FF9800',
          boxShadow: '0 0 20px #FF980030'
        }}
      >
        <p className="text-center font-bold text-lg" style={{ color: '#FF9800', fontFamily: 'Montserrat, sans-serif' }}>
          📦 FORMULAIRE FOURNISSEUR - 8 CHAMPS + ENTREPRISE
        </p>
      </div>

      {/* Prénom + Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: '#FF9800' }} />
            Prénom *
          </Label>
          <Input
            id="nombre-f"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            placeholder="Jean"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.nombre ? '#FF9800' : '#E5E7EB',
              boxShadow: formulario.nombre ? '0 0 0 3px #FF980020' : 'none'
            }}
          />
        </div>
        <div>
          <Label htmlFor="apellido-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: '#FF9800' }} />
            Nom *
          </Label>
          <Input
            id="apellido-f"
            value={formulario.apellido}
            onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
            placeholder="Dupont"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.apellido ? '#FF9800' : '#E5E7EB',
              boxShadow: formulario.apellido ? '0 0 0 3px #FF980020' : 'none'
            }}
          />
        </div>
      </div>

      {/* EMPRESA - EXCLUSIVO FOURNISSEUR */}
      <div className="relative">
        <div className="absolute -left-3 top-0 bottom-0 w-1 rounded-full" style={{ background: 'linear-gradient(180deg, #FF9800 0%, #F57C00 100%)' }}></div>
        <Label htmlFor="empresa-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
          <Building2 className="w-4 h-4" style={{ color: '#FF9800' }} />
          Nom de l&apos;entreprise *
          <Badge style={{ backgroundColor: '#FF9800', color: 'white' }}>EXCLUSIF FOURNISSEUR</Badge>
        </Label>
        <Input
          id="empresa-f"
          value={formulario.nombreEmpresa}
          onChange={(e) => setFormulario({ ...formulario, nombreEmpresa: e.target.value })}
          placeholder="Aliments ABC Inc."
          className="h-11 text-sm border-2"
          style={{ 
            borderColor: formulario.nombreEmpresa ? '#FF9800' : '#E5E7EB',
            boxShadow: formulario.nombreEmpresa ? '0 0 0 3px #FF980020' : 'none'
          }}
        />
      </div>

      {/* Téléphone + Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tel-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Phone className="w-4 h-4" style={{ color: '#FF9800' }} />
            Téléphone *
          </Label>
          <Input
            id="tel-f"
            type="tel"
            value={formulario.telefonoPrincipal}
            onChange={(e) => setFormulario({ ...formulario, telefonoPrincipal: e.target.value })}
            placeholder="(514) 555-0123"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.telefonoPrincipal ? '#FF9800' : '#E5E7EB',
              boxShadow: formulario.telefonoPrincipal ? '0 0 0 3px #FF980020' : 'none'
            }}
          />
        </div>
        <div>
          <Label htmlFor="email-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: '#FF9800' }} />
            Email *
          </Label>
          <Input
            id="email-f"
            type="email"
            value={formulario.emailPrincipal}
            onChange={(e) => setFormulario({ ...formulario, emailPrincipal: e.target.value })}
            placeholder="contact@exemple.com"
            className="h-11 text-sm border-2"
            style={{ 
              borderColor: formulario.emailPrincipal ? '#FF9800' : '#E5E7EB',
              boxShadow: formulario.emailPrincipal ? '0 0 0 3px #FF980020' : 'none'
            }}
          />
        </div>
      </div>

      {/* Ville */}
      <div>
        <Label htmlFor="ciudad-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: '#FF9800' }} />
          Ville
        </Label>
        <Input
          id="ciudad-f"
          value={formulario.ciudad}
          onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
          placeholder="Laval"
          className="h-11 text-sm border-2"
          style={{ 
            borderColor: formulario.ciudad ? '#FF9800' : '#E5E7EB',
            boxShadow: formulario.ciudad ? '0 0 0 3px #FF980020' : 'none'
          }}
        />
      </div>

      {/* CATEGORÍAS - EXCLUSIVO FOURNISSEUR */}
      <div className="relative">
        <div className="absolute -left-3 top-0 bottom-0 w-1 rounded-full" style={{ background: 'linear-gradient(180deg, #FF9800 0%, #F57C00 100%)' }}></div>
        <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: '#FF9800' }} />
          Catégories de produits
          {formulario.categoriaProductos.length > 0 && (
            <Badge style={{ backgroundColor: '#FF9800', color: 'white' }}>
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
                className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all text-left ${isSelected ? 'shadow-lg scale-105' : 'hover:border-gray-300'}`}
                style={{
                  borderColor: isSelected ? cat.color : '#E5E7EB',
                  backgroundColor: isSelected ? `${cat.color}20` : '#FFFFFF',
                  color: isSelected ? cat.color : '#6B7280'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón para notas */}
      {!mostrarCampoOpcional && (
        <button
          type="button"
          onClick={() => setMostrarCampoOpcional(true)}
          className="text-sm hover:text-gray-700 flex items-center gap-2 w-full p-3 rounded-lg border-2 border-dashed hover:border-solid transition-all"
          style={{ color: '#FF9800', borderColor: '#FF980040' }}
        >
          <FileText className="w-4 h-4" />
          + Ajouter des notes (optionnel)
        </button>
      )}

      {/* Notes */}
      {mostrarCampoOpcional && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <Label htmlFor="notas-f" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#FF9800' }} />
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
              borderColor: formulario.notas ? '#FF9800' : '#E5E7EB',
              boxShadow: formulario.notas ? '0 0 0 3px #FF980020' : 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
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

  // Reset campo opcional cuando cambia el tipo
  useEffect(() => {
    setMostrarCampoOpcional(false);
  }, [formulario.tipoContacto]);

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
      color: '#4CAF50',
      descripcion: 'Personne ou organisation qui fait des dons'
    },
    { 
      value: 'fournisseur', 
      label: 'Fournisseur', 
      icon: Package,
      color: '#FF9800',
      descripcion: 'Entreprise qui fournit des produits'
    }
  ];

  const handleGuardarRapido = () => {
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

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-2xl !max-h-[90vh] overflow-hidden p-0 rounded-xl"
        aria-describedby="formulario-contacto-express-desc"
      >
        <DialogHeader className="sr-only">
          <DialogTitle id="formulario-contacto-express-title">
            {modoEdicion ? 'Modifier le contact' : 'Enregistrement Express'}
          </DialogTitle>
          <DialogDescription id="formulario-contacto-express-desc">
            Ajoutez rapidement un nouveau contact en moins d&apos;une minute
          </DialogDescription>
        </DialogHeader>

        <div className="h-full flex flex-col bg-white">
          {/* Header */}
          <div 
            className="px-6 py-5 text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
            }}
          >
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

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Selector de tipo */}
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
                      className={`p-6 rounded-xl border-3 transition-all duration-300 text-left ${isSelected ? 'shadow-2xl scale-110 ring-4 ring-opacity-30' : 'hover:border-gray-300 hover:shadow-md opacity-60 hover:opacity-100'}`}
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

            {/* Banner informativo */}
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
                  <p className="text-2xl font-bold mb-2" style={{ 
                    color: tipoSeleccionado?.color || '#6B7280',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {formulario.tipoContacto === 'donador' 
                      ? '🎁 MODE DONATEUR ACTIVÉ (VERT #4CAF50)'
                      : '📦 MODE FOURNISSEUR ACTIVÉ (ORANGE #FF9800)'
                    }
                  </p>
                  <p className="text-base font-bold mb-3" style={{ color: tipoSeleccionado?.color }}>
                    VALEUR ACTUELLE: {formulario.tipoContacto}
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

            {/* Separador */}
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

            {/* FORMULARIOS SEPARADOS - SOLUCIÓN DEFINITIVA */}
            {formulario.tipoContacto === 'donador' ? (
              <FormularioDonateur 
                formulario={formulario}
                setFormulario={setFormulario}
                mostrarCampoOpcional={mostrarCampoOpcional}
                setMostrarCampoOpcional={setMostrarCampoOpcional}
              />
            ) : (
              <FormularioFournisseur 
                formulario={formulario}
                setFormulario={setFormulario}
                mostrarCampoOpcional={mostrarCampoOpcional}
                setMostrarCampoOpcional={setMostrarCampoOpcional}
              />
            )}

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

          {/* Footer */}
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