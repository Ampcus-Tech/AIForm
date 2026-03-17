import React from 'react'
import { Link } from 'react-router-dom'
import { SafeDescriptionHtml } from '../common/RichTextEditor'

/**
 * Preview page component showing all answers before final submission
 */
function AssessmentPreview({ 
  allQuestionsList, 
  formData, 
  selectedAssessmentType,
  onEditQuestion,
  onBackToLast,
  onSubmit,
  submitting 
}) {
  const getChildKey = (q) => q?.questionCode || q?.question_code || q?.code || (q?.id ? `q_${q.id}` : undefined)

  const shouldShowChildren = (question, answerValue) => {
    if (!question?.children || question.children.length === 0) return false
    const type = question.questionType
    const v = String(answerValue || '').toLowerCase().trim()
    const answeredYes = v === 'yes' || v === '1' || v === 'true'

    if (type === 'yes_no') return answeredYes
    if (type === 'group') return true
    return true
  }

  const renderQuestionTree = (question, { level, parentAnswerKey, parentAnswerValue, topIndex }) => {
    const isTopLevel = level === 0
    const answerKey = isTopLevel ? question.answerKey : getChildKey(question)
    if (!answerKey) return null

    const answer = formData.answers?.[answerKey] ?? ''
    const displayAnswer =
      answer === '' || answer === null || answer === undefined ? 'Not answered' : String(answer)

    const showKids = shouldShowChildren(question, answer)

    return (
      <div
        key={`${answerKey}-${level}`}
        className="question-group"
        style={{
          marginBottom: level === 0 ? '25px' : '15px',
          padding: level === 0 ? '20px' : '15px',
          background: level === 0 ? '#f8f9ff' : '#ffffff',
          borderRadius: '8px',
          border: level === 0 ? '1px solid #e0e7ff' : `2px solid ${level === 1 ? '#667eea' : '#48bb78'}`,
          marginLeft: level > 0 ? `${level * 18}px` : '0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <strong style={{ color: level === 0 ? '#667eea' : (level === 1 ? '#667eea' : '#48bb78'), fontSize: level === 0 ? '1.1em' : '1em' }}>
              {isTopLevel ? `Question ${question.questionNumber}: ` : '↳ '}
              {question.questionText || question.question_text}
            </strong>
            {isTopLevel && question.categoryName && (
              <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#999' }}>
                Category: {question.categoryName}
              </p>
            )}
          </div>

          {isTopLevel && (
            <button
              type="button"
              onClick={() => onEditQuestion(topIndex)}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: '600'
              }}
            >
              ✏️ Edit
            </button>
          )}
        </div>

        <div
          style={{
            padding: '15px',
            background: 'white',
            borderRadius: '6px',
            border: '1px solid #ddd',
            marginTop: '10px'
          }}
        >
          <strong>Answer:</strong> {displayAnswer}
        </div>

        {showKids && (
          <div style={{ marginTop: '14px' }}>
            {question.children.map((child) =>
              renderQuestionTree(child, {
                level: level + 1,
                parentAnswerKey: answerKey,
                parentAnswerValue: answer,
                topIndex
              })
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ padding: '15px 20px', textAlign: 'right', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
        <Link
          to="/login"
          style={{
            padding: '8px 20px',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            display: 'inline-block',
            fontSize: '0.9em',
          }}
        >
          🔐 Admin Login
        </Link>
      </div>
      
      <header>
        <h1>SBEAMP</h1>
        {selectedAssessmentType && (
          <>
            <h2 style={{ fontSize: '1.5em', marginTop: '10px', fontWeight: '500' }}>
              {selectedAssessmentType.icon || '📝'} {selectedAssessmentType.name}
            </h2>
            {selectedAssessmentType.description && (
              <SafeDescriptionHtml html={selectedAssessmentType.description} className="subtitle" />
            )}
          </>
        )}
      </header>

      <div className="form-section" style={{ marginTop: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📋 Review Your Answers</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Please review all your answers before final submission. You can go back to edit any question.
        </p>

        {allQuestionsList.map((question, index) =>
          renderQuestionTree(question, {
            level: 0,
            parentAnswerKey: null,
            parentAnswerValue: null,
            topIndex: index
          })
        )}

        {/* Contact Information Preview */}
        <div className="question-group" style={{ 
          marginTop: '30px',
          marginBottom: '25px', 
          padding: '20px', 
          background: '#f8f9ff', 
          borderRadius: '8px',
          border: '1px solid #e0e7ff'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '15px' }}>Contact Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Name:</strong> {formData.contact_name || 'Not provided'}
            </div>
            <div>
              <strong>Email:</strong> {formData.contact_email || 'Not provided'}
            </div>
            <div>
              <strong>Company:</strong> {formData.company_name || 'Not provided'}
            </div>
            <div>
              <strong>Title:</strong> {formData.contact_title || 'Not provided'}
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '30px' }}>
          <button
            type="button"
            onClick={onBackToLast}
            className="reset-btn"
            style={{ marginRight: '10px' }}
          >
            ← Back to Last Question
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : '✅ Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentPreview
