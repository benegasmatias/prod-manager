'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Pedido } from '@/src/types'
import { formatARS } from '@/src/lib/money'
import { Calendar, DollarSign, User, MapPin } from 'lucide-react'

interface SellStockModalProps {
    order: Pedido | null
    isOpen: boolean
    onClose: () => void
    onConfirm: (data: {
        price: number
        clientName: string
        date: string
        notes: string
    }) => Promise<void>
}

export function SellStockModal({ order, isOpen, onClose, onConfirm }: SellStockModalProps) {
    const [price, setPrice] = useState<number>(0)
    const [clientName, setClientName] = useState<string>('Consumidor Final')
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState<string>('')
    const [loading, setLoading] = useState(false)

    // Reset when order changes
    useEffect(() => {
        if (order && isOpen) {
            const suggestedPrice = order.items && order.items.length > 0
                ? (order.items[0] as any).estimatedSaleUnitPrice || 0
                : 0
            setPrice(suggestedPrice || order.totalPrice || 0)
            setClientName('Consumidor Final')
            setNotes('')
            setDate(new Date().toISOString().split('T')[0])
        }
    }, [order, isOpen])

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm({ price, clientName, date, notes })
            onClose()
        } catch (error) {
            console.error('Error selling stock:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!order) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-none shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
                <DialogHeader className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2">
                        <DollarSign className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Registrar Venta Directa</DialogTitle>
                    <p className="text-sm text-zinc-500 font-medium">
                        Registra la salida de <span className="font-bold text-zinc-900 dark:text-zinc-100">{order.items?.[0]?.nombreProducto || 'Producto'}</span> del inventario.
                    </p>
                </DialogHeader>

                <div className="py-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">Precio de Venta Final ($)</Label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors font-black">$</span>
                                <Input
                                    type="number"
                                    value={price || ''}
                                    onChange={e => setPrice(Number(e.target.value))}
                                    className="h-14 pl-10 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 font-black text-xl focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cliente / Referencia</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                                <Input
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="h-12 pl-12 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                    placeholder="Ej: Consumidor Final, Juan Pérez, Feria..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fecha de Venta</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="h-12 pl-11 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">Lugar / Notas (Opcional)</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                                    <Input
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="h-12 pl-11 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 font-bold focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs"
                                        placeholder="Feria Rivadavia..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading || !price}
                        className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 font-black uppercase tracking-widest text-[11px]"
                    >
                        {loading ? 'Procesando...' : 'Confirmar Venta'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
