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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Modificá los datos del cliente seleccionado.' : 'Agregá un nuevo cliente a la base de datos de este negocio.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                        <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" />
                        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej. 264 123 4567" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ej. juan@correo.com" />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas (opcional)</Label>
                        <Input id="notas" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Preferencias, CUIT..." />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar Cliente'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
