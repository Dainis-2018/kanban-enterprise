import { defineStore } from 'pinia'
import mockData from '../mock/data.json'

export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [],
    loadingTags: false,
    error: null,
  }),
  
  getters: {
    // Get all tags
    allTags: (state) => state.tags,
    
    // Get tag by ID
    getTagById: (state) => (id) => 
      state.tags.find(tag => tag.id === id),
  },
  
  actions: {
    // Fetch all tags (simulating API call)
    async fetchTags() {
      this.loadingTags = true
      this.error = null
      
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/tags')
        // this.tags = response.data
        
        // Using mock data for now
        this.tags = mockData.tags
        
        this.loadingTags = false
      } catch (error) {
        console.error('Error fetching tags:', error)
        this.error = error.message || 'Failed to fetch tags'
        this.loadingTags = false
      }
    },
    
    // Create a new tag
    async createTag(tagData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.post('/api/tags', tagData)
        // const newTag = response.data
        
        // Generate a new ID for mock data
        const newId = `tag${this.tags.length + 1}`
        
        // Create new tag object
        const newTag = {
          id: newId,
          ...tagData
        }
        
        // Add to tags array
        this.tags.push(newTag)
        
        return newTag
      } catch (error) {
        console.error('Error creating tag:', error)
        this.error = error.message || 'Failed to create tag'
        throw error
      }
    },
    
    // Update a tag
    async updateTag(tagId, tagData) {
      try {
        // In a real application, this would be an API call
        // const response = await axios.put(`/api/tags/${tagId}`, tagData)
        // const updatedTag = response.data
        
        // Update tag in state
        const index = this.tags.findIndex(t => t.id === tagId)
        if (index !== -1) {
          this.tags[index] = {
            ...this.tags[index],
            ...tagData
          }
          
          return this.tags[index]
        }
        
        throw new Error('Tag not found')
      } catch (error) {
        console.error('Error updating tag:', error)
        this.error = error.message || 'Failed to update tag'
        throw error
      }
    },
    
    // Delete a tag
    async deleteTag(tagId) {
      try {
        // In a real application, this would be an API call
        // await axios.delete(`/api/tags/${tagId}`)
        
        // Remove from tags array
        const index = this.tags.findIndex(t => t.id === tagId)
        if (index !== -1) {
          this.tags.splice(index, 1)
        }
      } catch (error) {
        console.error('Error deleting tag:', error)
        this.error = error.message || 'Failed to delete tag'
        throw error
      }
    }
  }
})