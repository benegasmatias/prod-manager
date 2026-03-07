import { Card, CardContent } from '@/src/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface StatCardProps {
    title: string
    value: React.ReactNode
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        label: string
        isPositive: boolean
    }
    className?: string
    color?: 'primary' | 'emerald' | 'amber' | 'blue' | 'rose'
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    color = 'primary'
}: StatCardProps) {
    const colorStyles = {
        primary: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15 transition-colors",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15 transition-colors",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15 transition-colors",
        rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15 transition-colors",
    }

    return (
        <Card className={cn("overflow-hidden border-zinc-200/60 dark:border-zinc-800/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">{title}</p>
                        <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{value}</h3>

                        {(description || trend) && (
                            <div className="mt-3 flex items-center gap-2">
                                {trend && (
                                    <div className={cn(
                                        "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                        trend.isPositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                                    )}>
                                        {trend.isPositive ? '+' : '-'}{trend.value}%
                                    </div>
                                )}
                                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    {description}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl border",
                        colorStyles[color]
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
            <div className={cn(
                "h-1 w-full opacity-50",
                color === 'primary' && "bg-primary",
                color === 'emerald' && "bg-emerald-500",
                color === 'amber' && "bg-amber-500",
                color === 'blue' && "bg-blue-500",
                color === 'rose' && "bg-rose-500",
            )} />
        </Card>
    )
}
