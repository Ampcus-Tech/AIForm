import React from 'react'
import { Link } from 'react-router-dom'

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
              <p className="subtitle">
                {selectedAssessmentType.description}
              </p>
            )}
          </>
        )}
      </header>

      <div className="form-section" style={{ marginTop: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📋 Review Your Answers</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Please review all your answers before final submission. You can go back to edit any question.
        </p>

        {allQuestionsList.map((question, index) => {
          const answerKey = question.answerKey
          const answer = formData.answers[answerKey] || ''
          const displayAnswer = answer === '' || answer === null || answer === undefined
            ? 'Not answered'
            : String(answer)

          return (
            <div key={answerKey || index} className="question-group" style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              background: '#f8f9ff', 
              borderRadius: '8px',
              border: '1px solid #e0e7ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#667eea', fontSize: '1.1em' }}>
                    Question {question.questionNumber}: {question.questionText}
                  </strong>
                  {question.categoryName && (
                    <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#999' }}>
                      Category: {question.categoryName}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onEditQuestion(index)}
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
              </div>
              <div style={{ 
                padding: '15px', 
                background: 'white', 
                borderRadius: '6px',
                border: '1px solid #ddd',
                marginTop: '10px'
              }}>
                <strong>Answer:</strong> {displayAnswer}
              </div>
            </div>
          )
        })}

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
