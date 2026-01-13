/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0a0f1c',
                'bg-secondary': '#111827',
                'bg-card': '#1a2332',
                'accent': '#f0b90b',
                'accent-light': '#fcd535',
                'success': '#34d399',
                'danger': '#f87171',
                'warning': '#fbbf24',
                'border': '#1e3a5f',
            },
            fontFamily: {
                sans: ['Noto Sans SC', 'Space Grotesk', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'bounce-slow': 'bounce 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
