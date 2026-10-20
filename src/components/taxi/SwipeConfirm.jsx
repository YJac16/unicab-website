import React, { useRef, useState } from "react";

export default function SwipeConfirm({ label, confirmLabel, onConfirm }) {
  const trackRef = useRef(null);
  const drag = useRef(null);
  const [offset, setOffset] = useState(0);

  function confirm() {
    setOffset(0);
    onConfirm();
  }

  function maxOffset() {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.clientWidth - 56);
  }

  function pointerDown(event) {
    if (event.target.closest(".taxi-swipe-fallback")) return;
    drag.current = { x: event.clientX, start: offset };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (!drag.current) return;
    const next = drag.current.start + event.clientX - drag.current.x;
    setOffset(Math.min(maxOffset(), Math.max(0, next)));
  }

  function pointerUp() {
    if (!drag.current) return;
    if (offset >= maxOffset() - 6) confirm();
    else setOffset(0);
    drag.current = null;
  }

  return (
    <div className="taxi-swipe">
      <div
        className="taxi-swipe-track"
        ref={trackRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <span className="taxi-swipe-label">{label}</span>
        <span className="taxi-swipe-hint" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="taxi-swipe-thumb" style={{ transform: `translateX(${offset}px)` }} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </div>
      <button type="button" className="taxi-swipe-fallback" onClick={confirm}>
        {confirmLabel}
      </button>
    </div>
  );
}
