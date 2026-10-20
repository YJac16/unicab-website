import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="taxi-theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 14.5A6.5 6.5 0 0 1 9 4.2 7 7 0 1 0 19.8 15a6.5 6.5 0 0 1-4.3-.5z" />
        </svg>
      )}
    </button>
  );
}
