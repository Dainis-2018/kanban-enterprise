<template>
    <div class="dashboard">
      <!-- Projects Header -->
      <div class="d-flex align-center justify-space-between py-4 px-6">
        <h2 class="text-h5 font-weight-bold">{{ $t('projects.projects') }}</h2>
        
        <!-- View Options -->
        <div class="d-flex align-center">
          <div class="view-options me-4">
            <v-btn-toggle
              v-model="projectStore.view"
              color="primary"
              mandatory
              rounded="lg"
              density="comfortable"
            >
              <v-btn value="grid" icon="mdi-view-grid" size="small"></v-btn>
              <v-btn value="list" icon="mdi-format-list-bulleted" size="small"></v-btn>
            </v-btn-toggle>
          </div>
          
          <!-- Search -->
          <SearchBar
            :placeholder="$t('projects.search_project')"
            class="me-4"
            style="width: 220px"
            v-model:value="searchQuery"
            @search="handleSearch"
          />
          
          <!-- Filter -->
          <v-menu location="bottom end" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn 
                color="secondary" 
                variant="tonal" 
                v-bind="props"
                prepend-icon="mdi-filter"
                class="me-4"
              >
                {{ $t('common.filter') }}
              </v-btn>
            </template>
            <v-card min-width="250">
              <v-card-title>{{ $t('filters.filter_by') }}</v-card-title>
              <v-card-text>
                <v-select
                  v-model="filters.team"
                  :items="teamOptions"
                  :label="$t('teams.team_members')"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="mb-3"
                ></v-select>
                
                <v-select
                  v-model="filters.progress"
                  :items="progressOptions"
                  label="Progress"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="mb-3"
                ></v-select>
                
                <v-select
                  v-model="filters.favorite"
                  :items="favoriteOptions"
                  label="Favorite"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="mb-3"
                ></v-select>
                
                <div class="d-flex justify-end mt-4">
                  <v-btn
                    text
                    color="secondary"
                    @click="clearFilters"
                  >
                    {{ $t('filters.clear_filters') }}
                  </v-btn>
                  <v-btn
                    class="ms-2"
                    color="primary"
                    @click="applyFilters"
                  >
                    Apply
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
          
          <!-- Create New Project -->
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus"
            @click="showNewProjectDialog = true"
          >
            {{ $t('projects.new_project') }}
          </v-btn>
        </div>
      </div>
      
      <!-- Project Categories Tabs -->
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="px-6"
      >
        <v-tab value="active">{{ $t('projects.active') }}</v-tab>
        <v-tab value="recent">{{ $t('projects.recent') }}</v-tab>
        <v-tab value="by_team">{{ $t('projects.by_team') }}</v-tab>
        <v-tab value="archived">{{ $t('projects.archived') }}</v-tab>
      </v-tabs>
      
      <!-- Projects Content -->
      <v-window v-model="activeTab" class="py-4">
        <!-- Active Projects -->
        <v-window-item value="active">
          <div v-if="loadingProjects" class="d-flex justify-center align-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          
          <div v-else-if="filteredProjects.length === 0" class="d-flex flex-column align-center pa-8">
            <v-icon icon="mdi-alert-circle-outline" size="48" color="grey"></v-icon>
            <div class="text-subtitle-1 mt-4">{{ $t('projects.no_projects') }}</div>
            <v-btn 
              class="mt-4" 
              color="primary"
              @click="showNewProjectDialog = true"
            >
              {{ $t('projects.create_first_project') }}
            </v-btn>
          </div>
          
          <div v-else>
            <!-- Grid View -->
            <div v-if="projectStore.view === 'grid'" class="projects-grid px-6">
              <ProjectCard
                v-for="project in filteredProjects"
                :key="project.id"
                :project="project"
                @favorite="toggleFavorite"
                @edit="editProject"
                @delete="confirmDeleteProject"
              />
            </div>
            
            <!-- List View -->
            <div v-else class="projects-list px-6">
              <ProjectListItem
                v-for="project in filteredProjects"
                :key="project.id"
                :project="project"
                @favorite="toggleFavorite"
                @edit="editProject"
                @delete="confirmDeleteProject"
              />
            </div>
            
            <!-- Pagination -->
            <div class="text-center mt-4">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                rounded="circle"
              ></v-pagination>
            </div>
          </div>
        </v-window-item>
        
        <!-- Recent Projects -->
        <v-window-item value="recent">
          <div class="projects-grid px-6">
            <ProjectCard
              v-for="project in recentProjects"
              :key="project.id"
              :project="project"
              @favorite="toggleFavorite"
              @edit="editProject"
              @delete="confirmDeleteProject"
            />
          </div>
        </v-window-item>
        
        <!-- Projects by Team -->
        <v-window-item value="by_team">
          <div v-for="team in teams" :key="team.id" class="team-section px-6 mb-6">
            <h3 class="text-h6 mb-4">{{ team.name }}</h3>
            <div class="projects-grid">
              <ProjectCard
                v-for="project in getProjectsByTeam(team.name)"
                :key="project.id"
                :project="project"
                @favorite="toggleFavorite"
                @edit="editProject"
                @delete="confirmDeleteProject"
              />
            </div>
            <div v-if="getProjectsByTeam(team.name).length === 0" class="text-center py-4 text-grey">
              No projects for this team
            </div>
          </div>
        </v-window-item>
        
        <!-- Archived Projects -->
        <v-window-item value="archived">
          <div class="projects-grid px-6">
            <!-- Show archived projects here (would be implemented in a real app) -->
            <div class="text-center pa-8">
              <v-icon icon="mdi-archive-outline" size="48" color="grey"></v-icon>
              <div class="text-subtitle-1 mt-4">No archived projects found</div>
            </div>
          </div>
        </v-window-item>
      </v-window>
      
      <!-- New Project Dialog -->
      <ProjectDialog
        v-model="showNewProjectDialog"
        :edit-mode="false"
        @save="createNewProject"
      />
      
      <!-- Edit Project Dialog -->
      <ProjectDialog
        v-model="showEditProjectDialog"
        :edit-mode="true"
        :project="currentEditProject"
        @save="updateProject"
      />
      
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">
            {{ $t('projects.delete_project') }}
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete the project "{{ currentEditProject?.name }}"? This action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="showDeleteDialog = false"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              @click="deleteProject"
            >
              {{ $t('common.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useProjectStore } from '../stores/project';
  import { useUserStore } from '../stores/user';
  import SearchBar from '../components/common/SearchBar.vue';
  import ProjectCard from '../components/projects/ProjectCard.vue';
  import ProjectListItem from '../components/projects/ProjectListItem.vue';
  import ProjectDialog from '../components/projects/ProjectDialog.vue';
  
  // Stores
  const projectStore = useProjectStore();
  const userStore = useUserStore();
  
  // Pagination
  const itemsPerPage = 6;
  const currentPage = ref(1);
  const totalPages = computed(() => {
    const totalProjects = projectStore.projects.filter(project => {
      // Apply filter conditions
      if (activeTab.value === 'active') {
        return project.progress < 100;
      }
      return true;
    }).length;
    
    return Math.ceil(totalProjects / itemsPerPage);
  });
  
  // Loading state
  const loadingProjects = computed(() => projectStore.loadingProjects);
  
  // Tabs
  const activeTab = ref('active');
  
  // Search and Filters
  const searchQuery = ref('');
  const filters = ref({
    team: null,
    progress: null,
    favorite: null
  });
  
  // Filter options
  const teamOptions = computed(() => {
    const teams = new Set(projectStore.projects.map(p => p.team));
    return Array.from(teams).map(team => ({ title: team, value: team }));
  });
  
  const progressOptions = [
    { title: 'Low (0-25%)', value: 'low' },
    { title: 'Medium (26-75%)', value: 'medium' },
    { title: 'High (76-100%)', value: 'high' },
  ];
  
  const favoriteOptions = [
    { title: 'Favorites Only', value: true },
    { title: 'Non-Favorites', value: false },
  ];
  
  // Teams
  const teams = computed(() => userStore.allTeams);
  
  // Dialog controls
  const showNewProjectDialog = ref(false);
  const showEditProjectDialog = ref(false);
  const showDeleteDialog = ref(false);
  const currentEditProject = ref(null);
  
  // Filtered projects
  const filteredProjects = computed(() => {
    let result = [...projectStore.projects];
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.team.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply team filter
    if (filters.value.team) {
      result = result.filter(project => project.team === filters.value.team);
    }
    
    // Apply progress filter
    if (filters.value.progress) {
      switch(filters.value.progress) {
        case 'low':
          result = result.filter(project => project.progress >= 0 && project.progress <= 25);
          break;
        case 'medium':
          result = result.filter(project => project.progress > 25 && project.progress <= 75);
          break;
        case 'high':
          result = result.filter(project => project.progress > 75 && project.progress <= 100);
          break;
      }
    }
    
    // Apply favorite filter
    if (filters.value.favorite !== null) {
      result = result.filter(project => project.isFavorite === filters.value.favorite);
    }
    
    // For active tab, show only projects with progress < 100%
    if (activeTab.value === 'active') {
      result = result.filter(project => project.progress < 100);
    }
    
    // Apply pagination
    const startIndex = (currentPage.value - 1) * itemsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + itemsPerPage);
    
    return paginatedResult;
  });
  
  // Recent projects
  const recentProjects = computed(() => {
    return [...projectStore.projects]
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 6);
  });
  
  // Get projects by team
  const getProjectsByTeam = (teamName) => {
    return projectStore.projects.filter(project => project.team === teamName);
  };
  
  // Handle search
  const handleSearch = (query) => {
    searchQuery.value = query;
    currentPage.value = 1; // Reset to first page on search
  };
  
  // Filter methods
  const applyFilters = () => {
    currentPage.value = 1; // Reset to first page when applying filters
  };
  
  const clearFilters = () => {
    filters.value = {
      team: null,
      progress: null,
      favorite: null
    };
    currentPage.value = 1;
  };
  
  // Project actions
  const toggleFavorite = (projectId) => {
    projectStore.toggleFavorite(projectId);
  };
  
  const editProject = (project) => {
    currentEditProject.value = { ...project };
    showEditProjectDialog.value = true;
  };
  
  const confirmDeleteProject = (project) => {
    currentEditProject.value = project;
    showDeleteDialog.value = true;
  };
  
  const createNewProject = async (projectData) => {
    try {
      await projectStore.createProject({
        ...projectData,
        // Add default values for new project
        workspace: projectStore.currentWorkspace
      });
      showNewProjectDialog.value = false;
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };
  
  const updateProject = async (projectData) => {
    try {
      if (!currentEditProject.value) return;
      
      await projectStore.updateProject(currentEditProject.value.id, projectData);
      showEditProjectDialog.value = false;
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };
  
  const deleteProject = async () => {
    try {
      if (!currentEditProject.value) return;
      
      await projectStore.deleteProject(currentEditProject.value.id);
      showDeleteDialog.value = false;
      currentEditProject.value = null;
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  
  // Reset page when tab changes
  watch(activeTab, () => {
    currentPage.value = 1;
  });
  
  // Initialize data
  watch(
    () => projectStore.projects,
    (newProjects) => {
      if (newProjects.length === 0) {
        projectStore.fetchProjects();
      }
    },
    { immediate: true }
  );
  </script>
  
  <style scoped>
  .dashboard {
    height: 100%;
    overflow-y: auto;
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 20px;
    margin-top: 16px;
  }
  
  .projects-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
  }
  
  .team-section {
    margin-top: 16px;
  }
  </style>