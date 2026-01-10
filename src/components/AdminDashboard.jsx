import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../services/api'
import '../styles.css'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [assessments, setAssessments] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredAssessments, setFilteredAssessments] = useState([])
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('')
  const [assessmentSearch, setAssessmentSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadData()
  }, [activeTab])

  useEffect(() => {
    filterUsers()
  }, [users, userSearch, roleFilter])

  useEffect(() => {
    filterAssessments()
  }, [assessments, assessmentSearch])

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
            {activeTab === 'stats' && stats && (
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
            )}

            {activeTab === 'users' && (
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
                    </select>
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
                                  {u.role === 'admin' ? '👑 Admin' : '👤 User'}
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
                    <button
                      onClick={() => exportToCSV(filteredAssessments, `assessments_${new Date().toISOString().split('T')[0]}.csv`)}
                      className="btn-export"
                    >
                      📥 Export CSV
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
          </>
        )}
      </div>

      {selectedAssessment && (
        <div className="modal-overlay" onClick={() => setSelectedAssessment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                    {!selectedAssessment.user_id && (
                      <div className="info-item full-width">
                        <span className="na-text">📝 Anonymous Submission</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Section 1: Company Vision & Mindset</h3>
                  <div className="question-grid">
                    <div className="question-item"><strong>Q1:</strong> {selectedAssessment.q1 || 'N/A'}</div>
                    <div className="question-item"><strong>Q2:</strong> {selectedAssessment.q2 || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q3:</strong> {selectedAssessment.q3 || 'N/A'}</div>
                    <div className="question-item"><strong>Q4:</strong> {selectedAssessment.q4 || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q5:</strong> {selectedAssessment.q5 || 'N/A'}</div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Section 2: Leadership Sponsorship & Culture</h3>
                  <div className="question-grid">
                    <div className="question-item"><strong>Q6:</strong> {selectedAssessment.q6 || 'N/A'}</div>
                    {selectedAssessment.q6 === 'yes' && selectedAssessment.q6_details && (
                      <div className="question-item full-width"><strong>Q6 Details:</strong> {selectedAssessment.q6_details}</div>
                    )}
                    <div className="question-item"><strong>Q7:</strong> {selectedAssessment.q7 || 'N/A'}</div>
                    <div className="question-item"><strong>Q8:</strong> {selectedAssessment.q8 || 'N/A'}</div>
                    <div className="question-item"><strong>Q9:</strong> {selectedAssessment.q9 || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q10:</strong> {selectedAssessment.q10 || 'N/A'}</div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Section 3: Data & Technology Foundations</h3>
                  <div className="question-grid">
                    <div className="question-item"><strong>Q11:</strong> {selectedAssessment.q11 || 'N/A'}</div>
                    <div className="question-item"><strong>Q12:</strong> {selectedAssessment.q12 || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q13:</strong> {selectedAssessment.q13 || 'N/A'}</div>
                    <div className="question-item"><strong>Q14:</strong> {selectedAssessment.q14 || 'N/A'}</div>
                    <div className="question-item"><strong>Q15:</strong> {selectedAssessment.q15 || 'N/A'}</div>
                    {selectedAssessment.q15 === 'yes' && selectedAssessment.q15_details && (
                      <div className="question-item full-width"><strong>Q15 Details:</strong> {selectedAssessment.q15_details}</div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Section 4: Change Management & Learning Readiness</h3>
                  <div className="question-grid">
                    <div className="question-item"><strong>Q16:</strong> {selectedAssessment.q16 || 'N/A'}</div>
                    <div className="question-item"><strong>Q17:</strong> {selectedAssessment.q17 || 'N/A'}</div>
                    <div className="question-item"><strong>Q18:</strong> {selectedAssessment.q18 || 'N/A'}</div>
                    <div className="question-item"><strong>Q19:</strong> {selectedAssessment.q19 || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q20:</strong> {selectedAssessment.q20 || 'N/A'}</div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Section 5: Collaboration, Commitment & Expectations</h3>
                  <div className="question-grid">
                    <div className="question-item"><strong>Q21:</strong> {selectedAssessment.q21 || 'N/A'}</div>
                    <div className="question-item"><strong>Q22 Discovery:</strong> {selectedAssessment.q22_discovery || 'N/A'}</div>
                    <div className="question-item"><strong>Q22 Pilot:</strong> {selectedAssessment.q22_pilot || 'N/A'}</div>
                    <div className="question-item"><strong>Q22 Feedback:</strong> {selectedAssessment.q22_feedback || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q23:</strong> {selectedAssessment.q23 || 'N/A'}</div>
                    <div className="question-item"><strong>Q24:</strong> {selectedAssessment.q24 || 'N/A'}</div>
                    <div className="question-item full-width"><strong>Q25:</strong> {selectedAssessment.q25 || 'N/A'}</div>
                  </div>
                </div>

                <div className="detail-section highlight">
                  <p><strong>📅 Submitted At:</strong> {formatDate(selectedAssessment.submitted_at)}</p>
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
      )}
    </div>
  )
}

export default AdminDashboard
