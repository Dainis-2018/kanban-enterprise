<template>
  <v-app-bar
    color="surface"
    height="60"
    elevation="1"
    class="top-bar"
  >
    <!-- App Logo -->
    <div class="app-logo">
      <AppLogo />
    </div>

    <!-- Global Search -->
    <v-text-field
      v-model="searchQuery"
      placeholder="Search projects, tasks, people..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      class="global-search mx-auto"
    />

    <!-- Quick Create Button -->
    <v-btn
      color="primary"
      icon
      class="ml-4"
      @click="showQuickCreateMenu = !showQuickCreateMenu"
    >
      <v-icon>mdi-plus</v-icon>
      <v-menu
        v-model="showQuickCreateMenu"
        :close-on-content-click="false"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props"></div>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in quickCreateItems"
            :key="index"
            :value="index"
            @click="handleQuickCreateAction(item.action)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>

    <!-- User Controls -->
    <v-btn icon class="ml-2" @click="showSettingsMenu = !showSettingsMenu">
      <v-icon>mdi-cog</v-icon>
      <v-menu
        v-model="showSettingsMenu"
        :close-on-content-click="false"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props"></div>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in settingsItems"
            :key="index"
            :value="index"
            @click="handleSettingsAction(item.action)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>

    <v-btn icon class="ml-2" @click="showNotificationsMenu = !showNotificationsMenu">
      <v-badge
        :content="notificationCount"
        :model-value="notificationCount > 0"
        color="error"
      >
        <v-icon>mdi-bell</v-icon>
      </v-badge>
      <v-menu
        v-model="showNotificationsMenu"
        :close-on-content-click="false"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props"></div>
        </template>
        <v-card min-width="300" max-width="400">
          <v-card-title>Notifications</v-card-title>
          <v-card-text>
            <div v-if="notifications.length === 0" class="text-center py-4">
              No new notifications
            </div>
            <v-list v-else>
              <v-list-item
                v-for="(notification, index) in notifications"
                :key="index"
                :value="index"
              >
                <v-list-item-title>{{ notification.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-btn>

    <v-btn icon class="ml-2" @click="showUserMenu = !showUserMenu">
      <UserAvatar
        :user="currentUser"
        size="40"
      />
      <v-menu
        v-model="showUserMenu"
        :close-on-content-click="false"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props"></div>
        </template>
        <v-card min-width="200">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <UserAvatar
                :user="currentUser"
                size="40"
              />
              <div class="ml-3">
                <div class="text-subtitle-1 font-weight-medium">{{ currentUser?.name }}</div>
                <div class="text-caption">{{ currentUser?.email }}</div>
              </div>
            </div>
            <v-divider class="mb-3"></v-divider>
            <v-list density="compact">
              <v-list-item
                v-for="(item, index) in userMenuItems"
                :key="index"
                :value="index"
                @click="handleUserMenuAction(item.action)"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import AppLogo from '../common/AppLogo.vue';
import UserAvatar from '../common/UserAvatar.vue';

// Stores
const userStore = useUserStore();

// Search
const searchQuery = ref('');

// User
const currentUser = computed(() => userStore.getCurrentUser);

// Quick Create Menu
const showQuickCreateMenu = ref(false);
const quickCreateItems = [
  { title: 'New Project', action: 'create-project' },
  { title: 'New Task', action: 'create-task' },
  { title: 'New Team', action: 'create-team' },
];

// Settings Menu
const showSettingsMenu = ref(false);
const settingsItems = [
  { title: 'General Settings', action: 'general-settings' },
  { title: 'Account Settings', action: 'account-settings' },
  { title: 'Appearance', action: 'appearance-settings' },
];

// Notifications
const showNotificationsMenu = ref(false);
const notificationCount = ref(2); // For demo purposes
const notifications = ref([
  { 
    title: 'Task assigned to you', 
    message: 'Mike P. assigned "User Authentication" task to you',
    time: '2 hours ago',
  },
  { 
    title: 'Comment on your task', 
    message: 'Sarah L. commented on "Admin Dashboard" task',
    time: '4 hours ago',
  },
]);

// User Menu
const showUserMenu = ref(false);
const userMenuItems = [
  { title: 'Profile', action: 'view-profile', icon: 'mdi-account' },
  { title: 'My Tasks', action: 'my-tasks', icon: 'mdi-check-circle' },
  { title: 'Settings', action: 'user-settings', icon: 'mdi-cog' },
  { title: 'Help & Support', action: 'help', icon: 'mdi-help-circle' },
  { title: 'Log Out', action: 'logout', icon: 'mdi-logout' },
];

// Event Handlers
const handleQuickCreateAction = (action) => {
  console.log(`Quick create action: ${action}`);
  showQuickCreateMenu.value = false;
  // Implement actions - e.g., emit events or use router navigation
};

const handleSettingsAction = (action) => {
  console.log(`Settings action: ${action}`);
  showSettingsMenu.value = false;
  // Implement actions
};

const handleUserMenuAction = (action) => {
  console.log(`User menu action: ${action}`);
  showUserMenu.value = false;
  // Implement actions
};
</script>

<style>
/* Global style overrides for topbar */
.v-app-bar.v-app-bar {
  position: relative !important;
  z-index: 900 !important;
}
</style>

<style scoped>
.top-bar {
  position: relative !important;
  z-index: 900 !important;
}

.app-logo {
  width: 200px;
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.global-search {
  max-width: 340px;
}
</style>