'use client'

import { useState, useEffect } from 'react'
import { useNegocio } from '@/src/context/NegocioContext'
import { api } from '@/src/lib/api'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import { Plus, Trash2, Droplets, Weight, MoreVertical, Search, AlertTriangle, Edit2, Activity, ChevronDown, X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
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
    const [formCostPerKg, setFormCostPerKg] = useState<number>(0)

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
                costPerKg: formCostPerKg,
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
        setFormCostPerKg(mat.costPerKg || 0)
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
        setFormCostPerKg(0)
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
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Gestión de Recursos</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Depósito de <span className="text-primary italic">{config.labels.materiales}</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                        Control de inventario, costos de adquisición y trazabilidad de insumos de manufactura.
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                    className="h-11 px-6 lg:h-12 lg:px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] gap-2"
                >
                    <Plus className="h-4 w-4" /> Nuevo Registro
                </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LucideIcons.Package className="h-20 w-20 text-primary" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Variedad</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{materials.length}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">Ítems</span>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Weight className="h-20 w-20 text-blue-500" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Estado Stock</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {materials.filter(m => (m.remainingWeightGrams / m.totalWeightGrams) < 0.2).length}
                        </h3>
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full mb-1">Críticos</span>
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LucideIcons.TrendingUp className="h-20 w-20 text-emerald-500" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Valor Estimado</span>
                    <div className="flex items-end gap-3">
                        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            ${materials.reduce((acc, m) => acc + (m.remainingWeightGrams * (m.costPerKg / 1000)), 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/70 dark:bg-zinc-900/40 p-4 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm backdrop-blur-sm uppercase">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors duration-200" />
                    <input
                        type="search"
                        placeholder="Buscar por nombre, marca o tipo..."
                        className="h-11 w-full rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-950"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-56 bg-zinc-100 dark:bg-zinc-800/20 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : materials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((mat) => {
                        const percent = Math.round((mat.remainingWeightGrams / mat.totalWeightGrams) * 100)
                        const isLow = percent < 20

                        return (
                            <div key={mat.id} className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-xl animate-slide-up">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-xl border border-white/20 shadow-sm"
                                            style={{ backgroundColor: mat.color || '#ccc' }}
                                        />
                                        <div>
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{mat.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md uppercase tracking-wide">{mat.type}</span>
                                                <span className="text-[10px] text-zinc-400 font-medium uppercase truncate max-w-[80px]">{mat.brand || 'Genérico'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                                                <DropdownMenuItem onClick={() => handleEdit(mat)} className="gap-2.5 p-2.5 rounded-lg font-bold text-xs">
                                                    <Edit2 className="h-3.5 w-3.5 text-zinc-500" /> Editar Registro
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1.5 bg-zinc-100 dark:bg-zinc-800" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(mat.id)}
                                                    className="gap-2.5 p-2.5 rounded-lg font-bold text-xs text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Eliminar Permanente
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Stock Disponible</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                                    {mat.remainingWeightGrams.toFixed(0)}
                                                </span>
                                                <span className="text-xs text-zinc-400 font-bold uppercase">{mat.unit || config.materialConfig.defaultUnit}</span>
                                            </div>
                                        </div>
                                        <div className="text-right pb-1">
                                            <div className={cn(
                                                "text-[10px] font-bold px-3 py-1 rounded-full inline-block uppercase tracking-wider",
                                                isLow ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            )}>
                                                {percent}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800/40 rounded-full overflow-hidden border border-zinc-50 dark:border-zinc-800/30">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-700 ease-out",
                                                isLow ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]'
                                            )}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500">
                                            <Weight className="h-3.5 w-3.5 opacity-60" />
                                            <span>$ {Number(mat.costPerKg).toLocaleString('es-AR')}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium">/ {mat.unit === 'g' ? 'kg' : mat.unit}</span>
                                        </div>

                                        {negocioActivo?.rubro === 'IMPRESION_3D' && (mat.bedTemperature || mat.nozzleTemperature) && (
                                            <div className="flex gap-3">
                                                {mat.nozzleTemperature && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                                        <Activity className="h-3 w-3 text-orange-500" />
                                                        {mat.nozzleTemperature}°C
                                                    </div>
                                                )}
                                                {mat.bedTemperature && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                                        <Droplets className="h-3 w-3 text-blue-500 rotate-180" />
                                                        {mat.bedTemperature}°C
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[2.5rem] border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-900/5">
                    <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                        {(() => {
                            const IconComponent = (LucideIcons as any)[config.icons.materiales] || LucideIcons.Package;
                            return <IconComponent className="h-7 w-7 text-zinc-300 p-0.5" />;
                        })()}
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-lg font-bold text-zinc-400 tracking-tight">Sin {config.labels.materiales.toLowerCase()}</p>
                        <p className="text-sm text-zinc-500 max-w-sm mx-auto">No hay {config.labels.materiales.toLowerCase()} registrados en el inventario actual.</p>
                    </div>
                </div>
            )}

            {/* Modal para Crear Material */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white dark:bg-zinc-950">
                    <DialogHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 text-left relative">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group">
                                {(() => {
                                    const IconComponent = (LucideIcons as any)[config.icons.materiales] || LucideIcons.Package;
                                    return <IconComponent className="h-6 w-6 transition-transform group-hover:scale-110" />;
                                })()}
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    {selectedMaterialId ? `Editar ${config.labels.materiales.slice(0, -1)}` : `Nuevo ${config.labels.materiales.slice(0, -1)}`}
                                </DialogTitle>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                                    {config.labels.produccion || 'Control de Inventario'}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nombre / Identificación</label>
                                <Input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder={config.materialConfig.namePlaceholder}
                                    className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Tipo de Material</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                            value={formType}
                                            onChange={(e) => setFormType(e.target.value)}
                                        >
                                            {config.materialConfig.types.map(t => (
                                                <option key={t.key} value={t.key}>{t.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Unidad</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                            value={formUnit}
                                            onChange={(e) => setFormUnit(e.target.value)}
                                        >
                                            {config.materialConfig.units.map(u => (
                                                <option key={u.key} value={u.key}>{u.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Stock Total ({formUnit})</label>
                                    <Input
                                        type="number"
                                        value={formWeight}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const num = val === '' ? 0 : Number(val);
                                            setFormWeight(num);
                                            if (!selectedMaterialId) setFormRemainingWeight(num);
                                        }}
                                        className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Disponible ({formUnit})</label>
                                    <Input
                                        type="number"
                                        value={formRemainingWeight}
                                        onChange={(e) => setFormRemainingWeight(e.target.value === '' ? 0 : Number(e.target.value))}
                                        className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {negocioActivo?.rubro === 'IMPRESION_3D' ? (
                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-zinc-50 dark:border-zinc-800/50">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Temp. Nozzle (°C)</label>
                                    <Input
                                        type="number"
                                        value={formNozzleTemp}
                                        onChange={(e) => setFormNozzleTemp(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Temp. Cama (°C)</label>
                                    <Input
                                        type="number"
                                        value={formBedTemp}
                                        onChange={(e) => setFormBedTemp(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2.5 pt-8 border-t border-zinc-50 dark:border-zinc-800/50">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Marca / Proveedor</label>
                                <Input
                                    value={formBrand}
                                    onChange={(e) => setFormBrand(e.target.value)}
                                    placeholder={config.materialConfig.brandPlaceholder}
                                    className="h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                />
                            </div>
                        )}

                        <div className="space-y-3 pt-8 border-t border-zinc-50 dark:border-zinc-800/50">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 ml-1">Costo de Adquisición</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg pointer-events-none">$</span>
                                <Input
                                    type="number"
                                    value={formCostPerKg}
                                    onChange={(e) => setFormCostPerKg(e.target.value === '' ? 0 : Number(e.target.value))}
                                    placeholder="0.00"
                                    className="h-14 pl-10 rounded-2xl border-none bg-emerald-50/30 dark:bg-emerald-500/5 px-5 text-lg font-black text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all focus:bg-white dark:focus:bg-zinc-900"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
                                    por {formUnit === 'g' ? 'kg' : formUnit}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-8 border-t border-zinc-50 dark:border-zinc-800/50">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Identificador Visual (Color)</label>
                            <div className="flex flex-wrap gap-3 px-1">
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
                                        className={cn(
                                            "h-8 w-8 rounded-full border shadow-sm transition-all hover:scale-110",
                                            formColor === c.hex ? "ring-2 ring-primary ring-offset-4 scale-110" : "border-zinc-100 dark:border-zinc-800"
                                        )}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={formColor || '#cccccc'}
                                    onChange={(e) => setFormColor(e.target.value)}
                                    className="h-8 w-8 p-0 rounded-full border border-zinc-100 dark:border-zinc-800 overflow-hidden cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex flex-row items-center justify-end gap-3 bg-white dark:bg-zinc-950">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={saving}
                            className="rounded-2xl font-bold h-12 px-6 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-2xl font-bold h-12 px-10 bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Guardando...</span>
                                </div>
                            ) : (
                                <span>{selectedMaterialId ? 'Actualizar Registro' : 'Confirmar y Crear'}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
