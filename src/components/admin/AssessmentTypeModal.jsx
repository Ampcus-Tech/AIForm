import React, { useState } from 'react'

function AssessmentTypeModal({ assessmentType, onClose, onSave }) {
  const existingSettings = assessmentType?.settings || {}
  const [formData, setFormData] = useState({
    name: assessmentType?.name || '',
    slug: assessmentType?.slug || '',
    description: assessmentType?.description || '',
    icon: assessmentType?.icon || '',
    display_order: assessmentType?.display_order || assessmentType?.displayOrder || 0,
    is_active: assessmentType?.is_active !== undefined ? assessmentType.is_active : true,
    settings: {
      ...existingSettings,
      singleQuestionMode: existingSettings.singleQuestionMode || false,
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Generate slug from name if not provided
    if (!formData.slug && formData.name) {
      formData.slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
    
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{assessmentType?.id ? '✏️ Edit Assessment Type' : '➕ Add Assessment Type'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Assessment Type Name <span className="required">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Employee Tech Review"
              />
            </div>
            <div className="form-group">
              <label>Slug <span className="required">*</span></label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                required
                placeholder="e.g., employee-tech-review"
                pattern="[a-z0-9-]+"
              />
              <small>URL-friendly identifier (lowercase, hyphens only)</small>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="Describe this assessment type..."
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  overflow: 'auto'
                }}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Icon (Emoji or Code)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., 👨‍💻 or tech-review"
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
            <div className="form-group" style={{
              padding: '16px',
              background: formData.is_active ? '#e8f5e9' : '#f5f5f5',
              borderRadius: '10px',
              border: `2px solid ${formData.is_active ? '#4caf50' : '#e0e0e0'}`,
              transition: 'all 0.2s',
              marginTop: '10px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                margin: 0
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    accentColor: '#4caf50',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <strong style={{ 
                      fontSize: '1.05em', 
                      color: formData.is_active ? '#2e7d32' : '#666'
                    }}>
                      ✅ Active
                    </strong>
                    {formData.is_active && (
                      <span style={{
                        padding: '4px 10px',
                        background: '#4caf50',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75em',
                        fontWeight: '600'
                      }}>
                        Enabled
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.85em',
                    color: '#666'
                  }}>
                    {formData.is_active 
                      ? 'This assessment type is currently active and visible to users.'
                      : 'This assessment type is inactive and hidden from users.'}
                  </p>
                </div>
              </label>
            </div>
            <div className="form-group" style={{ 
              padding: '20px', 
              background: '#f8f9ff', 
              borderRadius: '10px', 
              border: '2px solid #e0e7ff',
              marginTop: '20px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = '#f0f4ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e7ff'
              e.currentTarget.style.background = '#f8f9ff'
            }}
            >
              <label style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                cursor: 'pointer',
                margin: 0
              }}>
                <input
                  type="checkbox"
                  checked={formData.settings.singleQuestionMode || false}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { 
                      ...formData.settings, 
                      singleQuestionMode: e.target.checked 
                    } 
                  })}
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    marginTop: '2px',
                    accentColor: '#667eea',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <strong style={{ fontSize: '1.05em', color: '#333' }}>📝 Single Question Mode</strong>
                    {formData.settings.singleQuestionMode && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75em',
                        fontWeight: '600'
                      }}>
                        Enabled
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9em', 
                    color: '#666',
                    lineHeight: '1.5'
                  }}>
                    Show one question at a time with "Save and Next" button. At the end, show a preview page before final submission.
                  </p>
                </div>
              </label>
            </div>
          </div>
          <div className="modal-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '20px 30px',
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa'
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
                minWidth: '180px'
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
              Save Assessment Type
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssessmentTypeModal
