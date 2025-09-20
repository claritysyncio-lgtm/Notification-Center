import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to avoid ES module issues
jest.mock('axios', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  differenceInDays: jest.fn(),
  parseISO: jest.fn(),
  differenceInCalendarDays: jest.fn((date1, date2) => {
    const diffTime = Math.abs(date1 - date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }),
  format: jest.fn((date, formatStr) => date.toISOString().split('T')[0]),
}));

test('renders notification center directly', () => {
  render(<App />);
  const notificationCenter = screen.getByText('Notification Center');
  expect(notificationCenter).toBeInTheDocument();
});
