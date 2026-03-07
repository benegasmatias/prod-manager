'use client'

import React, { useState } from 'react'
import { Pedido, Employee } from '@/src/types'
import { Card, CardContent } from '@/src/components/ui/card'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Money } from '@/src/components/Money'
import { usePedidos } from '../context/PedidosContext'
import { useNegocio } from '../context/NegocioContext'
import { OrderStatusModal } from './OrderStatusModal'
import { Plus } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface OrdersKanbanProps {
    orders: Pedido[]
    employees: Employee[]
}

export function OrdersKanban({ orders, employees }: OrdersKanbanProps) {
    const { negocioActivoId, config } = useNegocio()
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)

    const COLUMNS = config.productionStages;

    const handleStatusChangeClick = (order: Pedido) => {
        setSelectedOrder(order)
        setIsStatusModalOpen(true)
    }

    const onDragStart = (e: React.DragEvent, orderId: string) => {
        e.dataTransfer.setData('orderId', orderId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const onDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()
        const orderId = e.dataTransfer.getData('orderId')
        if (orderId) {
            const order = orders.find(o => o.id === orderId)
            if (order) {
                // Pre-set the status the user dropped into
                setSelectedOrder({ ...order, estado: newStatus })
                setIsStatusModalOpen(true)
            }
        }
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory lg:snap-none scrollbar-hide">
            {COLUMNS.map((col) => {
                const columnOrders = orders.filter((o) => o.estado === col.key)
                return (
                    <div
                        key={col.key}
                        className="flex w-[85vw] sm:w-[320px] lg:w-full lg:min-w-[280px] lg:max-w-[320px] shrink-0 flex-col gap-4 snap-center transition-all duration-300"
                    >
                        <div className="flex items-center justify-between px-3">
                            <div className="flex items-center gap-2">
                                <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] text-zinc-500")}>
                                    {col.label}
                                </h3>
                                <span className="flex items-center justify-center h-5 px-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 tabular-nums">
                                    {columnOrders.length}
                                </span>
                            </div>
                        </div>

                        <div
                            className="flex h-full min-h-[600px] flex-col gap-4 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30 p-3 border border-zinc-100 dark:border-zinc-800/50 transition-all duration-300 group/column"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, col.key)}
                        >
                            {columnOrders.map((order) => (
                                <Card
                                    key={order.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, order.id)}
                                    className="cursor-grab active:cursor-grabbing hover:border-primary/30 dark:hover:border-primary/20 transition-all shadow-sm rounded-2xl border-zinc-200/60 dark:border-zinc-800/50 overflow-hidden group/card relative"
                                >
                                    <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", col.color)} />
                                    <CardContent className="p-4 space-y-4 pointer-events-none">
                                        <div className="flex items-start justify-between">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest tabular-nums italic">#{order.numero}</span>
                                            <BadgeUrgencia urgencia={order.urgencia} />
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate leading-tight">{order.clientName}</p>
                                        </div>

                                        <div className="space-y-1.5 text-[11px] font-bold text-zinc-500">
                                            {order.items.slice(0, 2).map(item => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <span className="truncate mr-2">• {item.nombreProducto}</span>
                                                    <span className="text-zinc-400 shrink-0">{item.cantidad}u</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 dark:border-zinc-800/50 mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Entrega</span>
                                                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 italic">
                                                    {new Date(order.fechaEntrega).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {order.responsableGeneral && (
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-black text-primary uppercase">
                                                            {order.responsableGeneral.firstName[0]}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">
                                                            {order.responsableGeneral.firstName}
                                                        </span>
                                                    </div>
                                                )}
                                                <Money amount={order.totalPrice} className="text-xs font-black text-zinc-950 dark:text-zinc-50 tabular-nums" />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="px-4 pb-4 mt-[-8px] opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-auto">
                                        <div
                                            className="w-full text-[10px] font-black uppercase tracking-tight rounded-xl px-2 py-2 border shadow-sm outline-none bg-white dark:bg-zinc-900 cursor-pointer text-center hover:bg-zinc-100 transition-all"
                                            onClick={() => handleStatusChangeClick(order)}
                                        >
                                            Cambiar Estado / Responsable
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {columnOrders.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 opacity-50 group-hover/column:opacity-100 transition-opacity">
                                    <Plus className="h-4 w-4 text-zinc-300 dark:text-zinc-700 mb-1" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Vacío</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            <OrderStatusModal
                order={selectedOrder}
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                employees={employees}
            />
        </div>
    )
}
