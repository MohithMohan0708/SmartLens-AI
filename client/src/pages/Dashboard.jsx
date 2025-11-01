import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search, Filter, Grid, List, X, Calendar, Tag, FileText } from 'lucide-react';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/NoteCard';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { showSuccess, showError } from '../utils/toast';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null, noteTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const notesPerPage = 9;
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterAndSortNotes();
  }, [notes, searchQuery, filterSentiment, filterCategory, sortBy]);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAllNotes();
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
      showError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNotes = () => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.extracted_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.analysis_result?.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sentiment filter
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(note =>
        note.analysis_result?.sentiment?.toLowerCase() === filterSentiment.toLowerCase()
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(note =>
        note.analysis_result?.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
    setCurrentPage(1);
  };

  const handleDeleteNote = (noteId, noteTitle) => {
    setDeleteModal({ isOpen: true, noteId, noteTitle });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await notesAPI.deleteNote(deleteModal.noteId);
      setNotes(notes.filter(note => note.id !== deleteModal.noteId));
      showSuccess('Note deleted successfully');
      setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterSentiment('all');
    setFilterCategory('all');
    setSortBy('date-desc');
  };

  // Pagination
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Greeting Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">{getGreeting()}, {user?.name || 'User'}!</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You have {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your collection
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
        >
          <Plus className="h-5 w-5" />
          <span>Upload New Note</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title, content, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Sentiment Filter */}
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-primary-500 transition-all"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="mixed">Mixed</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-primary-500 transition-all"
          >
            <option value="all">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="study">Study</option>
            <option value="meeting">Meeting</option>
            <option value="todo">To-Do</option>
            <option value="notes">Notes</option>
            <option value="other">Other</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-primary-500 transition-all"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || filterSentiment !== 'all' || filterCategory !== 'all' || sortBy !== 'date-desc') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {filteredNotes.length !== notes.length && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {filteredNotes.length} of {notes.length} notes
          </p>
        )}
      </div>

      {/* Notes Display */}
      {error && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || filterSentiment !== 'all' || filterCategory !== 'all'
              ? 'No notes found'
              : 'No notes yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchQuery || filterSentiment !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Start by uploading your first handwritten note'}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Note</span>
          </button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNotes.map((note) => (
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Sentiment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentNotes.map((note) => (
                      <tr
                        key={note.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/note/${note.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {note.title || 'Untitled Note'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {note.extracted_text?.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {note.analysis_result?.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              note.analysis_result?.sentiment === 'positive'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : note.analysis_result?.sentiment === 'negative'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {note.analysis_result?.sentiment || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(note.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id, note.title);
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/upload')}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40"
        title="Quick upload"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Note?"
        message={`Are you sure you want to delete "${deleteModal.noteTitle || 'this note'}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
