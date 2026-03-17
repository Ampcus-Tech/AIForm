import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { assessmentAPI, assessmentTypesAPI } from '../services/api'
import { formatAnswer } from '../utils/formatAnswer'
import { SafeDescriptionHtml } from '../components/common/RichTextEditor'
import '../styles.css'

function AssessmentResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assessment, setAssessment] = useState(null)
  const [summary, setSummary] = useState(null)
  const [assessmentType, setAssessmentType] = useState(null)

  useEffect(() => {
    loadAssessment()
  }, [id])

  useEffect(() => {
    if (!assessment?.assessment_type_id) return
    let cancelled = false
    assessmentTypesAPI.getById(assessment.assessment_type_id).then((res) => {
      if (!cancelled && res?.success && res?.assessmentType) setAssessmentType(res.assessmentType)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [assessment?.assessment_type_id])

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

  let dynamicAnswers = assessment.dynamicAnswers || assessment.dynamic_answers || []
  // Fallback: if backend returned no dynamicAnswers but assessment has answer-like keys (e.g. from flat load), build minimal list so "Your Answers" shows
  const skipKeys = new Set(['id', 'user_id', 'assessment_type_id', 'contact_name', 'contact_email', 'company_name', 'contact_title', 'submitted_at', 'created_at', 'updated_at', 'user_name', 'user_email', 'user_role', 'dynamicAnswers', 'dynamic_answers', 'formatted', 'summary'])
  if (dynamicAnswers.length === 0 && assessment && typeof assessment === 'object') {
    const flat = []
    for (const key of Object.keys(assessment)) {
      if (skipKeys.has(key)) continue
      const v = assessment[key]
      if (v === null || v === undefined || v === '') continue
      if (typeof key === 'string' && (/^\d+$/.test(key) || /^\d+_child_\d+$/.test(key) || key.startsWith('q_'))) {
        flat.push({
          question_code: key,
          questionCode: key,
          answer_value: v,
          answerValue: v,
          answer: v,
          question_text: null,
          questionText: null,
          category_name: 'Uncategorized',
          categoryName: 'Uncategorized',
          parent_id: null,
          parentId: null,
        })
      }
    }
    if (flat.length > 0) dynamicAnswers = flat
  }
  const answersByCategory = {}

  // Build from assessment type: syntheticCodeToText, ordered root codes, and code -> category (so child section is always correct)
  const syntheticCodeToText = {}
  const orderedRootQuestionCodes = []
  const codeToCategoryFromType = {}
  const orderedRootCodeToText = {}
  // Map questionCode -> question object from assessment type (includes synthetic child codes like 4_child_0)
  const typeQuestionByCode = {}
  // Full form order: [root1, root1_child_0, root1_child_1, root2, ...] so results match form sequence exactly
  const formOrderSequence = []
  // Category display order (from assessment type, not alphabetical)
  const orderedCategoryNames = []
  if (assessmentType?.categories) {
    const cats = [...(assessmentType.categories || [])].sort((a, b) => (a.display_order ?? a.displayOrder ?? 999) - (b.display_order ?? b.displayOrder ?? 999))
    let formIndex = 0
    cats.forEach(cat => {
      const catName = cat.name || cat.categoryName || ''
      if (catName) orderedCategoryNames.push(catName)
      const questions = (cat.questions || []).filter(q => !(q.parent_id ?? q.parentId)).sort((a, b) => (a.display_order ?? a.displayOrder ?? 999) - (b.display_order ?? b.displayOrder ?? 999))
      questions.forEach(q => {
        formIndex++
        const code = q.questionCode ?? q.question_code
        if (code) {
          const codeStr = String(code)
          orderedRootQuestionCodes.push(codeStr)
          if (catName) codeToCategoryFromType[codeStr] = catName
          const rootText = q.questionText ?? q.question_text
          if (rootText) orderedRootCodeToText[codeStr] = rootText
          typeQuestionByCode[codeStr] = q
          formOrderSequence.push(codeStr)
        }
        const children = (q.children || []).sort((a, b) => (a.display_order ?? a.displayOrder ?? 999) - (b.display_order ?? b.displayOrder ?? 999))
        children.forEach((ch, j) => {
          const key = `${formIndex}_child_${j}`
          const chCode = ch.questionCode ?? ch.question_code
          const text = ch.questionText ?? ch.question_text
          if (text) syntheticCodeToText[key] = text
          typeQuestionByCode[key] = ch
          if (chCode) typeQuestionByCode[String(chCode)] = ch
          formOrderSequence.push(key)
        })
      })
    })
  }

  // Build id -> category and questionCode -> category so child/subchild answers can be placed in parent's section
  const idToCategory = {}
  const codeToCategory = {}
  dynamicAnswers.forEach(a => {
    const id = a.id ?? a.question_id
    const cat = a.categoryName || a.category_name
    const code = a.questionCode || a.question_code
    if (id != null && cat && String(cat).trim() && cat !== 'N/A') idToCategory[id] = cat
    if (code && cat && String(cat).trim() && cat !== 'N/A') codeToCategory[String(code)] = cat
  })

  dynamicAnswers.forEach(answer => {
    // Use real category from API; fall back to assessment-type mapping, never use "General" (no such category in DB)
    let categoryName = answer.categoryName || answer.category_name || codeToCategoryFromType[answer.questionCode ?? answer.question_code ?? ''] || null
    if (!categoryName || !String(categoryName).trim()) categoryName = 'Uncategorized'
    let parentId = answer.parent_id ?? answer.parentId ?? null
    const qCode = answer.questionCode || answer.question_code || answer.code || answer.question_id
    const qCodeStr = qCode ? String(qCode) : ''
    // Single-level child: 2_child_0 -> parent id 2
    const childMatch = qCodeStr.match(/^(\d+)_child_(\d+)$/)
    // Multi-level subchild: 2_child_0_child_0 -> parent code "2_child_0" (match by questionCode)
    const subchildMatch = qCodeStr.match(/^(.+)_child_\d+$/) && !childMatch
    if (childMatch) {
      const parentNum = parseInt(childMatch[1], 10)
      parentId = parentNum
      let parentCat = idToCategory[parentNum] || codeToCategory[String(parentNum)]
      const parentCode = orderedRootQuestionCodes.length > 0 && parentNum >= 1 && parentNum <= orderedRootQuestionCodes.length
        ? orderedRootQuestionCodes[parentNum - 1]
        : null
      if (parentCode) {
        parentId = parentCode
        // Use assessment-type category for child so it always lands in same section as parent (fixes wrong section mapping)
        const catFromType = codeToCategoryFromType[parentCode]
        if (catFromType) {
          categoryName = catFromType
          parentCat = catFromType
        } else if (!parentCat) parentCat = codeToCategory[parentCode]
      }
      if ((categoryName === 'Uncategorized' || !categoryName || !String(categoryName).trim()) && parentCat) {
        categoryName = parentCat
      }
    } else if (subchildMatch) {
      const parentCode = qCodeStr.replace(/_child_\d+$/, '')
      parentId = parentCode
      const catFromType = codeToCategoryFromType[parentCode]
      if (catFromType) categoryName = catFromType
      else if (codeToCategory[parentCode] && (categoryName === 'Uncategorized' || !categoryName || !String(categoryName).trim())) {
        categoryName = codeToCategory[parentCode]
      }
    }
    if (!answersByCategory[categoryName]) {
      answersByCategory[categoryName] = []
    }
    const normalized = {
      ...answer,
      questionCode: qCode,
      parent_id: parentId,
      parentId: parentId,
      display_order: answer.display_order ?? answer.displayOrder,
    }
    answersByCategory[categoryName].push(normalized)
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
            (() => {
              // Show categories in assessment-type order, then any remaining (e.g. Uncategorized) at the end
              const namesInOrder = [...orderedCategoryNames.filter(n => answersByCategory[n]?.length), ...Object.keys(answersByCategory).filter(k => !orderedCategoryNames.includes(k))]
              return namesInOrder.map((categoryName, index) => {
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
                      const questionMap = {}
                      const roots = []
                      categoryAnswers.forEach(a => {
                        const node = { ...a, children: [] }
                        questionMap[a.questionCode] = node
                      })
                      categoryAnswers.forEach(a => {
                        const node = questionMap[a.questionCode]
                        const pid = a.parentId ?? a.parent_id
                        if (pid == null) {
                          roots.push(node)
                        } else {
                          const pidNum = Number(pid)
                          const parent = Object.values(questionMap).find(p =>
                            (p.id != null && Number(p.id) === pidNum) || p.questionCode === pid || String(p.questionCode) === String(pid)
                          )
                          if (parent) parent.children.push(node)
                          else roots.push(node)
                        }
                      })
                      // Placeholder parents: form has 4 main questions; Q4 may have no answer row (only sub-answers 4_child_0, 4_child_1). Nest those under Q4 so we show 4 main questions.
                      const orphanChildCodes = roots.filter(n => {
                        const code = String(n.questionCode ?? n.question_code ?? '')
                        const m = code.match(/^(\d+)_child_\d+$/)
                        if (!m) return false
                        const parentCode = m[1]
                        const hasParent = questionMap[parentCode] || roots.some(r => String(r.questionCode ?? r.question_code) === parentCode)
                        return !hasParent && orderedRootQuestionCodes.includes(parentCode)
                      })
                      if (orphanChildCodes.length > 0) {
                        const byParent = {}
                        orphanChildCodes.forEach(node => {
                          const code = String(node.questionCode ?? node.question_code ?? '')
                          const m = code.match(/^(\d+)_child_\d+$/)
                          if (m) {
                            const parentCode = m[1]
                            if (!byParent[parentCode]) byParent[parentCode] = []
                            byParent[parentCode].push(node)
                          }
                        })
                        const indicesToRemove = new Set()
                        orphanChildCodes.forEach(n => { const i = roots.indexOf(n); if (i >= 0) indicesToRemove.add(i) })
                        Array.from(indicesToRemove).sort((a, b) => b - a).forEach(i => roots.splice(i, 1))
                        Object.keys(byParent).forEach(parentCode => {
                          const children = byParent[parentCode]
                          const placeholder = {
                            questionCode: parentCode,
                            question_code: parentCode,
                            questionText: orderedRootCodeToText[parentCode] || syntheticCodeToText[parentCode] || `Question ${parentCode}`,
                            question_text: orderedRootCodeToText[parentCode] || syntheticCodeToText[parentCode] || `Question ${parentCode}`,
                            answer_value: null,
                            answerValue: null,
                            children: children.sort((a, b) => formOrderSequence.indexOf(String(a.questionCode ?? a.question_code)) - formOrderSequence.indexOf(String(b.questionCode ?? b.question_code))),
                            categoryName: categoryName,
                            category_name: categoryName,
                          }
                          roots.push(placeholder)
                        })
                      }
                      // Use full form order so sequence matches form exactly (root1, root1 children, root2, root2 children, ...)
                      const formOrderIndex = (code) => {
                        const c = code != null ? String(code) : ''
                        const i = formOrderSequence.indexOf(c)
                        if (i >= 0) return i
                        const rootOnly = orderedRootQuestionCodes.indexOf(c)
                        return rootOnly >= 0 ? rootOnly * 1000 : 999999
                      }
                      const sortByOrder = (list) => {
                        if (!list || !list.length) return list
                        list.sort((a, b) => {
                          const orderA = formOrderIndex(a.questionCode)
                          const orderB = formOrderIndex(b.questionCode)
                          if (orderA !== orderB) return orderA - orderB
                          return (a.display_order ?? 999) - (b.display_order ?? 999)
                        })
                        list.forEach(n => n.children?.length && sortByOrder(n.children))
                        return list
                      }
                      sortByOrder(roots)
                      let parentIdx = 0
                      const renderQ = (q, level = 0) => {
                        const isChild = level > 0
                        const questionText = q.questionText || q.question_text || syntheticCodeToText[q.questionCode] || `Question ${q.questionCode}`
                        const qTypeCode = q.questionCode != null ? String(q.questionCode) : (q.question_code != null ? String(q.question_code) : '')
                        const typeQuestion = qTypeCode ? typeQuestionByCode[qTypeCode] : null
                        const questionType = q.questionType ?? q.question_type ?? typeQuestion?.questionType ?? typeQuestion?.question_type
                        const answerValue = formatAnswer(
                          q.answer_value ?? q.answerValue ?? q.answer,
                          q.questionCode ?? q.question_code,
                          questionType,
                          typeQuestion || null
                        )
                        if (!isChild) parentIdx++
                        return (
                          <React.Fragment key={q.questionCode}>
                            <div
                              style={{
                                padding: isChild ? '15px' : '20px',
                                background: isChild ? '#f8f9ff' : 'white',
                                borderRadius: '10px',
                                border: isChild ? '2px solid #667eea' : '1px solid #e0e0e0',
                                marginBottom: '15px',
                                marginLeft: level > 0 ? level * 24 : 0,
                                borderLeft: isChild ? '4px solid #667eea' : undefined,
                              }}
                            >
                              <div style={{
                                fontSize: isChild ? '1em' : '1.1em',
                                fontWeight: '600',
                                color: '#333',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                              }}>
                                {isChild && <span style={{ color: '#667eea' }}>└</span>}
                                {!isChild && (
                                  <span style={{ color: '#667eea', minWidth: '30px' }}>Q{parentIdx}:</span>
                                )}
                                <SafeDescriptionHtml as="span" html={questionText} />
                              </div>
                              {(answerValue != null && answerValue !== '' && answerValue !== '—') || !(q.children?.length > 0) ? (
                                <div style={{
                                  padding: '15px',
                                  background: '#f8f9fa',
                                  borderRadius: '8px',
                                  color: '#333',
                                  borderLeft: '4px solid #667eea',
                                }}>
                                  <strong style={{ color: '#667eea' }}>Answer:</strong> {answerValue}
                                </div>
                              ) : null}
                            </div>
                            {q.children && q.children.length > 0 && q.children.map(c => renderQ(c, level + 1))}
                          </React.Fragment>
                        )
                      }
                      return roots.map(r => renderQ(r, 0))
                    })()}
                  </div>
                </div>
              )
            })
            })()
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
