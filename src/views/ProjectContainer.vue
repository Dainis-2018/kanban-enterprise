<template>
  <div class="project-container">
    <!-- Project Navigation - Highest z-index -->
    <div class="project-navigation">
      <!-- Project Navigation Tabs with Back Button - Highest z-index -->
      <v-card flat class="tab-container px-4 py-0 mb-0">
        <div class="d-flex align-center">
          <!-- Back to Hub Button (styled like a tab) -->
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            to="/"
            color="primary"
            class="back-tab"
            size="small"
          >
            {{ $t('navigation.back_to_hub') }}
          </v-btn>

          <!-- Project Navigation Tabs -->
          <v-tabs
            v-model="activeTab"
            color="primary"
            show-arrows
            class="project-tabs mb-0 pb-0"
            height="40"
            elevation="1"
          >
            <v-tab
              v-for="tab in projectTabs"
              :key="tab.value"
              :value="tab.value"
              :to="getTabRoute(tab.value)"
              class="tab-button"
            >
              <v-icon :icon="tab.icon" start></v-icon>
              {{ tab.label }}
            </v-tab>
          </v-tabs>
        </div>
      </v-card>
    </div>
    
    <!-- Project Content Area -->
    <div class="project-content">
      <router-view v-if="currentProject" />
      
      <!-- Loading State -->
      <div v-else-if="loadingProject" class="d-flex justify-center align-center full-height">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>
      
      <!-- Error State -->
      <div v-else class="d-flex flex-column justify-center align-center full-height">
        <v-icon icon="mdi-alert-circle-outline" color="error" size="64" class="mb-4"></v-icon>
        <h2 class="text-h5 mb-2">Project Not Found</h2>
        <p class="text-subtitle-1 text-medium-emphasis">The project you're looking for doesn't exist or you don't have access to it.</p>
        <v-btn
          color="primary"
          class="mt-4"
          to="/"
        >
          Return to Projects Hub
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useTaskStore } from '../stores/task';

// Route and router
const route = useRoute();
const router = useRouter();

// Stores
const projectStore = useProjectStore();
const taskStore = useTaskStore();

// Active tab
const activeTab = ref(null);

// Loading state
const loadingProject = ref(true);

// Set up project tabs
const projectTabs = [
  { value: 'kanban', label: 'Kanban Board', icon: 'mdi-view-dashboard-outline', path: '' },
  { value: 'roadmap', label: 'Roadmap', icon: 'mdi-timeline-outline', path: 'roadmap' },
  { value: 'reports', label: 'Reports', icon: 'mdi-chart-box-outline', path: 'reports' },
  { value: 'settings', label: 'Settings', icon: 'mdi-cog-outline', path: 'settings' }
];

// Get route path for tab
const getTabRoute = (tabValue) => {
  const tab = projectTabs.find(t => t.value === tabValue);
  
  if (tabValue === 'kanban') {
    return `/projects/${route.params.id}`;
  }
  
  return `/projects/${route.params.id}/${tab.path}`;
};

// Get active tab label
const getActiveTabLabel = () => {
  if (!activeTab.value) return '';
  const tab = projectTabs.find(t => t.value === activeTab.value);
  return tab ? tab.label : '';
};

// Current project
const currentProject = computed(() => {
  const projectId = route.params.id;
  return projectStore.getProjectById(projectId);
});

// Set active tab based on route
const setActiveTabFromRoute = () => {
  const path = route.path;
  
  if (path.endsWith('/roadmap')) {
    activeTab.value = 'roadmap';
  } else if (path.endsWith('/reports')) {
    activeTab.value = 'reports';
  } else if (path.endsWith('/settings')) {
    activeTab.value = 'settings';
  } else {
    activeTab.value = 'kanban';
  }
};

// Fetch project and tasks data
const fetchProjectData = async () => {
  loadingProject.value = true;
  
  const projectId = route.params.id;
  
  // If projects haven't been loaded yet
  if (projectStore.projects.length === 0) {
    await projectStore.fetchProjects();
  }
  
  // Set current project in store
  projectStore.setCurrentProject(projectId);
  
  // Fetch tasks for this project
  await taskStore.fetchTasks(projectId);
  
  loadingProject.value = false;
};

// Watch for route changes to update active tab
watch(() => route.path, () => {
  setActiveTabFromRoute();
}, { immediate: true });

// Initialize component
onMounted(async () => {
  await fetchProjectData();
  setActiveTabFromRoute();
});

// Watch for project ID changes to reload data
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    await fetchProjectData();
  }
});
</script>

<style>
/* These styles are applied globally - not scoped */
.tab-button {
  position: relative !important;
  z-index: 1000 !important;
}

.v-tab.v-tab {
  position: relative !important;
  z-index: 1000 !important;
}

.v-tabs.v-tabs {
  position: relative !important;
  z-index: 1000 !important;
}

.project-tabs {
  position: relative !important;
  z-index: 1000 !important;
}

.tab-container {
  position: relative !important;
  z-index: 1000 !important;
}

/* Back button tab-style */
.back-tab {
  height: 40px !important;
  border-radius: 0 !important;
  padding: 0 16px !important;
  margin-right: 8px !important;
  position: relative !important;
  z-index: 1000 !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
  opacity: 0.7 !important;
  transition: opacity 0.2s ease-in-out !important;
  border-bottom: 2px solid transparent !important;
}

.back-tab:hover {
  opacity: 1 !important;
  background-color: rgba(0, 0, 0, 0.04) !important;
  border-bottom: 2px solid rgba(74, 134, 232, 0.3) !important;
}

.back-tab:active {
  border-bottom: 2px solid #4a86e8 !important;
}
</style>

<style scoped>
.project-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 800;
}

.project-navigation {
  background-color: #fff;
  position: relative;
  z-index: 1000;
}

.tab-container {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
  border-bottom: none;
  position: relative;
  z-index: 1000;
}

.project-tabs {
  min-height: 40px !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  position: relative;
  z-index: 1000;
  flex-grow: 1;
}

.project-tabs :deep(.v-tab) {
  min-height: 40px;
  position: relative;
  z-index: 1000;
}

.project-title-container {
  height: 36px;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 900;
}

.project-content {
  flex: 1;
  overflow: hidden;
  background-color: #f9f9f9;
  position: relative;
  z-index: 100;
}

.full-height {
  height: 100%;
}

/* Remove any additional spacing */
:deep(.v-tabs-bar), 
:deep(.v-tabs-items), 
:deep(.v-tabs),
:deep(.v-tabs__wrapper),
:deep(.v-tabs__container) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  position: relative !important;
  z-index: 1000 !important;
}

:deep(.v-card) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>