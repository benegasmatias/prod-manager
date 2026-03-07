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

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Personal</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Gestión de operarios, especialistas y encargados</p>
                </div>
                <Button
                    className="h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/20"
                    onClick={() => { setEditingStaff(null); setIsFormOpen(true); }}
                >
                    <Plus className="h-4 w-4" /> Nuevo Integrante
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-900/20 p-4 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o especialidad..."
                        className="h-12 w-full rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-950"
                    />
                </div>
            </div>

            <div className="hidden lg:block overflow-hidden bg-white dark:bg-zinc-900/20 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800/50">
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Integrante</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Especialidad</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contacto</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Estado</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.length > 0 ? filteredStaff.map((staff) => (
                            <TableRow key={staff.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 border-b border-zinc-50 dark:border-zinc-800/30">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors shadow-sm",
                                            staff.active ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800/50"
                                        )}>
                                            {staff.firstName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn("text-sm font-bold transition-colors", staff.active ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 italic")}>
                                                {staff.firstName} {staff.lastName}
                                            </span>
                                            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tight italic">Taller / Planta</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-3 w-3 text-zinc-400" />
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">
                                            {staff.specialties || 'General'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold lowercase tracking-tight">
                                            <Mail className="h-2.5 w-2.5 opacity-50" /> {staff.email || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold tracking-tight">
                                            <Phone className="h-2.5 w-2.5 opacity-50" /> {staff.phone || 'N/A'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        staff.active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                    )}>
                                        {staff.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-primary transition-all border border-transparent" onClick={() => { setEditingStaff(staff); setIsFormOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-all border border-transparent", staff.active ? "hover:text-amber-500 text-zinc-300" : "hover:text-emerald-500 text-zinc-300")} onClick={() => handleToggleStatus(staff)}>
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-red-500 text-zinc-300 transition-all border border-transparent" onClick={() => handleDelete(staff.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-60 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                                        <HardHat className="h-10 w-10 opacity-10" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black uppercase tracking-widest italic opacity-50">
                                                {isLoading ? 'Cargando nómina...' : 'Sin registros de personal'}
                                            </p>
                                            {!isLoading && <Button variant="link" size="sm" onClick={() => setIsFormOpen(true)} className="text-primary font-bold">Registrar primer integrante</Button>}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile/Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                {filteredStaff.map((staff) => (
                    <div key={staff.id} className={cn(
                        "p-6 rounded-[2.5rem] border transition-all animate-slide-up bg-white dark:bg-zinc-900 shadow-sm",
                        staff.active ? "border-zinc-100 dark:border-zinc-800/50" : "border-transparent opacity-60 bg-zinc-50/50 dark:bg-zinc-900/20"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm",
                                    staff.active ? "bg-primary/10 text-primary shadow-inner" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                )}>
                                    {staff.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-zinc-900 dark:text-zinc-50 leading-tight uppercase tracking-tight text-sm">
                                        {staff.firstName} {staff.lastName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Award className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{staff.specialties || 'General'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => { setEditingStaff(staff); setIsFormOpen(true); }}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-xl transition-all", staff.active ? "hover:text-amber-500 text-zinc-300" : "hover:text-emerald-500 text-zinc-300")} onClick={() => handleToggleStatus(staff)}>
                                    <Power className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleDelete(staff.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Teléfono</span>
                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{staff.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Estado</span>
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2.5 py-1 rounded-full",
                                    staff.active ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                                )}>{staff.active ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </div>
                    </div>
                ))}
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
