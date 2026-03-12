'use client'

import React, { useEffect, useState } from 'react'
import { useNegocio } from '@/src/context/NegocioContext'
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
import { User, Phone, Mail, Award, CheckCircle2, X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
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
    const { config, negocioActivo } = useNegocio()
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
                    <DialogHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 text-left relative">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                {negocioActivo?.rubro === 'IMPRESION_3D' && <LucideIcons.Printer className="h-6 w-6" />}
                                {negocioActivo?.rubro === 'METALURGICA' && <LucideIcons.Hammer className="h-6 w-6" />}
                                {negocioActivo?.rubro === 'CARPINTERIA' && <LucideIcons.Trees className="h-6 w-6" />}
                                {negocioActivo?.rubro === 'GENERICO' && <LucideIcons.Users className="h-6 w-6" /> || <LucideIcons.User className="h-6 w-6" />}
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {initialData ? 'Información del Integrante' : 'Nuevo Integrante'}
                                </DialogTitle>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                                    {config.labels.produccion || 'Nómina de Personal'}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nombre</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="h-12 pl-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                        placeholder="Juan"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Apellido</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="h-12 pl-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                        placeholder="Pérez"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Especialidad principal</Label>
                            <div className="relative group">
                                <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
                                <Input
                                    value={formData.specialties}
                                    onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                                    className="h-12 pl-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                    placeholder={config.staffPlaceholder}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">WhatsApp / Teléfono</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="h-12 pl-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                        placeholder="Ej: 264..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Correo electrónico</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="h-12 pl-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                        placeholder="nombre@ejemplo.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex flex-row items-center justify-end gap-3 bg-white dark:bg-zinc-950">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-2xl font-bold h-12 px-6 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-2xl font-bold h-12 px-10 bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{initialData ? 'Guardar Cambios' : 'Registrar Integrante'}</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
