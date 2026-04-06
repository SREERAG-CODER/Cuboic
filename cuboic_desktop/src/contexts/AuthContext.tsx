import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Role = 'Admin' | 'Owner' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen' | 'Staff'

interface AuthUser {
  userId: string
  role: Role
  restaurantId: string
  outletId: string
}

interface AuthContextType {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  isLoading: boolean
  login: (token: string, outletId: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      if (window.ipcRenderer) {
        const storedAuth = await window.ipcRenderer.invoke('auth:get-token')
        if (storedAuth && storedAuth.token) {
          const payloadBase64 = storedAuth.token.split('.')[1]
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64))
            setUser({
              userId: decoded.userId,
              role: decoded.role as Role,
              restaurantId: decoded.restaurantId,
              outletId: storedAuth.outletId
            })
          }
        } else {
          setUser(null)
        }
      } else {
        // Dev fallback using localStorage for persistence
        const token = localStorage.getItem('token')
        const outletId = localStorage.getItem('outletId')
        
        if (token && outletId) {
          const payloadBase64 = token.split('.')[1]
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64))
            setUser({
              userId: decoded.userId,
              role: decoded.role as Role,
              restaurantId: decoded.restaurantId,
              outletId: outletId
            })
          }
        } else {
          setUser(null)
        }
      }
    } catch (err) {
      console.error("Auth Decode Error", err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (token: string, outletId: string) => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('auth:store-token', token, outletId)
      await checkAuth()
    } else {
      // Dev mode: Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('outletId', outletId)
      await checkAuth()
    }
  }

  const logout = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('auth:clear-token')
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('outletId')
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
