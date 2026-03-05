import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ARS') {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency,
    }).format(amount)
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
    }).format(date)
}
