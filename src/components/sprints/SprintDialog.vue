<template>
    <v-dialog
      v-model="dialog"
      max-width="800px"
      @update:model-value="onDialogChanged"
    >
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Configure Sprints
        </v-card-title>
        
        <v-card-text class="px-4 pt-2 pb-0">
          <div class="mb-4 d-flex align-center">
            <v-select
              v-model="sprintConfig.sprintDuration"
              :items="[
                { title: '1 week', value: 7 },
                { title: '2 weeks', value: 14 },
                { title: '3 weeks', value: 21 },
                { title: '4 weeks', value: 28 }
              ]"
              label="Sprint Duration"
              variant="outlined"
              hide-details
              density="compact"
              style="max-width: 150px"
              class="mr-4"
            ></v-select>
            
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
                  hide-details
                  density="compact"
                  style="max-width: 180px"
                  class="mr-4"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="sprintConfig.startDate"
                @update:model-value="startDateMenu = false"
              ></v-date-picker>
            </v-menu>
            
            <v-text-field
              v-model="sprintConfig.sprintCount"
              label="Number of Sprints"
              type="number"
              min="1"
              max="12"
              variant="outlined"
              hide-details
              density="compact"
              style="max-width: 150px"
              class="mr-4"
            ></v-text-field>
            
            <v-btn
              color="primary"
              variant="text"
              @click="generateSprints"
              size="small"
            >
              Generate Sprints
            </v-btn>
          </div>
          
          <!-- Sprint Configuration Table -->
          <v-table class="sprint-table">
            <thead>
              <tr>
                <th>Sprint Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Goal</th>
                <th>Milestone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sprintConfig.sprints.length === 0">
                <td colspan="6" class="text-center py-4">
                  No sprints configured. Use the controls above to generate sprints.
                </td>
              </tr>
              <tr v-for="(sprint, index) in sprintConfig.sprints" :key="index">
                <td>
                  <v-text-field
                    v-model="sprint.name"
                    variant="plain"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </td>
                <td>
                  <v-menu
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="sprint.formattedStartDate"
                        variant="plain"
                        density="compact"
                        hide-details
                        readonly
                        v-bind="props"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="sprint.startDate"
                      @update:model-value="updateSprintDates(index)"
                    ></v-date-picker>
                  </v-menu>
                </td>
                <td>
                  <v-menu
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="sprint.formattedEndDate"
                        variant="plain"
                        density="compact"
                        hide-details
                        readonly
                        v-bind="props"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="sprint.endDate"
                      :min="sprint.startDate"
                    ></v-date-picker>
                  </v-menu>
                </td>
                <td>
                  <v-text-field
                    v-model="sprint.goal"
                    variant="plain"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="sprint.milestone"
                    variant="plain"
                    density="compact"
                    hide-details
                    placeholder="Optional"
                  ></v-text-field>
                </td>
                <td>
                  <v-btn
                    icon
                    density="compact"
                    variant="text"
                    color="error"
                    @click="removeSprint(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <div class="d-flex justify-center my-4">
            <v-btn
              prepend-icon="mdi-plus"
              variant="outlined"
              @click="addSprint"
              :disabled="sprintConfig.sprints.length >= 12"
            >
              Add Sprint
            </v-btn>
          </div>
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
            :disabled="sprintConfig.sprints.length === 0"
            @click="save"
          >
            Save Configuration
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
    existingSprints: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'save']);
  
  // Local refs
  const dialog = ref(props.modelValue);
  const startDateMenu = ref(false);
  
  // Sprint configuration
  const sprintConfig = ref({
    sprintDuration: 14, // Default to 2 weeks
    startDate: new Date().toISOString().split('T')[0],
    sprintCount: 4,
    sprints: []
  });
  
  // Format start date for display
  const formattedStartDate = computed(() => {
    if (!sprintConfig.value.startDate) return '';
    return formatDate(sprintConfig.value.startDate);
  });
  
  // Watch for changes in modelValue prop
  watch(() => props.modelValue, (newValue) => {
    dialog.value = newValue;
    
    // Initialize with existing sprints if available
    if (newValue && props.existingSprints.length > 0) {
      sprintConfig.value.sprints = props.existingSprints.map(sprint => ({
        ...sprint,
        formattedStartDate: formatDate(sprint.startDate),
        formattedEndDate: formatDate(sprint.endDate)
      }));
    }
  });
  
  // Watch for changes in dialog local ref
  watch(() => dialog.value, (newValue) => {
    emit('update:modelValue', newValue);
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
  
  // Generate sprints based on configuration
  const generateSprints = () => {
    const { startDate, sprintDuration, sprintCount } = sprintConfig.value;
    
    // Clear existing sprints
    sprintConfig.value.sprints = [];
    
    // Create sprints
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < sprintCount; i++) {
      const sprintStartDate = new Date(currentDate);
      const sprintEndDate = new Date(currentDate);
      sprintEndDate.setDate(sprintEndDate.getDate() + sprintDuration - 1);
      
      let milestone = null;
      // Assign sample milestones like in the wireframe
      if (i === 0 && sprintCount >= 2) milestone = 'MVP';
      else if (i === Math.floor(sprintCount * 0.6) && sprintCount >= 3) milestone = 'Beta Release';
      else if (i === sprintCount - 1 && sprintCount >= 4) milestone = 'v1.0';
      
      sprintConfig.value.sprints.push({
        name: `Sprint ${i + 1}`,
        startDate: sprintStartDate.toISOString().split('T')[0],
        formattedStartDate: formatDate(sprintStartDate),
        endDate: sprintEndDate.toISOString().split('T')[0],
        formattedEndDate: formatDate(sprintEndDate),
        goal: `Complete sprint ${i + 1} objectives`,
        milestone
      });
      
      // Move to the next sprint start date
      currentDate.setDate(currentDate.getDate() + sprintDuration);
    }
  };
  
  // Add a new sprint to the end
  const addSprint = () => {
    const lastSprint = sprintConfig.value.sprints[sprintConfig.value.sprints.length - 1];
    let startDate = new Date();
    let endDate = new Date();
    
    if (lastSprint) {
      startDate = new Date(lastSprint.endDate);
      startDate.setDate(startDate.getDate() + 1);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + sprintConfig.value.sprintDuration - 1);
    } else {
      endDate.setDate(endDate.getDate() + sprintConfig.value.sprintDuration - 1);
    }
    
    sprintConfig.value.sprints.push({
      name: `Sprint ${sprintConfig.value.sprints.length + 1}`,
      startDate: startDate.toISOString().split('T')[0],
      formattedStartDate: formatDate(startDate),
      endDate: endDate.toISOString().split('T')[0],
      formattedEndDate: formatDate(endDate),
      goal: `Complete sprint objectives`,
      milestone: null
    });
  };
  
  // Remove a sprint
  const removeSprint = (index) => {
    sprintConfig.value.sprints.splice(index, 1);
    
    // Rename sprints to keep sequential numbers
    sprintConfig.value.sprints.forEach((sprint, i) => {
      sprint.name = `Sprint ${i + 1}`;
    });
  };
  
  // Update sprint dates
  const updateSprintDates = (index) => {
    const sprint = sprintConfig.value.sprints[index];
    
    // Update formatted dates
    sprint.formattedStartDate = formatDate(sprint.startDate);
    
    // Update end date based on duration
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + sprintConfig.value.sprintDuration - 1);
    
    sprint.endDate = endDate.toISOString().split('T')[0];
    sprint.formattedEndDate = formatDate(endDate);
  };
  
  // Handle dialog changes
  const onDialogChanged = (value) => {
    if (!value) {
      // Reset form when dialog closes
      sprintConfig.value = {
        sprintDuration: 14,
        startDate: new Date().toISOString().split('T')[0],
        sprintCount: 4,
        sprints: []
      };
    }
  };
  
  // Save the sprint configuration
  const save = () => {
    // Prepare sprints for saving (remove formatted dates)
    const sprintsToSave = sprintConfig.value.sprints.map(({ formattedStartDate, formattedEndDate, ...sprint }) => sprint);
    
    emit('save', { sprints: sprintsToSave });
    dialog.value = false;
  };
  
  // Initialize component
  onMounted(() => {
    // If we have existing sprints, use them
    if (props.existingSprints.length > 0) {
      sprintConfig.value.sprints = props.existingSprints.map(sprint => ({
        ...sprint,
        formattedStartDate: formatDate(sprint.startDate),
        formattedEndDate: formatDate(sprint.endDate)
      }));
    }
  });
  </script>
  
  <style scoped>
  .sprint-table {
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
  
  .v-text-field.v-text-field--plain :deep(fieldset) {
    display: none;
  }
  
  .v-text-field.v-text-field--plain :deep(.v-field__input) {
    padding: 8px 0;
  }
  </style>