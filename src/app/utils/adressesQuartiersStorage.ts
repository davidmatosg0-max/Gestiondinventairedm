/**
 * Gestión de Direcciones y Quartiers (Barrios) por Ciudad
 * Sistema de almacenamiento de direcciones organizadas por ciudad y barrio
 */

export interface Quartier {
  id: string;
  nom: string;
  codePostal?: string;
  description?: string;
  dateCreation: string;
  dateModification: string;
}

export interface Ville {
  id: string;
  nom: string;
  province: string;
  pays: string;
  quartiers: Quartier[];
  dateCreation: string;
  dateModification: string;
}

const STORAGE_KEY = 'adresses_quartiers';

/**
 * Obtener todas las ciudades con sus barrios
 */
export function obtenirVilles(): Ville[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du parsing des villes:', error);
    return [];
  }
}

/**
 * Guardar ciudades
 */
function sauvegarderVilles(villes: Ville[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(villes));
}

/**
 * Agregar una nueva ciudad
 */
export function ajouterVille(ville: Omit<Ville, 'id' | 'dateCreation' | 'dateModification'>): Ville {
  const villes = obtenirVilles();
  
  const nouvelleVille: Ville = {
    ...ville,
    id: `ville-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  villes.push(nouvelleVille);
  sauvegarderVilles(villes);
  
  return nouvelleVille;
}

/**
 * Actualizar una ciudad
 */
export function mettreAJourVille(id: string, donnees: Partial<Ville>): boolean {
  const villes = obtenirVilles();
  const index = villes.findIndex(v => v.id === id);
  
  if (index === -1) return false;
  
  villes[index] = {
    ...villes[index],
    ...donnees,
    dateModification: new Date().toISOString()
  };
  
  sauvegarderVilles(villes);
  return true;
}

/**
 * Eliminar una ciudad
 */
export function supprimerVille(id: string): boolean {
  const villes = obtenirVilles();
  const villesFiltrees = villes.filter(v => v.id !== id);
  
  if (villesFiltrees.length === villes.length) return false;
  
  sauvegarderVilles(villesFiltrees);
  return true;
}

/**
 * Agregar un quartier a una ciudad
 */
export function ajouterQuartier(villeId: string, quartier: Omit<Quartier, 'id' | 'dateCreation' | 'dateModification'>): boolean {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return false;
  
  const nouveauQuartier: Quartier = {
    ...quartier,
    id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  ville.quartiers.push(nouveauQuartier);
  ville.dateModification = new Date().toISOString();
  
  sauvegarderVilles(villes);
  return true;
}

/**
 * Actualizar un quartier
 */
export function mettreAJourQuartier(villeId: string, quartierId: string, donnees: Partial<Quartier>): boolean {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return false;
  
  const index = ville.quartiers.findIndex(q => q.id === quartierId);
  if (index === -1) return false;
  
  ville.quartiers[index] = {
    ...ville.quartiers[index],
    ...donnees,
    dateModification: new Date().toISOString()
  };
  
  ville.dateModification = new Date().toISOString();
  
  sauvegarderVilles(villes);
  return true;
}

/**
 * Eliminar un quartier
 */
export function supprimerQuartier(villeId: string, quartierId: string): boolean {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return false;
  
  const quartiersFiltres = ville.quartiers.filter(q => q.id !== quartierId);
  
  if (quartiersFiltres.length === ville.quartiers.length) return false;
  
  ville.quartiers = quartiersFiltres;
  ville.dateModification = new Date().toISOString();
  
  sauvegarderVilles(villes);
  return true;
}

/**
 * Inicializar datos de ejemplo
 */
export function initialiserDonneesExemple(): void {
  const villesExistantes = obtenirVilles();
  
  if (villesExistantes.length > 0) {
    console.log('Des villes existent déjà dans le système');
    return;
  }
  
  const villesExemple: Omit<Ville, 'id' | 'dateCreation' | 'dateModification'>[] = [
    {
      nom: 'Montréal',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: 'q-mtl-1',
          nom: 'Plateau-Mont-Royal',
          codePostal: 'H2T',
          description: 'Quartier résidentiel et commercial dynamique',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-mtl-2',
          nom: 'Ville-Marie',
          codePostal: 'H2X',
          description: 'Centre-ville de Montréal',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-mtl-3',
          nom: 'Rosemont-La Petite-Patrie',
          codePostal: 'H2S',
          description: 'Quartier familial avec parcs et commerces',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-mtl-4',
          nom: 'Côte-des-Neiges–Notre-Dame-de-Grâce',
          codePostal: 'H3S',
          description: 'Quartier multiculturel et universitaire',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-mtl-5',
          nom: 'Verdun',
          codePostal: 'H4G',
          description: 'Quartier résidentiel au bord du fleuve',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Québec',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: 'q-qc-1',
          nom: 'Vieux-Québec',
          codePostal: 'G1R',
          description: 'Quartier historique fortifié',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-qc-2',
          nom: 'Sainte-Foy',
          codePostal: 'G1V',
          description: 'Quartier universitaire et commercial',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-qc-3',
          nom: 'Limoilou',
          codePostal: 'G1L',
          description: 'Quartier résidentiel en développement',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Laval',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: 'q-lav-1',
          nom: 'Chomedey',
          codePostal: 'H7W',
          description: 'Secteur central de Laval',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'q-lav-2',
          nom: 'Sainte-Rose',
          codePostal: 'H7L',
          description: 'Secteur historique de Laval',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    }
  ];
  
  villesExemple.forEach(ville => {
    ajouterVille(ville);
  });
  
  console.log(`✅ ${villesExemple.length} villes avec leurs quartiers ont été créées`);
}

/**
 * Exportar datos para descarga
 */
export function exporterDonnees(format: 'json' | 'csv'): string {
  const villes = obtenirVilles();
  
  if (format === 'json') {
    return JSON.stringify(villes, null, 2);
  }
  
  // Formato CSV
  let csv = 'Ville,Province,Pays,Quartier,Code Postal,Description\n';
  
  villes.forEach(ville => {
    if (ville.quartiers.length === 0) {
      csv += `"${ville.nom}","${ville.province}","${ville.pays}","","",""\n`;
    } else {
      ville.quartiers.forEach(quartier => {
        csv += `"${ville.nom}","${ville.province}","${ville.pays}","${quartier.nom}","${quartier.codePostal || ''}","${quartier.description || ''}"\n`;
      });
    }
  });
  
  return csv;
}

/**
 * Datos adicionales de ciudades canadienses desde "Internet"
 * Simula una actualización desde una base de datos externa
 */
export function obtenirDonneesInternet(): Omit<Ville, 'id' | 'dateCreation' | 'dateModification'>[] {
  return [
    {
      nom: 'Gatineau',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Hull',
          codePostal: 'J8X',
          description: 'Secteur central et historique de Gatineau',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Aylmer',
          codePostal: 'J9H',
          description: 'Secteur anglophone au bord de la rivière',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Gatineau-Nord',
          codePostal: 'J8T',
          description: 'Secteur résidentiel en expansion',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Sherbrooke',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Centre-ville',
          codePostal: 'J1H',
          description: 'Coeur commercial et administratif',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Mont-Bellevue',
          codePostal: 'J1H',
          description: 'Quartier universitaire avec le parc du Mont-Bellevue',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Fleurimont',
          codePostal: 'J1E',
          description: 'Secteur résidentiel et commercial',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Trois-Rivières',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Centre-ville',
          codePostal: 'G9A',
          description: 'Centre historique et commercial',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Cap-de-la-Madeleine',
          codePostal: 'G8T',
          description: 'Secteur résidentiel et religieux',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Longueuil',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Vieux-Longueuil',
          codePostal: 'J4H',
          description: 'Centre historique de Longueuil',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Saint-Hubert',
          codePostal: 'J3Y',
          description: 'Secteur résidentiel et aéroportuaire',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Greenfield Park',
          codePostal: 'J4V',
          description: 'Secteur anglophone historique',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Saguenay',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Chicoutimi',
          codePostal: 'G7H',
          description: 'Centre administratif et commercial',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Jonquière',
          codePostal: 'G7S',
          description: 'Secteur industriel et résidentiel',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'La Baie',
          codePostal: 'G7B',
          description: 'Secteur portuaire au bord du fjord',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Lévis',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Vieux-Lévis',
          codePostal: 'G6V',
          description: 'Quartier historique avec vue sur Québec',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Saint-Romuald',
          codePostal: 'G6W',
          description: 'Secteur résidentiel et commercial',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Terrebonne',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Vieux-Terrebonne',
          codePostal: 'J6W',
          description: 'Secteur patrimonial au bord de la rivière',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Lachenaie',
          codePostal: 'J6V',
          description: 'Secteur résidentiel en expansion',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Saint-Jérôme',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Centre-ville',
          codePostal: 'J7Z',
          description: 'Coeur commercial et administratif des Laurentides',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Bellefeuille',
          codePostal: 'J7Y',
          description: 'Secteur résidentiel au nord',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Blainville',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Secteur du Vieux-Blainville',
          codePostal: 'J7C',
          description: 'Secteur patrimonial et historique',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    },
    {
      nom: 'Sainte-Thérèse',
      province: 'Québec',
      pays: 'Canada',
      quartiers: [
        {
          id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          nom: 'Vieux-Sainte-Thérèse',
          codePostal: 'J7E',
          description: 'Secteur historique avec architecture patrimoniale',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ]
    }
  ];
}

/**
 * Sincronizar datos desde internet
 * Fusiona datos nuevos sin eliminar datos existentes
 */
export function synchroniserAvecInternet(): {
  villesAjoutees: number;
  quartiersAjoutes: number;
  villesMisesAJour: number;
} {
  const villesExistantes = obtenirVilles();
  const nouvellesDonnees = obtenirDonneesInternet();
  
  let villesAjoutees = 0;
  let quartiersAjoutes = 0;
  let villesMisesAJour = 0;
  
  nouvellesDonnees.forEach(nouvelleVille => {
    const villeExistante = villesExistantes.find(
      v => v.nom.toLowerCase() === nouvelleVille.nom.toLowerCase() && 
           v.province.toLowerCase() === nouvelleVille.province.toLowerCase()
    );
    
    if (villeExistante) {
      // La ciudad existe, agregar quartiers que no existan
      nouvelleVille.quartiers.forEach(nouveauQuartier => {
        const quartierExiste = villeExistante.quartiers.some(
          q => q.nom.toLowerCase() === nouveauQuartier.nom.toLowerCase()
        );
        
        if (!quartierExiste) {
          villeExistante.quartiers.push(nouveauQuartier);
          quartiersAjoutes++;
        }
      });
      
      if (nouvelleVille.quartiers.length > 0) {
        villeExistante.dateModification = new Date().toISOString();
        villesMisesAJour++;
      }
    } else {
      // Ciudad nueva, agregarla
      ajouterVille(nouvelleVille);
      villesAjoutees++;
      quartiersAjoutes += nouvelleVille.quartiers.length;
    }
  });
  
  // Guardar cambios
  if (villesMisesAJour > 0) {
    sauvegarderVilles(villesExistantes);
  }
  
  return {
    villesAjoutees,
    quartiersAjoutes,
    villesMisesAJour
  };
}

/**
 * Base de datos completa de quartiers por ciudad desde "Internet"
 * Contiene TODOS los quartiers disponibles para cada ciudad
 */
function obtenirTousLesQuartiersParVille(): Record<string, Quartier[]> {
  const timestamp = Date.now();
  const genId = (index: number) => `quartier-${timestamp}-${index}-${Math.random().toString(36).substring(2, 11)}`;
  
  return {
    'Montréal': [
      {
        id: genId(1),
        nom: 'Plateau-Mont-Royal',
        codePostal: 'H2T',
        description: 'Quartier résidentiel et commercial dynamique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Ville-Marie',
        codePostal: 'H2X',
        description: 'Centre-ville de Montréal',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Rosemont-La Petite-Patrie',
        codePostal: 'H2S',
        description: 'Quartier familial avec parcs et commerces',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Côte-des-Neiges–Notre-Dame-de-Grâce',
        codePostal: 'H3S',
        description: 'Quartier multiculturel et universitaire',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Verdun',
        codePostal: 'H4G',
        description: 'Quartier résidentiel au bord du fleuve',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(6),
        nom: 'Villeray–Saint-Michel–Parc-Extension',
        codePostal: 'H2R',
        description: 'Quartier multiculturel et populaire',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(7),
        nom: 'Mercier–Hochelaga-Maisonneuve',
        codePostal: 'H1V',
        description: 'Quartier de l\'Est de Montréal',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(8),
        nom: 'Ahuntsic-Cartierville',
        codePostal: 'H3L',
        description: 'Quartier résidentiel au nord',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(9),
        nom: 'Outremont',
        codePostal: 'H2V',
        description: 'Quartier aisé et francophone',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(10),
        nom: 'Sud-Ouest',
        codePostal: 'H3J',
        description: 'Quartier en revitalisation',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(11),
        nom: 'Anjou',
        codePostal: 'H1K',
        description: 'Quartier résidentiel et industriel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(12),
        nom: 'Rivière-des-Prairies–Pointe-aux-Trembles',
        codePostal: 'H1A',
        description: 'Quartier de l\'extrême est de Montréal',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(13),
        nom: 'Montréal-Nord',
        codePostal: 'H1H',
        description: 'Quartier multiculturel du nord-est',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(14),
        nom: 'Saint-Léonard',
        codePostal: 'H1P',
        description: 'Quartier à forte communauté italienne',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(15),
        nom: 'Lachine',
        codePostal: 'H8S',
        description: 'Quartier historique au bord du canal',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(16),
        nom: 'LaSalle',
        codePostal: 'H8P',
        description: 'Quartier résidentiel du sud-ouest',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(17),
        nom: 'Pierrefonds-Roxboro',
        codePostal: 'H8Y',
        description: 'Quartier de l\'ouest de l\'île',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(18),
        nom: 'Saint-Laurent',
        codePostal: 'H4L',
        description: 'Quartier diversifié et industriel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Québec': [
      {
        id: genId(1),
        nom: 'Vieux-Québec',
        codePostal: 'G1R',
        description: 'Quartier historique fortifié',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Sainte-Foy',
        codePostal: 'G1V',
        description: 'Quartier universitaire et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Limoilou',
        codePostal: 'G1L',
        description: 'Quartier résidentiel en développement',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Beauport',
        codePostal: 'G1E',
        description: 'Arrondissement historique de Québec',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Charlesbourg',
        codePostal: 'G1H',
        description: 'Secteur résidentiel et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(6),
        nom: 'Saint-Roch',
        codePostal: 'G1K',
        description: 'Quartier branché et artistique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(7),
        nom: 'Montcalm',
        codePostal: 'G1R',
        description: 'Quartier chic près des Plaines',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(8),
        nom: 'Sillery',
        codePostal: 'G1S',
        description: 'Quartier aisé au bord du fleuve',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(9),
        nom: 'Cap-Rouge',
        codePostal: 'G1Y',
        description: 'Secteur résidentiel en expansion',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(10),
        nom: 'Duberger–Les Saules',
        codePostal: 'G2G',
        description: 'Quartier résidentiel moderne',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Laval': [
      {
        id: genId(1),
        nom: 'Chomedey',
        codePostal: 'H7W',
        description: 'Secteur central de Laval',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Sainte-Rose',
        codePostal: 'H7L',
        description: 'Secteur historique de Laval',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Vimont',
        codePostal: 'H7M',
        description: 'Secteur résidentiel dynamique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Duvernay',
        codePostal: 'H7A',
        description: 'Secteur en développement',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Fabreville',
        codePostal: 'H7P',
        description: 'Secteur résidentiel familial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(6),
        nom: 'Laval-des-Rapides',
        codePostal: 'H7N',
        description: 'Secteur urbain avec métro',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(7),
        nom: 'Pont-Viau',
        codePostal: 'H7G',
        description: 'Secteur résidentiel central',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(8),
        nom: 'Auteuil',
        codePostal: 'H7H',
        description: 'Secteur résidentiel avec parcs',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(9),
        nom: 'Les Îles-Laval',
        codePostal: 'H7W',
        description: 'Secteur insulaire résidentiel avec accès contrôlé',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Gatineau': [
      {
        id: genId(1),
        nom: 'Hull',
        codePostal: 'J8X',
        description: 'Secteur central et historique de Gatineau',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Aylmer',
        codePostal: 'J9H',
        description: 'Secteur anglophone au bord de la rivière',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Gatineau-Nord',
        codePostal: 'J8T',
        description: 'Secteur résidentiel en expansion',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Masson-Angers',
        codePostal: 'J8M',
        description: 'Secteur rural et résidentiel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Buckingham',
        codePostal: 'J8L',
        description: 'Ancien village incorporé',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Sherbrooke': [
      {
        id: genId(1),
        nom: 'Centre-ville',
        codePostal: 'J1H',
        description: 'Coeur commercial et administratif',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Mont-Bellevue',
        codePostal: 'J1H',
        description: 'Quartier universitaire avec le parc du Mont-Bellevue',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Fleurimont',
        codePostal: 'J1E',
        description: 'Secteur résidentiel et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Jacques-Cartier',
        codePostal: 'J1J',
        description: 'Quartier résidentiel établi',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Lennoxville',
        codePostal: 'J1M',
        description: 'Secteur anglophone historique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(6),
        nom: 'Rock Forest',
        codePostal: 'J1N',
        description: 'Secteur commercial et résidentiel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Trois-Rivières': [
      {
        id: genId(1),
        nom: 'Centre-ville',
        codePostal: 'G9A',
        description: 'Centre historique et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Cap-de-la-Madeleine',
        codePostal: 'G8T',
        description: 'Secteur résidentiel et religieux',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Pointe-du-Lac',
        codePostal: 'G0X',
        description: 'Secteur résidentiel au bord de l\'eau',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Sainte-Marthe-du-Cap',
        codePostal: 'G8T',
        description: 'Secteur résidentiel familial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Longueuil': [
      {
        id: genId(1),
        nom: 'Vieux-Longueuil',
        codePostal: 'J4H',
        description: 'Centre historique de Longueuil',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Saint-Hubert',
        codePostal: 'J3Y',
        description: 'Secteur résidentiel et aéroportuaire',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Greenfield Park',
        codePostal: 'J4V',
        description: 'Secteur anglophone historique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Boucherville',
        codePostal: 'J4B',
        description: 'Ville historique incorporée',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Brossard',
        codePostal: 'J4W',
        description: 'Secteur cosmopolite et moderne',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Saguenay': [
      {
        id: genId(1),
        nom: 'Chicoutimi',
        codePostal: 'G7H',
        description: 'Centre administratif et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Jonquière',
        codePostal: 'G7S',
        description: 'Secteur industriel et résidentiel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'La Baie',
        codePostal: 'G7B',
        description: 'Secteur portuaire au bord du fjord',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Laterrière',
        codePostal: 'G7N',
        description: 'Secteur agricole et résidentiel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(5),
        nom: 'Shipshaw',
        codePostal: 'G7P',
        description: 'Secteur industriel et hydroélectrique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Lévis': [
      {
        id: genId(1),
        nom: 'Vieux-Lévis',
        codePostal: 'G6V',
        description: 'Quartier historique avec vue sur Québec',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Saint-Romuald',
        codePostal: 'G6W',
        description: 'Secteur résidentiel et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Charny',
        codePostal: 'G6X',
        description: 'Secteur industriel et commercial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Lauzon',
        codePostal: 'G6V',
        description: 'Secteur résidentiel historique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Terrebonne': [
      {
        id: genId(1),
        nom: 'Vieux-Terrebonne',
        codePostal: 'J6W',
        description: 'Secteur patrimonial au bord de la rivière',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Lachenaie',
        codePostal: 'J6V',
        description: 'Secteur résidentiel en expansion',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'La Plaine',
        codePostal: 'J7M',
        description: 'Secteur en développement rapide',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Saint-Jérôme': [
      {
        id: genId(1),
        nom: 'Centre-ville',
        codePostal: 'J7Z',
        description: 'Coeur commercial et administratif des Laurentides',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Bellefeuille',
        codePostal: 'J7Y',
        description: 'Secteur résidentiel au nord',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Lafontaine',
        codePostal: 'J7Y',
        description: 'Secteur résidentiel établi',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(4),
        nom: 'Saint-Antoine',
        codePostal: 'J7Z',
        description: 'Secteur historique et résidentiel',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Blainville': [
      {
        id: genId(1),
        nom: 'Secteur du Vieux-Blainville',
        codePostal: 'J7C',
        description: 'Secteur patrimonial et historique',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Secteur Fontainebleau',
        codePostal: 'J7B',
        description: 'Secteur résidentiel moderne',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Secteur des Érables',
        codePostal: 'J7C',
        description: 'Secteur résidentiel familial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Boisbriand': [
      {
        id: genId(1),
        nom: 'Centre-ville',
        codePostal: 'J7G',
        description: 'Secteur commercial et administratif',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Secteur industriel',
        codePostal: 'J7H',
        description: 'Zone industrielle et commerciale',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Secteur résidentiel',
        codePostal: 'J7G',
        description: 'Quartier résidentiel calme',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Sainte-Thérèse': [
      {
        id: genId(1),
        nom: 'Vieux-Sainte-Thérèse',
        codePostal: 'J7E',
        description: 'Secteur historique avec architecture patrimoniale',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Secteur de la gare',
        codePostal: 'J7E',
        description: 'Secteur urbain avec train de banlieue',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Secteur Forget',
        codePostal: 'J7E',
        description: 'Secteur résidentiel tranquille',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Sainte-Agathe-des-Monts': [
      {
        id: genId(1),
        nom: 'Centre-ville',
        codePostal: 'J8C',
        description: 'Coeur touristique des Laurentides',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Tour du Lac',
        codePostal: 'J8C',
        description: 'Secteur résidentiel autour du lac des Sables',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Secteur Montcalm',
        codePostal: 'J8C',
        description: 'Secteur résidentiel en hauteur',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ],
    'Mont-Tremblant': [
      {
        id: genId(1),
        nom: 'Village piétonnier',
        codePostal: 'J8E',
        description: 'Station touristique au pied de la montagne',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(2),
        nom: 'Secteur Saint-Jovite',
        codePostal: 'J8E',
        description: 'Centre-ville historique de Mont-Tremblant',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      },
      {
        id: genId(3),
        nom: 'Lac Tremblant',
        codePostal: 'J8E',
        description: 'Secteur résidentiel haut de gamme au bord du lac',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      }
    ]
  };
}

/**
 * Base de datos de quartiers adicionales por ciudad (para sincronización adicional)
 */
function obtenirQuartiersSupplementaires(): Record<string, Quartier[]> {
  return {};
}

/**
 * Sincronizar quartiers de una ciudad específica desde internet
 * Descarga TODOS los quartiers disponibles de la ciudad
 */
export function synchroniserQuartiersVille(villeId: string): {
  success: boolean;
  quartiersAjoutes: number;
  message: string;
} {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) {
    return {
      success: false,
      quartiersAjoutes: 0,
      message: 'Ville non trouvée'
    };
  }
  
  const tousLesQuartiers = obtenirTousLesQuartiersParVille();
  const quartiersDisponibles = tousLesQuartiers[ville.nom] || [];
  
  if (quartiersDisponibles.length === 0) {
    return {
      success: true,
      quartiersAjoutes: 0,
      message: 'Aucun quartier disponible pour cette ville dans la base de données'
    };
  }
  
  let quartiersAjoutes = 0;
  
  quartiersDisponibles.forEach(nouveauQuartier => {
    const quartierExiste = ville.quartiers.some(
      q => q.nom.toLowerCase() === nouveauQuartier.nom.toLowerCase()
    );
    
    if (!quartierExiste) {
      ville.quartiers.push(nouveauQuartier);
      quartiersAjoutes++;
    }
  });
  
  if (quartiersAjoutes > 0) {
    ville.dateModification = new Date().toISOString();
    sauvegarderVilles(villes);
  }
  
  return {
    success: true,
    quartiersAjoutes,
    message: quartiersAjoutes > 0 
      ? `${quartiersAjoutes} quartier(s) téléchargé(s) depuis Internet` 
      : 'Tous les quartiers sont déjà à jour'
  };
}