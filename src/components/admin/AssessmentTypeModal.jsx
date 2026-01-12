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
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                {' '}Active
              </label>
            </div>
            <div className="form-group" style={{ 
              padding: '15px', 
              background: '#f8f9ff', 
              borderRadius: '8px', 
              border: '2px solid #e0e7ff',
              marginTop: '15px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
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
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <strong>📝 Single Question Mode</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                    Show one question at a time with "Save and Next" button. At the end, show a preview page before final submission.
                  </p>
                </div>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Assessment Type</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssessmentTypeModal
