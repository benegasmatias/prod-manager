'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Pedido, ItemPedido, OrderStatus, Priority } from '@/src/types'
import { api } from '@/src/lib/api'
import { useNegocio } from '@/src/context/NegocioContext'

interface PedidosContextType {
    pedidos: Record<string, Pedido[]>
    addPedido: (negocioId: string, pedido: Omit<Pedido, 'id' | 'negocioId'>) => Promise<void>
    updatePedido: (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => Promise<void>
    removePedido: (negocioId: string, id: string) => Promise<void>
    refresh: () => Promise<void>
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined)

export function PedidosProvider({ children }: { children: React.ReactNode }) {
    const [pedidos, setPedidos] = useState<Record<string, Pedido[]>>({})
    const { negocioActivoId } = useNegocio()

    const mapBackendToFrontend = (order: any): Pedido => {
        const statusMap: Record<string, OrderStatus> = {
            'PENDING': 'Pendiente',
            'IN_PROGRESS': 'En Producción',
            'DONE': 'Terminado'
        }

        return {
            id: order.id,
            negocioId: order.businessId || null,
            numero: order.code || order.id.slice(0, 8),
            clienteId: order.customerId || 'c1',
            clientName: order.clientName || 'Cliente Genérico',
            fechaCreacion: order.createdAt,
            fechaEntrega: order.dueDate,
            estado: statusMap[order.status] || 'Pendiente',
            observaciones: order.notes || '',
            total: Number(order.totalPrice) || 0,
            totalPrice: Number(order.totalPrice) || 0, // for compatibility
            profit: Number(order.totalPrice) * 0.3, // Mock profit for now (30%)
            totalSenias: 0,
            saldo: Number(order.totalPrice) || 0,
            urgencia: order.priority > 5 ? 'VENCIDO' : 'EN TIEMPO',
            items: order.items?.map((item: any) => ({
                id: item.id,
                nombreProducto: item.name,
                descripcion: item.description,
                cantidad: item.qty,
                quantityProduced: item.doneQty || 0,
                precioUnitario: Number(item.price) || 0,
                senia: 0,
                urlStl: item.stlUrl,
                pesoGramos: item.weightGrams,
                duracionEstimadaMinutos: item.estimatedMinutes
            })) || []
        }
    }

    const refresh = async () => {
        try {
            const data: any = await api.orders.getAll()

            // Agrupar pedidos por businessId real
            const mapped: Record<string, Pedido[]> = data.reduce((acc: any, order: any) => {
                const p = mapBackendToFrontend(order)
                const bId = p.negocioId || 'unassigned'
                if (!acc[bId]) acc[bId] = []
                acc[bId].push(p)
                return acc
            }, {})

            setPedidos(mapped)
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/login' || path === '/register') return;
        }
        refresh()
    }, [negocioActivoId])

    const addPedido = async (negocioId: string, data: Omit<Pedido, 'id' | 'negocioId'>) => {
        try {
            await api.orders.create({
                clientName: 'Cliente API', // Should ideally come from data or clienteId mapping
                dueDate: new Date(data.fechaEntrega),
                priority: data.urgencia === 'VENCIDO' ? 10 : 1,
                items: data.items.map(i => ({
                    name: i.nombreProducto,
                    description: i.descripcion,
                    stlUrl: i.urlStl,
                    estimatedMinutes: i.duracionEstimadaMinutos || 0,
                    weightGrams: i.pesoGramos || 0,
                    price: i.precioUnitario,
                    qty: i.cantidad
                }))
            })
            await refresh()
            toast.success(`Pedido guardado correctamente.`)
        } catch (error: any) {
            toast.error('Error al guardar pedido: ' + error.message)
        }
    }

    const updatePedido = async (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => {
        // Limited update support in backend currently, but let's try status if it changed
        if (datos.estado) {
            const statusMap: Record<string, string> = {
                'Pendiente': 'PENDING',
                'En Producción': 'IN_PROGRESS',
                'Terminado': 'DONE'
            }
            try {
                await api.orders.updateStatus(id, statusMap[datos.estado], datos.observaciones)
                await refresh()
                toast.success('Estado actualizado.')
            } catch (error: any) {
                toast.error('Error al actualizar estado: ' + error.message)
            }
        }
    }

    const removePedido = async (negocioId: string, id: string) => {
        toast.error('La eliminación de pedidos no está activa para evitar pérdida de datos reales.')
    }

    return (
        <PedidosContext.Provider value={{ pedidos, addPedido, updatePedido, removePedido, refresh }}>
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
