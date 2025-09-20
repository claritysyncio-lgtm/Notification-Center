// src/components/DraggableTaskRow.js
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Display helpers
const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d)) return "-";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "-";
  }
};
const toInputDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d)) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Notion color palette matching the provided image
const notionColorMap = {
  gray: { text: "#64645F", bg: "#E9E9E7" },
  brown: { text: "#937264", bg: "#F1EEEC" },
  orange: { text: "#D9730D", bg: "#FAEBDD" },
  yellow: { text: "#DFAB01", bg: "#FBF3DB" },
  green: { text: "#4DAB9A", bg: "#DDEDEA" },
  blue: { text: "#529CCA", bg: "#DDEBF1" },
  purple: { text: "#9A6DD7", bg: "#EAE4F2" },
  pink: { text: "#E255A1", bg: "#F4DFEB" },
  red: { text: "#FF5A5A", bg: "#FFE2E2" },
  cyan: { text: "#529CCA", bg: "#DDEBF1" },
  default: { text: "#37352F", bg: "#F7F6F3" },
};

const DraggableTaskRow = ({
  task,
  onMarkDone,
  onUpdate = () => {},
  selectable = false,
  selected = false,
  onToggleSelect = () => {},
  types = [],
  typeOptions = [],
  courseOptions = [],
}) => {
  const [editName, setEditName] = useState(false);
  const [editDue, setEditDue] = useState(false);
  const [editType, setEditType] = useState(false);
  const [editCourse, setEditCourse] = useState(false);
  const [editWorth, setEditWorth] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Use dynamic color from typeOptions if available, fallback to static map
  const getTypeColors = () => {
    const typeOption = typeOptions.find(opt => opt.name === task.type);
    if (typeOption) {
      return notionColorMap[typeOption.color] || notionColorMap.default;
    }
    return notionColorMap[task.typeColor] || notionColorMap.default;
  };
  
  const colors = getTypeColors();
  const pillStyle = {
    backgroundColor: colors.bg,
    color: colors.text
  };

  // Commit helpers
  const commit = async (patch) => {
    await onUpdate(task.id, patch);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="notion-row"
      {...attributes}
    >
      {/* Drag handle (invisible but functional) */}
      <div {...listeners} style={{ cursor: isDragging ? 'grabbing' : 'grab', position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', zIndex: 1 }} />
      
      {/* Done checkbox (circular) - moved to far left */}
      <button
        onClick={() => onMarkDone(task.id)}
        title={task.done ? "Mark as not done" : "Mark as done"}
        className={`notion-checkbox ${task.done ? 'checked' : ''}`}
        style={{ position: 'relative', zIndex: 2 }}
      />

      {/* Name (inline edit) - now beside checkbox */}
      <div className="task-name-container" style={{ position: 'relative', zIndex: 2 }}>
        {editName ? (
          <input
            autoFocus
            type="text"
            defaultValue={task.name}
            onBlur={(e) => { setEditName(false); if (e.target.value !== task.name) commit({ name: e.target.value }); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.currentTarget.blur(); }
              if (e.key === 'Escape') { setEditName(false); }
            }}
            style={{ width: "100%" }}
          />
        ) : (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`notion-link ${task.done ? 'done' : ''}`}
            onDoubleClick={() => setEditName(true)}
            title="Double-click to rename"
          >
            {task.name}
          </a>
        )}
      </div>

      {/* Due date (inline date) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {editDue ? (
          <input
            autoFocus
            type="date"
            defaultValue={toInputDate(task.due)}
            onBlur={(e) => { setEditDue(false); const v = e.target.value; const iso = v ? new Date(v).toISOString() : null; if (iso !== task.due) commit({ due: iso }); }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditDue(false); }}
          />
        ) : (
          <span className="muted" onDoubleClick={() => setEditDue(true)} title="Double-click to edit due date">{formatDate(task.due)}</span>
        )}
      </div>

      {/* Course (inline select) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {editCourse ? (
          <select
            autoFocus
            defaultValue={task.courseId || ''}
            onBlur={(e) => { setEditCourse(false); const val = e.target.value || null; if (val !== task.courseId) commit({ courseId: val }); }}
            onChange={(e) => { const val = e.target.value || null; commit({ courseId: val }); }}
          >
            <option value="">No course</option>
            {courseOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        ) : (
          <span onDoubleClick={() => setEditCourse(true)} title="Double-click to change course">{task.courseName || "Unassigned course"}</span>
        )}
      </div>

      {/* Type (inline select, color-coded) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {editType ? (
          <select
            autoFocus
            defaultValue={task.type || ''}
            onBlur={(e) => { setEditType(false); const v = e.target.value || null; if (v !== task.type) commit({ type: v }); }}
            onChange={(e) => { const v = e.target.value || null; commit({ type: v }); }}
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        ) : (
          <span className="select-box" style={pillStyle} onDoubleClick={() => setEditType(true)} title="Double-click to change type">{task.type}</span>
        )}
      </div>

      {/* Worth % (inline number) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {editWorth ? (
          <input
            autoFocus
            type="number"
            min={0}
            max={100}
            step={1}
            defaultValue={typeof task.worth === 'number' ? task.worth : 0}
            onBlur={(e) => {
              setEditWorth(false);
              const raw = Number(e.target.value);
              if (Number.isNaN(raw)) return;
              const clamped = Math.max(0, Math.min(100, raw));
              const finalValue = Math.round(clamped);
              if (finalValue !== task.worth) commit({ worth: finalValue });
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditWorth(false); }}
            style={{ width: 72 }}
          />
        ) : (
          <span className="muted" onDoubleClick={() => setEditWorth(true)} title="Double-click to edit worth %">{typeof task.worth === 'number' ? `${task.worth}%` : "-"}</span>
        )}
      </div>

      {/* Optional selection for bulk actions */}
      {selectable && (
        <div style={{ position: 'relative', zIndex: 2 }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            title="Select for bulk actions"
            aria-label="Select task"
            style={{ marginLeft: 6 }}
          />
        </div>
      )}
    </div>
  );
};

export default DraggableTaskRow;
