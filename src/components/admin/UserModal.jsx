import React, { useState } from 'react'

function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required'
    }

    // Password is required for new users, optional for editing
    if (!user?.id && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // If editing and password is provided, validate it
    if (user?.id && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // If editing and password is empty, don't send it
      const dataToSave = { ...formData }
      if (user?.id && !formData.password) {
        delete dataToSave.password
      }
      onSave(dataToSave)
    }
  }

  const roleOptions = [
    { value: 'user', label: 'User', description: 'Regular user access' },
    { value: 'admin', label: 'Admin', description: 'Full administrative access' },
    { value: 'admin-viewer', label: 'Admin Viewer', description: 'View-only admin access' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div className="modal-header" style={{
          padding: '24px 30px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px 16px 0 0',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5em', color: 'white' }}>
            {user?.id ? '✏️ Edit User' : '➕ Add User'}
          </h2>
          <button 
            onClick={onClose} 
            className="close-btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5em',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)'
              e.target.style.transform = 'rotate(90deg)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)'
              e.target.style.transform = 'rotate(0deg)'
            }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '30px' }}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Name <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter user's full name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: errors.name ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                  fontSize: '1em',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name ? '#e74c3c' : '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.name && (
                <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Email <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="user@example.com"
                disabled={!!user?.id}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: errors.email ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                  fontSize: '1em',
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: user?.id ? '#f5f5f5' : 'white',
                  cursor: user?.id ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  if (!user?.id) {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#e74c3c' : '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.email && (
                <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
              {user?.id && (
                <small style={{ 
                  color: '#666', 
                  fontSize: '0.85em',
                  marginTop: '6px',
                  display: 'block',
                  fontStyle: 'italic'
                }}>
                  📝 Email cannot be changed for existing users
                </small>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Password {!user?.id && <span style={{ color: '#e74c3c' }}>*</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user?.id}
                placeholder={user?.id ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: errors.password ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                  fontSize: '1em',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#e74c3c' : '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.password && (
                <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
                  {errors.password}
                </span>
              )}
              {user?.id && (
                <small style={{ 
                  color: '#666', 
                  fontSize: '0.85em',
                  marginTop: '6px',
                  display: 'block'
                }}>
                  💡 Leave blank to keep the current password. Enter a new password to change it.
                </small>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Role <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1em',
                  fontWeight: '500',
                  background: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label === 'Admin' ? '👑' : option.label === 'Admin Viewer' ? '👁️' : '👤'} {option.label} - {option.description}
                  </option>
                ))}
              </select>
              <small style={{ 
                color: '#666', 
                fontSize: '0.85em',
                marginTop: '6px',
                display: 'block'
              }}>
                ℹ️ Select the user's access level. Admin has full access, Admin Viewer can view but not edit, User has no admin access.
              </small>
            </div>
          </div>
          <div className="modal-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '20px 30px',
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa',
            borderRadius: '0 0 16px 16px'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: 'white',
                color: '#667eea',
                fontWeight: '600',
                fontSize: '1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f4ff'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                minWidth: '150px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              {user?.id ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
