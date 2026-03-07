'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'

export function BusinessGuard({ children }: { children: React.ReactNode }) {
    const { negocios, negocioActivoId, setActivo, isInitialized } = useNegocio()
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)

    // Referencia para evitar verificaciones redundantes si nada crítico cambió
    const verificationRef = useRef<string>('')

    useEffect(() => {
        // 1. Excluir rutas públicas
        if (pathname === '/login' || pathname === '/register') {
            setIsChecking(false)
            return
        }

        // 2. Esperar a que el contexto de negocio esté listo (haya cargado de LS o Backend)
        if (!isInitialized) return

        const verify = async () => {
            const currentCheck = `${pathname}-${negocioActivoId}-${negocios.length}`
            if (verificationRef.current === currentCheck) {
                setIsChecking(false)
                return
            }

            try {
                // Si el negocio activo es válido dentro de la lista actual, todo okay
                const isValid = negocioActivoId && negocios.some(b => b.id === negocioActivoId)

                // BLOQUEO A: Si ya tiene negocio válido, no puede estar en /select-business
                if (isValid && pathname === '/select-business') {
                    router.replace('/dashboard')
                    return
                }

                // BLOQUEO B: Si NO tiene ningún negocio válido y NO está en /select-business, forzar selección
                if (!isValid && pathname !== '/select-business') {
                    // Solo redirigimos si realmente no hay nada. Si hay negocios pero no activo,
                    // NegocioContext ya debería haber intentado poner uno.
                    if (negocios.length > 0) {
                        setActivo(negocios[0].id)
                    } else {
                        router.replace('/select-business')
                        return
                    }
                }

                verificationRef.current = currentCheck
                setIsChecking(false)
            } catch (err) {
                console.error('[BusinessGuard] Error:', err)
                setIsChecking(false)
            }
        }

        verify()
    }, [pathname, isInitialized, negocioActivoId, negocios.length, setActivo, router])

    if (!isInitialized || (isChecking && pathname !== '/select-business')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 border-4 border-zinc-900 border-t-transparent dark:border-white animate-spin rounded-full mx-auto" />
                    <p className="text-zinc-500 font-medium">Sincronizando...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
