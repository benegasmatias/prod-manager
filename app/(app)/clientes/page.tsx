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
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Clientes</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Gestión y base de datos de relaciones comerciales</p>
                </div>
                <Button
                    className="h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/20"
                    onClick={handleNewClient}
                >
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-900/20 p-4 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="h-12 w-full rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-950"
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-zinc-900/20 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800/50">
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nombre del Cliente</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contacto</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Teléfono</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Fidelidad</TableHead>
                            <TableHead className="h-14 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length > 0 ? filteredClients.map((client) => (
                            <TableRow key={client.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 border-b border-zinc-50 dark:border-zinc-800/30">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {client.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{client.nombre}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-tighter">Cliente Registrado</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium lowercase">
                                        <Mail className="h-3 w-3 opacity-50" />
                                        {client.email || 'Sin correo'}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                        <Phone className="h-3 w-3 opacity-50" />
                                        {client.telefono || 'Sin teléfono'}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-black text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                                        <DollarSign className="h-3 w-3" /> {client.totalPedidos || 0} PEDIDOS
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-primary shadow-sm transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700" onClick={() => handleEdit(client)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Link href={`/clientes/${client.id}`}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-primary shadow-sm transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                                        <User className="h-8 w-8 opacity-20" />
                                        <p className="text-sm font-medium italic">
                                            {loading ? 'Cargando clientes...' : 'No hay resultados para esta búsqueda'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Grid */}
            <div className="grid grid-cols-1 gap-6 md:hidden">
                {filteredClients.map((client) => (
                    <div key={client.id} className="group relative p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/40 shadow-sm transition-all hover:shadow-md animate-slide-up">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {client.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 dark:text-zinc-100 leading-tight">{client.nombre}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight mt-1">{client.totalPedidos || 0} PEDIDOS REGISTRADOS</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-100 dark:border-zinc-800" onClick={() => handleEdit(client)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3 pb-6 border-b border-zinc-50 dark:border-zinc-800/50">
                            {client.email && (
                                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                                        <Mail className="h-3.5 w-3.5 opacity-50" />
                                    </div>
                                    {client.email}
                                </div>
                            )}
                            {client.telefono && (
                                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                                        <Phone className="h-3.5 w-3.5 opacity-50" />
                                    </div>
                                    {client.telefono}
                                </div>
                            )}
                        </div>

                        <div className="pt-5 flex items-center justify-between">
                            <Link href={`/clientes/${client.id}`} className="flex-1 mr-2">
                                <Button className="w-full h-10 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                                    Ver Expediente <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && !loading && (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-[2rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10">
                        <User className="h-12 w-12 text-zinc-200 dark:text-zinc-800" />
                        <div className="space-y-1">
                            <p className="font-bold text-zinc-400">Sin coincidencias</p>
                            <p className="text-xs text-zinc-500 italic px-6">No encontramos clientes con los criterios de búsqueda actuales.</p>
                        </div>
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
