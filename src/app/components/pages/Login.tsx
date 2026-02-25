import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Lock, User, LogIn, AlertCircle, Sparkles, Shield, Copy, Check, Clock } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { toast } from 'sonner';
import { guardarUsuarioSesion } from '../../utils/sesionStorage';
import { validarCredenciales, inicializarUsuarios } from '../../utils/usuarios';

interface LoginProps {
  onLogin: () => void;
  onAccessPublic?: (page: string) => void;
}

export function Login({ onLogin, onAccessPublic }: LoginProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Inicializar usuarios al montar el componente
  React.useEffect(() => {
    inicializarUsuarios();
  }, []);

  const handleCopy = async (text: string, type: 'user' | 'pass') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'user') {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      } else {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      }
      toast.success('Copié!', { duration: 1500 });
    } catch (err) {
      toast.error('Erreur de copie');
    }
  };

  const handleUseDemo = () => {
    setUsuario('admin');
    setContrasena('Demo2024!');
    toast.info('Identifiants démo chargés', { 
      description: 'Cliquez sur "Connexion" pour continuer',
      duration: 2500 
    });
  };

  const handleDeveloperAccess = () => {
    setUsuario('David');
    setContrasena('Lettycia26');
    toast.success('🔧 Accès Développeur', { 
      description: 'Identifiants développeur chargés',
      duration: 2500,
      icon: '👨‍💻'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Validación simple
    if (!usuario || !contrasena) {
      setError('Veuillez entrer un nom d\'utilisateur et un mot de passe');
      toast.error('Champs requis');
      setIsLoading(false);
      return;
    }

    // Simular un pequeño delay pour animación
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validar credenciales contra la base de données de usuarios
    const usuarioValidado = validarCredenciales(usuario, contrasena);
    
    if (!usuarioValidado) {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
      toast.error('❌ Authentification échouée', {
        description: 'Vérifiez vos identifiants et réessayez'
      });
      setIsLoading(false);
      return;
    }

    // Login exitoso
    toast.success(`✅ Bienvenue ${usuarioValidado.nombre}!`, {
      description: usuarioValidado.descripcion || 'Connexion réussie',
      duration: 3000
    });
    
    // Guardar estado de sesión en localStorage si "Recordarme" está activado
    if (recordarme) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
    } else {
      sessionStorage.setItem('isAuthenticated', 'true');
    }
    
    // Crear usuario de sesión avec les données validées
    const usuarioSesion = {
      id: usuarioValidado.id,
      nombre: usuarioValidado.nombre,
      apellido: usuarioValidado.apellido,
      email: usuarioValidado.email,
      rol: usuarioValidado.rol,
      permisos: usuarioValidado.permisos,
      foto: usuarioValidado.foto
    };
    
    // Guardar usuario en sesión
    guardarUsuarioSesion(usuarioSesion);
    
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: branding.secondaryColor }}
        />
      </div>

      {/* Selector de idioma en la esquina superior derecha */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Contenedor del formulario */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo y título con animación */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="relative inline-block mb-6">
            {/* Glow effect detrás del logo */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
              style={{ backgroundColor: branding.primaryColor }}
            />
            <div 
              onClick={handleDeveloperAccess}
              className="relative h-28 w-28 sm:h-32 sm:w-32 mx-auto rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white cursor-default transition-all duration-300"
              style={{ borderColor: branding.primaryColor }}
              title=""
            >
              {branding.logo ? (
                <img 
                  src={branding.logo} 
                  alt="Logo" 
                  className="h-full w-full rounded-full"
                  style={{ 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                  }}
                />
              ) : (
                <div 
                  className="h-full w-full flex items-center justify-center text-white"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <span className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    BA
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <h1 
            className="font-bold text-2xl sm:text-3xl mb-3 tracking-tight" 
            style={{ 
              fontFamily: 'Montserrat, sans-serif',
              color: branding.primaryColor,
            }}
          >
            {branding.systemName}
          </h1>
          <p className="text-base sm:text-lg text-gray-700 font-light" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {t('login.welcome')}
          </p>
        </div>

        {/* Tarjeta de login con glassmorphism */}
        <div 
          className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/50"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles size={20} style={{ color: branding.primaryColor }} />
            <h2 
              className="font-bold text-xl sm:text-2xl text-center" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: '#333333' 
              }}
            >
              {t('login.signIn')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de usuario */}
            <div className="space-y-2">
              <label 
                htmlFor="usuario" 
                className="block text-sm font-semibold"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#333333' 
                }}
              >
                {t('login.username')}
              </label>
              <div className="relative group">
                <div 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: usuario ? branding.primaryColor : '#9CA3AF' }}
                >
                  <User size={20} />
                </div>
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  style={{ 
                    borderColor: usuario ? branding.primaryColor : undefined,
                  }}
                  placeholder={t('login.usernamePlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(usuario, 'user')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: '#9CA3AF' }}
                >
                  <Copy size={20} />
                </button>
                {copiedUser && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200">
                    <Check size={20} style={{ color: '#4CAF50' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="space-y-2">
              <label 
                htmlFor="contrasena" 
                className="block text-sm font-semibold"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#333333' 
                }}
              >
                {t('login.password')}
              </label>
              <div className="relative group">
                <div 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: contrasena ? branding.primaryColor : '#9CA3AF' }}
                >
                  <Lock size={20} />
                </div>
                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  style={{ 
                    borderColor: contrasena ? branding.primaryColor : undefined,
                  }}
                  placeholder={t('login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(contrasena, 'pass')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: '#9CA3AF' }}
                >
                  <Copy size={20} />
                </button>
                {copiedPass && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200">
                    <Check size={20} style={{ color: '#4CAF50' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Recordarme y olvidaste contraseña */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="w-5 h-5 rounded-md cursor-pointer transition-all"
                    style={{ accentColor: branding.primaryColor }}
                  />
                </div>
                <span 
                  className="ml-2 text-sm font-medium transition-colors"
                  style={{ color: '#333333' }}
                >
                  {t('login.rememberMe')}
                </span>
              </label>
              <a 
                href="#" 
                className="text-sm font-semibold hover:underline transition-all"
                style={{ color: branding.primaryColor }}
              >
                {t('login.forgotPassword')}
              </a>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold py-3.5 text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
              style={{ 
                backgroundColor: branding.primaryColor,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {t('login.signIn')}
                </>
              )}
            </button>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Tarjeta de credenciales demo */}
        <div 
          className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl p-5 sm:p-6 border border-white/50 mt-4 animate-fadeIn"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
            animationDelay: '0.2s'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} style={{ color: branding.secondaryColor }} />
            <h3 
              className="font-bold text-base sm:text-lg" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: '#333333' 
              }}
            >
              Accès Administrateur Démo
            </h3>
          </div>

          <div className="space-y-3">
            {/* Usuario demo */}
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${branding.primaryColor}15` }}
                >
                  <User size={16} style={{ color: branding.primaryColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Utilisateur
                  </p>
                  <p className="text-sm font-bold" style={{ color: '#333333', fontFamily: 'Montserrat, sans-serif' }}>
                    admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy('admin', 'user')}
                className="p-2 hover:bg-white/80 rounded-lg transition-all"
                title="Copier"
              >
                {copiedUser ? (
                  <Check size={16} style={{ color: branding.secondaryColor }} />
                ) : (
                  <Copy size={16} style={{ color: '#9CA3AF' }} />
                )}
              </button>
            </div>

            {/* Contraseña demo */}
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${branding.primaryColor}15` }}
                >
                  <Lock size={16} style={{ color: branding.primaryColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Mot de passe
                  </p>
                  <p className="text-sm font-bold" style={{ color: '#333333', fontFamily: 'Montserrat, sans-serif' }}>
                    Demo2024!
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy('Demo2024!', 'pass')}
                className="p-2 hover:bg-white/80 rounded-lg transition-all"
                title="Copier"
              >
                {copiedPass ? (
                  <Check size={16} style={{ color: branding.secondaryColor }} />
                ) : (
                  <Copy size={16} style={{ color: '#9CA3AF' }} />
                )}
              </button>
            </div>
          </div>

          {/* Botón usar credenciales */}
          <button
            onClick={handleUseDemo}
            className="w-full mt-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 hover:shadow-md transform hover:-translate-y-0.5"
            style={{ 
              backgroundColor: 'white',
              borderColor: branding.primaryColor,
              color: branding.primaryColor,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            <Sparkles size={16} />
            Utiliser ces identifiants
          </button>

          {/* Info adicional */}
          <div 
            className="mt-4 p-3 rounded-lg flex items-start gap-2"
            style={{ backgroundColor: `${branding.secondaryColor}10` }}
          >
            <Shield size={14} style={{ color: branding.secondaryColor, marginTop: '2px', flexShrink: 0 }} />
            <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <span className="font-semibold">Accès administrateur:</span> Gestion complète du système (sans accès développeur)
            </p>
          </div>
        </div>

        {/* Botón de acceso público a Feuilles de Temps */}
        {onAccessPublic && (
          <div 
            className="backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/40 rounded-2xl shadow-xl p-5 sm:p-6 border border-white/50 mt-4 animate-fadeIn overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
              animationDelay: '0.4s'
            }}
            onClick={() => onAccessPublic('benevoles-public')}
          >
            {/* Efecto glow animado */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at center, ${branding.secondaryColor}15 0%, transparent 70%)`
              }}
            />
            
            <div className="relative">
              {/* Header del botón */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}CC 100%)` 
                    }}
                  >
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 
                      className="font-bold text-lg" 
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#333333' 
                      }}
                    >
                      Feuilles de Temps
                    </h3>
                    <p className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Accès public sans connexion
                    </p>
                  </div>
                </div>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300"
                  style={{ backgroundColor: `${branding.secondaryColor}15` }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    style={{ color: branding.secondaryColor }}
                  >
                    <path 
                      d="M6 12L10 8L6 4" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Descripción */}
              <div 
                className="p-4 rounded-xl border-2 border-dashed mb-3"
                style={{ 
                  backgroundColor: `${branding.secondaryColor}08`,
                  borderColor: `${branding.secondaryColor}30`
                }}
              >
                <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span className="font-semibold" style={{ color: branding.secondaryColor }}>Enregistrement des heures:</span> Accès direct pour les bénévoles. Enregistrez vos heures ARRIVÉE/DÉPART rapidement sans authentification.
                </p>
              </div>

              {/* Características */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${branding.secondaryColor}20` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path 
                        d="M2 6L5 9L10 3" 
                        stroke={branding.secondaryColor} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Enregistrement rapide avec boutons ARRIVÉE/DÉPART
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${branding.secondaryColor}20` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path 
                        d="M2 6L5 9L10 3" 
                        stroke={branding.secondaryColor} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Calcul automatique du temps travaillé
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${branding.secondaryColor}20` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path 
                        d="M2 6L5 9L10 3" 
                        stroke={branding.secondaryColor} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Interface simple et intuitive
                  </p>
                </div>
              </div>

              {/* Badge "Accès libre" */}
              <div className="mt-4 flex justify-center">
                <div 
                  className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md"
                  style={{ 
                    backgroundColor: branding.secondaryColor,
                    color: 'white',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  <Sparkles size={12} />
                  Accès Libre • Sans Connexion
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p className="font-light">
            © 2024 {branding.systemName}. {t('login.allRightsReserved') || 'Todos los derechos reservados'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}