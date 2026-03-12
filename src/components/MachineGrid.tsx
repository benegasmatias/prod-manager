import { Machine } from '@/src/types'
import { Button } from '@/src/components/ui/button'
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {machines.map((machine) => {
                const isOcupada = machine.status === 'Ocupada' || machine.status === 'PRINTING'
                const isMantenimiento = machine.status === 'Mantenimiento' || machine.status === 'MAINTENANCE'
                const isLibre = machine.status === 'Libre' || machine.status === 'IDLE'

                return (
                    <div key={machine.id} className={cn(
                        "group relative overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up",
                        isMantenimiento && "opacity-75 grayscale-[0.3]"
                    )}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        isOcupada ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                            isMantenimiento ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                                "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        isOcupada ? "text-amber-600 dark:text-amber-400" :
                                            isMantenimiento ? "text-rose-600 dark:text-rose-400" :
                                                "text-emerald-600 dark:text-emerald-400"
                                    )}>
                                        {isOcupada ? 'Producción' : isMantenimiento ? 'Mantenimiento' : 'Libre / Operativa'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{machine.name}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                                <IconComponent className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <Icons.Settings className="h-3.5 w-3.5 text-zinc-400" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">{machine.type}</span>
                                </div>
                                <Icons.Activity className="h-3.5 w-3.5 text-zinc-300" />
                            </div>

                            <div className="min-h-[50px] flex flex-col justify-center px-1">
                                {isOcupada ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                            <Icons.PlayCircle className="h-4 w-4 text-emerald-500" />
                                            <span>Trabajo en curso</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 font-medium ml-6 truncate">{machine.currentJobId || 'Monitorizando carga...'}</p>
                                    </div>
                                ) : isMantenimiento ? (
                                    <div className="space-y-1.5 text-rose-600 dark:text-rose-400">
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            <Icons.AlertTriangle className="h-4 w-4" />
                                            <span>Fuera de servicio</span>
                                        </div>
                                        <p className="text-[11px] font-medium ml-6 opacity-70 italic">Intervención técnica requerida</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 opacity-60">
                                        <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                                            <Icons.Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 italic">Lista para producción</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                {isLibre ? (
                                    <Button
                                        disabled={isSubmitting}
                                        onClick={() => onAssign(machine.id)}
                                        className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        Asignar Trabajo
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={isSubmitting}
                                        variant="outline"
                                        onClick={() => onRelease(machine.id)}
                                        className="flex-1 h-10 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? '...' : 'Liberar Unidad'}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onDetail(machine.id)}
                                    className="h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group/btn"
                                >
                                    <Icons.MoreHorizontal className="h-4 w-4 text-zinc-500 group-hover/btn:text-primary transition-colors" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
