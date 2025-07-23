'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'customer' | 'expert' | 'admin'
  isEmailVerified: boolean
  avatar?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
  confirmReset: (token: string, password: string) => Promise<{ success: boolean; message?: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string }>
  resendVerification: () => Promise<{ success: boolean; message?: string }>
  isAuthenticated: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const locale = useLocale()

  const API_BASE_URL = 'http://localhost:5001/api'

  // Get stored token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Store token
  const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  // Remove token
  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
        } else {
          removeToken()
        }
      } else {
        removeToken()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      removeToken()
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('Attempting login with:', { email, api_url: `${API_BASE_URL}/auth/login` })
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login failed:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { success: false, message: 'Unable to connect to server. Please check your internet connection.' }
      }
      return { success: false, message: 'Login failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...userData, role: 'customer' })
      })

      const data = await response.json()

      if (data.success) {
        // Don't auto-login after registration, user needs to verify email
        return { success: true, message: 'Registration successful! Please check your email to verify your account.' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, message: 'Registration failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    removeToken()
    setUser(null)
    router.push(`/${locale}`)
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const token = getToken()
      if (!token) return false

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setToken(data.data.token)
          return true
        }
      }
      
      // If refresh fails, logout user
      logout()
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data)
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      return { success: false, message: 'Profile update failed. Please try again.' }
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, message: 'Password reset email sent. Please check your email.' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      return { success: false, message: 'Password reset failed. Please try again.' }
    }
  }

  // Confirm password reset function
  const confirmReset = async (token: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword: password })
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, message: 'Password reset successfully. You can now login with your new password.' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Password reset confirmation failed:', error)
      return { success: false, message: 'Password reset failed. Please try again.' }
    }
  }

  // Verify email function
  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (data.success) {
        // Update user verification status if logged in
        if (user) {
          setUser({ ...user, isEmailVerified: true })
        }
        return { success: true, message: 'Email verified successfully!' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Email verification failed:', error)
      return { success: false, message: 'Email verification failed. Please try again.' }
    }
  }

  // Resend verification email function
  const resendVerification = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, message: 'Verification email sent. Please check your email.' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Resend verification failed:', error)
      return { success: false, message: 'Failed to resend verification email. Please try again.' }
    }
  }

  // Auto-refresh token every 25 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        refreshToken()
      }
    }, 25 * 60 * 1000) // 25 minutes

    return () => clearInterval(interval)
  }, [user])

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    resetPassword,
    confirmReset,
    verifyEmail,
    resendVerification,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider