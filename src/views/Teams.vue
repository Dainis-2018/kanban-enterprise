<template>
    <div class="teams-view">
      <!-- Teams Header -->
      <div class="d-flex align-center justify-space-between py-4 px-6">
        <h2 class="text-h5 font-weight-bold">{{ $t('teams.team_members') }}</h2>
        
        <!-- Controls -->
        <div class="d-flex align-center">
          <!-- Search -->
          <SearchBar
            placeholder="Search teams or members..."
            class="me-4"
            style="width: 220px"
            v-model:value="searchQuery"
            @search="handleSearch"
          />
          
          <!-- Create New Team -->
          <v-btn 
            color="primary" 
            prepend-icon="mdi-account-group-outline"
            @click="showNewTeamDialog = true"
          >
            Create Team
          </v-btn>
        </div>
      </div>
      
      <!-- Teams Content -->
      <div class="teams-container px-6 py-4">
        <div v-if="loadingTeams" class="d-flex justify-center align-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        
        <div v-else-if="filteredTeams.length === 0" class="d-flex flex-column align-center pa-8">
          <v-icon icon="mdi-account-group-outline" size="48" color="grey"></v-icon>
          <div class="text-subtitle-1 mt-4">No teams found</div>
          <v-btn 
            class="mt-4" 
            color="primary"
            @click="showNewTeamDialog = true"
          >
            Create Your First Team
          </v-btn>
        </div>
        
        <div v-else>
          <v-row>
            <v-col
              v-for="team in filteredTeams"
              :key="team.id"
              cols="12"
              md="6"
              lg="4"
            >
              <TeamCard
                :team="team"
                :members="getTeamMembers(team.id)"
                @edit="editTeam"
                @delete="confirmDeleteTeam"
                @add-member="showAddMemberDialog(team)"
                @remove-member="removeMemberFromTeam"
              />
            </v-col>
          </v-row>
        </div>
      </div>
      
      <!-- New/Edit Team Dialog -->
      <TeamDialog
        v-model="showTeamDialog"
        :edit-mode="teamDialogMode === 'edit'"
        :team="currentTeam"
        @save="saveTeam"
      />
      
      <!-- Add Member Dialog -->
      <v-dialog v-model="showAddDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Add Team Member
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-4">
            <v-autocomplete
              v-model="selectedMember"
              :items="availableMembers"
              item-title="name"
              item-value="id"
              label="Select User"
              variant="outlined"
              return-object
              class="mb-3"
            >
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
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="tonal"
              @click="showAddDialog = false"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!selectedMember"
              @click="addMemberToTeam"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">
            Delete Team
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete the team "{{ currentTeam?.name }}"? This action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="showDeleteDialog = false"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              @click="deleteTeam"
            >
              {{ $t('common.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useUserStore } from '../stores/user';
  import SearchBar from '../components/common/SearchBar.vue';
  import UserAvatar from '../components/common/UserAvatar.vue';
  import TeamCard from '../components/teams/TeamCard.vue';
  import TeamDialog from '../components/teams/TeamDialog.vue';
  
  // Store
  const userStore = useUserStore();
  
  // Loading state
  const loadingTeams = computed(() => userStore.loadingTeams);
  
  // Search
  const searchQuery = ref('');
  
  // Dialog controls
  const showTeamDialog = ref(false);
  const teamDialogMode = ref('add'); // 'add' or 'edit'
  const currentTeam = ref(null);
  const showDeleteDialog = ref(false);
  
  // Add member dialog
  const showAddDialog = ref(false);
  const selectedMember = ref(null);
  const targetTeam = ref(null);
  
  // Filtered teams
  const filteredTeams = computed(() => {
    let result = [...userStore.allTeams];
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      
      // Search by team name
      let teamResults = result.filter(team => 
        team.name.toLowerCase().includes(query)
      );
      
      // Search by team member name
      const userResults = userStore.allUsers.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query)
      );
      
      if (userResults.length > 0) {
        // Find teams that contain matching users
        const userIds = userResults.map(user => user.id);
        const teamsByMembers = result.filter(team => 
          team.members.some(memberId => userIds.includes(memberId))
        );
        
        // Merge and deduplicate results
        teamResults = [...new Set([...teamResults, ...teamsByMembers])];
      }
      
      result = teamResults;
    }
    
    return result;
  });
  
  // Get team members
  const getTeamMembers = (teamId) => {
    return userStore.getTeamMembers(teamId);
  };
  
  // Available members for adding to a team
  const availableMembers = computed(() => {
    if (!targetTeam.value) return [];
    
    // Filter out users already in the team
    return userStore.allUsers.filter(user => 
      !targetTeam.value.members.includes(user.id)
    );
  });
  
  // Handle search
  const handleSearch = (query) => {
    searchQuery.value = query;
  };
  
  // Team dialog functions
  const showNewTeamDialog = () => {
    currentTeam.value = {
      name: '',
      members: []
    };
    teamDialogMode.value = 'add';
    showTeamDialog.value = true;
  };
  
  const editTeam = (team) => {
    currentTeam.value = { ...team };
    teamDialogMode.value = 'edit';
    showTeamDialog.value = true;
  };
  
  const confirmDeleteTeam = (team) => {
    currentTeam.value = team;
    showDeleteDialog.value = true;
  };
  
  const saveTeam = async (teamData) => {
    try {
      if (teamDialogMode.value === 'add') {
        await userStore.createTeam(teamData);
      } else {
        await userStore.updateTeam(currentTeam.value.id, teamData);
      }
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };
  
  const deleteTeam = async () => {
    try {
      if (!currentTeam.value) return;
      
      // In a real app, we'd call an API to delete the team
      // For demo, we could implement a deleteTeam method in the store
      // await userStore.deleteTeam(currentTeam.value.id);
      
      console.log('Deleting team:', currentTeam.value.id);
      showDeleteDialog.value = false;
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };
  
  // Team member functions
  const showAddMemberDialog = (team) => {
    targetTeam.value = team;
    selectedMember.value = null;
    showAddDialog.value = true;
  };
  
  const addMemberToTeam = async () => {
    try {
      if (!targetTeam.value || !selectedMember.value) return;
      
      await userStore.addUserToTeam(targetTeam.value.id, selectedMember.value.id);
      showAddDialog.value = false;
    } catch (error) {
      console.error('Error adding member to team:', error);
    }
  };
  
  const removeMemberFromTeam = async (teamId, userId) => {
    try {
      await userStore.removeUserFromTeam(teamId, userId);
    } catch (error) {
      console.error('Error removing member from team:', error);
    }
  };
  
  // Initialize data
  watch(
    () => userStore.teams,
    (newTeams) => {
      if (newTeams.length === 0) {
        userStore.fetchTeams();
      }
    },
    { immediate: true }
  );
  
  watch(
    () => userStore.users,
    (newUsers) => {
      if (newUsers.length === 0) {
        userStore.fetchUsers();
      }
    },
    { immediate: true }
  );
  </script>
  
  <style scoped>
  .teams-view {
    height: 100%;
    overflow-y: auto;
  }
  
  .teams-container {
    min-height: 200px;
  }
  </style>