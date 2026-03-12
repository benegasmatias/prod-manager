'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login, signInWithGoogle } from '@/app/auth/actions'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true)
        const result = await signInWithGoogle()
        if (result?.error) {
            setError(result.error)
            setGoogleLoading(false)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
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
                            Iniciá sesión en tu panel de <span className="text-primary italic">Producción</span>
                        </h1>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 transition-all hover:shadow-md cursor-help group max-w-sm mx-auto lg:mx-0">
                                <div className="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">¿Tenés problemas?</p>
                                    <p className="text-xs text-zinc-500 font-medium">Contactá con soporte técnico</p>
                                </div>
                            </div>
                            <Link 
                                href="/help" 
                                className="text-sm font-bold text-primary hover:underline ml-2"
                            >
                                Necesito ayuda
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Card */}
                    <div className="w-full max-w-[440px]">
                        <div className="rounded-[2.5rem] bg-white p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:bg-zinc-900 border border-white">
                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1"
                                    >
                                        E-mail o usuario
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="Ingresá tu correo"
                                        className="flex h-14 w-full rounded-2xl border-2 border-zinc-100 bg-transparent px-5 text-sm font-bold transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label
                                            htmlFor="password"
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
                                        >
                                            Contraseña
                                        </label>
                                        <Link 
                                            href="/forgot-password" 
                                            className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline transition-all"
                                        >
                                            ¿Olvidaste?
                                        </Link>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        className="flex h-14 w-full rounded-2xl border-2 border-zinc-100 bg-transparent px-5 text-sm font-bold transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:focus:border-primary"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-4 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="h-14 w-full rounded-2xl bg-primary px-6 font-black text-sm uppercase tracking-[0.1em] text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Entrando...</span>
                                            </>
                                        ) : (
                                            <span>Continuar</span>
                                        )}
                                    </button>

                                    <div className="pt-2 text-center">
                                        <Link
                                            href="/register"
                                            className="text-sm font-bold text-primary hover:underline"
                                        >
                                            Crear cuenta
                                        </Link>
                                    </div>
                                </div>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="bg-white px-4 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">O</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading || loading}
                                    className="h-14 w-full rounded-2xl border-2 border-zinc-100 bg-white px-6 font-bold text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-4"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-zinc-600 dark:text-zinc-300">Iniciar sesión con Google</span>
                                </button>
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
