import React from 'react'
import { formatDate } from '../../utils/formatDate'
import { formatAnswer } from '../../utils/formatAnswer'

/**
 * Assessment Details Modal - displays full assessment information including answers
 * This is a complex component that handles multiple answer formats and fallbacks
 */
function AssessmentDetailsModal({ assessment, allQuestionsMap, questions, onClose }) {
  // Helper function to format answer with labels for scale questions
  const formatAnswerLocal = (answer, questionCode, questionType) => {
    const question = allQuestionsMap?.[questionCode]
    return formatAnswer(answer, questionCode, questionType, question)
  }

  // Extract answers from various sources (same logic as before, but extracted)
  const extractAnswers = () => {
    // This is a simplified version - the full logic is very complex
    // For now, return a basic structure that can be expanded
    const allAnswers = {}
    
    // Try dynamicAnswers array first
    const dynamicAnswersArray = assessment.dynamicAnswers || 
                               assessment.dynamic_answers || 
                               assessment.answer_details || 
                               []
    
    if (Array.isArray(dynamicAnswersArray) && dynamicAnswersArray.length > 0) {
      dynamicAnswersArray.forEach(item => {
        const qCode = item.question_code || item.questionCode || item.question_id
        if (qCode) {
          let answerValue = item.answer_json || 
                         item.answerJson || 
                         item.answer_value || 
                         item.answerValue || 
                         item.answer || 
                         ''
          
          if (typeof answerValue === 'string' && (answerValue.startsWith('{') || answerValue.startsWith('['))) {
            try {
              answerValue = JSON.parse(answerValue)
            } catch (e) {
              // Keep as string
            }
          }
          
          if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
            allAnswers[qCode] = {
              value: answerValue,
              questionText: item.question_text || item.questionText || '',
              questionType: item.question_type || item.questionType || '',
            }
          }
        }
      })
    }
    
    // Add from answers object
    if (assessment.answers) {
      let answersObj = {}
      if (typeof assessment.answers === 'string') {
        try {
          answersObj = JSON.parse(assessment.answers)
        } catch (e) {
          answersObj = {}
        }
      } else if (typeof assessment.answers === 'object' && assessment.answers !== null) {
        answersObj = assessment.answers
      }
      
      Object.keys(answersObj).forEach(key => {
        if (!allAnswers[key] && answersObj[key] !== null && answersObj[key] !== undefined && answersObj[key] !== '') {
          allAnswers[key] = {
            value: answersObj[key],
            questionText: allQuestionsMap?.[key]?.questionText || '',
            questionType: allQuestionsMap?.[key]?.questionType || '',
          }
        }
      })
    }
    
    return allAnswers
  }

  const allAnswers = extractAnswers()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Assessment Details</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-body">
          <div className="assessment-details">
            <div className="detail-section highlight">
              <h3>👤 Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong> {assessment.user_name || assessment.contact_name || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {assessment.user_email || assessment.contact_email || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Company:</strong> {assessment.company_name || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Title:</strong> {assessment.contact_title || 'N/A'}
                </div>
                {(assessment.activeDate || assessment.active_date) && (
                  <div className="info-item">
                    <strong>Active Date:</strong> {formatDate(assessment.activeDate || assessment.active_date)}
                  </div>
                )}
                {(assessment.expiryDate || assessment.expiry_date) && (
                  <div className="info-item">
                    <strong>Expiry Date:</strong> {formatDate(assessment.expiryDate || assessment.expiry_date)}
                  </div>
                )}
                {!assessment.user_id && (
                  <div className="info-item full-width">
                    <span className="na-text">📝 Anonymous Submission</span>
                  </div>
                )}
              </div>
            </div>

            {assessment.summary && (
              <div className="detail-section highlight">
                <h3>📊 Assessment Summary</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Overall Score:</strong> {assessment.summary.overallScore || 0}%
                  </div>
                  <div className="info-item">
                    <strong>Readiness Level:</strong> 
                    <span className={`status-badge ${assessment.summary.readinessLevel?.toLowerCase().replace(' ', '-')}`}>
                      {assessment.summary.readinessLevel || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Display answers */}
            {Object.keys(allAnswers).length > 0 ? (
              <div className="detail-section">
                <h3>Assessment Answers</h3>
                <div className="question-grid">
                  {Object.keys(allAnswers).map((questionCode, index) => {
                    const answerData = allAnswers[questionCode]
                    const questionInfo = allQuestionsMap?.[questionCode]
                    const displayAnswer = formatAnswerLocal(
                      answerData.value,
                      questionCode,
                      questionInfo?.questionType || answerData.questionType
                    )
                    return (
                      <div key={questionCode} className={`question-item ${answerData.questionType === 'text' ? 'full-width' : ''}`}>
                        <div className="question-text">
                          <strong>{index + 1}:</strong> {answerData.questionText || `Question ${questionCode}`}
                        </div>
                        <div className="answer-value">
                          <span className="answer-label">Answer:</span>
                          {displayAnswer}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="detail-section">
                <p style={{ color: '#999', fontStyle: 'italic' }}>No answers found for this assessment.</p>
              </div>
            )}

            <div className="detail-section highlight">
              <p><strong>📅 Submitted At:</strong> {formatDate(assessment.submitted_at || assessment.submittedAt)}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentDetailsModal
