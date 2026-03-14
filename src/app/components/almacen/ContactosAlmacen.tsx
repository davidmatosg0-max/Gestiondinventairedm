import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Truck, 
  Gift, 
  ShoppingCart, 
  Store,
  Settings,
  Info,
  Package
} from 'lucide-react';
import { 
  obtenerTiposContacto, 
  guardarTipoPersonalizado, 
  type TipoContactoPersonalizado 
} from '../../utils/tiposContactoStorage';
import { toast } from 'sonner';

/**
 * 🏢 CONTACTOS DE ALMACÉN
 * 
 * Módulo de gestión de contactos específico para el departamento de Almacén.
 * Incluye tipos de contacto independientes:
 * - Donateurs (Donadores)
 * - Fournisseurs (Proveedores)
 * - PRS (Programa de Récupération en Supermarchés)
 * - Transportistas
 * - Otros contactos relacionados con almacén
 */

export function ContactosAlmacen() {
  const { t } = useTranslation();
  const [tiposInicializados, setTiposInicializados] = useState(false);

  /**
   * Inicializar tipos de contacto específicos de Almacén
   */
  useEffect(() => {
    inicializarTiposContactoAlmacen();
  }, []);

  const inicializarTiposContactoAlmacen = () => {
    try {
      console.log('🏢 Inicializando tipos de contacto para Almacén...');
      
      const tiposExistentes = obtenerTiposContacto('almacen');
      
      // Si ya existen tipos, no sobrescribir
      if (tiposExistentes.length > 0) {
        console.log(`✅ Ya existen ${tiposExistentes.length} tipos de contacto para Almacén`);
        setTiposInicializados(true);
        return;
      }

      // Definir tipos de contacto específicos de Almacén
      const tiposAlmacen = [
        {
          code: 'donateur',
          label: 'Donateur',
          icon: 'Gift',
          color: '#2d9561',
          bgColor: '#D1FAE5'
        },
        {
          code: 'fournisseur',
          label: 'Fournisseur',
          icon: 'ShoppingCart',
          color: '#1a4d7a',
          bgColor: '#DBEAFE'
        },
        {
          code: 'prs',
          label: 'PRS',
          icon: 'Store',
          color: '#8b5cf6',
          bgColor: '#EDE9FE'
        },
        {
          code: 'transporteur',
          label: 'Transporteur',
          icon: 'Truck',
          color: '#f59e0b',
          bgColor: '#FEF3C7'
        },
        {
          code: 'emballage',
          label: 'Fournisseur d\'Emballage',
          icon: 'Package',
          color: '#06b6d4',
          bgColor: '#CCFBF1'
        },
        {
          code: 'autre',
          label: 'Autre Contact',
          icon: 'Users',
          color: '#6b7280',
          bgColor: '#F3F4F6'
        }
      ];

      // Guardar cada tipo de contacto
      let guardados = 0;
      tiposAlmacen.forEach(tipo => {
        const resultado = guardarTipoPersonalizado(tipo, 'almacen');
        if (resultado) {
          guardados++;
        }
      });

      console.log(`✅ ${guardados} tipos de contacto creados para Almacén`);
      setTiposInicializados(true);
      
      // Notificar al usuario
      toast.success(`Types de contact initialisés (${guardados})`);
      
    } catch (error) {
      console.error('❌ Error inicializando tipos de contacto:', error);
      toast.error('Erreur lors de l\'initialisation des types de contact');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <Card className="p-6 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Contacts de l'Entrepôt
              </h1>
              <p className="text-white/90">
                Gestion des donateurs, fournisseurs et partenaires de l'entrepôt
              </p>
            </div>
          </div>
        </div>

        {/* Badges informativos */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Gift className="w-3 h-3 mr-1" />
            Donateurs
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Fournisseurs
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Store className="w-3 h-3 mr-1" />
            PRS
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Truck className="w-3 h-3 mr-1" />
            Transporteurs
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Package className="w-3 h-3 mr-1" />
            Fournisseurs d'Emballage
          </Badge>
        </div>
      </Card>

      {/* Información sobre tipos duales */}
      <Card className="p-4 border-l-4 border-l-[#2d9561]">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#2d9561] mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">
              Partenaires avec Types Multiples
            </h3>
            <p className="text-sm text-gray-600">
              Un même partenaire peut avoir plusieurs types (ex: Donateur + Fournisseur). 
              Les flags <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">isDonateur</code> et{' '}
              <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">isFournisseur</code> permettent 
              d'identifier les partenaires duels qui apparaissent dans plusieurs programmes.
            </p>
          </div>
        </div>
      </Card>

      {/* Componente de gestión de contactos */}
      {tiposInicializados && (
        <GestionContactosDepartamento 
          departamentoId="almacen"
          departamentoNombre="Entrepôt"
        />
      )}

      {!tiposInicializados && (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#1a4d7a] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Initialisation des types de contact...</p>
          </div>
        </Card>
      )}
    </div>
  );
}