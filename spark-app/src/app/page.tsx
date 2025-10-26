import Link from 'next/link'
import { Flame, Sparkles, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spark-orange-50 to-spark-amber-50">
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-spark-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 bg-clip-text text-transparent">
              Spark
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-spark-orange-600" />
            <span className="text-sm font-medium text-gray-700">Micro-Activation Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-spark-orange-600 to-spark-amber-600 bg-clip-text text-transparent">
              Ignite Your Potential,
            </span>
            <br />
            <span className="text-gray-900">One Spark at a Time</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Overcome procrastination by breaking your goals into tiny, achievable sparks.
            Each spark takes just 2-5 minutes. Start small, build momentum.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" className="text-lg px-8 py-6">
                <Flame className="w-5 h-5 mr-2" />
                Start Your First Spark
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Why Spark Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-spark-orange-500 to-spark-amber-500 mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Tiny Actions</h3>
                <p className="text-gray-600">
                  Each spark takes just 2-5 minutes. No overwhelming tasks, just small steps forward.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-spark-orange-500 to-spark-amber-500 mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered</h3>
                <p className="text-gray-600">
                  Smart AI generates personalized micro-tasks tailored to your goals and progress.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-spark-orange-500 to-spark-amber-500 mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Build Momentum</h3>
                <p className="text-gray-600">
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
      <footer className="px-4 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2025 Spark. Overcome procrastination, one spark at a time.</p>
        </div>
      </footer>
    </div>
  )
}
