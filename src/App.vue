<template>
  <v-app :class="sidebarClass">
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted, ref, computed, onBeforeUnmount } from 'vue';
import { useProjectStore } from './stores/project';
import { useUserStore } from './stores/user';
import { useTaskStore } from './stores/task';
import { useTagStore } from './stores/tag';

// Initialize stores
const projectStore = useProjectStore();
const userStore = useUserStore();
const taskStore = useTaskStore();
const tagStore = useTagStore();

// Sidebar state
const isSidebarExpanded = ref(true);

// Computed class for sidebar state
const sidebarClass = computed(() => {
  return isSidebarExpanded.value ? 'sidebar-expanded' : 'sidebar-collapsed';
});

// Load initial data
onMounted(async () => {
  try {
    // Load data in parallel
    await Promise.all([
      projectStore.fetchWorkspaces(),
      projectStore.fetchProjects(),
      userStore.fetchUsers(),
      userStore.fetchTeams(),
      taskStore.fetchColumns(),
      tagStore.fetchTags()
    ]);
    
    // Get sidebar state from localStorage
    const storedState = localStorage.getItem('sidebarExpanded');
    if (storedState !== null) {
      isSidebarExpanded.value = storedState === 'true';
    } else {
      // Default: expanded on desktop, collapsed on mobile
      isSidebarExpanded.value = window.innerWidth >= 1024;
    }
    
    // Set up storage event listener to sync sidebar state across tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Set up resize event listener
    window.addEventListener('resize', handleResize);
    
    // Initial class check
    handleResize();
    
    // Set up custom event listener for sidebar toggle
    window.addEventListener('sidebar-toggle', (e) => {
      isSidebarExpanded.value = e.detail.expanded;
    });
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

// Handle storage changes
const handleStorageChange = (event) => {
  if (event.key === 'sidebarExpanded') {
    isSidebarExpanded.value = event.newValue === 'true';
  }
};

// Update sidebar class when window size changes
const handleResize = () => {
  if (window.innerWidth < 600) {
    document.body.classList.add('mobile-view');
  } else {
    document.body.classList.remove('mobile-view');
  }
};

// Clean up
onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('sidebar-toggle', () => {});
});
</script>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif;
}

* {
  box-sizing: border-box;
}

/* Ensure app takes full height */
.v-application {
  min-height: 100vh;
}
</style>