'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { useClientes } from '@/src/context/ClientesContext'
import { ItemPedido } from '@/src/types'
import { toast } from 'react-hot-toast'
import { formatARS } from '@/src/lib/money'
import { cn } from '@/src/lib/utils'
import { Label } from '@/src/components/ui/label'

interface OrderFormProps {
    forcedType?: 'CUSTOMER' | 'STOCK'
    cloneId?: string | null
}

export function OrderForm({ forcedType, cloneId }: OrderFormProps) {
    const router = useRouter()
    const { negocioActivoId, config, user: profile } = useNegocio()
    const { addPedido, pedidos } = usePedidos()
    const { clientes, loading: loadingClientes } = useClientes()

    const misClientes = clientes[negocioActivoId] || []
    const misPedidos = pedidos[negocioActivoId] || []

    const [orderType, setOrderType] = useState<'CUSTOMER' | 'STOCK'>(forcedType || 'CUSTOMER')
    const [clienteId, setClienteId] = useState('')
    const [fechaEntrega, setFechaEntrega] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [responsableGeneralId, setResponsableGeneralId] = useState('')
    const [items, setItems] = useState<Partial<ItemPedido>[]>([{ cantidad: 1, precioUnitario: 0, senia: 0, nombreProducto: '', seDiseñaSTL: false } as any])

    const [employees, setEmployees] = useState<any[]>([])
    const [materials, setMaterials] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (negocioActivoId) {
            import('@/src/lib/api').then(({ api }) => {
                api.employees.getAll(negocioActivoId, true).then(data => {
                    const emps = data as any[]
                    setEmployees(emps)

                    if (profile && !responsableGeneralId && emps.length > 0) {
                        const me = emps.find(e => e.email === profile.email)
                        if (me) setResponsableGeneralId(me.id)
                    }
                }).catch(console.error)
                api.materials.getAll(negocioActivoId).then(data => {
                    setMaterials(data as any[])
                }).catch(console.error)

                if (cloneId) {
                    setIsLoading(true)
                    api.orders.getOne(cloneId).then((order: any) => {
                        if (!forcedType) setOrderType(order.type || 'CUSTOMER')
                        setClienteId(order.customerId || order.customer?.id || '')
                        setObservaciones(order.notes || '')

                        const clonedItems = order.items?.map((item: any) => ({
                            id: undefined,
                            cantidad: item.qty || 1,
                            nombreProducto: item.name,
                            precioUnitario: Number(item.price) || 0,
                            senia: 0,
                            estimatedUnitCost: item.estimatedUnitCost,
                            estimatedSaleUnitPrice: item.estimatedSaleUnitPrice,
                            ...item.metadata
                        })) || []

                        if (clonedItems.length > 0) setItems(clonedItems)
                        toast.success('Datos del pedido original cargados para clonar')
                    }).catch(err => {
                        console.error('Error fetching order for clone:', err)
                        toast.error('No se pudo cargar el pedido original para clonar')
                    }).finally(() => {
                        setIsLoading(false)
                    })
                }
            })
        }
    }, [negocioActivoId, profile, cloneId, forcedType])

    const addItem = () => {
        setItems([...items, { cantidad: 1, precioUnitario: 0, senia: 0, nombreProducto: '', seDiseñaSTL: false } as any])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index: number, changes: Partial<ItemPedido>) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], ...changes }
        setItems(newItems)
    }

    const totales = items.reduce((acc, item) => {
        const qty = item.cantidad || 0
        const itemTotal = qty * (item.precioUnitario || 0)
        const itemDiseno = (item as any).seDiseñaSTL ? (Number((item as any).precioDiseno) || 0) * (item.cantidad || 1) : 0
        const tItem = itemTotal + itemDiseno

        const costUnit = (item as any).estimatedUnitCost || 0;
        const saleUnit = (item as any).estimatedSaleUnitPrice || 0;

        return {
            total: acc.total + tItem,
            senias: acc.senias + (item.senia || 0),
            subtotalImpresion: acc.subtotalImpresion + itemTotal,
            totalDiseno: acc.totalDiseno + itemDiseno,
            totalCostoEstimado: acc.totalCostoEstimado + (costUnit * qty),
            totalVentaEstimada: acc.totalVentaEstimada + (saleUnit * qty),
        }
    }, { total: 0, senias: 0, subtotalImpresion: 0, totalDiseno: 0, totalCostoEstimado: 0, totalVentaEstimada: 0 })

    const totalProfit = totales.totalVentaEstimada - totales.totalCostoEstimado
    const saldo = totales.total - totales.senias

    const validate = () => {
        if (orderType === 'CUSTOMER' && !clienteId) return 'Debe seleccionar un cliente'
        if (orderType === 'CUSTOMER' && !fechaEntrega) return 'Debe seleccionar una fecha de entrega'
        if (items.length === 0) return 'Debe agregar al menos un ítem'

        for (let i = 0; i < items.length; i++) {
            const el = items[i]
            if (!el.nombreProducto) return `El ítem ${i + 1} debe tener nombre`
            if (config.labels.produccion.includes('Impresión') && !(el as any).material_id) return `El ítem ${i + 1} debe tener un material asignado`
            if ((el.cantidad || 0) < 1) return `La cantidad del ítem ${i + 1} debe ser mayor a 0`
            if (orderType === 'CUSTOMER' && (el.precioUnitario || 0) < 0) return `El precio del ítem ${i + 1} no puede ser negativo`

            const itemDiseno = (el as any).seDiseñaSTL ? (Number((el as any).precioDiseno) || 0) * (el.cantidad || 1) : 0
            const itemTotal = ((el.cantidad || 0) * (el.precioUnitario || 0)) + itemDiseno

            if (orderType === 'CUSTOMER' && ((el.senia || 0) < 0 || (el.senia || 0) > itemTotal)) {
                return `La seña del ítem ${i + 1} debe estar entre 0 y el total del ítem (${formatARS(itemTotal)})`
            }
        }
        return null
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const error = validate()
        if (error) {
            toast.error(error)
            return
        }

        setIsLoading(true)
        try {
            const hoy = new Date()
            let urgencia: any = 'EN TIEMPO'

            if (fechaEntrega) {
                const fechaE = new Date(fechaEntrega)
                const pDate = new Date(hoy)
                pDate.setDate(pDate.getDate() + 2)
                if (fechaE < hoy) urgencia = 'VENCIDO'
                else if (fechaE <= pDate) urgencia = 'PRÓXIMO'
            }

            const nPedidoParams = {
                type: orderType,
                clienteId: orderType === 'CUSTOMER' ? clienteId : undefined,
                clientName: orderType === 'CUSTOMER' ? (misClientes.find(c => c.id === clienteId)?.nombre || '') : 'STOCK',
                fechaEntrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : undefined,
                urgencia: urgencia,
                observaciones,
                responsableGeneralId,
                items: items as any
            }

            await addPedido(negocioActivoId, nPedidoParams)
            router.push(orderType === 'CUSTOMER' ? '/pedidos' : '/stock')
        } catch (err) {
            console.error('Error saving order:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6 pb-24 lg:pb-6 relative max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                            {orderType === 'CUSTOMER' ? 'Nuevo Pedido' : 'Producción de Stock'}
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 font-medium italic">
                            {orderType === 'CUSTOMER'
                                ? 'Carga un nuevo pedido por encargo para un cliente.'
                                : 'Generá una orden de fabricación interna para inventario.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* INFO PEDIDO */}
                    <div className="rounded-[2.5rem] border border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Encabezamiento de la Orden
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {!forcedType && (
                                <div className="sm:col-span-2 space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Tipo de Operación</Label>
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                        value={orderType}
                                        onChange={e => {
                                            const val = e.target.value as 'CUSTOMER' | 'STOCK'
                                            setOrderType(val)
                                            if (val === 'STOCK') setClienteId('')
                                        }}
                                        disabled={isLoading}
                                    >
                                        <option value="CUSTOMER">Por encargo (Cliente)</option>
                                        <option value="STOCK">Para stock (Venta futura)</option>
                                    </select>
                                </div>
                            )}

                            {orderType === 'CUSTOMER' && (
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Cliente <span className="text-rose-500">*</span></Label>
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                        value={clienteId}
                                        onChange={e => setClienteId(e.target.value)}
                                        disabled={loadingClientes || isLoading}
                                    >
                                        <option value="">{loadingClientes ? 'Cargando...' : 'Seleccionar cliente...'}</option>
                                        {misClientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {orderType === 'CUSTOMER' && (
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Fecha de Entrega <span className="text-rose-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={fechaEntrega}
                                        onChange={e => setFechaEntrega(e.target.value)}
                                        disabled={isLoading}
                                        className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 font-bold"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Responsable General</Label>
                                <select
                                    className="flex h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    value={responsableGeneralId}
                                    onChange={e => setResponsableGeneralId(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="">Sin asignar...</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-1 space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Observaciones</Label>
                                <Input
                                    value={observaciones}
                                    onChange={e => setObservaciones(e.target.value)}
                                    placeholder="Notas internas..."
                                    disabled={isLoading}
                                    className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Detalle de Producción ({items.length})</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-white dark:bg-zinc-950">
                                <Plus className="h-3.5 w-3.5" /> Agregar Ítem
                            </Button>
                        </div>

                        {items.map((item, idx) => {
                            const fieldsBySection: Record<string, typeof config.itemFields> = {}
                            config.itemFields.forEach(f => {
                                const section = f.section || 'General'
                                if (!fieldsBySection[section]) fieldsBySection[section] = []
                                fieldsBySection[section].push(f)
                            })

                            return (
                                <div key={idx} className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900 dark:bg-zinc-100 opacity-20 group-hover:opacity-100 transition-opacity" />

                                    <div className="p-8 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black">
                                                    {idx + 1}
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Parámetros del Ítem</h3>
                                            </div>
                                            {items.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" onClick={() => removeItem(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                            {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                                                <div key={sectionName} className={cn(
                                                    "space-y-6",
                                                    sectionName === 'OPCIONALES' ? "md:col-span-1" : "md:col-span-2"
                                                )}>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                                                        {sectionName}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        {sectionFields.map(f => {
                                                            const is3D = config.labels.produccion.includes('Impresión');
                                                            if (is3D) {
                                                                if (f.key === 'url_stl' && (item as any).seDiseñaSTL) return null;
                                                                if (f.key === 'precioDiseno' && !(item as any).seDiseñaSTL) return null;
                                                            }

                                                            return (
                                                                <div key={f.key} className={cn(
                                                                    "space-y-2",
                                                                    f.key === 'nombreProducto' || f.tipo === 'textarea' ? "sm:col-span-2" : ""
                                                                )}>
                                                                    <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">{f.label} {f.required && <span className="text-rose-500">*</span>}</Label>

                                                                    {f.tipo === 'select' ? (
                                                                        <select
                                                                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 transition-all cursor-pointer"
                                                                            value={(item as any)[f.key] ?? ''}
                                                                            onChange={e => updateItem(idx, { [f.key]: e.target.value })}
                                                                        >
                                                                            <option value="">Seleccionar...</option>
                                                                            {f.options?.map(opt => (
                                                                                <option key={opt} value={opt}>{opt}</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : f.tipo === 'boolean' ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newValue = !(item as any)[f.key];
                                                                                const changes: any = { [f.key]: newValue };
                                                                                if (is3D && f.key === 'seDiseñaSTL') {
                                                                                    if (newValue) changes.url_stl = '';
                                                                                    else changes.precioDiseno = undefined;
                                                                                }
                                                                                updateItem(idx, changes);
                                                                            }}
                                                                            className={cn(
                                                                                "flex items-center gap-3 h-11 w-full rounded-xl border px-4 transition-all duration-200",
                                                                                (item as any)[f.key]
                                                                                    ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10"
                                                                                    : "bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950/20 dark:border-zinc-800"
                                                                            )}
                                                                        >
                                                                            <div className={cn(
                                                                                "h-5 w-9 rounded-full p-1 transition-colors flex items-center",
                                                                                (item as any)[f.key] ? "bg-white/20 dark:bg-black/10" : "bg-zinc-100 dark:bg-zinc-800"
                                                                            )}>
                                                                                <div className={cn(
                                                                                    "h-3 w-3 rounded-full transition-transform duration-200",
                                                                                    (item as any)[f.key] ? "translate-x-4 bg-white dark:bg-zinc-900" : "translate-x-0 bg-zinc-300 dark:bg-zinc-600"
                                                                                )} />
                                                                            </div>
                                                                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                                                                {(item as any)[f.key] ? 'SÍ' : 'NO'}
                                                                            </span>
                                                                        </button>
                                                                    ) : f.tipo === 'material-select' ? (
                                                                        <select
                                                                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 transition-all cursor-pointer"
                                                                            value={(item as any)[f.key] ?? ''}
                                                                            onChange={e => updateItem(idx, { [f.key]: e.target.value })}
                                                                        >
                                                                            <option value="">Seleccionar material...</option>
                                                                            {materials.map(m => (
                                                                                <option key={m.id} value={m.id}>{m.name} ({m.type} - {m.color})</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : f.tipo === 'textarea' ? (
                                                                        <textarea
                                                                            className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold"
                                                                            value={(item as any)[f.key] ?? ''}
                                                                            onChange={e => updateItem(idx, { [f.key]: e.target.value })}
                                                                            placeholder={f.placeholder}
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            type={f.tipo === 'number' ? 'number' : (f.tipo === 'url' ? 'url' : 'text')}
                                                                            value={(item as any)[f.key] ?? ''}
                                                                            onChange={e => updateItem(idx, { [f.key]: f.tipo === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value })}
                                                                            placeholder={f.placeholder}
                                                                            className="h-11 rounded-xl bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 dark:bg-zinc-950/50 transition-all font-bold"
                                                                        />
                                                                    )}
                                                                </div>
                                                            )
                                                        })}

                                                        {sectionName === 'INFORMACIÓN DEL TRABAJO' && (
                                                            <div className="space-y-2">
                                                                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Cantidad <span className="text-rose-500">*</span></Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.cantidad || ''}
                                                                    onChange={e => updateItem(idx, { cantidad: parseInt(e.target.value) || 0 })}
                                                                    className="h-11 rounded-xl bg-zinc-50/50 font-bold"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bloque de RENTABILIDAD */}
                                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                                            {orderType === 'CUSTOMER' ? (
                                                <div className="bg-zinc-50 dark:bg-zinc-950/30 rounded-[2rem] p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Precio Unitario ($)</Label>
                                                        <div className="relative group/price">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black">$</span>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.precioUnitario || ''}
                                                                onChange={e => updateItem(idx, { precioUnitario: parseFloat(e.target.value) || 0 })}
                                                                className="h-14 pl-10 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-black text-xl"
                                                            />

                                                            {/* Sugerencia de precio para 3D */}
                                                            {(() => {
                                                                const is3D = config.labels.produccion.includes('Impresión');
                                                                const peso = (item as any).peso_gramos;
                                                                const matId = (item as any).material_id;
                                                                if (is3D && peso && matId) {
                                                                    const mat = materials.find(m => m.id === matId);
                                                                    if (mat && mat.costPerKg > 0) {
                                                                        const suggested = (mat.costPerKg / 1000) * peso * 3;
                                                                        return (
                                                                            <div className="absolute -top-12 left-0 right-0 animate-in fade-in slide-in-from-bottom-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => updateItem(idx, { precioUnitario: Math.round(suggested) })}
                                                                                    className="w-full h-10 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                                                >
                                                                                    Sug. {formatARS(suggested)} (Aplicar)
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    }
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Seña / Adelanto ($)</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">$</span>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.senia || ''}
                                                                onChange={e => updateItem(idx, { senia: parseFloat(e.target.value) || 0 })}
                                                                className="h-14 pl-10 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-black text-xl text-emerald-600 dark:text-emerald-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Carga Final Ítem</Label>
                                                        <div className="h-14 w-full rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-black text-2xl shadow-xl shadow-zinc-900/10">
                                                            {formatARS(((item.cantidad || 0) * (item.precioUnitario || 0)) + ((item as any).seDiseñaSTL ? (Number((item as any).precioDiseno) || 0) * (item.cantidad || 1) : 0))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-purple-50/50 dark:bg-purple-950/10 rounded-[2rem] p-8 space-y-6 border border-purple-100 dark:border-purple-900/20">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-purple-600/70 ml-1">Costo Unitario Prod. ($)</Label>
                                                            <div className="relative group/cost">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-black">$</span>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={(item as any).estimatedUnitCost || ''}
                                                                    onChange={e => updateItem(idx, { estimatedUnitCost: parseFloat(e.target.value) || 0 } as any)}
                                                                    className="h-14 pl-10 rounded-2xl bg-white dark:bg-zinc-900 border-purple-100 dark:border-purple-900/30 font-black text-xl text-purple-700 dark:text-purple-400"
                                                                />
                                                                {(() => {
                                                                    const is3D = config.labels.produccion.includes('Impresión');
                                                                    const peso = (item as any).peso_gramos;
                                                                    const matId = (item as any).material_id;
                                                                    if (is3D && peso && matId) {
                                                                        const mat = materials.find(m => m.id === matId);
                                                                        if (mat && mat.costPerKg > 0) {
                                                                            const suggested = (mat.costPerKg / 1000) * peso;
                                                                            return (
                                                                                <div className="absolute -top-12 left-0 right-0 animate-in fade-in slide-in-from-bottom-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => updateItem(idx, { estimatedUnitCost: suggested, estimatedSaleUnitPrice: Math.round(suggested * 3) } as any)}
                                                                                        className="w-full h-10 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                                                    >
                                                                                        Sug. {formatARS(suggested)} (Costo)
                                                                                    </button>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 ml-1">Precio Venta Sugerido ($)</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black">$</span>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={(item as any).estimatedSaleUnitPrice || ''}
                                                                    onChange={e => updateItem(idx, { estimatedSaleUnitPrice: parseFloat(e.target.value) || 0 } as any)}
                                                                    className="h-14 pl-10 rounded-2xl bg-white dark:bg-zinc-900 border-emerald-100 dark:border-emerald-900/30 font-black text-xl text-emerald-700 dark:text-emerald-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div className="p-4 rounded-2xl bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/30">
                                                            <span className="block text-[9px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Costo Total</span>
                                                            <span className="text-lg font-black text-purple-700 dark:text-purple-300">
                                                                {formatARS(((item as any).estimatedUnitCost || 0) * (item.cantidad || 0))}
                                                            </span>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                                            <span className="block text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Venta Total</span>
                                                            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                                                                {formatARS(((item as any).estimatedSaleUnitPrice || 0) * (item.cantidad || 0))}
                                                            </span>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-white border border-transparent shadow-lg shadow-zinc-900/10">
                                                            <span className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">Ganancia Est.</span>
                                                            <span className="text-lg font-black text-white dark:text-zinc-900">
                                                                {formatARS((((item as any).estimatedSaleUnitPrice || 0) - ((item as any).estimatedUnitCost || 0)) * (item.cantidad || 0))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        <div className="rounded-[2.5rem] border border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-xl shadow-zinc-200/50">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 border-b border-zinc-50 dark:border-zinc-900 pb-4">Cierre de Orden</h2>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-zinc-500">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Unidades</span>
                                    <span className="text-lg font-black tabular-nums">{items.reduce((acc, el) => acc + (Number(el.cantidad) || 0), 0)}</span>
                                </div>

                                {orderType === 'CUSTOMER' ? (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-zinc-500">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal Producción</span>
                                                <span className="font-bold tabular-nums">{formatARS(totales.subtotalImpresion)}</span>
                                            </div>
                                            {totales.totalDiseno > 0 && (
                                                <div className="flex justify-between text-indigo-500 font-medium italic">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Costo de Diseños</span>
                                                    <span className="tabular-nums">+ {formatARS(totales.totalDiseno)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-black pt-4 border-t border-zinc-50 dark:border-zinc-900">
                                                <span className="text-[10px] uppercase tracking-widest">Total Pedido</span>
                                                <span className="text-xl tabular-nums">{formatARS(totales.total)}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-500 font-bold">
                                                <span className="text-[10px] uppercase tracking-widest">T. Adelantos</span>
                                                <span className="tabular-nums">- {formatARS(totales.senias)}</span>
                                            </div>
                                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />
                                            <div className="flex justify-between items-end pt-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pb-1">Saldo Pendiente</span>
                                                <span className="text-3xl font-black tabular-nums tracking-tighter">{formatARS(saldo)}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between text-purple-600/80 font-bold items-center pt-2 border-t border-zinc-50 dark:border-zinc-900 mt-2">
                                            <span className="text-[10px] uppercase tracking-widest">Inversión Estimada</span>
                                            <span className="text-lg tabular-nums">{formatARS(totales.totalCostoEstimado)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600/80 font-bold items-center">
                                            <span className="text-[10px] uppercase tracking-widest">Venta Proyectada</span>
                                            <span className="text-lg tabular-nums">{formatARS(totales.totalVentaEstimada)}</span>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mt-4 shadow-xl shadow-zinc-200 dark:shadow-none">
                                            <span className="block text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Margen Neto Estimado</span>
                                            <span className={cn("text-3xl font-black tabular-nums tracking-tighter", totalProfit >= 0 ? "text-emerald-400 dark:text-emerald-600" : "text-rose-400 dark:text-rose-600")}>
                                                {formatARS(totalProfit)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-14 rounded-2xl text-md font-black uppercase tracking-widest mt-8 shadow-2xl shadow-primary/20 gap-3" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="animate-spin text-xl text-white">⏳</span>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            {orderType === 'CUSTOMER' ? 'Guardar Pedido' : 'Iniciar Producción'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
