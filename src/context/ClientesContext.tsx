'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '@/src/lib/api'

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
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined)

export function ClientesProvider({ children }: { children: React.ReactNode }) {
    const [clientes, setClientes] = useState<Record<string, Cliente[]>>({})

    const refreshClientes = async () => {
        try {
            const data: any = await api.customers.getAll()
            // Map the flat list from backend into the Record<negocioId, Cliente[]> structure
            // For now, since backend doesn't have negocioId, we put them all in 'n1' (or whatever business is active)
            // Ideally backend should support this, but we'll map them for compatibility
            const mapped: Record<string, Cliente[]> = {
                'n1': data.items?.map((c: any) => ({
                    id: c.id,
                    negocioId: 'n1',
                    nombre: c.name,
                    telefono: c.phone || '',
                    email: c.email || '',
                    notas: c.notes || '',
                    createdAt: c.createdAt,
                    totalPedidos: c.orders?.length || 0
                })) || []
            }
            setClientes(mapped)
        } catch (error) {
            console.error('Error fetching customers:', error)
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/login' || path === '/register') return;
        }
        refreshClientes()
    }, [])

    const addCliente = async (negocioId: string, data: Omit<Cliente, 'id' | 'negocioId' | 'createdAt' | 'totalPedidos'>) => {
        try {
            await api.customers.create({
                name: data.nombre,
                email: data.email,
                phone: data.telefono,
                notes: data.notas
            })
            await refreshClientes()
            toast.success(`Cliente ${data.nombre} guardado correctamente.`)
        } catch (error: any) {
            toast.error('Error al guardar cliente: ' + error.message)
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
            await refreshClientes()
            toast.success('Cliente actualizado.')
        } catch (error: any) {
            toast.error('Error al actualizar cliente: ' + error.message)
        }
    }

    const removeCliente = async (negocioId: string, id: string) => {
        // Missing DELETE endpoint in backend for now, ignoring for safety
        toast.error('La eliminación de clientes no está implementada en el backend aún.')
    }

    return (
        <ClientesContext.Provider value={{ clientes, addCliente, updateCliente, removeCliente }}>
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
