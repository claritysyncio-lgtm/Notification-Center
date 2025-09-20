// src/components/Header.js
import React from "react";
import { FaSyncAlt } from "react-icons/fa";

const Header = ({ badgeCount = 0, onRefresh = () => {} }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      marginBottom: "16px",
      fontSize: "24px"
    }}>
      <button onClick={onRefresh} className="icon-btn" title="Refresh" aria-label="Refresh">
        <FaSyncAlt />
      </button>
    </div>
  );
};

export default Header;
