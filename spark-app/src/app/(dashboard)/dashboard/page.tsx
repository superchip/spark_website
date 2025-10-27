'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flame, Plus, LogOut, Sparkles, ArrowRight } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { LoadingPage } from '@/components/LoadingPage'

export default function DashboardPage() {
  const router = useRouter()
  const { goals, isLoading: goalsLoading, createGoal, refreshGoals } = useGoals()
  const { user, isLoading: userLoading } = useUser()
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (userLoading) return <LoadingPage />

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalTitle.trim()) return

    setIsCreating(true)
    try {
      await createGoal(newGoalTitle.trim())
      setNewGoalTitle('')
      setShowNewGoal(false)
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setIsCreating(false)
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

        <div className="mb-6">
          {!showNewGoal ? (
            <Button onClick={() => setShowNewGoal(true)} variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              New Goal
            </Button>
          ) : (
            <Card>
              <CardContent className="pt-6">
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
                      autoFocus
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" isLoading={isCreating} className="flex-1">
                      Generate My First Spark
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowNewGoal(false)
                      setNewGoalTitle('')
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

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
              <Link key={goal.id} href={`/session/${goal.id}`}>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
