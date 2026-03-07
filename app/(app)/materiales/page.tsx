'use client'

import { useState, useEffect } from 'react'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import { Plus, Trash2, Droplets, Weight, MoreVertical, Search, AlertTriangle, Edit2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { toast } from 'react-hot-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu"

export default function MaterialsPage() {
    const { negocioActivoId, negocioActivo, config } = useNegocio()
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Form states
    const [formName, setFormName] = useState('')
    const [formColor, setFormColor] = useState('')
    const [formBrand, setFormBrand] = useState('')
    const [formType, setFormType] = useState('PLA')
    const [formUnit, setFormUnit] = useState('g') // Nueva unidad dinámica
    const [formWeight, setFormWeight] = useState(1000)
    const [formRemainingWeight, setFormRemainingWeight] = useState(1000)
    const [formBedTemp, setFormBedTemp] = useState<number | ''>('')
    const [formNozzleTemp, setFormNozzleTemp] = useState<number | ''>('')

    const loadMaterials = async () => {
        if (!negocioActivoId) return
        setLoading(true)
        try {
            const data = await api.materials.getAll(negocioActivoId)
            setMaterials(data as any[])
        } catch (error) {
            console.error('Error fetching materials:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMaterials()
    }, [negocioActivoId])

    const handleSave = async () => {
        if (!formName) {
            toast.error('El nombre es obligatorio')
            return
        }

        setSaving(true)
        try {
            const data: any = {
                name: formName,
                color: formColor,
                brand: formBrand,
                type: formType,
                totalWeightGrams: formWeight,
                remainingWeightGrams: formRemainingWeight,
                unit: formUnit, // Guardamos la unidad
                bedTemperature: formBedTemp === '' ? null : formBedTemp,
                nozzleTemperature: formNozzleTemp === '' ? null : formNozzleTemp
            }

            if (selectedMaterialId) {
                await api.materials.update(selectedMaterialId, data)
                toast.success('Material actualizado correctamente')
            } else {
                data.businessId = negocioActivoId
                await api.materials.create(data)
                toast.success('Material registrado correctamente')
            }

            setIsDialogOpen(false)
            resetForm()
            loadMaterials()
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (mat: any) => {
        setSelectedMaterialId(mat.id)
        setFormName(mat.name)
        setFormColor(mat.color || '')
        setFormBrand(mat.brand || '')
        setFormType(mat.type)
        setFormUnit(mat.unit || (negocioActivo?.rubro === 'IMPRESION_3D' ? 'g' : 'm'))
        setFormWeight(mat.totalWeightGrams)
        setFormRemainingWeight(mat.remainingWeightGrams)
        setFormBedTemp(mat.bedTemperature ?? '')
        setFormNozzleTemp(mat.nozzleTemperature ?? '')
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setSelectedMaterialId(null)
        setFormName('')
        setFormColor('')
        setFormBrand('')
        setFormType(config.materialConfig.defaultType)
        setFormUnit(config.materialConfig.defaultUnit)
        setFormWeight(1000)
        setFormRemainingWeight(1000)
        setFormBedTemp('')
        setFormNozzleTemp('')
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este material?')) return
        try {
            await api.materials.remove(id)
            toast.success('Material eliminado')
            loadMaterials()
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message)
        }
    }

    // Eliminamos el guard de rubro para permitir que Metalúrgica use Materiales

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">{config.labels.materiales}</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1 italic">Gestión de inventario crítico y trazabilidad de materiales</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                    className="h-12 px-6 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-zinc-900/10 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 lg:h-14 lg:px-8 lg:text-xs"
                >
                    <Plus className="h-4 w-4" /> Nuevo Registro
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : materials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {materials.map((mat) => {
                        const percent = Math.round((mat.remainingWeightGrams / mat.totalWeightGrams) * 100)
                        const isLow = percent < 20

                        return (
                            <div key={mat.id} className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:shadow-primary/5">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="h-10 w-10 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-xl"
                                            style={{ backgroundColor: mat.color || '#ccc' }}
                                        />
                                        <div>
                                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 line-clamp-1">{mat.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[9px] font-black tracking-widest rounded-lg px-2 py-0">{mat.type}</Badge>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{mat.brand || 'Genérico'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                                            <DropdownMenuItem onClick={() => handleEdit(mat)} className="gap-3 p-3 rounded-xl font-bold text-sm">
                                                <Edit2 className="h-4 w-4 text-zinc-500" /> Editar Registro
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2 bg-zinc-100 dark:bg-zinc-800" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(mat.id)}
                                                className="gap-3 p-3 rounded-xl font-bold text-sm text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                                            >
                                                <Trash2 className="h-4 w-4" /> Eliminar Permanente
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-none">Stock Disponible</p>
                                            <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
                                                {mat.remainingWeightGrams.toFixed(0)}<span className="text-sm ml-1 text-zinc-400 font-bold uppercase tracking-tighter">{mat.unit || config.materialConfig.defaultUnit}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-xs font-black uppercase tracking-widest",
                                                isLow ? 'text-rose-500 animate-pulse' : 'text-zinc-400'
                                            )}>
                                                {percent}%
                                            </p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 opacity-60">de {mat.totalWeightGrams}{mat.unit || config.materialConfig.defaultUnit}</p>
                                        </div>
                                    </div>

                                    <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800/40 rounded-full overflow-hidden p-1 border border-zinc-100 dark:border-zinc-800/30">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                                                isLow ? 'bg-rose-500 shadow-rose-500/20' : 'bg-zinc-900 dark:bg-zinc-50 shadow-zinc-950/20'
                                            )}
                                            style={{ width: `${percent}%` }}
                                        >
                                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                                        </div>
                                    </div>

                                    {negocioActivo?.rubro === 'IMPRESION_3D' && (mat.bedTemperature || mat.nozzleTemperature) && (
                                        <div className="flex gap-6 pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                                            {mat.nozzleTemperature && (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Boquilla</span>
                                                        <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 mt-1">{mat.nozzleTemperature}°C</span>
                                                    </div>
                                                </div>
                                            )}
                                            {mat.bedTemperature && (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Cama</span>
                                                        <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 mt-1">{mat.bedTemperature}°C</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/20 dark:bg-zinc-900/10 grayscale opacity-80">
                    <div className="h-20 w-20 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center">
                        <Droplets className="h-10 w-10 text-zinc-200" />
                    </div>
                    <div className="space-y-2 px-8">
                        <p className="text-xl font-black text-zinc-400 uppercase tracking-tight">Depósito vacío</p>
                        <p className="text-sm text-zinc-500 italic max-w-sm mx-auto">No hay insumos registrados. Añade tus materiales para poder asignarlos a la producción.</p>
                    </div>
                </div>
            )}

            {/* Modal para Crear Material */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedMaterialId ? 'Editar Registro' : `Registrar ${config.labels.materiales.slice(0, -2)}`}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nombre / Descripción</label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder={config.materialConfig.namePlaceholder}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-2 text-sm dark:border-zinc-800 shadow-sm font-bold"
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value)}
                                >
                                    {config.materialConfig.types.map(t => (
                                        <option key={t.key} value={t.key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Unidad de Medida</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-2 text-sm dark:border-zinc-800 font-bold"
                                    value={formUnit}
                                    onChange={(e) => setFormUnit(e.target.value)}
                                >
                                    {config.materialConfig.units.map(u => (
                                        <option key={u.key} value={u.key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{u.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Capacidad Total ({formUnit})</label>
                                <Input
                                    type="number"
                                    value={formWeight}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const num = val === '' ? 0 : Number(val);
                                        setFormWeight(num);
                                        if (!selectedMaterialId) setFormRemainingWeight(num);
                                    }}
                                    placeholder="Ej: 6000"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Stock Disponible ({formUnit})</label>
                                <Input
                                    type="number"
                                    value={formRemainingWeight}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormRemainingWeight(val === '' ? 0 : Number(val))
                                    }}
                                    placeholder="Ej: 850"
                                />
                                <p className="text-[10px] text-zinc-500 italic">Puedes ajustar el stock restante manualmente.</p>
                            </div>
                        </div>

                        {negocioActivo?.rubro === 'IMPRESION_3D' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Temp. Boquilla (°C)</label>
                                    <Input
                                        type="number"
                                        value={formNozzleTemp}
                                        onChange={(e) => setFormNozzleTemp(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ej: 210"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Temp. Cama (°C)</label>
                                    <Input
                                        type="number"
                                        value={formBedTemp}
                                        onChange={(e) => setFormBedTemp(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ej: 60"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Proveedor / Marca</label>
                                <Input
                                    value={formBrand}
                                    onChange={(e) => setFormBrand(e.target.value)}
                                    placeholder={config.materialConfig.brandPlaceholder}
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Color del Material</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {[
                                    { name: 'Negro', hex: '#000000' },
                                    { name: 'Blanco', hex: '#ffffff' },
                                    { name: 'Gris', hex: '#808080' },
                                    { name: 'Rojo', hex: '#ef4444' },
                                    { name: 'Azul', hex: '#3b82f6' },
                                    { name: 'Verde', hex: '#22c55e' },
                                    { name: 'Amarillo', hex: '#eab308' },
                                    { name: 'Naranja', hex: '#f97316' },
                                ].map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        onClick={() => setFormColor(c.hex)}
                                        className={`h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${formColor === c.hex ? 'ring-2 ring-zinc-900 ring-offset-1 dark:ring-zinc-100' : 'border-zinc-200'}`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={formColor || '#cccccc'}
                                    onChange={(e) => setFormColor(e.target.value)}
                                    className="h-10 w-10 p-0.5 rounded-md border border-zinc-200 bg-white cursor-pointer"
                                />
                                <span className="text-xs font-mono text-zinc-500 uppercase">{formColor || '#---'}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : selectedMaterialId ? 'Actualizar Material' : 'Guardar Material'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
