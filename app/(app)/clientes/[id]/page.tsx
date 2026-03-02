'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/src/components/OrdersTable'
import { useNegocio } from '@/src/context/NegocioContext'
import { useClientes } from '@/src/context/ClientesContext'
import { usePedidos } from '@/src/context/PedidosContext'

export default function ClientDetailPage() {
    const { id } = useParams()
    const { negocioActivoId } = useNegocio()
    const { clientes } = useClientes()
    const { pedidos } = usePedidos()

    const misClientes = clientes[negocioActivoId] || []
    const misPedidos = pedidos[negocioActivoId] || []

    const client = misClientes.find(c => c.id === id)
    const clientOrders = misPedidos.filter(o => o.clienteId === id)

    const getClientName = (cid: string) => {
        const c = misClientes.find(cli => cli.id === cid)
        return c ? c.nombre : 'Desconocido'
    }

    if (!client) return <div className="p-8 text-center text-zinc-500">Cliente no encontrado</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/clientes">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{client.nombre}</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Datos de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-zinc-400" />
                            <span>{client.email || 'Sin email'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-zinc-400" />
                            <span>{client.telefono || 'Sin teléfono'}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Pedidos</CardTitle>
                            <CardDescription>Lista de todos los pedidos realizados por este cliente.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable orders={clientOrders} getClientName={getClientName} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
