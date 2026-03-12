import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"

export async function getCurrentUser(requiredRole?: string) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
  })

  if (!user) {
    redirect("/login")
  }

  if (requiredRole && user.role !== requiredRole) {
    redirect("/login")
  }

  return user
}