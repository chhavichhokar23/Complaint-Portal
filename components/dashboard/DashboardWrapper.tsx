"use client"

import Navbar from "./Navbar"
import ProfileModal from "./ProfileModal"
import { ProfileProvider, useProfile } from "@/context/ProfileContext"

type ProfileUser = {
  name: string
  email: string
  mobileNumber: string | null
  organisationId: string | null
  organisation: { id: string; name: string } | null
  department: string | null
  role: string
}

interface DashboardWrapperProps {
  user?: {
    name?: string | null
    role?: string | null
  }
  children: React.ReactNode
  profileUser?: ProfileUser
}

function DashboardWrapperContent({ user, children }: Omit<DashboardWrapperProps, "profileUser">) {
  const { profileOpen, setProfileOpen, currentProfile, updateProfile } = useProfile()

  return (
    <>
      <Navbar user={user} onProfileClick={() => setProfileOpen(true)} />
      {children}
      {currentProfile && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={currentProfile}
          role={currentProfile.role as "ADMIN" | "EMPLOYEE" | "CUSTOMER" | undefined}
          onSaved={updateProfile}
        />
      )}
    </>
  )
}

export default function DashboardWrapper({
  user,
  children,
  profileUser,
}: DashboardWrapperProps) {
  return (
    <ProfileProvider initialProfile={profileUser}>
      <DashboardWrapperContent user={user}>{children}</DashboardWrapperContent>
    </ProfileProvider>
  )
}

