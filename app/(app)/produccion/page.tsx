'use client'

import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'

export default function ProductionPage() {
    const { negocioActivoId, config } = useNegocio()
    const { pedidos } = usePedidos()
    const orders = pedidos[negocioActivoId] || []
    const inProduction = orders.filter(o => o.estado === 'En Producción')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{config.labels.produccion}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Monitoreo de tareas activas en los centros de trabajo para este negocio.</p>
            </div>

            <div className="grid gap-6">
                {inProduction.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{order.numero}</CardTitle>
                                <p className="text-sm text-zinc-500">{order.clientName}</p>
                            </div>
                            <BadgeUrgencia urgencia={order.urgencia} />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items?.map(item => {
                                    const qty = item.cantidad || 1;
                                    const produced = item.quantityProduced || 0;
                                    const progress = Math.min(100, Math.round((produced / qty) * 100));

                                    return (
                                        <div key={item.id} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.nombreProducto}</span>
                                                <span className="font-medium text-xs text-zinc-500">
                                                    {produced} / {qty} un. ({progress}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                                                <div
                                                    className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!order.items || order.items.length === 0) && (
                                    <p className="text-sm text-zinc-400 italic text-center py-2">Sin ítems registrados en este pedido.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {inProduction.length === 0 && (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 gap-2">
                        <p>No hay pedidos en curso actualmente.</p>
                        <p className="text-xs">Solo se muestran pedidos con estado "En Producción".</p>
                    </div>
                )}
            </div>
        </div>
    )
}
