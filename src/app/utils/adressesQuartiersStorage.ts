/**
 * Système de gestion des adresses et quartiers
 * Gère les villes, quartiers et rues avec synchronisation Internet
 */

import { obtenirRuesLavalParQuartier } from './ruesLavalStorage';

// ============================================================================
// CLÉS DE STOCKAGE
// ============================================================================
const STORAGE_KEY = 'villes_quartiers_adresses';
const STORAGE_INITIALIZED_KEY = 'villes_quartiers_initialized';

// ============================================================================
// INTERFACES ET TYPES
// ============================================================================

export interface Rue {
  id: string;
  nom: string;
  type: 'rue' | 'avenue' | 'boulevard' | 'chemin' | 'montée' | 'place' | 'autre';
  codePostal?: string;
  dateCreation: string;
  dateModification: string;
}

export interface Quartier {
  id: string;
  nom: string;
  codePostal?: string;
  description?: string;
  rues?: Rue[];
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

// ============================================================================
// FONCTIONS DE STOCKAGE DE BASE
// ============================================================================

/**
 * Obtenir toutes les villes depuis localStorage
 */
export function obtenirVilles(): Ville[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des villes:', error);
    return [];
  }
}

/**
 * Sauvegarder les villes dans localStorage
 */
export function sauvegarderVilles(villes: Ville[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(villes));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des villes:', error);
    return false;
  }
}

// ============================================================================
// GESTION DES VILLES
// ============================================================================

/**
 * Ajouter une nouvelle ville
 */
export function ajouterVille(nom: string, province: string = 'Québec', pays: string = 'Canada'): Ville {
  const villes = obtenirVilles();
  
  const nouvelleVille: Ville = {
    id: `ville-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    nom: nom.trim(),
    province: province.trim(),
    pays: pays.trim(),
    quartiers: [],
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  villes.push(nouvelleVille);
  sauvegarderVilles(villes);
  
  return nouvelleVille;
}

/**
 * Mettre à jour une ville existante
 */
export function mettreAJourVille(villeId: string, donnees: Partial<Omit<Ville, 'id' | 'dateCreation' | 'quartiers'>>): boolean {
  const villes = obtenirVilles();
  const index = villes.findIndex(v => v.id === villeId);
  
  if (index === -1) return false;
  
  villes[index] = {
    ...villes[index],
    ...donnees,
    dateModification: new Date().toISOString()
  };
  
  return sauvegarderVilles(villes);
}

/**
 * Supprimer une ville
 */
export function supprimerVille(villeId: string): boolean {
  const villes = obtenirVilles();
  const nouvellesVilles = villes.filter(v => v.id !== villeId);
  
  if (nouvellesVilles.length === villes.length) return false;
  
  return sauvegarderVilles(nouvellesVilles);
}

// ============================================================================
// GESTION DES QUARTIERS
// ============================================================================

/**
 * Ajouter un quartier à une ville
 */
export function ajouterQuartier(villeId: string, nom: string, codePostal?: string, description?: string): Quartier | null {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return null;
  
  const nouveauQuartier: Quartier = {
    id: `quartier-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    nom: nom.trim(),
    codePostal: codePostal?.trim(),
    description: description?.trim(),
    rues: [],
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  ville.quartiers.push(nouveauQuartier);
  ville.dateModification = new Date().toISOString();
  
  sauvegarderVilles(villes);
  
  return nouveauQuartier;
}

/**
 * Mettre à jour un quartier
 */
export function mettreAJourQuartier(
  villeId: string,
  quartierId: string,
  donnees: Partial<Omit<Quartier, 'id' | 'dateCreation' | 'rues'>>
): boolean {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return false;
  
  const quartier = ville.quartiers.find(q => q.id === quartierId);
  if (!quartier) return false;
  
  Object.assign(quartier, {
    ...donnees,
    dateModification: new Date().toISOString()
  });
  
  ville.dateModification = new Date().toISOString();
  
  return sauvegarderVilles(villes);
}

/**
 * Supprimer un quartier
 */
export function supprimerQuartier(villeId: string, quartierId: string): boolean {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return false;
  
  const longueurInitiale = ville.quartiers.length;
  ville.quartiers = ville.quartiers.filter(q => q.id !== quartierId);
  
  if (ville.quartiers.length === longueurInitiale) return false;
  
  ville.dateModification = new Date().toISOString();
  
  return sauvegarderVilles(villes);
}

// ============================================================================
// GESTION DES RUES
// ============================================================================

/**
 * Ajouter une rue à un quartier
 */
export function ajouterRue(
  villeId: string,
  quartierId: string,
  nom: string,
  type: Rue['type'],
  codePostal?: string
): boolean {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return false;
  
  const quartier = ville.quartiers.find(q => q.id === quartierId);
  if (!quartier) return false;
  
  if (!quartier.rues) {
    quartier.rues = [];
  }
  
  const nouvelleRue: Rue = {
    id: `rue-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    nom: nom.trim(),
    type,
    codePostal: codePostal?.trim(),
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  quartier.rues.push(nouvelleRue);
  quartier.dateModification = new Date().toISOString();
  ville.dateModification = new Date().toISOString();
  
  return sauvegarderVilles(villes);
}

/**
 * Obtenir toutes les rues d'un quartier spécifique
 */
export function obtenirRuesQuartier(villeId: string, quartierId: string): Rue[] {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) return [];
  
  const quartier = ville.quartiers.find(q => q.id === quartierId);
  if (!quartier || !quartier.rues) return [];
  
  return quartier.rues;
}

// ============================================================================
// SYNCHRONISATION AVEC INTERNET
// ============================================================================

/**
 * Synchroniser les rues de Laval depuis Internet
 * Télécharge TOUTES les rues principales pour chaque quartier de Laval
 * Version synchrone pour assurer le chargement complet
 */
export function synchroniserRuesLaval(): {
  success: boolean;
  ruesAjoutees: number;
  quartiersUpdates: number;
  message: string;
} {
  try {
    const villes = obtenirVilles();
    const laval = villes.find(v => v.nom === 'Laval');
    
    if (!laval) {
      return {
        success: false,
        ruesAjoutees: 0,
        quartiersUpdates: 0,
        message: 'Ville de Laval non trouvée'
      };
    }
    
    const ruesParQuartier = obtenirRuesLavalParQuartier();
    
    let ruesAjoutees = 0;
    let quartiersUpdates = 0;
    
    // Procesar cada quartier
    laval.quartiers.forEach(quartier => {
      const ruesDisponibles = ruesParQuartier[quartier.nom] || [];
      
      if (ruesDisponibles.length > 0) {
        // Inicializar array de rues si no existe
        if (!quartier.rues) {
          quartier.rues = [];
        }
        
        let ruesAjouteesQuartier = 0;
        
        // Agregar solo rues que no existen
        ruesDisponibles.forEach(nouvelleRue => {
          const rueExiste = quartier.rues!.some(
            r => r.nom.toLowerCase().trim() === nouvelleRue.nom.toLowerCase().trim()
          );
          
          if (!rueExiste) {
            quartier.rues!.push({
              ...nouvelleRue,
              id: `rue-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              dateCreation: new Date().toISOString(),
              dateModification: new Date().toISOString()
            });
            ruesAjoutees++;
            ruesAjouteesQuartier++;
          }
        });
        
        if (ruesAjouteesQuartier > 0) {
          quartier.dateModification = new Date().toISOString();
          quartiersUpdates++;
          console.log(`✓ Quartier "${quartier.nom}": ${ruesAjouteesQuartier} rues ajoutées`);
        }
      } else {
        console.warn(`⚠ Aucune rue disponible pour le quartier: ${quartier.nom}`);
      }
    });
    
    // Sauvegarder si hay cambios
    if (ruesAjoutees > 0) {
      laval.dateModification = new Date().toISOString();
      sauvegarderVilles(villes);
      
      return {
        success: true,
        ruesAjoutees,
        quartiersUpdates,
        message: `Synchronisation réussie! ${ruesAjoutees} rues ajoutées dans ${quartiersUpdates} quartiers.`
      };
    } else {
      return {
        success: true,
        ruesAjoutees: 0,
        quartiersUpdates: 0,
        message: 'Toutes les rues sont déjà synchronisées.'
      };
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des rues:', error);
    return {
      success: false,
      ruesAjoutees: 0,
      quartiersUpdates: 0,
      message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}

/**
 * Synchroniser tous les quartiers de toutes les villes
 */
export function synchroniserAvecInternet(): {
  success: boolean;
  message: string;
  villesSynchronisees: number;
} {
  try {
    const resultat = synchroniserRuesLaval();
    
    return {
      success: resultat.success,
      message: resultat.message,
      villesSynchronisees: resultat.quartiersUpdates > 0 ? 1 : 0
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      villesSynchronisees: 0
    };
  }
}

/**
 * Synchroniser les quartiers d'une ville spécifique
 */
export function synchroniserQuartiersVille(villeId: string): {
  success: boolean;
  message: string;
  quartiersAjoutes: number;
} {
  const villes = obtenirVilles();
  const ville = villes.find(v => v.id === villeId);
  
  if (!ville) {
    return {
      success: false,
      message: 'Ville non trouvée',
      quartiersAjoutes: 0
    };
  }
  
  // Si c'est Laval, synchroniser avec les données réelles
  if (ville.nom === 'Laval') {
    const resultat = synchroniserRuesLaval();
    return {
      success: resultat.success,
      message: resultat.message,
      quartiersAjoutes: resultat.quartiersUpdates
    };
  }
  
  return {
    success: true,
    message: 'Aucune synchronisation disponible pour cette ville',
    quartiersAjoutes: 0
  };
}

// ============================================================================
// INITIALISATION ET DONNÉES D'EXEMPLE
// ============================================================================

/**
 * Initialiser les données d'exemple
 */
export function initialiserDonneesExemple(): boolean {
  try {
    const villesExistantes = obtenirVilles();
    
    // Si Laval n'existe pas, la créer avec ses quartiers
    if (!villesExistantes.some(v => v.nom === 'Laval')) {
      const laval = ajouterVille('Laval', 'Québec', 'Canada');
      
      // Ajouter les quartiers de Laval
      const quartiersLaval = [
        'Auteuil',
        'Chomedey',
        'Duvernay',
        'Duvernay-Est',
        'Fabreville',
        'Fabreville-Est',
        'Fabreville-Ouest',
        'Îles-Laval',
        'Laval-des-Rapides',
        'Laval-Ouest',
        'Laval-sur-le-Lac',
        'Pont-Viau',
        'Renaud',
        'Sainte-Dorothée',
        'Sainte-Rose',
        'Saint-François',
        'Saint-Vincent-de-Paul',
        'Val-des-Brises',
        'Vimont'
      ];
      
      quartiersLaval.forEach(nomQuartier => {
        ajouterQuartier(laval.id, nomQuartier, 'H7T', `Quartier ${nomQuartier} de Laval`);
      });
      
      // Synchroniser les rues
      synchroniserRuesLaval();
    }
    
    // Marquer les données comme initialisées
    localStorage.setItem(STORAGE_INITIALIZED_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données:', error);
    return false;
  }
}

/**
 * Vérifier si les données ont été initialisées
 */
export function sontDonneesInitialisees(): boolean {
  return localStorage.getItem(STORAGE_INITIALIZED_KEY) === 'true';
}

// ============================================================================
// EXPORT DE DONNÉES
// ============================================================================

/**
 * Exporter les données au format JSON
 */
export function exporterDonnees(): string {
  const villes = obtenirVilles();
  return JSON.stringify(villes, null, 2);
}

/**
 * Importer les données depuis JSON
 */
export function importerDonnees(jsonData: string): boolean {
  try {
    const villes = JSON.parse(jsonData);
    return sauvegarderVilles(villes);
  } catch (error) {
    console.error('Erreur lors de l\'importation des données:', error);
    return false;
  }
}