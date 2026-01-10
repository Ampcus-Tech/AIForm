import API_BASE_URL from '../config/api.js'

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
}

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    return apiRequest('/admin/users', {
      method: 'GET',
    })
  },

  getAllAssessments: async () => {
    return apiRequest('/admin/assessments', {
      method: 'GET',
    })
  },

  getAssessmentById: async (id) => {
    return apiRequest(`/admin/assessments/${id}`, {
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
}
