import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart2, Activity, MessageSquare } from 'lucide-react';

interface WelcomeProps {
  darkMode: boolean;
}

const Welcome: React.FC<WelcomeProps> = ({ darkMode }) => {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ?   'bg-gradient-to-br from-indigo-50 to-purple-50' : 'dark:bg-gradient-to-br from-gray-900 to-indigo-900' }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden opacity-20 dark:opacity-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${darkMode ? 'bg-indigo-400' : 'bg-indigo-200'}`}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center pt-6">
          <div className="flex items-center">
            <Brain className={`h-8 w-8 ${darkMode ? 'text-indigo-600' : 'text-indigo-300'}`} />
            <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-gray-900':'dark:text-white' }`}>MindScape</span>
          </div>
        </nav>

        <header className="pt-16 pb-24 text-center">
          <div
            className={`inline-flex items-center justify-center p-4 rounded-full mb-6 transition-all duration-500 transform hover:rotate-12 ${
              darkMode ?   'bg-indigo-100' :'dark:bg-indigo-900 bg-opacity-50'
            }`}
          >
            <Brain
              className={`h-12 w-12 transition-colors duration-500 ${
                darkMode ? 'text-indigo-600' : 'dark:text-indigo-300'
              }`}
            />
          </div>
          <h1
            className={`text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${
              darkMode ? 'from-indigo-600 to-purple-600' : 'dark:from-indigo-300 to-purple-400'
            }`}
          >
            MindScape
          </h1>
          <p
            className={`text-xl max-w-3xl mx-auto transition-colors duration-300 ${
              darkMode ? 'text-indigo-600' : 'dark:text-gray-100'
            }`}
          >
            AI-powered mental health analysis that integrates social media sentiment and wearable device data to provide
            interactive health insights.
          </p>
          <div className="mt-10">
            <Link
              to="/onboarding"
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white'
              }`}
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="py-12">
          <h2
            className={`text-3xl font-bold text-center mb-12 transition-colors duration-300 ${
              darkMode ?  'text-gray-900' : 'dark:text-white'
            }`}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                color: 'blue',
                title: 'Data Collection',
                description:
                  'Connect your wearable devices and social media accounts to gather comprehensive health data.',
              },
              {
                icon: Brain,
                color: 'purple',
                title: 'AI Analysis',
                description:
                  'Our advanced AI analyzes your data to identify patterns and provide personalized insights.',
              },
              {
                icon: BarChart2,
                color: 'green',
                title: 'Visualization',
                description:
                  'View your mental health data through interactive charts and customizable dashboards.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`rounded-xl shadow-md p-6 text-center transition-all duration-300 transform hover:-translate-y-2 ${
                  darkMode ?  'bg-white' : 'dark:bg-blue-100 border'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${
                    darkMode ? `bg-${feature.color}-900 bg-opacity-30` : `bg-${feature.color}-100`
                  }`}
                >
                  <feature.icon
                    className={`h-8 w-8 ${
                      darkMode ? `text-${feature.color}-300` : `text-${feature.color}-600`
                    }`}
                  />
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div
            className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${
              darkMode ?  'bg-white' : 'dark:bg-blue-100 border'
            }`}
          >
            <div className="md:flex">
              <div className="md:flex-1 p-8">
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}
                >
                  AI-Powered Chatbot
                </h2>
                <p
                  className={`mb-6 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Get instant mental health tips and support from our AI assistant. It provides personalized
                  recommendations based on your mood and health data.
                </p>
                <div
                  className={`p-4 rounded-lg transition-colors duration-300 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-start mb-4">
                    <div
                      className={`p-2 rounded-full ${
                        darkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                      }`}
                    >
                      <MessageSquare
                        className={`h-5 w-5 ${
                          darkMode ? 'text-indigo-300' : 'text-indigo-600'
                        }`}
                      />
                    </div>
                    <div
                      className={`ml-3 p-3 rounded-lg ${
                        darkMode ? 'bg-indigo-900 bg-opacity-30' : 'bg-indigo-50'
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          darkMode ? 'text-indigo-100' : 'text-gray-800'
                        }`}
                      >
                        How are you feeling today?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <div
                      className={`p-3 rounded-lg ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                      >
                        I'm feeling a bit stressed about work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`md:flex-1 p-8 ${
                  darkMode ? 'bg-indigo-900' : 'bg-indigo-600'
                } text-white`}
              >
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {[
                    'Social media sentiment analysis',
                    'Wearable device integration',
                    'Personalized health recommendations',
                    'Interactive data visualization',
                    'Secure cloud storage',
                    'Real-time mood tracking',
                    'Customizable notifications',
                    'Privacy-focused design',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div
                        className={`p-1 rounded-full mr-2 ${
                          darkMode ? 'bg-indigo-700' : 'bg-indigo-500'
                        }`}
                      >
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 text-center">
          <h2
            className={`text-3xl font-bold mb-6 transition-colors duration-300 ${
              darkMode ?  'text-gray-900' : 'dark:text-white'
            }`}
          >
            Ready to improve your mental well-being?
          </h2>
          <Link
            to="/onboarding"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode
                ? 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white'
            }`}
          >
            Start Your Journey
          </Link>
        </section>
      </div>

      {/* Add global styles for animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(360deg); }
          100% { transform: translateY(0) rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default Welcome;