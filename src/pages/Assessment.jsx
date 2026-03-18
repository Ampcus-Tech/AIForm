import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assessmentAPI, questionsAPI, assessmentTypesAPI } from '../services/api'
import QuestionInput from '../components/assessment/QuestionInput'
import SingleQuestionView from '../components/assessment/SingleQuestionView'
import AssessmentPreview from '../components/assessment/AssessmentPreview'
import SuccessPage from '../components/assessment/SuccessPage'
import Dropdown from '../components/common/Dropdown'
import { SafeDescriptionHtml } from '../components/common/RichTextEditor'
import { useBranding } from '../contexts/BrandingContext'
import BrandLogo from '../components/common/BrandLogo'
import '../styles.css'

console.log('📦 Assessment component imported, APIs:', { assessmentAPI, questionsAPI, assessmentTypesAPI })
console.log('✅ USING DYNAMIC VERSION FROM pages/Assessment.jsx')
console.log('✅ This version loads questions from API, NOT static data')

function Assessment() {
  console.log('🎬 ==========================================')
  console.log('🎬 Assessment component rendering...')
  console.log('🎬 Component location: pages/Assessment.jsx')
  console.log('🎬 This is the DYNAMIC VERSION with API calls')
  console.log('🎬 ==========================================')
  const { config: branding } = useBranding()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [assessmentTypes, setAssessmentTypes] = useState([])
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(null)
  const [formData, setFormData] = useState({
    answers: {},
    assessment_type_id: null,
  })
  // Single question mode states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [allQuestionsList, setAllQuestionsList] = useState([]) // Flattened list of all questions
  const [submissionSuccess, setSubmissionSuccess] = useState(false) // Track successful submission
  const [submittedAssessmentId, setSubmittedAssessmentId] = useState(null) // Store submitted assessment ID

  const { assessmentTypeSlug } = useParams()

  // Load assessment types and questions on component mount
  useEffect(() => {
    console.log('🚀 Assessment component mounted, loading assessment types...')
    console.log('🔍 assessmentTypesAPI:', assessmentTypesAPI)
    console.log('🔍 typeof assessmentTypesAPI.getAll:', typeof assessmentTypesAPI.getAll)
    
    // Test if API function exists
    if (!assessmentTypesAPI || typeof assessmentTypesAPI.getAll !== 'function') {
      console.error('❌ assessmentTypesAPI.getAll is not a function!', assessmentTypesAPI)
      setError('API service not properly initialized')
      return
    }
    
    // Call the API
    loadAssessmentTypes().catch(err => {
      console.error('❌ Failed to load assessment types:', err)
      setError(`Failed to load: ${err.message}`)
    })
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
      console.log('🔄 Loading assessment types...')
      const response = await assessmentTypesAPI.getAll()
      console.log('✅ Assessment types response:', response)
      if (response && response.success && response.assessmentTypes) {
        // API already returns only active types (is_active = true), but double-check
        // Check both is_active and isActive (camelCase) for compatibility
        // API already returns only active types (WHERE is_active = true)
        // Use the response directly - no need to filter again
        console.log('📋 Assessment types from API:', response.assessmentTypes.length)
        console.log('📋 Types:', response.assessmentTypes.map(t => `${t.name} (ID: ${t.id}, is_active: ${t.is_active}, isActive: ${t.isActive})`))
        console.log('📋 Setting assessmentTypes state with', response.assessmentTypes.length, 'types')
        setAssessmentTypes(response.assessmentTypes)
        console.log('📋 State updated - assessmentTypes should now have', response.assessmentTypes.length, 'items')
        
        // Always auto-select the first active type (if any exist)
        if (response.assessmentTypes.length > 0 && !selectedAssessmentType) {
          const firstType = response.assessmentTypes[0]
          console.log('🎯 Auto-selecting first assessment type:', firstType.name)
          setSelectedAssessmentType(firstType)
          setFormData(prev => ({ ...prev, assessment_type_id: firstType.id }))
          loadQuestions(firstType.id)
        }
      } else {
        console.warn('⚠️ No assessment types in response or invalid format')
      }
    } catch (err) {
      console.error('❌ Error loading assessment types:', err)
      setError('Failed to load assessment types. Please check your connection and try again.')
      // Continue with default behavior if types fail to load
    }
  }

  const loadQuestions = async (assessmentTypeId = null) => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Loading questions for assessment type:', assessmentTypeId)
      
      // IMPORTANT: Only load questions for the specified assessment type
      if (!assessmentTypeId) {
        console.warn('⚠️ No assessment type ID provided, cannot load questions')
        setError('Please select an assessment type')
        setLoading(false)
        return
      }
      
      let response
      // Always load questions for specific assessment type (no fallback to all questions)
      console.log('📡 Calling assessmentTypesAPI.getById:', assessmentTypeId)
      const typeResponse = await assessmentTypesAPI.getById(assessmentTypeId)
      console.log('✅ Assessment type response:', typeResponse)
      
      if (typeResponse && typeResponse.success && typeResponse.assessmentType) {
        // Transform the response to match the expected format
        response = {
          success: true,
          categories: typeResponse.assessmentType.categories || []
        }
        console.log('📊 Loaded categories for assessment type:', response.categories.length)
        const totalQuestions = response.categories.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)
        console.log('📊 Total questions for this assessment type:', totalQuestions)
      } else {
        console.warn('⚠️ No assessment type found or invalid response')
        setError('Assessment type not found or has no questions')
        setCategories([])
        setAllQuestionsList([])
        setLoading(false)
        return
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
        
        // Debug: Log nested structure
        console.log('🔍 Checking nested question structure:')
        response.categories.forEach(category => {
          if (category.questions && Array.isArray(category.questions)) {
            category.questions.forEach(question => {
              if (question.children && question.children.length > 0) {
                console.log(`  Parent: "${question.questionText?.substring(0, 40)}..." (${question.questionType}) has ${question.children.length} children`)
                question.children.forEach((child, idx) => {
                  console.log(`    Child ${idx + 1}: "${child.questionText?.substring(0, 40)}..." (${child.questionType})`)
                  if (child.children && child.children.length > 0) {
                    console.log(`      ✅ Has ${child.children.length} sub-children!`)
                    child.children.forEach((subChild, subIdx) => {
                      console.log(`        Sub-child ${subIdx + 1}: "${subChild.questionText?.substring(0, 40)}..." (${subChild.questionType})`)
                    })
                  }
                })
              }
            })
          }
        })
        
        // Flatten only parent questions into a single list for single question mode
        // Child questions will be shown inline with their parents, not as separate steps
        const flattenedQuestions = []
        let questionNumber = 1
        
        response.categories.forEach(category => {
          if (category.questions && Array.isArray(category.questions)) {
            category.questions.forEach(question => {
              // Only add top-level questions (no parent_id) - skip group questions and child questions
              if (question.questionType !== 'group' && !question.parent_id && !question.parentId) {
                flattenedQuestions.push({
                  ...question,
                  questionNumber: questionNumber,
                  categoryName: category.name,
                  categoryId: category.id,
                  answerKey: String(questionNumber), // Use sequential number as key (1, 2, 3...)
                  originalQuestionCode: question.questionCode || question.question_code || question.code || `q_${question.id}`, // Keep original for reference
                  // Preserve children structure for inline display
                  children: question.children || []
                })
                questionNumber++
              }
            })
          }
        })
        
        setAllQuestionsList(flattenedQuestions)
        
        // Reset single question mode state when questions are loaded
        setCurrentQuestionIndex(0)
        setShowPreview(false)
        
        // Initialize form data with empty answers for all questions
        // Use sequential numbers (1, 2, 3...) as keys
        const initialAnswers = {}
        let questionCount = 0
        
        flattenedQuestions.forEach(question => {
          const answerKey = question.answerKey // This is now "1", "2", "3", etc.
          if (answerKey) {
            initialAnswers[answerKey] = ''
            questionCount++
          }
        })
        
        console.log('✅ Questions loaded:', questionCount, 'total questions')
        console.log('📝 Answer keys (sequential numbers):', Object.keys(initialAnswers).slice(0, 10), Object.keys(initialAnswers).length > 10 ? '...' : '')
        
        setFormData(prev => ({
          ...prev,
          answers: initialAnswers,
          assessment_type_id: assessmentTypeId // Ensure assessment_type_id is set
        }))
        
        console.log('✅ Questions loaded successfully for assessment type:', assessmentTypeId)
        console.log('📝 Total questions:', questionCount)
      } else if (response && response.categories) {
        // Handle case where response doesn't have success field
        setCategories(response.categories)
        setFormData(prev => ({
          ...prev,
          assessment_type_id: assessmentTypeId
        }))
      } else {
        console.error('❌ Invalid response format:', response)
        throw new Error('Invalid response format from questions API')
      }
    } catch (err) {
      console.error('Error loading questions:', err)
      console.error('Error details:', err)
      const errorMessage = err.message || err.response?.data?.message || 'Failed to load assessment questions. Please refresh the page.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const actualValue = type === 'checkbox' ? String(checked) : String(value)

    const shouldShowChildrenForAnswer = (question, answerValue) => {
      if (!question?.children || question.children.length === 0) return false
      if (question.questionType === 'group') return true
      if (question.questionType !== 'yes_no') return true

      const v = String(answerValue || '').toLowerCase().trim()
      const isYes = v === 'yes' || v === '1' || v === 'true'
      const isNo = v === 'no' || v === '0' || v === 'false'

      const when =
        question.options?.show_children_when ||
        question.options?.showChildrenWhen ||
        'yes'

      if (when === 'any') return isYes || isNo
      if (when === 'no') return isNo
      return isYes
    }
    
    // Update the answer immediately
    setFormData((prev) => {
      const newAnswers = {
        ...prev.answers,
        [name]: actualValue,
      }
      
      // Clear child question answers when parent answer changes (for yes_no questions)
      // name is now the answerKey (sequential number like "1", "2", etc.)
      const question = allQuestionsList.find(q => q.answerKey === name)
      
      if (question && question.children && question.children.length > 0) {
        const showChildrenNow = shouldShowChildrenForAnswer(question, actualValue)
        if (!showChildrenNow) {
          // Clear child answers only when children are hidden for this answer
          question.children.forEach(child => {
            const childInList = allQuestionsList.find(q => (q.id === child.id))
            if (childInList?.answerKey) newAnswers[childInList.answerKey] = ''
            const childKey = child.questionCode || child.question_code || child.code || `q_${child.id}`
            if (childKey) newAnswers[childKey] = ''
          })
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
      console.log('Contact info: (removed)')
      
      // Map sequential number keys (1, 2, 3...) back to question codes for backend
      // Create a mapping from sequential numbers to question codes
      const questionCodeMap = {}
      allQuestionsList.forEach(q => {
        if (q.answerKey && q.originalQuestionCode) {
          questionCodeMap[q.answerKey] = q.originalQuestionCode
        }
      })
      
      // Convert answers from sequential numbers to question codes
      const mappedAnswers = {}
      Object.keys(filteredAnswers).forEach(key => {
        const questionCode = questionCodeMap[key] || key // Use mapped code or keep original if not found
        mappedAnswers[questionCode] = filteredAnswers[key]
      })
      
      // Prepare submission data in dynamic format
      const submissionData = {
        answers: mappedAnswers, // Use question codes for backend
        assessment_type_id: formData.assessment_type_id || selectedAssessmentType?.id || null,
      }
      
      console.log('=== SUBMISSION MAPPING ===')
      console.log('Sequential answers (frontend):', filteredAnswers)
      console.log('Question code mapping:', questionCodeMap)
      console.log('Mapped answers (backend):', mappedAnswers)
      console.log('Submitting data:', submissionData)

      const response = await assessmentAPI.submit(submissionData)
      console.log('Submission response:', response)
      if (response.success) {
        // Store the submitted assessment ID for tracking
        const assessmentId = response.assessment?.id
        if (assessmentId) {
          setSubmittedAssessmentId(assessmentId)
          // Store in localStorage for later access
          localStorage.setItem(`assessment_${assessmentId}`, JSON.stringify({
            id: assessmentId,
            submittedAt: response.assessment.submittedAt,
            assessmentType: selectedAssessmentType?.name,
            contactEmail: null
          }))
        }
        
        // Mark submission as successful - this will show the success page
        setSubmissionSuccess(true)
        
        // Reset all state - clear preview, contact info, and form data
        setShowPreview(false)
        setCurrentQuestionIndex(0)
        
        // Reset form data using allQuestionsList (which uses sequential numbers)
        const initialAnswers = {}
        allQuestionsList.forEach(question => {
          if (question.answerKey) {
            initialAnswers[question.answerKey] = ''
          }
        })
        
        setFormData({
          answers: initialAnswers,
          assessment_type_id: formData.assessment_type_id, // Keep the assessment type
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
          const questionCode = question.questionCode || question.question_code || question.code
          if (questionCode) {
            initialAnswers[questionCode] = ''
          }
          if (question.children && Array.isArray(question.children) && question.children.length > 0) {
            question.children.forEach(child => {
              const childCode = child.questionCode || child.question_code || child.code
              if (childCode) {
                initialAnswers[childCode] = ''
              }
            })
          }
        })
      }
    })
    setFormData({
      answers: initialAnswers,
      assessment_type_id: formData.assessment_type_id || selectedAssessmentType?.id || null,
    })
  }

  // renderQuestionInput is now replaced by QuestionInput component

  // Render a single question
  const renderQuestion = (question, questionNumber) => {
    // Use sequential question number as key (1, 2, 3...)
    // Find the question in allQuestionsList to get its sequential number
    const questionInList = allQuestionsList.find(q => 
      (q.questionCode === question.questionCode && q.id === question.id) ||
      (q.id === question.id)
    )
    const answerKey = questionInList?.answerKey || String(questionNumber)
    const value = formData.answers[answerKey]
    
    // For yes_no: show child block whenever user has answered (Yes or No), then filter which children to show per child's show_when
    // For group type questions, always show their children
    // For other question types (text, scale, etc.), always show children if they exist
    const yesNoValue = String(value || '').toLowerCase().trim()
    const isYes = (yesNoValue === 'yes' || yesNoValue === '1' || yesNoValue === 'true')
    const isNo = (yesNoValue === 'no' || yesNoValue === '0' || yesNoValue === 'false')
    const showWhen = question.options?.show_children_when || question.options?.showChildrenWhen || 'yes'
    const isGroupType = question.questionType === 'group'
    const isOtherTypeWithChildren = question.questionType !== 'yes_no' && question.questionType !== 'group' && question.children && question.children.length > 0
    // Show children container for yes_no when user has answered either Yes or No (individual children filtered below by show_when)
    const isYesNoAnswered = question.questionType === 'yes_no' && (isYes || isNo)
    
    // Show children if:
    // 1. It's a yes_no question and user answered Yes or No (so we can show Yes-only / No-only / Any children), OR
    // 2. It's a group type question (always show), OR
    // 3. It's any other type with children (always show for text, scale, etc.)
    const showChildren = (isYesNoAnswered || isGroupType || isOtherTypeWithChildren) && question.children && question.children.length > 0

    // For yes_no: show only children whose show_when matches current answer (Yes / No / Any)
    const childrenToRender = question.questionType === 'yes_no' && question.children
      ? question.children.filter(child => {
          const raw = child.options?.show_when ?? child.options?.showWhen ?? showWhen
          const childShowWhen = typeof raw === 'string' ? raw.toLowerCase().trim() : 'any'
          if (!childShowWhen || childShowWhen === 'any') return true
          if (childShowWhen === 'yes') return isYes
          if (childShowWhen === 'no') return isNo
          return false
        })
      : (question.children || [])
    
    // Debug logging for nested children
    if (question.children && question.children.length > 0) {
      console.log(`🔍 Question ${questionNumber} (${question.questionText?.substring(0, 30)}...):`, {
        questionType: question.questionType,
        hasChildren: question.children.length,
        childrenWithSubChildren: question.children.filter(c => c.children && c.children.length > 0).length,
        showChildren: showChildren,
        value: value
      })
    }

    return (
      <div key={question.id} className="question-group">
        <label className="question-label">
          {questionNumber}. <SafeDescriptionHtml as="span" html={question.questionText} />
          {question.isRequired && <span className="required">*</span>}
        </label>
        
        {question.helpText && (
          <SafeDescriptionHtml html={question.helpText} className="question-help" />
        )}
        
        <QuestionInput
          question={{ ...question, questionCode: answerKey }}
          value={value || ''}
          onChange={handleChange}
          formData={formData}
        />
        
        {/* Render child questions - for yes_no only those matching show_when (Yes/No/Any) */}
        {showChildren && childrenToRender.length > 0 && (
          <div className="conditional-questions" style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #667eea' }}>
            {childrenToRender.map((child, childIndex) => {
              // Index in full question.children (by display order) so backend's 3_child_0, 3_child_1 match correctly
              const childIndexInParent = question.children.findIndex(c =>
                c.id === child.id || (c.questionCode && c.questionCode === child.questionCode) || (c.question_code === child.question_code)
              )
              const stableChildIndex = childIndexInParent >= 0 ? childIndexInParent : childIndex

              const childInList = allQuestionsList.find(q => {
                if (q.id === child.id) return true
                if (q.questionCode === child.questionCode && q.id === child.id) return true
                if ((q.parentId === question.id || q.parentQuestion?.id === question.id) &&
                    (q.questionCode === child.questionCode || q.originalQuestionCode === child.questionCode)) return true
                return false
              })

              // Use stable index in parent's children so "If No, Why..." submits as 3_child_1 when it's 2nd child (backend matches)
              const childAnswerKey = childInList?.answerKey ||
                                    (questionInList?.answerKey ? `${questionInList.answerKey}_child_${stableChildIndex}` : String(questionNumber + stableChildIndex + 1))
              
              // If child wasn't found in allQuestionsList, we still need to render it
              // Use the original questionCode or generate one
              const childQuestionCode = childInList?.originalQuestionCode || child.questionCode || `q_${child.id}`
              
              // Check if this child question has its own children (sub-child questions)
              // Support both yes_no (when answered yes) and group type questions
              const childValue = formData.answers[childAnswerKey] || ''
              const childYesNoValue = String(childValue || '').toLowerCase().trim()
              const isChildYesNoAnsweredYes = child.questionType === 'yes_no' && (childYesNoValue === 'yes' || childYesNoValue === '1' || childYesNoValue === 'true')
              const isChildGroupType = child.questionType === 'group'
              const showSubChildren = (isChildYesNoAnsweredYes || isChildGroupType) && child.children && child.children.length > 0
              
              // Debug logging for sub-children
              if (child.children && child.children.length > 0) {
                console.log(`    🔍 Child "${child.questionText?.substring(0, 30)}...":`, {
                  childType: child.questionType,
                  childValue: childValue,
                  hasSubChildren: child.children.length,
                  showSubChildren: showSubChildren,
                  subChildrenTypes: child.children.map(sc => sc.questionType)
                })
              }
              
              return (
                <div key={child.id || childQuestionCode} className="question-group">
                  <label className="question-label">
                    <SafeDescriptionHtml as="span" html={child.questionText || child.question_text} />
                    {child.isRequired && <span className="required">*</span>}
                  </label>
                  {child.helpText && (
                    <SafeDescriptionHtml html={child.helpText} className="question-help" />
                  )}
                  <QuestionInput
                    question={{ ...child, questionCode: childAnswerKey }}
                    value={childValue}
                    onChange={handleChange}
                    formData={formData}
                  />
                  
                  {/* Render sub-child questions (nested children) if child is answered "yes" */}
                  {showSubChildren && (
                    <div className="conditional-questions" style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #48bb78' }}>
                      {child.children.map((subChild, subChildIndex) => {
                        const subChildIndexInParent = child.children.findIndex(sc =>
                          sc.id === subChild.id || (sc.questionCode && sc.questionCode === subChild.questionCode)
                        )
                        const stableSubIndex = subChildIndexInParent >= 0 ? subChildIndexInParent : subChildIndex
                        const subChildInList = allQuestionsList.find(q => {
                          if (q.id === subChild.id) return true
                          if (q.questionCode === subChild.questionCode && q.id === subChild.id) return true
                          if ((q.parentId === child.id || q.parentQuestion?.id === child.id) &&
                              (q.questionCode === subChild.questionCode || q.originalQuestionCode === subChild.questionCode)) return true
                          return false
                        })
                        const subChildAnswerKey = subChildInList?.answerKey ||
                                                  (childInList?.answerKey ? `${childInList.answerKey}_subchild_${stableSubIndex}` : `${childAnswerKey}_subchild_${stableSubIndex}`)
                        
                        return (
                          <div key={subChild.id || subChildAnswerKey} className="question-group">
                            <label className="question-label">
                              <SafeDescriptionHtml as="span" html={subChild.questionText || subChild.question_text} />
                              {subChild.isRequired && <span className="required">*</span>}
                            </label>
                            {subChild.helpText && (
                              <SafeDescriptionHtml html={subChild.helpText} className="question-help" />
                            )}
                            <QuestionInput
                              question={{ ...subChild, questionCode: subChildAnswerKey }}
                              value={formData.answers[subChildAnswerKey] || ''}
                              onChange={handleChange}
                              formData={formData}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
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
      setShowPreview(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle going back in single question mode
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle final submission from preview
  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(e)
  }

  // Show success page if submission was successful
  if (submissionSuccess) {
    return (
      <SuccessPage
        assessmentType={selectedAssessmentType}
        assessmentId={submittedAssessmentId}
        onStartNew={() => {
          // Reset all state to start a new assessment
          setSubmissionSuccess(false)
          setSubmittedAssessmentId(null)
          setShowPreview(false)
          setCurrentQuestionIndex(0)
          
          // Reset form data
          const initialAnswers = {}
          allQuestionsList.forEach(question => {
            if (question.answerKey) {
              initialAnswers[question.answerKey] = ''
            }
          })
          
          setFormData({
            answers: initialAnswers,
            assessment_type_id: formData.assessment_type_id,
          })
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    )
  }

  // Render preview page (only if not submitted successfully)
  if (showPreview && isSingleQuestionMode && !submissionSuccess) {
    return (
      <AssessmentPreview
        allQuestionsList={allQuestionsList}
        formData={formData}
        selectedAssessmentType={selectedAssessmentType}
        onEditQuestion={(index) => {
          setShowPreview(false)
          setCurrentQuestionIndex(index)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onBackToLast={() => {
          setShowPreview(false)
          setCurrentQuestionIndex(Math.max(0, allQuestionsList.length - 1))
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onSubmit={handleFinalSubmit}
        submitting={submitting}
      />
    )
  }

  // Render single question mode
  if (isSingleQuestionMode && allQuestionsList.length > 0 && !showPreview) {
    const currentQuestion = allQuestionsList[currentQuestionIndex]
    const answerKey = currentQuestion.answerKey
    const currentAnswer = formData.answers[answerKey] || ''
    const isLastQuestion = currentQuestionIndex === allQuestionsList.length - 1

    return (
      <div className="app-shell">
        <div className="app-nav">
          
          <div>
          <div className="app-brand__name">{branding?.appName || 'SBEAMP'}</div>
         
          <div className="app-brand">
            <BrandLogo
              logoUrl={branding?.logoUrl}
              appName={branding?.appName}
              width={branding?.logoWidth ?? 56}
              height={branding?.logoHeight ?? 56}
              rounded={12}
              padding={8}
              background="rgba(0,0,0,0.04)"
              foreground="#111827"
            />
             </div>
          </div>
          <div className="app-actions">
            <Link to="/check-results" className="app-btn">🔍 Check Submission</Link>
            {/* <Link to="/login" className="app-btn app-btn--primary">🔐 Admin Login</Link> */}
          </div>
        </div>

        <div className="app-main">
          <div className="app-card">
            <div className="app-card__header">
              <div className="app-card__title">
                📝 {selectedAssessmentType?.name || 'Assessment'}
              </div>
              {selectedAssessmentType?.description ? (
                <SafeDescriptionHtml html={selectedAssessmentType.description} className="app-card__subtitle" />
              ) : null}

              {assessmentTypes.length > 1 ? (
                <div className="assessment-type-selector" style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 800, color: '#111827' }}>
                    Select Assessment Type:
                  </label>
                  <Dropdown
                    value={selectedAssessmentType?.id || ''}
                    onChange={(typeId) => {
                      const type = assessmentTypes.find(t => t.id === typeId)
                      if (type) {
                        setCategories([])
                        setAllQuestionsList([])
                        setCurrentQuestionIndex(0)
                        setShowPreview(false)
                        setFormData(prev => ({
                          ...prev,
                          assessment_type_id: type.id,
                          answers: {}
                        }))
                        setSelectedAssessmentType(type)
                        loadQuestions(type.id)
                      }
                    }}
                    options={assessmentTypes.map(type => ({
                      value: type.id,
                      label: type.name,
                      icon: type.icon || ''
                    }))}
                    placeholder="Select Assessment Type..."
                  />
                </div>
              ) : null}

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontWeight: 800, color: '#111827' }}>
                  Question {currentQuestionIndex + 1} of {allQuestionsList.length}
                </div>
                <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.10)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${((currentQuestionIndex + 1) / allQuestionsList.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>

            <div className="app-card__body">
              <form id="assessmentForm">
                <section className="form-section" style={{ padding: 0, borderBottom: 'none' }}>
            {currentQuestion.categoryName && (
              <h2 style={{ fontSize: '1em', color: 'var(--brand-primary)', marginBottom: '15px' }}>
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

            {/* Show child questions inline with parent - for all question types that have children */}
            {(() => {
              // For yes_no: show child block whenever user has answered (Yes or No), then filter which children to show per child's show_when
              // For other question types (text, scale, etc.), always show children if they exist
              const yesNoValue = String(currentAnswer || '').toLowerCase().trim()
              const isYes = (yesNoValue === 'yes' || yesNoValue === '1' || yesNoValue === 'true')
              const isNo = (yesNoValue === 'no' || yesNoValue === '0' || yesNoValue === 'false')
              const showWhen = currentQuestion.options?.show_children_when || currentQuestion.options?.showChildrenWhen || 'yes'
              const isGroupType = currentQuestion.questionType === 'group'
              const isOtherTypeWithChildren = currentQuestion.questionType !== 'yes_no' && currentQuestion.questionType !== 'group' && currentQuestion.children && currentQuestion.children.length > 0
              const isYesNoAnswered = currentQuestion.questionType === 'yes_no' && (isYes || isNo)
              
              const showChildren = (isYesNoAnswered || isGroupType || isOtherTypeWithChildren) && currentQuestion.children && currentQuestion.children.length > 0
              
              if (!showChildren) return null

              // For yes_no: only show children whose show_when matches current answer (Yes / No / Any)
              const childrenToRender = currentQuestion.questionType === 'yes_no'
                ? currentQuestion.children.filter(child => {
                    const raw = child.options?.show_when ?? child.options?.showWhen ?? showWhen
                    const childShowWhen = typeof raw === 'string' ? raw.toLowerCase().trim() : 'any'
                    if (!childShowWhen || childShowWhen === 'any') return true
                    if (childShowWhen === 'yes') return isYes
                    if (childShowWhen === 'no') return isNo
                    return false
                  })
                : currentQuestion.children
              
              if (childrenToRender.length === 0) return null
              
              // Recursive function to render child questions and their sub-children
              const renderChildQuestions = (children, level = 0) => {
                return children.map((child, childIndex) => {
                  const childAnswerKey = child.questionCode || child.question_code || child.code || `q_${child.id}`
                  const childValue = formData.answers[childAnswerKey] || ''
                  
                  // Check if this child has its own children (sub-children)
                  const childYesNoValue = String(childValue || '').toLowerCase().trim()
                  const isChildYesNoAnsweredYes = child.questionType === 'yes_no' && (childYesNoValue === 'yes' || childYesNoValue === '1' || childYesNoValue === 'true')
                  const isChildGroupType = child.questionType === 'group'
                  const isChildOtherTypeWithChildren = child.questionType !== 'yes_no' && child.questionType !== 'group' && child.children && child.children.length > 0
                  const showSubChildren = (isChildYesNoAnsweredYes || isChildGroupType || isChildOtherTypeWithChildren) && child.children && child.children.length > 0
                  
                  return (
                    <div key={child.id || childAnswerKey} className="question-group" style={{ 
                      marginBottom: '20px',
                      marginTop: childIndex === 0 ? '20px' : '15px',
                      paddingLeft: `${20 + (level * 20)}px`,
                      borderLeft: `${4 + level}px solid ${level === 0 ? '#667eea' : '#48bb78'}`,
                      background: level === 0 ? '#f8f9ff' : '#f0fff4',
                      padding: '15px',
                      borderRadius: '8px'
                    }}>
                      <label className="question-label" style={{ fontSize: level === 0 ? '1em' : '0.95em' }}>
                        <SafeDescriptionHtml as="span" html={child.questionText || child.question_text} />
                        {child.isRequired && <span className="required">*</span>}
                      </label>
                      {child.helpText && (
                        <p className="question-help" style={{ fontSize: '0.9em' }}><SafeDescriptionHtml html={child.helpText} /></p>
                      )}
                      <QuestionInput
                        question={{ ...child, questionCode: childAnswerKey }}
                        value={childValue}
                        onChange={handleChange}
                        formData={formData}
                      />
                      
                      {/* Recursively render sub-children if they exist */}
                      {showSubChildren && (
                        <div style={{ marginTop: '15px' }}>
                          {renderChildQuestions(child.children, level + 1)}
                        </div>
                      )}
                    </div>
                  )
                })
              }
              
              return (
                <div style={{ marginTop: '20px' }}>
                  {renderChildQuestions(childrenToRender, 0)}
                </div>
              )
            })()}

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
                {isLastQuestion ? 'Continue to review →' : '💾 Save & Next →'}
              </button>
            </div>
                </section>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      
      <div className="app-nav">
        
        <div className="app-brand">
          
          <div>
          <div className="app-brand__name">{branding?.appName || 'SBEAMP'}</div>
          <BrandLogo
            logoUrl={branding?.logoUrl}
            appName={branding?.appName}
            width={branding?.logoWidth ?? 56}
            height={branding?.logoHeight ?? 56}
            rounded={12}
            padding={8}
            background="rgba(0,0,0,0.04)"
            foreground="#111827"
          />
          </div>
          {/* <div className="app-brand__name">{branding?.appName || 'SBEAMP'}</div> */}
        </div>
        <div className="app-actions">
          <Link to="/check-results" className="app-btn">🔍 Check Submission</Link>
          {/* <Link to="/login" className="app-btn app-btn--primary">🔐 Admin Login</Link> */}
        </div>
      </div>

      <div className="app-main">
        <div className="app-card">
          <div className="app-card__header">
            <div className="app-card__title">
               {selectedAssessmentType?.name || 'AI Adoption Readiness Assessment'}
            </div>
            {selectedAssessmentType?.description ? (
              <SafeDescriptionHtml html={selectedAssessmentType.description} className="app-card__subtitle" />
            ) : (
              <div className="app-card__subtitle">
                Please complete all sections to help us understand your organization's readiness for AI transformation
              </div>
            )}

            {assessmentTypes.length > 1 ? (
              <div className="assessment-type-selector" style={{ marginTop: 14 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 800, color: '#111827' }}>
                  Select Assessment Type:
                </label>
                <Dropdown
                  value={selectedAssessmentType?.id || ''}
                  onChange={(typeId) => {
                    const type = assessmentTypes.find(t => t.id === typeId)
                    if (type) {
                      setCategories([])
                      setAllQuestionsList([])
                      setCurrentQuestionIndex(0)
                      setShowPreview(false)
                      setFormData(prev => ({
                        ...prev,
                        assessment_type_id: type.id,
                        answers: {}
                      }))
                      setSelectedAssessmentType(type)
                      loadQuestions(type.id)
                    }
                  }}
                  options={assessmentTypes.map(type => ({
                    value: type.id,
                    label: type.name,
                    icon: type.icon || ''
                  }))}
                  placeholder="Select Assessment Type..."
                />
              </div>
            ) : null}

            {assessmentTypes.length === 0 && !loading ? (
              <div style={{ marginTop: 14, padding: 12, background: 'rgba(0,0,0,0.04)', borderRadius: 12 }}>
                <div style={{ fontWeight: 800, color: '#111827' }}>
                  ⚠️ No active assessment types available. Please contact administrator.
                </div>
              </div>
            ) : null}
          </div>

          <div className="app-card__body">

      {error && (
        <div className="error-message" style={{ margin: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '5px' }}>
          ⚠️ {error}
        </div>
      )}

      <form id="assessmentForm" onSubmit={handleSubmit}>
        {categories.map((category, categoryIndex) => {
          // Filter out child questions (they're rendered conditionally when parent is answered "yes")
          // Also filter out group questions (they're rendered through their children)
          const mainQuestions = category.questions.filter(q => 
            !q.parentId && q.questionType !== 'group'
          )
          
          // Handle group questions separately
          const groupQuestions = category.questions.filter(q => q.questionType === 'group')
          
          // Section number starts from 1 instead of 0
          const sectionNumber = categoryIndex + 1
          
          return (
            <section key={category.id} className="form-section">
              <h2>Section {sectionNumber}: {category.name}</h2>
              {category.description && (
                <SafeDescriptionHtml
                  html={category.description}
                  style={{ marginBottom: '20px', color: '#666' }}
                  className="category-description"
                />
              )}

              {/* Render main questions (child questions will be shown conditionally in renderQuestion) */}
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
        </div>
      </div>
    </div>
  )
}

export default Assessment
