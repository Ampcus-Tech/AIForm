import React, { useState, useEffect } from 'react'

function QuestionModal({ question, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    category_id: question?.category_id || question?.categoryId || (categories && categories.length > 0 ? categories[0].id : ''),
    question_text: question?.question_text || question?.questionText || '',
    question_type: question?.question_type || question?.questionType || 'text',
    question_code: question?.question_code || question?.questionCode || null,
    display_order: question?.display_order || question?.displayOrder || 0,
    is_required: question?.is_required !== undefined ? question.is_required : false,
    help_text: question?.help_text || question?.helpText || '',
    options: question?.options ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : null,
    validation_rules: question?.validation_rules ? (typeof question.validation_rules === 'string' ? JSON.parse(question.validation_rules) : question.validation_rules) : null,
    parent_id: question?.parent_id || question?.parentId || null,
  })

  // Validate and reset category_id if it doesn't exist in categories
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (formData.category_id) {
        const categoryExists = categories.some(cat => cat.id === formData.category_id)
        if (!categoryExists) {
          // Reset to first available category
          setFormData(prev => ({
            ...prev,
            category_id: categories[0].id
          }))
        }
      } else if (!formData.category_id) {
        // No category selected, set to first available
        setFormData(prev => ({
          ...prev,
          category_id: categories[0].id
        }))
      }
    } else if (formData.category_id && (!categories || categories.length === 0)) {
      // No categories available, reset to empty
      setFormData(prev => ({
        ...prev,
        category_id: ''
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate category_id
    if (!formData.category_id || formData.category_id === '') {
      alert('Please select a category')
      return
    }
    
    // Ensure category_id is a valid integer
    const categoryId = parseInt(formData.category_id)
    if (isNaN(categoryId) || categoryId <= 0) {
      alert('Please select a valid category')
      return
    }
    
    // Check if category exists in the categories list
    const categoryExists = categories && categories.some(cat => cat.id === categoryId)
    if (!categoryExists) {
      alert('Selected category does not exist. Please select a valid category.')
      return
    }
    
    // Prepare data with validated category_id
    const submitData = {
      ...formData,
      category_id: categoryId
    }
    
    onSave(submitData)
  }

  const updateOptions = (field, value) => {
    setFormData({
      ...formData,
      options: { ...(formData.options || {}), [field]: value }
    })
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '1em',
    transition: 'all 0.2s',
    outline: 'none',
    fontFamily: 'inherit'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95em'
  }

  const focusStyle = {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
  }

  const blurStyle = {
    borderColor: '#e0e0e0',
    boxShadow: 'none'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '800px',
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
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5em', color: 'white' }}>
            {question?.id ? '✏️ Edit Question' : '➕ Add Question'}
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
              <label style={labelStyle}>
                Category <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, category_id: value ? parseInt(value) : '' })
                }}
                required
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center'
                }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              >
                <option value="">Select Category</option>
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
              {(!categories || categories.length === 0) && (
                <small style={{ color: '#e74c3c', marginTop: '6px', display: 'block' }}>
                  ⚠️ No categories available. Please create a category first.
                </small>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>
                Question Text <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                required
                rows="3"
                placeholder="Enter the question text..."
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '80px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  overflow: 'auto'
                }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group">
                <label style={labelStyle}>
                  Question Type <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  required
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center'
                  }}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                >
                  <option value="text">Text</option>
                  <option value="scale">Scale (1-5 or 1-10)</option>
                  <option value="yes_no">Yes/No</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="percentage_range">Percentage Range</option>
                  <option value="group">Group (Parent Question)</option>
                </select>
              </div>

            </div>

            {formData.question_type === 'scale' && (
              <div style={{ 
                padding: '20px', 
                background: '#f8f9ff', 
                borderRadius: '10px', 
                border: '2px solid #e0e7ff',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#667eea', fontSize: '1.1em' }}>📊 Scale Options</h4>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Min Value</label>
                    <input
                      type="number"
                      value={formData.options?.min || 1}
                      onChange={(e) => updateOptions('min', parseInt(e.target.value))}
                      min="1"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Max Value</label>
                    <input
                      type="number"
                      value={formData.options?.max || 5}
                      onChange={(e) => updateOptions('max', parseInt(e.target.value))}
                      min="1"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Scale Labels (Optional)</label>
                  <input
                    type="text"
                    value={formData.options?.labels ? JSON.stringify(formData.options.labels) : ''}
                    onChange={(e) => {
                      try {
                        const labels = e.target.value ? JSON.parse(e.target.value) : {}
                        updateOptions('labels', labels)
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='{"1": "Low", "5": "High"}'
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  />
                  <small style={{ 
                    color: '#666', 
                    fontSize: '0.85em',
                    marginTop: '6px',
                    display: 'block'
                  }}>
                    💡 JSON format: {'{"1": "Label1", "5": "Label5"}'}
                  </small>
                </div>
              </div>
            )}
            
            {formData.question_type === 'percentage_range' && (
              <div style={{ 
                padding: '20px', 
                background: '#f8f9ff', 
                borderRadius: '10px', 
                border: '2px solid #e0e7ff',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#667eea', fontSize: '1.1em' }}>📊 Percentage Range</h4>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Min %</label>
                    <input
                      type="number"
                      value={formData.options?.min || 0}
                      onChange={(e) => updateOptions('min', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Max %</label>
                    <input
                      type="number"
                      value={formData.options?.max || 100}
                      onChange={(e) => updateOptions('max', parseInt(e.target.value) || 100)}
                      min="0"
                      max="100"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.question_type === 'multiple_choice' && (
              <div style={{ 
                padding: '20px', 
                background: '#f8f9ff', 
                borderRadius: '10px', 
                border: '2px solid #e0e7ff',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#667eea', fontSize: '1.1em' }}>📋 Multiple Choice Options</h4>
                <div className="form-group">
                  <label style={labelStyle}>Options (one per line)</label>
                  <textarea
                    value={formData.options?.options ? formData.options.options.join('\n') : ''}
                    onChange={(e) => {
                      const optionsList = e.target.value.split('\n').filter(o => o.trim())
                      updateOptions('options', optionsList)
                    }}
                    rows="5"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      overflow: 'auto'
                    }}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  />
                  <small style={{ 
                    color: '#666', 
                    fontSize: '0.85em',
                    marginTop: '6px',
                    display: 'block'
                  }}>
                    💡 Enter each option on a new line
                  </small>
                </div>
              </div>
            )}

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group">
                <label style={labelStyle}>Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                />
                <small style={{ 
                  color: '#666', 
                  fontSize: '0.85em',
                  marginTop: '6px',
                  display: 'block'
                }}>
                  💡 Lower numbers appear first within the category
                </small>
              </div>

              <div className="form-group">
                <label style={labelStyle}>Help Text</label>
                <textarea
                  value={formData.help_text}
                  onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                  rows="2"
                  placeholder="Help text or instructions for this question"
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '60px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'auto'
                  }}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                />
              </div>
            </div>

            <div className="form-group" style={{
              padding: '16px',
              background: formData.is_required ? '#e8f5e9' : '#f5f5f5',
              borderRadius: '10px',
              border: `2px solid ${formData.is_required ? '#4caf50' : '#e0e0e0'}`,
              transition: 'all 0.2s',
              marginBottom: '24px'
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
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
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
                      color: formData.is_required ? '#2e7d32' : '#666'
                    }}>
                      ✅ Required
                    </strong>
                    {formData.is_required && (
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
                    Users must answer this question before submitting
                  </p>
                </div>
              </label>
            </div>
            
            {formData.question_type !== 'group' && (
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Parent Question (Optional)</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center'
                  }}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                >
                  <option value="">None (Standalone Question)</option>
                  {categories.map(cat => 
                    cat.questions?.filter(q => q.question_type === 'group' || q.question_type === 'yes_no').map(q => (
                      <option key={q.id} value={q.id}>
                        {cat.name} - {q.questionText || q.question_text}
                      </option>
                    ))
                  )}
                </select>
                <small style={{ 
                  color: '#666', 
                  fontSize: '0.85em',
                  marginTop: '6px',
                  display: 'block'
                }}>
                  ℹ️ Select a parent question if this is a sub-question (e.g., appears when parent is answered "Yes")
                </small>
              </div>
            )}
          </div>
          <div className="modal-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '20px 30px',
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa',
            borderRadius: '0 0 16px 16px',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
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
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestionModal
