'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { StatCard } from '@/src/components/StatCard'
import { TrendingUp, BarChart as BarChartIcon, PieChart as PieChartIcon, Calendar, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'
import { formatARS } from '@/src/lib/money'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'];

export default function ReportsPage() {
    const { negocioActivoId } = useNegocio()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const loadData = async () => {
        if (!negocioActivoId) return
        setLoading(true)
        try {
            const result = await api.reports.getSummary(negocioActivoId)
            setData(result)
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [negocioActivoId])

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Análisis detallado de rendimiento y finanzas en tiempo real.</p>
                </div>
                <Button className="gap-2" variant="outline" onClick={() => window.print()}>
                    <Calendar className="h-4 w-4" /> Imprimir Reporte
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Ventas del Mes"
                    value={formatARS(data.summary.monthlyTotal)}
                    icon={TrendingUp}
                    trend={{ value: 12.5, label: 'proyectado vs mes ant.', isPositive: true }}
                />
                <StatCard
                    title="Pedidos Pendientes"
                    value={data.summary.pendingOrders.toString()}
                    icon={BarChartIcon}
                />
                <StatCard
                    title="Trabajos en Curso"
                    value={data.summary.activeJobs.toString()}
                    icon={Printer}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Ventas Mensuales (Últimos 6 Meses)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.salesByMonth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                <XAxis
                                    dataKey="name"
                                    className="text-[10px] font-medium"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    cursor={{ fill: '#f4f4f5' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e4e4e4',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: any) => [formatARS(Number(value || 0)), 'Ventas']}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#18181b"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Top Productos (por cantidad)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center">
                        <div className="w-full flex">
                            <div className="w-1/2 h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.charts.productUsage}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.charts.productUsage.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 flex flex-col justify-center gap-2">
                                {data.charts.productUsage.map((entry: any, index: number) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-medium truncate max-w-[120px]">{entry.name}</span>
                                        <span className="text-xs text-zinc-500 font-bold ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                                {data.charts.productUsage.length === 0 && (
                                    <p className="text-xs text-zinc-400 italic">No hay datos suficientes</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Rendimiento por Máquina</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {data.printerStats.map((m: any) => (
                            <div key={m.name} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{m.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">{m.jobsDone} trabajos completados</span>
                                    </div>
                                    <span className="text-sm font-black whitespace-nowrap">{m.efficiency}% eficiencia</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-1000"
                                        style={{ width: `${m.efficiency}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {data.printerStats.length === 0 && (
                            <div className="py-8 text-center text-zinc-400 italic text-sm">
                                No se encontraron impresoras configuradas.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
