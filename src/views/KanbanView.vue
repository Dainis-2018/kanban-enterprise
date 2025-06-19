<template>
  <div class="kanban-view">
    <!-- Super Compact Header Layout - No extra space -->
    <div class="kanban-header px-6 pb-0 pt-0">
      <!-- Breadcrumbs - Directly below tabs with no extra space -->
      <div class="breadcrumbs-container py-1">
        <div class="d-flex align-center">
          <div class="text-body-2 text-grey me-1">
            {{ $t('projects.projects') }} / {{ currentProject?.team }} /
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ currentProject?.name }} - {{ $t('navigation.kanban_board') }}
          </div>
        </div>
      </div>
      
      <!-- Controls - With minimal padding -->
      <div class="controls-container d-flex align-center justify-space-between py-2">
        <!-- Left Side - Quick Filters -->
        <div class="filter-toggles d-flex">
          <v-btn-toggle
            v-model="activeFilter"
            color="primary"
            rounded="lg"
            density="compact"
            mandatory
          >
            <v-btn value="all" size="small">{{ $t('tasks.all_tasks') }}</v-btn>
            <v-btn value="my" size="small">{{ $t('tasks.my_tasks') }}</v-btn>
            <v-btn value="sprint" size="small">{{ $t('tasks.current_sprint') }}</v-btn>
          </v-btn-toggle>
        </div>
        
        <!-- Right Side - Controls -->
        <div class="d-flex align-center">
          <!-- View Selector -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                variant="outlined"
                v-bind="props"
                class="me-2"
                prepend-icon="mdi-eye-outline"
                size="small"
              >
                {{ $t('views.views') }} <v-icon right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(view, index) in savedViews"
                :key="index"
                :value="view.id"
                @click="loadSavedView(view)"
              >
                <v-list-item-title>{{ view.name }}</v-list-item-title>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item @click="showSaveViewDialog = true">
                <v-list-item-title>
                  <v-icon left>mdi-content-save</v-icon>
                  {{ $t('views.save_view') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          
          <!-- Save View Button -->
          <v-btn
            icon
            variant="text"
            @click="showSaveViewDialog = true"
            class="me-2"
            size="small"
          >
            <v-icon>mdi-content-save-outline</v-icon>
          </v-btn>
          
          <!-- Filters Button -->
          <v-menu location="bottom end" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn
                variant="outlined"
                v-bind="props"
                class="me-2"
                prepend-icon="mdi-filter-outline"
                size="small"
              >
                {{ $t('common.filter') }} <v-icon right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card min-width="300">
              <v-card-title>{{ $t('filters.filter_by') }}</v-card-title>
              <v-card-text>
                <!-- Assignee Filter -->
                <div class="mb-3">
                  <label class="text-subtitle-2 mb-1 d-block">{{ $t('tasks.assignees') }}</label>
                  <v-select
                    v-model="filters.assignees"
                    :items="userOptions"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    clearable
                  ></v-select>
                </div>
                
                <!-- Tags Filter -->
                <div class="mb-3">
                  <label class="text-subtitle-2 mb-1 d-block">{{ $t('tasks.tags') }}</label>
                  <v-select
                    v-model="filters.tags"
                    :items="tagOptions"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    clearable
                  ></v-select>
                </div>
                
                <!-- Priority Filter -->
                <div class="mb-3">
                  <label class="text-subtitle-2 mb-1 d-block">{{ $t('tasks.priority') }}</label>
                  <v-select
                    v-model="filters.priority"
                    :items="priorityOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                  ></v-select>
                </div>
                
                <div class="d-flex justify-end mt-4">
                  <v-btn
                    variant="text"
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
          
          <!-- Group By Button -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                variant="outlined"
                v-bind="props"
                class="me-2"
                prepend-icon="mdi-group"
                size="small"
              >
                Group By <v-icon right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(option, index) in groupByOptions"
                :key="index"
                :value="option.value"
                @click="setGroupBy(option.value)"
              >
                <v-list-item-title>{{ option.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          
          <!-- Add Task Button -->
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showTaskDialog = true"
            size="small"
          >
            {{ $t('tasks.add_task') }}
          </v-btn>
        </div>
      </div>
    </div>
    
    <!-- Horizontal Scroll Indicator -->
    <div class="scroll-indicator px-6 py-0">
      <div class="scroll-track">
        <div class="scroll-thumb" :style="{ width: scrollThumbWidth + '%', left: scrollPosition + '%' }"></div>
      </div>
    </div>
    
    <!-- Kanban Board - Maximized Space -->
    <div class="kanban-container px-6 py-2" ref="kanbanContainer" @scroll="handleScroll">
      <div class="kanban-columns" :style="{ width: columnsWidth + 'px' }">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :tasks="getTasksForColumn(column.id)"
          :isExpanded="expandedColumns[column.id]"
          @toggleExpand="toggleColumnExpand"
          @addTask="showAddTaskDialog"
          @editTask="showEditTaskDialog"
          @deleteTask="showDeleteTaskDialog"
          @moveTask="moveTask"
        />
      </div>
    </div>

    <!-- New/Edit Task Dialog -->
    <TaskDialog
      v-model="showTaskDialog"
      :task="currentTask"
      :edit-mode="taskDialogMode === 'edit'"
      @save="saveTask"
    />
    
    <!-- Delete Task Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ $t('tasks.delete_task') }}
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete the task "{{ currentTask?.title }}"? This action cannot be undone.
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
            @click="deleteTask"
          >
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Save View Dialog -->
    <v-dialog v-model="showSaveViewDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ $t('views.save_view') }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="saveViewName"
            :label="$t('views.view_name')"
            variant="outlined"
            density="comfortable"
            class="mt-2"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showSaveViewDialog = false"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            @click="saveCurrentView"
            :disabled="!saveViewName"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useProjectStore } from '../stores/project';
  import { useTaskStore } from '../stores/task';
  import { useUserStore } from '../stores/user';
  import { useTagStore } from '../stores/tag';
  import KanbanColumn from '../components/kanban/KanbanColumn.vue';
  import TaskDialog from '../components/tasks/TaskDialog.vue';
  
  // Route and stores
  const route = useRoute();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const userStore = useUserStore();
  const tagStore = useTagStore();
  
  // Current project
  const currentProject = computed(() => {
    const projectId = route.params.id;
    return projectStore.getProjectById(projectId);
  });
  
  // Fetch tasks when component mounts or project changes
  onMounted(async () => {
    if (currentProject.value) {
      projectStore.setCurrentProject(currentProject.value.id);
      await taskStore.fetchTasks(currentProject.value.id);
    }
  });
  
  watch(() => route.params.id, async (newId) => {
    if (newId) {
      projectStore.setCurrentProject(newId);
      await taskStore.fetchTasks(newId);
    }
  });
  
  // Columns
  const columns = computed(() => taskStore.getColumns);
  const expandedColumns = ref({});
  
  // Initialize expanded state for all columns
  watch(columns, (newColumns) => {
    newColumns.forEach(column => {
      if (expandedColumns.value[column.id] === undefined) {
        expandedColumns.value[column.id] = true;
      }
    });
  }, { immediate: true });
  
  // Toggle column expand/collapse
  const toggleColumnExpand = (columnId) => {
    expandedColumns.value[columnId] = !expandedColumns.value[columnId];
  };
  
  // Filters
  const activeFilter = ref('all');
  const filters = ref({
    assignees: [],
    tags: [],
    priority: null
  });
  
  // Task dialog
  const showTaskDialog = ref(false);
  const taskDialogMode = ref('add'); // 'add' or 'edit'
  const currentTask = ref(null);
  
  // Delete dialog
  const showDeleteDialog = ref(false);
  
  // Save view dialog
  const showSaveViewDialog = ref(false);
  const saveViewName = ref('');
  
  // Saved views (would be persisted in a real app)
  const savedViews = ref([
    { id: 'default', name: 'Default View', filter: 'all', groupBy: 'status', filters: {} },
    { id: 'my-tasks', name: 'My Tasks', filter: 'my', groupBy: 'status', filters: {} }
  ]);
  
  // Group by options
  const groupByOptions = [
    { title: 'Status', value: 'status' },
    { title: 'Assignee', value: 'assignee' },
    { title: 'Priority', value: 'priority' },
    { title: 'Tag', value: 'tag' }
  ];
  
  // Current group by option
  const currentGroupBy = ref('status');
  
  // Set group by option
  const setGroupBy = (value) => {
    currentGroupBy.value = value;
  };
  
  // Filter options
  const userOptions = computed(() => userStore.allUsers);
  const tagOptions = computed(() => tagStore.allTags);
  const priorityOptions = [
    { title: 'P1 (High)', value: 'P1' },
    { title: 'P2 (Medium)', value: 'P2' },
    { title: 'P3 (Low)', value: 'P3' }
  ];
  
  // Apply filters
  const applyFilters = () => {
    // In a real app, this would update the filtered tasks
    console.log('Applying filters:', filters.value);
  };
  
  // Clear filters
  const clearFilters = () => {
    filters.value = {
      assignees: [],
      tags: [],
      priority: null
    };
  };
  
  // Get tasks for a specific column
  const getTasksForColumn = (columnId) => {
    let tasks = [];
    
    if (currentProject.value) {
      // Get all tasks for the current project
      tasks = taskStore.tasksByProject(currentProject.value.id);
      
      // Apply active filter
      if (activeFilter.value === 'my') {
        const currentUserId = userStore.currentUser;
        tasks = tasks.filter(task => 
          task.assignees.includes(currentUserId)
        );
      } else if (activeFilter.value === 'sprint') {
        // In a real app, this would filter by the current sprint
        // For demo purposes, we'll just show all tasks
      }
      
      // Apply custom filters
      if (filters.value.assignees.length > 0) {
        tasks = tasks.filter(task => 
          filters.value.assignees.some(userId => 
            task.assignees.includes(userId)
          )
        );
      }
      
      if (filters.value.tags.length > 0) {
        tasks = tasks.filter(task => 
          filters.value.tags.some(tagId => 
            task.tags.includes(tagId)
          )
        );
      }
      
      if (filters.value.priority) {
        tasks = tasks.filter(task => 
          task.priority === filters.value.priority
        );
      }
      
      // Filter by column (status)
      tasks = tasks.filter(task => task.status === columnId);
    }
    
    return tasks;
  };
  
  // Task CRUD operations
  const showAddTaskDialog = (columnId) => {
    currentTask.value = {
      projectId: currentProject.value.id,
      title: '',
      description: '',
      status: columnId,
      priority: 'P2',
      assignees: [],
      tags: [],
      dueDate: null
    };
    taskDialogMode.value = 'add';
    showTaskDialog.value = true;
  };
  
  const showEditTaskDialog = (task) => {
    currentTask.value = { ...task };
    taskDialogMode.value = 'edit';
    showTaskDialog.value = true;
  };
  
  const showDeleteTaskDialog = (task) => {
    currentTask.value = task;
    showDeleteDialog.value = true;
  };
  
  const saveTask = async (taskData) => {
    try {
      if (taskDialogMode.value === 'add') {
        await taskStore.createTask(taskData);
      } else {
        await taskStore.updateTask(currentTask.value.id, taskData);
      }
      showTaskDialog.value = false;
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  
  const deleteTask = async () => {
    try {
      if (!currentTask.value) return;
      
      await taskStore.deleteTask(currentTask.value.id);
      showDeleteDialog.value = false;
      currentTask.value = null;
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  // Move task between columns (update status)
  const moveTask = async (taskId, newStatus) => {
    try {
      await taskStore.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };
  
  // Save current view
  const saveCurrentView = () => {
    const newView = {
      id: `view-${Date.now()}`,
      name: saveViewName.value,
      filter: activeFilter.value,
      groupBy: currentGroupBy.value,
      filters: { ...filters.value }
    };
    
    savedViews.value.push(newView);
    showSaveViewDialog.value = false;
    saveViewName.value = '';
  };
  
  // Load saved view
  const loadSavedView = (view) => {
    activeFilter.value = view.filter;
    currentGroupBy.value = view.groupBy;
    filters.value = { ...view.filters };
  };
  
  // Horizontal scrolling
  const kanbanContainer = ref(null);
  const scrollPosition = ref(0);
  const scrollThumbWidth = ref(20); // Default width percentage
  const columnsWidth = computed(() => {
    return columns.value.length * 320; // 300px column width + 20px gap
  });
  
  const handleScroll = () => {
    if (!kanbanContainer.value) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = kanbanContainer.value;
    const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    const thumbWidthPercentage = (clientWidth / scrollWidth) * 100;
    
    scrollPosition.value = scrollPercentage;
    scrollThumbWidth.value = Math.max(10, thumbWidthPercentage); // Min width of 10%
  };
  </script>
  
<style scoped>
.kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.kanban-header {
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 0; /* Remove any top margin */
}

.breadcrumbs-container {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 28px; /* Further reduced minimum height */
  margin-top: 0; /* Remove any top margin */
  padding-top: 0; /* Remove any top padding */
}

.controls-container {
  min-height: 40px; /* Further reduced fixed height for controls row */
  margin-top: 0; /* Remove any top margin */
}

.scroll-indicator {
  padding-top: 2px; /* Minimal padding */
  padding-bottom: 0;
  margin-top: 0; /* Remove any top margin */
}

.scroll-track {
  height: 3px; /* Further reduced height */
  background-color: #e6e6e6;
  border-radius: 1.5px;
  position: relative;
}

.scroll-thumb {
  height: 3px; /* Further reduced height */
  background-color: #4a86e8;
  border-radius: 1.5px;
  position: absolute;
  top: 0;
  transition: left 0.1s ease;
}

.kanban-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 0; /* Remove any top margin */
}

.kanban-columns {
  display: flex;
  gap: 20px;
  height: 100%;
  min-width: 100%;
}

/* Remove margins and padding from all direct children */
.kanban-header > *,
.breadcrumbs-container > *,
.controls-container > * {
  margin-top: 0;
  margin-bottom: 0;
}

/* Fix for any Vuetify internal spacing */
:deep(.v-btn-toggle) {
  margin-top: 0;
  margin-bottom: 0;
}

:deep(.v-navigation-drawer__content > *:first-child) {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
</style>