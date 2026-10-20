import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import DemoBadge from "./DemoBadge";
import ThemeToggle from "./ThemeToggle";

export default function TaxiChrome({
  theme,
  onToggleTheme,
  backLabel = "Back to UNICAB home",
  action,
  children,
  scroll = false,
}) {
  return (
    <div className={`taxi-app ${scroll ? "taxi-scroll" : "taxi-lock"}`} data-theme={theme}>
      <a className="taxi-skip" href="#taxi-main">
        Skip to content
      </a>
      <header className="taxi-header">
        <Link to="/" className="taxi-icon-btn" aria-label={backLabel}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </Link>
        <Logo theme={theme} />
        <div className="taxi-header-tools">
          {action}
          <DemoBadge />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>
      <div id="taxi-main">{children}</div>
    </div>
  );
}
