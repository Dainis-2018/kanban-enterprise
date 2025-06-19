<template>
    <div class="app-logo">
      <v-icon color="primary" size="large" class="mr-2">mdi-briefcase-check</v-icon>
      <span class="app-name">{{ $t('common.app_name') }}</span>
    </div>
  </template>
  
  <script setup>
  // No additional logic needed
  </script>
  
  <style scoped>
  .app-logo {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.87);
    text-decoration: none;
  }
  
  .app-name {
    white-space: nowrap;
  }
  </style>