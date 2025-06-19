<template>
    <v-card
      class="project-card"
      :to="`/projects/${project.id}`"
      elevation="2"
      height="160"
    >
      <!-- Project Header -->
      <v-card-item
        :style="{ backgroundColor: project.color }"
        class="card-header py-2"
      >
        <v-card-title class="text-white text-truncate">
          {{ project.name }}
        </v-card-title>
        
        <!-- Favorite Button -->
        <template v-slot:append>
          <v-btn
            icon
            variant="text"
            color="white"
            size="small"
            @click.stop.prevent="toggleFavorite"
          >
            <v-icon>{{ project.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
          </v-btn>
        </template>
      </v-card-item>
      
      <!-- Project Details -->
      <v-card-text class="py-2">
        <div class="mt-1 text-subtitle-2">{{ project.team }}</div>
        <div class="mt-1 text-body-2">
          {{ project.taskCount }} {{ $t('projects.tasks') }} • 
          {{ project.sprintCount }} {{ $t('projects.sprints') }}
        </div>
        <div class="mt-1 text-caption text-grey">
          {{ $t('projects.updated') }} {{ formatDate(project.lastUpdated) }}
        </div>
      </v-card-text>
      
      <!-- Project Footer -->
      <v-card-actions class="pa-0">
        <div class="d-flex justify-space-between align-center w-100 px-4 pb-2">
          <!-- Progress Badge -->
          <v-chip
            size="small"
            :color="getProgressColor(project.progress)"
            :text="getProgressText(project.progress)"
            variant="outlined"
          >
            {{ project.progress }}%
          </v-chip>
          
          <!-- Actions Menu -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                v-bind="props"
                size="small"
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
      </v-card-actions>
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
  
  // Get progress text
  const getProgressText = (progress) => {
    if (progress < 25) return 'Starting';
    if (progress < 50) return 'In Progress';
    if (progress < 75) return 'Advanced';
    if (progress < 100) return 'Almost Done';
    return 'Completed';
  };
  </script>
  
  <style scoped>
  .project-card {
    transition: transform 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }
  
  .project-card:hover {
    transform: translateY(-4px);
  }
  
  .card-header {
    height: 40px;
    display: flex;
    align-items: center;
  }
  </style>