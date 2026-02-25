// ===== MODO PRODUCCIÓN: VOLUNTARIOS DE EJEMPLO DESACTIVADOS =====
// Datos de voluntarios - vacío para producción
import { JourDisponible } from '../components/shared/SelecteurJoursDisponibles';

export interface Benevole {
  id: string;
  code: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  departement: string;
  departementId: string;
  statut: 'actif' | 'inactif' | 'en attente';
  dateInscription: string;
  adresse: string;
  codePostal: string;
  competences: string[];
  disponibilite: string;
  joursDisponibles: JourDisponible[];
  notes?: string;
  heuresEffectuees?: number;
  lastUpdate?: string;
}

// Array vacío - sin datos de ejemplo para producción
export const benevolesInitialData: Benevole[] = [];