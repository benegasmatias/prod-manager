'use client'

import { StatCard } from '@/src/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { ShoppingCart, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Money } from '@/src/components/Money'
import { Badge } from '@/src/components/ui/badge'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'

export default function DashboardPage() {
    const { negocioActivoId } = useNegocio()
    const { pedidos } = usePedidos()
    const orders = pedidos[negocioActivoId] || pedidos['n1'] || []

    const activeOrders = orders.filter(o => o.estado !== 'Entregado')
    const totalSales = orders.reduce((acc, o) => acc + o.totalPrice, 0)
    const totalProfit = orders.reduce((acc, o) => acc + o.profit, 0)

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel de Control</h1>
                <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Resumen generalizado para tu negocio activo.</p>
            </div>

            {/* Grid 1-2-4 dependiendo del breakpoint */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Ventas Totales"
                    value={totalSales.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    icon={TrendingUp}
                    trend={{ value: 12, label: 'vs mes pasado', isPositive: true }}
                />
                <StatCard
                    title="Ganancia"
                    value={totalProfit.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    icon={TrendingUp}
                    trend={{ value: 8, label: 'vs mes pasado', isPositive: true }}
                />
                <StatCard
                    title="Pedidos Activos"
                    value={activeOrders.length}
                    icon={ShoppingCart}
                    description="Pedidos en curso"
                />
                <StatCard
                    title="Nuevos Clientes"
                    value="+4"
                    icon={Users}
                    trend={{ value: 2, label: 'vs mes pasado', isPositive: true }}
                />
            </div>

            {/* Sección de detalles - Apilar en mobile, Grid en desktop */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-xl">Últimos Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.length > 0 ? orders.map((order) => (
                                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800 gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold leading-none">{order.clientName}</p>
                                        <p className="text-xs text-zinc-500">{order.numero}</p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2">
                                            <BadgeUrgencia urgencia={order.urgencia} />
                                            <Badge variant="outline" className="hidden xs:inline-flex">{order.estado}</Badge>
                                        </div>
                                        <Money amount={order.totalPrice} className="text-sm font-bold" />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-zinc-500 py-6 text-center">No hay pedidos registrados.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-xl">Alertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.some(o => o.urgencia === 'VENCIDO') && (
                                <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900 dark:text-red-400">Atención: Pedidos Vencidos</p>
                                        <p className="text-xs text-red-700 dark:text-red-500">
                                            Tienes entregas pendientes que han superado el plazo.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <AlertCircle className="h-5 w-5 text-zinc-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Todo al día</p>
                                    <p className="text-xs text-zinc-500">
                                        No hay incidentes críticos reportados.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
