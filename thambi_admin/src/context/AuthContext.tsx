import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'

interface User {
    id: string
    name: string
    userid: string
    role: 'Staff' | 'Owner' | 'Admin' | 'SuperAdmin'
    restaurantId: string | null
}

interface AuthContextValue {
    user: User | null
    token: string | null
    login: (userId: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('thambi_admin_token'),
    )
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('thambi_admin_token')
        const savedUser = localStorage.getItem('thambi_admin_user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (userId: string, password: string) => {
        const res = await authApi.login(userId, password)
        const { access_token, user } = res.data
        localStorage.setItem('thambi_admin_token', access_token)
        localStorage.setItem('thambi_admin_user', JSON.stringify(user))
        setToken(access_token)
        setUser(user)
    }

    const logout = () => {
        localStorage.removeItem('thambi_admin_token')
        localStorage.removeItem('thambi_admin_user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
