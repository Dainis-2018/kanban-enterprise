import { defineStore } from 'pinia'
import mockData from '../mock/data.json'

export const useSprintStore = defineStore('sprint', {
  state: () => ({
    sprints: [],
    loadingSprints: false,
    error: null
  }),
  
  getters: {
    // Get all sprints
    allSprints: (state) => state.sprints,
    
    // Get sprints by project ID
    sprintsByProject: (state) => (projectId) => 
      state.sprints.filter(sprint => sprint.projectId === projectId),
    
    // Get sprint by ID
    getSprintById: (state) => (id) => 
      state.sprints.find(sprint => sprint.id === id),
    
    // Get active sprint for a project
    getActiveSprintByProject: (state) => (projectId) => {
      const now = new Date()
      return state.sprints.find(sprint => 
        sprint.projectId === projectId && 
        new Date(sprint.startDate) <= now && 
        new Date(sprint.endDate) >= now
      )
    },
    
    // Get upcoming sprints for a project
    getUpcomingSprintsByProject: (state) => (projectId) => {
      const now = new Date()
      return state.sprints.filter(sprint => 
        sprint.projectId === projectId && 
        new Date(sprint.startDate) > now
      ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    },
    
    // Get completed sprints for a project
    getCompletedSprintsByProject: (state) => (projectId) => {
      const now = new Date()
      return state.sprints.filter(sprint => 
        sprint.projectId === projectId && 
        new Date(sprint.endDate) < now
      ).sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
    }
  },
  
  actions: {
    // Fetch all sprints for a project
    async fetchSprints(projectId) {
      this.loadingSprints = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get(`/api/projects/${projectId}/sprints`)
        // this.sprints = response.data
        
        // Using mock data for now
        if (mockData.sprints) {
          this.sprints = mockData.sprints.filter(sprint => sprint.projectId === projectId)
        } else {
          // Sample sprints if mock data doesn't have sprints
          const today = new Date()
          const startDate = new Date(today)
          startDate.setDate(startDate.getDate() - 15) // Start 15 days ago
          
          const sprints = []
          
          // Create 4 sprints, 2 weeks each
          for (let i = 0; i < 4; i++) {
            const sprintStartDate = new Date(startDate)
            sprintStartDate.setDate(sprintStartDate.getDate() + (i * 14))
            
            const sprintEndDate = new Date(sprintStartDate)
            sprintEndDate.setDate(sprintEndDate.getDate() + 13)
            
            let milestone = null
            if (i === 0) milestone = 'MVP'
            else if (i === 2) milestone = 'Beta Release'
            else if (i === 3) milestone = 'v1.0'
            
            sprints.push({
              id: `s${i + 1}`,
              projectId,
              name: `Sprint ${i + 1}`,
              startDate: sprintStartDate.toISOString().split('T')[0],
              endDate: sprintEndDate.toISOString().split('T')[0],
              goal: `Complete sprint ${i + 1} objectives`,
              status: i === 0 ? 'completed' : i === 1 ? 'active' : 'planned',
              milestone
            })
          }
          
          this.sprints = sprints
        }
        
        this.loadingSprints = false
      } catch (error) {
        console.error('Error fetching sprints:', error)
        this.error = error.message || 'Failed to fetch sprints'
        this.loadingSprints = false
      }
    },
    
    // Create a new sprint
    async createSprint(sprintData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/sprints', sprintData)
        // const newSprint = response.data
        
        // Generate a new ID for mock data
        const newId = `s${this.sprints.length + 1}`
        
        // Create new sprint object
        const newSprint = {
          id: newId,
          ...sprintData,
          status: 'planned'
        }
        
        // Add to sprints array
        this.sprints.push(newSprint)
        
        return newSprint
      } catch (error) {
        console.error('Error creating sprint:', error)
        this.error = error.message || 'Failed to create sprint'
        throw error
      }
    },
    
    // Update a sprint
    async updateSprint(sprintId, sprintData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/sprints/${sprintId}`, sprintData)
        // const updatedSprint = response.data
        
        // Update sprint in state
        const index = this.sprints.findIndex(s => s.id === sprintId)
        if (index !== -1) {
          this.sprints[index] = {
            ...this.sprints[index],
            ...sprintData
          }
          
          return this.sprints[index]
        }
        
        throw new Error('Sprint not found')
      } catch (error) {
        console.error('Error updating sprint:', error)
        this.error = error.message || 'Failed to update sprint'
        throw error
      }
    },
    
    // Delete a sprint
    async deleteSprint(sprintId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/sprints/${sprintId}`)
        
        // Remove from sprints array
        const index = this.sprints.findIndex(s => s.id === sprintId)
        if (index !== -1) {
          this.sprints.splice(index, 1)
        }
      } catch (error) {
        console.error('Error deleting sprint:', error)
        this.error = error.message || 'Failed to delete sprint'
        throw error
      }
    },
    
    // Configure multiple sprints at once
    async configureSprints(projectId, sprintConfig) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post(`/api/projects/${projectId}/configure-sprints`, sprintConfig)
        // this.sprints = response.data
        
        // Clear existing sprints for this project
        this.sprints = this.sprints.filter(sprint => sprint.projectId !== projectId)
        
        // Add new sprints
        if (Array.isArray(sprintConfig.sprints)) {
          const newSprints = sprintConfig.sprints.map((sprint, index) => ({
            id: `s${this.sprints.length + index + 1}`,
            projectId,
            name: sprint.name || `Sprint ${index + 1}`,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            goal: sprint.goal || `Complete sprint ${index + 1} objectives`,
            status: 'planned',
            milestone: sprint.milestone || null
          }))
          
          this.sprints.push(...newSprints)
        }
        
        return this.sprints.filter(sprint => sprint.projectId === projectId)
      } catch (error) {
        console.error('Error configuring sprints:', error)
        this.error = error.message || 'Failed to configure sprints'
        throw error
      }
    },
    
    // Start a sprint
    async startSprint(sprintId) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post(`/api/sprints/${sprintId}/start`)
        // const updatedSprint = response.data
        
        // Update sprint in state
        const index = this.sprints.findIndex(s => s.id === sprintId)
        if (index !== -1) {
          this.sprints[index].status = 'active'
          this.sprints[index].startedAt = new Date().toISOString()
          
          return this.sprints[index]
        }
        
        throw new Error('Sprint not found')
      } catch (error) {
        console.error('Error starting sprint:', error)
        this.error = error.message || 'Failed to start sprint'
        throw error
      }
    },
    
    // Complete a sprint
    async completeSprint(sprintId) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post(`/api/sprints/${sprintId}/complete`)
        // const updatedSprint = response.data
        
        // Update sprint in state
        const index = this.sprints.findIndex(s => s.id === sprintId)
        if (index !== -1) {
          this.sprints[index].status = 'completed'
          this.sprints[index].completedAt = new Date().toISOString()
          
          return this.sprints[index]
        }
        
        throw new Error('Sprint not found')
      } catch (error) {
        console.error('Error completing sprint:', error)
        this.error = error.message || 'Failed to complete sprint'
        throw error
      }
    }
  }
})