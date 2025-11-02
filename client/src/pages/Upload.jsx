import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import AnalysisDisplay from '../components/AnalysisDisplay';

const Upload = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    setUploadResult(data);
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          <span className="gradient-text">Upload & Analyze</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span>Transform your handwritten notes with AI-powered analysis</span>
        </p>
      </div>

      {!uploadResult ? (
        <>
          {/* Compact SmartLens AI Info - Top */}
          <div className="card p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">What SmartLens AI Does</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">OCR extraction → AI analysis → Smart organization → Action items</p>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                Learn More ↓
              </button>
            </div>
          </div>
          
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          
          {/* Detailed Info Section - Bottom */}
          <div id="info-section" className="card p-6 mt-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  How SmartLens AI Works
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  SmartLens AI uses advanced OCR and AI technology to extract, analyze, and organize your handwritten notes automatically.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Text Extraction</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Converts handwritten notes to digital text using OCR</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Analysis</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generates summaries, key points, and insights</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Smart Organization</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Categorizes notes and extracts keywords automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Action Items</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Identifies tasks, dates, and important entities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className={`card p-6 ${uploadResult.isDuplicate ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${uploadResult.isDuplicate ? 'bg-yellow-500' : 'bg-green-500'}`}>
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {uploadResult.isDuplicate ? '🔄 Duplicate Detected!' : '✨ Analysis Complete!'}
                </h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium">
                  {uploadResult.message}
                </p>
              </div>
            </div>
          </div>

          {uploadResult.note.analysis_result ? (
            <AnalysisDisplay
              analysis={uploadResult.note.analysis_result}
              extractedText={uploadResult.note.extracted_text}
            />
          ) : (
            <div className="space-y-6">
              <div className="card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
                    <Sparkles className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Analysis Unavailable</h3>
                    <p className="text-gray-700 dark:text-gray-200 mb-3">
                      {uploadResult.analysisError || 'The AI analysis could not be generated at this time.'}
                    </p>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2">💡 Possible reasons:</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                        <li>API rate limit reached (too many requests)</li>
                        <li>API quota exceeded for today</li>
                        <li>Temporary service unavailability</li>
                      </ul>
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium mt-3">
                        ✅ Your text was extracted successfully and saved.
                      </p>
                    </div>
                    <button
                      onClick={() => setUploadResult(null)}
                      className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span>Re-upload to Retry AI Analysis</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Extracted Text</h3>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-5 max-h-96 overflow-y-auto border-2 border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {uploadResult.note.extracted_text}
                  </p>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
                    {uploadResult.note.extracted_text.length} characters extracted
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setUploadResult(null)}
              className="flex-1 btn-secondary py-4 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Upload Another Note</span>
            </button>
            <button
              onClick={handleViewDashboard}
              className="flex-1 btn-primary py-4 flex items-center justify-center space-x-2"
            >
              <span>View All Notes</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
