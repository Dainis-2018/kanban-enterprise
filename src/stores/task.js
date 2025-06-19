import { defineStore } from 'pinia'
import mockData from '../mock/data.json'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    columns: [],
    loadingTasks: false,
    error: null,
    currentTask: null,
    filter: null,
  }),
  
  getters: {
    // Get all tasks
    allTasks: (state) => state.tasks,
    
    // Get tasks by project
    tasksByProject: (state) => (projectId) => 
      state.tasks.filter(task => task.projectId === projectId),
    
    // Get tasks grouped by status
    tasksByStatus: (state) => (projectId) => {
      const projectTasks = state.tasks.filter(task => task.projectId === projectId)
      
      return state.columns.reduce((acc, column) => {
        acc[column.id] = projectTasks.filter(task => task.status === column.id)
        return acc
      }, {})
    },
    
    // Get task by ID
    getTaskById: (state) => (id) => 
      state.tasks.find(task => task.id === id),
    
    // Get columns
    getColumns: (state) => state.columns,
  },
  
  actions: {
    // Fetch all tasks (simulating API call)
    async fetchTasks(projectId = null) {
      this.loadingTasks = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get(`/api/tasks${projectId ? `?projectId=${projectId}` : ''}`)
        // this.tasks = response.data
        
        // Using mock data for now
        if (projectId) {
          this.tasks = mockData.tasks.filter(task => task.projectId === projectId)
        } else {
          this.tasks = mockData.tasks
        }
        
        this.loadingTasks = false
      } catch (error) {
        console.error('Error fetching tasks:', error)
        this.error = error.message || 'Failed to fetch tasks'
        this.loadingTasks = false
      }
    },
    
    // Fetch columns (simulating API call)
    async fetchColumns() {
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/columns')
        // this.columns = response.data
        
        // Using mock data for now
        this.columns = mockData.columns
      } catch (error) {
        console.error('Error fetching columns:', error)
        this.error = error.message || 'Failed to fetch columns'
      }
    },
    
    // Set current task
    setCurrentTask(taskId) {
      this.currentTask = taskId
    },
    
    // Update task status (used for drag and drop)
    async updateTaskStatus(taskId, newStatus) {
      try {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId)
        
        if (taskIndex !== -1) {
          // In a real application, this would be an API call
          // await axios.patch(`/api/tasks/${taskId}`, { status: newStatus })
          
          // Update in state
          this.tasks[taskIndex].status = newStatus
          this.tasks[taskIndex].updatedAt = new Date().toISOString()
        }
      } catch (error) {
        console.error('Error updating task status:', error)
        this.error = error.message || 'Failed to update task status'
        throw error
      }
    },
    
    // Create a new task
    async createTask(taskData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/tasks', taskData)
        // const newTask = response.data
        
        // Generate a new ID for mock data
        const newId = `t${this.tasks.length + 1}`
        
        // Create new task object
        const newTask = {
          id: newId,
          ...taskData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: []
        }
        
        // Add to tasks array
        this.tasks.push(newTask)
        
        return newTask
      } catch (error) {
        console.error('Error creating task:', error)
        this.error = error.message || 'Failed to create task'
        throw error
      }
    },
    
    // Update a task
    async updateTask(taskId, taskData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/tasks/${taskId}`, taskData)
        // const updatedTask = response.data
        
        // Update task in state
        const index = this.tasks.findIndex(t => t.id === taskId)
        if (index !== -1) {
          this.tasks[index] = {
            ...this.tasks[index],
            ...taskData,
            updatedAt: new Date().toISOString()
          }
          
          return this.tasks[index]
        }
        
        throw new Error('Task not found')
      } catch (error) {
        console.error('Error updating task:', error)
        this.error = error.message || 'Failed to update task'
        throw error
      }
    },
    
    // Delete a task
    async deleteTask(taskId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/tasks/${taskId}`)
        
        // Remove from tasks array
        const index = this.tasks.findIndex(t => t.id === taskId)
        if (index !== -1) {
          this.tasks.splice(index, 1)
        }
        
        // Clear current task if deleted
        if (this.currentTask === taskId) {
          this.currentTask = null
        }
      } catch (error) {
        console.error('Error deleting task:', error)
        this.error = error.message || 'Failed to delete task'
        throw error
      }
    },
    
    // Add a comment to a task
    async addComment(taskId, commentData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post(`/api/tasks/${taskId}/comments`, commentData)
        // const newComment = response.data
        
        // Find task
        const taskIndex = this.tasks.findIndex(t => t.id === taskId)
        if (taskIndex === -1) {
          throw new Error('Task not found')
        }
        
        // Generate a new ID for mock data
        const commentCount = this.tasks[taskIndex].comments.length
        const newId = `c${commentCount + 1}`
        
        // Create new comment object
        const newComment = {
          id: newId,
          ...commentData,
          createdAt: new Date().toISOString()
        }
        
        // Add to task comments
        this.tasks[taskIndex].comments.push(newComment)
        
        return newComment
      } catch (error) {
        console.error('Error adding comment:', error)
        this.error = error.message || 'Failed to add comment'
        throw error
      }
    },
    
    // Set task filter
    setFilter(filter) {
      this.filter = filter
    }
  }
})