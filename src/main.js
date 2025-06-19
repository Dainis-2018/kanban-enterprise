import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import vuetify from './plugins/vuetify'

// Import unified styles (replaces all separate style files)
import './assets/styles/unified.scss'

// Create the app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)

// Enhanced click outside directive with better performance
app.directive('click-outside', {
  mounted(el, binding) {
    // Use passive listeners for better performance
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    
    // Add listener with options for better performance
    document.addEventListener('click', el._clickOutside, { 
      passive: true,
      capture: false 
    });
  },
  unmounted(el) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside);
      delete el._clickOutside;
    }
  }
});

// Enhanced theme management
const themeManager = {
  init() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(systemPrefersDark ? 'dark' : 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },
  
  setTheme(theme) {
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme } 
    }));
  },
  
  toggle() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    this.setTheme(isDark ? 'light' : 'dark');
  }
};

// Enhanced sidebar state management
const sidebarManager = {
  init() {
    // Get initial state from localStorage with fallback
    const storedState = localStorage.getItem('sidebarExpanded');
    const isExpanded = storedState !== null 
      ? storedState === 'true' 
      : window.innerWidth >= 1024;
    
    this.setState(isExpanded);
    
    // Listen for resize events to auto-collapse on mobile
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth < 768) {
          this.setState(false);
        }
      }, 150);
    });
    
    // Listen for storage events (for cross-tab sync)
    window.addEventListener('storage', (event) => {
      if (event.key === 'sidebarExpanded') {
        this.setState(event.newValue === 'true');
      }
    });
  },
  
  setState(expanded) {
    // Update body classes
    document.body.classList.toggle('sidebar-expanded', expanded);
    document.body.classList.toggle('sidebar-collapsed', !expanded);
    
    // Save to localStorage
    localStorage.setItem('sidebarExpanded', expanded.toString());
    
    // Dispatch event for components
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { expanded } 
    }));
  },
  
  toggle() {
    const isExpanded = document.body.classList.contains('sidebar-expanded');
    this.setState(!isExpanded);
  }
};

// Performance optimization: Intersection Observer for lazy loading
const observerManager = {
  observers: new Map(),
  
  createLazyLoadObserver() {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            this.observers.get('lazyLoad').unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
  },
  
  init() {
    // Lazy loading observer
    this.observers.set('lazyLoad', this.createLazyLoadObserver());
    
    // Animation observer for performance
    this.observers.set('animations', new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }));
  }
};

// Initialize managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  themeManager.init();
  sidebarManager.init();
  observerManager.init();
  
  // Add global CSS classes for enhanced functionality
  document.documentElement.classList.add('enhanced-styles');
  document.body.classList.add('app-ready');
});

// Global error handling for better UX
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Could integrate with error tracking service here
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Could integrate with error tracking service here
});

// Expose utilities globally for use in components
window.appUtils = {
  theme: themeManager,
  sidebar: sidebarManager,
  observers: observerManager
};

// Mount the app
app.mount('#app')

// Performance monitoring (optional)
if (typeof window.performance !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.info('App Performance:', {
        'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        'Load Complete': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        'Total Load Time': Math.round(perfData.loadEventEnd - perfData.fetchStart)
      });
    }, 1000);
  });
}