import React, { useState } from "react";
import {
  DEMO_STEP_LABELS,
  completedDemoSteps,
  nextDemoStep,
  resetSample,
  useDemoSession,
} from "../../taxi/demoSession";

export default function DemoPresenter() {
  const session = useDemoSession();
  const [open, setOpen] = useState(false);
  const done = completedDemoSteps(session);
  const stepNo = Math.min(done + 1, 6);
  const label = DEMO_STEP_LABELS[Math.min(done, 5)];
  const finished = done >= 6;

  return (
    <div className={`taxi-presenter${open ? " is-open" : ""}`} role="region" aria-label="Sample story">
      <button
        type="button"
        className="taxi-presenter-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="taxi-presenter-mark" aria-hidden="true" />
        {open ? "Close" : done === 0 ? "Sample story" : `Step ${stepNo} of 6`}
      </button>
      {open && (
        <div className="taxi-presenter-bar">
          <p>Step {finished ? 6 : stepNo} of 6 · {label}</p>
          <div className="taxi-step-dots" aria-hidden="true">
            {DEMO_STEP_LABELS.map((step, index) => (
              <span key={step} className={index < done ? "is-on" : index === done ? "is-next" : ""} />
            ))}
          </div>
          <div className="taxi-presenter-actions">
            <button type="button" onClick={nextDemoStep} disabled={finished}>
              Next
            </button>
            <button type="button" onClick={resetSample}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
