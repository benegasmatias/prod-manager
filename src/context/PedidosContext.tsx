'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Pedido, ItemPedido, OrderStatus, Priority } from '@/src/types'
import { api } from '@/src/lib/api'
import { useNegocio } from '@/src/context/NegocioContext'
import { useClientes } from '@/src/context/ClientesContext'

interface PedidosContextType {
    pedidos: Record<string, Pedido[]>
    addPedido: (negocioId: string, pedido: Partial<Pedido>) => Promise<void>
    updatePedido: (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => Promise<void>
    removePedido: (negocioId: string, id: string) => Promise<void>
    refresh: () => Promise<void>
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined)

export function PedidosProvider({ children }: { children: React.ReactNode }) {
    const [pedidos, setPedidos] = useState<Record<string, Pedido[]>>({})
    const { negocioActivoId } = useNegocio()
    const { clientes: allClients } = useClientes()

    const mapBackendToFrontend = (order: any): Pedido => {
        const statusMap: Record<string, OrderStatus> = {
            'PENDING': 'Pendiente',
            'IN_PROGRESS': 'En Producción',
            'DONE': 'Terminado',
            'DELIVERED': 'Entregado'
        }

        const now = new Date();
        const dueDate = new Date(order.dueDate);
        const isCompleted = order.status === 'DONE' || order.status === 'DELIVERED';
        const isOverdue = dueDate < now && !isCompleted;

        if (!order.customerId) console.error(`[PedidosContext] Pedido ${order.id} sin customerId`);
        if (!order.clientName) console.error(`[PedidosContext] Pedido ${order.id} sin clientName`);

        const items = order.items?.map((item: any) => ({
            id: item.id,
            nombre: item.name,
            nombreProducto: item.name, // compatibility
            descripcion: item.description,
            cantidad: item.qty,
            quantityProduced: item.doneQty || 0,
            precioUnitario: Number(item.price) || 0,
            senia: Number(item.deposit) || 0,
            url_stl: item.stlUrl,
            peso_gramos: item.weightGrams,
            duracion_estimada_minutos: item.estimatedMinutes,
            demora_estimada_minutos: item.estimatedMinutes // for other rubros
        })) || []

        const totalSenias = items.reduce((acc: number, item: any) => acc + item.senia, 0)
        const total = Number(order.totalPrice) || 0

        return {
            id: order.id,
            negocioId: order.businessId || null,
            numero: order.code || order.id.slice(0, 8),
            clienteId: order.customerId || '',
            clientName: order.clientName || '',
            fechaCreacion: order.createdAt,
            fechaEntrega: order.dueDate,
            estado: statusMap[order.status] || 'Pendiente',
            observaciones: order.notes || '',
            total: total,
            totalPrice: total,
            profit: order.profit || 0,
            totalSenias: totalSenias,
            saldo: total - totalSenias,
            urgencia: isOverdue ? 'VENCIDO' : 'EN TIEMPO',
            items: items
        }
    }

    const refresh = async () => {
        if (!negocioActivoId) return
        try {
            const data: any = await api.orders.getAll({ businessId: negocioActivoId })

            // Agrupar pedidos por businessId real
            const mapped: Record<string, Pedido[]> = data.reduce((acc: any, order: any) => {
                const p = mapBackendToFrontend(order)
                const bId = p.negocioId || 'unassigned'
                if (!acc[bId]) acc[bId] = []
                acc[bId].push(p)
                return acc
            }, {})

            setPedidos(prev => ({ ...prev, ...mapped }))
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const lastFetchedId = useRef<string | null>(null)
    useEffect(() => {
        // Solo refrescar si cambia el id del negocio y no es el que acabamos de pedir
        if (!negocioActivoId || lastFetchedId.current === negocioActivoId) return

        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/login' || path === '/register') return;
        }

        lastFetchedId.current = negocioActivoId
        refresh()
    }, [negocioActivoId])

    const addPedido = async (negocioId: string, data: Partial<Pedido>) => {
        try {
            const clientList = allClients[negocioId] || []
            const client = clientList.find(c => c.id === data.clienteId)
            const resolvedClientName = client ? client.nombre : (data.clientName || 'Cliente Autogenerado')

            await api.orders.create({
                businessId: negocioId,
                customerId: data.clienteId,
                clientName: resolvedClientName,
                dueDate: data.fechaEntrega ? new Date(data.fechaEntrega) : new Date(),
                priority: data.urgencia === 'VENCIDO' ? 10 : (data.urgencia === 'PRÓXIMO' ? 5 : 1),
                notes: data.observaciones,
                items: data.items?.map(i => ({
                    name: i.nombreProducto,
                    description: i.descripcion,
                    // Mapeo flexible para soportar tanto camelCase como snake_case (del config)
                    stlUrl: (i as any).url_stl || i.urlStl,
                    estimatedMinutes: Number((i as any).duracion_estimada_minutos || i.duracionEstimadaMinutos || (i as any).demora_estimada_minutos || 0),
                    weightGrams: Number((i as any).peso_gramos || i.pesoGramos || 0),
                    price: Number(i.precioUnitario || 0),
                    qty: Number(i.cantidad || 1),
                    deposit: Number(i.senia || 0)
                })) || []
            })
            await refresh()
            toast.success(`Pedido guardado correctamente.`)
        } catch (error: any) {
            toast.error('Error al guardar pedido: ' + error.message)
            throw error
        }
    }

    const updatePedido = async (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => {
        // Limited update support in backend currently, but let's try status if it changed
        if (datos.estado) {
            const statusMap: Record<string, string> = {
                'Pendiente': 'PENDING',
                'En Producción': 'IN_PROGRESS',
                'Terminado': 'DONE',
                'Entregado': 'DELIVERED'
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
