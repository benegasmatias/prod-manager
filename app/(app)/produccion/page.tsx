'use client'

import { useEffect, useState } from 'react'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'
import { api } from '@/src/lib/api'
import { Button } from '@/src/components/ui/button'
import { Plus, CheckCircle2, Printer, Layers, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ProductionPage() {
    const { negocioActivoId, config } = useNegocio()
    const { refresh: refreshPedidos } = usePedidos()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

    const loadQueue = async () => {
        if (!negocioActivoId) return
        try {
            const data = await api.jobs.getQueue(negocioActivoId)
            setJobs(data as any[])
        } catch (error) {
            console.error('Error loading production queue:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadQueue()
    }, [negocioActivoId])

    const handleAdvance = async (jobId: string) => {
        setUpdatingIds(prev => new Set(prev).add(jobId))
        try {
            await api.jobs.addProgress(jobId, 1)
            toast.success('Avance registrado')
            await loadQueue()
            refreshPedidos() // update global state
        } catch (error: any) {
            toast.error(error.message || 'Error al registrar avance')
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete(jobId)
                return next
            })
        }
    }

    const handleComplete = async (jobId: string) => {
        setUpdatingIds(prev => new Set(prev).add(jobId))
        try {
            await api.jobs.updateStatus(jobId, 'DONE', 'Manually completed')
            toast.success('Trabajo completado')
            await loadQueue()
            refreshPedidos()
        } catch (error) {
            toast.error('Error al completar trabajo')
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete(jobId)
                return next
            })
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">{config.labels.produccion}</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Centro de monitoreo táctico y control de avance operativo</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                        <Layers className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {jobs.map(job => {
                    const totalUnits = job.totalUnits || 1;
                    const unitsDone = job.progress?.reduce((sum: number, p: any) => sum + p.unitsDone, 0) || 0;
                    const progress = Math.min(100, Math.round((unitsDone / totalUnits) * 100));
                    const orderItem = job.orderItem;

                    return (
                        <div key={job.id} className={cn(
                            "group relative overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2rem] shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5",
                            updatingIds.has(job.id) && "opacity-60 pointer-events-none"
                        )}>
                            <div className="p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2.5 py-1 rounded-lg tracking-tighter shadow-sm">
                                                {job.order?.numero || 'S/N'}
                                            </span>
                                            <BadgeUrgencia urgencia={job.order?.urgencia || 'EN TIEMPO'} />
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                                            {job.title || orderItem?.nombre || 'Producto en Proceso'}
                                        </h3>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-3 w-3" /> {job.order?.clientName || 'Cliente No Identificado'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-12 w-12 rounded-2xl border-zinc-100 dark:border-zinc-800 hover:bg-primary/5 hover:text-primary transition-all"
                                            onClick={() => handleAdvance(job.id)}
                                            disabled={unitsDone >= totalUnits || updatingIds.has(job.id)}
                                        >
                                            {updatingIds.has(job.id) ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Plus className="h-5 w-5" />
                                            )}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-12 w-12 rounded-2xl border-zinc-100 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-500 transition-all"
                                            onClick={() => handleComplete(job.id)}
                                            disabled={updatingIds.has(job.id)}
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{config.labels.maquinas.slice(0, -1)}</p>
                                        <div className="flex items-center gap-2 font-bold text-sm text-zinc-700 dark:text-zinc-300">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            {job.printer?.name || 'Manual / Sin Asignar'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{config.labels.materiales.slice(0, -1)}</p>
                                        <div className="flex items-center gap-2 font-bold text-sm text-zinc-700 dark:text-zinc-300 uppercase">
                                            <Layers className="h-3 w-3 text-zinc-400" />
                                            {job.material?.name || 'Genérico'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                                                {unitsDone} <span className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">/ {totalUnits} Unidades</span>
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{progress}%</span>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progreso Real</p>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-700/50">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                                                progress === 100 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/20"
                                            )}
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {jobs.length === 0 && !loading && (
                    <div className="lg:col-span-2 py-32 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/20 dark:bg-zinc-900/10 grayscale opacity-80">
                        <div className="h-20 w-20 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center">
                            {(() => {
                                const Icon = config.icons.produccion as any;
                                return <Icon className="h-10 w-10 text-zinc-200" />
                            })()}
                        </div>
                        <div className="space-y-2 px-8">
                            <p className="text-xl font-black text-zinc-400 uppercase tracking-tight">Sin actividad productiva</p>
                            <p className="text-sm text-zinc-500 italic max-w-sm mx-auto">No hay trabajos activos. Los procesos aparecerán aquí cuando sean asignados.</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="lg:col-span-2 py-40 flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 border-4 border-zinc-200 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/10" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 animate-pulse">Sincronizando Línea de Producción</p>
                    </div>
                )}
            </div>
        </div>
    )
}

import { cn } from '@/src/lib/utils'
import { User } from 'lucide-react'
