import { useState } from "react";
import TreeStatus from "./TreeStatus.jsx";

export default function Branch({ label, emptyText, load, renderItem }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  function toggle() {
    setOpen(!open);

    if (!open && items === null) {
      setError(null);
      load()
        .then(setItems)
        .catch((err) => setError(err.message));
    }
  }

  return (
    <li>
      <button
        type="button"
        className="tree-item"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="tree-arrow">{open ? "▾" : "▸"}</span>
        {label}
      </button>

      {open && (
        <ul className="tree-children">
          {items?.map(renderItem)}
          <TreeStatus items={items} error={error} emptyText={emptyText} />
        </ul>
      )}
    </li>
  );
}
