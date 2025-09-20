// src/components/RecurringTasks.js
import React, { useState } from "react";
import { FaPlus, FaRedo } from "react-icons/fa";
import { addDays, addMonths, format } from "date-fns";

const RecurringTasks = ({ onCreateRecurringTask = () => {} }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    course: "",
    worth: "",
    frequency: "weekly", // daily, weekly, monthly
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    daysOfWeek: [], // for weekly: [1,2,3,4,5] = Mon-Fri
    dayOfMonth: 1, // for monthly
  });

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ];

  const daysOfWeek = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 0, label: "Sun" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    // Generate recurring task instances
    const tasks = generateRecurringTasks(formData);
    
    // Create each task
    tasks.forEach(task => {
      onCreateRecurringTask(task);
    });

    // Reset form
    setFormData({
      name: "",
      type: "",
      course: "",
      worth: "",
      frequency: "weekly",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      daysOfWeek: [],
      dayOfMonth: 1,
    });
    setShowForm(false);
  };

  const generateRecurringTasks = (data) => {
    const tasks = [];
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : addMonths(startDate, 6); // Default 6 months
    
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let shouldCreateTask = false;

      switch (data.frequency) {
        case "daily":
          shouldCreateTask = true;
          break;
        case "weekly":
          shouldCreateTask = data.daysOfWeek.includes(currentDate.getDay());
          break;
        case "monthly":
          shouldCreateTask = currentDate.getDate() === data.dayOfMonth;
          break;
        default:
          break;
      }

      if (shouldCreateTask) {
        tasks.push({
          ...data,
          due: format(currentDate, "yyyy-MM-dd"),
          isRecurring: true,
          recurringId: `recurring_${Date.now()}_${Math.random()}`,
        });
      }

      // Increment date
      currentDate = addDays(currentDate, 1);

      // Safety check to prevent infinite loops
      if (tasks.length > 365) break;
    }

    return tasks;
  };

  const toggleDayOfWeek = (day) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  return (
    <div className="recurring-tasks">
      <button 
        className="recurring-btn"
        onClick={() => setShowForm(!showForm)}
        title="Create recurring task"
      >
        <FaRedo /> Create Recurring Task
      </button>

      {showForm && (
        <div className="recurring-form-panel">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Task Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter task name..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Assignment, Quiz, etc."
                />
              </div>
              <div className="form-group">
                <label>Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                  placeholder="Course name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Worth %</label>
                <input
                  type="number"
                  value={formData.worth}
                  onChange={(e) => setFormData(prev => ({ ...prev, worth: e.target.value }))}
                  placeholder="0-100"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date (optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {formData.frequency === "weekly" && (
              <div className="form-group">
                <label>Days of Week</label>
                <div className="days-selector">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      className={`day-btn ${formData.daysOfWeek.includes(day.value) ? 'selected' : ''}`}
                      onClick={() => toggleDayOfWeek(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.frequency === "monthly" && (
              <div className="form-group">
                <label>Day of Month</label>
                <input
                  type="number"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                  min="1"
                  max="31"
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <FaPlus /> Create Recurring Tasks
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
