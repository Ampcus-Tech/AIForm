import React from 'react'

/**
 * Renders question input based on question type
 */
function QuestionInput({ question, value, onChange, formData }) {
  const questionCode =
    question.questionCode ||
    question.question_code ||
    question.code ||
    `q_${question.id}`
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
                <div className="scale-option-content">
                  <span className="scale-number">{num}</span>
                  {label && <span className="scale-label">{label}</span>}
                </div>
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
      // Support multi-select via checkboxes when enabled in options
      if (question.options?.allowMultiple) {
        let selected = []
        try {
          const parsed = JSON.parse(currentValue)
          if (Array.isArray(parsed)) selected = parsed.map(String)
        } catch (e) {
          selected = currentValue ? [String(currentValue)] : []
        }

        const toggle = (option, checked) => {
          const next = checked
            ? Array.from(new Set([...selected, option]))
            : selected.filter(v => v !== option)

          onChange({
            target: {
              name: questionCode,
              value: JSON.stringify(next),
              type: 'text',
            }
          })
        }

        return (
          <div className="radio-options">
            {options.map((option, index) => (
              <label key={index} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  name={`${questionCode}__${index}`}
                  value={option}
                  checked={selected.includes(option)}
                  onChange={(e) => toggle(option, e.target.checked)}
                />{' '}
                {option}
              </label>
            ))}
          </div>
        )
      }

      const otherOption = options.find(o => String(o).trim().toLowerCase() === 'other')
      const isOtherSelected = otherOption && currentValue === otherOption
      const otherTextKey = `${questionCode}_other`
      const otherTextValue = formData?.answers?.[otherTextKey] !== undefined
        ? String(formData.answers[otherTextKey])
        : ''

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
          {isOtherSelected && (
            <div className="other-text-wrap" style={{ marginTop: 10 }}>
              <input
                type="text"
                name={otherTextKey}
                value={otherTextValue}
                onChange={onChange}
                placeholder="Please specify..."
                className="other-text-input"
                style={{
                  width: '100%',
                  maxWidth: 400,
                  padding: '8px 12px',
                  marginTop: 6,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  fontSize: '1em',
                }}
              />
            </div>
          )}
        </div>
      )

    case 'percentage_range':
      const percentageOptions = question.options?.options || []
      const pctOtherOption = percentageOptions.find(o => String(o).trim().toLowerCase() === 'other')
      const pctOtherSelected = pctOtherOption && currentValue === pctOtherOption
      const pctOtherTextKey = `${questionCode}_other`
      const pctOtherTextValue = formData?.answers?.[pctOtherTextKey] !== undefined
        ? String(formData.answers[pctOtherTextKey])
        : ''
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
          {pctOtherSelected && (
            <div className="other-text-wrap" style={{ marginTop: 10 }}>
              <input
                type="text"
                name={pctOtherTextKey}
                value={pctOtherTextValue}
                onChange={onChange}
                placeholder="Please specify..."
                className="other-text-input"
                style={{
                  width: '100%',
                  maxWidth: 400,
                  padding: '8px 12px',
                  marginTop: 6,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  fontSize: '1em',
                }}
              />
            </div>
          )}
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
          placeholder={question.placeholder || ''}
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
          placeholder={question.placeholder || ''}
        />
      )
  }
}

export default QuestionInput
