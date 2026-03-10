# 📋 Regla de Formulario Simplificado - Donadores y Proveedores

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha implementado una regla de negocio que simplifica el formulario de contactos cuando se selecciona el tipo **"Donador"** o **"Proveedor"** (Vendedor).

---

## 🎯 OBJETIVO

Cuando un usuario crea o edita un contacto de tipo **Donador** o **Proveedor**, el formulario debe mostrar **únicamente**:

1. ✅ **Información Básica** (Tab Base)
2. ✅ **Información de Contacto** (Tab Contact)

**Ocultar automáticamente:**
- ❌ Información Profesional (Tab Professionnel)
- ❌ Disponibilidad (Tab Disponibilité)
- ❌ Otros (Tab Autres)

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Archivo Modificado:**

**`/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx`**

### **Cambios Realizados:**

#### **1. Detección de Tipo de Contacto:**

```typescript
const esEmpresa = formData.categoria === 'donador' || formData.categoria === 'vendedor';
```

Esta variable se utiliza para determinar si el contacto es una empresa (Donador o Proveedor).

#### **2. Ocultamiento Condicional de Tabs:**

```typescript
<TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
    <User className="w-4 h-4 mr-2" />
    {t('contacts.basicInfo')}
  </TabsTrigger>
  <TabsTrigger value="contact" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
    <Phone className="w-4 h-4 mr-2" />
    {t('contacts.contact')}
  </TabsTrigger>
  
  {/* Solo mostrar tabs adicionales si NO es Donador o Proveedor */}
  {!esEmpresa && (
    <>
      <TabsTrigger value="pro" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
        <Briefcase className="w-4 h-4 mr-2" />
        {t('contacts.professional')}
      </TabsTrigger>
      <TabsTrigger value="disponibilite" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
        <Calendar className="w-4 h-4 mr-2" />
        {t('contacts.availability')}
      </TabsTrigger>
      <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
        <Settings className="w-4 h-4 mr-2" />
        {t('contacts.other')}
      </TabsTrigger>
    </>
  )}
</TabsList>
```

#### **3. Lógica de la Regla:**

- **Si el contacto es Donador o Proveedor** (`esEmpresa === true`):
  - ✅ Muestra solo tabs "Información Básica" y "Contacto"
  - ❌ Oculta tabs "Profesional", "Disponibilidad" y "Otros"

- **Si el contacto es otro tipo** (Voluntario, Empleado, Programa, PTC):
  - ✅ Muestra TODOS los tabs (Información Básica, Contacto, Profesional, Disponibilidad, Otros)

---

## 📊 CAMPOS VISIBLES POR TIPO

### **Para Donador y Proveedor (Empresas):**

#### **Tab: Información Básica**
- 📝 Nombre de la Empresa *
- 👤 Persona de Contacto
- 📍 Dirección (con autocomplete de calles de Laval)

#### **Tab: Contacto**
- ✉️ Email *
- 📞 Teléfono
- 🌐 Idioma Preferido

---

### **Para Voluntarios, Empleados, Programas, PTC:**

#### **Tab: Información Básica**
- 📝 Nombre *
- 📝 Apellido *
- ⚧️ Género (Sexo)
- 🎂 Fecha de Nacimiento
- 📅 Fecha de Ingreso

#### **Tab: Contacto**
- ✉️ Email *
- 📞 Teléfono
- 📍 Dirección (con autocomplete)
- 🌐 Idioma Preferido

#### **Tab: Profesional** ⭐ VISIBLE
- 💼 Puesto
- ⏰ Horas Semanales
- 🏢 Departamentos (selector multi-departamento)
- 📋 Programa (solo para categorías "Programa" y "PTC")

#### **Tab: Disponibilidad** ⭐ VISIBLE
- 📅 Selector de días disponibles (Lunes-Domingo con horarios)

#### **Tab: Otros** ⭐ VISIBLE
- ✅ Selector de tareas asignadas
- 📝 Notas
- 📄 Documento PDF adjunto

---

## 🎨 EXPERIENCIA DE USUARIO

### **Antes de la Implementación:**
❌ Al crear un Donador o Proveedor, el usuario veía 5 tabs innecesarios  
❌ Confusión sobre qué campos llenar  
❌ Información profesional y disponibilidad no aplicable a empresas  
❌ Formulario largo y complejo para datos simples  

### **Después de la Implementación:**
✅ Al seleccionar "Donador" o "Proveedor", solo se muestran 2 tabs relevantes  
✅ Formulario limpio y enfocado  
✅ Campos específicos para empresas (nombre empresa + persona contacto)  
✅ Proceso rápido y eficiente  
✅ Los tabs ocultos NO están disponibles (simplificación real)  

---

## 🔄 FLUJO DE TRABAJO

### **Escenario 1: Crear Donador**

1. Usuario hace clic en "Nuevo Contacto"
2. Selecciona categoría **"Donador"** 💰
3. **Automáticamente**, el formulario muestra SOLO:
   - Tab "Información Básica"
   - Tab "Contacto"
4. Usuario completa:
   - Nombre de Empresa
   - Persona de Contacto
   - Dirección
   - Email
   - Teléfono
5. Usuario guarda el contacto

**Resultado:** Donador creado con datos esenciales, sin campos innecesarios.

---

### **Escenario 2: Crear Voluntario**

1. Usuario hace clic en "Nuevo Contacto"
2. Selecciona categoría **"Voluntario"** 🤝
3. El formulario muestra TODOS los tabs:
   - Tab "Información Básica"
   - Tab "Contacto"
   - Tab "Profesional"
   - Tab "Disponibilidad"
   - Tab "Otros"
4. Usuario completa toda la información necesaria
5. Usuario guarda el contacto

**Resultado:** Voluntario creado con información completa incluyendo disponibilidad y tareas.

---

## 🎯 VALIDACIONES

La validación también se adapta al tipo de contacto:

### **Para Donador/Proveedor:**
```typescript
if (!formData.nombreEmpresa || !formData.categoria || !formData.email) {
  toast.error(t('contacts.completeRequiredCompany'));
  return;
}
```

**Campos requeridos:**
- ✅ Nombre de Empresa
- ✅ Categoría
- ✅ Email

---

### **Para otros tipos:**
```typescript
if (!formData.nombre || !formData.apellido || !formData.categoria || !formData.email) {
  toast.error(t('contacts.completeRequiredPerson'));
  return;
}
```

**Campos requeridos:**
- ✅ Nombre
- ✅ Apellido
- ✅ Categoría
- ✅ Email

---

## 💡 BENEFICIOS

### **Para Usuarios:**
1. ✅ **Formulario más corto** - Solo 2 tabs en lugar de 5
2. ✅ **Menos confusión** - Solo campos relevantes
3. ✅ **Creación más rápida** - Menos clicks y navegación
4. ✅ **Claridad** - Campos específicos para empresas vs personas

### **Para el Sistema:**
1. ✅ **Datos más limpios** - No se guardan campos innecesarios
2. ✅ **Lógica clara** - Separación entre empresas y personas
3. ✅ **Mantenibilidad** - Reglas de negocio bien definidas
4. ✅ **Escalabilidad** - Fácil agregar nuevas categorías con reglas similares

---

## 🔍 TIPOS DE CONTACTO

### **Empresas (Formulario Simplificado):**
- 💰 **Donador** - Donadores de alimentos y productos
- 🛍️ **Proveedor (Vendedor)** - Proveedores comerciales

### **Personas (Formulario Completo):**
- 🤝 **Voluntario (Bénévole)** - Voluntarios del banco de alimentos
- 👔 **Empleado** - Personal contratado
- 📋 **Programa** - Participantes de programas
- 🎯 **PTC** - Programa de Trabajo Comunitario

---

## 📱 INTERFAZ VISUAL

### **Vista con Donador/Proveedor:**
```
┌─────────────────────────────────────────┐
│  📷 Foto  |  Tabs: [Base] [Contact]     │
│  🏢 Logo  |                              │
│           |  ✅ Información Básica       │
│ Categoría |  ✅ Contacto                 │
│  ✅ 💰    |                              │
│           |  ❌ Profesional (OCULTO)     │
│           |  ❌ Disponibilidad (OCULTO)  │
│           |  ❌ Otros (OCULTO)           │
└─────────────────────────────────────────┘
```

### **Vista con Voluntario/Empleado:**
```
┌─────────────────────────────────────────┐
│  📷 Foto  |  Tabs: [Base][Contact][Pro] │
│  👤 User  |        [Dispo][Autres]       │
│           |                              │
│ Categoría |  ✅ Información Básica       │
│  ✅ 🤝    |  ✅ Contacto                 │
│           |  ✅ Profesional              │
│           |  ✅ Disponibilidad           │
│           |  ✅ Otros                    │
└─────────────────────────────────────────┘
```

---

## 🧪 CASOS DE PRUEBA

### **Caso 1: Crear Donador**
1. Abrir formulario de nuevo contacto
2. Seleccionar categoría "Donador"
3. **Verificar:** Solo aparecen 2 tabs (Base y Contact)
4. **Verificar:** Tab "Profesional" NO está visible
5. **Verificar:** Tab "Disponibilidad" NO está visible
6. **Verificar:** Tab "Otros" NO está visible
7. Completar: Nombre empresa, contacto, email
8. Guardar
9. **Verificar:** Contacto guardado correctamente

### **Caso 2: Cambiar de Donador a Voluntario**
1. Abrir formulario con categoría "Donador" (2 tabs)
2. Cambiar categoría a "Voluntario"
3. **Verificar:** Aparecen automáticamente los 5 tabs
4. **Verificar:** Los campos cambian de empresa a persona

### **Caso 3: Editar Proveedor Existente**
1. Abrir proveedor existente para editar
2. **Verificar:** Solo se muestran 2 tabs
3. Modificar datos
4. Guardar
5. **Verificar:** Cambios guardados correctamente

---

## ✨ RESUMEN TÉCNICO

**Archivo modificado:** `/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx`

**Líneas clave:**
- Línea 69: `const esEmpresa = formData.categoria === 'donador' || formData.categoria === 'vendedor';`
- Líneas 183-192: Lógica condicional para mostrar/ocultar tabs

**Tecnologías:**
- React Conditional Rendering
- TypeScript
- Shadcn UI Tabs
- React i18next (traducciones)

**Estado:** ✅ IMPLEMENTADO Y FUNCIONANDO

---

## 🎊 RESULTADO FINAL

**Formulario simplificado para Donadores y Proveedores:**
- ✅ Solo 2 tabs visibles (Información Básica + Contacto)
- ✅ Campos específicos para empresas
- ✅ Proceso rápido y eficiente
- ✅ Sin información innecesaria
- ✅ Validaciones adaptadas
- ✅ Experiencia de usuario optimizada

**¡Regla de negocio implementada exitosamente!** 🎨✨
