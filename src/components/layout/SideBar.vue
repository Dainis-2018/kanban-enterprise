<template>
  <v-navigation-drawer
    :model-value="true"
    :width="isExpanded ? 240 : 64"
    class="sidebar"
    border="none"
    permanent
    :class="{ 'sidebar-collapsed': !isExpanded }"
  >
    <!-- Toggle button -->
    <div class="toggle-btn-container">
      <v-btn
        icon
        variant="text"
        size="small"
        @click="toggleSidebar"
        class="toggle-btn"
      >
        <v-icon>{{ isExpanded ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
      </v-btn>
    </div>
    
    <!-- Navigation Section -->
    <div class="sidebar-section">
      <div class="sidebar-section-title" v-if="isExpanded">{{ $t('navigation.projects_hub') }}</div>
      <v-list density="compact" class="nav-list pa-0" nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :active="currentPath === item.path"
          :title="isExpanded ? item.title : ''"
          color="primary"
          rounded="lg"
          class="list-item"
        >
          <template v-slot:prepend>
            <div class="icon-wrapper">
              <v-icon>{{ item.icon }}</v-icon>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>
    
    <!-- Recent Projects Section -->
    <div class="sidebar-section" v-if="recentProjects.length > 0 && isExpanded">
      <div class="sidebar-section-title">{{ $t('projects.recent') }}</div>
      <v-list density="compact" class="recent-list pa-0" nav>
        <v-list-item
          v-for="project in recentProjects"
          :key="project.id"
          :to="`/projects/${project.id}`"
          :title="project.name"
          color="primary"
          rounded="lg"
          density="compact"
          class="list-item"
        >
          <template v-slot:prepend>
            <div class="icon-wrapper">
              <v-avatar size="18" :color="project.color || 'primary'" class="recent-avatar">
              </v-avatar>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project';

// Get current route
const route = useRoute();
const router = useRouter();
const currentPath = computed(() => route.path);

// Projects store
const projectStore = useProjectStore();

// Sidebar expanded state
const isExpanded = ref(true);

// Toggle sidebar expand/collapse
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
  
  // Store preference in localStorage for persistence
  localStorage.setItem('sidebarExpanded', isExpanded.value.toString());
  
  // Dispatch custom event for other components to react
  window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
    detail: { expanded: isExpanded.value } 
  }));
  
  // Force layout recalculation
  document.body.classList.toggle('sidebar-expanded', isExpanded.value);
  document.body.classList.toggle('sidebar-collapsed', !isExpanded.value);
};

// Main navigation items
const navigationItems = [
  { title: 'Projects Hub', path: '/', icon: 'mdi-home' },
  { title: 'Favorites', path: '/favorites', icon: 'mdi-star' },
  { title: 'Teams', path: '/teams', icon: 'mdi-account-group' },
  { title: 'Reports', path: '/reports', icon: 'mdi-chart-bar' },
];

// Recent projects (limited to 3)
const recentProjects = computed(() => {
  // Sort projects by lastUpdated (most recent first)
  return [...projectStore.projects]
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 3);
});

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

// Auto-collapse when navigating to a different route on mobile
watch(route, () => {
  // On mobile, collapse sidebar
  if (window.innerWidth < 1024) {
    isExpanded.value = false;
    localStorage.setItem('sidebarExpanded', 'false');
    
    // Update body classes
    document.body.classList.remove('sidebar-expanded');
    document.body.classList.add('sidebar-collapsed');
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { expanded: false } 
    }));
  }
});

// Initialize sidebar state from localStorage
onMounted(() => {
  // Check if there's a stored preference
  const storedState = localStorage.getItem('sidebarExpanded');
  if (storedState !== null) {
    isExpanded.value = storedState === 'true';
  } else {
    // Default: expanded on desktop, collapsed on mobile
    isExpanded.value = window.innerWidth >= 1024;
  }
  
  // Set initial body classes
  document.body.classList.toggle('sidebar-expanded', isExpanded.value);
  document.body.classList.toggle('sidebar-collapsed', !isExpanded.value);
  
  // Listen for window resize
  window.addEventListener('resize', handleResize);
});

// Handle window resize
const handleResize = () => {
  if (window.innerWidth < 1024 && isExpanded.value) {
    isExpanded.value = false;
    localStorage.setItem('sidebarExpanded', 'false');
    
    // Update body classes
    document.body.classList.remove('sidebar-expanded');
    document.body.classList.add('sidebar-collapsed');
  }
};

// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background-color: #e6e6e6;
  overflow-y: auto;
  transition: width 0.3s ease;
  position: relative;
  z-index: 100;
}

.toggle-btn-container {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.toggle-btn {
  opacity: 0.7;
}

.toggle-btn:hover {
  opacity: 1;
}

.sidebar-section {
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-section-title {
  padding: 0 20px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item {
  margin: 2px 8px;
  border-radius: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-item {
  font-size: 0.9rem;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* Styles for collapsed sidebar */
.sidebar-collapsed :deep(.v-list-item) {
  padding: 0 !important;
  justify-content: center !important;
  min-height: 40px !important;
}

.sidebar-collapsed :deep(.v-list-item__prepend) {
  min-width: unset !important;
  margin-right: 0 !important;
  margin-inline-end: 0 !important;
  display: flex;
  justify-content: center;
  width: 100%;
}

.sidebar-collapsed :deep(.v-list-item__content) {
  display: none !important;
}
</style>