'use client'

import { useState, useEffect } from 'react'
import { OrdersKanban } from '@/src/components/OrdersKanban'
import { Button } from '@/src/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/src/lib/utils'
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

    const orders = (pedidos[negocioActivoId] || []).filter(o =>
        o.type !== 'STOCK' &&
        o.clientName?.trim().toUpperCase() !== 'STOCK' &&
        o.estado !== 'CANCELLED' &&
        o.estado !== 'DELIVERED'
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Flujo de Trabajo</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Monitoreo <span className="text-primary italic">Kanban</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Vista operativa del flujo de pedidos y estados de producción en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex p-1.5 rounded-2xl bg-white/70 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-sm">
                        <Link
                            href="/pedidos"
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-xl transition-all text-zinc-400",
                                "hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/pedidos/kanban"
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-xl transition-all",
                                "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
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

            <OrdersKanban orders={orders} employees={employees} />
        </div>
    )
}
