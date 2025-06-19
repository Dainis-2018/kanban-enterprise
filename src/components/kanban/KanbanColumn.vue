<template>
  <div class="kanban-column" :class="{ 'is-collapsed': !isExpanded }">
    <!-- Column Header -->
    <div class="column-header" @click="toggleExpand">
      <div class="d-flex align-center">
        <h3 class="column-title">
          {{ column.title }} <span class="column-count">({{ tasks.length }})</span>
        </h3>
        
        <!-- Column Limit Badge -->
        <v-chip
          v-if="column.limit > 0"
          size="x-small"
          :color="getColumnLimitColor(tasks.length, column.limit)"
          class="ms-2"
        >
          {{ tasks.length }}/{{ column.limit }}
        </v-chip>
      </div>
      
      <div class="column-actions">
        <!-- Add Task Button -->
        <v-btn
          icon
          variant="text"
          size="small"
          @click.stop="$emit('addTask', column.id)"
          v-if="isExpanded"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        
        <!-- Expand/Collapse Button -->
        <v-btn
          icon
          variant="text"
          size="small"
          @click.stop="toggleExpand"
        >
          <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
        
        <!-- Column Menu -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="text"
              size="small"
              v-bind="props"
              @click.stop
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click.stop="$emit('addTask', column.id)">
              <template v-slot:prepend>
                <v-icon>mdi-plus</v-icon>
              </template>
              <v-list-item-title>Add Task</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="toggleExpand">
              <template v-slot:prepend>
                <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </template>
              <v-list-item-title>{{ isExpanded ? 'Collapse' : 'Expand' }}</v-list-item-title>
            </v-list-item>
            <!-- Additional column actions could be added here -->
          </v-list>
        </v-menu>
      </div>
    </div>
    
    <!-- Column Content - Task List -->
    <div class="column-content" v-show="isExpanded">
      <draggable
        v-model="tasksList"
        group="tasks"
        :animation="200"
        ghost-class="ghost-card"
        drag-class="drag-card"
        @end="handleDragEnd"
        item-key="id"
      >
        <template #item="{ element: task }">
          <KanbanCard
            :task="task"
            @edit="$emit('editTask', task)"
            @delete="$emit('deleteTask', task)"
          />
        </template>
      </draggable>
      
      <!-- Empty State -->
      <div v-if="tasks.length === 0" class="empty-column">
        <p class="text-caption text-center text-grey">
          No tasks in this column
        </p>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          @click="$emit('addTask', column.id)"
          class="mt-2"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Task
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import draggable from 'vuedraggable';
import KanbanCard from './KanbanCard.vue';

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  },
  isExpanded: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggleExpand', 'addTask', 'editTask', 'deleteTask', 'moveTask']);

// Computed property for tasks to enable drag-and-drop
const tasksList = computed({
  get: () => props.tasks,
  set: (value) => {
    // The model is updated by the library but we don't need to emit anything here
    // as we'll handle changes in the handleDragEnd method
  }
});

// Toggle expand/collapse
const toggleExpand = () => {
  emit('toggleExpand', props.column.id);
};

// Get column limit color based on task count and limit
const getColumnLimitColor = (count, limit) => {
  const percentage = (count / limit) * 100;
  
  if (percentage >= 100) return 'error';
  if (percentage >= 75) return 'warning';
  return 'success';
};

// Handle drag end event
const handleDragEnd = (event) => {
  // If the task was moved to a different column
  if (event.from !== event.to) {
    const taskId = event.item.getAttribute('data-id');
    const newStatus = event.to.getAttribute('data-column');
    
    if (taskId && newStatus) {
      emit('moveTask', taskId, newStatus);
    }
  }
};
</script>

<style scoped>
.kanban-column {
  width: 300px;
  min-width: 300px;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  transition: width 0.3s ease;
}

.kanban-column.is-collapsed {
  width: 300px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f0f0;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  cursor: pointer;
}

.column-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.column-count {
  font-weight: normal;
  color: rgba(0, 0, 0, 0.6);
}

.column-actions {
  display: flex;
  align-items: center;
}

.column-content {
  padding: 10px;
  overflow-y: auto;
  flex-grow: 1;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  margin-top: 10px;
}

/* Draggable styles */
.ghost-card {
  opacity: 0.5;
}

.drag-card {
  transform: rotate(3deg);
}
</style>