import React from 'react';
import { useBranding } from '../../../hooks/useBranding';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { Users } from 'lucide-react';

interface ContactosAlmacenProps {
  onNavigate?: (page: string) => void;
}

export function ContactosAlmacen({ onNavigate }: ContactosAlmacenProps) {
  const branding = useBranding();

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header con glassmorphism */}
      <div 
        className="backdrop-blur-xl rounded-2xl shadow-xl border p-6"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
          borderColor: `${branding.primaryColor}20`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl shadow-lg"
            style={{ backgroundColor: branding.secondaryColor }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: branding.primaryColor 
              }}
            >
              Gestion des Contacts
            </h2>
            <p className="text-sm text-gray-600">
              Département: Entrepôt
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        <GestionContactosDepartamento 
          departamentoId="2"
          departamentoNombre="Entrepôt"
        />
      </div>
    </div>
  );
}