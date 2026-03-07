import { useState } from 'react'
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
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2, Eye, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { formatARS } from '@/src/lib/money'
import { usePedidos } from '../context/PedidosContext'
import { useNegocio } from '../context/NegocioContext'
import { WhatsAppButton } from '@/src/components/WhatsAppButton'
import { OrderStatusModal } from './OrderStatusModal'
import { Employee } from '@/src/types'

interface OrdersTableProps {
    orders: Pedido[]
    getClientName: (id: string) => string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
    onSort?: (key: string) => void
    employees: Employee[]
}

import { cn } from '@/src/lib/utils'

export function OrdersTable({ orders, getClientName, sortKey, sortDir, onSort, employees }: OrdersTableProps) {
    const { updatePedido } = usePedidos()
    const { negocioActivoId } = useNegocio()
    const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)

    const handleStatusChangeClick = (order: Pedido) => {
        setSelectedOrder(order)
        setIsStatusModalOpen(true)
    }

    const { config } = useNegocio();

    const getStatusStyles = (status: string) => {
        const stage = config.productionStages.find(s => s.key === status);
        if (stage) {
            // Using the color defined in config, mapping bg to text/border colors
            const baseColor = stage.color.split('-')[1]; // e.g., 'blue', 'emerald'
            if (baseColor === 'zinc') return 'bg-zinc-100 text-zinc-600 border-zinc-200';
            return `bg-${baseColor}-50 text-${baseColor}-600 border-${baseColor}-200 dark:bg-${baseColor}-950/20 dark:text-${baseColor}-400 dark:border-${baseColor}-900/50`;
        }
        return 'bg-zinc-50 text-zinc-500 border-zinc-200';
    }

    const SortIcon = ({ field }: { field: string }) => {
        if (sortKey !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-20 group-hover:opacity-100 transition-opacity" />
        return sortDir === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
            : <ArrowDown className="h-3 w-3 ml-1 text-primary" />
    }

    return (
        <div className="space-y-4">
            <div className="hidden md:block rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/50 dark:bg-zinc-950/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50">
                            <TableHead
                                className="cursor-pointer group select-none text-[10px] font-black uppercase tracking-widest text-zinc-400"
                                onClick={() => onSort?.('numero')}
                            >
                                <div className="flex items-center">
                                    Nº Pedido
                                    <SortIcon field="numero" />
                                </div>
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 py-4">Cliente</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Producto Principal</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estado</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Responsable</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Urgencia</TableHead>
                            <TableHead
                                className="cursor-pointer group select-none text-[10px] font-black uppercase tracking-widest text-zinc-400"
                                onClick={() => onSort?.('fechaEntrega')}
                            >
                                <div className="flex items-center">
                                    Entrega
                                    <SortIcon field="fechaEntrega" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Pagado</TableHead>
                            <TableHead
                                className="text-right cursor-pointer group select-none text-[10px] font-black uppercase tracking-widest text-zinc-400"
                                onClick={() => onSort?.('saldo')}
                            >
                                <div className="flex items-center justify-end">
                                    Saldo
                                    <SortIcon field="saldo" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => {
                            const isUpdating = updatingOrders.has(order.id)
                            return (
                                <TableRow key={order.id} className={cn(
                                    "transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 border-b border-zinc-100/50 dark:border-zinc-800/30",
                                    isUpdating && "opacity-50 pointer-events-none"
                                )}>
                                    <TableCell className="font-black text-[10px] text-zinc-400 tabular-nums">#{order.numero}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[140px]">
                                                {getClientName(order.clienteId) === 'Cliente Desconocido' && order.clientName
                                                    ? order.clientName
                                                    : getClientName(order.clienteId)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[180px]">
                                                {order.items && order.items.length > 0
                                                    ? order.items[0].nombreProducto
                                                    : 'Sin productos'}
                                            </span>
                                            {order.items && order.items.length > 1 && (
                                                <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">
                                                    +{order.items.length - 1} adicionales
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative inline-flex items-center">
                                            <div
                                                className={cn(
                                                    "text-[10px] font-black uppercase tracking-tight rounded-lg px-2.5 py-1.5 border shadow-sm outline-none cursor-pointer hover:bg-zinc-100 transition-all",
                                                    getStatusStyles(order.estado)
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleStatusChangeClick(order)
                                                }}
                                            >
                                                {config.productionStages.find(s => s.key === order.estado)?.label || order.estado}
                                            </div>
                                            {isUpdating && (
                                                <div className="absolute -right-6">
                                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {order.responsableGeneral ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                    {order.responsableGeneral.firstName[0]}
                                                    {order.responsableGeneral.lastName ? order.responsableGeneral.lastName[0] : ''}
                                                </div>
                                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                    {order.responsableGeneral.firstName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase italic">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <BadgeUrgencia urgencia={order.urgencia} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                                                {new Date(order.fechaEntrega).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase">
                                                {new Date(order.fechaEntrega).toLocaleDateString('es-AR', { year: '2-digit' })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                                            {formatARS(order.totalSenias || 0)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Money amount={order.saldo} className="text-sm font-black text-zinc-900 dark:text-zinc-50" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 justify-end">
                                            <WhatsAppButton
                                                phone={order.clientPhone}
                                                message={`Hola ${getClientName(order.clienteId)}! Te escribimos sobre tu pedido ${order.numero} que está actualmente en estado: ${config.productionStages.find(s => s.key === order.estado)?.label || order.estado}.`}
                                                variant="ghost"
                                                size="icon"
                                                showLabel={false}
                                                className="h-8 w-8 rounded-xl text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            />
                                            <Link href={`/pedidos/${order.id}`} className={isUpdating ? "pointer-events-none" : ""}>
                                                <Button variant="ghost" size="icon" disabled={isUpdating} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-primary transition-colors">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
                {orders.map((order) => {
                    const isUpdating = updatingOrders.has(order.id)
                    const currentStage = config.productionStages.find(s => s.key === order.estado);
                    return (
                        <div key={order.id} className={cn(
                            "relative rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/50 dark:bg-zinc-950/50 shadow-sm transition-all active:scale-[0.98]",
                            isUpdating && "opacity-50 pointer-events-none"
                        )}>
                            <Link href={`/pedidos/${order.id}`} className="absolute inset-0 z-0" />
                            <div className="relative z-10 flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">#{order.numero}</div>
                                    <div className="text-base font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                                        {getClientName(order.clienteId) === 'Cliente Desconocido' && order.clientName
                                            ? order.clientName
                                            : getClientName(order.clienteId)}
                                    </div>
                                    <div className="text-xs font-medium text-zinc-500 line-clamp-1">
                                        {order.items && order.items.length > 0
                                            ? `${order.items[0].nombreProducto}${order.items.length > 1 ? ` (+${order.items.length - 1})` : ''}`
                                            : 'Sin productos'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 z-20">
                                    <WhatsAppButton
                                        phone={order.clientPhone}
                                        message={`Hola ${getClientName(order.clienteId)}! Te escribimos sobre tu pedido ${order.numero} que está actualmente en estado: ${currentStage?.label || order.estado}.`}
                                        variant="outline"
                                        size="icon"
                                        showLabel={false}
                                        className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-800 text-emerald-600 shadow-sm"
                                    />
                                    <div className="h-9 w-9 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-wrap items-center gap-2 mb-5">
                                <div
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-tight rounded-lg px-3 py-1.5 border shadow-sm",
                                        getStatusStyles(order.estado)
                                    )}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleStatusChangeClick(order)
                                    }}
                                >
                                    {currentStage?.label || order.estado}
                                </div>
                                <BadgeUrgencia urgencia={order.urgencia} />
                                {order.responsableGeneral && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary uppercase">
                                            {order.responsableGeneral.firstName[0]}
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                            {order.responsableGeneral.firstName}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Entrega</span>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        {new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.fechaEntrega))}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Saldo Pendiente</span>
                                    <Money amount={order.saldo} className="text-base font-black text-zinc-950 dark:text-zinc-50" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {orders.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl">
                    <div className="h-16 w-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <ArrowUpDown className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No hay pedidos coincidentes</p>
                    <p className="text-sm text-zinc-500 mt-1">Ajusta los filtros para ver más resultados</p>
                </div>
            )}

            <OrderStatusModal
                order={selectedOrder}
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                employees={employees}
            />
        </div>
    )
}
