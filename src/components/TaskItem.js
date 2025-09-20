import React from 'react';

// A map for Notion's color names to CSS-friendly classes
const typeColorMap = {
  default: 'gray',
  gray: 'gray',
  brown: 'brown',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  purple: 'purple',
  pink: 'pink',
  red: 'red',
};

const TaskItem = ({ task, courseName, onMarkDone }) => {
  const handleCheckboxClick = (e) => {
    e.preventDefault(); // Prevent navigation
    onMarkDone(task.id);
  };

  const pillColorClass = `select-box-${typeColorMap[task.typeColor] || 'gray'}`;

  return (
    <div className={`notion-row ${task.done ? 'done' : ''}`}>
      <div
        className={`notion-checkbox ${task.done ? 'checked' : ''}`}
        onClick={handleCheckboxClick}
        role="button"
        aria-pressed={task.done}
        tabIndex={0}
      >
        {task.done && (
          <svg viewBox="0 0 14 14" style={{ width: 12, height: 12, display: 'block', fill: 'white', flexShrink: 0 }}>
            <polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.99933039 0 6.49933039"></polygon>
          </svg>
        )}
      </div>
      <div className="task-name-container">
        <a href={task.url} target="_blank" rel="noopener noreferrer" className={`notion-link ${task.done ? 'done' : ''}`} style={{ fontWeight: 'bold' }}>
          {task.name}
        </a>
      </div>
      <div className="task-due-date muted">{task.countdown}</div>
      <div className="task-course muted">{courseName}</div>
      <div className={`pill select-box ${pillColorClass}`}>{task.type}</div>
      <div className="task-worth muted">{task.worth > 0 ? `${task.worth}%` : ''}</div>
    </div>
  );
};

export default TaskItem;