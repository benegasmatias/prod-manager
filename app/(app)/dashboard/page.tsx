'use client'

import { useState, useEffect, useRef } from 'react'
import { StatCard } from '@/src/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { ShoppingCart, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { Money } from '@/src/components/Money'
import { Badge } from '@/src/components/ui/badge'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'

interface DashboardSummary {
    totalSales: number;
    profit: number | null;
    activeOrders: number;
    newCustomers: number;
    recentOrders: any[];
    alerts: any[];
    trends: any | null;
}

// Sistema de deduplicación global para evitar llamadas concurrentes idénticas
const PENDING_REQUESTS = new Map<string, Promise<any>>()

export default function DashboardPage() {
    const { negocioActivoId } = useNegocio()
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!negocioActivoId) return

        const fetchSummary = async () => {
            setLoading(true)

            // Si ya hay una petición en vuelo para este negocio, reutilizamos la promesa
            if (PENDING_REQUESTS.has(negocioActivoId)) {
                try {
                    const data = await PENDING_REQUESTS.get(negocioActivoId)
                    setSummary(data)
                    setLoading(false)
                    return
                } catch (err) {
                    // Si la petición previa falló, seguimos para reintentar
                }
            }

            const promise = api.businesses.getDashboardSummary(negocioActivoId)
            PENDING_REQUESTS.set(negocioActivoId, promise)

            try {
                const data = await promise
                setSummary(data)
            } catch (error: any) {
                console.error('Error fetching dashboard summary:', error)
            } finally {
                // Liberamos la petición del mapa para permitir refrescos futuros
                PENDING_REQUESTS.delete(negocioActivoId)
                setLoading(false)
            }
        }

        fetchSummary()
    }, [negocioActivoId])

    const totalSales = summary?.totalSales || 0
    const profit = summary?.profit
    const activeOrdersCount = summary?.activeOrders || 0
    const newCustomersCount = summary?.newCustomers || 0
    const recentOrders = summary?.recentOrders || []
    const alerts = summary?.alerts || []

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
                    value={loading ? '...' : totalSales.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Ganancia"
                    value={loading ? '...' : (profit !== null && profit !== undefined ? profit.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : '—')}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Pedidos Activos"
                    value={loading ? '...' : activeOrdersCount}
                    icon={ShoppingCart}
                    description="Pedidos en curso"
                />
                <StatCard
                    title="Nuevos Clientes"
                    value={loading ? '...' : newCustomersCount}
                    icon={Users}
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
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800 gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold leading-none">{order.clientName}</p>
                                        <p className="text-xs text-zinc-500">{order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="hidden xs:inline-flex">{order.status}</Badge>
                                        </div>
                                        <Money amount={order.total} className="text-sm font-bold" />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-zinc-500 py-6 text-center">{loading ? 'Cargando...' : 'No hay pedidos registrados.'}</p>
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
                            {!loading && alerts.length > 0 ? alerts.map((alert, index) => (
                                <div key={index} className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900 dark:text-red-400">Atención: Pedido Vencido</p>
                                        <p className="text-xs text-red-700 dark:text-red-500">
                                            {alert.message}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <AlertCircle className="h-5 w-5 text-zinc-600 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">{loading ? 'Cargando...' : 'Todo al día'}</p>
                                        <p className="text-xs text-zinc-500">
                                            {loading ? 'Obteniendo alertas...' : 'No hay incidentes críticos reportados.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
