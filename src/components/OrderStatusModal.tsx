'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { Pedido, Employee } from '@/src/types'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { cn } from '@/src/lib/utils'
import { User, ClipboardList, MessageSquare, CheckCircle2 } from 'lucide-react'

interface OrderStatusModalProps {
    order: Pedido | null
    isOpen: boolean
    onClose: () => void
    employees: Employee[]
}

export function OrderStatusModal({ order, isOpen, onClose, employees }: OrderStatusModalProps) {
    const { config, user: profile } = useNegocio()
    const { updatePedido } = usePedidos()
    const [status, setStatus] = useState<string>('')
    const [responsableId, setResponsableId] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Sincronizar estado inicial cuando el modal se abre
    React.useEffect(() => {
        if (order && isOpen) {
            setStatus(order.estado)

            const initialResponsableId = order.responsableGeneral?.id || ''

            // Si no hay responsable, intentar auto-seleccionar al usuario actual
            if (!initialResponsableId && profile && employees.length > 0) {
                const me = employees.find(e => e.email === profile.email)
                if (me) {
                    setResponsableId(me.id)
                } else {
                    setResponsableId('')
                }
            } else {
                setResponsableId(initialResponsableId)
            }

            setNotes('')
        }
    }, [order, isOpen, profile, employees])

    if (!order) return null

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updatePedido(order.negocioId, order.id, {
                estado: status,
                responsableGeneral: employees.find(e => e.id === responsableId),
                observaciones: notes // Usaremos esto como la nota del cambio de estado
            } as any)
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    const stages = config.productionStages

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Actualizar Pedido</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {/* ESTADO */}
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nuevo Estado</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {stages.map((stage) => {
                                const isSelected = status === stage.key
                                const baseColor = stage.color.split('-')[1]
                                return (
                                    <button
                                        key={stage.key}
                                        onClick={() => setStatus(stage.key)}
                                        className={cn(
                                            "flex items-center gap-2 p-3 rounded-2xl border transition-all text-left group",
                                            isSelected
                                                ? `bg-${baseColor}-50 border-${baseColor}-200 dark:bg-${baseColor}-950/20 dark:border-${baseColor}-900/50`
                                                : "bg-zinc-50/50 border-zinc-100 hover:border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-2 w-2 rounded-full shrink-0",
                                            isSelected ? `bg-${baseColor}-500 shadow-[0_0_8px_rgba(0,0,0,0.2)]` : "bg-zinc-300"
                                        )} />
                                        <span className={cn(
                                            "text-[11px] font-bold uppercase tracking-wider",
                                            isSelected ? `text-${baseColor}-700 dark:text-${baseColor}-400` : "text-zinc-500"
                                        )}>{stage.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* RESPONSABLE */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Responsable de esta etapa</Label>
                            <User className="h-3 w-3 text-zinc-300" />
                        </div>
                        <select
                            className={cn(
                                "w-full h-12 rounded-2xl border bg-white dark:bg-zinc-900 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none transition-all dark:border-zinc-800",
                                !responsableId && "border-amber-200 dark:border-amber-900/50 bg-amber-50/30"
                            )}
                            value={responsableId}
                            onChange={(e) => setResponsableId(e.target.value)}
                        >
                            <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Seleccionar responsable obligatorio...</option>
                            {employees.filter(e => e.active).map(emp => (
                                <option key={emp.id} value={emp.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                        {!responsableId && (
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 mt-1 ml-1 animate-pulse">
                                * Debes asignar a una persona para continuar
                            </p>
                        )}
                    </div>

                    {/* NOTAS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Nota de actualización</Label>
                            <MessageSquare className="h-3 w-3 text-zinc-300" />
                        </div>
                        <textarea
                            className="w-full min-h-[100px] rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all dark:border-zinc-800 dark:bg-zinc-950/50"
                            placeholder="Ej: El cliente pidió un cambio de última hora..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !responsableId}
                        className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                    >
                        {isSaving ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        {isSaving ? 'Guardando...' : 'Confirmar Cambio'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
