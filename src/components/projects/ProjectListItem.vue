<template>
    <v-card
      class="project-list-item"
      :to="`/projects/${project.id}`"
      variant="outlined"
      rounded="lg"
    >
      <div class="d-flex align-center px-4 py-3">
        <!-- Color Badge -->
        <div class="color-badge me-4" :style="{ backgroundColor: project.color }"></div>
        
        <!-- Project Details -->
        <div class="project-details flex-grow-1">
          <div class="d-flex align-center">
            <h3 class="text-subtitle-1 font-weight-bold mb-0">{{ project.name }}</h3>
            <v-btn
              icon
              variant="text"
              size="small"
              class="ms-2"
              @click.stop.prevent="toggleFavorite"
            >
              <v-icon :color="project.isFavorite ? 'amber-darken-2' : 'grey'">
                {{ project.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="d-flex align-center text-body-2 mt-1">
            <span class="me-4">{{ project.team }}</span>
            <span class="me-2">{{ project.taskCount }} {{ $t('projects.tasks') }}</span>
            <span class="mx-1">•</span>
            <span>{{ project.sprintCount }} {{ $t('projects.sprints') }}</span>
          </div>
        </div>
        
        <!-- Updated Info -->
        <div class="me-4 text-center">
          <div class="text-caption text-grey">{{ $t('projects.updated') }}</div>
          <div class="text-caption">{{ formatDate(project.lastUpdated) }}</div>
        </div>
        
        <!-- Progress -->
        <div class="me-4 text-center" style="width: 80px;">
          <v-progress-circular
            :model-value="project.progress"
            :color="getProgressColor(project.progress)"
            size="32"
          >
            {{ project.progress }}%
          </v-progress-circular>
        </div>
        
        <!-- Actions -->
        <div>
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                v-bind="props"
                @click.stop.prevent
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                @click.stop.prevent="$emit('edit', project)"
                prepend-icon="mdi-pencil"
                title="Edit"
              ></v-list-item>
              <v-list-item
                @click.stop.prevent="$emit('delete', project)"
                prepend-icon="mdi-delete"
                title="Delete"
                color="error"
              ></v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import { formatDistanceToNow } from 'date-fns';
  
  const props = defineProps({
    project: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['favorite', 'edit', 'delete']);
  
  // Format relative date
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    emit('favorite', props.project.id);
  };
  
  // Get progress color based on percentage
  const getProgressColor = (progress) => {
    if (progress < 25) return 'error';
    if (progress < 50) return 'warning';
    if (progress < 75) return 'info';
    return 'success';
  };
  </script>
  
  <style scoped>
  .project-list-item {
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  
  .project-list-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  .color-badge {
    width: 12px;
    height: 40px;
    border-radius: 6px;
  }
  </style>