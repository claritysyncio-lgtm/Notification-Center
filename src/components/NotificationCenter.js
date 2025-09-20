import React, { useState, useEffect, useMemo, useCallback } from "react";
import { parseISO, format, differenceInCalendarDays } from "date-fns";
import { FaSyncAlt } from "react-icons/fa";
import axios from "axios";

const NotificationCenter = ({
  tasks = [],
  onRefresh = () => {},
  onMarkDone = () => {},
  courses = [],
  types = [],
  courseFilter = "all",
  setCourseFilter = () => {},
  typeFilter = "all",
  setTypeFilter = () => {},
}) => {
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    // A small delay to show the spinning icon, for better UX
    setTimeout(() => setIsRefreshing(false), 500);
  };


  // Normalize to local date-only to avoid timezone shifts (e.g., Notion UTC dates)
  const toLocalDateOnly = (input) => {
    if (!input) return null;
    try {
      if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}/.test(input)) {
        const [y, m, d] = input.slice(0, 10).split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      const parsed = parseISO(input);
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    } catch {
      return null;
    }
  };

  const getDateGroup = useCallback((dueDate) => {
    const date = toLocalDateOnly(dueDate);
    if (!date) {
      return { label: 'No Due Date', date: '', sortOrder: Number.MAX_SAFE_INTEGER };
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const daysDiff = differenceInCalendarDays(date, today);

    if (daysDiff < 0) {
      return { label: 'Overdue', date: '', sortOrder: -1 };
    }
    if (daysDiff === 0) {
      return { label: 'Due Today', date: '', sortOrder: 0 };
    }
    if (daysDiff === 1) {
      return { label: 'Due Tomorrow', date: '', sortOrder: 1 };
    }
    if (daysDiff >= 2 && daysDiff <= 7) {
      return { label: 'Due This Week', date: '', sortOrder: 2 };
    }
    return { label: `Due ${format(date, 'MMMM d')}`, date: format(date, 'MMMM d, yyyy'), sortOrder: daysDiff };
  }, []);
  const activeTasks = useMemo(() => tasks.filter(task => !task.done), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(task => task.done), [tasks]);

  const groupedTasks = useMemo(() => activeTasks.reduce((groups, task) => {
    if (!task.due) return groups;

    const dateGroup = getDateGroup(task.due);
    const key = dateGroup.label; // The label is now the unique key

    if (!groups[key]) {
      groups[key] = { ...dateGroup, tasks: [] };
    }
    groups[key].tasks.push(task);
    return groups;
  }, {}), [activeTasks, getDateGroup]);

  // Sort sections by date (ascending - most recent first)
  const sortedGroupEntries = useMemo(() => Object.entries(groupedTasks).sort(([, a], [, b]) => {
    return a.sortOrder - b.sortOrder;
  }), [groupedTasks]);

  const notionColorStyles = {
    green: { background: '#d7e6dd', color: '#2a533c' },
    purple: { background: '#e8dbf2', color: '#573d6b' },
    pink: { background: '#f4d8e4', color: '#68354e' },
    yellow: { background: '#f2e3b7', color: '#5d5237' },
    orange: { background: '#f3ddcb', color: '#795338' },
    brown: { background: '#ebdfd7', color: '#584437' }, // Notion's "brown" is your "Beige"
    gray: { background: '#e6e5e3', color: '#494846' },
    blue: { background: '#d3e4f1', color: '#264a72' },
    red: { background: '#f7d9d5', color: '#6d3531' },
    default: { background: '#e6e5e3', color: '#494846' } // Default for uncolored types
  };

  return (
    <div className="nc-main-container">
      <div className="nc-wrapper">
        <header className="nc-header">
          <div className="nc-title-row">
            <div className="nc-bell" aria-hidden="true">🔔</div>
            <h1 className="nc-title">Notification Center</h1>
          </div>
          <button
            onClick={handleRefresh}
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            title="Refresh tasks"
          >
            <FaSyncAlt />
          </button>
        </header>

        <div className="nc-filters">
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="course-filter"
          >
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="course-filter"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

      {tasks.length === 0 ? (
        <p>No tasks to display.</p>
      ) : (
        <>
          {sortedGroupEntries.map(([key, group]) => (
            <section key={key} className="nc-section">
              <h2 className="section-heading">
                {group.label} {group.date && <span className="section-date">({group.date})</span>}
              </h2>

              <div className="task-list">
                {group.tasks.map(task => (
                  <article
                    key={task.id}
                    className="task-card"
                    aria-label={task.name}
                  >
                    <div
                      className={`notion-checkbox ${task.done ? 'checked' : ''}`}
                      onClick={() => onMarkDone(task.id)}
                      role="button"
                      aria-pressed={task.done}
                      tabIndex={0}
                      style={{ flexShrink: 0 }}
                    >
                      {task.done && (
                        <svg viewBox="0 0 14 14" style={{ width: 12, height: 12, display: 'block', fill: 'white', flexShrink: 0 }}>
                          <polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.99933039 0 6.49933039"></polygon>
                        </svg>
                      )}
                    </div>

                    <div className="task-body">
                      <a 
                        href={task.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`task-title ${task.done ? 'completed' : ''}`}
                      >
                        {task.name}
                      </a>
                      <div className="task-meta">
                        <div className="meta-line due-line">
                          <span className="due-label">Due:</span>
                          <span className="due-date">{format(toLocalDateOnly(task.due), 'MMM d')}</span>
                          {task.countdown && (
                            <span className="countdown-badge">{task.countdown}</span>
                          )}
                        </div>
                        <div className="meta-line">
                          <span className="course-code">{task.courseName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="task-notes-section">
                      <div className="notes-divider"></div>
                      <div className="task-extra-properties">
                        {task.worth > 0 && (
                          <div className="extra-property">
                            <span className="worth-value">{task.worth}% of grade</span>
                          </div>
                        )}
                        <div className="extra-property">
                          <span
                            className="tag"
                            style={notionColorStyles[task.typeColor] || notionColorStyles.default}
                          >
                            {task.type}
                          </span>
                        </div>
                        {task.finalExamOver && (
                          <div className="extra-property">
                            <span className="final-exam-status">Final Exam Over</span>
                          </div>
                        )}
                      </div>
                      {/* Notes functionality is preserved in the component's history
                          and can be restored here if needed. */}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {completedTasks.length > 0 && (
            <section className="nc-section">
              <h2 
                className="section-heading collapsible"
                onClick={() => setIsCompletedOpen(!isCompletedOpen)}
              >
                <span>Completed</span>
                <svg viewBox="0 0 16 16" className={`chevron ${isCompletedOpen ? '' : 'closed'}`} style={{ width: 16, height: 16, fill: 'currentColor' }}>
                  <path d="M4.27 6.21a.75.75 0 0 1 1.06 0L8 8.94l2.67-2.73a.75.75 0 1 1 1.06 1.06l-3.2 3.25a.75.75 0 0 1-1.06 0L4.27 7.27a.75.75 0 0 1 0-1.06Z"></path>
                </svg>
              </h2>
              {isCompletedOpen && (
                <div className="task-list">
                  {completedTasks.map(task => (
                  <article
                    key={task.id}
                    className="task-card"
                    aria-label={task.name}
                  >
                    <div
                      className={`notion-checkbox ${task.done ? 'checked' : ''}`}
                      onClick={() => onMarkDone(task.id)}
                      role="button"
                      aria-pressed={task.done}
                      tabIndex={0}
                      style={{ flexShrink: 0 }}
                    >
                      {task.done && (
                        <svg viewBox="0 0 14 14" style={{ width: 12, height: 12, display: 'block', fill: 'white', flexShrink: 0 }}>
                          <polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.99933039 0 6.49933039"></polygon>
                        </svg>
                      )}
                    </div>

                    <div className="task-body">
                      <a 
                        href={task.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`task-title ${task.done ? 'completed' : ''}`}
                      >
                        {task.name}
                      </a>
                      <div className="task-meta">
                        {task.due && (
                          <div className="meta-line due-line" >
                            <span className="due-label">Completed:</span>
                            <span className="due-date">{task.due ? format(toLocalDateOnly(task.due), 'MMM d') : '-'}</span>
                          </div>
                        )}
                         <div className="meta-line" >
                           <span className="course-code">{task.courseName}</span>
                         </div>
                      </div>
                    </div>

                    <div className="task-notes-section">
                      <div className="notes-divider"></div>
                      <div className="task-extra-properties">
                        {task.worth > 0 && (
                          <div className="extra-property">
                            <span className="worth-value">{task.worth}% of grade</span>
                          </div>
                        )}
                        <div className="extra-property">
                          <span
                            className="tag"
                            style={notionColorStyles[task.typeColor] || notionColorStyles.default}
                          >
                            {task.type}
                          </span>
                        </div>
                        {task.finalExamOver && (
                          <div className="extra-property">
                            <span className="final-exam-status">Final Exam Over</span>
                          </div>
                        )}
                      </div>
                      {/* Notes functionality is preserved in the component's history
                          and can be restored here if needed. */}
                    </div>
                  </article>
                ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default NotificationCenter;
