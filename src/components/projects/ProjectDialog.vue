<template>
  <v-dialog
    v-model="dialogModel"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 pa-4">
        {{ editMode ? $t('projects.edit_project') : $t('projects.new_project') }}
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveProject">
          <!-- Project Name -->
          <v-text-field
            v-model="formData.name"
            :label="$t('projects.project_details')"
            variant="outlined"
            :rules="[v => !!v || 'Project name is required']"
            required
            class="mb-3"
          ></v-text-field>
          
          <!-- Team Selection -->
          <v-select
            v-model="formData.team"
            :items="teamOptions"
            label="Team"
            variant="outlined"
            :rules="[v => !!v || 'Team is required']"
            required
            class="mb-3"
          ></v-select>
          
          <!-- Color Selection -->
          <div class="mb-3">
            <label class="text-subtitle-2 mb-1 d-block">Color</label>
            <div class="d-flex flex-wrap mt-2 gap-2">
              <v-btn
                v-for="color in colorOptions"
                :key="color"
                :color="color"
                icon
                variant="flat"
                size="small"
                :style="{ 
                  border: formData.color === color ? '2px solid black' : 'none',
                  transform: formData.color === color ? 'scale(1.2)' : 'none'
                }"
                @click="formData.color = color"
              >
                <v-icon v-if="formData.color === color" color="white">mdi-check</v-icon>
              </v-btn>
            </div>
          </div>
          
          <!-- Description -->
          <v-textarea
            v-model="formData.description"
            label="Description"
            variant="outlined"
            rows="3"
            auto-grow
            class="mb-3"
          ></v-textarea>
          
          <!-- Date Range -->
          <div class="d-flex gap-3 mb-3">
            <v-text-field
              v-model="formData.startDate"
              label="Start Date"
              variant="outlined"
              type="date"
              :rules="[v => !!v || 'Start date is required']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="formData.endDate"
              label="End Date"
              variant="outlined"
              type="date"
              :rules="[
                v => !!v || 'End date is required',
                v => !formData.startDate || v >= formData.startDate || 'End date must be after start date'
              ]"
              required
            ></v-text-field>
          </div>
        </v-form>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="tonal"
          @click="closeDialog"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!isFormValid"
          @click="saveProject"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useUserStore } from '../../stores/user';

// Define resetForm function before it's used
const resetForm = () => {
  formData.value = {
    name: '',
    team: teamOptions.value.length > 0 ? teamOptions.value[0] : '',
    color: '#4a86e8',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  };
  
  if (form.value) {
    form.value.resetValidation();
  }
};

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editMode: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

// Dialog model (v-model binding)
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Form validation
const form = ref(null);
const isFormValid = ref(false);

// Form data
const formData = ref({
  name: '',
  team: '',
  color: '#4a86e8',
  description: '',
  startDate: '',
  endDate: ''
});

// Get user store
const userStore = useUserStore();

// Team options
const teamOptions = computed(() => {
  return userStore.allTeams.map(team => team.name);
});

// Color options
const colorOptions = [
  '#4a86e8', // Blue
  '#db4437', // Red
  '#0f9d58', // Green
  '#f4b400', // Yellow
  '#673ab7', // Purple
  '#3f51b5', // Indigo
  '#795548', // Brown
  '#607d8b', // Blue Grey
  '#ff5722', // Deep Orange
  '#009688', // Teal
  '#e91e63', // Pink
  '#cddc39'  // Lime
];

// Initialize form data when editing
watch(() => props.project, (newProject) => {
  if (newProject && props.editMode) {
    formData.value = { ...newProject };
  } else {
    resetForm();
  }
}, { immediate: true });

// Close dialog
const closeDialog = () => {
  dialogModel.value = false;
  resetForm();
};

// Save project
const saveProject = () => {
  if (!isFormValid.value) return;
  
  emit('save', { ...formData.value });
  closeDialog();
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>