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
        <p className="text-gray-600 flex items-center justify-center space-x-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span>Transform your handwritten notes with AI-powered analysis</span>
        </p>
      </div>

      {!uploadResult ? (
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      ) : (
        <div className="space-y-8">
          <div className={`card p-6 ${uploadResult.isDuplicate ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${uploadResult.isDuplicate ? 'bg-yellow-500' : 'bg-green-500'}`}>
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {uploadResult.isDuplicate ? '🔄 Duplicate Detected!' : '✨ Analysis Complete!'}
                </h3>
                <p className="text-gray-700 font-medium">
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
              <div className="card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Sparkles className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis Unavailable</h3>
                    <p className="text-gray-700 mb-3">
                      {uploadResult.analysisError || 'The AI analysis could not be generated at this time.'}
                    </p>
                    <div className="bg-white/60 rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm text-gray-700 font-medium mb-2">💡 Possible reasons:</p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>API rate limit reached (too many requests)</li>
                        <li>API quota exceeded for today</li>
                        <li>Temporary service unavailability</li>
                      </ul>
                      <p className="text-sm text-gray-700 font-medium mt-3">
                        ✅ Your text was extracted successfully and saved. You can try re-uploading later for AI analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Extracted Text</h3>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 max-h-96 overflow-y-auto border-2 border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {uploadResult.note.extracted_text}
                  </p>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
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
