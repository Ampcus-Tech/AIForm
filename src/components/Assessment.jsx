import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { assessmentAPI } from '../services/api'
import '../styles.css'

function Assessment() {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Section 1
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    // Section 2
    q6: '',
    q6_details: '',
    q7: '',
    q8: '',
    q9: '',
    q10: '',
    // Section 3
    q11: '',
    q12: '',
    q13: '',
    q14: '',
    q15: '',
    q15_details: '',
    // Section 4
    q16: '',
    q17: '',
    q18: '',
    q19: '',
    q20: '',
    // Section 5
    q21: '',
    q22_discovery: '',
    q22_pilot: '',
    q22_feedback: '',
    q23: '',
    q24: '',
    q25: '',
    // Contact Information
    contact_name: '',
    contact_email: '',
    company_name: '',
    contact_title: '',
  })


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear conditional fields when parent answer changes
    if (name === 'q6' && value !== 'yes') {
      setFormData((prev) => ({ ...prev, q6_details: '' }))
    }
    if (name === 'q15' && value !== 'yes') {
      setFormData((prev) => ({ ...prev, q15_details: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await assessmentAPI.submit(formData)
      if (response.success) {
        alert('Thank you for completing the assessment! Your responses have been recorded.')
      } else {
        alert('There was an error submitting your assessment. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('There was an error submitting your assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: '',
      q6: '',
      q6_details: '',
      q7: '',
      q8: '',
      q9: '',
      q10: '',
      q11: '',
      q12: '',
      q13: '',
      q14: '',
      q15: '',
      q15_details: '',
      q16: '',
      q17: '',
      q18: '',
      q19: '',
      q20: '',
      q21: '',
      q22_discovery: '',
      q22_pilot: '',
      q22_feedback: '',
      q23: '',
      q24: '',
      q25: '',
      contact_name: '',
      contact_email: '',
      company_name: '',
      contact_title: '',
    })
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
        <h2 style={{ fontSize: '1.5em', marginTop: '10px', fontWeight: '500' }}>AI Adoption Readiness Assessment</h2>
        <p className="subtitle">
          Please complete all sections to help us understand your organization's readiness for AI transformation
        </p>
      </header>

      <form id="assessmentForm" onSubmit={handleSubmit}>
        {/* Section 1: Company Vision & Mindset */}
        <section className="form-section">
          <h2>Section 1: Company Vision & Mindset</h2>

          <div className="question-group">
            <label className="question-label">
              1. How clearly has your leadership articulated a long-term vision for your business over the next 3–5 years? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q1"
                    value={num}
                    checked={formData.q1 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              2. How important is digital and AI-led transformation in your business strategy for the next 3–5 years? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q2"
                    value={num}
                    checked={formData.q2 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              3. In the last 24 months, what new technologies or innovations have you adopted or piloted? (Open text)
              <span className="required">*</span>
            </label>
            <textarea
              name="q3"
              rows="4"
              value={formData.q3}
              onChange={handleChange}
              required
              placeholder="Please describe the technologies or innovations..."
            />
          </div>

          <div className="question-group">
            <label className="question-label">
              4. How willing are you to experiment with new AI solutions, even if immediate ROI is uncertain? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q4"
                    value={num}
                    checked={formData.q4 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              5. Describe one initiative where you proactively changed a process before customers demanded it. (Open text)
              <span className="required">*</span>
            </label>
            <textarea
              name="q5"
              rows="4"
              value={formData.q5}
              onChange={handleChange}
              required
              placeholder="Please describe the initiative..."
            />
          </div>
        </section>

        {/* Section 2: Leadership Sponsorship & Culture */}
        <section className="form-section">
          <h2>Section 2: Leadership Sponsorship & Culture</h2>

          <div className="question-group">
            <label className="question-label">
              6. Is there a senior leader responsible for digital/analytics/AI initiatives in your organization?
              <span className="required">*</span>
            </label>
            <div className="yes-no-group">
              <label>
                <input
                  type="radio"
                  name="q6"
                  value="yes"
                  checked={formData.q6 === 'yes'}
                  onChange={handleChange}
                  required
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="q6"
                  value="no"
                  checked={formData.q6 === 'no'}
                  onChange={handleChange}
                />{' '}
                No
              </label>
            </div>
            {formData.q6 === 'yes' && (
              <div className="conditional-field">
                <label className="question-label">If Yes, please provide role/title:</label>
                <input
                  type="text"
                  name="q6_details"
                  value={formData.q6_details}
                  onChange={handleChange}
                  placeholder="e.g., Chief Digital Officer, VP of Analytics..."
                />
              </div>
            )}
          </div>

          <div className="question-group">
            <label className="question-label">
              7. How supportive is your leadership team of data-driven decision-making? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q7"
                    value={num}
                    checked={formData.q7 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              8. How would you describe your company culture regarding change?
              <span className="required">*</span>
            </label>
            <div className="radio-options">
              {['resistant', 'cautious', 'open', 'proactive', 'leading'].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="q8"
                    value={option}
                    checked={formData.q8 === option}
                    onChange={handleChange}
                    required
                  />{' '}
                  {option === 'leading' ? 'Leading change' : option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              9. How frequently do you conduct training or awareness sessions on new tools/technologies for employees?
              <span className="required">*</span>
            </label>
            <div className="radio-options">
              {[
                { value: 'never', label: 'Never' },
                { value: 'once-yearly', label: 'Once a year' },
                { value: '2-3-yearly', label: '2–3 times a year' },
                { value: 'quarterly', label: 'Quarterly or more' },
              ].map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="q9"
                    value={option.value}
                    checked={formData.q9 === option.value}
                    onChange={handleChange}
                    required
                  />{' '}
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              10. Share an example where your leadership backed a change project despite initial internal resistance. (Open text)
              <span className="required">*</span>
            </label>
            <textarea
              name="q10"
              rows="4"
              value={formData.q10}
              onChange={handleChange}
              required
              placeholder="Please describe the example..."
            />
          </div>
        </section>

        {/* Section 3: Data & Technology Foundations */}
        <section className="form-section">
          <h2>Section 3: Data & Technology Foundations</h2>

          <div className="question-group">
            <label className="question-label">
              11. How well-organized and accessible is your operational data (sales, inventory, quality, logistics, etc.)? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q11"
                    value={num}
                    checked={formData.q11 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              12. Where is most of your key data stored today?
              <span className="required">*</span>
            </label>
            <div className="radio-options">
              {[
                { value: 'paper', label: 'Paper/manual' },
                { value: 'spreadsheets', label: 'Spreadsheets' },
                { value: 'on-premise', label: 'On-premise software' },
                { value: 'cloud', label: 'Cloud-based systems' },
                { value: 'integrated', label: 'Integrated ERP/CRM and data platforms' },
              ].map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="q12"
                    value={option.value}
                    checked={formData.q12 === option.value}
                    onChange={handleChange}
                    required
                  />{' '}
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              13. Do you currently use any analytics or automation tools? (BI dashboards, RPA, forecasting tools, chatbots, etc.) Please list.
              <span className="required">*</span>
            </label>
            <textarea
              name="q13"
              rows="4"
              value={formData.q13}
              onChange={handleChange}
              required
              placeholder="List the tools you currently use..."
            />
          </div>

          <div className="question-group">
            <label className="question-label">
              14. How prepared is your IT environment for integrating new AI tools or APIs? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q14"
                    value={num}
                    checked={formData.q14 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              15. Do you have any internal data protection or governance policies in place?
              <span className="required">*</span>
            </label>
            <div className="yes-no-group">
              <label>
                <input
                  type="radio"
                  name="q15"
                  value="yes"
                  checked={formData.q15 === 'yes'}
                  onChange={handleChange}
                  required
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="q15"
                  value="no"
                  checked={formData.q15 === 'no'}
                  onChange={handleChange}
                />{' '}
                No
              </label>
            </div>
            {formData.q15 === 'yes' && (
              <div className="conditional-field">
                <label className="question-label">If Yes, please provide a brief description:</label>
                <textarea
                  name="q15_details"
                  rows="3"
                  value={formData.q15_details}
                  onChange={handleChange}
                  placeholder="Brief description of your data protection or governance policies..."
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Change Management & Learning Readiness */}
        <section className="form-section">
          <h2>Section 4: Change Management & Learning Readiness</h2>

          <div className="question-group">
            <label className="question-label">
              16. How open are your teams to changing existing processes if new tools can improve outcomes? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q16"
                    value={num}
                    checked={formData.q16 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              17. How confident are your teams in working with data, dashboards, or automated systems today? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q17"
                    value={num}
                    checked={formData.q17 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              18. What percentage of your workforce can be allocated (even part-time) to participate in AI-related pilots and trainings over the next 12 months?
              <span className="required">*</span>
            </label>
            <div className="radio-options">
              {[
                { value: '0-5', label: '0–5%' },
                { value: '5-10', label: '5–10%' },
                { value: '10-20', label: '10–20%' },
                { value: '20+', label: '20%+' },
              ].map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="q18"
                    value={option.value}
                    checked={formData.q18 === option.value}
                    onChange={handleChange}
                    required
                  />{' '}
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              19. Are you willing to assign a dedicated internal champion as a single point of contact for AI adoption with us?
              <span className="required">*</span>
            </label>
            <div className="yes-no-group">
              <label>
                <input
                  type="radio"
                  name="q19"
                  value="yes"
                  checked={formData.q19 === 'yes'}
                  onChange={handleChange}
                  required
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="q19"
                  value="no"
                  checked={formData.q19 === 'no'}
                  onChange={handleChange}
                />{' '}
                No
              </label>
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              20. Describe how you typically introduce and roll out new tools or systems to your employees. (Open text)
              <span className="required">*</span>
            </label>
            <textarea
              name="q20"
              rows="4"
              value={formData.q20}
              onChange={handleChange}
              required
              placeholder="Please describe your rollout process..."
            />
          </div>
        </section>

        {/* Section 5: Collaboration, Commitment & Expectations */}
        <section className="form-section">
          <h2>Section 5: Collaboration, Commitment & Expectations</h2>

          <div className="question-group">
            <label className="question-label">
              21. How willing are you to co-create AI use cases jointly with us (sharing process knowledge, data samples, and participating in workshops)? (1–5 scale)
              <span className="required">*</span>
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num}>
                  <input
                    type="radio"
                    name="q21"
                    value={num}
                    checked={formData.q21 === String(num)}
                    onChange={handleChange}
                    required
                  />{' '}
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              22. Over the next 12–18 months, how committed are you to participate in:
              <span className="required">*</span>
            </label>
            <div className="commitment-group">
              <div className="commitment-item">
                <label>Discovery workshops (1–5 scale):</label>
                <div className="scale-options">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num}>
                      <input
                        type="radio"
                        name="q22_discovery"
                        value={num}
                        checked={formData.q22_discovery === String(num)}
                        onChange={handleChange}
                        required
                      />{' '}
                      {num}
                    </label>
                  ))}
                </div>
              </div>
              <div className="commitment-item">
                <label>Pilot projects (1–5 scale):</label>
                <div className="scale-options">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num}>
                      <input
                        type="radio"
                        name="q22_pilot"
                        value={num}
                        checked={formData.q22_pilot === String(num)}
                        onChange={handleChange}
                        required
                      />{' '}
                      {num}
                    </label>
                  ))}
                </div>
              </div>
              <div className="commitment-item">
                <label>Feedback and improvement sessions (1–5 scale):</label>
                <div className="scale-options">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num}>
                      <input
                        type="radio"
                        name="q22_feedback"
                        value={num}
                        checked={formData.q22_feedback === String(num)}
                        onChange={handleChange}
                        required
                      />{' '}
                      {num}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              23. What outcomes would make an AI adoption program a success for you? (E.g., cost reduction, faster cycle time, better quality, risk reduction.) (Open text)
              <span className="required">*</span>
            </label>
            <textarea
              name="q23"
              rows="4"
              value={formData.q23}
              onChange={handleChange}
              required
              placeholder="Please describe your success criteria..."
            />
          </div>

          <div className="question-group">
            <label className="question-label">
              24. Are you willing to share anonymized performance data (before/after) to measure impact of AI initiatives?
              <span className="required">*</span>
            </label>
            <div className="yes-no-group">
              <label>
                <input
                  type="radio"
                  name="q24"
                  value="yes"
                  checked={formData.q24 === 'yes'}
                  onChange={handleChange}
                  required
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="q24"
                  value="no"
                  checked={formData.q24 === 'no'}
                  onChange={handleChange}
                />{' '}
                No
              </label>
            </div>
          </div>

          <div className="question-group">
            <label className="question-label">
              25. Please describe why you would like to be selected as a partner for this AI adoption and training program. (Open text)
              <span className="required">*</span>
            </label>
            <textarea
              name="q25"
              rows="5"
              value={formData.q25}
              onChange={handleChange}
              required
              placeholder="Please explain why you should be selected..."
            />
          </div>
        </section>

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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>
          <div className="question-group">
            <label className="question-label">Your Title/Role</label>
            <input
              type="text"
              name="contact_title"
              value={formData.contact_title}
              onChange={handleChange}
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset} disabled={submitting}>
            Reset Form
          </button>
        </div>
      </form>
    </div>
  )
}

export default Assessment
