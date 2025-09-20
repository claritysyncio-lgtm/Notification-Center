import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCenter from './NotificationCenter';

// Mock axios to avoid ES module issues
jest.mock('axios', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock date-fns to avoid ES module issues
jest.mock('date-fns', () => ({
  parseISO: jest.fn((date) => new Date(date)),
  format: jest.fn((date, formatStr) => date.toISOString().split('T')[0]),
  differenceInCalendarDays: jest.fn((date1, date2) => {
    const diffTime = Math.abs(date1 - date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }),
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaSyncAlt: () => <div data-testid="fa-sync-alt">Sync Icon</div>,
}));

describe('NotificationCenter', () => {
  const mockTasks = [
    {
      id: '1',
      name: 'Test Task 1',
      due: '2023-10-01',
      type: 'Assignment',
      typeColor: 'blue',
      courseName: 'Math',
      done: false,
      worth: 20,
      url: 'https://notion.so/task1',
    },
    {
      id: '2',
      name: 'Test Task 2',
      due: '2023-10-02',
      type: 'Quiz',
      typeColor: 'red',
      courseName: 'Science',
      done: true,
      worth: 10,
      url: 'https://notion.so/task2',
    },
  ];

  const mockProps = {
    tasks: mockTasks,
    courses: ['Math', 'Science'],
    types: ['Assignment', 'Quiz'],
    courseFilter: 'all',
    setCourseFilter: jest.fn(),
    typeFilter: 'all',
    setTypeFilter: jest.fn(),
    onRefresh: jest.fn(),
    onMarkDone: jest.fn(),
  };

  test('renders notification center with tasks', () => {
    render(<NotificationCenter {...mockProps} />);

    expect(screen.getByText('Notification Center')).toBeInTheDocument();
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  test('displays filters', () => {
    render(<NotificationCenter {...mockProps} />);

    expect(screen.getByDisplayValue('All Courses')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
  });

  test('calls onRefresh when refresh button is clicked', () => {
    render(<NotificationCenter {...mockProps} />);

    const refreshButton = screen.getByRole('button', { name: /Sync Icon/i });
    fireEvent.click(refreshButton);

    expect(mockProps.onRefresh).toHaveBeenCalled();
  });

  test('calls onMarkDone when task checkbox is clicked', () => {
    render(<NotificationCenter {...mockProps} />);

    const checkboxes = screen.getAllByRole('button').filter(btn => btn.className.includes('notion-checkbox'));
    fireEvent.click(checkboxes[0]);

    expect(mockProps.onMarkDone).toHaveBeenCalledWith('1');
  });

  test('displays completed tasks section', () => {
    render(<NotificationCenter {...mockProps} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('shows no tasks message when tasks array is empty', () => {
    render(<NotificationCenter {...mockProps} tasks={[]} />);

    expect(screen.getByText('No tasks to display.')).toBeInTheDocument();
  });
});
