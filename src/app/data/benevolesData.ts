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

// Bénévoles de ejemplo para demostración
export const benevolesInitialData: Benevole[] = [
  {
    id: '1',
    code: 'BEN-2026-001',
    prenom: 'Sophie',
    nom: 'Tremblay',
    telephone: '(514) 555-0101',
    email: 'sophie.tremblay@example.com',
    departement: 'Distribution',
    departementId: 'distribution',
    statut: 'en attente',
    dateInscription: '2026-03-05',
    adresse: '123 Rue des Érables, Laval, QC',
    codePostal: 'H7N 2K5',
    competences: ['Service à la clientèle', 'Manutention', 'Bilingue FR/EN'],
    disponibilite: 'Fin de semaine',
    joursDisponibles: [
      { jour: 'Samedi', matin: true, apresmidi: true, soir: false },
      { jour: 'Dimanche', matin: true, apresmidi: false, soir: false }
    ],
    notes: 'Nouvelle bénévole motivée. Disponible immédiatement. Préfère travailler avec les aliments non périssables.',
    heuresEffectuees: 0,
    lastUpdate: '2026-03-05'
  },
  {
    id: '2',
    code: 'BEN-2026-002',
    prenom: 'Marc',
    nom: 'Lefebvre',
    telephone: '(450) 555-0202',
    email: 'marc.lefebvre@example.com',
    departement: 'Collecte & Logistique',
    departementId: 'collecte-logistique',
    statut: 'en attente',
    dateInscription: '2026-03-05',
    adresse: '456 Boulevard Cartier, Laval, QC',
    codePostal: 'H7M 1R8',
    competences: ['Conduite - Permis classe 5', 'Manutention lourde', 'Organisation'],
    disponibilite: 'Matins en semaine',
    joursDisponibles: [
      { jour: 'Lundi', matin: true, apresmidi: false, soir: false },
      { jour: 'Mercredi', matin: true, apresmidi: false, soir: false },
      { jour: 'Vendredi', matin: true, apresmidi: false, soir: false }
    ],
    notes: 'Expérience en logistique. Possède un permis de conduire valide et peut aider au transport. Retraité actif cherchant à contribuer.',
    heuresEffectuees: 0,
    lastUpdate: '2026-03-05'
  }
];