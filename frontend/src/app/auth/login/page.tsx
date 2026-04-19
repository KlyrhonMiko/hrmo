"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login, ROLE_HOME, getStoredUser } from "@/lib/auth"
import type { BackendRole } from "@/lib/auth"
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react"

interface FormState {
    username_or_email: string
    password: string
}

export default function LoginPage() {
    const router = useRouter()
    const [form, setForm] = useState<FormState>({ username_or_email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // If already logged in, redirect to their home
    useEffect(() => {
        const stored = getStoredUser()
        if (stored) {
            const home = ROLE_HOME[stored.role as BackendRole]
            if (home) router.replace(home)
        }
    }, [router])

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const user = await login(form.username_or_email, form.password)
            const home = ROLE_HOME[user.role as BackendRole] ?? "/"
            router.push(home)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Authentication failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-stone-50">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg leading-tight">HRMO</p>
                        <p className="text-green-200 text-[11px] tracking-widest uppercase">Management System</p>
                    </div>
                </div>

                <div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Human Resources
                        <br />
                        Management Office
                    </h1>
                    <p className="text-green-100/80 text-lg leading-relaxed max-w-md">
                        Streamlining personnel records, training management, and compliance reporting across all offices.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">201</p>
                        <p className="text-green-200 text-xs tracking-wide uppercase mt-0.5">Employee Files</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">4</p>
                        <p className="text-green-200 text-xs tracking-wide uppercase mt-0.5">Role Levels</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">100%</p>
                        <p className="text-green-200 text-xs tracking-wide uppercase mt-0.5">Secure Access</p>
                    </div>
                </div>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile branding */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-stone-800">HRMO System</p>
                            <p className="text-stone-400 text-xs">Management Portal</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-stone-900">Welcome back</h2>
                        <p className="text-stone-500 text-sm mt-1">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                Email or Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                                <input
                                    id="login-username"
                                    name="username_or_email"
                                    type="text"
                                    required
                                    autoComplete="username"
                                    value={form.username_or_email}
                                    onChange={onChange}
                                    placeholder="Enter your email or username"
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                                <input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                                />
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-stone-400">
                        Secure authentication powered by HRMO &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    )
}
