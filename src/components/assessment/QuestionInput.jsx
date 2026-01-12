import React from 'react'

/**
 * Renders question input based on question type
 */
function QuestionInput({ question, value, onChange, formData }) {
  const questionCode = question.questionCode || `q_${question.id}`
  const currentValue = formData?.answers?.[questionCode] !== undefined 
    ? String(formData.answers[questionCode]) 
    : String(value || '')
  const isRequired = question.isRequired

  switch (question.questionType) {
    case 'scale':
      const min = question.options?.min || 1
      const max = question.options?.max || 5
      const labels = question.options?.labels || {}
      
      const getLabel = (num) => {
        if (labels[String(num)]) {
          return labels[String(num)]
        }
        if (max === 5 && min === 1) {
          const defaultLabels = {
            '1': 'Not at all',
            '2': 'Slightly',
            '3': 'Moderately',
            '4': 'Very',
            '5': 'Extremely'
          }
          return defaultLabels[String(num)] || ''
        }
        return ''
      }
      
      return (
        <div className="scale-options">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const num = min + i
            const label = getLabel(num)
            const isSelected = currentValue === String(num)
            
            return (
              <label key={num} className={`scale-option ${isSelected ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={questionCode}
                  value={num}
                  checked={isSelected}
                  onChange={onChange}
                  required={isRequired}
                />
                <span className="scale-number">{num}</span>
                {label && <span className="scale-label">{label}</span>}
              </label>
            )
          })}
        </div>
      )

    case 'yes_no':
      const yesNoValue = String(currentValue || '')
      return (
        <div className="yes-no-group">
          <label style={{ cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="radio"
              name={questionCode}
              value="yes"
              checked={yesNoValue === 'yes'}
              onChange={onChange}
              required={isRequired}
              style={{ cursor: 'pointer', marginRight: '5px' }}
            />
            Yes
          </label>
          <label style={{ cursor: 'pointer', userSelect: 'none', marginLeft: '15px' }}>
            <input
              type="radio"
              name={questionCode}
              value="no"
              checked={yesNoValue === 'no'}
              onChange={onChange}
              required={isRequired}
              style={{ cursor: 'pointer', marginRight: '5px' }}
            />
            No
          </label>
        </div>
      )

    case 'multiple_choice':
      const options = question.options?.options || []
      return (
        <div className="radio-options">
          {options.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name={questionCode}
                value={option}
                checked={currentValue === option}
                onChange={onChange}
                required={isRequired}
              />{' '}
              {option}
            </label>
          ))}
        </div>
      )

    case 'percentage_range':
      const percentageOptions = question.options?.options || []
      return (
        <div className="radio-options">
          {percentageOptions.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name={questionCode}
                value={option}
                checked={currentValue === option}
                onChange={onChange}
                required={isRequired}
              />{' '}
              {option}
            </label>
          ))}
        </div>
      )

    case 'text':
      return (
        <textarea
          name={questionCode}
          rows={4}
          value={currentValue}
          onChange={onChange}
          required={isRequired}
          placeholder={question.placeholder || 'Please enter your answer...'}
          minLength={question.validationRules?.minLength || 0}
        />
      )

    case 'group':
      return null

    default:
      return (
        <input
          type="text"
          name={questionCode}
          value={currentValue}
          onChange={onChange}
          required={isRequired}
          placeholder={question.placeholder || 'Please enter your answer...'}
        />
      )
  }
}

export default QuestionInput
