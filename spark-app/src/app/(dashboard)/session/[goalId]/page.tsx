'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { Goal, Spark } from '@/types'

export default function SessionPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = use(params)
  const router = useRouter()
  const {
    sessionId,
    startSession,
    currentSpark,
    setCurrentSpark,
    addCompletedSpark,
    incrementChain,
    chainLength,
    completedSparks,
  } = useSessionStore()

  const [goal, setGoal] = useState<Goal | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      startSession(goalId)
    }
    fetchGoal()
  }, [goalId, sessionId, startSession])

  const fetchGoal = async () => {
    try {
      const res = await fetch(`/api/goals/${goalId}`)
      const data = await res.json()
      if (data.goal) setGoal(data.goal)
    } catch (error) {
      console.error('Error fetching goal:', error)
    }
  }

  const generateNextSpark = async () => {
    if (!goal) return

    setIsGenerating(true)
    try {
      const res = await fetch('/api/sparks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goal.id,
          goalTitle: goal.title,
          goalDescription: goal.description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Error response from API:', data)
        alert(`Failed to generate spark: ${data.error || 'Unknown error'}. Please check that your Groq API key is configured.`)
        return
      }

      if (data.spark) {
        setCurrentSpark(data.spark)
      } else {
        console.error('No spark in response:', data)
        alert('Failed to generate spark. Please try again.')
      }
    } catch (error) {
      console.error('Error generating spark:', error)
      alert('Failed to generate spark. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const completeSpark = async () => {
    if (!currentSpark || !sessionId) return

    setIsCompleting(true)
    try {
      const res = await fetch('/api/sparks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sparkId: currentSpark.id,
          goalId: goalId,
          sessionId: sessionId,
        }),
      })

      const data = await res.json()
      if (data.completion) {
        addCompletedSpark(data.completion)
        incrementChain()
        setCurrentSpark(null)
      }
    } catch (error) {
      console.error('Error completing spark:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spark-orange-50 to-spark-amber-50 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-spark-orange-500 to-spark-amber-500 mb-4">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <p className="text-6xl font-bold text-gray-900 mb-2">{chainLength}</p>
              <p className="text-gray-600">Sparks Completed</p>
            </div>

            <div className="space-y-2">
              {completedSparks.map((completion, idx) => (
                <div key={completion.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Spark #{idx + 1} completed</span>
                </div>
              ))}
            </div>

            <Button variant="primary" onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spark-orange-50 to-spark-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {chainLength > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <Flame className="w-5 h-5 text-spark-orange-500" />
              <span className="font-bold text-gray-900">{chainLength} Chain</span>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{goal.title}</h1>
          {goal.description && <p className="text-gray-600">{goal.description}</p>}
        </div>

        {currentSpark ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-spark-orange-500" />
                <CardTitle>Your Next Spark</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentSpark.title}</h3>
                <p className="text-gray-600">{currentSpark.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-spark-orange-100 text-spark-orange-700 rounded-full font-medium">
                  {currentSpark.effort_minutes} min
                </span>
              </div>

              {currentSpark.resource_link && (
                <a
                  href={currentSpark.resource_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-spark-orange-600 hover:text-spark-orange-700 text-sm"
                >
                  View Resource →
                </a>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={completeSpark}
                  isLoading={isCompleting}
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I Did This!
                </Button>
                <Button variant="outline" onClick={() => setShowSummary(true)}>
                  End Session
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                {isGenerating ? (
                  <>
                    <Spinner size="lg" className="mb-4" />
                    <p className="text-gray-600">Generating your next spark...</p>
                  </>
                ) : (
                  <>
                    <Flame className="w-16 h-16 mx-auto mb-4 text-spark-orange-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {chainLength > 0 ? 'Great job!' : 'Ready to start?'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {chainLength > 0 ? 'Get your next spark to keep the momentum going!' : 'Generate your first spark and begin your journey!'}
                    </p>
                    <Button variant="primary" onClick={generateNextSpark}>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {chainLength > 0 ? 'Fuel the Fire' : 'Get My First Spark'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
