import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Optimize template compilation
          hoistStatic: true,
          cacheHandlers: true
        }
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils')
    },
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        // Global variables are now included in unified.scss
        // Remove the need for additionalData injection
        charset: false,
        api: 'modern-compiler'
      }
    },
    devSourcemap: true,
    // CSS code splitting optimization
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Build optimizations
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for external libraries
          vendor: ['vue', 'vue-router', 'pinia'],
          
          // UI library chunk
          ui: ['vuetify'],
          
          // Rich text editor chunk
          editor: [
            '@tiptap/core', 
            '@tiptap/starter-kit', 
            '@tiptap/vue-3',
            '@tiptap/extension-link',
            '@tiptap/extension-task-item',
            '@tiptap/extension-task-list'
          ],
          
          // Data visualization chunk
          visualization: ['vis-data', 'vis-timeline'],
          
          // Utilities chunk
          utils: ['lodash', 'date-fns', 'axios']
        },
        
        // Optimize asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          return facadeModuleId && facadeModuleId.includes('node_modules')
            ? 'vendor/[name].[hash].js'
            : 'assets/[name].[hash].js'
        },
        
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name].[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name].[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `styles/[name].[hash][extname]`
          }
          return `assets/[name].[hash][extname]`
        }
      }
    },
    
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },
    
    // Target modern browsers for better optimization
    target: 'es2020',
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    // Proxy API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vuetify',
      'axios',
      'lodash',
      'date-fns'
    ],
    exclude: [
      // Exclude large packages that should be loaded dynamically
      'vis-timeline'
    ]
  },
  
  // Define global constants
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  
  // Environment variables
  envPrefix: ['VITE_', 'VUE_'],
  
  // Performance and caching
  esbuild: {
    // Tree shaking optimization
    treeShaking: true,
    // Drop console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})