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

    if (!negocioActivoId || (orders === undefined && isLocalLoading)) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="h-10 w-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cargando Inventario...</p>
            </div>
        )
    }

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

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Inventario de Producción</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Gestión de fabricación de inventario y reposición</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-primary/20 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                        <Link href="/stock/nuevo">
                            <Plus className="h-5 w-5" /> Nueva Orden de Reposición
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Inversión Total</span>
                        <p className="text-2xl font-black tabular-nums tracking-tight">{formatARS(stats.totalInvestment)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Proyección de Venta</span>
                        <p className="text-2xl font-black tabular-nums tracking-tight">{formatARS(stats.totalInvestment + stats.pendingProfit)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                        <Package2 className="h-5 w-5 text-white dark:text-zinc-900" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ordenes de Reposición</span>
                        <p className="text-2xl font-black tabular-nums tracking-tight">{stats.activeOrdersCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-zinc-900/20 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <div className="lg:col-span-8 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Buscar Orden</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                        <Input
                            placeholder="Buscar por Nº o Responsable..."
                            className="pl-11 h-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Estado de Producción</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 rounded-2xl border border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 text-xs font-bold focus:outline-none appearance-none transition-all"
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                        >
                            <option value="all">TODAS LAS ÓRDENES</option>
                            {config.productionStages.map(stage => (
                                <option key={stage.key} value={stage.key}>{stage.label.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table Active */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                    <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">En Fabricación</h2>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums">({activeOrders.length})</span>
                </div>
                {activeOrders.length > 0 ? (
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
                ) : (
                    <div className="p-12 text-center rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-loose">No hay órdenes de producción<br />activas para inventario</p>
                    </div>
                )}
            </div>

            {/* In Stock History */}
            {inStockOrders.length > 0 && (
                <div className="pt-8 space-y-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Manufactura Ingresada a Inventario</h2>
                        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
                    </div>

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
