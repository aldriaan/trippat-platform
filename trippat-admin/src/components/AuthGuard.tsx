'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/stores/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, initializeAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Initialize auth from cookies
      await initializeAuth()
      
      // Wait a bit to ensure state is updated
      setTimeout(() => {
        const authStore = useAuthStore.getState()
        
        // Check if user is authenticated
        if (!authStore.isAuthenticated) {
          router.replace('/login')
          return
        }

        setIsLoading(false)
      }, 100)
    }

    checkAuth()
  }, [router, initializeAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113c5a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}