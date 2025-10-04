"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface Educator {
  id: string
  name: string
  email: string
  // Add other educator fields as needed
}

interface AuthContextType {
  educator: Educator | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, educatorData: Educator) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [educator, setEducator] = useState<Educator | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem("faculty-pedia-auth-token")
    const educatorData = localStorage.getItem("faculty-pedia-educator-data")

    if (token && educatorData) {
      try {
        const parsedEducator = JSON.parse(educatorData)
        setEducator(parsedEducator)
      } catch (error) {
        console.error("Error parsing educator data:", error)
        // Clear invalid data
        localStorage.removeItem("faculty-pedia-auth-token")
        localStorage.removeItem("faculty-pedia-educator-data")
        localStorage.removeItem("user-role")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (token: string, educatorData: Educator) => {
    localStorage.setItem("faculty-pedia-auth-token", token)
    localStorage.setItem("faculty-pedia-educator-data", JSON.stringify(educatorData))
    localStorage.setItem("user-role", "educator")
    setEducator(educatorData)
  }

  const logout = () => {
    localStorage.removeItem("faculty-pedia-auth-token")
    localStorage.removeItem("faculty-pedia-educator-data")
    localStorage.removeItem("user-role")
    setEducator(null)
    router.push("/")
  }

  const value = {
    educator,
    isAuthenticated: !!educator,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
