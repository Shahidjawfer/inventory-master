import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkUser()
    
    // Listen for auth state changes
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const checkUser = async () => {
    setLoading(true)
    const { user } = await authService.getCurrentUser()
    setUser(user)
    setLoading(false)
  }

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    const { user: loggedInUser, session, error: loginError } = await authService.signIn(email, password)
    if (loginError) {
      setError(loginError)
    } else {
      setUser(loggedInUser)
    }
    setLoading(false)
    return { user: loggedInUser, session, error: loginError }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    const { error: logoutError } = await authService.signOut()
    if (logoutError) {
      setError(logoutError)
    } else {
      setUser(null)
    }
    setLoading(false)
    return { error: logoutError }
  }

  const signup = async (email, password) => {
    setLoading(true)
    setError(null)
    const { user: newUser, session, error: signupError } = await authService.signUp(email, password)
    if (signupError) {
      setError(signupError)
    } else {
      setUser(newUser)
    }
    setLoading(false)
    return { user: newUser, session, error: signupError }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
