import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../services/api'
import CategoryModal from '../components/admin/CategoryModal'
import QuestionModal from '../components/admin/QuestionModal'
import AssessmentModal from '../components/admin/AssessmentModal'
import AssessmentTypeModal from '../components/admin/AssessmentTypeModal'
import AssessmentDetailsModal from '../components/admin/AssessmentDetailsModal'
import UserModal from '../components/admin/UserModal'
import { SafeDescriptionHtml } from '../components/common/RichTextEditor'
import { formatDate } from '../utils/formatDate'
import '../styles.css'
import '../components/admin/AdminDashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('form-builder')
  const [formBuilderTab, setFormBuilderTab] = useState('assessment-type') // 'assessment-type', 'category', 'question'
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
  const [allQuestionsMap, setAllQuestionsMap] = useState({}) // Map of questionCode to question object
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAssessmentTypeModal, setShowAssessmentTypeModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [assessmentTypes, setAssessmentTypes] = useState([])
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('')
  const [assessmentSearch, setAssessmentSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Log on initial mount
  useEffect(() => {
    console.log('🚀 AdminDashboard component loaded!')
    console.log('🚀 Default activeTab:', 'form-builder')
    console.log('🚀 If you see this in console, the latest code is running!')
  }, [])

  useEffect(() => {
    // Load data when tab changes
    loadData()
    
    // Cleanup: Clear error when switching tabs
    return () => {
      setError('')
    }
  }, [activeTab])

  // Debug: Log when component mounts and tab changes
  useEffect(() => {
    console.log('🎯 AdminDashboard activeTab changed to:', activeTab)
    if (activeTab === 'form-builder') {
      console.log('✅ Form Builder tab is ACTIVE!')
    }
  }, [activeTab])

  // Load all counts on mount (for tab badges)
  useEffect(() => {
    const loadAllCounts = async () => {
      try {
        // Load assessment types count
        const assessmentTypesResponse = await adminAPI.getAllAssessmentTypes()
        if (assessmentTypesResponse && assessmentTypesResponse.success && Array.isArray(assessmentTypesResponse.assessmentTypes)) {
          setAssessmentTypes(assessmentTypesResponse.assessmentTypes)
        }
        
        // Load users count
        const usersResponse = await adminAPI.getAllUsers()
        if (usersResponse && usersResponse.success && Array.isArray(usersResponse.users)) {
          setUsers(usersResponse.users)
          setFilteredUsers(usersResponse.users)
        }
        
        // Load assessments count
        const assessmentsResponse = await adminAPI.getAllAssessments()
        if (assessmentsResponse && assessmentsResponse.success && Array.isArray(assessmentsResponse.assessments)) {
          setAssessments(assessmentsResponse.assessments)
          setFilteredAssessments(assessmentsResponse.assessments)
        }
        
        // Load categories count
        const categoriesResponse = await adminAPI.getAllCategories()
        if (categoriesResponse && categoriesResponse.success && Array.isArray(categoriesResponse.categories)) {
          setCategories(categoriesResponse.categories)
        }
        
        // Load questions count (categories with questions)
        const questionsResponse = await adminAPI.getAllQuestions()
        if (questionsResponse && (questionsResponse.success || questionsResponse.categories)) {
          const cats = questionsResponse.categories || questionsResponse
          if (Array.isArray(cats)) {
            setQuestions(cats)
            // Also create the questions map for assessment answers display
            const questionsMap = {}
            cats.forEach(category => {
              if (category.questions && Array.isArray(category.questions)) {
                category.questions.forEach(q => {
                  if (q.questionCode) {
                    questionsMap[q.questionCode] = { ...q, categoryName: category.name, categoryId: category.id }
                    // Also add children to map
                    if (q.children && Array.isArray(q.children)) {
                      q.children.forEach(child => {
                        if (child.questionCode) {
                          questionsMap[child.questionCode] = { 
                            ...child, 
                            categoryName: category.name, 
                            categoryId: category.id,
                            parentCode: q.questionCode 
                          }
                        }
                      })
                    }
                  }
                })
              }
            })
            setAllQuestionsMap(questionsMap)
          }
        }
      } catch (err) {
        console.error('Error loading counts for tab badges:', err)
        // Non-critical error, continue
      }
    }
    loadAllCounts()
  }, [])


  useEffect(() => {
    filterUsers()
  }, [users, userSearch, roleFilter])

  useEffect(() => {
    filterAssessments()
  }, [assessments, assessmentSearch, assessmentTypeFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Don't clear data when switching tabs - keep it for tab badges
      // Only clear stats when switching to stats tab
      if (activeTab === 'stats') {
        setStats(null)
      }
      // Note: We keep users, assessments, categories, questions, and assessmentTypes
      // loaded so tab badges always show correct counts

      if (activeTab === 'stats') {
        const response = await adminAPI.getStats()
        if (response && response.success) {
          setStats(response.stats)
        } else {
          setError('Failed to load statistics')
          setStats(null)
        }
      } else if (activeTab === 'users') {
        const response = await adminAPI.getAllUsers()
        if (response && response.success && Array.isArray(response.users)) {
          setUsers(response.users)
          setFilteredUsers(response.users)
        } else {
          setError('Failed to load users')
          // Don't clear users - keep existing data for tab badge
          if (users.length === 0) {
            setUsers([])
            setFilteredUsers([])
          }
        }
      } else if (activeTab === 'assessments') {
        const response = await adminAPI.getAllAssessments()
        if (response && response.success && Array.isArray(response.assessments)) {
          setAssessments(response.assessments)
          setFilteredAssessments(response.assessments)
        } else {
          setError('Failed to load assessments')
          // Don't clear assessments - keep existing data for tab badge
          if (assessments.length === 0) {
            setAssessments([])
            setFilteredAssessments([])
          }
        }
      } else if (activeTab === 'form-builder') {
        // Load all data needed for Form Builder
        console.log('🛠️ Loading Form Builder data...')
        
        // Load assessment types
        const assessmentTypesResponse = await adminAPI.getAllAssessmentTypes()
        if (assessmentTypesResponse && assessmentTypesResponse.success && Array.isArray(assessmentTypesResponse.assessmentTypes)) {
          setAssessmentTypes(assessmentTypesResponse.assessmentTypes)
        }
        
        // Load categories
        const categoriesResponse = await adminAPI.getAllCategories()
        if (categoriesResponse && categoriesResponse.success && Array.isArray(categoriesResponse.categories)) {
          setCategories(categoriesResponse.categories)
        }
        
        // Load questions
        const questionsResponse = await adminAPI.getAllQuestions()
        if (questionsResponse && questionsResponse.success && Array.isArray(questionsResponse.categories)) {
          setQuestions(questionsResponse.categories)
          // Create a map of questionCode to question for easy lookup
          const questionsMap = {}
          questionsResponse.categories.forEach(category => {
            if (category.questions && Array.isArray(category.questions)) {
              category.questions.forEach(q => {
                if (q.questionCode) {
                  questionsMap[q.questionCode] = { ...q, categoryName: category.name, categoryId: category.id }
                  // Also add children to map
                  if (q.children && Array.isArray(q.children)) {
                    q.children.forEach(child => {
                      if (child.questionCode) {
                        questionsMap[child.questionCode] = { ...child, categoryName: category.name, categoryId: category.id, parentCode: q.questionCode }
                      }
                    })
                  }
                }
              })
            }
          })
          setAllQuestionsMap(questionsMap)
        }
        
        console.log('✅ Form Builder data loaded')
      } else if (activeTab === 'categories') {
        const response = await adminAPI.getAllCategories()
        if (response && response.success && Array.isArray(response.categories)) {
          setCategories(response.categories)
        } else {
          setError('Failed to load categories')
          // Don't clear categories - keep existing data for tab badge
          if (categories.length === 0) {
            setCategories([])
          }
        }
      } else if (activeTab === 'assessment-types') {
        const response = await adminAPI.getAllAssessmentTypes()
        if (response && response.success && Array.isArray(response.assessmentTypes)) {
          setAssessmentTypes(response.assessmentTypes)
        } else {
          setError('Failed to load assessment types')
          // Don't clear assessmentTypes - keep existing data for tab badge
          // setAssessmentTypes([])
        }
      } else if (activeTab === 'questions') {
        const response = await adminAPI.getAllQuestions()
        // Questions API returns {success: true, categories: [...], totalQuestions: N}
        if (response && response.success && Array.isArray(response.categories)) {
          setQuestions(response.categories)
          // Create a map of questionCode to question for easy lookup
          const questionsMap = {}
          response.categories.forEach(category => {
            if (category.questions && Array.isArray(category.questions)) {
              category.questions.forEach(q => {
                if (q.questionCode) {
                  questionsMap[q.questionCode] = { ...q, categoryName: category.name, categoryId: category.id }
                  // Also add children to map
                  if (q.children && Array.isArray(q.children)) {
                    q.children.forEach(child => {
                      if (child.questionCode) {
                        questionsMap[child.questionCode] = { ...child, categoryName: category.name, categoryId: category.id, parentCode: q.questionCode }
                      }
                    })
                  }
                }
              })
            }
          })
          setAllQuestionsMap(questionsMap)
        } else if (response && Array.isArray(response.categories)) {
          // Handle case where response doesn't have success field but has categories
          setQuestions(response.categories)
          // Create map
          const questionsMap = {}
          response.categories.forEach(category => {
            if (category.questions && Array.isArray(category.questions)) {
              category.questions.forEach(q => {
                if (q.questionCode) {
                  questionsMap[q.questionCode] = { ...q, categoryName: category.name }
                  if (q.children && Array.isArray(q.children)) {
                    q.children.forEach(child => {
                      if (child.questionCode) {
                        questionsMap[child.questionCode] = { ...child, categoryName: category.name, parentCode: q.questionCode }
                      }
                    })
                  }
                }
              })
            }
          })
          setAllQuestionsMap(questionsMap)
        } else if (Array.isArray(response)) {
          // Handle case where response is direct array (shouldn't happen but handle it)
          setQuestions(response)
        } else {
          setError('Failed to load questions. Please check API connection.')
          setQuestions([])
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data. Please check your connection.')
      
      // Clear all data on error
      setStats(null)
      setUsers([])
      setFilteredUsers([])
      setAssessments([])
      setFilteredAssessments([])
      setCategories([])
      setQuestions([])
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
    
    // Filter by assessment type
    if (assessmentTypeFilter !== 'all') {
      const typeId = parseInt(assessmentTypeFilter, 10)
      console.log('Filtering by assessment type:', {
        selectedTypeId: typeId,
        totalAssessments: assessments.length,
        assessmentTypeFilter
      })
      
      filtered = filtered.filter(a => {
        // Try multiple possible field names and formats
        const assessmentTypeId = a.assessment_type_id !== undefined ? a.assessment_type_id :
                                 a.assessmentTypeId !== undefined ? a.assessmentTypeId :
                                 a.assessment_type?.id !== undefined ? a.assessment_type.id :
                                 null
        
        // Log first few assessments for debugging
        if (assessments.indexOf(a) < 3) {
          console.log('Assessment filter check:', {
            assessmentId: a.id,
            assessment_type_id: a.assessment_type_id,
            assessmentTypeId: a.assessmentTypeId,
            assessment_type: a.assessment_type,
            resolvedTypeId: assessmentTypeId,
            targetTypeId: typeId,
            willMatch: assessmentTypeId !== null && assessmentTypeId !== undefined && Number(assessmentTypeId) === typeId
          })
        }
        
        // Handle null/undefined - if assessment has no type, it won't match
        if (assessmentTypeId === null || assessmentTypeId === undefined) {
          return false
        }
        
        // Convert to number for comparison
        const typeIdNum = typeof assessmentTypeId === 'string' ? parseInt(assessmentTypeId, 10) : Number(assessmentTypeId)
        
        return !isNaN(typeIdNum) && typeIdNum === typeId
      })
      
      console.log('After filtering:', {
        filteredCount: filtered.length,
        filteredIds: filtered.map(a => a.id)
      })
    }
    
    setFilteredAssessments(filtered)
    setCurrentPage(1)
  }

  const handleViewAssessment = async (id) => {
    try {
      console.log('🔍 Opening assessment details for ID:', id)
      // Fetch assessment with detailed format to get all answers
      const response = await adminAPI.getAssessmentById(id, 'detailed')
      console.log('📥 Assessment API response (detailed):', response)
      console.log('📦 Response structure:', {
        success: response.success,
        hasAssessment: !!response.assessment,
        assessmentKeys: response.assessment ? Object.keys(response.assessment) : [],
        hasDynamicAnswers: !!response.assessment?.dynamicAnswers,
        dynamicAnswersLength: response.assessment?.dynamicAnswers?.length || 0,
        sampleDynamicAnswer: response.assessment?.dynamicAnswers?.[0]
      })
      
      if (response.success) {
        console.log('✅ Assessment data received:', response.assessment)
        console.log('📋 Dynamic Answers:', response.assessment.dynamicAnswers)
        setSelectedAssessment(response.assessment)
      } else {
        // Fallback: try without format
        const fallbackResponse = await adminAPI.getAssessmentById(id)
        console.log('Assessment API response (fallback):', fallbackResponse)
        
        if (fallbackResponse.success) {
          console.log('Assessment data received (fallback):', fallbackResponse.assessment)
          setSelectedAssessment(fallbackResponse.assessment)
        } else {
          // Try one more time with just the ID, in case the response structure is different
          const simpleResponse = await adminAPI.getAssessmentById(id, '')
          console.log('Assessment API response (simple):', simpleResponse)
          
          if (simpleResponse && (simpleResponse.assessment || simpleResponse.data || simpleResponse)) {
            const assessmentData = simpleResponse.assessment || simpleResponse.data || simpleResponse
            console.log('Assessment data received (simple):', assessmentData)
            setSelectedAssessment(assessmentData)
          } else {
            alert('Failed to load assessment details: ' + (fallbackResponse.error || 'Unknown error'))
          }
        }
      }
    } catch (err) {
      console.error('Error loading assessment:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      })
      alert('Failed to load assessment details: ' + err.message)
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

  // Export assessments with all questions and answers
  const exportAssessmentsWithAnswers = async () => {
    try {
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

      // Fetch detailed data for each assessment
      const exportData = []
      
      for (const assessment of filteredAssessments) {
        try {
          // Get detailed assessment data
          const detailedResponse = await adminAPI.getAssessmentById(assessment.id, 'detailed')
          const detailedAssessment = detailedResponse.assessment || detailedResponse

          // Build the assessment row with contact info
          const assessmentRow = {
            'Assessment ID': assessment.id,
            'Contact Name': assessment.contactName || assessment.user_name || assessment.contact_name || 'Anonymous',
            'Contact Email': assessment.contactEmail || assessment.user_email || assessment.contact_email || 'N/A',
            'Company Name': assessment.companyName || assessment.company_name || 'N/A',
            'Contact Title': assessment.contactTitle || assessment.contact_title || 'N/A',
            'Submitted At': formatDate(assessment.submittedAt || assessment.submitted_at),
            'Active Date': formatDate(assessment.activeDate || assessment.active_date),
            'Expiry Date': formatDate(assessment.expiryDate || assessment.expiry_date),
            'Status': assessment.status || 'active',
          }

          // Parse answers from various formats
          let allAnswers = {}
          
          // Try to get answers from dynamicAnswers array
          const dynamicAnswers = detailedAssessment.dynamicAnswers || detailedAssessment.dynamic_answers || []
          if (Array.isArray(dynamicAnswers) && dynamicAnswers.length > 0) {
            dynamicAnswers.forEach(item => {
              const qCode = item.question_code || item.questionCode
              if (qCode) {
                const answerValue = item.answer_json || item.answer_value || item.answer || ''
                if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
                  allAnswers[qCode] = {
                    value: answerValue,
                    questionText: item.question_text || item.questionText || '',
                    questionType: item.question_type || item.questionType || ''
                  }
                }
              }
            })
          }

          // Also check answers object
          if (detailedAssessment.answers) {
            let answersObj = {}
            if (typeof detailedAssessment.answers === 'string') {
              try {
                answersObj = JSON.parse(detailedAssessment.answers)
              } catch (e) {
                // Keep as empty
              }
            } else if (typeof detailedAssessment.answers === 'object') {
              answersObj = detailedAssessment.answers
            }
            
            Object.keys(answersObj).forEach(key => {
              if (!allAnswers[key] && answersObj[key] !== null && answersObj[key] !== undefined && answersObj[key] !== '') {
                const questionInfo = allQuestionsMap[key] || {}
                allAnswers[key] = {
                  value: answersObj[key],
                  questionText: questionInfo.questionText || '',
                  questionType: questionInfo.questionType || ''
                }
              }
            })
          }

          // Get selected assessment type to filter questions
          const selectedTypeId = assessmentTypeFilter !== 'all' ? parseInt(assessmentTypeFilter, 10) : null
          
          // Get all questions organized by category with sequential numbering
          // Only include questions from the selected assessment type
          let questionNumber = 1
          
          // Process questions by category to maintain order
          questions.forEach(category => {
            // Filter categories by assessment type if one is selected
            if (selectedTypeId && category.assessment_type_id !== selectedTypeId) {
              return
            }
            
            if (category.questions && Array.isArray(category.questions)) {
              category.questions.forEach(question => {
                // Skip group questions and child questions (they're handled separately)
                if (question.questionType === 'group' || question.parentId) {
                  return
                }
                
                // Filter questions by assessment type if one is selected
                if (selectedTypeId) {
                  const questionTypeId = question.assessment_type_id || category.assessment_type_id
                  if (questionTypeId !== selectedTypeId) {
                    return
                  }
                }
                
                const qCode = question.questionCode || `q_${question.id}`
                const answerData = allAnswers[qCode]
                const answerValue = answerData?.value || detailedAssessment[qCode] || ''
                
                const formattedAnswer = formatAnswer(
                  answerValue,
                  qCode,
                  question.questionType || '',
                  question
                )

                assessmentRow[`Q${questionNumber}: ${question.questionText || qCode}`] = formattedAnswer

                // Add child questions if parent was answered "yes"
                if (question.children && Array.isArray(question.children) && 
                    (answerValue === 'yes' || answerValue === 'Yes' || answerValue === '1')) {
                  question.children.forEach(child => {
                    questionNumber++
                    const childCode = child.questionCode || `q_${child.id}`
                    const childAnswer = allAnswers[childCode]?.value || detailedAssessment[childCode] || ''
                    const childFormatted = formatAnswer(
                      childAnswer,
                      childCode,
                      child.questionType || '',
                      child
                    )
                    assessmentRow[`Q${questionNumber}: ${child.questionText || childCode}`] = childFormatted
                  })
                }
                
                questionNumber++
              })
            }
          })

          exportData.push(assessmentRow)
        } catch (err) {
          console.error(`Error processing assessment ${assessment.id}:`, err)
          // Add basic row even if detailed fetch fails
          exportData.push({
            'Assessment ID': assessment.id,
            'Contact Name': assessment.contactName || assessment.user_name || assessment.contact_name || 'Anonymous',
            'Contact Email': assessment.contactEmail || assessment.user_email || assessment.contact_email || 'N/A',
            'Company Name': assessment.companyName || assessment.company_name || 'N/A',
            'Error': 'Failed to load detailed data'
          })
        }
      }

      // Generate CSV
      if (exportData.length === 0) {
        alert('No data to export')
        return
      }

      // Get all unique headers from all rows
      const allHeaders = new Set()
      exportData.forEach(row => {
        Object.keys(row).forEach(key => allHeaders.add(key))
      })
      const headers = Array.from(allHeaders)

      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
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
      const typeSlug = selectedType.slug || selectedType.name.toLowerCase().replace(/\s+/g, '_')
      link.setAttribute('download', `assessments_${typeSlug}_with_answers_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`Exported ${exportData.length} assessment(s) for "${selectedType.name}" with all questions and answers`)
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

  // Ensure user exists before rendering
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2em' }}>Loading user data...</div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      {/* DEBUG: Force render check */}
      {console.log('🎯 AdminDashboard rendering - activeTab:', activeTab, 'assessmentTypes:', assessmentTypes.length) || null}
      
      {/* VERY VISIBLE FLOATING BANNER */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
        color: 'white',
        padding: '15px 30px',
        borderRadius: '10px',
        zIndex: 10000,
        boxShadow: '0 8px 25px rgba(255, 0, 0, 0.8)',
        fontWeight: 'bold',
        fontSize: '1.1em',
        textAlign: 'center',
        border: '3px solid white'
      }}>
        🚨 FORM BUILDER TAB SHOULD BE FIRST BUTTON BELOW! 🚨
      </div>
      
      <div className="admin-header">
        <div className="admin-header-info">
          <h1>📊 SBEAMP Admin Dashboard</h1>
          <p>Welcome back, <strong>{user?.name || 'Admin'}</strong></p>
          <span className="admin-badge">
            {user?.role === 'admin-viewer' ? '👁️ Admin Viewer' : 'Administrator'}
          </span>
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

      {/* DEBUG: Show tab count */}
      {console.log('🔍 Rendering tabs - activeTab:', activeTab, 'assessmentTypes.length:', assessmentTypes.length, 'categories.length:', categories.length, 'questions.length:', questions.length) || null}
      
      {/* DEBUG: Tab visibility check */}
      <div style={{ 
        padding: '10px', 
        background: '#fff3cd', 
        marginBottom: '10px', 
        borderRadius: '8px',
        fontSize: '0.9em',
        border: '1px solid #ffc107'
      }}>
        <strong>🔍 Tab Visibility Debug:</strong> Categories: {categories.length}, Questions: {questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)}, Assessment Types: {assessmentTypes.length}
      </div>
      
      <div className="admin-tabs" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        borderBottom: '2px solid #e0e0e0', 
        paddingBottom: '10px', 
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#f9fafb', // Light background to make tabs visible
        padding: '15px',
        borderRadius: '8px',
        minHeight: '60px', // Ensure enough height
        alignItems: 'center' // Center align items
      }}>
        {/* FORM BUILDER TAB - MUST BE FIRST */}
        <button
          key="form-builder-tab"
          className={activeTab === 'form-builder' ? 'active' : ''}
          onClick={() => {
            console.log('🛠️ Form Builder tab clicked!')
            setActiveTab('form-builder')
          }}
          style={{ 
            padding: '18px 35px',
            border: '4px solid #667eea',
            borderRadius: '12px',
            background: activeTab === 'form-builder' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff',
            color: activeTab === 'form-builder' ? 'white' : '#667eea',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '1.2em',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'form-builder' ? '0 8px 16px rgba(102, 126, 234, 0.5)' : '0 4px 8px rgba(0,0,0,0.15)',
            order: -1, // Make it appear first
            transform: activeTab === 'form-builder' ? 'scale(1.08)' : 'scale(1)',
            position: 'relative',
            zIndex: 1000,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            animation: activeTab !== 'form-builder' ? 'pulse 2s infinite' : 'none',
            display: 'block', // Force display
            visibility: 'visible', // Force visibility
            opacity: 1 // Force opacity
          }}
        >
          🛠️ FORM BUILDER
        </button>
        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3); }
            50% { box-shadow: 0 8px 16px rgba(102, 126, 234, 0.6); }
          }
        `}</style>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '12px 24px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: activeTab === 'stats' ? '#667eea' : '#ffffff',
            color: activeTab === 'stats' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: activeTab === 'stats' ? '600' : '400',
            fontSize: '1em',
            transition: 'all 0.2s',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
        >
          📈 Statistics
        </button>
        {user?.role === 'admin' && (
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              background: activeTab === 'users' ? '#667eea' : '#ffffff',
              color: activeTab === 'users' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: activeTab === 'users' ? '600' : '400',
              fontSize: '1em',
              transition: 'all 0.2s',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
          >
            👥 Users ({users.length || 0})
          </button>
        )}
        <button
          className={activeTab === 'assessments' ? 'active' : ''}
          onClick={() => setActiveTab('assessments')}
          style={{
            padding: '12px 24px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: activeTab === 'assessments' ? '#667eea' : '#ffffff',
            color: activeTab === 'assessments' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: activeTab === 'assessments' ? '600' : '400',
            fontSize: '1em',
            transition: 'all 0.2s',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
        >
          📋 Assessments ({assessments.length || 0})
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => {
            console.log('📁 Categories tab clicked!')
            setActiveTab('categories')
          }}
          style={{
            padding: '12px 24px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: activeTab === 'categories' ? '#667eea' : '#ffffff',
            color: activeTab === 'categories' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: activeTab === 'categories' ? '600' : '400',
            fontSize: '1em',
            transition: 'all 0.2s',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
        >
          📁 Categories ({categories.length || 0})
        </button>
        <button
          className={activeTab === 'questions' ? 'active' : ''}
          onClick={() => {
            console.log('❓ Questions tab clicked!')
            setActiveTab('questions')
          }}
          style={{
            padding: '12px 24px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: activeTab === 'questions' ? '#667eea' : '#ffffff',
            color: activeTab === 'questions' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: activeTab === 'questions' ? '600' : '400',
            fontSize: '1em',
            transition: 'all 0.2s',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
        >
          ❓ Questions ({questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0) || 0})
        </button>
        <button
          className={activeTab === 'assessment-types' ? 'active' : ''}
          onClick={() => {
            console.log('📑 Assessment Types tab clicked!')
            setActiveTab('assessment-types')
          }}
          style={{
            padding: '12px 24px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: activeTab === 'assessment-types' ? '#667eea' : '#ffffff',
            color: activeTab === 'assessment-types' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: activeTab === 'assessment-types' ? '600' : '400',
            fontSize: '1em',
            transition: 'all 0.2s',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
        >
          📑 Assessment Types ({assessmentTypes.length || 0})
        </button>
      </div>

      <div className="admin-content">
        {/* VERY VISIBLE RED BANNER TO CONFIRM LATEST CODE IS LOADING */}
        <div style={{
          background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '30px',
          fontSize: '1.8em',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(255, 0, 0, 0.6)',
          border: '5px solid #fff',
          animation: 'blink 1s infinite',
          position: 'relative',
          zIndex: 1000
        }}>
          🚨 FORM BUILDER TAB IS HERE! 🚨<br/>
          <span style={{ fontSize: '0.7em', opacity: 1, display: 'block', marginTop: '15px', fontWeight: 'normal' }}>
            Look for the "🛠️ FORM BUILDER" button in the tabs above. If you don't see it, clear cache (Cmd+Shift+R)!
          </span>
        </div>
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>

        {error && <div className="error-message">❌ {error}</div>}

        {loading && activeTab !== 'form-builder' ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Form Builder Tab - Main Form Creation Interface */}
            {activeTab === 'form-builder' && (
              <div className="form-builder-section">
                {/* Very visible banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '30px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '2em' }}>🛠️ FORM BUILDER</h1>
                  <p style={{ margin: 0, fontSize: '1.2em', opacity: 0.9 }}>
                    Create Dynamic Forms - No Need for Google Forms!
                  </p>
                </div>
                
                <div className="form-builder-header">
                  <h2>🛠️ Form Builder - Create Dynamic Forms</h2>
                  <p style={{ color: '#666', marginTop: '10px' }}>
                    Build custom forms with questions, categories, and options - No need for Google Forms!
                  </p>
                </div>

                {/* Form Builder Sub-tabs - THREE MAIN OPTIONS */}
                <div className="form-builder-tabs" style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  marginTop: '30px',
                  marginBottom: '30px',
                  borderBottom: '3px solid #667eea',
                  paddingBottom: '15px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <button
                    className={formBuilderTab === 'assessment-type' ? 'active' : ''}
                    onClick={() => {
                      console.log('📑 Assessment Type tab clicked')
                      setFormBuilderTab('assessment-type')
                    }}
                    style={{
                      padding: '20px 40px',
                      border: formBuilderTab === 'assessment-type' ? '3px solid #667eea' : '2px solid #e0e0e0',
                      background: formBuilderTab === 'assessment-type' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff',
                      color: formBuilderTab === 'assessment-type' ? 'white' : '#333',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1.1em',
                      boxShadow: formBuilderTab === 'assessment-type' ? '0 6px 20px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                      transform: formBuilderTab === 'assessment-type' ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    📑 Add Assessment Type
                  </button>
                  <button
                    className={formBuilderTab === 'category' ? 'active' : ''}
                    onClick={() => {
                      console.log('📁 Category tab clicked')
                      setFormBuilderTab('category')
                    }}
                    style={{
                      padding: '20px 40px',
                      border: formBuilderTab === 'category' ? '3px solid #667eea' : '2px solid #e0e0e0',
                      background: formBuilderTab === 'category' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff',
                      color: formBuilderTab === 'category' ? 'white' : '#333',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1.1em',
                      boxShadow: formBuilderTab === 'category' ? '0 6px 20px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                      transform: formBuilderTab === 'category' ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    📁 Add Category
                  </button>
                  <button
                    className={formBuilderTab === 'question' ? 'active' : ''}
                    onClick={() => {
                      console.log('❓ Question tab clicked')
                      setFormBuilderTab('question')
                    }}
                    style={{
                      padding: '20px 40px',
                      border: formBuilderTab === 'question' ? '3px solid #667eea' : '2px solid #e0e0e0',
                      background: formBuilderTab === 'question' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff',
                      color: formBuilderTab === 'question' ? 'white' : '#333',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1.1em',
                      boxShadow: formBuilderTab === 'question' ? '0 6px 20px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                      transform: formBuilderTab === 'question' ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    ❓ Add Question
                  </button>
                </div>

                {/* Form Builder Content */}
                <div className="form-builder-content" style={{ 
                  marginTop: '30px',
                  padding: '30px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  minHeight: '500px'
                }}>
                  {formBuilderTab === 'assessment-type' && (
                    <div>
                      <h3 style={{ marginBottom: '20px', color: '#667eea' }}>📑 Create Assessment Type</h3>
                      <p style={{ marginBottom: '30px', color: '#666' }}>
                        Start by creating an assessment type (e.g., "Performance Review", "AI Assessment", "Employee Survey").
                        This is the main form that users will fill out.
                      </p>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {assessmentTypes.length > 0 && (
                          <div style={{ flex: '1', minWidth: '300px' }}>
                            <h4 style={{ marginBottom: '15px' }}>Existing Assessment Types:</h4>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                              gap: '15px' 
                            }}>
                              {assessmentTypes.map(type => (
                                <div key={type.id} style={{
                                  padding: '15px',
                                  background: 'white',
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  <div style={{ fontSize: '1.5em', marginBottom: '5px' }}>
                                    {type.icon || '📝'}
                                  </div>
                                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                    {type.name}
                                  </div>
                                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
                                    {type.description ? <SafeDescriptionHtml html={type.description} /> : 'No description'}
                                  </div>
                                  <div style={{ fontSize: '0.8em', color: '#999' }}>
                                    {type.category_count || 0} categories • {type.question_count || 0} questions
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div style={{ flex: '1', minWidth: '300px' }}>
                          <button
                            onClick={() => {
                              setEditingItem(null)
                              setShowAssessmentTypeModal(true)
                            }}
                            className="btn-primary"
                            style={{
                              width: '100%',
                              padding: '20px',
                              fontSize: '1.1em',
                              marginBottom: '20px'
                            }}
                          >
                            ➕ Create New Assessment Type
                          </button>
                          <div style={{
                            padding: '20px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <h4 style={{ marginBottom: '10px' }}>💡 Tips:</h4>
                            <ul style={{ paddingLeft: '20px', color: '#666' }}>
                              <li>Give it a clear, descriptive name</li>
                              <li>Add an icon (emoji) for visual appeal</li>
                              <li>Enable "Single Question Mode" for better UX</li>
                              <li>Use a URL-friendly slug</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formBuilderTab === 'category' && (
                    <div>
                      <h3 style={{ marginBottom: '20px', color: '#667eea' }}>📁 Create Category</h3>
                      <p style={{ marginBottom: '30px', color: '#666' }}>
                        Organize your questions into categories. Each category groups related questions together.
                      </p>
                      {assessmentTypes.length === 0 ? (
                        <div style={{
                          padding: '40px',
                          textAlign: 'center',
                          background: 'white',
                          borderRadius: '8px',
                          border: '2px dashed #e0e0e0'
                        }}>
                          <p style={{ color: '#999', marginBottom: '20px' }}>
                            ⚠️ You need to create an Assessment Type first!
                          </p>
                          <button
                            onClick={() => setFormBuilderTab('assessment-type')}
                            className="btn-primary"
                          >
                            Go to Step 1: Create Assessment Type
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1', minWidth: '300px' }}>
                            <h4 style={{ marginBottom: '15px' }}>Existing Categories:</h4>
                            {categories.length > 0 ? (
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                                gap: '15px' 
                              }}>
                                {categories.map(cat => (
                                  <div key={cat.id} style={{
                                    padding: '15px',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}>
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                      {cat.name}
                                    </div>
                                    <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
                                      {cat.description ? <SafeDescriptionHtml html={cat.description} /> : 'No description'}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: '#999' }}>
                                      {cat.question_count || 0} questions
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: '#999', fontStyle: 'italic' }}>No categories yet. Create your first one!</p>
                            )}
                          </div>
                          <div style={{ flex: '1', minWidth: '300px' }}>
                            <button
                              onClick={() => {
                                setEditingItem(null)
                                setShowCategoryModal(true)
                              }}
                              className="btn-primary"
                              style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '1.1em',
                                marginBottom: '20px'
                              }}
                            >
                              ➕ Create New Category
                            </button>
                            <div style={{
                              padding: '20px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}>
                              <h4 style={{ marginBottom: '10px' }}>💡 Tips:</h4>
                              <ul style={{ paddingLeft: '20px', color: '#666' }}>
                                <li>Select the Assessment Type this category belongs to</li>
                                <li>Use categories to group related questions</li>
                                <li>Set display order to control sequence</li>
                                <li>Examples: "Company Vision", "Leadership", "Technology"</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formBuilderTab === 'question' && (
                    <div>
                      <h3 style={{ marginBottom: '20px', color: '#667eea' }}>❓ Create Question</h3>
                      <p style={{ marginBottom: '30px', color: '#666' }}>
                        Add questions with various types and options. This is where you build your form content.
                      </p>
                      {categories.length === 0 ? (
                        <div style={{
                          padding: '40px',
                          textAlign: 'center',
                          background: 'white',
                          borderRadius: '8px',
                          border: '2px dashed #e0e0e0'
                        }}>
                          <p style={{ color: '#999', marginBottom: '20px' }}>
                            ⚠️ You need to create a Category first!
                          </p>
                          <button
                            onClick={() => setFormBuilderTab('category')}
                            className="btn-primary"
                          >
                            Go to Step 2: Create Category
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '2', minWidth: '400px' }}>
                            <h4 style={{ marginBottom: '15px' }}>Question Types Available:</h4>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                              gap: '15px',
                              marginBottom: '30px'
                            }}>
                              {[
                                { type: 'text', icon: '📝', name: 'Text Input', desc: 'Free text answer' },
                                { type: 'scale', icon: '📊', name: 'Scale (1-5)', desc: 'Rating scale' },
                                { type: 'yes_no', icon: '✅', name: 'Yes/No', desc: 'Binary choice' },
                                { type: 'multiple_choice', icon: '🔘', name: 'Multiple Choice', desc: 'Select one option' },
                                { type: 'percentage_range', icon: '📈', name: 'Percentage', desc: '0-100% range' },
                                { type: 'group', icon: '📦', name: 'Group', desc: 'Parent question' }
                              ].map(qt => (
                                <div key={qt.type} style={{
                                  padding: '15px',
                                  background: 'white',
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ fontSize: '2em', marginBottom: '5px' }}>{qt.icon}</div>
                                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{qt.name}</div>
                                  <div style={{ fontSize: '0.8em', color: '#666' }}>{qt.desc}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{
                              padding: '20px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                              marginTop: '20px'
                            }}>
                              <h4 style={{ marginBottom: '10px' }}>📋 Recent Questions:</h4>
                              {questions.length > 0 ? (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                  {questions.slice(0, 5).map(cat => (
                                    cat.questions && cat.questions.slice(0, 3).map(q => (
                                      <div key={q.id} style={{
                                        padding: '10px',
                                        marginBottom: '10px',
                                        background: '#f9fafb',
                                        borderRadius: '6px',
                                        border: '1px solid #e0e0e0'
                                      }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9em' }}>
                                          {q.questionCode}: {q.questionText?.substring(0, 50)}...
                                        </div>
                                        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                                          Type: {q.questionType} • Category: {cat.name}
                                        </div>
                                      </div>
                                    ))
                                  ))}
                                </div>
                              ) : (
                                <p style={{ color: '#999', fontStyle: 'italic' }}>No questions yet. Create your first one!</p>
                              )}
                            </div>
                          </div>
                          <div style={{ flex: '1', minWidth: '300px' }}>
                            <button
                              onClick={() => {
                                setEditingItem(null)
                                setShowQuestionModal(true)
                              }}
                              className="btn-primary"
                              style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '1.1em',
                                marginBottom: '20px'
                              }}
                            >
                              ➕ Create New Question
                            </button>
                            <div style={{
                              padding: '20px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}>
                              <h4 style={{ marginBottom: '10px' }}>💡 Tips:</h4>
                              <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '0.9em' }}>
                                <li>Select the category for this question</li>
                                <li>Choose appropriate question type</li>
                                <li>Add help text to guide users</li>
                                <li>Set options for scale/multiple choice</li>
                                <li>Mark as required if needed</li>
                                <li>Use question codes for easy reference</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stats' && !loading && (
              <>
                {stats ? (
                  <div className="stats-section">
                    <div className="stats-grid">
                      <div className="stat-card primary">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                          <h3>Total Users</h3>
                          <p className="stat-number">{stats.totalUsers}</p>
                          <span className="stat-label">Registered users</span>
                        </div>
                      </div>
                  
                  <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>Completed Assessments</h3>
                      <p className="stat-number">{stats.totalAssessments}</p>
                      <span className="stat-label">Total submissions</span>
                    </div>
                  </div>
                  
                  <div className="stat-card warning">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                      <h3>Completion Rate</h3>
                      <p className="stat-number">{getCompletionRate()}%</p>
                      <span className="stat-label">{stats.usersWithAssessments} of {stats.totalUsers} users</span>
                    </div>
                  </div>
                  
                  <div className="stat-card danger">
                    <div className="stat-icon">🔐</div>
                    <div className="stat-info">
                      <h3>Administrators</h3>
                      <p className="stat-number">{stats.totalAdmins}</p>
                      <span className="stat-label">Admin accounts</span>
                    </div>
                  </div>
                </div>

                    <div className="stats-details">
                      <div className="detail-card">
                        <h3>📈 Activity Overview</h3>
                        <div className="detail-item">
                          <span className="detail-label">Users with Assessments:</span>
                          <span className="detail-value">{stats.usersWithAssessments}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Users without Assessments:</span>
                          <span className="detail-value">{stats.totalUsers - stats.usersWithAssessments}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Regular Users:</span>
                          <span className="detail-value">{stats.totalUsers - stats.totalAdmins}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No statistics available. {error || 'Please try refreshing.'}</p>
                    <button onClick={loadData} className="btn-primary">
                      Refresh
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'users' && !loading && (
              <div className="table-section">
                <div className="table-header">
                  <div className="search-filters">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Users</option>
                      <option value="admin">Admins</option>
                      <option value="admin-viewer">Admin Viewers</option>
                    </select>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setEditingItem(null)
                          setShowUserModal(true)
                        }}
                        className="btn-primary"
                      >
                        ➕ Add User
                      </button>
                    )}
                    <button
                      onClick={() => exportToCSV(filteredUsers, `users_${new Date().toISOString().split('T')[0]}.csv`)}
                      className="btn-export"
                    >
                      📥 Export CSV
                    </button>
                  </div>
                  <div className="table-info">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>🔍 No users found matching your search criteria</p>
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.map((u) => (
                            <tr key={u.id}>
                              <td className="id-cell">#{u.id}</td>
                              <td className="name-cell">
                                <strong>{u.name}</strong>
                              </td>
                              <td className="email-cell">{u.email}</td>
                              <td>
                                <span className={`role-badge ${u.role}`}>
                                  {u.role === 'admin' ? '👑 Admin' : 
                                   u.role === 'admin-viewer' ? '👁️ Admin Viewer' : 
                                   '👤 User'}
                                </span>
                              </td>
                              <td className="date-cell">{formatDate(u.created_at)}</td>
                              <td>
                              <button
                                onClick={() => {
                                  const userAssessments = assessments.filter(a => a.user_id === u.id)
                                  if (userAssessments.length > 0) {
                                    handleViewAssessment(userAssessments[0].id)
                                  } else {
                                    alert('This user has not submitted any assessment yet.')
                                  }
                                }}
                                className="btn-view"
                                disabled={!assessments.some(a => a.user_id === u.id)}
                                title={assessments.some(a => a.user_id === u.id) ? 'View assessment' : 'No assessment submitted'}
                              >
                                {assessments.some(a => a.user_id === u.id) ? 'View Assessment' : 'No Assessment'}
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

            {activeTab === 'assessments' && !loading && (
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
                      style={{ minWidth: '200px' }}
                    >
                      <option value="all">All Assessment Types</option>
                      {assessmentTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon || '📝'} {type.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => exportToCSV(filteredAssessments, `assessments_${new Date().toISOString().split('T')[0]}.csv`)}
                      className="btn-export"
                      style={{ marginRight: '10px' }}
                    >
                      📥 Export Summary
                    </button>
                    <button
                      onClick={exportAssessmentsWithAnswers}
                      className="btn-export"
                      style={{ background: '#28a745' }}
                      disabled={assessmentTypeFilter === 'all'}
                      title={assessmentTypeFilter === 'all' ? 'Please select an assessment type to export with answers' : 'Export assessments with all questions and answers for selected type'}
                    >
                      📊 Export with Answers
                    </button>
                  </div>
                  <div className="table-info">
                    Showing {filteredAssessments.length} of {assessments.length} assessments
                    {assessmentTypeFilter !== 'all' && (
                      <span style={{ marginLeft: '10px', color: '#667eea', fontWeight: '600' }}>
                        • Filtered by: {assessmentTypes.find(t => t.id === parseInt(assessmentTypeFilter))?.name || 'Unknown Type'}
                      </span>
                    )}
                  </div>
                </div>

                {filteredAssessments.length === 0 ? (
                  <div className="empty-state">
                    <p>🔍 No assessments found matching your search criteria</p>
                    {assessmentTypeFilter !== 'all' && (
                      <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                        No assessments found for the selected assessment type. 
                        {assessments.length > 0 && (
                          <span> Try selecting "All Assessment Types" or check if assessments have an assessment type assigned.</span>
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Contact Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Active Date</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAssessments.map((assessment) => (
                            <tr key={assessment.id}>
                              <td className="id-cell">#{assessment.id}</td>
                              <td className="name-cell">
                                <strong>{assessment.contactName || assessment.user_name || assessment.contact_name || 'Anonymous'}</strong>
                              </td>
                              <td className="email-cell">{assessment.contactEmail || assessment.user_email || assessment.contact_email || <span className="na-text">N/A</span>}</td>
                              <td>{assessment.companyName || assessment.company_name || <span className="na-text">N/A</span>}</td>
                              <td className="date-cell">{formatDate(assessment.activeDate)}</td>
                              <td className="date-cell">{formatDate(assessment.expiryDate)}</td>
                              <td>
                                <span className={`status-badge ${assessment.status || 'active'}`}>
                                  {assessment.status === 'active' ? '✅ Active' : 
                                   assessment.status === 'pending' ? '⏳ Pending' : 
                                   assessment.status === 'expired' ? '❌ Expired' : '⚪ Inactive'}
                                </span>
                              </td>
                              <td className="date-cell">{formatDate(assessment.submittedAt || assessment.submitted_at)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button
                                    onClick={() => handleViewAssessment(assessment.id)}
                                    className="btn-view"
                                    title="View Details"
                                  >
                                    👁️
                                  </button>
                                  {user?.role === 'admin' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingItem(assessment)
                                          setShowAssessmentModal(true)
                                        }}
                                        className="btn-edit"
                                        title="Edit"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Delete assessment #${assessment.id}? This cannot be undone.`)) {
                                            try {
                                              await adminAPI.deleteAssessment(assessment.id)
                                              loadData()
                                              alert('Assessment deleted successfully')
                                            } catch (err) {
                                              alert('Failed to delete assessment: ' + err.message)
                                            }
                                          }
                                        }}
                                        className="btn-delete"
                                        title="Delete"
                                      >
                                        🗑️
                                      </button>
                                    </>
                                  )}
                                </div>
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

            {activeTab === 'categories' && !loading && (
              <div className="table-section">
                <div className="table-header">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setEditingItem(null)
                        setShowCategoryModal(true)
                      }}
                      className="btn-primary"
                    >
                      ➕ Add Category
                    </button>
                  )}
                  <div className="table-info">
                    Total Categories: {categories.length}
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="empty-state">
                    <p>📁 No categories found</p>
                    <button onClick={() => setShowCategoryModal(true)} className="btn-primary">
                      Create First Category
                    </button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Display Order</th>
                          <th>Questions</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat.id}>
                            <td className="id-cell">#{cat.id}</td>
                            <td className="name-cell"><strong>{cat.name}</strong></td>
                            <td>{cat.description || <span className="na-text">N/A</span>}</td>
                            <td>{cat.display_order || cat.displayOrder || 0}</td>
                            <td>{cat.question_count || 0}</td>
                            <td>
                              <span className={`status-badge ${cat.is_active !== false ? 'active' : 'inactive'}`}>
                                {cat.is_active !== false ? '✅ Active' : '❌ Inactive'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(cat)
                                    setActiveTab('questions')
                                  }}
                                  className="btn-view"
                                  title="View Questions"
                                >
                                  📋
                                </button>
                                {user?.role === 'admin' && (
                                  <button
                                    onClick={() => {
                                      setEditingItem({ category_id: cat.id })
                                      setShowQuestionModal(true)
                                    }}
                                    className="btn-primary"
                                    title="Add Question to this Category"
                                    style={{ fontSize: '0.85em', padding: '4px 8px' }}
                                  >
                                    ➕ Question
                                  </button>
                                )}
                                {user?.role === 'admin' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingItem(cat)
                                        setShowCategoryModal(true)
                                      }}
                                      className="btn-edit"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Delete category "${cat.name}"?`)) {
                                          try {
                                            await adminAPI.deleteCategory(cat.id, false)
                                            loadData()
                                            alert('Category deactivated. Use force delete to remove permanently.')
                                          } catch (err) {
                                            alert('Failed to delete category: ' + err.message)
                                          }
                                        }
                                      }}
                                      className="btn-delete"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assessment-types' && !loading && (
              <div className="table-section">
                <div className="table-header">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setEditingItem(null)
                        setShowAssessmentTypeModal(true)
                      }}
                      className="btn-primary"
                    >
                      ➕ Add Assessment Type
                    </button>
                  )}
                  <div className="table-info">
                    Total Assessment Types: {assessmentTypes.length}
                  </div>
                </div>

                {assessmentTypes.length === 0 ? (
                  <div className="empty-state">
                    <p>📑 No assessment types found</p>
                    <button onClick={() => setShowAssessmentTypeModal(true)} className="btn-primary">
                      Create First Assessment Type
                    </button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Description</th>
                          <th>Categories</th>
                          <th>Questions</th>
                          <th>Assessments</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentTypes.map((type) => (
                          <tr key={type.id}>
                            <td className="id-cell">#{type.id}</td>
                            <td className="name-cell">
                              <strong>{type.icon || '📝'} {type.name}</strong>
                            </td>
                            <td><code>{type.slug}</code></td>
                            <td>{type.description || <span className="na-text">N/A</span>}</td>
                            <td>{type.category_count || 0}</td>
                            <td>{type.question_count || 0}</td>
                            <td>{type.assessment_count || 0}</td>
                            <td>
                              <span className={`status-badge ${type.is_active !== false ? 'active' : 'inactive'}`}>
                                {type.is_active !== false ? '✅ Active' : '❌ Inactive'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(null)
                                    setActiveTab('categories')
                                    // Filter categories by this assessment type
                                  }}
                                  className="btn-view"
                                  title="View Categories"
                                >
                                  📁
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(null)
                                    setActiveTab('questions')
                                    // Filter questions by this assessment type
                                  }}
                                  className="btn-view"
                                  title="View Questions"
                                >
                                  📋
                                </button>
                                {user?.role === 'admin' && (
                                  <button
                                    onClick={() => {
                                      setEditingItem({ assessment_type_id: type.id })
                                      setShowCategoryModal(true)
                                    }}
                                    className="btn-primary"
                                    title="Add Category to this Assessment Type"
                                    style={{ fontSize: '0.85em', padding: '4px 8px' }}
                                  >
                                    ➕ Category
                                  </button>
                                )}
                                {user?.role === 'admin' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const newStatus = !type.is_active
                                        await adminAPI.updateAssessmentType(type.id, {
                                          is_active: newStatus
                                        })
                                        loadData()
                                        alert(`Assessment type ${newStatus ? 'activated' : 'deactivated'} successfully.`)
                                      } catch (err) {
                                        alert('Failed to toggle assessment type: ' + err.message)
                                      }
                                    }}
                                    className={type.is_active !== false ? "btn-edit" : "btn-view"}
                                    title={type.is_active !== false ? "Deactivate" : "Activate"}
                                    style={{
                                      background: type.is_active !== false ? '#28a745' : '#6c757d',
                                      color: 'white',
                                      border: 'none'
                                    }}
                                  >
                                    {type.is_active !== false ? '✅' : '⚪'}
                                  </button>
                                )}
                                {user?.role === 'admin' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingItem(type)
                                        setShowAssessmentTypeModal(true)
                                      }}
                                      className="btn-edit"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Delete assessment type "${type.name}"?`)) {
                                          try {
                                            await adminAPI.deleteAssessmentType(type.id, false)
                                            loadData()
                                            alert('Assessment type deactivated successfully.')
                                          } catch (err) {
                                            alert('Failed to delete assessment type: ' + err.message)
                                          }
                                        }
                                      }}
                                      className="btn-delete"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && !loading && (
              <div className="table-section">
                <div className="table-header">
                  <div className="search-filters">
                    <select
                      value={selectedCategory?.id || 'all'}
                      onChange={(e) => {
                        const catId = e.target.value
                        if (catId === 'all') {
                          setSelectedCategory(null)
                        } else {
                          const cat = categories.find(c => c.id === parseInt(catId))
                          setSelectedCategory(cat)
                        }
                      }}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setEditingItem(null)
                          setShowQuestionModal(true)
                        }}
                        className="btn-primary"
                      >
                        ➕ Add Question
                      </button>
                    )}
                  </div>
                  <div className="table-info">
                    {selectedCategory 
                      ? `Questions in "${selectedCategory.name}": ${questions.find(c => c.id === selectedCategory?.id)?.questions?.length || 0}`
                      : `Total Questions: ${questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)}`
                    }
                  </div>
                </div>

                {questions.length === 0 ? (
                  <div className="empty-state">
                    <p>❓ No questions found. Questions should be loaded automatically from the database.</p>
                    <button onClick={loadData} className="btn-primary">
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div className="questions-list">
                    {questions
                      .filter(cat => !selectedCategory || cat.id === selectedCategory.id)
                      .map((category) => (
                        <div key={category.id} className="category-questions-section">
                          <h3 className="category-title">
                            {category.name}
                            <span className="question-count">({category.questions?.length || 0} questions)</span>
                          </h3>
                          {category.description && (
                            <div className="category-description">
                              <SafeDescriptionHtml html={category.description} />
                            </div>
                          )}
                          
                          {category.questions && category.questions.length > 0 ? (
                            <div className="questions-grid">
                              {category.questions.map((question) => (
                                <div key={question.id} className="question-card">
                                  <div className="question-header">
                                    <span className="question-code">{question.questionCode}</span>
                                    <span className={`question-type-badge ${question.questionType}`}>
                                      {question.questionType}
                                    </span>
                                    {question.isRequired && <span className="required-badge">Required</span>}
                                  </div>
                                  <div className="question-text">
                                    <SafeDescriptionHtml html={question.questionText} />
                                  </div>
                                  
                                  {question.options && (
                                    <div className="question-options">
                                      <strong>Options:</strong>
                                      {question.options.options ? (
                                        <ul>
                                          {question.options.options.map((opt, idx) => (
                                            <li key={idx}>{opt}</li>
                                          ))}
                                        </ul>
                                      ) : question.options.min && question.options.max ? (
                                        <span>Scale: {question.options.min} - {question.options.max}</span>
                                      ) : (
                                        <span>{JSON.stringify(question.options)}</span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {question.placeholder && (
                                    <div className="question-meta">
                                      <strong>Placeholder:</strong> {question.placeholder}
                                    </div>
                                  )}
                                  
                                  {question.helpText && (
                                    <div className="question-meta">
                                      <strong>Help:</strong> {question.helpText}
                                    </div>
                                  )}
                                  
                                  {question.children && question.children.length > 0 && (
                                    <div className="question-children">
                                      <strong>Sub-questions:</strong>
                                      {question.children.map(child => (
                                        <div key={child.id} className="child-question">
                                          {child.questionCode}: {child.questionText}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {user?.role === 'admin' && (
                                    <div className="question-actions">
                                      <button
                                        onClick={() => {
                                          setEditingItem(question)
                                          setShowQuestionModal(true)
                                        }}
                                        className="btn-edit-small"
                                        title="Edit Question"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Delete question "${question.questionCode}"?`)) {
                                            try {
                                              await adminAPI.deleteQuestion(question.id, false)
                                              loadData()
                                              alert('Question deactivated. Use force delete to remove permanently.')
                                            } catch (err) {
                                              alert('Failed to delete question: ' + err.message)
                                            }
                                          }
                                        }}
                                        className="btn-delete-small"
                                        title="Delete Question"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state">
                              <p>No questions in this category</p>
                              <button
                                onClick={() => {
                                  setEditingItem({ category_id: category.id })
                                  setShowQuestionModal(true)
                                }}
                                className="btn-primary"
                              >
                                Add Question
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingItem}
          adminAPI={adminAPI}
          onClose={() => {
            setShowCategoryModal(false)
            setEditingItem(null)
          }}
          onSave={async (categoryData) => {
            try {
              if (editingItem && editingItem.id) {
                await adminAPI.updateCategory(editingItem.id, categoryData)
                alert('Category updated successfully!')
              } else {
                await adminAPI.createCategory(categoryData)
                alert('Category created successfully!')
              }
              setShowCategoryModal(false)
              setEditingItem(null)
              loadData()
            } catch (err) {
              alert('Error saving category: ' + err.message)
            }
          }}
        />
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <QuestionModal
          question={editingItem}
          categories={categories}
          onClose={() => {
            setShowQuestionModal(false)
            setEditingItem(null)
          }}
          onSave={async (questionData) => {
            try {
              if (editingItem && editingItem.id) {
                await adminAPI.updateQuestion(editingItem.id, questionData)
                alert('Question updated successfully!')
              } else {
                await adminAPI.createQuestion(questionData)
                alert('Question created successfully!')
              }
              setShowQuestionModal(false)
              setEditingItem(null)
              loadData()
            } catch (err) {
              alert('Error saving question: ' + err.message)
            }
          }}
        />
      )}

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <AssessmentModal
          assessment={editingItem}
          onClose={() => {
            setShowAssessmentModal(false)
            setEditingItem(null)
          }}
          onSave={async (assessmentData) => {
            try {
              if (editingItem && editingItem.id) {
                await adminAPI.updateAssessment(editingItem.id, assessmentData)
                alert('Assessment updated successfully!')
              } else {
                await adminAPI.createAssessment(assessmentData)
                alert('Assessment created successfully!')
              }
              setShowAssessmentModal(false)
              setEditingItem(null)
              loadData()
            } catch (err) {
              alert('Error saving assessment: ' + err.message)
            }
          }}
        />
      )}

      {/* Assessment Type Modal */}
      {showAssessmentTypeModal && (
        <AssessmentTypeModal
          assessmentType={editingItem}
          onClose={() => {
            setShowAssessmentTypeModal(false)
            setEditingItem(null)
          }}
          onSave={async (typeData) => {
            try {
              if (editingItem && editingItem.id) {
                await adminAPI.updateAssessmentType(editingItem.id, typeData)
                alert('Assessment type updated successfully!')
              } else {
                await adminAPI.createAssessmentType(typeData)
                alert('Assessment type created successfully!')
              }
              setShowAssessmentTypeModal(false)
              setEditingItem(null)
              loadData()
            } catch (err) {
              alert('Error saving assessment type: ' + err.message)
            }
          }}
        />
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingItem}
          onClose={() => {
            setShowUserModal(false)
            setEditingItem(null)
          }}
          onSave={async (userData) => {
            try {
              if (editingItem && editingItem.id) {
                // Update user - note: updateUser endpoint needs to be added to backend
                await adminAPI.updateUser(editingItem.id, userData)
                alert('User updated successfully!')
              } else {
                await adminAPI.createUser(userData)
                alert('User created successfully!')
              }
              setShowUserModal(false)
              setEditingItem(null)
              loadData()
            } catch (err) {
              alert('Error saving user: ' + err.message)
            }
          }}
        />
      )}

      {selectedAssessment && (
        <AssessmentDetailsModal
          assessment={selectedAssessment}
          allQuestionsMap={allQuestionsMap}
          questions={questions}
          onClose={() => setSelectedAssessment(null)}
        />
      )}

      {/* Legacy modal definitions - will be removed after extraction */}
      {false && (() => {
        // Helper function to format answer with labels for scale questions
        const formatAnswer = (answer, questionCode, questionType) => {
          if (answer === '' || answer === null || answer === undefined) {
            return 'Not answered'
          }
          
          // For scale questions, try to get the label
          if (questionType === 'scale') {
            const question = allQuestionsMap[questionCode]
            if (question && question.options) {
              const labels = question.options.labels || {}
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
        
        return (
        <div className="modal-overlay" onClick={() => setSelectedAssessment(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Assessment Details</h2>
              <button onClick={() => setSelectedAssessment(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="assessment-details">
                <div className="detail-section highlight">
                  <h3>👤 Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong> {selectedAssessment.user_name || selectedAssessment.contact_name || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {selectedAssessment.user_email || selectedAssessment.contact_email || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Company:</strong> {selectedAssessment.company_name || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Title:</strong> {selectedAssessment.contact_title || 'N/A'}
                    </div>
                    {(selectedAssessment.activeDate || selectedAssessment.active_date) && (
                      <div className="info-item">
                        <strong>Active Date:</strong> {formatDate(selectedAssessment.activeDate || selectedAssessment.active_date)}
                      </div>
                    )}
                    {(selectedAssessment.expiryDate || selectedAssessment.expiry_date) && (
                      <div className="info-item">
                        <strong>Expiry Date:</strong> {formatDate(selectedAssessment.expiryDate || selectedAssessment.expiry_date)}
                      </div>
                    )}
                    {!selectedAssessment.user_id && (
                      <div className="info-item full-width">
                        <span className="na-text">📝 Anonymous Submission</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAssessment.summary && (
                  <div className="detail-section highlight">
                    <h3>📊 Assessment Summary</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <strong>Overall Score:</strong> {selectedAssessment.summary.overallScore || 0}%
                      </div>
                      <div className="info-item">
                        <strong>Readiness Level:</strong> 
                        <span className={`status-badge ${selectedAssessment.summary.readinessLevel?.toLowerCase().replace(' ', '-')}`}>
                          {selectedAssessment.summary.readinessLevel || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display answers dynamically - prioritize dynamicAnswers, fallback to legacy format */}
                {(() => {
                  // Debug: Log the assessment data to help diagnose issues
                  console.log('=== ASSESSMENT DATA DEBUG ===')
                  console.log('Full assessment object:', selectedAssessment)
                  console.log('Assessment keys:', Object.keys(selectedAssessment))
                  console.log('Has answers property:', !!selectedAssessment.answers, typeof selectedAssessment.answers)
                  console.log('Has dynamicAnswers property:', !!selectedAssessment.dynamicAnswers, Array.isArray(selectedAssessment.dynamicAnswers))
                  console.log('Has formatted property:', !!selectedAssessment.formatted, typeof selectedAssessment.formatted)
                  
                  // Check for any properties that look like question codes
                  const questionLikeKeys = Object.keys(selectedAssessment).filter(key => 
                    /^q\d+/.test(key) || /^[a-z]+\d+/.test(key) || /^[a-z]+_\d+/.test(key)
                  )
                  console.log('Question-like keys found:', questionLikeKeys)
                  questionLikeKeys.forEach(key => {
                    console.log(`  ${key}:`, selectedAssessment[key], typeof selectedAssessment[key])
                  })
                  
                  // Get answers from dynamicAnswers array or answers object
                  // Handle both string and object formats
                  let answersObj = {}
                  if (selectedAssessment.answers) {
                    if (typeof selectedAssessment.answers === 'string') {
                      try {
                        answersObj = JSON.parse(selectedAssessment.answers)
                        console.log('Parsed answers from string:', answersObj)
                      } catch (e) {
                        console.warn('Failed to parse answers JSON:', e)
                        answersObj = {}
                      }
                    } else if (typeof selectedAssessment.answers === 'object' && selectedAssessment.answers !== null) {
                      answersObj = selectedAssessment.answers
                      console.log('Using answers object directly:', answersObj)
                    }
                  }
                  
                  const dynamicAnswersArray = selectedAssessment.dynamicAnswers || 
                                             selectedAssessment.dynamic_answers || 
                                             selectedAssessment.answer_details || 
                                             []
                  
                  console.log('Dynamic answers array:', dynamicAnswersArray, 'Length:', Array.isArray(dynamicAnswersArray) ? dynamicAnswersArray.length : 'not array')
                  console.log('Dynamic answers array type:', typeof dynamicAnswersArray)
                  if (Array.isArray(dynamicAnswersArray)) {
                    console.log('First few items:', dynamicAnswersArray.slice(0, 3))
                  }
                  
                  // Build answers map from dynamicAnswers array if available (preferred - has question text)
                  const answersFromArray = {}
                  if (Array.isArray(dynamicAnswersArray) && dynamicAnswersArray.length > 0) {
                    console.log('Processing dynamicAnswers array...')
                    dynamicAnswersArray.forEach((item, index) => {
                      console.log(`Item ${index}:`, item)
                      
                      // Handle both object format and direct question_code properties
                      const qCode = item.question_code || item.questionCode || item.question_id
                      
                      if (qCode) {
                        // Try multiple possible answer value fields
                        let answerValue = item.answer_json || 
                                       item.answerJson || 
                                       item.answer_value || 
                                       item.answerValue || 
                                       item.answer || 
                                       ''
                        
                        // If answerValue is still empty, check if it's in a nested structure
                        if (!answerValue && item.answer_data) {
                          answerValue = item.answer_data
                        }
                        
                        // Parse JSON string if needed
                        if (typeof answerValue === 'string' && (answerValue.startsWith('{') || answerValue.startsWith('['))) {
                          try {
                            answerValue = JSON.parse(answerValue)
                          } catch (e) {
                            console.warn(`Failed to parse answer JSON for ${qCode}:`, e)
                            // Keep as string if parsing fails
                          }
                        }
                        
                        // Only add if we have a non-empty answer value
                        if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
                          answersFromArray[qCode] = {
                            value: answerValue,
                            questionText: item.question_text || item.questionText || '',
                            questionType: item.question_type || item.questionType || '',
                          }
                          console.log(`✅ Added answer for ${qCode}:`, answersFromArray[qCode])
                        } else {
                          console.log(`⚠️ Skipping ${qCode} - empty answer value`)
                        }
                      } else {
                        console.warn(`⚠️ Item ${index} has no question_code/questionCode:`, item)
                      }
                    })
                    console.log('✅ Answers from array:', answersFromArray, 'Total:', Object.keys(answersFromArray).length)
                  } else if (dynamicAnswersArray && !Array.isArray(dynamicAnswersArray)) {
                    // Handle case where dynamicAnswers might be an object instead of array
                    console.log('dynamicAnswers is not an array, treating as object:', typeof dynamicAnswersArray)
                    if (typeof dynamicAnswersArray === 'object') {
                      Object.keys(dynamicAnswersArray).forEach(key => {
                        const item = dynamicAnswersArray[key]
                        if (item && (item.question_code || item.questionCode || key)) {
                          const qCode = item.question_code || item.questionCode || key
                          let answerValue = item.answer_json || item.answer_value || item.answer || item
                          if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
                            answersFromArray[qCode] = {
                              value: answerValue,
                              questionText: item.question_text || item.questionText || '',
                              questionType: item.question_type || item.questionType || '',
                            }
                          }
                        }
                      })
                    }
                  }
                  
                  // Also check formatted data if available (from detailed format)
                  let formattedAnswers = {}
                  if (selectedAssessment.formatted && typeof selectedAssessment.formatted === 'object') {
                    console.log('Found formatted data:', selectedAssessment.formatted)
                    // formatted might contain answers in a different structure
                    if (selectedAssessment.formatted.answers) {
                      formattedAnswers = selectedAssessment.formatted.answers
                    } else if (Array.isArray(selectedAssessment.formatted)) {
                      // Might be an array of answer objects
                      selectedAssessment.formatted.forEach(item => {
                        if (item.questionCode || item.question_code) {
                          const qCode = item.questionCode || item.question_code
                          formattedAnswers[qCode] = {
                            value: item.answer || item.value || '',
                            questionText: item.questionText || item.question_text || '',
                            questionType: item.questionType || item.question_type || '',
                          }
                        }
                      })
                    }
                  }
                  
                  // Build all answers object - prioritize dynamicAnswers array, then answers object, then formatted, then legacy columns
                  const allAnswers = {}
                  
                  // First, add answers from dynamicAnswersArray (has question metadata) - BEST SOURCE
                  if (Object.keys(answersFromArray).length > 0) {
                    console.log('✅ Using answers from dynamicAnswers array:', Object.keys(answersFromArray).length, 'answers')
                    Object.assign(allAnswers, answersFromArray)
                  }
                  
                  // Then add from answers object (merge, don't replace)
                  if (Object.keys(answersObj).length > 0) {
                    console.log('Merging answers from answers object:', Object.keys(answersObj).length, 'keys')
                    Object.keys(answersObj).forEach(key => {
                      // Only add if not already in allAnswers
                      if (!allAnswers[key]) {
                        let answerValue = answersObj[key]
                        
                        // Skip null, undefined, or empty string values
                        if (answerValue === null || answerValue === undefined || answerValue === '') {
                          return
                        }
                        
                        // Parse JSON string if needed
                        if (typeof answerValue === 'string' && (answerValue.startsWith('{') || answerValue.startsWith('['))) {
                          try {
                            answerValue = JSON.parse(answerValue)
                          } catch (e) {
                            console.warn(`Failed to parse answer JSON for ${key}:`, e)
                            // Keep as string if parsing fails
                          }
                        }
                        
                        allAnswers[key] = {
                          value: answerValue,
                          questionText: allQuestionsMap[key]?.questionText || '',
                          questionType: allQuestionsMap[key]?.questionType || '',
                        }
                      }
                    })
                    console.log('✅ Merged answers from object. Total now:', Object.keys(allAnswers).length)
                  }
                  
                  // Then add formatted answers (merge, don't replace)
                  if (Object.keys(formattedAnswers).length > 0) {
                    console.log('Merging answers from formatted data:', Object.keys(formattedAnswers).length, 'keys')
                    Object.keys(formattedAnswers).forEach(key => {
                      if (!allAnswers[key]) {
                        allAnswers[key] = formattedAnswers[key]
                      }
                    })
                    console.log('✅ Merged formatted answers. Total now:', Object.keys(allAnswers).length)
                  }
                  
                  // IMPORTANT: The backend spreads dynamicAnswers directly onto the assessment object
                  // So question codes like 'q1', 'q2' etc. might be direct properties of selectedAssessment
                  // Check for these FIRST, before other methods, since backend spreads them
                  console.log('Checking for answers as direct properties on assessment object (backend spreads them)...')
                  
                  // Get all question codes from the questions map
                  const allQuestionCodes = Object.keys(allQuestionsMap)
                  console.log('Available question codes from map:', allQuestionCodes.length, 'total')
                  
                  // Also check common question code patterns
                  const commonQuestionPatterns = [
                    /^q\d+$/,           // q1, q2, q3, etc.
                    /^q\d+_/,           // q6_details, q15_details, etc.
                    /^[a-z]+\d+$/,      // emp1, cat1, etc.
                    /^[a-z]+_\d+$/,     // emp_1, cat_1, etc.
                  ]
                  
                  // Check all properties on the assessment object
                  Object.keys(selectedAssessment).forEach(key => {
                    // Skip known non-answer properties
                    const skipKeys = ['id', 'user_id', 'contact_name', 'contact_email', 'company_name', 'contact_title',
                      'submitted_at', 'created_at', 'updated_at', 'active_date', 'expiry_date',
                      'status', 'isExpired', 'isPending', 'isCurrentlyActive', 'summary', 'formatted',
                      'user_name', 'user_email', 'user_role', 'is_currently_active', 'answers', 'dynamicAnswers',
                      'dynamic_answers', 'answer_details', 'formatted', 'summary']
                    
                    if (skipKeys.includes(key)) return
                    
                    // Check if this key looks like a question code
                    const looksLikeQuestionCode = allQuestionCodes.includes(key) || 
                                                  commonQuestionPatterns.some(pattern => pattern.test(key))
                    
                    if (looksLikeQuestionCode || allQuestionCodes.length === 0) {
                      const value = selectedAssessment[key]
                      // Only add if value is not null/undefined/empty
                      if (value !== null && value !== undefined && value !== '' && typeof value !== 'object') {
                        console.log(`✅ Found direct property answer: ${key} =`, value)
                        const questionInfo = allQuestionsMap[key] || {}
                        if (!allAnswers[key]) { // Don't override if already found
                          allAnswers[key] = {
                            value: value,
                            questionText: questionInfo.questionText || `Question ${key}`,
                            questionType: questionInfo.questionType || '',
                          }
                        }
                      }
                    }
                  })
                  
                  if (Object.keys(allAnswers).length > 0) {
                    console.log('✅ Found answers as direct properties:', Object.keys(allAnswers))
                  } else {
                    console.log('⚠️ No answers found as direct properties')
                  }
                  
                  // CRITICAL FIX: Also check legacy question columns (q1, q2, etc.) even if they're in the object
                  // The backend might return them as null in the response, but we should still check
                  // because they might have been saved in legacy format
                  const legacyQuestionCodes = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q6_details', 'q7', 'q8', 'q9', 'q10',
                    'q11', 'q12', 'q13', 'q14', 'q15', 'q15_details', 'q16', 'q17', 'q18', 'q19', 'q20',
                    'q21', 'q22_discovery', 'q22_pilot', 'q22_feedback', 'q23', 'q24', 'q25']
                  
                  legacyQuestionCodes.forEach(qCode => {
                    // Only add if not already in allAnswers and the value exists
                    if (!allAnswers[qCode] && 
                        selectedAssessment.hasOwnProperty(qCode) && 
                        selectedAssessment[qCode] !== null && 
                        selectedAssessment[qCode] !== undefined && 
                        selectedAssessment[qCode] !== '') {
                      console.log(`Found legacy column answer: ${qCode} =`, selectedAssessment[qCode])
                      const questionInfo = allQuestionsMap[qCode] || {}
                      allAnswers[qCode] = {
                        value: selectedAssessment[qCode],
                        questionText: questionInfo.questionText || `Question ${qCode}`,
                        questionType: questionInfo.questionType || '',
                      }
                    }
                  })
                  
                  // Add legacy format answers if they exist and aren't already in allAnswers
                  const legacyQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q6_details', 'q7', 'q8', 'q9', 'q10',
                    'q11', 'q12', 'q13', 'q14', 'q15', 'q15_details', 'q16', 'q17', 'q18', 'q19', 'q20',
                    'q21', 'q22_discovery', 'q22_pilot', 'q22_feedback', 'q23', 'q24']
                  
                  legacyQuestions.forEach(qCode => {
                    if (selectedAssessment[qCode] !== undefined && selectedAssessment[qCode] !== null && selectedAssessment[qCode] !== '' && !allAnswers[qCode]) {
                      const questionInfo = allQuestionsMap[qCode] || {}
                      allAnswers[qCode] = {
                        value: selectedAssessment[qCode],
                        questionText: questionInfo.questionText || `Question ${qCode}`,
                        questionType: questionInfo.questionType || '',
                      }
                    }
                  })
                  
                  // Additional fallback: Search for any property that looks like an answer
                  // This handles cases where answers might be stored in unexpected locations
                  if (Object.keys(allAnswers).length === 0) {
                    console.log('No answers found in standard locations, searching assessment object...')
                    // Look for any property that starts with 'q' followed by a number (question codes)
                    // Also check for camelCase question codes
                    Object.keys(selectedAssessment).forEach(key => {
                      // Match question codes like q1, q2, q22_discovery, emp_1, etc.
                      // Exclude known non-answer properties
                      const isAnswerKey = (
                        (/^q\d+/.test(key) || /^[a-z]+\d+/.test(key) || /^[a-z]+_\d+/.test(key)) &&
                        !['id', 'user_id', 'contact_name', 'contact_email', 'company_name', 'contact_title',
                          'submitted_at', 'created_at', 'updated_at', 'active_date', 'expiry_date',
                          'status', 'isExpired', 'isPending', 'isCurrentlyActive', 'answers', 'dynamicAnswers',
                          'summary', 'formatted', 'user_name', 'user_email', 'user_role'].includes(key)
                      )
                      
                      if (isAnswerKey && 
                          selectedAssessment[key] !== null && 
                          selectedAssessment[key] !== undefined && 
                          selectedAssessment[key] !== '') {
                        console.log(`Found answer property: ${key} =`, selectedAssessment[key])
                        const questionInfo = allQuestionsMap[key] || {}
                        allAnswers[key] = {
                          value: selectedAssessment[key],
                          questionText: questionInfo.questionText || `Question ${key}`,
                          questionType: questionInfo.questionType || '',
                        }
                      }
                    })
                    
                    // Also check for nested answer objects
                    if (selectedAssessment.data && selectedAssessment.data.answers) {
                      console.log('Found nested answers in data.answers')
                      const nestedAnswers = typeof selectedAssessment.data.answers === 'string' 
                        ? JSON.parse(selectedAssessment.data.answers) 
                        : selectedAssessment.data.answers
                      
                      Object.keys(nestedAnswers).forEach(key => {
                        if (!allAnswers[key] && nestedAnswers[key] !== null && nestedAnswers[key] !== undefined && nestedAnswers[key] !== '') {
                          const questionInfo = allQuestionsMap[key] || {}
                          allAnswers[key] = {
                            value: nestedAnswers[key],
                            questionText: questionInfo.questionText || `Question ${key}`,
                            questionType: questionInfo.questionType || '',
                          }
                        }
                      })
                    }
                  }
                  
                  // Debug: Log what we found
                  console.log('=== FINAL EXTRACTED ANSWERS ===')
                  console.log('All answers:', allAnswers)
                  console.log('Answers count:', Object.keys(allAnswers).length)
                  console.log('Answer keys:', Object.keys(allAnswers))
                  console.log('==============================')
                  
                  // If we have dynamicAnswersArray, use it to organize by category from the database
                  if (Array.isArray(dynamicAnswersArray) && dynamicAnswersArray.length > 0 && questions.length > 0) {
                    // Group by category using questions data
                    const answersByCategory = {}
                    dynamicAnswersArray.forEach(item => {
                      if (!item.question_code) return
                      
                      const question = allQuestionsMap[item.question_code]
                      // Skip child questions here (they'll be shown under parents)
                      if (question && question.parentCode) return
                      
                      const catId = question?.categoryId || 'unknown'
                      const catName = question?.categoryName || 'Unknown Category'
                      
                      if (!answersByCategory[catId]) {
                        answersByCategory[catId] = {
                          categoryName: catName,
                          questions: []
                        }
                      }
                      
                      const answerValue = item.answer_json || item.answer_value || ''
                      answersByCategory[catId].questions.push({
                        questionCode: item.question_code,
                        questionText: item.question_text || question?.questionText || `Question ${item.question_code}`,
                        questionType: item.question_type || question?.questionType || '',
                        answer: answerValue,
                        children: question?.children || []
                      })
                    })
                    
                    // Sort categories
                    const sortedCats = Object.keys(answersByCategory).sort((a, b) => {
                      const catA = questions.find(c => c.id === parseInt(a) || c.id === a)
                      const catB = questions.find(c => c.id === parseInt(b) || c.id === b)
                      return (catA?.displayOrder || 999) - (catB?.displayOrder || 999)
                    })
                    
                    // Sequential question numbering starting from 1
                    let questionNumber = 1
                    
                    return sortedCats.map(catId => {
                      const catData = answersByCategory[catId]
                      if (!catData || catData.questions.length === 0) return null
                      
                      return (
                        <div key={catId} className="detail-section">
                          <h3>{catData.categoryName}</h3>
                          <div className="question-grid">
                            {catData.questions
                              .sort((a, b) => {
                                const qA = allQuestionsMap[a.questionCode]
                                const qB = allQuestionsMap[b.questionCode]
                                return (qA?.displayOrder || 0) - (qB?.displayOrder || 0)
                              })
                              .map((question) => {
                                const currentQuestionNumber = questionNumber++
                                const displayAnswer = question.answer === '' || question.answer === null || question.answer === undefined
                                  ? 'Not answered'
                                  : String(question.answer)
                                
                                return (
                                  <React.Fragment key={question.questionCode}>
                                    <div className={`question-item ${question.questionType === 'text' ? 'full-width' : ''}`}>
                                      <div className="question-text">
                                        <strong>{currentQuestionNumber}:</strong>{' '}
                                        <SafeDescriptionHtml as="span" html={question.questionText} />
                                      </div>
                                      <div className="answer-value">
                                        <span className="answer-label">Answer:</span>
                                        {displayAnswer}
                                      </div>
                                    </div>
                                    {/* Show child questions if parent was answered "yes" */}
                                    {question.children && question.children.length > 0 &&
                                     (question.answer === 'yes' || question.answer === 'Yes' || question.answer === '1') &&
                                     question.children.map(child => {
                                       const childQuestionNumber = questionNumber++
                                       const childAnswer = allAnswers[child.questionCode]?.value || 
                                                          answersFromArray[child.questionCode]?.value || 
                                                          selectedAssessment[child.questionCode] || 
                                                          null
                                       const childQuestionInfo = allQuestionsMap[child.questionCode]
                                       const childDisplayAnswer = formatAnswer(
                                         childAnswer,
                                         child.questionCode,
                                         childQuestionInfo?.questionType || child.questionType
                                       )
                                       return (
                                         <div key={child.questionCode || child.id} className="question-item full-width" style={{ marginLeft: '40px', paddingLeft: '20px', borderLeft: '4px solid #667eea', background: '#f8f9ff' }}>
                                           <div className="question-text">
                                             <strong>{childQuestionNumber}:</strong> {child.questionText || `Question ${child.questionCode}`}
                                           </div>
                                           <div className="answer-value">
                                             <span className="answer-label">Answer:</span>
                                             {childDisplayAnswer}
                                           </div>
                                         </div>
                                       )
                                     })
                                    }
                                  </React.Fragment>
                                )
                              })}
                          </div>
                        </div>
                      )
                    }).filter(Boolean)
                  }
                  
                  // Final fallback: Try to display answers even if we can't match them to questions
                  // This handles cases where answers exist but question codes don't match
                  if (Object.keys(allAnswers).length === 0) {
                    console.log('Still no answers found, trying to extract any answer-like data...')
                    
                    // Try to find ANY properties that look like answers
                    const potentialAnswers = {}
                    Object.keys(selectedAssessment).forEach(key => {
                      // Skip known non-answer properties
                      const skipKeys = ['id', 'user_id', 'contact_name', 'contact_email', 'company_name', 'contact_title',
                        'submitted_at', 'created_at', 'updated_at', 'active_date', 'expiry_date',
                        'status', 'isExpired', 'isPending', 'isCurrentlyActive', 'summary', 'formatted',
                        'user_name', 'user_email', 'user_role', 'is_currently_active']
                      
                      if (!skipKeys.includes(key) && 
                          selectedAssessment[key] !== null && 
                          selectedAssessment[key] !== undefined && 
                          selectedAssessment[key] !== '' &&
                          typeof selectedAssessment[key] !== 'object') {
                        // This might be an answer
                        potentialAnswers[key] = {
                          value: selectedAssessment[key],
                          questionText: allQuestionsMap[key]?.questionText || `Field: ${key}`,
                          questionType: allQuestionsMap[key]?.questionType || 'unknown',
                        }
                      }
                    })
                    
                    if (Object.keys(potentialAnswers).length > 0) {
                      console.log('Found potential answers:', potentialAnswers)
                      Object.assign(allAnswers, potentialAnswers)
                    }
                  }
                  
                  // Fallback: Display all answers in a simple list if no dynamicAnswersArray
                  if (Object.keys(allAnswers).length === 0) {
                    // Show debug info to help diagnose the issue
                    const assessmentKeys = Object.keys(selectedAssessment)
                    const answerKeys = assessmentKeys.filter(k => 
                      k.startsWith('q') || 
                      k === 'answers' || 
                      k === 'dynamicAnswers' || 
                      k === 'dynamic_answers' ||
                      k === 'answer_details' ||
                      k.includes('answer')
                    )
                    
                    // Check if legacy columns exist but are all null
                    const legacyColumns = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10']
                    const hasLegacyColumns = legacyColumns.some(key => selectedAssessment.hasOwnProperty(key))
                    const allLegacyNull = legacyColumns.every(key => 
                      !selectedAssessment.hasOwnProperty(key) || 
                      selectedAssessment[key] === null || 
                      selectedAssessment[key] === undefined || 
                      selectedAssessment[key] === ''
                    )
                    
                    const debugInfo = (
                      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', fontSize: '0.9em', border: '1px solid #ffc107' }}>
                        <strong>⚠️ Debug Information:</strong>
                        <div style={{ marginTop: '10px' }}>
                          <p><strong>Assessment ID:</strong> {selectedAssessment.id}</p>
                          <p><strong>Has answers property:</strong> {selectedAssessment.answers ? 'Yes (' + typeof selectedAssessment.answers + ', ' + Object.keys(selectedAssessment.answers).length + ' keys)' : 'No'}</p>
                          <p><strong>Has dynamicAnswers:</strong> {selectedAssessment.dynamicAnswers ? 'Yes (' + (Array.isArray(selectedAssessment.dynamicAnswers) ? selectedAssessment.dynamicAnswers.length + ' items' : typeof selectedAssessment.dynamicAnswers) + ')' : 'No'}</p>
                          <p><strong>Legacy columns present:</strong> {hasLegacyColumns ? 'Yes' : 'No'}</p>
                          <p><strong>All legacy columns null:</strong> {allLegacyNull ? 'Yes ⚠️' : 'No (some have values)'}</p>
                          <p><strong>Answer-related keys found:</strong> {answerKeys.length > 0 ? answerKeys.join(', ') : 'None'}</p>
                          
                          {selectedAssessment.answers && Object.keys(selectedAssessment.answers).length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <strong>Answers object preview ({Object.keys(selectedAssessment.answers).length} keys):</strong>
                              <pre style={{ marginTop: '5px', fontSize: '0.8em', overflow: 'auto', maxHeight: '200px', background: '#fff', padding: '10px', borderRadius: '4px' }}>
                                {typeof selectedAssessment.answers === 'string' 
                                  ? selectedAssessment.answers.substring(0, 500) 
                                  : JSON.stringify(selectedAssessment.answers, null, 2).substring(0, 1000)}
                              </pre>
                            </div>
                          )}
                          
                          {Array.isArray(selectedAssessment.dynamicAnswers) && selectedAssessment.dynamicAnswers.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <strong>DynamicAnswers array ({selectedAssessment.dynamicAnswers.length} items):</strong>
                              <pre style={{ marginTop: '5px', fontSize: '0.8em', overflow: 'auto', maxHeight: '200px', background: '#fff', padding: '10px', borderRadius: '4px' }}>
                                {JSON.stringify(selectedAssessment.dynamicAnswers.slice(0, 5), null, 2)}
                                {selectedAssessment.dynamicAnswers.length > 5 ? '\n... (' + (selectedAssessment.dynamicAnswers.length - 5) + ' more items)' : ''}
                              </pre>
                            </div>
                          )}
                          
                          <div style={{ marginTop: '15px', padding: '10px', background: '#f8d7da', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
                            <strong>🔍 Possible Issues:</strong>
                            <ul style={{ marginTop: '8px', marginLeft: '20px', paddingLeft: '0' }}>
                              <li>Answers may not have been saved to the database during submission</li>
                              <li>Question codes in submitted answers may not match active questions in database</li>
                              <li>Answers may be stored in a different format than expected</li>
                              <li>Database query may not be retrieving answers correctly</li>
                            </ul>
                            <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                              <strong>Solution:</strong> Check backend logs during assessment submission to see if answers were saved to <code>assessment_answers</code> table.
                            </p>
                          </div>
                          
                          <details style={{ marginTop: '10px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Show all assessment keys ({assessmentKeys.length})</summary>
                            <pre style={{ marginTop: '5px', fontSize: '0.8em', overflow: 'auto', maxHeight: '200px', background: '#fff', padding: '10px', borderRadius: '4px' }}>
                              {assessmentKeys.join(', ')}
                            </pre>
                          </details>
                          <p style={{ marginTop: '10px', fontSize: '0.85em', color: '#666' }}>
                            <strong>Note:</strong> Check the browser console (F12) for detailed debug logs showing the full API response.
                          </p>
                        </div>
                      </div>
                    )
                    
                    return (
                      <div className="detail-section">
                        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', border: '2px solid #e74c3c', marginBottom: '15px' }}>
                          <p style={{ color: '#721c24', fontWeight: '700', fontSize: '1.1em', marginBottom: '10px' }}>
                            ⚠️ No Answers Found for This Assessment
                          </p>
                          <p style={{ color: '#721c24', fontSize: '0.95em', marginBottom: '8px' }}>
                            <strong>Assessment ID:</strong> {selectedAssessment.id}
                          </p>
                          <p style={{ color: '#721c24', fontSize: '0.95em', marginBottom: '8px' }}>
                            <strong>Submitted:</strong> {formatDate(selectedAssessment.submitted_at || selectedAssessment.submittedAt)}
                          </p>
                          <p style={{ color: '#721c24', fontSize: '0.95em' }}>
                            The assessment record exists, but no answer data was found in the database. This typically happens when:
                          </p>
                          <ul style={{ color: '#721c24', fontSize: '0.95em', marginTop: '10px', marginLeft: '25px' }}>
                            <li>Question codes in submitted answers don't match active questions in the database</li>
                            <li>Questions were not active (is_active = false) when the assessment was submitted</li>
                            <li>Answers failed to save to the assessment_answers table during submission</li>
                            <li>There was a database error during answer insertion</li>
                          </ul>
                          <p style={{ color: '#721c24', fontSize: '0.9em', marginTop: '12px', fontStyle: 'italic' }}>
                            <strong>Action Required:</strong> Check backend server logs during the time of submission to see if there were warnings about question codes not being found.
                          </p>
                        </div>
                        {debugInfo}
                      </div>
                    )
                  }
                  
                  // Display answers grouped by category if we have questions map, otherwise simple list
                  if (Object.keys(allQuestionsMap).length > 0 && questions.length > 0) {
                    const answersByCategory = {}
                    Object.keys(allAnswers).forEach(questionCode => {
                      const answerData = allAnswers[questionCode]
                      const question = allQuestionsMap[questionCode]
                      
                      // Skip child questions (they'll be shown under parents)
                      if (question && question.parentCode) return
                      
                      const catId = question?.categoryId || 'other'
                      const catName = question?.categoryName || 'Other Questions'
                      
                      if (!answersByCategory[catId]) {
                        answersByCategory[catId] = {
                          categoryName: catName,
                          questions: []
                        }
                      }
                      
                      answersByCategory[catId].questions.push({
                        questionCode,
                        questionText: answerData.questionText || question?.questionText || `Question ${questionCode}`,
                        questionType: answerData.questionType || question?.questionType || '',
                        answer: answerData.value,
                        children: question?.children || []
                      })
                    })
                    
                    // Sort categories
                    const sortedCats = Object.keys(answersByCategory).sort((a, b) => {
                      const catA = questions.find(c => c.id === parseInt(a) || c.id === a)
                      const catB = questions.find(c => c.id === parseInt(b) || c.id === b)
                      return (catA?.displayOrder || 999) - (catB?.displayOrder || 999)
                    })
                    
                    // Sequential question numbering starting from 1
                    let questionNumber = 1
                    
                    return sortedCats.map(catId => {
                      const catData = answersByCategory[catId]
                      if (!catData || catData.questions.length === 0) return null
                      
                      return (
                        <div key={catId} className="detail-section">
                          <h3>{catData.categoryName}</h3>
                          <div className="question-grid">
                            {catData.questions
                              .sort((a, b) => {
                                const qA = allQuestionsMap[a.questionCode]
                                const qB = allQuestionsMap[b.questionCode]
                                return (qA?.displayOrder || 0) - (qB?.displayOrder || 0)
                              })
                              .map((question) => {
                                const currentQuestionNumber = questionNumber++
                                const questionInfo = allQuestionsMap[question.questionCode]
                                const displayAnswer = formatAnswer(
                                  question.answer,
                                  question.questionCode,
                                  questionInfo?.questionType || question.questionType
                                )
                                
                                return (
                                  <React.Fragment key={question.questionCode}>
                                    <div className={`question-item ${question.questionType === 'text' ? 'full-width' : ''}`}>
                                      <div className="question-text">
                                        <strong>{currentQuestionNumber}:</strong>{' '}
                                        <SafeDescriptionHtml as="span" html={question.questionText} />
                                      </div>
                                      <div className="answer-value">
                                        <span className="answer-label">Answer:</span>
                                        {displayAnswer}
                                      </div>
                                    </div>
                                    {/* Show child questions if parent was answered "yes" */}
                                    {question.children && question.children.length > 0 &&
                                     (question.answer === 'yes' || question.answer === 'Yes' || question.answer === '1') &&
                                     question.children.map(child => {
                                       const childQuestionNumber = questionNumber++
                                       const childData = allAnswers[child.questionCode]
                                       const childAnswer = childData?.value || selectedAssessment[child.questionCode] || null
                                       const childQuestionInfo = allQuestionsMap[child.questionCode]
                                       const childDisplayAnswer = formatAnswer(
                                         childAnswer,
                                         child.questionCode,
                                         childQuestionInfo?.questionType || child.questionType
                                       )
                                       return (
                                         <div key={child.questionCode || child.id} className="question-item full-width" style={{ marginLeft: '40px', paddingLeft: '20px', borderLeft: '4px solid #667eea', background: '#f8f9ff' }}>
                                           <div className="question-text">
                                             <strong>{childQuestionNumber}:</strong> {child.questionText || childData?.questionText || `Question ${child.questionCode}`}
                                           </div>
                                           <div className="answer-value">
                                             <span className="answer-label">Answer:</span>
                                             {childDisplayAnswer}
                                           </div>
                                         </div>
                                       )
                                     })
                                    }
                                  </React.Fragment>
                                )
                              })}
                          </div>
                        </div>
                      )
                    }).filter(Boolean)
                  }
                  
                  // Last fallback: Simple list of all answers
                  // Sequential question numbering starting from 1
                  let questionNumber = 1
                  
                  return (
                    <div className="detail-section">
                      <h3>Assessment Answers</h3>
                      <div className="question-grid">
                        {Object.keys(allAnswers).map(questionCode => {
                          const currentQuestionNumber = questionNumber++
                          const answerData = allAnswers[questionCode]
                          const questionInfo = allQuestionsMap[questionCode]
                          const displayAnswer = formatAnswer(
                            answerData.value,
                            questionCode,
                            questionInfo?.questionType || answerData.questionType
                          )
                          return (
                            <div key={questionCode} className={`question-item ${answerData.questionType === 'text' ? 'full-width' : ''}`}>
                              <div className="question-text">
                                <strong>{currentQuestionNumber}:</strong> {answerData.questionText || `Question ${questionCode}`}
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
                  )
                })()}

                <div className="detail-section highlight">
                  <p><strong>📅 Submitted At:</strong> {formatDate(selectedAssessment.submitted_at || selectedAssessment.submittedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedAssessment(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
        )
      })()}
    </div>
  )
}

export default AdminDashboard
