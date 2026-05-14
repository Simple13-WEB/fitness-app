/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          tint: '#eff6ff',
          10: 'rgba(59,130,246,0.1)',
        },
        'text-strong': '#2A2A2A',
        'text-primary': '#3C3C3C',
        'text-secondary': '#6A6A6A',
        'text-tertiary': '#7A7A7A',
        'text-disabled': '#9B9B9B',
        'surface-page': '#FAFAFA',
        'surface-card': '#FFFFFF',
        'surface-subtle': '#FAFAF9',
        'surface-muted': '#E8E6E1',
        success: '#6B9B7A',
        destructive: '#C85A54',
        warning: '#D97706',
        info: '#3B82F6',
      },
      spacing: {
        4.5: '18px',
      },
    },
  },
  plugins: [],
}
