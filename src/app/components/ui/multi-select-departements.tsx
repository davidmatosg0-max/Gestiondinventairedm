import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown, Building } from 'lucide-react';
import { useBranding } from '../../../hooks/useBranding';
import { Badge } from './badge';
import { Button } from './button';

interface MultiSelectDepartementsProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  maxHeight?: string;
}

export function MultiSelectDepartements({
  value = [],
  onChange,
  options,
  placeholder = 'Sélectionner des départements',
  maxHeight = '300px'
}: MultiSelectDepartementsProps) {
  const branding = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Asegurar que value siempre sea un array
  const safeValue = Array.isArray(value) ? value : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (safeValue.includes(option)) {
      onChange(safeValue.filter(v => v !== option));
    } else {
      onChange([...safeValue, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(safeValue.filter(v => v !== option));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="min-h-[44px] w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white cursor-pointer hover:border-[#1a4d7a] transition-colors flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1 items-center">
          {safeValue.length === 0 ? (
            <span className="text-[#999999] text-sm">{placeholder}</span>
          ) : (
            safeValue.map(dept => (
              <Badge
                key={dept}
                variant="outline"
                className="text-xs flex items-center gap-1 px-2 py-1"
                style={{
                  borderColor: branding.primaryColor,
                  color: branding.primaryColor,
                  backgroundColor: `${branding.primaryColor}10`
                }}
              >
                <Building className="w-3 h-3" />
                {dept}
                <button
                  onClick={(e) => removeOption(dept, e)}
                  className="ml-1 hover:bg-white/50 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {safeValue.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Effacer tout"
            >
              <X className="w-4 h-4 text-[#999999]" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#666666] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-xl overflow-hidden"
          style={{ maxHeight }}
        >
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {options.length === 0 ? (
              <div className="px-3 py-4 text-center text-[#999999] text-sm">
                Aucun département disponible
              </div>
            ) : (
              options.map(option => {
                const isSelected = safeValue.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors"
                    style={isSelected ? { backgroundColor: `${branding.primaryColor}10` } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#666666]" />
                      <span className="text-sm text-[#333333]">{option}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {safeValue.length > 0 && (
            <div className="border-t border-[#E0E0E0] p-2 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-[#666666]">
                <span>{safeValue.length} département{safeValue.length > 1 ? 's' : ''} sélectionné{safeValue.length > 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs"
                >
                  Tout effacer
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}