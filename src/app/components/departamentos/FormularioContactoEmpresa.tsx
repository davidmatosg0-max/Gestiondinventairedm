// Formulario Simplificado para Donadores y Proveedores
import React, { useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Globe,
  Hash,
  Camera,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import {
  type ContactoDepartamento,
  type TipoContacto
} from '../../utils/contactosDepartamentoStorage';

interface FormularioContactoEmpresaProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: Omit<ContactoDepartamento, 'id'>;
  setFormulario: React.Dispatch<React.SetStateAction<Omit<ContactoDepartamento, 'id'>>>;
  modoEdicion: boolean;
  onGuardar: () => void;
  fotoPreview: string | null;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getTipoConfig: (tipo: TipoContacto) => {
    color: string;
    icon: any;
    label: string;
    bgColor: string;
  };
  departamentoNombre: string;
}

export function FormularioContactoEmpresa({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  onGuardar,
  fotoPreview,
  onFotoChange,
  getTipoConfig,
  departamentoNombre
}: FormularioContactoEmpresaProps) {
  const branding = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tipoConfig = getTipoConfig(formulario.tipo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formulario.nombreEmpresa?.trim()) {
      toast.error('Le nom de l\'entreprise est obligatoire');
      return;
    }
    
    if (!formulario.nombre?.trim() || !formulario.apellido?.trim()) {
      toast.error('Le nom et prénom de la personne de contact sont obligatoires');
      return;
    }

    if (!formulario.email?.trim()) {
      toast.error('L\'email est obligatoire');
      return;
    }

    onGuardar();
  };

  const tiposEmpresa = [
    { value: 'inc', label: 'INC - Incorporation' },
    { value: 'ltee', label: 'LTÉE - Limitée' },
    { value: 'senc', label: 'SENC - Société en nom collectif' },
    { value: 'obnl', label: 'OBNL - Organisme à but non lucratif' },
    { value: 'enr', label: 'ENR - Entreprise enregistrée' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="formulario-empresa-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: tipoConfig.bgColor }}>
              {React.createElement(tipoConfig.icon, { 
                className: "w-5 h-5", 
                style: { color: tipoConfig.color } 
              })}
            </div>
            <div>
              <div>{modoEdicion ? 'Modifier' : 'Nouveau'} {tipoConfig.label}</div>
              <div className="text-sm font-normal text-gray-500 mt-1">
                {departamentoNombre}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription id="formulario-empresa-description">
            Formulaire simplifié pour les donateurs et fournisseurs
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Informations de l'entreprise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: branding.primaryColor }}>
              <Building2 className="w-5 h-5" style={{ color: branding.primaryColor }} />
              <h3 className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                Informations de l'entreprise
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom de l'entreprise */}
              <div className="md:col-span-2">
                <Label htmlFor="nombreEmpresa" className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4" />
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombreEmpresa"
                  value={formulario.nombreEmpresa || ''}
                  onChange={(e) => setFormulario({ ...formulario, nombreEmpresa: e.target.value })}
                  placeholder="Nom complet de l'entreprise"
                  required
                />
              </div>

              {/* Type d'entreprise */}
              <div>
                <Label htmlFor="tipoEmpresa" className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Type d'entreprise
                </Label>
                <Select
                  value={formulario.tipoEmpresa || ''}
                  onValueChange={(value) => setFormulario({ ...formulario, tipoEmpresa: value })}
                >
                  <SelectTrigger id="tipoEmpresa">
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEmpresa.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Numéro de TVA */}
              <div>
                <Label htmlFor="numeroTVA" className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4" />
                  Numéro TVA
                </Label>
                <Input
                  id="numeroTVA"
                  value={formulario.numeroTVA || ''}
                  onChange={(e) => setFormulario({ ...formulario, numeroTVA: e.target.value })}
                  placeholder="123456789TQ0001"
                />
              </div>

              {/* Numéro d'enregistrement */}
              <div>
                <Label htmlFor="numeroRegistro" className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4" />
                  Numéro d'enregistrement
                </Label>
                <Input
                  id="numeroRegistro"
                  value={formulario.numeroRegistro || ''}
                  onChange={(e) => setFormulario({ ...formulario, numeroRegistro: e.target.value })}
                  placeholder="123456789"
                />
              </div>

              {/* Site web */}
              <div>
                <Label htmlFor="sitioWeb" className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" />
                  Site web
                </Label>
                <Input
                  id="sitioWeb"
                  type="url"
                  value={formulario.sitioWeb || ''}
                  onChange={(e) => setFormulario({ ...formulario, sitioWeb: e.target.value })}
                  placeholder="https://www.exemple.com"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Personne de contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: branding.secondaryColor }}>
              <User className="w-5 h-5" style={{ color: branding.secondaryColor }} />
              <h3 className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                Personne de contact
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo */}
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: tipoConfig.color }}>
                    {fotoPreview ? (
                      <ImageWithFallback src={fotoPreview} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {fotoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormulario({ ...formulario, foto: '' });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Supprimer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFotoChange}
                    className="hidden"
                    id="foto-upload-empresa"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {fotoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Format: JPG, PNG (max 2 MB)
                  </p>
                </div>
              </div>

              {/* Prénom */}
              <div>
                <Label htmlFor="nombre" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Jean"
                  required
                />
              </div>

              {/* Nom */}
              <div>
                <Label htmlFor="apellido" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellido"
                  value={formulario.apellido}
                  onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                  placeholder="Tremblay"
                  required
                />
              </div>

              {/* Poste */}
              <div>
                <Label htmlFor="cargo" className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Poste
                </Label>
                <Input
                  id="cargo"
                  value={formulario.cargo || ''}
                  onChange={(e) => setFormulario({ ...formulario, cargo: e.target.value })}
                  placeholder="Directeur général"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  placeholder="jean.tremblay@exemple.com"
                  required
                />
              </div>

              {/* Téléphone principal */}
              <div>
                <Label htmlFor="telefono" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formulario.telefono}
                  onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  placeholder="(450) 123-4567"
                  required
                />
              </div>

              {/* Téléphone secondaire */}
              <div>
                <Label htmlFor="telefonoSecundario" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Téléphone secondaire
                </Label>
                <Input
                  id="telefonoSecundario"
                  type="tel"
                  value={formulario.telefonoSecundario || ''}
                  onChange={(e) => setFormulario({ ...formulario, telefonoSecundario: e.target.value })}
                  placeholder="(450) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Adresse */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-300">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-lg text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Adresse
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Adresse avec autocomplétion */}
              <div>
                <Label htmlFor="direccion" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Adresse complète
                </Label>
                <AddressAutocomplete
                  value={formulario.direccion || ''}
                  onChange={(value) => setFormulario({ ...formulario, direccion: value })}
                  onSelectAddress={(address) => {
                    setFormulario({
                      ...formulario,
                      direccion: address.rue || formulario.direccion,
                      ciudad: address.ville || formulario.ciudad,
                      codigoPostal: address.codePostal || formulario.codigoPostal,
                      provincia: address.province || formulario.provincia
                    });
                  }}
                  placeholder="123 Rue Principale"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ville */}
                <div>
                  <Label htmlFor="ciudad">Ville</Label>
                  <Input
                    id="ciudad"
                    value={formulario.ciudad || ''}
                    onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
                    placeholder="Laval"
                  />
                </div>

                {/* Province */}
                <div>
                  <Label htmlFor="provincia">Province</Label>
                  <Input
                    id="provincia"
                    value={formulario.provincia || ''}
                    onChange={(e) => setFormulario({ ...formulario, provincia: e.target.value })}
                    placeholder="QC"
                  />
                </div>

                {/* Code postal */}
                <div>
                  <Label htmlFor="codigoPostal">Code postal</Label>
                  <Input
                    id="codigoPostal"
                    value={formulario.codigoPostal || ''}
                    onChange={(e) => setFormulario({ ...formulario, codigoPostal: e.target.value.toUpperCase() })}
                    placeholder="H7V 1A1"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-300">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-lg text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Notes
              </h3>
            </div>

            <div>
              <Label htmlFor="notas">Notes additionnelles</Label>
              <Textarea
                id="notas"
                value={formulario.notas || ''}
                onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                placeholder="Notes, remarques ou informations supplémentaires..."
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Annuler
            </Button>
            <Button 
              type="submit"
              style={{ 
                backgroundColor: branding.primaryColor,
                color: 'white'
              }}
              className="hover:opacity-90"
            >
              {modoEdicion ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
