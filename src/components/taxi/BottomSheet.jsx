import React from "react";

export default function BottomSheet({ children, className = "", labelledBy }) {
  return (
    <section className={`taxi-bottom-sheet ${className}`.trim()} aria-labelledby={labelledBy}>
      <div className="taxi-bottom-sheet-handle" aria-hidden="true" />
      <div className="taxi-sheet-body">{children}</div>
    </section>
  );
}
