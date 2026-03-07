'use client'

import { MachineGrid } from '@/src/components/MachineGrid'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Plus, Calendar, Package, ChevronDown, Edit, Trash2 } from 'lucide-react'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { useState, useEffect } from 'react'
import { api } from '@/src/lib/api'
import { Machine, MachineStatus } from '@/src/types'

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
        setIsDialogOpen(true)
    }

    const handleOpenEdit = () => {
        if (!selectedMachineDetail) return
        setEditingId(selectedMachineDetail.id)
        setFormNombre(selectedMachineDetail.name)
        setFormModelo(selectedMachineDetail.model || '')
        setFormNozzle(selectedMachineDetail.nozzle || '0.4mm')
        setIsDialogOpen(true)
        setIsDetailSheetOpen(false)
    }

    const handleDelete = async () => {
        if (!selectedMachineDetail || !negocioActivoId) return
        if (!confirm('¿Estás seguro de desactivar esta unidad? No aparecerá más en el monitor activo.')) return

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
                }, negocioActivoId)
                toast.success('Unidad actualizada correctamente')
            } else {
                await api.printers.create({
                    businessId: negocioActivoId,
                    name: formNombre,
                    model: formModelo,
                    nozzle: formNozzle,
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">{config.labels.maquinas}</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Estado y monitoreo de unidades productivas en tiempo real</p>
                </div>
                <Button
                    className="h-12 px-6 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-zinc-900/10 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 lg:h-14 lg:px-8 lg:text-xs"
                    onClick={handleOpenCreate}
                >
                    <Plus className="h-4 w-4" /> Nueva Unidad
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900/20 p-4 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <div className="w-full sm:w-[280px] relative">
                    <select className="w-full h-12 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                        <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">FILTRAR POR ESTADO (TODOS)</option>
                        <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">OPERATIVA / LIBRE</option>
                        <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">EN PRODUCCIÓN / OCUPADA</option>
                        <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">MANTENIMIENTO / FUERA DE LÍNEA</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 border-4 border-zinc-100 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Escaneando Red de Máquinas</p>
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
                <div className="py-24 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/20 dark:bg-zinc-900/10 grayscale opacity-80">
                    <div className="h-20 w-20 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center">
                        <Plus className="h-10 w-10 text-zinc-200 rotate-45" />
                    </div>
                    <div className="space-y-2 px-8">
                        <p className="text-xl font-black text-zinc-400 uppercase tracking-tight">Sin activos registrados</p>
                        <p className="text-sm text-zinc-500 italic max-w-sm mx-auto">Comienza añadiendo tu primera máquina para habilitar el flujo de producción.</p>
                    </div>
                </div>
            )}

            {/* Modal para Crear/Editar Máquina */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar' : 'Añadir Nueva'} {config.labels.maquinas.slice(0, -1)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{config.labels.unidadName}</label>
                            <Input
                                value={formNombre}
                                onChange={(e) => setFormNombre(e.target.value)}
                                placeholder="Ej: Unidad #1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{config.labels.unidadModel}</label>
                            <Input
                                value={formModelo}
                                onChange={(e) => setFormModelo(e.target.value)}
                                placeholder="Ej: Especialista / Puesto"
                            />
                        </div>
                        {negocioActivo?.rubro === 'IMPRESION_3D' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nozzle / Herramienta</label>
                                <Input
                                    value={formNozzle}
                                    onChange={(e) => setFormNozzle(e.target.value)}
                                    placeholder="Ej: 0.4mm"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para Asignar Pedido */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Asignar Pedido a {config.labels.maquinas.slice(0, -1)}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">1. Seleccionar Material / Insumo</label>
                            {availableMaterials.length > 0 ? (
                                <select
                                    className="w-full h-11 rounded-lg border border-zinc-200 bg-white dark:bg-zinc-900 px-3 text-sm font-bold dark:border-zinc-800 shadow-sm"
                                    value={selectedMaterialId}
                                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                                >
                                    {availableMaterials.map(m => (
                                        <option key={m.id} value={m.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                                            {m.name} ({m.stock} {m.unit} restantes)
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-400">
                                    No tienes materiales registrados. Se asignará sin control de stock.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">2. Seleccionar Pedido</label>
                            <p className="text-[11px] text-zinc-500">Selecciona un pedido pendiente para comenzar la producción.</p>

                            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2">
                                {loadingOrders ? (
                                    <p className="text-center py-8 text-zinc-400 animate-pulse">Cargando pedidos...</p>
                                ) : pendingOrders.length > 0 ? (
                                    pendingOrders.map((order: any) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                            <div>
                                                <p className="font-bold text-sm">{order.clientName}</p>
                                                <p className="text-xs text-zinc-500">Código: {order.code || order.id.slice(0, 8)}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAssignOrder(order.id)}
                                                disabled={saving}
                                            >
                                                Seleccionar
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-zinc-400 italic">No hay pedidos pendientes.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Panel Lateral de Detalles */}
            <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <div className="flex items-center justify-between pr-8">
                            <SheetTitle className="text-xl font-bold">Detalles de {config.labels.maquinas.slice(0, -1)}</SheetTitle>
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={handleOpenEdit}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-rose-100 text-rose-500 hover:bg-rose-50" onClick={handleDelete}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </SheetHeader>

                    {loadingDetail ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-8 w-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                            <p className="text-sm text-zinc-500">Cargando información...</p>
                        </div>
                    ) : selectedMachineDetail ? (
                        <div className="mt-8 space-y-8">
                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Información General</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Nombre</p>
                                        <p className="text-sm font-bold">{selectedMachineDetail.name}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Estado</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${selectedMachineDetail.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <p className="text-sm font-bold">{selectedMachineDetail.status}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">{config.labels.unidadModel}</p>
                                        <p className="text-sm font-bold">{selectedMachineDetail.model || 'N/A'}</p>
                                    </div>
                                    {negocioActivo?.rubro === 'IMPRESION_3D' && (
                                        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Nozzle</p>
                                            <p className="text-sm font-bold">{selectedMachineDetail.nozzle || 'N/A'}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Historial de Producción</h3>
                                <div className="space-y-3">
                                    {selectedMachineDetail.productionJobs?.length > 0 ? (
                                        selectedMachineDetail.productionJobs.map((job: any) => (
                                            <div key={job.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">#{job.order?.code || job.orderId.slice(0, 8)}</p>
                                                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{job.order?.clientName || 'Cliente desconocido'}</p>
                                                    </div>
                                                    <Badge variant={job.status === 'DONE' ? 'secondary' : 'default'} className="text-[9px] font-black uppercase px-2 py-0.5">
                                                        {job.status === 'DONE' ? 'Finalizado' : 'En Curso'}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                    <div className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900">
                                                        <Package className="h-3.5 w-3.5 text-zinc-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] text-zinc-400 font-bold uppercase leading-none mb-1">Producto / Ítem</p>
                                                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                                            {job.orderItem?.name || 'Ítem no especificado'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                                        {job.totalUnits} UNID.
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
                                            <p className="text-xs text-zinc-500 italic">No hay historial registrado.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </div>
    )
}
