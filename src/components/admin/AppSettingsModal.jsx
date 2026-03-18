import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

function AppSettingsModal({ onClose, onSaved }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    app_name: '',
    primary_color: '',
    secondary_color: '',
    logo_url: '',
    logo_width: '',
    logo_height: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const res = await adminAPI.getAppSettings()
        if (!cancelled && res?.success && res?.appSettings) {
          const s = res.appSettings
          setForm({
            app_name: s.app_name || 'SBEAMP',
            primary_color: s.primary_color || '#667eea',
            secondary_color: s.secondary_color || '#764ba2',
            logo_url: s.logo_url || '',
            logo_width: s.logo_width ?? '',
            logo_height: s.logo_height ?? '',
          })
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load app settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      const res = await adminAPI.updateAppSettings({
        app_name: form.app_name,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        logo_url: form.logo_url || null,
        logo_width: form.logo_width === '' ? null : Number(form.logo_width),
        logo_height: form.logo_height === '' ? null : Number(form.logo_height),
      })
      if (!res?.success) throw new Error(res?.error || 'Failed to save')
      onSaved?.(res.appSettings)
      onClose?.()
    } catch (e) {
      setError(e.message || 'Failed to save app settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h2 style={{ margin: 0 }}>⚙️ App Settings</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {loading ? (
          <div style={{ padding: 20, color: '#666' }}>Loading…</div>
        ) : (
          <div style={{ padding: 20 }}>
            {error ? (
              <div style={{ background: '#fee', border: '1px solid #fcc', color: '#a00', padding: 12, borderRadius: 10, marginBottom: 16 }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Application Name</label>
                <input
                  value={form.app_name}
                  onChange={(e) => update('app_name', e.target.value)}
                  placeholder="SBEAMP"
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Logo URL</label>
                <input
                  value={form.logo_url}
                  onChange={(e) => update('logo_url', e.target.value)}
                  placeholder="/static/ampcus-logo.png or https://..."
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Logo Width (px)</label>
                <input
                  type="number"
                  min="16"
                  max="400"
                  value={form.logo_width}
                  onChange={(e) => update('logo_width', e.target.value)}
                  placeholder="e.g. 56"
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Logo Height (px)</label>
                <input
                  type="number"
                  min="16"
                  max="400"
                  value={form.logo_height}
                  onChange={(e) => update('logo_height', e.target.value)}
                  placeholder="e.g. 56"
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Primary Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={form.primary_color} onChange={(e) => update('primary_color', e.target.value)} />
                  <input
                    value={form.primary_color}
                    onChange={(e) => update('primary_color', e.target.value)}
                    placeholder="#0B5FFF"
                    style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Secondary Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={form.secondary_color} onChange={(e) => update('secondary_color', e.target.value)} />
                  <input
                    value={form.secondary_color}
                    onChange={(e) => update('secondary_color', e.target.value)}
                    placeholder="#7A1FA2"
                    style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            </div>

            {form.logo_url ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid #eee', borderRadius: 12 }}>
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10, background: 'rgba(0,0,0,0.04)', padding: 6 }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div style={{ fontWeight: 700 }}>{form.app_name || 'SBEAMP'}</div>
                </div>
                <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                  Tip: if you store logo in backend, use <code>/static/your-logo.png</code>
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button className="btn-secondary" onClick={onClose} type="button" disabled={saving}>
                Cancel
              </button>
              <button className="btn-close" onClick={handleSave} type="button" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppSettingsModal

