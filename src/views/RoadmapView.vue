<template>
  <div class="roadmap-view">
    <!-- Super Compact Header Layout - No extra space -->
    <div class="roadmap-header px-6 pb-0 pt-0">
      <!-- Breadcrumbs - Directly below tabs with no extra space -->
      <div class="breadcrumbs-container py-1">
        <div class="d-flex align-center">
          <div class="text-body-2 text-grey me-1">
            {{ $t ? $t('projects.projects') : 'Projects' }} / {{ currentProject?.team }} /
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ currentProject?.name }} - {{ $t ? $t('navigation.roadmap') : 'Roadmap' }}
          </div>
        </div>
      </div>
      
      <!-- Controls - With minimal padding -->
      <div class="controls-container d-flex align-center justify-space-between py-2">
        <!-- Left Side - Grouping Controls -->
        <div class="d-flex align-center">
          <v-btn-toggle
            v-model="groupBy"
            color="primary"
            rounded="lg"
            density="compact"
            mandatory
          >
            <v-btn value="epic" size="small">{{ $t ? $t('roadmap.group_by_epic') : 'Group by Epic' }}</v-btn>
            <v-btn value="sprint" size="small">{{ $t ? $t('roadmap.group_by_sprint') : 'Group by Sprint' }}</v-btn>
          </v-btn-toggle>
        </div>
        
        <!-- Right Side - Controls -->
        <div class="d-flex align-center">
          <!-- Epic Filter -->
          <v-select
            v-model="filterEpic"
            :items="epicItems"
            label="Filter by Epic"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 180px"
            class="mx-2"
          ></v-select>
          
          <!-- Configure Sprints Button -->
          <v-btn
            color="primary"
            prepend-icon="mdi-cog-outline"
            @click="showSprintDialog = true"
            size="small"
            variant="outlined"
          >
            {{ $t ? $t('roadmap.configure_sprints') : 'Configure Sprints' }}
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
    
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center flex-grow-1 pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <!-- Empty Sprint State -->
    <div v-else-if="!sprints.length" class="d-flex flex-column align-center justify-center flex-grow-1 pa-4">
      <v-icon icon="mdi-calendar-blank-outline" size="48" color="grey"></v-icon>
      <div class="text-subtitle-1 mt-4">No sprints configured for this project</div>
      <v-btn 
        class="mt-4" 
        color="primary"
        @click="showSprintDialog = true"
      >
        {{ $t ? $t('roadmap.configure_sprints') : 'Configure Sprints' }}
      </v-btn>
    </div>
    
    <!-- Roadmap Content -->
    <div v-else class="roadmap-content" ref="roadmapContainer" @scroll="handleScroll">
      <!-- Roadmap Table - Group by Epic -->
      <div v-if="groupBy === 'epic'" class="roadmap-wrapper">
        <table class="roadmap-table">
          <thead>
            <tr>
              <th class="fixed-column">{{ $t ? $t('roadmap.epics') : 'Epics' }}</th>
              <th v-for="sprint in sprints" :key="sprint.id" class="sprint-header">
                {{ sprint.name }}
                <div v-if="sprint.milestone" class="milestone-marker">
                  <div class="milestone-diamond"></div>
                  <div class="milestone-name">{{ sprint.milestone }}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredEpics.length === 0">
              <td :colspan="sprints.length + 1" class="empty-message">
                {{ $t ? $t('roadmap.no_epics_match_filter') : 'No epics match the current filter' }}
              </td>
            </tr>
            <tr v-else v-for="epic in filteredEpics" :key="epic.id" class="epic-row">
              <td class="fixed-column">{{ epic.name }}</td>
              <td 
                v-for="sprint in sprints" 
                :key="`${epic.id}-${sprint.id}`" 
                class="task-cell"
                @click="selectCell(epic.id, sprint.id)"
                :class="{ 'selected-cell': isSelectedCell(epic.id, sprint.id) }"
                draggable="true"
                @dragstart="handleCellDragStart($event, epic.id, sprint.id)"
                @dragover.prevent
                @drop="handleCellDrop($event, epic.id, sprint.id)"
                @dragenter="handleDragEnter($event, epic.id, sprint.id)"
                @dragleave="handleDragLeave($event)"
                :data-epic-id="epic.id"
                :data-sprint-id="sprint.id"
              >
                <div v-if="getTasksForCell(epic.id, sprint.id).length > 0" class="cell-summary">
                  <div class="task-count">{{ getTasksForCell(epic.id, sprint.id).length }} {{ $t ? $t('tasks.tasks') : 'Tasks' }}</div>
                  <v-progress-linear
                    :value="getCellCompletionPercentage(epic.id, sprint.id)"
                    :color="getCellProgressColor(epic.id, sprint.id)"
                    height="5"
                    class="my-1"
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <div class="text-caption">
                      {{ getCompletedTaskCount(epic.id, sprint.id) }}/{{ getTasksForCell(epic.id, sprint.id).length }}
                    </div>
                    <v-btn
                      v-if="getTasksForCell(epic.id, sprint.id).length > 0"
                      variant="text"
                      density="compact"
                      icon="mdi-dots-horizontal"
                      size="x-small"
                      @click.stop="showCellMenu($event, epic.id, sprint.id)"
                      class="cell-menu-trigger"
                    >
                    </v-btn>
                  </div>
                </div>
                <div v-else class="empty-cell">
                  <div class="text-caption text-grey">{{ $t ? $t('tasks.no_tasks') : 'No tasks' }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Roadmap Table - Group by Sprint -->
      <div v-else class="roadmap-wrapper">
        <table class="roadmap-table">
          <thead>
            <tr>
              <th class="fixed-column">{{ $t ? $t('roadmap.sprints') : 'Sprints' }}</th>
              <th v-for="epic in filteredEpics" :key="epic.id">
                {{ epic.name }}
              </th>
              <th v-if="filteredEpics.length === 0">{{ $t ? $t('roadmap.no_epics_match_filter') : 'No epics match the filter' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sprint in sprints" :key="sprint.id" class="sprint-row">
              <td class="fixed-column">
                {{ sprint.name }}
                <div v-if="sprint.milestone" class="milestone-tag">
                  {{ sprint.milestone }}
                </div>
              </td>
              <td 
                v-for="epic in filteredEpics" 
                :key="`${sprint.id}-${epic.id}`" 
                class="task-cell"
                @click="selectCell(epic.id, sprint.id)"
                :class="{ 'selected-cell': isSelectedCell(epic.id, sprint.id) }"
                draggable="true"
                @dragstart="handleCellDragStart($event, epic.id, sprint.id)"
                @dragover.prevent
                @drop="handleCellDrop($event, epic.id, sprint.id)"
                @dragenter="handleDragEnter($event, epic.id, sprint.id)"
                @dragleave="handleDragLeave($event)"
                :data-epic-id="epic.id"
                :data-sprint-id="sprint.id"
              >
                <div v-if="getTasksForCell(epic.id, sprint.id).length > 0" class="cell-summary">
                  <div class="task-count">{{ getTasksForCell(epic.id, sprint.id).length }} {{ $t ? $t('tasks.tasks') : 'Tasks' }}</div>
                  <v-progress-linear
                    :value="getCellCompletionPercentage(epic.id, sprint.id)"
                    :color="getCellProgressColor(epic.id, sprint.id)"
                    height="5"
                    class="my-1"
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <div class="text-caption">
                      {{ getCompletedTaskCount(epic.id, sprint.id) }}/{{ getTasksForCell(epic.id, sprint.id).length }}
                    </div>
                    <v-btn
                      v-if="getTasksForCell(epic.id, sprint.id).length > 0"
                      variant="text"
                      density="compact"
                      icon="mdi-dots-horizontal"
                      size="x-small"
                      @click.stop="showCellMenu($event, epic.id, sprint.id)"
                    ></v-btn>
                  </div>
                </div>
                <div v-else class="empty-cell">
                  <div class="text-caption text-grey">{{ $t ? $t('tasks.no_tasks') : 'No tasks' }}</div>
                </div>
              </td>
              <td v-if="filteredEpics.length === 0" class="empty-cell">
                <div class="text-caption text-grey">{{ $t ? $t('roadmap.no_epics_match_filter') : 'No epics match the filter' }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Cell Menu -->
      <v-menu
        v-model="showCellMenuFlag"
        :position-x="menuPosition.x"
        :position-y="menuPosition.y"
        :close-on-content-click="true"
        fixed
        min-width="150"
        max-width="200"
        offset="5"
      >
        <v-list density="compact">
          <v-list-item @click="createTaskForCurrentCell()" class="menu-item">
            <template v-slot:prepend>
              <v-icon icon="mdi-plus" size="small"></v-icon>
            </template>
            <v-list-item-title class="text-body-2">Add Task</v-list-item-title>
          </v-list-item>
          
          <v-list-item @click="selectCell(menuData.epicId, menuData.sprintId)" class="menu-item">
            <template v-slot:prepend>
              <v-icon icon="mdi-eye-outline" size="small"></v-icon>
            </template>
            <v-list-item-title class="text-body-2">View Details</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    
    <!-- Task Detail Panel -->
    <v-navigation-drawer
      v-model="showDetailPanel"
      location="right"
      width="350"
      temporary
      class="detail-panel"
    >
      <template v-if="selectedCell">
        <v-toolbar density="compact" color="primary" class="detail-header">
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">
            {{ getEpicName(selectedCell.epicId) }} - {{ getSprintName(selectedCell.sprintId) }}
          </v-toolbar-title>
          <template v-slot:append>
            <v-btn icon="mdi-close" size="small" color="white" @click="showDetailPanel = false"></v-btn>
          </template>
        </v-toolbar>
        
        <div class="px-4 pt-3 pb-2">
          <div class="d-flex align-center justify-space-between">
            <div class="text-body-1">{{ $t ? $t('tasks.tasks') : 'Tasks' }}</div>
            <div class="text-caption">
              {{ getCompletedTaskCount(selectedCell.epicId, selectedCell.sprintId) }}/{{ getTasksForCell(selectedCell.epicId, selectedCell.sprintId).length }} {{ $t ? $t('tasks.complete') : 'complete' }}
            </div>
          </div>
          <v-progress-linear
            :value="getCellCompletionPercentage(selectedCell.epicId, selectedCell.sprintId)"
            :color="getCellProgressColor(selectedCell.epicId, selectedCell.sprintId)"
            height="6"
            class="mt-2"
          ></v-progress-linear>
          
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus" 
            class="mt-4 mb-2" 
            block
            @click="createTaskForCurrentCell()"
          >
            {{ $t ? $t('tasks.add_task') : 'Add Task' }}
          </v-btn>
        </div>
        
        <v-divider></v-divider>
        
        <!-- Task lists, grouped by status -->
        <div v-if="getTasksForCell(selectedCell.epicId, selectedCell.sprintId).length === 0" class="pa-4 text-center">
          {{ $t ? $t('tasks.no_tasks_in_cell') : 'No tasks in this cell yet' }}
        </div>
        <div v-else>
          <div v-for="status in getProjectStatuses()" :key="status.id">
            <!-- Status header -->
            <div 
              v-if="getTasksByStatus(selectedCell.epicId, selectedCell.sprintId, status.id).length > 0" 
              class="px-4 py-2 text-overline text-uppercase font-weight-medium text-grey"
            >
              {{ status.title }}
            </div>
            
            <!-- Task items -->
            <div 
              v-for="task in getTasksByStatus(selectedCell.epicId, selectedCell.sprintId, status.id)" 
              :key="task.id"
              class="custom-task-item d-flex align-center px-4 py-2 mx-2 my-1 rounded"
              @click="showTaskDetails(task)"
            >
              <!-- Status icon -->
              <v-icon :color="getStatusColor(status.id)" size="small" class="me-3">
                {{ getStatusIcon(status.id) }}
              </v-icon>
              
              <!-- Task content -->
              <div class="task-content flex-grow-1 min-width-0">
                <div class="task-title text-subtitle-2 font-weight-medium text-truncate">
                  {{ task.title }}
                </div>
                <div class="task-type text-caption text-grey text-truncate">
                  {{ task.type }}
                </div>
              </div>
              
              <!-- Task metadata -->
              <div class="task-metadata d-flex align-center ms-2">
                <v-chip size="x-small" :color="getPriorityColor(task.priority)" class="me-2" density="compact">
                  {{ task.priority }}
                </v-chip>
                
                <v-avatar v-if="task.assignees && task.assignees.length > 0" size="24">
                  <UserAvatar :user="getUserById(task.assignees[0])" size="24" />
                </v-avatar>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-navigation-drawer>
    
    <!-- Task Dialog -->
    <TaskDialog
      v-model="showTaskDialog"
      :task="currentTask"
      :edit-mode="taskDialogMode === 'edit'"
      @save="saveTask"
    />
    
    <!-- Sprint Configuration Dialog -->
    <SprintDialog
      v-if="showSprintDialog"
      v-model="showSprintDialog"
      :existing-sprints="sprints"
      @save="configureSprints"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useTaskStore } from '../stores/task';
import { useUserStore } from '../stores/user';
import { useEpicStore } from '../stores/epic';
import { useSprintStore } from '../stores/sprint';
import TaskDialog from '../components/tasks/TaskDialog.vue';
import SprintDialog from '../components/sprints/SprintDialog.vue';
import UserAvatar from '../components/common/UserAvatar.vue';

// Route and stores
const route = useRoute();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const userStore = useUserStore();
const epicStore = useEpicStore();
const sprintStore = useSprintStore();

// Loading state
const loading = ref(true);

// Current project
const currentProject = computed(() => {
  const projectId = route.params.id;
  return projectStore.getProjectById(projectId);
});

// Group by setting (epic or sprint)
const groupBy = ref('epic');

// Task dialog
const showTaskDialog = ref(false);
const taskDialogMode = ref('add');
const currentTask = ref(null);

// Sprint dialog
const showSprintDialog = ref(false);

// Detail panel
const showDetailPanel = ref(false);
const selectedCell = ref(null);

// Filter by epic
const filterEpic = ref('all');

// Cell context menu
const showCellMenuFlag = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const menuData = ref({ epicId: null, sprintId: null });

// Show cell context menu - updated method
const menuTriggerElement = ref(null);

// Horizontal scrolling
const roadmapContainer = ref(null);
const scrollPosition = ref(0);
const scrollThumbWidth = ref(20); // Default width percentage

// Calculate columns width based on number of columns (sprints)
const columnsWidth = computed(() => {
  return sprints.value.length * 320; // 300px column width + 20px gap
});

// Handle scroll event
const handleScroll = () => {
  if (!roadmapContainer.value) return;
  
  const { scrollLeft, scrollWidth, clientWidth } = roadmapContainer.value;
  const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
  const thumbWidthPercentage = (clientWidth / scrollWidth) * 100;
  
  scrollPosition.value = scrollPercentage;
  scrollThumbWidth.value = Math.max(10, thumbWidthPercentage); // Min width of 10%
};

// Get all epics for the current project
const projectEpics = computed(() => {
  if (!currentProject.value) return [];
  return epicStore.epicsByProject(currentProject.value.id);
});

// Filter epics based on selection
const filteredEpics = computed(() => {
  if (filterEpic.value === 'all') {
    return projectEpics.value;
  }
  return projectEpics.value.filter(epic => epic.id === filterEpic.value);
});

// Get all sprints for the current project
const sprints = computed(() => {
  if (!currentProject.value) return [];
  return sprintStore.sprintsByProject(currentProject.value.id);
});

// Epic select items
const epicItems = computed(() => {
  const items = [{ title: 'All Epics', value: 'all' }];
  
  projectEpics.value.forEach(epic => {
    items.push({
      title: epic.name,
      value: epic.id
    });
  });
  
  return items;
});

// Get user by ID
const getUserById = (userId) => {
  return userStore.getUserById(userId);
};

// Get epic name by ID
const getEpicName = (epicId) => {
  const epic = projectEpics.value.find(epic => epic.id === epicId);
  return epic ? epic.name : '';
};

// Get sprint name by ID
const getSprintName = (sprintId) => {
  const sprint = sprints.value.find(sprint => sprint.id === sprintId);
  return sprint ? sprint.name : '';
};

// Get project statuses
const getProjectStatuses = () => {
  return taskStore.getColumns || [];
};

// Get tasks for a specific cell (epic + sprint)
const getTasksForCell = (epicId, sprintId) => {
  // Get tasks for this epic 
  const epicTasks = taskStore.tasks.filter(task => task.epicId === epicId);
  
  // Get sprint dates
  const sprint = sprints.value.find(s => s.id === sprintId);
  if (!sprint) return [];
  
  const sprintStart = new Date(sprint.startDate);
  const sprintEnd = new Date(sprint.endDate);
  
  // Filter tasks whose due dates fall within this sprint
  return epicTasks.filter(task => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    return dueDate >= sprintStart && dueDate <= sprintEnd;
  });
};

// Get tasks by status for a specific cell
const getTasksByStatus = (epicId, sprintId, statusId) => {
  return getTasksForCell(epicId, sprintId).filter(task => 
    task.status === statusId
  );
};

// Get completed task count for a cell
const getCompletedTaskCount = (epicId, sprintId) => {
  const completedStatuses = getProjectStatuses()
    .filter(status => status.id === 'done')
    .map(status => status.id);
  
  return getTasksForCell(epicId, sprintId).filter(
    task => completedStatuses.includes(task.status)
  ).length;
};

// Get completion percentage for a cell
const getCellCompletionPercentage = (epicId, sprintId) => {
  const tasks = getTasksForCell(epicId, sprintId);
  if (tasks.length === 0) return 0;
  
  const completedCount = getCompletedTaskCount(epicId, sprintId);
  return Math.round((completedCount / tasks.length) * 100);
};

// Get progress color based on percentage
const getCellProgressColor = (epicId, sprintId) => {
  const percentage = getCellCompletionPercentage(epicId, sprintId);
  
  if (percentage >= 100) return 'success';
  if (percentage >= 70) return 'info';
  if (percentage >= 30) return 'warning';
  return 'error';
};

// Get color based on status
const getStatusColor = (statusId) => {
  switch (statusId) {
    case 'todo': return 'grey';
    case 'in_progress': return 'orange';
    case 'review': return 'blue';
    case 'done': return 'green';
    default: return 'grey';
  }
};

// Get icon based on status
const getStatusIcon = (statusId) => {
  switch (statusId) {
    case 'todo': return 'mdi-circle-outline';
    case 'in_progress': return 'mdi-progress-clock';
    case 'review': return 'mdi-eye-outline';
    case 'done': return 'mdi-check-circle';
    default: return 'mdi-circle-outline';
  }
};

// Get color based on priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'P1': return 'error';
    case 'P2': return 'warning';
    case 'P3': return 'success';
    default: return 'primary';
  }
};

// Check if this is the selected cell
const isSelectedCell = (epicId, sprintId) => {
  return selectedCell.value && 
         selectedCell.value.epicId === epicId && 
         selectedCell.value.sprintId === sprintId;
};

// Select a cell to show in the detail panel
const selectCell = (epicId, sprintId) => {
  selectedCell.value = { epicId, sprintId };
  showDetailPanel.value = true;
};

// Show task details
const showTaskDetails = (task) => {
  currentTask.value = { ...task };
  taskDialogMode.value = 'edit';
  showTaskDialog.value = true;
};

// Create a task for the current cell
const createTaskForCurrentCell = () => {
  const epicId = menuData.value.epicId || (selectedCell.value && selectedCell.value.epicId);
  const sprintId = menuData.value.sprintId || (selectedCell.value && selectedCell.value.sprintId);
  
  if (!epicId || !sprintId) return;
  
  // Find the sprint to get its date range
  const sprint = sprints.value.find(s => s.id === sprintId);
  if (!sprint) return;
  
  // Calculate a default due date (middle of the sprint)
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const middleDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
  
  // Create a new task with the epic and due date set
  currentTask.value = {
    projectId: currentProject.value.id,
    epicId: epicId,
    title: '',
    description: '',
    status: getProjectStatuses()[0]?.id || 'todo',
    priority: 'P2',
    type: 'Task',
    assignees: [],
    tags: [],
    dueDate: middleDate.toISOString().split('T')[0]
  };
  
  taskDialogMode.value = 'add';
  showTaskDialog.value = true;
  showCellMenuFlag.value = false;
};

// Show cell context menu
const showCellMenu = (event, epicId, sprintId) => {
  // Prevent the event from propagating to parent elements
  event.stopPropagation();
  
  // Store the epic and sprint IDs for the menu actions
  menuData.value = { epicId, sprintId };
  
  // Get the position of the button that was clicked
  const buttonElement = event.currentTarget;
  const rect = buttonElement.getBoundingClientRect();
  
  // Calculate position for the menu
  menuPosition.value = {
    x: rect.left, // Position at the left edge of the button
    y: rect.bottom // Position below the button
  };
  
  // Show the menu
  showCellMenuFlag.value = true;
};

// Save task
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

// Configure sprints
const configureSprints = async (sprintData) => {
  try {
    await sprintStore.configureSprints(currentProject.value.id, sprintData);
    showSprintDialog.value = false;
  } catch (error) {
    console.error('Error configuring sprints:', error);
  }
};

// Drag and drop for cell summaries
const dragSource = ref({ epicId: null, sprintId: null });

// Handle cell drag start
const handleCellDragStart = (event, epicId, sprintId) => {
  // Only allow dragging cells with tasks
  const tasks = getTasksForCell(epicId, sprintId);
  if (tasks.length === 0) {
    event.preventDefault();
    return;
  }
  
  dragSource.value = { epicId, sprintId };
  
  // Set the drag data
  event.dataTransfer.setData('application/json', JSON.stringify({
    epicId,
    sprintId,
    taskCount: tasks.length
  }));
  
  // Set visual feedback
  event.target.classList.add('dragging');
};

// Handle cell drag enter
const handleDragEnter = (event, epicId, sprintId) => {
  const targetCell = event.currentTarget;
  if (targetCell && dragSource.value.epicId && 
      (dragSource.value.epicId !== epicId || dragSource.value.sprintId !== sprintId)) {
    targetCell.classList.add('drag-over');
  }
};

// Handle cell drag leave
const handleDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove('drag-over');
  }
};

// Handle cell drop - move all tasks
const handleCellDrop = async (event, targetEpicId, targetSprintId) => {
  event.currentTarget.classList.remove('drag-over');
  
  const sourceEpicId = dragSource.value.epicId;
  const sourceSprintId = dragSource.value.sprintId;
  
  // Clear drag source
  dragSource.value = { epicId: null, sprintId: null };
  
  // Don't do anything if dropped on the same cell
  if (sourceEpicId === targetEpicId && sourceSprintId === targetSprintId) {
    return;
  }
  
  // Get tasks from source cell
  const tasksToMove = getTasksForCell(sourceEpicId, sourceSprintId);
  if (tasksToMove.length === 0) return;
  
  // Find target sprint for due date
  const targetSprint = sprints.value.find(s => s.id === targetSprintId);
  if (!targetSprint) return;
  
  // Calculate middle of target sprint for new due date
  const startDate = new Date(targetSprint.startDate);
  const endDate = new Date(targetSprint.endDate);
  const middleDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
  const newDueDate = middleDate.toISOString().split('T')[0];
  
  try {
    // Move each task to the target epic and sprint
    for (const task of tasksToMove) {
      await taskStore.updateTask(task.id, {
        epicId: targetEpicId,
        dueDate: newDueDate
      });
    }
  } catch (error) {
    console.error('Error moving tasks:', error);
  }
};

// Initialize
onMounted(async () => {
  try {
    // Fetch tasks if needed
    if (taskStore.tasks.length === 0 && currentProject.value) {
      await taskStore.fetchTasks(currentProject.value.id);
    }
    
    // Fetch epics if needed
    if (epicStore.epics.length === 0 && currentProject.value) {
      await epicStore.fetchEpics(currentProject.value.id);
    }
    
    // Fetch sprints if needed
    if (sprintStore.sprints.length === 0 && currentProject.value) {
      await sprintStore.fetchSprints(currentProject.value.id);
    }
    
    loading.value = false;
  } catch (error) {
    console.error("Error loading data:", error);
    loading.value = false;
  }
});

// Watch for project changes
watch(() => route.params.id, async (newId) => {
  if (newId && newId !== currentProject.value?.id) {
    loading.value = true;
    
    try {
      // Fetch tasks if needed
      await taskStore.fetchTasks(newId);
      
      // Fetch epics if needed
      await epicStore.fetchEpics(newId);
      
      // Fetch sprints if needed
      await sprintStore.fetchSprints(newId);
      
      loading.value = false;
    } catch (error) {
      console.error("Error loading data:", error);
      loading.value = false;
    }
  }
});

// Close detail panel when changing views or filters
watch([groupBy, filterEpic], () => {
  showDetailPanel.value = false;
  selectedCell.value = null;
});
</script>


<style scoped>
.roadmap-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.roadmap-header {
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 0;
  position: relative;
  z-index: 5;
}

.breadcrumbs-container {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 28px;
  margin-top: 0;
  padding-top: 0;
}

.controls-container {
  min-height: 40px;
  margin-top: 0;
}

.scroll-indicator {
  padding-top: 2px;
  padding-bottom: 0;
  margin-top: 0;
  position: relative;
  z-index: 4;
}

.scroll-track {
  height: 3px;
  background-color: #e6e6e6;
  border-radius: 1.5px;
  position: relative;
}

.scroll-thumb {
  height: 3px;
  background-color: #4a86e8;
  border-radius: 1.5px;
  position: absolute;
  top: 0;
  transition: left 0.1s ease;
}

.roadmap-content {
  flex: 1;
  overflow: auto;
  position: relative;
  margin-top: 0;
  z-index: 3;
}

/* Roadmap Table Styles */
.roadmap-wrapper {
  padding: 16px;
  overflow: auto;
  height: 100%;
}

.roadmap-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 800px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.roadmap-table th,
.roadmap-table td {
  padding: 12px;
  border: 1px solid #e0e0e0;
  min-width: 140px;
}

.roadmap-table th {
  position: sticky;
  top: 0;
  background-color: #f5f5f5;
  z-index: 1;
  text-align: left;
  font-weight: 500;
}

.fixed-column {
  position: sticky;
  left: 0;
  background-color: #f5f5f5;
  z-index: 2;
  font-weight: 500;
}

.task-cell {
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.task-cell:hover {
  background-color: #f9f9f9;
}

.selected-cell {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.5) !important;
}

.cell-summary {
  padding: 4px;
}

.task-count {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-cell {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 2px;
}

.empty-message {
  text-align: center;
  padding: 32px;
  color: #757575;
}

/* Sprint Headers */
.sprint-header {
  position: relative;
  min-width: 160px;
}

.milestone-marker {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.milestone-diamond {
  width: 12px;
  height: 12px;
  background-color: var(--v-theme-primary);
  transform: rotate(45deg);
}

.milestone-name {
  font-size: 10px;
  margin-top: 2px;
  background-color: var(--v-theme-primary);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.milestone-tag {
  display: inline-block;
  background-color: var(--v-theme-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
}

/* Detail Panel - Fixed z-index to appear above the TopBar */
.detail-panel {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed !important;
  z-index: 2000 !important;
  margin-top: 40px !important;
}

/* Navigation drawer styles */
:deep(.v-navigation-drawer) {
  z-index: 2000 !important;
  margin-top: 40px !important;
  height: calc(100% - 40px) !important;
  max-height: calc(100% - 40px) !important;
}

.detail-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* Custom task item styles */
.custom-task-item {
  cursor: pointer;
  background-color: #f8f8f8;
  transition: background-color 0.2s;
}

.custom-task-item:hover {
  background-color: #f1f1f1;
}

/* Task content area */
.task-content {
  min-width: 0;
  overflow: hidden;
}

.task-title {
  color: rgba(0, 0, 0, 0.87);
  overflow: hidden; 
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
  font-size: 0.875rem;
}

.task-type {
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
}

/* Helper class for flex items */
.min-width-0 {
  min-width: 0;
}

/* Status headers */
.text-overline {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

/* Drag and Drop */
.dragging {
  opacity: 0.5;
}

.drag-over {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border: 2px dashed rgba(var(--v-theme-primary), 0.5) !important;
}

/* Cell Menu */
:deep(.v-menu__content) {
  z-index: 2001 !important;
  min-width: 150px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
}

:deep(.v-list) {
  padding: 4px !important;
}

:deep(.menu-item) {
  min-height: 36px !important;
  padding: 0 12px !important;
}

:deep(.menu-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

:deep(.v-list-item-title) {
  font-size: 14px !important;
  font-weight: 400 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

/* Cell menu trigger button */
.cell-menu-trigger {
  opacity: 0.7;
}

.cell-menu-trigger:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Remove margins and padding from direct children */
.roadmap-header > *,
.breadcrumbs-container > *,
.controls-container > * {
  margin-top: 0;
  margin-bottom: 0;
}

/* Fix for Vuetify internal spacing */
:deep(.v-btn-toggle) {
  margin-top: 0;
  margin-bottom: 0;
}

:deep(.v-navigation-drawer__content > *:first-child) {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Ensure the detail panel's overlay has a high z-index */
:deep(.v-overlay__content) {
  z-index: 2000 !important;
}

:deep(.v-overlay__scrim) {
  z-index: 1999 !important;
}
</style>