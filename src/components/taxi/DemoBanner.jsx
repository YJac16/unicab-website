import React from "react";

export default function DemoBanner() {
  return (
    <div className="taxi-demo-banner" role="status" aria-live="polite">
      <span className="taxi-demo-banner-dot" aria-hidden="true" />
      Demo — simulated trips
    </div>
  );
}
