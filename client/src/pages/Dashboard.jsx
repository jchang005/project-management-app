import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import LogoutButton from "../components/LogoutButton";
import TaskColumn from "../components/TaskColumn";
import "./dashboard.css";

const BOARD_COLUMNS = [
  {
    title: "To Do",
    status: "todo",
    emptyMessage: "Nothing queued up yet.",
  },
  {
    title: "In Progress",
    status: "inprogress",
    emptyMessage: "No tasks are being worked on right now.",
  },
  {
    title: "Completed",
    status: "completed",
    emptyMessage: "Completed tasks will show up here.",
  },
];

function normalizeStatus(status = "") {
  return status.toLowerCase().replace(/[\s_-]/g, "");
}

export default function Dashboard() {
  const { teamId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks", {
          params: { teamId },
        });

        setTasks(response.data);
        setErrorMessage("");
      } catch (err) {
        console.log("Error fetching tasks", err);
        setErrorMessage("We couldn't load tasks for this team right now.");
      }
    };

    fetchTasks();
  }, [teamId]);

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div>
          <h2 className="dashboard-sidebar__title">Dashboard</h2>
          <p className="dashboard-sidebar__team">Team {teamId}</p>
        </div>
        <LogoutButton />
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>My Tasks</h1>
            <p>Track what is next, what is moving, and what is done.</p>
          </div>
        </header>

        {errorMessage ? (
          <p className="dashboard-feedback">{errorMessage}</p>
        ) : null}

        <main className="dashboard-board">
          {BOARD_COLUMNS.map((column) => {
            const columnTasks = tasks.filter(
              (task) => normalizeStatus(task.status) === column.status,
            );

            return (
              <TaskColumn
                key={column.status}
                title={column.title}
                tasks={columnTasks}
                emptyMessage={column.emptyMessage}
              />
            );
          })}
        </main>
      </div>
    </div>
  );
}
