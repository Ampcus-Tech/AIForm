import React, { useState } from 'react'

function QuestionModal({ question, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    category_id: question?.category_id || question?.categoryId || categories[0]?.id || '',
    question_text: question?.question_text || question?.questionText || '',
    question_type: question?.question_type || question?.questionType || 'text',
    question_code: question?.question_code || question?.questionCode || '',
    display_order: question?.display_order || question?.displayOrder || 0,
    is_required: question?.is_required !== undefined ? question.is_required : false,
    weight: question?.weight || 1.0,
    placeholder: question?.placeholder || '',
    help_text: question?.help_text || question?.helpText || '',
    options: question?.options ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : null,
    validation_rules: question?.validation_rules ? (typeof question.validation_rules === 'string' ? JSON.parse(question.validation_rules) : question.validation_rules) : null,
    parent_id: question?.parent_id || question?.parentId || null,
    is_active: question?.is_active !== undefined ? question.is_active : true,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateOptions = (field, value) => {
    setFormData({
      ...formData,
      options: { ...(formData.options || {}), [field]: value }
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{question?.id ? '✏️ Edit Question' : '➕ Add Question'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Question Text <span className="required">*</span></label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                required
                rows="3"
                placeholder="Enter the question text..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Question Type <span className="required">*</span></label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  required
                >
                  <option value="text">Text</option>
                  <option value="scale">Scale (1-5 or 1-10)</option>
                  <option value="yes_no">Yes/No</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="percentage_range">Percentage Range</option>
                  <option value="group">Group (Parent Question)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question Code</label>
                <input
                  type="text"
                  value={formData.question_code}
                  onChange={(e) => setFormData({ ...formData, question_code: e.target.value })}
                  placeholder="e.g., q1, emp_1"
                />
              </div>
            </div>

            {formData.question_type === 'scale' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Min Value</label>
                  <input
                    type="number"
                    value={formData.options?.min || 1}
                    onChange={(e) => updateOptions('min', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Max Value</label>
                  <input
                    type="number"
                    value={formData.options?.max || 5}
                    onChange={(e) => updateOptions('max', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            )}

            {formData.question_type === 'multiple_choice' && (
              <div className="form-group">
                <label>Options (one per line)</label>
                <textarea
                  value={formData.options?.options ? formData.options.options.join('\n') : ''}
                  onChange={(e) => {
                    const optionsList = e.target.value.split('\n').filter(o => o.trim())
                    updateOptions('options', optionsList)
                  }}
                  rows="5"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}

            <div className="form-row">
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
                <label>Weight</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1.0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Placeholder</label>
              <input
                type="text"
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="Placeholder text for input field"
              />
            </div>

            <div className="form-group">
              <label>Help Text</label>
              <textarea
                value={formData.help_text}
                onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                rows="2"
                placeholder="Help text or instructions for this question"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  />
                  {' '}Required
                </label>
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
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Question</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestionModal
