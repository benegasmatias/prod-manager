'use client'

import React, { useEffect, useState } from 'react'
import { useNegocio } from '@/src/context/NegocioContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Briefcase, ArrowRight, Star, Loader2 } from 'lucide-react'
import { api } from '@/src/lib/api'
import { toast } from 'react-hot-toast'
import { Badge } from '@/src/components/ui/badge'

export default function SelectBusinessPage() {
    const { setActivo } = useNegocio()
    const router = useRouter()

    // States
    const [businesses, setBusinesses] = useState<any[]>([])
    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [defaultId, setDefaultId] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                // Notar que api.users.getMe ya maneja el token internamente o podemos pasarlo si es necesario
                // Pero nuestro fetchApi ahora es inteligente.
                const bizData: any = await api.businesses.getAll()
                const profileData: any = await api.users.getMe()

                setBusinesses(bizData)
                setDefaultId(profileData.defaultBusinessId)

                // Si no tiene negocios, cargamos los templates para onboarding
                if (bizData.length === 0) {
                    const templateData = await api.businesses.getTemplates()
                    setTemplates(templateData)
                }
            } catch (error) {
                console.error('Error loading businesses:', error)
                // fetchApi maneja el 401, aquí solo informamos otros errores
                if (!(error instanceof Error && error.message.includes('Sesión expirada'))) {
                    toast.error('No se pudieron cargar los negocios')
                }
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleSelect = (id: string) => {
        setActivo(id)
        router.push('/dashboard')
    }

    const handleCreate = async (templateKey: string) => {
        setActionLoading(templateKey)
        try {
            // Un solo llamado: Crea el negocio, vincula al usuario y lo setea como activo
            const response = await api.businesses.create(templateKey)

            // response ahora tiene { business: { id, name, category }, defaultBusinessId }
            setActivo(response.business.id)
            toast.success(`¡Espacio ${response.business.name} creado con éxito!`)
            router.push('/dashboard')
        } catch (error: any) {
            console.error('Error creating business:', error)
            toast.error('Error al crear el espacio: ' + error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleSetDefault = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setActionLoading(id)
        try {
            await api.users.setDefaultBusiness(null, id)
            setActivo(id)
            toast.success('Espacio favorito guardado')
            router.push('/dashboard')
        } catch (error) {
            console.error('Error setting default:', error)
            toast.error('Error al guardar preferencia')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-400" />
                    <p className="text-zinc-500 font-medium">Cargando tus negocios...</p>
                </div>
            </div>
        )
    }

    const hasBusinesses = businesses.length > 0

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-2xl space-y-8 py-12">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {hasBusinesses ? 'Tus Negocios' : 'Comienza tu experiencia'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {hasBusinesses
                            ? 'Selecciona el espacio de trabajo para continuar.'
                            : 'Elige un rubro para crear tu primer espacio de trabajo personalizado.'}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-left">
                    {hasBusinesses ? (
                        businesses.map((n) => (
                            <Card
                                key={n.id}
                                className={`group relative hover:border-zinc-900 dark:hover:border-zinc-50 transition-all cursor-pointer shadow-sm border-2 ${defaultId === n.id ? 'border-zinc-900 dark:border-zinc-50' : 'border-transparent'}`}
                                onClick={() => handleSelect(n.id)}
                            >
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-50 dark:group-hover:text-zinc-900 transition-colors">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        {defaultId === n.id && (
                                            <Badge variant="secondary" className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold gap-1 text-[10px] uppercase">
                                                <Star className="h-3 w-3 fill-current" /> Favorito
                                            </Badge>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{n.name}</h3>
                                        <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">{n.category}</p>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-black uppercase tracking-tighter gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            onClick={(e) => handleSetDefault(e, n.id)}
                                            disabled={actionLoading === n.id || defaultId === n.id}
                                        >
                                            {actionLoading === n.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Star className={`h-3 w-3 ${defaultId === n.id ? 'fill-current' : ''}`} />
                                            )}
                                            {defaultId === n.id ? 'Ya es favorito' : 'Setear Favorito'}
                                        </Button>
                                        <div className="p-1 rounded-full bg-zinc-50 dark:bg-zinc-900 transition-transform group-hover:translate-x-1">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        templates.map((t) => (
                            <Card
                                key={t.key}
                                className="group relative hover:border-zinc-900 dark:hover:border-zinc-50 transition-all cursor-pointer shadow-sm border-2 border-transparent"
                                onClick={() => handleCreate(t.key)}
                            >
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-50 dark:group-hover:text-zinc-900 transition-colors">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{t.name}</h3>
                                        <p className="text-sm text-zinc-500 mt-1 leading-tight">{t.description}</p>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-black uppercase tracking-tighter gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            disabled={actionLoading === t.key}
                                        >
                                            {actionLoading === t.key ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <ArrowRight className="h-4 w-4" />
                                            )}
                                            Crear y entrar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
