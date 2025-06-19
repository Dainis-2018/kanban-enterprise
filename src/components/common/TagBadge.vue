<template>
    <span
      class="tag-badge"
      :style="{
        backgroundColor: tag?.color || '#e0e0e0',
        borderColor: tag?.borderColor || '#c0c0c0'
      }"
    >
      {{ tag?.name || label }}
    </span>
  </template>
  
  <script setup>
  import { useTagStore } from '../../stores/tag';
  import { computed } from 'vue';
  
  const props = defineProps({
    tagId: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: 'Tag'
    },
    customTag: {
      type: Object,
      default: null
    }
  });
  
  const tagStore = useTagStore();
  
  // Get tag from store if provided an ID, otherwise use customTag
  const tag = computed(() => {
    if (props.customTag) return props.customTag;
    if (props.tagId) return tagStore.getTagById(props.tagId);
    return null;
  });
  </script>
  
  <style scoped>
  .tag-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 10px;
    border: 1px solid;
    white-space: nowrap;
    margin-right: 4px;
    margin-bottom: 4px;
  }
  </style>