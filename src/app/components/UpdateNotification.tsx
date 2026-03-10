/**
 * Componente de Notificación de Actualización
 * 
 * Muestra una notificación toast cuando hay una nueva versión disponible
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, X, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  startUpdateChecker, 
  applyUpdate, 
  markAsNotified, 
  wasNotified,
  getVersionInfo 
} from '../utils/updateNotifier';

export function UpdateNotification() {
  const { t } = useTranslation();
  const [hasUpdate, setHasUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    // Iniciar el verificador de actualizaciones
    const stopChecker = startUpdateChecker((newVer, currentVer) => {
      // Solo notificar si no se ha notificado antes de esta versión
      if (!wasNotified(newVer)) {
        setHasUpdate(true);
        setNewVersion(newVer);
        showUpdateNotification(newVer);
        markAsNotified(newVer);
      }
    });

    // Limpiar al desmontar
    return () => {
      stopChecker();
    };
  }, []);

  const showUpdateNotification = (version: string) => {
    // Notificación con sonner
    toast.custom(
      (toastId) => (
        <div className="bg-[#1a4d7a] text-white rounded-lg shadow-2xl border border-[#2d9561] p-4 min-w-[350px] max-w-[450px]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#2d9561] rounded-full p-2">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">
                🎉 {t('updateAvailable', 'Nouvelle version disponible!')}
              </div>
              <div className="text-sm text-white/90 mb-3">
                {t('updateMessage', 'Une mise à jour de l\'application est prête. Rechargez pour profiter des nouvelles fonctionnalités.')}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.dismiss(toastId);
                    applyUpdate();
                  }}
                  className="flex items-center gap-2 bg-[#2d9561] hover:bg-[#248549] text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('reloadNow', 'Recharger maintenant')}
                </button>
                
                <button
                  onClick={() => toast.dismiss(toastId)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  {t('later', 'Plus tard')}
                </button>
              </div>
              
              <div className="text-xs text-white/60 mt-2">
                <Info className="w-3 h-3 inline mr-1" />
                {t('autoRefresh', 'La page se rechargera automatiquement au prochain chargement')}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity, // No se cierra automáticamente
        position: 'top-center',
        dismissible: true
      }
    );

    // También mostrar en consola
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   🎉 NOUVELLE VERSION DISPONIBLE!                    ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📱 Une nouvelle version est disponible');
    console.log('🔄 Rechargez la page pour mettre à jour');
    console.log('');
    console.log('💡 Pour recharger automatiquement:');
    console.log('   updateNotifier.apply()');
    console.log('');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
  };

  // Este componente no renderiza nada visualmente
  // La notificación se muestra via toast
  return null;
}

/**
 * Hook para verificar actualizaciones manualmente
 */
export function useUpdateCheck() {
  const [checking, setChecking] = useState(false);

  const checkForUpdates = async () => {
    setChecking(true);
    
    try {
      const { checkNow } = await import('../utils/updateNotifier');
      const hasUpdate = await checkNow();
      
      if (!hasUpdate) {
        toast.success('✅ L\'application est à jour', {
          description: 'Vous utilisez la dernière version',
          duration: 3000
        });
      }
    } catch (error) {
      toast.error('❌ Erreur lors de la vérification', {
        description: 'Impossible de vérifier les mises à jour',
        duration: 3000
      });
    } finally {
      setChecking(false);
    }
  };

  return { checkForUpdates, checking };
}
