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

export function Topbar() {
    const {
        negocios,
        negocioActivoId,
        negocioActivo,
        setActivo,
        addNegocio,
        updateNegocio,
        removeNegocio
    } = useNegocio()
    const { theme, setTheme } = useTheme()

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

    const handleSave = () => {
        if (!formNombre) return
        if (editingId) {
            updateNegocio(editingId, formNombre, formRubro)
        } else {
            addNegocio(formNombre, formRubro)
        }
        setIsDialogOpen(false)
    }

    return (
        <header className="fixed left-0 lg:left-[260px] top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                {/* Mobile Menu Button - Solo visible en < lg */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <MenuIcon className="h-5 w-5" />
                            <span className="sr-only">Menú</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-4 w-[280px]">
                        <SidebarContent onItemClick={() => setIsSheetOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Selector de Negocio - Compacto en mobile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 border-zinc-200 dark:border-zinc-800">
                            <Building2 className="h-4 w-4 text-zinc-500" />
                            <span className="max-w-[80px] sm:max-w-[120px] truncate">{negocioActivo?.nombre || 'Negocio'}</span>
                            <ChevronDown className="h-3 w-3 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[260px]">
                        <DropdownMenuLabel>Mis Negocios</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {negocios.map((n) => (
                            <div key={n.id} className="flex items-center group">
                                <DropdownMenuItem
                                    onClick={() => setActivo(n.id)}
                                    className={`flex-1 ${negocioActivoId === n.id ? "bg-zinc-100 dark:bg-zinc-800 font-bold" : ""}`}
                                >
                                    <div className="flex flex-col">
                                        <span>{n.nombre}</span>
                                        <span className="text-[10px] text-zinc-500 font-normal">{n.rubro}</span>
                                    </div>
                                </DropdownMenuItem>
                                <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(ev) => handleOpenEdit(ev, n.id)}>
                                        <SettingsIcon className="h-3 w-3" />
                                    </Button>
                                    {negocios.length > 1 && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(ev) => { ev.stopPropagation(); if (confirm('¿Eliminar este negocio?')) removeNegocio(n.id); }}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleOpenAdd} className="gap-2 text-primary font-medium">
                            <Plus className="h-4 w-4" /> Crear nuevo negocio
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Buscador - Oculto en mobile muy pequeño */}
                <div className="relative w-full max-w-[200px] hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                        type="search"
                        placeholder="Buscar..."
                        className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                {/* Selector de Tema */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Tema</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                            <Sun className="h-4 w-4" /> Claro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                            <Moon className="h-4 w-4" /> Oscuro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                            <Monitor className="h-4 w-4" /> Sistema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 sm:right-2.5 top-2 sm:top-2.5 h-2 w-2 rounded-full bg-red-500" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-800 py-1.5 rounded-lg transition-colors">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium leading-tight">{userProfile?.fullName || 'Usuario'}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize leading-tight">Administrador</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                <User className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="font-semibold">{userProfile?.fullName || 'Usuario'}</span>
                                <span className="text-xs text-zinc-500 font-normal">{userProfile?.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)} className="gap-2">
                            <SettingsIcon className="h-4 w-4" /> Configuración de perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                            <LogOut className="h-4 w-4" /> Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Negocio' : 'Crear Nuevo Negocio'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Negocio</label>
                            <Input
                                value={formNombre}
                                onChange={(e) => setFormNombre(e.target.value)}
                                placeholder="Ej: Carpintería San Pedro"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rubro (Define el comportamiento)</label>
                            <Select value={formRubro} onValueChange={(v) => setFormRubro(v as Rubro)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rubro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IMPRESION_3D">Impresión 3D</SelectItem>
                                    <SelectItem value="METALURGICA">Metalúrgica</SelectItem>
                                    <SelectItem value="CARPINTERIA">Carpintería</SelectItem>
                                    <SelectItem value="GENERICO">Genérico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Negocio</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Configuración de Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Correo electrónico</label>
                            <Input
                                value={userProfile?.email || ''}
                                disabled
                                className="bg-zinc-50 dark:bg-zinc-900"
                            />
                            <p className="text-[10px] text-zinc-500">El correo electrónico no se puede cambiar.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nombre completo</label>
                            <Input
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Tu nombre"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} disabled={savingProfile}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateProfile} disabled={savingProfile || !profileName}>
                            {savingProfile ? (
                                <>
                                    <span className="animate-spin mr-2">◌</span> Guardando...
                                </>
                            ) : 'Guardar cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    )
}
