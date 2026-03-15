/**
 * Configuración de Versión de la Aplicación
 * Actualizar esta información cada vez que se lance una nueva versión
 */

export const APP_VERSION = {
  version: '2.5.3',
  releaseDate: '2026-03-15',
  buildNumber: 253,
  environment: 'production' as 'development' | 'staging' | 'production'
};

export interface ReleaseNote {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  title: {
    fr: string;
    es: string;
    en: string;
    ar: string;
  };
  description: {
    fr: string;
    es: string;
    en: string;
    ar: string;
  };
  changes: {
    type: 'feature' | 'improvement' | 'bugfix' | 'security';
    description: {
      fr: string;
      es: string;
      en: string;
      ar: string;
    };
  }[];
  breaking?: boolean;
  critical?: boolean;
}

/**
 * Historial de Versiones (últimas 5 versiones)
 * Mantener ordenadas de más reciente a más antigua
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2.5.3',
    date: '2026-03-15',
    type: 'minor',
    title: {
      fr: 'Système de Notifications de Mises à Jour',
      es: 'Sistema de Notificaciones de Actualizaciones',
      en: 'Update Notification System',
      ar: 'نظام إشعارات التحديثات'
    },
    description: {
      fr: 'Ajout d\'un système intelligent de notifications qui détecte et explique toutes les mises à jour en temps réel, incluant les changements de version de l\'application.',
      es: 'Se agregó un sistema inteligente de notificaciones que detecta y explica todas las actualizaciones en tiempo real, incluyendo cambios de versión de la aplicación.',
      en: 'Added an intelligent notification system that detects and explains all updates in real-time, including application version changes.',
      ar: 'تمت إضافة نظام إشعارات ذكي يكتشف ويشرح جميع التحديثات في الوقت الفعلي، بما في ذلك تغييرات إصدار التطبيق.'
    },
    changes: [
      {
        type: 'feature',
        description: {
          fr: '🔔 Notifications automatiques pour toutes les modifications de données (entrées, commandes, organismes, etc.)',
          es: '🔔 Notificaciones automáticas para todas las modificaciones de datos (entradas, comandas, organismos, etc.)',
          en: '🔔 Automatic notifications for all data modifications (entries, orders, organisms, etc.)',
          ar: '🔔 إشعارات تلقائية لجميع تعديلات البيانات (الإدخالات، الطلبات، المنظمات، إلخ)'
        }
      },
      {
        type: 'feature',
        description: {
          fr: '📱 Notifications de mise à jour de version avec détails des changements',
          es: '📱 Notificaciones de actualización de versión con detalles de los cambios',
          en: '📱 Version update notifications with change details',
          ar: '📱 إشعارات تحديث الإصدار مع تفاصيل التغييرات'
        }
      },
      {
        type: 'feature',
        description: {
          fr: '💰 Calcul automatique de la valeur monétaire dans les vérifications récentes',
          es: '💰 Cálculo automático del valor monetario en las verificaciones recientes',
          en: '💰 Automatic monetary value calculation in recent verifications',
          ar: '💰 حساب تلقائي للقيمة النقدية في التحققات الأخيرة'
        }
      },
      {
        type: 'bugfix',
        description: {
          fr: '🐛 Correction des clés dupliquées dans les graphiques de prévision de stock',
          es: '🐛 Corrección de claves duplicadas en los gráficos de predicción de stock',
          en: '🐛 Fixed duplicate keys in stock prediction charts',
          ar: '🐛 إصلاح المفاتيح المكررة في رسوم التنبؤ بالمخزون'
        }
      },
      {
        type: 'improvement',
        description: {
          fr: '✨ Interface de notifications avec couleurs personnalisées selon le type d\'action',
          es: '✨ Interfaz de notificaciones con colores personalizados según el tipo de acción',
          en: '✨ Notification interface with custom colors based on action type',
          ar: '✨ واجهة إشعارات بألوان مخصصة حسب نوع الإجراء'
        }
      }
    ],
    breaking: false,
    critical: false
  },
  {
    version: '2.5.2',
    date: '2026-03-14',
    type: 'patch',
    title: {
      fr: 'Améliorations du Système de Valeur Monétaire',
      es: 'Mejoras del Sistema de Valor Monetario',
      en: 'Monetary Value System Improvements',
      ar: 'تحسينات نظام القيمة النقدية'
    },
    description: {
      fr: 'Optimisation du calcul et affichage des valeurs monétaires dans l\'inventaire.',
      es: 'Optimización del cálculo y visualización de valores monetarios en el inventario.',
      en: 'Optimization of monetary value calculation and display in inventory.',
      ar: 'تحسين حساب وعرض القيم النقدية في المخزون.'
    },
    changes: [
      {
        type: 'improvement',
        description: {
          fr: 'Ajout du calcul de valeur totale basé sur le poids et les catégories',
          es: 'Agregado del cálculo de valor total basado en peso y categorías',
          en: 'Added total value calculation based on weight and categories',
          ar: 'إضافة حساب القيمة الإجمالية بناءً على الوزن والفئات'
        }
      },
      {
        type: 'bugfix',
        description: {
          fr: 'Correction des erreurs d\'accessibilité dans les dialogues',
          es: 'Corrección de errores de accesibilidad en los diálogos',
          en: 'Fixed accessibility errors in dialogs',
          ar: 'إصلاح أخطاء إمكانية الوصول في مربعات الحوار'
        }
      }
    ],
    breaking: false,
    critical: false
  },
  {
    version: '2.5.1',
    date: '2026-03-13',
    type: 'patch',
    title: {
      fr: 'Corrections de Bugs et Optimisations',
      es: 'Correcciones de Errores y Optimizaciones',
      en: 'Bug Fixes and Optimizations',
      ar: 'إصلاحات الأخطاء والتحسينات'
    },
    description: {
      fr: 'Corrections mineures et optimisations de performance.',
      es: 'Correcciones menores y optimizaciones de rendimiento.',
      en: 'Minor fixes and performance optimizations.',
      ar: 'إصلاحات بسيطة وتحسينات الأداء.'
    },
    changes: [
      {
        type: 'bugfix',
        description: {
          fr: 'Correction de problèmes de synchronisation des données',
          es: 'Corrección de problemas de sincronización de datos',
          en: 'Fixed data synchronization issues',
          ar: 'إصلاح مشاكل مزامنة البيانات'
        }
      },
      {
        type: 'improvement',
        description: {
          fr: 'Optimisation de la vitesse de chargement',
          es: 'Optimización de la velocidad de carga',
          en: 'Loading speed optimization',
          ar: 'تحسين سرعة التحميل'
        }
      }
    ],
    breaking: false,
    critical: false
  }
];

export function getLatestVersion(): ReleaseNote | null {
  return RELEASE_NOTES[0] || null;
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}
