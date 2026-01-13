import React from 'react'
import { useNavigate } from 'react-router-dom'

function SuccessPage({ assessmentType, assessmentId, onStartNew }) {
  const navigate = useNavigate()
  return (
    <div className="container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 style={{
          fontSize: '2.5em',
          margin: '0 0 20px 0',
          color: '#333',
          fontWeight: '700'
        }}>
          Thank You! 🎉
        </h1>

        <p style={{
          fontSize: '1.2em',
          color: '#666',
          margin: '0 0 10px 0',
          lineHeight: '1.6'
        }}>
          Your assessment has been successfully submitted!
        </p>

        {assessmentType && (
          <p style={{
            fontSize: '1em',
            color: '#888',
            margin: '0 0 40px 0',
            fontStyle: 'italic'
          }}>
            Assessment Type: <strong>{assessmentType.name}</strong>
          </p>
        )}

        <p style={{
          fontSize: '1em',
          color: '#666',
          margin: '0 0 40px 0',
          lineHeight: '1.6'
        }}>
          Your responses have been recorded and will be reviewed by our team.
          We appreciate your time and feedback!
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {assessmentId && (
            <button
              onClick={() => navigate(`/assessment/results/${assessmentId}`)}
              style={{
                padding: '14px 32px',
                fontSize: '1.1em',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.4)'
              }}
            >
              📊 View Results
            </button>
          )}
          
          {onStartNew && (
            <button
              onClick={onStartNew}
              style={{
                padding: '14px 32px',
                fontSize: '1.1em',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              📝 Start New Assessment
            </button>
          )}
        </div>

        {assessmentId && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f0f9ff',
            borderRadius: '10px',
            border: '1px solid #bae6fd'
          }}>
            <p style={{
              fontSize: '0.85em',
              color: '#0369a1',
              margin: '0',
              lineHeight: '1.5'
            }}>
              🔑 <strong>Assessment ID:</strong> {assessmentId}<br />
              <small style={{ color: '#64748b' }}>Save this ID to track your assessment later</small>
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f8f9ff',
          borderRadius: '10px',
          border: '1px solid #e0e7ff'
        }}>
          <p style={{
            fontSize: '0.9em',
            color: '#666',
            margin: '0',
            lineHeight: '1.6'
          }}>
            💡 <strong>What's next?</strong><br />
            Our team will review your assessment and get back to you soon.
            You can also check your email for a confirmation.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default SuccessPage
