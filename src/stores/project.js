import { defineStore } from 'pinia'
import axios from 'axios'
import mockData from '../mock/data.json'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    workspaces: [],
    currentWorkspace: null,
    loadingProjects: false,
    error: null,
    view: 'grid', // grid or list
    filter: null,
  }),
  
  getters: {
    // Get all projects
    allProjects: (state) => state.projects,
    
    // Get favorite projects
    favoriteProjects: (state) => state.projects.filter(project => project.isFavorite),
    
    // Get active projects (progress < 100%)
    activeProjects: (state) => state.projects.filter(project => project.progress < 100),
    
    // Get completed projects (progress = 100%)
    completedProjects: (state) => state.projects.filter(project => project.progress === 100),
    
    // Get project by ID
    getProjectById: (state) => (id) => state.projects.find(project => project.id === id),
  },
  
  actions: {
    // Fetch all projects (simulating API call)
    async fetchProjects() {
      this.loadingProjects = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/projects')
        // this.projects = response.data
        
        // Using mock data for now
        this.projects = mockData.projects
        this.loadingProjects = false
      } catch (error) {
        console.error('Error fetching projects:', error)
        this.error = error.message || 'Failed to fetch projects'
        this.loadingProjects = false
      }
    },
    
    // Fetch all workspaces (simulating API call)
    async fetchWorkspaces() {
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/workspaces')
        // this.workspaces = response.data
        
        // Using mock data for now
        this.workspaces = mockData.workspaces
        
        // Set current workspace if not already set
        if (!this.currentWorkspace && this.workspaces.length > 0) {
          this.currentWorkspace = this.workspaces[0].id
        }
      } catch (error) {
        console.error('Error fetching workspaces:', error)
        this.error = error.message || 'Failed to fetch workspaces'
      }
    },
    
    // Set current project
    setCurrentProject(projectId) {
      this.currentProject = projectId
    },
    
    // Set current workspace
    setCurrentWorkspace(workspaceId) {
      this.currentWorkspace = workspaceId
    },
    
    // Toggle project favorite status
    toggleFavorite(projectId) {
      const project = this.projects.find(p => p.id === projectId)
      if (project) {
        project.isFavorite = !project.isFavorite
        
        // In a real application, this would update the server
        // axios.patch(`/api/projects/${projectId}`, { isFavorite: project.isFavorite })
      }
    },
    
    // Set view mode (grid or list)
    setView(view) {
      this.view = view
    },
    
    // Set filter
    setFilter(filter) {
      this.filter = filter
    },
    
    // Create a new project
    async createProject(projectData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/projects', projectData)
        // const newProject = response.data
        
        // Generate a new ID for mock data
        const newId = `p${this.projects.length + 1}`
        
        // Create new project object
        const newProject = {
          id: newId,
          ...projectData,
          taskCount: 0,
          sprintCount: 0,
          lastUpdated: new Date().toISOString(),
          isFavorite: false,
          progress: 0
        }
        
        // Add to projects array
        this.projects.push(newProject)
        
        // Add to workspace
        if (this.currentWorkspace) {
          const workspace = this.workspaces.find(ws => ws.id === this.currentWorkspace)
          if (workspace) {
            workspace.projects.push(newId)
          }
        }
        
        return newProject
      } catch (error) {
        console.error('Error creating project:', error)
        this.error = error.message || 'Failed to create project'
        throw error
      }
    },
    
    // Update a project
    async updateProject(projectId, projectData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/projects/${projectId}`, projectData)
        // const updatedProject = response.data
        
        // Update project in state
        const index = this.projects.findIndex(p => p.id === projectId)
        if (index !== -1) {
          this.projects[index] = {
            ...this.projects[index],
            ...projectData,
            lastUpdated: new Date().toISOString()
          }
          
          return this.projects[index]
        }
        
        throw new Error('Project not found')
      } catch (error) {
        console.error('Error updating project:', error)
        this.error = error.message || 'Failed to update project'
        throw error
      }
    },
    
    // Delete a project
    async deleteProject(projectId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/projects/${projectId}`)
        
        // Remove from projects array
        const index = this.projects.findIndex(p => p.id === projectId)
        if (index !== -1) {
          this.projects.splice(index, 1)
        }
        
        // Remove from workspace
        this.workspaces.forEach(workspace => {
          const projectIndex = workspace.projects.indexOf(projectId)
          if (projectIndex !== -1) {
            workspace.projects.splice(projectIndex, 1)
          }
        })
        
        // Clear current project if deleted
        if (this.currentProject === projectId) {
          this.currentProject = null
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        this.error = error.message || 'Failed to delete project'
        throw error
      }
    }
  }
})