import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { assessmentAPI } from '../services/api'
import '../styles.css'

function AssessmentResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assessment, setAssessment] = useState(null)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    loadAssessment()
  }, [id])

  const loadAssessment = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await assessmentAPI.getById(id, 'detailed')
      
      if (response.success) {
        setAssessment(response.assessment)
        setSummary(response.summary || response.formatted)
      } else {
        setError(response.error || 'Failed to load assessment')
      }
    } catch (err) {
      console.error('Error loading assessment:', err)
      setError(err.message || 'Failed to load assessment results')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString
    }
  }

  const formatAnswer = (value, questionType) => {
    if (!value || value === '') return 'No answer provided'
    
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          return parsed.join(', ')
        }
        if (typeof parsed === 'object') {
          return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ')
        }
        return String(parsed)
      } catch (e) {
        // Not valid JSON, return as is
      }
    }
    
    return String(value)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '1.1em' }}>Loading assessment results...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            fontSize: '3em',
            marginBottom: '20px'
          }}>❌</div>
          <h2 style={{ color: '#e53e3e', marginBottom: '15px' }}>Error Loading Assessment</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                fontSize: '1em',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
            <button
              onClick={loadAssessment}
              style={{
                padding: '12px 24px',
                fontSize: '1em',
                fontWeight: '600',
                color: '#667eea',
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return null
  }

  const dynamicAnswers = assessment.dynamicAnswers || assessment.dynamic_answers || []
  const answersByCategory = {}
  
  dynamicAnswers.forEach(answer => {
    const categoryName = answer.categoryName || answer.category_name || 'General'
    if (!answersByCategory[categoryName]) {
      answersByCategory[categoryName] = []
    }
    answersByCategory[categoryName].push(answer)
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5em',
              margin: '0 0 10px 0',
              color: '#333',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📊 Assessment Results
            </h1>
            <p style={{ color: '#666', margin: '0' }}>
              Assessment ID: <strong>#{assessment.id}</strong>
            </p>
          </div>
          <Link
            to="/"
            style={{
              padding: '12px 24px',
              fontSize: '1em',
              fontWeight: '600',
              color: '#667eea',
              background: 'white',
              border: '2px solid #667eea',
              borderRadius: '10px',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f8f9ff'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            🏠 Home
          </Link>
        </div>

        {/* Assessment Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            background: '#f8f9ff',
            borderRadius: '10px',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Contact Name</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#333' }}>
              {assessment.contact_name || assessment.user_name || 'Anonymous'}
            </div>
          </div>
          <div style={{
            padding: '20px',
            background: '#f8f9ff',
            borderRadius: '10px',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Email</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#333' }}>
              {assessment.contact_email || assessment.user_email || 'N/A'}
            </div>
          </div>
          <div style={{
            padding: '20px',
            background: '#f8f9ff',
            borderRadius: '10px',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Company</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#333' }}>
              {assessment.company_name || 'N/A'}
            </div>
          </div>
          <div style={{
            padding: '20px',
            background: '#f8f9ff',
            borderRadius: '10px',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Submitted At</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#333' }}>
              {formatDate(assessment.submitted_at || assessment.created_at)}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {summary && summary.overallScore !== undefined && (
          <div style={{
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            color: 'white',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.8em' }}>Overall Score</h2>
            <div style={{
              fontSize: '4em',
              fontWeight: '700',
              marginBottom: '10px'
            }}>
              {summary.overallScore || 0}%
            </div>
            {summary.readinessLevel && (
              <div style={{
                fontSize: '1.3em',
                opacity: 0.9
              }}>
                {summary.readinessLevel}
              </div>
            )}
          </div>
        )}

        {/* Answers by Category */}
        <div>
          <h2 style={{
            fontSize: '2em',
            margin: '0 0 30px 0',
            color: '#333'
          }}>
            Your Answers
          </h2>

          {Object.keys(answersByCategory).length > 0 ? (
            Object.keys(answersByCategory).map((categoryName, index) => {
              const categoryAnswers = answersByCategory[categoryName]
              return (
                <div
                  key={categoryName}
                  style={{
                    marginBottom: '30px',
                    padding: '30px',
                    background: '#f8f9ff',
                    borderRadius: '15px',
                    border: '2px solid #e0e7ff'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.5em',
                    margin: '0 0 20px 0',
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{
                      background: '#667eea',
                      color: 'white',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8em',
                      fontWeight: '600'
                    }}>
                      {index + 1}
                    </span>
                    {categoryName}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(() => {
                      // Build a hierarchical structure of questions with parent-child relationships
                      const buildQuestionHierarchy = (answers) => {
                        const questionMap = {}
                        const rootQuestions = []
                        
                        // First pass: create map of all questions by questionCode only
                        answers.forEach(answer => {
                          if (!answer.questionCode) {
                            console.warn('⚠️ Answer missing questionCode:', answer)
                            return
                          }
                          const questionData = {
                            ...answer,
                            children: [],
                            parentId: answer.parent_id || answer.parentId,
                            id: answer.id,
                            hasChildren: false // Will be determined in second pass
                          }
                          // Store by questionCode (primary key)
                          questionMap[answer.questionCode] = questionData
                        })
                        
                        console.log('📋 Question map created:', Object.keys(questionMap).length, 'questions')
                        
                        // Second pass: build hierarchy and determine hasChildren
                        Object.values(questionMap).forEach(q => {
                          if (!q.questionCode) return
                          
                          // Check if this question has children
                          const hasChildren = Object.values(questionMap).some(child => {
                            if (!child.parentId || child === q || !child.questionCode) return false
                            // Match by ID (most reliable)
                            if (q.id && child.parentId === q.id) return true
                            // Match by questionCode as fallback
                            if (child.parentId === q.questionCode) return true
                            return false
                          })
                          q.hasChildren = hasChildren
                          
                          if (!q.parentId) {
                            rootQuestions.push(q)
                          } else {
                            // Find parent by ID first, then by questionCode
                            const parent = Object.values(questionMap).find(p => {
                              if (!p.questionCode || p === q) return false
                              // Match by ID (most reliable)
                              if (p.id && q.parentId === p.id) return true
                              // Match by questionCode as fallback
                              if (q.parentId === p.questionCode) return true
                              return false
                            })
                            if (parent) {
                              parent.children.push(q)
                            } else {
                              // Parent not in this category, treat as root
                              rootQuestions.push(q)
                            }
                          }
                        })
                        
                        console.log('📊 After hierarchy building:', {
                          totalInMap: Object.keys(questionMap).length,
                          rootQuestions: rootQuestions.length
                        })
                        
                        // Sort root questions and children by display_order
                        const sortByDisplayOrder = (questions) => {
                          return questions.sort((a, b) => {
                            const orderA = a.display_order !== null && a.display_order !== undefined ? a.display_order : Number.MAX_SAFE_INTEGER
                            const orderB = b.display_order !== null && b.display_order !== undefined ? b.display_order : Number.MAX_SAFE_INTEGER
                            if (orderA !== orderB) return orderA - orderB
                            return (a.questionCode || '').localeCompare(b.questionCode || '')
                          }).map(q => {
                            if (q.children && q.children.length > 0) {
                              q.children = sortByDisplayOrder(q.children)
                            }
                            return q
                          })
                        }
                        
                        return sortByDisplayOrder(rootQuestions)
                      }
                      
                      const hierarchicalQuestions = buildQuestionHierarchy(categoryAnswers)
                      
                      console.log('🔍 AssessmentResults - Category:', categoryName)
                      console.log('  Total answers:', categoryAnswers.length)
                      console.log('  Hierarchical questions:', hierarchicalQuestions.length)
                      console.log('  Root questions:', hierarchicalQuestions.map(q => q.questionCode || q.question_text))
                      
                      // Fallback: if hierarchy building returns empty, show all questions as flat list
                      if (!hierarchicalQuestions || hierarchicalQuestions.length === 0) {
                        console.warn('⚠️ Hierarchy building returned empty, showing flat list for category:', categoryName)
                        console.log('  Category answers:', categoryAnswers)
                        return categoryAnswers.map((answer, answerIndex) => {
                          const questionText = answer.questionText || answer.question_text || `Question ${answer.questionCode}`
                          const answerValue = formatAnswer(
                            answer.answer_value || answer.answerValue || answer.answer,
                            answer.questionType || answer.question_type
                          )
                          
                          return (
                            <div
                              key={answer.questionCode || answerIndex}
                              style={{
                                padding: '20px',
                                background: 'white',
                                borderRadius: '10px',
                                border: '1px solid #e0e0e0',
                                marginBottom: '20px'
                              }}
                            >
                              <div style={{
                                fontSize: '1.1em',
                                fontWeight: '600',
                                color: '#333',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <span style={{ color: '#667eea', minWidth: '30px' }}>
                                  Q{answerIndex + 1}:
                                </span>
                                <span>{questionText}</span>
                              </div>
                              <div style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                color: '#333',
                                borderLeft: '4px solid #667eea'
                              }}>
                                <strong style={{ color: '#667eea' }}>Answer:</strong> {answerValue}
                              </div>
                            </div>
                          )
                        })
                      }
                      
                      let parentQuestionCounter = 0 // Only count parent questions
                      
                      // Recursive function to render questions with their children (similar to submission page)
                      const renderQuestionWithChildren = (questionData, level = 0) => {
                        const isChild = level > 0
                        const questionText = questionData.questionText || questionData.question_text || `Question ${questionData.questionCode}`
                        const answerValue = formatAnswer(
                          questionData.answer_value || questionData.answerValue || questionData.answer,
                          questionData.questionType || questionData.question_type
                        )
                        
                        // Only increment counter for parent questions
                        if (!isChild) {
                          parentQuestionCounter++
                        }
                        
                        return (
                          <React.Fragment key={questionData.questionCode}>
                            <div
                              className="question-group"
                              style={{
                                padding: level === 0 ? '20px' : '15px',
                                background: isChild ? (level === 1 ? '#f8f9ff' : '#f0fff4') : 'white',
                                borderRadius: '10px',
                                border: level === 0 ? '1px solid #e0e0e0' : `3px solid ${level === 1 ? '#667eea' : '#48bb78'}`,
                                marginLeft: level > 0 ? `${level * 20}px` : '0',
                                marginTop: level > 0 ? '15px' : '0',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.15)'
                                e.currentTarget.style.borderColor = isChild ? (level === 1 ? '#667eea' : '#48bb78') : '#667eea'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none'
                                e.currentTarget.style.borderColor = isChild ? (level === 1 ? '#667eea' : '#48bb78') : (level === 0 ? '#e0e0e0' : (level === 1 ? '#667eea' : '#48bb78'))
                              }}
                            >
                              <div style={{
                                fontSize: level === 0 ? '1.1em' : (level === 1 ? '1em' : '0.95em'),
                                fontWeight: '600',
                                color: '#333',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flexWrap: 'wrap'
                              }}>
                                {!isChild && (
                                  <span style={{
                                    color: '#667eea',
                                    minWidth: '30px'
                                  }}>
                                    Q{parentQuestionCounter}:
                                  </span>
                                )}
                                {isChild && (
                                  <span style={{
                                    color: level === 1 ? '#667eea' : '#48bb78',
                                    fontSize: '0.9em',
                                    marginRight: '5px'
                                  }}>
                                    └
                                  </span>
                                )}
                                {!isChild && questionData.hasChildren && (
                                  <span style={{
                                    padding: '2px 8px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontSize: '0.7em',
                                    fontWeight: '600'
                                  }}>
                                    Parent
                                  </span>
                                )}
                                <span>{questionText}</span>
                              </div>
                              <div style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                color: '#333',
                                borderLeft: `4px solid ${isChild ? (level === 1 ? '#667eea' : '#48bb78') : '#667eea'}`
                              }}>
                                <strong style={{ color: isChild ? (level === 1 ? '#667eea' : '#48bb78') : '#667eea' }}>Answer:</strong> {answerValue}
                              </div>
                            </div>
                            {/* Recursively render children inline (similar to submission page) */}
                            {questionData.children && questionData.children.length > 0 && (
                              <div style={{ marginTop: '15px' }}>
                                {questionData.children.map(child => renderQuestionWithChildren(child, level + 1))}
                              </div>
                            )}
                          </React.Fragment>
                        )
                      }
                      
                      return hierarchicalQuestions.map(q => renderQuestionWithChildren(q, 0))
                    })()}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '15px',
              color: '#666'
            }}>
              <p style={{ fontSize: '1.2em' }}>No answers found for this assessment.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '2px solid #e0e0e0',
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 32px',
              fontSize: '1.1em',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            📝 Start New Assessment
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentResults
