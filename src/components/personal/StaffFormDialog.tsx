'use client'

import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { HardHat, User, Phone, Mail, Award, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface StaffFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: any) => Promise<void>
    initialData?: any | null
}

export function StaffFormDialog({ open, onOpenChange, onSave, initialData }: StaffFormDialogProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialties: ''
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                specialties: initialData.specialties || ''
            })
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                specialties: ''
            })
        }
    }, [initialData, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.firstName) {
            toast.error('El nombre es obligatorio')
            return
        }
        setIsLoading(true)
        try {
            await onSave(formData)
            onOpenChange(false)
        } catch (error) {
            // Error handled by caller
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader className="p-8 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                                <HardHat className="h-6 w-6 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {initialData ? 'Editar Integrante' : 'Nuevo Integrante'}
                                </DialogTitle>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personal del Taller</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Nombre</Label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="h-11 pl-10 rounded-xl bg-zinc-50/50 border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                        placeholder="Ej: Juan"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Apellido</Label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="h-11 pl-10 rounded-xl bg-zinc-50/50 border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                        placeholder="Ej: Pérez"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Especialidades</Label>
                            <div className="relative group">
                                <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    value={formData.specialties}
                                    onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                                    className="h-11 pl-10 rounded-xl bg-zinc-50/50 border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                    placeholder="Ej: Soldador, Pintor, Armado..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Teléfono</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="h-11 pl-10 rounded-xl bg-zinc-50/50 border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                        placeholder="264-..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="h-11 pl-10 rounded-xl bg-zinc-50/50 border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                        placeholder="juan@ejemplo.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex sm:justify-between items-center bg-white dark:bg-zinc-950">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 px-6"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-2xl font-black uppercase text-[10px] tracking-[0.1em] h-12 px-8 gap-2 shadow-xl shadow-primary/20 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-none transition-transform active:scale-95"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {initialData ? 'Actualizar Datos' : 'Registrar Personal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
