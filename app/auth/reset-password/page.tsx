'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updatePassword } from '@/app/auth/actions'
import { Loader2, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(event.currentTarget)
        const result = await updatePassword(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            setSuccess(result.success)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f5f5f5] dark:bg-zinc-950 font-sans">
            {/* Header */}
            <header className="flex h-16 items-center bg-primary px-8 dark:bg-zinc-900 shadow-sm">
                <div className="flex items-center gap-2 text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                        <Lock className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">ProdManager</span>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center p-8">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between pt-12">
                    {/* Left Side: Title */}
                    <div className="max-w-md lg:pt-12 text-center lg:text-left space-y-6">
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                            Elegí una nueva <span className="text-primary italic">Contraseña</span>
                        </h1>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-left">
                            Asegurate de usar una combinación segura de letras y números.
                        </p>
                    </div>

                    {/* Right Side: Card */}
                    <div className="w-full max-w-[440px]">
                        <div className="rounded-[2.5rem] bg-white p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:bg-zinc-900 border border-white">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                                        Nueva clave
                                    </h2>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-6 text-xs font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                            <span>{success}</span>
                                        </div>
                                        <Link
                                            href="/login"
                                            className="h-14 w-full rounded-2xl bg-primary px-6 font-black text-sm uppercase tracking-[0.1em] text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                        >
                                            <span>Ir al Login</span>
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="password"
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1"
                                            >
                                                Nueva Contraseña
                                            </label>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="flex h-14 w-full rounded-2xl border-2 border-zinc-100 bg-transparent px-5 text-sm font-bold transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 dark:border-zinc-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1"
                                            >
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="flex h-14 w-full rounded-2xl border-2 border-zinc-100 bg-transparent px-5 text-sm font-bold transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 dark:border-zinc-800"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="h-14 w-full rounded-2xl bg-zinc-950 px-6 font-black text-sm uppercase tracking-[0.1em] text-white shadow-xl shadow-zinc-200 hover:shadow-2xl hover:shadow-zinc-300 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-zinc-950 flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <span>Cambiar Contraseña</span>
                                            )}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 sm:flex-row">
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Términos y condiciones</Link>
                        <Link href="/help" className="hover:text-primary transition-colors">Ayuda</Link>
                    </div>
                    <p>© 2024 ProdManager Inc. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
