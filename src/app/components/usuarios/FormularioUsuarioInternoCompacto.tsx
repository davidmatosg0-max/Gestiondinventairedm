import React, { useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Users,
  Camera,
  User,
  Phone,
  Briefcase,
  Calendar,
  FileUp,
  Settings,
  Building2,
  Languages,
  Mail,
  MapPin,
  Badge as BadgeIcon,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { LanguageSelector } from '../ui/language-selector';
import { TaskSelector } from '../ui/task-selector';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { obtenerDepartamentos, type Departamento } from '../../utils/departamentosStorage';
import type { UsuarioInterno } from '../../types';
import { useTranslation } from 'react-i18next';

interface FormularioUsuarioInternoCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formData: Partial<UsuarioInterno>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UsuarioInterno>>>;
  modoEdicion: boolean;
  onGuardar: () => void;
  fotoPreview: string | null;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getCategoriaConfig: () => {
    [key: string]: {
      label: string;
      color: string;
      icon: string;
      description: string;
    };
  };
}

export function FormularioUsuarioInternoCompacto({
  abierto,
  onCerrar,
  formData,
  setFormData,
  modoEdicion,
  onGuardar,
  fotoPreview,
  onFotoChange,
  getCategoriaConfig
}: FormularioUsuarioInternoCompactoProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoriaConfig = getCategoriaConfig();

  const esEmpresa = formData.categoria === 'donador' || formData.categoria === 'vendedor';

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"
        aria-describedby="contact-form-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              <Users className="w-5 h-5 inline mr-2" />
              {modoEdicion ? t('contacts.editContact') : t('contacts.newContact')}
            </DialogTitle>
            <DialogDescription id="contact-form-description" className="sr-only">
              {modoEdicion ? t('contacts.editContactDescription') : t('contacts.newContactDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Foto y Categoría */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Photo de Profil */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('contacts.photo')}
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-full border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : esEmpresa ? (
                        <Building2 className="w-14 h-14 text-gray-400" />
                      ) : (
                        <User className="w-14 h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8"
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
                      onChange={onFotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Catégorie de Contact */}
              <div>
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('contacts.category')}
                </h4>
                <div className="space-y-2">
                  {Object.entries(categoriaConfig).map(([key, config]) => {
                    const isSelected = formData.categoria === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setFormData({ ...formData, categoria: key as any })}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? config.color : '#E0E0E0',
                          backgroundColor: isSelected ? `${config.color}15` : 'white',
                          ringColor: config.color
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="text-xl"
                          >
                            {config.icon}
                          </div>
                          <span className="text-xs font-medium text-[#333333] leading-tight">
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {esEmpresa ? (
                /* ========================================
                   FORMULARIO SIMPLIFICADO PARA EMPRESAS
                   (Donador/Proveedor)
                   ======================================== */
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: branding.primaryColor }} />
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        {formData.categoria === 'donador' ? 'Informations du Donateur' : 'Informations du Fournisseur'}
                      </h3>
                      <p className="text-sm text-[#666666]">
                        Complétez les informations essentielles de l'entreprise
                      </p>
                    </div>

                    {/* 1. Nombre de la Empresa */}
                    <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border-2 border-blue-200">
                      <Label htmlFor="nombreEmpresa" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                        {t('contacts.companyName')} *
                      </Label>
                      <Input
                        id="nombreEmpresa"
                        value={formData.nombreEmpresa || ''}
                        onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                        placeholder="Ex: Boulangerie Martin, Ferme Dupont..."
                        className="h-11 text-base"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                      />
                    </div>

                    {/* 2. Persona de Contacto */}
                    <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-2 border-green-200">
                      <Label htmlFor="contacto" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                        {t('contacts.contactPerson')}
                      </Label>
                      <Input
                        id="contacto"
                        value={formData.contacto || ''}
                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                        placeholder="Ex: Jean Martin, Marie Dupont..."
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-[#666666] mt-1.5">
                        Nom de la personne responsable des communications
                      </p>
                    </div>

                    {/* 3. Teléfono */}
                    <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border-2 border-purple-200">
                      <Label htmlFor="telefono" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-purple-600" />
                        {t('contacts.phone')} *
                      </Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono || ''}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="(514) 555-0123"
                        className="h-11 text-base"
                      />
                    </div>

                    {/* 4. Dirección */}
                    <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border-2 border-orange-200">
                      <Label htmlFor="direccion-empresa" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        {t('contacts.address')}
                      </Label>
                      <AddressAutocomplete
                        value={formData.direccion || ''}
                        onChange={(value) => setFormData({ ...formData, direccion: value })}
                        placeholder="123 Rue Principale, Laval, QC"
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-[#666666] mt-1.5">
                        Adresse complète de l'entreprise
                      </p>
                    </div>

                    {/* 5. Email (opcional) */}
                    <div className="bg-gradient-to-r from-indigo-50 to-white p-4 rounded-lg border-2 border-indigo-200">
                      <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        {t('contacts.email')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@entreprise.com"
                        className="h-11 text-base"
                      />
                    </div>

                    {/* Campos ocultos pero necesarios */}
                    <input type="hidden" value={formData.categoria || ''} />
                    
                    {/* Nota informativa */}
                    <div className="mt-6 p-4 bg-blue-50 border-l-4 rounded" style={{ borderColor: branding.primaryColor }}>
                      <p className="text-xs text-[#666666] flex items-start gap-2">
                        <span className="text-lg">ℹ️</span>
                        <span>
                          <strong>Formulaire simplifié:</strong> Seules les informations essentielles sont requises pour les {formData.categoria === 'donador' ? 'donateurs' : 'fournisseurs'}. 
                          Vous pourrez ajouter plus de détails ultérieurement si nécessaire.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================
                   FORMULARIO COMPLETO PARA PERSONAS
                   (Voluntarios, Empleados, etc.)
                   ======================================== */
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <User className="w-4 h-4 mr-2" />
                    {t('contacts.basicInfo')}
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Phone className="w-4 h-4 mr-2" />
                    {t('contacts.contact')}
                  </TabsTrigger>
                  <TabsTrigger value="pro" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    {t('contacts.professional')}
                  </TabsTrigger>
                  <TabsTrigger value="disponibilite" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('contacts.availability')}
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('contacts.other')}
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Información Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    {esEmpresa ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nombreEmpresa" className="text-xs">
                              {t('contacts.companyName')} *
                            </Label>
                            <Input
                              id="nombreEmpresa"
                              value={formData.nombreEmpresa || ''}
                              onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                              placeholder={t('contacts.companyNamePlaceholder')}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contacto" className="text-xs">
                              {t('contacts.contactPerson')}
                            </Label>
                            <Input
                              id="contacto"
                              value={formData.contacto || ''}
                              onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                              placeholder={t('contacts.contactPersonPlaceholder')}
                              className="h-9"
                            />
                          </div>
                        </div>
                        
                        {/* Campo de dirección para empresas */}
                        <div className="w-full bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                          <Label htmlFor="direccion-empresa" className="text-xs font-medium block mb-1.5">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {t('contacts.address')}
                          </Label>
                          <AddressAutocomplete
                            value={formData.direccion || ''}
                            onChange={(value) => setFormData({ ...formData, direccion: value })}
                            placeholder={t('contacts.addressPlaceholder')}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="nombre" className="text-xs">{t('contacts.firstName')} *</Label>
                            <Input
                              id="nombre"
                              value={formData.nombre || ''}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                              placeholder="Jean"
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="apellido" className="text-xs">{t('contacts.lastName')} *</Label>
                            <Input
                              id="apellido"
                              value={formData.apellido || ''}
                              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                              placeholder="Dupont"
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sexo" className="text-xs">{t('contacts.gender')}</Label>
                            <Select value={formData.sexo || ''} onValueChange={(value) => setFormData({ ...formData, sexo: value as any })}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder={t('contacts.selectGender')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="homme">{t('contacts.male')}</SelectItem>
                                <SelectItem value="femme">{t('contacts.female')}</SelectItem>
                                <SelectItem value="autre">{t('contacts.other')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fechaNacimiento" className="text-xs">{t('contacts.birthDate')}</Label>
                            <Input
                              id="fechaNacimiento"
                              type="date"
                              value={formData.fechaNacimiento || ''}
                              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="fechaIngreso" className="text-xs">{t('contacts.joinDate')}</Label>
                            <Input
                              id="fechaIngreso"
                              type="date"
                              value={formData.fechaIngreso || ''}
                              onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Contact */}
                <TabsContent value="contact" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-xs">
                          <Mail className="w-3 h-3 inline mr-1" />
                          {t('contacts.email')} *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="exemple@email.com"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono" className="text-xs">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {t('contacts.phone')}
                        </Label>
                        <Input
                          id="telefono"
                          type="tel"
                          value={formData.telefono || ''}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="+33 1 23 45 67 89"
                          className="h-9"
                        />
                      </div>
                    </div>
                    
                    {/* Campo de dirección solo para personas (no empresas) */}
                    {!esEmpresa && (
                      <div>
                        <Label htmlFor="direccion" className="text-xs">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {t('contacts.address')}
                        </Label>
                        <AddressAutocomplete
                          value={formData.direccion || ''}
                          onChange={(value) => setFormData({ ...formData, direccion: value })}
                          placeholder={t('contacts.addressPlaceholder')}
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="idioma" className="text-xs">
                        <Languages className="w-3 h-3 inline mr-1" />
                        {t('contacts.preferredLanguage')}
                      </Label>
                      <LanguageSelector
                        value={formData.idioma || 'fr'}
                        onChange={(value) => setFormData({ ...formData, idioma: value as any })}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Professionnel */}
                <TabsContent value="pro" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="puesto" className="text-xs">{t('contacts.position')}</Label>
                        <Input
                          id="puesto"
                          value={formData.puesto || ''}
                          onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                          placeholder={t('contacts.positionPlaceholder')}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="horasSemanales" className="text-xs">{t('contacts.weeklyHours')}</Label>
                        <Input
                          id="horasSemanales"
                          type="number"
                          value={formData.horasSemanales || 0}
                          onChange={(e) => setFormData({ ...formData, horasSemanales: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Départements - Pills Minimalistes */}
                    <div>
                      <Label className="text-[10px] mb-1 flex items-center gap-0.5 opacity-70">
                        <Building2 className="w-2.5 h-2.5" style={{ color: branding.primaryColor }} />
                        <span className="font-semibold">Depts</span>
                        {formData.departamentoIds && formData.departamentoIds.length > 0 && (
                          <span 
                            className="ml-1 px-1 rounded-full text-white font-bold"
                            style={{ 
                              backgroundColor: branding.primaryColor,
                              fontSize: '8px',
                              lineHeight: '12px'
                            }}
                          >
                            {formData.departamentoIds.length}
                          </span>
                        )}
                      </Label>
                      
                      {/* Pills ultra minimalistes - flex wrap */}
                      <div className="flex flex-wrap gap-1">
                        {obtenerDepartamentos()
                          .filter(dept => dept.activo)
                          .sort((a, b) => a.orden - b.orden)
                          .map(dept => {
                            const isSelected = formData.departamentoIds?.includes(dept.id) || formData.departamento === dept.nombre;
                            return (
                              <button
                                key={dept.id}
                                type="button"
                                onClick={() => {
                                  const currentIds = formData.departamentoIds || [];
                                  const newIds = isSelected
                                    ? currentIds.filter(id => id !== dept.id)
                                    : [...currentIds, dept.id];
                                  setFormData({ 
                                    ...formData, 
                                    departamentoIds: newIds,
                                    departamento: newIds.length > 0 ? obtenerDepartamentos().find(d => d.id === newIds[0])?.nombre || '' : ''
                                  });
                                }}
                                className={`
                                  px-1.5 py-0.5 rounded transition-all duration-100
                                  ${isSelected 
                                    ? 'ring-1 ring-white/40' 
                                    : 'hover:ring-1 border'
                                  }
                                `}
                                style={{
                                  backgroundColor: isSelected ? dept.color : 'white',
                                  borderColor: isSelected ? dept.color : `${dept.color}40`,
                                  fontSize: '10px',
                                  lineHeight: '14px',
                                  color: isSelected ? 'white' : dept.color,
                                  fontFamily: 'Montserrat, sans-serif',
                                  fontWeight: 600
                                }}
                              >
                                {dept.nombre}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {(formData.categoria === 'programa' || formData.categoria === 'ptc') && (
                      <div>
                        <Label htmlFor="programa" className="text-xs">{t('contacts.program')}</Label>
                        <Input
                          id="programa"
                          value={formData.programa || ''}
                          onChange={(e) => setFormData({ ...formData, programa: e.target.value })}
                          placeholder={t('contacts.programPlaceholder')}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Disponibilités */}
                <TabsContent value="disponibilite" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl">
                    <SelecteurJoursDisponibles
                      joursDisponibles={formData.joursDisponibles || []}
                      onChange={(jours) => setFormData({ ...formData, joursDisponibles: jours })}
                      showIcon={true}
                    />
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    {/* Tâches assignées */}
                    <div>
                      <TaskSelector
                        selectedTasks={formData.tareas || []}
                        onChange={(tareas) => setFormData({ ...formData, tareas })}
                      />
                    </div>

                    {/* Separador */}
                    <div className="border-t border-[#E0E0E0] my-3"></div>

                    <div>
                      <Label htmlFor="notas" className="text-xs">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('contacts.notes')}
                      </Label>
                      <Textarea
                        id="notas"
                        value={formData.notas || ''}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        placeholder={t('contacts.notesPlaceholder')}
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentoPDF" className="text-xs">
                        <FileUp className="w-3 h-3 inline mr-1" />
                        {t('contacts.document')}
                      </Label>
                      <Input
                        id="documentoPDF"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, documentoPDF: file.name });
                          }
                        }}
                        className="h-9"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}