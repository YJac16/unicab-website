import React from "react";
import { resetSample, startDemo, stopDemo, useDemoSession } from "../../taxi/demoSession";

export default function DemoPresenter() {
  const session = useDemoSession();

  return (
    <div className="taxi-presenter" role="region" aria-label="Sample story">
      <p>
        <span className="taxi-demo-tag">Sample</span>
        {session.demoLabel}
      </p>
      <div>
        <button type="button" onClick={session.demoRunning ? stopDemo : startDemo}>
          {session.demoRunning ? "Stop" : "Run demo"}
        </button>
        <button type="button" onClick={resetSample}>
          Reset
        </button>
      </div>
    </div>
  );
}
