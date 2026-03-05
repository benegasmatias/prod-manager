import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/src/components/ui/table'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Money } from '@/src/components/Money'
import { DateTag } from '@/src/components/DateTag'
import { Pedido, OrderStatus } from '@/src/types'
import Link from 'next/link'
import { Eye, ChevronRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { formatARS } from '@/src/lib/money'
import { usePedidos } from '../context/PedidosContext'
import { useNegocio } from '../context/NegocioContext'

interface OrdersTableProps {
    orders: Pedido[]
    getClientName: (id: string) => string
}

export function OrdersTable({ orders, getClientName }: OrdersTableProps) {
    const { updatePedido } = usePedidos()
    const { negocioActivoId } = useNegocio()

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updatePedido(negocioActivoId, orderId, { estado: newStatus })
    }

    return (
        <div className="space-y-4">
            {/* Vista de Escritorio - Tabla */}
            <div className="hidden md:block rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nº Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Urgencia</TableHead>
                            <TableHead>Fecha Entrega</TableHead>
                            <TableHead className="text-right">Pagado</TableHead>
                            <TableHead className="text-right">Saldo</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium text-xs font-mono">{order.numero}</TableCell>
                                <TableCell>{getClientName(order.clienteId)}</TableCell>
                                <TableCell>
                                    <select
                                        className="text-[11px] font-bold uppercase rounded-full px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-1 focus:ring-zinc-400 transition-all cursor-pointer"
                                        value={order.estado}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En Producción">En Producción</option>
                                        <option value="Terminado">Terminado</option>
                                        <option value="Entregado">Entregado</option>
                                    </select>
                                </TableCell>
                                <TableCell>
                                    <BadgeUrgencia urgencia={order.urgencia} />
                                </TableCell>
                                <TableCell>
                                    <DateTag date={new Date(order.fechaEntrega)} />
                                </TableCell>
                                <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                                    {formatARS(order.totalSenias || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Money amount={order.saldo} className="font-semibold" />
                                </TableCell>
                                <TableCell>
                                    <Link href={`/pedidos/${order.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Vista Mobile - Lista de Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {orders.map((order) => (
                    <div key={order.id} className="relative rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
                        <Link href={`/pedidos/${order.id}`} className="absolute inset-0 z-0"></Link>
                        <div className="relative z-10 flex items-start justify-between mb-3 pointer-events-none">
                            <div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-tight mb-0.5">{order.numero}</div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{getClientName(order.clienteId)}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-400 mt-1" />
                        </div>

                        <div className="relative z-10 flex flex-wrap items-center gap-2 mb-4">
                            <select
                                className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-1 focus:ring-zinc-400 transition-all cursor-pointer h-7"
                                value={order.estado}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Producción">En Producción</option>
                                <option value="Terminado">Terminado</option>
                                <option value="Entregado">Entregado</option>
                            </select>
                            <BadgeUrgencia urgencia={order.urgencia} />
                        </div>

                        <div className="relative z-10 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800 mb-2 pointer-events-none">
                            <div className="text-xs text-zinc-500">
                                Entrega: <span className="font-medium text-zinc-700 dark:text-zinc-300">{new Intl.DateTimeFormat('es-AR').format(new Date(order.fechaEntrega))}</span>
                            </div>
                            <Money amount={order.saldo} className="font-bold text-zinc-950 dark:text-zinc-50" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between text-xs pointer-events-none">
                            <span className="text-zinc-500">Pagado:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{formatARS(order.totalSenias || 0)}</span>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 border border-dashed rounded-lg">
                        No hay pedidos coincidentes.
                    </div>
                )}
            </div>
        </div>
    )
}
