export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              EmpowHer
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
              AI-Powered Emotional & Skill Growth Platform
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Privacy-first wellness platform powered by <span className="font-semibold text-purple-600">multi-agent AI</span> that learns and adapts to your unique journey
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg border-2 border-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Agent AI Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 Powered by Multi-Agent AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four autonomous AI agents work together to provide personalized support, learn from your feedback, and adapt to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Crisis Agent */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-bold text-red-900 mb-2">CrisisAgent</h3>
              <p className="text-sm text-red-700 mb-2 font-semibold">Priority 1</p>
              <p className="text-gray-700">
                Detects crisis situations immediately and provides instant access to helplines and support resources
              </p>
              <div className="mt-4 text-sm text-red-600 font-medium">
                95% confidence when activated
              </div>
            </div>

            {/* Emotional Insight Agent */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">EmotionalInsightAgent</h3>
              <p className="text-sm text-blue-700 mb-2 font-semibold">Priority 2</p>
              <p className="text-gray-700">
                Analyzes your emotional patterns, identifies trends, and provides personalized insights
              </p>
              <div className="mt-4 text-sm text-blue-600 font-medium">
                7-day & 30-day trend analysis
              </div>
            </div>

            {/* Adaptive Intervention Agent */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">AdaptiveInterventionAgent</h3>
              <p className="text-sm text-purple-700 mb-2 font-semibold">Priority 3</p>
              <p className="text-gray-700">
                Recommends wellness activities based on your emotional state and learns what works best for you
              </p>
              <div className="mt-4 text-sm text-purple-600 font-medium">
                Learns from your feedback
              </div>
            </div>

            {/* Skill Growth Agent */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">SkillGrowthAgent</h3>
              <p className="text-sm text-green-700 mb-2 font-semibold">Priority 4</p>
              <p className="text-gray-700">
                Suggests skill-building activities when you're emotionally stable, adapting difficulty to your progress
              </p>
              <div className="mt-4 text-sm text-green-600 font-medium">
                Activates when stable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why EmpowHer?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600">
                AES-256 encryption for journals. Your data stays yours. Export or delete anytime.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Learns & Adapts</h3>
              <p className="text-gray-600">
                Reflection loop adjusts recommendations based on what works for you personally.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Visualize mood trends, engagement scores, and skill achievements over time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Personalized</h3>
              <p className="text-gray-600">
                AI agents analyze your patterns and provide tailored insights and recommendations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Crisis Support</h3>
              <p className="text-gray-600">
                Immediate access to helplines when needed. Your safety is our priority.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Skill Building</h3>
              <p className="text-gray-600">
                Micro-tasks (10-15 mins) designed to build confidence and capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Check-in</h3>
              <p className="text-gray-600">
                Log your mood, energy, stress, and optional journal entry
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-pink-600">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Four agents analyze your state and provide personalized insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive wellness activities and skill modules tailored to you
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track & Grow</h3>
              <p className="text-gray-600">
                System learns from your feedback and adapts over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of young women building emotional resilience and skills
          </p>
          <a
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Get Started Free →
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">EmpowHer</h3>
              <p className="text-gray-400">
                Privacy-first AI wellness platform for young women
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/disclaimer" className="hover:text-white">Legal Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/crisis" className="hover:text-white">Crisis Resources</a></li>
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2024 EmpowHer. Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
