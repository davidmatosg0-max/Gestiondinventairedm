import React, { useState } from 'react';
import { Download, Upload, Database, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { backupLocalStorage, restoreLocalStorage, downloadBackup, inspectLocalStorage } from '../utils/dataMigration';
import { AutoBackupConfig } from './backup/AutoBackupConfig';

export function BackupManager() {
  const [backupInfo, setBackupInfo] = useState<string>('');

  const handleDownloadBackup = () => {
    try {
      downloadBackup();
      toast.success('Backup téléchargé avec succès', {
        description: 'Conservez ce fichier en lieu sûr'
      });
    } catch (error) {
      toast.error('Erreur lors du téléchargement du backup');
      console.error(error);
    }
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (confirm('⚠️ ATTENTION: Cette opération remplacera toutes les données actuelles. Voulez-vous continuer?')) {
        const success = restoreLocalStorage(content);
        
        if (success) {
          toast.success('Données restaurées avec succès', {
            description: 'La page va se recharger...'
          });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error('Erreur lors de la restauration des données');
        }
      }
    };
    reader.readAsText(file);
    
    // Reset el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  const handleInspect = () => {
    const backup = backupLocalStorage();
    setBackupInfo(backup);
    inspectLocalStorage(); // También muestra en consola
    toast.info('Inspection complète affichée dans la console');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Gestion des Sauvegardes
            </h3>
            <p className="text-sm text-gray-600">
              Sauvegardez et restaurez vos données
            </p>
          </div>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">Importante</p>
              <p className="text-blue-800 mb-2">
                Les données sont stockées dans le navigateur (localStorage). Elles persistent entre les sessions mais peuvent être perdues si:
              </p>
              <ul className="text-blue-700 space-y-1 ml-4">
                <li>• Vous videz le cache du navigateur</li>
                <li>• Vous utilisez un autre navigateur ou appareil</li>
                <li>• Les données du navigateur sont supprimées</li>
              </ul>
              <p className="text-blue-800 mt-2 font-semibold">
                💡 Recommandation: Téléchargez régulièrement un backup de sécurité
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Descargar Backup */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Télécharger Backup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Créez une copie de toutes vos données au format JSON
            </p>
            <Button
              onClick={handleDownloadBackup}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>

          {/* Restaurar Backup */}
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">Restaurer Backup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Restaurez vos données depuis un fichier de sauvegarde
            </p>
            <label htmlFor="restore-backup" className="cursor-pointer">
              <Button
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => document.getElementById('restore-backup')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Restaurer
              </Button>
            </label>
            <input
              id="restore-backup"
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </div>
        </div>

        {/* Inspeccionar datos */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Inspecter les Données</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Consultez la taille et le contenu de votre localStorage
          </p>
          <Button
            onClick={handleInspect}
            variant="outline"
            className="w-full"
          >
            <Info className="w-4 h-4 mr-2" />
            Inspecter (voir console)
          </Button>
        </div>

        {/* Advertencias */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 mb-1">Avertissement</p>
              <ul className="text-yellow-800 space-y-1">
                <li>• Ne partagez jamais votre fichier de backup (contient des données sensibles)</li>
                <li>• La restauration remplace TOUTES les données actuelles</li>
                <li>• Assurez-vous d'avoir un backup récent avant de restaurer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Características de localStorage */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Qu'est-ce qui est sauvegardé automatiquement?
          </h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Utilisateurs et sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Inventaire et produits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Commandes et organismes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Offres et demandes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Transport et véhicules</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Configurations système</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Départements et contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Bénévoles et recrutement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de Automatización */}
      <AutoBackupConfig />
    </div>
  );
}