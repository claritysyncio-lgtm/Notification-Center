// src/components/CustomViews.js
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaCog } from "react-icons/fa";

const CustomViews = ({
  visibleSections = {
    overdue: true,
    today: true,
    tomorrow: true,
    next7: true,
    completed: true
  },
  onToggleSection = () => {},
  visibleTypes = [],
  allTypes = [],
  onToggleType = () => {},
}) => {
  const [showCustomizer, setShowCustomizer] = useState(false);

  const sectionLabels = {
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow", 
    next7: "Next 7 Days",
    completed: "Completed"
  };

  return (
    <div className="custom-views">
      <button 
        className="customize-btn"
        onClick={() => setShowCustomizer(!showCustomizer)}
        title="Customize view"
      >
        <FaCog /> Customize View
      </button>

      {showCustomizer && (
        <div className="customizer-panel">
          <div className="customizer-section">
            <h4>Sections</h4>
            {Object.entries(sectionLabels).map(([key, label]) => (
              <label key={key} className="customizer-item">
                <input
                  type="checkbox"
                  checked={visibleSections[key]}
                  onChange={() => onToggleSection(key)}
                />
                {visibleSections[key] ? <FaEye /> : <FaEyeSlash />}
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="customizer-section">
            <h4>Task Types</h4>
            <div className="type-controls">
              <button 
                className="pill"
                onClick={() => allTypes.forEach(type => {
                  if (!visibleTypes.includes(type)) onToggleType(type);
                })}
              >
                Show All
              </button>
              <button 
                className="pill"
                onClick={() => visibleTypes.forEach(type => onToggleType(type))}
              >
                Hide All
              </button>
            </div>
            {allTypes.map(type => (
              <label key={type} className="customizer-item">
                <input
                  type="checkbox"
                  checked={visibleTypes.includes(type)}
                  onChange={() => onToggleType(type)}
                />
                {visibleTypes.includes(type) ? <FaEye /> : <FaEyeSlash />}
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomViews;
