<template>
  <div class="main-layout">
    <TopBar />
    <div class="layout-container">
      <SideBar />
      <main
        class="main-content"
        :class="{ 'sidebar-expanded': isSidebarExpanded, 'sidebar-collapsed': !isSidebarExpanded }"
        @click="handleMainContentClick"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import TopBar from './TopBar.vue';
import SideBar from './SideBar.vue';

// Create a reactive reference for the sidebar state
const isSidebarExpanded = ref(true);

// Handle clicks on the main content area
const handleMainContentClick = () => {
  // Only collapse on mobile
  if (window.innerWidth < 1024) {
    isSidebarExpanded.value = false;
    localStorage.setItem('sidebarExpanded', 'false');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { expanded: false } 
    }));
  }
};

// Listen for sidebar toggle events
const handleSidebarToggle = (event) => {
  isSidebarExpanded.value = event.detail.expanded;
};

// Initialize sidebar state
onMounted(() => {
  // Get initial state from localStorage
  const storedState = localStorage.getItem('sidebarExpanded');
  if (storedState !== null) {
    isSidebarExpanded.value = storedState === 'true';
  } else {
    // Default: expanded on desktop, collapsed on mobile
    isSidebarExpanded.value = window.innerWidth >= 1024;
  }
  
  // Listen for sidebar toggle events
  window.addEventListener('sidebar-toggle', handleSidebarToggle);
  
  // Listen for storage events (for cross-tab sync)
  window.addEventListener('storage', (event) => {
    if (event.key === 'sidebarExpanded') {
      isSidebarExpanded.value = event.newValue === 'true';
    }
  });
});

// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener('sidebar-toggle', handleSidebarToggle);
  window.removeEventListener('storage', () => {});
});
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 4; /* Lower z-index for the container */
}

.main-content {
  flex: 1;
  overflow: auto;
  background-color: var(--v-background-base, #f9f9f9);
  padding: 0;
  transition: margin-left 0.3s ease;
  position: relative;
  z-index: 3; /* Lowest z-index for the main content */
}

.main-content.sidebar-expanded {
  margin-left: 240px;
}

.main-content.sidebar-collapsed {
  margin-left: 64px;
}

@media (max-width: 600px) {
  .main-content.sidebar-expanded,
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>