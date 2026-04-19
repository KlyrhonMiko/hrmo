"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { register, login } from "@/lib/auth"
import { Button } from "@/components/ui/button"

type RegisterForm = {
  surname: string
  first_name: string
  middle_name?: string
  email: string
  phone_number?: string
  username: string
  password: string
  role: "admin" | "president" | "hr" | "hr-assistant" | "employee"
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<RegisterForm>({
    surname: "",
    first_name: "",
    middle_name: "",
    email: "",
    phone_number: "",
    username: "",
    password: "",
    role: "employee",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(form)
      // auto-login after register
      await login(form.username, form.password)
      // redirect to employee dashboard by default
      router.push("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
      <form onSubmit={onSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Surname</label>
            <input name="surname" value={form.surname} onChange={onChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">First name</label>
            <input name="first_name" value={form.first_name} onChange={onChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Middle name</label>
            <input name="middle_name" value={form.middle_name} onChange={onChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input name="phone_number" value={form.phone_number} onChange={onChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input name="username" value={form.username} onChange={onChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={onChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="w-full px-3 py-2 border rounded">
              <option value="employee">Employee</option>
              <option value="hr">HR Head</option>
              <option value="hr-assistant">HR Record Asst</option>
              <option value="president">President</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        </div>
      </form>
    </div>
  )
}
