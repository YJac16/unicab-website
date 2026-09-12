import React from "react";

export default function BottomSheet({ children, className = "" }) {
  return (
    <div className={`taxi-bottom-sheet ${className}`.trim()}>
      <div className="taxi-bottom-sheet-handle" aria-hidden="true" />
      {children}
    </div>
  );
}
