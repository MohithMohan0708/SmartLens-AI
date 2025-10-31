import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };

    const handleFileSelect = (selectedFile) => {
        setError('');

        if (!selectedFile) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload JPG, JPEG, PNG, or PDF only.');
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            setError('File too large. Maximum size is 10MB.');
            return;
        }

        setFile(selectedFile);

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleFileInputChange = (e) => {
        const selectedFile = e.target.files[0];
        handleFileSelect(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError('');
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress stages
        const progressStages = [
            { progress: 15, message: '📤 Uploading file to server...' },
            { progress: 35, message: '🔍 Extracting text from document...' },
            { progress: 55, message: '🤖 AI analyzing content...' },
            { progress: 75, message: '✨ Generating insights...' },
            { progress: 90, message: '📝 Finalizing analysis...' },
        ];

        let currentStage = 0;
        const progressInterval = setInterval(() => {
            if (currentStage < progressStages.length) {
                setProgress(progressStages[currentStage].progress);
                setProgressMessage(progressStages[currentStage].message);
                currentStage++;
            }
        }, 800);

        try {
            const response = await fetch('/api/notes/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            clearInterval(progressInterval);

            if (data.success) {
                setProgress(100);
                setProgressMessage('✅ Analysis complete!');
                setTimeout(() => {
                    onUploadSuccess(data);
                    removeFile();
                    setProgress(0);
                    setProgressMessage('');
                }, 500);
            } else {
                setError(data.message || 'Upload failed');
                setProgress(0);
                setProgressMessage('');
            }
        } catch (err) {
            clearInterval(progressInterval);
            setError('Upload failed. Please try again.');
            console.error('Upload error:', err);
            setProgress(0);
            setProgressMessage('');
        } finally {
            setTimeout(() => {
                setUploading(false);
            }, 500);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white/50 dark:bg-gray-800/50'
                    }`}
            >
                {!file ? (
                    <>
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl blur-xl opacity-30"></div>
                            <div className="relative bg-gradient-to-r from-primary-600 to-blue-600 p-4 rounded-2xl">
                                <Upload className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-center space-x-2">
                            <span>Drop your file here</span>
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">or click to browse from your device</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Supports: JPG, JPEG, PNG, PDF • Max 10MB
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileInputChange}
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="btn-primary cursor-pointer inline-flex items-center space-x-2"
                        >
                            <Upload className="h-5 w-5" />
                            <span>Select File</span>
                        </label>
                    </>
                ) : (
                    <div className="space-y-6">
                        {preview ? (
                            <div className="relative inline-block">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-80 rounded-2xl shadow-2xl border-4 border-white"
                                />
                            </div>
                        ) : (
                            <div className="inline-block p-8 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-2xl">
                                <FileText className="h-20 w-20 text-primary-600 dark:text-primary-400" />
                            </div>
                        )}
                        <div className="flex items-center justify-center space-x-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
                            {file.type.startsWith('image/') ? (
                                <ImageIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            ) : (
                                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            )}
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1 truncate">{file.name}</span>
                            <button
                                onClick={removeFile}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}

            {file && !uploading && (
                <button
                    onClick={handleUpload}
                    className="w-full mt-8 btn-primary py-4 text-lg flex items-center justify-center space-x-3"
                >
                    <Sparkles className="h-6 w-6" />
                    <span>Upload & Analyze with AI</span>
                </button>
            )}

            {uploading && (
                <div className="mt-8 card p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{progressMessage}</span>
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
                    </div>

                    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 via-blue-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300 pt-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium">Please wait while we process your document...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
