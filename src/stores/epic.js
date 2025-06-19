import { defineStore } from 'pinia'
import mockData from '../mock/data.json'

export const useEpicStore = defineStore('epic', {
  state: () => ({
    epics: [],
    epicItems: [], // Features/components within epics
    loadingEpics: false,
    error: null
  }),
  
  getters: {
    // Get all epics
    allEpics: (state) => state.epics,
    
    // Get epics by project ID
    epicsByProject: (state) => (projectId) => 
      state.epics.filter(epic => epic.projectId === projectId),
    
    // Get epic by ID
    getEpicById: (state) => (id) => 
      state.epics.find(epic => epic.id === id),
    
    // Get epic items by epic ID
    getEpicItemsByEpic: (state) => (epicId) => 
      state.epicItems.filter(item => item.epicId === epicId),
    
    // Get epic items by sprint (for roadmap view)
    getEpicItemsBySprint: (state) => (epicId, sprintId) => 
      state.epicItems.filter(item => 
        item.epicId === epicId && item.sprintId === sprintId
      )
  },
  
  actions: {
    // Fetch all epics for a project
    async fetchEpics(projectId) {
      this.loadingEpics = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get(`/api/projects/${projectId}/epics`)
        // this.epics = response.data
        
        // Using mock data for now
        if (mockData.epics) {
          this.epics = mockData.epics.filter(epic => epic.projectId === projectId)
        } else {
          // Sample epics if mock data doesn't have epics
          this.epics = [
            { 
              id: 'e1', 
              projectId, 
              name: 'User Authentication', 
              description: 'All features related to user authentication and authorization',
              startDate: '2025-01-01',
              endDate: '2025-01-31',
              progress: 30
            },
            { 
              id: 'e2', 
              projectId, 
              name: 'Payment Processing', 
              description: 'Payment gateway integration and billing features',
              startDate: '2025-02-01',
              endDate: '2025-02-28',
              progress: 10
            },
            { 
              id: 'e3', 
              projectId, 
              name: 'Data Management', 
              description: 'Data schema design and migration tools',
              startDate: '2025-01-15',
              endDate: '2025-03-15',
              progress: 45
            },
            { 
              id: 'e4', 
              projectId, 
              name: 'UI/UX', 
              description: 'Dashboard and user settings interfaces',
              startDate: '2025-02-15',
              endDate: '2025-04-15',
              progress: 20
            }
          ]
        }
        
        await this.fetchEpicItems(projectId)
        this.loadingEpics = false
      } catch (error) {
        console.error('Error fetching epics:', error)
        this.error = error.message || 'Failed to fetch epics'
        this.loadingEpics = false
      }
    },
    
    // Fetch epic items (features/components)
    async fetchEpicItems(projectId) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.get(`/api/projects/${projectId}/epic-items`)
        // this.epicItems = response.data
        
        // Using mock data or generating sample data
        if (mockData.epicItems) {
          this.epicItems = mockData.epicItems.filter(item => {
            const epic = this.epics.find(e => e.id === item.epicId)
            return epic && epic.projectId === projectId
          })
        } else {
          // Sample epic items if mock data doesn't have them
          this.epicItems = [
            {
              id: 'ei1',
              epicId: 'e1',
              title: 'Backend Authentication',
              description: 'API endpoints for authentication',
              sprintId: 's1',
              sprintSpan: 1,
              status: 'done',
              tasks: ['t1', 't2', 't3', 't4', 't5']
            },
            {
              id: 'ei2',
              epicId: 'e1',
              title: 'Frontend Authentication',
              description: 'UI components for login/registration',
              sprintId: 's2',
              sprintSpan: 2,
              status: 'inprogress',
              tasks: ['t6', 't7', 't8', 't9', 't10', 't11', 't12', 't13']
            },
            {
              id: 'ei3',
              epicId: 'e2',
              title: 'Payment Integration',
              description: 'Third-party payment gateway integration',
              sprintId: 's3',
              status: 'review',
              tasks: ['t14', 't15', 't16', 't17', 't18', 't19']
            },
            {
              id: 'ei4',
              epicId: 'e3',
              title: 'Schema Design',
              description: 'Database schema design and documentation',
              sprintId: 's1',
              status: 'done',
              tasks: ['t20', 't21', 't22']
            },
            {
              id: 'ei5',
              epicId: 'e3',
              title: 'Migration Tools',
              description: 'Tools for migrating from legacy systems',
              sprintId: 's2',
              status: 'inprogress',
              tasks: ['t23', 't24', 't25', 't26', 't27', 't28', 't29']
            },
            {
              id: 'ei6',
              epicId: 'e4',
              title: 'Dashboard and Analytics',
              description: 'User dashboard and analytics views',
              sprintId: 's2',
              sprintSpan: 3,
              status: 'inprogress',
              tasks: ['t30', 't31', 't32', 't33', 't34', 't35', 't36', 't37', 't38', 't39', 't40', 't41']
            },
            {
              id: 'ei7',
              epicId: 'e4',
              title: 'User Settings',
              description: 'User profile and settings pages',
              sprintId: 's4',
              status: 'todo',
              tasks: ['t42', 't43', 't44', 't45']
            }
          ]
        }
      } catch (error) {
        console.error('Error fetching epic items:', error)
        this.error = error.message || 'Failed to fetch epic items'
      }
    },
    
    // Create a new epic
    async createEpic(epicData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/epics', epicData)
        // const newEpic = response.data
        
        // Generate a new ID for mock data
        const newId = `e${this.epics.length + 1}`
        
        // Create new epic object
        const newEpic = {
          id: newId,
          ...epicData,
          progress: 0
        }
        
        // Add to epics array
        this.epics.push(newEpic)
        
        return newEpic
      } catch (error) {
        console.error('Error creating epic:', error)
        this.error = error.message || 'Failed to create epic'
        throw error
      }
    },
    
    // Update an epic
    async updateEpic(epicId, epicData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/epics/${epicId}`, epicData)
        // const updatedEpic = response.data
        
        // Update epic in state
        const index = this.epics.findIndex(e => e.id === epicId)
        if (index !== -1) {
          this.epics[index] = {
            ...this.epics[index],
            ...epicData
          }
          
          return this.epics[index]
        }
        
        throw new Error('Epic not found')
      } catch (error) {
        console.error('Error updating epic:', error)
        this.error = error.message || 'Failed to update epic'
        throw error
      }
    },
    
    // Delete an epic
    async deleteEpic(epicId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/epics/${epicId}`)
        
        // Remove from epics array
        const index = this.epics.findIndex(e => e.id === epicId)
        if (index !== -1) {
          this.epics.splice(index, 1)
        }
        
        // Remove associated epic items
        this.epicItems = this.epicItems.filter(item => item.epicId !== epicId)
      } catch (error) {
        console.error('Error deleting epic:', error)
        this.error = error.message || 'Failed to delete epic'
        throw error
      }
    },
    
    // Create a new epic item
    async createEpicItem(itemData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/epic-items', itemData)
        // const newItem = response.data
        
        // Generate a new ID for mock data
        const newId = `ei${this.epicItems.length + 1}`
        
        // Create new epic item object
        const newItem = {
          id: newId,
          ...itemData,
          tasks: []
        }
        
        // Add to epic items array
        this.epicItems.push(newItem)
        
        return newItem
      } catch (error) {
        console.error('Error creating epic item:', error)
        this.error = error.message || 'Failed to create epic item'
        throw error
      }
    },
    
    // Update an epic item
    async updateEpicItem(itemId, itemData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/epic-items/${itemId}`, itemData)
        // const updatedItem = response.data
        
        // Update epic item in state
        const index = this.epicItems.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.epicItems[index] = {
            ...this.epicItems[index],
            ...itemData
          }
          
          return this.epicItems[index]
        }
        
        throw new Error('Epic item not found')
      } catch (error) {
        console.error('Error updating epic item:', error)
        this.error = error.message || 'Failed to update epic item'
        throw error
      }
    },
    
    // Delete an epic item
    async deleteEpicItem(itemId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/epic-items/${itemId}`)
        
        // Remove from epic items array
        const index = this.epicItems.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.epicItems.splice(index, 1)
        }
      } catch (error) {
        console.error('Error deleting epic item:', error)
        this.error = error.message || 'Failed to delete epic item'
        throw error
      }
    }
  }
})