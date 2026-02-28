import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, UserX, UserCheck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { GestionRoles } from '../usuarios/GestionRoles';
import { GestionDepartamentos } from '../usuarios/GestionDepartamentos';
import { obtenerUsuarios, agregarUsuario, actualizarUsuario, eliminarUsuario, Usuario } from '../../utils/usuarios';
import { rolesPredeterminados } from '../../data/rolesPermisos';

export function Usuarios() {
  const { t } = useTranslation();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  
  // Estado del formulario
  const [formUsuario, setFormUsuario] = useState({
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    rol: 'usuario' as 'administrador' | 'usuario' | 'coordinador',
    password: '',
    confirmPassword: '',
    permisos: [] as string[],
    descripcion: ''
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Resetear formulario cuando se cierra el diálogo
  useEffect(() => {
    if (!usuarioDialogOpen) {
      resetForm();
    }
  }, [usuarioDialogOpen]);

  const cargarUsuarios = () => {
    const usuariosStorage = obtenerUsuarios();
    setUsuarios(usuariosStorage);
    console.log('✅ Usuarios cargados:', usuariosStorage.length);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAbrirEdicion = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormUsuario({
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      password: '',
      confirmPassword: '',
      permisos: usuario.permisos || [],
      descripcion: usuario.descripcion || ''
    });
    setModoEdicion(true);
    setUsuarioDialogOpen(true);
  };

  const handleAbrirCreacion = () => {
    resetForm();
    setModoEdicion(false);
    setUsuarioDialogOpen(true);
  };

  const handleGuardarUsuario = () => {
    // Validaciones
    if (!formUsuario.username.trim()) {
      toast.error('Le nom d\'utilisateur est requis');
      return;
    }
    if (!formUsuario.nombre.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    if (!formUsuario.apellido.trim()) {
      toast.error('Le nom de famille est requis');
      return;
    }
    if (!formUsuario.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    if (!modoEdicion && !formUsuario.password) {
      toast.error('Le mot de passe est requis');
      return;
    }
    if (!modoEdicion && formUsuario.password !== formUsuario.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Debug: Verificar password antes de guardar
    console.log('🔐 Password a guardar:', formUsuario.password ? '***[oculto]***' : '[vacío]');

    try {
      if (modoEdicion && usuarioSeleccionado) {
        // Actualizar usuario existente
        const datosActualizados: Partial<Usuario> = {
          username: formUsuario.username,
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          rol: formUsuario.rol,
          permisos: getPermisosSegunRol(formUsuario.rol),
          descripcion: formUsuario.descripcion
        };

        // Solo actualizar password si se proporcionó uno nuevo
        if (formUsuario.password && formUsuario.password.trim()) {
          datosActualizados.password = formUsuario.password;
          console.log('🔐 Actualizando password del usuario');
        } else {
          console.log('🔐 Manteniendo password anterior (no se proporcionó nuevo)');
        }

        const success = actualizarUsuario(usuarioSeleccionado.id, datosActualizados);
        if (success) {
          toast.success('Utilisateur mis à jour avec succès');
          cargarUsuarios();
          setUsuarioDialogOpen(false);
          resetForm();
        } else {
          toast.error('Erreur lors de la mise à jour');
        }
      } else {
        // Crear nuevo usuario
        console.log('🆕 Creando nuevo usuario con password');
        const nuevoUsuario = agregarUsuario({
          username: formUsuario.username,
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          rol: formUsuario.rol,
          password: formUsuario.password,
          permisos: getPermisosSegunRol(formUsuario.rol),
          descripcion: formUsuario.descripcion
        });
        
        toast.success(`Utilisateur créé: ${nuevoUsuario.username}`);
        cargarUsuarios();
        setUsuarioDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEliminarUsuario = () => {
    if (!usuarioAEliminar) return;

    try {
      const success = eliminarUsuario(usuarioAEliminar.id);
      if (success) {
        toast.success(`Utilisateur supprimé: ${usuarioAEliminar.username}`);
        cargarUsuarios();
        setDeleteDialogOpen(false);
        setUsuarioAEliminar(null);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormUsuario({
      username: '',
      nombre: '',
      apellido: '',
      email: '',
      rol: 'usuario',
      password: '',
      confirmPassword: '',
      permisos: [],
      descripcion: ''
    });
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
  };

  const getPermisosSegunRol = (rol: string): string[] => {
    const permisosPorRol: Record<string, string[]> = {
      administrador: ['administrador_general', 'administrador_liaison'],
      coordinador: ['coordinador'],
      usuario: ['dashboard.ver']
    };
    return permisosPorRol[rol] || ['dashboard.ver'];
  };

  const getRolBadge = (rol: string) => {
    const config = {
      administrador: { bg: 'bg-[#DC3545]', text: 'Administrateur' },
      coordinador: { bg: 'bg-[#1E73BE]', text: 'Coordinateur' },
      usuario: { bg: 'bg-[#4CAF50]', text: 'Utilisateur' }
    }[rol] || { bg: 'bg-gray-500', text: rol };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const usuariosPorRol = {
    administrador: usuarios.filter(u => u.rol === 'administrador').length,
    coordinador: usuarios.filter(u => u.rol === 'coordinador').length,
    usuario: usuarios.filter(u => u.rol === 'usuario').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#333333' }}>
            {t('users.title')}
          </h1>
          <p className="text-[#666666]">{t('users.subtitle')}</p>
        </div>
        <Button 
          onClick={handleAbrirCreacion}
          className="bg-[#1E73BE] hover:bg-[#1557A0]" 
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('users.newUser')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#DC3545]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">Administrateurs</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#DC3545' }}>
                {usuariosPorRol.administrador}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">Coordinateurs</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                {usuariosPorRol.coordinador}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">Utilisateurs</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                {usuariosPorRol.usuario}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="usuarios" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            👥 {t('common.users')}
          </TabsTrigger>
          <TabsTrigger value="roles" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            🛡️ {t('users.roles')}
          </TabsTrigger>
          <TabsTrigger value="departamentos" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            🏢 {t('users.departments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                Liste des Utilisateurs ({usuarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map(usuario => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-medium">
                              {usuario.nombre[0]}{usuario.apellido[0]}
                            </div>
                            <div>
                              <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                              <p className="text-sm text-[#666666]">@{usuario.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#666666]">{usuario.email}</TableCell>
                        <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                        <TableCell className="text-sm text-[#666666] max-w-xs truncate">
                          {usuario.descripcion || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Éditer"
                              onClick={() => handleAbrirEdicion(usuario)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#DC3545]"
                              title="Supprimer"
                              onClick={() => {
                                setDeleteDialogOpen(true);
                                setUsuarioAEliminar(usuario);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <GestionRoles />
        </TabsContent>

        <TabsContent value="departamentos">
          <GestionDepartamentos />
        </TabsContent>
      </Tabs>

      {/* Dialog Crear/Editar Usuario */}
      <Dialog open={usuarioDialogOpen} onOpenChange={setUsuarioDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? 'Éditer Utilisateur' : 'Nouvel Utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {modoEdicion ? 'Modifier les informations de l\'utilisateur' : 'Créer un nouvel utilisateur du système'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom d'utilisateur *</Label>
                <Input 
                  placeholder="transport" 
                  value={formUsuario.username} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle *</Label>
                <Select value={formUsuario.rol} onValueChange={(value: any) => setFormUsuario({ ...formUsuario, rol: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesPredeterminados.filter(rol => rol.activo).map(rol => (
                      <SelectItem key={rol.id} value={rol.id}>
                        <div className="flex items-center gap-2">
                          <span>{rol.icono}</span>
                          <span>{rol.nombre}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input 
                  placeholder="Marc" 
                  value={formUsuario.nombre} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input 
                  placeholder="Transporteur" 
                  value={formUsuario.apellido} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, apellido: e.target.value })} 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  placeholder="utilisateur@banque-alimentaire.org" 
                  value={formUsuario.email} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe {!modoEdicion && '*'}</Label>
                <Input 
                  type="password" 
                  placeholder={modoEdicion ? "Laisser vide pour ne pas changer" : "••••••••"} 
                  value={formUsuario.password} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer mot de passe {!modoEdicion && '*'}</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formUsuario.confirmPassword} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, confirmPassword: e.target.value })} 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Responsable Transport - Gestion des Livraisons" 
                  value={formUsuario.descripcion} 
                  onChange={(e) => setFormUsuario({ ...formUsuario, descripcion: e.target.value })} 
                />
              </div>
            </div>

            <div className="bg-[#F4F4F4] p-4 rounded-lg space-y-2">
              <h4 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Permissions par Rôle
              </h4>
              <ul className="text-sm text-[#666666] space-y-1">
                <li><strong>Administrateur:</strong> Accès complet au système</li>
                <li><strong>Coordinateur:</strong> Lecture seule de tous les modules</li>
                <li><strong>Utilisateur:</strong> Permissions personnalisées selon la fonction</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setUsuarioDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleGuardarUsuario} className="bg-[#4CAF50] hover:bg-[#45a049]">
                {modoEdicion ? 'Mettre à jour' : 'Créer Utilisateur'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Supprimer Utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioAEliminar && (
                <div className="space-y-3">
                  <p>Êtes-vous sûr de vouloir supprimer <strong>{usuarioAEliminar.nombre} {usuarioAEliminar.apellido}</strong> (@{usuarioAEliminar.username})?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ Cette action est irréversible
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarUsuario}
              className="bg-[#DC3545] hover:bg-[#c82333]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}