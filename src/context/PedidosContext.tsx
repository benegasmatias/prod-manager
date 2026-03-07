'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
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
            demora_estimada_minutos: item.estimatedMinutes, // for other rubros
            metadata: item.metadata || {},
            ...(item.metadata || {}) // Spreading for direct access to config fields
        })) || []

        const totalSenias = items.reduce((acc: number, item: any) => acc + item.senia, 0)
        const total = Number(order.totalPrice) || 0

        return {
            id: order.id,
            negocioId: order.businessId || order.business_id || null,
            numero: order.code || (order.id ? order.id.slice(0, 8) : 'N/A'),
            clienteId: order.customerId || '',
            clientName: order.clientName || '',
            clientPhone: order.customer?.phone,
            fechaCreacion: order.createdAt,
            fechaEntrega: order.dueDate,
            estado: order.status || 'PENDING',
            observaciones: order.notes || '',
            total: total,
            totalPrice: total,
            profit: order.profit || 0,
            totalSenias: totalSenias,
            saldo: total - totalSenias,
            urgencia: isCompleted ? 'LISTO' : (isOverdue ? 'VENCIDO' : 'EN TIEMPO'),
            items: items,
            responsableGeneral: order.responsableGeneral
        }
    }

    const refresh = useCallback(async () => {
        if (!negocioActivoId) return
        try {
            const data: any = await api.orders.getAll({ businessId: negocioActivoId })

            if (!Array.isArray(data)) {
                console.error('[PedidosContext] API returned non-array data:', data);
                return;
            }

            // Agrupar pedidos por businessId real
            const mappedOrders = data.map((order: any) => mapBackendToFrontend(order));

            setPedidos(prev => ({
                ...prev,
                [negocioActivoId]: mappedOrders
            }))
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }, [negocioActivoId])

    const lastFetchedId = useRef<string | null>(null)
    useEffect(() => {
        if (!negocioActivoId) return

        // Refrescamos siempre que cambie el negocio activo para asegurar datos frescos
        refresh()
        lastFetchedId.current = negocioActivoId
    }, [negocioActivoId, refresh])

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
                responsableGeneralId: (data as any).responsableGeneralId || data.responsableGeneral?.id,
                items: data.items?.map(i => {
                    const mappedItem: any = {
                        name: i.nombreProducto || 'Sin nombre',
                        description: i.descripcion,
                        stlUrl: (i as any).url_stl || i.urlStl,
                        estimatedMinutes: Number((i as any).duracion_estimada_minutos || i.duracionEstimadaMinutos || (i as any).demora_estimada_minutos || 0),
                        weightGrams: Number((i as any).peso_gramos || i.pesoGramos || 0),
                        price: Number(i.precioUnitario || 0),
                        qty: Number(i.cantidad || 1),
                        deposit: Number(i.senia || 0),
                        metadata: { ...(i.metadata || {}) }
                    };

                    // Guardar campos dinámicos que no sean los estándar en metadata
                    const standardKeys = [
                        'id', 'nombreProducto', 'descripcion', 'url_stl', 'urlStl',
                        'duracion_estimada_minutos', 'duracionEstimadaMinutos',
                        'demora_estimada_minutos', 'peso_gramos', 'pesoGramos',
                        'precioUnitario', 'cantidad', 'senia', 'metadata'
                    ];

                    Object.keys(i).forEach(key => {
                        if (!standardKeys.includes(key)) {
                            mappedItem.metadata[key] = (i as any)[key];
                        }
                    });

                    return mappedItem;
                }) || []
            })
            await refresh()
            toast.success(`Pedido guardado correctamente.`)
        } catch (error: any) {
            toast.error('Error al guardar pedido: ' + error.message)
            throw error
        }
    }

    const updatePedido = async (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => {
        try {
            const updatePayload: any = {
                status: datos.estado,
                notes: datos.observaciones,
                responsableGeneralId: (datos as any).responsableGeneralId || datos.responsableGeneral?.id
            };

            // Remover campos indefinidos
            Object.keys(updatePayload).forEach(key => {
                if (updatePayload[key] === undefined) delete updatePayload[key];
            });

            if (Object.keys(updatePayload).length > 0) {
                await api.orders.updateStatus(id, updatePayload.status, updatePayload.notes, updatePayload.responsableGeneralId)
                await refresh()
                toast.success('Pedido actualizado.')
            }
        } catch (error: any) {
            toast.error('Error al actualizar pedido: ' + error.message)
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
