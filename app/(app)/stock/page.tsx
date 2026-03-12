'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, ChevronDown, Package2, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import Link from 'next/link'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { api } from '@/src/lib/api'
import { Employee } from '@/src/types'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { OrdersTable } from '@/src/components/OrdersTable'
import { formatARS } from '@/src/lib/money'
import { SellStockModal } from '@/src/components/SellStockModal'
import { toast } from 'react-hot-toast'

export default function StockOrdersPage() {
    const { negocioActivoId, config } = useNegocio()
    const { pedidos } = usePedidos()

    const [estadoFilter, setEstadoFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortKey, setSortKey] = useState<string>('fechaActualizacion')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isSellModalOpen, setIsSellModalOpen] = useState(false)
    const { refresh } = usePedidos()

    useEffect(() => {
        if (negocioActivoId) {
            api.employees.getAll(negocioActivoId, true)
                .then(data => setEmployees(data as Employee[]))
                .catch(console.error)
        }
    }, [negocioActivoId])

    const orders = pedidos[negocioActivoId]
    const [isLocalLoading, setIsLocalLoading] = useState(true)

    useEffect(() => {
        if (orders !== undefined || !negocioActivoId) {
            const timer = setTimeout(() => setIsLocalLoading(false), 200)
            return () => clearTimeout(timer)
        }
    }, [orders, negocioActivoId])

    const currentOrders = useMemo(() => orders || [], [orders])

    const stockOrders = useMemo(() => currentOrders.filter(o =>
        o.type === 'STOCK' ||
        (o.clientName && String(o.clientName).trim().toUpperCase() === 'STOCK')
    ), [currentOrders])

    const filteredOrders = useMemo(() => stockOrders.filter(order => {
        const matchEstado = estadoFilter === 'all' || order.estado === estadoFilter
        const searchLower = searchTerm.toLowerCase()
        const num = String(order.numero || '').toLowerCase()
        const fn = String(order.responsableGeneral?.firstName || '').toLowerCase()
        const ln = String(order.responsableGeneral?.lastName || '').toLowerCase()
        const products = order.items?.map(i => String(i.nombreProducto).toLowerCase()).join(' ') || ''

        return matchEstado && (searchTerm === '' ||
            num.includes(searchLower) ||
            fn.includes(searchLower) ||
            ln.includes(searchLower) ||
            products.includes(searchLower))
    }), [stockOrders, estadoFilter, searchTerm])

    const sortedOrders = useMemo(() => [...filteredOrders].sort((a, b) => {
        let valA: any = a[sortKey as keyof typeof a]
        let valB: any = b[sortKey as keyof typeof b]
        if (sortKey === 'fechaActualizacion') {
            valA = new Date(a.fechaActualizacion || 0).getTime()
            valB = new Date(b.fechaActualizacion || 0).getTime()
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
    }), [filteredOrders, sortKey, sortDir])

    const activeOrders = useMemo(() => sortedOrders.filter(o => o.estado !== 'IN_STOCK' && o.estado !== 'CANCELLED'), [sortedOrders])
    const inStockOrders = useMemo(() => sortedOrders.filter(o => o.estado === 'IN_STOCK'), [sortedOrders])

    const stats = useMemo(() => ({
        totalInvestment: stockOrders.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0),
        pendingProfit: stockOrders.reduce((acc, o) => acc + (Number(o.profit) || 0), 0),
        activeOrdersCount: stockOrders.filter(o => o.estado !== 'IN_STOCK' && o.estado !== 'CANCELLED').length
    }), [stockOrders])

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const handleSellConfirm = async (data: { price: number, clientName: string, date: string, notes: string }) => {
        if (!selectedOrder) return

        try {
            await api.orders.updateStatus(selectedOrder.id, {
                status: 'DELIVERED',
                type: 'CUSTOMER',
                clientName: data.clientName,
                totalPrice: data.price,
                dueDate: data.date,
                notes: data.notes
            })
            await refresh(true)
            toast.success('Venta registrada con éxito')
        } catch (error) {
            console.error('Error in handleSellConfirm:', error)
            toast.error('Error al registrar la venta')
        }
    }

    if (!negocioActivoId || (orders === undefined && isLocalLoading)) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="h-10 w-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cargando Inventario...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Monitoreo de Activos</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Inventario de <span className="text-primary italic">Producción</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Control centralizado de manufactura interna, gestión de activos terminados y proyecciones de rentabilidad.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] gap-2 lg:h-12 lg:px-8 group">
                        <Link href="/stock/nuevo" className="flex items-center gap-2">
                            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                            <span>Generar Reposición</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet className="h-20 w-20 text-zinc-900 dark:text-white" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Capital Invertido</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                                    {formatARS(stats.totalInvestment).split(',')[0]}
                                </span>
                                <span className="text-sm font-bold text-zinc-400">,00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-primary p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="h-20 w-20 text-white" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 backdrop-blur-sm">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Retorno Proyectado</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black tracking-tighter text-white">
                                    {formatARS(stats.totalInvestment + stats.pendingProfit).split(',')[0]}
                                </span>
                                <span className="text-sm font-bold text-white/40">,00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package2 className="h-20 w-20 text-zinc-900 dark:text-white" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700">
                            <Package2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Órdenes Activas</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                                    {stats.activeOrdersCount}
                                </span>
                                <span className="text-xs font-bold text-zinc-400 uppercase">Procesos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col lg:flex-row items-center gap-6 bg-white dark:bg-zinc-900/40 p-4 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm backdrop-blur-sm overflow-hidden">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Filtrar por número de orden, producto o responsable..."
                        className="h-11 w-full rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-950"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full lg:w-[240px] group">
                        <select
                            className="w-full h-11 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-4 pr-10 text-xs font-bold text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                        >
                            <option value="all">TODOS LOS ESTADOS</option>
                            {config.productionStages.map(stage => (
                                <option key={stage.key} value={stage.key}>{stage.label.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Active Production Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            En Línea de Producción
                            <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{activeOrders.length}</span>
                        </h2>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Crucial para Inventario</p>
                </div>

                {activeOrders.length > 0 ? (
                    <div className="overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm">
                        <OrdersTable
                            orders={activeOrders}
                            getClientName={() => 'STOCK'}
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={handleSort}
                            employees={employees}
                            hideTypeColumn={true}
                            hideUrgency={true}
                            hideDelivery={true}
                            hideFinancials={true}
                            clientLabel="Referencia"
                        />
                    </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[2.5rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/5 dark:bg-zinc-900/5">
                        <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                            <Package2 className="h-7 w-7 text-zinc-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-zinc-400 tracking-tight">Sin procesos activos</p>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">No se detectan órdenes de reposición en la línea actual.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* In Stock History */}
            {inStockOrders.length > 0 && (
                <div className="pt-12 space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                Disponibles en Depósito
                                <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-2 py-0.5 rounded-full">{inStockOrders.length}</span>
                            </h2>
                        </div>
                        <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Listos p/ Venta</p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/10 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <OrdersTable
                            orders={inStockOrders}
                            getClientName={() => 'STOCK'}
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={handleSort}
                            employees={employees}
                            hideTypeColumn={true}
                            hideUrgency={true}
                            hideDelivery={true}
                            hideFinancials={true}
                            onSell={(order) => {
                                setSelectedOrder(order)
                                setIsSellModalOpen(true)
                            }}
                            clientLabel="Referencia"
                        />
                    </div>
                </div>
            )}

            <SellStockModal
                order={selectedOrder}
                isOpen={isSellModalOpen}
                onClose={() => setIsSellModalOpen(false)}
                onConfirm={handleSellConfirm}
            />
        </div>
    )
}
