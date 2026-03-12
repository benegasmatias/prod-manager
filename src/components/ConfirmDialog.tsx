'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'primary'
    isLoading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'primary',
    isLoading = false
}: ConfirmDialogProps) {
    const isDanger = variant === 'danger'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden sm:max-w-[400px] bg-white dark:bg-zinc-950">
                {/* Header con estilo premium */}
                <div className={cn(
                    "p-8 pb-6 relative overflow-hidden",
                    isDanger ? "bg-red-50/50 dark:bg-red-950/10" : "bg-primary/5 dark:bg-primary/10"
                )}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <AlertTriangle size={80} className={isDanger ? "text-red-600" : "text-primary"} />
                    </div>

                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                                isDanger ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                            )}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                                    {title}
                                </DialogTitle>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                    Acción Requerida
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-8 pb-4 pt-6 text-center sm:text-left">
                    <DialogDescription className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed md:pr-4">
                        {description}
                    </DialogDescription>
                </div>

                <DialogFooter className="p-8 pt-4 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] sm:flex-1"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={cn(
                            "h-12 rounded-xl font-black uppercase tracking-widest text-[10px] sm:flex-[1.5] shadow-lg",
                            isDanger
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                                : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
