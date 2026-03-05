'use client'

import { useState } from 'react'
import { OrdersTable } from '@/src/components/OrdersTable'
import { Button } from '@/src/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { useClientes } from '@/src/context/ClientesContext'

export default function OrdersPage() {
    const { negocioActivoId } = useNegocio()
    const { pedidos } = usePedidos()
    const { clientes } = useClientes()

    const [estadoFilter, setEstadoFilter] = useState('all')
    const [urgenciaFilter, setUrgenciaFilter] = useState('all')

    const orders = pedidos[negocioActivoId] || []
    const misClientes = clientes[negocioActivoId] || []

    const filteredOrders = orders.filter(order => {
        const matchEstado = estadoFilter === 'all' || order.estado === estadoFilter
        const matchUrgencia = urgenciaFilter === 'all' || order.urgencia === urgenciaFilter
        return matchEstado && matchUrgencia
    })

    const getClientName = (id: string) => {
        const c = misClientes.find(cli => cli.id === id)
        return c ? c.nombre : 'Cliente Desconocido'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Gestiona y monitorea todos tus pedidos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
                        <Link href="/pedidos" className="flex h-9 items-center justify-center bg-zinc-100 px-3 transition-colors dark:bg-zinc-800">
                            <List className="h-4 w-4" />
                        </Link>
                        <Link href="/pedidos/kanban" className="flex h-9 items-center justify-center px-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                            <LayoutGrid className="h-4 w-4" />
                        </Link>
                    </div>
                    <Link href="/pedidos/nuevo">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nuevo Pedido
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4 py-4">
                <div className="flex h-9 w-[200px] rounded-md border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950">
                    <select
                        className="bg-transparent text-sm focus:outline-none w-full"
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Producción">En Producción</option>
                        <option value="Terminado">Terminado</option>
                        <option value="Entregado">Entregado</option>
                    </select>
                </div>
                <div className="flex h-9 w-[200px] rounded-md border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950">
                    <select
                        className="bg-transparent text-sm focus:outline-none w-full"
                        value={urgenciaFilter}
                        onChange={(e) => setUrgenciaFilter(e.target.value)}
                    >
                        <option value="all">Prioridad: Todas</option>
                        <option value="VENCIDO">VENCIDO</option>
                        <option value="PRÓXIMO">PRÓXIMO</option>
                        <option value="EN TIEMPO">EN TIEMPO</option>
                    </select>
                </div>
            </div>

            <OrdersTable orders={filteredOrders} getClientName={getClientName} />
        </div>
    )
}
