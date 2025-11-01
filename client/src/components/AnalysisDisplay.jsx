import { FileText, Lightbulb, Tag, Heart, Sparkles, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { showSuccess } from '../utils/toast';

const AnalysisDisplay = ({ analysis, extractedText, showDownload = false, onDownload }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showSuccess(`${label} copied to clipboard!`);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!analysis) {
        return (
            <div className="card p-8 text-center">
                <div className="inline-block p-4 bg-gray-100 rounded-2xl mb-4">
                    <Sparkles className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No analysis available</p>
            </div>
        );
    }

    const getSentimentColor = (sentiment) => {
        const colors = {
            positive: 'from-green-500 to-emerald-500',
            negative: 'from-red-500 to-rose-500',
            neutral: 'from-blue-500 to-cyan-500',
            mixed: 'from-purple-500 to-pink-500',
        };
        return colors[sentiment?.toLowerCase()] || colors.neutral;
    };

    const getSentimentBg = (sentiment) => {
        const colors = {
            positive: 'bg-green-50 border-green-200',
            negative: 'bg-red-50 border-red-200',
            neutral: 'bg-blue-50 border-blue-200',
            mixed: 'bg-purple-50 border-purple-200',
        };
        return colors[sentiment?.toLowerCase()] || colors.neutral;
    };

    return (
        <div className="space-y-6">
            {extractedText && (
                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Extracted Text</h3>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 max-h-64 overflow-y-auto border-2 border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{extractedText}</p>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                            {extractedText.length} characters
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                            <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Summary</h3>
                    </div>
                    <button
                        onClick={() => copyToClipboard(analysis.summary, 'Summary')}
                        className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                        title="Copy summary"
                    >
                        {copied ? (
                            <Check className="h-5 w-5 text-green-600" />
                        ) : (
                            <Copy className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
                        )}
                    </button>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{analysis.summary}</p>
            </div>

            <div className="card p-6">
                <div className="flex items-center space-x-3 mb-5">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Key Points</h3>
                </div>
                <ul className="space-y-3">
                    {analysis.keyPoints?.map((point, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                            </span>
                            <span className="text-gray-800 font-medium">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                            <Tag className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Keywords</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {analysis.keywords?.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl text-sm font-semibold border border-purple-200 hover:scale-105 transition-transform"
                            >
                                #{keyword}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Sentiment</h3>
                    </div>
                    <div className="flex items-center justify-center h-24">
                        <div className={`relative inline-block`}>
                            <div className={`absolute inset-0 bg-gradient-to-r ${getSentimentColor(analysis.sentiment)} rounded-2xl blur-xl opacity-50`}></div>
                            <div className={`relative px-8 py-4 rounded-2xl border-2 ${getSentimentBg(analysis.sentiment)}`}>
                                <span className={`font-bold text-2xl capitalize bg-gradient-to-r ${getSentimentColor(analysis.sentiment)} bg-clip-text text-transparent`}>
                                    {analysis.sentiment}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDisplay;
