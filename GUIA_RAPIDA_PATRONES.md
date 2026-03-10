# 🚀 Guía Rápida de Patrones - Banco de Alimentos

Referencia rápida de patrones comunes y sus implementaciones.

---

## 📑 Índice Rápido

- [🔹 Formulario Simplificado por Tipo](#-formulario-simplificado-por-tipo)
- [🔹 Dialog Accesible](#-dialog-accesible)
- [🔹 Renderizado Condicional](#-renderizado-condicional)
- [🔹 Tabs Dinámicos](#-tabs-dinámicos)

---

## 🔹 Formulario Simplificado por Tipo

### Copy-Paste Ready:

```tsx
// 1️⃣ Definir la lógica de detección
const esEmpresa = formData.categoria === 'donador' || formData.categoria === 'vendedor';

// 2️⃣ Renderizar condicionalmente
<Tabs defaultValue="base">
  <TabsList>
    {/* ✅ Siempre visible */}
    <TabsTrigger value="base">Básico</TabsTrigger>
    <TabsTrigger value="contact">Contacto</TabsTrigger>
    
    {/* ✅ Condicional */}
    {!esEmpresa && (
      <>
        <TabsTrigger value="pro">Profesional</TabsTrigger>
        <TabsTrigger value="dispo">Disponibilidad</TabsTrigger>
      </>
    )}
  </TabsList>
  
  {/* 3️⃣ Contenido adaptado */}
  <TabsContent value="base">
    {esEmpresa ? (
      <CamposEmpresa />
    ) : (
      <CamposPersona />
    )}
  </TabsContent>
</Tabs>
```

### Variaciones:

```tsx
// Por rol
const esVoluntario = formData.rol === 'benevole';

// Por múltiples condiciones
const esContactoSimple = ['donador', 'vendedor', 'transporteur'].includes(formData.tipo);

// Por permiso
const puedeVerTodos = tienePermiso(usuario, 'ver_todos_tabs');
```

---

## 🔹 Dialog Accesible

### Patrón Base (Copy-Paste):

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-describedby="mi-dialog-description">
    <DialogHeader>
      <DialogTitle>Mi Título</DialogTitle>
      <DialogDescription id="mi-dialog-description">
        Mi descripción accesible
      </DialogDescription>
    </DialogHeader>
    
    {/* Contenido */}
    
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Cancelar</Button>
      <Button onClick={handleSubmit}>Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Con Descripción Oculta:

```tsx
<DialogContent aria-describedby="mi-dialog-description">
  <DialogHeader>
    <DialogTitle>Mi Título Descriptivo</DialogTitle>
    <DialogDescription id="mi-dialog-description" className="sr-only">
      Descripción solo para lectores de pantalla
    </DialogDescription>
  </DialogHeader>
  {/* ... */}
</DialogContent>
```

### Fullscreen:

```tsx
<DialogContent 
  className="w-screen h-screen max-w-none"
  aria-describedby="fullscreen-description"
>
  <DialogHeader className="sr-only">
    <DialogTitle>Título Accesible</DialogTitle>
    <DialogDescription id="fullscreen-description">
      Descripción completa
    </DialogDescription>
  </DialogHeader>
  
  {/* Header visual personalizado */}
  <div className="custom-header">
    <h2>Título Visual</h2>
  </div>
  
  {/* Contenido */}
</DialogContent>
```

---

## 🔹 Renderizado Condicional

### Por Tipo de Usuario:

```tsx
function Dashboard() {
  const usuario = obtenerUsuarioSesion();
  const esAdmin = usuario?.rol === 'admin';
  const esDesarrollador = usuario?.permisos?.includes('desarrollador');
  
  return (
    <div>
      {/* ✅ Para todos */}
      <Seccion1 />
      
      {/* ✅ Solo administradores */}
      {esAdmin && <SeccionAdmin />}
      
      {/* ✅ Solo desarrolladores */}
      {esDesarrollador && <SeccionDev />}
      
      {/* ✅ Administradores O desarrolladores */}
      {(esAdmin || esDesarrollador) && <SeccionAvanzada />}
    </div>
  );
}
```

### Por Estado de Datos:

```tsx
function ListaProductos({ productos }) {
  const hayProductos = productos.length > 0;
  const cargando = productos === null;
  
  return (
    <div>
      {cargando && <Spinner />}
      
      {!cargando && !hayProductos && (
        <EmptyState mensaje="No hay productos" />
      )}
      
      {!cargando && hayProductos && (
        <Table data={productos} />
      )}
    </div>
  );
}
```

### Por Categoría de Entidad:

```tsx
function FormularioContacto({ contacto }) {
  const tipo = contacto.categoria;
  
  // ✅ Switch completo
  const renderCamposEspecificos = () => {
    switch(tipo) {
      case 'donador':
      case 'vendedor':
        return <CamposEmpresa />;
      
      case 'benevole':
      case 'empleado':
        return <CamposPersona />;
      
      case 'programa':
      case 'ptc':
        return <CamposPrograma />;
      
      default:
        return <CamposBasicos />;
    }
  };
  
  return (
    <div>
      <CamposComunes />
      {renderCamposEspecificos()}
    </div>
  );
}
```

---

## 🔹 Tabs Dinámicos

### Tabs según Permisos:

```tsx
function ConfiguracionPage() {
  const usuario = obtenerUsuarioSesion();
  
  const tabs = [
    { id: 'general', label: 'General', permiso: null },
    { id: 'usuarios', label: 'Usuarios', permiso: 'gestionar_usuarios' },
    { id: 'sistema', label: 'Sistema', permiso: 'configurar_sistema' },
    { id: 'dev', label: 'Desarrollador', permiso: 'desarrollador' }
  ];
  
  const tabsVisibles = tabs.filter(tab => 
    !tab.permiso || tienePermiso(usuario, tab.permiso)
  );
  
  return (
    <Tabs defaultValue="general">
      <TabsList>
        {tabsVisibles.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabsVisibles.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {/* Contenido del tab */}
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

### Tabs con Badge de Contador:

```tsx
function GestionPedidos({ pedidos }) {
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const aprobados = pedidos.filter(p => p.estado === 'aprobado').length;
  
  return (
    <Tabs defaultValue="todos">
      <TabsList>
        <TabsTrigger value="todos">
          Todos
          <Badge className="ml-2">{pedidos.length}</Badge>
        </TabsTrigger>
        
        <TabsTrigger value="pendientes">
          Pendientes
          {pendientes > 0 && (
            <Badge variant="warning" className="ml-2">
              {pendientes}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="aprobados">
          Aprobados
          <Badge variant="success" className="ml-2">
            {aprobados}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

---

## 💾 Snippets VS Code

Agrega estos snippets a tu editor:

### `dialog-accesible`

```json
{
  "Dialog Accesible": {
    "prefix": "dialog-acc",
    "body": [
      "<Dialog open={${1:open}} onOpenChange={${2:setOpen}}>",
      "  <DialogContent aria-describedby=\"${3:dialog}-description\">",
      "    <DialogHeader>",
      "      <DialogTitle>${4:Título}</DialogTitle>",
      "      <DialogDescription id=\"${3:dialog}-description\">",
      "        ${5:Descripción}",
      "      </DialogDescription>",
      "    </DialogHeader>",
      "    ",
      "    ${6:// Contenido}",
      "    ",
      "    <DialogFooter>",
      "      <Button variant=\"outline\" onClick={() => ${2:setOpen}(false)}>",
      "        Cancelar",
      "      </Button>",
      "      <Button onClick={${7:handleSubmit}}>",
      "        Guardar",
      "      </Button>",
      "    </DialogFooter>",
      "  </DialogContent>",
      "</Dialog>"
    ]
  }
}
```

### `tabs-condicional`

```json
{
  "Tabs Condicional": {
    "prefix": "tabs-cond",
    "body": [
      "const ${1:condicion} = ${2:formData}.${3:campo} === '${4:valor}';",
      "",
      "<Tabs defaultValue=\"${5:base}\">",
      "  <TabsList>",
      "    <TabsTrigger value=\"${5:base}\">Base</TabsTrigger>",
      "    ",
      "    {!${1:condicion} && (",
      "      <>",
      "        <TabsTrigger value=\"${6:extra}\">Extra</TabsTrigger>",
      "      </>",
      "    )}",
      "  </TabsList>",
      "  ",
      "  <TabsContent value=\"${5:base}\">",
      "    {${1:condicion} ? (",
      "      <${7:ComponenteA} />",
      "    ) : (",
      "      <${8:ComponenteB} />",
      "    )}",
      "  </TabsContent>",
      "</Tabs>"
    ]
  }
}
```

---

## 🎨 Ejemplos de Uso Real

### Caso 1: Formulario de Contacto con Tabs Dinámicos

```tsx
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { User, Phone, Briefcase } from 'lucide-react';

function FormularioContacto() {
  const [formData, setFormData] = useState({
    categoria: 'benevole',
    nombre: '',
    empresa: ''
  });
  
  // 🎯 Lógica de simplificación
  const esEmpresa = ['donador', 'vendedor'].includes(formData.categoria);
  
  return (
    <Tabs defaultValue="base">
      <TabsList>
        <TabsTrigger value="base">
          <User className="w-4 h-4 mr-2" />
          Información Básica
        </TabsTrigger>
        
        <TabsTrigger value="contact">
          <Phone className="w-4 h-4 mr-2" />
          Contacto
        </TabsTrigger>
        
        {/* 🎯 Solo para personas */}
        {!esEmpresa && (
          <TabsTrigger value="pro">
            <Briefcase className="w-4 h-4 mr-2" />
            Profesional
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="base">
        {esEmpresa ? (
          <input 
            placeholder="Nombre de la Empresa" 
            value={formData.empresa}
            onChange={e => setFormData({...formData, empresa: e.target.value})}
          />
        ) : (
          <input 
            placeholder="Nombre" 
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
```

### Caso 2: Dialog de Confirmación Accesible

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

function EliminarProducto({ producto, onEliminar }) {
  const [open, setOpen] = useState(false);
  
  const handleEliminar = () => {
    onEliminar(producto.id);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby="eliminar-producto-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Eliminar Producto
          </DialogTitle>
          <DialogDescription id="eliminar-producto-description">
            ¿Estás seguro de que deseas eliminar "{producto.nombre}"? 
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
          <strong>Advertencia:</strong> Se eliminará permanentemente del inventario.
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleEliminar}>
            Eliminar Definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Caso 3: Tabs con Permisos y Contadores

```tsx
import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { obtenerUsuarioSesion, tienePermiso } from './utils/sesion';

function PanelAdministracion({ usuarios, pedidos, reportes }) {
  const usuario = obtenerUsuarioSesion();
  
  const tabs = useMemo(() => [
    { 
      id: 'usuarios', 
      label: 'Usuarios', 
      permiso: 'gestionar_usuarios',
      contador: usuarios.length
    },
    { 
      id: 'pedidos', 
      label: 'Pedidos', 
      permiso: 'ver_pedidos',
      contador: pedidos.filter(p => p.estado === 'pendiente').length
    },
    { 
      id: 'reportes', 
      label: 'Reportes', 
      permiso: 'ver_reportes',
      contador: reportes.length
    }
  ], [usuarios, pedidos, reportes]);
  
  const tabsVisibles = tabs.filter(tab => tienePermiso(usuario, tab.permiso));
  
  if (tabsVisibles.length === 0) {
    return <div>No tienes permisos para acceder a esta sección</div>;
  }
  
  return (
    <Tabs defaultValue={tabsVisibles[0].id}>
      <TabsList>
        {tabsVisibles.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
            {tab.contador > 0 && (
              <Badge className="ml-2" variant="secondary">
                {tab.contador}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabsVisibles.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {/* Contenido específico de cada tab */}
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

---

## ✅ Checklist Final

Antes de hacer commit:

```bash
✅ Dialog tiene aria-describedby
✅ DialogDescription existe con ID correcto
✅ Tabs condicionales funcionan correctamente
✅ No hay warnings en consola
✅ Formularios se adaptan según tipo
✅ Permisos se verifican antes de renderizar
✅ IDs son únicos
✅ Código está documentado
```

---

**Guía creada:** Marzo 2026  
**Versión:** 1.0  
**Para:** Sistema Banco de Alimentos
