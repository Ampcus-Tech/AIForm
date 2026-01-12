import React, { useState } from 'react'

function AssessmentModal({ assessment, onClose, onSave }) {
  const [formData, setFormData] = useState({
    contact_name: assessment?.contact_name || assessment?.contactName || '',
    contact_email: assessment?.contact_email || assessment?.contactEmail || '',
    company_name: assessment?.company_name || assessment?.companyName || '',
    contact_title: assessment?.contact_title || assessment?.contactTitle || '',
    active_date: assessment?.active_date || assessment?.activeDate || '',
    expiry_date: assessment?.expiry_date || assessment?.expiryDate || '',
    user_id: assessment?.user_id || assessment?.userId || null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      active_date: formData.active_date || null,
      expiry_date: formData.expiry_date || null,
      user_id: formData.user_id || null,
    }
    onSave(data)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{assessment?.id ? '✏️ Edit Assessment' : '➕ Add Assessment'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Contact Name <span className="required">*</span></label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Email <span className="required">*</span></label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contact Title</label>
              <input
                type="text"
                value={formData.contact_title}
                onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Active Date (ISO format, e.g., 2026-06-01T00:00:00Z)</label>
              <input
                type="datetime-local"
                value={formData.active_date ? formData.active_date.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, active_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              />
              <small>Leave empty for immediate activation</small>
            </div>
            <div className="form-group">
              <label>Expiry Date (ISO format, e.g., 2026-12-31T23:59:59Z)</label>
              <input
                type="datetime-local"
                value={formData.expiry_date ? formData.expiry_date.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              />
              <small>Leave empty for no expiry</small>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Assessment</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssessmentModal
