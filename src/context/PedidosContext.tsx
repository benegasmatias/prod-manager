'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Pedido, ItemPedido, OrderStatus, Priority } from '@/src/types'

interface PedidosContextType {
    pedidos: Record<string, Pedido[]>
    addPedido: (negocioId: string, pedido: Omit<Pedido, 'id' | 'negocioId'>) => void
    updatePedido: (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => void
    removePedido: (negocioId: string, id: string) => void
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined)

export function PedidosProvider({ children }: { children: React.ReactNode }) {
    const [pedidos, setPedidos] = useState<Record<string, Pedido[]>>({})
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('prodmanager_pedidos_v2')
        if (saved) {
            setPedidos(JSON.parse(saved))
        } else {
            // Default mock for first time users
            setPedidos({
                'n1': [
                    {
                        id: 'ped-1',
                        negocioId: 'n1',
                        numero: '3D-001',
                        clienteId: 'c1',
                        fechaCreacion: new Date('2023-11-20T10:00:00.000Z').toISOString(),
                        fechaEntrega: new Date('2023-11-25T10:00:00.000Z').toISOString(),
                        estado: 'En Producción',
                        observaciones: 'Imprimir con relleno 20%',
                        total: 4500,
                        totalSenias: 2000,
                        saldo: 2500,
                        urgencia: 'EN TIEMPO',
                        items: [
                            {
                                id: 'item-1',
                                nombreProducto: 'Engranaje Reductor',
                                cantidad: 10,
                                precioUnitario: 450,
                                senia: 2000,
                                urlStl: 'https://drive.google.com/engranaje.stl',
                                pesoGramos: 120,
                                duracionEstimadaMinutos: 180
                            }
                        ]
                    }
                ]
            })
        }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('prodmanager_pedidos_v2', JSON.stringify(pedidos))
        }
    }, [pedidos, isInitialized])

    const addPedido = (negocioId: string, data: Omit<Pedido, 'id' | 'negocioId'>) => {
        const newPedido: Pedido = {
            ...data,
            id: 'ped-' + Math.random().toString(36).substring(2, 9),
            negocioId,
        }
        setPedidos(prev => ({
            ...prev,
            [negocioId]: [newPedido, ...(prev[negocioId] || [])]
        }))
        toast.success(`Pedido ${data.numero} guardado correctamente.`)
    }

    const updatePedido = (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => {
        setPedidos(prev => {
            const list = prev[negocioId] || []
            return {
                ...prev,
                [negocioId]: list.map(p => p.id === id ? { ...p, ...datos } : p)
            }
        })
        toast.success('Pedido actualizado.')
    }

    const removePedido = (negocioId: string, id: string) => {
        setPedidos(prev => {
            const list = prev[negocioId] || []
            return {
                ...prev,
                [negocioId]: list.filter(p => p.id !== id)
            }
        })
    }

    return (
        <PedidosContext.Provider value={{ pedidos, addPedido, updatePedido, removePedido }}>
            {children}
        </PedidosContext.Provider>
    )
}

export function usePedidos() {
    const context = useContext(PedidosContext)
    if (context === undefined) {
        throw new Error('usePedidos must be used within a PedidosProvider')
    }
    return context
}
