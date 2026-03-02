'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export interface Cliente {
    id: string
    negocioId: string
    nombre: string
    telefono?: string
    email?: string
    notas?: string
    createdAt: string
    totalPedidos: number // For retrocompatibility with the previous UI or tracking
}

interface ClientesContextType {
    clientes: Record<string, Cliente[]>
    addCliente: (negocioId: string, cliente: Omit<Cliente, 'id' | 'negocioId' | 'createdAt' | 'totalPedidos'>) => void
    updateCliente: (negocioId: string, id: string, datos: Partial<Omit<Cliente, 'id' | 'negocioId' | 'createdAt'>>) => void
    removeCliente: (negocioId: string, id: string) => void
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined)

const DEFAULT_CLIENTES: Record<string, Cliente[]> = {
    'n1': [
        { id: 'c1', negocioId: 'n1', nombre: 'Matias Benegas (3D)', email: 'matias@3d.com', telefono: '2641234567', notas: '', totalPedidos: 5, createdAt: new Date().toISOString() },
    ],
    'n2': [
        { id: 'c2', negocioId: 'n2', nombre: 'Metalúrgica San Juan', email: 'vendas@metalsj.com', telefono: '1145678901', notas: '', totalPedidos: 2, createdAt: new Date().toISOString() },
    ]
}

export function ClientesProvider({ children }: { children: React.ReactNode }) {
    const [clientes, setClientes] = useState<Record<string, Cliente[]>>({})
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('prodmanager_clientes_v2')
        if (saved) {
            setClientes(JSON.parse(saved))
        } else {
            setClientes(DEFAULT_CLIENTES)
        }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('prodmanager_clientes_v2', JSON.stringify(clientes))
        }
    }, [clientes, isInitialized])

    const addCliente = (negocioId: string, data: Omit<Cliente, 'id' | 'negocioId' | 'createdAt' | 'totalPedidos'>) => {
        const newCliente: Cliente = {
            ...data,
            id: 'cli-' + Math.random().toString(36).substring(2, 9),
            negocioId,
            totalPedidos: 0,
            createdAt: new Date().toISOString()
        }
        setClientes(prev => ({
            ...prev,
            [negocioId]: [newCliente, ...(prev[negocioId] || [])]
        }))
        toast.success(`Cliente ${data.nombre} guardado correctamente.`)
    }

    const updateCliente = (negocioId: string, id: string, datos: Partial<Omit<Cliente, 'id' | 'negocioId' | 'createdAt'>>) => {
        setClientes(prev => {
            const list = prev[negocioId] || []
            return {
                ...prev,
                [negocioId]: list.map(c => c.id === id ? { ...c, ...datos } : c)
            }
        })
        toast.success('Cliente actualizado.')
    }

    const removeCliente = (negocioId: string, id: string) => {
        setClientes(prev => {
            const list = prev[negocioId] || []
            return {
                ...prev,
                [negocioId]: list.filter(c => c.id !== id)
            }
        })
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
