import { createContext } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../utils/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import { useAuth } from '~/components/AuthProvider'
import { Navigate } from 'react-router'


type AuthContextType = {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
})

export const AuthScreen = () => {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (session) return <Navigate to="/" replace />

  return (
    <div className='flex justify-center w-full'>
      <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
    </div>
  )
}
