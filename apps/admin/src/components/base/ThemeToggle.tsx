import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../hooks/useTheme';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes: { value: Theme; label: string; icon: string }[] = [
        { value: 'light', label: 'Claro', icon: 'ri-sun-line' },
        { value: 'dark', label: 'Escuro', icon: 'ri-moon-line' },
        { value: 'system', label: 'Sistema', icon: 'ri-computer-line' },
    ];

    const currentTheme = themes.find((t) => t.value === theme);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                aria-label="Alterar tema"
            >
                <i
                    className={`${currentTheme?.icon} w-4 h-4 flex items-center justify-center mr-2`}
                ></i>
                <span className="hidden sm:inline">{currentTheme?.label}</span>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center ml-1"></i>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                        <div className="py-1">
                            {themes.map((themeOption) => (
                                <button
                                    key={themeOption.value}
                                    onClick={() => handleThemeChange(themeOption.value)}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap flex items-center ${
                                        theme === themeOption.value
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <i
                                        className={`${themeOption.icon} w-4 h-4 flex items-center justify-center mr-3`}
                                    ></i>
                                    {themeOption.label}
                                    {theme === themeOption.value && (
                                        <i className="ri-check-line w-4 h-4 flex items-center justify-center ml-auto text-primary-600 dark:text-primary-400"></i>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
