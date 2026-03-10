# 🧹 Instrucciones para Limpiar Datos de Ejemplo

## 📋 Resumen
Este documento explica cómo limpiar las comandas y otros datos de ejemplo del sistema desplegado en producción.

---

## 🎯 Limpiar Solo las Comandas (3 comandas en el Tableau de Bord)

### Opción 1: Desde la Consola del Navegador (Recomendado)

1. **Abrir la aplicación** en tu navegador
2. **Abrir la Consola de Desarrollador:**
   - **Chrome/Edge:** Presiona `F12` o `Ctrl+Shift+J` (Windows/Linux) / `Cmd+Option+J` (Mac)
   - **Firefox:** Presiona `F12` o `Ctrl+Shift+K` (Windows/Linux) / `Cmd+Option+K` (Mac)
   - **Safari:** Presiona `Cmd+Option+C` (Mac)

3. **En la consola, ejecuta:**
   ```javascript
   limpiarDatosProduccion.limpiarComandas()
   ```

4. **Confirma** cuando aparezca el diálogo de confirmación

5. **Recarga la página** con `F5` o `Ctrl+R`

✅ **¡Listo!** Las 3 comandas en el Tableau de Bord desaparecerán.

---

## 🗑️ Otras Opciones de Limpieza Disponibles

### Ver Estado Actual del Sistema
```javascript
limpiarDatosProduccion.verEstado()
```
Muestra cuántos elementos hay de cada tipo (organismos, comandas, productos, etc.)

### Limpiar Solo Organismos
```javascript
limpiarDatosProduccion.limpiarOrganismos()
```

### Limpiar Solo Inventario y Productos
```javascript
limpiarDatosProduccion.limpiarInventario()
```

### Limpiar Solo Contactos
```javascript
limpiarDatosProduccion.limpiarContactos()
```

### 🚨 Limpiar TODO (¡CUIDADO!)
```javascript
limpiarDatosProduccion.limpiarTodo()
```
⚠️ **ADVERTENCIA:** Esta opción elimina TODOS los datos de ejemplo del sistema, dejando solo:
- Usuario David (Développeur)
- Usuario admin (Administrateur)
- Configuración base del sistema
- Departamentos y categorías

---

## 🔔 Limpiar Notificaciones

Las notificaciones se limpian desde la interfaz:

1. **Haz clic** en el icono de campana 🔔 (Bell) en el header superior derecho
2. **Haz clic** en el botón "Limpiar" (icono de basura 🗑️) en la esquina superior derecha del panel
3. Todas las notificaciones se eliminarán instantáneamente

---

## 📊 Ejemplo de Uso Completo

```javascript
// 1. Ver estado actual
limpiarDatosProduccion.verEstado()

// Resultado:
// Usuarios: 2
// Organismos: 5
// Comandas: 3  ← Estas son las que ves en el Tableau de Bord
// Productos: 12
// ...

// 2. Limpiar solo comandas
limpiarDatosProduccion.limpiarComandas()

// 3. Verificar que se limpiaron
limpiarDatosProduccion.verEstado()
// Comandas: 0  ← ¡Limpiado!

// 4. Recargar la página
location.reload()
```

---

## 🔧 Notas Técnicas

### Keys de localStorage afectadas:

- **Comandas:** `banco_alimentos_comandas` → `limpiarComandas()`
- **Notificaciones:** `notificaciones-storage` → Botón en interfaz
- **Organismos:** `organismos_banco_alimentos` → `limpiarOrganismos()`
- **Productos:** `banque_alimentaire_productos` → `limpiarInventario()`

### ⚠️ Importante:
- Todas estas acciones son **irreversibles**
- Siempre se solicita confirmación antes de ejecutar
- Los usuarios **David** y **admin** nunca se eliminan
- La configuración del sistema se mantiene intacta

---

## 🆘 Soporte

Si necesitas ayuda adicional o tienes algún problema:
- Usuario Desarrollador: **David** / **Lettycia26**
- Acceso total al sistema
- Puede ejecutar cualquier función de limpieza

---

**Última actualización:** 2024
**Sistema:** Banque Alimentaire v5.0 PRO
