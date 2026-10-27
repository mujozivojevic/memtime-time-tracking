export default function Pagination({
  page,
  loading,
  hasNextPage,
  onPageChange,
}) {
  return (
    <div className="pagination">
      <button
        type="button"
        className="button"
        disabled={page === 0 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span>{loading ? "Loading…" : `Page ${page + 1}`}</span>
      <button
        type="button"
        className="button"
        disabled={!hasNextPage || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
