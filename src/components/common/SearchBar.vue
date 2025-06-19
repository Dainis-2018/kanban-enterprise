<template>
    <div class="search-bar">
      <v-text-field
        v-model="searchInput"
        :placeholder="placeholder"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        @update:model-value="handleSearch"
        @click:clear="clearSearch"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { debounce } from 'lodash';
  
  const props = defineProps({
    placeholder: {
      type: String,
      default: 'Search...'
    },
    value: {
      type: String,
      default: ''
    },
    debounceTime: {
      type: Number,
      default: 300
    }
  });
  
  const emit = defineEmits(['update:value', 'search', 'clear']);
  
  // Internal search input state
  const searchInput = ref(props.value);
  
  // Watch for external changes to value
  watch(() => props.value, (newValue) => {
    searchInput.value = newValue;
  });
  
  // Debounced search handler
  const handleSearch = debounce((value) => {
    emit('update:value', value);
    emit('search', value);
  }, props.debounceTime);
  
  // Clear search
  const clearSearch = () => {
    searchInput.value = '';
    emit('update:value', '');
    emit('clear');
    emit('search', '');
  };
  </script>
  
  <style scoped>
  .search-bar {
    width: 100%;
  }
  </style>