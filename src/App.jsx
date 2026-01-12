import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import Assessment from './pages/Assessment'
import AdminDashboard from './components/AdminDashboard'
import AdminRoute from './components/AdminRoute'

console.log('🚀 App.jsx loaded - importing Assessment from ./pages/Assessment')

function App() {
  console.log('🚀 App component rendering')
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Assessment />} />
          <Route path="/assessment" element={<Assessment />} />
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
  )
}

export default App
