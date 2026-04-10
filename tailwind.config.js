/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#dbe4ff',
                    200: '#bac8ff',
                    300: '#91a7ff',
                    400: '#748ffc',
                    500: '#5c7cfa',
                    600: '#4c6ef5',
                    700: '#4263eb',
                    800: '#3b5bdb',
                    900: '#364fc7',
                },
                accent: {
                    50: '#fff0f6',
                    100: '#ffdeeb',
                    200: '#fcc2d7',
                    300: '#faa2c1',
                    400: '#f783ac',
                    500: '#f06595',
                    600: '#e64980',
                    700: '#d6336c',
                    800: '#c2255c',
                    900: '#a61e4d',
                },
                dark: {
                    50: '#C1C2C5',
                    100: '#A6A7AB',
                    200: '#909296',
                    300: '#5C5F66',
                    400: '#373A40',
                    500: '#2C2E33',
                    600: '#25262B',
                    700: '#1A1B1E',
                    800: '#141517',
                    900: '#101113',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'Georgia', 'serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'gradient-ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'gradient-forest': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
                'glow': '0 0 20px rgba(92, 124, 250, 0.3)',
                'glow-accent': '0 0 20px rgba(240, 101, 149, 0.3)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'slide-down': 'slide-down 0.5s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(92, 124, 250, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(92, 124, 250, 0.6)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
