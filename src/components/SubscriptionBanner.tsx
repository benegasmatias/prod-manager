'use client'

import React from 'react'
import { useNegocio } from '@/src/context/NegocioContext'
import { AlertTriangle, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function SubscriptionBanner() {
    const { negocioActivo } = useNegocio()

    if (!negocioActivo) return null

    const isExpired = negocioActivo.subscriptionExpiresAt
        ? new Date(negocioActivo.subscriptionExpiresAt) < new Date()
        : false

    const isSuspended = negocioActivo.status === 'SUSPENDED'

    if (!isExpired && !isSuspended) return null

    return (
        <div className="bg-rose-600 text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500 z-[60] relative border-b border-rose-500">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                    <p className="text-xs font-black uppercase tracking-widest leading-none">
                        {isSuspended ? 'Cuenta Suspendida' : 'Suscripción Vencida'}
                    </p>
                    <p className="text-[10px] font-bold opacity-80 mt-1">
                        Tu acceso a las funciones de taller ha sido limitado. Por favor, regulariza tu pago.
                    </p>
                </div>
            </div>

            <Link
                href="/ajustes"
                className="px-6 py-2 bg-white text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-100 transition-all shadow-lg"
            >
                <CreditCard className="h-3 w-3" />
                Gestionar Pago
                <ChevronRight className="h-3 w-3" />
            </Link>
        </div>
    )
}
