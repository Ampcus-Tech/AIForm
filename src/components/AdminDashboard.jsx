import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../services/api'
import AssessmentTypeModal from './admin/AssessmentTypeModal'
import UserModal from './admin/UserModal'
import CategoryModal from './admin/CategoryModal'
import QuestionModal from './admin/QuestionModal'
import AssessmentDetailsModal from './admin/AssessmentDetailsModal'
import '../styles.css'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats') // Default to Statistics
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [assessments, setAssessments] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredAssessments, setFilteredAssessments] = useState([])
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Questions and Categories states
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [assessmentTypes, setAssessmentTypes] = useState([])
  
  // Modal states for Assessment Types
  const [showAssessmentTypeModal, setShowAssessmentTypeModal] = useState(false)
  const [editingAssessmentType, setEditingAssessmentType] = useState(null)
  const [viewingAssessmentType, setViewingAssessmentType] = useState(null)
  
  // Modal states for Users
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  
  // Modal states for Categories
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [viewingCategory, setViewingCategory] = useState(null)
  
  // Modal states for Questions
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [viewingQuestion, setViewingQuestion] = useState(null)
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('')
  const [assessmentSearch, setAssessmentSearch] = useState('')
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [filteredCategories, setFilteredCategories] = useState([])
  const [questionSearch, setQuestionSearch] = useState('')
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState('all')
  const [questionAssessmentTypeFilter, setQuestionAssessmentTypeFilter] = useState('all')
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all')
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Load all data on initial mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Reload specific tab data when switching tabs
  useEffect(() => {
    if (activeTab !== 'stats') {
    loadData()
    }
  }, [activeTab])

  useEffect(() => {
    filterUsers()
  }, [users, userSearch, roleFilter])

  useEffect(() => {
    filterAssessments()
  }, [assessments, assessmentSearch, assessmentTypeFilter])

  const filterCategories = useCallback(() => {
    let filtered = [...categories]
    
    if (categoryFilter !== 'all') {
      const filterId = parseInt(categoryFilter)
      filtered = filtered.filter(cat => 
        (cat.assessment_type_id || cat.assessmentTypeId) === filterId
      )
    }
    
    setFilteredCategories(filtered)
  }, [categories, categoryFilter])

  const filterQuestions = () => {
    // Flatten all questions from categories
    let allQuestions = []
    questions.forEach(category => {
      if (category.questions && Array.isArray(category.questions)) {
        category.questions.forEach(q => {
          allQuestions.push({
            ...q,
            categoryId: category.id,
            categoryName: category.name,
            assessmentTypeId: category.assessment_type_id || category.assessmentTypeId
          })
        })
      }
    })

    // Apply filters
    let filtered = [...allQuestions]

    // Filter by search text
    if (questionSearch) {
      const searchLower = questionSearch.toLowerCase()
      filtered = filtered.filter(q => 
        (q.questionText || q.question_text || '').toLowerCase().includes(searchLower) ||
        (q.questionCode || q.question_code || '').toLowerCase().includes(searchLower) ||
        (q.categoryName || '').toLowerCase().includes(searchLower)
      )
    }

    // Filter by category
    if (questionCategoryFilter !== 'all') {
      const filterId = parseInt(questionCategoryFilter)
      filtered = filtered.filter(q => q.categoryId === filterId)
    }

    // Filter by assessment type
    if (questionAssessmentTypeFilter !== 'all') {
      const filterId = parseInt(questionAssessmentTypeFilter)
      filtered = filtered.filter(q => q.assessmentTypeId === filterId)
    }

    // Filter by question type
    if (questionTypeFilter !== 'all') {
      filtered = filtered.filter(q => 
        (q.questionType || q.question_type) === questionTypeFilter
      )
    }

    setFilteredQuestions(filtered)
  }

  useEffect(() => {
    filterCategories()
  }, [filterCategories, assessmentTypes])

  useEffect(() => {
    filterQuestions()
  }, [questions, questionSearch, questionCategoryFilter, questionAssessmentTypeFilter, questionTypeFilter, categories, assessmentTypes])

  // Load all data on initial mount
  const loadAllData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load all data in parallel
      const [statsRes, usersRes, assessmentsRes, categoriesRes, questionsRes, assessmentTypesRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ success: false })),
        adminAPI.getAllUsers().catch(() => ({ success: false })),
        adminAPI.getAllAssessments().catch(() => ({ success: false })),
        adminAPI.getAllCategories().catch(() => ({ success: false })),
        adminAPI.getAllQuestions().catch(() => ({ success: false })),
        adminAPI.getAllAssessmentTypes().catch(() => ({ success: false }))
      ])

      if (statsRes.success) {
        setStats(statsRes.stats)
      }
      if (usersRes.success) {
        setUsers(usersRes.users || [])
        setFilteredUsers(usersRes.users || [])
      }
      if (assessmentsRes.success) {
        setAssessments(assessmentsRes.assessments || [])
        setFilteredAssessments(assessmentsRes.assessments || [])
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.categories || [])
        setFilteredCategories(categoriesRes.categories || [])
      }
      if (questionsRes.success) {
        setQuestions(questionsRes.categories || [])
      }
      if (assessmentTypesRes.success) {
        setAssessmentTypes(assessmentTypesRes.assessmentTypes || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      if (activeTab === 'stats') {
        const response = await adminAPI.getStats()
        if (response.success) {
          setStats(response.stats)
        }
      } else if (activeTab === 'users') {
        const response = await adminAPI.getAllUsers()
        if (response.success) {
          setUsers(response.users)
          setFilteredUsers(response.users)
        }
      } else if (activeTab === 'assessments') {
        const response = await adminAPI.getAllAssessments()
        if (response.success) {
          setAssessments(response.assessments)
          setFilteredAssessments(response.assessments)
        }
      } else if (activeTab === 'categories') {
        const response = await adminAPI.getAllCategories()
        if (response && response.success) {
          setCategories(response.categories || [])
          setFilteredCategories(response.categories || [])
        }
      } else if (activeTab === 'questions') {
        const response = await adminAPI.getAllQuestions()
        if (response && response.success) {
          setQuestions(response.categories || [])
        }
      } else if (activeTab === 'assessment-types') {
        const response = await adminAPI.getAllAssessmentTypes()
        if (response && response.success) {
          setAssessmentTypes(response.assessmentTypes || [])
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]
    
    if (userSearch) {
      const searchLower = userSearch.toLowerCase()
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      )
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }
    
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const filterAssessments = () => {
    let filtered = [...assessments]
    
    // Filter by assessment type
    if (assessmentTypeFilter !== 'all') {
      const filterId = parseInt(assessmentTypeFilter)
      filtered = filtered.filter(a => 
        (a.assessment_type_id || a.assessmentTypeId) === filterId
      )
    }
    
    // Filter by search text
    if (assessmentSearch) {
      const searchLower = assessmentSearch.toLowerCase()
      filtered = filtered.filter(a => 
        a.user_name?.toLowerCase().includes(searchLower) ||
        a.user_email?.toLowerCase().includes(searchLower) ||
        a.contact_name?.toLowerCase().includes(searchLower) ||
        a.contact_email?.toLowerCase().includes(searchLower) ||
        a.company_name?.toLowerCase().includes(searchLower)
      )
    }
    
    setFilteredAssessments(filtered)
    setCurrentPage(1)
  }

  const handleViewAssessment = async (id) => {
    try {
      const response = await adminAPI.getAssessmentById(id)
      if (response.success) {
        setSelectedAssessment(response.assessment)
      }
    } catch (err) {
      alert('Failed to load assessment details')
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export assessments with questions and answers for selected assessment type
  const exportAssessmentsWithAnswers = async () => {
    try {
      // Check if assessment type is selected
      if (assessmentTypeFilter === 'all') {
        alert('Please select an assessment type to export. This ensures the CSV only contains columns for questions from that specific type.')
        return
      }

      if (filteredAssessments.length === 0) {
        alert('No assessments found for the selected assessment type')
        return
      }

      const selectedType = assessmentTypes.find(t => t.id === parseInt(assessmentTypeFilter))
      if (!selectedType) {
        alert('Selected assessment type not found')
        return
      }

      // Import formatAnswer utility
      const { formatAnswer } = await import('../utils/formatAnswer.js')

      // Fetch questions for the selected assessment type
      const questionsResponse = await adminAPI.getAllQuestions(parseInt(assessmentTypeFilter))
      if (!questionsResponse || !questionsResponse.success) {
        alert('Failed to load questions for the selected assessment type')
        return
      }

      // Sort categories first by display_order to maintain proper sequence
      const sortedCategories = [...(questionsResponse.categories || [])].sort((a, b) => {
        const orderA = a.display_order !== null && a.display_order !== undefined ? a.display_order : (a.displayOrder !== null && a.displayOrder !== undefined ? a.displayOrder : Number.MAX_SAFE_INTEGER)
        const orderB = b.display_order !== null && b.display_order !== undefined ? b.display_order : (b.displayOrder !== null && b.displayOrder !== undefined ? b.displayOrder : Number.MAX_SAFE_INTEGER)
        if (orderA !== orderB) return orderA - orderB
        // If display_order is same, sort by category ID as fallback
        return (a.id || 0) - (b.id || 0)
      })

      // Flatten all questions from categories, maintaining category order
      const allQuestions = []
      if (Array.isArray(sortedCategories)) {
        sortedCategories.forEach(category => {
          if (category.questions && Array.isArray(category.questions)) {
            // Sort questions within each category by display_order
            const sortedCategoryQuestions = [...category.questions].sort((a, b) => {
              const orderA = a.display_order !== null && a.display_order !== undefined ? a.display_order : (a.displayOrder !== null && a.displayOrder !== undefined ? a.displayOrder : Number.MAX_SAFE_INTEGER)
              const orderB = b.display_order !== null && b.display_order !== undefined ? b.display_order : (b.displayOrder !== null && b.displayOrder !== undefined ? b.displayOrder : Number.MAX_SAFE_INTEGER)
              if (orderA !== orderB) return orderA - orderB
              // If display_order is same, sort by question ID as fallback
              return (a.id || 0) - (b.id || 0)
            })
            
            // Add sorted questions from this category
            sortedCategoryQuestions.forEach(question => {
              allQuestions.push({
                ...question,
                categoryName: category.name,
                categoryId: category.id,
                categoryDisplayOrder: category.display_order || category.displayOrder || Number.MAX_SAFE_INTEGER
              })
            })
          }
        })
      }

      // Final sort: by category display_order first, then question display_order
      // This ensures questions are in proper sequence across all categories
      allQuestions.sort((a, b) => {
        // First sort by category display_order
        const catOrderA = a.categoryDisplayOrder !== null && a.categoryDisplayOrder !== undefined ? a.categoryDisplayOrder : Number.MAX_SAFE_INTEGER
        const catOrderB = b.categoryDisplayOrder !== null && b.categoryDisplayOrder !== undefined ? b.categoryDisplayOrder : Number.MAX_SAFE_INTEGER
        if (catOrderA !== catOrderB) return catOrderA - catOrderB
        
        // Within same category, sort by question display_order
        const orderA = a.display_order !== null && a.display_order !== undefined ? a.display_order : (a.displayOrder !== null && a.displayOrder !== undefined ? a.displayOrder : Number.MAX_SAFE_INTEGER)
        const orderB = b.display_order !== null && b.display_order !== undefined ? b.display_order : (b.displayOrder !== null && b.displayOrder !== undefined ? b.displayOrder : Number.MAX_SAFE_INTEGER)
        if (orderA !== orderB) return orderA - orderB
        
        // Final fallback: sort by question ID
        return (a.id || 0) - (b.id || 0)
      })
      
      console.log(`📝 Loaded ${allQuestions.length} questions dynamically (no hardcoded limits)`)
      console.log(`📋 Question sequence (first 10):`, allQuestions.slice(0, 10).map((q, i) => `Q${i+1}: ${q.questionCode || q.question_code} (order: ${q.display_order || q.displayOrder})`))
      console.log(`📋 Question sequence (last 10):`, allQuestions.slice(-10).map((q, i) => `Q${allQuestions.length - 10 + i + 1}: ${q.questionCode || q.question_code} (order: ${q.display_order || q.displayOrder})`))

      // Create a map of question codes to questions for quick lookup
      const questionsMap = {}
      const questionCodesSet = new Set()
      allQuestions.forEach(question => {
        const qCode = question.questionCode || question.question_code || `q_${question.id}`
        questionsMap[qCode] = question
        questionCodesSet.add(qCode)
        // Also add alternative formats
        if (qCode.startsWith('ai_')) {
          questionsMap[qCode.substring(3)] = question
          questionCodesSet.add(qCode.substring(3))
        } else if (qCode.startsWith('q') && !qCode.startsWith('ai_')) {
          questionsMap[`ai_${qCode}`] = question
          questionCodesSet.add(`ai_${qCode}`)
        }
      })
      
      console.log(`📝 Prepared ${allQuestions.length} questions for export`)
      console.log(`📋 Question codes:`, Array.from(questionCodesSet).slice(0, 10), '...')

      // Fetch detailed data for each assessment
      const exportData = []
      
      for (const assessment of filteredAssessments) {
        try {
          // Fetch answers directly - try both detailed and raw formats
          let allAnswers = {}
          let dynamicAnswers = []
          
          // First try detailed format
          const detailedResponse = await adminAPI.getAssessmentById(assessment.id, 'detailed')
          const detailedAssessment = detailedResponse?.assessment || assessment
          
          // Get dynamic answers array
          dynamicAnswers = detailedAssessment.dynamicAnswers || 
                          detailedAssessment.dynamic_answers || 
                          detailedAssessment.answer_details || 
                          []
          
          // Also get raw answers object
          if (detailedAssessment.answers && typeof detailedAssessment.answers === 'object') {
            allAnswers = { ...detailedAssessment.answers }
          }
          
          // If we don't have enough, try raw fetch
          if (dynamicAnswers.length < allQuestions.length * 0.5) {
            console.warn(`⚠️ Only ${dynamicAnswers.length} answers in dynamicAnswers, trying raw fetch...`)
            const rawResponse = await adminAPI.getAssessmentById(assessment.id)
            if (rawResponse?.assessment) {
              const rawAssessment = rawResponse.assessment
              if (rawAssessment.dynamicAnswers && Array.isArray(rawAssessment.dynamicAnswers)) {
                dynamicAnswers = rawAssessment.dynamicAnswers
              }
              if (rawAssessment.answers && typeof rawAssessment.answers === 'object') {
                allAnswers = { ...allAnswers, ...rawAssessment.answers }
              }
            }
          }

          // Build comprehensive answers map from all sources
          const answersMap = {}
          
          // Process dynamicAnswers array
          if (Array.isArray(dynamicAnswers)) {
            console.log(`📊 Processing ${dynamicAnswers.length} answers from dynamicAnswers array for assessment ${assessment.id}`)
            dynamicAnswers.forEach(answer => {
              const qCode = answer.question_code || answer.questionCode
              if (qCode) {
                const answerValue = answer.answer_json || 
                                  answer.answerJson || 
                                  answer.answer_value || 
                                  answer.answerValue || 
                                  answer.answer || 
                                  ''
                
                // Store with original code
                answersMap[qCode] = {
                  question_code: qCode,
                  questionCode: qCode,
                  answer_value: answerValue,
                  answerValue: answerValue,
                  answer: answerValue,
                  question_text: answer.question_text || answer.questionText,
                  question_type: answer.question_type || answer.questionType
                }
                
                // Also store with alternative formats for matching
                if (qCode.startsWith('ai_')) {
                  answersMap[qCode.substring(3)] = answersMap[qCode]
                } else if (qCode.startsWith('q') && !qCode.startsWith('ai_')) {
                  answersMap[`ai_${qCode}`] = answersMap[qCode]
                }
              }
            })
          }
          
          // Process raw answers object
          if (Object.keys(allAnswers).length > 0) {
            console.log(`📦 Processing ${Object.keys(allAnswers).length} answers from raw answers object`)
            Object.keys(allAnswers).forEach(qCode => {
              if (!answersMap[qCode]) {
                const answerValue = allAnswers[qCode]
                answersMap[qCode] = {
                  question_code: qCode,
                  questionCode: qCode,
                  answer_value: answerValue,
                  answerValue: answerValue,
                  answer: answerValue
                }
                // Also store with alternative formats
                if (qCode.startsWith('ai_')) {
                  answersMap[qCode.substring(3)] = answersMap[qCode]
                } else if (qCode.startsWith('q') && !qCode.startsWith('ai_')) {
                  answersMap[`ai_${qCode}`] = answersMap[qCode]
                }
              }
            })
          }
          
          console.log(`✅ Total mapped answers: ${Object.keys(answersMap).length} for assessment ${assessment.id}`)
          console.log(`📋 Answer codes found:`, Object.keys(answersMap))
          
          // Verify we have answers for all questions (fully dynamic - no hardcoded limits)
          const missingAnswers = []
          allQuestions.forEach((q, idx) => {
            const qCode = q.questionCode || q.question_code
            const hasAnswer = answersMap[qCode] || 
                            (qCode.startsWith('ai_') && answersMap[qCode.substring(3)]) ||
                            (qCode.match(/^q\d+/) && answersMap[`ai_${qCode}`])
            if (!hasAnswer) {
              missingAnswers.push({ questionNumber: idx + 1, code: qCode })
            }
          })
          if (missingAnswers.length > 0) {
            console.warn(`⚠️ Missing answers for ${missingAnswers.length} questions:`, missingAnswers)
          } else {
            console.log(`✅ All ${allQuestions.length} questions have answers mapped`)
          }

          // Build assessment row with fixed columns first
          const assessmentRow = {
            'Assessment ID': assessment.id,
            'Contact Name': assessment.user_name || assessment.contact_name || 'Anonymous',
            'Contact Email': assessment.user_email || assessment.contact_email || 'N/A',
            'Company Name': assessment.company_name || 'N/A',
            'Contact Title': assessment.contact_title || 'N/A',
            'Submitted At': formatDate(assessment.submitted_at)
          }

          // Add question columns dynamically - iterate through ALL questions in order (no limits)
          let questionNumber = 1
          console.log(`🔄 Processing ${allQuestions.length} questions for assessment ${assessment.id}`)
          
          allQuestions.forEach((question, questionIndex) => {
            // Get the actual question code from database
            const qCode = question.questionCode || question.question_code || `q_${question.id}`
            
            // Try to find answer using multiple code formats
            let answerData = answersMap[qCode]
            
            // If not found with exact code, try alternative formats
            if (!answerData) {
              if (qCode.startsWith('ai_')) {
                answerData = answersMap[qCode.substring(3)] // Try without "ai_" prefix
              } else if (qCode.match(/^q\d+/)) {
                answerData = answersMap[`ai_${qCode}`] // Try with "ai_" prefix
              }
            }
            
            // Extract answer value - handle all possible formats
            let answerValue = ''
            if (answerData) {
              // Try multiple possible answer value fields
              answerValue = answerData.answer_value !== undefined && answerData.answer_value !== null 
                ? answerData.answer_value 
                : (answerData.answerValue !== undefined && answerData.answerValue !== null
                  ? answerData.answerValue
                  : (answerData.answer !== undefined && answerData.answer !== null
                    ? answerData.answer
                    : (answerData.answer_json !== undefined && answerData.answer_json !== null
                      ? answerData.answer_json
                      : (answerData.answerJson !== undefined && answerData.answerJson !== null
                        ? answerData.answerJson
                        : ''))))
              
              // Parse JSON strings if needed
              if (typeof answerValue === 'string' && answerValue.trim() !== '' && (answerValue.startsWith('{') || answerValue.startsWith('['))) {
                try {
                  const parsed = JSON.parse(answerValue)
                  // If it's an object/array, convert to readable string
                  if (typeof parsed === 'object') {
                    answerValue = JSON.stringify(parsed)
                  } else {
                    answerValue = parsed
                  }
                } catch (e) {
                  // Keep as string if parsing fails
                }
              }
              
              // Convert to string if it's not already
              if (answerValue !== null && answerValue !== undefined && typeof answerValue !== 'string') {
                answerValue = String(answerValue)
              }
            }
            
            // Debug logging for missing answers (fully dynamic - no hardcoded question numbers)
            if (!answerData) {
              const availableCodes = Object.keys(answersMap)
              const similarCodes = availableCodes.filter(code => 
                code.includes(qCode.substring(Math.max(0, qCode.length - 3))) || 
                qCode.includes(code.substring(Math.max(0, code.length - 3)))
              )
              // Log all missing answers, not just after a specific number
              console.warn(`⚠️ Q${questionNumber} (${qCode}): No answer found!`)
              if (similarCodes.length > 0) {
                console.warn(`   Similar codes found:`, similarCodes.slice(0, 10))
              }
            }

            // Format the answer using the formatAnswer utility
            let finalAnswerValue = ''
            
            if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
              // Try to format the answer
              const formattedAnswer = formatAnswer(
                answerValue,
                qCode,
                question.questionType || question.question_type || '',
                question
              )
              
              // Use formatted answer if it's valid, otherwise use raw value
              if (formattedAnswer && formattedAnswer !== 'Not answered' && formattedAnswer.trim() !== '') {
                finalAnswerValue = formattedAnswer
              } else {
                // Use raw value if formatting didn't work
                finalAnswerValue = String(answerValue).trim()
              }
            }
            
            // If we still don't have a value, check if answerData exists but value is empty
            if (!finalAnswerValue && answerData) {
              // Answer exists but might be empty string - still show it
              finalAnswerValue = 'No answer provided'
            } else if (!finalAnswerValue) {
              // No answer data at all
              finalAnswerValue = 'No answer provided'
            }

            // Create column header with question number and text
            const questionText = question.questionText || question.question_text || qCode
            const columnHeader = `Q${questionNumber}: ${questionText}`
            
            // ALWAYS add the column to the row - this ensures all questions are in the CSV
            assessmentRow[columnHeader] = finalAnswerValue
            
            // Debug log for every 5th question and last few questions
            if (questionNumber % 5 === 0 || questionNumber > allQuestions.length - 3) {
              console.log(`Q${questionNumber} (${qCode}):`, {
                hasAnswerData: !!answerData,
                rawAnswerValue: answerValue,
                finalAnswerValue: finalAnswerValue,
                columnHeader: columnHeader.substring(0, 50)
              })
            }

            questionNumber++
          })
          
          // Verify all questions were processed
          const processedQuestions = questionNumber - 1
          if (processedQuestions !== allQuestions.length) {
            console.error(`❌ Mismatch: Processed ${processedQuestions} questions but expected ${allQuestions.length}`)
          } else {
            console.log(`✅ Completed export row for assessment ${assessment.id}: ${processedQuestions} questions processed`)
          }
          
          // Count how many questions have answers
          const questionsWithAnswers = Object.keys(assessmentRow).filter(key => 
            key.startsWith('Q') && 
            assessmentRow[key] && 
            assessmentRow[key] !== 'No answer provided' &&
            assessmentRow[key].trim() !== ''
          ).length
          console.log(`   Questions with answers: ${questionsWithAnswers} out of ${processedQuestions}`)

          exportData.push(assessmentRow)
        } catch (err) {
          console.error(`Error processing assessment ${assessment.id}:`, err)
          // Add basic row even if detailed fetch fails
          exportData.push({
            'Assessment ID': assessment.id,
            'Contact Name': assessment.contact_name || assessment.user_name || 'Anonymous',
            'Contact Email': assessment.contact_email || assessment.user_email || 'N/A',
            'Company Name': assessment.company_name || 'N/A',
            'Error': 'Failed to load detailed data'
          })
        }
      }

      // Generate CSV
      if (exportData.length === 0) {
        alert('No data to export')
        return
      }

      // Get all unique headers from all rows (ensure all question columns are included)
      const allHeaders = new Set()
      exportData.forEach(row => {
        Object.keys(row).forEach(key => allHeaders.add(key))
      })
      
      // Sort headers: fixed columns first, then question columns in the SAME ORDER as questions were processed
      const fixedHeaders = ['Assessment ID', 'Contact Name', 'Contact Email', 'Company Name', 'Contact Title', 'Submitted At']
      
      // Build question headers in the exact order questions were processed
      const questionHeaders = []
      let questionNum = 1
      allQuestions.forEach(question => {
        const questionText = question.questionText || question.question_text || (question.questionCode || question.question_code)
        const questionHeader = `Q${questionNum}: ${questionText}`
        if (allHeaders.has(questionHeader)) {
          questionHeaders.push(questionHeader)
        }
        questionNum++
      })
      
      // Add any remaining headers that weren't in the question list (shouldn't happen, but just in case)
      const remainingHeaders = Array.from(allHeaders).filter(h => 
        !fixedHeaders.includes(h) && !questionHeaders.includes(h)
      )
      
      const headers = [
        ...fixedHeaders.filter(h => allHeaders.has(h)), 
        ...questionHeaders,
        ...remainingHeaders
      ]
      
      console.log(`📊 Header sequence verification:`)
      console.log(`   Fixed headers: ${fixedHeaders.filter(h => allHeaders.has(h)).length}`)
      console.log(`   Question headers: ${questionHeaders.length}`)
      console.log(`   First 5 question headers:`, questionHeaders.slice(0, 5))
      console.log(`   Last 5 question headers:`, questionHeaders.slice(-5))
      
      console.log(`📊 CSV Export Summary:`)
      console.log(`   Total assessments: ${exportData.length}`)
      console.log(`   Total columns: ${headers.length}`)
      console.log(`   Fixed columns: ${fixedHeaders.filter(h => allHeaders.has(h)).length}`)
      console.log(`   Question columns: ${questionHeaders.length}`)
      console.log(`   First 5 question columns:`, questionHeaders.slice(0, 5))
      console.log(`   Last 5 question columns:`, questionHeaders.slice(-5))

      // Generate CSV content with proper escaping
      const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header]
            // Handle null, undefined, and empty values
            if (value === null || value === undefined) {
              return '""'
            }
            const stringValue = String(value)
            // Escape quotes and wrap in quotes
            return `"${stringValue.replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')
      
      console.log(`✅ CSV content generated: ${csvContent.length} characters`)

      // Verify CSV content before downloading
      const lines = csvContent.split('\n')
      console.log(`📄 CSV Verification:`)
      console.log(`   Total lines: ${lines.length}`)
      console.log(`   Header line: ${lines[0]?.substring(0, 100)}...`)
      if (lines.length > 1) {
        console.log(`   First data line: ${lines[1]?.substring(0, 200)}...`)
        // Count non-empty values in first row
        const firstRowValues = lines[1].split(',').map(v => v.replace(/^"|"$/g, '').trim())
        const nonEmptyValues = firstRowValues.filter(v => v && v !== '' && v !== 'No answer provided').length
        console.log(`   Non-empty values in first row: ${nonEmptyValues} out of ${firstRowValues.length}`)
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      const typeSlug = selectedType.slug || selectedType.name.toLowerCase().replace(/\s+/g, '_')
      link.setAttribute('download', `assessments_${typeSlug}_with_answers_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`✅ Exported ${exportData.length} assessment(s) for "${selectedType.name}"\n` +
            `📊 Total columns: ${headers.length}\n` +
            `❓ Question columns: ${questionHeaders.length}\n` +
            `📝 Check browser console for detailed export information`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting assessments: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getCompletionRate = () => {
    if (!stats) return 0
    return stats.totalUsers > 0 
      ? Math.round((stats.usersWithAssessments / stats.totalUsers) * 100)
      : 0
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const currentAssessments = filteredAssessments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(
    activeTab === 'users' 
      ? filteredUsers.length / itemsPerPage 
      : filteredAssessments.length / itemsPerPage
  )

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-info">
          <h1>📊 SBEAMP Admin Dashboard</h1>
          <p>Welcome back, <strong>{user?.name}</strong></p>
          <span className="admin-badge">Administrator</span>
        </div>
        <div className="admin-header-actions">
          <Link
            to="/"
            className="btn-secondary"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            📝 Assessment Form
          </Link>
          <button onClick={logout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📈 Statistics  
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length || 0})
        </button>
        <button
          className={activeTab === 'assessments' ? 'active' : ''}
          onClick={() => setActiveTab('assessments')}
        >
          📋 Assessments ({assessments.length || 0})
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          📁 Categories ({categories.length || 0})
        </button>
        <button
          className={activeTab === 'questions' ? 'active' : ''}
          onClick={() => setActiveTab('questions')}
        >
          ❓ Questions ({questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0) || 0})
        </button>
        <button
          className={activeTab === 'assessment-types' ? 'active' : ''}
          onClick={() => setActiveTab('assessment-types')}
        >
          📑 Assessment Types ({assessmentTypes.length || 0})
        </button>
      </div>

      <div className="admin-content">
        {error && <div className="error-message">❌ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'stats' && (
              <div className="stats-section">
                {stats ? (
                  <>
                <div className="stats-grid">
                      <div className="stat-card primary" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="stat-icon" style={{ fontSize: '3.5em', opacity: 0.9 }}>👥</div>
                    <div className="stat-info">
                          <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.1em' }}>Total Users</h3>
                          <p className="stat-number" style={{ color: 'white', fontSize: '2.5em', fontWeight: '700', margin: '10px 0' }}>
                            {stats.totalUsers || 0}
                          </p>
                          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9em' }}>Registered users</span>
                    </div>
                  </div>
                  
                      <div className="stat-card success" style={{
                        background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(39, 174, 96, 0.3)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="stat-icon" style={{ fontSize: '3.5em', opacity: 0.9 }}>✅</div>
                    <div className="stat-info">
                          <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.1em' }}>Completed Assessments</h3>
                          <p className="stat-number" style={{ color: 'white', fontSize: '2.5em', fontWeight: '700', margin: '10px 0' }}>
                            {stats.totalAssessments || 0}
                          </p>
                          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9em' }}>Total submissions</span>
                    </div>
                  </div>
                  
                      <div className="stat-card warning" style={{
                        background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(243, 156, 18, 0.3)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="stat-icon" style={{ fontSize: '3.5em', opacity: 0.9 }}>📊</div>
                    <div className="stat-info">
                          <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.1em' }}>Completion Rate</h3>
                          <p className="stat-number" style={{ color: 'white', fontSize: '2.5em', fontWeight: '700', margin: '10px 0' }}>
                            {stats.totalUsers > 0 ? Math.round((stats.usersWithAssessments / stats.totalUsers) * 100) : 0}%
                          </p>
                          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9em' }}>
                            {stats.usersWithAssessments || 0} of {stats.totalUsers || 0} users
                          </span>
                    </div>
                  </div>
                  
                      <div className="stat-card danger" style={{
                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(231, 76, 60, 0.3)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="stat-icon" style={{ fontSize: '3.5em', opacity: 0.9 }}>🔐</div>
                    <div className="stat-info">
                          <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.1em' }}>Administrators</h3>
                          <p className="stat-number" style={{ color: 'white', fontSize: '2.5em', fontWeight: '700', margin: '10px 0' }}>
                            {stats.totalAdmins || 0}
                          </p>
                          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9em' }}>Admin accounts</span>
                    </div>
                  </div>
                </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                      gap: '20px',
                      marginTop: '30px'
                    }}>
                      <div className="detail-card" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        borderLeft: '5px solid #667eea'
                      }}>
                        <h3 style={{ color: '#667eea', marginBottom: '20px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          📈 Activity Overview
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#f8f9ff',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Users with Assessments:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#667eea', fontSize: '1.1em' }}>
                              {stats.usersWithAssessments || 0}
                            </span>
                    </div>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#f8f9ff',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Users without Assessments:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.1em' }}>
                              {(stats.totalUsers || 0) - (stats.usersWithAssessments || 0)}
                            </span>
                    </div>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#f8f9ff',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Regular Users:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#27ae60', fontSize: '1.1em' }}>
                              {(stats.totalUsers || 0) - (stats.totalAdmins || 0)}
                            </span>
                    </div>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#f8f9ff',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Anonymous Assessments:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#f39c12', fontSize: '1.1em' }}>
                              {stats.anonymousAssessments || 0}
                            </span>
                  </div>
                </div>
              </div>

                      <div className="detail-card" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        borderLeft: '5px solid #27ae60'
                      }}>
                        <h3 style={{ color: '#27ae60', marginBottom: '20px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          📊 Assessment Insights
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#f0fdf4',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Average Score:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#27ae60', fontSize: '1.1em' }}>
                              {stats.averageScore || 0}%
                            </span>
                          </div>
                          {stats.readinessDistribution && Object.keys(stats.readinessDistribution).length > 0 && (
                            <>
                              <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666', fontWeight: '600' }}>
                                Readiness Distribution:
                              </div>
                              {Object.entries(stats.readinessDistribution).map(([level, count]) => (
                                <div key={level} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '10px',
                                  background: '#f0fdf4',
                                  borderRadius: '8px',
                                  marginTop: '6px'
                                }}>
                                  <span style={{ fontWeight: '500', color: '#333' }}>{level}:</span>
                                  <span style={{ 
                                    fontWeight: '700', 
                                    color: '#27ae60', 
                                    fontSize: '1em',
                                    padding: '4px 12px',
                                    background: '#d1fae5',
                                    borderRadius: '12px'
                                  }}>
                                    {count}
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="detail-card" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        borderLeft: '5px solid #f39c12'
                      }}>
                        <h3 style={{ color: '#f39c12', marginBottom: '20px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          📑 Content Overview
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#fffbf0',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Assessment Types:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#f39c12', fontSize: '1.1em' }}>
                              {assessmentTypes.length || 0}
                            </span>
                          </div>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#fffbf0',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Categories:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#f39c12', fontSize: '1.1em' }}>
                              {categories.length || 0}
                            </span>
                          </div>
                          <div className="detail-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#fffbf0',
                            borderRadius: '8px'
                          }}>
                            <span className="detail-label" style={{ fontWeight: '600', color: '#333' }}>Questions:</span>
                            <span className="detail-value" style={{ fontWeight: '700', color: '#f39c12', fontSize: '1.1em' }}>
                              {questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0) || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                    <div style={{ fontSize: '4em', marginBottom: '20px' }}>📊</div>
                    <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>Loading statistics...</p>
                    <p style={{ fontSize: '0.9em', color: '#999' }}>Please wait while we gather your data</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="table-section">
                <div className="table-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <div className="table-info">
                    <h2 style={{ margin: 0, fontSize: '1.8em', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      👥 Users
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '0.95em' }}>
                      Total Users: <strong style={{ color: '#667eea' }}>{users.length}</strong> | Showing: {filteredUsers.length}
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'white',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      padding: '0 12px',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    >
                      <span style={{ 
                        fontSize: '1.2em', 
                        marginRight: '8px',
                        color: '#667eea'
                      }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ 
                          padding: '10px 0',
                          border: 'none',
                          outline: 'none',
                          fontSize: '0.95em',
                          width: '250px',
                          background: 'transparent'
                        }}
                      />
                      {userSearch && (
                        <button
                          onClick={() => setUserSearch('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2em',
                            color: '#999',
                            padding: '0',
                            marginLeft: '8px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ 
                          padding: '10px 40px 10px 12px',
                          borderRadius: '10px',
                          border: '2px solid #e0e0e0',
                          fontSize: '0.95em',
                          fontWeight: '500',
                          background: 'white',
                          color: '#333',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0'
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                      <option value="all">All Roles</option>
                        <option value="user">👤 Users Only</option>
                        <option value="admin">👑 Admins Only</option>
                    </select>
                    </div>
                    <button
                      onClick={() => {
                        setEditingUser(null)
                        setShowUserModal(true)
                      }}
                      style={{ 
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1em',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      ➕ Create New User
                    </button>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>🔍 No users found matching your search criteria</p>
                  </div>
                ) : (
                  <>
                    <div className="table-container" style={{ 
                      background: 'white', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                        <thead>
                          <tr style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>ID</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>Name</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Assessments</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Role</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.map((u, index) => {
                            const userAssessmentsCount = assessments.filter(a => a.user_id === u.id).length
                            return (
                              <tr 
                                key={u.id}
                                style={{ 
                                  borderBottom: '1px solid #e0e0e0',
                                  background: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0f4ff'
                                  e.currentTarget.style.transform = 'scale(1.01)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                  e.currentTarget.style.transform = 'scale(1)'
                                }}
                              >
                                <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>#{u.id}</td>
                                <td style={{ padding: '16px' }}>
                                  <strong style={{ fontSize: '1.05em', color: '#333' }}>{u.name}</strong>
                              </td>
                                <td style={{ padding: '16px', color: '#666' }}>{u.email}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    background: '#e0e7ff',
                                    color: '#667eea',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    fontSize: '0.9em',
                                    minWidth: '40px'
                                  }}>
                                    {userAssessmentsCount || 0}
                                  </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <span className={`role-badge ${u.role}`} style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.85em',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                    background: u.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                                    color: u.role === 'admin' ? '#92400e' : '#667eea'
                                  }}>
                                  {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                </span>
                              </td>
                                <td style={{ padding: '16px' }}>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button
                                      onClick={() => setViewingUser(u)}
                                      style={{ 
                                        fontSize: '0.85em', 
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        background: '#667eea',
                                        color: 'white'
                                      }}
                                    >
                                      👁️ View
                                    </button>
                              <button
                                onClick={() => {
                                        setEditingUser(u)
                                        setShowUserModal(true)
                                      }}
                                      style={{ 
                                        fontSize: '0.85em', 
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        background: '#ffc107',
                                        color: '#000'
                                      }}
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Are you sure you want to delete user "${u.name}"?`)) {
                                          try {
                                            await adminAPI.deleteUser(u.id)
                                            alert('User deleted successfully!')
                                            loadData()
                                          } catch (err) {
                                            alert('Failed to delete: ' + err.message)
                                          }
                                        }
                                      }}
                                      style={{ 
                                        fontSize: '0.85em', 
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        background: '#dc3545',
                                        color: '#fff'
                                      }}
                                    >
                                      🗑️ Delete
                              </button>
                                  </div>
                              </td>
                            </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="page-btn"
                        >
                          ← Previous
                        </button>
                        <span className="page-info">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="page-btn"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'assessments' && (
              <div className="table-section">
                <div className="table-header">
                  <div className="search-filters">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search by user name, email, or company..."
                        value={assessmentSearch}
                        onChange={(e) => setAssessmentSearch(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <select
                      value={assessmentTypeFilter}
                      onChange={(e) => setAssessmentTypeFilter(e.target.value)}
                      className="filter-select"
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#333',
                        cursor: 'pointer',
                        minWidth: '250px',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="all">All Assessment Types</option>
                      {assessmentTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon || '📝'} {type.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={exportAssessmentsWithAnswers}
                      className="btn-export"
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#5568d3'
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#667eea'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      📥 Export with Answers
                    </button>
                  </div>
                  <div className="table-info">
                    Showing {filteredAssessments.length} of {assessments.length} assessments
                  </div>
                </div>

                {filteredAssessments.length === 0 ? (
                  <div className="empty-state">
                    <p>🔍 No assessments found matching your search criteria</p>
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAssessments.map((assessment) => (
                            <tr key={assessment.id}>
                              <td className="id-cell">#{assessment.id}</td>
                              <td className="name-cell">
                                <strong>{assessment.user_name || assessment.contact_name || 'Anonymous'}</strong>
                              </td>
                              <td className="email-cell">{assessment.user_email || assessment.contact_email || <span className="na-text">N/A</span>}</td>
                              <td>{assessment.company_name || <span className="na-text">N/A</span>}</td>
                              <td className="date-cell">{formatDate(assessment.submitted_at)}</td>
                              <td>
                                <button
                                  onClick={() => handleViewAssessment(assessment.id)}
                                  className="btn-view"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="page-btn"
                        >
                          ← Previous
                        </button>
                        <span className="page-info">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="page-btn"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="table-section">
                <div className="table-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <div className="table-info">
                    <h2 style={{ margin: 0, fontSize: '1.8em', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      📁 Categories
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '0.95em' }}>
                      Total Categories: <strong style={{ color: '#667eea' }}>{categories.length}</strong> | Showing: {filteredCategories.length}
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ 
                          padding: '10px 40px 10px 12px',
                          borderRadius: '10px',
                          border: '2px solid #e0e0e0',
                          fontSize: '0.95em',
                          fontWeight: '500',
                          background: 'white',
                          color: '#333',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          minWidth: '200px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0'
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        <option value="all">📋 All Assessment Types</option>
                        {assessmentTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.icon || '📝'} {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory(null)
                        setShowCategoryModal(true)
                      }}
                      style={{ 
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1em',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      ➕ Create New Category
                    </button>
                  </div>
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="empty-state">
                    <p>🔍 No categories found{categoryFilter !== 'all' ? ' for selected assessment type' : ''}</p>
                  </div>
                ) : (
                  <div className="table-container" style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                      <thead>
                        <tr style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white'
                        }}>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>ID</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>Name</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>Assessment Type</th>
                          <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Questions</th>
                          <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Display Order</th>
                          <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((cat, index) => {
                          const questionCount = questions.find(c => c.id === cat.id)?.questions?.length || 0
                          const assessmentType = assessmentTypes.find(at => at.id === (cat.assessment_type_id || cat.assessmentTypeId))
                          return (
                            <tr 
                              key={cat.id}
                              style={{ 
                                borderBottom: '1px solid #e0e0e0',
                                background: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0f4ff'
                                e.currentTarget.style.transform = 'scale(1.01)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>#{cat.id}</td>
                              <td style={{ padding: '16px' }}>
                                <div>
                                  <strong style={{ fontSize: '1.05em', color: '#333', display: 'block', marginBottom: '4px' }}>
                                    {cat.name}
                                  </strong>
                                  {cat.description && (
                                    <span style={{ 
                                      fontSize: '0.85em', 
                                      color: '#666', 
                                      display: 'block',
                                      maxWidth: '300px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {cat.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '16px', color: '#666' }}>
                                {assessmentType?.name || 'N/A'}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <span style={{ 
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  background: '#e0e7ff',
                                  color: '#667eea',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  fontSize: '0.9em',
                                  minWidth: '40px'
                                }}>
                                  {questionCount}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                                {cat.display_order || cat.displayOrder || 0}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => {
                                      setEditingCategory(cat)
                                      setShowCategoryModal(true)
                                    }}
                                    style={{ 
                                      fontSize: '0.85em', 
                                      padding: '8px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s',
                                      background: '#ffc107',
                                      color: '#000'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'translateY(-2px)'
                                      e.target.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'translateY(0)'
                                      e.target.style.boxShadow = 'none'
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                        try {
                                          await adminAPI.deleteCategory(cat.id)
                                          alert('Category deleted successfully!')
                                          loadData()
                                        } catch (err) {
                                          alert('Failed to delete: ' + err.message)
                                        }
                                      }
                                    }}
                                    style={{ 
                                      fontSize: '0.85em', 
                                      padding: '8px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s',
                                      background: '#dc3545',
                                      color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'translateY(-2px)'
                                      e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'translateY(0)'
                                      e.target.style.boxShadow = 'none'
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="table-section">
                {/* Header Section */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '30px',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}>
                    <div>
                      <h2 style={{ 
                        margin: 0, 
                        fontSize: '2em', 
                        fontWeight: '700',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        ❓ Questions
                      </h2>
                      <p style={{ 
                        margin: '12px 0 0 0', 
                        color: 'rgba(255,255,255,0.9)', 
                        fontSize: '1.05em',
                        fontWeight: '500'
                      }}>
                        Total Questions: <strong style={{ fontSize: '1.2em' }}>{filteredQuestions.length || questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)}</strong>
                        {filteredQuestions.length !== questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0) && (
                          <span style={{ marginLeft: '12px', opacity: 0.8 }}>
                            (Showing {filteredQuestions.length} filtered)
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        // Ensure categories are loaded before opening modal
                        try {
                          const response = await adminAPI.getAllCategories()
                          if (response && response.success) {
                            setCategories(response.categories || [])
                            setFilteredCategories(response.categories || [])
                          }
                        } catch (err) {
                          console.error('Error loading categories:', err)
                        }
                        setEditingQuestion(null)
                        setShowQuestionModal(true)
                      }}
                      style={{ 
                        padding: '14px 28px',
                        borderRadius: '10px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1em',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.25)'
                        e.target.style.borderColor = 'rgba(255,255,255,0.5)'
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.15)'
                        e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      ➕ Create New Question
                    </button>
                  </div>
                </div>

                {/* Filters Section */}
                <div style={{
                  background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e7ff'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #e0e7ff'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2em'
                    }}>
                      🔍
                    </div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.3em', 
                      color: '#333', 
                      fontWeight: '700'
                    }}>
                      Filter Questions
                    </h3>
                    {(questionSearch || questionCategoryFilter !== 'all' || questionAssessmentTypeFilter !== 'all' || questionTypeFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setQuestionSearch('')
                          setQuestionCategoryFilter('all')
                          setQuestionAssessmentTypeFilter('all')
                          setQuestionTypeFilter('all')
                        }}
                        style={{
                          marginLeft: 'auto',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #dc3545',
                          background: 'white',
                          color: '#dc3545',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.9em',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#dc3545'
                          e.target.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'white'
                          e.target.style.color = '#dc3545'
                        }}
                      >
                        🗑️ Clear Filters
                      </button>
                    )}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    alignItems: 'start'
                  }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '0.95em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.1em' }}>🔎</span> Search Questions
                      </label>
                      <div style={{ 
                        position: 'relative',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <input
                          type="text"
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                          placeholder="Search by question text, code, or category..."
                          style={{
                            width: '100%',
                            padding: '14px 50px 14px 50px',
                            borderRadius: '12px',
                            border: '2px solid #e0e0e0',
                            fontSize: '1em',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            fontFamily: 'inherit',
                            lineHeight: '1.5',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)'
                            e.target.style.background = '#fafbff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0'
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                            e.target.style.background = 'white'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          left: '18px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '1.1em',
                          pointerEvents: 'none',
                          opacity: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px'
                        }}>
                          🔍
                        </div>
                        {questionSearch && (
                          <button
                            onClick={() => setQuestionSearch('')}
                            type="button"
                            style={{
                              position: 'absolute',
                              right: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: '#f0f0f0',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1em',
                              padding: '6px 8px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              color: '#666',
                              width: '28px',
                              height: '28px',
                              lineHeight: '1'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#667eea'
                              e.target.style.color = 'white'
                              e.target.style.transform = 'translateY(-50%) scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#f0f0f0'
                              e.target.style.color = '#666'
                              e.target.style.transform = 'translateY(-50%) scale(1)'
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Assessment Type Filter */}
                    <div style={{ width: '100%' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '0.95em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.1em' }}>📑</span> Assessment Type
                      </label>
                      <select
                        value={questionAssessmentTypeFilter}
                        onChange={(e) => setQuestionAssessmentTypeFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          fontSize: '1em',
                          background: 'white',
                          color: '#333',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23667eea' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 18px center',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          boxSizing: 'border-box',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)'
                          e.target.style.background = '#fafbff'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0'
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                          e.target.style.background = 'white'
                        }}
                      >
                        <option value="all">All Assessment Types</option>
                        {assessmentTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.icon || '📝'} {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div style={{ width: '100%' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '0.95em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.1em' }}>📁</span> Category
                      </label>
                      <select
                        value={questionCategoryFilter}
                        onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          fontSize: '1em',
                          background: 'white',
                          color: '#333',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23667eea' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 18px center',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          boxSizing: 'border-box',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)'
                          e.target.style.background = '#fafbff'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0'
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                          e.target.style.background = 'white'
                        }}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Question Type Filter */}
                    <div style={{ width: '100%' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '0.95em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.1em' }}>📝</span> Question Type
                      </label>
                      <select
                        value={questionTypeFilter}
                        onChange={(e) => setQuestionTypeFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          fontSize: '1em',
                          background: 'white',
                          color: '#333',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23667eea' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 18px center',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          boxSizing: 'border-box',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)'
                          e.target.style.background = '#fafbff'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0'
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                          e.target.style.background = 'white'
                        }}
                      >
                        <option value="all">All Types</option>
                        <option value="text">Text</option>
                        <option value="scale">Scale</option>
                        <option value="yes_no">Yes/No</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="percentage_range">Percentage Range</option>
                        <option value="group">Group</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredQuestions.length === 0 && questions.length > 0 ? (
                  <div className="empty-state" style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ fontSize: '1.2em', color: '#999', margin: 0 }}>🔍 No questions found matching your filters</p>
                    <button
                      onClick={() => {
                        setQuestionSearch('')
                        setQuestionCategoryFilter('all')
                        setQuestionAssessmentTypeFilter('all')
                        setQuestionTypeFilter('all')
                      }}
                      style={{
                        marginTop: '16px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#667eea',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="empty-state" style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ fontSize: '1.2em', color: '#999', margin: 0 }}>🔍 No questions found</p>
                  </div>
                ) : (
                  <div className="table-container" style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e7ff'
                  }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table" style={{ 
                        width: '100%', 
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                        margin: 0
                      }}>
                        <thead>
                          <tr style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'left', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              ID
                            </th>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'left', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              Question
                            </th>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'left', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              Helper Text
                            </th>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'left', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              Category
                            </th>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'left', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              Created Date
                            </th>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'left', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              Last Updated
                            </th>
                            <th style={{ 
                              padding: '18px 20px', 
                              textAlign: 'center', 
                              fontWeight: '700', 
                              fontSize: '0.95em',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuestions.map((q, index) => {
                            // Find category name for this question
                            const category = categories.find(cat => cat.id === q.categoryId) || 
                                           questions.find(cat => cat.id === q.categoryId)
                            const categoryName = q.categoryName || category?.name || 'N/A'
                            
                            return (
                              <tr 
                                key={q.id || q.question_code || index}
                                style={{ 
                                  borderBottom: index < filteredQuestions.length - 1 ? '1px solid #e8e8e8' : 'none',
                                  background: index % 2 === 0 ? '#ffffff' : '#fafbff',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0f4ff'
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.1)'
                                  e.currentTarget.style.transform = 'translateX(4px)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafbff'
                                  e.currentTarget.style.boxShadow = 'none'
                                  e.currentTarget.style.transform = 'translateX(0)'
                                }}
                              >
                                <td style={{ 
                                  padding: '18px 20px', 
                                  fontWeight: '700', 
                                  color: '#667eea',
                                  fontSize: '1em'
                                }}>
                                  #{q.id || 'N/A'}
                                </td>
                                <td style={{ 
                                  padding: '18px 20px', 
                                  maxWidth: '450px',
                                  lineHeight: '1.5'
                                }}>
                                  <div style={{ 
                                    fontSize: '1em', 
                                    color: '#2c3e50', 
                                    fontWeight: '500',
                                    display: 'block'
                                  }}>
                                    {q.questionText || q.question_text || 'N/A'}
                                  </div>
                                </td>
                                <td style={{ 
                                  padding: '18px 20px', 
                                  maxWidth: '350px',
                                  lineHeight: '1.4'
                                }}>
                                  <div style={{ 
                                    fontSize: '0.9em', 
                                    color: '#666', 
                                    fontStyle: 'italic',
                                    display: 'block'
                                  }}>
                                    {q.helpText || q.help_text || (
                                      <span style={{ color: '#999' }}>No helper text</span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '18px 20px' }}>
                                  <span style={{
                                    padding: '6px 14px',
                                    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                    color: '#2e7d32',
                                    borderRadius: '20px',
                                    fontSize: '0.85em',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                    border: '1px solid #a5d6a7'
                                  }}>
                                    {categoryName}
                                  </span>
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'left' }}>
                                  <div style={{ 
                                    fontSize: '0.9em', 
                                    color: '#555',
                                    fontWeight: '500'
                                  }}>
                                    {q.created_at || q.createdAt ? formatDateOnly(q.created_at || q.createdAt) : (
                                      <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'left' }}>
                                  <div style={{ 
                                    fontSize: '0.9em', 
                                    color: '#555',
                                    fontWeight: '500'
                                  }}>
                                    {q.updated_at || q.updatedAt ? formatDateOnly(q.updated_at || q.updatedAt) : (
                                      <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '18px 20px' }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    gap: '10px', 
                                    flexWrap: 'nowrap', 
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  }}>
                                    <button
                                      onClick={() => setViewingQuestion({ ...q, categoryName })}
                                      style={{ 
                                        fontSize: '0.9em', 
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        transition: 'all 0.3s ease',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        boxShadow: '0 3px 10px rgba(102, 126, 234, 0.35)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        whiteSpace: 'nowrap',
                                        minWidth: '100px',
                                        justifyContent: 'center'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px) scale(1.05)'
                                        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)'
                                        e.target.style.boxShadow = '0 3px 10px rgba(102, 126, 234, 0.35)'
                                      }}
                                    >
                                      <span style={{ fontSize: '1.1em' }}>👁️</span>
                                      <span>View</span>
                                    </button>
                                    <button
                                      onClick={async () => {
                                        // Ensure categories are loaded before opening modal
                                        try {
                                          const response = await adminAPI.getAllCategories()
                                          if (response && response.success) {
                                            setCategories(response.categories || [])
                                            setFilteredCategories(response.categories || [])
                                          }
                                        } catch (err) {
                                          console.error('Error loading categories:', err)
                                        }
                                        setEditingQuestion(q)
                                        setShowQuestionModal(true)
                                      }}
                                      style={{ 
                                        fontSize: '0.9em', 
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        border: '2px solid #ffc107',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        transition: 'all 0.3s ease',
                                        background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
                                        color: '#000',
                                        boxShadow: '0 3px 10px rgba(255, 193, 7, 0.35)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        whiteSpace: 'nowrap',
                                        minWidth: '100px',
                                        justifyContent: 'center'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px) scale(1.05)'
                                        e.target.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.5)'
                                        e.target.style.borderColor = '#ffb300'
                                        e.target.style.background = 'linear-gradient(135deg, #ffb300 0%, #ffa000 100%)'
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)'
                                        e.target.style.boxShadow = '0 3px 10px rgba(255, 193, 7, 0.35)'
                                        e.target.style.borderColor = '#ffc107'
                                        e.target.style.background = 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)'
                                      }}
                                    >
                                      <span style={{ fontSize: '1.1em' }}>✏️</span>
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Are you sure you want to delete this question?`)) {
                                          try {
                                            await adminAPI.deleteQuestion(q.id || q.question_code)
                                            alert('Question deleted successfully!')
                                            loadData()
                                          } catch (err) {
                                            alert('Failed to delete: ' + err.message)
                                          }
                                        }
                                      }}
                                      style={{ 
                                        fontSize: '0.9em', 
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        border: '2px solid #dc3545',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        transition: 'all 0.3s ease',
                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                        color: '#fff',
                                        boxShadow: '0 3px 10px rgba(220, 53, 69, 0.35)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        whiteSpace: 'nowrap',
                                        minWidth: '100px',
                                        justifyContent: 'center'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px) scale(1.05)'
                                        e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.5)'
                                        e.target.style.borderColor = '#c82333'
                                        e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)'
                                        e.target.style.boxShadow = '0 3px 10px rgba(220, 53, 69, 0.35)'
                                        e.target.style.borderColor = '#dc3545'
                                        e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                                      }}
                                    >
                                      <span style={{ fontSize: '1.1em' }}>🗑️</span>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assessment-types' && (
              <div className="table-section">
                <div className="table-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <div className="table-info">
                    <h2 style={{ 
                      margin: 0, 
                      fontSize: '1.8em', 
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      📑 Assessment Types
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '0.95em' }}>
                      Total Assessment Types: <strong style={{ color: '#667eea' }}>{assessmentTypes.length}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAssessmentType(null)
                      setShowAssessmentTypeModal(true)
                    }}
                    className="btn-primary"
                    style={{ 
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1em',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    ➕ Create New Assessment Type
                  </button>
                </div>

                {assessmentTypes.length === 0 ? (
                  <div className="empty-state">
                    <p>🔍 No assessment types found</p>
                  </div>
                ) : (
                  <>
                    <div className="table-container" style={{ 
                      background: 'white', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <table className="admin-table" style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        margin: 0
                      }}>
                        <thead>
                          <tr style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>ID</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Icon</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>Name</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Categories</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Questions</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Assessments</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessmentTypes.map((type, index) => (
                            <tr 
                              key={type.id}
                              style={{ 
                                borderBottom: '1px solid #e0e0e0',
                                background: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0f4ff'
                                e.currentTarget.style.transform = 'scale(1.01)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>#{type.id}</td>
                              <td style={{ padding: '16px', textAlign: 'center', fontSize: '1.8em' }}>
                                {type.icon || '📝'}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div>
                                  <strong style={{ fontSize: '1.05em', color: '#333', display: 'block', marginBottom: '4px' }}>
                                    {type.name}
                                  </strong>
                                  {type.description && (
                                    <span style={{ 
                                      fontSize: '0.85em', 
                                      color: '#666', 
                                      display: 'block',
                                      maxWidth: '300px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {type.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <span style={{ 
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  background: '#e0e7ff',
                                  color: '#667eea',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  fontSize: '0.9em',
                                  minWidth: '40px'
                                }}>
                                  {type.category_count || 0}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <span style={{ 
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  background: '#e0e7ff',
                                  color: '#667eea',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  fontSize: '0.9em',
                                  minWidth: '40px'
                                }}>
                                  {type.question_count || 0}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <span style={{ 
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  background: '#e0e7ff',
                                  color: '#667eea',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  fontSize: '0.9em',
                                  minWidth: '40px'
                                }}>
                                  {type.assessment_count || 0}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <span className={`status-badge ${(type.is_active || type.isActive) ? 'active' : 'inactive'}`} style={{
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.85em',
                                  fontWeight: '600',
                                  display: 'inline-block'
                                }}>
                                  {(type.is_active || type.isActive) ? '✅ Active' : '❌ Inactive'}
                                </span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => {
                                      setViewingAssessmentType(type)
                                    }}
                                    className="btn-view"
                                    style={{ 
                                      fontSize: '0.85em', 
                                      padding: '8px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s',
                                      background: '#667eea',
                                      color: 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = '#5568d3'
                                      e.target.style.transform = 'translateY(-2px)'
                                      e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = '#667eea'
                                      e.target.style.transform = 'translateY(0)'
                                      e.target.style.boxShadow = 'none'
                                    }}
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAssessmentType(type)
                                      setShowAssessmentTypeModal(true)
                                    }}
                                    className="btn-view"
                                    style={{ 
                                      fontSize: '0.85em', 
                                      padding: '8px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s',
                                      background: '#ffc107',
                                      color: '#000'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = '#e0a800'
                                      e.target.style.transform = 'translateY(-2px)'
                                      e.target.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = '#ffc107'
                                      e.target.style.transform = 'translateY(0)'
                                      e.target.style.boxShadow = 'none'
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
                                        try {
                                          await adminAPI.deleteAssessmentType(type.id)
                                          alert('Assessment type deleted successfully!')
                                          loadData()
                                        } catch (err) {
                                          alert('Failed to delete: ' + err.message)
                                        }
                                      }
                                    }}
                                    className="btn-view"
                                    style={{ 
                                      fontSize: '0.85em', 
                                      padding: '8px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s',
                                      background: '#dc3545',
                                      color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = '#c82333'
                                      e.target.style.transform = 'translateY(-2px)'
                                      e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = '#dc3545'
                                      e.target.style.transform = 'translateY(0)'
                                      e.target.style.boxShadow = 'none'
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const newStatus = !(type.is_active || type.isActive)
                                      try {
                                        await adminAPI.updateAssessmentType(type.id, { is_active: newStatus })
                                        alert(`Assessment type ${newStatus ? 'activated' : 'deactivated'} successfully!`)
                                        loadData()
                                      } catch (err) {
                                        alert('Failed to update status: ' + err.message)
                                      }
                                    }}
                                    className="btn-view"
                                    style={{ 
                                      fontSize: '0.85em', 
                                      padding: '8px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s',
                                      background: (type.is_active || type.isActive) ? '#6c757d' : '#28a745',
                                      color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'translateY(-2px)'
                                      e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'translateY(0)'
                                      e.target.style.boxShadow = 'none'
                                    }}
                                  >
                                    {(type.is_active || type.isActive) ? '🚫 Deactivate' : '✅ Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Assessment Type Modal for Create/Edit */}
      {showAssessmentTypeModal && (
        <AssessmentTypeModal
          assessmentType={editingAssessmentType}
          onClose={() => {
            setShowAssessmentTypeModal(false)
            setEditingAssessmentType(null)
          }}
          onSave={async (formData) => {
            try {
              if (editingAssessmentType?.id) {
                // Update existing
                await adminAPI.updateAssessmentType(editingAssessmentType.id, formData)
                alert('Assessment type updated successfully!')
              } else {
                // Create new
                await adminAPI.createAssessmentType(formData)
                alert('Assessment type created successfully!')
              }
              setShowAssessmentTypeModal(false)
              setEditingAssessmentType(null)
              // Reload all data including categories to ensure new assessment type's categories are available
              await loadAllData()
              loadData()
            } catch (err) {
              alert('Failed to save: ' + err.message)
            }
          }}
        />
      )}

      {/* View Assessment Type Modal */}
      {viewingAssessmentType && (
        <div className="modal-overlay" onClick={() => setViewingAssessmentType(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📑 Assessment Type Details</h2>
              <button onClick={() => setViewingAssessmentType(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="assessment-details">
                <div className="detail-section highlight">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong> {viewingAssessmentType.name}
                    </div>
                    <div className="info-item">
                      <strong>Icon:</strong> {viewingAssessmentType.icon || '📝'}
                    </div>
                    <div className="info-item">
                      <strong>Slug:</strong> {viewingAssessmentType.slug || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Status:</strong>
                      <span className={`status-badge ${(viewingAssessmentType.is_active || viewingAssessmentType.isActive) ? 'active' : 'inactive'}`}>
                        {(viewingAssessmentType.is_active || viewingAssessmentType.isActive) ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                      <div className="info-item full-width">
                      <strong>Description:</strong>
                      <p style={{ marginTop: '5px', color: '#666' }}>
                        {viewingAssessmentType.description || 'N/A'}
                      </p>
                      </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Related Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Categories:</strong> <span style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1em' }}>{viewingAssessmentType.category_count || 0}</span>
                    </div>
                    <div className="info-item">
                      <strong>Questions:</strong> <span style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1em' }}>{viewingAssessmentType.question_count || 0}</span>
                    </div>
                    <div className="info-item">
                      <strong>Assessments:</strong> <span style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1em' }}>{viewingAssessmentType.assessment_count || 0}</span>
                    </div>
                    <div className="info-item">
                      <strong>Display Order:</strong> {viewingAssessmentType.display_order || viewingAssessmentType.displayOrder || 0}
                    </div>
                  </div>
                </div>

                {viewingAssessmentType.settings && Object.keys(viewingAssessmentType.settings).length > 0 && (
                <div className="detail-section">
                    <h3>Settings</h3>
                    <div className="info-grid">
                      {viewingAssessmentType.settings.singleQuestionMode && (
                        <div className="info-item">
                          <strong>Single Question Mode:</strong> ✅ Enabled
                        </div>
                      )}
                  </div>
                </div>
                )}

                <div className="detail-section highlight">
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Created At:</strong> {formatDate(viewingAssessmentType.created_at || viewingAssessmentType.createdAt)}
                  </div>
                    <div className="info-item">
                      <strong>Updated At:</strong> {formatDate(viewingAssessmentType.updated_at || viewingAssessmentType.updatedAt)}
                </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setViewingAssessmentType(null)
                  setEditingAssessmentType(viewingAssessmentType)
                  setShowAssessmentTypeModal(true)
                }}
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                ✏️ Edit
              </button>
              <button onClick={() => setViewingAssessmentType(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal for Create/Edit */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowUserModal(false)
            setEditingUser(null)
          }}
          onSave={async (formData) => {
            try {
              if (editingUser?.id) {
                await adminAPI.updateUser(editingUser.id, formData)
                alert('User updated successfully!')
              } else {
                await adminAPI.createUser(formData)
                alert('User created successfully!')
              }
              setShowUserModal(false)
              setEditingUser(null)
              loadData()
            } catch (err) {
              alert('Failed to save: ' + err.message)
            }
          }}
        />
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 User Details</h2>
              <button onClick={() => setViewingUser(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="assessment-details">
                <div className="detail-section highlight">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong> {viewingUser.name}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {viewingUser.email}
                    </div>
                    <div className="info-item">
                      <strong>Role:</strong>
                      <span className={`role-badge ${viewingUser.role}`} style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85em',
                        fontWeight: '600',
                        display: 'inline-block',
                        marginLeft: '10px',
                        background: viewingUser.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                        color: viewingUser.role === 'admin' ? '#92400e' : '#667eea'
                      }}>
                        {viewingUser.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </div>
                    <div className="info-item">
                      <strong>Created At:</strong> {formatDate(viewingUser.created_at)}
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Related Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Assessments:</strong> <span style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1em' }}>
                        {assessments.filter(a => a.user_id === viewingUser.id).length}
                      </span>
                  </div>
                </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setViewingUser(null)
                  setEditingUser(viewingUser)
                  setShowUserModal(true)
                }}
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                ✏️ Edit
              </button>
              <button onClick={() => setViewingUser(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal for Create/Edit */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          adminAPI={adminAPI}
          onClose={() => {
            setShowCategoryModal(false)
            setEditingCategory(null)
          }}
          onSave={async (formData) => {
            try {
              if (editingCategory?.id) {
                await adminAPI.updateCategory(editingCategory.id, formData)
                alert('Category updated successfully!')
              } else {
                await adminAPI.createCategory(formData)
                alert('Category created successfully!')
              }
              setShowCategoryModal(false)
              setEditingCategory(null)
              // Reload categories to ensure new category is available for questions
              const categoriesResponse = await adminAPI.getAllCategories()
              if (categoriesResponse && categoriesResponse.success) {
                setCategories(categoriesResponse.categories || [])
                setFilteredCategories(categoriesResponse.categories || [])
              }
              loadData()
            } catch (err) {
              alert('Failed to save: ' + err.message)
            }
          }}
        />
      )}

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="modal-overlay" onClick={() => setViewingCategory(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📁 Category Details</h2>
              <button onClick={() => setViewingCategory(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="assessment-details">
                <div className="detail-section highlight">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong> {viewingCategory.name}
                    </div>
                    <div className="info-item full-width">
                      <strong>Description:</strong>
                      <p style={{ marginTop: '5px', color: '#666' }}>
                        {viewingCategory.description || 'N/A'}
                      </p>
                    </div>
                    <div className="info-item">
                      <strong>Display Order:</strong> {viewingCategory.display_order || viewingCategory.displayOrder || 0}
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Related Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Assessment Type:</strong> {assessmentTypes.find(at => at.id === (viewingCategory.assessment_type_id || viewingCategory.assessmentTypeId))?.name || 'N/A'}
                  </div>
                    <div className="info-item">
                      <strong>Questions:</strong> <span style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1em' }}>
                        {questions.find(c => c.id === viewingCategory.id)?.questions?.length || 0}
                      </span>
                </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setViewingCategory(null)
                  setEditingCategory(viewingCategory)
                  setShowCategoryModal(true)
                }}
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                ✏️ Edit
              </button>
              <button onClick={() => setViewingCategory(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal for Create/Edit */}
      {showQuestionModal && (
        <QuestionModal
          question={editingQuestion}
          categories={categories}
          onClose={() => {
            setShowQuestionModal(false)
            setEditingQuestion(null)
          }}
          onSave={async (formData) => {
            try {
              if (editingQuestion?.id) {
                await adminAPI.updateQuestion(editingQuestion.id, formData)
                alert('Question updated successfully!')
              } else {
                await adminAPI.createQuestion(formData)
                alert('Question created successfully!')
              }
              setShowQuestionModal(false)
              setEditingQuestion(null)
              loadData()
            } catch (err) {
              alert('Failed to save: ' + err.message)
            }
          }}
        />
      )}

      {/* View Question Modal */}
      {viewingQuestion && (
        <div className="modal-overlay" onClick={() => setViewingQuestion(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❓ Question Details</h2>
              <button onClick={() => setViewingQuestion(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="assessment-details">
                <div className="detail-section highlight">
                  <h3>Question Information</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <strong>Question Text:</strong>
                      <p style={{ marginTop: '5px', color: '#333', fontSize: '1.05em' }}>
                        {viewingQuestion.questionText || viewingQuestion.question_text || 'N/A'}
                      </p>
                </div>
                    <div className="info-item">
                      <strong>Question Code:</strong> {viewingQuestion.questionCode || viewingQuestion.question_code || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Type:</strong> {viewingQuestion.questionType || viewingQuestion.question_type || 'text'}
                    </div>
                    <div className="info-item">
                      <strong>Category:</strong> {viewingQuestion.categoryName || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Required:</strong> {(viewingQuestion.is_required || viewingQuestion.isRequired) ? '✅ Yes' : '❌ No'}
                    </div>
                    <div className="info-item">
                      <strong>Display Order:</strong> {viewingQuestion.display_order || viewingQuestion.displayOrder || 0}
                    </div>
                    {viewingQuestion.help_text || viewingQuestion.helpText ? (
                      <div className="info-item full-width">
                        <strong>Help Text:</strong>
                        <p style={{ marginTop: '5px', color: '#666' }}>
                          {viewingQuestion.help_text || viewingQuestion.helpText}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={async () => {
                  // Ensure categories are loaded before opening modal
                  try {
                    const response = await adminAPI.getAllCategories()
                    if (response && response.success) {
                      setCategories(response.categories || [])
                      setFilteredCategories(response.categories || [])
                    }
                  } catch (err) {
                    console.error('Error loading categories:', err)
                  }
                  setViewingQuestion(null)
                  setEditingQuestion(viewingQuestion)
                  setShowQuestionModal(true)
                }}
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                ✏️ Edit
              </button>
              <button onClick={() => setViewingQuestion(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAssessment && (
        <AssessmentDetailsModal
          assessment={selectedAssessment}
          allQuestionsMap={(() => {
            // Build questions map from questions state
            const map = {}
            if (Array.isArray(questions)) {
              questions.forEach(category => {
                if (category.questions && Array.isArray(category.questions)) {
                  category.questions.forEach(q => {
                    if (q.questionCode) {
                      map[q.questionCode] = {
                        ...q,
                        categoryName: category.name,
                        categoryId: category.id
                      }
                    }
                  })
                }
              })
            }
            return map
          })()}
          questions={questions}
          onClose={() => setSelectedAssessment(null)}
        />
      )}
    </div>
  )
}

export default AdminDashboard
