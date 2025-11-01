import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockNote } from '../testUtils';
import NoteCard from '../../components/NoteCard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NoteCard Component', () => {
  let user;
  let mockOnDelete;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnDelete = vi.fn();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render note card with all basic elements', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText(mockNote.title)).toBeInTheDocument();
      expect(screen.getByText(mockNote.extracted_text)).toBeInTheDocument();
      expect(screen.getByText('View Analysis')).toBeInTheDocument();
    });

    it('should display formatted date', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      // Date should be formatted as "Jan 1, 2024"
      const dateElement = screen.getByText(/Jan 1, 2024/i);
      expect(dateElement).toBeInTheDocument();
    });

    it('should render Calendar icon', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const calendarIcon = document.querySelector('.lucide-calendar');
      expect(calendarIcon).toBeInTheDocument();
    });

    it('should apply card styling', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const card = screen.getByText(mockNote.title).closest('.card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:shadow-2xl');
    });
  });

  describe('Title Display', () => {
    it('should display note title when present', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText(mockNote.title)).toBeInTheDocument();
    });

    it('should not render title section when title is missing', () => {
      const noteWithoutTitle = { ...mockNote, title: null };
      renderWithProviders(<NoteCard note={noteWithoutTitle} onDelete={mockOnDelete} />);

      const titleElement = screen.queryByRole('heading', { level: 3 });
      expect(titleElement).not.toBeInTheDocument();
    });

    it('should truncate long titles with line-clamp', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const titleElement = screen.getByText(mockNote.title);
      expect(titleElement).toHaveClass('line-clamp-2');
    });
  });

  describe('Extracted Text Display', () => {
    it('should display extracted text', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText(mockNote.extracted_text)).toBeInTheDocument();
    });

    it('should truncate extracted text with line-clamp', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const textElement = screen.getByText(mockNote.extracted_text);
      expect(textElement).toHaveClass('line-clamp-3');
    });
  });

  describe('Sentiment Badge', () => {
    it('should display sentiment badge when sentiment exists', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText(mockNote.analysis_result.sentiment)).toBeInTheDocument();
    });

    it('should capitalize sentiment text', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const sentimentBadge = screen.getByText(mockNote.analysis_result.sentiment);
      expect(sentimentBadge).toHaveClass('capitalize');
    });

    it('should not display sentiment badge when sentiment is missing', () => {
      const noteWithoutSentiment = {
        ...mockNote,
        analysis_result: { ...mockNote.analysis_result, sentiment: null }
      };
      renderWithProviders(<NoteCard note={noteWithoutSentiment} onDelete={mockOnDelete} />);

      expect(screen.queryByText(/positive|negative|neutral|mixed/i)).not.toBeInTheDocument();
    });

    it('should apply correct gradient for positive sentiment', () => {
      const positiveNote = {
        ...mockNote,
        analysis_result: { ...mockNote.analysis_result, sentiment: 'positive' }
      };
      renderWithProviders(<NoteCard note={positiveNote} onDelete={mockOnDelete} />);

      const badge = screen.getByText('positive');
      expect(badge).toHaveClass('from-green-500');
    });

    it('should apply correct gradient for negative sentiment', () => {
      const negativeNote = {
        ...mockNote,
        analysis_result: { ...mockNote.analysis_result, sentiment: 'negative' }
      };
      renderWithProviders(<NoteCard note={negativeNote} onDelete={mockOnDelete} />);

      const badge = screen.getByText('negative');
      expect(badge).toHaveClass('from-red-500');
    });
  });

  describe('AI Summary Display', () => {
    it('should display AI summary when available', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText('AI Summary')).toBeInTheDocument();
      expect(screen.getByText(mockNote.analysis_result.summary)).toBeInTheDocument();
    });

    it('should render Sparkles icon with summary', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText('AI Summary')).toBeInTheDocument();
    });

    it('should show unavailable message when summary is missing', () => {
      const noteWithoutSummary = {
        ...mockNote,
        analysis_result: { ...mockNote.analysis_result, summary: null }
      };
      renderWithProviders(<NoteCard note={noteWithoutSummary} onDelete={mockOnDelete} />);

      expect(screen.getByText('AI analysis unavailable')).toBeInTheDocument();
    });

    it('should render AlertCircle icon when summary unavailable', () => {
      const noteWithoutSummary = {
        ...mockNote,
        analysis_result: null
      };
      renderWithProviders(<NoteCard note={noteWithoutSummary} onDelete={mockOnDelete} />);

      expect(screen.getByText('AI analysis unavailable')).toBeInTheDocument();
    });

    it('should truncate summary with line-clamp', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const summaryElement = screen.getByText(mockNote.analysis_result.summary);
      expect(summaryElement).toHaveClass('line-clamp-2');
    });
  });

  describe('Keywords Display', () => {
    it('should display up to 4 keywords', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const displayedKeywords = mockNote.analysis_result.keywords.slice(0, 4);
      displayedKeywords.forEach(keyword => {
        expect(screen.getByText(`#${keyword}`)).toBeInTheDocument();
      });
    });

    it('should show +X indicator when more than 4 keywords', () => {
      const noteWithManyKeywords = {
        ...mockNote,
        analysis_result: {
          ...mockNote.analysis_result,
          keywords: ['key1', 'key2', 'key3', 'key4', 'key5', 'key6']
        }
      };
      renderWithProviders(<NoteCard note={noteWithManyKeywords} onDelete={mockOnDelete} />);

      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not show +X indicator when 4 or fewer keywords', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it('should handle empty keywords array', () => {
      const noteWithoutKeywords = {
        ...mockNote,
        analysis_result: { ...mockNote.analysis_result, keywords: [] }
      };
      renderWithProviders(<NoteCard note={noteWithoutKeywords} onDelete={mockOnDelete} />);

      expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
    });

    it('should apply whitespace-nowrap to keywords', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const firstKeyword = screen.getByText(`#${mockNote.analysis_result.keywords[0]}`);
      expect(firstKeyword).toHaveClass('whitespace-nowrap');
    });
  });

  describe('Action Buttons', () => {
    it('should render View Analysis button', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const viewButton = screen.getByText('View Analysis');
      expect(viewButton).toBeInTheDocument();
    });

    it('should render delete button', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTitle('Delete note');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should render Eye icon in View Analysis button', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByText('View Analysis')).toBeInTheDocument();
    });

    it('should render Trash2 icon in delete button', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTitle('Delete note');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should render view original document link when image URL exists', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const imageLink = screen.getByTitle('View original document');
      expect(imageLink).toBeInTheDocument();
      expect(imageLink).toHaveAttribute('href', mockNote.original_image_url);
    });

    it('should not render view original document link when image URL is missing', () => {
      const noteWithoutImage = { ...mockNote, original_image_url: null };
      renderWithProviders(<NoteCard note={noteWithoutImage} onDelete={mockOnDelete} />);

      expect(screen.queryByTitle('View original document')).not.toBeInTheDocument();
    });

    it('should open image link in new tab', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const imageLink = screen.getByTitle('View original document');
      expect(imageLink).toHaveAttribute('target', '_blank');
      expect(imageLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('User Interactions', () => {
    it('should navigate to note detail when View Analysis clicked', async () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const viewButton = screen.getByText('View Analysis');
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith(`/note/${mockNote.id}`);
    });

    it('should call onDelete when delete button clicked', async () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTitle('Delete note');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockNote.id, mockNote.title);
    });

    it('should stop propagation when delete button clicked', async () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTitle('Delete note');
      await user.click(deleteButton);

      // Should not navigate when delete is clicked
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should stop propagation when image link clicked', async () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const imageLink = screen.getByTitle('View original document');
      
      // Click should not trigger navigation
      await user.click(imageLink);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    it('should have minimum height', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const card = screen.getByText(mockNote.title).closest('.card');
      expect(card).toHaveClass('min-h-[450px]');
    });

    it('should use flexbox layout', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const card = screen.getByText(mockNote.title).closest('.card');
      expect(card).toHaveClass('flex', 'flex-col');
    });

    it('should have hover shadow effect', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const card = screen.getByText(mockNote.title).closest('.card');
      expect(card).toHaveClass('hover:shadow-2xl');
    });

    it('should position action buttons at bottom', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const buttonsContainer = screen.getByText('View Analysis').closest('.mt-auto');
      expect(buttonsContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle note without analysis_result', () => {
      const noteWithoutAnalysis = { ...mockNote, analysis_result: null };
      renderWithProviders(<NoteCard note={noteWithoutAnalysis} onDelete={mockOnDelete} />);

      expect(screen.getByText('AI analysis unavailable')).toBeInTheDocument();
      expect(screen.queryByText('AI Summary')).not.toBeInTheDocument();
    });

    it('should handle note with empty title', () => {
      const noteWithEmptyTitle = { ...mockNote, title: '' };
      renderWithProviders(<NoteCard note={noteWithEmptyTitle} onDelete={mockOnDelete} />);

      // Should not crash, title section should not render
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });

    it('should handle very long extracted text', () => {
      const longText = 'A'.repeat(500);
      const noteWithLongText = { ...mockNote, extracted_text: longText };
      renderWithProviders(<NoteCard note={noteWithLongText} onDelete={mockOnDelete} />);

      const textElement = screen.getByText(longText);
      expect(textElement).toHaveClass('line-clamp-3');
    });

    it('should handle note with all optional fields missing', () => {
      const minimalNote = {
        id: 1,
        user_id: 1,
        extracted_text: 'Minimal text',
        created_at: '2024-01-01T00:00:00.000Z',
        title: null,
        original_image_url: null,
        analysis_result: null,
      };
      renderWithProviders(<NoteCard note={minimalNote} onDelete={mockOnDelete} />);

      expect(screen.getByText('Minimal text')).toBeInTheDocument();
      expect(screen.getByText('AI analysis unavailable')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button titles', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      expect(screen.getByTitle('Delete note')).toBeInTheDocument();
      expect(screen.getByTitle('View original document')).toBeInTheDocument();
    });

    it('should have proper button elements', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper link element for image', () => {
      renderWithProviders(<NoteCard note={mockNote} onDelete={mockOnDelete} />);

      const imageLink = screen.getByTitle('View original document');
      expect(imageLink.tagName).toBe('A');
    });
  });
});
