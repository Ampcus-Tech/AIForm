import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { assessmentAPI } from '../services/api'
import API_BASE_URL from '../config/api.js'
import '../styles.css'

function CheckResults() {
  const navigate = useNavigate()
  const [searchType, setSearchType] = useState('id') // 'id' or 'email'
  const [assessmentId, setAssessmentId] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults([])

    try {
      if (searchType === 'id') {
        if (!assessmentId.trim()) {
          setError('Please enter an Assessment ID')
          setLoading(false)
          return
        }
        
        // Try to fetch the assessment by ID
        const response = await assessmentAPI.getById(assessmentId.trim(), 'detailed')
        if (response.success && response.assessment) {
          setResults([response.assessment])
        } else {
          setError('Assessment not found. Please check the ID and try again.')
        }
      } else {
        // Search by email and name
        if (!email.trim()) {
          setError('Please enter an email address')
          setLoading(false)
          return
        }
        
        // Call backend API to search by email/name
        const response = await fetch(`${API_BASE_URL}/assessment/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim() || null
          })
        })
        
        const data = await response.json()
        if (data.success && data.assessments && data.assessments.length > 0) {
          setResults(data.assessments)
        } else {
          setError('No assessments found with the provided information. Please check your email and name.')
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'An error occurred while searching. Please try again.')
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
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
              🔍 Check Assessment Results
            </h1>
            <p style={{ color: '#666', margin: '0' }}>
              View your submitted assessment results
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

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
          {/* Search Type Toggle */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9ff',
            borderRadius: '10px'
          }}>
            <label style={{
              flex: 1,
              padding: '12px',
              background: searchType === 'id' ? '#667eea' : 'white',
              color: searchType === 'id' ? 'white' : '#667eea',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: '600',
              border: '2px solid #667eea',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="radio"
                name="searchType"
                value="id"
                checked={searchType === 'id'}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ display: 'none' }}
              />
              🔑 By Assessment ID
            </label>
            <label style={{
              flex: 1,
              padding: '12px',
              background: searchType === 'email' ? '#667eea' : 'white',
              color: searchType === 'email' ? 'white' : '#667eea',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: '600',
              border: '2px solid #667eea',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="radio"
                name="searchType"
                value="email"
                checked={searchType === 'email'}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ display: 'none' }}
              />
              📧 By Email & Name
            </label>
          </div>

          {/* Search by ID */}
          {searchType === 'id' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                color: '#333'
              }}>
                Assessment ID *
              </label>
              <input
                type="text"
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                placeholder="Enter your Assessment ID (e.g., 123)"
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1em',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <small style={{
                display: 'block',
                marginTop: '8px',
                color: '#666',
                fontSize: '0.9em'
              }}>
                💡 You received this ID when you submitted your assessment
              </small>
            </div>
          )}

          {/* Search by Email & Name */}
          {searchType === 'email' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1em',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name (optional, helps narrow results)"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1em',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '15px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              color: '#c33',
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1em',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            {loading ? '🔍 Searching...' : '🔍 Search Results'}
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '1.8em',
              marginBottom: '20px',
              color: '#333'
            }}>
              Found {results.length} Assessment{results.length > 1 ? 's' : ''}
            </h2>
            
            {results.map((assessment) => (
              <div
                key={assessment.id}
                style={{
                  padding: '25px',
                  background: '#f8f9ff',
                  borderRadius: '15px',
                  border: '2px solid #e0e7ff',
                  marginBottom: '20px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 5px 0',
                      color: '#333',
                      fontSize: '1.3em'
                    }}>
                      Assessment #{assessment.id}
                    </h3>
                    <p style={{
                      margin: '0',
                      color: '#666',
                      fontSize: '0.9em'
                    }}>
                      Submitted: {formatDate(assessment.submitted_at || assessment.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/assessment/results/${assessment.id}`)}
                    style={{
                      padding: '12px 24px',
                      fontSize: '1em',
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
                    📊 View Details
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginTop: '15px'
                }}>
                  <div>
                    <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Contact Name</div>
                    <div style={{ fontWeight: '600', color: '#333' }}>
                      {assessment.contact_name || assessment.user_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Email</div>
                    <div style={{ fontWeight: '600', color: '#333' }}>
                      {assessment.contact_email || assessment.user_email || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#667eea', fontSize: '0.9em', marginBottom: '5px' }}>Company</div>
                    <div style={{ fontWeight: '600', color: '#333' }}>
                      {assessment.company_name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckResults
