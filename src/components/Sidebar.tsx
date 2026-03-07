'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/lib/utils'
import { useNegocio } from '@/src/context/NegocioContext'
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Wrench,
    Cpu,
    BarChart3,
    Settings,
    Package,
    Layers,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Box,
    Printer,
    FileText,
    Cog,
    Grid,
    ClipboardList,
    Hammer,
    Trees,
    Clock,
    HardHat
} from 'lucide-react'
import { Button } from './ui/button'
import { useSidebar } from '@/src/context/SidebarContext'

const ICON_MAP: Record<string, any> = {
    LayoutDashboard, ShoppingCart, Users, Wrench, Cpu, BarChart3, Settings,
    Package, Layers, Box, Printer, FileText, Cog, Grid, ClipboardList,
    Hammer, Trees, Clock, HardHat
}

const MENU_ITEMS_CORE = [
    { label: 'Panel', href: '/dashboard', iconKey: 'LayoutDashboard' },
    { label: 'Pedidos', href: '/pedidos', iconKey: 'pedidos' },
    { label: 'Clientes', href: '/clientes', iconKey: 'Users' },
    { label: 'Personal', href: '/personal', iconKey: 'HardHat' },
]

const MENU_ITEMS_PROD = [
    { label: 'Producción', href: '/produccion', iconKey: 'produccion' },
    { label: 'Máquinas', href: '/maquinas', iconKey: 'maquinas' },
    { label: 'Materiales', href: '/materiales', iconKey: 'materiales' },
]

const MENU_ITEMS_SYSTEM = [
    { label: 'Reportes', href: '/reportes', iconKey: 'BarChart3' },
    { label: 'Ajustes', href: '/ajustes', iconKey: 'Settings' },
]

interface SidebarItemProps {
    item: { label: string, href: string, icon: any }
    isActive: boolean
    isCollapsed: boolean
    onItemClick?: () => void
}

function SidebarItem({ item, isActive, isCollapsed, onItemClick }: SidebarItemProps) {
    const Icon = item.icon
    return (
        <Link
            href={item.href}
            onClick={onItemClick}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
        >
            <Icon className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50"
            )} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
            {isActive && !isCollapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white opacity-60" />
            )}
        </Link>
    )
}

export function SidebarContent({ onItemClick, isCollapsed = false }: { onItemClick?: () => void, isCollapsed?: boolean }) {
    const pathname = usePathname()
    const { config, negocioActivo } = useNegocio()

    if (!negocioActivo) return null

    const filterAndMap = (items: any[]) =>
        items.filter(item => config.sidebarItems.includes(item.href))
            .map(item => {
                // Determine Label
                let label = item.label
                if (item.href === '/produccion') label = config.labels.produccion
                if (item.href === '/maquinas') label = config.labels.maquinas
                if (item.href === '/materiales') label = config.labels.materiales

                // Determine Icon
                let iconKey = item.iconKey
                if (config.icons[item.iconKey]) iconKey = config.icons[item.iconKey]

                return {
                    ...item,
                    label,
                    icon: ICON_MAP[iconKey] || Package
                }
            })

    const coreItems = filterAndMap(MENU_ITEMS_CORE)
    const prodItems = filterAndMap(MENU_ITEMS_PROD)
    const systemItems = filterAndMap(MENU_ITEMS_SYSTEM)

    return (
        <div className="flex flex-col h-full">
            <div className={cn(
                "mb-8 flex items-center gap-3 px-2 py-4",
                isCollapsed && "justify-center px-0"
            )}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <Package className="h-6 w-6" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col truncate">
                        <span className="text-lg font-bold tracking-tight leading-none text-zinc-900 dark:text-zinc-50">ProdManager</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">{negocioActivo.nombre}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8">
                <nav className="space-y-1">
                    {!isCollapsed && <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">General</span>}
                    {coreItems.map(item => (
                        <SidebarItem key={item.href} item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} onItemClick={onItemClick} />
                    ))}
                </nav>

                {prodItems.length > 0 && (
                    <nav className="space-y-1 border-t border-zinc-100 pt-4 dark:border-zinc-800/50">
                        {!isCollapsed && <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Producción</span>}
                        {prodItems.map(item => (
                            <SidebarItem key={item.href} item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} onItemClick={onItemClick} />
                        ))}
                    </nav>
                )}

                <nav className="space-y-1 border-t border-zinc-100 pt-4 dark:border-zinc-800/50">
                    {!isCollapsed && <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Sistema</span>}
                    {systemItems.map(item => (
                        <SidebarItem key={item.href} item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} onItemClick={onItemClick} />
                    ))}
                </nav>
            </div>

            {!isCollapsed && (
                <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Ayuda</span>
                                <span className="text-[10px] text-zinc-500">Documentación</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export function Sidebar() {
    const { isCollapsed, setIsCollapsed } = useSidebar()

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950",
            isCollapsed ? "w-[88px]" : "w-[280px]"
        )}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 hidden md:flex"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
            <SidebarContent isCollapsed={isCollapsed} />
        </aside>
    )
}
