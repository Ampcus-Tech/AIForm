import React from 'react'
import { SafeDescriptionHtml } from '../common/RichTextEditor'
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
          {question.questionNumber}. <SafeDescriptionHtml as="span" html={question.questionText} />
          {question.isRequired && <span className="required">*</span>}
        </label>
        {question.helpText && (
          <SafeDescriptionHtml
            html={question.helpText}
            className="question-help"
            style={{ marginBottom: '15px', color: '#666' }}
          />
        )}
        
        <QuestionInput
          question={{ ...question, questionCode: answerKey }}
          value={currentAnswer}
          onChange={onChange}
          formData={formData}
        />
      </div>

      {/* Show child questions: for yes_no filter by show_when (Yes/No/Any); for text/other types always show children */}
      {question.children && question.children.length > 0 && (() => {
        const isYesNo = question.questionType === 'yes_no'
        const v = String(currentAnswer || '').toLowerCase().trim()
        const isYes = v === 'yes' || v === '1' || v === 'true'
        const isNo = v === 'no' || v === '0' || v === 'false'
        const parentShowWhen = question.options?.show_children_when || question.options?.showChildrenWhen || 'yes'
        const visibleChildren = isYesNo
          ? question.children.filter(child => {
              const raw = child.options?.show_when ?? child.options?.showWhen ?? parentShowWhen
              const showWhen = typeof raw === 'string' ? raw.toLowerCase().trim() : 'any'
              if (!showWhen || showWhen === 'any') return true
              if (showWhen === 'yes') return isYes
              if (showWhen === 'no') return isNo
              return false
            })
          : question.children
        if (visibleChildren.length === 0) return null
        return (
          <div style={{ marginTop: '20px', paddingLeft: '20px', borderLeft: '4px solid #667eea' }}>
            {visibleChildren.map((child, childIndex) => {
              const childAnswerKey =
                child.questionCode ||
                child.question_code ||
                child.answerKey ||
                child.code ||
                `q_${child.id}`
              return (
                <div key={childAnswerKey} className="question-group" style={{ marginBottom: '20px' }}>
                  <label className="question-label">
                    <SafeDescriptionHtml as="span" html={child.questionText} />
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
        )
      })()}

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
