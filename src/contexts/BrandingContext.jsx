import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { configAPI } from '../services/api'

const BrandingContext = createContext({
  config: {
    appName: 'SBEAMP',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    logoUrl: null,
    logoWidth: null,
    logoHeight: null,
  },
  loading: false,
  refresh: async () => {},
})

export function BrandingProvider({ children }) {
  const [config, setConfig] = useState({
    appName: 'SBEAMP',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    logoUrl: null,
    logoWidth: null,
    logoHeight: null,
  })
  const [loading, setLoading] = useState(true)

  const load = async (opts = {}) => {
    const { silent = false } = opts
    try {
      if (!silent) setLoading(true)
      const res = await configAPI.get()
      if (res?.success && res?.config) {
        setConfig((prev) => ({ ...prev, ...res.config }))
      }
    } catch {
      // keep defaults
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await load()
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.title = config.appName || 'SBEAMP'
    const root = document.documentElement
    if (config.primaryColor) root.style.setProperty('--brand-primary', config.primaryColor)
    if (config.secondaryColor) root.style.setProperty('--brand-secondary', config.secondaryColor)
  }, [config.appName, config.primaryColor, config.secondaryColor])

  const value = useMemo(() => ({
    config,
    loading,
    refresh: () => load({ silent: true }),
  }), [config, loading])
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  return useContext(BrandingContext)
}

