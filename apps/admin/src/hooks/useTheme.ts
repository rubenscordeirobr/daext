import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'app-theme';

export function useTheme(): ThemeContextType {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return (stored as Theme) || 'system';
    });

    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme === 'dark' ? 'dark' : 'light';
    });

    useEffect(() => {
        const updateActualTheme = () => {
            if (theme === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setActualTheme(isDark ? 'dark' : 'light');
            } else {
                setActualTheme(theme === 'dark' ? 'dark' : 'light');
            }
        };

        updateActualTheme();

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateActualTheme);
            return () => mediaQuery.removeEventListener('change', updateActualTheme);
        }
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        if (actualTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [actualTheme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    return {
        theme,
        actualTheme,
        setTheme,
    };
}
