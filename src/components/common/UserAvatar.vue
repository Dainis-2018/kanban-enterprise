<template>
    <div class="user-avatar" :style="avatarStyle">
      <v-avatar
        :size="size"
        :color="generateColorFromInitials(user?.initials || 'U')"
      >
        <span v-if="!user?.avatar" class="text-white">{{ user?.initials || 'U' }}</span>
        <v-img v-else :src="user.avatar" :alt="user?.name || 'User'"></v-img>
      </v-avatar>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    user: {
      type: Object,
      default: () => ({
        id: 'unknown',
        name: 'Unknown User',
        initials: 'U',
        avatar: null
      })
    },
    size: {
      type: [Number, String],
      default: 36
    }
  });
  
  // Generate a background color based on user initials
  const generateColorFromInitials = (initials) => {
    if (!initials) return '#757575';
    
    // Simple hash function to generate a consistent color
    const hash = Array.from(initials).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    // List of pleasant colors
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffc107', '#ff9800', '#ff5722',
      '#795548', '#607d8b', '#9e9e9e'
    ];
    
    // Use the hash to pick a color
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Additional styling
  const avatarStyle = computed(() => ({
    display: 'inline-flex'
  }));
  </script>
  
  <style scoped>
  .user-avatar {
    cursor: pointer;
  }
  </style>