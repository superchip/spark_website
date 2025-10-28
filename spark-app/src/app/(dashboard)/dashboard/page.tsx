'use client'

import { useState, useEffect } from 'react'
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
import confetti from 'canvas-confetti'

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
  const [isButtonAnimating, setIsButtonAnimating] = useState(false)
  const [sparksSkippedCount, setSparksSkippedCount] = useState(0)
  const [isSkipping, setIsSkipping] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [completedSparks, setCompletedSparks] = useState<any[]>([])
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [showProgressCelebration, setShowProgressCelebration] = useState(false)

  if (userLoading) return <LoadingPage />

  // Calculate progress metrics
  const getProgressMetrics = () => {
    if (!completedSparks.length) return null

    const totalMinutes = completedSparks.reduce((sum, completion) => {
      return sum + (completion.sparks?.effort_minutes || 0)
    }, 0)

    const firstCompletion = completedSparks[completedSparks.length - 1]
    const lastCompletion = completedSparks[0]

    const firstDate = new Date(firstCompletion.completed_at)
    const lastDate = new Date(lastCompletion.completed_at)
    const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    const activeDays = daysDiff === 0 ? 1 : daysDiff + 1

    // Calculate streak (consecutive days)
    let streak = 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < completedSparks.length - 1; i++) {
      const current = new Date(completedSparks[i].completed_at)
      const next = new Date(completedSparks[i + 1].completed_at)
      current.setHours(0, 0, 0, 0)
      next.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return {
      totalSparks: completedSparks.length,
      totalMinutes,
      activeDays,
      streak
    }
  }

  // Get achievement badges
  const getAchievements = () => {
    const count = completedSparks.length
    const metrics = getProgressMetrics()
    const badges = []

    if (count >= 1) badges.push({ icon: '🌟', label: 'First Spark', color: 'yellow' })
    if (count >= 5) badges.push({ icon: '🔥', label: 'On Fire', color: 'orange' })
    if (count >= 10) badges.push({ icon: '💪', label: 'Committed', color: 'purple' })
    if (metrics?.streak >= 3) badges.push({ icon: '⚡', label: `${metrics.streak}-Day Streak`, color: 'blue' })
    if (metrics?.totalMinutes >= 30) badges.push({ icon: '⏱️', label: 'Time Invested', color: 'green' })

    return badges
  }

  // Get motivational message
  const getMotivationalMessage = () => {
    const count = completedSparks.length
    const messages = [
      { threshold: 1, message: "You've taken the first step! Every expert was once a beginner. ✨" },
      { threshold: 3, message: "You're building momentum! Consistency is the key to transformation. 💪" },
      { threshold: 5, message: "Incredible progress! You're proving that small actions lead to big changes. 🚀" },
      { threshold: 7, message: "You're unstoppable! Your dedication is inspiring. Keep going! 🔥" },
      { threshold: 10, message: "Mastery in progress! You're not just learning—you're transforming. 🌟" },
    ]

    for (let i = messages.length - 1; i >= 0; i--) {
      if (count >= messages[i].threshold) {
        return messages[i].message
      }
    }
    return messages[0].message
  }

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Celebration effects
  const triggerCelebration = () => {
    // Multi-burst confetti effect
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#fcd34d']
      })

      // Fire from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#fcd34d']
      })
    }, 250)

    // Play success sound (using Web Audio API)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create a celebratory chord
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration)

        oscillator.start(audioContext.currentTime + startTime)
        oscillator.stop(audioContext.currentTime + startTime + duration)
      }

      // Play a happy chord progression
      playTone(523.25, 0, 0.2)    // C5
      playTone(659.25, 0, 0.2)    // E5
      playTone(783.99, 0, 0.2)    // G5
      playTone(1046.50, 0.15, 0.3) // C6
    } catch (error) {
      console.log('Audio not supported')
    }
  }

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

    // Trigger button animation immediately for instant feedback
    setIsButtonAnimating(true)

    const goalId = selectedGoal?.id || goals.find(g => g.title === createdGoalTitle)?.id

    if (!goalId) {
      console.error('No goal ID found')
      setIsButtonAnimating(false)
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
        // Trigger celebration effects immediately
        triggerCelebration()

        // Small delay to let confetti start before transition
        setTimeout(() => {
          // Update local state
          setShowCompletion(true)
          setSparksCompletedCount(prev => prev + 1)
          setIsButtonAnimating(false)
        }, 500)

        // Refresh goals to get updated completion count
        await refreshGoals()
      } else {
        const error = await response.json()
        console.error('Error completing spark:', error)
        alert('Failed to mark spark as complete. Please try again.')
        setIsButtonAnimating(false)
      }
    } catch (error) {
      console.error('Error completing spark:', error)
      alert('Failed to mark spark as complete. Please try again.')
      setIsButtonAnimating(false)
    }
  }

  const handleSkipSpark = async () => {
    if (!generatedSpark) return

    const goalId = selectedGoal?.id || goals.find(g => g.title === createdGoalTitle)?.id

    if (!goalId) {
      console.error('No goal ID found')
      return
    }

    // Track skip count
    setSparksSkippedCount(prev => prev + 1)

    // Trigger skip animation and generate new spark
    setIsSkipping(true)

    // Small delay for animation effect
    setTimeout(async () => {
      setIsGeneratingSpark(true)
      setIsSkipping(false)

      try {
        const sparkResponse = await fetch('/api/sparks/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalId: goalId,
            goalTitle: selectedGoal?.title || createdGoalTitle,
            goalDescription: selectedGoal?.description || '',
          }),
        })

        const sparkData = await sparkResponse.json()

        if (sparkResponse.ok && sparkData.spark) {
          setGeneratedSpark(sparkData.spark)
        } else {
          console.error('Error generating spark:', sparkData.error)
          alert('Failed to generate a new spark. Please try again.')
        }
      } catch (error) {
        console.error('Error generating spark:', error)
        alert('Failed to generate a new spark. Please try again.')
      } finally {
        setIsGeneratingSpark(false)
      }
    }, 300)
  }

  const handleGetAnotherSpark = async () => {
    // Hide completion screen and show loading immediately
    setShowCompletion(false)
    setIsGeneratingSpark(true)

    if (selectedGoal) {
      await handleGenerateSparkForGoal()
    } else {
      // If we just created a new goal, find it and use it
      const currentGoal = goals.find(g => g.title === createdGoalTitle)
      if (currentGoal) {
        setSelectedGoal(currentGoal)
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
      } else {
        setIsGeneratingSpark(false)
      }
    }
  }

  const handleEndSession = () => {
    setShowCompletion(false)
    setGeneratedSpark(null)
    setSelectedGoal(null)
    setCreatedGoalTitle('')
    setSparksCompletedCount(0)
    setSparksSkippedCount(0)
  }

  const handleViewProgress = async (goal: Goal) => {
    setSelectedGoal(goal)
    setShowProgress(true)
    setShowGoals(false)
    setIsLoadingProgress(true)

    try {
      const response = await fetch(`/api/goals/${goal.id}/completed-sparks`)
      const data = await response.json()

      if (response.ok) {
        setCompletedSparks(data.completedSparks || [])

        // Trigger celebration if they have completed sparks
        if (data.completedSparks && data.completedSparks.length > 0) {
          setTimeout(() => {
            setShowProgressCelebration(true)
            triggerCelebration()
          }, 300)
        }
      } else {
        console.error('Error fetching completed sparks:', data.error)
      }
    } catch (error) {
      console.error('Error fetching completed sparks:', error)
    } finally {
      setIsLoadingProgress(false)
    }
  }

  const handleSelectGoal = async (goal: Goal) => {
    setSelectedGoal(goal)
    setShowGoals(false)
    setGeneratedSpark(null)
    setCreatedGoalTitle('')
    setShowProgress(false)
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
              {isGeneratingSpark ? (
                <div className="space-y-6 py-12 text-center">
                  {/* Animated flame icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-spark-orange-400 to-spark-amber-500 flex items-center justify-center shadow-2xl animate-pulse">
                        <Flame className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-spark-orange-400 to-spark-amber-500 blur-xl opacity-50 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Loading text */}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Igniting your spark...</h2>
                    <p className="text-lg text-gray-600">Creating the perfect micro-action for you</p>
                  </div>
                </div>
              ) : showCompletion ? (
                <div className="space-y-6 py-4 animate-in fade-in duration-500">
                  {/* Success icon with animation */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl animate-bounce">
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {/* Pulsing glow effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 blur-xl opacity-50 animate-pulse"></div>
                      {/* Expanding rings */}
                      <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"></div>
                    </div>
                  </div>

                  {/* Celebration text with gradient */}
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-500">
                      Amazing! 🎉✨🔥
                    </h2>
                    <p className="text-xl text-gray-600 font-medium animate-in slide-in-from-bottom-4 duration-700">
                      You're building momentum!
                    </p>
                    <p className="text-sm text-gray-500 italic animate-in fade-in duration-1000 delay-300">
                      Every spark counts toward your goal!
                    </p>
                  </div>

                  {/* Sparks completed card with celebration */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 text-center border-2 border-spark-orange-200 shadow-lg animate-in zoom-in duration-500 delay-500">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Flame className="w-8 h-8 text-spark-orange-500 animate-pulse" />
                      <span className="text-5xl font-black bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 bg-clip-text text-transparent">
                        {sparksCompletedCount}
                      </span>
                      <Flame className="w-8 h-8 text-spark-orange-500 animate-pulse" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">
                      Spark{sparksCompletedCount !== 1 ? 's' : ''} completed this session!
                    </p>
                    <div className="mt-3 text-sm text-gray-500">
                      {sparksCompletedCount === 1 && "Great start! 🌟"}
                      {sparksCompletedCount === 2 && "You're on fire! 🔥"}
                      {sparksCompletedCount === 3 && "Unstoppable! 💪"}
                      {sparksCompletedCount >= 4 && "Legendary streak! 🚀"}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={handleGetAnotherSpark}
                      disabled={isGeneratingSpark}
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
                  <div className={`
                    border-[3px] border-spark-orange-400 rounded-2xl p-6
                    bg-gradient-to-br from-orange-50/30 to-amber-50/30
                    transition-all duration-300
                    ${isSkipping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                  `}>
                    <div className="space-y-5">
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

                      {/* Binary Choice Buttons - Side by Side */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {/* Skip Button - Left Side */}
                        <button
                          onClick={handleSkipSpark}
                          disabled={isButtonAnimating || isSkipping || isGeneratingSpark}
                          className={`
                            relative bg-gray-100 hover:bg-gray-200
                            text-gray-700 font-semibold py-4 px-4 rounded-xl
                            transition-all duration-300
                            flex items-center justify-center gap-2
                            border-2 border-gray-300 hover:border-gray-400
                            hover:scale-105 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                            group
                          `}
                        >
                          {/* Rotate icon on skip */}
                          <svg
                            className={`w-5 h-5 transition-transform duration-500 ${isSkipping ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-sm md:text-base">
                            {isSkipping ? 'Shuffling...' : 'Try Another'}
                          </span>
                        </button>

                        {/* I Did This Button - Right Side */}
                        <button
                          onClick={handleSparkCompleted}
                          disabled={isButtonAnimating || isSkipping || isGeneratingSpark}
                          className={`
                            relative bg-gradient-to-r from-green-500 to-emerald-500
                            hover:from-green-600 hover:to-emerald-600
                            text-white font-bold py-4 px-4 rounded-xl
                            transition-all duration-300
                            flex items-center justify-center gap-2
                            shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70
                            hover:scale-105 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                            overflow-hidden
                            ${isButtonAnimating ? 'animate-pulse scale-95' : ''}
                          `}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-700" />

                          {/* Icon with animation */}
                          <svg
                            className={`w-5 h-5 relative z-10 ${isButtonAnimating ? 'animate-bounce' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>

                          <span className="relative z-10 text-sm md:text-base">
                            {isButtonAnimating ? 'Sparked!' : 'I Did This!'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Session Stats & Help Text */}
                  <div className="space-y-3">
                    {/* Stats bar */}
                    {(sparksCompletedCount > 0 || sparksSkippedCount > 0) && (
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-semibold">{sparksCompletedCount} completed</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{sparksSkippedCount} skipped</span>
                        </div>
                      </div>
                    )}

                    {/* Help text */}
                    <div className="flex items-start gap-2 text-sm text-gray-600 text-center justify-center">
                      <p>💡 Only mark "I Did This!" if you completed the action</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Progress View */}
        {showProgress && selectedGoal && (
          <div className="mb-6 flex justify-center">
            <Card className="w-full max-w-2xl">
              <CardContent className="pt-6">
                {isLoadingProgress ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : completedSparks.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-spark-orange-400 to-spark-amber-500 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                      <p className="text-gray-600 mb-1">"{selectedGoal.title}"</p>
                      <p className="text-sm text-gray-500">No sparks completed yet for this goal.</p>
                      <p className="text-sm text-gray-500 mt-2">Generate your first spark to begin your journey!</p>
                    </div>
                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowProgress(false)
                          handleGenerateSparkForGoal()
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate First Spark
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowProgress(false)
                          setSelectedGoal(null)
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-700">
                    {/* Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-8 text-center">
                      <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 animate-in slide-in-from-top duration-500">
                          🎉 You're Making It Happen! 🎉
                        </h2>
                        <p className="text-lg text-white/90 animate-in slide-in-from-top duration-700">
                          Look at the amazing progress you've made!
                        </p>
                      </div>
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-500/20 animate-pulse"></div>
                    </div>

                    {/* Goal Title Card */}
                    <div className="text-center animate-in zoom-in duration-500 delay-200">
                      <p className="text-sm text-gray-500 mb-2">Your Goal</p>
                      <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 bg-clip-text text-transparent">
                        "{selectedGoal.title}"
                      </h3>
                    </div>

                    {/* Stats Cards */}
                    {(() => {
                      const metrics = getProgressMetrics()
                      return metrics ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom duration-700 delay-300">
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">🔥</div>
                            <div className="text-2xl font-bold text-yellow-700">{metrics.totalSparks}</div>
                            <div className="text-xs text-yellow-600 font-medium">Sparks</div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">⏱️</div>
                            <div className="text-2xl font-bold text-blue-700">{metrics.totalMinutes}</div>
                            <div className="text-xs text-blue-600 font-medium">Minutes</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">📅</div>
                            <div className="text-2xl font-bold text-purple-700">{metrics.activeDays}</div>
                            <div className="text-xs text-purple-600 font-medium">Days</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">⚡</div>
                            <div className="text-2xl font-bold text-green-700">{metrics.streak}</div>
                            <div className="text-xs text-green-600 font-medium">Day Streak</div>
                          </div>
                        </div>
                      ) : null
                    })()}

                    {/* Progress Bar */}
                    <div className="animate-in slide-in-from-left duration-700 delay-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Your Progress</span>
                        <span className="text-sm font-bold text-spark-orange-600">
                          {Math.min(100, Math.round((completedSparks.length / 10) * 100))}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-spark-orange-500 to-spark-amber-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(100, (completedSparks.length / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {completedSparks.length < 10
                          ? `Just ${10 - completedSparks.length} more to reach mastery level! 🎯`
                          : "You've reached mastery level! 🌟"}
                      </p>
                    </div>

                    {/* Achievement Badges */}
                    {(() => {
                      const achievements = getAchievements()
                      return achievements.length > 0 ? (
                        <div className="animate-in zoom-in duration-700 delay-700">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Achievements Unlocked</h4>
                          <div className="flex flex-wrap justify-center gap-2">
                            {achievements.map((badge, index) => (
                              <div
                                key={index}
                                className={`
                                  px-4 py-2 rounded-full text-sm font-medium border-2
                                  ${badge.color === 'yellow' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}
                                  ${badge.color === 'orange' ? 'bg-orange-50 border-orange-300 text-orange-700' : ''}
                                  ${badge.color === 'purple' ? 'bg-purple-50 border-purple-300 text-purple-700' : ''}
                                  ${badge.color === 'blue' ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                                  ${badge.color === 'green' ? 'bg-green-50 border-green-300 text-green-700' : ''}
                                  animate-in zoom-in duration-500
                                `}
                                style={{ animationDelay: `${800 + index * 100}ms` }}
                              >
                                <span className="mr-1">{badge.icon}</span>
                                {badge.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null
                    })()}

                    {/* Motivational Quote */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 text-center animate-in slide-in-from-bottom duration-700 delay-900">
                      <p className="text-base md:text-lg text-indigo-900 font-medium italic">
                        "{getMotivationalMessage()}"
                      </p>
                    </div>

                    {/* Achievement Timeline */}
                    <div className="animate-in fade-in duration-700 delay-1000">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Your Journey
                      </h4>
                      <div className="space-y-4 relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-spark-orange-300 to-spark-amber-300"></div>

                        {completedSparks.map((completion: any, index: number) => {
                          const spark = completion.sparks
                          const isToday = getRelativeTime(completion.completed_at) === 'Today'
                          return (
                            <div
                              key={completion.id}
                              className="relative pl-14 animate-in slide-in-from-right duration-500"
                              style={{ animationDelay: `${1100 + index * 100}ms` }}
                            >
                              {/* Timeline dot */}
                              <div className="absolute left-4 top-3 w-5 h-5 rounded-full bg-gradient-to-br from-spark-orange-500 to-spark-amber-500 border-4 border-white shadow-lg"></div>

                              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                {/* Date badge */}
                                <div className="flex items-center justify-between mb-2">
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    {getRelativeTime(completion.completed_at)}
                                  </span>
                                  {isToday && (
                                    <span className="px-2 py-0.5 bg-spark-orange-500 text-white text-xs font-bold rounded-full">
                                      NEW
                                    </span>
                                  )}
                                </div>

                                {/* Spark content */}
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-bold text-gray-900 mb-1">
                                      {spark.title}
                                    </h5>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {spark.description}
                                    </p>
                                    <p className="text-xs text-green-700 font-medium">
                                      {index === 0 && "You're on fire! Keep it up! 🔥"}
                                      {index === 1 && "Building momentum! 💪"}
                                      {index === 2 && "Great consistency! 🌟"}
                                      {index > 2 && "Every step counts! ✨"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Next Steps CTA */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 animate-in zoom-in duration-700">
                      <h4 className="text-lg font-bold text-blue-900 mb-2 text-center">What's Next?</h4>
                      <p className="text-sm text-blue-800 text-center mb-4">
                        Continue where you left off, or tackle your goal from a fresh angle!
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          onClick={() => {
                            setShowProgress(false)
                            setShowProgressCelebration(false)
                            handleGenerateSparkForGoal()
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Continue Journey
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowProgress(false)
                            setShowProgressCelebration(false)
                            setSelectedGoal(null)
                          }}
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {generatedSpark && !showCompletion && !showProgress && (
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
                    onClick={() => handleViewProgress(goal)}
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
