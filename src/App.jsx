import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { BrandingProvider } from './contexts/BrandingContext'
import Login from './components/Login'
import Assessment from './pages/Assessment'
import AssessmentResults from './pages/AssessmentResults'
import CheckResults from './pages/CheckResults'
import AdminDashboard from './components/AdminDashboard'
import AdminRoute from './components/AdminRoute'

console.log('🚀 App.jsx loaded - importing Assessment from ./pages/Assessment')

function App() {
  console.log('🚀 App component rendering')
  return (
    <BrandingProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Assessment />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/assessment/results/:id" element={<AssessmentResults />} />
            <Route path="/check-results" element={<CheckResults />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </BrandingProvider>
  )
}

export default App
