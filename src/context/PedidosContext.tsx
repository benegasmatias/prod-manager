'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Pedido, ItemPedido, OrderStatus, Priority } from '@/src/types'
import { api } from '@/src/lib/api'
import { useNegocio } from '@/src/context/NegocioContext'
import { usePathname } from 'next/navigation'
import { useClientes } from '@/src/context/ClientesContext'

interface PedidosContextType {
    pedidos: Record<string, Pedido[]>
    addPedido: (negocioId: string, pedido: Partial<Pedido>) => Promise<void>
    updatePedido: (negocioId: string, id: string, datos: Partial<Omit<Pedido, 'id' | 'negocioId'>>) => Promise<void>
    removePedido: (negocioId: string, id: string) => Promise<void>
    registerPayment: (id: string, amount: number, method: string) => Promise<void>
    refresh: (force?: boolean) => Promise<void>
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined)

const mapBackendToFrontend = (order: any): Pedido => {
    const now = new Date();
    const dueDate = order.dueDate ? new Date(order.dueDate) : null;
    const isCompleted = order.status === 'DONE' || order.status === 'DELIVERED';
    const isOverdue = dueDate && dueDate < now && !isCompleted;

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
        ...(item.metadata || {})
    })) || []

    const totalSenias = items.reduce((acc: number, item: any) => acc + item.senia, 0)
    const total = Number(order.totalPrice) || 0

    return {
        id: order.id,
        negocioId: order.businessId || null,
        numero: order.code || (order.id ? order.id.slice(0, 8) : 'N/A'),
        clienteId: order.customerId || '',
        clientName: order.clientName || '',
        clientPhone: order.customer?.phone,
        fechaCreacion: order.createdAt,
        fechaEntrega: order.dueDate,
        fechaActualizacion: order.updatedAt || order.createdAt,
        estado: order.status || 'PENDING',
        type: (order.type === 'STOCK' || (order.clientName && order.clientName.trim().toUpperCase() === 'STOCK')) ? 'STOCK' : 'CUSTOMER',
        observaciones: order.notes || '',
        total,
        totalPrice: total,
        profit: order.profit || 0,
        totalSenias,
        saldo: total - totalSenias,
        urgencia: isCompleted ? 'LISTO' : (isOverdue ? 'VENCIDO' : 'EN TIEMPO'),
        items,
        responsableGeneral: order.responsableGeneral,
    }
}

export function PedidosProvider({ children }: { children: React.ReactNode }) {
    const [pedidos, setPedidos] = useState<Record<string, Pedido[]>>({})
    const { negocioActivoId } = useNegocio()

    const isFetching = useRef(false)
    const lastFetchTime = useRef<Record<string, number>>({})

    const refresh = useCallback(async (force = false) => {
        if (!negocioActivoId || isFetching.current) return

        const now = Date.now()
        // Cache de 30 segundos si no es forzado
        if (!force && lastFetchTime.current[negocioActivoId] && (now - lastFetchTime.current[negocioActivoId] < 30000)) {
            return
        }

        try {
            isFetching.current = true
            const data: any = await api.orders.getAll({ businessId: negocioActivoId })

            if (Array.isArray(data)) {
                const mappedOrders = data.map((order: any) => mapBackendToFrontend(order))
                setPedidos(prev => ({
                    ...prev,
                    [negocioActivoId]: mappedOrders
                }))
                lastFetchTime.current[negocioActivoId] = now
            }
        } catch (error) {
            console.error('[PedidosContext] Error fetching orders:', error)
        } finally {
            isFetching.current = false
        }
    }, [negocioActivoId])

    const pathname = usePathname()

    useEffect(() => {
        if (!negocioActivoId) return
        if (pathname === '/login' || pathname === '/register') return

        const screensThatNeedOrders = ['/pedidos', '/produccion', '/reportes', '/stock'];
        const isRelevantPath = screensThatNeedOrders.some(p => pathname.startsWith(p));

        if (isRelevantPath) {
            // Solo cargar si no hay nada o pasaron más de 30s
            const now = Date.now()
            const shouldRefresh = !pedidos[negocioActivoId] ||
                (lastFetchTime.current[negocioActivoId] && (now - lastFetchTime.current[negocioActivoId] > 30000))

            if (shouldRefresh) {
                refresh()
            }
        }
    }, [negocioActivoId, pathname, refresh]) // Quitamos 'pedidos' de deps para evitar bucle

    const addPedido = async (negocioId: string, data: Partial<Pedido>) => {
        try {
            await api.orders.create({
                businessId: negocioId,
                customerId: data.clienteId,
                clientName: data.clientName,
                totalPrice: data.total,
                status: data.estado || 'PENDING',
                dueDate: data.fechaEntrega,
                notes: data.observaciones,
                type: data.type,
                items: data.items?.map(i => {
                    const mappedItem: any = {
                        name: i.nombreProducto,
                        description: i.descripcion,
                        stlUrl: i.urlStl,
                        estimatedMinutes: Number(i.duracionEstimadaMinutos || 0),
                        weightGrams: Number(i.pesoGramos || 0),
                        price: Number(i.precioUnitario || 0),
                        qty: Number(i.cantidad || 1),
                        deposit: Number(i.senia || 0),
                        metadata: { ...(i.metadata || {}) }
                    };

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
            await refresh(true)
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

            Object.keys(updatePayload).forEach(key => {
                if (updatePayload[key] === undefined) delete updatePayload[key];
            });

            if (Object.keys(updatePayload).length > 0) {
                await api.orders.updateStatus(id, {
                    status: updatePayload.status,
                    notes: updatePayload.notes,
                    responsableGeneralId: updatePayload.responsableGeneralId
                })
                await refresh(true)
                toast.success('Pedido actualizado.')
            }
        } catch (error: any) {
            toast.error('Error al actualizar pedido: ' + error.message)
        }
    }

    const removePedido = async (negocioId: string, id: string) => {
        toast.error('La eliminación de pedidos no está activa.')
    }

    const registerPayment = async (id: string, amount: number, method: string) => {
        try {
            await api.orders.addPayment(id, { amount, method })
            await refresh(true)
            toast.success('Pago registrado correctamente.')
        } catch (error: any) {
            toast.error('Error al registrar pago: ' + error.message)
            throw error
        }
    }

    return (
        <PedidosContext.Provider value={{ pedidos, addPedido, updatePedido, removePedido, registerPayment, refresh }}>
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
