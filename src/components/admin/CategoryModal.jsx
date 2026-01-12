import React, { useState, useEffect } from 'react'

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
    is_active: category?.is_active !== undefined ? category.is_active : true,
    assessment_type_id: category?.assessment_type_id || category?.assessmentTypeId || null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category?.id ? '✏️ Edit Category' : '➕ Add Category'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Assessment Type <span className="required">*</span></label>
              <select
                value={formData.assessment_type_id || ''}
                onChange={(e) => setFormData({ ...formData, assessment_type_id: e.target.value ? parseInt(e.target.value) : null })}
                required
              >
                <option value="">Select Assessment Type</option>
                {assessmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon || '📝'} {type.name}
                  </option>
                ))}
              </select>
              <small>Select which assessment type this category belongs to</small>
            </div>
            <div className="form-group">
              <label>Category Name <span className="required">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Employee Engagement"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="Describe this category..."
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
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
