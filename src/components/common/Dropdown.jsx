import React, { useState } from 'react'

/**
 * Reusable dropdown component
 */
function Dropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '',
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`custom-dropdown ${className}`} style={{ position: 'relative', zIndex: 10 }}>
      <button
        type="button"
        className="dropdown-toggle"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          background: 'white',
          fontSize: '1em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          textAlign: 'left',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {options.find(opt => opt.value === value)?.icon && (
            <span style={{ fontSize: '1.2em' }}>{options.find(opt => opt.value === value).icon}</span>
          )}
          <span>{options.find(opt => opt.value === value)?.label || placeholder}</span>
        </span>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          fontSize: '0.9em'
        }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div 
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'white',
            borderRadius: '8px',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: value === option.value 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'white',
                color: value === option.value ? 'white' : '#333',
                fontSize: '1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.target.style.background = '#f8f9ff'
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.target.style.background = 'white'
                }
              }}
            >
              {option.icon && <span style={{ fontSize: '1.2em' }}>{option.icon}</span>}
              <span style={{ flex: 1 }}>{option.label}</span>
              {value === option.value && (
                <span style={{ fontSize: '0.9em' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
