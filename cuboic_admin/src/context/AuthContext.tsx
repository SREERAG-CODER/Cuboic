import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'

interface User {
    id: string
    name: string
    userid: string
    role: 'Staff' | 'Owner'
    restaurantId: string
}

interface AuthContextValue {
    user: User | null
    token: string | null
    login: (userid: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('cuboic_admin_token'),
    )
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('cuboic_admin_token')
        const savedUser = localStorage.getItem('cuboic_admin_user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (userid: string, password: string) => {
        const res = await authApi.login(userid, password)
        const { access_token, user } = res.data
        localStorage.setItem('cuboic_admin_token', access_token)
        localStorage.setItem('cuboic_admin_user', JSON.stringify(user))
        setToken(access_token)
        setUser(user)
    }

    const logout = () => {
        localStorage.removeItem('cuboic_admin_token')
        localStorage.removeItem('cuboic_admin_user')
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
