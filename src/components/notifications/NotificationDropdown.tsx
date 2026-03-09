'use client'

import React from 'react'
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2, MoreVertical, ExternalLink, Loader2, Trash2, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu"
import { Button } from '@/src/components/ui/button'
import { useNotifications } from '@/src/context/NotificationsContext'
import { cn } from '@/src/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { NotificationType } from '@/src/domain/notifications'

export function NotificationDropdown() {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        markAsRemoved,
        removeAll,
        refresh
    } = useNotifications()


    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            case 'error': return <AlertCircle className="h-4 w-4 text-rose-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <DropdownMenu onOpenChange={(open) => open && refresh()}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl relative hover:bg-zinc-100 dark:hover:bg-zinc-900 group">
                    <Bell className={cn(
                        "h-4 w-4 text-zinc-500 group-hover:scale-110 transition-transform",
                        unreadCount > 0 && "animate-pulse text-primary"
                    )} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary border-2 border-white dark:border-zinc-950 text-[9px] font-black text-white px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] rounded-[2rem] border-zinc-200 dark:border-zinc-800 shadow-2xl p-0 overflow-hidden mt-1">
                <div className="p-6 pb-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Notificaciones</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Alertas y Comunicados</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                markAllAsRead()
                            }}
                            className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 rounded-xl px-3"
                        >
                            <Check className="h-3 w-3 mr-1.5" />
                            Marcar todo como leído
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cargando...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                            <div className="h-16 w-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                                <Bell className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-tight text-zinc-400">No tenés notificaciones</p>
                                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Todo está al día por ahora</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-5 transition-all relative flex gap-4 group",
                                        !n.isRead ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                                    )}
                                >
                                    <div className="mt-1 shrink-0">
                                        <div className={cn(
                                            "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm",
                                            !n.isRead ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-950"
                                        )}>
                                            {getIcon(n.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1.5 pr-2">
                                        <div className="flex items-start justify-between">
                                            <h4 className={cn(
                                                "text-xs font-black tracking-tight leading-tight uppercase",
                                                !n.isRead ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500"
                                            )}>
                                                {n.title}
                                            </h4>
                                            <div className="flex items-center gap-3 ml-2 shrink-0">
                                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsRemoved(n.id)
                                                    }}
                                                    className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-300 hover:text-rose-500 transition-all opacity-40 group-hover:opacity-100"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>

                                            </div>
                                        </div>
                                        <p className={cn(
                                            "text-[11px] font-medium leading-relaxed italic",
                                            !n.isRead ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-400"
                                        )}>
                                            {n.message}
                                        </p>

                                        {(n.actionUrl || !n.isRead) && (
                                            <div className="flex gap-3 pt-2">
                                                {n.actionUrl && (
                                                    <Link href={n.actionUrl} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                                        {n.actionLabel || 'Ver más'}
                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                    </Link>
                                                )}
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            markAsRead(n.id)
                                                        }}
                                                        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
                                                    >
                                                        Marcar como leída
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                    {!n.isRead && (
                                        <div className="absolute top-5 right-4 h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                    <Button variant="ghost" className="flex-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 h-9 rounded-xl">
                        Historial
                    </Button>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.preventDefault()
                                removeAll()
                            }}
                            className="flex-1 text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-9 rounded-xl"
                        >
                            Limpiar Todo
                        </Button>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
