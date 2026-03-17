/**
 * Format answer value with labels for better readability
 * @param {any} answer - The answer value
 * @param {string} questionCode - Question code identifier
 * @param {string} questionType - Type of question (scale, yes_no, etc.)
 * @param {object} question - Full question object with options
 * @returns {string} Formatted answer string
 */
export const formatAnswer = (answer, questionCode, questionType, question = null) => {
  if (answer === '' || answer === null || answer === undefined) {
    return 'Not answered'
  }
  
  // For scale questions, try to get the label
  if (questionType === 'scale' && question && question.options) {
    let labels = question.options.labels || {}
    // labels may be persisted as JSON string; parse if needed
    if (typeof labels === 'string') {
      try {
        labels = JSON.parse(labels)
      } catch {
        labels = {}
      }
    }
    const answerStr = String(answer)
    const answerNum = parseInt(answer)
    
    // Check for label in options.labels (can be string or number key)
    if (labels[answerStr]) {
      return `${answer} - ${labels[answerStr]}`
    }
    if (labels[answerNum]) {
      return `${answer} - ${labels[answerNum]}`
    }
    
    // Try default labels for common 1-5 scales
    if (!isNaN(answerNum) && question.options.min === 1 && question.options.max === 5) {
      const defaultLabels = {
        1: 'Not at all / Not clear / Not important',
        2: 'Slightly / Somewhat',
        3: 'Moderately / Neutral',
        4: 'Very / Clear / Important',
        5: 'Extremely / Very clear / Critical'
      }
      if (defaultLabels[answerNum]) {
        return `${answer} - ${defaultLabels[answerNum]}`
      }
    }
    
    // For other scales, at least show the number with context
    if (!isNaN(answerNum)) {
      return `${answer} (on a scale of ${question.options.min || 1} to ${question.options.max || 5})`
    }
  }
  
  // For yes_no questions, make it more readable
  if (questionType === 'yes_no') {
    const answerStr = String(answer).toLowerCase().trim()
    if (answerStr === 'yes' || answerStr === '1' || answerStr === 'true' || answerStr === 'y') {
      return 'Yes'
    }
    if (answerStr === 'no' || answerStr === '0' || answerStr === 'false' || answerStr === 'n') {
      return 'No'
    }
  }
  
  return String(answer)
}
