'use client'

import React, { useState, useEffect } from 'react'
import { StatCard } from '@/src/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    Printer,
    Wallet,
    Clock,
    ChevronRight,
    BarChart3,
    Zap,
    Cog,
    HardHat,
    Hammer,
    Package
} from 'lucide-react'
import { Money } from '@/src/components/Money'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'

const ICON_MAP: Record<string, any> = {
    TrendingUp, Wallet, Clock, AlertCircle, ShoppingCart, Printer, Zap, Cog, HardHat, Hammer, Package
}

interface DashboardSummary {
    totalSales: number;
    pendingBalance: number;
    activeOrders: number;
    productionOrders: number;
    activePrinters: number;
    newCustomers: number;
    recentOrders: Array<{
        id: string;
        clientName: string;
        total: number;
        status: string;
        dueDate: string;
    }>;
    alerts: Array<{
        type: string;
        message: string;
        metadata?: any;
    }>;
    trends: any | null;
}

// Sistema de deduplicación global para evitar llamadas concurrentes idénticas
const PENDING_REQUESTS = new Map<string, Promise<any>>()

const STATUS_MAP: Record<string, { label: string, color: string }> = {
    'PENDING': { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    'IN_PROGRESS': { label: 'En Producción', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    'DONE': { label: 'Terminado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'READY': { label: 'Listo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'DELIVERED': { label: 'Entregado', color: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black' },
    'CONFIRMED': { label: 'Confirmado', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export default function DashboardPage() {
    const { negocioActivoId, negocioActivo, config } = useNegocio()
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!negocioActivoId) return

        const fetchSummary = async () => {
            setLoading(true)

            if (PENDING_REQUESTS.has(negocioActivoId)) {
                try {
                    const data = await PENDING_REQUESTS.get(negocioActivoId)
                    setSummary(data)
                    setLoading(false)
                    return
                } catch (err) { }
            }

            const promise = api.businesses.getDashboardSummary(negocioActivoId)
            PENDING_REQUESTS.set(negocioActivoId, promise)

            try {
                const data = await promise
                setSummary(data)
            } catch (error: any) {
                console.error('Error fetching dashboard summary:', error)
            } finally {
                PENDING_REQUESTS.delete(negocioActivoId)
                setLoading(false)
            }
        }

        fetchSummary()
    }, [negocioActivoId])

    const recentOrders = summary?.recentOrders || []
    const alerts = summary?.alerts || []

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Control <span className="text-primary italic">Center</span></h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Monitoreo en tiempo real de {negocioActivo?.nombre || 'tu negocio'}.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sistema Conectado
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {config.stats.map((stat, i) => {
                    const value = summary ? (summary as any)[stat.key] : 0
                    const Icon = ICON_MAP[stat.icon] || Package
                    const colors = ['emerald', 'rose', 'blue', 'amber']

                    return (
                        <StatCard
                            key={stat.key}
                            title={stat.label}
                            value={loading ? '...' : (stat.format === 'currency' ? <Money amount={value} /> : value)}
                            icon={Icon}
                            description={i < 2 ? "Histórico acumulado" : "Estado actual"}
                            color={colors[i % colors.length] as any}
                        />
                    )
                })}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-zinc-200/60 dark:border-zinc-800/50 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 px-6 py-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Últimos Movimientos</CardTitle>
                        <Link href="/pedidos">
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary gap-1">
                                Ver todo <ChevronRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="p-6 animate-pulse flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                            <div className="h-2 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : recentOrders.length > 0 ? (
                                recentOrders.map((order) => {
                                    const stage = config.productionStages.find(s => s.key === order.status);
                                    const coreStatus = STATUS_MAP[order.status];

                                    const label = stage?.label || coreStatus?.label || order.status;

                                    // Improved color logic
                                    let colorClass = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

                                    if (stage) {
                                        const baseColor = stage.color.split('-')[1]; // e.g., 'blue', 'zinc'
                                        if (baseColor === 'zinc') {
                                            colorClass = "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800";
                                        } else {
                                            colorClass = `bg-${baseColor}-500 text-white dark:bg-${baseColor}-500/20 dark:text-${baseColor}-400 dark:border-${baseColor}-500/30 border-transparent`;
                                        }
                                    } else if (coreStatus) {
                                        colorClass = coreStatus.color;
                                    }

                                    return (
                                        <Link key={order.id} href={`/pedidos/${order.id}`} className="group block p-5 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-white group-hover:border-primary/20 group-hover:bg-primary/5 dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
                                                        <ShoppingCart className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col truncate">
                                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors truncate">
                                                            {order.clientName}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">
                                                            ORD-{order.id.slice(0, 6).toUpperCase()} • {new Date(order.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="text-right hidden sm:block">
                                                        <div className="text-sm font-black text-zinc-900 dark:text-zinc-50"><Money amount={order.total} /></div>
                                                    </div>
                                                    <div className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm border whitespace-nowrap",
                                                        colorClass
                                                    )}>
                                                        {label}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                        <ShoppingCart className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sin movimientos recientes</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-zinc-200/60 dark:border-zinc-800/50 shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="flex flex-row items-center border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 px-6 py-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                Alertas Operativas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {!loading && alerts.length > 0 ? (
                                    alerts.map((alert, index) => {
                                        const isStock = alert.type === 'stock_bajo';
                                        return (
                                            <div key={index} className="p-5 flex gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border",
                                                    isStock
                                                        ? "bg-amber-50 border-amber-200/50 text-amber-600 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400"
                                                        : "bg-rose-50 border-rose-200/50 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400"
                                                )}>
                                                    <AlertCircle className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        isStock ? "text-amber-600 dark:text-amber-500" : "text-rose-600 dark:text-rose-500"
                                                    )}>
                                                        {isStock ? 'Stock Crítico' : 'Entrega Vencida'}
                                                    </span>
                                                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                                        {alert.message}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="p-10 text-center flex flex-col items-center">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3">
                                            <Clock className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">✔ Todo bajo control</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/60 dark:border-zinc-800/50 shadow-sm overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 relative">
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black tracking-tight uppercase leading-tight">Impulsa tu <br /> producción</h4>
                                <p className="text-xs font-medium text-white/70 mt-2">Explora los reportes avanzados para encontrar cuellos de botella.</p>
                            </div>
                            <Link href="/reportes">
                                <Button variant="secondary" size="sm" className="w-full font-black uppercase tracking-tight text-xs h-9">
                                    Reportes <BarChart3 className="ml-2 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                        <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-white/10 rounded-full blur-3xl" />
                    </Card>
                </div>
            </div>
        </div>
    )
}
