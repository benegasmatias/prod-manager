'use client'

import { Sidebar } from '@/src/components/Sidebar'
import { Topbar } from '@/src/components/Topbar'
import { BusinessGuard } from '@/src/components/BusinessGuard'
import { useSidebar } from '@/src/context/SidebarContext'
import { cn } from '@/src/lib/utils'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isCollapsed } = useSidebar()

    return (
        <BusinessGuard>
            <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-all duration-300">
                {/* Sidebar Desktop - Oculto en mobile */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {/* Contenido Principal */}
                {/* Ajusta padding dinámicamente según colapso */}
                <div className={cn(
                    "flex flex-1 flex-col transition-all duration-300",
                    isCollapsed ? "lg:pl-[88px]" : "lg:pl-[280px]"
                )}>
                    <Topbar />
                    <main className="mt-16 p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </BusinessGuard>
    )
}
