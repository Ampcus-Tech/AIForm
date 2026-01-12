import React from 'react'
import QuestionInput from './QuestionInput'

/**
 * Single question view component for single question mode
 */
function SingleQuestionView({ 
  question, 
  questionNumber, 
  totalQuestions, 
  formData, 
  onChange, 
  onPrevious, 
  onNext,
  isLastQuestion 
}) {
  const answerKey = question.answerKey
  const currentAnswer = formData.answers?.[answerKey] || ''

  return (
    <section className="form-section">
      {question.categoryName && (
        <h2 style={{ fontSize: '1em', color: '#667eea', marginBottom: '15px' }}>
          Category: {question.categoryName}
        </h2>
      )}

      <div className="question-group">
        <label className="question-label" style={{ fontSize: '1.2em', marginBottom: '20px' }}>
          {question.questionNumber}. {question.questionText}
          {question.isRequired && <span className="required">*</span>}
        </label>
        {question.helpText && (
          <p className="question-help" style={{ marginBottom: '15px', color: '#666' }}>
            {question.helpText}
          </p>
        )}
        
        <QuestionInput
          question={{ ...question, questionCode: answerKey }}
          value={currentAnswer}
          onChange={onChange}
          formData={formData}
        />
      </div>

      {/* Show child questions if parent is yes_no and answered "yes" */}
      {question.questionType === 'yes_no' && 
       (currentAnswer === 'yes' || currentAnswer === 'Yes' || currentAnswer === '1') &&
       question.children && 
       question.children.length > 0 && (
        <div style={{ marginTop: '20px', paddingLeft: '20px', borderLeft: '4px solid #667eea' }}>
          {question.children.map((child, childIndex) => {
            const childAnswerKey = child.questionCode || `q_${child.id}`
            return (
              <div key={childAnswerKey} className="question-group" style={{ marginBottom: '20px' }}>
                <label className="question-label">
                  {child.questionText}
                  {child.isRequired && <span className="required">*</span>}
                </label>
                <QuestionInput
                  question={{ ...child, questionCode: childAnswerKey }}
                  value={formData.answers?.[childAnswerKey] || ''}
                  onChange={onChange}
                  formData={formData}
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="form-actions" style={{ marginTop: '30px', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onPrevious}
          className="reset-btn"
          disabled={questionNumber === 1}
          style={{ opacity: questionNumber === 1 ? 0.5 : 1 }}
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="submit-btn"
          disabled={question.isRequired && !currentAnswer}
        >
          {isLastQuestion ? '📋 Review & Submit' : '💾 Save & Next →'}
        </button>
      </div>
    </section>
  )
}

export default SingleQuestionView
