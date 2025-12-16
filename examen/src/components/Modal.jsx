import React from "react";
import "./modal.css";

export default function Modal({ children, onClose }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <button className="modalClose" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
