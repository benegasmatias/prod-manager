import { Sidebar } from '@/src/components/Sidebar'
import { Topbar } from '@/src/components/Topbar'
import { BusinessGuard } from '@/src/components/BusinessGuard'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <BusinessGuard>
            <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
                {/* Sidebar Desktop - Oculto en mobile */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {/* Contenido Principal */}
                {/* pl-0 en mobile, pl-[260px] en desktop */}
                <div className="flex flex-1 flex-col lg:pl-[260px]">
                    <Topbar />
                    <main className="mt-16 p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </BusinessGuard>
    )
}
