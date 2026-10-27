export default function TreeStatus({ items, error, emptyText }) {
  if (error) {
    return <li className="tree-status tree-error">{error}</li>;
  }
  if (items === null) {
    return <li className="tree-status">Loading…</li>;
  }
  if (items.length === 0) {
    return <li className="tree-status">{emptyText}</li>;
  }
  return null;
}
