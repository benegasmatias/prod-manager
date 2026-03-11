'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { Pedido, Employee, Material, Machine } from '@/src/types'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { cn } from '@/src/lib/utils'
import {
    User,
    ClipboardList,
    MessageSquare,
    CheckCircle2,
    AlertOctagon,
    Undo2,
    Plus,
    Layers,
    Gauge,
    Cpu
} from 'lucide-react'
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
    const { updatePedido, registerPayment, refresh } = usePedidos()

    const allStages = config.productionStages
    const is3D = config.labels.produccion.includes('Impresión')
    const stages = allStages.filter(s => {
        if (s.key === 'FAILED') return false
        if (is3D && s.key === 'REPRINT_PENDING') return false

        // Solo mostrar ingreso a stock en órdenes de stock
        if (s.key === 'IN_STOCK' && order?.type !== 'STOCK') return false

        // Ocultar entregado en órdenes de stock (ya que terminan en stock)
        if (s.key === 'DELIVERED' && order?.type === 'STOCK') return false

        return true
    })
    const hasFailureReporting = allStages.some(s => s.key === 'FAILED')

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
    const [failureMaterials, setFailureMaterials] = useState<{ materialId: string, wastedGrams: number }[]>([])

    const [machines, setMachines] = useState<Machine[]>([])
    const [selectedMachineId, setSelectedMachineId] = useState<string>('')
    const [isLoadingMachines, setIsLoadingMachines] = useState(false)

    // Payment State
    const [shouldPayBalance, setShouldPayBalance] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH')

    // Sincronizar estado inicial cuando el modal se abre
    React.useEffect(() => {
        if (order && isOpen) {
            setStatus(order.estado)
            const initialResponsableId = order.responsableGeneral?.id || ''
            if (!initialResponsableId && profile && employees.length > 0) {
                const me = employees.find(e => e.email === profile.email)
                if (me) setResponsableId(me.id)
                else setResponsableId('')
            } else {
                setResponsableId(initialResponsableId)
            }
            setNotes('')

            if (defaultFailureMode) {
                setIsFailureMode(true)
                setMoveToReprint(order.estado === 'REPRINT_PENDING' || order.estado !== 'FAILED')
            } else {
                setIsFailureMode(false)
                setMoveToReprint(true)
            }

            setWastedGrams('')
            setFailureReason('')
            setSelectedMaterialId('')
            setFailureMaterials([])
            setShouldPayBalance(false)
            setPaymentMethod('CASH')

            if (hasFailureReporting && isOpen) {
                const fetchData = async () => {
                    setIsLoadingMaterials(true)
                    setIsLoadingMachines(true)
                    try {
                        const [matsData, machsData] = await Promise.all([
                            api.materials.getAll(order.negocioId),
                            api.printers.getAll(order.negocioId)
                        ]) as [Material[], Machine[]]

                        setMaterials(matsData || [])
                        setMachines(machsData || [])

                        const activeJob = order.jobs?.find(j =>
                            (j.status === 'PRINTING' || j.status === 'PAUSED' || j.status === 'QUEUED') &&
                            j.printerId
                        );

                        if (activeJob && activeJob.printerId) {
                            setSelectedMachineId(activeJob.printerId);
                            const machine = machsData.find(m => m.id === activeJob.printerId);
                            const slots = machine?.maxFilaments || 1;

                            if (activeJob.metadata?.materials && Array.isArray(activeJob.metadata.materials)) {
                                const jobMaterials = activeJob.metadata.materials;
                                setMultiMaterials(Array(slots).fill(null).map((_, i) => ({
                                    materialId: jobMaterials[i]?.materialId || '',
                                    gramsPerUnit: jobMaterials[i]?.gramsPerUnit || 0
                                })));
                            } else if (activeJob.materialId) {
                                const fallback = Array(slots).fill(null).map(() => ({ materialId: '', gramsPerUnit: 0 }));
                                fallback[0] = { materialId: activeJob.materialId, gramsPerUnit: 0 };
                                setMultiMaterials(fallback);
                            }

                            if (activeJob.metadata?.materials) {
                                setFailureMaterials(activeJob.metadata.materials.map((m: any) => ({
                                    materialId: m.materialId,
                                    wastedGrams: 0
                                })));
                            } else if (activeJob.materialId) {
                                setFailureMaterials([{ materialId: activeJob.materialId, wastedGrams: 0 }]);
                            }
                        } else {
                            setSelectedMachineId('');
                            setMultiMaterials([]);
                            setFailureMaterials([]);
                        }
                    } catch (error) {
                        console.error('Error fetching modal data:', error)
                    } finally {
                        setIsLoadingMaterials(false)
                        setIsLoadingMachines(false)
                    }
                }
                fetchData()
            }
        }
    }, [order, isOpen, profile, employees, defaultFailureMode, hasFailureReporting])

    if (!order) return null

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (isFailureMode) {
                const totalWasted = failureMaterials.reduce((acc, curr) => acc + (curr.wastedGrams || 0), 0);
                if (!failureReason || totalWasted <= 0) {
                    toast.error('Completá el motivo y los gramos desperdiciados.')
                    return
                }
                const metadata = { materials: failureMaterials };
                const firstMaterialId = failureMaterials.find(m => m.materialId)?.materialId || undefined;
                const targetStatus = !moveToReprint ? 'FAILED' : (is3D ? 'REPRINT_PENDING' : 'RE_WORK');
                await api.orders.reportFailure(order.id, failureReason, totalWasted, moveToReprint, firstMaterialId, metadata, targetStatus)
                toast.success('Incidencia registrada correctamente.')
                await refresh()
                onClose()
            } else {
                const selectedEmployee = employees.find(e => e.id === responsableId)
                if (status === 'IN_PROGRESS' && hasFailureReporting && selectedMachineId) {
                    const validMaterials = multiMaterials.filter(m => m.materialId && m.gramsPerUnit > 0);
                    const metadata = validMaterials.length > 0 ? { materials: validMaterials } : undefined;
                    const firstMaterialId = validMaterials[0]?.materialId || undefined;

                    await api.printers.assignOrder(selectedMachineId, order.id, firstMaterialId, order.negocioId, metadata)

                    // Importante: Refrescar contexto para ver el cambio de estado y trabajos inmediatamente
                    await refresh()

                    if (notes || (selectedEmployee && order.responsableGeneral?.id !== selectedEmployee.id)) {
                        await updatePedido(order.negocioId, order.id, {
                            responsableGeneral: selectedEmployee,
                            observaciones: notes
                        } as any)
                    }
                } else {
                    // Si se marca como ENTREGADO y se confirmó el cobro del saldo
                    if (status === 'DELIVERED' && shouldPayBalance && (order.saldo || 0) > 0) {
                        try {
                            await registerPayment(order.id, order.saldo, paymentMethod)
                        } catch (err) {
                            console.error('Error auto-registering payment:', err)
                            throw new Error('No se pudo registrar el pago. Verificá los datos.')
                        }
                    }

                    await updatePedido(order.negocioId, order.id, {
                        estado: status,
                        responsableGeneral: selectedEmployee,
                        observaciones: notes
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

    // Lógica de diseño senior para el ancho adaptativo
    const isComplexLayout = (multiMaterials.length > 1) || (failureMaterials.length > 1) || (status === 'IN_PROGRESS' && selectedMachineId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={cn(
                    "rounded-[2.5rem] p-0 border-none shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
                    isComplexLayout ? "sm:max-w-[520px]" : "sm:max-w-[460px]",
                    isFailureMode
                        ? "bg-white dark:bg-zinc-950 ring-2 ring-red-500/10"
                        : "bg-white dark:bg-zinc-950"
                )}
            >
                {/* Header Adaptativo con Gradient sutil */}
                <div className={cn(
                    "p-8 pb-4 relative overflow-hidden",
                    isFailureMode ? "bg-red-50/50 dark:bg-red-950/10" : "bg-zinc-50/30 dark:bg-zinc-800/10"
                )}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        {isFailureMode ? <AlertOctagon size={80} /> : <Cpu size={80} />}
                    </div>

                    <DialogHeader className="relative z-10">
                        {!isFailureMode ? (
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Gauge className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Control de Producción</DialogTitle>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Gestión de Orden #{order?.numero || '...'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                                    <AlertOctagon className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-red-600 dark:text-red-400">Diagnosis de Fallo</DialogTitle>
                                    <p className="text-[10px] font-bold text-red-600/40 uppercase tracking-widest mt-0.5">Reporte Crítico de Material</p>
                                </div>
                            </div>
                        )}
                    </DialogHeader>
                </div>

                <div className="px-8 pb-8 pt-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {!isFailureMode ? (
                        <div className="space-y-8">
                            {/* SECCIÓN ESTADO */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-1 text-primary bg-primary rounded-full w-4" />
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Pipeline de estado</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {stages.map((stage) => {
                                        const isSelected = status === stage.key
                                        const baseColor = stage.color.split('-')[1]

                                        // Estilos consistentes con getStatusStyles de la página principal
                                        let activeStyles = `bg-${baseColor}-50/50 border-${baseColor}-200 dark:bg-${baseColor}-950/20 dark:border-${baseColor}-900/50`
                                        let textActive = `text-${baseColor}-700 dark:text-${baseColor}-400`
                                        let bulletActive = `bg-${baseColor}-500 scale-125 shadow-[0_0_8px_rgba(0,0,0,0.3)]`

                                        if (baseColor === 'zinc') {
                                            activeStyles = 'bg-zinc-100 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700'
                                            textActive = 'text-zinc-900 dark:text-zinc-100'
                                            bulletActive = 'bg-zinc-400 scale-125'
                                        }

                                        return (
                                            <button
                                                key={stage.key}
                                                onClick={() => setStatus(stage.key)}
                                                className={cn(
                                                    "flex flex-col gap-1 px-4 py-3.5 rounded-[1.25rem] border transition-all text-left relative group overflow-hidden",
                                                    isSelected
                                                        ? activeStyles
                                                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                                        isSelected ? bulletActive : "bg-zinc-300"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[12px] font-black uppercase tracking-tight",
                                                        isSelected ? textActive : "text-zinc-500"
                                                    )}>{stage.label}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className={cn(`absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 transition-all duration-700`, isSelected && (baseColor === 'zinc' ? 'text-zinc-900' : `text-${baseColor}-600`))}>
                                                        <CheckCircle2 size={40} />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* PRO IMPRESIÓN 3D */}
                            {status === 'IN_PROGRESS' && hasFailureReporting && (
                                <div className="space-y-6 animate-in zoom-in-95 fade-in duration-300 p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                        <Layers size={100} />
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                                            <Cpu className="h-3 w-3" /> Unidad de Proceso
                                        </Label>
                                        <div className="relative">
                                            <select
                                                className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-[13px] font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none text-zinc-900 dark:text-zinc-100 pr-10"
                                                value={selectedMachineId}
                                                onChange={(e) => {
                                                    const mId = e.target.value;
                                                    setSelectedMachineId(mId);
                                                    const machine = machines.find(m => m.id === mId);
                                                    if (machine) {
                                                        const slots = machine.maxFilaments || 1;
                                                        setMultiMaterials(Array(slots).fill(null).map(() => ({ materialId: '', gramsPerUnit: 0 })));
                                                    } else setMultiMaterials([]);
                                                }}
                                            >
                                                <option value="">COLA DE ESPERA GENERAL</option>
                                                {machines.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name.toUpperCase()} — {m.status === 'IDLE' ? 'DISPONIBLE' : 'EN OPERACIÓN'}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <Cpu size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {selectedMachineId && (
                                        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cartuchos / Slots</Label>
                                                <div className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[8px] font-black text-zinc-500">
                                                    MULTI-FILAMENT READY
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {multiMaterials.map((mm, idx) => (
                                                    <div key={idx} className="flex gap-3 items-center group/slot bg-white dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                                                        <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover/slot:text-primary transition-colors border border-zinc-100 dark:border-zinc-700/50">
                                                            S{idx + 1}
                                                        </div>
                                                        <select
                                                            className="flex-1 h-10 bg-transparent text-[11px] font-black focus:outline-none text-zinc-700 dark:text-zinc-200"
                                                            value={mm.materialId}
                                                            onChange={(e) => {
                                                                const newMulti = [...multiMaterials];
                                                                newMulti[idx].materialId = e.target.value;
                                                                setMultiMaterials(newMulti);
                                                            }}
                                                        >
                                                            <option value="">SIN MATERIAL...</option>
                                                            {materials.map(m => (
                                                                <option key={m.id} value={m.id}>{m.name} — {m.color?.toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                        <div className="relative w-24">
                                                            <input
                                                                type="number"
                                                                placeholder="0.0"
                                                                className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 px-3 pr-8 text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                                                                value={mm.gramsPerUnit || ''}
                                                                onChange={(e) => {
                                                                    const newMulti = [...multiMaterials];
                                                                    newMulti[idx].gramsPerUnit = Number(e.target.value);
                                                                    setMultiMaterials(newMulti);
                                                                }}
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400">g</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* RESPONSABLE & NOTAS */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                        <User size={12} /> Operador asignado
                                    </Label>
                                    <select
                                        className={cn(
                                            "w-full h-14 rounded-2xl border bg-white dark:bg-zinc-900 px-5 text-[13px] font-bold focus:outline-none transition-all appearance-none",
                                            !responsableId ? "border-amber-200 bg-amber-50/20" : "border-zinc-100 dark:border-zinc-800"
                                        )}
                                        value={responsableId}
                                        onChange={(e) => setResponsableId(e.target.value)}
                                    >
                                        <option value="">ASIGNAR OPERADOR...</option>
                                        {employees.filter(e => e.active).map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                        <MessageSquare size={12} /> Bitácora / Notas
                                    </Label>
                                    <textarea
                                        className="w-full min-h-[100px] rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/50 p-5 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                                        placeholder="Escribe alguna observación relevante..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* CONTROL DE COBRO AL ENTREGAR */}
                            {status === 'DELIVERED' && (order.saldo || 0) > 0 && (
                                <div className="p-6 rounded-[2.5rem] bg-emerald-50/50 dark:bg-emerald-950/10 border-2 border-emerald-100 dark:border-emerald-900/30 space-y-4 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-[11px] font-black uppercase text-emerald-600 tracking-tight">Saldo Pendiente</span>
                                                <span className="block text-lg font-black text-emerald-700 dark:text-emerald-400">$ {(order.saldo || 0).toLocaleString('es-AR')}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShouldPayBalance(!shouldPayBalance)}
                                            className={cn(
                                                "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                shouldPayBalance
                                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                                    : "bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-emerald-600"
                                            )}
                                        >
                                            {shouldPayBalance ? 'SALDAR AHORA' : 'SALDAR DEUDA?'}
                                        </button>
                                    </div>

                                    {shouldPayBalance && (
                                        <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/30 grid grid-cols-2 gap-2">
                                            {[
                                                { key: 'CASH', label: 'Efectivo' },
                                                { key: 'TRANSFER', label: 'Transf.' },
                                                { key: 'MP', label: 'MercadoPago' },
                                                { key: 'CARD', label: 'Tarjeta' }
                                            ].map((m) => (
                                                <button
                                                    key={m.key}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(m.key)}
                                                    className={cn(
                                                        "h-10 rounded-xl text-[10px] font-black uppercase border transition-all",
                                                        paymentMethod === m.key
                                                            ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-700 dark:text-emerald-300"
                                                            : "bg-white/50 border-emerald-100 dark:bg-zinc-900/50 dark:border-emerald-900/10 text-emerald-600/50"
                                                    )}
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* EMERGENCY FALLOUT / REPORTAR FALLO */}
                            {hasFailureReporting && order.estado !== 'DONE' && order.estado !== 'DELIVERED' && (
                                <button
                                    onClick={(e) => { e.preventDefault(); setIsFailureMode(true) }}
                                    className="w-full p-4 rounded-3xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
                                            <AlertOctagon size={18} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-[11px] font-black uppercase text-red-600 tracking-tight">Reportar Fallo / Error</span>
                                            <span className="block text-[9px] font-medium text-red-500/60 uppercase">Registrar descarte o reparación</span>
                                        </div>
                                    </div>
                                    <Plus className="text-red-300" size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        /* FORMULARIO DE FALLO REFINADO */
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600/70">Causa Raíz / Motivo</Label>
                                <textarea
                                    className="w-full min-h-[120px] rounded-[2rem] border-2 border-red-100 dark:border-red-900/30 bg-white dark:bg-zinc-900 px-6 py-5 text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
                                    placeholder="Describe brevemente qué salió mal..."
                                    value={failureReason}
                                    onChange={(e) => setFailureReason(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600/70">Cómputo de Perdida (Gramos)</Label>
                                <div className="space-y-3 p-6 rounded-[2.5rem] bg-red-500/[0.03] border border-red-500/10">
                                    {failureMaterials.map((fm, idx) => {
                                        const material = materials.find(m => m.id === fm.materialId);
                                        return (
                                            <div key={idx} className="flex gap-4 items-center bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-red-100/50">
                                                <div className="flex-1 px-2">
                                                    {!fm.materialId ? (
                                                        <select
                                                            className="w-full h-8 bg-transparent text-[11px] font-black focus:outline-none"
                                                            onChange={(e) => {
                                                                const newF = [...failureMaterials];
                                                                newF[idx].materialId = e.target.value;
                                                                setFailureMaterials(newF);
                                                            }}
                                                        >
                                                            <option value="">Elegir Material...</option>
                                                            {materials.map(m => (
                                                                <option key={m.id} value={m.id}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-200 truncate block">
                                                            {material?.name} — {material?.color}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="relative w-28">
                                                    <input
                                                        type="number"
                                                        className="w-full h-10 rounded-xl bg-red-500/[0.05] border-none px-4 pr-8 text-[13px] font-black text-red-600 focus:outline-none text-right"
                                                        value={fm.wastedGrams || ''}
                                                        onChange={(e) => {
                                                            const newF = [...failureMaterials];
                                                            newF[idx].wastedGrams = Number(e.target.value);
                                                            setFailureMaterials(newF);
                                                        }}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-400">g</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="pt-3 mt-3 border-t border-red-500/10 flex justify-between items-center px-2">
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Merma Total Declarada:</span>
                                        <span className="text-lg font-black text-red-600">
                                            {failureMaterials.reduce((a, c) => a + (c.wastedGrams || 0), 0)}g
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600/70">Acción Requerida Post-Fallo</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setMoveToReprint(true)}
                                        className={cn(
                                            "flex flex-col gap-1 p-5 rounded-[1.75rem] border-2 transition-all text-left",
                                            moveToReprint
                                                ? "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20"
                                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-[13px] font-black uppercase leading-none">{is3D ? 'Repetir' : 'Reparar'}</span>
                                        <span className="text-[10px] font-bold opacity-70">{is3D ? 'A fila de impresión' : 'A taller para ajuste'}</span>
                                    </button>
                                    <button
                                        onClick={() => setMoveToReprint(false)}
                                        className={cn(
                                            "flex flex-col gap-1 p-5 rounded-[1.75rem] border-2 transition-all text-left",
                                            !moveToReprint
                                                ? "bg-red-600 text-white border-red-700 shadow-lg shadow-red-500/20"
                                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-[13px] font-black uppercase leading-none">Descartar</span>
                                        <span className="text-[10px] font-bold opacity-70">Cierra como fallido</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 pt-0 gap-3">
                    {isFailureMode ? (
                        <>
                            <Button variant="ghost" onClick={() => setIsFailureMode(false)} className="h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] px-8 hover:bg-zinc-100">
                                <Undo2 className="mr-2 h-4 w-4" /> Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !failureReason}
                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20"
                            >
                                {isSaving ? "PROCESANDO..." : "DECLARAR FALLO CRÍTICO"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={onClose} className="h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] px-8 hover:bg-zinc-100">
                                IGNORAR
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !responsableId}
                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20"
                            >
                                {isSaving ? "GUARDANDO..." : "ACTUALIZAR PIPELINE"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
