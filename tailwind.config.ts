import type { Config } from 'tailwindcss'

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './camadas/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './error.vue'
  ],
  theme: {
    screens: {
      '3xs': '360px',
      '2xs': '375px',
      xs: '475px',
      tablet: '520px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    },
    extend: {
      colors: {
        bg: withOpacity('--color-bg'),
        surface: withOpacity('--color-surface'),
        'surface-muted': withOpacity('--color-surface-muted'),
        border: withOpacity('--color-border'),
        text: withOpacity('--color-text'),
        'text-muted': withOpacity('--color-text-muted'),
        primary: withOpacity('--color-primary'),
        'primary-contrast': withOpacity('--color-primary-contrast'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger')
      }
    }
  },
  plugins: []
} satisfies Config
