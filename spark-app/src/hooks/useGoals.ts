import { useState, useEffect } from 'react'
import { Goal } from '@/types'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    console.log('[DEBUG] fetchGoals called, setting isLoading to true')
    const timeout = setTimeout(() => {
      console.warn('fetchGoals is taking longer than expected')
    }, 5000)

    try {
      setIsLoading(true)
      setError(null)

      console.log('[DEBUG] About to fetch /api/goals')
      const response = await fetch('/api/goals', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('[DEBUG] Fetch completed, response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        throw new Error(`Failed to fetch goals: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      console.log('[DEBUG] Content-Type:', contentType)
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType)
        throw new Error('Invalid response from server')
      }

      console.log('[DEBUG] About to parse JSON')
      const data = await response.json()
      console.log('[DEBUG] Goals fetched:', data)
      setGoals(data.goals || [])
      console.log('[DEBUG] Goals state updated')
    } catch (err: any) {
      console.error('[DEBUG] Error fetching goals:', err)
      setError(err.message)
      setGoals([]) // Set empty array on error
    } finally {
      clearTimeout(timeout)
      console.log('[DEBUG] About to set isLoading to false')
      setIsLoading(false)
      console.log('[DEBUG] fetchGoals completed, isLoading set to false')
    }
  }

  const createGoal = async (title: string, description?: string) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal')
      }

      setGoals([data.goal, ...goals])
      return data.goal
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete goal')
      }

      setGoals(goals.filter(goal => goal.id !== id))
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const refreshGoals = () => {
    fetchGoals()
  }

  return {
    goals,
    isLoading,
    error,
    createGoal,
    deleteGoal,
    refreshGoals,
  }
}
