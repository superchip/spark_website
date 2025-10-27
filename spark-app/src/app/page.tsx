'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, Sparkles, Target, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { Spark } from '@/types'

export default function LandingPage() {
  const [goalTitle, setGoalTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSpark, setGeneratedSpark] = useState<Spark | null>(null)
  const [showForm, setShowForm] = useState(true)

  const handleGenerateSpark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim()) return

    setIsGenerating(true)
    try {
      const res = await fetch('/api/sparks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: goalTitle.trim(),
          anonymous: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Error response from API:', data)
        alert(`Failed to generate spark: ${data.error || 'Unknown error'}`)
        return
      }

      if (data.spark) {
        setGeneratedSpark(data.spark)
        setShowForm(false)
      } else {
        alert('Failed to generate spark. Please try again.')
      }
    } catch (error) {
      console.error('Error generating spark:', error)
      alert('Failed to generate spark. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spark-orange-50 via-amber-50 to-spark-orange-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-spark-orange-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-spark-amber-200/30 rounded-full blur-3xl translate-x-1/2"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-spark-orange-300/20 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 py-2 sm:py-3 md:py-4 md:px-8 backdrop-blur-sm bg-white/30 border-b border-white/50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="p-1 sm:p-1.5 bg-gradient-to-br from-spark-orange-600 to-spark-amber-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 bg-clip-text text-transparent">
                Spark
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 font-semibold hover:text-gray-900 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-1.5 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </header>

      {/* Hero Section - Spark Generation Form or Result */}
      <section className="px-4 py-4 sm:py-6 md:py-10">
        <div className="max-w-3xl mx-auto">
          {showForm ? (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Branding Badge - Vibrant and eye-catching */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-2 sm:mb-3 md:mb-4 backdrop-blur-md shadow-md border border-orange-200">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-spark-orange-600" />
                  <span className="text-xs font-bold text-spark-orange-700 tracking-wide uppercase">Micro-Activation Platform</span>
                </div>

                {/* Hero Heading - Vibrant gradients */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-2 sm:mb-3 md:mb-4 leading-tight px-2">
                  <span className="bg-gradient-to-r from-orange-600 via-red-500 to-amber-600 bg-clip-text text-transparent">
                    Ignite Your Potential
                  </span>
                  <br />
                  <span className="text-gray-900">One Spark at a Time</span>
                </h1>

                {/* Subheading - Energetic and colorful */}
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-3 sm:mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed font-medium px-2">
                  Overcome procrastination with tiny <strong className="font-bold text-orange-600">2-5 minute actions</strong>.
                  <span className="text-green-600 font-semibold"> No sign-up required!</span>
                </p>
              </div>

              {/* Spark Generation Form - Vibrant and modern */}
              <Card className="shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 border-2 border-orange-200 bg-white relative overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-amber-50/30 pointer-events-none"></div>

                <CardContent className="p-5 sm:p-6 md:p-8 lg:p-10 relative z-10">
                  <form onSubmit={handleGenerateSpark} className="space-y-3 sm:space-y-4 md:space-y-6">
                    {/* Header with spark icon - Vibrant */}
                    <div className="flex items-center gap-3 pb-1">
                      <div className="p-2.5 bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 rounded-xl shadow-lg">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        What do you want to do?
                      </h2>
                    </div>

                    {/* Info box - Colorful gradient */}
                    <div className="relative bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 border-l-4 border-indigo-500 rounded-r-xl p-4 sm:p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">✨</span>
                        <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                          <strong className="font-bold text-indigo-900">Typing your goal is your first spark</strong> – the most important step!
                        </p>
                      </div>
                    </div>

                    {/* Goal input - Vibrant focus state */}
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                        Your Goal
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., I want to bake a cake"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-4 sm:px-5 sm:py-5 text-base sm:text-lg font-medium border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-200 outline-none placeholder:text-gray-400 hover:border-orange-400 bg-white shadow-sm"
                      />
                    </div>

                    {/* Action button - Vibrant and energetic */}
                    <div>
                      <button
                        type="submit"
                        disabled={isGenerating || !goalTitle.trim()}
                        className="group relative w-full bg-gradient-to-r from-orange-600 via-red-500 to-amber-600 hover:from-orange-700 hover:via-red-600 hover:to-amber-700 text-white font-bold text-base sm:text-lg md:text-xl py-5 sm:py-6 md:py-7 px-6 sm:px-8 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden"
                      >
                        {/* Enhanced shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                        {isGenerating ? (
                          <>
                            <Spinner />
                            <span>Generating Your Spark...</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Generate My First Spark</span>
                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-200" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Trust indicators - Vibrant colors */}
                    <div className="pt-2 sm:pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-full shadow-sm">
                        <span className="text-base">🔒</span>
                        <span className="text-emerald-700">No account needed</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-300 rounded-full shadow-sm">
                        <span className="text-base">🎯</span>
                        <span className="text-violet-700">Personalized by AI</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-full shadow-sm">
                        <span className="text-base">⚡</span>
                        <span className="text-amber-700">Takes 2-5 minutes</span>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : generatedSpark ? (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              {/* Success badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 border border-green-200 rounded-full mb-3 sm:mb-4">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-semibold text-green-700">Spark Generated!</span>
                </div>
              </div>

              {/* Generated Spark Display - Enhanced card */}
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-spark-orange-500 to-spark-amber-500 px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Your First Spark</h3>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm">Ready to take action? Here's your personalized micro-task:</p>
                </div>

                <CardContent className="p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Spark content */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{generatedSpark.title}</h4>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{generatedSpark.description}</p>
                  </div>

                  {/* Time badge */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-spark-orange-100 to-spark-amber-100 border border-spark-orange-200 rounded-full">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-spark-orange-600" />
                      <span className="text-xs sm:text-sm font-bold text-spark-orange-700">
                        {generatedSpark.effort_minutes} minutes
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">Quick and actionable</span>
                  </div>

                  {/* Resource link */}
                  {generatedSpark.resource_link && (
                    <a
                      href={generatedSpark.resource_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-spark-orange-600 hover:text-spark-orange-700 font-semibold text-sm sm:text-base transition-colors group"
                    >
                      <span>View Helpful Resource</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {/* Action buttons */}
                  <div className="pt-4 sm:pt-6 space-y-3">
                    <button
                      onClick={() => {
                        setShowForm(true)
                        setGeneratedSpark(null)
                        setGoalTitle('')
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base transition-colors"
                    >
                      Generate Another Spark
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Sign-up prompt - Enhanced design */}
              <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-spark-orange-600 via-spark-orange-500 to-spark-amber-600">
                <CardContent className="p-6 sm:p-8 md:p-10 text-center relative">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-4 sm:mb-5 md:mb-6 shadow-lg">
                      <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                      Love Your Spark?
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-7 md:mb-8 max-w-lg mx-auto leading-relaxed px-2">
                      Sign up free to track progress, build momentum chains, and unlock unlimited sparks!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Link href="/signup">
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-spark-orange-600 font-bold text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                          Sign Up Free
                        </button>
                      </Link>
                      <Link href="/login">
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white font-bold text-base sm:text-lg border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-200">
                          Sign In
                        </button>
                      </Link>
                    </div>

                    <p className="text-white/80 text-xs sm:text-sm mt-4 sm:mt-5 md:mt-6 px-2">
                      ✨ No credit card required • 🚀 Start building momentum today
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>

        {/* Features Section */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
              Why Spark Works
            </h2>
            <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
              Built on proven behavioral science to help you overcome procrastination
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-10 pb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-spark-orange-500 to-spark-amber-500 mb-6 shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Tiny Actions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Each spark takes just 2-5 minutes. No overwhelming tasks, just small steps forward.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-10 pb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-spark-orange-500 to-spark-amber-500 mb-6 shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">AI-Powered</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Smart AI generates personalized micro-tasks tailored to your goals and progress.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-10 pb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-spark-orange-500 to-spark-amber-500 mb-6 shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Build Momentum</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Chain sparks together to create lasting progress and overcome procrastination.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 md:py-24 bg-white/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Set Your Goal</h3>
                <p className="text-gray-600">
                  Tell Spark what you want to achieve. It could be learning guitar, starting a fitness routine, or building a new habit.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Get Your Spark</h3>
                <p className="text-gray-600">
                  AI generates a tiny, specific action that takes just 2-5 minutes. No excuses, just action.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Complete & Chain</h3>
                <p className="text-gray-600">
                  Finish your spark, build your chain, and watch your momentum grow. Each spark brings you closer to your goal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 border-0">
            <CardContent className="py-12">
              <Flame className="w-16 h-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Light Your First Spark?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join others who are turning tiny actions into big achievements.
              </p>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-spark-orange-600 hover:bg-gray-50"
                >
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

        {/* Footer */}
        <footer className="px-4 py-8 border-t border-white/30">
          <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
            <p>&copy; 2025 Spark. Overcome procrastination, one spark at a time.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
