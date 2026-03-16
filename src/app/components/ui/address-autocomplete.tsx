import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';

interface AddressSuggestion {
  street: string;
  city: string;
  postalCode: string;
  apt: string;
}

interface AddressAutocompleteProps {
  onAddressSelect?: (address: AddressSuggestion) => void;
  onChange?: (value: string, details?: { city?: string; postalCode?: string; apt?: string }) => void;
  value?: string;
  disabled?: boolean;
  initialValue?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showAdditionalFields?: boolean;
  // Nuevos props para sincronizar valores
  initialCity?: string;
  initialPostalCode?: string;
  initialApartment?: string;
}

function AddressAutocompleteComponent({
  onAddressSelect,
  onChange,
  value: controlledValue,
  disabled = false,
  initialValue = '',
  placeholder = 'Ex: 123 Boulevard Saint-Martin Est',
  label = 'Adresse',
  required = false,
  showAdditionalFields = true,
  initialCity = '',
  initialPostalCode = '',
  initialApartment = ''
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(controlledValue || initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [city, setCity] = useState(initialCity);
  const [apartment, setApartment] = useState(initialApartment);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserEditing = useRef(false);
  const isInitialized = useRef(false);

  // ✅ Sincronizar con value controlado (SIEMPRE en primera carga)
  useEffect(() => {
    if (controlledValue !== undefined) {
      if (!isInitialized.current || controlledValue !== inputValue) {
        console.log('🔄 AddressAutocomplete - Sincronizando inputValue:', controlledValue);
        setInputValue(controlledValue);
        isInitialized.current = true;
      }
    }
  }, [controlledValue]);

  // ✅ Sincronizar con valores iniciales de ciudad, código postal y apartamento (SIEMPRE en primera carga)
  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialCity:', initialCity);
    setCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialPostalCode:', initialPostalCode);
    setPostalCode(initialPostalCode);
  }, [initialPostalCode]);

  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialApartment:', initialApartment);
    setApartment(initialApartment);
  }, [initialApartment]);

  // Base de datos de rues de Québec
  const streets = [
    // ========================================
    // LAVAL - BOULEVARDS PRINCIPAUX
    // ========================================
    'Boulevard Saint-Martin Est',
    'Boulevard Saint-Martin Ouest',
    'Boulevard de la Concorde Est',
    'Boulevard de la Concorde Ouest',
    'Boulevard des Laurentides',
    'Boulevard Lévesque Est',
    'Boulevard Lévesque Ouest',
    'Boulevard Dagenais Ouest',
    'Boulevard Dagenais Est',
    'Boulevard Le Corbusier',
    'Boulevard Cartier Ouest',
    'Boulevard Cartier Est',
    'Boulevard Chomedey',
    'Boulevard Curé-Labelle',
    'Boulevard Samson',
    'Boulevard Industriel',
    'Boulevard Le Carrefour',
    'Boulevard Sainte-Rose',
    'Boulevard des Prairies',
    'Boulevard Laval',
    'Boulevard Saint-Elzéar Ouest',
    'Boulevard Saint-Elzéar Est',
    'Boulevard Évolution',
    'Boulevard du Souvenir',
    'Boulevard Cléroux',
    'Boulevard Daniel-Johnson',
    'Boulevard Pie-X',
    'Boulevard Pie-XII',
    'Boulevard Notre-Dame',
    'Boulevard Sainte-Marie',
    'Boulevard Jarry',
    'Boulevard de l\'Avenir',
    'Boulevard Laval',
    'Boulevard Agricola',
    'Boulevard René-Laennec',
    'Boulevard Arthur-Sauvé',
    'Boulevard Saint-François',
    
    // ========================================
    // QUARTIER: AUTEUIL
    // ========================================
    'Boulevard des Mille-Îles',
    'Boulevard Lévesque Est',
    'Rue de Beauharnois',
    'Rue de Lausanne',
    'Rue de Chambly',
    'Rue de Gaspé',
    'Rue de Verdun',
    'Rue de Dijon',
    'Rue de l\'Équerre',
    'Rue Valmont',
    'Rue Principale',
    'Rue Centrale',
    'Rue Saint-Elzéar',
    'Avenue des Bois',
    'Avenue des Perron',
    'Avenue Dumont',
    'Avenue de la Seigneurie',
    'Avenue de la Fabrique',
    'Montée Saint-François',
    'Montée Champagne',
    'Montée Monette',
    
    // ========================================
    // QUARTIER: CHOMEDEY
    // ========================================
    'Boulevard Le Corbusier',
    'Boulevard Cartier Ouest',
    'Boulevard Samson',
    'Boulevard Curé-Labelle',
    'Boulevard Chomedey',
    'Boulevard de la Concorde Ouest',
    'Boulevard Industriel',
    'Boulevard Le Carrefour',
    'Rue de l\'Avenir',
    'Rue du Parc',
    'Rue Principale',
    'Rue Desjardins',
    'Rue Paradis',
    'Rue de Dieppe',
    'Rue de Paris',
    'Rue de Strasbourg',
    'Rue de Lausanne',
    'Rue de Calais',
    'Rue de Menton',
    'Rue de Brest',
    'Rue de Bruges',
    'Rue de Monaco',
    'Rue de Grenade',
    'Rue de Sienne',
    'Rue de Naples',
    'Rue de Venise',
    'Rue de Milan',
    'Rue de Vérone',
    'Rue de Florence',
    'Rue de Mantoue',
    'Rue de Gênes',
    'Rue de Bologne',
    'Rue de Padoue',
    'Rue de Parme',
    'Rue de Trieste',
    'Rue de Ferrare',
    'Rue de Modène',
    'Rue de Ravenne',
    'Rue de Rimini',
    'Rue de Salerne',
    'Rue de Bari',
    'Rue de Brindisi',
    'Rue de Tarente',
    'Rue de Syracuse',
    'Rue de Palerme',
    'Rue de Messine',
    'Rue de Catane',
    'Rue de l\'Empereur',
    'Rue de Buckingham',
    'Rue de Versailles',
    'Rue du Louvre',
    'Rue du Consul',
    'Rue Berlier',
    'Rue Bertrand',
    'Rue Gauthier',
    'Rue Dumouchel',
    'Avenue Central',
    'Avenue Martin-Plouffe',
    'Avenue Léo-Lacombe',
    'Avenue Odilon-Gauthier',
    'Avenue Hector-Lanthier',
    'Avenue Olivier',
    'Avenue de Clichy',
    'Avenue de Vimy',
    'Avenue des Aristocrates',
    'Avenue Georges V',
    'Avenue du Pacifique',
    'Avenue de la Renaissance',
    'Avenue du Parc-Laval',
    'Avenue Ampère',
    'Avenue Desmarteau',
    'Avenue de la Concorde',
    'Avenue des Terrasses',
    'Avenue de la Gare',
    'Avenue Laval',
    'Avenue Saint-Charles',
    'Avenue de Lorimier',
    
    // ========================================
    // QUARTIER: DUVERNAY
    // ========================================
    'Boulevard Lévesque Est',
    'Boulevard de la Concorde Est',
    'Boulevard Saint-Martin Est',
    'Boulevard Pie-IX',
    'Rue de Java',
    'Rue de Bali',
    'Rue de Sumatra',
    'Rue de Timor',
    'Rue de Flores',
    'Rue de Lombok',
    'Rue de Célèbes',
    'Rue de Mindanao',
    'Rue de Luçon',
    'Rue de Palawan',
    'Rue de Négros',
    'Rue de Mindoro',
    'Rue de Samar',
    'Rue de Panay',
    'Rue de Leyte',
    'Rue de Cebu',
    'Rue des Orchidées',
    'Rue Benoit',
    'Rue Berri',
    'Rue Émile',
    'Rue Arthur',
    'Rue Louis',
    'Rue Ernest',
    'Rue Albert',
    'Rue Georges',
    'Rue Henri',
    'Rue Paul',
    'Rue Marcel',
    'Rue André',
    'Rue Pierre',
    'Rue Jean',
    'Rue Claude',
    'Rue Maurice',
    'Rue Roger',
    'Rue René',
    'Avenue de l\'Église',
    'Avenue Saint-Pierre',
    'Avenue Saint-Laurent',
    'Avenue des Érables',
    'Avenue des Pins',
    'Avenue des Ormes',
    'Avenue des Chênes',
    'Avenue des Cèdres',
    
    // ========================================
    // QUARTIER: FABREVILLE
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard Dagenais Ouest',
    'Boulevard Curé-Labelle',
    'Boulevard des Laurentides',
    'Rue des Gouverneurs',
    'Rue de la Station',
    'Rue Promenade',
    'Rue du Ruisseau',
    'Rue des Trembles',
    'Rue Gaston-Dumoulin',
    'Rue Péladeau',
    'Rue Arthur-Sauvé',
    'Rue de la Goudrelle',
    'Rue des Patriotes',
    'Rue Saint-Louis',
    'Rue Saint-Georges',
    'Rue Sainte-Marie',
    'Rue Notre-Dame',
    'Rue de la Fabrique',
    'Rue du Collège',
    'Rue du Curé',
    'Avenue de l\'Empereur',
    'Avenue de Buckingham',
    'Avenue de Versailles',
    'Montée Champagne',
    'Montée Gagnon',
    
    // ========================================
    // QUARTIER: LAVAL-DES-RAPIDES
    // ========================================
    'Boulevard Cartier Est',
    'Boulevard de la Concorde Est',
    'Boulevard Lévesque Est',
    'Rue Éthier',
    'Rue Valmont',
    'Rue Guilbault',
    'Rue Provost',
    'Rue Leblanc',
    'Rue Préfontaine',
    'Rue Dufresne',
    'Rue Panet',
    'Rue de Chambly',
    'Rue de Verdun',
    'Rue de Dijon',
    'Avenue Marcel-Villeneuve',
    'Avenue Taniata',
    'Avenue des Flamands',
    'Avenue du Souvenir',
    
    // ========================================
    // QUARTIER: LAVAL-OUEST
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard Arthur-Sauvé',
    'Boulevard des Laurentides',
    '55e Avenue',
    '56e Avenue',
    '57e Avenue',
    '58e Avenue',
    '59e Avenue',
    '60e Avenue',
    '61e Avenue',
    '62e Avenue',
    '63e Avenue',
    '64e Avenue',
    '65e Avenue',
    'Rue de l\'Aqueduc',
    'Rue de la Fabrique',
    'Rue du Havre',
    'Montée Champagne',
    'Montée Saint-François',
    
    // ========================================
    // QUARTIER: LAVAL-SUR-LE-LAC
    // ========================================
    'Boulevard Sainte-Rose',
    'Rue de l\'Anse',
    'Rue de la Berge',
    'Rue du Boisé',
    'Rue du Lac',
    'Rue du Rivage',
    'Avenue du Golf',
    'Avenue du Parc',
    'Montée Monette',
    
    // ========================================
    // QUARTIER: PONT-VIAU
    // ========================================
    'Boulevard de la Concorde Est',
    'Boulevard Lévesque Est',
    'Boulevard Pie-IX',
    'Boulevard Cartier Est',
    'Rue de Lausanne',
    'Rue Berlier',
    'Rue Léonard-de-Vinci',
    'Rue Lamartine',
    'Rue Victor-Hugo',
    'Rue Balzac',
    'Rue Rousseau',
    'Rue Voltaire',
    'Rue Molière',
    'Rue Racine',
    'Rue Corneille',
    'Avenue Léonard-de-Vinci',
    'Avenue de la Concorde',
    
    // ========================================
    // QUARTIER: SAINTE-DOROTHÉE
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard des Laurentides',
    'Boulevard Curé-Labelle',
    'Autoroute 13',
    'Autoroute 440',
    'Rue Principale',
    'Rue de la Station',
    'Rue Promenade',
    'Rue du Plateau',
    'Rue de la Seigneurie',
    'Montée Champagne',
    'Montée Saint-François',
    
    // ========================================
    // QUARTIER: SAINTE-ROSE
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard des Laurentides',
    'Boulevard Curé-Labelle',
    'Boulevard du Souvenir',
    'Boulevard Cléroux',
    'Rue Principale',
    'Rue du Curé',
    'Rue de la Fabrique',
    'Rue Saint-Louis',
    'Rue Saint-Pierre',
    'Rue Sainte-Marie',
    'Rue Notre-Dame',
    'Rue de l\'Église',
    'Rue du Collège',
    'Rue des Patriotes',
    'Montée Saint-François',
    'Montée Champagne',
    'Montée Masson',
    'Montée du Moulin',
    
    // ========================================
    // QUARTIER: SAINT-FRANÇOIS
    // ========================================
    'Boulevard des Mille-Îles',
    'Boulevard Lévesque Est',
    'Boulevard Saint-François',
    'Montée Masson',
    'Montée Saint-François',
    'Montée Champagne',
    'Rang du Haut-Saint-François',
    'Rang Saint-François',
    'Rue Principale',
    'Rue de la Seigneurie',
    'Rue de la Fabrique',
    
    // ========================================
    // QUARTIER: SAINT-VINCENT-DE-PAUL
    // ========================================
    'Boulevard des Mille-Îles',
    'Boulevard Lévesque Est',
    'Boulevard de la Concorde Est',
    'Boulevard Pie-IX',
    'Rue Principale',
    'Rue Saint-Pierre',
    'Rue Sainte-Marie',
    'Rue Notre-Dame',
    'Rue de l\'Église',
    'Rue du Curé',
    'Montée Saint-François',
    'Montée Champagne',
    
    // ========================================
    // QUARTIER: VIMONT
    // ========================================
    'Boulevard des Laurentides',
    'Boulevard Saint-Elzéar Est',
    'Boulevard Dagenais Est',
    'Boulevard Daniel-Johnson',
    'Boulevard de l\'Avenir',
    'Rue Michelin',
    'Rue Industrielle',
    'Rue des Affaires',
    'Rue Bombardier',
    'Rue de la Technologie',
    'Rue du Commerce',
    'Rue de l\'Industrie',
    'Rue des Entreprises',
    'Rue Innovation',
    'Rue des Satellites',
    'Rue Louis-Bisson',
    'Avenue de l\'Avenir',
    'Avenue Industrielle',
    
    // ========================================
    // QUARTIER: ÎLES-LAVAL
    // ========================================
    'Boulevard des Îles',
    'Boulevard de la Grande-Île',
    'Rue de l\'Île-Jésus',
    'Rue de l\'Île-Bigras',
    'Rue de l\'Île-Saint-Pierre',
    
    // ========================================
    // MONTRÉAL - RUES PRINCIPALES
    // ========================================
    'Boulevard Saint-Laurent',
    'Boulevard René-Lévesque Ouest',
    'Boulevard René-Lévesque Est',
    'Boulevard de Maisonneuve Est',
    'Boulevard de Maisonneuve Ouest',
    'Boulevard Saint-Michel',
    'Boulevard Pie-IX',
    'Boulevard Henri-Bourassa Est',
    'Boulevard Henri-Bourassa Ouest',
    'Boulevard Crémazie Est',
    'Boulevard Crémazie Ouest',
    'Boulevard Décarie',
    'Boulevard Gouin Est',
    'Boulevard Gouin Ouest',
    'Boulevard Newman',
    'Boulevard Monk',
    'Boulevard Lasalle',
    'Boulevard Angrignon',
    'Boulevard Cavendish',
    'Boulevard des Sources',
    'Boulevard Saint-Jean',
    'Boulevard Pierrefonds',
    'Boulevard Metropolitan Est',
    'Boulevard Metropolitan Ouest',
    'Boulevard Rosemont',
    'Boulevard Langelier',
    'Boulevard Viau',
    'Boulevard Lacordaire',
    'Boulevard Radisson',
    'Boulevard Perras',
    'Boulevard Maurice-Duplessis',
    'Avenue du Parc',
    'Avenue du Mont-Royal Est',
    'Avenue du Mont-Royal Ouest',
    'Avenue McGill College',
    'Avenue Papineau',
    'Avenue Christophe-Colomb',
    'Avenue de Lorimier',
    'Avenue des Pins Est',
    'Avenue des Pins Ouest',
    'Avenue Van Horne',
    'Avenue Atwater',
    'Avenue Laurier Ouest',
    'Avenue Bernard',
    'Rue Saint-Denis',
    'Rue Sainte-Catherine Est',
    'Rue Sainte-Catherine Ouest',
    'Rue Sherbrooke Est',
    'Rue Sherbrooke Ouest',
    'Rue Notre-Dame Est',
    'Rue Notre-Dame Ouest',
    'Rue Jean-Talon Est',
    'Rue Jean-Talon Ouest',
    'Rue Ontario Est',
    'Rue Ontario Ouest',
    'Rue Hochelaga',
    'Rue Masson',
    'Rue Beaubien Est',
    'Rue Beaubien Ouest',
    'Rue Saint-Hubert',
    'Rue Jarry Est',
    'Rue Jarry Ouest',
    'Rue Wellington',
    'Rue Peel',
    'Rue University',
    'Rue Saint-Jacques',
    'Montée de Liesse',
    'Montée Saint-Hubert',
    'Chemin de la Côte-des-Neiges',
    'Chemin Queen-Mary',
    'Chemin Côte-Sainte-Catherine',
    'Chemin de la Côte-Saint-Luc',
  ];

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para extraer el número cívico y el nombre de la calle
  const parseAddress = (value: string) => {
    // Buscar patrón: número seguido de texto
    const match = value.match(/^(\d+)\s+(.*)$/);
    if (match) {
      return {
        civicNumber: match[1],
        streetName: match[2]
      };
    }
    
    // Si empieza con número pero no hay espacio todavía
    const numberMatch = value.match(/^(\d+)$/);
    if (numberMatch) {
      return {
        civicNumber: numberMatch[1],
        streetName: ''
      };
    }
    
    return {
      civicNumber: '',
      streetName: value
    };
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // ✅ NOTIFICAR con los valores actuales de ciudad, código postal y apartamento
    onChange?.(value, { city: city, postalCode: postalCode, apt: apartment });
    
    const { civicNumber, streetName } = parseAddress(value);
    
    // Si no hay número cívico, no mostrar sugerencias
    if (!civicNumber) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    // Simular un pequeño delay para búsqueda
    setTimeout(() => {
      let filtered: string[] = [];
      
      if (streetName.length === 0) {
        // Si solo escribió el número, mostrar todas las calles
        filtered = streets.slice(0, 10);
      } else {
        // Filtrar calles según lo que escribió
        const searchTerm = streetName.toLowerCase();
        filtered = streets.filter(street => 
          street.toLowerCase().includes(searchTerm)
        ).slice(0, 10);
      }
      
      // Agregar el número cívico a cada sugerencia
      const suggestionsWithNumber = filtered.map(street => `${civicNumber} ${street}`);
      
      setSuggestions(suggestionsWithNumber);
      setShowSuggestions(filtered.length > 0);
      setIsSearching(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleSuggestionClick = (fullAddress: string) => {
    setInputValue(fullAddress);
    setShowSuggestions(false);
    
    // Extraer información de la dirección
    const { civicNumber, streetName } = parseAddress(fullAddress);
    
    // Determinar ciudad basado en el nombre de la calle
    let detectedCity = 'Laval';
    let detectedPostalCode = 'H7T 1C7';
    
    // Código postal específico para Rue Michelin
    if (streetName.includes('Michelin')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7L 4R3';
    } else if (streetName.includes('Saint-Laurent') || streetName.includes('Mont-Royal') || 
        streetName.includes('Saint-Denis') || streetName.includes('Sainte-Catherine') ||
        streetName.includes('Sherbrooke') || streetName.includes('Notre-Dame') ||
        streetName.includes('René-Lévesque') || streetName.includes('Maisonneuve') ||
        streetName.includes('du Parc') || streetName.includes('McGill')) {
      detectedCity = 'Montréal';
      detectedPostalCode = 'H2J 1Y1';
    } else if (streetName.includes('Grande Allée') || streetName.includes('Cartier')) {
      detectedCity = 'Québec';
      detectedPostalCode = 'G1R 2K5';
    }
    
    // Actualizar estados locales
    setCity(detectedCity);
    setPostalCode(detectedPostalCode);
    
    // Notificar al componente padre
    onAddressSelect?.({
      street: fullAddress,
      city: detectedCity,
      postalCode: detectedPostalCode,
      apt: apartment
    });
    
    // Notificar cambios a través de onChange
    onChange?.(fullAddress, { city: detectedCity, postalCode: detectedPostalCode, apt: apartment });
  };

  // Notificar cambios cuando se editen los campos adicionales
  useEffect(() => {
    // ✅ NOTIFICAR SIEMPRE los cambios, sin condiciones restrictivas
    if (isUserEditing.current) {
      const timeoutId = setTimeout(() => {
        console.log('🔔 AddressAutocomplete - Notificando cambios:', {
          inputValue,
          city,
          postalCode,
          apartment
        });
        
        onAddressSelect?.({
          street: inputValue,
          city: city,
          postalCode: postalCode,
          apt: apartment
        });
        
        onChange?.(inputValue, { city: city, postalCode: postalCode, apt: apartment });
        isUserEditing.current = false;
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [postalCode, city, apartment, inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <Label className="mb-2 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666] z-10" />
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${disabled ? 'bg-[#F4F4F4]' : ''}`}
        />
        
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1E73BE] animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const { civicNumber, streetName } = parseAddress(suggestion);
            
            return (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-[#E3F2FD] transition-colors border-b border-[#EEEEEE] last:border-b-0 ${
                  highlightedIndex === index ? 'bg-[#E3F2FD]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1E73BE] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-[#333333]">
                      <span className="text-[#1E73BE] font-semibold">{civicNumber}</span>
                      {' '}
                      <span>{streetName}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showSuggestions && inputValue.length > 0 && suggestions.length === 0 && !isSearching && parseAddress(inputValue).civicNumber && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#333333] mb-1">
                ✅ Vous pouvez continuer à taper librement
              </p>
              <p className="text-xs text-[#666666]">
                Cette rue n'est pas dans nos suggestions, mais vous pouvez l'écrire manuellement. L'adresse sera enregistrée telle quelle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campos adicionales editables - SIEMPRE VISIBLES */}
      {showAdditionalFields && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Apartamento */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">
                Appartement <span className="text-[#999999]">(optionnel)</span>
              </Label>
              <Input
                type="text"
                value={apartment}
                onChange={(e) => {
                  setApartment(e.target.value);
                  isUserEditing.current = true;
                }}
                placeholder="Ex: 101"
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* Ciudad */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">Ville</Label>
              <Input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  isUserEditing.current = true;
                }}
                placeholder="Ex: Laval"
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* Código Postal - EDITABLE */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">Code postal</Label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => {
                  // Formatear código postal canadiense automáticamente
                  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length > 3 && value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                  }
                  if (value.length > 7) {
                    value = value.slice(0, 7);
                  }
                  setPostalCode(value);
                  isUserEditing.current = true;
                }}
                placeholder="Ex: H7L 4R3"
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-base bg-input-background transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AddressAutocompleteComponent.displayName = 'AddressAutocomplete';

export const AddressAutocomplete = AddressAutocompleteComponent;