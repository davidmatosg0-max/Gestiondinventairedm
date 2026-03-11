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
  const IconoTipo = tipoSeleccionado?.icon || User;

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-2xl !max-h-[90vh] overflow-hidden p-0 rounded-xl"
        aria-describedby="contact-express-form-description"
      >
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
                  <DialogTitle 
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {modoEdicion ? 'Modifier le contact' : 'Enregistrement Express'}
                  </DialogTitle>
                  <DialogDescription 
                    id="contact-express-form-description" 
                    className="text-white/90 text-sm mt-0.5"
                  >
                    Ajoutez rapidement un nouveau contact en moins d&apos;une minute
                  </DialogDescription>
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
            {/* Selector de tipo de contacto */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Type de contact *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {tiposContacto.map((tipo) => {
                  const isSelected = formulario.tipoContacto === tipo.value;
                  const Icono = tipo.icon;
                  
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setFormulario({ ...formulario, tipoContacto: tipo.value as any })}
                      className={`
                        p-4 rounded-xl border-2 transition-all text-left
                        ${isSelected 
                          ? 'shadow-lg scale-105' 
                          : 'hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                      style={{
                        borderColor: isSelected ? tipo.color : '#E5E7EB',
                        backgroundColor: isSelected ? `${tipo.color}08` : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${tipo.color}15` }}
                        >
                          <Icono className="w-6 h-6" style={{ color: tipo.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-semibold text-sm mb-1"
                            style={{ color: isSelected ? tipo.color : '#374151' }}
                          >
                            {tipo.label}
                          </div>
                          <div className="text-xs text-gray-500 leading-tight">
                            {tipo.descripcion}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separador visual */}
            <div className="border-t border-gray-200"></div>

            {/* Campos esenciales */}
            <div className="space-y-4">
              {/* Fila 1: Prénom + Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Prénom *
                  </Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    placeholder="Jean"
                    className="h-11 text-sm border-gray-300 focus:border-opacity-50"
                    style={{ 
                      borderColor: formulario.nombre ? branding.secondaryColor : undefined,
                      borderWidth: formulario.nombre ? '2px' : '1px'
                    }}
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="apellido" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Nom *
                  </Label>
                  <Input
                    id="apellido"
                    value={formulario.apellido}
                    onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                    placeholder="Dupont"
                    className="h-11 text-sm border-gray-300"
                    style={{ 
                      borderColor: formulario.apellido ? branding.secondaryColor : undefined,
                      borderWidth: formulario.apellido ? '2px' : '1px'
                    }}
                  />
                </div>
              </div>

              {/* Empresa (solo para Fournisseur) */}
              {formulario.tipoContacto === 'fournisseur' && (
                <div>
                  <Label htmlFor="nombreEmpresa" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Nom de l&apos;entreprise *
                  </Label>
                  <Input
                    id="nombreEmpresa"
                    value={formulario.nombreEmpresa}
                    onChange={(e) => setFormulario({ ...formulario, nombreEmpresa: e.target.value })}
                    placeholder="Aliments ABC Inc."
                    className="h-11 text-sm border-gray-300"
                    style={{ 
                      borderColor: formulario.nombreEmpresa ? branding.secondaryColor : undefined,
                      borderWidth: formulario.nombreEmpresa ? '2px' : '1px'
                    }}
                  />
                </div>
              )}

              {/* Fila 2: Téléphone + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefonoPrincipal" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Téléphone *
                  </Label>
                  <Input
                    id="telefonoPrincipal"
                    type="tel"
                    value={formulario.telefonoPrincipal}
                    onChange={(e) => setFormulario({ ...formulario, telefonoPrincipal: e.target.value })}
                    placeholder="(514) 555-0123"
                    className="h-11 text-sm border-gray-300"
                    style={{ 
                      borderColor: formulario.telefonoPrincipal ? branding.secondaryColor : undefined,
                      borderWidth: formulario.telefonoPrincipal ? '2px' : '1px'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="emailPrincipal" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Email *
                  </Label>
                  <Input
                    id="emailPrincipal"
                    type="email"
                    value={formulario.emailPrincipal}
                    onChange={(e) => setFormulario({ ...formulario, emailPrincipal: e.target.value })}
                    placeholder="contact@exemple.com"
                    className="h-11 text-sm border-gray-300"
                    style={{ 
                      borderColor: formulario.emailPrincipal ? branding.secondaryColor : undefined,
                      borderWidth: formulario.emailPrincipal ? '2px' : '1px'
                    }}
                  />
                </div>
              </div>

              {/* Ville */}
              <div>
                <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: branding.primaryColor }} />
                  Ville
                </Label>
                <Input
                  id="ciudad"
                  value={formulario.ciudad}
                  onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
                  placeholder="Laval"
                  className="h-11 text-sm border-gray-300"
                  style={{ 
                    borderColor: formulario.ciudad ? branding.secondaryColor : undefined,
                    borderWidth: formulario.ciudad ? '2px' : '1px'
                  }}
                />
              </div>

              {/* Catégories de produits (solo para Fournisseur) */}
              {formulario.tipoContacto === 'fournisseur' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Catégories de produits
                    {formulario.categoriaProductos.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
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
                          className={`
                            px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all text-left
                            ${isSelected ? 'shadow-sm' : 'hover:border-gray-300'}
                          `}
                          style={{
                            borderColor: isSelected ? cat.color : '#E5E7EB',
                            backgroundColor: isSelected ? `${cat.color}10` : '#FFFFFF',
                            color: isSelected ? cat.color : '#6B7280'
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botón para mostrar campo opcional */}
              {!mostrarCampoOpcional && (
                <button
                  type="button"
                  onClick={() => setMostrarCampoOpcional(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  + Ajouter des notes (optionnel)
                </button>
              )}

              {/* Notes (opcional) */}
              {mostrarCampoOpcional && (
                <div>
                  <Label htmlFor="notas" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    Notes
                    <span className="text-xs text-gray-400 font-normal ml-1">(optionnel)</span>
                  </Label>
                  <Textarea
                    id="notas"
                    value={formulario.notas}
                    onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                    placeholder="Notes additionnelles..."
                    rows={3}
                    className="text-sm border-gray-300 resize-none"
                  />
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
