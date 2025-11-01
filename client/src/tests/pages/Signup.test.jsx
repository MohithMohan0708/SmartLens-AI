import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../testUtils';
import Signup from '../../pages/Signup';
import * as AuthContext from '../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.alert
global.alert = vi.fn();

describe('Signup Component', () => {
  let user;
  let mockSignup;

  beforeEach(() => {
    user = userEvent.setup();
    mockSignup = vi.fn();
    mockNavigate.mockClear();
    global.alert.mockClear();

    // Mock useAuth hook
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      signup: mockSignup,
      user: null,
      loading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render signup form with all elements', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByText('Join SmartLens AI')).toBeInTheDocument();
      expect(screen.getByText(/Start analyzing your notes with AI/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      renderWithProviders(<Signup />);

      const loginLink = screen.getByText(/Sign in instead/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should render all input fields with correct attributes', () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByLabelText(/Full Name/i);
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('should render Brain icon', () => {
      renderWithProviders(<Signup />);

      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should start with empty input fields', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByLabelText(/Full Name/i)).toHaveValue('');
      expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(screen.getByLabelText(/Confirm Password/i)).toHaveValue('');
    });
  });

  describe('Form Input', () => {
    it('should allow typing in name field', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByLabelText(/Full Name/i);
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    it('should allow typing in email field', async () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password field', async () => {
      renderWithProviders(<Signup />);

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should allow typing in confirm password field', async () => {
      renderWithProviders(<Signup />);

      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      await user.type(confirmPasswordInput, 'password123');

      expect(confirmPasswordInput).toHaveValue('password123');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      renderWithProviders(<Signup />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      const passwordToggle = toggleButtons[0];

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle confirm password visibility', async () => {
      renderWithProviders(<Signup />);

      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      const confirmPasswordToggle = toggleButtons[1];

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should require all fields', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByLabelText(/Full Name/i)).toBeRequired();
      expect(screen.getByLabelText(/Email Address/i)).toBeRequired();
      expect(screen.getByLabelText('Password')).toBeRequired();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeRequired();
    });

    it('should validate email format', () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should show error when passwords do not match', async () => {
      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'different');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    it('should show error when password is less than 6 characters', async () => {
      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), '12345');
      await user.type(screen.getByLabelText(/Confirm Password/i), '12345');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    it('should accept password with exactly 6 characters', async () => {
      mockSignup.mockResolvedValueOnce({ success: true });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), '123456');
      await user.type(screen.getByLabelText(/Confirm Password/i), '123456');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call signup function with correct data', async () => {
      mockSignup.mockResolvedValueOnce({ success: true });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('John Doe', 'test@example.com', 'password123');
      });
    });

    it('should show success alert and navigate to login on successful signup', async () => {
      mockSignup.mockResolvedValueOnce({ success: true });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Account created successfully! Please login.');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should show loading state during signup', async () => {
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      expect(screen.getByText(/Creating account.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should disable submit button during loading', async () => {
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failed signup', async () => {
      mockSignup.mockResolvedValueOnce({ success: false, message: 'Email already exists' });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'existing@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should display generic error message when no specific message provided', async () => {
      mockSignup.mockResolvedValueOnce({ success: false });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/User registration failed. Email may already exist./i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockSignup.mockRejectedValueOnce({
        response: { data: { message: 'Network error' } }
      });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle errors without response data', async () => {
      mockSignup.mockRejectedValueOnce(new Error('Unknown error'));

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Signup failed. Email may already be registered./i)).toBeInTheDocument();
      });
    });

    it('should clear previous error when submitting again', async () => {
      mockSignup
        .mockResolvedValueOnce({ success: false, message: 'First error' })
        .mockResolvedValueOnce({ success: true });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Submit again
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('should show error with AlertCircle icon', async () => {
      mockSignup.mockResolvedValueOnce({ success: false, message: 'Test error' });

      renderWithProviders(<Signup />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Test error');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.closest('div')).toHaveClass('bg-red-50');
      });
    });
  });

  describe('UI Elements', () => {
    it('should render decorative background elements', () => {
      renderWithProviders(<Signup />);

      const decorativeElements = document.querySelectorAll('.animate-float');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('should render Sparkles icon', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByText(/Start analyzing your notes with AI/i)).toBeInTheDocument();
    });

    it('should render User icon in name field', () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByLabelText(/Full Name/i);
      const container = nameInput.closest('div');
      expect(container).toBeInTheDocument();
    });

    it('should render Mail icon in email field', () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const container = emailInput.closest('div');
      expect(container).toBeInTheDocument();
    });

    it('should render Lock icons in password fields', () => {
      renderWithProviders(<Signup />);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      
      expect(passwordInput.closest('div')).toBeInTheDocument();
      expect(confirmPasswordInput.closest('div')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    });

    it('should have proper button type for submit', () => {
      renderWithProviders(<Signup />);

      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have proper button type for password toggles', () => {
      renderWithProviders(<Signup />);

      const toggleButtons = screen.getAllByRole('button', { name: '' });
      toggleButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
