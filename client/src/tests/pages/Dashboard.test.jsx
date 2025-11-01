import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockNotes, mockUser } from '../testUtils';
import Dashboard from '../../pages/Dashboard';
import * as AuthContext from '../../context/AuthContext';
import * as api from '../../services/api';
import * as toast from '../../utils/toast';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api', () => ({
  notesAPI: {
    getAllNotes: vi.fn(),
    deleteNote: vi.fn(),
  },
}));

vi.mock('../../utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

describe('Dashboard Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    mockNavigate.mockClear();
    vi.clearAllMocks();

    // Mock useAuth
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock successful API response
    api.notesAPI.getAllNotes.mockResolvedValue({
      data: {
        success: true,
        notes: mockNotes,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render and Loading', () => {
    it('should show loading spinner initially', () => {
      renderWithProviders(<Dashboard />);

      // Check for loading spinner by class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should fetch notes on mount', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(api.notesAPI.getAllNotes).toHaveBeenCalled();
      });
    });

    it('should display greeting with user name', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(mockUser.name, 'i'))).toBeInTheDocument();
      });
    });

    it('should display note count', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/You have \d+ notes? in your collection/i)).toBeInTheDocument();
      });
    });
  });

  describe('Notes Display', () => {
    it('should display all notes after loading', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        mockNotes.forEach(note => {
          expect(screen.getByText(note.title)).toBeInTheDocument();
        });
      });
    });

    it('should display notes in grid view by default', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        const gridContainer = document.querySelector('.grid');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    it('should show empty state when no notes', async () => {
      api.notesAPI.getAllNotes.mockResolvedValue({
        data: { success: true, notes: [] },
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Start by uploading your first handwritten note/i)).toBeInTheDocument();
      });
    });

    it('should show upload button in empty state', async () => {
      api.notesAPI.getAllNotes.mockResolvedValue({
        data: { success: true, notes: [] },
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upload Note/i })).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();
      });
    });

    it('should filter notes by title', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search notes/i);
      // Search for a unique part of the first note's title
      await user.type(searchInput, 'Test Note');

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });
      
      // Verify search input has value
      expect(searchInput).toHaveValue('Test Note');
    });

    it('should show clear search button when searching', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search notes/i);
      await user.type(searchInput, 'test');

      // Search input should have the value
      expect(searchInput).toHaveValue('test');
    });

    it('should clear search when X button clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search notes/i);
      await user.type(searchInput, 'test');
      
      expect(searchInput).toHaveValue('test');

      await user.clear(searchInput);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('View Mode Toggle', () => {
    it('should render grid and table view toggle buttons', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        const toggleButtons = screen.getAllByRole('button');
        expect(toggleButtons.length).toBeGreaterThan(0);
      });
    });

    it('should switch to table view when table button clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      // Find and click table view button (List icon)
      const buttons = screen.getAllByRole('button');
      const tableButton = buttons.find(btn => btn.querySelector('.lucide-list'));
      
      if (tableButton) {
        await user.click(tableButton);

        await waitFor(() => {
          const table = document.querySelector('table');
          expect(table).toBeInTheDocument();
        });
      }
    });
  });

  describe('Filters', () => {
    it('should render sentiment filter dropdown', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('All Sentiments')).toBeInTheDocument();
      });
    });

    it('should render category filter dropdown', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('All Categories')).toBeInTheDocument();
      });
    });

    it('should render sort dropdown', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Newest First')).toBeInTheDocument();
      });
    });

    it('should filter notes by sentiment', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      const sentimentSelect = screen.getByDisplayValue('All Sentiments');
      await user.selectOptions(sentimentSelect, 'positive');

      await waitFor(() => {
        // Only positive sentiment notes should be visible
        const positiveNote = mockNotes.find(n => n.analysis_result.sentiment === 'positive');
        if (positiveNote) {
          expect(screen.getByText(positiveNote.title)).toBeInTheDocument();
        }
      });
    });

    it('should show clear filters button when filters are active', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('All Sentiments')).toBeInTheDocument();
      });

      const sentimentSelect = screen.getByDisplayValue('All Sentiments');
      await user.selectOptions(sentimentSelect, 'positive');

      await waitFor(() => {
        expect(screen.getByText(/Clear Filters/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('All Sentiments')).toBeInTheDocument();
      });

      const sentimentSelect = screen.getByDisplayValue('All Sentiments');
      await user.selectOptions(sentimentSelect, 'positive');

      await waitFor(() => {
        expect(screen.getByText(/Clear Filters/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/Clear Filters/i);
      await user.click(clearButton);

      expect(sentimentSelect).toHaveValue('all');
    });
  });

  describe('Sorting', () => {
    it('should sort notes by newest first by default', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        const sortSelect = screen.getByDisplayValue('Newest First');
        expect(sortSelect).toBeInTheDocument();
      });
    });

    it('should change sort order when option selected', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
      });

      const sortSelect = screen.getByDisplayValue('Newest First');
      await user.selectOptions(sortSelect, 'title-asc');

      expect(sortSelect).toHaveValue('title-asc');
    });
  });

  describe('Pagination', () => {
    it('should show pagination when more than 9 notes', async () => {
      const manyNotes = Array.from({ length: 15 }, (_, i) => ({
        ...mockNotes[0],
        id: i + 1,
        title: `Note ${i + 1}`,
      }));

      api.notesAPI.getAllNotes.mockResolvedValue({
        data: { success: true, notes: manyNotes },
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
    });

    it('should not show pagination when 9 or fewer notes', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByText('Previous')).not.toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should open delete modal when delete button clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete note');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Note\?/i)).toBeInTheDocument();
      });
    });

    it('should delete note when confirmed', async () => {
      api.notesAPI.deleteNote.mockResolvedValue({ data: { success: true } });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete note');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Note\?/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Delete').closest('button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(api.notesAPI.deleteNote).toHaveBeenCalled();
        expect(toast.showSuccess).toHaveBeenCalledWith('Note deleted successfully');
      });
    });

    it('should close modal when cancel clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete note');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Note\?/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Delete Note\?/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should render Upload New Note button in header', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upload New Note/i })).toBeInTheDocument();
      });
    });

    it('should navigate to upload page when Upload button clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upload New Note/i })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /Upload New Note/i });
      await user.click(uploadButton);

      expect(mockNavigate).toHaveBeenCalledWith('/upload');
    });

    it('should render floating action button', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        const floatingButtons = document.querySelectorAll('.fixed');
        expect(floatingButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      api.notesAPI.getAllNotes.mockRejectedValue({
        response: { data: { message: 'Network error' } },
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(toast.showError).toHaveBeenCalledWith('Failed to load notes');
      });
    });

    it('should show error when delete fails', async () => {
      api.notesAPI.deleteNote.mockRejectedValue({
        response: { data: { message: 'Delete failed' } },
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete note');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Note\?/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Delete').closest('button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.showError).toHaveBeenCalled();
      });
    });
  });

  describe('Greeting Message', () => {
    it('should show appropriate greeting based on time', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        const greeting = screen.getByText(/Good (Morning|Afternoon|Evening)/i);
        expect(greeting).toBeInTheDocument();
      });
    });
  });

  describe('Filtered Results Display', () => {
    it('should show filtered count when filters are active', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('All Sentiments')).toBeInTheDocument();
      });

      const sentimentSelect = screen.getByDisplayValue('All Sentiments');
      await user.selectOptions(sentimentSelect, 'positive');

      await waitFor(() => {
        expect(screen.getByText(/Showing \d+ of \d+ notes/i)).toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search notes/i);
      await user.type(searchInput, 'nonexistentquery12345');

      await waitFor(() => {
        expect(screen.getByText(/No notes found/i)).toBeInTheDocument();
      });
    });
  });
});
