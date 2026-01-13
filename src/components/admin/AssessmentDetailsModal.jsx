import React from 'react'
import { formatDate } from '../../utils/formatDate'
import { formatAnswer } from '../../utils/formatAnswer'

/**
 * Assessment Details Modal - displays full assessment information including answers
 * Updated UI to match the cleaner design from the second image
 */
function AssessmentDetailsModal({ assessment, allQuestionsMap, questions, onClose }) {
  // Helper function to format answer with labels for scale questions
  const formatAnswerLocal = (answer, questionCode, questionType) => {
    const question = allQuestionsMap?.[questionCode]
    return formatAnswer(answer, questionCode, questionType, question)
  }

  // Extract answers from various sources and group by category
  const extractAnswers = () => {
    const allAnswers = {}
    const answersByCategory = {}
    
    console.log('🔍 AssessmentDetailsModal - extractAnswers called')
    console.log('📦 Assessment data:', {
      id: assessment.id,
      assessment_type_id: assessment.assessment_type_id,
      hasDynamicAnswers: !!assessment.dynamicAnswers,
      dynamicAnswersLength: assessment.dynamicAnswers?.length || 0,
      hasAnswers: !!assessment.answers,
      allQuestionsMapKeys: Object.keys(allQuestionsMap || {}).length
    })
    
    // Try dynamicAnswers array first (from assessment_answers table)
    const dynamicAnswersArray = assessment.dynamicAnswers || 
                               assessment.dynamic_answers || 
                               assessment.answer_details || 
                               []
    
    console.log('📋 dynamicAnswersArray:', dynamicAnswersArray)
    
    if (Array.isArray(dynamicAnswersArray) && dynamicAnswersArray.length > 0) {
      console.log(`📋 Processing ${dynamicAnswersArray.length} dynamic answers...`)
      dynamicAnswersArray.forEach((item, index) => {
        console.log(`Processing answer ${index + 1}:`, item)
        const qCode = item.question_code || item.questionCode || item.question_id
        if (qCode) {
          // Include ALL answers, even if empty - we want to show all questions that were answered
          // The answer value might be empty string, null, or undefined, but we still want to show the question
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
          
          // Use question text directly from dynamicAnswers (from database) - this is the source of truth
          // This ensures we show dynamic questions regardless of allQuestionsMap
          // IMPORTANT: question_text should always come from the database via dynamicAnswers
          let questionText = item.question_text || item.questionText
          if (!questionText || questionText.trim() === '' || questionText === 'N/A') {
            // Fallback to allQuestionsMap only if database doesn't have it
            questionText = allQuestionsMap?.[qCode]?.questionText || allQuestionsMap?.[qCode]?.question_text
          }
          // Final fallback - show question code if no text available
          if (!questionText || questionText.trim() === '' || questionText === 'N/A') {
            questionText = `Question ${qCode}`
          }
          
          let categoryName = item.category_name || item.categoryName
          if (!categoryName || categoryName.trim() === '' || categoryName === 'N/A') {
            categoryName = allQuestionsMap?.[qCode]?.categoryName || 'General'
          }
          
          const questionType = item.question_type || item.questionType || allQuestionsMap?.[qCode]?.questionType || ''
          
          console.log(`✅ Added answer for ${qCode}:`, {
            questionText: questionText,
            answerValue: answerValue,
            categoryName: categoryName,
            questionType: questionType,
            hasQuestionText: !!questionText && questionText !== 'N/A',
            hasAnswerValue: answerValue !== null && answerValue !== undefined && answerValue !== '' && String(answerValue).trim() !== '',
            itemKeys: Object.keys(item),
            itemQuestionText: item.question_text,
            itemQuestionTextAlt: item.questionText,
            source: item.question_text ? 'database' : (allQuestionsMap?.[qCode] ? 'map' : 'fallback')
          })
          
          allAnswers[qCode] = {
            value: answerValue,
            questionText: questionText, // Use text from database, not from map
            questionType: questionType,
            categoryName: categoryName,
          }
          
          // Group by category - include all fields from dynamicAnswers for hierarchy building
          if (!answersByCategory[categoryName]) {
            answersByCategory[categoryName] = []
          }
          answersByCategory[categoryName].push({
            questionCode: qCode,
            value: answerValue,
            questionText: questionText,
            questionType: questionType,
            categoryName: categoryName,
            // Include hierarchy fields from dynamicAnswers
            parent_id: item.parent_id || item.parentId,
            parentId: item.parent_id || item.parentId,
            id: item.id,
            display_order: item.display_order || item.displayOrder,
            // Include question info for hierarchy building
            questionInfo: allQuestionsMap?.[qCode]
          })
        }
      })
    }
    
    // Only use old answers object if dynamicAnswers is not available
    // This prevents showing unfiltered answers when we have filtered dynamicAnswers
    if (!dynamicAnswersArray || dynamicAnswersArray.length === 0) {
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
          if (!allAnswers[key] && answersObj[key] !== null && answersObj[key] !== undefined && String(answersObj[key]).trim() !== '') {
            const categoryName = allQuestionsMap?.[key]?.categoryName || 'General'
            allAnswers[key] = {
              value: answersObj[key],
              questionText: allQuestionsMap?.[key]?.questionText || '',
              questionType: allQuestionsMap?.[key]?.questionType || '',
              categoryName: categoryName,
            }
            
            // Group by category
            if (!answersByCategory[categoryName]) {
              answersByCategory[categoryName] = []
            }
            answersByCategory[categoryName].push({
              questionCode: key,
              ...allAnswers[key]
            })
          }
        })
      }
    } else {
      console.log('✅ Using filtered dynamicAnswers, skipping old answers object')
    }
    
    console.log('📊 Final allAnswers:', {
      count: Object.keys(allAnswers).length,
      keys: Object.keys(allAnswers),
      categories: Object.keys(answersByCategory),
      sample: Object.keys(allAnswers).length > 0 ? allAnswers[Object.keys(allAnswers)[0]] : null
    })
    
    return { allAnswers, answersByCategory }
  }

  const { allAnswers, answersByCategory } = extractAnswers()
  
  console.log('🎯 Rendering AssessmentDetailsModal with', Object.keys(allAnswers).length, 'answers')

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        <div className="modal-header" style={{
          padding: '24px 30px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px 16px 0 0',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
            📋 Assessment Details
          </h2>
          <button onClick={onClose} className="close-btn" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            fontWeight: 'bold'
          }} onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}>×</button>
        </div>
        <div className="modal-body" style={{ padding: '30px' }}>
          <div className="assessment-details">
            {/* Contact Information Section */}
            <div className="detail-section" style={{
              padding: '24px',
              background: '#f8f9ff',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #e0e7ff'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '1.2em', 
                fontWeight: '600',
                color: '#667eea',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                👤 Contact Information
              </h3>
              <div className="info-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                <div className="info-item" style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <strong style={{ color: '#666', display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>Name:</strong>
                  <span style={{ color: '#333', fontSize: '1em' }}>{assessment.user_name || assessment.contact_name || 'N/A'}</span>
                </div>
                <div className="info-item" style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <strong style={{ color: '#666', display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>Email:</strong>
                  <span style={{ color: '#333', fontSize: '1em' }}>{assessment.user_email || assessment.contact_email || 'N/A'}</span>
                </div>
                <div className="info-item" style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <strong style={{ color: '#666', display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>Company:</strong>
                  <span style={{ color: '#333', fontSize: '1em' }}>{assessment.company_name || 'N/A'}</span>
                </div>
                <div className="info-item" style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <strong style={{ color: '#666', display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>Title:</strong>
                  <span style={{ color: '#333', fontSize: '1em' }}>{assessment.contact_title || 'N/A'}</span>
                </div>
              </div>
              {!assessment.user_id && (
                <div className="info-item full-width" style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  background: '#fff3cd', 
                  borderRadius: '8px', 
                  border: '1px solid #ffc107',
                  textAlign: 'center'
                }}>
                  <span style={{ color: '#856404', fontWeight: '500', fontSize: '0.95em' }}>📝 Anonymous Submission</span>
                </div>
              )}
            </div>

            {/* Assessment Answers Section - Grouped by Category */}
            {Object.keys(answersByCategory).length > 0 ? (
              Object.keys(answersByCategory).map((categoryName, categoryIndex) => {
                const categoryAnswers = answersByCategory[categoryName]
                return (
                  <div key={categoryName} className="detail-section" style={{
                    padding: '24px',
                    background: '#f8f9ff',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '1px solid #e0e7ff'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 20px 0', 
                      fontSize: '1.2em', 
                      fontWeight: '600',
                      color: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      {categoryIndex === 0 && '📋 '}
                      {categoryIndex === 1 && '📋 '}
                      Section {categoryIndex + 1}: {categoryName}
                    </h3>
                    <div className="answers-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(() => {
                        // Build a hierarchical structure of questions with parent-child relationships
                        const buildQuestionHierarchy = (answers) => {
                          const questionMap = {}
                          const rootQuestions = []
                          
                          // First pass: create map of all questions
                          answers.forEach(answerData => {
                            const questionInfo = allQuestionsMap?.[answerData.questionCode] || questions?.find(cat => 
                              cat.questions?.some(q => (q.questionCode || q.question_code) === answerData.questionCode)
                            )?.questions?.find(q => (q.questionCode || q.question_code) === answerData.questionCode)
                            
                            questionMap[answerData.questionCode] = {
                              ...answerData,
                              questionInfo,
                              children: [],
                              parentId: answerData.parent_id || answerData.parentId || questionInfo?.parent_id || questionInfo?.parentId,
                              id: answerData.id || questionInfo?.id,
                              hasChildren: false // Will be determined in second pass
                            }
                          })
                          
                          // Second pass: build hierarchy and determine hasChildren
                          Object.values(questionMap).forEach(q => {
                            // Check if this question has children
                            const hasChildren = Object.values(questionMap).some(child => {
                              if (!child.parentId || child === q) return false
                              // Match by ID (most reliable)
                              if (child.parentId === q.id) return true
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
                                if (p.id === q.parentId) return true
                                // Match by questionCode as fallback
                                if (p.questionCode === q.parentId) return true
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
                        
                        console.log('🔍 AssessmentDetailsModal - Category:', categoryName)
                        console.log('  Total answers:', categoryAnswers.length)
                        console.log('  Hierarchical questions:', hierarchicalQuestions.length)
                        console.log('  Root questions:', hierarchicalQuestions.map(q => ({
                          code: q.questionCode,
                          text: q.questionText?.substring(0, 30),
                          hasChildren: q.hasChildren,
                          childrenCount: q.children?.length || 0
                        })))
                        
                        // Fallback: if hierarchy building returns empty, show all questions as flat list
                        if (!hierarchicalQuestions || hierarchicalQuestions.length === 0) {
                          console.warn('⚠️ Hierarchy building returned empty, showing flat list for category:', categoryName)
                          let flatCounter = 0
                          return categoryAnswers.map((answerData, answerIndex) => {
                            flatCounter++
                            const questionInfo = allQuestionsMap?.[answerData.questionCode]
                            const displayAnswer = formatAnswerLocal(
                              answerData.value,
                              answerData.questionCode,
                              questionInfo?.questionType || answerData.questionType
                            )
                            
                            return (
                              <div key={answerData.questionCode || answerIndex} className="answer-item" style={{
                                padding: '20px',
                                background: 'white',
                                borderRadius: '10px',
                                border: '1px solid #e0e0e0',
                                marginBottom: '16px'
                              }}>
                                <div className="question-text" style={{
                                  marginBottom: '12px',
                                  fontSize: '1em',
                                  color: '#333',
                                  fontWeight: '500',
                                  lineHeight: '1.5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <strong style={{ color: '#667eea', marginRight: '4px' }}>
                                    Q{flatCounter}:
                                  </strong>
                                  <span>
                                    {answerData.questionText && answerData.questionText !== 'N/A' 
                                      ? answerData.questionText 
                                      : (questionInfo?.questionText && questionInfo.questionText !== 'N/A'
                                        ? questionInfo.questionText
                                        : `Question ${answerData.questionCode}`)}
                                  </span>
                                </div>
                                <div className="answer-value" style={{
                                  padding: '12px',
                                  background: '#f8f9fa',
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0',
                                  borderLeft: '4px solid #667eea'
                                }}>
                                  <span className="answer-label" style={{
                                    color: '#666',
                                    fontWeight: '600',
                                    marginRight: '8px',
                                    fontSize: '0.9em'
                                  }}>Answer:</span>
                                  <span style={{ color: '#333' }}>
                                    {displayAnswer && displayAnswer !== 'Not answered' && displayAnswer !== 'N/A'
                                      ? displayAnswer 
                                      : <span style={{ color: '#999', fontStyle: 'italic' }}>No answer provided</span>}
                                  </span>
                                </div>
                              </div>
                            )
                          })
                        }
                        
                        let parentQuestionCounter = 0 // Only count parent questions
                        
                        // Recursive function to render questions with their children (similar to submission/results page)
                        const renderQuestionWithChildren = (questionData, level = 0) => {
                          const isChild = level > 0
                          const questionInfo = questionData.questionInfo || allQuestionsMap?.[questionData.questionCode]
                          const displayAnswer = formatAnswerLocal(
                            questionData.value,
                            questionData.questionCode,
                            questionInfo?.questionType || questionData.questionType
                          )
                          
                          // Only increment counter for parent questions (not children)
                          if (!isChild) {
                            parentQuestionCounter++
                          }
                          
                          console.log(`📝 Rendering question:`, {
                            code: questionData.questionCode,
                            level,
                            isChild,
                            counter: !isChild ? parentQuestionCounter : 'N/A (child)',
                            hasChildren: questionData.hasChildren,
                            childrenCount: questionData.children?.length || 0
                          })
                          
                          return (
                            <React.Fragment key={questionData.questionCode}>
                              <div className="answer-item" style={{
                                padding: level === 0 ? '20px' : '15px',
                                background: isChild ? (level === 1 ? '#f8f9ff' : '#f0fff4') : 'white',
                                borderRadius: '10px',
                                border: level === 0 ? '1px solid #e0e0e0' : `3px solid ${level === 1 ? '#667eea' : '#48bb78'}`,
                                marginLeft: level > 0 ? `${level * 20}px` : '0',
                                marginTop: level > 0 ? '15px' : '0',
                                transition: 'all 0.2s'
                              }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.15)'
                                e.currentTarget.style.borderColor = isChild ? (level === 1 ? '#667eea' : '#48bb78') : '#667eea'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                                e.currentTarget.style.borderColor = isChild ? (level === 1 ? '#667eea' : '#48bb78') : (level === 0 ? '#e0e0e0' : (level === 1 ? '#667eea' : '#48bb78'))
                              }}>
                                <div className="question-text" style={{
                                  marginBottom: '12px',
                                  fontSize: level === 0 ? '1em' : (level === 1 ? '0.95em' : '0.9em'),
                                  color: '#333',
                                  fontWeight: '500',
                                  lineHeight: '1.5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap'
                                }}>
                                  {!isChild && (
                                    <strong style={{ color: '#667eea', marginRight: '4px' }}>
                                      Q{parentQuestionCounter}:
                                    </strong>
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
                                  <span>
                                    {questionData.questionText && questionData.questionText !== 'N/A' 
                                      ? questionData.questionText 
                                      : (questionInfo?.questionText && questionInfo.questionText !== 'N/A'
                                        ? questionInfo.questionText
                                        : `Question ${questionData.questionCode}`)}
                                  </span>
                                </div>
                                <div className="answer-value" style={{
                                  padding: '12px',
                                  background: '#f8f9fa',
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0',
                                  borderLeft: `4px solid ${isChild ? (level === 1 ? '#667eea' : '#48bb78') : '#667eea'}`
                                }}>
                                  <span className="answer-label" style={{
                                    color: isChild ? (level === 1 ? '#667eea' : '#48bb78') : '#666',
                                    fontWeight: '600',
                                    marginRight: '8px',
                                    fontSize: '0.9em'
                                  }}>Answer:</span>
                                  <span style={{ color: '#333' }}>
                                    {displayAnswer && displayAnswer !== 'Not answered' && displayAnswer !== 'N/A'
                                      ? displayAnswer 
                                      : <span style={{ color: '#999', fontStyle: 'italic' }}>No answer provided</span>}
                                  </span>
                                </div>
                              </div>
                              {/* Recursively render children inline (similar to submission/results page) */}
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
            ) : Object.keys(allAnswers).length > 0 ? (
              <div className="detail-section" style={{
                padding: '24px',
                background: '#f8f9ff',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #e0e7ff'
              }}>
                <h3 style={{ 
                  margin: '0 0 20px 0', 
                  fontSize: '1.2em', 
                  fontWeight: '600',
                  color: '#667eea'
                }}>
                  Assessment Answers
                </h3>
                <div className="answers-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.keys(allAnswers).map((questionCode, index) => {
                    const answerData = allAnswers[questionCode]
                    const questionInfo = allQuestionsMap?.[questionCode]
                    const displayAnswer = formatAnswerLocal(
                      answerData.value,
                      questionCode,
                      questionInfo?.questionType || answerData.questionType
                    )
                    return (
                      <div key={questionCode} className="answer-item" style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.15)'
                        e.currentTarget.style.borderColor = '#667eea'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                        e.currentTarget.style.borderColor = '#e0e0e0'
                      }}>
                        <div className="question-text" style={{
                          marginBottom: '12px',
                          fontSize: '1em',
                          color: '#333',
                          fontWeight: '500',
                          lineHeight: '1.5'
                        }}>
                          <strong style={{ color: '#667eea', marginRight: '8px' }}>{index + 1}:</strong>
                          {answerData.questionText || questionInfo?.questionText || `Question ${questionCode}`}
                        </div>
                        <div className="answer-value" style={{
                          padding: '12px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <span className="answer-label" style={{
                            color: '#666',
                            fontWeight: '600',
                            marginRight: '8px',
                            fontSize: '0.9em'
                          }}>Answer:</span>
                          <span style={{ color: '#333' }}>{displayAnswer}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="detail-section" style={{
                padding: '40px',
                textAlign: 'center',
                background: '#f8f9ff',
                borderRadius: '12px',
                border: '1px solid #e0e7ff'
              }}>
                <p style={{ color: '#999', fontStyle: 'italic', fontSize: '1em' }}>No answers found for this assessment.</p>
              </div>
            )}

            {/* Submission Timestamp */}
            <div className="detail-section" style={{
              padding: '20px',
              background: '#f8f9ff',
              borderRadius: '12px',
              border: '1px solid #e0e7ff',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#667eea', fontWeight: '500' }}>
                <strong style={{ marginRight: '8px' }}>📅 Submitted At:</strong>
                {formatDate(assessment.submitted_at || assessment.submittedAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{
          padding: '20px 30px',
          borderTop: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f8f9fa',
          borderRadius: '0 0 16px 16px'
        }}>
          <button onClick={onClose} className="btn-close" style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1em',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }} onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentDetailsModal
