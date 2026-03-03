import { Pedido, OrderStatus } from '@/src/types'
import { Card, CardContent } from '@/src/components/ui/card'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Money } from '@/src/components/Money'
import { DateTag } from '@/src/components/DateTag'
import { Badge } from '@/src/components/ui/badge'

interface OrdersKanbanProps {
    orders: Pedido[]
}

const COLUMNS: OrderStatus[] = ['Pendiente', 'En Producción', 'Parcial', 'Terminado', 'Entregado']

export function OrdersKanban({ orders }: OrdersKanbanProps) {
    return (
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory lg:snap-none">
            {COLUMNS.map((status) => {
                const columnOrders = orders.filter((o) => o.estado === status)
                return (
                    <div
                        key={status}
                        className="flex w-[85vw] sm:w-[350px] lg:w-full lg:min-w-[280px] lg:max-w-[320px] shrink-0 flex-col gap-4 snap-center"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold tracking-tight text-sm sm:text-base">{status}</h3>
                            <Badge variant="secondary" className="px-1.5 h-5 text-[10px]">{columnOrders.length}</Badge>
                        </div>

                        <div className="flex h-full min-h-[500px] flex-col gap-3 rounded-lg bg-zinc-100/50 p-2 sm:p-3 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                            {columnOrders.map((order) => (
                                <Card key={order.id} className="cursor-grab active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm">
                                    <CardContent className="p-3 sm:p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{order.numero}</span>
                                            <BadgeUrgencia urgencia={order.urgencia} />
                                        </div>

                                        <p className="text-sm font-bold truncate">{order.clientName}</p>

                                        <div className="flex flex-col gap-1">
                                            {order.items.slice(0, 3).map(item => (
                                                <p key={item.id} className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                                                    • {item.nombreProducto} ({item.cantidad}u)
                                                </p>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-[10px] text-zinc-400 italic">+{order.items.length - 3} ítems más...</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                                            <DateTag date={new Date(order.fechaEntrega)} />
                                            <Money amount={order.total} className="text-[11px] font-black" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {columnOrders.length === 0 && (
                                <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-zinc-300 text-[10px] text-zinc-400 dark:border-zinc-700">
                                    Sin pedidos
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
