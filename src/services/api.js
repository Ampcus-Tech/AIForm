import API_BASE_URL from '../config/api.js'

console.log('🔧 API service loaded, API_BASE_URL:', API_BASE_URL)
console.log('🔧 API_BASE_URL type:', typeof API_BASE_URL)
console.log('🔧 API_BASE_URL value check:', API_BASE_URL ? 'DEFINED' : 'UNDEFINED')

// Validate API_BASE_URL
if (!API_BASE_URL || typeof API_BASE_URL !== 'string') {
  console.error('❌ CRITICAL: API_BASE_URL is not a valid string!', API_BASE_URL)
}

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token')
}

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Auth API
export const authAPI = {
  signup: async (name, email, password) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    })
  },
}

// Public Config API
export const configAPI = {
  get: async () => {
    return apiRequest('/config', { method: 'GET' })
  },
}

// Assessment API
export const assessmentAPI = {
  submit: async (formData) => {
    // No authentication required for public assessment submission
    // const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sbeamp.ampcustech.info/api'
    
    const response = await fetch(`${API_BASE_URL}/assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    
    return data
  },

  getById: async (id, format = 'detailed') => {
    // Public route - no authentication required
    const response = await fetch(`${API_BASE_URL}/assessment/${id}?format=${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    
    return data
  },

  getReport: async (id) => {
    // Public route - no authentication required
    const response = await fetch(`${API_BASE_URL}/assessment/report/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    
    return data
  },
}

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    return apiRequest('/admin/users', {
      method: 'GET',
    })
  },

  createUser: async (data) => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateUser: async (id, data) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteUser: async (id) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    })
  },

  getAllAssessments: async () => {
    return apiRequest('/admin/assessments', {
      method: 'GET',
    })
  },

  // App Settings (branding)
  getAppSettings: async () => {
    return apiRequest('/admin/app-settings', { method: 'GET' })
  },
  updateAppSettings: async (data) => {
    return apiRequest('/admin/app-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  getAssessmentById: async (id, format = '') => {
    const url = format ? `/admin/assessments/${id}?format=${format}` : `/admin/assessments/${id}`
    console.log('📡 API: getAssessmentById called with:', { id, format, url })
    return apiRequest(url, {
      method: 'GET',
    })
  },

  getUserById: async (id) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'GET',
    })
  },

  getStats: async () => {
    return apiRequest('/admin/stats', {
      method: 'GET',
    })
  },

  // Assessment Types
  getAllAssessmentTypes: async () => {
    return apiRequest('/admin/assessment-types', {
      method: 'GET',
    })
  },

  createAssessmentType: async (data) => {
    return apiRequest('/admin/assessment-types', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateAssessmentType: async (id, data) => {
    return apiRequest(`/admin/assessment-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteAssessmentType: async (id) => {
    return apiRequest(`/admin/assessment-types/${id}`, {
      method: 'DELETE',
    })
  },

  // Categories
  getAllCategories: async (assessmentTypeId = null) => {
    const url = assessmentTypeId
      ? `/admin/categories?assessment_type_id=${assessmentTypeId}`
      : '/admin/categories'
    return apiRequest(url, {
      method: 'GET',
    })
  },

  createCategory: async (data) => {
    return apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateCategory: async (id, data) => {
    return apiRequest(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteCategory: async (id) => {
    return apiRequest(`/admin/categories/${id}`, {
      method: 'DELETE',
    })
  },

  // Questions
  getAllQuestions: async (assessmentTypeId = null, categoryId = null) => {
    let url = '/admin/questions?'
    if (assessmentTypeId) url += `assessment_type_id=${assessmentTypeId}&`
    if (categoryId) url += `category_id=${categoryId}`
    return apiRequest(url.replace(/\?$/, '').replace(/\&$/, ''), {
      method: 'GET',
    })
  },

  createQuestion: async (data) => {
    return apiRequest('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateQuestion: async (id, data) => {
    return apiRequest(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteQuestion: async (id) => {
    return apiRequest(`/admin/questions/${id}`, {
      method: 'DELETE',
    })
  },
}

// Questions API (public)
export const questionsAPI = {
  getAllQuestions: async (assessmentTypeId = null) => {
    if (!API_BASE_URL) {
      console.error('❌ API_BASE_URL is not defined!')
      throw new Error('API base URL is not configured')
    }
    const url = assessmentTypeId
      ? `/questions?assessment_type_id=${assessmentTypeId}`
      : '/questions'
    const fullUrl = `${API_BASE_URL}${url}`
    console.log('📡 Fetching questions from:', fullUrl)
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('📥 Questions response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Questions API error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Questions response data:', data)
      return data
    } catch (error) {
      console.error('❌ Fetch error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Network error - is the backend server running?')
        throw new Error('Cannot connect to server. Please ensure the backend is running.')
      }
      throw error
    }
  },
}

// Assessment Types API (public)
export const assessmentTypesAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      console.error('❌ API_BASE_URL is not defined!')
      throw new Error('API base URL is not configured')
    }
    const fullUrl = `${API_BASE_URL}/assessment-types`
    console.log('📡 Fetching assessment types from:', fullUrl)
    console.log('📡 Full URL constructed:', fullUrl)
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('📥 Assessment types response status:', response.status, response.statusText)
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Assessment types API error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Assessment types response data:', data)
      return data
    } catch (error) {
      console.error('❌ Fetch error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Network error - is the backend server running?')
        throw new Error('Cannot connect to server. Please ensure the backend is running.')
      }
      throw error
    }
  },

  getById: async (id) => {
    if (!API_BASE_URL) {
      console.error('❌ API_BASE_URL is not defined!')
      throw new Error('API base URL is not configured')
    }
    const fullUrl = `${API_BASE_URL}/assessment-types/${id}`
    console.log('📡 Fetching assessment type by ID from:', fullUrl)
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('📥 Assessment type response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Assessment type API error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Assessment type response data:', data)
      return data
    } catch (error) {
      console.error('❌ Fetch error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Network error - is the backend server running?')
        throw new Error('Cannot connect to server. Please ensure the backend is running.')
      }
      throw error
    }
  },

  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/assessment-types/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    return data
  },
}
