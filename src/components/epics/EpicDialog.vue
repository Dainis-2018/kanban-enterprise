<template>
    <v-dialog
      v-model="dialog"
      max-width="600px"
      @update:model-value="onDialogChanged"
    >
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ editMode ? 'Edit Epic' : 'Create New Epic' }}
        </v-card-title>
        
        <v-card-text class="px-4 pt-2 pb-0">
          <v-form ref="form" v-model="isFormValid" @submit.prevent="save">
            <!-- Epic Name -->
            <v-text-field
              v-model="epicData.name"
              label="Epic Name"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-3"
              hide-details="auto"
            ></v-text-field>
            
            <!-- Epic Description -->
            <v-textarea
              v-model="epicData.description"
              label="Description"
              rows="3"
              auto-grow
              variant="outlined"
              class="mb-3"
              hide-details="auto"
            ></v-textarea>
            
            <div class="d-flex gap-3">
              <!-- Start Date -->
              <v-menu
                v-model="startDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedStartDate"
                    label="Start Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    hide-details="auto"
                    class="mb-3"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="epicData.startDate"
                  @update:model-value="startDateMenu = false"
                ></v-date-picker>
              </v-menu>
              
              <!-- End Date -->
              <v-menu
                v-model="endDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedEndDate"
                    label="End Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    hide-details="auto"
                    class="mb-3"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="epicData.endDate"
                  :min="epicData.startDate"
                  @update:model-value="endDateMenu = false"
                ></v-date-picker>
              </v-menu>
            </div>
            
            <!-- Tags -->
            <v-combobox
              v-model="epicData.tags"
              label="Tags"
              chips
              multiple
              variant="outlined"
              class="mb-3"
              hide-details="auto"
            >
              <template v-slot:selection="{ item, index }">
                <v-chip
                  :key="index"
                  size="small"
                  closable
                  @click:close="removeTag(item)"
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-combobox>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!isFormValid"
            @click="save"
          >
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: null
    },
    epic: {
      type: Object,
      default: null
    },
    editMode: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'save']);
  
  // Local refs
  const dialog = ref(props.modelValue);
  const form = ref(null);
  const isFormValid = ref(false);
  const startDateMenu = ref(false);
  const endDateMenu = ref(false);
  
  // Form data
  const epicData = ref({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: []
  });
  
  // Format dates for display
  const formattedStartDate = computed(() => {
    if (!epicData.value.startDate) return '';
    return formatDate(epicData.value.startDate);
  });
  
  const formattedEndDate = computed(() => {
    if (!epicData.value.endDate) return '';
    return formatDate(epicData.value.endDate);
  });
  
  // Form validation rules
  const rules = {
    required: v => !!v || 'This field is required'
  };
  
  // Watch for changes in modelValue prop
  watch(() => props.modelValue, (newValue) => {
    dialog.value = newValue;
  });
  
  // Watch for changes in dialog local ref
  watch(() => dialog.value, (newValue) => {
    emit('update:modelValue', newValue);
  });
  
  // Watch for epic data changes
  watch(() => props.epic, (newValue) => {
    if (newValue) {
      epicData.value = {
        name: newValue.name || '',
        description: newValue.description || '',
        startDate: newValue.startDate || new Date().toISOString().split('T')[0],
        endDate: newValue.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: newValue.tags || []
      };
    } else {
      // Reset form when no epic provided
      resetForm();
    }
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Handle dialog changes
  const onDialogChanged = (value) => {
    if (!value) {
      resetForm();
    }
  };
  
  // Remove a tag from the tags array
  const removeTag = (tag) => {
    epicData.value.tags = epicData.value.tags.filter(t => t !== tag);
  };
  
  // Reset form to default values
  const resetForm = () => {
    if (form.value) {
      form.value.reset();
    }
    
    epicData.value = {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: []
    };
  };
  
  // Save the epic
  const save = () => {
    if (!isFormValid.value) return;
  
    // Ensure projectId is included if in edit mode
    const epicToSave = {
      ...epicData.value,
      projectId: props.epic?.projectId
    };
    
    emit('save', epicToSave);
    dialog.value = false;
  };
  
  // Initialize component
  onMounted(() => {
    if (props.epic) {
      epicData.value = {
        name: props.epic.name || '',
        description: props.epic.description || '',
        startDate: props.epic.startDate || new Date().toISOString().split('T')[0],
        endDate: props.epic.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: props.epic.tags || []
      };
    }
  });
  </script>