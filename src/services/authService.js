import { supabase } from '../supabaseClient'

export const authService = {
  // Sign up new user
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      return { user: null, session: null, error: error.message }
    }
  },

  // Sign in user with email and password
  async signIn(email, password) {
    try {
      // First try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error && data?.user) {
        // Successful Supabase Auth sign-in
        localStorage.removeItem('custom_user_id')
        return { user: data.user, session: data.session, error: null }
      }
      // If Supabase Auth didn't return a user, fall through to custom users table
    } catch (authErr) {
      // Ignore and try fallback to custom users table
    }

    try {
      // Fallback to custom users table (for users inserted directly into the users table)
      const { data: userRow, error: selectErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      if (selectErr || !userRow) {
        return { user: null, session: null, error: 'Invalid credentials' }
      }

      // NOTE: this project stores passwords in plaintext; compare directly
      if (userRow.password !== password) {
        return { user: null, session: null, error: 'Invalid credentials' }
      }

      // Persist a lightweight custom session marker locally
      localStorage.setItem('custom_user_id', userRow.id)
      return { user: userRow, session: null, error: null }
    } catch (error) {
      return { user: null, session: null, error: error.message || 'Signin failed' }
    }
  },

  // Sign out user
  async signOut() {
    try {
      // Clear any custom session
      localStorage.removeItem('custom_user_id')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      // Ensure custom session cleared even on error
      localStorage.removeItem('custom_user_id')
      return { error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      if (data?.user) {
        // If Supabase session exists, ensure any custom session marker is cleared
        localStorage.removeItem('custom_user_id')
        return { user: data.user, error: null }
      }

      // No Supabase auth user — check for a custom session marker
      const customUserId = localStorage.getItem('custom_user_id')
      if (customUserId) {
        const { data: userRow, error: selectErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', customUserId)
          .single()
        if (selectErr) {
          localStorage.removeItem('custom_user_id')
          return { user: null, error: selectErr.message || 'Unable to fetch user' }
        }
        return { user: userRow, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session: data.session, error: null }
    } catch (error) {
      return { session: null, error: error.message }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },
}
