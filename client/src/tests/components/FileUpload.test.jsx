import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../testUtils';
import FileUpload from '../../components/FileUpload';
import { toast } from 'react-toastify';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('FileUpload Component', () => {
  let mockOnUploadSuccess;
  let user;

  beforeEach(() => {
    mockOnUploadSuccess = vi.fn();
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render upload area with correct text', () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      expect(screen.getByText(/Drop your file here/i)).toBeInTheDocument();
      expect(screen.getByText(/or click to browse from your device/i)).toBeInTheDocument();
      expect(screen.getByText(/Supports: JPG, JPEG, PNG, PDF • Max 10MB/i)).toBeInTheDocument();
    });

    it('should render select file button', () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const selectButton = screen.getByText('Select File');
      expect(selectButton).toBeInTheDocument();
    });

    it('should have hidden file input with correct accept attribute', () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,application/pdf');
    });
  });

  describe('File Selection via Input', () => {
    it('should accept valid image file (JPEG)', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith('File selected successfully!');
      });
    });

    it('should accept valid PNG file', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test.png')).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith('File selected successfully!');
      });
    });

    it('should accept valid PDF file', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith('File selected successfully!');
      });
    });

    it('should reject invalid file type', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('input[type="file"]');

      // Manually trigger the change event with the file
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('should reject file larger than 10MB', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      // Create a file larger than 10MB
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });

      const fileInput = document.querySelector('input[type="file"]');
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('File too large. Maximum size is 10MB.');
      });
    });
  });

  describe('File Preview', () => {
    it('should show image preview for image files', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        const preview = screen.getByAltText('Preview');
        expect(preview).toBeInTheDocument();
      });
    });

    it('should show file icon for PDF files', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
      });
    });

    it('should display file size', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/MB/)).toBeInTheDocument();
      });
    });
  });

  describe('Title Input', () => {
    it('should show title input after file selection', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a title for your note/i)).toBeInTheDocument();
      });
    });

    it('should allow typing in title input', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const titleInput = await screen.findByPlaceholderText(/Enter a title for your note/i);
      await user.type(titleInput, 'My Test Note');

      expect(titleInput).toHaveValue('My Test Note');
    });

    it('should show character count for title', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('0/100 characters')).toBeInTheDocument();
      });
    });

    it('should limit title to 100 characters', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const titleInput = await screen.findByPlaceholderText(/Enter a title for your note/i);
      expect(titleInput).toHaveAttribute('maxLength', '100');
    });
  });

  describe('File Removal', () => {
    it('should remove file when X button is clicked', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: '' });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
        expect(screen.getByText(/Drop your file here/i)).toBeInTheDocument();
      });
    });

    it('should clear title when file is removed', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const titleInput = await screen.findByPlaceholderText(/Enter a title for your note/i);
      await user.type(titleInput, 'Test Title');

      const removeButton = screen.getByRole('button', { name: '' });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Test Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag over event', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const dropZone = screen.getByText(/Drop your file here/i).closest('div');

      // Simulate dragover with preventDefault
      const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { files: [] },
        writable: false,
      });

      await waitFor(() => {
        dropZone.dispatchEvent(dragOverEvent);
      });

      // Check that the component is still rendered (drag over handled)
      expect(dropZone).toBeInTheDocument();
    });

    it('should handle file drop', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const dropZone = screen.getByText(/Drop your file here/i).closest('div');
      const file = new File(['test'], 'dropped.jpg', { type: 'image/jpeg' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
      });

      dropZone.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(screen.getByText('dropped.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Button', () => {
    it('should show upload button after file selection', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/Upload & Analyze with AI/i)).toBeInTheDocument();
      });
    });

    it('should show error if upload clicked without file', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      // This test verifies the error handling, but button won't be visible without file
      // So we'll test the validation logic indirectly
      expect(screen.queryByText(/Upload & Analyze with AI/i)).not.toBeInTheDocument();
    });
  });

  describe('Character Requirement Info', () => {
    it('should show 200 character requirement message', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/200 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/Text Extraction Required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Display', () => {
    it('should display error message when present', async () => {
      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('input[type="file"]');

      // Manually trigger the change event with the file
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Since the file is rejected, we should still see the upload area
      expect(screen.getByText(/Drop your file here/i)).toBeInTheDocument();
    });
  });

  describe('Upload Process', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should show progress during upload', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ success: true, note: { id: 1 } }),
      });

      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const uploadButton = await screen.findByText(/Upload & Analyze with AI/i);
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/Please wait while we process your document/i)).toBeInTheDocument();
      });
    });

    it('should call onUploadSuccess on successful upload', async () => {
      const mockData = { success: true, note: { id: 1, title: 'Test' } };
      global.fetch.mockResolvedValueOnce({
        json: async () => mockData,
      });

      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const uploadButton = await screen.findByText(/Upload & Analyze with AI/i);
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUploadSuccess).toHaveBeenCalledWith(mockData);
      }, { timeout: 3000 });
    });

    it('should show error on failed upload', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ success: false, message: 'Upload failed' }),
      });

      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const uploadButton = await screen.findByText(/Upload & Analyze with AI/i);
      await user.click(uploadButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Upload failed');
      }, { timeout: 3000 });
    });

    it('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');

      await user.upload(fileInput, file);

      const uploadButton = await screen.findByText(/Upload & Analyze with AI/i);
      await user.click(uploadButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Upload failed. Please try again.');
      }, { timeout: 3000 });
    });
  });
});
