'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '@/src/lib/api'
import { useNegocio } from '@/src/context/NegocioContext'

import { usePathname } from 'next/navigation'

export interface Cliente {
    id: string
    negocioId: string
    nombre: string
    telefono?: string
    email?: string
    notas?: string
    createdAt: string
    totalPedidos: number
}

interface ClientesContextType {
    clientes: Record<string, Cliente[]>
    addCliente: (negocioId: string, cliente: Omit<Cliente, 'id' | 'negocioId' | 'createdAt' | 'totalPedidos'>) => Promise<void>
    updateCliente: (negocioId: string, id: string, datos: Partial<Omit<Cliente, 'id' | 'negocioId' | 'createdAt'>>) => Promise<void>
    removeCliente: (negocioId: string, id: string) => Promise<void>
    refresh: (q?: string) => Promise<void>
    loading: boolean
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined)

export function ClientesProvider({ children }: { children: React.ReactNode }) {
    const [clientes, setClientes] = useState<Record<string, Cliente[]>>({})
    const [loading, setLoading] = useState(false)
    const { negocioActivoId } = useNegocio()

    const refresh = useCallback(async (q?: string) => {
        if (!negocioActivoId) return

        setLoading(true)
        try {
            const data: any = await api.customers.getAll({
                businessId: negocioActivoId,
                q
            })

            const mappedList = data.items?.map((c: any) => ({
                id: c.id,
                negocioId: c.businessId,
                nombre: c.name,
                telefono: c.phone || '',
                email: c.email || '',
                notas: c.notes || '',
                createdAt: c.createdAt,
                totalPedidos: c.totalOrders || 0
            })) || []

            setClientes(prev => ({
                ...prev,
                [negocioActivoId]: mappedList
            }))
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }, [negocioActivoId])

    const lastFetchedId = useRef<string | null>(null)

    const pathname = usePathname()

    useEffect(() => {
        // Solo refrescar si cambia el negocio o el path, y no es el mismo que ya pedimos (si el path es el mismo)
        if (!negocioActivoId) return

        if (pathname === '/login' || pathname === '/register') return

        // OPTIMIZACIÓN: Solo cargar clientes si estamos en una pantalla que los usa
        const screensThatNeedClientes = ['/clientes', '/pedidos', '/produccion'];
        const isRelevantPath = screensThatNeedClientes.some(p => pathname.startsWith(p));

        if (isRelevantPath) {
            // Si el negocio cambió, reseteamos el lastFetchedId
            lastFetchedId.current = negocioActivoId
            refresh()
        }
    }, [negocioActivoId, pathname, refresh])

    const addCliente = async (negocioId: string, data: Omit<Cliente, 'id' | 'negocioId' | 'createdAt' | 'totalPedidos'>) => {
        try {
            await api.customers.create({
                businessId: negocioId,
                name: data.nombre,
                email: data.email,
                phone: data.telefono,
                notes: data.notas
            })
            await refresh()
            toast.success(`Cliente ${data.nombre} guardado correctamente.`)
        } catch (error: any) {
            toast.error('Error al guardar cliente: ' + error.message)
            throw error
        }
    }

    const updateCliente = async (negocioId: string, id: string, datos: Partial<Omit<Cliente, 'id' | 'negocioId' | 'createdAt'>>) => {
        try {
            await api.customers.update(id, {
                name: datos.nombre,
                email: datos.email,
                phone: datos.telefono,
                notes: datos.notas
            })
            await refresh()
            toast.success('Cliente actualizado.')
        } catch (error: any) {
            toast.error('Error al actualizar cliente: ' + error.message)
        }
    }

    const removeCliente = async (negocioId: string, id: string) => {
        try {
            await api.customers.remove(id)
            await refresh()
            toast.success('Cliente eliminado correctamente.')
        } catch (error: any) {
            toast.error('Error al eliminar cliente: ' + error.message)
        }
    }

    return (
        <ClientesContext.Provider value={{ clientes, addCliente, updateCliente, removeCliente, refresh, loading }}>
            {children}
        </ClientesContext.Provider>
    )
}

export function useClientes() {
    const context = useContext(ClientesContext)
    if (context === undefined) {
        throw new Error('useClientes must be used within a ClientesProvider')
    }
    return context
}
