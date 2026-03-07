'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Pedido, ItemPedido } from '@/src/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Badge } from '@/src/components/ui/badge'
import { Money } from '@/src/components/Money'
import { Button } from '@/src/components/ui/button'
import { ArrowLeft, Save, Printer, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { getNegocioConfig, mapCategoryToRubro } from '@/src/domain/negocio'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { api } from '@/src/lib/api'
import { WhatsAppButton } from '@/src/components/WhatsAppButton'
import { toast } from 'react-hot-toast'
import { cn } from '@/src/lib/utils'
import { OrderStatusModal } from '@/src/components/OrderStatusModal'

export default function OrderDetailPage() {
    const { id } = useParams()
    const { config, negocioActivoId, negocioActivo } = useNegocio()
    const { pedidos, refresh } = usePedidos()
    const [order, setOrder] = useState<Pedido | null>(null)
    const [items, setItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [employees, setEmployees] = useState<any[]>([])
    const [isUpdatingJob, setIsUpdatingJob] = useState(false)
    const [isAddingWorkflow, setIsAddingWorkflow] = useState(false)
    const { updatePedido } = usePedidos()
    const [isSaving, setIsSaving] = useState(false)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

    useEffect(() => {
        if (negocioActivoId) {
            api.employees.getAll(negocioActivoId, true).then(data => setEmployees(data as any[])).catch(console.error)
        }
    }, [negocioActivoId])

    const mapOrder = (order: any): Pedido => {
        // Usamos las claves crudas del backend, el mapeo se hace en la UI con la config del negocio
        const now = new Date();
        const dueDate = new Date(order.dueDate);
        const isCompleted = order.status === 'DONE' || order.status === 'DELIVERED';
        const isOverdue = dueDate < now && !isCompleted;

        return {
            id: order.id,
            negocioId: order.businessId,
            numero: order.code || order.id.slice(0, 8),
            clienteId: order.customerId || '',
            clientName: order.clientName || '',
            clientPhone: order.clientPhone || '',
            fechaCreacion: order.createdAt,
            fechaEntrega: order.dueDate,
            estado: order.status || 'PENDING',
            observaciones: order.notes || '',
            total: Number(order.totalPrice) || 0,
            totalPrice: Number(order.totalPrice) || 0,
            profit: order.profit || 0,
            totalSenias: 0,
            saldo: Number(order.totalPrice) || 0,
            urgencia: isOverdue ? 'VENCIDO' : 'EN TIEMPO',
            responsableGeneral: order.responsableGeneral,
            jobs: order.jobs?.map((job: any) => ({
                id: job.id,
                title: job.title,
                status: job.status,
                responsable: job.responsable,
                notes: job.notes,
                sortRank: job.sortRank
            })) || [],
            items: order.items?.map((item: any) => ({
                id: item.id,
                nombre: item.name,
                nombreProducto: item.name,
                descripcion: item.description,
                cantidad: item.qty,
                quantityProduced: item.doneQty || 0,
                precioUnitario: Number(item.price) || 0,
                senia: Number(item.deposit) || 0,
                url_stl: item.stlUrl,
                peso_gramos: item.weightGrams,
                duracion_estimada_minutos: item.estimatedMinutes,
                demora_estimada_minutos: item.estimatedMinutes,
                metadata: item.metadata || {},
                ...item.metadata // Incluímos los campos dinámicos para compatibilidad con campos de config
            })) || []
        }
    }

    useEffect(() => {
        const businessOrders = pedidos[negocioActivoId] || []
        const foundOrder = businessOrders.find(o => o.id === id)

        if (foundOrder) {
            setOrder(foundOrder)
            setItems([...foundOrder.items])
            setIsLoading(false)
        } else if (id && typeof id === 'string') {
            const fetchOrder = async () => {
                try {
                    const data: any = await api.orders.getOne(id)
                    const mapped = mapOrder(data)
                    setOrder(mapped)
                    setItems([...mapped.items])
                } catch (error) {
                    console.error('Error fetching order detail:', error)
                    toast.error('No se pudo cargar el pedido')
                } finally {
                    setIsLoading(false)
                }
            }
            fetchOrder()
        }
    }, [id, negocioActivoId, pedidos])

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Cargando detalles del pedido...</div>
    if (!order) return <div className="p-8 text-center text-zinc-500">Pedido no encontrado.</div>

    const handleUpdateProduced = (itemId: string, val: number) => {
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantityProduced: val } : item
        ))
    }

    const handleUpdateJobStatus = async (jobId: string, status: string) => {
        setIsUpdatingJob(true)
        try {
            await (api as any).jobs.updateStatus(jobId, status)
            toast.success('Estado de etapa actualizado')
        } catch (error) {
            toast.error('Error al actualizar etapa')
        } finally {
            setIsUpdatingJob(false)
        }
    }

    const handleAddStage = async (title: string) => {
        if (!order) return
        try {
            await (api as any).jobs.create({
                orderId: order.id,
                orderItemId: order.items[0]?.id || '',
                title,
                totalUnits: 1,
                status: 'QUEUED'
            })
            toast.success('Etapa agregada')
        } catch (err) {
            toast.error('Error al agregar etapa')
        }
    }



    const handleStatusUpdateClick = () => {
        setIsStatusModalOpen(true)
    }

    const handleSaveChanges = async () => {
        if (!order) return
        setIsSaving(true)
        try {
            await updatePedido(negocioActivoId, order.id, {
                responsableGeneral: order.responsableGeneral,
                observaciones: order.observaciones,
                // Si items cambiaron, aquí podrías persistir también si el backend lo soporta
            } as any)
            toast.success('Cambios guardados')
        } finally {
            setIsSaving(false)
        }
    }

    const effectiveRubro = order?.negocioId === negocioActivoId
        ? (negocioActivo?.rubro || 'GENERICO')
        : mapCategoryToRubro((order as any)?.business?.category)

    const effectiveConfig = getNegocioConfig(effectiveRubro)

    const getStatusStyles = (status: string) => {
        const stage = effectiveConfig.productionStages.find(s => s.key === status)
        if (stage) {
            const baseColor = stage.color.split('-')[1] // Ej: 'blue', 'emerald'
            if (baseColor === 'zinc') return 'bg-zinc-100 text-zinc-600 border-zinc-200'
            return `bg-${baseColor}-50 text-${baseColor}-600 border-${baseColor}-200 dark:bg-${baseColor}-950/20 dark:text-${baseColor}-400 dark:border-${baseColor}-900/50`
        }
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
    }

    const getStatusLabel = (status: string) => {
        const stage = effectiveConfig.productionStages.find(s => s.key === status)
        return stage?.label || status
    }

    const fieldsBySection: Record<string, typeof effectiveConfig.itemFields> = {}
    effectiveConfig.itemFields.forEach(f => {
        const section = f.section || 'General'
        if (!fieldsBySection[section]) fieldsBySection[section] = []
        fieldsBySection[section].push(f)
    })

    return (
        <div className="space-y-6 sm:space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/pedidos">
                        <Button variant="outline" size="icon" className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Pedido: {order.numero}</h1>
                        <p className="text-xs sm:text-sm text-zinc-500">{order.clientName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <WhatsAppButton
                        phone={order.clientPhone}
                        message={`Hola ${order.clientName}! Te consulto sobre tu pedido ${order.numero} que está en estado: ${getStatusLabel(order.estado)}.`}
                        variant="ghost"
                        className="bg-green-50/50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-900 flex-1 sm:flex-none"
                    />
                    <Button
                        size="sm"
                        className="flex-1 sm:flex-none h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/10"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2">
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-zinc-50 dark:border-zinc-900">
                            <CardTitle className="text-lg">{effectiveConfig.labels.items}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 px-4 sm:px-8">
                            <div className="space-y-16">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900 dark:bg-zinc-100 opacity-20 group-hover:opacity-100 transition-opacity" />

                                        <div className="p-8 space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black">
                                                    {idx + 1}
                                                </div>
                                                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Detalle del Ítem</h4>
                                            </div>

                                            {/* SECCIÓN ESTÁNDAR: CANTIDADES Y PRECIOS */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cantidad</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.cantidad || ''}
                                                        onChange={e => {
                                                            const val = Number(e.target.value)
                                                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, cantidad: val } : i))
                                                        }}
                                                        className="h-11 rounded-xl bg-white focus:bg-white dark:bg-zinc-950 dark:focus:bg-zinc-950 transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Precio Unit.</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.precioUnitario || ''}
                                                        onChange={e => {
                                                            const val = Number(e.target.value)
                                                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, precioUnitario: val } : i))
                                                        }}
                                                        className="h-11 rounded-xl bg-white focus:bg-white dark:bg-zinc-950 dark:focus:bg-zinc-950 transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Seña</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.senia || ''}
                                                        onChange={e => {
                                                            const val = Number(e.target.value)
                                                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, senia: val } : i))
                                                        }}
                                                        className="h-11 rounded-xl bg-white focus:bg-white dark:bg-zinc-950 dark:focus:bg-zinc-950 transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Subtotal</Label>
                                                    <div className="h-11 flex items-center px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/30 text-sm font-black text-zinc-900 dark:text-zinc-50 border border-transparent">
                                                        <Money amount={(item.cantidad || 0) * (item.precioUnitario || 0)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                                                    <div key={sectionName} className={cn(
                                                        "space-y-6",
                                                        sectionName === 'OPCIONALES' ? "md:col-span-1" : "md:col-span-2"
                                                    )}>
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                                            {sectionName}
                                                        </h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            {sectionFields.map(f => {
                                                                const value = item[f.key] ?? item.metadata?.[f.key]
                                                                return (
                                                                    <div key={f.key} className={cn(
                                                                        "space-y-3",
                                                                        f.key === 'nombreProducto' || f.tipo === 'textarea' ? "sm:col-span-2" : ""
                                                                    )}>
                                                                        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">{f.label}</label>

                                                                        {f.tipo === 'textarea' ? (
                                                                            <textarea
                                                                                className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                                                                value={value || ''}
                                                                                onChange={e => {
                                                                                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, [f.key]: e.target.value } : i))
                                                                                }}
                                                                            />
                                                                        ) : f.tipo === 'boolean' ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, [f.key]: !value } : i))
                                                                                }}
                                                                                className={cn(
                                                                                    "flex items-center gap-3 h-11 w-full rounded-xl border px-4 transition-all duration-200",
                                                                                    value
                                                                                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10"
                                                                                        : "bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950/20 dark:border-zinc-800"
                                                                                )}
                                                                            >
                                                                                <div className={cn(
                                                                                    "h-5 w-9 rounded-full p-1 transition-colors flex items-center",
                                                                                    value ? "bg-white/20 dark:bg-black/10" : "bg-zinc-100 dark:bg-zinc-800"
                                                                                )}>
                                                                                    <div className={cn(
                                                                                        "h-3 w-3 rounded-full transition-transform duration-200",
                                                                                        value ? "translate-x-4 bg-white dark:bg-zinc-900" : "translate-x-0 bg-zinc-300 dark:bg-zinc-600"
                                                                                    )} />
                                                                                </div>
                                                                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                                                                    {value ? 'Incluido' : 'N/A'}
                                                                                </span>
                                                                            </button>
                                                                        ) : f.tipo === 'select' ? (
                                                                            <select
                                                                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 transition-all cursor-pointer"
                                                                                value={value || ''}
                                                                                onChange={e => {
                                                                                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, [f.key]: e.target.value } : i))
                                                                                }}
                                                                            >
                                                                                <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Seleccionar...</option>
                                                                                {f.options?.map(opt => (
                                                                                    <option key={opt} value={opt} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{opt}</option>
                                                                                ))}
                                                                            </select>
                                                                        ) : (
                                                                            <Input
                                                                                type={f.tipo}
                                                                                value={value || ''}
                                                                                onChange={e => {
                                                                                    const val = f.tipo === 'number' ? Number(e.target.value) : e.target.value
                                                                                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, [f.key]: val } : i))
                                                                                }}
                                                                                className="h-11 rounded-xl bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 dark:bg-zinc-950/50 transition-all font-bold"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50">
                                                <div className="flex items-center justify-between mb-5 px-1 text-sm">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Progreso de fabricación</label>
                                                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{Math.round((item.quantityProduced / item.cantidad) * 100)}%</p>
                                                    </div>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={item.quantityProduced}
                                                            onChange={(e) => handleUpdateProduced(item.id, parseInt(e.target.value) || 0)}
                                                            className="h-12 w-24 text-center font-black text-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm"
                                                        />
                                                        <span className="absolute -top-2.5 -right-2 bg-zinc-900 text-white text-[8px] font-black px-2 py-0.5 rounded-full dark:bg-white dark:text-zinc-900 uppercase tracking-widest">Cant</span>
                                                    </div>
                                                </div>
                                                <div className="h-3 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800/50 overflow-hidden shadow-inner p-0.5">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-700 ease-out relative rounded-full shadow-lg",
                                                            item.quantityProduced >= item.cantidad ? "bg-emerald-500" : "bg-zinc-900 dark:bg-white"
                                                        )}
                                                        style={{ width: `${Math.min(100, (item.quantityProduced / item.cantidad) * 100)}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* FLUJO DE TRABAJO (Workflow) */}
                    {(effectiveRubro === 'METALURGICA' || effectiveRubro === 'CARPINTERIA') && (
                        <Card className="shadow-sm overflow-hidden border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] mt-8">
                            <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black tracking-tight">Flujo de Trabajo</CardTitle>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Trazabilidad por etapas</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9"
                                            disabled={isAddingWorkflow}
                                            onClick={async () => {
                                                setIsAddingWorkflow(true);
                                                try {
                                                    const stages = effectiveConfig.productionStages
                                                        .filter(s => s.key !== 'DONE' && s.key !== 'PENDING')
                                                        .map(s => s.label);

                                                    // Evitar duplicados si ya existen etapas con el mismo nombre
                                                    const existingTitles = new Set(order?.jobs?.map(j => j.title) || []);
                                                    const uniqueStages = stages.filter(s => !existingTitles.has(s));

                                                    if (uniqueStages.length === 0) {
                                                        toast.error('El flujo ya está cargado o no hay etapas sugeridas.');
                                                        return;
                                                    }

                                                    await Promise.all(uniqueStages.map(s => handleAddStage(s)));
                                                    await refresh();
                                                    toast.success('Workflow sugerido cargado correctamente.');
                                                } finally {
                                                    setIsAddingWorkflow(false);
                                                }
                                            }}
                                        >
                                            {isAddingWorkflow ? 'Cargando...' : 'Cargar Workflow Sugerido'}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    {order.jobs && order.jobs.length > 0 ? (
                                        <div className="grid gap-4">
                                            {order.jobs.sort((a, b) => (a.sortRank || 0) - (b.sortRank || 0)).map((job, jIdx) => (
                                                <div key={job.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 hover:border-primary/20 transition-all">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-sm">
                                                        {jIdx + 1}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <h4 className="font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight text-sm">{job.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5 text-zinc-400">
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Responsable:</span>
                                                                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                                                    {job.responsable ? `${job.responsable.firstName}` : (order.responsableGeneral ? `${order.responsableGeneral.firstName} (Gral)` : 'Sin asignar')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <select
                                                            className="flex h-10 w-32 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest focus:outline-none dark:border-zinc-800 transition-all"
                                                            value={job.status}
                                                            onChange={(e) => handleUpdateJobStatus(job.id, e.target.value)}
                                                            disabled={isUpdatingJob}
                                                        >
                                                            <option value="QUEUED" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">PENDIENTE</option>
                                                            <option value="PRINTING" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">EN PROCESO</option>
                                                            <option value="PAUSED" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">PAUSADO</option>
                                                            <option value="DONE" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">TERMINADO</option>
                                                            <option value="CANCELLED" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">CANCELADO</option>
                                                        </select>

                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-300 hover:text-zinc-900 dark:hover:text-white">
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center space-y-4 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/20">
                                            <p className="text-zinc-400 text-sm font-medium italic">No hay etapas definidas para este proyecto.</p>
                                            <Button
                                                variant="outline"
                                                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6"
                                                onClick={() => handleAddStage('Nueva Etapa')}
                                            >
                                                Crear Primera Etapa
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6 order-1 lg:order-2">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <Card className="shadow-sm border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden mb-6">
                            <CardHeader className="pb-3 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Responsable General</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 pb-5">
                                <div className="space-y-4">
                                    <div
                                        className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 flex items-center justify-between cursor-pointer hover:bg-zinc-100 transition-all dark:border-zinc-800 dark:bg-zinc-950/50"
                                        onClick={handleStatusUpdateClick}
                                    >
                                        <span className="text-xs font-bold text-zinc-600">
                                            {order.responsableGeneral ? `${order.responsableGeneral.firstName} ${order.responsableGeneral.lastName}` : 'Sin asignar'}
                                        </span>
                                        <Save className="h-3 w-3 text-zinc-400" />
                                    </div>
                                    {order.responsableGeneral && (
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                                                {order.responsableGeneral.firstName[0]}
                                                {order.responsableGeneral.lastName ? order.responsableGeneral.lastName[0] : ''}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-50">
                                                    {order.responsableGeneral.firstName} {order.responsableGeneral.lastName}
                                                </span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Responsable Asignado</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="pb-3 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estado General</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-5">
                                <div className="flex justify-between items-center text-sm py-1">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Estado</span>
                                    <Badge
                                        className={cn("font-black uppercase text-[10px] px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:opacity-80 transition-opacity", getStatusStyles(order.estado))}
                                        onClick={handleStatusUpdateClick}
                                    >
                                        {getStatusLabel(order.estado)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Prioridad</span>
                                    <BadgeUrgencia urgencia={order.urgencia} />
                                </div>
                                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-900 flex justify-between items-center">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Rubro</span>
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest">
                                        {negocioActivo?.rubro}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-none shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-black/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                            <CardHeader className="pb-2 relative z-10"><CardTitle className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">Resumen de Cobro</CardTitle></CardHeader>
                            <CardContent className="space-y-6 relative z-10 pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">PRECIO FINAL</span>
                                    <Money amount={order.totalPrice} className="text-2xl font-black tracking-tight" />
                                </div>
                                <div className="h-px bg-white/10 dark:bg-black/10 mx-1" />
                                <div className="flex justify-between items-end">
                                    <span className="text-emerald-400 dark:text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">Utilidad</span>
                                    <Money amount={order.profit} className="font-black text-xl text-emerald-400 dark:text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Button variant="ghost" className="w-full gap-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] group">
                            <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="text-xs font-black uppercase tracking-[0.15em]">Anular Pedido</span>
                        </Button>
                    </div>
                </div>
            </div>
            <OrderStatusModal
                order={order}
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                employees={employees}
            />
        </div>
    )
}
