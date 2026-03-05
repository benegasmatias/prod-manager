import { formatCurrency } from '@/src/lib/utils'
import { useNegocio } from '../context/NegocioContext'

interface MoneyProps {
    amount: number
    className?: string
}

export function Money({ amount, className }: MoneyProps) {
    const { negocioActivo } = useNegocio()
    return <span className={className}>{formatCurrency(amount, negocioActivo?.moneda)}</span>
}
