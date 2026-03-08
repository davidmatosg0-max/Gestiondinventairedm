# 🚀 MODO PRODUCCIÓN - Banque Alimentaire

## Sistema preparado para producción

El sistema ha sido configurado para iniciar en **MODO PRODUCCIÓN** sin datos de ejemplo.

---

## 📋 Configuración Inicial

### Usuarios Administradores del Sistema

**Usuario Desarrollador (Permanente):**
- **Usuario:** `David`
- **Contraseña:** `Lettycia26`
- **Rol:** Développeur Principal - Accès Total au Système
- ⚠️ **Este usuario siempre debe estar activo como desarrollador**

**Usuario Administrador Principal:**
- **Usuario:** `admin`
- **Contraseña:** `Admin2024!`
- **Rol:** Administrateur Principal - Accès Total au Système

⚠️ **IMPORTANTE:** Cambie la contraseña del usuario `admin` inmediatamente después del primer acceso.

---

## 🧹 Limpieza de Datos (Si es necesario)

El sistema incluye herramientas para eliminar todos los datos de demostración que pudieran existir.

### Opción 1: Limpieza Completa (Recomendada)

Abrir la consola del navegador (`F12`) y ejecutar:

```javascript
limpiarDatosProduccion.limpiarTodo()
```

Esto eliminará:
- ✅ Todos los organismos de ejemplo
- ✅ Todas las comandas de ejemplo
- ✅ Todo el inventario de ejemplo
- ✅ Todos los productos de ejemplo
- ✅ Todos los contactos de ejemplo
- ✅ Todos los bénévoles de ejemplo
- ✅ Todos los usuarios de ejemplo (excepto admin)
- ✅ Todas las ofertas de ejemplo
- ✅ Todas las notificaciones de ejemplo

**Mantiene:**
- ✅ Usuario administrador principal
- ✅ Departamentos base del sistema
- ✅ Categorías y subcategorías
- ✅ Configuración del sistema

### Opción 2: Limpieza Selectiva

Si solo desea eliminar datos específicos:

```javascript
// Ver estado actual del sistema
limpiarDatosProduccion.verEstado()

// Limpiar solo organismos
limpiarDatosProduccion.limpiarOrganismos()

// Limpiar solo comandas
limpiarDatosProduccion.limpiarComandas()

// Limpiar solo inventario
limpiarDatosProduccion.limpiarInventario()

// Limpiar solo contactos
limpiarDatosProduccion.limpiarContactos()
```

---

## 🎯 Estado del Sistema en Producción

### Datos Predefinidos (NO se eliminan)

El sistema incluye datos esenciales que permanecen:

#### Departamentos Base:
1. **Entrepôt** - Gestion des stocks et inventaire
2. **Comptoir** - Distribution directe aux bénéficiaires
3. **Cuisine** - Préparation de repas et recettes
4. **Liaison** - Coordination avec les organismes
5. **PTC** - Programme de travail communautaire
6. **Maintien** - Maintenance et entretien
7. **Recrutement** - Gestion des ressources humaines

#### Usuarios Base:
- **David** (Développeur) - Acceso total como desarrollador (permanente)
- **admin** (Administrateur) - Acceso total al sistema

### Datos Vacíos (Listos para datos reales)

Los siguientes módulos están vacíos y listos para datos de producción:
- Organismos
- Comandas
- Inventario
- Productos
- Contactos (Departamento y Entrepôt)
- Bénévoles
- Ofertas
- Personas Responsables
- Transacciones
- Zonas de Almacenamiento

---

## 🔐 Seguridad

### Cambiar Contraseña del Administrador

1. Iniciar sesión con las credenciales predeterminadas
2. Ir a **Usuarios** en el menú lateral
3. Hacer clic en editar (✏️) junto al usuario `admin`
4. Ingresar nueva contraseña
5. Confirmar y guardar

### Crear Usuarios Adicionales

1. Ir a **Usuarios** > **Nouvel Utilisateur**
2. Completar el formulario:
   - Nombre de usuario
   - Nombre y apellido
   - Email
   - Rol (Administrador, Coordinador, Usuario)
   - Contraseña (manual)
   - Descripción (opcional)
3. Guardar

**Roles disponibles:**
- **Administrador:** Acceso completo al sistema
- **Coordinador:** Acceso de lectura a todos los módulos
- **Usuario:** Permisos personalizados según función

---

## 📊 Primeros Pasos

### 1. Configuración Inicial

**a) Personalización del Sistema**
- Ir a **Configuración** > **Personnalisation**
- Ajustar colores (si es necesario)
- Subir logo de la organización (opcional)

**b) Configurar Departamentos**
- Ir a **Départements**
- Los departamentos base ya están creados
- Puede agregar más si es necesario

### 2. Agregar Organismos

**Opción A: Portal Público**
- Los organismos pueden auto-registrarse en:
  `[URL-DEL-SISTEMA]/acceso-organismo`

**Opción B: Administrador**
1. Ir a **Organismes**
2. Clic en **Nouvel Organisme**
3. Completar formulario
4. Asignar clave de acceso automática
5. Guardar

### 3. Configurar Inventario

1. **Crear Categorías** (si no existen):
   - Ir a **Configuration** > **Catégories de Produits**

2. **Agregar Productos**:
   - Ir a **Inventaire**
   - Clic en **Nouveau Produit**
   - Completar información

3. **Registrar Entradas**:
   - Ir a **Inventaire** > **Entrepôt**
   - Registrar entrada de productos

### 4. Gestión de Comandas

1. **Crear Oferta** (opcional):
   - Ir a **Inventaire** > **Créer une Offre**
   - Seleccionar productos disponibles
   - Compartir con organismos

2. **Gestionar Comandas**:
   - Los organismos crean solicitudes
   - Revisar en **Commandes**
   - Aprobar/Rechazar según disponibilidad
   - Programar entrega

### 5. Agregar Contactos

**Contactos de Departamento:**
1. Ir a **Départements**
2. Seleccionar departamento
3. Agregar contactos del personal

**Contactos de Entrepôt:**
1. Ir a **Entrepôt** > **Contactos**
2. Agregar:
   - Proveedores
   - Donadores
   - Transportistas

---

## 🔄 Flujo de Trabajo Recomendado

```mermaid
1. Configuración → 2. Organismos → 3. Inventario → 4. Ofertas → 5. Comandas → 6. Entregas
```

### Flujo Detallado:

1. **Configuración del Sistema**
   - Usuarios
   - Departamentos
   - Personalización

2. **Registro de Organismos**
   - Auto-registro o registro manual
   - Asignación de claves de acceso
   - Personas responsables

3. **Gestión de Inventario**
   - Registro de productos
   - Entradas de donaciones/compras
   - Control de stock

4. **Creación de Ofertas** (opcional)
   - Selección de productos disponibles
   - Publicación para organismos

5. **Gestión de Comandas**
   - Recepción de solicitudes
   - Aprobación/Rechazo
   - Preparación

6. **Logística y Entregas**
   - Programación de rutas
   - Asignación de vehículos
   - Seguimiento de entregas

---

## 📞 Soporte y Ayuda

### Módulo de Ayuda Integrado

Acceder desde el menú lateral:
- **Aide et Support**
- Incluye:
  - Guías de usuario
  - Preguntas frecuentes
  - Tutoriales
  - Configuración

### Verificar Estado del Sistema

Desde la consola del navegador:

```javascript
// Ver estadísticas actuales
limpiarDatosProduccion.verEstado()
```

---

## ⚙️ Mantenimiento

### Respaldo de Datos

El sistema utiliza `localStorage` del navegador. Para crear respaldos:

1. **Manual:**
   - Abrir consola del navegador (`F12`)
   - Copiar todo el contenido de `localStorage`

2. **Automático:**
   - Usar herramientas de exportación del sistema
   - Ir a **Configuration** > **Gestion des Données**

### Restauración de Datos

En caso de pérdida de datos:

1. Verificar respaldo disponible
2. Usar herramientas de importación
3. Validar integridad de datos

---

## 🚨 Solución de Problemas

### Sistema muestra datos de ejemplo

**Solución:**
```javascript
// Limpiar todos los datos de ejemplo
limpiarDatosProduccion.limpiarTodo()

// Recargar la página
location.reload()
```

### No puedo iniciar sesión

**Verificar:**
1. Usuario: `admin`
2. Contraseña: `Admin2024!`
3. Mayúsculas/minúsculas correctas

**Si olvidó la contraseña:**
```javascript
// Resetear usuario admin
localStorage.setItem('banque_alimentaire_usuarios', JSON.stringify([{
  id: '1',
  username: 'admin',
  password: 'Admin2024!',
  nombre: 'Administrateur',
  apellido: 'Système',
  email: 'admin@banque-alimentaire.org',
  rol: 'administrador',
  permisos: ['administrador_general', 'desarrollador', 'acceso_total', 'administrador_liaison', 'coordinador'],
  descripcion: 'Administrateur Principal'
}]));

// Recargar
location.reload();
```

### Departamentos no aparecen

Los departamentos base deberían cargarse automáticamente. Si no aparecen:

```javascript
// Reinicializar departamentos
localStorage.removeItem('departamentos_banco_alimentos');
location.reload();
```

---

## 📝 Notas Importantes

1. **Navegador Recomendado:** Chrome, Firefox, Edge (últimas versiones)
2. **localStorage:** No limpiar caché del navegador sin hacer respaldo
3. **Sesiones:** Las sesiones expiran a los 30 días
4. **Idiomas:** Sistema multilingüe (FR, ES, EN, AR)
5. **Moneda:** Dólar Canadiense (CAD$)

---

## ✅ Checklist de Producción

- [ ] Cambiar contraseña del administrador
- [ ] Limpiar datos de ejemplo (`limpiarDatosProduccion.limpiarTodo()`)
- [ ] Crear usuarios del personal
- [ ] Configurar departamentos adicionales (si es necesario)
- [ ] Personalizar colores y logo (opcional)
- [ ] Probar flujo de registro de organismos
- [ ] Probar flujo de comandas
- [ ] Configurar respaldos periódicos
- [ ] Capacitar al personal en el uso del sistema

---

**Última actualización:** Marzo 2026  
**Versión del Sistema:** 4.0 - Modo Producción  
**Desarrollado para:** Banque Alimentaire