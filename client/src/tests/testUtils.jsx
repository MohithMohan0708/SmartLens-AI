import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Custom render function that includes common providers
export function renderWithProviders(ui, options = {}) {
  const {
    initialAuthState = { user: null, isAuthenticated: false },
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider value={initialAuthState}>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock user data
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
};

// Mock note data
export const mockNote = {
  id: 1,
  user_id: 1,
  title: 'Test Note',
  original_image_url: 'https://example.com/image.jpg',
  extracted_text: 'This is a test note with more than 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  analysis_result: {
    summary: 'This is a test summary of the note content.',
    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    keywords: ['test', 'note', 'example'],
    sentiment: 'positive',
    category: 'work',
    actionItems: ['Action 1', 'Action 2'],
    entities: {
      people: ['John Doe'],
      dates: ['2024-01-01'],
      places: ['Office'],
    },
  },
  created_at: '2024-01-01T00:00:00.000Z',
};

// Mock notes array
export const mockNotes = [
  mockNote,
  {
    ...mockNote,
    id: 2,
    title: 'Second Note',
    analysis_result: {
      ...mockNote.analysis_result,
      sentiment: 'negative',
      category: 'personal',
    },
  },
  {
    ...mockNote,
    id: 3,
    title: 'Third Note',
    analysis_result: {
      ...mockNote.analysis_result,
      sentiment: 'neutral',
      category: 'study',
    },
  },
];

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
