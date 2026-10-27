import { useRef, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Panel from "./components/layout/Panel.jsx";
import ClientTree from "./components/tree/ClientTree.jsx";
import TimeEntryForm from "./components/timeEntries/TimeEntryForm.jsx";
import TimeEntriesTable from "./components/timeEntries/TimeEntriesTable.jsx";
import "./App.css";

export default function App() {
  const [task, setTask] = useState({ id: "", name: "" });
  const [editingEntry, setEditingEntry] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const formRef = useRef(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSelectTask(selected) {
    setTask({ id: String(selected.id), name: selected.name });
    scrollToForm();
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setTask({ id: String(entry.taskId), name: "" });
    scrollToForm();
  }

  function handleSaved() {
    setRefreshKey((key) => key + 1);
  }

  return (
    <>
      <Header />

      <div className="app-layout">
        <Panel title="Clients" className="sidebar">
          <ClientTree onSelectTask={handleSelectTask} />
        </Panel>

        <main className="app-main">
          <Panel
            ref={formRef}
            title={
              editingEntry
                ? `Edit time entry #${editingEntry.id}`
                : "New time entry"
            }
          >
            <TimeEntryForm
              key={editingEntry ? editingEntry.id : "new"}
              entry={editingEntry}
              taskId={task.id}
              taskName={task.name}
              onTaskIdChange={(id) => setTask({ id, name: "" })}
              onSaved={handleSaved}
              onCancel={() => setEditingEntry(null)}
            />
          </Panel>

          <Panel title="Time entries" className="entries-panel">
            <TimeEntriesTable refreshKey={refreshKey} onEdit={handleEdit} />
          </Panel>
        </main>
      </div>
    </>
  );
}
