<template>
    <div class="project-settings">
      <!-- Settings Header -->
      <div class="d-flex align-center justify-space-between py-4 px-6 settings-header">
        <!-- Left Side - Breadcrumbs -->
        <div class="d-flex align-center">
          <div class="text-body-2 text-grey me-1">
            {{ $t('projects.projects') }} / {{ currentProject?.team }} /
          </div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ currentProject?.name }} - {{ $t('navigation.settings') }}
          </div>
        </div>
        
        <!-- Right Side - Actions -->
        <div>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!hasChanges"
            @click="saveChanges"
          >
            Save Changes
          </v-btn>
        </div>
      </div>
      
      <!-- Settings Content -->
      <div class="settings-content px-6 py-4">
        <v-container>
          <v-row>
            <!-- Left Column - Settings Navigation -->
            <v-col cols="12" md="3">
              <v-card flat border>
                <v-list nav>
                  <v-list-item
                    v-for="(section, index) in settingsSections"
                    :key="index"
                    :value="section.value"
                    :active="activeSection === section.value"
                    @click="activeSection = section.value"
                    rounded="lg"
                    :prepend-icon="section.icon"
                  >
                    <v-list-item-title>{{ section.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
                
                <!-- Danger Zone -->
                <v-divider class="my-3"></v-divider>
                <v-list nav>
                  <v-list-item
                    value="danger-zone"
                    :active="activeSection === 'danger-zone'"
                    @click="activeSection = 'danger-zone'"
                    rounded="lg"
                    prepend-icon="mdi-alert-circle"
                    color="error"
                  >
                    <v-list-item-title>Danger Zone</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            
            <!-- Right Column - Settings Content -->
            <v-col cols="12" md="9">
              <v-card flat border>
                <!-- General Settings -->
                <div v-if="activeSection === 'general'" class="pa-4">
                  <h2 class="text-h5 mb-4">General Settings</h2>
                  
                  <v-form ref="generalForm">
                    <!-- Project Name -->
                    <v-text-field
                      v-model="projectData.name"
                      label="Project Name"
                      variant="outlined"
                      :rules="[v => !!v || 'Project name is required']"
                      class="mb-4"
                    ></v-text-field>
                    
                    <!-- Project Description -->
                    <v-textarea
                      v-model="projectData.description"
                      label="Description"
                      variant="outlined"
                      rows="3"
                      auto-grow
                      class="mb-4"
                    ></v-textarea>
                    
                    <!-- Project Dates -->
                    <div class="d-flex gap-3 mb-4">
                      <v-text-field
                        v-model="projectData.startDate"
                        label="Start Date"
                        variant="outlined"
                        type="date"
                        :rules="[v => !!v || 'Start date is required']"
                      ></v-text-field>
                      
                      <v-text-field
                        v-model="projectData.endDate"
                        label="End Date"
                        variant="outlined"
                        type="date"
                        :rules="[
                          v => !!v || 'End date is required',
                          v => !projectData.startDate || v >= projectData.startDate || 'End date must be after start date'
                        ]"
                      ></v-text-field>
                    </div>
                    
                    <!-- Project Color -->
                    <div class="mb-4">
                      <label class="text-subtitle-2 mb-1 d-block">Project Color</label>
                      <div class="d-flex flex-wrap mt-2 gap-2">
                        <v-btn
                          v-for="color in colorOptions"
                          :key="color"
                          :color="color"
                          icon
                          variant="flat"
                          size="small"
                          :style="{ 
                            border: projectData.color === color ? '2px solid black' : 'none',
                            transform: projectData.color === color ? 'scale(1.2)' : 'none'
                          }"
                          @click="projectData.color = color"
                        >
                          <v-icon v-if="projectData.color === color" color="white">mdi-check</v-icon>
                        </v-btn>
                      </div>
                    </div>
                    
                    <!-- Team Selection -->
                    <v-select
                      v-model="projectData.team"
                      :items="teamOptions"
                      label="Team"
                      variant="outlined"
                      :rules="[v => !!v || 'Team is required']"
                      class="mb-4"
                    ></v-select>
                  </v-form>
                </div>
                
                <!-- Team Members -->
                <div v-else-if="activeSection === 'team-members'" class="pa-4">
                  <h2 class="text-h5 mb-4">Team Members</h2>
                  
                  <div class="d-flex justify-space-between align-center mb-4">
                    <p class="text-body-1">Manage who has access to this project.</p>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-account-plus"
                      @click="showAddMemberDialog = true"
                    >
                      Add Member
                    </v-btn>
                  </div>
                  
                  <v-list class="border rounded">
                    <v-list-item
                      v-for="member in teamMembers"
                      :key="member.id"
                      :value="member.id"
                    >
                      <template v-slot:prepend>
                        <UserAvatar :user="member" size="40" />
                      </template>
                      
                      <v-list-item-title>{{ member.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ member.role }}</v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <v-btn
                          icon
                          variant="text"
                          @click="removeMember(member)"
                          :disabled="teamMembers.length <= 1"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
                
                <!-- Workflow Settings -->
                <div v-else-if="activeSection === 'workflow'" class="pa-4">
                  <h2 class="text-h5 mb-4">Workflow Settings</h2>
                  
                  <div class="d-flex justify-space-between align-center mb-4">
                    <p class="text-body-1">Customize your project's workflow columns.</p>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-plus"
                      @click="showAddColumnDialog = true"
                    >
                      Add Column
                    </v-btn>
                  </div>
                  
                  <v-list class="border rounded">
                    <v-list-item
                      v-for="column in workflowColumns"
                      :key="column.id"
                      :value="column.id"
                    >
                      <template v-slot:prepend>
                        <v-icon icon="mdi-format-list-bulleted" class="me-2"></v-icon>
                      </template>
                      
                      <v-list-item-title>{{ column.title }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ column.limit ? `Task Limit: ${column.limit}` : 'No limit' }}
                      </v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <div class="d-flex align-center">
                          <v-btn
                            icon
                            variant="text"
                            @click="editColumn(column)"
                            class="me-2"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            @click="confirmDeleteColumn(column)"
                            :disabled="isDefaultColumn(column.id) || workflowColumns.length <= 2"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                  
                  <div class="d-flex mt-4">
                    <v-btn
                      variant="outlined"
                      prepend-icon="mdi-arrow-up-down"
                      @click="showReorderColumnsDialog = true"
                    >
                      Reorder Columns
                    </v-btn>
                  </div>
                </div>
                
                <!-- Tags Settings -->
                <div v-else-if="activeSection === 'tags'" class="pa-4">
                  <h2 class="text-h5 mb-4">Tags</h2>
                  
                  <div class="d-flex justify-space-between align-center mb-4">
                    <p class="text-body-1">Manage tags to categorize your tasks.</p>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-tag-plus"
                      @click="showAddTagDialog = true"
                    >
                      Add Tag
                    </v-btn>
                  </div>
                  
                  <div class="tags-grid">
                    <v-card
                      v-for="tag in projectTags"
                      :key="tag.id"
                      :style="{
                        backgroundColor: tag.color,
                        borderColor: tag.borderColor
                      }"
                      class="tag-card"
                      flat
                    >
                      <div class="d-flex justify-space-between align-center pa-2">
                        <span class="tag-name">{{ tag.name }}</span>
                        <div>
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            @click="editTag(tag)"
                            class="me-1"
                          >
                            <v-icon size="small">mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            @click="confirmDeleteTag(tag)"
                          >
                            <v-icon size="small">mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
                
                <!-- Notifications Settings -->
                <div v-else-if="activeSection === 'notifications'" class="pa-4">
                  <h2 class="text-h5 mb-4">Notifications</h2>
                  
                  <p class="text-body-1 mb-4">Configure when you receive notifications for this project.</p>
                  
                  <v-list class="border rounded">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-checkbox-btn v-model="notificationSettings.taskAssigned"></v-checkbox-btn>
                      </template>
                      <v-list-item-title>Task Assigned</v-list-item-title>
                      <v-list-item-subtitle>Get notified when a task is assigned to you</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-checkbox-btn v-model="notificationSettings.taskCompleted"></v-checkbox-btn>
                      </template>
                      <v-list-item-title>Task Completed</v-list-item-title>
                      <v-list-item-subtitle>Get notified when a task is marked as completed</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-checkbox-btn v-model="notificationSettings.taskComment"></v-checkbox-btn>
                      </template>
                      <v-list-item-title>Task Comments</v-list-item-title>
                      <v-list-item-subtitle>Get notified when someone comments on a task you're assigned to</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-checkbox-btn v-model="notificationSettings.dueDateApproaching"></v-checkbox-btn>
                      </template>
                      <v-list-item-title>Due Date Approaching</v-list-item-title>
                      <v-list-item-subtitle>Get notified when a task's due date is approaching</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-checkbox-btn v-model="notificationSettings.projectUpdates"></v-checkbox-btn>
                      </template>
                      <v-list-item-title>Project Updates</v-list-item-title>
                      <v-list-item-subtitle>Get notified about general project updates</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
                
                <!-- Integrations Settings -->
                <div v-else-if="activeSection === 'integrations'" class="pa-4">
                  <h2 class="text-h5 mb-4">Integrations</h2>
                  
                  <p class="text-body-1 mb-4">Connect your project with other services.</p>
                  
                  <v-list class="border rounded">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-avatar size="42" class="me-3">
                          <v-img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub"></v-img>
                        </v-avatar>
                      </template>
                      <v-list-item-title>GitHub</v-list-item-title>
                      <v-list-item-subtitle>Link your project with GitHub repositories</v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <v-btn
                          variant="outlined"
                          :color="integrations.github ? 'error' : 'primary'"
                          @click="integrations.github = !integrations.github"
                        >
                          {{ integrations.github ? 'Disconnect' : 'Connect' }}
                        </v-btn>
                      </template>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-avatar size="42" class="me-3">
                          <v-img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg" alt="Slack"></v-img>
                        </v-avatar>
                      </template>
                      <v-list-item-title>Slack</v-list-item-title>
                      <v-list-item-subtitle>Send project notifications to Slack channels</v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <v-btn
                          variant="outlined"
                          :color="integrations.slack ? 'error' : 'primary'"
                          @click="integrations.slack = !integrations.slack"
                        >
                          {{ integrations.slack ? 'Disconnect' : 'Connect' }}
                        </v-btn>
                      </template>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-avatar size="42" class="me-3">
                          <v-img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google Calendar"></v-img>
                        </v-avatar>
                      </template>
                      <v-list-item-title>Google Calendar</v-list-item-title>
                      <v-list-item-subtitle>Sync project timeline with Google Calendar</v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <v-btn
                          variant="outlined"
                          :color="integrations.googleCalendar ? 'error' : 'primary'"
                          @click="integrations.googleCalendar = !integrations.googleCalendar"
                        >
                          {{ integrations.googleCalendar ? 'Disconnect' : 'Connect' }}
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
                
                <!-- Danger Zone -->
                <div v-else-if="activeSection === 'danger-zone'" class="pa-4">
                  <h2 class="text-h5 mb-4 text-error">Danger Zone</h2>
                  
                  <v-card color="error" variant="outlined" class="mb-4">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h3 class="text-subtitle-1 font-weight-bold">Archive Project</h3>
                          <p class="text-body-2">The project will be archived and hidden from active projects.</p>
                        </div>
                        <v-btn
                          variant="outlined"
                          color="error"
                          @click="confirmArchiveProject"
                        >
                          Archive Project
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                  
                  <v-card color="error" variant="outlined">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h3 class="text-subtitle-1 font-weight-bold">Delete Project</h3>
                          <p class="text-body-2">Once you delete a project, there is no going back. Please be certain.</p>
                        </div>
                        <v-btn
                          variant="outlined"
                          color="error"
                          @click="confirmDeleteProject"
                        >
                          Delete Project
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
      
      <!-- Add Member Dialog -->
      <v-dialog v-model="showAddMemberDialog" max-width="500">
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
              @click="showAddMemberDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!selectedMember"
              @click="addMember"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Add/Edit Column Dialog -->
      <v-dialog v-model="showColumnDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            {{ editingColumn ? 'Edit Column' : 'Add Column' }}
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-4">
            <v-form ref="columnForm" v-model="isColumnFormValid">
              <v-text-field
                v-model="columnData.title"
                label="Column Title"
                variant="outlined"
                :rules="[v => !!v || 'Column title is required']"
                class="mb-3"
              ></v-text-field>
              
              <v-text-field
                v-model="columnData.limit"
                label="Task Limit (0 for no limit)"
                variant="outlined"
                type="number"
                min="0"
                class="mb-3"
              ></v-text-field>
            </v-form>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="tonal"
              @click="showColumnDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!isColumnFormValid"
              @click="saveColumn"
            >
              {{ editingColumn ? 'Update' : 'Add' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Reorder Columns Dialog -->
      <v-dialog v-model="showReorderColumnsDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Reorder Columns
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-4">
            <v-list class="border rounded">
              <draggable
                v-model="workflowColumnsOrder"
                handle=".handle"
                item-key="id"
              >
                <template v-slot:item="{element}">
                  <v-list-item :value="element.id">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-drag" class="handle cursor-move"></v-icon>
                    </template>
                    <v-list-item-title>{{ element.title }}</v-list-item-title>
                  </v-list-item>
                </template>
              </draggable>
            </v-list>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="tonal"
              @click="showReorderColumnsDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="saveColumnOrder"
            >
              Save Order
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Add/Edit Tag Dialog -->
      <v-dialog v-model="showTagDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            {{ editingTag ? 'Edit Tag' : 'Add Tag' }}
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-4">
            <v-form ref="tagForm" v-model="isTagFormValid">
              <v-text-field
                v-model="tagData.name"
                label="Tag Name"
                variant="outlined"
                :rules="[v => !!v || 'Tag name is required']"
                class="mb-3"
              ></v-text-field>
              
              <!-- Color Picker -->
              <div class="mb-3">
                <label class="text-subtitle-2 mb-1 d-block">Tag Color</label>
                <div class="d-flex flex-wrap mt-2 gap-2">
                  <v-btn
                    v-for="(color, index) in tagColorOptions"
                    :key="index"
                    :style="{
                      backgroundColor: color.color,
                      borderColor: color.borderColor,
                      border: tagData.color === color.color ? '2px solid black' : '1px solid ' + color.borderColor,
                      transform: tagData.color === color.color ? 'scale(1.2)' : 'none'
                    }"
                    icon
                    variant="flat"
                    size="small"
                    class="tag-color-btn"
                    @click="selectTagColor(color)"
                  ></v-btn>
                </div>
              </div>
            </v-form>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="tonal"
              @click="showTagDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!isTagFormValid"
              @click="saveTag"
            >
              {{ editingTag ? 'Update' : 'Add' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Confirmation Dialogs -->
      <v-dialog v-model="showConfirmDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6 pa-4">
            {{ confirmDialogTitle }}
          </v-card-title>
          <v-card-text class="pa-4">
            {{ confirmDialogMessage }}
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="tonal"
              @click="showConfirmDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              :color="confirmDialogColor"
              variant="tonal"
              @click="executeConfirmAction"
            >
              {{ confirmDialogAction }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useProjectStore } from '../stores/project';
  import { useUserStore } from '../stores/user';
  import { useTaskStore } from '../stores/task';
  import { useTagStore } from '../stores/tag';
  import { VueDraggable } from 'vuedraggable/src/vuedraggable';
  import UserAvatar from '../components/common/UserAvatar.vue';
  
  // Router and stores
  const router = useRouter();
  const projectStore = useProjectStore();
  const userStore = useUserStore();
  const taskStore = useTaskStore();
  const tagStore = useTagStore();
  
  // Active settings section
  const activeSection = ref('general');
  
  // Current project and data
  const currentProject = computed(() => projectStore.currentProject ? projectStore.getProjectById(projectStore.currentProject) : null);
  const projectData = ref({
    name: '',
    description: '',
    color: '',
    team: '',
    startDate: '',
    endDate: ''
  });
  
  // Loading and saving states
  const loading = ref(false);
  const saving = ref(false);
  const hasChanges = ref(false);
  
  // Team members
  const teamMembers = ref([]);
  const showAddMemberDialog = ref(false);
  const selectedMember = ref(null);
  
  // Available members for adding
  const availableMembers = computed(() => {
    const teamId = userStore.getTeamByName(projectData.value.team)?.id;
    if (!teamId) return [];
    
    // Get team members
    const allTeamMembers = userStore.getTeamMembers(teamId);
    
    // Filter out members already in the project team
    return allTeamMembers.filter(member => 
      !teamMembers.value.some(m => m.id === member.id)
    );
  });
  
  // Workflow columns
  const workflowColumns = ref([]);
  const workflowColumnsOrder = ref([]);
  const showColumnDialog = ref(false);
  const showReorderColumnsDialog = ref(false);
  const isColumnFormValid = ref(false);
  const editingColumn = ref(false);
  const columnData = ref({
    id: '',
    title: '',
    limit: 0,
    order: 0
  });
  
  // Tags
  const projectTags = ref([]);
  const showTagDialog = ref(false);
  const isTagFormValid = ref(false);
  const editingTag = ref(false);
  const tagData = ref({
    id: '',
    name: '',
    color: '',
    borderColor: ''
  });
  
  // Notification settings
  const notificationSettings = ref({
    taskAssigned: true,
    taskCompleted: true,
    taskComment: true,
    dueDateApproaching: true,
    projectUpdates: false
  });
  
  // Integrations
  const integrations = ref({
    github: false,
    slack: false,
    googleCalendar: false
  });
  
  // Confirmation dialog
  const showConfirmDialog = ref(false);
  const confirmDialogTitle = ref('');
  const confirmDialogMessage = ref('');
  const confirmDialogAction = ref('');
  const confirmDialogColor = ref('error');
  const confirmAction = ref(null);
  
  // Settings sections
  const settingsSections = [
    { title: 'General', value: 'general', icon: 'mdi-cog-outline' },
    { title: 'Team Members', value: 'team-members', icon: 'mdi-account-group-outline' },
    { title: 'Workflow', value: 'workflow', icon: 'mdi-view-column-outline' },
    { title: 'Tags', value: 'tags', icon: 'mdi-tag-outline' },
    { title: 'Notifications', value: 'notifications', icon: 'mdi-bell-outline' },
    { title: 'Integrations', value: 'integrations', icon: 'mdi-connection' }
  ];
  
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
  
  // Tag color options
  const tagColorOptions = [
    { color: '#e8f0fe', borderColor: '#c8d9f3' }, // Light blue
    { color: '#e6f4ea', borderColor: '#c8e6c9' }, // Light green
    { color: '#fce8e6', borderColor: '#f3c8c8' }, // Light red
    { color: '#fef8e1', borderColor: '#f9e0a3' }, // Light yellow
    { color: '#ffebee', borderColor: '#ffcdd2' }, // Light pink
    { color: '#e0f7fa', borderColor: '#b2ebf2' }, // Light cyan
    { color: '#f3e5f5', borderColor: '#e1bee7' }, // Light purple
    { color: '#e8eaf6', borderColor: '#c5cae9' }, // Light indigo
    { color: '#e0f2f1', borderColor: '#b2dfdb' }, // Light teal
    { color: '#f9fbe7', borderColor: '#f0f4c3' }, // Light lime
    { color: '#efebe9', borderColor: '#d7ccc8' }, // Light brown
    { color: '#fce4ec', borderColor: '#f8bbd0' }  // Light pink
  ];
  
  // Team options
  const teamOptions = computed(() => {
    return userStore.allTeams.map(team => team.name);
  });
  
  // Initialize data
  const initializeProjectData = () => {
    if (!currentProject.value) return;
    
    projectData.value = {
      name: currentProject.value.name || '',
      description: currentProject.value.description || '',
      color: currentProject.value.color || '#4a86e8',
      team: currentProject.value.team || '',
      startDate: currentProject.value.startDate || '',
      endDate: currentProject.value.endDate || ''
    };
    
    // Reset change tracking
    hasChanges.value = false;
    
    // Initialize team members
    const teamId = userStore.getTeamByName(projectData.value.team)?.id;
    if (teamId) {
      teamMembers.value = userStore.getTeamMembers(teamId);
    }
    
    // Initialize workflow columns
    workflowColumns.value = [...taskStore.getColumns];
    workflowColumnsOrder.value = [...workflowColumns.value].sort((a, b) => a.order - b.order);
    
    // Initialize tags
    projectTags.value = [...tagStore.allTags];
  };
  
  // Watch for changes in project data to detect modifications
  watch(projectData, () => {
    hasChanges.value = true;
  }, { deep: true });
  
  watch(notificationSettings, () => {
    hasChanges.value = true;
  }, { deep: true });
  
  watch(integrations, () => {
    hasChanges.value = true;
  }, { deep: true });
  
  // Save all changes
  const saveChanges = async () => {
    saving.value = true;
    
    try {
      // Update project in store
      await projectStore.updateProject(currentProject.value.id, {
        name: projectData.value.name,
        description: projectData.value.description,
        color: projectData.value.color,
        team: projectData.value.team,
        startDate: projectData.value.startDate,
        endDate: projectData.value.endDate
      });
      
      // In a real app, we'd also save the other settings
      // For this demo, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reset changes flag
      hasChanges.value = false;
      
      // Show success message (would use a toast in a real app)
      alert('Project settings saved successfully');
    } catch (error) {
      console.error('Error saving project settings:', error);
      alert('Error saving project settings');
    } finally {
      saving.value = false;
    }
  };
  
  // Team Members functions
  const addMember = () => {
    if (!selectedMember.value) return;
    
    // Add member to the list
    teamMembers.value.push(selectedMember.value);
    selectedMember.value = null;
    showAddMemberDialog.value = false;
    hasChanges.value = true;
  };
  
  const removeMember = (member) => {
    // Show confirmation dialog
    confirmDialogTitle.value = 'Remove Member';
    confirmDialogMessage.value = `Are you sure you want to remove ${member.name} from this project?`;
    confirmDialogAction.value = 'Remove';
    confirmDialogColor.value = 'error';
    confirmAction.value = () => {
      // Remove member from the list
      teamMembers.value = teamMembers.value.filter(m => m.id !== member.id);
      hasChanges.value = true;
    };
    showConfirmDialog.value = true;
  };
  
  // Workflow Column functions
  const showAddColumnDialog = () => {
    columnData.value = {
      id: '',
      title: '',
      limit: 0,
      order: workflowColumns.value.length
    };
    editingColumn.value = false;
    showColumnDialog.value = true;
  };
  
  const editColumn = (column) => {
    columnData.value = { ...column };
    editingColumn.value = true;
    showColumnDialog.value = true;
  };
  
  const saveColumn = () => {
    if (!isColumnFormValid.value) return;
    
    if (editingColumn.value) {
      // Update existing column
      const index = workflowColumns.value.findIndex(c => c.id === columnData.value.id);
      if (index !== -1) {
        workflowColumns.value[index] = { ...columnData.value };
      }
    } else {
      // Add new column
      // Generate a unique ID (would use API in real app)
      const newId = `column-${Date.now()}`;
      workflowColumns.value.push({
        ...columnData.value,
        id: newId
      });
    }
    
    // Update columns order
    workflowColumnsOrder.value = [...workflowColumns.value].sort((a, b) => a.order - b.order);
    
    showColumnDialog.value = false;
    hasChanges.value = true;
  };
  
  const confirmDeleteColumn = (column) => {
    // Default columns cannot be deleted
    if (isDefaultColumn(column.id)) return;
    
    // Show confirmation dialog
    confirmDialogTitle.value = 'Delete Column';
    confirmDialogMessage.value = `Are you sure you want to delete the "${column.title}" column? Tasks in this column will need to be moved.`;
    confirmDialogAction.value = 'Delete';
    confirmDialogColor.value = 'error';
    confirmAction.value = () => {
      // Remove column from the list
      workflowColumns.value = workflowColumns.value.filter(c => c.id !== column.id);
      workflowColumnsOrder.value = workflowColumnsOrder.value.filter(c => c.id !== column.id);
      hasChanges.value = true;
    };
    showConfirmDialog.value = true;
  };
  
  const saveColumnOrder = () => {
    // Update order property for each column
    workflowColumnsOrder.value.forEach((column, index) => {
      column.order = index;
      
      // Update in main columns array
      const mainIndex = workflowColumns.value.findIndex(c => c.id === column.id);
      if (mainIndex !== -1) {
        workflowColumns.value[mainIndex].order = index;
      }
    });
    
    showReorderColumnsDialog.value = false;
    hasChanges.value = true;
  };
  
  const isDefaultColumn = (columnId) => {
    // Default columns that cannot be deleted
    return columnId === 'todo' || columnId === 'done';
  };
  
  // Tag functions
  const showAddTagDialog = () => {
    tagData.value = {
      id: '',
      name: '',
      color: tagColorOptions[0].color,
      borderColor: tagColorOptions[0].borderColor
    };
    editingTag.value = false;
    showTagDialog.value = true;
  };
  
  const editTag = (tag) => {
    tagData.value = { ...tag };
    editingTag.value = true;
    showTagDialog.value = true;
  };
  
  const selectTagColor = (color) => {
    tagData.value.color = color.color;
    tagData.value.borderColor = color.borderColor;
  };
  
  const saveTag = () => {
    if (!isTagFormValid.value) return;
    
    if (editingTag.value) {
      // Update existing tag
      const index = projectTags.value.findIndex(t => t.id === tagData.value.id);
      if (index !== -1) {
        projectTags.value[index] = { ...tagData.value };
      }
    } else {
      // Add new tag
      // Generate a unique ID (would use API in real app)
      const newId = `tag-${Date.now()}`;
      projectTags.value.push({
        ...tagData.value,
        id: newId
      });
    }
    
    showTagDialog.value = false;
    hasChanges.value = true;
  };
  
  const confirmDeleteTag = (tag) => {
    // Show confirmation dialog
    confirmDialogTitle.value = 'Delete Tag';
    confirmDialogMessage.value = `Are you sure you want to delete the "${tag.name}" tag? It will be removed from all tasks using it.`;
    confirmDialogAction.value = 'Delete';
    confirmDialogColor.value = 'error';
    confirmAction.value = () => {
      // Remove tag from the list
      projectTags.value = projectTags.value.filter(t => t.id !== tag.id);
      hasChanges.value = true;
    };
    showConfirmDialog.value = true;
  };
  
  // Danger zone functions
  const confirmArchiveProject = () => {
    confirmDialogTitle.value = 'Archive Project';
    confirmDialogMessage.value = `Are you sure you want to archive "${currentProject.value.name}"? It will be moved to the archive and hidden from active projects.`;
    confirmDialogAction.value = 'Archive';
    confirmDialogColor.value = 'warning';
    confirmAction.value = () => {
      // In a real app, we would call an API to archive the project
      alert('Project archived successfully');
      router.push('/');
    };
    showConfirmDialog.value = true;
  };
  
  const confirmDeleteProject = () => {
    confirmDialogTitle.value = 'Delete Project';
    confirmDialogMessage.value = `Are you sure you want to permanently delete "${currentProject.value.name}"? This action cannot be undone and all project data will be lost.`;
    confirmDialogAction.value = 'Delete';
    confirmDialogColor.value = 'error';
    confirmAction.value = async () => {
      try {
        await projectStore.deleteProject(currentProject.value.id);
        router.push('/');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      }
    };
    showConfirmDialog.value = true;
  };
  
  // Execute the confirmed action
  const executeConfirmAction = () => {
    if (confirmAction.value) {
      confirmAction.value();
    }
    showConfirmDialog.value = false;
  };
  
  // Initialize on mount
  onMounted(() => {
    initializeProjectData();
  });
  
  // Watch for project changes
  watch(() => projectStore.currentProject, () => {
    initializeProjectData();
  });
  </script>
  
  <style scoped>
  .project-settings {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .settings-header {
    background-color: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .settings-content {
    flex: 1;
    overflow-y: auto;
  }
  
  .border {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  
  .cursor-move {
    cursor: move;
  }
  
  .tags-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .tag-card {
    border-radius: 4px;
    border: 1px solid;
    min-height: 40px;
  }
  
  .tag-name {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.87);
  }
  
  .tag-color-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }
  
  .gap-2 {
    gap: 8px;
  }
  
  .gap-3 {
    gap: 12px;
  }
  </style>