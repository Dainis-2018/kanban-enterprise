import { createI18n } from 'vue-i18n'

// Import language files
import en from '../locales/en.json'

// Available languages
const messages = {
  en,
}

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en', // Set default locale
  fallbackLocale: 'en',
  messages,
})

export default i18n