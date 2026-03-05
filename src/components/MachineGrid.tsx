import { Machine } from '@/src/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Cpu, Play, Settings, AlertTriangle } from 'lucide-react'

interface MachineGridProps {
    machines: Machine[]
    onAssign: (id: string) => void
    onRelease: (id: string) => void
    onDetail: (id: string) => void
    isSubmitting?: boolean
}

export function MachineGrid({ machines, onAssign, onRelease, onDetail, isSubmitting }: MachineGridProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {machines.map((machine) => {
                const statusColors = {
                    Libre: "success",
                    Ocupada: "warning",
                    Mantenimiento: "destructive"
                } as const

                return (
                    <Card key={machine.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {machine.name}
                            </CardTitle>
                            <Cpu className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-zinc-500 uppercase font-bold">{machine.type}</span>
                                <Badge variant={statusColors[machine.status]}>{machine.status}</Badge>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    {machine.status === 'Ocupada' ? (
                                        <>
                                            <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                                            <span>Trabajando en: <span className="font-bold">{machine.currentJobId || 'Pedido activo'}</span></span>
                                        </>
                                    ) : machine.status === 'Mantenimiento' ? (
                                        <>
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            <span>Fuera de servicio</span>
                                        </>
                                    ) : (
                                        <span className="text-zinc-400 italic">Esperando trabajo...</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                {machine.status === 'Libre' ? (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => onAssign(machine.id)}
                                        className="flex-1 rounded-md bg-zinc-900 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Asignar Pedido
                                    </button>
                                ) : (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => onRelease(machine.id)}
                                        className="flex-1 rounded-md border border-zinc-200 py-2 text-xs font-bold hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Procesando...' : 'Finalizar / Liberar'}
                                    </button>
                                )}
                                <button
                                    onClick={() => onDetail(machine.id)}
                                    className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-bold hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    Detalles
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
