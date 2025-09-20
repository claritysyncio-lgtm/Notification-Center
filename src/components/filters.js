// src/components/Filters.js
import React from "react";

const Filters = ({
  courses,
  types,
  courseFilter,
  typeFilter,
  setCourseFilter,
  setTypeFilter,
}) => {
  return (
    <div className="filters-container">
      <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
        <option value="all">All Courses</option>
        {courses.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
        <option value="all">All Types</option>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
};

export default Filters;