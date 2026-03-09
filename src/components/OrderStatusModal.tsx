'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { Pedido, Employee, Material, Machine } from '@/src/types'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { cn } from '@/src/lib/utils'
import { User, ClipboardList, MessageSquare, CheckCircle2, AlertOctagon, Undo2, Plus, Minus, Layers } from 'lucide-react'
import { api } from '@/src/lib/api'
import { toast } from 'react-hot-toast'

interface OrderStatusModalProps {
    order: Pedido | null
    isOpen: boolean
    onClose: () => void
    employees: Employee[]
    defaultFailureMode?: boolean
}

export function OrderStatusModal({ order, isOpen, onClose, employees, defaultFailureMode }: OrderStatusModalProps) {
    const { config, user: profile } = useNegocio()
    const { updatePedido, refresh } = usePedidos()

    const allStages = config.productionStages
    const stages = allStages.filter(s => s.key !== 'FAILED' && s.key !== 'REPRINT_PENDING')
    const hasPrintingSystem = allStages.some(s => s.key === 'FAILED')

    const [status, setStatus] = useState<string>('')
    const [responsableId, setResponsableId] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Failure Mode State
    const [isFailureMode, setIsFailureMode] = useState(false)
    const [wastedGrams, setWastedGrams] = useState<string>('')
    const [failureReason, setFailureReason] = useState('')
    const [moveToReprint, setMoveToReprint] = useState(true)
    const [materials, setMaterials] = useState<Material[]>([])
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
    const [multiMaterials, setMultiMaterials] = useState<{ materialId: string, gramsPerUnit: number }[]>([])

    // Machines State
    const [machines, setMachines] = useState<Machine[]>([])
    const [selectedMachineId, setSelectedMachineId] = useState<string>('')
    const [isLoadingMachines, setIsLoadingMachines] = useState(false)

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

            // Si el estado entrante (ej: por drag and drop) es de fallo, activamos el modo automáticamente
            // Usamos la prop defaultFailureMode en lugar de order.estado que es estático
            if (defaultFailureMode) {
                setIsFailureMode(true)
                setMoveToReprint(order.estado === 'REPRINT_PENDING' || order.estado !== 'FAILED') // Default to reprint if not explicitly failed
            } else {
                setIsFailureMode(false)
                setMoveToReprint(true)
            }

            setWastedGrams('')
            setFailureReason('')
            setSelectedMaterialId('')

            // Cargar materiales si estamos en una etapa donde pueden haber fallos
            if (hasPrintingSystem && isOpen) {
                const fetchMaterials = async () => {
                    setIsLoadingMaterials(true)
                    try {
                        const data: any = await api.materials.getAll(order.negocioId)
                        setMaterials(data || [])
                        setMultiMaterials([])
                        setSelectedMaterialId('')

                        // Intentar pre-seleccionar si el pedido tiene un material preferido o único job
                        const printingJob = order.jobs?.find(j => j.materialId)
                        if (printingJob?.materialId) {
                            setSelectedMaterialId(printingJob.materialId)
                        } else if (data && data.length === 1) {
                            setSelectedMaterialId(data[0].id)
                        }
                    } catch (error) {
                        console.error('Error fetching materials:', error)
                    } finally {
                        setIsLoadingMaterials(false)
                    }
                }
                fetchMaterials()

                // Cargar máquinas
                const fetchMachines = async () => {
                    setIsLoadingMachines(true)
                    try {
                        const data: any = await api.printers.getAll(order.negocioId)
                        setMachines(data || [])
                        setSelectedMachineId('')
                    } catch (error) {
                        console.error('Error fetching machines:', error)
                    } finally {
                        setIsLoadingMachines(false)
                    }
                }
                fetchMachines()
            }
        }
    }, [order, isOpen, profile, employees, defaultFailureMode, hasPrintingSystem])

    if (!order) return null

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (isFailureMode) {
                // Modo Registro de Fallo
                if (!failureReason || !wastedGrams) {
                    toast.error('Completá el motivo y los gramos desperdiciados.')
                    return
                }

                await api.orders.reportFailure(order.id, failureReason, Number(wastedGrams), moveToReprint, selectedMaterialId || undefined)
                toast.success('Fallo de impresión registrado correctamente.')
                await refresh()
                onClose()
            } else {
                // Modo Estandard de Estado Libre
                const selectedEmployee = employees.find(e => e.id === responsableId)

                // Si es estado IMPRIMIENDO y hay máquina seleccionada, usamos assignOrder
                if (status === 'IN_PROGRESS' && hasPrintingSystem && selectedMachineId) {
                    const metadata = multiMaterials.length > 0 ? { materials: multiMaterials } : undefined;
                    await api.printers.assignOrder(selectedMachineId, order.id, selectedMaterialId || undefined, order.negocioId, metadata)

                    // También actualizamos el responsable y notas si se proporcionaron
                    if (notes || (selectedEmployee && order.responsableGeneral?.id !== selectedEmployee.id)) {
                        await updatePedido(order.negocioId, order.id, {
                            responsableGeneral: selectedEmployee,
                            observaciones: notes
                        } as any)
                    }
                } else {
                    await updatePedido(order.negocioId, order.id, {
                        estado: status,
                        responsableGeneral: selectedEmployee,
                        observaciones: notes // Usaremos esto como la nota del cambio de estado
                    } as any)
                }
                onClose()
            }
        } catch (error: any) {
            toast.error(error.message || 'Ocurrió un error al procesar la solicitud.')
        } finally {
            setIsSaving(false)
        }
    }



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn("sm:max-w-[450px] rounded-[2.5rem] p-8 border-none shadow-2xl transition-all duration-300", isFailureMode ? "bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-500/20" : "")}>
                <DialogHeader>
                    {!isFailureMode ? (
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Actualizar Pedido</DialogTitle>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                                <AlertOctagon className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-red-600 dark:text-red-400">Registrar Fallo</DialogTitle>
                        </div>
                    )}
                </DialogHeader>

                {!isFailureMode ? (
                    <div className="space-y-8 py-6">
                        {/* ESTADO MANUAL */}
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

                        {/* SELECCIÓN DE MÁQUINA Y MATERIAL (Condicional para IMPRIMIENDO) */}
                        {status === 'IN_PROGRESS' && hasPrintingSystem && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-[2rem] bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Seleccionar Máquina</Label>
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    </div>
                                    <select
                                        className={cn(
                                            "w-full h-12 rounded-2xl border bg-white dark:bg-zinc-900 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none transition-all dark:border-zinc-800",
                                            !selectedMachineId ? "border-blue-200 dark:border-blue-900/50 shadow-sm shadow-blue-500/10" : "border-zinc-100 dark:border-zinc-800"
                                        )}
                                        value={selectedMachineId}
                                        onChange={(e) => setSelectedMachineId(e.target.value)}
                                    >
                                        <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Cargar a la fila general (sin máquina)...</option>
                                        {machines.map(m => {
                                            const isFree = m.status === 'IDLE' || m.status === 'Libre';
                                            return (
                                                <option key={m.id} value={m.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 italic">
                                                    {m.name} - {isFree ? '🟢 LIBRE' : '🔴 OCUPADA'}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Filamento Principal</Label>
                                        <Layers className="h-3 w-3 text-zinc-300" />
                                    </div>
                                    <select
                                        className="w-full h-12 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-900 dark:text-zinc-100"
                                        value={selectedMaterialId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedMaterialId(id);
                                            // Reset multi si se elige principal (o sincronizar)
                                            if (id && multiMaterials.length === 0) {
                                                // Si no hay multi, inicializamos con el principal si se desea
                                            }
                                        }}
                                    >
                                        <option value="">No asignar material todavía...</option>
                                        {materials.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} {m.brand ? `(${m.brand})` : ''} - {m.color || ''} ({Math.round(m.remainingWeightGrams)}g rest.)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* MULTIFILAMENTO UI (Bambu A1 Combo style) */}
                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Uso Multifilamento (Opcional)</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[9px] font-bold gap-1 text-primary"
                                            onClick={() => setMultiMaterials([...multiMaterials, { materialId: '', gramsPerUnit: 0 }])}
                                        >
                                            <Plus className="h-3 w-3" /> Agregar Color
                                        </Button>
                                    </div>

                                    {multiMaterials.map((mm, idx) => (
                                        <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-right-2 duration-200">
                                            <select
                                                className="flex-1 h-10 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-900 dark:text-zinc-100"
                                                value={mm.materialId}
                                                onChange={(e) => {
                                                    const newMulti = [...multiMaterials];
                                                    newMulti[idx].materialId = e.target.value;
                                                    setMultiMaterials(newMulti);
                                                }}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {materials.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} ({m.color})</option>
                                                ))}
                                            </select>
                                            <div className="relative w-20">
                                                <input
                                                    type="number"
                                                    placeholder="Grs"
                                                    className="w-full h-10 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 pr-6 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-900 dark:text-zinc-100"
                                                    value={mm.gramsPerUnit || ''}
                                                    onChange={(e) => {
                                                        const newMulti = [...multiMaterials];
                                                        newMulti[idx].gramsPerUnit = Number(e.target.value);
                                                        setMultiMaterials(newMulti);
                                                    }}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-zinc-400 font-bold">g</span>
                                            </div>
                                            <button
                                                onClick={() => setMultiMaterials(multiMaterials.filter((_, i) => i !== idx))}
                                                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {multiMaterials.length > 0 && (
                                        <div className="p-2 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="flex justify-between text-[10px] font-bold text-primary px-1">
                                                <span>Total Filamento por Unidad:</span>
                                                <span>{multiMaterials.reduce((acc, curr) => acc + (curr.gramsPerUnit || 0), 0)} g</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-[9px] text-blue-600/60 dark:text-blue-400/60 font-medium ml-1">
                                    Al seleccionar una máquina, el pedido pasará automáticamente a producción activa.
                                </p>
                            </div>
                        )}

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

                        {/* BOTÓN EMERGENCIA DE FALLO (Para Impresión 3D) */}
                        {hasPrintingSystem && (order.estado === 'IN_PROGRESS' || order.estado === 'POST_PROCESS') && (
                            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    onClick={(e) => { e.preventDefault(); setIsFailureMode(true) }}
                                    className="w-full relative group overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 transition-all hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-800 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <AlertOctagon className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Reportar Fallo Crítico</div>
                                            <div className="text-[10px] text-red-600/60 dark:text-red-400/60 font-medium">Registrá material desperdiciado en la granja...</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // FORMULARIO DE FALLO
                    <div className="space-y-8 py-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Diagnóstico del Filtro / Motivo</Label>
                            <textarea
                                className="w-full min-h-[100px] rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-zinc-900 dark:text-zinc-100"
                                placeholder="Ej: Taponamiento del extrusor en la última capa. Temperatura del PLA inestable..."
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">¿Qué material se perdió? (Opcional)</Label>
                            <select
                                className="w-full h-12 rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-zinc-900 dark:text-zinc-100"
                                value={selectedMaterialId}
                                onChange={(e) => setSelectedMaterialId(e.target.value)}
                            >
                                <option value="">No descontar de stock / Desconocido</option>
                                {materials.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} {m.brand ? `(${m.brand})` : ''} - {m.color || ''} ({Math.round(m.remainingWeightGrams)}g rest.)
                                    </option>
                                ))}
                            </select>
                            <p className="text-[9px] text-zinc-400 ml-1">Si seleccionás uno, restaremos los gramos automáticamente del inventario.</p>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Filamento Desperdiciado</Label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="w-full h-14 rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 px-4 pr-12 text-lg font-black focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-mono text-zinc-900 dark:text-zinc-100"
                                    placeholder="0"
                                    value={wastedGrams}
                                    onChange={(e) => setWastedGrams(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-red-400 dark:text-red-500/50">
                                    grs
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Acción Post-Fallo</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setMoveToReprint(true)}
                                    className={cn("flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border transition-all text-center", moveToReprint ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 shadow-sm" : "bg-zinc-50/50 border-zinc-100 hover:border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800 text-zinc-500")}
                                >
                                    <span className="text-[11px] font-black uppercase tracking-widest shrink-0">A Reimpresión</span>
                                    <span className="text-[9px] font-medium opacity-70">El trabajo vuelve a nacer</span>
                                </button>
                                <button
                                    onClick={() => setMoveToReprint(false)}
                                    className={cn("flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border transition-all text-center", !moveToReprint ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-600 dark:text-red-400 shadow-sm" : "bg-zinc-50/50 border-zinc-100 hover:border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800 text-zinc-500")}
                                >
                                    <span className="text-[11px] font-black uppercase tracking-widest shrink-0">Cancelar impresion</span>
                                    <span className="text-[9px] font-medium opacity-70">Queda descartado</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-3 sm:gap-2">
                    {isFailureMode ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => setIsFailureMode(false)}
                                className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 gap-2"
                            >
                                <Undo2 className="h-4 w-4" /> Volver
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !wastedGrams || !failureReason}
                                className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 gap-2 shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:grayscale"
                            >
                                {isSaving ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <AlertOctagon className="h-4 w-4" />
                                )}
                                {isSaving ? 'Registrando...' : 'Declarar Pérdidas'}
                            </Button>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
