<template>
    <div
      class="kanban-card"
      :data-id="task.id"
      @click.stop="showDetails = true"
    >
      <!-- Card Header -->
      <div class="card-header">
        <div class="d-flex align-center">
          <!-- Priority Badge -->
          <div
            class="priority-badge me-2"
            :class="'priority-' + task.priority.toLowerCase()"
            :title="getPriorityText(task.priority)"
          >
            {{ task.priority }}
          </div>
          
          <!-- Task Type -->
          <div class="task-type text-caption">{{ task.type }}</div>
        </div>
        
        <!-- Card Menu -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="text"
              size="x-small"
              v-bind="props"
              @click.stop
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click.stop="$emit('edit', task)">
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click.stop="$emit('delete', task)" color="error">
              <template v-slot:prepend>
                <v-icon>mdi-delete</v-icon>
              </template>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      
      <!-- Card Content -->
      <div class="card-content">
        <h3 class="task-title">{{ task.title }}</h3>
        
        <!-- Task Description (truncated) -->
        <p v-if="task.description" class="task-description">
          {{ truncateText(task.description, 100) }}
        </p>
      </div>
      
      <!-- Card Footer -->
      <div class="card-footer">
        <!-- Tags -->
        <div class="tags-container" v-if="task.tags && task.tags.length">
          <TagBadge
            v-for="tagId in task.tags.slice(0, 2)"
            :key="tagId"
            :tagId="tagId"
          />
          <span
            v-if="task.tags.length > 2"
            class="more-tags"
          >
            +{{ task.tags.length - 2 }}
          </span>
        </div>
        
        <!-- Assignees -->
        <div class="assignees-container">
          <v-avatar
            v-for="(userId, index) in task.assignees.slice(0, 3)"
            :key="userId"
            :size="26"
            :style="{ marginLeft: index > 0 ? '-8px' : '0' }"
          >
            <UserAvatar :user="getUserById(userId)" size="26" />
          </v-avatar>
          <span
            v-if="task.assignees.length > 3"
            class="more-assignees"
          >
            +{{ task.assignees.length - 3 }}
          </span>
        </div>
      </div>
      
      <!-- Task Detail Dialog -->
      <v-dialog v-model="showDetails" max-width="600">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <div
                class="priority-badge me-2"
                :class="'priority-' + task.priority.toLowerCase()"
              >
                {{ task.priority }}
              </div>
              <span>{{ task.title }}</span>
            </div>
            <v-btn
              icon
              variant="text"
              @click="showDetails = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <!-- Task Info -->
            <div class="d-flex mb-4">
              <div class="me-4">
                <div class="text-caption text-grey">Status</div>
                <div>{{ getColumnTitle(task.status) }}</div>
              </div>
              <div class="me-4">
                <div class="text-caption text-grey">Type</div>
                <div>{{ task.type }}</div>
              </div>
              <div v-if="task.dueDate">
                <div class="text-caption text-grey">Due Date</div>
                <div>{{ formatDate(task.dueDate) }}</div>
              </div>
            </div>
            
            <!-- Description -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-1">Description</div>
              <div class="task-full-description">
                {{ task.description || 'No description provided.' }}
              </div>
            </div>
            
            <!-- Assignees -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-1">Assignees</div>
              <div class="d-flex flex-wrap">
                <v-chip
                  v-for="userId in task.assignees"
                  :key="userId"
                  size="small"
                  class="me-2 mb-2"
                >
                  <template v-slot:prepend>
                    <UserAvatar :user="getUserById(userId)" size="20" />
                  </template>
                  {{ getUserById(userId)?.name }}
                </v-chip>
                <v-chip
                  v-if="task.assignees.length === 0"
                  size="small"
                  variant="outlined"
                >
                  No assignees
                </v-chip>
              </div>
            </div>
            
            <!-- Tags -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-1">Tags</div>
              <div class="d-flex flex-wrap">
                <TagBadge
                  v-for="tagId in task.tags"
                  :key="tagId"
                  :tagId="tagId"
                />
                <v-chip
                  v-if="task.tags.length === 0"
                  size="small"
                  variant="outlined"
                >
                  No tags
                </v-chip>
              </div>
            </div>
            
            <!-- Comments -->
            <div>
              <div class="text-subtitle-2 mb-1">Comments</div>
              <div v-if="task.comments && task.comments.length">
                <div
                  v-for="comment in task.comments"
                  :key="comment.id"
                  class="comment-item py-2"
                >
                  <div class="d-flex">
                    <UserAvatar :user="getUserById(comment.userId)" size="32" class="me-2" />
                    <div>
                      <div class="comment-header">
                        <span class="font-weight-medium">{{ getUserById(comment.userId)?.name }}</span>
                        <span class="text-caption text-grey ms-2">{{ formatDate(comment.createdAt) }}</span>
                      </div>
                      <div class="comment-text">
                        {{ comment.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey py-4">
                No comments yet
              </div>
              
              <!-- Add Comment -->
              <div class="mt-2">
                <v-textarea
                  v-model="newComment"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  :placeholder="$t('tasks.add_comment')"
                  hide-details
                  class="mb-2"
                ></v-textarea>
                <div class="d-flex justify-end">
                  <v-btn
                    color="primary"
                    :disabled="!newComment.trim()"
                    @click="addComment"
                  >
                    {{ $t('tasks.post_comment') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import {
    defineProps,
    defineEmits,
    ref,
    computed
  } from 'vue';
  import { format } from 'date-fns';
  import { useUserStore } from '../../stores/user';
  import { useTaskStore } from '../../stores/task';
  import UserAvatar from '../common/UserAvatar.vue';
  import TagBadge from '../common/TagBadge.vue';
  
  const props = defineProps({
    task: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['edit', 'delete']);
  
  // Stores
  const userStore = useUserStore();
  const taskStore = useTaskStore();
  
  // Task details dialog
  const showDetails = ref(false);
  const newComment = ref('');
  
  // Helper function to truncate long text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Get user by ID
  const getUserById = (userId) => {
    return userStore.getUserById(userId);
  };
  
  // Get column title by ID
  const getColumnTitle = (columnId) => {
    const column = taskStore.getColumns.find(col => col.id === columnId);
    return column ? column.title : columnId;
  };
  
  // Get priority text
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'P1': return 'High Priority';
      case 'P2': return 'Medium Priority';
      case 'P3': return 'Low Priority';
      default: return 'Priority';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Add a comment
  const addComment = async () => {
    if (!newComment.value.trim()) return;
    
    try {
      await taskStore.addComment(props.task.id, {
        userId: userStore.currentUser,
        text: newComment.value.trim()
      });
      
      newComment.value = '';
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  </script>
  
  <style scoped>
  .kanban-card {
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    padding: 12px;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  
  .kanban-card:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .priority-badge {
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: bold;
    color: white;
  }
  
  .priority-p1 {
    background-color: #db4437; /* Red */
  }
  
  .priority-p2 {
    background-color: #f4b400; /* Yellow */
  }
  
  .priority-p3 {
    background-color: #0f9d58; /* Green */
  }
  
  .task-type {
    color: rgba(0, 0, 0, 0.6);
  }
  
  .card-content {
    margin-bottom: 10px;
  }
  
  .task-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 6px;
    line-height: 1.3;
  }
  
  .task-description {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    margin: 0;
    line-height: 1.4;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .more-tags {
    font-size: 10px;
    color: rgba(0, 0, 0, 0.6);
    background-color: #e0e0e0;
    padding: 2px 5px;
    border-radius: 10px;
  }
  
  .assignees-container {
    display: flex;
    align-items: center;
  }
  
  .more-assignees {
    font-size: 10px;
    background-color: #e0e0e0;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -8px;
  }
  
  .task-full-description {
    white-space: pre-wrap;
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .comment-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .comment-item:last-child {
    border-bottom: none;
  }
  
  .comment-header {
    margin-bottom: 2px;
  }
  
  .comment-text {
    font-size: 14px;
  }
  </style>