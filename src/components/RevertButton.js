import React from 'react';

const RevertButton = ({ onRevert }) => {
  const handleRevert = () => {
    if (window.confirm('Are you sure you want to revert to the previous Notion-style callout implementation?')) {
      onRevert();
    }
  };

  return (
    <button 
      onClick={handleRevert}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#ff4757',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
      }}
    >
      Revert Changes
    </button>
  );
};

export default RevertButton;
