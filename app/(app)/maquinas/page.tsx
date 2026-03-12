'use client'

import { MachineGrid } from '@/src/components/MachineGrid'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Plus, Calendar, Package, ChevronDown, Edit, Trash2, Settings2, Cpu, Ruler, Layers, Activity, Info, X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { useState, useEffect } from 'react'
import { api } from '@/src/lib/api'
import { Machine, MachineStatus } from '@/src/types'
import { cn } from '@/src/lib/utils'

import { toast } from 'react-hot-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/src/components/ui/sheet"
import { Input } from '@/src/components/ui/input'

export default function MachinesPage() {
    const { negocioActivoId, negocioActivo, config } = useNegocio()
    const { refresh: refreshPedidos } = usePedidos()
    const [machines, setMachines] = useState<Machine[]>([])
    const [loading, setLoading] = useState(true)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formNombre, setFormNombre] = useState('')
    const [formModelo, setFormModelo] = useState('')
    const [formNozzle, setFormNozzle] = useState('0.4mm')
    const [formMaxFilaments, setFormMaxFilaments] = useState(1)

    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null)
    const [pendingOrders, setPendingOrders] = useState<any[]>([])
    const [availableMaterials, setAvailableMaterials] = useState<any[]>([])
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
    const [loadingOrders, setLoadingOrders] = useState(false)

    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
    const [selectedMachineDetail, setSelectedMachineDetail] = useState<any>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const [editingId, setEditingId] = useState<string | null>(null)

    const loadMachines = async () => {
        if (!negocioActivoId) return
        setLoading(true)
        try {
            const data: any = await api.printers.getAll(negocioActivoId)
            const mapped: Machine[] = data.map((p: any) => {
                let status: MachineStatus = 'Libre'
                if (p.status === 'PRINTING') status = 'Ocupada'
                if (p.status === 'MAINTENANCE' || p.status === 'DOWN') status = 'Mantenimiento'

                return {
                    id: p.id,
                    name: p.name,
                    type: p.model || 'N/A',
                    status: status,
                    maxFilaments: p.maxFilaments || 1,
                    queue: [],
                    currentJobId: undefined
                }
            })
            setMachines(mapped)
        } catch (error) {
            console.error('Error fetching machines:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMachines()
    }, [negocioActivoId])

    const handleAssignClick = async (machineId: string) => {
        setSelectedMachineId(machineId)
        setIsAssignDialogOpen(true)
        setLoadingOrders(true)
        try {
            // Buscamos pedidos pendientes para este negocio
            const orders = await api.orders.getAll({ businessId: negocioActivoId, status: 'PENDING' })
            setPendingOrders(orders as any[])

            const mats = await api.materials.getAll(negocioActivoId) as any[]
            setAvailableMaterials(mats)
            if (mats.length > 0) setSelectedMaterialId(mats[0].id)
        } catch (error) {
            toast.error('Error al cargar pedidos pendientes')
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleAssignOrder = async (orderId: string) => {
        if (!selectedMachineId || !negocioActivoId) return
        setSaving(true)
        try {
            await api.printers.assignOrder(selectedMachineId, orderId, selectedMaterialId || undefined, negocioActivoId)
            toast.success('Pedido asignado correctamente')
            setIsAssignDialogOpen(false)
            loadMachines()
            refreshPedidos()
        } catch (error: any) {
            toast.error('Error al asignar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleReleaseMachine = async (machineId: string) => {
        if (saving || !negocioActivoId) return
        setSaving(true)
        try {
            await api.printers.release(machineId, negocioActivoId)
            toast.success('Unidad liberada y trabajo finalizado')
            loadMachines()
            refreshPedidos()
        } catch (error: any) {
            toast.error('Error al liberar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDetailClick = async (machineId: string) => {
        if (!negocioActivoId) return
        setIsDetailSheetOpen(true)
        setLoadingDetail(true)
        try {
            const data = await api.printers.getOne(machineId, negocioActivoId)
            setSelectedMachineDetail(data)
        } catch (error) {
            toast.error('Error al cargar detalle')
            setIsDetailSheetOpen(false)
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleOpenCreate = () => {
        setEditingId(null)
        setFormNombre('')
        setFormModelo('')
        setFormNozzle('0.4mm')
        setFormMaxFilaments(1)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = () => {
        if (!selectedMachineDetail) return
        setEditingId(selectedMachineDetail.id)
        setFormNombre(selectedMachineDetail.name)
        setFormModelo(selectedMachineDetail.model || '')
        setFormNozzle(selectedMachineDetail.nozzle || '0.4mm')
        setFormMaxFilaments(selectedMachineDetail.maxFilaments || 1)
        setIsDialogOpen(true)
        setIsDetailSheetOpen(false)
    }

    const handleDelete = async () => {
        if (!selectedMachineDetail || !negocioActivoId) return
        if (!confirm('¿Estás seguro de desactivar esta unidad? No aparecerá más en el listado activo.')) return

        setSaving(true)
        try {
            await api.printers.remove(selectedMachineDetail.id, negocioActivoId)
            toast.success('Unidad desactivada correctamente')
            setIsDetailSheetOpen(false)
            loadMachines()
        } catch (error: any) {
            toast.error('Error al desactivar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleSave = async () => {
        if (!formNombre || !negocioActivoId) {
            toast.error('El nombre es obligatorio')
            return
        }

        setSaving(true)
        try {
            if (editingId) {
                await api.printers.update(editingId, {
                    name: formNombre,
                    model: formModelo,
                    nozzle: formNozzle,
                    maxFilaments: formMaxFilaments,
                }, negocioActivoId)
                toast.success('Unidad actualizada correctamente')
            } else {
                await api.printers.create({
                    businessId: negocioActivoId,
                    name: formNombre,
                    model: formModelo,
                    nozzle: formNozzle,
                    maxFilaments: formMaxFilaments,
                    active: true
                })
                toast.success('Unidad creada correctamente')
            }
            setIsDialogOpen(false)
            loadMachines()
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Gestión de Equipamiento</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Producción y <span className="text-primary italic">{config.labels.maquinas}</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Monitoreo en tiempo real, mantenimiento preventivo y optimización de carga de trabajo por unidad operativa.
                    </p>
                </div>
                <Button
                    className="h-11 px-6 lg:h-12 lg:px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] gap-2"
                    onClick={handleOpenCreate}
                >
                    <Plus className="h-4 w-4" /> Nueva {config.labels.maquinas.slice(0, -1)}
                </Button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/70 dark:bg-zinc-900/40 p-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <div className="w-full sm:w-[280px] relative group">
                    <select className="w-full h-11 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-xs font-bold text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                        <option>TODOS LOS ESTADOS</option>
                        <option>OPERATIVA / LIBRE</option>
                        <option>EN PRODUCCIÓN / OCUPADA</option>
                        <option>MANTENIMIENTO / FUERA DE LÍNEA</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none transition-colors group-hover:text-zinc-500" />
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <div className="h-10 w-10 border-4 border-zinc-100 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-medium text-zinc-400">Cargando unidades productivas...</p>
                </div>
            ) : machines.length > 0 ? (
                <MachineGrid
                    machines={machines}
                    onAssign={handleAssignClick}
                    onRelease={handleReleaseMachine}
                    onDetail={handleDetailClick}
                    isSubmitting={saving}
                    iconName={config.icons.maquinas}
                />
            ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-900/5">
                    <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                        {(() => {
                            const IconComponent = (LucideIcons as any)[config.icons.maquinas] || LucideIcons.Cpu;
                            return <IconComponent className="h-7 w-7 text-zinc-300 p-0.5" />;
                        })()}
                    </div>
                    <div className="space-y-1 px-8 text-center">
                        <p className="text-lg font-bold text-zinc-400 tracking-tight">Sin {config.labels.maquinas.toLowerCase()} registradas</p>
                        <p className="text-sm text-zinc-500 max-w-sm mx-auto">Comienza añadiendo un activo para habilitar el flujo de producción.</p>
                    </div>
                </div>
            )}

            {/* Modal para Crear/Editar Máquina */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white dark:bg-zinc-950">
                    <DialogHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 text-left relative">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group">
                                {(() => {
                                    const IconComponent = (LucideIcons as any)[config.icons.maquinas] || LucideIcons.Cpu;
                                    return <IconComponent className="h-6 w-6 transition-transform group-hover:scale-110" />;
                                })()}
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    {editingId ? `Editar ${config.labels.maquinas.slice(0, -1)}` : `Nueva ${config.labels.maquinas.slice(0, -1)}`}
                                </DialogTitle>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                                    {config.labels.produccion || 'Gestión de Equipamiento'}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                                    {config.labels.unidadName}
                                </label>
                                <div className="relative group">
                                    <Input
                                        value={formNombre}
                                        onChange={(e) => setFormNombre(e.target.value)}
                                        className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                        placeholder="Ej: Impresora Pro #1 / Torno CNC"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                                    {config.labels.unidadModel}
                                </label>
                                <Input
                                    value={formModelo}
                                    onChange={(e) => setFormModelo(e.target.value)}
                                    className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                    placeholder="Especificación técnica o modelo"
                                />
                            </div>
                        </div>

                        {negocioActivo?.rubro === 'IMPRESION_3D' && (
                            <div className="pt-8 border-t border-zinc-50 dark:border-zinc-800/50 grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                                        Nozzle
                                    </label>
                                    <Input
                                        value={formNozzle}
                                        onChange={(e) => setFormNozzle(e.target.value)}
                                        className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                        placeholder="0.4mm"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                                        Insumos
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={1}
                                            value={formMaxFilaments}
                                            onChange={(e) => setFormMaxFilaments(Number(e.target.value))}
                                            className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900 pr-12"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">UNID</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4 items-start mx-2">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-primary/80 font-medium leading-relaxed">
                                Una vez creada, la unidad aparecerá disponible en el panel de producción para asignar nuevos pedidos y monitorear su estado en tiempo real.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex flex-row items-center justify-end gap-3 bg-white dark:bg-zinc-950">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={saving}
                            className="rounded-2xl font-bold h-12 px-6 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-2xl font-bold h-12 px-10 bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Guardando...</span>
                                </div>
                            ) : (
                                <span>{editingId ? 'Actualizar Registro' : 'Confirmar y Crear'}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para Asignar Pedido */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white dark:bg-zinc-950">
                    <DialogHeader className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 text-left">
                        <DialogTitle className="text-xl font-bold tracking-tight">Asignar Producción</DialogTitle>
                        <p className="text-xs text-zinc-500 font-medium mt-1">Selecciona el material y el pedido para iniciar el proceso.</p>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Seleccionar Material / Insumo</label>
                            {availableMaterials.length > 0 ? (
                                <div className="relative group">
                                    <select
                                        className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/50 px-4 text-sm font-semibold dark:border-zinc-800 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                        value={selectedMaterialId}
                                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                                    >
                                        {availableMaterials.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.stock} {m.unit} disponibles)
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none transition-colors group-hover:text-zinc-500" />
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-1">
                                        <Package className="h-4 w-4" />
                                        <p className="text-xs font-bold">Sin materiales registrados</p>
                                    </div>
                                    <p className="text-xs text-amber-700/70 dark:text-amber-500/70 leading-relaxed">
                                        No tienes stock cargado. Se asignará el trabajo sin descontar insumos automáticamente.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Seleccionar Pedido Pendiente</label>
                            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {loadingOrders ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                                        <div className="h-6 w-6 border-2 border-zinc-100 border-t-primary rounded-full animate-spin" />
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Consultando pedidos...</p>
                                    </div>
                                ) : pendingOrders.length > 0 ? (
                                    pendingOrders.map((order: any) => (
                                        <div
                                            key={order.id}
                                            className="group relative flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                            onClick={() => handleAssignOrder(order.id)}
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{order.clientName}</p>
                                                    <span className="text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform">#{order.code || order.id.slice(0, 8)}</span>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 font-medium">Items: {order.items?.length || 0}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center space-y-2">
                                        <p className="text-sm font-semibold text-zinc-400">Todo al día</p>
                                        <p className="text-xs text-zinc-500 italic">No hay pedidos pendientes para asignar.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Panel Lateral de Detalles */}
            <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
                <SheetContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950">
                    <div className="flex flex-col h-full">
                        <SheetHeader className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <SheetTitle className="text-xl font-bold tracking-tight">Gestión de {config.labels.maquinas.slice(0, -1)}</SheetTitle>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{selectedMachineDetail?.name || 'Cargando...'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 group"
                                        onClick={handleOpenEdit}
                                    >
                                        <Edit className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl border-rose-100 text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {loadingDetail ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="h-10 w-10 border-4 border-zinc-100 border-t-primary rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sincronizando...</p>
                                </div>
                            ) : selectedMachineDetail ? (
                                <>
                                    <section className="space-y-5">
                                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Especificaciones</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:border-zinc-200 shadow-sm">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Estado Operativo</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${selectedMachineDetail.status === 'IDLE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedMachineDetail.status === 'IDLE' ? 'Libre' : 'Produciendo'}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:border-zinc-200 shadow-sm">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">{config.labels.unidadModel}</p>
                                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedMachineDetail.model || 'N/A'}</p>
                                            </div>
                                            {negocioActivo?.rubro === 'IMPRESION_3D' && (
                                                <>
                                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800  shadow-sm">
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Nozzle actual</p>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedMachineDetail.nozzle || '0.4mm'}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Capacidad Max.</p>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedMachineDetail.maxFilaments || 1} Rollos</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </section>

                                    <section className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Historial Reciente</h3>
                                            <Badge variant="outline" className="text-[10px] bg-zinc-100 dark:bg-zinc-900 font-bold">Últimos trabajos</Badge>
                                        </div>
                                        <div className="space-y-4">
                                            {selectedMachineDetail.productionJobs?.length > 0 ? (
                                                selectedMachineDetail.productionJobs.map((job: any) => (
                                                    <div key={job.id} className="group p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-4 hover:shadow-md transition-all duration-300">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-primary uppercase tracking-tight">#{job.order?.code || job.orderId.slice(0, 8)}</p>
                                                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{job.order?.clientName || 'Cliente'}</p>
                                                            </div>
                                                            <div className={cn(
                                                                "text-[9px] font-bold uppercase px-2.5 py-1 rounded-full",
                                                                job.status === 'DONE' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-blue-50 text-blue-600 dark:bg-blue-950/30"
                                                            )}>
                                                                {job.status === 'DONE' ? 'Terminado' : 'En Curso'}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 group-hover:bg-zinc-50 transition-colors">
                                                            <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                                <Package className="h-4 w-4 text-zinc-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Producto / Ítem</p>
                                                                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate leading-relaxed">
                                                                    {job.orderItem?.name || 'Item General'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2">
                                                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                                                                <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                                                                {job.totalUnits || 1} UNID.
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center border-2 border-dashed rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/10">
                                                    <p className="text-xs text-zinc-400 italic">No hay registros previos en este activo.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </>
                            ) : null}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
