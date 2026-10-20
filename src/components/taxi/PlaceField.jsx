import React, { useEffect, useId, useRef, useState } from "react";

export default function PlaceField({ id, label, places, value, onChange, excludeId }) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = places.find((place) => place.id === value);
  const needle = query.trim().toLowerCase();
  const results = places.filter((place) => {
    if (place.id === excludeId) return false;
    if (!needle) return true;
    return `${place.name} ${place.subtitle} ${place.area}`.toLowerCase().includes(needle);
  });

  useEffect(() => {
    function onPointer(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  return (
    <div className="taxi-field" ref={wrapRef}>
      <label htmlFor={id}>{label}</label>
      <div className="taxi-field-control">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search places"
          value={open ? query : selected?.name || ""}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
        />
        {selected && (
          <button
            type="button"
            className="taxi-clear"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => {
              onChange("");
              setQuery("");
              setOpen(true);
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="taxi-suggest">
          {results.length === 0 && (
            <li className="taxi-suggest-empty">No places match that search.</li>
          )}
          {results.map((place) => (
            <li key={place.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={place.id === value}
                className={place.id === value ? "is-selected" : ""}
                onClick={() => {
                  onChange(place.id);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="taxi-suggest-name">{place.name}</span>
                <span className="taxi-suggest-meta">
                  {place.subtitle} · {place.area}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
