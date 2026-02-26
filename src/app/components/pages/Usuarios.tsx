import React, { useState } from 'react';
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
import { mockUsuarios } from '../../data/mockData';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { GestionRoles } from '../usuarios/GestionRoles';
import { GestionDepartamentos } from '../usuarios/GestionDepartamentos';

export function Usuarios() {
  const { t } = useTranslation();
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<any>(null);
  
  // Estado del formulario
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    email: '',
    rol: '',
    password: '',
    confirmPassword: '',
    activo: true
  });

  const usuariosFiltrados = mockUsuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCrearUsuario = () => {
    toast.success(t('messages.created'));
    setUsuarioDialogOpen(false);
    resetForm();
  };

  const handleAbrirEdicion = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setFormUsuario({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      password: '',
      confirmPassword: '',
      activo: usuario.activo
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
    if (modoEdicion) {
      toast.success(t('messages.updated'));
    } else {
      toast.success(t('messages.created'));
    }
    setUsuarioDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormUsuario({
      nombre: '',
      email: '',
      rol: '',
      password: '',
      confirmPassword: '',
      activo: true
    });
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
  };

  const getRolBadge = (rol: string) => {
    const config = {
      administrador: { bg: 'bg-[#DC3545]', text: 'Administrador' },
      coordinador: { bg: 'bg-[#1E73BE]', text: 'Coordinador' },
      almacenista: { bg: 'bg-[#4CAF50]', text: 'Almacenista' },
      transportista: { bg: 'bg-[#FFC107]', text: 'Transportista' }
    }[rol] || { bg: 'bg-gray-500', text: rol };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const usuariosPorRol = {
    administrador: mockUsuarios.filter(u => u.rol === 'administrador').length,
    coordinador: mockUsuarios.filter(u => u.rol === 'coordinador').length,
    almacenista: mockUsuarios.filter(u => u.rol === 'almacenista').length,
    transportista: mockUsuarios.filter(u => u.rol === 'transportista').length
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
        <Dialog open={usuarioDialogOpen} onOpenChange={setUsuarioDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('users.newUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {modoEdicion ? t('users.editUser') : t('users.newUser')}
              </DialogTitle>
              <DialogDescription>
                {t('users.enterDetails')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>{t('users.fullName')}</Label>
                  <Input placeholder="Juan Pérez" value={formUsuario.nombre} onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('users.email')}</Label>
                  <Input type="email" placeholder="usuario@bancoalimentos.org" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('users.role')}</Label>
                  <Select value={formUsuario.rol} onValueChange={(value) => setFormUsuario({ ...formUsuario, rol: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('users.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">{t('users.administrator')}</SelectItem>
                      <SelectItem value="coordinador">{t('users.coordinator')}</SelectItem>
                      <SelectItem value="almacenista">{t('users.warehouseman')}</SelectItem>
                      <SelectItem value="transportista">{t('users.transporter')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('users.password')}</Label>
                  <Input type="password" placeholder="••••••••" value={formUsuario.password} onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('users.confirmPassword')}</Label>
                  <Input type="password" placeholder="••••••••" value={formUsuario.confirmPassword} onChange={(e) => setFormUsuario({ ...formUsuario, confirmPassword: e.target.value })} />
                </div>
              </div>

              <div className="bg-[#F4F4F4] p-4 rounded-lg space-y-2">
                <h4 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('users.permissionsByRole')}
                </h4>
                <ul className="text-sm text-[#666666] space-y-1">
                  <li><strong>{t('users.administrator')}:</strong> {t('users.fullAccess')}</li>
                  <li><strong>{t('users.coordinator')}:</strong> {t('users.manageOrders')}</li>
                  <li><strong>{t('users.warehouseman')}:</strong> {t('users.manageInventory')}</li>
                  <li><strong>{t('users.transporter')}:</strong> {t('users.manageTransport')}</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setUsuarioDialogOpen(false)}>
                  {t('users.cancel')}
                </Button>
                <Button onClick={handleGuardarUsuario} className="bg-[#4CAF50] hover:bg-[#45a049]">
                  {modoEdicion ? t('users.updateUser') : t('users.createUser')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#DC3545]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">{t('users.administrators')}</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#DC3545' }}>
                {usuariosPorRol.administrador}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">{t('users.coordinators')}</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                {usuariosPorRol.coordinador}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">{t('users.warehousemen')}</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                {usuariosPorRol.almacenista}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-[#666666]">{t('users.transporters')}</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>
                {usuariosPorRol.transportista}
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
                placeholder={t('users.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {t('users.userList')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('users.user')}</TableHead>
                      <TableHead>{t('users.email')}</TableHead>
                      <TableHead>{t('users.role')}</TableHead>
                      <TableHead>{t('users.registrationDate')}</TableHead>
                      <TableHead>{t('users.status')}</TableHead>
                      <TableHead>{t('users.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map(usuario => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-medium">
                              {usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{usuario.nombre}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#666666]">{usuario.email}</TableCell>
                        <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                        <TableCell className="text-sm text-[#666666]">{usuario.createdAt}</TableCell>
                        <TableCell>
                          {usuario.activo ? (
                            <Badge className="bg-[#4CAF50] hover:bg-[#45a049]">
                              <UserCheck className="w-3 h-3 mr-1" />
                              {t('users.active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <UserX className="w-3 h-3 mr-1" />
                              {t('users.inactive')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" title={t('users.editUser')} onClick={() => handleAbrirEdicion(usuario)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#DC3545]"
                              title={usuario.activo ? t('users.deactivate') : t('users.activate')}
                              onClick={() => toast.success(usuario.activo ? t('users.userDeactivated') : t('users.userActivated'))}
                            >
                              {usuario.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#DC3545]"
                              title={t('users.deleteUser')}
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('users.deleteUser')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioAEliminar && (
                <div className="space-y-3">
                  <p>{t('users.deleteConfirm')} <strong>{usuarioAEliminar.nombre}</strong>?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ {t('users.warningMessage')}
                    </p>
                    <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                      <li>{t('users.userInfo')}</li>
                      <li>{t('users.permissionsAccess')}</li>
                      <li>{t('users.activityHistory')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              {t('users.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${t('users.userDeleted')}: "${usuarioAEliminar?.nombre}"`);
                setDeleteDialogOpen(false);
                setUsuarioAEliminar(null);
              }}
              className="bg-[#DC3545] hover:bg-[#c82333]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('users.deleteUser')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}