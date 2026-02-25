import { useEffect, useState, useCallback } from 'react';
import { obtenerProductos } from '../utils/productStorage';
import { obtenerComandas } from '../utils/comandaStorage';
import { obtenerOrganismos } from '../utils/organismosStorage';
import { obtenerRutas } from '../utils/transporteLogic';
import { obtenerContactosDepartamento } from '../utils/contactosDepartamentoStorage';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: 'productos' | 'comandas' | 'organismos' | 'transporte' | 'contactos';
  icon?: string;
  data?: any;
  route?: string;
}

interface UseGlobalSearchOptions {
  minChars?: number;
  debounceMs?: number;
  maxResults?: number;
}

/**
 * Hook para búsqueda global en todo el sistema
 */
export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const {
    minChars = 2,
    debounceMs = 300,
    maxResults = 50,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Función de búsqueda en productos
  const searchProducts = useCallback((searchQuery: string): SearchResult[] => {
    const productos = obtenerProductos();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return productos
      .filter((producto) => {
        const nombre = producto.nombre?.toLowerCase() || '';
        const categoria = producto.categoria?.toLowerCase() || '';
        const barcode = producto.codigoBarras?.toLowerCase() || '';
        
        return (
          nombre.includes(normalizedQuery) ||
          categoria.includes(normalizedQuery) ||
          barcode.includes(normalizedQuery)
        );
      })
      .map((producto) => ({
        id: `producto-${producto.id}`,
        title: producto.nombre,
        subtitle: producto.categoria || 'Sin categoría',
        description: `Stock: ${producto.stock} ${producto.unidad || 'unités'} • ${producto.temperatura || 'N/A'}`,
        category: 'productos' as const,
        icon: '📦',
        data: producto,
        route: 'inventario',
      }))
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en comandas
  const searchOrders = useCallback((searchQuery: string): SearchResult[] => {
    const comandas = obtenerComandas();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return comandas
      .filter((comanda) => {
        const numero = comanda.numero?.toLowerCase() || '';
        const organismo = comanda.nombreOrganismo?.toLowerCase() || '';
        const estado = comanda.estado?.toLowerCase() || '';
        
        return (
          numero.includes(normalizedQuery) ||
          organismo.includes(normalizedQuery) ||
          estado.includes(normalizedQuery)
        );
      })
      .map((comanda) => ({
        id: `comanda-${comanda.id}`,
        title: `Commande #${comanda.numero}`,
        subtitle: comanda.nombreOrganismo,
        description: `État: ${comanda.estado} • ${comanda.fecha ? new Date(comanda.fecha).toLocaleDateString('fr-FR') : 'N/A'}`,
        category: 'comandas' as const,
        icon: '📋',
        data: comanda,
        route: 'comandas',
      }))
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en organismos
  const searchOrganisms = useCallback((searchQuery: string): SearchResult[] => {
    const organismos = obtenerOrganismos();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return organismos
      .filter((organismo) => {
        const nombre = organismo.nombre?.toLowerCase() || '';
        const tipo = organismo.tipo?.toLowerCase() || '';
        const responsable = organismo.responsable?.toLowerCase() || '';
        const ciudad = organismo.ciudad?.toLowerCase() || '';
        
        return (
          nombre.includes(normalizedQuery) ||
          tipo.includes(normalizedQuery) ||
          responsable.includes(normalizedQuery) ||
          ciudad.includes(normalizedQuery)
        );
      })
      .map((organismo) => ({
        id: `organismo-${organismo.id}`,
        title: organismo.nombre,
        subtitle: organismo.tipo,
        description: `${organismo.responsable} • ${organismo.ciudad || 'N/A'} • ${organismo.beneficiarios || 0} bénéficiaires`,
        category: 'organismos' as const,
        icon: '🏢',
        data: organismo,
        route: 'organismos',
      }))
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en transporte
  const searchTransport = useCallback((searchQuery: string): SearchResult[] => {
    const rutas = obtenerRutas();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return rutas
      .filter((ruta) => {
        const numero = ruta.numero?.toLowerCase() || '';
        const conductor = ruta.conductor?.toLowerCase() || '';
        const destino = ruta.destino?.toLowerCase() || '';
        const vehiculo = ruta.vehiculo?.toLowerCase() || '';
        
        return (
          numero.includes(normalizedQuery) ||
          conductor.includes(normalizedQuery) ||
          destino.includes(normalizedQuery) ||
          vehiculo.includes(normalizedQuery)
        );
      })
      .map((ruta) => ({
        id: `ruta-${ruta.id}`,
        title: `Route #${ruta.numero}`,
        subtitle: ruta.destino || 'Destination non définie',
        description: `Conducteur: ${ruta.conductor || 'N/A'} • Véhicule: ${ruta.vehiculo || 'N/A'}`,
        category: 'transporte' as const,
        icon: '🚛',
        data: ruta,
        route: 'transporte',
      }))
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en contactos
  const searchContacts = useCallback((searchQuery: string): SearchResult[] => {
    const contactos = obtenerContactosDepartamento();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return contactos
      .filter((contacto) => {
        const nombre = `${contacto.prenom || ''} ${contacto.nom || ''}`.toLowerCase();
        const email = contacto.email?.toLowerCase() || '';
        const departamento = contacto.departement?.toLowerCase() || '';
        const empresa = contacto.nomEntreprise?.toLowerCase() || '';
        
        return (
          nombre.includes(normalizedQuery) ||
          email.includes(normalizedQuery) ||
          departamento.includes(normalizedQuery) ||
          empresa.includes(normalizedQuery)
        );
      })
      .map((contacto) => ({
        id: `contacto-${contacto.id}`,
        title: contacto.nomEntreprise || `${contacto.prenom} ${contacto.nom}`,
        subtitle: contacto.categorie || 'Contact',
        description: `${contacto.email || 'N/A'} • ${contacto.departement || 'N/A'}`,
        category: 'contactos' as const,
        icon: '👤',
        data: contacto,
        route: 'contactos-almacen',
      }))
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Ejecutar búsqueda
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minChars) {
        setResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);

      try {
        // Ejecutar todas las búsquedas en paralelo
        const [productos, comandas, organismos, transporte, contactos] = await Promise.all([
          Promise.resolve(searchProducts(searchQuery)),
          Promise.resolve(searchOrders(searchQuery)),
          Promise.resolve(searchOrganisms(searchQuery)),
          Promise.resolve(searchTransport(searchQuery)),
          Promise.resolve(searchContacts(searchQuery)),
        ]);

        const allResults = [
          ...productos,
          ...comandas,
          ...organismos,
          ...transporte,
          ...contactos,
        ];

        // Ordenar por relevancia (puedes mejorar esto con un algoritmo de scoring)
        const sortedResults = allResults.sort((a, b) => {
          // Priorizar coincidencias exactas en el título
          const aExact = a.title.toLowerCase() === searchQuery.toLowerCase();
          const bExact = b.title.toLowerCase() === searchQuery.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Priorizar coincidencias al inicio del título
          const aStarts = a.title.toLowerCase().startsWith(searchQuery.toLowerCase());
          const bStarts = b.title.toLowerCase().startsWith(searchQuery.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          return 0;
        });

        setResults(sortedResults.slice(0, maxResults));
        setTotalResults(sortedResults.length);
      } catch (error) {
        console.error('Error en búsqueda global:', error);
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    [minChars, maxResults, searchProducts, searchOrders, searchOrganisms, searchTransport, searchContacts]
  );

  // Debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, performSearch]);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
  }, []);

  // Agrupar resultados por categoría
  const resultsByCategory = useCallback(() => {
    const grouped: Record<string, SearchResult[]> = {
      productos: [],
      comandas: [],
      organismos: [],
      transporte: [],
      contactos: [],
    };

    results.forEach((result) => {
      grouped[result.category].push(result);
    });

    return grouped;
  }, [results]);

  return {
    query,
    setQuery,
    results,
    loading,
    totalResults,
    clearSearch,
    resultsByCategory: resultsByCategory(),
  };
}

/**
 * Hook para gestionar el shortcut Ctrl+K / Cmd+K
 */
export function useSearchShortcut(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detectar Ctrl+K (Windows/Linux) o Cmd+K (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        callback();
      }

      // También ESC para cerrar
      if (event.key === 'Escape') {
        // Manejar en el componente
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
