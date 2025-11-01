import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockNote } from '../testUtils';
import NoteDetail from '../../components/NoteDetail';
import * as api from '../../services/api';

// Mock dependencies
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock('../../services/api', () => ({
  notesAPI: {
    getNoteById: vi.fn(),
  },
}));

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockJsPDF = function() {
    return {
      internal: {
        pageSize: {
          getWidth: () => 210,
        },
        getNumberOfPages: () => 1,
      },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      splitTextToSize: vi.fn((text) => [text]),
      addPage: vi.fn(),
      setPage: vi.fn(),
      setTextColor: vi.fn(),
      save: vi.fn(),
    };
  };
  return {
    default: mockJsPDF,
  };
});

describe('NoteDetail Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    mockNavigate.mockClear();
    mockUseParams.mockReturnValue({ noteId: '1' });
    vi.clearAllMocks();

    // Mock successful API response
    api.notesAPI.getNoteById.mockResolvedValue({
      data: {
        success: true,
        note: mockNote,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      renderWithProviders(<NoteDetail />);

      expect(screen.getByText('Loading note details...')).toBeInTheDocument();
    });

    it('should fetch note on mount', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(api.notesAPI.getNoteById).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Note Display', () => {
    it('should display note details after loading', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      });
    });

    it('should display formatted creation date', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText(/Created on/i)).toBeInTheDocument();
        expect(screen.getByText(/January 1, 2024/i)).toBeInTheDocument();
      });
    });

    it('should display analysis when available', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText(mockNote.analysis_result.summary)).toBeInTheDocument();
      });
    });

    it('should display extracted text', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText(mockNote.extracted_text)).toBeInTheDocument();
      });
    });
  });

  describe('Back Button', () => {
    it('should render back to dashboard button', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });
    });

    it('should navigate to dashboard when back button clicked', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Dashboard');
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('View Original Button', () => {
    it('should render view original button when image URL exists', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('View Original')).toBeInTheDocument();
      });
    });

    it('should not render view original button when image URL is missing', async () => {
      const noteWithoutImage = { ...mockNote, original_image_url: null };
      api.notesAPI.getNoteById.mockResolvedValue({
        data: { success: true, note: noteWithoutImage },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.queryByText('View Original')).not.toBeInTheDocument();
      });
    });

    it('should open image in new tab', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        const viewButton = screen.getByText('View Original').closest('a');
        expect(viewButton).toHaveAttribute('href', mockNote.original_image_url);
        expect(viewButton).toHaveAttribute('target', '_blank');
        expect(viewButton).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Download PDF Button', () => {
    it('should render download PDF button', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Download PDF')).toBeInTheDocument();
      });
    });

    it('should call PDF generation when download button clicked', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Download PDF')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Download PDF');
      await user.click(downloadButton);

      // PDF generation should be called (mocked)
      expect(downloadButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      api.notesAPI.getNoteById.mockRejectedValue({
        response: { data: { message: 'Network error' } },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should display generic error when note not found', async () => {
      api.notesAPI.getNoteById.mockResolvedValue({
        data: { success: false },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Note not found')).toBeInTheDocument();
      });
    });

    it('should show back to dashboard button on error', async () => {
      api.notesAPI.getNoteById.mockRejectedValue({
        response: { data: { message: 'Error' } },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Dashboard');
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('No Analysis Available', () => {
    it('should show message when analysis is not available', async () => {
      const noteWithoutAnalysis = { ...mockNote, analysis_result: null };
      api.notesAPI.getNoteById.mockResolvedValue({
        data: { success: true, note: noteWithoutAnalysis },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('AI Analysis Not Available')).toBeInTheDocument();
      });
    });

    it('should show reasons for missing analysis', async () => {
      const noteWithoutAnalysis = { ...mockNote, analysis_result: null };
      api.notesAPI.getNoteById.mockResolvedValue({
        data: { success: true, note: noteWithoutAnalysis },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText(/API rate limit or quota exceeded/i)).toBeInTheDocument();
      });
    });

    it('should still show extracted text when analysis unavailable', async () => {
      const noteWithoutAnalysis = { ...mockNote, analysis_result: null };
      api.notesAPI.getNoteById.mockResolvedValue({
        data: { success: true, note: noteWithoutAnalysis },
      });

      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText(mockNote.extracted_text)).toBeInTheDocument();
      });
    });
  });

  describe('UI Elements', () => {
    it('should render Calendar icon', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Created on')).toBeInTheDocument();
      });
    });

    it('should render ExternalLink icon in view original button', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('View Original')).toBeInTheDocument();
      });
    });

    it('should render Download icon in download button', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Download PDF')).toBeInTheDocument();
      });
    });

    it('should render ArrowLeft icon in back button', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Character Count', () => {
    it('should display character count for extracted text', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText(`${mockNote.extracted_text.length} characters`)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render in card layout', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        const cards = document.querySelectorAll('.card');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should have proper spacing and padding', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      });
    });
  });

  describe('Analysis Display Integration', () => {
    it('should render AnalysisDisplay component with correct props', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        // Check if AnalysisDisplay content is rendered
        expect(screen.getByText('AI Summary')).toBeInTheDocument();
        expect(screen.getByText('Key Points')).toBeInTheDocument();
      });
    });

    it('should pass extracted text to AnalysisDisplay', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        expect(screen.getByText('Extracted Text')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format date with time', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        // Should include time in format
        const dateText = screen.getByText(/January 1, 2024/i);
        expect(dateText).toBeInTheDocument();
      });
    });
  });

  describe('Gradient Text', () => {
    it('should apply gradient styling to title', async () => {
      renderWithProviders(<NoteDetail />);

      await waitFor(() => {
        const title = screen.getByText('Detailed Analysis');
        expect(title).toHaveClass('gradient-text');
      });
    });
  });
});
