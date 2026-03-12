'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useNegocio } from '@/src/context/NegocioContext'
import { useState, useEffect } from 'react'
import { Landmark, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
    const { negocioActivo, updateNegocio } = useNegocio()
    const [nombre, setNombre] = useState('')
    const [moneda, setMoneda] = useState('ARS')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (negocioActivo) {
            setNombre(negocioActivo.nombre)
            setMoneda(negocioActivo.moneda || 'ARS')
        }
    }, [negocioActivo])

    const handleSave = async () => {
        if (!negocioActivo) return
        setSaving(true)
        try {
            await updateNegocio(negocioActivo.id, {
                nombre,
                moneda
            })
        } finally {
            setSaving(false)
        }
    }

    if (!negocioActivo) return null

    return (
        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Configuración del Sistema</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Ajustes de <span className="text-primary italic">Negocio</span>
                </h1>
                <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                    Personaliza la identidad de tu empresa, moneda del sistema y preferencias globales de la plataforma.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Perfil de Empresa */}
                <Card className="border-zinc-100 dark:border-zinc-800/50 shadow-sm overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900/40 backdrop-blur-sm">
                    <CardHeader className="bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-50 dark:border-zinc-800/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
                                <Landmark className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Perfil del Negocio</CardTitle>
                                <CardDescription className="text-xs font-medium text-zinc-500">Información principal que identifica a tu empresa.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid gap-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nombre de Fantasía</label>
                            <input
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full max-w-md h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                placeholder="Ej: Mi Taller 3D"
                            />
                        </div>

                        <div className="grid gap-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Rubro del Negocio</label>
                            <div className="inline-flex px-4 py-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 w-fit uppercase tracking-widest border border-zinc-200/30 dark:border-zinc-700/30">
                                {negocioActivo.rubro}
                            </div>
                            <p className="text-[10px] text-zinc-400 italic ml-1">El rubro no puede cambiarse manualmente una vez creado el espacio.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferencias Regionales / Moneda */}
                <Card className="border-zinc-100 dark:border-zinc-800/50 shadow-sm overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900/40 backdrop-blur-sm">
                    <CardHeader className="bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-50 dark:border-zinc-800/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Preferencias Globales</CardTitle>
                                <CardDescription className="text-xs font-medium text-zinc-500">Moneda y formatos utilizados en toda la aplicación.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Moneda del Sistema</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
                                {[
                                    { code: 'ARS', label: 'Pesos Argentinos', symbol: '$' },
                                    { code: 'USD', label: 'Dólares Estadounidenses', symbol: 'US$' },
                                    { code: 'EUR', label: 'Euros', symbol: '€' },
                                    { code: 'CLP', label: 'Pesos Chilenos', symbol: 'CLP$' },
                                    { code: 'UYU', label: 'Pesos Uruguayos', symbol: '$U' },
                                ].map((curr) => (
                                    <button
                                        key={curr.code}
                                        onClick={() => setMoneda(curr.code)}
                                        className={`flex flex-col items-start p-5 rounded-[1.5rem] border-2 transition-all text-left ${moneda === curr.code
                                                ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                                                : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className={`text-2xl font-black mb-1 ${moneda === curr.code ? 'text-primary' : 'text-zinc-300 dark:text-zinc-700'}`}>{curr.symbol}</span>
                                        <span className={`text-xs font-bold leading-none ${moneda === curr.code ? 'text-primary' : 'text-zinc-500'}`}>
                                            {curr.label}
                                        </span>
                                        <span className={`text-[10px] mt-2 font-mono font-bold ${moneda === curr.code ? 'text-primary' : 'text-zinc-400'}`}>
                                            {curr.code}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-400 italic mt-2 ml-1">
                                Esta configuración actualizará los símbolos de precios en Pedidos, Clientes y Dashboard.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-3 pt-8">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 px-10 h-14 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar Configuraciones
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
