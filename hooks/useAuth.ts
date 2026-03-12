'use client'

import { useAuthContext } from '@/src/context/AuthContext'

export function useAuth() {
    const { user, session, loading, signOut } = useAuthContext()
    return { user, session, loading, signOut }
}
