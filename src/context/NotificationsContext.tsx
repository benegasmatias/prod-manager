'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/src/lib/api'
import { Notification } from '@/src/domain/notifications'
import { useNegocio } from '@/src/context/NegocioContext'
import { toast } from 'react-hot-toast'

interface NotificationsContextType {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    markAsRemoved: (id: string) => Promise<void>
    removeAll: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { negocioActivoId } = useNegocio()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchNotifications = useCallback(async () => {
        if (!negocioActivoId) return

        try {
            setIsLoading(true)
            setError(null)
            const list = await api.notifications.getAll(negocioActivoId)
            const notificationList = list as Notification[]
            setNotifications(notificationList)
            setUnreadCount(notificationList.filter(n => !n.isRead).length)
        } catch (err: any) {
            console.error('Error fetching notifications:', err)
            setError('Error al cargar notificaciones')
        } finally {
            setIsLoading(false)
        }
    }, [negocioActivoId])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))

            await api.notifications.markAsRead(id)
        } catch (err) {
            toast.error('Error al marcar como leída')
            fetchNotifications() // Revert on error
        }
    }

    const markAllAsRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)

            await api.notifications.markAllAsRead(negocioActivoId || undefined)
            toast.success('Todas las notificaciones marcadas como leídas')
        } catch (err) {
            toast.error('Error al marcar todas como leídas')
            fetchNotifications()
        }
    }
    const markAsRemoved = async (id: string) => {
        try {
            // Optimistic update
            const wasUnread = notifications.find(n => n.id === id && !n.isRead)
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }

            await api.notifications.remove(id)
        } catch (err) {
            toast.error('Error al eliminar notificación')
            fetchNotifications()
        }
    }

    const removeAll = async () => {
        try {
            setNotifications([])
            setUnreadCount(0)
            await api.notifications.removeAll(negocioActivoId || undefined)
            toast.success('Todas las notificaciones eliminadas')
        } catch (err) {
            toast.error('Error al eliminar notificaciones')
            fetchNotifications()
        }
    }

    return (
        <NotificationsContext.Provider value={{
            notifications,
            unreadCount,
            isLoading,
            error,
            refresh: fetchNotifications,
            markAsRead,
            markAllAsRead,
            markAsRemoved,
            removeAll
        }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationsContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider')
    }
    return context
}
