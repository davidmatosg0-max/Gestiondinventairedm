# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión para Banco de Alimentos! 🎉

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 📜 Código de Conducta

Este proyecto se adhiere a un Código de Conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamiento inaceptable a soporte@bancoalimentos.org.

### Nuestros Estándares

✅ **Comportamientos que fomentamos:**
- Uso de lenguaje acogedor e inclusivo
- Respeto a diferentes puntos de vista y experiencias
- Aceptación de críticas constructivas
- Enfoque en lo mejor para la comunidad
- Empatía hacia otros miembros

❌ **Comportamientos inaceptables:**
- Uso de lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes o ataques personales
- Acoso público o privado
- Publicación de información privada de otros sin permiso
- Cualquier conducta que sea inapropiada en un entorno profesional

## 🤝 ¿Cómo puedo contribuir?

### Tipos de Contribuciones

1. **Reportar Bugs** 🐛
2. **Sugerir Nuevas Funcionalidades** 💡
3. **Mejorar Documentación** 📚
4. **Corregir Bugs** 🔧
5. **Implementar Funcionalidades** ✨
6. **Traducir a Nuevos Idiomas** 🌍
7. **Mejorar el Diseño UI/UX** 🎨

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- Node.js >= 18.x
- pnpm >= 8.x (recomendado)
- Git
- Editor de código (VSCode recomendado)

### Instalación

1. **Fork el repositorio**
   - Ve a https://github.com/tu-usuario/banco-alimentos
   - Clic en "Fork" en la esquina superior derecha

2. **Clonar tu fork**
   ```bash
   git clone https://github.com/TU-USUARIO/banco-alimentos.git
   cd banco-alimentos
   ```

3. **Agregar el repositorio original como upstream**
   ```bash
   git remote add upstream https://github.com/usuario-original/banco-alimentos.git
   ```

4. **Instalar dependencias**
   ```bash
   pnpm install
   ```

5. **Crear una rama para tu feature**
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

### Extensiones de VSCode Recomendadas

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- i18n Ally (para traducciones)
- TypeScript Vue Plugin (Volar)

## 📝 Guías de Estilo

### TypeScript

```typescript
// ✅ CORRECTO - Interfaces con PascalCase
interface UserData {
  id: string;
  name: string;
  email: string;
}

// ✅ CORRECTO - Functional components con tipos
export function MyComponent({ data }: { data: UserData }) {
  return <div>{data.name}</div>;
}

// ❌ INCORRECTO - No usar any
const fetchData = (id: any) => { ... }

// ✅ CORRECTO - Tipar correctamente
const fetchData = (id: string | number) => { ... }
```

### Componentes React

```tsx
// ✅ CORRECTO - Functional component con TypeScript
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  onClose: () => void;
}

export function MyComponent({ title, onClose }: Props) {
  const { t } = useTranslation();
  
  return (
    <div className="p-4">
      <h2>{title}</h2>
      <button onClick={onClose}>{t('common.close')}</button>
    </div>
  );
}
```

### CSS con Tailwind

```tsx
// ✅ CORRECTO - Usar clases de Tailwind CSS v4
<div className="p-4 bg-[#1E73BE] text-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// ✅ CORRECTO - Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ❌ EVITAR - CSS inline extensivo
<div style={{ padding: '16px', backgroundColor: '#1E73BE' }}>
```

### Internacionalización (i18n)

```typescript
// ✅ CORRECTO - Usar traducciones
const { t } = useTranslation();
<h1>{t('comptoir.dashboard')}</h1>

// ❌ INCORRECTO - Texto hardcodeado
<h1>Panel Principal</h1>

// ✅ CORRECTO - Agregar nueva traducción
// En /src/i18n/locales/es.json
{
  "comptoir": {
    "newFeature": "Nueva Funcionalidad"
  }
}
```

### Estructura de Archivos

```
/src/app/components/
├── comptoir/              # Módulo Comptoir
│   ├── Component.tsx     # PascalCase para componentes
│   └── utils.ts          # camelCase para utilidades
├── ui/                   # Componentes UI reutilizables
└── pages/                # Páginas principales
```

### Nombres de Archivos

- **Componentes**: `PascalCase.tsx` (ej: `FicheBeneficiaire.tsx`)
- **Hooks**: `camelCase.ts` (ej: `useBranding.ts`)
- **Utilidades**: `camelCase.ts` (ej: `formatDate.ts`)
- **Tipos**: `PascalCase.types.ts` (ej: `User.types.ts`)

### Comentarios

```typescript
// ✅ CORRECTO - Comentarios descriptivos en español o inglés
// Función para calcular el valor total de la distribución
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.value, 0);
};

// ✅ CORRECTO - JSDoc para funciones complejas
/**
 * Genera un PDF con la información del beneficiario
 * @param beneficiary - Datos del beneficiario
 * @param includeQR - Si debe incluir código QR
 * @returns Promise con el blob del PDF
 */
export async function generatePDF(
  beneficiary: Beneficiary,
  includeQR: boolean = true
): Promise<Blob> {
  // ...
}
```

### Git Commits

Usar mensajes descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# ✅ CORRECTO
feat(comptoir): agregar filtro por fecha en demandas
fix(calendar): corregir sincronización con demandas aprobadas
docs(readme): actualizar instrucciones de instalación
style(ui): mejorar espaciado en cards de beneficiarios
refactor(types): mover interfaces a archivo separado
test(utils): agregar tests para formatDate
chore(deps): actualizar dependencias

# ❌ INCORRECTO
fix
updated stuff
changes
WIP
```

### Formato de Código

El proyecto usa ESLint y Prettier. Ejecuta antes de commit:

```bash
# Formatear código
pnpm format

# Verificar lint
pnpm lint

# Corregir problemas automáticamente
pnpm lint:fix
```

## 🔄 Proceso de Pull Request

### 1. Mantener tu fork actualizado

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Crear una rama descriptiva

```bash
git checkout -b feat/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
# o
git checkout -b docs/actualizar-readme
```

### 3. Hacer tus cambios

- Escribe código limpio y bien documentado
- Sigue las guías de estilo
- Agrega tests si es necesario
- Actualiza la documentación

### 4. Commit tus cambios

```bash
git add .
git commit -m "feat(modulo): descripción clara del cambio"
```

### 5. Push a tu fork

```bash
git push origin feat/nueva-funcionalidad
```

### 6. Crear Pull Request

1. Ve a tu fork en GitHub
2. Clic en "Compare & pull request"
3. Completa la plantilla de PR:

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue las guías de estilo
- [ ] He revisado mi propio código
- [ ] He comentado el código en áreas complejas
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi cambio
- [ ] Todos los tests pasan localmente
- [ ] He actualizado las traducciones (si aplica)
```

### 7. Revisión de Código

- Responde a los comentarios de los revisores
- Haz los cambios solicitados
- Push de nuevos commits a la misma rama

### 8. Merge

Una vez aprobado, tu PR será mergeado al repositorio principal. ¡Gracias por tu contribución! 🎉

## 🐛 Reportar Bugs

### Antes de reportar

1. **Verifica** que no sea un issue duplicado
2. **Actualiza** a la última versión
3. **Reproduce** el bug de forma consistente

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del bug.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Scrollear hasta '...'
4. Ver el error

**Comportamiento Esperado**
Descripción de lo que esperabas que sucediera.

**Comportamiento Actual**
Descripción de lo que realmente sucede.

**Screenshots**
Si aplica, agrega screenshots.

**Entorno**
- OS: [ej. Windows 11, macOS 14]
- Navegador: [ej. Chrome 120, Firefox 121]
- Versión del Sistema: [ej. 1.2.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
**¿Tu feature request está relacionado con un problema?**
Descripción clara del problema. Ej: Siempre me frustra cuando [...]

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que suceda.

**Describe alternativas que hayas considerado**
Descripción de soluciones o features alternativas.

**Contexto Adicional**
Cualquier otra información, screenshots o ejemplos.

**Impacto**
- [ ] Bajo - Nice to have
- [ ] Medio - Mejora notable
- [ ] Alto - Feature crítico
```

## 🌍 Contribuir con Traducciones

### Agregar un Nuevo Idioma

1. Crear archivo en `/src/i18n/locales/xx.json`
2. Copiar estructura de `es.json`
3. Traducir todos los keys
4. Actualizar `/src/i18n/i18n.ts`
5. Agregar bandera en el selector de idioma

### Mejorar Traducciones Existentes

1. Editar archivo correspondiente en `/src/i18n/locales/`
2. Mantener los keys sin cambios
3. Mejorar el texto traducido
4. Verificar contexto en la aplicación

## 🎨 Contribuir con Diseño

### UI/UX Improvements

- Mantener los colores corporativos
- Seguir las guías de Tailwind CSS v4
- Asegurar accesibilidad (WCAG 2.1 AA)
- Mantener diseño responsive
- Agregar animaciones sutiles con Motion

### Assets

- **Iconos**: Usar Lucide React
- **Imágenes**: Optimizar con formato WebP
- **SVG**: Minimizar antes de agregar

## ❓ Preguntas

Si tienes preguntas sobre el proceso de contribución:

- 📧 Email: soporte@bancoalimentos.org
- 💬 Discord: [Servidor de la comunidad](https://discord.gg/tu-servidor)
- 🐛 GitHub Issues: Para preguntas técnicas

## 🏆 Reconocimientos

Todos los contribuidores serán agregados a la sección de reconocimientos del README.

¡Gracias por ayudar a mejorar el Sistema de Gestión para Banco de Alimentos! 🙏

---

**Juntos hacemos la diferencia** ❤️
