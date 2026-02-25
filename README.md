# Banque Alimentaire - Sistema Integral de Gestión

Sistema completo de gestión para Banque Alimentaire con soporte multilingüe (Français, Español, English, العربية).

## 🚀 Despliegue Rápido

### Para GitHub Pages:

1. **Configura el repositorio en `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     base: '/nombre-de-tu-repositorio/', // 👈 CAMBIA ESTO
     // ...
   })
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   npm install --save-dev gh-pages
   ```

3. **Despliega:**
   ```bash
   npm run deploy
   ```

4. **Configura GitHub Pages:**
   - Ve a Settings → Pages
   - Selecciona branch `gh-pages`
   - ¡Listo! Tu app estará en `https://tu-usuario.github.io/nombre-repo/`

**📖 Guía completa:** [GITHUB_PAGES_GUIDE.md](/GITHUB_PAGES_GUIDE.md)

---

### Para Netlify/Vercel (Más fácil):

**Netlify:**
```bash
npm run build
# Arrastra la carpeta /dist a netlify.com
```

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**📖 Guía completa:** [DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md)

---

## ✨ Características del Sistema

### Módulos Principales:
- 📊 **Dashboard** - Panel de control con estadísticas
- 📦 **Inventario** - Gestión completa de productos
- 🛒 **Comandas** - Sistema de pedidos con QR
- 🏢 **Organismos** - Gestión de organizaciones
- 🚚 **Transporte** - Logística y rutas
- 📈 **Reportes** - Análisis y exportación
- 👥 **Usuarios** - Roles y permisos
- 🏪 **Comptoir** - Atención directa
- 🏷️ **Etiquetas** - Generación de códigos

### Funcionalidades:
- ✅ Multilingüe (FR, ES, EN, AR) con RTL
- ✅ Códigos QR y códigos de barras
- ✅ Export PDF y Excel
- ✅ Sistema de roles y permisos
- ✅ Responsive mobile
- ✅ LocalStorage para datos
- ✅ Generación de ID digitales
- ✅ Sistema de notificaciones

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npx vite preview
```

---

## 📚 Documentación

- [Guía de Despliegue General](/DEPLOYMENT_GUIDE.md)
- [Guía GitHub Pages](/GITHUB_PAGES_GUIDE.md)
- [Índice de Documentación](/INDICE_DOCUMENTACION.md)
- [Sistema de Balances](/src/docs/BALANCES_GUIDE.md)
- [ID Digital](/src/docs/ID-DIGITAL-SISTEMA.md)

---

## 🎨 Diseño del Sistema

**Colores:**
- Azul: `#1E73BE`
- Verde: `#4CAF50`
- Gris: `#F4F4F4` / `#333333`
- Rojo: `#DC3545`
- Naranja: `#FFC107`

**Tipografías:**
- Títulos: Montserrat Bold
- Menús: Montserrat Medium
- Cuerpo: Roboto Regular

**Moneda:** Dólar Canadiense (CAD$)

---

## 🔒 Nota Importante: LocalStorage

Este sistema usa **localStorage** para almacenar datos localmente en el navegador:

⚠️ **Limitaciones:**
- Los datos son locales al navegador
- No hay sincronización entre dispositivos
- Se recomienda hacer backups regulares (Export Excel)

💡 **Para producción multi-usuario:**
- Migrar a una base de datos real (Supabase, Firebase)
- Implementar autenticación de servidor
- Sincronización en tiempo real

---

## 📦 Tecnologías

- **Frontend:** React 18 + TypeScript
- **Routing:** React Router v6
- **Estilos:** Tailwind CSS v4
- **UI:** Radix UI + shadcn/ui
- **i18n:** react-i18next
- **Build:** Vite
- **PDF:** jsPDF
- **Excel:** xlsx
- **QR:** qrcode.react
- **Barcode:** jsbarcode

---

## 📄 Licencia

Ver [LICENSE](LICENSE) para más detalles.

---

## 🆘 Soporte

¿Problemas con el despliegue? Revisa:
1. [GITHUB_PAGES_GUIDE.md](/GITHUB_PAGES_GUIDE.md) - Para GitHub Pages
2. [DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md) - Para otras plataformas
3. Consola del navegador (F12) para errores

---

**Versión:** 1.0.0  
**Fecha:** 14 febrero 2026
