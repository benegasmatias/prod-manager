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
import { Plus, Search, ExternalLink, Phone, Mail, User, DollarSign, Wallet, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNegocio } from '@/src/context/NegocioContext'
import { useClientes, Cliente } from '@/src/context/ClientesContext'
import { ClienteFormDialog } from '@/src/components/clientes/ClienteFormDialog'

export default function ClientsPage() {
    const { negocioActivoId } = useNegocio()
    const router = useRouter()
    const { clientes, addCliente, updateCliente, removeCliente, refresh, loading } = useClientes()

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
        // Al montar (isFirstRun), si el buscador está vacío NO refrescamos,
        // porque el Context ya se encarga de la carga inicial al entrar a la ruta.
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

    const handleDelete = async (e: React.MouseEvent, client: Cliente) => {
        e.stopPropagation()
        if (window.confirm(`¿Estás seguro de eliminar a ${client.nombre}? Esta acción no se puede deshacer.`)) {
            await removeCliente(negocioActivoId, client.id)
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Relaciones CRM</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Cartera de <span className="text-primary italic">Clientes</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Base de datos centralizada de clientes, historial de pedidos y perfiles de contacto operativo.
                    </p>
                </div>
                <Button
                    className="h-11 px-6 lg:h-12 lg:px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] gap-2"
                    onClick={handleNewClient}
                >
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                </Button>
            </div>

            {/* Dashboard Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <User className="h-20 w-20 text-primary" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Total Clientes</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{currentClients.length}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">Activos</span>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="h-20 w-20 text-emerald-500" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Clientes VIP</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {currentClients.filter(c => c.totalPedidos > 5).length}
                        </h3>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">Recurrentes</span>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Plus className="h-20 w-20 text-blue-500" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Registrados (Mes)</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {currentClients.filter(c => {
                                const d = new Date(c.createdAt);
                                const now = new Date();
                                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                            }).length}
                        </h3>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mb-1">Nuevos</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/70 dark:bg-zinc-900/40 p-4 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors duration-200" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="h-11 w-full rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-950"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-zinc-900/20 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800/50">
                            <TableHead className="h-16 px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Identidad</TableHead>
                            <TableHead className="h-16 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Canal de Contacto</TableHead>
                            <TableHead className="h-16 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Fidelización</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length > 0 ? filteredClients.map((client) => (
                            <TableRow
                                key={client.id}
                                onClick={() => router.push(`/clientes/${client.id}`)}
                                className="group transition-colors hover:bg-zinc-50/30 dark:hover:bg-zinc-900/40 border-b border-zinc-50 dark:border-zinc-800/30 cursor-pointer"
                            >
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                            {client.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{client.nombre}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Activo</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Mail className="h-3 w-3 text-zinc-400" />
                                            {client.email || <span className="text-zinc-300 italic">Sin email</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Phone className="h-3 w-3 text-zinc-400" />
                                            {client.telefono || <span className="text-zinc-300 italic">Sin teléfono</span>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="inline-flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-[10px] font-bold text-primary border border-primary/10">
                                            <DollarSign className="h-3 w-3" /> {client.totalPedidos || 0} PEDIDOS
                                        </div>
                                        {client.totalPedidos > 5 && (
                                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Cliente VIP</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 transition-all">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-primary shadow-sm transition-all border border-transparent hover:border-zinc-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(client);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Link
                                            href={`/clientes/${client.id}`}
                                            prefetch={false}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:text-primary shadow-sm transition-all border border-transparent hover:border-zinc-200">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-rose-900/20 hover:text-rose-500 shadow-sm transition-all border border-transparent hover:border-rose-100"
                                            onClick={(e) => handleDelete(e, client)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="h-16 w-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                                            <User className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                                {loading ? 'Sincronizando clientes...' : 'Sin registros encontrados'}
                                            </p>
                                            <p className="text-xs text-zinc-400 italic">Probá ajustando los términos de búsqueda</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-6 md:hidden">
                {filteredClients.map((client) => (
                    <div key={client.id} className="group relative p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/40 shadow-sm transition-all hover:shadow-xl animate-slide-up">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                    {client.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-primary transition-colors">{client.nombre}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Activo</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-transparent transition-all" onClick={() => handleEdit(client)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-transparent transition-all" onClick={(e) => handleDelete(e, client)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pb-8 mb-8 border-b border-zinc-50 dark:border-zinc-800/50">
                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50/50 dark:bg-zinc-950/50 p-3 rounded-2xl">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                {client.email || <span className="text-zinc-300 italic">Sin datos</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50/50 dark:bg-zinc-950/50 p-3 rounded-2xl">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                {client.telefono || <span className="text-zinc-300 italic">Sin datos</span>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/10 uppercase tracking-widest">
                                {client.totalPedidos || 0} Pedidos
                            </div>
                            <Link href={`/clientes/${client.id}`} prefetch={false} className="flex-1 max-w-[140px]">
                                <Button className="w-full h-11 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 shadow-lg shadow-zinc-900/10 active:scale-95 transition-all">
                                    Expediente
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && !loading && (
                    <div className="py-24 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                            <User className="h-10 w-10 text-zinc-200 dark:text-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Sin coincidencias</p>
                            <p className="text-[11px] text-zinc-400 italic px-10 leading-relaxed">No encontramos clientes con los criterios de búsqueda actuales.</p>
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
