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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user?.id ? '✏️ Edit User' : '➕ Add User'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter user's full name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="user@example.com"
                disabled={!!user?.id} // Disable email editing for existing users
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
              {user?.id && (
                <small style={{ color: '#666', fontStyle: 'italic' }}>
                  Email cannot be changed for existing users
                </small>
              )}
            </div>

            <div className="form-group">
              <label>
                Password {!user?.id && <span className="required">*</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user?.id}
                placeholder={user?.id ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
              {user?.id && (
                <small style={{ color: '#666' }}>
                  Leave blank to keep the current password. Enter a new password to change it.
                </small>
              )}
            </div>

            <div className="form-group">
              <label>
                Role <span className="required">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              <small style={{ color: '#666' }}>
                Select the user's access level. Admin has full access, Admin Viewer can view but not edit, User has no admin access.
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {user?.id ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
