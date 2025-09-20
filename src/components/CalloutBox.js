// src/components/CalloutBox.js
import React from "react";
import TaskRow from "./TaskRow";

const CalloutBox = ({
  title = "Tasks",
  tasks = [],
  onMarkDone = () => {},
  // pass-through for TaskRow advanced features
  onUpdate,
  types,
  typeOptions,
  courseOptions,
  selectable,
  selectedIds = [],
  onToggleSelect = () => {},
}) => {
  return (
    <div className="notion-callout">
      <div className="notion-callout-title">{title}</div>
      <div className="notion-table">
        <div className="notion-header">
          <div className="header-cell">Done</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Due</div>
          <div className="header-cell">Course</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Worth</div>
          {selectable && <div className="header-cell">Select</div>}
        </div>
        {tasks.length ? (
          tasks.map((task) => {
            const courseName = task.courseName || 'Unassigned course';
            return (
              <TaskRow
                key={task.id}
                task={{...task, courseName}}
                onMarkDone={onMarkDone}
                onUpdate={onUpdate}
                types={types}
                typeOptions={typeOptions}
                courseOptions={courseOptions}
                selectable={selectable}
                selected={selectedIds.includes(task.id)}
                onToggleSelect={() => onToggleSelect(task.id)}
              />
            );
          })
        ) : (
          <div className="no-data-row">
            <i className="muted">No tasks</i>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalloutBox;
