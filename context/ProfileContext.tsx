"use client"

import { createContext, useState, ReactNode, useContext } from "react"

type ProfileUser = {
  name: string
  email: string
  mobileNumber: string | null
  organisationId: string | null
  organisation: { id: string; name: string } | null
  department: string | null
  role: string
}

interface ProfileContextType {
  profileOpen: boolean
  setProfileOpen: (open: boolean) => void
  currentProfile: ProfileUser | undefined
  setCurrentProfile: (profile: ProfileUser | undefined) => void
  updateProfile: (updated: Partial<ProfileUser>) => void
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({
  children,
  initialProfile,
}: {
  children: ReactNode
  initialProfile?: ProfileUser
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<ProfileUser | undefined>(initialProfile)

  const updateProfile = (updated: Partial<ProfileUser>) => {
    setCurrentProfile(prev => prev ? { ...prev, ...updated } : prev)
  }

  return (
    <ProfileContext.Provider
      value={{
        profileOpen,
        setProfileOpen,
        currentProfile,
        setCurrentProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider")
  }
  return context
}
