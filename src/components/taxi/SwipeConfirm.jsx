import React, { useState } from "react";

export default function SwipeConfirm({ label, onConfirm }) {
  const [value, setValue] = useState(0);

  function change(next) {
    const amount = Number(next);
    if (amount >= 96) {
      setValue(0);
      onConfirm();
      return;
    }
    setValue(amount);
  }

  return (
    <label className="taxi-swipe">
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        aria-valuetext={value >= 96 ? label : "Slide to confirm"}
        onChange={(event) => change(event.target.value)}
        onPointerUp={() => {
          if (value < 96) setValue(0);
        }}
      />
    </label>
  );
}
