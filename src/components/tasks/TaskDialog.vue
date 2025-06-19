<template>
  <v-dialog
    v-model="dialogModel"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 pa-4">
        {{ editMode ? $t('tasks.edit_task') : $t('tasks.add_task') }}
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveTask">
          <!-- Task Title -->
          <v-text-field
            v-model="formData.title"
            :label="$t('tasks.title')"
            variant="outlined"
            :rules="[v => !!v || 'Task title is required']"
            required
            class="mb-3"
          ></v-text-field>
          
          <!-- Task Type and Priority -->
          <div class="d-flex gap-3 mb-3">
            <v-text-field
              v-model="formData.type"
              label="Type"
              variant="outlined"
              :rules="[v => !!v || 'Task type is required']"
              required
              class="flex-grow-1"
            ></v-text-field>
            
            <v-select
              v-model="formData.priority"
              :items="priorityOptions"
              label="Priority"
              variant="outlined"
              :rules="[v => !!v || 'Priority is required']"
              required
              class="flex-grow-1"
            ></v-select>
          </div>
          
          <!-- Status, Due Date, and Epic -->
          <div class="d-flex gap-3 mb-3">
            <v-select
              v-model="formData.status"
              :items="statusOptions"
              item-title="title"
              item-value="id"
              label="Status"
              variant="outlined"
              :rules="[v => !!v || 'Status is required']"
              required
              class="flex-grow-1"
            ></v-select>
            
            <v-text-field
              v-model="formData.dueDate"
              label="Due Date"
              variant="outlined"
              type="date"
              class="flex-grow-1"
            ></v-text-field>
          </div>
          
          <!-- Epic Selection -->
          <v-select
            v-model="formData.epicId"
            :items="epicOptions"
            item-title="name"
            item-value="id"
            label="Epic"
            variant="outlined"
            clearable
            class="mb-3"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="undefined"
              >
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="item.raw.description">{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
          
          <!-- Description -->
          <v-textarea
            v-model="formData.description"
            :label="$t('tasks.description')"
            variant="outlined"
            rows="3"
            auto-grow
            class="mb-3"
          ></v-textarea>
          
          <!-- Assignees -->
          <v-autocomplete
            v-model="formData.assignees"
            :items="userOptions"
            item-title="name"
            item-value="id"
            :label="$t('tasks.assignees')"
            variant="outlined"
            multiple
            chips
            closable-chips
            class="mb-3"
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                size="small"
                prepend-avatar
              >
                <template v-slot:prepend>
                  <UserAvatar :user="item.raw" size="20" />
                </template>
                {{ item.raw.name }}
              </v-chip>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="undefined"
              >
                <template v-slot:prepend>
                  <UserAvatar :user="item.raw" size="30" />
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.role }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>
          
          <!-- Tags -->
          <div class="mb-3">
            <v-autocomplete
              v-model="formData.tags"
              :items="tagOptions"
              item-title="name"
              item-value="id"
              :label="$t('tasks.tags')"
              variant="outlined"
              multiple
              chips
              closable-chips
            >
              <template v-slot:chip="{ props, item }">
                <TagBadge
                  :customTag="item.raw"
                  class="mr-n2"
                />
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="undefined"
                >
                  <template v-slot:prepend>
                    <div
                      class="color-preview"
                      :style="{
                        backgroundColor: item.raw.color,
                        borderColor: item.raw.borderColor
                      }"
                    ></div>
                  </template>
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
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
          @click="saveTask"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useTaskStore } from '../../stores/task';
import { useUserStore } from '../../stores/user';
import { useTagStore } from '../../stores/tag';
import { useEpicStore } from '../../stores/epic';
import UserAvatar from '../common/UserAvatar.vue';
import TagBadge from '../common/TagBadge.vue';

// Define resetForm function before it's used
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    type: 'Task',
    priority: 'P2',
    status: 'todo',
    dueDate: null,
    epicId: null,
    assignees: [],
    tags: []
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
  task: {
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

// Stores
const taskStore = useTaskStore();
const userStore = useUserStore();
const tagStore = useTagStore();
const epicStore = useEpicStore();

// Form validation
const form = ref(null);
const isFormValid = ref(false);

// Form data with default values
const formData = ref({
  title: '',
  description: '',
  type: 'Task',
  priority: 'P2',
  status: 'todo',
  dueDate: null,
  epicId: null,
  assignees: [],
  tags: []
});

// Options for selects
const statusOptions = computed(() => taskStore.getColumns);

const priorityOptions = [
  { title: 'P1 - High', value: 'P1' },
  { title: 'P2 - Medium', value: 'P2' },
  { title: 'P3 - Low', value: 'P3' }
];

const userOptions = computed(() => userStore.allUsers);
const tagOptions = computed(() => tagStore.allTags);

// Get epic options based on the task's project
const epicOptions = computed(() => {
  if (!formData.value || !formData.value.projectId) return [];
  return epicStore.epicsByProject(formData.value.projectId) || [];
});

// Initialize form data when editing
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = { ...newTask };
    
    // Convert date to YYYY-MM-DD format for input
    if (formData.value.dueDate) {
      try {
        const date = new Date(formData.value.dueDate);
        formData.value.dueDate = date.toISOString().split('T')[0];
      } catch (e) {
        console.error('Invalid date format:', e);
      }
    }
  } else {
    resetForm();
  }
}, { immediate: true });

// Close dialog
const closeDialog = () => {
  dialogModel.value = false;
  resetForm();
};

// Save task
const saveTask = () => {
  if (!isFormValid.value) return;
  
  // Format the date if it exists
  let taskData = { ...formData.value };
  if (taskData.dueDate) {
    taskData.dueDate = new Date(taskData.dueDate).toISOString();
  }
  
  emit('save', taskData);
  closeDialog();
};
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.color-preview {
  width: 24px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid;
  margin-right: 8px;
}
</style>