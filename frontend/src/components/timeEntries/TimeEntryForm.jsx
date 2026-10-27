import { useState } from "react";
import { createTimeEntry, updateTimeEntry } from "../../api.js";
import { formatDuration, toDateTimeLocal } from "../../utils/date.js";
import Field from "../ui/Field.jsx";
import Message from "../ui/Message.jsx";
import "./TimeEntries.css";

const startOfYear = `${new Date().getFullYear()}-01-01T00:00`;

function initialValues(entry) {
  if (entry) {
    return {
      comment: entry.comment,
      start: toDateTimeLocal(new Date(entry.start)),
      end: toDateTimeLocal(new Date(entry.end)),
    };
  }

  const end = new Date();
  const start = new Date(end.getTime() - 60 * 60 * 1000);

  return {
    comment: "",
    start: toDateTimeLocal(start),
    end: toDateTimeLocal(end),
  };
}

export default function TimeEntryForm({
  entry,
  taskId,
  taskName,
  onTaskIdChange,
  onSaved,
  onCancel,
}) {
  const [values, setValues] = useState(() => initialValues(entry));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      taskId: Number(taskId),
      comment: values.comment.trim(),
      start: new Date(values.start).toISOString(),
      end: new Date(values.end).toISOString(),
    };

    try {
      const saved = entry
        ? await updateTimeEntry(entry.id, payload)
        : await createTimeEntry(payload);

      setMessage({
        type: "success",
        text:
          `Time entry #${saved.id} ${entry ? "updated" : "created"}: ` +
          `${saved.comment} (${formatDuration(saved.start, saved.end)})`,
      });

      if (!entry) {
        setValues(initialValues(null));
      }
      onSaved();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <Field label="Task ID">
        <input
          type="number"
          min="1"
          required
          value={taskId}
          onChange={(event) => onTaskIdChange(event.target.value)}
        />
      </Field>

      <p className="task-hint muted">
        {taskName && `Selected: ${taskName}`}
        {!taskId && "Pick a task in the tree or type its ID"}
      </p>

      <Field label="Comment" wide>
        <textarea
          name="comment"
          rows="2"
          required
          maxLength={500}
          placeholder="What did you work on?"
          value={values.comment}
          onChange={handleChange}
        />
      </Field>

      <Field label="Start">
        <input
          type="datetime-local"
          name="start"
          required
          min={startOfYear}
          value={values.start}
          onChange={handleChange}
        />
      </Field>

      <Field label="End">
        <input
          type="datetime-local"
          name="end"
          required
          min={startOfYear}
          max={toDateTimeLocal(new Date())}
          value={values.end}
          onChange={handleChange}
        />
      </Field>

      <div className="form-actions">
        {entry && (
          <button type="button" className="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="button button-primary"
          disabled={saving}
        >
          {saving ? "Saving…" : entry ? "Save changes" : "Create entry"}
        </button>
      </div>

      {message && <Message type={message.type}>{message.text}</Message>}
    </form>
  );
}
