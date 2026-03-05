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

const Label = ({ children, htmlFor, className = "" }: any) => <label htmlFor={htmlFor} className={"text-sm font-medium leading-none mb-2 block text-zinc-700 dark:text-zinc-300 " + className}>{children}</label>

export default function NuevoPedidoPage() {
    const router = useRouter()
    const { negocioActivoId, config } = useNegocio()
    const { addPedido, pedidos } = usePedidos()
    const { clientes, refresh: refreshClientes, loading: loadingClientes } = useClientes()

    const misClientes = clientes[negocioActivoId] || []
    const misPedidos = pedidos[negocioActivoId] || []

    const [clienteId, setClienteId] = useState('')
    const [fechaEntrega, setFechaEntrega] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [items, setItems] = useState<Partial<ItemPedido>[]>([{ cantidad: 1, precioUnitario: 0, senia: 0, nombreProducto: '' }])

    const [isLoading, setIsLoading] = useState(false)

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
                clienteId,
                numero: generarNumeroPedido(),
                fechaCreacion: new Date().toISOString(),
                fechaEntrega: new Date(fechaEntrega).toISOString(),
                estado: 'Pendiente' as const,
                observaciones,
                items: items as ItemPedido[],
                total: totales.total,
                totalSenias: totales.senias,
                saldo,
                urgencia
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
                                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
                                    value={clienteId}
                                    onChange={e => setClienteId(e.target.value)}
                                    disabled={loadingClientes || isLoading}
                                >
                                    <option value="">{loadingClientes ? 'Cargando clientes...' : 'Seleccione un cliente...'}</option>
                                    {misClientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="fecha">Fecha de Entrega <span className="text-red-500">*</span></Label>
                                <Input id="fecha" type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} disabled={isLoading} />
                            </div>
                            <div className="sm:col-span-2">
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

                        {items.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative">
                                {items.length > 1 && (
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem(idx)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <h3 className="text-sm font-semibold mb-3 text-zinc-500">Ítem {idx + 1}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <Label>Nombre del Producto <span className="text-red-500">*</span></Label>
                                        <Input value={item.nombreProducto} onChange={e => updateItem(idx, { nombreProducto: e.target.value })} placeholder="Ej. Llavero personalizado" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <Label>Cantidad <span className="text-red-500">*</span></Label>
                                        <Input type="number" min="1" value={item.cantidad || ''} onChange={e => updateItem(idx, { cantidad: parseInt(e.target.value) || 0 })} />
                                    </div>

                                    {/* CAMPOS CONDICIONALES POR RUBRO */}
                                    {config.itemFields.filter(f => !['nombre', 'cantidad'].includes(f.key)).map(f => (
                                        <div key={f.key}>
                                            <Label>{f.label}</Label>
                                            <Input
                                                type={f.tipo === 'number' ? 'number' : 'text'}
                                                value={(item as any)[f.key] || ''}
                                                onChange={e => updateItem(idx, { [f.key]: f.tipo === 'number' ? Number(e.target.value) : e.target.value })}
                                                placeholder={`Ej. ${f.label.toLowerCase()}`}
                                            />
                                        </div>
                                    ))}

                                    <div className="sm:col-span-2 lg:col-span-3 h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>

                                    <div>
                                        <Label>Precio Unitario ($) <span className="text-red-500">*</span></Label>
                                        <Input type="number" min="0" step="0.01" value={item.precioUnitario || ''} onChange={e => updateItem(idx, { precioUnitario: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <Label>Seña para este ítem ($)</Label>
                                        <Input type="number" min="0" step="0.01" value={item.senia || ''} onChange={e => updateItem(idx, { senia: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <Label>Total del ítem</Label>
                                        <div className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-800 items-center font-bold text-zinc-500">
                                            {formatARS((item.cantidad || 0) * (item.precioUnitario || 0))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
