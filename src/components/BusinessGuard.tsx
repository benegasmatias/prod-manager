'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'

export function BusinessGuard({ children }: { children: React.ReactNode }) {
    const { negocios, negocioActivoId, setActivo, loadNegocios } = useNegocio()
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Rutas públicas exceptuadas del guard
        if (pathname === '/login' || pathname === '/register') {
            setIsChecking(false)
            return
        }

        async function verifyAccess() {
            try {
                // Obtenemos perfil y lista para validación fresca
                const [profile, bizList] = await Promise.all([
                    api.users.getMe(),
                    api.businesses.getAll()
                ]) as [any, any[]]

                const defaultId = profile.defaultBusinessId
                const hasValidBusiness = defaultId && bizList.some(b => b.id === defaultId)

                // BLOQUEO A: Si ya tiene negocio predeterminado, no puede volver a seleccionar/onboarding
                if (pathname === '/select-business' && hasValidBusiness) {
                    console.info('[BusinessGuard] Ya tiene negocio activo -> Redirigiendo a Dashboard');
                    if (negocioActivoId !== defaultId) setActivo(defaultId as string)
                    router.replace('/dashboard')
                    return
                }

                // BLOQUEO B: Si NO tiene negocio predeterminado (o perdió acceso), forzar selección
                if (pathname !== '/select-business' && !hasValidBusiness) {
                    console.info('[BusinessGuard] Sin negocio configurado -> Redirigiendo a /select-business');
                    router.replace('/select-business')
                    return
                }

                // Seteamos activo si estamos entrando a una ruta protegida con acceso válido
                if (hasValidBusiness && negocioActivoId !== defaultId) {
                    setActivo(defaultId as string)
                }

                setIsChecking(false)

            } catch (error: any) {
                console.error('[BusinessGuard] Error verificando acceso:', error)
                // fetchApi ya disparó el 401 -> /login si fuera necesario.
                // Detenemos el loading para no bloquear al usuario en caso de error de red.
                setIsChecking(false)
            }
        }

        verifyAccess()
    }, [pathname, router, setActivo, negocioActivoId])

    if (isChecking && pathname !== '/select-business') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <p className="text-zinc-500 animate-pulse font-medium">Verificando espacio de trabajo...</p>
            </div>
        )
    }

    return <>{children}</>
}
