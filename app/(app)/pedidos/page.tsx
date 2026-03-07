'use client'

import { useState, useEffect } from 'react'
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

export default function OrdersPage() {
    const { negocioActivoId, config } = useNegocio()
    const { pedidos } = usePedidos()
    const { clientes } = useClientes()

    const [estadoFilter, setEstadoFilter] = useState('all')
    const [urgenciaFilter, setUrgenciaFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [dateDesde, setDateDesde] = useState('')
    const [dateHasta, setDateHasta] = useState('')
    const [sortKey, setSortKey] = useState<string>('fechaEntrega')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
    const [employees, setEmployees] = useState<Employee[]>([])

    useEffect(() => {
        if (negocioActivoId) {
            api.employees.getAll(negocioActivoId, true)
                .then(data => setEmployees(data as Employee[]))
                .catch(console.error)
        }
    }, [negocioActivoId])

    const orders = pedidos[negocioActivoId] || []
    const misClientes = clientes[negocioActivoId] || []

    const filteredOrders = orders.filter(order => {
        const matchEstado = estadoFilter === 'all' || order.estado === estadoFilter
        const matchUrgencia = urgenciaFilter === 'all' || order.urgencia === urgenciaFilter

        const searchLower = searchTerm.toLowerCase()
        const matchSearch = searchTerm === '' ||
            order.numero.toLowerCase().includes(searchLower) ||
            order.clientName.toLowerCase().includes(searchLower) ||
            order.responsableGeneral?.firstName?.toLowerCase().includes(searchLower) ||
            order.responsableGeneral?.lastName?.toLowerCase().includes(searchLower)

        const orderDate = new Date(order.fechaEntrega)
        const matchDesde = !dateDesde || orderDate >= new Date(dateDesde)
        const matchHasta = !dateHasta || orderDate <= new Date(dateHasta + 'T23:59:59')

        return matchEstado && matchUrgencia && matchSearch && matchDesde && matchHasta
    })

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let valA: any = a[sortKey as keyof typeof a]
        let valB: any = b[sortKey as keyof typeof b]

        if (sortKey === 'fechaEntrega') {
            valA = new Date(a.fechaEntrega).getTime()
            valB = new Date(b.fechaEntrega).getTime()
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
    })

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const getClientName = (id: string) => {
        const c = misClientes.find(cli => cli.id === id)
        return c ? c.nombre : 'Cliente Desconocido'
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Pedidos</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Gestión operativa y seguimiento de producción</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50">
                        <Link
                            href="/pedidos"
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-lg transition-all",
                                "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm",
                                "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/pedidos/kanban"
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-lg transition-all text-zinc-400",
                                "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Link>
                    </div>
                    <Link href="/pedidos/nuevo">
                        <Button className="h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/20">
                            <Plus className="h-4 w-4" /> Registrar Pedido
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-zinc-900/20 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <div className="lg:col-span-4 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Búsqueda Inteligente</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar por Nº, Cliente o Responsable..."
                            className="pl-11 h-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Fecha Desde</label>
                        <Input
                            type="date"
                            className="h-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            value={dateDesde}
                            onChange={(e) => setDateDesde(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Fecha Hasta</label>
                        <Input
                            type="date"
                            className="h-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            value={dateHasta}
                            onChange={(e) => setDateHasta(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Filtrar Estado</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 rounded-2xl border border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none transition-all"
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                        >
                            <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">TODOS LOS ESTADOS</option>
                            {config.productionStages.map(stage => (
                                <option key={stage.key} value={stage.key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{stage.label.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Prioridad</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 rounded-2xl border border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none transition-all"
                            value={urgenciaFilter}
                            onChange={(e) => setUrgenciaFilter(e.target.value)}
                        >
                            <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">TODAS</option>
                            <option value="VENCIDO" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">VENCIDO</option>
                            <option value="PRÓXIMO" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">PRÓXIMO</option>
                            <option value="EN TIEMPO" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">EN TIEMPO</option>
                            <option value="LISTO" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">LISTO</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <OrdersTable
                orders={sortedOrders}
                getClientName={getClientName}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                employees={employees}
            />
        </div>
    )
}
