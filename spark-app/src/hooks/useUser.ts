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
    let isFetching = false
    let currentUserId: string | null = null

    const fetchProfile = async (userId: string) => {
      console.log('[DEBUG useUser] fetchProfile called for userId:', userId)
      isFetching = true

      try {
        console.log('[DEBUG useUser] Querying profiles table')

        // Use Promise.race with a timeout to prevent hanging
        const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
          setTimeout(() => {
            console.error('[DEBUG useUser] Profile fetch timed out after 5 seconds, continuing without profile')
            resolve({ data: null, error: { message: 'Timeout', code: 'TIMEOUT' } })
          }, 5000)
        })

        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        const { data, error } = await Promise.race([queryPromise, timeoutPromise])

        console.log('[DEBUG useUser] Query completed, error:', error, 'data:', !!data)

        if (error) {
          console.error('[DEBUG useUser] Error fetching profile:', error)

          // Don't try to create profile on timeout - just continue without profile
          if (error.code === 'TIMEOUT') {
            console.warn('[DEBUG useUser] Skipping profile creation due to timeout')
            setProfile(null)
          } else {
            // Profile doesn't exist - create it automatically
            console.log('[DEBUG useUser] Attempting to create new profile')

            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  display_name: null,
                  avatar_url: null,
                  premium_tier: 'free',
                })
                .select()
                .single()

              if (insertError) {
                console.error('[DEBUG useUser] Error creating profile:', insertError)
              }

              if (newProfile) {
                console.log('[DEBUG useUser] New profile created:', newProfile)
                setProfile(newProfile)
              }
            } catch (insertErr) {
              console.error('[DEBUG useUser] Profile insert error:', insertErr)
            }
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
        isFetching = false
        console.log('[DEBUG useUser] Setting isLoading to false')
        setIsLoading(false)
        console.log('[DEBUG useUser] fetchProfile completed')
      }
    }

    console.log('[DEBUG useUser] Initializing useUser hook')
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('[DEBUG useUser] getUser result:', user ? 'User found' : 'No user')
      setUser(user)
      if (user) {
        console.log('[DEBUG useUser] Fetching profile for user:', user.id)
        currentUserId = user.id
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
          // Only fetch if not already fetching for this user
          if (!isFetching || currentUserId !== session.user.id) {
            currentUserId = session.user.id
            await fetchProfile(session.user.id)
          } else {
            console.log('[DEBUG useUser] Skipping duplicate fetch for same user')
          }
        } else {
          setProfile(null)
          setIsLoading(false)
          currentUserId = null
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, profile, isLoading }
}
