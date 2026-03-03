'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Negocio, Rubro, NegocioConfig, getNegocioConfig, mapCategoryToRubro } from '@/src/domain/negocio'
import { api } from '@/src/lib/api'

interface NegocioContextType {
    negocios: Negocio[]
    negocioActivoId: string
    negocioActivo: Negocio | undefined
    config: NegocioConfig
    setActivo: (id: string) => void
    loadNegocios: () => Promise<void>
    addNegocio: (nombre: string, rubro: Rubro) => void
    updateNegocio: (id: string, nombre: string, rubro: Rubro) => void
    removeNegocio: (id: string) => void
}

const NegocioContext = createContext<NegocioContextType | undefined>(undefined)

export function NegocioProvider({ children }: { children: React.ReactNode }) {
    const [negocios, setNegocios] = useState<Negocio[]>([])
    const [negocioActivoId, setNegocioActivoId] = useState<string>('')
    const [isInitialized, setIsInitialized] = useState(false)

    const loadNegocios = useCallback(async () => {
        try {
            const data: any = await api.businesses.getAll()
            const mapped: Negocio[] = data.map((b: any) => ({
                id: b.id,
                nombre: b.name,
                rubro: mapCategoryToRubro(b.category),
                createdAt: b.createdAt
            }))
            setNegocios(mapped)
        } catch (error) {
            console.error('Error loading businesses in context:', error)
            // fetchApi ya maneja el 401 redirigiendo, aquí solo fallamos silenciosamente o limpiamos
            setNegocios([])
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined') {
                const path = window.location.pathname;
                if (path === '/login' || path === '/register') {
                    setIsInitialized(true);
                    return;
                }
            }

            const savedActivo = localStorage.getItem('prodmanager_negocio_activo')
            await loadNegocios()
            if (savedActivo) setNegocioActivoId(savedActivo)
            setIsInitialized(true)
        }
        init()
    }, [loadNegocios])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('prodmanager_negocio_activo', negocioActivoId)
        }
    }, [negocioActivoId, isInitialized])

    const setActivo = (id: string) => setNegocioActivoId(id)

    const addNegocio = (nombre: string, rubro: Rubro) => {
        // TODO: Implementar creación real en Backend
        console.warn('addNegocio no implementado: requiere persistencia en Backend.')
        throw new Error('La creación de negocios debe realizarse desde el panel de configuración (No implementado en cliente aún).')
    }

    const updateNegocio = (id: string, nombre: string, rubro: Rubro) => {
        setNegocios(negocios.map(n => n.id === id ? { ...n, nombre, rubro } : n))
    }

    const removeNegocio = (id: string) => {
        if (negocios.length <= 1) return
        const rest = negocios.filter(n => n.id !== id)
        setNegocios(rest)
        if (negocioActivoId === id) {
            setNegocioActivoId(rest[0].id)
        }
    }

    const negocioActivo = negocios.find(n => n.id === negocioActivoId)
    const config = getNegocioConfig(negocioActivo?.rubro || 'GENERICO')

    return (
        <NegocioContext.Provider value={{
            negocios,
            negocioActivoId,
            negocioActivo,
            config,
            setActivo,
            loadNegocios,
            addNegocio,
            updateNegocio,
            removeNegocio
        }}>
            {children}
        </NegocioContext.Provider>
    )
}

export function useNegocio() {
    const context = useContext(NegocioContext)
    if (context === undefined) {
        throw new Error('useNegocio must be used within a NegocioProvider')
    }
    return context
}
