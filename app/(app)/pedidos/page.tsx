'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, LayoutGrid, List, Search, Calendar, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import Link from 'next/link'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { useClientes } from '@/src/context/ClientesContext'
import { api } from '@/src/lib/api'
import { Employee } from '@/src/types'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { OrdersTable } from '@/src/components/OrdersTable'
import { getStatusLabel } from '@/src/domain/negocio'

export default function OrdersPage() {
    const { negocioActivoId, config, negocioActivo } = useNegocio()
    const { pedidos } = usePedidos()
    const { clientes } = useClientes()

    const [estadoFilter, setEstadoFilter] = useState('all')
    const [urgenciaFilter, setUrgenciaFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [dateDesde, setDateDesde] = useState('')
    const [dateHasta, setDateHasta] = useState('')
    const [sortKey, setSortKey] = useState<string>('fechaActualizacion')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
    const [employees, setEmployees] = useState<Employee[]>([])

    useEffect(() => {
        if (negocioActivoId) {
            api.employees.getAll(negocioActivoId, true)
                .then(data => setEmployees(data as Employee[]))
                .catch(console.error)
        }
    }, [negocioActivoId])

    const orders = useMemo(() => (pedidos[negocioActivoId] || []).filter(o =>
        o.type !== 'STOCK' &&
        o.clientName?.trim().toUpperCase() !== 'STOCK'
    ), [pedidos, negocioActivoId])

    const misClientes = useMemo(() => clientes[negocioActivoId] || [], [clientes, negocioActivoId])

    const filteredOrders = useMemo(() => orders.filter(order => {
        const matchEstado = estadoFilter === 'all' || order.estado === estadoFilter
        const matchUrgencia = urgenciaFilter === 'all' || order.urgencia === urgenciaFilter

        const searchLower = searchTerm.toLowerCase()
        const matchSearch = searchTerm === '' ||
            String(order.numero).toLowerCase().includes(searchLower) ||
            String(order.clientName).toLowerCase().includes(searchLower) ||
            String(order.responsableGeneral?.firstName).toLowerCase().includes(searchLower) ||
            String(order.responsableGeneral?.lastName).toLowerCase().includes(searchLower)

        const orderDate = order.fechaEntrega ? new Date(order.fechaEntrega) : null
        const matchDesde = !dateDesde || (orderDate && orderDate >= new Date(dateDesde))
        const matchHasta = !dateHasta || (orderDate && orderDate <= new Date(dateHasta + 'T23:59:59'))

        return matchEstado && matchUrgencia && matchSearch && matchDesde && matchHasta
    }), [orders, estadoFilter, urgenciaFilter, searchTerm, dateDesde, dateHasta])

    const sortedOrders = useMemo(() => [...filteredOrders].sort((a, b) => {
        let valA: any = a[sortKey as keyof typeof a]
        let valB: any = b[sortKey as keyof typeof b]

        if (sortKey === 'fechaEntrega' || sortKey === 'fechaActualizacion') {
            valA = new Date(a[sortKey as 'fechaEntrega' | 'fechaActualizacion'] || 0).getTime()
            valB = new Date(b[sortKey as 'fechaEntrega' | 'fechaActualizacion'] || 0).getTime()
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
    }), [filteredOrders, sortKey, sortDir])

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const getClientName = useCallback((id: string) => {
        const c = misClientes.find(cli => cli.id === id)
        return c ? c.nombre : 'Cliente Desconocido'
    }, [misClientes])

    const activeOrders = useMemo(() => sortedOrders.filter(o => o.estado !== 'DELIVERED' && o.estado !== 'CANCELLED'), [sortedOrders])
    const archivedOrders = useMemo(() => sortedOrders.filter(o => o.estado === 'DELIVERED' || o.estado === 'CANCELLED'), [sortedOrders])

    return (
        <div className="space-y-8 pb-10">
            {/* ... header and filters ... */}
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Gestión Comercial</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Seguimiento de <span className="text-primary italic">Pedidos</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Administración de flujos de trabajo, órdenes de clientes y estados de entrega en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex p-1.5 rounded-2xl bg-white/70 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-sm">
                        <Link
                            href="/pedidos"
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-xl transition-all",
                                "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/pedidos/kanban"
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-xl transition-all text-zinc-400",
                                "hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Link>
                    </div>
                    <Button asChild className="h-11 px-6 lg:h-12 lg:px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] gap-2">
                        <Link href="/pedidos/nuevo">
                            <Plus className="h-4 w-4" /> Registrar Pedido
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/70 dark:bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm backdrop-blur-sm">
                <div className="lg:col-span-4 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Búsqueda Inteligente</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors transition-all duration-200" />
                        <input
                            placeholder="Buscar por Nº, Cliente o Responsable..."
                            className="w-full pl-11 h-12 border-none bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:ring-2 focus:ring-primary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Fecha Desde</label>
                        <input
                            type="date"
                            className="w-full h-12 border-none bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:ring-2 focus:ring-primary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs px-4"
                            value={dateDesde}
                            onChange={(e) => setDateDesde(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Fecha Hasta</label>
                        <input
                            type="date"
                            className="w-full h-12 border-none bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:ring-2 focus:ring-primary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs px-4"
                            value={dateHasta}
                            onChange={(e) => setDateHasta(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Filtrar Estado</label>
                    <div className="relative group">
                        <select
                            className="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-4 pr-10 text-[11px] font-bold focus:ring-2 focus:ring-primary/10 appearance-none transition-all cursor-pointer"
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                        >
                            <option value="all">TODOS LOS ACTIVOS</option>
                            {config.productionStages.map(stage => (
                                <option key={stage.key} value={stage.key}>
                                    {getStatusLabel(stage.key, negocioActivo?.rubro).toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Prioridad</label>
                    <div className="relative group">
                        <select
                            className="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-4 pr-10 text-[11px] font-bold focus:ring-2 focus:ring-primary/10 appearance-none transition-all cursor-pointer"
                            value={urgenciaFilter}
                            onChange={(e) => setUrgenciaFilter(e.target.value)}
                        >
                            <option value="all">TODAS</option>
                            <option value="VENCIDO">VENCIDO</option>
                            <option value="PRÓXIMO">PRÓXIMO</option>
                            <option value="EN TIEMPO">EN TIEMPO</option>
                            <option value="LISTO">LISTO</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">Pedidos en Curso</h2>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums">({activeOrders.length})</span>
                </div>
                {activeOrders.length > 0 ? (
                    <OrdersTable
                        orders={activeOrders}
                        getClientName={getClientName}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                        employees={employees}
                        hideTypeColumn={true}
                        clientLabel="Cliente"
                    />
                ) : (
                    <div className="p-12 text-center rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No hay pedidos activos</p>
                    </div>
                )}
            </div>

            {(estadoFilter === 'all' || estadoFilter === 'DELIVERED' || estadoFilter === 'CANCELLED') && archivedOrders.length > 0 && (
                <div className="pt-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Historial de Pedidos (Entregados / Anulados)</h2>
                        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
                    </div>

                    <OrdersTable
                        orders={archivedOrders}
                        getClientName={getClientName}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                        employees={employees}
                        hideTypeColumn={true}
                        clientLabel="Cliente"
                    />
                </div>
            )}
        </div>
    )
}
