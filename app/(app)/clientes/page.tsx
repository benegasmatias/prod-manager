'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/src/components/ui/table'
import { Button } from '@/src/components/ui/button'
import { Plus, Search, ExternalLink, Phone, Mail, User, DollarSign, Wallet, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useNegocio } from '@/src/context/NegocioContext'
import { useClientes, Cliente } from '@/src/context/ClientesContext'
import { ClienteFormDialog } from '@/src/components/clientes/ClienteFormDialog'

export default function ClientsPage() {
    const { negocioActivoId } = useNegocio()
    const { clientes, addCliente, updateCliente, refresh, loading } = useClientes()

    // Lst de clientes para este negocio usando useMemo
    const currentClients = useMemo(() => {
        return clientes[negocioActivoId] || []
    }, [clientes, negocioActivoId])

    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Cliente | null>(null)

    const isFirstRun = useRef(true)

    // Buscador con Debounce para el backend
    useEffect(() => {
        // Evitar doble fetch al montar si el buscador está vacío (ya lo hace el Context)
        if (isFirstRun.current) {
            isFirstRun.current = false
            if (!searchTerm) return
        }

        const timer = setTimeout(() => {
            refresh(searchTerm)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm, refresh])

    const filteredClients = currentClients

    const handleEdit = (client: Cliente) => {
        setEditingClient(client)
        setIsFormOpen(true)
    }

    const handleNewClient = () => {
        setEditingClient(null)
        setIsFormOpen(true)
    }

    const handleSaveCliente = (data: any) => {
        if (editingClient) {
            return updateCliente(negocioActivoId, editingClient.id, data)
        }
        return addCliente(negocioActivoId, data)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Base de datos de clientes.</p>
                </div>
                <Button className="gap-2 w-full sm:w-auto" onClick={handleNewClient}>
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                </Button>
            </div>

            <div className="flex max-w-full sm:max-w-sm items-center gap-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar cliente..."
                        className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Pedidos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length > 0 ? filteredClients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.nombre}</TableCell>
                                <TableCell className="text-zinc-500">{client.email || '-'}</TableCell>
                                <TableCell className="text-zinc-500">{client.telefono || '-'}</TableCell>
                                <TableCell>
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                        {client.totalPedidos || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => handleEdit(client)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Link href={`/clientes/${client.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                    {loading ? 'Cargando clientes...' : 'No hay clientes registrados o que coincidan con la búsqueda.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Grid */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredClients.map((client) => (
                    <div key={client.id} className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <User className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{client.nombre}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{client.totalPedidos || 0} PEDIDOS</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(client)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Link href={`/clientes/${client.id}`}>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                            {client.email && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Mail className="h-3 w-3" />
                                    {client.email}
                                </div>
                            )}
                            {client.telefono && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Phone className="h-3 w-3" />
                                    {client.telefono}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredClients.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 border border-dashed rounded-lg">
                        {loading ? 'Cargando...' : 'No hay resultados.'}
                    </div>
                )}
            </div>

            <ClienteFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSave={handleSaveCliente}
                initialData={editingClient}
            />
        </div>
    )
}
