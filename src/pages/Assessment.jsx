import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assessmentAPI, questionsAPI, assessmentTypesAPI } from '../services/api'
import QuestionInput from '../components/assessment/QuestionInput'
import SingleQuestionView from '../components/assessment/SingleQuestionView'
import AssessmentPreview from '../components/assessment/AssessmentPreview'
import Dropdown from '../components/common/Dropdown'
import '../styles.css'

function Assessment() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [assessmentTypes, setAssessmentTypes] = useState([])
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(null)
  const [formData, setFormData] = useState({
    answers: {},
    contact_name: '',
    contact_email: '',
    company_name: '',
    contact_title: '',
    assessment_type_id: null,
  })
  // Single question mode states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false) // New state for contact info step
  const [allQuestionsList, setAllQuestionsList] = useState([]) // Flattened list of all questions

  const { assessmentTypeSlug } = useParams()

  // Load assessment types and questions on component mount
  useEffect(() => {
    loadAssessmentTypes()
  }, [])

  useEffect(() => {
    if (assessmentTypes.length > 0) {
      // If URL has assessment type slug, use it; otherwise use first available
      if (assessmentTypeSlug) {
        const type = assessmentTypes.find(t => t.slug === assessmentTypeSlug && t.is_active !== false)
        if (type) {
          setSelectedAssessmentType(type)
          setFormData(prev => ({ ...prev, assessment_type_id: type.id }))
          loadQuestions(type.id)
        }
      } else if (!selectedAssessmentType) {
        // Auto-select the first active type (default)
        const defaultType = assessmentTypes[0]
        setSelectedAssessmentType(defaultType)
        setFormData(prev => ({ ...prev, assessment_type_id: defaultType.id }))
        loadQuestions(defaultType.id)
      }
      // If multiple active types, dropdown will be shown and user can change selection
    }
  }, [assessmentTypes, assessmentTypeSlug])

  const loadAssessmentTypes = async () => {
    try {
      const response = await assessmentTypesAPI.getAll()
      if (response && response.success && response.assessmentTypes) {
        // Filter to only active assessment types for users
        const activeTypes = response.assessmentTypes.filter(type => type.is_active !== false)
        setAssessmentTypes(activeTypes)
        
        // Always auto-select the first active type (if any exist)
        if (activeTypes.length > 0 && !selectedAssessmentType) {
          const firstType = activeTypes[0]
          setSelectedAssessmentType(firstType)
          setFormData(prev => ({ ...prev, assessment_type_id: firstType.id }))
          loadQuestions(firstType.id)
        }
      }
    } catch (err) {
      console.error('Error loading assessment types:', err)
      // Continue with default behavior if types fail to load
    }
  }

  const loadQuestions = async (assessmentTypeId = null) => {
    try {
      setLoading(true)
      setError('')
      
      let response
      if (assessmentTypeId) {
        // Load questions for specific assessment type
        const typeResponse = await assessmentTypesAPI.getById(assessmentTypeId)
        if (typeResponse && typeResponse.success && typeResponse.assessmentType) {
          // Transform the response to match the expected format
          response = {
            success: true,
            categories: typeResponse.assessmentType.categories || []
          }
        } else {
          // Fallback to all questions
          response = await questionsAPI.getAllQuestions()
        }
      } else {
        // Load all questions (legacy behavior)
        response = await questionsAPI.getAllQuestions()
      }
      
      if (response && response.success && response.categories) {
        // Debug: Log the response structure
        console.log('📊 API Response received:', {
          categoriesCount: response.categories.length,
          firstCategory: response.categories[0] ? {
            name: response.categories[0].name,
            questionsCount: response.categories[0].questions?.length || 0,
            firstQuestion: response.categories[0].questions?.[0] ? {
              questionCode: response.categories[0].questions[0].questionCode,
              questionText: response.categories[0].questions[0].questionText?.substring(0, 50),
              questionType: response.categories[0].questions[0].questionType,
              hasQuestionText: !!response.categories[0].questions[0].questionText,
              hasQuestionCode: !!response.categories[0].questions[0].questionCode
            } : null
          } : null
        })
        
        setCategories(response.categories)
        
        // Flatten all questions into a single list for single question mode
        const flattenedQuestions = []
        let questionNumber = 1
        
        response.categories.forEach(category => {
          if (category.questions && Array.isArray(category.questions)) {
            category.questions.forEach(question => {
              // Skip group questions (they don't have answers themselves)
              if (question.questionType !== 'group') {
                flattenedQuestions.push({
                  ...question,
                  questionNumber: questionNumber++,
                  categoryName: category.name,
                  categoryId: category.id,
                  answerKey: question.questionCode || `q_${question.id}`
                })
              }
              
              // Add child questions if they exist
              if (question.children && Array.isArray(question.children) && question.children.length > 0) {
                question.children.forEach(child => {
                  flattenedQuestions.push({
                    ...child,
                    questionNumber: questionNumber++,
                    categoryName: category.name,
                    categoryId: category.id,
                    parentQuestion: question,
                    answerKey: child.questionCode || `q_${child.id}`
                  })
                })
              }
            })
          }
        })
        
        setAllQuestionsList(flattenedQuestions)
        
        // Reset single question mode state when questions are loaded
        setCurrentQuestionIndex(0)
        setShowPreview(false)
        setShowContactInfo(false)
        
        // Initialize form data with empty answers for all questions
        const initialAnswers = {}
        let questionCount = 0
        let questionCodesFound = []
        
        flattenedQuestions.forEach(question => {
          const answerKey = question.answerKey
          if (answerKey) {
            initialAnswers[answerKey] = ''
            questionCount++
            questionCodesFound.push(answerKey)
          }
        })
        
        console.log('✅ Questions loaded:', questionCount, 'total questions with codes')
        console.log('📝 Question codes:', questionCodesFound.slice(0, 10), questionCodesFound.length > 10 ? '...' : '')
        
        setFormData(prev => ({
          ...prev,
          answers: initialAnswers
        }))
      } else if (response && response.categories) {
        // Handle case where response doesn't have success field
        setCategories(response.categories)
      } else {
        throw new Error('Invalid response format from questions API')
      }
    } catch (err) {
      console.error('Error loading questions:', err)
      setError(err.message || 'Failed to load assessment questions. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const actualValue = type === 'checkbox' ? String(checked) : String(value)
    
    // Update the answer immediately
    setFormData((prev) => {
      const newAnswers = {
        ...prev.answers,
        [name]: actualValue,
      }
      
      // Clear child question answers when parent answer changes (for yes_no questions)
      // Use the current categories from state to find the question
      if (categories && categories.length > 0) {
        const category = categories.find(cat => 
          cat.questions && cat.questions.some(q => {
            const qCode = q.questionCode || `q_${q.id}`
            return qCode === name
          })
        )
        
        if (category) {
          // Flatten all questions including children to find the question
          const allQuestions = []
          category.questions.forEach(q => {
            allQuestions.push(q)
            if (q.children && q.children.length > 0) {
              allQuestions.push(...q.children)
            }
          })
          
          const question = allQuestions.find(q => {
            const qCode = q.questionCode || `q_${q.id}`
            return qCode === name
          })
          
          // If it's a yes_no question with children and answer is not "yes", clear children
          if (question && question.questionType === 'yes_no' && question.children && question.children.length > 0) {
            if (actualValue !== 'yes') {
              // Clear child answers when parent is not "yes"
              question.children.forEach(child => {
                const childCode = child.questionCode || `q_${child.id}`
                newAnswers[childCode] = ''
              })
            }
          }
        }
      }
      
      return {
        ...prev,
        answers: newAnswers
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Filter out empty answers before submission
      const filteredAnswers = {}
      Object.keys(formData.answers).forEach(key => {
        const value = formData.answers[key]
        // Only include non-empty answers
        if (value !== null && value !== undefined && value !== '' && String(value).trim() !== '') {
          filteredAnswers[key] = value
        }
      })
      
      console.log('=== ASSESSMENT SUBMISSION DEBUG ===')
      console.log('Total answers in formData:', Object.keys(formData.answers).length)
      console.log('Filtered answers (non-empty):', Object.keys(filteredAnswers).length)
      console.log('Filtered answers object:', filteredAnswers)
      console.log('Contact info:', {
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        company_name: formData.company_name,
        contact_title: formData.contact_title,
      })
      
      // Prepare submission data in dynamic format
      const submissionData = {
        answers: filteredAnswers,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        company_name: formData.company_name,
        contact_title: formData.contact_title,
        assessment_type_id: formData.assessment_type_id || selectedAssessmentType?.id || null,
      }
      
      console.log('Submitting data:', submissionData)
      console.log('Answers count:', Object.keys(filteredAnswers).length)

      const response = await assessmentAPI.submit(submissionData)
      console.log('Submission response:', response)
      if (response.success) {
        alert('Thank you for completing the assessment! Your responses have been recorded.')
        // Reset form
        const initialAnswers = {}
        categories.forEach(category => {
          category.questions.forEach(question => {
            if (!question.parentId) {
              initialAnswers[question.questionCode] = ''
              if (question.children && question.children.length > 0) {
                question.children.forEach(child => {
                  initialAnswers[child.questionCode] = ''
                })
              }
            }
          })
        })
        setFormData({
          answers: initialAnswers,
          contact_name: '',
          contact_email: '',
          company_name: '',
          contact_title: '',
        })
      } else {
        setError(response.error || 'There was an error submitting your assessment. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      setError(error.message || 'There was an error submitting your assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    const initialAnswers = {}
    categories.forEach(category => {
      if (category.questions && Array.isArray(category.questions)) {
        category.questions.forEach(question => {
          // Reset all questions (including group questions and children)
          if (question.questionCode) {
            initialAnswers[question.questionCode] = ''
          }
          if (question.children && Array.isArray(question.children) && question.children.length > 0) {
            question.children.forEach(child => {
              if (child.questionCode) {
                initialAnswers[child.questionCode] = ''
              }
            })
          }
        })
      }
    })
    setFormData({
      answers: initialAnswers,
      contact_name: '',
      contact_email: '',
      company_name: '',
      contact_title: '',
    })
  }

  // renderQuestionInput is now replaced by QuestionInput component

  // Render a single question
  const renderQuestion = (question, questionNumber) => {
    // Use questionCode if available, otherwise use question ID as fallback
    const questionCode = question.questionCode || `q_${question.id}`
    const value = formData.answers[questionCode]
    
    // For yes_no questions, check if we should show child questions
    const showChildren = question.questionType === 'yes_no' && value === 'yes' && question.children && question.children.length > 0

    return (
      <div key={question.id} className="question-group">
        <label className="question-label">
          {questionNumber}. {question.questionText}
          {question.isRequired && <span className="required">*</span>}
        </label>
        
        {question.helpText && (
          <p className="question-help">{question.helpText}</p>
        )}
        
        <QuestionInput
          question={question}
          value={formData.answers[questionCode]}
          onChange={handleChange}
          formData={formData}
        />
        
        {/* Render child questions if parent is answered "yes" */}
        {showChildren && (
          <div className="conditional-questions" style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #667eea' }}>
            {question.children.map((child, childIndex) => (
              <div key={child.id} className="question-group">
                <label className="question-label">
                  {child.questionText}
                  {child.isRequired && <span className="required">*</span>}
                </label>
                {child.helpText && (
                  <p className="question-help">{child.helpText}</p>
                )}
                <QuestionInput
                  question={child}
                  value={formData.answers[child.questionCode || `q_${child.id}`]}
                  onChange={handleChange}
                  formData={formData}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner"></div>
          <p>Loading assessment questions...</p>
        </div>
      </div>
    )
  }

  // Show message if no active assessment types
  if (assessmentTypes.length === 0 && !loading) {
    return (
      <div className="container">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>No Active Assessments</h2>
          <p style={{ color: '#666', fontSize: '1.1em', marginBottom: '30px' }}>
            There are currently no active assessment types available.
          </p>
          <p style={{ color: '#999', fontSize: '0.9em' }}>
            Please contact your administrator or check back later.
          </p>
        </div>
      </div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className="container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error Loading Assessment</h2>
          <p style={{ color: 'red', margin: '20px 0' }}>{error}</p>
          <button onClick={() => {
            if (selectedAssessmentType) {
              loadQuestions(selectedAssessmentType.id)
            } else {
              loadQuestions()
            }
          }} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Check if single question mode is enabled
  const isSingleQuestionMode = selectedAssessmentType?.settings?.singleQuestionMode || false
  
  // Calculate question numbers across all categories
  let questionNumber = 1

  // Handle Save and Next in single question mode
  const handleSaveAndNext = () => {
    if (currentQuestionIndex < allQuestionsList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Last question - go to contact information step
      setShowContactInfo(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle going back in single question mode
  const handlePrevious = () => {
    if (showContactInfo) {
      // Go back from contact info to last question
      setShowContactInfo(false)
      setCurrentQuestionIndex(allQuestionsList.length - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle going to preview from contact info
  const handleContactInfoNext = () => {
    // Validate required contact fields
    if (!formData.contact_name || !formData.contact_email || !formData.company_name) {
      alert('Please fill in all required contact information fields.')
      return
    }
    setShowContactInfo(false)
    setShowPreview(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle final submission from preview
  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(e)
  }

  // Render preview page
  if (showPreview && isSingleQuestionMode) {
    return (
      <AssessmentPreview
        allQuestionsList={allQuestionsList}
        formData={formData}
        selectedAssessmentType={selectedAssessmentType}
        onEditQuestion={(index) => {
          setShowPreview(false)
          setShowContactInfo(false)
          setCurrentQuestionIndex(index)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onBackToLast={() => {
          setShowPreview(false)
          setShowContactInfo(true)
        }}
        onSubmit={handleFinalSubmit}
        submitting={submitting}
      />
    )
  }

  // Render contact information step
  if (showContactInfo && isSingleQuestionMode) {
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
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', fontSize: '1.1em', fontWeight: '600' }}>
              Contact Information
            </p>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(255, 255, 255, 0.3)', 
              borderRadius: '4px',
              marginTop: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'white',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </header>

        <form id="assessmentForm">
          <section className="form-section">
            <h2 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#667eea' }}>
              Contact Information
            </h2>
            <p style={{ marginBottom: '25px', color: '#666', fontSize: '1em' }}>
              Please provide your contact details to complete the assessment.
            </p>
            
            <div className="question-group">
              <label className="question-label">
                Your Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                required
                style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div className="question-group">
              <label className="question-label">
                Your Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                required
                style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div className="question-group">
              <label className="question-label">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                required
                style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div className="question-group">
              <label className="question-label">Your Title/Role</label>
              <input
                type="text"
                name="contact_title"
                value={formData.contact_title}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_title: e.target.value }))}
                style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-actions" style={{ marginTop: '30px', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={handlePrevious}
                className="reset-btn"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={handleContactInfoNext}
                className="submit-btn"
                disabled={!formData.contact_name || !formData.contact_email || !formData.company_name}
              >
                📋 Review & Submit →
              </button>
            </div>
          </section>
        </form>
      </div>
    )
  }

  // Render single question mode
  if (isSingleQuestionMode && allQuestionsList.length > 0 && !showPreview && !showContactInfo) {
    const currentQuestion = allQuestionsList[currentQuestionIndex]
    const answerKey = currentQuestion.answerKey
    const currentAnswer = formData.answers[answerKey] || ''
    const isLastQuestion = currentQuestionIndex === allQuestionsList.length - 1

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
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', fontSize: '1.1em', fontWeight: '600' }}>
              Question {currentQuestionIndex + 1} of {allQuestionsList.length}
            </p>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(255, 255, 255, 0.3)', 
              borderRadius: '4px',
              marginTop: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentQuestionIndex + 1) / allQuestionsList.length) * 100}%`,
                height: '100%',
                background: 'white',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </header>

        <form id="assessmentForm">
          <section className="form-section">
            {currentQuestion.categoryName && (
              <h2 style={{ fontSize: '1em', color: '#667eea', marginBottom: '15px' }}>
                Category: {currentQuestion.categoryName}
              </h2>
            )}
            
            <div className="question-group">
              <label className="question-label" style={{ fontSize: '1.2em', marginBottom: '20px' }}>
                {currentQuestion.questionNumber}. {currentQuestion.questionText}
                {currentQuestion.isRequired && <span className="required">*</span>}
              </label>
              {currentQuestion.helpText && (
                <p className="question-help" style={{ marginBottom: '15px', color: '#666' }}>
                  {currentQuestion.helpText}
                </p>
              )}
              
              <QuestionInput
                question={{ ...currentQuestion, questionCode: answerKey }}
                value={formData.answers[answerKey]}
                onChange={handleChange}
                formData={formData}
              />
            </div>

            {/* Show child questions if parent is yes_no and answered "yes" */}
            {currentQuestion.questionType === 'yes_no' && 
             (currentAnswer === 'yes' || currentAnswer === 'Yes' || currentAnswer === '1') &&
             currentQuestion.children && 
             currentQuestion.children.length > 0 && (
              <div style={{ marginTop: '20px', paddingLeft: '20px', borderLeft: '4px solid #667eea' }}>
                {currentQuestion.children.map((child, childIndex) => {
                  const childAnswerKey = child.questionCode || `q_${child.id}`
                  return (
                    <div key={childAnswerKey} className="question-group" style={{ marginBottom: '20px' }}>
                      <label className="question-label">
                        {child.questionText}
                        {child.isRequired && <span className="required">*</span>}
                      </label>
                      <QuestionInput
                        question={{ ...child, questionCode: childAnswerKey }}
                        value={formData.answers[childAnswerKey]}
                        onChange={handleChange}
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
                onClick={handlePrevious}
                className="reset-btn"
                disabled={currentQuestionIndex === 0}
                style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="submit-btn"
                disabled={currentQuestion.isRequired && !currentAnswer}
              >
                {isLastQuestion ? '💾 Save & Next →' : '💾 Save & Next →'}
              </button>
            </div>
          </section>
        </form>
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
        {selectedAssessmentType ? (
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
        ) : (
          <>
            <h2 style={{ fontSize: '1.5em', marginTop: '10px', fontWeight: '500' }}>
              AI Adoption Readiness Assessment
            </h2>
            <p className="subtitle">
              Please complete all sections to help us understand your organization's readiness for AI transformation
            </p>
          </>
        )}
        
        {assessmentTypes.length > 1 && (
          <div className="assessment-type-selector" style={{ marginTop: '20px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'white' }}>
              Select Assessment Type:
            </label>
            <Dropdown
              value={selectedAssessmentType?.id || ''}
              onChange={(typeId) => {
                const type = assessmentTypes.find(t => t.id === typeId)
                if (type) {
                  setSelectedAssessmentType(type)
                  setFormData(prev => ({ ...prev, assessment_type_id: type.id }))
                  loadQuestions(type.id)
                }
              }}
              options={assessmentTypes
                .filter(type => type.is_active !== false)
                .map(type => ({
                  value: type.id,
                  label: type.name,
                  icon: type.icon || '📝'
                }))}
              placeholder="Select Assessment Type..."
            />
            <p style={{ marginTop: '8px', fontSize: '0.85em', color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
              Default: {selectedAssessmentType?.name || 'First available type'} (you can change this)
            </p>
          </div>
        )}
        
        {assessmentTypes.length === 0 && !loading && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '1.1em' }}>
              ⚠️ No active assessment types available. Please contact administrator.
            </p>
          </div>
        )}
      </header>

      {error && (
        <div className="error-message" style={{ margin: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '5px' }}>
          ⚠️ {error}
        </div>
      )}

      <form id="assessmentForm" onSubmit={handleSubmit}>
        {categories.map((category) => {
          // Filter out group questions (they're rendered through their children)
          const mainQuestions = category.questions.filter(q => 
            !q.parentId && q.questionType !== 'group'
          )
          
          // Handle group questions separately
          const groupQuestions = category.questions.filter(q => q.questionType === 'group')
          
          return (
            <section key={category.id} className="form-section">
              <h2>Section {category.displayOrder}: {category.name}</h2>
              {category.description && (
                <p style={{ marginBottom: '20px', color: '#666', fontStyle: 'italic' }}>
                  {category.description}
                </p>
              )}

              {/* Render main questions */}
              {mainQuestions.map((question) => {
                const currentNumber = questionNumber++
                return renderQuestion(question, currentNumber)
              })}

              {/* Render group questions */}
              {groupQuestions.map((groupQuestion) => {
                const currentNumber = questionNumber++
                return (
                  <div key={groupQuestion.id} className="question-group">
                    <label className="question-label">
                      {currentNumber}. {groupQuestion.questionText}
                      {groupQuestion.isRequired && <span className="required">*</span>}
                    </label>
                    {groupQuestion.helpText && (
                      <p className="question-help">{groupQuestion.helpText}</p>
                    )}
                    <div className="commitment-group">
                      {groupQuestion.children && groupQuestion.children.map((childQuestion) => (
                        <div key={childQuestion.id} className="commitment-item">
                          <label>{childQuestion.questionText}</label>
                          <QuestionInput
                            question={childQuestion}
                            value={formData.answers[childQuestion.questionCode || `q_${childQuestion.id}`]}
                            onChange={handleChange}
                            formData={formData}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </section>
          )
        })}

        {/* Contact Information */}
        <section className="form-section">
          <h2>Contact Information</h2>
          <div className="question-group">
            <label className="question-label">
              Your Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
              required
            />
          </div>
          <div className="question-group">
            <label className="question-label">
              Your Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
              required
            />
          </div>
          <div className="question-group">
            <label className="question-label">
              Company Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              required
            />
          </div>
          <div className="question-group">
            <label className="question-label">Your Title/Role</label>
            <input
              type="text"
              name="contact_title"
              value={formData.contact_title}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_title: e.target.value }))}
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting || loading}>
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset} disabled={submitting || loading}>
            Reset Form
          </button>
        </div>
      </form>
    </div>
  )
}

export default Assessment
