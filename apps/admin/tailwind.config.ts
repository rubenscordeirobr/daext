import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fffbf0',
                    100: '#fff6e0',
                    200: '#ffecb3',
                    300: '#ffe285',
                    400: '#ffd966',
                    500: '#ffbf00',
                    600: '#e6ac00',
                    700: '#cc9900',
                    800: '#b38600',
                    900: '#997300',
                },
            },
            animation: {
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
