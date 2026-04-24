"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Role = "CUSTOMER" | "EMPLOYEE"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("CUSTOMER")
  const [departments, setDepartments] = useState<string[]>([])
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    organisation: "",
    department: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => {
        // fetch departments from department master
      })
    // fetch departments
    fetch("/api/departments")
      .then(r => r.json())
      .then(data => setDepartments(data.departments ?? []))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async () => {
    setError("")

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (role === "CUSTOMER" && form.mobileNumber && form.mobileNumber.length !== 10) {
      setError("Mobile number must be 10 digits.")
      return
    }
    if (role === "EMPLOYEE" && !form.department) {
      setError("Please select a department.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        mobileNumber: role === "CUSTOMER" ? form.mobileNumber || undefined : undefined,
        organisation: role === "CUSTOMER" ? form.organisation || undefined : undefined,
        department: role === "EMPLOYEE" ? form.department : undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/login?registered=true")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-sky-100 to-indigo-200">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl border border-white/40 backdrop-blur-sm bg-white/80">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold">Create Account</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Register to get started</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Role toggle */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {(["CUSTOMER", "EMPLOYEE"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setError("") }}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  role === r
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input name="name" placeholder="Enter your full name" value={form.name} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleRegister()} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleRegister()} className="rounded-xl" />
          </div>

          {/* Customer-only fields */}
          {role === "CUSTOMER" && (
            <>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Input name="organisation" placeholder="Enter your company/organisation" value={form.organisation} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleRegister()} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input name="mobileNumber" placeholder="10-digit mobile number" value={form.mobileNumber} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleRegister()} className="rounded-xl" maxLength={10} />
              </div>
            </>
          )}

          {/* Employee-only fields */}
          {role === "EMPLOYEE" && (
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all hover:border-slate-300"
              >
                <option value="">Select a department</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Password</Label>
            <Input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleRegister()} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input name="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleRegister()} className="rounded-xl" />
          </div>

          <Button onClick={handleRegister} disabled={loading} className="w-full rounded-xl cursor-pointer">
            {loading ? "Registering..." : "Register"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} className="text-primary cursor-pointer hover:underline">
              Login
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}