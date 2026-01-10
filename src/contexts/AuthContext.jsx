import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for stored user session on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      // Verify token is still valid and get updated user info including role
      authAPI.getCurrentUser()
        .then((response) => {
          if (response.success) {
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      if (response.success) {
        // Only allow admin login
        if (response.user.role !== 'admin') {
          return { success: false, error: 'Access denied. Admin login only.' }
        }
        setUser(response.user)
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        return { success: true, user: response.user }
      }
      return { success: false, error: response.error || 'Login failed' }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup(name, email, password)
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        return { success: true }
      }
      return { success: false, error: response.error || 'Signup failed' }
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
