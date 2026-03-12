'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/src/components/ui/table'
import { Button } from '@/src/components/ui/button'
import { Plus, Search, HardHat, Phone, Mail, Award, Pencil, Trash2, Power } from 'lucide-react'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'
import { StaffFormDialog } from '@/src/components/personal/StaffFormDialog'
import { toast } from 'react-hot-toast'
import { cn } from '@/src/lib/utils'

export default function StaffPage() {
    const { negocioActivoId } = useNegocio()
    const [employees, setEmployees] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<any | null>(null)

    const fetchEmployees = async () => {
        if (!negocioActivoId) return
        setIsLoading(true)
        try {
            const data = await api.employees.getAll(negocioActivoId)
            setEmployees(data as any[])
        } catch (error) {
            console.error('Error fetching employees:', error)
            toast.error('Error al cargar personal')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [negocioActivoId])

    const filteredStaff = useMemo(() => {
        return employees.filter(e =>
            `${e.firstName} ${e.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.specialties || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [employees, searchTerm])

    const handleSave = async (data: any) => {
        try {
            if (editingStaff) {
                await api.employees.update(editingStaff.id, negocioActivoId, data)
                toast.success('Personal actualizado')
            } else {
                await api.employees.create(negocioActivoId, data)
                toast.success('Personal registrado')
            }
            fetchEmployees()
        } catch (error) {
            toast.error('Error al guardar personal')
            throw error
        }
    }

    const handleToggleStatus = async (staff: any) => {
        try {
            await api.employees.update(staff.id, negocioActivoId, { active: !staff.active })
            toast.success(staff.active ? 'Personal desactivado' : 'Personal activado')
            fetchEmployees()
        } catch (error) {
            toast.error('Error al cambiar estado')
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) return
        try {
            await api.employees.remove(id, negocioActivoId)
            toast.success('Personal eliminado')
            fetchEmployees()
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Recursos Humanos</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Equipo <span className="text-primary italic">de Trabajo</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Administración de operarios, roles de producción y seguimiento de desempeño del personal operativo.
                    </p>
                </div>
                <Button
                    className="h-11 px-6 lg:h-12 lg:px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] gap-2"
                    onClick={() => { setEditingStaff(null); setIsFormOpen(true); }}
                >
                    <Plus className="h-4 w-4" /> Agregar Integrante
                </Button>
            </div>

            {/* Dashboard Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <HardHat className="h-20 w-20 text-primary" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Total Personal</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{employees.length}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">Registrados</span>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Award className="h-20 w-20 text-blue-500" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Activos Hoy</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {employees.filter(e => e.active).length}
                        </h3>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mb-1">Operativos</span>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Search className="h-20 w-20 text-zinc-400" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Especialidades</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {new Set(employees.map(e => e.specialties)).size}
                        </h3>
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full mb-1">Categorías</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/70 dark:bg-zinc-900/40 p-4 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors duration-200" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o especialidad..."
                        className="h-11 w-full rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-950"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden bg-white dark:bg-zinc-900/20 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <Table>
                    <TableHeader className="bg-transparent">
                        <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800/50">
                            <TableHead className="h-16 px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Integrante</TableHead>
                            <TableHead className="h-16 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Especialidad</TableHead>
                            <TableHead className="h-16 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Canal de Contacto</TableHead>
                            <TableHead className="h-16 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 text-center">Estado</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.length > 0 ? filteredStaff.map((staff) => (
                            <TableRow
                                key={staff.id}
                                className={cn(
                                    "group transition-colors hover:bg-zinc-50/30 dark:hover:bg-zinc-900/40 border-b border-zinc-50 dark:border-zinc-800/30",
                                    !staff.active && "opacity-60 grayscale-[0.5]"
                                )}
                            >
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300",
                                            staff.active 
                                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary"
                                                : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300"
                                        )}>
                                            {staff.firstName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                                                {staff.firstName} {staff.lastName}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                                                ID {staff.id.slice(0, 8)}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 uppercase tracking-widest">
                                        {staff.specialties || 'General'}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Mail className="h-3 w-3 text-zinc-400" />
                                            {staff.email || <span className="text-zinc-300 italic">Sin email</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Phone className="h-3 w-3 text-zinc-400" />
                                            {staff.phone || <span className="text-zinc-300 italic">Sin teléfono</span>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="flex justify-center">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border transform transition-transform group-hover:scale-105",
                                            staff.active
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10"
                                                : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                                        )}>
                                            <span className={cn("h-1.5 w-1.5 rounded-full mr-2", staff.active ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-400")} />
                                            {staff.active ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 transition-all">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-primary shadow-sm transition-all border border-transparent hover:border-zinc-200"
                                            onClick={() => { setEditingStaff(staff); setIsFormOpen(true); }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-xl transition-all shadow-sm border border-transparent hover:border-zinc-200",
                                                staff.active
                                                    ? "hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500"
                                                    : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-500"
                                            )}
                                            onClick={() => handleToggleStatus(staff)}
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-rose-900/20 hover:text-rose-500 shadow-sm transition-all border border-transparent hover:border-rose-100"
                                            onClick={() => handleDelete(staff.id, staff.firstName)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="h-16 w-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                                            <HardHat className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                                {isLoading ? 'Sincronizando equipo...' : 'Sin registros encontrados'}
                                            </p>
                                            <p className="text-xs text-zinc-400 italic">Probá ajustando los términos de búsqueda</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-6 lg:hidden">
                {filteredStaff.map((staff) => (
                    <div key={staff.id} className={cn(
                        "group relative p-8 rounded-[2.5rem] border transition-all hover:shadow-xl animate-slide-up",
                        staff.active 
                            ? "bg-white dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800/50 shadow-sm"
                            : "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-800/30 opacity-70"
                    )}>
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-sm",
                                    staff.active 
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary"
                                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300"
                                )}>
                                    {staff.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-primary transition-colors text-base">
                                        {staff.firstName} {staff.lastName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            staff.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-400"
                                        )} />
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                            {staff.active ? 'Activo' : 'Inactivo'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-transparent shadow-sm" 
                                    onClick={() => { setEditingStaff(staff); setIsFormOpen(true); }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pb-8 mb-8 border-b border-zinc-50 dark:border-zinc-800/50">
                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50/50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-transparent dark:border-zinc-800/50">
                                <Award className="h-4 w-4 text-primary" />
                                <span className="uppercase tracking-widest font-bold text-[10px]">{staff.specialties || 'General'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50/50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-transparent dark:border-zinc-800/50">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                <span className="truncate">{staff.email || '—'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50/50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-transparent dark:border-zinc-800/50">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <span>{staff.phone || '—'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                             <Button
                                variant="outline"
                                className={cn(
                                    "flex-1 h-11 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] border shadow-sm transition-all active:scale-95",
                                    staff.active
                                        ? "text-rose-600 border-rose-100 bg-white hover:bg-rose-500 hover:text-white hover:border-rose-500"
                                        : "text-emerald-600 border-emerald-100 bg-white hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                                )}
                                onClick={() => handleToggleStatus(staff)}
                            >
                                <Power className="h-3.5 w-3.5 mr-2" /> {staff.active ? 'Baja' : 'Alta'}
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="h-11 w-11 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-transparent hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                onClick={() => handleDelete(staff.id, staff.firstName)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredStaff.length === 0 && !isLoading && (
                    <div className="py-24 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                            <HardHat className="h-10 w-10 text-zinc-200 dark:text-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Sin coincidencias</p>
                            <p className="text-[11px] text-zinc-400 italic px-10 leading-relaxed">No encontramos integrantes con los criterios de búsqueda actuales.</p>
                        </div>
                    </div>
                )}
            </div>

            <StaffFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSave={handleSave}
                initialData={editingStaff}
            />
        </div>
    )
}
