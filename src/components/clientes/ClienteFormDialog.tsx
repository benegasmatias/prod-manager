'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { User } from 'lucide-react'
const Label = ({ children, htmlFor, className = "" }: any) => <label htmlFor={htmlFor} className={"text-sm font-medium leading-none " + className}>{children}</label>

interface ClienteFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: any) => Promise<void>
    initialData?: {
        id: string
        nombre: string
        email?: string
        telefono?: string
        notas?: string
    } | null
}

export function ClienteFormDialog({ open, onOpenChange, onSave, initialData }: ClienteFormDialogProps) {
    const [nombre, setNombre] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [telefono, setTelefono] = React.useState('')
    const [notas, setNotas] = React.useState('')
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            if (initialData) {
                setNombre(initialData.nombre || '')
                setEmail(initialData.email || '')
                setTelefono(initialData.telefono || '')
                setNotas(initialData.notas || '')
            } else {
                setNombre('')
                setEmail('')
                setTelefono('')
                setNotas('')
            }
            setErrors({})
        }
    }, [open, initialData])

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen)
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
        if (email && !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Formato de email inválido'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsSubmitting(true)

        try {
            await onSave({
                nombre: nombre.trim(),
                email: email.trim() || undefined,
                telefono: telefono.trim() || undefined,
                notas: notas.trim() || undefined
            })
            handleOpenChange(false)
        } catch (error) {
            console.error('Error saving customer:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl">
                <div className="p-8 space-y-8">
                    <DialogHeader className="space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                            <User className="h-7 w-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {initialData ? 'Editar' : 'Registrar'} <span className="text-primary italic">Cliente</span>
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-zinc-500">
                                {initialData
                                    ? 'Modificá la información de contacto y preferencias del cliente.'
                                    : 'Añadí un nuevo integrante a tu base de datos comercial.'}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Nombre Completo <span className="text-primary">*</span></label>
                                <div className="relative group">
                                    <Input
                                        id="nombre"
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        placeholder="Ej. Juan Pérez"
                                        className="h-12 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>
                                {errors.nombre && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.nombre}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Teléfono</label>
                                    <Input
                                        id="telefono"
                                        value={telefono}
                                        onChange={e => setTelefono(e.target.value)}
                                        placeholder="264 455..."
                                        className="h-12 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Corporativo</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="juan@ejemplo.com"
                                        className="h-12 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all focus:ring-2 focus:ring-primary/10"
                                    />
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Notas Críticas (opcional)</label>
                                <textarea
                                    id="notas"
                                    value={notas}
                                    onChange={e => setNotas(e.target.value)}
                                    placeholder="Preferencias de entrega, CUIT, requerimientos especiales..."
                                    className="w-full min-h-[100px] p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl font-medium text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all focus:ring-2 focus:ring-primary/10 resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                                className="h-12 rounded-2xl font-bold text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                Descartar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 flex-1 rounded-2xl bg-gradient-to-br from-primary to-primary/80 hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                            >
                                {isSubmitting ? 'Procesando...' : initialData ? 'Actualizar Registro' : 'Confirmar Cliente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
