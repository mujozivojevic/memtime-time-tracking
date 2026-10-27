import { useEffect, useState } from "react";
import { getClientProjects, getClients, getProjectTasks } from "../../api.js";
import Branch from "./Branch.jsx";
import TreeStatus from "./TreeStatus.jsx";
import "./ClientTree.css";

export default function ClientTree({ onSelectTask }) {
  const [clients, setClients] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <ul className="tree">
      {clients?.map((client) => (
        <Branch
          key={client.id}
          label={client.name}
          emptyText="No projects"
          load={() => getClientProjects(client.id)}
          renderItem={(project) => (
            <Branch
              key={project.id}
              label={project.name}
              emptyText="No tasks"
              load={() => getProjectTasks(project.id)}
              renderItem={(task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="tree-item"
                    onClick={() => onSelectTask(task)}
                  >
                    {task.name}
                  </button>
                </li>
              )}
            />
          )}
        />
      ))}
      <TreeStatus items={clients} error={error} emptyText="No clients found" />
    </ul>
  );
}
