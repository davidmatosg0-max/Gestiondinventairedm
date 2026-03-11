import React, { useRef, useEffect } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  User,
  Camera,
  Building2,
  Phone,
  MapPin,
  Truck,
  FileText,
  Settings,
  CreditCard,
  Clock,
  Tag,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FormContactoEntrepotData {
  tipoContacto: 'fournisseur' | 'donador' | 'transportista' | 'partenaire';
  nombre: string;
  apellido: string;
  numeroID: string;
  imagen: string | null;
  nombreEmpresa: string;
  tipoEmpresa: string;
  numeroRegistro: string;
  numeroTVA: string;
  emailPrincipal: string;
  emailSecundario: string;
  telefonoPrincipal: string;
  telefonoSecundario: string;
  sitioWeb: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  banco: string;
  numeroCuenta: string;
  numeroRuta: string;
  categoriaProductos: string[];
  temperaturaEspecializada: string[];
  horarioDisponible: string;
  diasOperacion: string[];
  tiempoEntrega: string;
  metodoPago: string[];
  notas: string;
  etiquetas: string[];
  activo: boolean;
  fechaNacimiento: string;
  genero: string;
  departamentosAsignados: string[]; // IDs de departamentos asignados
}

interface FormularioContactoEntrepotCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormContactoEntrepotData;
  setFormulario: React.Dispatch<React.SetStateAction<FormContactoEntrepotData>>;
  onGuardar: () => void;
  modoEdicion?: boolean;
}

export function FormularioContactoEntrepotCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  onGuardar,
  modoEdicion = false
}: FormularioContactoEntrepotCompactoProps) {
  const branding = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar departamento automáticamente cuando cambia el tipo de contacto
  useEffect(() => {
    const departamentoAuto = obtenerDepartamentoSegunTipo(formulario.tipoContacto);
    if (!formulario.departamentosAsignados.includes(departamentoAuto)) {
      setFormulario(prev => ({
        ...prev,
        departamentosAsignados: [departamentoAuto]
      }));
    }
  }, [formulario.tipoContacto]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario({ ...formulario, imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const tiposContacto = [
    { value: 'fournisseur', label: 'Fournisseur', icon: '📦', color: '#1E73BE' },
    { value: 'donador', label: 'Donateur', icon: '🎁', color: '#FF5722' },
    { value: 'transportista', label: 'Transporteur', icon: '🚚', color: '#4CAF50' },
    { value: 'partenaire', label: 'Partenaire', icon: '⭐', color: '#FF9800' }
  ];

  const temperaturasEspecializadas = [
    { value: 'ambiente', label: 'Ambiant', icon: '🌡️' },
    { value: 'refrigerado', label: 'Réfrigéré', icon: '❄️' },
    { value: 'congelado', label: 'Congelé', icon: '🧊' },
    { value: 'fresco', label: 'Frais', icon: '🌿' }
  ];

  const diasSemana = [
    { value: 'lun', label: 'Lun' },
    { value: 'mar', label: 'Mar' },
    { value: 'mer', label: 'Mer' },
    { value: 'jeu', label: 'Jeu' },
    { value: 'ven', label: 'Ven' },
    { value: 'sam', label: 'Sam' },
    { value: 'dim', label: 'Dim' }
  ];

  const metodosPago = [
    { value: 'transferencia', label: 'Virement', icon: '🏦' },
    { value: 'cheque', label: 'Chèque', icon: '📝' },
    { value: 'efectivo', label: 'Comptant', icon: '💵' },
    { value: 'credito', label: 'Crédit', icon: '💳' }
  ];

  const toggleArrayValue = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter(v => v !== value);
    } else {
      return [...array, value];
    }
  };

  // Departamentos disponibles para asignar
  const departamentosDisponibles = [
    { id: '1', nombre: 'Entrepôt', color: '#1E73BE', icon: '📦' },
    { id: '2', nombre: 'Comptoir', color: '#2d9561', icon: '🏪' },
    { id: '3', nombre: 'Cuisine', color: '#FF9800', icon: '👨‍🍳' },
    { id: '4', nombre: 'Liaison', color: '#9C27B0', icon: '🤝' },
    { id: '5', nombre: 'PTC', color: '#795548', icon: '💼' },
    { id: '6', nombre: 'Maintien', color: '#607D8B', icon: '🔧' },
    { id: '7', nombre: 'Recrutement', color: '#E91E63', icon: '👥' }
  ];

  // Obtener el departamento asignado automáticamente según el tipo de contacto
  const obtenerDepartamentoSegunTipo = (tipo: string): string => {
    // Según la lógica v3:
    // - Donateurs, Fournisseurs, Transporteurs, Partenaires → '1' (Entrepôt)
    // Solo estos 4 tipos están disponibles en este formulario
    return '1'; // Entrepôt
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"
      >
        <div className="h-full flex flex-col bg-[#F5F5F5]">
          {/* Header compacto */}
          <div className="px-6 py-3 bg-white flex-shrink-0">
            <DialogTitle 
              className="flex items-center gap-2"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.95rem' }}
            >
              <User className="w-4 h-4" />
              Enregistrer un nouveau contact
            </DialogTitle>
            <DialogDescription id="contact-warehouse-form-description" className="sr-only">
              Formulaire de contact pour l'entrepôt
            </DialogDescription>
          </div>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda COMPACTA (170px) */}
            <div className="w-[170px] bg-white p-4 overflow-y-auto scrollbar-thin flex-shrink-0 border-r border-gray-200">
              {/* PHOTO */}
              <div className="mb-6">
                <h4 className="text-[10px] font-semibold text-[#999999] mb-3 uppercase tracking-wider">
                  PHOTO
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-24 h-24 rounded-full border-4 overflow-hidden bg-white flex items-center justify-center shadow-sm"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {formulario.imagen ? (
                        <img src={formulario.imagen} alt="Contact" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8 shadow-md"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagenChange}
                    />
                  </div>
                </div>
              </div>

              {/* TYPE */}
              <div>
                <h4 className="text-[10px] font-semibold text-[#999999] mb-3 uppercase tracking-wider">
                  TYPE
                </h4>
                <div className="space-y-2">
                  {tiposContacto.map((tipo) => {
                    const isSelected = formulario.tipoContacto === tipo.value;
                    return (
                      <div
                        key={tipo.value}
                        onClick={() => setFormulario({ ...formulario, tipoContacto: tipo.value as any })}
                        className={`px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm flex items-center gap-2.5 ${
                          isSelected ? 'shadow-sm' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? tipo.color : '#E5E7EB',
                          backgroundColor: isSelected ? '#FFFFFF' : '#FAFAFA'
                        }}
                      >
                        <span className="text-lg flex-shrink-0">{tipo.icon}</span>
                        <span 
                          className="text-xs font-medium leading-tight"
                          style={{ color: isSelected ? tipo.color : '#6B7280' }}
                        >
                          {tipo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                {/* Tabs en la parte superior */}
                <div className="bg-white px-6 flex-shrink-0">
                  <TabsList className="w-full justify-start rounded-none border-0 bg-transparent px-0 py-0 h-auto">
                    <TabsTrigger 
                      value="base" 
                      className="rounded-t-lg border-0 bg-transparent px-6 py-3 text-sm font-medium data-[state=active]:bg-[#F5F5F5] data-[state=active]:shadow-none"
                      style={{ 
                        color: '#6B7280',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Base
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="rounded-t-lg border-0 bg-transparent px-6 py-3 text-sm font-medium data-[state=active]:bg-[#F5F5F5] data-[state=active]:shadow-none"
                      style={{ color: '#6B7280' }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </TabsTrigger>
                    <TabsTrigger 
                      value="professionnel" 
                      className="rounded-t-lg border-0 bg-transparent px-6 py-3 text-sm font-medium data-[state=active]:bg-[#F5F5F5] data-[state=active]:shadow-none"
                      style={{ color: '#6B7280' }}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Professionnel
                    </TabsTrigger>
                    <TabsTrigger 
                      value="disponibilites" 
                      className="rounded-t-lg border-0 bg-transparent px-6 py-3 text-sm font-medium data-[state=active]:bg-[#F5F5F5] data-[state=active]:shadow-none"
                      style={{ color: '#6B7280' }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Disponibilités
                    </TabsTrigger>
                    <TabsTrigger 
                      value="autres" 
                      className="rounded-t-lg border-0 bg-transparent px-6 py-3 text-sm font-medium data-[state=active]:bg-[#F5F5F5] data-[state=active]:shadow-none"
                      style={{ color: '#6B7280' }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Autres
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab: Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin m-0 bg-[#F5F5F5]">
                  <div className="max-w-5xl">
                    {/* Fila 1: Prénom, Nom, Email */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="nombre" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Prénom *
                        </Label>
                        <Input
                          id="nombre"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          placeholder="Jean"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Nom de famille *
                        </Label>
                        <Input
                          id="apellido"
                          value={formulario.apellido}
                          onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                          placeholder="Dupont"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emailPrincipal" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Email
                        </Label>
                        <Input
                          id="emailPrincipal"
                          type="email"
                          value={formulario.emailPrincipal}
                          onChange={(e) => setFormulario({ ...formulario, emailPrincipal: e.target.value })}
                          placeholder="jean.dupont@email.com"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                    </div>
                    
                    {/* Fila 2: Date de Naissance, Genre, Téléphone */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label htmlFor="fechaNacimiento" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Date de Naissance
                        </Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={formulario.fechaNacimiento}
                          onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="genero" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Genre
                        </Label>
                        <Select 
                          value={formulario.genero} 
                          onValueChange={(value) => setFormulario({ ...formulario, genero: value })}
                        >
                          <SelectTrigger className="h-10 text-sm bg-white border-gray-300">
                            <SelectValue placeholder="Non spécifié" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non-specifie">Non spécifié</SelectItem>
                            <SelectItem value="masculin">Masculin</SelectItem>
                            <SelectItem value="feminin">Féminin</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="telefonoPrincipal" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Téléphone
                        </Label>
                        <Input
                          id="telefonoPrincipal"
                          type="tel"
                          value={formulario.telefonoPrincipal}
                          onChange={(e) => setFormulario({ ...formulario, telefonoPrincipal: e.target.value })}
                          placeholder="(514) 555-0123"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                    </div>

                    {/* Sección Départements Assignés */}
                    <div className="bg-[#E8F4FF] border border-[#1E73BE] rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: branding.primaryColor }}
                        />
                        <h4 className="text-sm font-semibold text-[#374151]">
                          Départements Assignés
                        </h4>
                        <span 
                          className="ml-auto px-2 py-0.5 rounded text-xs font-medium text-white" 
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          {formulario.departamentosAsignados.length} sélectionné{formulario.departamentosAsignados.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#6B7280] mb-4 italic">
                        * Obligatoire - Sélectionnez au moins un département ou laissez l'assignation par défaut
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {departamentosDisponibles.map((dept) => {
                          const isSelected = formulario.departamentosAsignados.includes(dept.id);
                          const isAutoAssigned = dept.id === obtenerDepartamentoSegunTipo(formulario.tipoContacto);
                          
                          return (
                            <button
                              key={dept.id}
                              type="button"
                              disabled={isAutoAssigned}
                              onClick={() => {
                                if (!isAutoAssigned) {
                                  setFormulario({
                                    ...formulario,
                                    departamentosAsignados: toggleArrayValue(formulario.departamentosAsignados, dept.id)
                                  });
                                }
                              }}
                              className={`
                                px-4 py-2 rounded-md text-xs font-medium transition-all
                                ${isSelected 
                                  ? 'text-white shadow-md' 
                                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                                }
                                ${isAutoAssigned ? 'cursor-not-allowed opacity-100' : 'cursor-pointer'}
                              `}
                              style={{
                                backgroundColor: isSelected ? dept.color : undefined
                              }}
                            >
                              <span className="mr-1.5">{dept.icon}</span>
                              {dept.nombre}
                              {isAutoAssigned && (
                                <span className="ml-1.5 text-[10px] opacity-90">(Auto)</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#C2D9F0]">
                        <p className="text-xs text-[#1E73BE]">
                          <strong>Note:</strong> Le département &quot;Entrepôt&quot; est assigné automatiquement pour les contacts de type Fournisseur, Donateur, Transporteur et Partenaire.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Contact */}
                <TabsContent value="contact" className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin m-0 bg-[#F5F5F5]">
                  <div className="max-w-5xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emailSecundario" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Email secondaire
                        </Label>
                        <Input
                          id="emailSecundario"
                          type="email"
                          value={formulario.emailSecundario}
                          onChange={(e) => setFormulario({ ...formulario, emailSecundario: e.target.value })}
                          placeholder="info@exemple.com"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefonoSecundario" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Téléphone secondaire
                        </Label>
                        <Input
                          id="telefonoSecundario"
                          type="tel"
                          value={formulario.telefonoSecundario}
                          onChange={(e) => setFormulario({ ...formulario, telefonoSecundario: e.target.value })}
                          placeholder="(514) 555-9876"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sitioWeb" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Site Web
                        </Label>
                        <Input
                          id="sitioWeb"
                          type="url"
                          value={formulario.sitioWeb}
                          onChange={(e) => setFormulario({ ...formulario, sitioWeb: e.target.value })}
                          placeholder="https://www.exemple.com"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="direccion" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Adresse complète
                        </Label>
                        <Input
                          id="direccion"
                          value={formulario.direccion}
                          onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                          placeholder="123 Rue Principale"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ciudad" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Ville
                        </Label>
                        <Input
                          id="ciudad"
                          value={formulario.ciudad}
                          onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}
                          placeholder="Montréal"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provincia" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Province
                        </Label>
                        <Select 
                          value={formulario.provincia} 
                          onValueChange={(value) => setFormulario({ ...formulario, provincia: value })}
                        >
                          <SelectTrigger className="h-10 text-sm bg-white border-gray-300">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QC">Québec</SelectItem>
                            <SelectItem value="ON">Ontario</SelectItem>
                            <SelectItem value="BC">Colombie-Britannique</SelectItem>
                            <SelectItem value="AB">Alberta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="codigoPostal" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Code postal
                        </Label>
                        <Input
                          id="codigoPostal"
                          value={formulario.codigoPostal}
                          onChange={(e) => setFormulario({ ...formulario, codigoPostal: e.target.value.toUpperCase() })}
                          placeholder="H2X 3Y7"
                          className="h-10 text-sm bg-white border-gray-300 font-mono"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Professionnel */}
                <TabsContent value="professionnel" className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin m-0 bg-[#F5F5F5]">
                  <div className="max-w-5xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="nombreEmpresa" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Nom de l'entreprise
                        </Label>
                        <Input
                          id="nombreEmpresa"
                          value={formulario.nombreEmpresa}
                          onChange={(e) => setFormulario({ ...formulario, nombreEmpresa: e.target.value })}
                          placeholder="Aliments ABC Inc."
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipoEmpresa" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Type d'entreprise
                        </Label>
                        <Select 
                          value={formulario.tipoEmpresa} 
                          onValueChange={(value) => setFormulario({ ...formulario, tipoEmpresa: value })}
                        >
                          <SelectTrigger className="h-10 text-sm bg-white border-gray-300">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inc">Inc.</SelectItem>
                            <SelectItem value="ltee">Ltée</SelectItem>
                            <SelectItem value="senc">SENC</SelectItem>
                            <SelectItem value="obnl">OBNL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="numeroRegistro" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          N° d'enregistrement
                        </Label>
                        <Input
                          id="numeroRegistro"
                          value={formulario.numeroRegistro}
                          onChange={(e) => setFormulario({ ...formulario, numeroRegistro: e.target.value })}
                          placeholder="1234567890 RC"
                          className="h-10 text-sm bg-white border-gray-300 font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numeroTVA" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          Numéro de TVA
                        </Label>
                        <Input
                          id="numeroTVA"
                          value={formulario.numeroTVA}
                          onChange={(e) => setFormulario({ ...formulario, numeroTVA: e.target.value })}
                          placeholder="123456789 TQ"
                          className="h-10 text-sm bg-white border-gray-300 font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="horarioDisponible" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Horaire
                        </Label>
                        <Input
                          id="horarioDisponible"
                          value={formulario.horarioDisponible}
                          onChange={(e) => setFormulario({ ...formulario, horarioDisponible: e.target.value })}
                          placeholder="8h00 - 17h00"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                    </div>

                    {formulario.tipoContacto === 'fournisseur' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-[#374151] mb-4">Informations bancaires</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="banco" className="text-xs font-medium text-[#374151] mb-1.5 block">
                              Nom de la banque
                            </Label>
                            <Input
                              id="banco"
                              value={formulario.banco}
                              onChange={(e) => setFormulario({ ...formulario, banco: e.target.value })}
                              placeholder="Banque Nationale"
                              className="h-10 text-sm bg-white border-gray-300"
                            />
                          </div>
                          <div>
                            <Label htmlFor="numeroCuenta" className="text-xs font-medium text-[#374151] mb-1.5 block">
                              Numéro de compte
                            </Label>
                            <Input
                              id="numeroCuenta"
                              value={formulario.numeroCuenta}
                              onChange={(e) => setFormulario({ ...formulario, numeroCuenta: e.target.value })}
                              placeholder="1234567"
                              className="h-10 text-sm bg-white border-gray-300 font-mono"
                            />
                          </div>
                          <div>
                            <Label htmlFor="numeroRuta" className="text-xs font-medium text-[#374151] mb-1.5 block">
                              Numéro de transit
                            </Label>
                            <Input
                              id="numeroRuta"
                              value={formulario.numeroRuta}
                              onChange={(e) => setFormulario({ ...formulario, numeroRuta: e.target.value })}
                              placeholder="12345-001"
                              className="h-10 text-sm bg-white border-gray-300 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Disponibilités */}
                <TabsContent value="disponibilites" className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin m-0 bg-[#F5F5F5]">
                  <div className="max-w-5xl space-y-6">
                    {/* Températures */}
                    <div>
                      <Label className="text-xs font-medium text-[#374151] mb-3 block">
                        Température spécialisée
                      </Label>
                      <div className="grid grid-cols-4 gap-3">
                        {temperaturasEspecializadas.map((temp) => (
                          <div
                            key={temp.value}
                            onClick={() => setFormulario({
                              ...formulario,
                              temperaturaEspecializada: toggleArrayValue(formulario.temperaturaEspecializada, temp.value)
                            })}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center bg-white ${
                              formulario.temperaturaEspecializada.includes(temp.value) ? 'shadow-sm' : ''
                            }`}
                            style={{
                              borderColor: formulario.temperaturaEspecializada.includes(temp.value) ? branding.primaryColor : '#E5E7EB'
                            }}
                          >
                            <div className="text-2xl mb-1">{temp.icon}</div>
                            <div className="text-xs font-medium text-[#374151]">{temp.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Días de operación */}
                    <div>
                      <Label className="text-xs font-medium text-[#374151] mb-3 block">
                        Jours d'opération
                      </Label>
                      <div className="grid grid-cols-7 gap-2">
                        {diasSemana.map((dia) => (
                          <div
                            key={dia.value}
                            onClick={() => setFormulario({
                              ...formulario,
                              diasOperacion: toggleArrayValue(formulario.diasOperacion, dia.value)
                            })}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center bg-white ${
                              formulario.diasOperacion.includes(dia.value) ? 'shadow-sm' : ''
                            }`}
                            style={{
                              borderColor: formulario.diasOperacion.includes(dia.value) ? branding.secondaryColor : '#E5E7EB'
                            }}
                          >
                            <div className="text-xs font-medium text-[#374151]">{dia.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Métodos de pago */}
                    <div>
                      <Label className="text-xs font-medium text-[#374151] mb-3 block">
                        Méthodes de paiement
                      </Label>
                      <div className="grid grid-cols-4 gap-3">
                        {metodosPago.map((metodo) => (
                          <div
                            key={metodo.value}
                            onClick={() => setFormulario({
                              ...formulario,
                              metodoPago: toggleArrayValue(formulario.metodoPago, metodo.value)
                            })}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center bg-white ${
                              formulario.metodoPago.includes(metodo.value) ? 'shadow-sm' : ''
                            }`}
                            style={{
                              borderColor: formulario.metodoPago.includes(metodo.value) ? branding.primaryColor : '#E5E7EB'
                            }}
                          >
                            <div className="text-2xl mb-1">{metodo.icon}</div>
                            <div className="text-xs font-medium text-[#374151]">{metodo.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tiempoEntrega" className="text-xs font-medium text-[#374151] mb-1.5 block">
                          <Truck className="w-3 h-3 inline mr-1" />
                          Délai de livraison
                        </Label>
                        <Input
                          id="tiempoEntrega"
                          value={formulario.tiempoEntrega}
                          onChange={(e) => setFormulario({ ...formulario, tiempoEntrega: e.target.value })}
                          placeholder="24-48 heures"
                          className="h-10 text-sm bg-white border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin m-0 bg-[#F5F5F5]">
                  <div className="max-w-5xl space-y-4">
                    <div>
                      <Label htmlFor="notas" className="text-xs font-medium text-[#374151] mb-1.5 block">
                        Notes
                      </Label>
                      <Textarea
                        id="notas"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder="Notes additionnelles..."
                        rows={6}
                        className="text-sm bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="etiquetas" className="text-xs font-medium text-[#374151] mb-1.5 block">
                        <Tag className="w-3 h-3 inline mr-1" />
                        Étiquettes
                      </Label>
                      <Input
                        id="etiquetas"
                        value={formulario.etiquetas.join(', ')}
                        onChange={(e) => setFormulario({ 
                          ...formulario, 
                          etiquetas: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                        })}
                        placeholder="vip, fiable, rapide"
                        className="h-10 text-sm bg-white border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        Séparez les étiquettes par des virgules
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer fijo con botones */}
              <div className="px-6 py-4 bg-white flex justify-end gap-3 flex-shrink-0 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={onCerrar}
                  className="h-10 px-8 text-sm border-gray-300"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={onGuardar}
                  className="h-10 px-8 text-white text-sm"
                  style={{ 
                    backgroundColor: branding.secondaryColor,
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 600
                  }}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}