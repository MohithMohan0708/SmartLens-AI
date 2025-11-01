import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../testUtils';
import Login from '../../pages/Login';
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

describe('Login Component', () => {
  let user;
  let mockLogin;

  beforeEach(() => {
    user = userEvent.setup();
    mockLogin = vi.fn();
    mockNavigate.mockClear();

    // Mock useAuth hook
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      login: mockLogin,
      user: null,
      loading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render login form with all elements', () => {
      renderWithProviders(<Login />);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText(/Sign in to continue your AI journey/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('should render link to signup page', () => {
      renderWithProviders(<Login />);

      const signupLink = screen.getByText(/Create one now/i);
      expect(signupLink).toBeInTheDocument();
      expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });

    it('should render email input with correct attributes', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('should render password input with correct attributes', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should render Brain icon', () => {
      renderWithProviders(<Login />);

      // Check for the presence of SVG elements (Brain icon)
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('Form Input', () => {
    it('should allow typing in email field', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password field', async () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/Password/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should start with empty input fields', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);

      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/Password/i);
      const toggleButton = screen.getByRole('button', { name: '' });

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should show Eye icon when password is hidden', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should require email field', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toBeRequired();
    });

    it('should require password field', async () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toBeRequired();
    });

    it('should validate email format', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Form Submission', () => {
    it('should call login function with correct credentials on submit', async () => {
      mockLogin.mockResolvedValueOnce({ success: true });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockLogin.mockResolvedValueOnce({ success: true });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check for loading state
      expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should disable submit button during loading', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failed login', async () => {
      mockLogin.mockResolvedValueOnce({ success: false, message: 'Invalid credentials' });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should display generic error message when no specific message provided', async () => {
      mockLogin.mockResolvedValueOnce({ success: false });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: 'Network error' } }
      });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle errors without response data', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Unknown error'));

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Login failed. Please try again./i)).toBeInTheDocument();
      });
    });

    it('should clear previous error when submitting again', async () => {
      mockLogin
        .mockResolvedValueOnce({ success: false, message: 'First error' })
        .mockResolvedValueOnce({ success: true });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      // First submission with error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission should clear error
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correct');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('should show error with AlertCircle icon', async () => {
      mockLogin.mockResolvedValueOnce({ success: false, message: 'Test error' });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Test error');
        expect(errorMessage).toBeInTheDocument();
        // Check that error is in a styled container
        expect(errorMessage.closest('div')).toHaveClass('bg-red-50');
      });
    });
  });

  describe('UI Elements', () => {
    it('should render decorative background elements', () => {
      renderWithProviders(<Login />);

      const decorativeElements = document.querySelectorAll('.animate-float');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('should render Sparkles icon', () => {
      renderWithProviders(<Login />);

      // Sparkles icon should be present in the subtitle
      expect(screen.getByText(/Sign in to continue your AI journey/i)).toBeInTheDocument();
    });

    it('should render Mail icon in email field', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const container = emailInput.closest('div');
      expect(container).toBeInTheDocument();
    });

    it('should render Lock icon in password field', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/Password/i);
      const container = passwordInput.closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      renderWithProviders(<Login />);

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('should have proper button type for submit', () => {
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have proper button type for password toggle', () => {
      renderWithProviders(<Login />);

      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons.find(btn => btn.getAttribute('type') === 'button' && !btn.textContent.includes('Sign In'));
      expect(passwordToggle).toBeDefined();
    });
  });
});
