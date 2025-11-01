import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockNote } from '../testUtils';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import * as toast from '../../utils/toast';

// Mock toast utilities
vi.mock('../../utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

describe('AnalysisDisplay Component', () => {
  let user;
  let mockWriteText;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Mock clipboard API
    mockWriteText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('No Analysis State', () => {
    it('should display message when no analysis is provided', () => {
      renderWithProviders(<AnalysisDisplay analysis={null} />);

      expect(screen.getByText('No analysis available')).toBeInTheDocument();
    });

    it('should show Sparkles icon when no analysis', () => {
      renderWithProviders(<AnalysisDisplay analysis={null} />);

      const sparklesIcon = document.querySelector('.text-gray-400');
      expect(sparklesIcon).toBeInTheDocument();
    });

    it('should not render any analysis sections when analysis is null', () => {
      renderWithProviders(<AnalysisDisplay analysis={null} />);

      expect(screen.queryByText('AI Summary')).not.toBeInTheDocument();
      expect(screen.queryByText('Key Points')).not.toBeInTheDocument();
      expect(screen.queryByText('Keywords')).not.toBeInTheDocument();
      expect(screen.queryByText('Sentiment')).not.toBeInTheDocument();
    });
  });

  describe('Extracted Text Display', () => {
    it('should display extracted text when provided', () => {
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result} 
          extractedText={mockNote.extracted_text}
        />
      );

      expect(screen.getByText('Extracted Text')).toBeInTheDocument();
      expect(screen.getByText(mockNote.extracted_text)).toBeInTheDocument();
    });

    it('should show character count for extracted text', () => {
      const text = 'Test text with some content';
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result} 
          extractedText={text}
        />
      );

      expect(screen.getByText(`${text.length} characters`)).toBeInTheDocument();
    });

    it('should not display extracted text section when not provided', () => {
      renderWithProviders(
        <AnalysisDisplay analysis={mockNote.analysis_result} />
      );

      expect(screen.queryByText('Extracted Text')).not.toBeInTheDocument();
    });

    it('should render extracted text in scrollable container', () => {
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result} 
          extractedText={mockNote.extracted_text}
        />
      );

      const textContainer = screen.getByText(mockNote.extracted_text).closest('div');
      expect(textContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('AI Summary Display', () => {
    it('should display AI summary', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('AI Summary')).toBeInTheDocument();
      expect(screen.getByText(mockNote.analysis_result.summary)).toBeInTheDocument();
    });

    it('should render Lightbulb icon for summary', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('AI Summary')).toBeInTheDocument();
    });

    it('should have copy button for summary', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const copyButton = screen.getByTitle('Copy summary');
      expect(copyButton).toBeInTheDocument();
    });

    it('should copy summary to clipboard when copy button clicked', async () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const copyButton = screen.getByTitle('Copy summary');
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(mockNote.analysis_result.summary);
      expect(toast.showSuccess).toHaveBeenCalledWith('Summary copied to clipboard!');
    });

    it('should show check icon after successful copy', async () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const copyButton = screen.getByTitle('Copy summary');
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByTitle('Copy summary').querySelector('.text-green-600')).toBeInTheDocument();
      });
    });

    it('should revert to copy icon after 2 seconds', async () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const copyButton = screen.getByTitle('Copy summary');
      await user.click(copyButton);

      // Verify check icon appears
      await waitFor(() => {
        expect(copyButton.querySelector('.text-green-600')).toBeInTheDocument();
      });

      // Wait for 2 seconds and verify it reverts back
      await waitFor(() => {
        const button = screen.getByTitle('Copy summary');
        expect(button.querySelector('.text-green-600')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Key Points Display', () => {
    it('should display all key points', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('Key Points')).toBeInTheDocument();
      
      mockNote.analysis_result.keyPoints.forEach((point) => {
        expect(screen.getByText(point)).toBeInTheDocument();
      });
    });

    it('should number key points correctly', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      mockNote.analysis_result.keyPoints.forEach((_, index) => {
        expect(screen.getByText((index + 1).toString())).toBeInTheDocument();
      });
    });

    it('should render key points with proper styling', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const firstPoint = screen.getByText(mockNote.analysis_result.keyPoints[0]);
      const container = firstPoint.closest('li');
      
      expect(container).toHaveClass('flex', 'items-start');
    });

    it('should handle empty key points array', () => {
      const analysisWithoutPoints = { ...mockNote.analysis_result, keyPoints: [] };
      renderWithProviders(<AnalysisDisplay analysis={analysisWithoutPoints} />);

      expect(screen.getByText('Key Points')).toBeInTheDocument();
      // Should not crash, just show empty list
    });
  });

  describe('Keywords Display', () => {
    it('should display all keywords', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('Keywords')).toBeInTheDocument();
      
      mockNote.analysis_result.keywords.forEach((keyword) => {
        expect(screen.getByText(`#${keyword}`)).toBeInTheDocument();
      });
    });

    it('should render keywords with hashtag prefix', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const firstKeyword = mockNote.analysis_result.keywords[0];
      expect(screen.getByText(`#${firstKeyword}`)).toBeInTheDocument();
    });

    it('should render Tag icon for keywords section', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('Keywords')).toBeInTheDocument();
    });

    it('should handle empty keywords array', () => {
      const analysisWithoutKeywords = { ...mockNote.analysis_result, keywords: [] };
      renderWithProviders(<AnalysisDisplay analysis={analysisWithoutKeywords} />);

      expect(screen.getByText('Keywords')).toBeInTheDocument();
    });

    it('should apply hover effect to keywords', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const firstKeyword = screen.getByText(`#${mockNote.analysis_result.keywords[0]}`);
      expect(firstKeyword).toHaveClass('hover:scale-105');
    });
  });

  describe('Sentiment Display', () => {
    it('should display sentiment', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('Sentiment')).toBeInTheDocument();
      expect(screen.getByText(mockNote.analysis_result.sentiment)).toBeInTheDocument();
    });

    it('should capitalize sentiment text', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const sentimentText = screen.getByText(mockNote.analysis_result.sentiment);
      expect(sentimentText).toHaveClass('capitalize');
    });

    it('should render Heart icon for sentiment section', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      expect(screen.getByText('Sentiment')).toBeInTheDocument();
    });

    it('should apply correct color for positive sentiment', () => {
      const positiveAnalysis = { ...mockNote.analysis_result, sentiment: 'positive' };
      renderWithProviders(<AnalysisDisplay analysis={positiveAnalysis} />);

      const sentimentText = screen.getByText('positive');
      expect(sentimentText).toBeInTheDocument();
    });

    it('should apply correct color for negative sentiment', () => {
      const negativeAnalysis = { ...mockNote.analysis_result, sentiment: 'negative' };
      renderWithProviders(<AnalysisDisplay analysis={negativeAnalysis} />);

      const sentimentText = screen.getByText('negative');
      expect(sentimentText).toBeInTheDocument();
    });

    it('should apply correct color for neutral sentiment', () => {
      const neutralAnalysis = { ...mockNote.analysis_result, sentiment: 'neutral' };
      renderWithProviders(<AnalysisDisplay analysis={neutralAnalysis} />);

      const sentimentText = screen.getByText('neutral');
      expect(sentimentText).toBeInTheDocument();
    });

    it('should apply correct color for mixed sentiment', () => {
      const mixedAnalysis = { ...mockNote.analysis_result, sentiment: 'mixed' };
      renderWithProviders(<AnalysisDisplay analysis={mixedAnalysis} />);

      const sentimentText = screen.getByText('mixed');
      expect(sentimentText).toBeInTheDocument();
    });

    it('should handle unknown sentiment gracefully', () => {
      const unknownAnalysis = { ...mockNote.analysis_result, sentiment: 'unknown' };
      renderWithProviders(<AnalysisDisplay analysis={unknownAnalysis} />);

      expect(screen.getByText('unknown')).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should render all sections when analysis is complete', () => {
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result}
          extractedText={mockNote.extracted_text}
        />
      );

      expect(screen.getByText('Extracted Text')).toBeInTheDocument();
      expect(screen.getByText('AI Summary')).toBeInTheDocument();
      expect(screen.getByText('Key Points')).toBeInTheDocument();
      expect(screen.getByText('Keywords')).toBeInTheDocument();
      expect(screen.getByText('Sentiment')).toBeInTheDocument();
    });

    it('should use grid layout for keywords and sentiment', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const keywordsSection = screen.getByText('Keywords').closest('.card');
      const sentimentSection = screen.getByText('Sentiment').closest('.card');

      expect(keywordsSection?.parentElement).toHaveClass('grid');
      expect(sentimentSection?.parentElement).toHaveClass('grid');
    });

    it('should render sections in correct order', () => {
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result}
          extractedText={mockNote.extracted_text}
        />
      );

      const sections = screen.getAllByRole('heading', { level: 3 });
      const sectionTexts = sections.map(s => s.textContent);

      expect(sectionTexts).toEqual([
        'Extracted Text',
        'AI Summary',
        'Key Points',
        'Keywords',
        'Sentiment'
      ]);
    });
  });

  describe('Icons and Visual Elements', () => {
    it('should render FileText icon for extracted text', () => {
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result}
          extractedText={mockNote.extracted_text}
        />
      );

      expect(screen.getByText('Extracted Text')).toBeInTheDocument();
    });

    it('should render gradient backgrounds for section headers', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const summaryHeader = screen.getByText('AI Summary').previousSibling;
      expect(summaryHeader).toHaveClass('bg-gradient-to-r');
    });

    it('should apply card styling to sections', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const summarySection = screen.getByText('AI Summary').closest('.card');
      expect(summarySection).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle clipboard write failure gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a new mock that rejects
      const failingWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: failingWriteText,
        },
        writable: true,
        configurable: true,
      });

      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const copyButton = screen.getByTitle('Copy summary');
      await user.click(copyButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      }, { timeout: 1000 });
      
      consoleError.mockRestore();
    });

    it('should handle missing optional fields in analysis', () => {
      const minimalAnalysis = {
        summary: 'Test summary',
      };

      renderWithProviders(<AnalysisDisplay analysis={minimalAnalysis} />);

      expect(screen.getByText('Test summary')).toBeInTheDocument();
      // Should not crash even with missing fields
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(
        <AnalysisDisplay 
          analysis={mockNote.analysis_result}
          extractedText={mockNote.extracted_text}
        />
      );

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible button for copy action', () => {
      renderWithProviders(<AnalysisDisplay analysis={mockNote.analysis_result} />);

      const copyButton = screen.getByTitle('Copy summary');
      expect(copyButton).toHaveAttribute('title', 'Copy summary');
    });
  });
});
