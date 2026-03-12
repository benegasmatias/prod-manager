'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import {
    ArrowLeft, Mail, Phone, MapPin, User, Calendar,
    Wallet, TrendingUp, ShoppingBag, Clock, ChevronRight,
    MessageSquare, ExternalLink, Plus
} from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/src/components/OrdersTable'
import { useNegocio } from '@/src/context/NegocioContext'
import { useClientes } from '@/src/context/ClientesContext'
import { usePedidos } from '@/src/context/PedidosContext'

export default function ClientDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { negocioActivoId } = useNegocio()
    const { clientes } = useClientes()
    const { pedidos } = usePedidos()

    const misClientes = clientes[negocioActivoId] || []
    const misPedidos = pedidos[negocioActivoId] || []

    const client = misClientes.find(c => c.id === id)
    const clientOrders = misPedidos.filter(o => o.clienteId === id)

    // Calculos de negocio
    const totalSpent = clientOrders.reduce((acc, order) => acc + (order.total || 0), 0)
    const avgOrderValue = clientOrders.length > 0 ? totalSpent / clientOrders.length : 0

    const getClientName = (cid: string) => {
        const c = misClientes.find(cli => cli.id === cid)
        return c ? c.nombre : 'Desconocido'
    }

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-20 w-20 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                    <User className="h-10 w-10 text-zinc-200 dark:text-zinc-800" />
                </div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Cliente no encontrado</p>
                <Button variant="ghost" onClick={() => router.push('/clientes')} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Cartera
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1400px] mx-auto">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/clientes')}
                        className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:text-primary transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">Cliente Activo</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">UID: {id?.toString().slice(0, 8)}</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {client.nombre}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all gap-2 uppercase tracking-widest">
                        <ShoppingBag className="h-4 w-4" /> Registrar Pedido
                    </Button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Inversión Total</p>
                            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                ${totalSpent.toLocaleString('es-AR')}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Cant. Pedidos</p>
                            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {clientOrders.length} <span className="text-xs font-medium text-zinc-400">unids.</span>
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Ticket Promedio</p>
                            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                ${avgOrderValue.toLocaleString('es-AR')}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Antigüedad</p>
                            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {new Date(client.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card & Info */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2.5rem] border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden">
                        <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-zinc-50 dark:border-zinc-800/50" />
                        <CardContent className="p-8 -mt-12 relative">
                            <div className="h-20 w-20 rounded-3xl bg-zinc-900 dark:bg-zinc-50 border-4 border-white dark:border-zinc-950 flex items-center justify-center text-white dark:text-zinc-900 text-3xl font-black mb-6 shadow-xl">
                                {client.nombre.charAt(0).toUpperCase()}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{client.nombre}</h3>
                                    <p className="text-sm font-medium text-zinc-500">Perfil de Contacto Comercial</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center group-hover:text-primary transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Email</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{client.email || 'No registrado'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center group-hover:text-emerald-500 transition-colors">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Teléfono</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{client.telefono || 'No registrado'}</p>
                                        </div>
                                    </div>

                                    {client.notas && (
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mt-1">
                                                <MessageSquare className="h-4 w-4 opacity-50" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-1">Notas Críticas</p>
                                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                                                    "{client.notas}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-widest gap-2 bg-transparent">
                                        Contactar por Whatsapp <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-400 hover:text-primary">
                                        Descargar Historial PDF
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-zinc-100 dark:border-zinc-800 bg-emerald-500/5 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Próxima Acción Sugerida</h4>
                        </div>
                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-400 mb-4">
                            {clientOrders.length === 0
                                ? "Realizar primer contacto para prospección comercial."
                                : "Fidelización: Enviar cupón de descuento por su recurrentía."}
                        </p>
                        <Button className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest">
                            Programar Recordatorio
                        </Button>
                    </Card>
                </div>

                {/* Orders & Activity Timeline */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden min-h-[500px]">
                        <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">Historial de Transacciones</CardTitle>
                                <CardDescription className="text-sm font-medium">Cronología completa de pedidos y producción.</CardDescription>
                            </div>
                            <Link href="/pedidos/nuevo">
                                <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-1.5 active:scale-95 transition-all">
                                    <Plus className="h-3.5 w-3.5" /> Nuevo Pedido
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {clientOrders.length > 0 ? (
                                <OrdersTable orders={clientOrders} getClientName={getClientName} employees={[]} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                                    <ShoppingBag className="h-20 w-20" />
                                    <div className="text-center">
                                        <p className="font-bold uppercase text-xs tracking-widest">Sin actividad registrada</p>
                                        <p className="text-xs italic mt-1">Este cliente aún no ha realizado transacciones.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
