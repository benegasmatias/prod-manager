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
    refresh: (q?: string, force?: boolean) => Promise<void>
    loading: boolean
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined)

// Cache global para evitar re-peticiones innecesarias (TTL de 30 segundos)
const CACHE_TTL = 30000;

export function ClientesProvider({ children }: { children: React.ReactNode }) {
    const [clientes, setClientes] = useState<Record<string, Cliente[]>>({})
    const [loading, setLoading] = useState(false)
    const { negocioActivoId } = useNegocio()

    const lastFetchTime = useRef<Record<string, number>>({})
    const pendingRequest = useRef<Promise<any> | null>(null)
    const lastQuery = useRef<string | undefined>('')

    const refresh = useCallback(async (q?: string, force = false) => {
        if (!negocioActivoId) return

        // Si es la misma query y se hizo hace menos de 30s, no repetimos (a menos que sea force)
        const now = Date.now()
        const isSameQuery = lastQuery.current === q
        if (!force && isSameQuery && lastFetchTime.current[negocioActivoId] && (now - lastFetchTime.current[negocioActivoId] < CACHE_TTL)) {
            return
        }

        // De-duplicación de peticiones: si ya hay una igual en curso, esperamos a esa
        if (pendingRequest.current && isSameQuery) {
            return pendingRequest.current
        }

        try {
            setLoading(true)
            lastQuery.current = q

            // Guardamos la promesa en curso
            pendingRequest.current = api.customers.getAll({
                businessId: negocioActivoId,
                q
            })

            const data: any = await pendingRequest.current

            const mappedList = data.items
                ?.map((c: any) => ({
                    id: c.id,
                    negocioId: c.businessId,
                    nombre: c.name,
                    telefono: c.phone || '',
                    email: c.email || '',
                    notas: c.notes || '',
                    createdAt: c.createdAt,
                    totalPedidos: c.totalOrders || 0
                }))
                .filter((c: any) => c.nombre.toUpperCase() !== 'STOCK') || []

            setClientes(prev => ({
                ...prev,
                [negocioActivoId]: mappedList
            }))

            lastFetchTime.current[negocioActivoId] = Date.now()
        } catch (error) {
            console.error('[ClientesContext] Error fetching customers:', error)
        } finally {
            setLoading(false)
            pendingRequest.current = null
        }
    }, [negocioActivoId])

    const pathname = usePathname()

    useEffect(() => {
        if (!negocioActivoId) return
        if (pathname === '/login' || pathname === '/register') return

        const screensThatNeedClientes = ['/clientes', '/pedidos', '/produccion'];
        const isRelevantPath = screensThatNeedClientes.some(p => pathname.startsWith(p));

        if (isRelevantPath) {
            // Solo refrescar si no hay datos o el caché expiró
            const now = Date.now()
            const hasData = !!clientes[negocioActivoId]
            const isExpired = !lastFetchTime.current[negocioActivoId] || (now - lastFetchTime.current[negocioActivoId] > CACHE_TTL)

            if (!hasData || isExpired) {
                refresh()
            }
        }
    }, [negocioActivoId, pathname, refresh]) // Quitamos 'clientes' de dep para evitar loop

    const addCliente = async (negocioId: string, data: Omit<Cliente, 'id' | 'negocioId' | 'createdAt' | 'totalPedidos'>) => {
        try {
            await api.customers.create({
                businessId: negocioId,
                name: data.nombre,
                email: data.email,
                phone: data.telefono,
                notes: data.notas
            })
            await refresh(undefined, true) // Force refresh
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
            await refresh(undefined, true) // Force refresh
            toast.success('Cliente actualizado.')
        } catch (error: any) {
            toast.error('Error al actualizar cliente: ' + error.message)
        }
    }

    const removeCliente = async (negocioId: string, id: string) => {
        try {
            await api.customers.remove(id)
            await refresh(undefined, true)
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
