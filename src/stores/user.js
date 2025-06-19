import { defineStore } from 'pinia'
import mockData from '../mock/data.json'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    teams: [],
    currentUser: null, // For simulation, we'll set a default user
    loadingUsers: false,
    loadingTeams: false,
    error: null,
  }),
  
  getters: {
    // Get all users
    allUsers: (state) => state.users,
    
    // Get all teams
    allTeams: (state) => state.teams,
    
    // Get user by ID
    getUserById: (state) => (id) => 
      state.users.find(user => user.id === id),
    
    // Get team by ID
    getTeamById: (state) => (id) => 
      state.teams.find(team => team.id === id),
    
    // Get team members
    getTeamMembers: (state) => (teamId) => {
      const team = state.teams.find(team => team.id === teamId)
      if (!team) return []
      
      return team.members.map(userId => 
        state.users.find(user => user.id === userId)
      ).filter(Boolean)
    },
    
    // Get current user (logged in)
    getCurrentUser: (state) => {
      if (!state.currentUser) return null
      return state.users.find(user => user.id === state.currentUser)
    },
    
    // Get teams for current user
    getCurrentUserTeams: (state) => {
      if (!state.currentUser) return []
      
      return state.teams.filter(team => 
        team.members.includes(state.currentUser)
      )
    },
  },
  
  actions: {
    // Fetch all users (simulating API call)
    async fetchUsers() {
      this.loadingUsers = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/users')
        // this.users = response.data
        
        // Using mock data for now
        this.users = mockData.users
        
        // Set a default current user for simulation
        if (!this.currentUser && this.users.length > 0) {
          this.currentUser = this.users[0].id
        }
        
        this.loadingUsers = false
      } catch (error) {
        console.error('Error fetching users:', error)
        this.error = error.message || 'Failed to fetch users'
        this.loadingUsers = false
      }
    },
    
    // Fetch all teams (simulating API call)
    async fetchTeams() {
      this.loadingTeams = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/teams')
        // this.teams = response.data
        
        // Using mock data for now
        this.teams = mockData.teams
        
        this.loadingTeams = false
      } catch (error) {
        console.error('Error fetching teams:', error)
        this.error = error.message || 'Failed to fetch teams'
        this.loadingTeams = false
      }
    },
    
    // Set current user (for simulation)
    setCurrentUser(userId) {
      this.currentUser = userId
    },
    
    // Create a new team
    async createTeam(teamData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/teams', teamData)
        // const newTeam = response.data
        
        // Generate a new ID for mock data
        const newId = `t${this.teams.length + 1}`
        
        // Create new team object
        const newTeam = {
          id: newId,
          ...teamData
        }
        
        // Add to teams array
        this.teams.push(newTeam)
        
        return newTeam
      } catch (error) {
        console.error('Error creating team:', error)
        this.error = error.message || 'Failed to create team'
        throw error
      }
    },
    
    // Update a team
    async updateTeam(teamId, teamData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/teams/${teamId}`, teamData)
        // const updatedTeam = response.data
        
        // Update team in state
        const index = this.teams.findIndex(t => t.id === teamId)
        if (index !== -1) {
          this.teams[index] = {
            ...this.teams[index],
            ...teamData
          }
          
          return this.teams[index]
        }
        
        throw new Error('Team not found')
      } catch (error) {
        console.error('Error updating team:', error)
        this.error = error.message || 'Failed to update team'
        throw error
      }
    },
    
    // Add user to team
    async addUserToTeam(teamId, userId) {
      try {
        // In a real application, this would be an API call
        // await axios.post(`/api/teams/${teamId}/members`, { userId })
        
        // Update team in state
        const teamIndex = this.teams.findIndex(t => t.id === teamId)
        if (teamIndex === -1) {
          throw new Error('Team not found')
        }
        
        if (!this.teams[teamIndex].members.includes(userId)) {
          this.teams[teamIndex].members.push(userId)
        }
      } catch (error) {
        console.error('Error adding user to team:', error)
        this.error = error.message || 'Failed to add user to team'
        throw error
      }
    },
    
    // Remove user from team
    async removeUserFromTeam(teamId, userId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/teams/${teamId}/members/${userId}`)
        
        // Update team in state
        const teamIndex = this.teams.findIndex(t => t.id === teamId)
        if (teamIndex === -1) {
          throw new Error('Team not found')
        }
        
        const memberIndex = this.teams[teamIndex].members.indexOf(userId)
        if (memberIndex !== -1) {
          this.teams[teamIndex].members.splice(memberIndex, 1)
        }
      } catch (error) {
        console.error('Error removing user from team:', error)
        this.error = error.message || 'Failed to remove user from team'
        throw error
      }
    }
  }
})