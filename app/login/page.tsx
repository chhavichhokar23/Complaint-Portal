"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}

 function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }
    
    if (res.ok) {
      localStorage.setItem("userId", data.id)
      localStorage.setItem("role", data.role)

      if (data.role === "ADMIN") {
        router.push("/dashboard/admin")
      } else if (data.role === "EMPLOYEE") {
        router.push("/dashboard/employee")
      } else {
        router.push("/dashboard/customer")
      }
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-sky-100 to-indigo-200">
    <Card className="w-full max-w-md rounded-3xl shadow-2xl border border-white/40 backdrop-blur-sm bg-white/80">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-semibold">
          Welcome
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Login
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          {registered && (
            <p className="text-sm text-green-600 text-center bg-green-50 rounded-xl px-3 py-2">
              Registration successful! Your account is awaiting admin approval.
            </p>
          )}
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="rounded-xl"
          />
        </div>

        <Button
          onClick={handleLogin}
          className="w-full rounded-xl cursor-pointer"
        >
          Login
        </Button>
        <p className="text-center text-sm text-muted-foreground">
            New user?{" "}
            <span onClick={() => router.push("/register")} className="text-primary cursor-pointer hover:underline">
              Register here
            </span>
          </p>
      </CardContent>
    </Card>
  </div>
);
}