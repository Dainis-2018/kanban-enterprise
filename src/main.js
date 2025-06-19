import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import vuetify from './plugins/vuetify'

// Import global styles
import './assets/styles/main.scss'
import './assets/styles/sidebar.scss'
import './assets/styles/app.scss'
import './assets/styles/z-index.scss'  // New z-index management
import './assets/styles/fixes.css'    // CSS fixes for z-index issues

// Create the app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)

// Add a global directive to track clicks outside sidebar
app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el._clickOutside);
  }
});

// Add global CSS classes for z-index management
document.documentElement.classList.add('z-index-fix');

// Mount the app
app.mount('#app')

// Global event listening for layout adjustments
window.addEventListener('sidebar-toggle', (event) => {
  if (event.detail.expanded) {
    document.body.classList.add('sidebar-expanded');
    document.body.classList.remove('sidebar-collapsed');
  } else {
    document.body.classList.remove('sidebar-expanded');
    document.body.classList.add('sidebar-collapsed');
  }
});

// Initialize body class based on saved sidebar state
document.addEventListener('DOMContentLoaded', () => {
  const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
  
  if (sidebarExpanded) {
    document.body.classList.add('sidebar-expanded');
    document.body.classList.remove('sidebar-collapsed');
  } else {
    document.body.classList.remove('sidebar-expanded');
    document.body.classList.add('sidebar-collapsed');
  }
  
  // Add CSS class for z-index fixes
  document.body.classList.add('vue-fixed-zindex');
});