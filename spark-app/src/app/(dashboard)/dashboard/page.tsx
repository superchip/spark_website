'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, LogOut, Sparkles, ArrowRight, Clock, ExternalLink, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { LoadingPage } from '@/components/LoadingPage'
import type { Spark, Goal } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { goals, isLoading: goalsLoading, createGoal, refreshGoals } = useGoals()
  const { user, isLoading: userLoading } = useUser()
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [generatedSpark, setGeneratedSpark] = useState<Spark | null>(null)
  const [createdGoalTitle, setCreatedGoalTitle] = useState('')
  const [showGoals, setShowGoals] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isGeneratingSpark, setIsGeneratingSpark] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [sparksCompletedCount, setSparksCompletedCount] = useState(0)

  if (userLoading) return <LoadingPage />

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalTitle.trim()) return

    setIsCreating(true)
    try {
      // Create the goal
      const goal = await createGoal(newGoalTitle.trim())
      setCreatedGoalTitle(newGoalTitle.trim())

      // Generate the first spark for this goal
      const sparkResponse = await fetch('/api/sparks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goal.id,
          goalTitle: goal.title,
          goalDescription: goal.description,
        }),
      })

      const sparkData = await sparkResponse.json()

      if (sparkResponse.ok && sparkData.spark) {
        setGeneratedSpark(sparkData.spark)
      } else {
        console.error('Error generating spark:', sparkData.error)
      }

      setNewGoalTitle('')
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateAnother = () => {
    setGeneratedSpark(null)
    setCreatedGoalTitle('')
    setNewGoalTitle('')
    setSelectedGoal(null)
    setShowCompletion(false)
  }

  const handleSparkCompleted = async () => {
    if (!generatedSpark) return

    const goalId = selectedGoal?.id || goals.find(g => g.title === createdGoalTitle)?.id

    if (!goalId) {
      console.error('No goal ID found')
      return
    }

    try {
      // Call the API to mark the spark as complete
      const response = await fetch('/api/sparks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sparkId: generatedSpark.id,
          goalId: goalId,
          sessionId: generatedSpark.id, // Using spark ID as session ID for now
        }),
      })

      if (response.ok) {
        // Update local state
        setShowCompletion(true)
        setSparksCompletedCount(prev => prev + 1)

        // Refresh goals to get updated completion count
        await refreshGoals()
      } else {
        const error = await response.json()
        console.error('Error completing spark:', error)
        alert('Failed to mark spark as complete. Please try again.')
      }
    } catch (error) {
      console.error('Error completing spark:', error)
      alert('Failed to mark spark as complete. Please try again.')
    }
  }

  const handleGetAnotherSpark = async () => {
    if (selectedGoal) {
      setShowCompletion(false)
      await handleGenerateSparkForGoal()
    } else {
      // If we just created a new goal, find it and use it
      const currentGoal = goals.find(g => g.title === createdGoalTitle)
      if (currentGoal) {
        setSelectedGoal(currentGoal)
        setShowCompletion(false)
        setIsGeneratingSpark(true)
        try {
          const sparkResponse = await fetch('/api/sparks/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalId: currentGoal.id,
              goalTitle: currentGoal.title,
              goalDescription: currentGoal.description,
            }),
          })

          const sparkData = await sparkResponse.json()

          if (sparkResponse.ok && sparkData.spark) {
            setGeneratedSpark(sparkData.spark)
          } else {
            console.error('Error generating spark:', sparkData.error)
          }
        } catch (error) {
          console.error('Error generating spark:', error)
        } finally {
          setIsGeneratingSpark(false)
        }
      }
    }
  }

  const handleEndSession = () => {
    setShowCompletion(false)
    setGeneratedSpark(null)
    setSelectedGoal(null)
    setCreatedGoalTitle('')
    setSparksCompletedCount(0)
  }

  const handleSelectGoal = async (goal: Goal) => {
    setSelectedGoal(goal)
    setShowGoals(false)
    setGeneratedSpark(null)
    setCreatedGoalTitle('')
  }

  const handleGenerateSparkForGoal = async () => {
    if (!selectedGoal) return

    setIsGeneratingSpark(true)
    try {
      const sparkResponse = await fetch('/api/sparks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: selectedGoal.id,
          goalTitle: selectedGoal.title,
          goalDescription: selectedGoal.description,
        }),
      })

      const sparkData = await sparkResponse.json()

      if (sparkResponse.ok && sparkData.spark) {
        setGeneratedSpark(sparkData.spark)
        setCreatedGoalTitle(selectedGoal.title)
      } else {
        console.error('Error generating spark:', sparkData.error)
      }
    } catch (error) {
      console.error('Error generating spark:', error)
    } finally {
      setIsGeneratingSpark(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spark-orange-50 to-spark-amber-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 bg-clip-text text-transparent mb-2">
              Your Goals
            </h1>
            <p className="text-gray-600">Ignite your potential, one spark at a time</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="mb-6 flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              {showCompletion ? (
                <div className="space-y-6 py-4">
                  {/* Success icon */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Celebration text */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Amazing! 🎉</h2>
                    <p className="text-lg text-gray-600">You're building momentum!</p>
                  </div>

                  {/* Sparks completed card */}
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Flame className="w-6 h-6 text-spark-orange-500" />
                      <span className="text-3xl font-bold text-spark-orange-600">{sparksCompletedCount}</span>
                    </div>
                    <p className="text-gray-600">Spark{sparksCompletedCount !== 1 ? 's' : ''} completed</p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={handleGetAnotherSpark}
                      isLoading={isGeneratingSpark}
                      className="w-full bg-spark-orange-500 hover:bg-spark-orange-600 py-3.5"
                    >
                      <Flame className="w-5 h-5 mr-2" />
                      Fuel the Fire (Get Another Spark)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEndSession}
                      className="w-full py-3.5"
                    >
                      End Session
                    </Button>
                  </div>
                </div>
              ) : !selectedGoal && !generatedSpark ? (
                <form onSubmit={handleCreateGoal} className="space-y-6">
                  {/* Header with spark icon */}
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-spark-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-900">What do you want to do?</h2>
                  </div>

                  {/* Info box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      ✨ <strong>Typing your goal is your first spark</strong> – the most important step!
                    </p>
                  </div>

                  {/* Goal input */}
                  <div>
                    <Input
                      label="Your Goal"
                      placeholder="e.g., I want to bake a cake"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" isLoading={isCreating} className="flex-1">
                      {selectedGoal ? 'Generate Next Spark' : 'Generate My First Spark'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewGoalTitle('')}
                      disabled={!newGoalTitle.trim()}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              ) : selectedGoal && !generatedSpark ? (
                <div className="space-y-6">
                  {/* Goal header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-spark-orange-500 to-spark-amber-500 mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGoal.title}</h2>
                    {selectedGoal.description && (
                      <p className="text-gray-600">{selectedGoal.description}</p>
                    )}
                  </div>

                  {/* Goal stats */}
                  <div className="bg-gradient-to-br from-spark-orange-50 to-spark-amber-50 rounded-lg p-6">
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-spark-orange-600">
                          <Flame className="w-5 h-5" />
                          <span className="text-2xl font-bold">{selectedGoal.total_sparks_completed}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Sparks Completed</p>
                      </div>
                      <div className="text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedGoal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedGoal.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={handleGenerateSparkForGoal}
                      isLoading={isGeneratingSpark}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Next Spark
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCreateAnother}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : generatedSpark ? (
                <div className="space-y-6">
                  {/* Goal context */}
                  <div className="text-center pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Your next spark for</p>
                    <h3 className="text-lg font-semibold text-gray-900">{createdGoalTitle}</h3>
                  </div>

                  {/* Spark card with border */}
                  <div className="border-[3px] border-spark-orange-400 rounded-2xl p-6 bg-gradient-to-br from-orange-50/30 to-amber-50/30">
                    <div className="space-y-4">
                      {/* Icon and Title */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-spark-orange-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{generatedSpark.title}</h3>
                          <p className="text-gray-700 leading-relaxed">{generatedSpark.description}</p>
                        </div>
                      </div>

                      {/* Time badge */}
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          <span>{generatedSpark.effort_minutes} min</span>
                        </div>
                        {generatedSpark.resource_link && (
                          <a
                            href={generatedSpark.resource_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Resource</span>
                          </a>
                        )}
                      </div>

                      {/* I Did This button */}
                      <button
                        onClick={handleSparkCompleted}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        I Did This! (Sparked!)
                      </button>
                    </div>
                  </div>

                  {/* Bottom note */}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Flame className="w-4 h-4 text-spark-orange-500 flex-shrink-0 mt-0.5" />
                    <p>Only mark "Sparked!" if you actually did this specific action</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {generatedSpark && !showCompletion && (
          <div className="flex justify-center mb-6">
            <Button
              variant="ghost"
              onClick={handleCreateAnother}
              className="text-gray-600 hover:text-gray-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Want to create a different goal?
            </Button>
          </div>
        )}

        {goals.length > 0 && (
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              onClick={() => setShowGoals(!showGoals)}
              className="flex items-center gap-2"
            >
              {showGoals ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide My Goals ({goals.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show My Goals ({goals.length})
                </>
              )}
            </Button>
          </div>
        )}

        {showGoals && (
          <>
            {goalsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : goals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Flame className="w-16 h-16 mx-auto mb-4 text-spark-orange-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
                  <p className="text-gray-600">Create your first goal to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className="hover:shadow-xl transition-shadow cursor-pointer h-full"
                    onClick={() => handleSelectGoal(goal)}
                  >
                    <CardHeader>
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Flame className="w-4 h-4 text-spark-orange-500" />
                        <span>{goal.total_sparks_completed} sparks completed</span>
                      </div>
                      <div className="mt-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          goal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
