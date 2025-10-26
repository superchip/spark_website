import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    console.log('[DEBUG useUser] Initializing useUser hook')
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('[DEBUG useUser] getUser result:', user ? 'User found' : 'No user')
      setUser(user)
      if (user) {
        console.log('[DEBUG useUser] Fetching profile for user:', user.id)
        fetchProfile(user.id)
      } else {
        console.log('[DEBUG useUser] No user, setting isLoading to false')
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[DEBUG useUser] Auth state change:', event)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('[DEBUG useUser] fetchProfile called for userId:', userId)

    // Add timeout to prevent hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
    })

    try {
      const supabase = createClient()
      console.log('[DEBUG useUser] Querying profiles table')

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (error) {
        console.error('[DEBUG useUser] Error fetching profile:', error)
        // Profile doesn't exist - create it automatically
        console.log('[DEBUG useUser] Attempting to create new profile')

        const insertPromise = supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: null,
            avatar_url: null,
            premium_tier: 'free',
          })
          .select()
          .single()

        const insertTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile insert timeout')), 3000)
        })

        try {
          const { data: newProfile, error: insertError } = await Promise.race([
            insertPromise,
            insertTimeoutPromise
          ]) as any

          if (insertError) {
            console.error('[DEBUG useUser] Error creating profile:', insertError)
          }

          if (newProfile) {
            console.log('[DEBUG useUser] New profile created:', newProfile)
            setProfile(newProfile)
          }
        } catch (insertErr) {
          console.error('[DEBUG useUser] Profile insert timeout or error:', insertErr)
        }
      } else {
        console.log('[DEBUG useUser] Profile found:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('[DEBUG useUser] Caught error with profile:', error)
      // Even if profile operations fail, allow the app to continue
      setProfile(null)
    } finally {
      console.log('[DEBUG useUser] Setting isLoading to false')
      setIsLoading(false)
      console.log('[DEBUG useUser] fetchProfile completed')
    }
  }

  return { user, profile, isLoading }
}
