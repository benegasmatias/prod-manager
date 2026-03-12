'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'

export function BusinessGuard({ children }: { children: React.ReactNode }) {
    const { negocios, negocioActivoId, user, setActivo, isInitialized } = useNegocio()
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)

    // Referencia para evitar verificaciones redundantes si nada crítico cambió
    const verificationRef = useRef<string>('')
    const isNavigatingRef = useRef<boolean>(false)

    useEffect(() => {
        // Reset navigation flag when location changes
        isNavigatingRef.current = false

        // 1. Excluir rutas públicas
        const publicPaths = ['/login', '/register', '/auth/callback', '/auth/auth-code-error']
        if (publicPaths.includes(pathname)) {
            setIsChecking(false)
            return
        }

        // 2. Esperar a que el contexto de negocio esté listo (haya cargado de LS o Backend)
        if (!isInitialized) return

        const verify = async () => {
            // El BusinessGuard ahora solo se encarga de asegurar que haya un negocio seleccionado.
            // La autenticación (redirección al login) la maneja exclusivamente el proxy.ts (middleware).

            const currentCheck = `${pathname}-${negocioActivoId}-${negocios.length}-${user?.id}`
            if (verificationRef.current === currentCheck) {
                setIsChecking(false)
                return
            }

            try {
                // REDIRECCIÓN CRÍTICA: Si no hay usuario y no es una ruta pública, ir al login
                if (!user && isInitialized) {
                    if (isNavigatingRef.current) return
                    isNavigatingRef.current = true
                    const next = encodeURIComponent(pathname + window.location.search)
                    router.replace(`/login?next=${next}`)
                    return
                }

                // Si aún no tenemos negocios cargados pero estamos inicializados, 
                // esperamos un instante por si el onAuthStateChange está en proceso.
                if (isInitialized && user && negocios.length === 0 && pathname !== '/select-business') {
                    // Si no hay negocios tras login, forzar ir a selección
                    if (isNavigatingRef.current) return
                    isNavigatingRef.current = true
                    router.replace('/select-business')
                    return
                }

                // Si el negocio activo es válido dentro de la lista actual, todo okay
                const isValid = negocioActivoId && negocios.some(b => b.id === negocioActivoId)

                // BLOQUEO A: Si ya tiene negocio válido, no forzar salida de /select-business
                // Esto permite que el usuario entre voluntariamente a cambiar de negocio.
                /*
                if (isValid && pathname === '/select-business') {
                    if (isNavigatingRef.current) return
                    isNavigatingRef.current = true
                    router.replace('/dashboard')
                    return
                }
                */

                // BLOQUEO B: Si NO tiene ningún negocio válido y NO está en /select-business, forzar selección
                if (user && !isValid && pathname !== '/select-business' && negocios.length > 0) {
                    // Intentar poner el primero si hay
                    setActivo(negocios[0].id)
                } else if (user && !isValid && pathname !== '/select-business' && isInitialized) {
                    // Si realmente no hay negocios, ir a crear/seleccionar
                    if (isNavigatingRef.current) return
                    isNavigatingRef.current = true
                    router.replace('/select-business')
                    return
                }

                verificationRef.current = currentCheck
                setIsChecking(false)
                console.log('[BusinessGuard] Verificación completa, permitiendo render.');
            } catch (err) {
                console.error('[BusinessGuard] Error:', err)
                setIsChecking(false)
            }
        }

        console.log('[BusinessGuard] Disparando verificación...', { pathname, isInitialized, hasUser: !!user });
        verify()
    }, [pathname, isInitialized, negocioActivoId, negocios.length, user, setActivo, router])

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
