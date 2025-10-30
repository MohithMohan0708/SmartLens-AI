import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, FileText, Sparkles } from 'lucide-react';
import { notesAPI } from '../services/api';
import NoteCard from '../components/NoteCard';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAllNotes();
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await notesAPI.deleteNote(noteId);
      if (response.data.success) {
        setNotes(notes.filter(note => note.id !== noteId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">My Notes</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} analyzed with AI
            </span>
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="mt-4 md:mt-0 btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Upload New Note</span>
        </button>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-gradient-to-r from-primary-100 to-blue-100 p-8 rounded-3xl">
              <FileText className="h-32 w-32 text-primary-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            No notes yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Upload your first handwritten note and let our AI analyze it for you
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Sparkles className="h-5 w-5" />
            <span>Upload Your First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
