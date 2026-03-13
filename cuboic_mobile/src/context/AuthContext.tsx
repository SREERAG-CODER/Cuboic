import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin } from '../api/auth';
import type { AuthUser } from '../api/auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (userId: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session on app start
    useEffect(() => {
        (async () => {
            try {
                const stored = await SecureStore.getItemAsync('auth_user');
                if (stored) setUser(JSON.parse(stored));
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = async (userId: string, password: string) => {
        const data = await apiLogin({ userId, password });
        await SecureStore.setItemAsync('access_token', data.access_token);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('auth_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
