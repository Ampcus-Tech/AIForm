import React, { useState, useEffect } from 'react'
import RichTextEditor from '../common/RichTextEditor'

function CategoryModal({ category, adminAPI, onClose, onSave }) {
  const [assessmentTypes, setAssessmentTypes] = useState([])
  
  useEffect(() => {
    const loadAssessmentTypes = async () => {
      try {
        const response = await adminAPI.getAllAssessmentTypes()
        if (response && response.success && response.assessmentTypes) {
          setAssessmentTypes(response.assessmentTypes)
        }
      } catch (err) {
        console.error('Error loading assessment types:', err)
      }
    }
    if (adminAPI) {
      loadAssessmentTypes()
    }
  }, [adminAPI])
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    display_order: category?.display_order || category?.displayOrder || 0,
    assessment_type_id: category?.assessment_type_id || category?.assessmentTypeId || null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

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
            {category?.id ? '✏️ Edit Category' : '➕ Add Category'}
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
                Assessment Type <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                value={formData.assessment_type_id || ''}
                onChange={(e) => setFormData({ ...formData, assessment_type_id: e.target.value ? parseInt(e.target.value) : null })}
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
                <option value="">Select Assessment Type</option>
                {assessmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon || '📝'} {type.name}
                  </option>
                ))}
              </select>
              <small style={{ 
                color: '#666', 
                fontSize: '0.85em',
                marginTop: '6px',
                display: 'block'
              }}>
                ℹ️ Select which assessment type this category belongs to
              </small>
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Category Name <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Employee Engagement"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1em',
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
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Describe this category... Use the toolbar for headings, bold, lists."
                minHeight={120}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1em',
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
              />
              <small style={{ 
                color: '#666', 
                fontSize: '0.85em',
                marginTop: '6px',
                display: 'block'
              }}>
                💡 Lower numbers appear first
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
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
