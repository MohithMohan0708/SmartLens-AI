import { Calendar, Eye, Sparkles, Trash2, FileImage, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoteCard = ({ note, onDelete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSentimentGradient = (sentiment) => {
    const gradients = {
      positive: 'from-green-500 to-emerald-500',
      negative: 'from-red-500 to-rose-500',
      neutral: 'from-blue-500 to-cyan-500',
      mixed: 'from-purple-500 to-pink-500',
    };
    return gradients[sentiment?.toLowerCase()] || gradients.neutral;
  };



  return (
    <>
      <div className="card p-6 flex flex-col hover:shadow-2xl transition-shadow duration-300 relative min-h-[450px]">
        {/* Header Section - Fixed Height */}
        <div className="flex items-start justify-between mb-4 h-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDate(note.created_at)}</span>
          </div>
          {note.analysis_result?.sentiment && (
            <span className={`px-3 py-1 bg-gradient-to-r ${getSentimentGradient(note.analysis_result.sentiment)} text-white rounded-full text-xs font-bold capitalize shadow-md`}>
              {note.analysis_result.sentiment}
            </span>
          )}
        </div>

        {/* Title Section */}
        {note.title && (
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
              {note.title}
            </h3>
          </div>
        )}

        {/* Extracted Text Section - Fixed Height */}
        <div className="mb-4 h-16">
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">
            {note.extracted_text}
          </p>
        </div>

        {/* AI Summary Section - Fixed Height */}
        <div className="mb-4 h-24">
          {note.analysis_result?.summary ? (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30 h-full">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">AI Summary</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 font-medium">
                {note.analysis_result.summary}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 h-full flex items-center">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">AI analysis unavailable</span>
              </div>
            </div>
          )}
        </div>

        {/* Keywords Section - Flexible Height */}
        <div className="mb-4 min-h-[2.5rem]">
          {note.analysis_result?.keywords && note.analysis_result.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-start">
              {note.analysis_result.keywords.slice(0, 4).map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/50 dark:to-blue-900/50 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold whitespace-nowrap"
                >
                  #{keyword}
                </span>
              ))}
              {note.analysis_result.keywords.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold whitespace-nowrap">
                  +{note.analysis_result.keywords.length - 4}
                </span>
              )}
            </div>
          ) : (
            <div className="h-10"></div>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-grow"></div>

        {/* Action Buttons Section - Fixed at Bottom */}
        <div className="mt-auto">
          <div className="flex gap-2">
            {note.original_image_url && (
              <a
                href={note.original_image_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors duration-200 flex items-center justify-center"
                title="View original document"
              >
                <FileImage className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id, note.title);
              }}
              className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-200 flex items-center justify-center"
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(`/note/${note.id}`)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Eye className="h-4 w-4" />
              <span>View Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteCard;
