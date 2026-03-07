import { Machine } from '@/src/types'
import { Badge } from '@/src/components/ui/badge'
import * as Icons from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface MachineGridProps {
    machines: Machine[]
    onAssign: (id: string) => void
    onRelease: (id: string) => void
    onDetail: (id: string) => void
    isSubmitting?: boolean
    iconName?: string
}

export function MachineGrid({ machines, onAssign, onRelease, onDetail, isSubmitting, iconName = 'Cpu' }: MachineGridProps) {
    const IconComponent = (Icons as any)[iconName] || Icons.Cpu

    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {machines.map((machine) => {
                const isOcupada = machine.status === 'Ocupada'
                const isMantenimiento = machine.status === 'Mantenimiento'

                return (
                    <div key={machine.id} className={cn(
                        "group relative overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:shadow-primary/5",
                        isMantenimiento && "opacity-80 grayscale-[0.5]"
                    )}>
                        <div className="flex items-start justify-between mb-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        isOcupada ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                            isMantenimiento ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                                "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    )} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        {machine.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{machine.name}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                                <IconComponent className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/30">
                                <div className="flex items-center gap-3">
                                    <Icons.Settings className="h-4 w-4 text-zinc-400" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">{machine.type}</span>
                                </div>
                                <Icons.Activity className="h-4 w-4 text-zinc-300" />
                            </div>

                            <div className="min-h-[60px] flex flex-col justify-center">
                                {isOcupada ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                            <div className="h-5 w-5 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                                <Icons.Play className="h-3 w-3 text-amber-500 fill-amber-500" />
                                            </div>
                                            <span>En proceso activo</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium ml-7 uppercase tracking-wider">{machine.currentJobId || 'Monitorizando carga...'}</p>
                                    </div>
                                ) : isMantenimiento ? (
                                    <div className="space-y-2 text-rose-500">
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <Icons.AlertTriangle className="h-4 w-4" />
                                            <span>Intervención Requerida</span>
                                        </div>
                                        <p className="text-[10px] font-medium ml-6 opacity-60 uppercase tracking-widest">Fuera de servicio operativo</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 opacity-40">
                                        <Icons.Box className="h-5 w-5" />
                                        <span className="text-xs font-medium italic">Preparada p/ asignación...</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                {machine.status === 'Libre' ? (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => onAssign(machine.id)}
                                        className="flex-1 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-zinc-950/10 disabled:opacity-50"
                                    >
                                        Asignar Pedido
                                    </button>
                                ) : (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => onRelease(machine.id)}
                                        className="flex-1 h-12 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? '...' : 'Liberar Unidad'}
                                    </button>
                                )}
                                <button
                                    onClick={() => onDetail(machine.id)}
                                    className="h-12 w-12 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group/btn"
                                >
                                    <Icons.Settings className="h-4 w-4 text-zinc-400 group-hover/btn:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
