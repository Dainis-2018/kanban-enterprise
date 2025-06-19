<template>
    <v-card elevation="2" class="team-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ team.name }}</span>
        
        <!-- Card Menu -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="text"
              v-bind="props"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="$emit('edit', team)">
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="$emit('delete', team)" color="error">
              <template v-slot:prepend>
                <v-icon>mdi-delete</v-icon>
              </template>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text>
        <!-- Team Stats -->
        <div class="d-flex align-center mb-4">
          <div class="team-stat">
            <div class="text-h6">{{ members.length }}</div>
            <div class="text-caption">Members</div>
          </div>
          <v-divider vertical class="mx-3" style="height: 40px;"></v-divider>
          <div class="team-stat">
            <div class="text-h6">{{ getTeamProjects(team.name).length }}</div>
            <div class="text-caption">Projects</div>
          </div>
        </div>
        
        <!-- Team Members -->
        <div>
          <div class="d-flex justify-space-between align-center mb-3">
            <h3 class="text-subtitle-1">Team Members</h3>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-account-plus"
              @click="$emit('add-member', team)"
            >
              Add
            </v-btn>
          </div>
          
          <div v-if="members.length === 0" class="text-center py-4 text-grey">
            No members yet
          </div>
          
          <v-list v-else density="compact" class="team-members-list">
            <v-list-item
              v-for="member in members"
              :key="member.id"
              :value="member.id"
            >
              <template v-slot:prepend>
                <UserAvatar :user="member" size="32" />
              </template>
              
              <v-list-item-title>{{ member.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ member.role }}</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="confirmRemoveMember(member)"
                  :disabled="members.length === 1"
                  color="grey"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      
      <!-- Remove Member Confirmation Dialog -->
      <v-dialog v-model="showConfirmDialog" max-width="400">
        <v-card>
          <v-card-title class="text-subtitle-1">
            Remove Team Member
          </v-card-title>
          <v-card-text>
            Are you sure you want to remove {{ memberToRemove?.name }} from this team?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="showConfirmDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              @click="removeMember"
            >
              Remove
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useProjectStore } from '../../stores/project';
  import UserAvatar from '../common/UserAvatar.vue';
  
  const props = defineProps({
    team: {
      type: Object,
      required: true
    },
    members: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['edit', 'delete', 'add-member', 'remove-member']);
  
  // Project store for team projects
  const projectStore = useProjectStore();
  
  // Get projects for this team
  const getTeamProjects = (teamName) => {
    return projectStore.projects.filter(project => project.team === teamName);
  };
  
  // Remove member dialog
  const showConfirmDialog = ref(false);
  const memberToRemove = ref(null);
  
  // Confirm removing a member
  const confirmRemoveMember = (member) => {
    memberToRemove.value = member;
    showConfirmDialog.value = true;
  };
  
  // Remove a member
  const removeMember = () => {
    if (!memberToRemove.value) return;
    
    emit('remove-member', props.team.id, memberToRemove.value.id);
    showConfirmDialog.value = false;
    memberToRemove.value = null;
  };
  </script>
  
  <style scoped>
  .team-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .team-stat {
    text-align: center;
    min-width: 80px;
  }
  
  .team-members-list {
    max-height: 280px;
    overflow-y: auto;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.02);
  }
  </style>