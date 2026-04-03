import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    colors: ThemeColors;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>('dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeState(savedTheme);
            }
        } catch (error) {
            console.error('Failed to load theme preference', error);
        }
    };

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
