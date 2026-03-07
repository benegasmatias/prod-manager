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
    user: any | null
    isInitialized: boolean
    setActivo: (id: string) => void
    loadNegocios: () => Promise<Negocio[]>
    addNegocio: (nombre: string, rubro: Rubro) => Promise<any>
    updateNegocio: (id: string, data: Partial<Negocio>) => Promise<void>
    removeNegocio: (id: string) => void
}

const NegocioContext = createContext<NegocioContextType | undefined>(undefined)

export function NegocioProvider({ children }: { children: React.ReactNode }) {
    const [negocios, setNegocios] = useState<Negocio[]>([])
    const [negocioActivoId, setNegocioActivoId] = useState<string>('')
    const [user, setUser] = useState<any | null>(null)
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
            return mapped
        } catch (error) {
            console.error('Error loading businesses in context:', error)
            setNegocios([])
            return []
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

            try {
                const [loadedNegocios, profile]: [Negocio[], any] = await Promise.all([
                    loadNegocios(),
                    api.users.getMe()
                ])

                setUser(profile)

                if (savedActivo && loadedNegocios.find(n => n.id === savedActivo)) {
                    setNegocioActivoId(savedActivo)
                } else if (loadedNegocios.length > 0) {
                    const defaultId = profile.defaultBusinessId
                    if (defaultId && loadedNegocios.find(n => n.id === defaultId)) {
                        setNegocioActivoId(defaultId)
                    } else {
                        setNegocioActivoId(loadedNegocios[0].id)
                    }
                }
            } catch (e) {
                console.error('[NegocioContext] Error initialization:', e)
            } finally {
                setIsInitialized(true)
            }
        }
        init()
    }, [loadNegocios])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('prodmanager_negocio_activo', negocioActivoId)
        }
    }, [negocioActivoId, isInitialized])

    const setActivo = useCallback((id: string) => {
        setNegocioActivoId(id)
        api.users.setDefaultBusiness(null, id).catch(err => {
            console.error('[NegocioContext] Error persistiendo negocio por defecto:', err)
        })
    }, [])

    const addNegocio = useCallback(async (nombre: string, rubro: Rubro) => {
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
    }, [loadNegocios])

    const updateNegocio = useCallback(async (id: string, data: Partial<Negocio>) => {
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
    }, [loadNegocios])

    const removeNegocio = useCallback((id: string) => {
        setNegocios(prev => {
            if (prev.length <= 1) return prev
            const rest = prev.filter(n => n.id !== id)
            if (negocioActivoId === id) {
                setNegocioActivoId(rest[0].id)
            }
            return rest
        })
    }, [negocioActivoId])

    const negocioActivo = negocios.find(n => n.id === negocioActivoId)
    const config = getNegocioConfig(negocioActivo?.rubro || 'GENERICO')

    return (
        <NegocioContext.Provider value={{
            negocios,
            negocioActivoId,
            negocioActivo,
            config,
            user,
            setActivo,
            isInitialized,
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
