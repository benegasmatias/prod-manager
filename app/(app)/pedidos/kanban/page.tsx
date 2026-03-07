'use client'

import { useState, useEffect } from 'react'
import { OrdersKanban } from '@/src/components/OrdersKanban'
import { Button } from '@/src/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { usePedidos } from '@/src/context/PedidosContext'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'
import { Employee } from '@/src/types'

export default function KanbanPage() {
    const { pedidos } = usePedidos()
    const { negocioActivoId } = useNegocio()
    const [employees, setEmployees] = useState<Employee[]>([])

    useEffect(() => {
        if (negocioActivoId) {
            api.employees.getAll(negocioActivoId, true)
                .then(data => setEmployees(data as Employee[]))
                .catch(console.error)
        }
    }, [negocioActivoId])

    const orders = pedidos[negocioActivoId] || []
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pedidos (Kanban)</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Vista flujo de tus pedidos en tiempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
                        <Link href="/pedidos" className="flex h-9 items-center justify-center px-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 line-clamp-1">
                            <List className="h-4 w-4" />
                        </Link>
                        <Link href="/pedidos/kanban" className="flex h-9 items-center justify-center bg-zinc-100 px-3 transition-colors dark:bg-zinc-800">
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

            <OrdersKanban orders={orders} employees={employees} />
        </div>
    )
}
