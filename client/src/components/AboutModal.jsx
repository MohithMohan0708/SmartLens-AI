import { X, Sparkles, Zap, BookOpen, Shield } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden relative animate-scale-in">
        {/* Header with Close Button */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">SmartLens AI</h2>
              <p className="text-blue-100 text-sm">AI-Powered Note Analysis</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* What is SmartLens AI */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary-600" />
              <span>What We Do</span>
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              SmartLens AI transforms your handwritten notes into organized, searchable digital content with AI-powered insights.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <span>Key Features</span>
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Text Extraction</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">OCR technology converts handwritten notes to digital text</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">AI Analysis</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Generates summaries, key points, keywords, and sentiment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Smart Categorization</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Auto-categorizes notes (work, study, personal, etc.)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Action Items & Entities</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Extracts tasks, dates, people, and places</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Search & Filter</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Advanced search by content, keywords, sentiment, or category</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <span>Perfect For</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">📚 Students</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Digitize lecture notes</p>
              </div>
              <div className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">💼 Professionals</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Organize meeting notes</p>
              </div>
              <div className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">✍️ Writers</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Convert drafts to digital</p>
              </div>
              <div className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">🔬 Researchers</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Extract research insights</p>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-1">Secure & Private</h4>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Your notes are encrypted and only accessible to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full btn-primary py-2.5 text-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
