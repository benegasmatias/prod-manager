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

export default function NuevoPedidoPage() {
    const router = useRouter()
    const { negocioActivoId, config, user: profile } = useNegocio()
    const { addPedido, pedidos } = usePedidos()
    const { clientes, refresh: refreshClientes, loading: loadingClientes } = useClientes()

    const misClientes = clientes[negocioActivoId] || []
    const misPedidos = pedidos[negocioActivoId] || []

    const [clienteId, setClienteId] = useState('')
    const [fechaEntrega, setFechaEntrega] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [responsableGeneralId, setResponsableGeneralId] = useState('')
    const [items, setItems] = useState<Partial<ItemPedido>[]>([{ cantidad: 1, precioUnitario: 0, senia: 0, nombreProducto: '' }])

    const [employees, setEmployees] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (negocioActivoId) {
            import('@/src/lib/api').then(({ api }) => {
                api.employees.getAll(negocioActivoId, true).then(data => {
                    const emps = data as any[]
                    setEmployees(emps)

                    // Auto-seleccionar al propio usuario si está en la lista de personal y no hay uno ya seleccionado
                    if (profile && !responsableGeneralId && emps.length > 0) {
                        const me = emps.find(e => e.email === profile.email)
                        if (me) setResponsableGeneralId(me.id)
                    }
                }).catch(console.error)
            })
        }
    }, [negocioActivoId, profile])

    const generarNumeroPedido = () => {
        const prefix = config.labels.produccion.includes('3D') ? '3D' : (config.labels.produccion.includes('Seguimiento') ? 'MET' : 'PED')
        const num = misPedidos.length + 1
        return `${prefix}-${num.toString().padStart(3, '0')}`
    }

    const addItem = () => {
        setItems([...items, { cantidad: 1, precioUnitario: 0, senia: 0, nombreProducto: '' }])
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
        const tItem = (item.cantidad || 0) * (item.precioUnitario || 0)
        return {
            total: acc.total + tItem,
            senias: acc.senias + (item.senia || 0)
        }
    }, { total: 0, senias: 0 })

    const saldo = totales.total - totales.senias

    const validate = () => {
        if (!clienteId) return 'Debe seleccionar un cliente'
        if (!fechaEntrega) return 'Debe seleccionar una fecha de entrega'
        if (items.length === 0) return 'Debe agregar al menos un ítem'

        for (let i = 0; i < items.length; i++) {
            const el = items[i]
            if (!el.nombreProducto) return `El ítem ${i + 1} debe tener nombre`
            if ((el.cantidad || 0) < 1) return `La cantidad del ítem ${i + 1} debe ser mayor a 0`
            if ((el.precioUnitario || 0) < 0) return `El precio del ítem ${i + 1} no puede ser negativo`

            const itemTotal = (el.cantidad || 0) * (el.precioUnitario || 0)
            if ((el.senia || 0) < 0 || (el.senia || 0) > itemTotal) {
                return `La seña del ítem ${i + 1} debe estar entre 0 y el total del ítem (${itemTotal})`
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
            const fechaE = new Date(fechaEntrega)

            // calculo simple urgencia
            const pDate = new Date(hoy)
            pDate.setDate(pDate.getDate() + 2) // si faltan menos de 2 dias es PROXIMO
            let urgencia: 'VENCIDO' | 'PRÓXIMO' | 'EN TIEMPO' = 'EN TIEMPO'

            if (fechaE < hoy) urgencia = 'VENCIDO'
            else if (fechaE <= pDate) urgencia = 'PRÓXIMO'

            const nPedidoParams = {
                clienteId: clienteId,
                clientName: misClientes.find(c => c.id === clienteId)?.nombre || '',
                fechaEntrega: new Date(fechaEntrega).toISOString(),
                urgencia: urgencia,
                observaciones,
                responsableGeneralId,
                items: items as any
            }

            await addPedido(negocioActivoId, nPedidoParams)
            router.push('/pedidos')
        } catch (err) {
            console.error('Error saving order:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6 pb-24 lg:pb-6 relative max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nuevo Pedido</h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Generá una nueva orden de {config.labels.produccion.toLowerCase()}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* INFO PEDIDO */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                        <h2 className="text-base font-semibold mb-4 border-b pb-2">Datos del Pedido</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cliente">Cliente <span className="text-red-500">*</span></Label>
                                <select
                                    id="cliente"
                                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white dark:bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 transition-all"
                                    value={clienteId}
                                    onChange={e => setClienteId(e.target.value)}
                                    disabled={loadingClientes || isLoading}
                                >
                                    <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{loadingClientes ? 'Cargando clientes...' : 'Seleccione un cliente...'}</option>
                                    {misClientes.map(c => (
                                        <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="fecha">Fecha de Entrega <span className="text-red-500">*</span></Label>
                                <Input id="fecha" type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} disabled={isLoading} />
                            </div>
                            <div>
                                <Label htmlFor="responsable">Responsable General</Label>
                                <select
                                    id="responsable"
                                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white dark:bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 transition-all"
                                    value={responsableGeneralId}
                                    onChange={e => setResponsableGeneralId(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Seleccione responsable...</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{e.firstName} {e.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <Label htmlFor="obs">Observaciones Generales</Label>
                                <Input id="obs" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Acuerdos, prioridad, etc." disabled={isLoading} />
                            </div>
                        </div>
                    </div>

                    {/* ITEMS */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-base font-semibold">Ítems ({config.labels.items})</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 gap-2">
                                <Plus className="h-4 w-4" /> Agregar Ítem
                            </Button>
                        </div>

                        {items.map((item, idx) => {
                            // Agrupamos campos por sección
                            const fieldsBySection: Record<string, typeof config.itemFields> = {}
                            config.itemFields.forEach(f => {
                                const section = f.section || 'General'
                                if (!fieldsBySection[section]) fieldsBySection[section] = []
                                fieldsBySection[section].push(f)
                            })

                            return (
                                <div key={idx} className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900 dark:bg-zinc-100 opacity-20 group-hover:opacity-100 transition-opacity" />

                                    <div className="p-8 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black">
                                                    {idx + 1}
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Detalle del Ítem</h3>
                                            </div>
                                            {items.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" onClick={() => removeItem(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                            {/* Renderizado por secciones */}
                                            {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                                                <div key={sectionName} className={cn(
                                                    "space-y-6",
                                                    sectionName === 'OPCIONALES' ? "md:col-span-1" : "md:col-span-2"
                                                )}>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                                                        {sectionName}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        {sectionFields.map(f => (
                                                            <div key={f.key} className={cn(
                                                                "space-y-2",
                                                                f.key === 'nombreProducto' || f.tipo === 'textarea' ? "sm:col-span-2" : ""
                                                            )}>
                                                                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">{f.label} {f.required && <span className="text-rose-500">*</span>}</Label>

                                                                {f.tipo === 'select' ? (
                                                                    <select
                                                                        className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 transition-all cursor-pointer"
                                                                        value={(item as any)[f.key] || ''}
                                                                        onChange={e => updateItem(idx, { [f.key]: e.target.value })}
                                                                    >
                                                                        <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Seleccionar...</option>
                                                                        {f.options?.map(opt => (
                                                                            <option key={opt} value={opt} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : f.tipo === 'boolean' ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateItem(idx, { [f.key]: !(item as any)[f.key] })}
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
                                                                            {(item as any)[f.key] ? 'Incluido' : 'N/A'}
                                                                        </span>
                                                                    </button>
                                                                ) : f.tipo === 'textarea' ? (
                                                                    <textarea
                                                                        className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                                                        value={(item as any)[f.key] || ''}
                                                                        onChange={e => updateItem(idx, { [f.key]: e.target.value })}
                                                                        placeholder={f.placeholder}
                                                                    />
                                                                ) : (
                                                                    <Input
                                                                        type={f.tipo === 'number' ? 'number' : 'text'}
                                                                        value={(item as any)[f.key] || ''}
                                                                        onChange={e => updateItem(idx, { [f.key]: f.tipo === 'number' ? Number(e.target.value) : e.target.value })}
                                                                        placeholder={f.placeholder}
                                                                        className="h-11 rounded-xl bg-zinc-50/50 focus:bg-white dark:focus:bg-zinc-900 dark:bg-zinc-950/50 transition-all font-bold"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}

                                                        {/* Caso especial: Cantidad siempre va en la primera sección */}
                                                        {sectionName === 'INFORMACIÓN DEL TRABAJO' && (
                                                            <div className="space-y-2">
                                                                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Cantidad <span className="text-rose-500">*</span></Label>
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

                                        {/* Bloque de COSTOS - Siempre al final como sección premium */}
                                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <div className="bg-zinc-50 dark:bg-zinc-950/30 rounded-[1.5rem] p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Precio Unitario ($)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.precioUnitario || ''}
                                                            onChange={e => updateItem(idx, { precioUnitario: parseFloat(e.target.value) || 0 })}
                                                            className="h-12 pl-8 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-black text-lg"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Seña / Adelanto ($)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.senia || ''}
                                                            onChange={e => updateItem(idx, { senia: parseFloat(e.target.value) || 0 })}
                                                            className="h-12 pl-8 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-black text-lg text-emerald-600 dark:text-emerald-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Neto del Ítem</Label>
                                                    <div className="h-12 w-full rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-black text-xl shadow-lg shadow-zinc-900/10 transition-all group-hover:scale-[1.02]">
                                                        {formatARS((item.cantidad || 0) * (item.precioUnitario || 0))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* STICKY SUMMARY PORTRAIT DESKTOP / FIXED BOTTOM MOBILE */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sticky top-6 shadow-sm z-10 
                                    fixed lg:static bottom-0 left-0 right-0 lg:rounded-xl lg:border lg:bg-white lg:dark:bg-zinc-950 
                                    border-t lg:border-t-zinc-200 lg:p-5 p-4 lg:shadow-sm shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                        <h2 className="text-base font-semibold mb-4 border-b pb-2 hidden lg:block">Resumen</h2>

                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between text-zinc-500">
                                <span>Total Ítems:</span>
                                <span>{items.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Subtotal Pedido:</span>
                                <span className="font-semibold">{formatARS(totales.total)}</span>
                            </div>
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>Total Señas:</span>
                                <span>- {formatARS(totales.senias)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                <span>Saldo a Pagar:</span>
                                <span>{formatARS(saldo)}</span>
                            </div>
                        </div>

                        <Button type="submit" className="w-full gap-2 mt-2 h-11 text-md font-semibold" disabled={isLoading}>
                            {isLoading ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Guardar Pedido
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
