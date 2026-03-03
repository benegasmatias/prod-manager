'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Pedido, ItemPedido } from '@/src/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Badge } from '@/src/components/ui/badge'
import { Money } from '@/src/components/Money'
import { Button } from '@/src/components/ui/button'
import { ArrowLeft, Save, Printer, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/src/components/ui/input'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePedidos } from '@/src/context/PedidosContext'

export default function OrderDetailPage() {
    const { id } = useParams()
    const { config, negocioActivoId, negocioActivo } = useNegocio()
    const { pedidos } = usePedidos()
    const [order, setOrder] = useState<Pedido | null>(null)
    const [items, setItems] = useState<any[]>([])

    useEffect(() => {
        const businessOrders = pedidos[negocioActivoId] || pedidos['n1'] || []
        const foundOrder = businessOrders.find(o => o.id === id)

        if (foundOrder) {
            setOrder(foundOrder)
            setItems([...foundOrder.items])
        }
    }, [id, negocioActivoId, pedidos])

    if (!order) return <div className="p-8 text-center text-zinc-500">Cargando pedido o pedido no encontrado...</div>

    const handleUpdateProduced = (itemId: string, val: number) => {
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantityProduced: val } : item
        ))
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/pedidos">
                        <Button variant="outline" size="icon" className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Pedido: {order.numero}</h1>
                        <p className="text-xs sm:text-sm text-zinc-500">{order.clientName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2">
                        <Printer className="h-4 w-4" /> <span className="hidden xs:inline">Imprimir</span>
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none gap-2">
                        <Save className="h-4 w-4" /> <span className="hidden xs:inline">Guardar</span>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Columna Izquierda: Íitems (Casi todo el ancho en mobile) */}
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b border-zinc-50 dark:border-zinc-900">
                            <CardTitle className="text-lg">{config.labels.items}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-10 sm:space-y-12">
                                {items.map((item) => (
                                    <div key={item.id} className="space-y-5 border-b border-zinc-100 pb-10 last:border-0 last:pb-0 dark:border-zinc-800">
                                        <h4 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{item.nombreProducto}</h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                            {config.itemFields.map(campo => {
                                                const value = (item as any)[campo.key] || ''
                                                return (
                                                    <div key={campo.key} className={campo.tipo === 'textarea' ? "sm:col-span-2" : ""}>
                                                        <label className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">
                                                            {campo.label}
                                                        </label>
                                                        {campo.tipo === 'textarea' ? (
                                                            <textarea
                                                                className="flex min-h-[100px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-zinc-900 outline-none"
                                                                defaultValue={value}
                                                            />
                                                        ) : (
                                                            <Input type={campo.tipo} defaultValue={value} className="h-10 text-sm" />
                                                        )}
                                                    </div>
                                                )
                                            })}

                                            <div className="sm:col-span-2 mt-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center justify-between mb-3 px-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Progreso de fabricación</label>
                                                    <Badge variant="outline" className="text-[10px] font-bold">
                                                        {Math.round((item.quantityProduced / item.cantidad) * 100)}%
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={item.quantityProduced}
                                                            onChange={(e) => handleUpdateProduced(item.id, parseInt(e.target.value) || 0)}
                                                            className="h-10 w-20 text-center font-bold px-1"
                                                        />
                                                        <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[8px] font-bold px-1 rounded dark:bg-zinc-50 dark:text-zinc-900">Cant</span>
                                                    </div>
                                                    <div className="h-2.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-inner">
                                                        <div
                                                            className="h-full bg-emerald-500 transition-all duration-500 ease-in-out relative"
                                                            style={{ width: `${Math.min(100, (item.quantityProduced / item.cantidad) * 100)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Sidebar de info (Primero en mobile) */}
                <div className="space-y-6 order-1 lg:order-2">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-sm">Estado General</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm py-1 border-b border-zinc-50 dark:border-zinc-900">
                                    <span className="text-zinc-500 font-medium">Estado</span>
                                    <Badge className="font-bold">{order.estado}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1 border-b border-zinc-50 dark:border-zinc-900">
                                    <span className="text-zinc-500 font-medium">Prioridad</span>
                                    <BadgeUrgencia urgencia={order.urgencia} />
                                </div>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <span className="text-zinc-500 font-medium">Rubro Aplicado</span>
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold uppercase">{negocioActivo?.rubro}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-none shadow-xl">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold opacity-80 uppercase tracking-widest">Resumen de Cobro</CardTitle></CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-400 dark:text-zinc-500 text-xs font-bold">PRECIO FINAL</span>
                                    <Money amount={order.totalPrice} className="text-xl font-black" />
                                </div>
                                <div className="h-px bg-white/10 dark:bg-black/10" />
                                <div className="flex justify-between items-end">
                                    <span className="text-emerald-400 dark:text-emerald-600 text-xs font-black uppercase tracking-tighter">Utilidad Estimada</span>
                                    <Money amount={order.profit} className="font-black text-emerald-400 dark:text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Button variant="ghost" className="w-full gap-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors py-6 border border-dashed border-zinc-200 dark:border-zinc-800">
                            <Trash2 className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Anular Pedido Completamente</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
