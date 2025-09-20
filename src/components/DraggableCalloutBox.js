// src/components/DraggableCalloutBox.js
import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import DraggableTaskRow from "./DraggableTaskRow";

const DraggableCalloutBox = ({
  title = "Tasks",
  tasks = [],
  onMarkDone = () => {},
  onUpdate,
  types,
  typeOptions,
  courseOptions,
  selectable,
  selectedIds = [],
  onToggleSelect = () => {},
  onReorderTasks = () => {},
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      onReorderTasks(reorderedTasks);
    }
  };

  return (
    <div className="notion-callout">
      <div className="notion-callout-title">{title}</div>
      <div>
        {tasks.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <DraggableTaskRow
                  key={task.id}
                  task={task}
                  onMarkDone={onMarkDone}
                  onUpdate={onUpdate}
                  types={types}
                  typeOptions={typeOptions}
                  courseOptions={courseOptions}
                  selectable={selectable}
                  selected={selectedIds.includes(task.id)}
                  onToggleSelect={() => onToggleSelect(task.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <i className="muted">No tasks</i>
        )}
      </div>
    </div>
  );
};

export default DraggableCalloutBox;
