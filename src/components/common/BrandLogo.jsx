import React, { useMemo, useState } from 'react'

function initialsFromName(name) {
  const n = (name || '').trim()
  if (!n) return 'APP'
  const parts = n.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || 'A'
  const second = (parts[1]?.[0] || parts[0]?.[1] || 'P')
  return `${first}${second}`.toUpperCase()
}

export default function BrandLogo({
  logoUrl,
  appName,
  showName = false,
  size = 56,
  width,
  height,
  rounded = 12,
  padding = 6,
  background = 'rgba(255,255,255,0.14)',
  foreground = '#ffffff',
  nameColor = '#0b5cab',
  nameFontSize = 14,
  nameFontWeight = 800,
  nameStyle,
  style,
}) {
  const [failed, setFailed] = useState(false)
  const initials = useMemo(() => initialsFromName(appName), [appName])
  const wRaw = width ?? size
  const hRaw = height ?? size
  const w =800//= typeof wRaw === 'number' && wRaw > 0 ? wRaw : size
  const h =150// typeof hRaw === 'number' && hRaw > 0 ? hRaw : size
  const resolvedLogoUrl = useMemo(() => {
    if (!logoUrl) return null
    if (typeof logoUrl !== 'string') return logoUrl
    // For apps hosted under a subpath, ensure local assets resolve correctly.
    // Example: PUBLIC_URL="/AIForm" + "/static/image.png" => "/AIForm/static/image.png"
    if (logoUrl.startsWith('/') && !logoUrl.startsWith('//')) {
      const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '')
      return `${base}${logoUrl}`
    }
    return logoUrl.split("/").pop()
  }, [logoUrl])

  const containerStyle =
    showName && appName
      ? {
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }
      : undefined

  if (!resolvedLogoUrl || failed) {
    const fallback = (
      <div
        aria-label={appName || 'App'}
        title={appName || 'App'}
        style={{
          width: typeof w === 'number' ? `${w}px` : w,
          height: typeof h === 'number' ? `${h}px` : h,
          borderRadius: rounded,
          background,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          letterSpacing: '0.5px',
          color: foreground,
          userSelect: 'none',
          ...style,
        }}
      >
        {initials}
      </div>
    )

    if (!(showName && appName)) return fallback

    return (
      <div style={containerStyle}>
        <div
          style={{
            color: nameColor,
            fontSize: nameFontSize,
            fontWeight: nameFontWeight,
            lineHeight: 1.1,
            textAlign: 'center',
            ...nameStyle,
          }}
        >
          {appName}
        </div>
        {fallback}
      </div>
    )
  }

  const img = (
    <img
      src={resolvedLogoUrl}
      alt={appName || 'Logo'}
      onError={() => setFailed(true)}
      style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
        objectFit: 'contain',
        borderRadius: rounded,
        background,
        // padding,
        ...style,
      }}
    />
  )

  if (!(showName && appName)) return img

  return (
    <div style={containerStyle}>
      <div
        style={{
          color: nameColor,
          fontSize: nameFontSize,
          fontWeight: nameFontWeight,
          lineHeight: 1.1,
          textAlign: 'center',
          ...nameStyle,
        }}
      >
        {appName}
      </div>
      {img}
    </div>
  )
}

