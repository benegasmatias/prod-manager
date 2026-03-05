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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ajustes</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Personaliza la configuración de tu negocio y preferencias globales.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Perfil de Empresa */}
                <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                <Landmark className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Perfil del Negocio</CardTitle>
                                <CardDescription>Información principal que identifica a tu empresa.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-3">
                            <label className="text-sm font-black uppercase tracking-wider text-zinc-500">Nombre de Fantasía</label>
                            <Input
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="max-w-md font-medium"
                                placeholder="Ej: Mi Taller 3D"
                            />
                        </div>

                        <div className="grid gap-3">
                            <label className="text-sm font-black uppercase tracking-wider text-zinc-500">Rubro del Negocio</label>
                            <div className="inline-flex px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 w-fit">
                                {negocioActivo.rubro}
                            </div>
                            <p className="text-[10px] text-zinc-400 italic">El rubro no puede cambiarse manualmente una vez creado el espacio.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferencias Regionales / Moneda */}
                <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                <Globe className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Preferencias Globales</CardTitle>
                                <CardDescription>Moneda y formatos utilizados en toda la aplicación.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-3">
                            <label className="text-sm font-black uppercase tracking-wider text-zinc-500">Moneda del Sistema</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl">
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
                                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${moneda === curr.code
                                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                                                : 'border-zinc-100 bg-white hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="text-xl font-black mb-1">{curr.symbol}</span>
                                        <span className={`text-xs font-bold leading-none ${moneda === curr.code ? 'opacity-80' : 'text-zinc-500'}`}>
                                            {curr.label}
                                        </span>
                                        <span className={`text-[10px] mt-1 font-mono ${moneda === curr.code ? 'opacity-60' : 'text-zinc-400'}`}>
                                            {curr.code}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                Esta configuración actualizará los símbolos de precios en Pedidos, Clientes y Dashboard.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 px-8 h-12 text-base font-bold shadow-lg shadow-zinc-200 dark:shadow-none"
                    >
                        {saving ? 'Guardando...' : <><Save className="h-5 w-5" /> Guardar Todos los Ajustes</>}
                    </Button>
                </div>
            </div>
        </div>
    )
}
