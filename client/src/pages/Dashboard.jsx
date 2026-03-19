import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const { teamId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks", {
          params: { teamId },
        });

        setTasks(response.data);
      } catch (err) {
        console.log("Error fetching tasks", err);
      }
    };

    fetchTasks();
  }, [teamId]);

  return (
    <div>
      <h2>Team {teamId} Dashboard</h2>

      {tasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        tasks.map((task) => (
          <div key={task.task_id}>
            <h3>{task.title}</h3>
            <p>{task.content}</p>
            <p>Status: {task.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
