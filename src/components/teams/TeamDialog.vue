<template>
    <v-dialog
      v-model="dialogModel"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ editMode ? 'Edit Team' : 'Create New Team' }}
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="isFormValid" @submit.prevent="saveTeam">
            <!-- Team Name -->
            <v-text-field
              v-model="formData.name"
              label="Team Name"
              variant="outlined"
              :rules="[v => !!v || 'Team name is required']"
              required
              class="mb-4"
            ></v-text-field>
            
            <!-- Team Members -->
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="text-subtitle-1">Team Members</label>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-account-plus"
                  @click="showMemberSelector = true"
                  :disabled="availableUsers.length === 0"
                >
                  Add Members
                </v-btn>
              </div>
              
              <div v-if="selectedMembers.length === 0" class="text-center py-4 text-grey border rounded">
                No members selected
              </div>
              
              <v-list v-else density="compact" class="border rounded mb-2">
                <v-list-item
                  v-for="user in selectedMembers"
                  :key="user.id"
                  :value="user.id"
                >
                  <template v-slot:prepend>
                    <UserAvatar :user="user" size="32" />
                  </template>
                  
                  <v-list-item-title>{{ user.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.role }}</v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click="removeSelectedMember(user.id)"
                      color="grey"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
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
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid || selectedMembers.length === 0"
            @click="saveTeam"
          >
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Member Selector Dialog -->
    <v-dialog v-model="showMemberSelector" max-width="500">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Add Team Members
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-4">
          <v-text-field
            v-model="memberSearch"
            label="Search users"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-magnify"
            clearable
            class="mb-3"
          ></v-text-field>
          
          <v-list density="compact" class="member-selector-list border rounded">
            <v-list-item
              v-for="user in filteredAvailableUsers"
              :key="user.id"
              :value="user.id"
              @click="toggleSelectedMember(user)"
            >
              <template v-slot:prepend>
                <v-checkbox-btn
                  :model-value="isUserSelected(user.id)"
                  @update:model-value="toggleSelectedMember(user)"
                  hide-details
                  density="compact"
                ></v-checkbox-btn>
                <UserAvatar :user="user" size="32" class="ms-2" />
              </template>
              
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item v-if="filteredAvailableUsers.length === 0">
              <v-list-item-title class="text-center text-grey">
                No available users found
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="tonal"
            @click="showMemberSelector = false"
          >
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useUserStore } from '../../stores/user';
  import UserAvatar from '../common/UserAvatar.vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    editMode: {
      type: Boolean,
      default: false
    },
    team: {
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
  
  // User store
  const userStore = useUserStore();
  
  // Form validation
  const form = ref(null);
  const isFormValid = ref(false);
  
  // Form data
  const formData = ref({
    name: '',
    members: []
  });
  
  // Selected members
  const selectedUserIds = ref([]);
  const selectedMembers = computed(() => {
    return userStore.allUsers.filter(user => 
      selectedUserIds.value.includes(user.id)
    );
  });
  
  // Member selector dialog
  const showMemberSelector = ref(false);
  const memberSearch = ref('');
  
  // Available users (not yet selected)
  const availableUsers = computed(() => {
    return userStore.allUsers.filter(user => 
      !selectedUserIds.value.includes(user.id)
    );
  });
  
  // Filtered available users based on search
  const filteredAvailableUsers = computed(() => {
    if (!memberSearch.value) return availableUsers.value;
    
    const query = memberSearch.value.toLowerCase();
    return availableUsers.value.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });
  
  // Check if user is selected
  const isUserSelected = (userId) => {
    return selectedUserIds.value.includes(userId);
  };
  
  // Toggle user selection
  const toggleSelectedMember = (user) => {
    const index = selectedUserIds.value.indexOf(user.id);
    if (index === -1) {
      selectedUserIds.value.push(user.id);
    } else {
      selectedUserIds.value.splice(index, 1);
    }
  };
  
  // Remove selected member
  const removeSelectedMember = (userId) => {
    const index = selectedUserIds.value.indexOf(userId);
    if (index !== -1) {
      selectedUserIds.value.splice(index, 1);
    }
  };
  
  // Initialize form data when editing
  watch(() => props.team, (newTeam) => {
    if (newTeam) {
      formData.value.name = newTeam.name || '';
      selectedUserIds.value = [...(newTeam.members || [])];
    } else {
      resetForm();
    }
  }, { immediate: true });
  
  // Reset form data
  const resetForm = () => {
    formData.value = {
      name: '',
      members: []
    };
    selectedUserIds.value = [];
    
    if (form.value) {
      form.value.resetValidation();
    }
  };
  
  // Close dialog
  const closeDialog = () => {
    dialogModel.value = false;
    resetForm();
  };
  
  // Save team
  const saveTeam = () => {
    if (!isFormValid.value || selectedMembers.value.length === 0) return;
    
    const teamData = {
      name: formData.value.name,
      members: [...selectedUserIds.value]
    };
    
    emit('save', teamData);
    closeDialog();
  };
  </script>
  
  <style scoped>
  .border {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  
  .member-selector-list {
    max-height: 300px;
    overflow-y: auto;
  }
  </style>