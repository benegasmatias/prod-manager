'use client'

import { useSearchParams } from 'next/navigation'
import { OrderForm } from '@/src/components/OrderForm'
import { Suspense } from 'react'

function NuevoStockPageContent() {
    const searchParams = useSearchParams()
    const cloneId = searchParams.get('cloneId')

    return (
        <OrderForm
            forcedType="STOCK"
            cloneId={cloneId}
        />
    )
}

export default function NuevoStockPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Iniciando Formulario de Stock...</div>}>
            <NuevoStockPageContent />
        </Suspense>
    )
}
