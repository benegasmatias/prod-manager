'use client'

import React, { useState, useEffect } from 'react'
import {
    Search,
    Bell,
    User,
    ChevronDown,
    Building2,
    Plus,
    Sun,
    Moon,
    Settings as SettingsIcon,
    Trash2,
    Monitor,
    Menu as MenuIcon,
    LogOut
} from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/src/lib/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/src/components/ui/button'
import { useNegocio } from '@/src/context/NegocioContext'
import { useTheme } from '@/src/context/ThemeContext'
import { Rubro } from '@/src/domain/negocio'
import { cn } from '@/src/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog"
import { Input } from '@/src/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from '@/src/components/ui/sheet'
import { SidebarContent } from './Sidebar'
import { useSidebar } from '@/src/context/SidebarContext'

export function Topbar() {
    const { isCollapsed } = useSidebar()
    const {
        negocios,
        negocioActivoId,
        negocioActivo,
        setActivo,
        addNegocio,
        updateNegocio,
        removeNegocio
    } = useNegocio()
    const { theme, setTheme, resolvedTheme } = useTheme()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formNombre, setFormNombre] = useState('')
    const [formRubro, setFormRubro] = useState<Rubro>('GENERICO')

    const [userProfile, setUserProfile] = useState<any>(null)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
    const [profileName, setProfileName] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
                try {
                    const profile: any = await api.users.getMe(session.access_token)
                    setUserProfile(profile)
                    setProfileName(profile.fullName || '')
                } catch (err) {
                    console.error('Error loading profile:', err)
                }
            }
        }
        loadProfile()
    }, [])

    const handleUpdateProfile = async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return

        setSavingProfile(true)
        try {
            const updated = await api.users.updateProfile(session.access_token, { fullName: profileName })
            setUserProfile(updated)
            toast.success('Perfil actualizado')
            setIsProfileDialogOpen(false)
        } catch (err) {
            toast.error('Error al actualizar perfil')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleLogout = async () => {
        await logout()
    }

    const handleOpenAdd = () => {
        setEditingId(null)
        setFormNombre('')
        setFormRubro('GENERICO')
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        const found = negocios.find(n => n.id === id)
        if (found) {
            setEditingId(id)
            setFormNombre(found.nombre)
            setFormRubro(found.rubro)
            setIsDialogOpen(true)
        }
    }

    const [isSavingBusiness, setIsSavingBusiness] = useState(false)

    const handleSave = async () => {
        if (!formNombre) {
            toast.error('El nombre es obligatorio')
            return
        }

        setIsSavingBusiness(true)
        try {
            if (editingId) {
                await updateNegocio(editingId, { nombre: formNombre, rubro: formRubro })
                setIsDialogOpen(false)
            } else {
                const result = await addNegocio(formNombre, formRubro)
                if (result?.business?.id) {
                    setActivo(result.business.id)
                }
                setIsDialogOpen(false)
            }
        } catch (error) {
            // Error already toasted in context
        } finally {
            setIsSavingBusiness(false)
        }
    }

    return (
        <header className={cn(
            "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/60 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80 transition-all duration-300",
            isCollapsed ? "lg:left-[88px]" : "lg:left-[280px]",
            "left-0"
        )}>
            <div className="flex items-center gap-4 flex-1">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <MenuIcon className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px]">
                        <div className="p-6 h-full">
                            <SidebarContent onItemClick={() => setIsSheetOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="hidden lg:flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 gap-2 border-none bg-zinc-100 hover:bg-zinc-200/70 transition-colors font-bold text-xs uppercase tracking-widest px-3 rounded-xl dark:bg-zinc-900 dark:hover:bg-zinc-800">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span className="max-w-[150px] truncate">{negocioActivo?.nombre || 'Seleccionar Negocio'}</span>
                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[280px] rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 mt-1">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">Mis Negocios</DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
                            <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
                                {negocios.map((n) => (
                                    <div key={n.id} className="flex items-center group relative">
                                        <DropdownMenuItem
                                            onClick={() => setActivo(n.id)}
                                            className={cn(
                                                "flex-1 rounded-xl px-3 py-2.5 cursor-pointer flex flex-col items-start gap-0.5 transition-all",
                                                negocioActivoId === n.id
                                                    ? "bg-primary/5 text-primary border border-primary/10"
                                                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                            )}
                                        >
                                            <span className="text-xs font-black tracking-tight">{n.nombre}</span>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{n.rubro}</span>
                                        </DropdownMenuItem>
                                        <div className="flex items-center gap-1 pr-2 absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={(e) => handleOpenEdit(e, n.id)}
                                            >
                                                <SettingsIcon className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
                            <DropdownMenuItem
                                onClick={handleOpenAdd}
                                className="rounded-xl px-3 py-2.5 cursor-pointer gap-2 text-primary focus:bg-primary/5 focus:text-primary transition-all group"
                            >
                                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
                                <span className="text-xs font-black uppercase tracking-widest">Crear nuevo negocio</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {negocioActivo && (
                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl relative hover:bg-zinc-100 dark:hover:bg-zinc-900 group">
                        <Bell className="h-4 w-4 text-zinc-500 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-zinc-950" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                    >
                        <Sun className="h-4 w-4 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        <span className="sr-only">Cambiar tema</span>
                    </Button>
                </div>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 ml-1 mr-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-11 gap-3 px-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border-none transition-all group">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-none gap-1">
                                <span className="text-sm font-black tracking-tight group-hover:text-primary transition-colors truncate max-w-[120px]">
                                    {userProfile ? (userProfile.fullName || userProfile.email?.split('@')[0]) : 'Cargando...'}
                                </span>
                                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">Admin</span>
                            </div>
                            <ChevronDown className="h-3 w-3 text-zinc-400 ml-1 group-data-[state=open]:rotate-180 transition-transform" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 mt-1 overflow-hidden">
                        <div className="bg-primary/5 p-4 mb-2 rounded-xl border border-primary/10">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-black uppercase tracking-tight text-primary">Mi Perfil</span>
                                <span className="text-[10px] font-bold text-zinc-500 truncate">{userProfile?.email}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <DropdownMenuItem
                                className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 focus:bg-primary/5 focus:text-primary group transition-all"
                                onClick={() => setIsProfileDialogOpen(true)}
                            >
                                <SettingsIcon className="h-4 w-4 text-zinc-400 group-focus:text-primary" />
                                <span className="text-xs font-bold uppercase tracking-widest">Configuración</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-zinc-100 dark:bg-zinc-800" />
                            <DropdownMenuItem
                                className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 focus:bg-rose-50 focus:text-rose-600 group text-zinc-500 transition-all"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 text-zinc-400 group-focus:text-rose-600" />
                                <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Diálogo de Perfil */}
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950">
                    <div className="p-8 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Editar Perfil</h2>
                            <p className="text-sm text-zinc-500 font-medium">Actualiza tu información personal</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Correo Electrónico</label>
                                <Input
                                    value={userProfile?.email || ''}
                                    disabled
                                    className="h-12 border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl font-bold opacity-70"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Nombre Completo</label>
                                <Input
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="h-12 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 rounded-2xl font-bold transition-all"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleUpdateProfile}
                                disabled={savingProfile || !profileName}
                                className="rounded-2xl font-black uppercase tracking-widest text-xs h-12 shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90"
                            >
                                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsProfileDialogOpen(false)}
                                className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-10 text-zinc-400"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Negocio */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950">
                    <div className="p-8 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">
                                {editingId ? 'Editar Negocio' : 'Nuevo Negocio'}
                            </h2>
                            <p className="text-sm text-zinc-500 font-medium">{editingId ? 'Ajusta los detalles operativos' : 'Comienza una nueva línea de producción'}</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Nombre Comercial</label>
                                <Input
                                    value={formNombre}
                                    onChange={(e) => setFormNombre(e.target.value)}
                                    className="h-12 border-zinc-200 dark:border-zinc-800 rounded-2xl font-black transition-all"
                                    placeholder="Ej: Taller Phoenix"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Rubro de Operación</label>
                                <Select value={formRubro} onValueChange={(v: Rubro) => setFormRubro(v)}>
                                    <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="GENERICO" className="font-bold py-3">📦 Genérico</SelectItem>
                                        <SelectItem value="IMPRESION_3D" className="font-bold py-3">🖨️ Impresión 3D</SelectItem>
                                        <SelectItem value="CARPINTERIA" className="font-bold py-3">🪚 Carpintería</SelectItem>
                                        <SelectItem value="METALURGICA" className="font-bold py-3">⚙️ Metalúrgica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSavingBusiness}
                                className="rounded-2xl font-black uppercase tracking-widest text-xs h-12 shadow-xl shadow-primary/25"
                            >
                                {isSavingBusiness ? 'Procesando...' : (editingId ? 'Actualizar Negocio' : 'Crear Negocio')}
                            </Button>
                            {editingId && negocios.length > 1 && (
                                <Button
                                    variant="ghost"
                                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={(e) => {
                                        if (confirm('¿Estás seguro de eliminar este negocio? Esta acción no se puede deshacer.')) {
                                            removeNegocio(editingId);
                                            setIsDialogOpen(false);
                                        }
                                    }}
                                >
                                    Eliminar Negocio Seleccionado
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-10 text-zinc-400"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    )
}
