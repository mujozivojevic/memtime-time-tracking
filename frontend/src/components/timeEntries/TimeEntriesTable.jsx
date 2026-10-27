import { formatDateTime, formatDuration } from "../../utils/date.js";
import Message from "../ui/Message.jsx";
import Pagination from "../ui/Pagination.jsx";
import { useTimeEntries } from "./useTimeEntries.js";
import "./TimeEntries.css";

export default function TimeEntriesTable({ refreshKey, onEdit }) {
  const { entries, page, loading, error, hasNextPage, goToPage } =
    useTimeEntries(refreshKey);

  return (
    <>
      {error && <Message type="error">{error}</Message>}

      <div className="table-wrapper">
        <table className="entries-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task ID</th>
              <th>Comment</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th>Created at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.taskId}</td>
                <td className="comment-cell">{entry.comment}</td>
                <td>{formatDateTime(entry.start)}</td>
                <td>{formatDateTime(entry.end)}</td>
                <td>{formatDuration(entry.start, entry.end)}</td>
                <td>{formatDateTime(entry.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onEdit(entry)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && entries.length === 0 && (
        <p className="muted">
          {page === 0 ? "No time entries yet." : "No more entries."}
        </p>
      )}

      <Pagination
        page={page}
        loading={loading}
        hasNextPage={hasNextPage}
        onPageChange={goToPage}
      />
    </>
  );
}
