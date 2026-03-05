'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { Negocio, Rubro, NegocioConfig, getNegocioConfig, mapCategoryToRubro } from '@/src/domain/negocio'
import { api } from '@/src/lib/api'
import { toast } from 'react-hot-toast'

interface NegocioContextType {
    negocios: Negocio[]
    negocioActivoId: string
    negocioActivo: Negocio | undefined
    config: NegocioConfig
    setActivo: (id: string) => void
    loadNegocios: () => Promise<void>
    addNegocio: (nombre: string, rubro: Rubro) => Promise<any>
    updateNegocio: (id: string, data: Partial<Negocio>) => Promise<void>
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
                moneda: b.currency || 'ARS',
                createdAt: b.createdAt
            }))
            setNegocios(mapped)
        } catch (error) {
            console.error('Error loading businesses in context:', error)
            // fetchApi ya maneja el 401 redirigiendo, aquí solo fallamos silenciosamente o limpiamos
            setNegocios([])
        }
    }, [])

    const initialized = useRef(false)

    useEffect(() => {
        const init = async () => {
            if (initialized.current) return

            if (typeof window !== 'undefined') {
                const path = window.location.pathname;
                if (path === '/login' || path === '/register') {
                    setIsInitialized(true);
                    return;
                }
            }

            initialized.current = true
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

    const addNegocio = async (nombre: string, rubro: Rubro) => {
        try {
            const data = await api.businesses.create({ templateKey: rubro, name: nombre })
            await loadNegocios()
            toast.success('Negocio creado correctamente')
            return data
        } catch (error: any) {
            console.error('Error creating business:', error)
            toast.error('Error al crear el negocio: ' + error.message)
            throw error
        }
    }

    const updateNegocio = async (id: string, data: Partial<Negocio>) => {
        try {
            const updateData: any = {}
            if (data.nombre) updateData.name = data.nombre
            if (data.rubro) updateData.category = data.rubro
            if (data.moneda) updateData.currency = data.moneda

            await api.businesses.update(id, updateData)
            await loadNegocios()
            toast.success('Ajustes guardados correctamente')
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message)
        }
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
