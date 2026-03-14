export type TipoContacto = 'donador' | 'fournisseur' | 'benevole' | 'responsable-sante' | 'partenaire' | 'visiteur' | 'employe' | 'transportista';
export type IdiomaContacto = 'es' | 'fr' | 'en' | 'ar';
export type GeneroContacto = 'Homme' | 'Femme' | 'Autre' | 'Non spécifié';

// ===== TIPOS DE EVENTOS DE ACTIVIDAD =====
export type TipoEventoActividad = 
  | 'creation'
  | 'modification'
  | 'changement_statut'
  | 'note_ajoutee'
  | 'document_ajoute'
  | 'document_supprime'
  | 'assignation_departement'
  | 'type_modifie'
  | 'personnalise';

export interface EvenementActivite {
  id: string;
  type: TipoEventoActividad;
  titre: string;
  description?: string;
  date: string;
  utilisateur?: string;
  icone?: string;
  couleur?: string;
  metadata?: Record<string, any>;
}

export interface DisponibilidadDia {
  jour: string; // 'Lundi', 'Mardi', etc.
  am: boolean;
  pm: boolean;
}

export interface ContactoDepartamento {
  id: string;
  departamentoId: string; // Mantener para compatibilidad con contactos existentes
  departamentoIds?: string[]; // Nuevo: múltiples departamentos
  tipo: TipoContacto;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  fechaInicio?: string; // Fecha de inicio en el trabajo/rol
  genero?: GeneroContacto;
  email: string;
  telefono: string;
  cargo?: string;
  idiomas?: IdiomaContacto[];
  disponibilidad?: string;
  disponibilidades?: DisponibilidadDia[]; // Nueva estructura de disponibilidad
  notas?: string;
  activo: boolean;
  fechaIngreso: string;
  foto?: string;
  direccion?: string;
  apartamento?: string; // Número de apartamento
  ciudad?: string;
  codigoPostal?: string;
  numeroEmpleado?: string;
  horario?: string;
  heuresSemaines?: number; // Horas semanales
  reference?: string; // Referencia
  supervisor?: string;
  especialidad?: string;
  certificaciones?: string[];
  documents?: { 
    nom: string; // Nombre del archivo original
    tipo: string; // Código del tipo de documento
    tipoLabel: string; // Etiqueta del tipo
    tipoColor?: string; // Color del tipo
    tipoBgColor?: string; // Color de fondo del tipo
    tipoIcon?: string; // Icono del tipo
    url: string; // Base64 o URL
    date: string; // Fecha de subida
  }[]; // Documentos estandarizados
  // Casier judiciaire et éthique
  fechaConfirmacionCasier?: string; // Fecha de confirmación del casier judiciaire
  codigoEthiqueSigne?: boolean; // Code d'éthique signé (oui/non)
  
  // 🚚 PROGRAMA PRS - Identificador de participación
  participaPRS?: boolean; // Participa en el programa PRS
  fechaInicioPRS?: string; // Fecha de inicio en PRS
  frecuenciaPRS?: number; // Frecuencia de recolección (veces por semana)
  diasRecoleccionPRS?: string[]; // Días específicos de recolección ['Lundi', 'Mercredi', 'Vendredi']
  horarioRecoleccionPRS?: string; // Horario preferido de recolección
  contactoPRS?: string; // Persona de contacto específica para PRS
  telefonoPRS?: string; // Teléfono directo para coordinación PRS
  notasPRS?: string; // Notas especiales sobre el donador PRS
  
  // Campos adicionales para compatibilidad con Gestión de Contactos Entrepôt
  numeroID?: string; // ID único del contacto
  nombreEmpresa?: string; // Nombre de la empresa
  tipoEmpresa?: string; // Tipo de empresa (inc, ltee, senc, obnl)
  numeroRegistro?: string; // Número de registro
  numeroTVA?: string; // Número TVA
  emailPrincipal?: string; // Email principal (alternativo a email)
  emailSecundario?: string; // Email secundario
  telefonoPrincipal?: string; // Teléfono principal (alternativo a telefono)
  telefonoSecundario?: string; // Teléfono secundario
  sitioWeb?: string; // Sitio web
  pais?: string; // País
  provincia?: string; // Provincia
  banco?: string; // Banco
  numeroCuenta?: string; // Número de cuenta bancaria
  numeroRuta?: string; // Número de ruta bancaria
  categoriaProductos?: string[]; // Categorías de productos
  temperaturaEspecializada?: string[]; // Temperaturas especializadas
  diasOperacion?: string[]; // Días de operación
  tiempoEntrega?: string; // Tiempo de entrega
  metodoPago?: string[]; // Métodos de pago
  etiquetas?: string[]; // Etiquetas/tags
  ultimoContacto?: string; // Fecha último contacto
  imagen?: string | null; // Imagen/foto del contacto
  
  // Historial de actividad
  evenements?: EvenementActivite[]; // Eventos del historial de actividad
  
  // 🔄 SISTEMA DUAL DONATEUR/FOURNISSEUR
  isDonateur?: boolean; // Es donateur (puede ser ambos simultáneamente)
  isFournisseur?: boolean; // Es fournisseur (puede ser ambos simultáneamente)
}

// ===== FUNCIONES DE GESTIÓN DE STORAGE =====

const STORAGE_KEY = 'banqueAlimentaire_contactosDepartamento';

// Datos iniciales - MODO PRODUCCIÓN (vacío)
const contactosIniciales: ContactoDepartamento[] = [];

/**
 * MIGRACIÓN Y NORMALIZACIÓN DE DATOS DEL BACKUP
 * 
 * Esta función asegura que los datos del backup sean tratados como información real
 * y normaliza la estructura para compatibilidad con el sistema actual.
 */
function normalizarContactosBackup(contactos: any[]): ContactoDepartamento[] {
  return contactos.map(contacto => {
    // Normalizar departamentos (soporte para formato antiguo y nuevo)
    let departamentoIds: string[] = [];
    
    if (contacto.departamentoIds && Array.isArray(contacto.departamentoIds)) {
      departamentoIds = contacto.departamentoIds;
    } else if (contacto.departamentoId) {
      departamentoIds = [contacto.departamentoId];
    } else {
      // Si no tiene departamento asignado, asignar al primer departamento por defecto
      departamentoIds = ['1']; // Entrepôt
    }

    // Normalizar campos de email y teléfono
    const emailPrincipal = contacto.emailPrincipal || contacto.email || '';
    const telefonoPrincipal = contacto.telefonoPrincipal || contacto.telefono || '';

    // Normalizar género
    const genero = contacto.genero || 'Non spécifié';

    // Asegurar que arrays existan
    const categoriaProductos = Array.isArray(contacto.categoriaProductos) ? contacto.categoriaProductos : [];
    const temperaturaEspecializada = Array.isArray(contacto.temperaturaEspecializada) ? contacto.temperaturaEspecializada : [];
    const diasOperacion = Array.isArray(contacto.diasOperacion) ? contacto.diasOperacion : [];
    const metodoPago = Array.isArray(contacto.metodoPago) ? contacto.metodoPago : [];
    const etiquetas = Array.isArray(contacto.etiquetas) ? contacto.etiquetas : [];
    const certificaciones = Array.isArray(contacto.certificaciones) ? contacto.certificaciones : [];
    const idiomas = Array.isArray(contacto.idiomas) ? contacto.idiomas : [];
    const documents = Array.isArray(contacto.documents) ? contacto.documents : [];
    const evenements = Array.isArray(contacto.evenements) ? contacto.evenements : [];
    const disponibilidades = Array.isArray(contacto.disponibilidades) ? contacto.disponibilidades : [];

    // 🔄 Normalizar flags del sistema dual donateur/fournisseur
    const isDonateur = contacto.isDonateur === true ? true : false;
    const isFournisseur = contacto.isFournisseur === true ? true : false;
    const participaPRS = contacto.participaPRS === true ? true : false;

    // Retornar contacto normalizado
    return {
      ...contacto,
      departamentoId: departamentoIds[0], // Mantener compatibilidad
      departamentoIds,
      email: emailPrincipal,
      emailPrincipal,
      telefono: telefonoPrincipal,
      telefonoPrincipal,
      genero: genero as GeneroContacto,
      categoriaProductos,
      temperaturaEspecializada,
      diasOperacion,
      metodoPago,
      etiquetas,
      certificaciones,
      idiomas,
      documents,
      evenements,
      disponibilidades,
      isDonateur,
      isFournisseur,
      participaPRS,
      activo: contacto.activo !== undefined ? contacto.activo : true,
      fechaIngreso: contacto.fechaIngreso || new Date().toISOString(),
      id: contacto.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    } as ContactoDepartamento;
  });
}

// Obtener todos los contactos
export function obtenerContactosDepartamento(): ContactoDepartamento[];
export function obtenerContactosDepartamento(departamentoId?: string): ContactoDepartamento[];
export function obtenerContactosDepartamento(departamentoId?: string): ContactoDepartamento[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let contactos: ContactoDepartamento[] = [];
    
    if (stored !== null) {
      const rawData = JSON.parse(stored);
      // Normalizar datos del backup
      contactos = normalizarContactosBackup(rawData);
      
      // Guardar datos normalizados de vuelta al localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
    } else {
      // Inicializar vacío en producción
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosIniciales));
      contactos = contactosIniciales;
    }

    // Si se especifica un departamento, filtrar
    if (departamentoId) {
      return contactos.filter(c => {
        if (c.departamentoIds && c.departamentoIds.length > 0) {
          return c.departamentoIds.includes(departamentoId);
        }
        return c.departamentoId === departamentoId;
      });
    }

    return contactos;
  } catch (error) {
    console.error('Error al obtener contactos de departamento:', error);
    return [];
  }
}

// Guardar todos los contactos
function guardarTodosContactos(contactos: ContactoDepartamento[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
  } catch (error) {
    console.error('Error al guardar contactos de departamento:', error);
  }
}

// Guardar un nuevo contacto
export function guardarContacto(contacto: Omit<ContactoDepartamento, 'id' | 'fechaIngreso'>): ContactoDepartamento;
export function guardarContacto(contacto: ContactoDepartamento): ContactoDepartamento;
export function guardarContacto(contacto: any): ContactoDepartamento {
  const contactos = obtenerContactosDepartamento();
  
  // 🔒 VERIFICAR DUPLICADOS: Buscar si ya existe un contacto con el mismo email
  const yaExiste = contactos.find(c => 
    c.email.toLowerCase() === contacto.email.toLowerCase()
  );
  
  if (yaExiste) {
    console.warn('⚠️ Contacto duplicado detectado:', {
      existente: yaExiste,
      nuevo: contacto
    });
    
    // Si el contacto ya existe, verificar si necesita actualizar departamentos
    if (contacto.departamentoId && !yaExiste.departamentoIds?.includes(contacto.departamentoId)) {
      // Agregar el nuevo departamento a la lista de departamentos existentes
      const departamentosActualizados = [...(yaExiste.departamentoIds || [yaExiste.departamentoId]), contacto.departamentoId];
      actualizarContacto(yaExiste.id, {
        departamentoIds: departamentosActualizados
      });
      console.log('✅ Departamento agregado al contacto existente:', departamentosActualizados);
    }
    
    // Retornar el contacto existente en lugar de crear uno nuevo
    return yaExiste;
  }
  
  // Si el contacto ya tiene id y fechaIngreso, usarlos
  const nuevoContacto: ContactoDepartamento = contacto.id && contacto.fechaIngreso 
    ? contacto
    : {
        ...contacto,
        id: Date.now().toString(),
        fechaIngreso: new Date().toISOString()
      };
  
  contactos.push(nuevoContacto);
  guardarTodosContactos(contactos);
  
  // 🔥 Disparar evento para sincronizar otros componentes
  window.dispatchEvent(new CustomEvent('contactos-actualizados', {
    detail: { departamentoId: nuevoContacto.departamentoId, contactoId: nuevoContacto.id }
  }));
  
  return nuevoContacto;
}

// Actualizar un contacto existente
export function actualizarContacto(id: string, datosActualizados: Partial<ContactoDepartamento>): boolean {
  const contactos = obtenerContactosDepartamento();
  const index = contactos.findIndex(c => c.id === id);
  if (index !== -1) {
    contactos[index] = { ...contactos[index], ...datosActualizados };
    guardarTodosContactos(contactos);
    
    // 🔥 Disparar evento para sincronizar otros componentes
    window.dispatchEvent(new CustomEvent('contactos-actualizados', {
      detail: { departamentoId: contactos[index].departamentoId, contactoId: id }
    }));
    
    return true;
  }
  return false;
}

// Eliminar un contacto
export function eliminarContacto(id: string): boolean {
  const contactos = obtenerContactosDepartamento();
  const nuevoArray = contactos.filter(c => c.id !== id);
  if (nuevoArray.length !== contactos.length) {
    guardarTodosContactos(nuevoArray);
    return true;
  }
  return false;
}

// Obtener contacto por ID
export function obtenerContactoPorId(id: string): ContactoDepartamento | undefined {
  const contactos = obtenerContactosDepartamento();
  return contactos.find(c => c.id === id);
}

// Obtener contactos por departamento
export function obtenerContactosPorDepartamento(departamentoId: string): ContactoDepartamento[] {
  const contactos = obtenerContactosDepartamento();
  return contactos.filter(c => {
    // Verificar tanto el campo antiguo como el nuevo array
    if (c.departamentoIds && c.departamentoIds.length > 0) {
      return c.departamentoIds.includes(departamentoId);
    }
    return c.departamentoId === departamentoId;
  });
}

// Obtener contactos por departamento y tipo(s)
export function obtenerContactosPorDepartamentoYTipo(
  departamentoId: string, 
  tipos: TipoContacto[]
): ContactoDepartamento[] {
  const contactos = obtenerContactosDepartamento();
  return contactos.filter(c => {
    // Verificar que pertenezca al departamento
    const perteneceAlDepartamento = c.departamentoIds && c.departamentoIds.length > 0
      ? c.departamentoIds.includes(departamentoId)
      : c.departamentoId === departamentoId;
    
    // Verificar que sea del tipo correcto
    const esTipoCorrecto = tipos.includes(c.tipo);
    
    // Retornar solo si cumple ambas condiciones
    return perteneceAlDepartamento && esTipoCorrecto;
  });
}

// Obtener contactos activos
export function obtenerContactosActivos(): ContactoDepartamento[] {
  return obtenerContactosDepartamento().filter(c => c.activo);
}

// Contar contactos por tipo
export function contarContactosPorTipo(tipo: TipoContacto): number {
  const contactos = obtenerContactosDepartamento();
  return contactos.filter(c => c.tipo === tipo).length;
}

// Buscar contactos
export function buscarContactos(termino: string): ContactoDepartamento[] {
  const contactos = obtenerContactosDepartamento();
  const terminoLower = termino.toLowerCase();
  return contactos.filter(c => 
    c.nombre.toLowerCase().includes(terminoLower) ||
    c.apellido.toLowerCase().includes(terminoLower) ||
    c.email.toLowerCase().includes(terminoLower) ||
    (c.cargo && c.cargo.toLowerCase().includes(terminoLower))
  );
}

// Obtener nombre completo del contacto
export function obtenerNombreCompleto(contacto: ContactoDepartamento): string {
  return `${contacto.nombre} ${contacto.apellido}`.trim();
}

// Actualizar última fecha de contacto
export function actualizarUltimoContacto(id: string): void {
  actualizarContacto(id, {
    ultimoContacto: new Date().toISOString()
  });
}

// Obtener estadísticas de contactos
export function obtenerEstadisticasContactos() {
  const contactos = obtenerContactosDepartamento();
  return {
    total: contactos.length,
    activos: contactos.filter(c => c.activo).length,
    donadores: contactos.filter(c => c.tipo === 'donador').length,
    fournisseurs: contactos.filter(c => c.tipo === 'fournisseur').length,
    benevoles: contactos.filter(c => c.tipo === 'benevole').length,
    employes: contactos.filter(c => c.tipo === 'employe').length,
    transportistas: contactos.filter(c => c.tipo === 'transportista').length,
    responsablesSante: contactos.filter(c => c.tipo === 'responsable-sante').length,
    partenaires: contactos.filter(c => c.tipo === 'partenaire').length,
    visiteurs: contactos.filter(c => c.tipo === 'visiteur').length,
  };
}

// Agregar evento al historial de actividad de un contacto
export function agregarEventoActividad(
  contactoId: string, 
  evento: Omit<EvenementActivite, 'id' | 'date'>
): boolean {
  const contacto = obtenerContactoPorId(contactoId);
  if (!contacto) return false;

  const nuevoEvento: EvenementActivite = {
    ...evento,
    id: Date.now().toString(),
    date: new Date().toISOString()
  };

  const eventosActuales = contacto.evenements || [];
  
  return actualizarContacto(contactoId, {
    evenements: [...eventosActuales, nuevoEvento]
  });
}

// ===== FUNCIONES DE MIGRACIÓN Y DIAGNÓSTICO =====

// Migrar contactos desde el sistema antiguo de entrepot
export function migrarContactosDesdeEntrepot(): { migrados: number; errores: number } {
  try {
    // Importar contactos del sistema de entrepot si existen
    const contactosEntrepot = localStorage.getItem('banqueAlimentaire_contactosEntrepot');
    if (!contactosEntrepot) {
      return { migrados: 0, errores: 0 };
    }

    const contactosAntiguos = JSON.parse(contactosEntrepot);
    const contactosActuales = obtenerContactosDepartamento();
    let migrados = 0;
    let errores = 0;

    contactosAntiguos.forEach((contactoAntiguo: any) => {
      try {
        // Verificar si ya existe
        const yaExiste = contactosActuales.some(c => 
          c.email === contactoAntiguo.emailPrincipal || 
          c.numeroID === contactoAntiguo.numeroID
        );

        if (!yaExiste) {
          // Mapear tipo de contacto
          let tipo: TipoContacto = 'fournisseur';
          if (contactoAntiguo.tipoContacto === 'proveedor') tipo = 'fournisseur';
          else if (contactoAntiguo.tipoContacto === 'donador') tipo = 'donador';
          else if (contactoAntiguo.tipoContacto === 'transportista') tipo = 'transportista';

          // Crear contacto migrado
          const contactoMigrado: Omit<ContactoDepartamento, 'id' | 'fechaIngreso'> = {
            departamentoId: 'general', // Departamento por defecto
            tipo,
            nombre: contactoAntiguo.nombre || '',
            apellido: contactoAntiguo.apellido || '',
            email: contactoAntiguo.emailPrincipal || '',
            telefono: contactoAntiguo.telefonoPrincipal || '',
            activo: contactoAntiguo.activo ?? true,
            numeroID: contactoAntiguo.numeroID,
            nombreEmpresa: contactoAntiguo.nombreEmpresa,
            direccion: contactoAntiguo.direccion,
            ciudad: contactoAntiguo.ciudad,
            codigoPostal: contactoAntiguo.codigoPostal,
            provincia: contactoAntiguo.provincia,
            pais: contactoAntiguo.pais,
            notas: contactoAntiguo.notas,
          };

          guardarContacto(contactoMigrado);
          migrados++;
        }
      } catch (error) {
        console.error('Error al migrar contacto:', error);
        errores++;
      }
    });

    return { migrados, errores };
  } catch (error) {
    console.error('Error durante la migración:', error);
    return { migrados: 0, errores: 1 };
  }
}

// Diagnosticar problemas en el sistema de contactos
export function diagnosticarContactos(): void {
  try {
    const contactos = obtenerContactosDepartamento();
    console.log('🔍 DIAGNÓSTICO DE CONTACTOS DEPARTAMENTO:');
    console.log('Total de contactos:', contactos.length);
    console.log('Contactos activos:', contactos.filter(c => c.activo).length);
    console.log('Por tipo:', {
      donadores: contactos.filter(c => c.tipo === 'donador').length,
      fournisseurs: contactos.filter(c => c.tipo === 'fournisseur').length,
      benevoles: contactos.filter(c => c.tipo === 'benevole').length,
      employes: contactos.filter(c => c.tipo === 'employe').length,
      transportistas: contactos.filter(c => c.tipo === 'transportista').length,
    });

    // Verificar integridad de datos
    const problemas = contactos.filter(c => 
      !c.nombre || !c.apellido || !c.email || !c.departamentoId
    );
    
    if (problemas.length > 0) {
      console.warn('⚠️ Contactos con datos incompletos:', problemas.length);
      console.log('Contactos problemáticos:', problemas);
    }

    // Calcular tamaño en storage
    const size = new Blob([JSON.stringify(contactos)]).size;
    console.log('Tamaño en storage:', (size / 1024).toFixed(2), 'KB');
  } catch (error) {
    console.error('❌ Error durante diagnóstico:', error);
  }
}

// Reparar contactos con problemas
export function repararContactosConProblemas(): { reparados: number; eliminados: number } {
  try {
    const contactos = obtenerContactosDepartamento();
    let reparados = 0;
    let eliminados = 0;

    const contactosReparados = contactos.map(contacto => {
      let reparado = false;

      // Reparar campos obligatorios vacíos
      if (!contacto.nombre) {
        contacto.nombre = 'Sin nombre';
        reparado = true;
      }
      if (!contacto.apellido) {
        contacto.apellido = '';
        reparado = true;
      }
      if (!contacto.email) {
        contacto.email = `sin-email-${contacto.id}@temp.com`;
        reparado = true;
      }
      if (!contacto.departamentoId) {
        contacto.departamentoId = 'general';
        reparado = true;
      }

      if (reparado) reparados++;
      return contacto;
    });

    guardarTodosContactos(contactosReparados);
    return { reparados, eliminados };
  } catch (error) {
    console.error('Error al reparar contactos:', error);
    return { reparados: 0, eliminados: 0 };
  }
}

// ✅ SINCRONIZACIÓN DE DONATEURS/FOURNISSEURS
// Sincronizar donadores/fournisseurs del sistema antiguo con contactos departamento
export function sincronizarDonateursFournisseurs(): { sincronizados: number; errores: number } {
  try {
    console.log('🔄 Iniciando sincronización Donateurs & Fournisseurs...');
    
    // Leer datos del sistema de donateurs/fournisseurs
    const donateursData = localStorage.getItem('banque_alimentaire_donateurs_fournisseurs');
    if (!donateursData) {
      console.log('ℹ️ No hay donateurs/fournisseurs para sincronizar');
      return { sincronizados: 0, errores: 0 };
    }

    const donateurs: any[] = JSON.parse(donateursData);
    console.log(`📋 ${donateurs.length} donateurs/fournisseurs encontrados`);

    // Obtener contactos existentes
    const contactosExistentes = obtenerContactosDepartamento();
    let sincronizados = 0;
    let errores = 0;

    donateurs.forEach(donateur => {
      try {
        // Buscar si ya existe un contacto con este ID o nombre de empresa
        const contactoExistente = contactosExistentes.find(
          c => c.id === donateur.id || c.nombreEmpresa === donateur.nomEntreprise
        );

        if (contactoExistente) {
          // Actualizar contacto existente
          contactoExistente.activo = donateur.actif;
          contactoExistente.nombreEmpresa = donateur.nomEntreprise;
          contactoExistente.telefono = donateur.telephone || '';
          contactoExistente.direccion = donateur.adresse || '';
          contactoExistente.tipo = donateur.isDonateur ? 'donador' : 'fournisseur';
          contactoExistente.participaPRS = donateur.participantPRS;
          
          // 🔄 SISTEMA DUAL: Guardar ambos flags
          contactoExistente.isDonateur = donateur.isDonateur;
          contactoExistente.isFournisseur = donateur.isFournisseur;
          
          // Si tiene personas de contacto, usar la primera como contacto principal
          if (donateur.personnesContact && donateur.personnesContact.length > 0) {
            const primeraPersona = donateur.personnesContact[0];
            contactoExistente.nombre = primeraPersona.nom.split(' ')[0] || 'Contact';
            contactoExistente.apellido = primeraPersona.nom.split(' ').slice(1).join(' ') || '';
            contactoExistente.email = primeraPersona.email || contactoExistente.email;
            contactoExistente.telefonoPrincipal = primeraPersona.telephone || contactoExistente.telefono;
          }
          
          // ✅ REPARAR DATOS FALTANTES
          if (!contactoExistente.nombre || contactoExistente.nombre === '') {
            contactoExistente.nombre = donateur.nomEntreprise || 'Contact';
          }
          if (!contactoExistente.apellido) {
            contactoExistente.apellido = '';
          }
          if (!contactoExistente.email || contactoExistente.email === '') {
            contactoExistente.email = `contact-${contactoExistente.id}@banquealimentaire.ca`;
          }
          if (!contactoExistente.departamentoId || contactoExistente.departamentoId === '') {
            contactoExistente.departamentoId = '1'; // Entrepôt ID
          }
          
          sincronizados++;
        } else {
          // Crear nuevo contacto con datos válidos garantizados
          const nombrePersona = donateur.personnesContact?.[0]?.nom?.split(' ')[0] || donateur.nomEntreprise || 'Contact';
          const apellidoPersona = donateur.personnesContact?.[0]?.nom?.split(' ').slice(1).join(' ') || '';
          const emailPersona = donateur.personnesContact?.[0]?.email || `contact-${donateur.id}@banquealimentaire.ca`;
          
          const nuevoContacto: ContactoDepartamento = {
            id: donateur.id,
            departamentoId: '1', // Entrepôt ID
            tipo: donateur.isDonateur ? 'donador' : 'fournisseur',
            nombre: nombrePersona,
            apellido: apellidoPersona,
            email: emailPersona,
            telefono: donateur.telephone || '',
            activo: donateur.actif,
            fechaIngreso: donateur.dateCreation || new Date().toISOString(),
            nombreEmpresa: donateur.nomEntreprise,
            direccion: donateur.adresse,
            participaPRS: donateur.participantPRS,
            telefonoPrincipal: donateur.personnesContact?.[0]?.telephone || donateur.telephone,
            // 🔄 SISTEMA DUAL: Guardar ambos flags
            isDonateur: donateur.isDonateur,
            isFournisseur: donateur.isFournisseur,
          };

          contactosExistentes.push(nuevoContacto);
          sincronizados++;
        }
      } catch (error) {
        console.error(`❌ Error al sincronizar donateur ${donateur.id}:`, error);
        errores++;
      }
    });

    // Guardar contactos actualizados
    guardarTodosContactos(contactosExistentes);
    
    console.log(`✅ Sincronización completada: ${sincronizados} sincronizados, ${errores} errores`);
    
    // Disparar evento de actualización
    window.dispatchEvent(new CustomEvent('contactos-actualizados'));
    
    return { sincronizados, errores };
  } catch (error) {
    console.error('❌ Error durante sincronización:', error);
    return { sincronizados: 0, errores: 1 };
  }
}

// Obtener información detallada de almacenamiento
export function obtenerInfoAlmacenamiento() {
  const contactos = obtenerContactosDepartamento();
  const size = new Blob([JSON.stringify(contactos)]).size;
  
  // Calcular tamaño de fotos y documentos
  let tamañoFotos = 0;
  let tamañoDocumentos = 0;
  let totalFotos = 0;
  let totalDocumentos = 0;

  contactos.forEach(contacto => {
    if (contacto.foto) {
      tamañoFotos += contacto.foto.length;
      totalFotos++;
    }
    if (contacto.documents && contacto.documents.length > 0) {
      contacto.documents.forEach(doc => {
        tamañoDocumentos += doc.url.length;
        totalDocumentos++;
      });
    }
  });

  return {
    totalContactos: contactos.length,
    tamañoTotal: size,
    tamañoTotalKB: (size / 1024).toFixed(2),
    tamañoFotos,
    tamañoFotosKB: (tamañoFotos / 1024).toFixed(2),
    totalFotos,
    tamañoDocumentos,
    tamañoDocumentosKB: (tamañoDocumentos / 1024).toFixed(2),
    totalDocumentos,
    tamañoPorContacto: contactos.length > 0 ? (size / contactos.length).toFixed(2) : '0',
  };
}

// Eliminar todas las fotos para reducir tamaño
export function eliminarTodasLasFotos(): number {
  const contactos = obtenerContactosDepartamento();
  let eliminadas = 0;

  const contactosActualizados = contactos.map(contacto => {
    if (contacto.foto) {
      eliminadas++;
      return { ...contacto, foto: undefined };
    }
    return contacto;
  });

  guardarTodosContactos(contactosActualizados);
  return eliminadas;
}

// Eliminar todos los documentos para reducir tamaño
export function eliminarTodosLosDocumentos(): number {
  const contactos = obtenerContactosDepartamento();
  let eliminados = 0;

  const contactosActualizados = contactos.map(contacto => {
    if (contacto.documents && contacto.documents.length > 0) {
      eliminados += contacto.documents.length;
      return { ...contacto, documents: [] };
    }
    return contacto;
  });

  guardarTodosContactos(contactosActualizados);
  return eliminados;
}

// Eliminar fournisseurs obsoletos (contactos duplicados o inválidos)
export function eliminarFournisseursObsoletos(): number {
  try {
    const contactos = obtenerContactosDepartamento();
    const emailsVistos = new Set<string>();
    const contactosValidos: ContactoDepartamento[] = [];
    let eliminados = 0;

    contactos.forEach(contacto => {
      // Validar que tenga datos mínimos
      const esValido = contacto.nombre && 
                       contacto.email && 
                       contacto.departamentoId;

      // Verificar duplicados por email
      const esDuplicado = emailsVistos.has(contacto.email);

      if (esValido && !esDuplicado) {
        contactosValidos.push(contacto);
        emailsVistos.add(contacto.email);
      } else {
        eliminados++;
      }
    });

    if (eliminados > 0) {
      guardarTodosContactos(contactosValidos);
      console.log(`🧹 ${eliminados} contacto(s) obsoleto(s) eliminado(s)`);
    }

    return eliminados;
  } catch (error) {
    console.error('Error al eliminar fournisseurs obsoletos:', error);
    return 0;
  }
}

// Optimizar todos los contactos (comprimir imágenes, limpiar datos redundantes)
export function optimizarTodosLosContactos(): { optimizados: number; ahorroKB: number } {
  try {
    const contactos = obtenerContactosDepartamento();
    const tamañoOriginal = new Blob([JSON.stringify(contactos)]).size;
    let optimizados = 0;

    const contactosOptimizados = contactos.map(contacto => {
      let optimizado = false;

      // Limpiar campos vacíos o duplicados
      const contactoLimpio: ContactoDepartamento = { ...contacto };

      // Eliminar campos undefined o vacíos innecesarios
      Object.keys(contactoLimpio).forEach(key => {
        const value = (contactoLimpio as any)[key];
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          delete (contactoLimpio as any)[key];
          optimizado = true;
        }
      });

      // Optimizar arrays duplicados
      if (contactoLimpio.idiomas) {
        const idiomasUnicos = [...new Set(contactoLimpio.idiomas)];
        if (idiomasUnicos.length !== contactoLimpio.idiomas.length) {
          contactoLimpio.idiomas = idiomasUnicos;
          optimizado = true;
        }
      }

      // Consolidar campos de email (usar solo email principal)
      if (contactoLimpio.emailPrincipal && !contactoLimpio.email) {
        contactoLimpio.email = contactoLimpio.emailPrincipal;
        delete contactoLimpio.emailPrincipal;
        optimizado = true;
      } else if (contactoLimpio.email && contactoLimpio.emailPrincipal && contactoLimpio.email === contactoLimpio.emailPrincipal) {
        delete contactoLimpio.emailPrincipal;
        optimizado = true;
      }

      // Consolidar campos de teléfono
      if (contactoLimpio.telefonoPrincipal && !contactoLimpio.telefono) {
        contactoLimpio.telefono = contactoLimpio.telefonoPrincipal;
        delete contactoLimpio.telefonoPrincipal;
        optimizado = true;
      } else if (contactoLimpio.telefono && contactoLimpio.telefonoPrincipal && contactoLimpio.telefono === contactoLimpio.telefonoPrincipal) {
        delete contactoLimpio.telefonoPrincipal;
        optimizado = true;
      }

      if (optimizado) optimizados++;
      return contactoLimpio;
    });

    guardarTodosContactos(contactosOptimizados);
    
    const tamañoFinal = new Blob([JSON.stringify(contactosOptimizados)]).size;
    const ahorroKB = ((tamañoOriginal - tamañoFinal) / 1024);

    console.log(`✅ ${optimizados} contacto(s) optimizado(s). Ahorro: ${ahorroKB.toFixed(2)} KB`);

    return { 
      optimizados, 
      ahorroKB: parseFloat(ahorroKB.toFixed(2))
    };
  } catch (error) {
    console.error('Error al optimizar contactos:', error);
    return { optimizados: 0, ahorroKB: 0 };
  }
}

// ===== FUNCIONES ADICIONALES DE UTILIDAD =====

// Obtener contactos por tipo específico
export function obtenerContactosPorTipo(tipo: TipoContacto): ContactoDepartamento[] {
  const contactos = obtenerContactosDepartamento();
  return contactos.filter(c => c.tipo === tipo);
}

// Obtener contactos activos por tipo
export function obtenerContactosActivosPorTipo(tipo: TipoContacto): ContactoDepartamento[] {
  const contactos = obtenerContactosDepartamento();
  return contactos.filter(c => c.tipo === tipo && c.activo);
}

// Verificar si existe un contacto con ese email
export function existeContactoPorEmail(email: string, excluirId?: string): boolean {
  const contactos = obtenerContactosDepartamento();
  return contactos.some(c => {
    if (excluirId && c.id === excluirId) return false;
    return c.email.toLowerCase() === email.toLowerCase() ||
           (c.emailPrincipal && c.emailPrincipal.toLowerCase() === email.toLowerCase());
  });
}

// Exportar contactos a JSON
export function exportarContactosJSON(): string {
  const contactos = obtenerContactosDepartamento();
  return JSON.stringify(contactos, null, 2);
}

// Importar contactos desde JSON
export function importarContactosJSON(jsonData: string): { importados: number; errores: number } {
  try {
    const contactosImportados = JSON.parse(jsonData);
    
    if (!Array.isArray(contactosImportados)) {
      console.error('Los datos no son un array válido');
      return { importados: 0, errores: 1 };
    }

    const contactosActuales = obtenerContactosDepartamento();
    let importados = 0;
    let errores = 0;

    contactosImportados.forEach((contacto: any) => {
      try {
        // Validar campos obligatorios
        if (!contacto.nombre || !contacto.email || !contacto.tipo || !contacto.departamentoId) {
          errores++;
          return;
        }

        // Verificar si ya existe
        const yaExiste = contactosActuales.some(c => 
          c.email === contacto.email || 
          (contacto.id && c.id === contacto.id)
        );

        if (!yaExiste) {
          guardarContacto(contacto);
          importados++;
        }
      } catch (error) {
        console.error('Error al importar contacto:', error);
        errores++;
      }
    });

    return { importados, errores };
  } catch (error) {
    console.error('Error al parsear JSON:', error);
    return { importados: 0, errores: 1 };
  }
}

// Limpiar completamente el storage (CUIDADO - solo para desarrollo)
export function limpiarTodosLosContactos(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    console.log('🧹 Todos los contactos han sido eliminados');
    return true;
  } catch (error) {
    console.error('Error al limpiar contactos:', error);
    return false;
  }
}

// 🧹 Eliminar contactos duplicados basándose en email
export function eliminarContactosDuplicados(): { eliminados: number; conservados: number } {
  try {
    const contactos = obtenerContactosDepartamento();
    const emailsVistos = new Map<string, ContactoDepartamento>();
    let eliminados = 0;

    // Primera pasada: identificar duplicados
    contactos.forEach(contacto => {
      const emailKey = contacto.email.toLowerCase();
      
      if (!emailsVistos.has(emailKey)) {
        // Es el primero con este email, conservarlo
        emailsVistos.set(emailKey, contacto);
      } else {
        // Ya existe un contacto con este email
        eliminados++;
        console.log(`🔴 Duplicado encontrado: ${contacto.nombre} ${contacto.apellido} (${contacto.email})`);
      }
    });

    // Guardar solo los contactos únicos
    const contactosUnicos = Array.from(emailsVistos.values());
    guardarTodosContactos(contactosUnicos);

    console.log(`✅ Limpieza completada: ${eliminados} duplicado(s) eliminado(s), ${contactosUnicos.length} contacto(s) conservado(s)`);
    
    // Disparar evento de actualización
    window.dispatchEvent(new CustomEvent('contactos-actualizados'));
    
    return { 
      eliminados, 
      conservados: contactosUnicos.length 
    };
  } catch (error) {
    console.error('❌ Error al eliminar duplicados:', error);
    return { eliminados: 0, conservados: 0 };
  }
}

// 🔄 Sincronizar cambios desde el módulo Bénévoles a Contactos de Departamento
export function sincronizarDesdeBenevole(benevole: {
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  statut?: string;
  disponibilites?: any[];
  disponibilitesSemanal?: any[];
  photo?: string | null;
  poste?: string;
  sexe?: string;
  dateNaissance?: string;
  langues?: string[];
  urgenceNom?: string;
  urgenceRelation?: string;
  urgenceTelephone?: string;
  urgenceEmail?: string;
  notes?: string;
}): { actualizados: number; departamentos: string[] } {
  try {
    const contactos = obtenerContactosDepartamento();
    let actualizados = 0;
    const departamentosActualizados = new Set<string>();

    // Buscar todos los contactos con este email
    const contactosActualizados = contactos.map(contacto => {
      if (contacto.email.toLowerCase() === benevole.email.toLowerCase()) {
        actualizados++;
        departamentosActualizados.add(contacto.departamentoId);

        console.log(`🔄 Sincronizando bénévole a contacto del departamento ${contacto.departamentoId}`);

        // Actualizar con los nuevos datos del bénévole
        return {
          ...contacto,
          // Actualizar nombre y apellido si están disponibles
          ...(benevole.nom && { apellido: benevole.nom }),
          ...(benevole.prenom && { nombre: benevole.prenom }),
          // Actualizar información de contacto
          ...(benevole.telephone && { telefono: benevole.telephone }),
          // Actualizar dirección
          ...(benevole.direccion && { direccion: benevole.direccion }),
          ...(benevole.ciudad && { ciudad: benevole.ciudad }),
          ...(benevole.codigoPostal && { codigoPostal: benevole.codigoPostal }),
          // Actualizar estado activo basado en statut
          ...(benevole.statut && { 
            activo: benevole.statut === 'Actif' || benevole.statut === 'actif'
          }),
          // Actualizar disponibilidades (si están disponibles)
          ...(benevole.disponibilidadesSemanal && {
            disponibilidades: benevole.disponibilidadesSemanal.map((disp: any) => ({
              jour: disp.jour || disp.dia,
              am: disp.am || false,
              pm: disp.pm || false
            }))
          }),
          // Actualizar foto
          ...(benevole.photo !== undefined && { foto: benevole.photo || '' }),
          // Actualizar cargo/poste
          ...(benevole.poste && { cargo: benevole.poste }),
          // Actualizar información adicional
          ...(benevole.sexe && { sexo: benevole.sexe }),
          ...(benevole.dateNaissance && { fechaNacimiento: benevole.dateNaissance }),
          // Actualizar idiomas
          ...(benevole.langues && { idiomas: benevole.langues }),
          // Actualizar contacto de emergencia
          ...(benevole.urgenceNom && { 
            contactoEmergencia: {
              nombre: benevole.urgenceNom,
              relacion: benevole.urgenceRelation || '',
              telefono: benevole.urgenceTelephone || '',
              email: benevole.urgenceEmail || ''
            }
          }),
          // Actualizar notas
          ...(benevole.notes && { notas: benevole.notes }),
          // Agregar evento de actualización
          evenements: [
            ...(contacto.evenements || []),
            {
              id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'modification' as const,
              titre: 'Profil mis à jour',
              description: 'Synchronisation automatique depuis le module Bénévoles',
              date: new Date().toISOString(),
              utilisateur: 'Système',
              couleur: '#2d9561'
            }
          ]
        };
      }
      return contacto;
    });

    if (actualizados > 0) {
      // Guardar los contactos actualizados
      guardarTodosContactos(contactosActualizados);

      // Disparar evento para cada departamento afectado
      departamentosActualizados.forEach(deptId => {
        window.dispatchEvent(new CustomEvent('contactos-actualizados', {
          detail: { departamentoId: deptId }
        }));
      });

      console.log(`✅ Sincronización completada: ${actualizados} contacto(s) actualizado(s) en ${departamentosActualizados.size} departamento(s)`);
    }

    return {
      actualizados,
      departamentos: Array.from(departamentosActualizados)
    };
  } catch (error) {
    console.error('❌ Error al sincronizar desde bénévole:', error);
    return { actualizados: 0, departamentos: [] };
  }
}