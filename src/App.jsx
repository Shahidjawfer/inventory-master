import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { SupabaseProvider } from './contexts/SupabaseContext'

function App() {
  return (
    <SupabaseProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </SupabaseProvider>
  )
}

export default App

