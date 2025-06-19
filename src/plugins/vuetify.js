import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Custom theme colors
const lightTheme = {
  dark: false,
  colors: {
    primary: '#4a86e8', // Blue
    secondary: '#673ab7', // Purple
    accent: '#f4b400', // Yellow
    error: '#db4437', // Red
    success: '#0f9d58', // Green
    warning: '#f4b400', // Yellow
    info: '#3f51b5', // Indigo
    background: '#f9f9f9',
    surface: '#ffffff',
  },
}

// Create Vuetify instance
export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: true,
    },
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})