'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Pedido, Employee } from '@/src/types'
import { Card, CardContent } from '@/src/components/ui/card'
import { BadgeUrgencia } from '@/src/components/BadgeUrgencia'
import { Money } from '@/src/components/Money'
import { usePedidos } from '../context/PedidosContext'
import { useNegocio } from '../context/NegocioContext'
import { OrderStatusModal } from './OrderStatusModal'
import { Plus, ChevronLeft, ChevronRight, Eye, EyeOff, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { getStatusLabel, getStatusStyles, getStatusColorBase } from '@/src/domain/negocio'

interface OrdersKanbanProps {
    orders: Pedido[]
    employees: Employee[]
}

export function OrdersKanban({ orders, employees }: OrdersKanbanProps) {
    const { negocioActivoId, config, negocioActivo } = useNegocio()
    const rubro = negocioActivo?.rubro;
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)
    const [isFailureRequested, setIsFailureRequested] = useState(false)
    const [hideEmpty, setHideEmpty] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set())

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const scrollSpeedRef = useRef(0)
    // Synchronize for visual indicators
    const [visualSpeed, setVisualSpeed] = useState(0)

    const COLUMNS = config.productionStages;
    const isManyColumns = COLUMNS.length > 6;

    const toggleCollapse = (key: string) => {
        const next = new Set(collapsedStages);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setCollapsedStages(next);
    }

    const scrollToStage = (key: string) => {
        const element = document.getElementById(`lane-${key}`);
        if (element && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const left = element.offsetLeft - container.offsetLeft - 24;
            container.scrollTo({ left, behavior: 'smooth' });
        }
    }

    const collapseAll = () => setCollapsedStages(new Set(COLUMNS.map(c => c.key)));
    const expandAll = () => setCollapsedStages(new Set());

    useEffect(() => {
        let animationId: number;

        const performScroll = () => {
            if (scrollContainerRef.current && scrollSpeedRef.current !== 0) {
                scrollContainerRef.current.scrollLeft += scrollSpeedRef.current;
            }
            animationId = requestAnimationFrame(performScroll);
        };

        animationId = requestAnimationFrame(performScroll);
        return () => cancelAnimationFrame(animationId);
    }, []);

    const checkScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 10)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }, [])

    const handleScrollDetection = useCallback((clientX: number) => {
        if (!scrollContainerRef.current) return;
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;

        const edgeSize = 180;
        let newSpeed = 0;

        if (x < edgeSize) {
            const factor = Math.max(0, (edgeSize - x) / edgeSize);
            newSpeed = -Math.pow(factor, 1.2) * 45;
        } else if (x > width - edgeSize) {
            const factor = Math.max(0, (x - (width - edgeSize)) / edgeSize);
            newSpeed = Math.pow(factor, 1.2) * 45;
        }

        if (scrollSpeedRef.current !== newSpeed) {
            scrollSpeedRef.current = newSpeed;
            setVisualSpeed(newSpeed); // Only for indicators
        }
    }, [])

    const handleMouseMove = (e: React.MouseEvent) => {
        handleScrollDetection(e.clientX);
    };

    const handleMouseLeave = () => {
        scrollSpeedRef.current = 0;
        setVisualSpeed(0);
    };

    useEffect(() => {
        const container = scrollContainerRef.current
        if (container) {
            container.addEventListener('scroll', checkScroll)
            window.addEventListener('resize', checkScroll)
            checkScroll()
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScroll)
            }
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll])

    useEffect(() => {
        const handleGlobalDragOver = (e: DragEvent) => {
            if (isDragging) handleScrollDetection(e.clientX);
        };
        const handleGlobalDragEnd = () => {
            setIsDragging(false);
            scrollSpeedRef.current = 0;
            setVisualSpeed(0);
        };

        if (isDragging) {
            window.addEventListener('dragover', handleGlobalDragOver);
            window.addEventListener('dragend', handleGlobalDragEnd);
            window.addEventListener('drop', handleGlobalDragEnd);
        }
        return () => {
            window.removeEventListener('dragover', handleGlobalDragOver);
            window.removeEventListener('dragend', handleGlobalDragEnd);
            window.removeEventListener('drop', handleGlobalDragEnd);
        };
    }, [isDragging, handleScrollDetection]);

    const handleStatusChangeClick = (order: Pedido) => {
        // ... existing logic ...
        setIsFailureRequested(false)
        setSelectedOrder(order)
        setIsStatusModalOpen(true)
    }

    const onDragStart = (e: React.DragEvent, orderId: string) => {
        e.dataTransfer.setData('orderId', orderId)
        e.dataTransfer.effectAllowed = 'move'
        setIsDragging(true)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        handleScrollDetection(e.clientX)
    }

    const onDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()
        setIsDragging(false)
        scrollSpeedRef.current = 0;
        setVisualSpeed(0);
        const orderId = e.dataTransfer.getData('orderId')
        if (orderId) {
            const order = orders.find(o => o.id === orderId)
            if (order) {
                // If dropping into the same column, do nothing
                if (order.estado === newStatus) return;

                // Si arrastramos a una columna de fallo, activamos el modo automáticamente
                const isDroppingToFailure = newStatus === 'FAILED' || newStatus === 'REPRINT_PENDING' || newStatus === 'RE_WORK'
                setIsFailureRequested(isDroppingToFailure)

                // Pre-set the status the user dropped into
                setSelectedOrder({ ...order, estado: newStatus })
                setIsStatusModalOpen(true)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Stage Navigator - Jump to logic */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 no-scrollbar max-w-[calc(100vw-2rem)] sm:max-w-none">
                    {COLUMNS.map(col => {
                        const count = orders.filter(o => o.estado === col.key).length;
                        return (
                            <button
                                key={col.key}
                                onClick={() => scrollToStage(col.key)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                    count > 0 ? "border-primary/40 bg-primary/5 text-primary" : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                                )}
                            >
                                <span className={cn("w-1.5 h-1.5 rounded-full", col.color.replace('border-', 'bg-'))} />
                                {col.label}
                                <span className="opacity-50">{count}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHideEmpty(!hideEmpty)}
                        className="rounded-xl h-8 px-3 gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                        {hideEmpty ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {hideEmpty ? 'Mostrar Vacíos' : 'Ocultar Vacíos'}
                    </Button>
                    <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={collapsedStages.size > 0 ? expandAll : collapseAll}
                        className="rounded-xl h-8 px-3 gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                        {collapsedStages.size > 0 ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                        {collapsedStages.size > 0 ? 'Expandir' : 'Contraer'}
                    </Button>
                </div>
            </div>

            <div className="relative group/kanban overflow-visible">
                {/* Floating Navigation Controls - Senior UX */}
                <div className="absolute top-[300px] left-2 z-[200] pointer-events-none hidden sm:flex items-center">
                    <button
                        onClick={() => scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                        className={cn(
                            "p-4 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-all pointer-events-auto hover:scale-110 active:scale-95 group/btn",
                            canScrollLeft ? "opacity-100 translate-x-0 cursor-pointer" : "opacity-0 -translate-x-full"
                        )}
                    >
                        <ChevronLeft className={cn(
                            "h-7 w-7 text-zinc-500 transition-colors group-hover/btn:text-primary",
                            visualSpeed < 0 && "text-primary animate-pulse"
                        )} />
                    </button>
                </div>

                <div className="absolute top-[300px] right-2 z-[200] pointer-events-none hidden sm:flex items-center">
                    <button
                        onClick={() => scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                        className={cn(
                            "p-4 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-all pointer-events-auto hover:scale-110 active:scale-95 group/btn",
                            canScrollRight ? "opacity-100 translate-x-0 cursor-pointer" : "opacity-0 translate-x-full"
                        )}
                    >
                        <ChevronRight className={cn(
                            "h-7 w-7 text-zinc-500 transition-colors group-hover/btn:text-primary",
                            visualSpeed > 0 && "text-primary animate-pulse"
                        )} />
                    </button>
                </div>

                <div
                    ref={scrollContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onDragOver={onDragOver}
                    className={cn(
                        "flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide select-none",
                        // Disable snap while scrolling programmatically to avoid snap fighting
                        visualSpeed === 0 ? "snap-x snap-mandatory lg:snap-none" : "snap-none"
                    )}
                >
                    {COLUMNS.map((col) => {
                        const columnOrders = orders.filter((o) => o.estado === col.key)
                        if (hideEmpty && columnOrders.length === 0) return null;
                        const isCollapsed = collapsedStages.has(col.key);

                        return (
                            <div
                                key={col.key}
                                id={`lane-${col.key}`}
                                className={cn(
                                    "flex shrink-0 flex-col gap-4 snap-center transition-all duration-500",
                                    isCollapsed
                                        ? "w-16 sm:w-20"
                                        : (isManyColumns
                                            ? "w-[75vw] sm:w-[260px] lg:min-w-[240px] lg:max-w-[280px]"
                                            : "w-[85vw] sm:w-[320px] lg:min-w-[280px] lg:max-w-[320px]")
                                )}
                            >
                                <div
                                    className="flex items-center justify-between px-3 cursor-pointer select-none group/header"
                                    onClick={() => toggleCollapse(col.key)}
                                >
                                    <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
                                        <h3 className={cn(
                                            "text-xs font-black uppercase tracking-[0.2em] text-zinc-500 transition-all",
                                            isCollapsed && "rotate-180 [writing-mode:vertical-lr] py-4 h-40",
                                            columnOrders.length > 0 ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
                                        )}>
                                            {getStatusLabel(col.key, rubro)}
                                        </h3>
                                        <span className="flex items-center justify-center h-5 px-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 tabular-nums">
                                            {columnOrders.length}
                                        </span>
                                    </div>
                                    {!isCollapsed && (
                                        <div className="opacity-0 group-hover/header:opacity-100 transition-opacity">
                                            <ChevronLeft className="h-4 w-4 text-zinc-400" />
                                        </div>
                                    )}
                                </div>

                                <div
                                    className={cn(
                                        "flex h-full min-h-[600px] flex-col gap-4 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 transition-all duration-500 group/column",
                                        isCollapsed ? "p-1 overflow-hidden opacity-30 grayscale hover:opacity-100 hover:grayscale-0" : "p-3"
                                    )}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, col.key)}
                                >
                                    {!isCollapsed ? (
                                        <>
                                            {columnOrders.map((order) => (
                                                <Card
                                                    key={order.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, order.id)}
                                                    className="cursor-grab active:cursor-grabbing hover:border-primary/30 dark:hover:border-primary/20 transition-all shadow-sm rounded-2xl border-zinc-200/60 dark:border-zinc-800/50 overflow-hidden group/card relative"
                                                >
                                                    <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", getStatusColorBase(col.key, rubro))} />
                                                    <CardContent className="p-4 space-y-4 pointer-events-none">
                                                        <div className="flex items-start justify-between">
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest tabular-nums italic">#{order.numero}</span>
                                                            <BadgeUrgencia urgencia={order.urgencia} />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate leading-tight">{order.clientName}</p>
                                                        </div>

                                                        <div className="space-y-1.5 text-[11px] font-bold text-zinc-500">
                                                            {order.items.slice(0, 2).map(item => (
                                                                <div key={item.id} className="flex justify-between items-center">
                                                                    <span className="truncate mr-2">• {item.nombreProducto}</span>
                                                                    <span className="text-zinc-400 shrink-0">{item.cantidad}u</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 dark:border-zinc-800/50 mt-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Entrega</span>
                                                                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 italic">
                                                                    {new Date(order.fechaEntrega).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                {order.responsableGeneral && (
                                                                    <div className="flex items-center gap-1 mb-1">
                                                                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-black text-primary uppercase">
                                                                            {order.responsableGeneral.firstName[0]}
                                                                        </div>
                                                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">
                                                                            {order.responsableGeneral.firstName}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <Money amount={order.totalPrice} className="text-xs font-black text-zinc-950 dark:text-zinc-50 tabular-nums" />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <div className="px-4 pb-4 mt-[-8px] opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-auto">
                                                        <div
                                                            className="w-full text-[10px] font-black uppercase tracking-tight rounded-xl px-2 py-2 border shadow-sm outline-none bg-white dark:bg-zinc-900 cursor-pointer text-center hover:bg-zinc-100 transition-all"
                                                            onClick={() => handleStatusChangeClick(order)}
                                                        >
                                                            Cambiar Estado / Responsable
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                            {columnOrders.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 opacity-50 group-hover/column:opacity-100 transition-opacity">
                                                    <Plus className="h-4 w-4 text-zinc-300 dark:text-zinc-700 mb-1" />
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Vacío</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 pt-4">
                                            {columnOrders.map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    <OrderStatusModal
                        order={selectedOrder}
                        isOpen={isStatusModalOpen}
                        onClose={() => setIsStatusModalOpen(false)}
                        employees={employees}
                        defaultFailureMode={isFailureRequested}
                    />
                </div>
            </div>
        </div>
    )
}
