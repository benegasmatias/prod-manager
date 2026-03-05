'use client'

import { MachineGrid } from '@/src/components/MachineGrid'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Plus, Calendar, Package } from 'lucide-react'
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
    const { negocioActivoId, negocioActivo } = useNegocio()
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
    const [loadingOrders, setLoadingOrders] = useState(false)

    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
    const [selectedMachineDetail, setSelectedMachineDetail] = useState<any>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

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
                    type: p.model || 'FDM',
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
        } catch (error) {
            toast.error('Error al cargar pedidos pendientes')
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleAssignOrder = async (orderId: string) => {
        if (!selectedMachineId) return
        setSaving(true)
        try {
            await api.printers.assignOrder(selectedMachineId, orderId)
            toast.success('Pedido asignado a la máquina')
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
        if (saving) return
        setSaving(true)
        try {
            await api.printers.release(machineId)
            toast.success('Máquina liberada y trabajo finalizado')
            loadMachines()
            refreshPedidos()
        } catch (error: any) {
            toast.error('Error al liberar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDetailClick = async (machineId: string) => {
        setIsDetailSheetOpen(true)
        setLoadingDetail(true)
        try {
            const data = await api.printers.getOne(machineId)
            setSelectedMachineDetail(data)
        } catch (error) {
            toast.error('Error al cargar detalle de máquina')
            setIsDetailSheetOpen(false)
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleSave = async () => {
        if (!formNombre) {
            toast.error('El nombre es obligatorio')
            return
        }

        setSaving(true)
        try {
            await api.printers.create({
                businessId: negocioActivoId,
                name: formNombre,
                model: formModelo,
                nozzle: formNozzle,
                active: true
            })
            toast.success('Máquina creada correctamente')
            setIsDialogOpen(false)
            setFormNombre('')
            setFormModelo('')
            loadMachines()
        } catch (error: any) {
            toast.error('Error al crear máquina: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (negocioActivo?.rubro !== 'IMPRESION_3D') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 px-4">
                <div className="bg-zinc-100 p-6 rounded-full dark:bg-zinc-800">
                    <Plus className="h-10 w-10 text-zinc-300 rotate-45" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Módulo no disponible</h2>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                        El rubro <span className="font-bold text-zinc-900 dark:text-zinc-100">{negocioActivo?.rubro}</span> no utiliza gestión de máquinas pesadas en esta configuración.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Máquinas</h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Estado y monitoreo de maquinaria en tiempo real.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-full sm:w-auto shadow-sm">
                    <Plus className="h-4 w-4" /> Nueva Máquina
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-[240px] rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all">
                    <select className="bg-transparent text-sm font-bold focus:outline-none w-full cursor-pointer appearance-none">
                        <option>Todos los estados</option>
                        <option>Libre</option>
                        <option>Ocupada</option>
                        <option>Mantenimiento</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 animate-pulse">
                    Cargando máquinas...
                </div>
            ) : machines.length > 0 ? (
                <MachineGrid
                    machines={machines}
                    onAssign={handleAssignClick}
                    onRelease={handleReleaseMachine}
                    onDetail={handleDetailClick}
                    isSubmitting={saving}
                />
            ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                    No hay máquinas registradas para este negocio.
                </div>
            )}

            {/* Modal para Crear Máquina */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Añadir Nueva Máquina</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre / ID de Máquina</label>
                            <Input
                                value={formNombre}
                                onChange={(e) => setFormNombre(e.target.value)}
                                placeholder="Ej: Ender 3 #1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modelo / Marca</label>
                            <Input
                                value={formModelo}
                                onChange={(e) => setFormModelo(e.target.value)}
                                placeholder="Ej: Creality Ender 3 S1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nozzle / Herramienta</label>
                            <Input
                                value={formNozzle}
                                onChange={(e) => setFormNozzle(e.target.value)}
                                placeholder="Ej: 0.4mm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Máquina'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para Asignar Pedido */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Asignar Pedido a Máquina</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-zinc-500">Selecciona un pedido pendiente para comenzar la producción en esta máquina.</p>

                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
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
                </DialogContent>
            </Dialog>

            {/* Panel Lateral de Detalles de Máquina */}
            <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold">Detalles de Máquina</SheetTitle>
                    </SheetHeader>

                    {loadingDetail ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-8 w-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                            <p className="text-sm text-zinc-500">Cargando información...</p>
                        </div>
                    ) : selectedMachineDetail ? (
                        <div className="mt-8 space-y-8">
                            {/* Información Básica */}
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
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Modelo</p>
                                        <p className="text-sm font-bold">{selectedMachineDetail.model || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Nozzle</p>
                                        <p className="text-sm font-bold">{selectedMachineDetail.nozzle || 'N/A'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Historial de Trabajos */}
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
                                                    <Badge variant={job.status === 'DONE' ? 'success' : 'warning'} className="text-[9px] font-black uppercase px-2 py-0.5">
                                                        {job.status === 'DONE' ? 'Finalizado' : 'En Cola/Curso'}
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
