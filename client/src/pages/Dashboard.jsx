import { useEffect, useState } from "react";
import api from "../api/axios";
import LogoutButton from "../components/LogoutButton";
import NewTaskModal from "../components/NewTaskModal";
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
    status: "complete",
    emptyMessage: "Completed tasks will show up here.",
  },
];

function normalizeStatus(status = "") {
  return status.toLowerCase().replace(/[\s_-]/g, "");
}

function getTasksForColumn(allTasks, columnStatus) {
  const normalizedColumnStatus = normalizeStatus(columnStatus);

  return allTasks.filter((task) => {
    const normalizedTaskStatus = normalizeStatus(task.task_status);

    return normalizedTaskStatus === normalizedColumnStatus;
  });
}

const INITIAL_TASK_FORM = {
  title: "",
  content: "",
  taskStatus: "To do",
  assignedTo: "",
};

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamsErrorMessage, setTeamsErrorMessage] = useState("");
  const [tasksErrorMessage, setTasksErrorMessage] = useState("");
  const [membersErrorMessage, setMembersErrorMessage] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskErrorMessage, setCreateTaskErrorMessage] = useState("");
  const [taskFormData, setTaskFormData] = useState(INITIAL_TASK_FORM);

  async function fetchTasks(teamId) {
    const response = await api.get("/tasks", {
      params: { teamId },
    });

    setTasks(response.data);
  }

  async function fetchTeamMembers(teamId) {
    const response = await api.get(`/team/${teamId}/members`);

    setTeamMembers(response.data);
  }

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get("/teams");
        setTeams(response.data);
        setTeamsErrorMessage("");
      } catch (err) {
        console.log("Error fetching teams", err);
        setTeamsErrorMessage("We couldn't load your teams right now.");
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setTasks([]);
      setTeamMembers([]);
      setTasksErrorMessage("");
      setMembersErrorMessage("");
      return;
    }

    setTasks([]);
    setTeamMembers([]);

    const fetchSelectedTeamData = async () => {
      try {
        await fetchTasks(selectedTeam.team_id);
        setTasksErrorMessage("");
      } catch (err) {
        console.log("Error fetching tasks", err);
        setTasksErrorMessage("We couldn't load tasks for this team right now.");
      }

      try {
        await fetchTeamMembers(selectedTeam.team_id);
        setMembersErrorMessage("");
      } catch (err) {
        console.log("Error fetching team members", err);
        setMembersErrorMessage("We couldn't load team members for assignment.");
      }
    };

    fetchSelectedTeamData();
  }, [selectedTeam]);

  function openTaskModal() {
    setTaskFormData(INITIAL_TASK_FORM);
    setCreateTaskErrorMessage("");
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false);
    setCreateTaskErrorMessage("");
  }

  function handleTaskFormChange(event) {
    const { name, value } = event.target;

    setTaskFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleCompleteTask(taskId) {
    if (!selectedTeam) return;

    setTasks((current) =>
      current.map((t) =>
        t.task_id === taskId ? { ...t, task_status: "complete" } : t,
      ),
    );

    try {
      await api.patch(
        `/team/${selectedTeam.team_id}/tasks/${taskId}/status`,
        { taskStatus: "complete" },
      );
    } catch (err) {
      console.log("Error completing task", err);
      fetchTasks(selectedTeam.team_id);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();

    if (!selectedTeam) {
      return;
    }

    setIsCreatingTask(true);
    setCreateTaskErrorMessage("");

    try {
      await api.post(`/team/${selectedTeam.team_id}/tasks`, {
        title: taskFormData.title,
        content: taskFormData.content,
        taskStatus: taskFormData.taskStatus,
        assignedTo: taskFormData.assignedTo
          ? Number(taskFormData.assignedTo)
          : null,
      });

      await fetchTasks(selectedTeam.team_id);
      setTaskFormData(INITIAL_TASK_FORM);
      setIsTaskModalOpen(false);
    } catch (err) {
      console.log("Error creating task", err);
      setCreateTaskErrorMessage(
        err.response?.data?.message ||
          "We couldn't create this task right now.",
      );
    } finally {
      setIsCreatingTask(false);
    }
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__top">
          <div>
            <h2 className="dashboard-sidebar__title">Dashboard</h2>
            <p className="dashboard-sidebar__team">
              {selectedTeam
                ? `Viewing ${selectedTeam.team_name}`
                : "Select a team to view tasks"}
            </p>
          </div>

          <div className="dashboard-team-list">
            <h3 className="dashboard-team-list__title">Your Teams</h3>

            {teamsErrorMessage ? (
              <p className="dashboard-team-list__message">
                {teamsErrorMessage}
              </p>
            ) : null}

            {!teamsErrorMessage && teams.length === 0 ? (
              <p className="dashboard-team-list__message">
                You are not part of any teams yet.
              </p>
            ) : null}

            {teams.map((team) => {
              const isSelected = selectedTeam?.team_id === team.team_id;

              return (
                <button
                  key={team.team_id}
                  type="button"
                  className={
                    isSelected
                      ? "dashboard-team-list__item dashboard-team-list__item--active"
                      : "dashboard-team-list__item"
                  }
                  onClick={() => setSelectedTeam(team)}
                >
                  <span>{team.team_name}</span>
                  <small>{team.team_role}</small>
                </button>
              );
            })}
          </div>
        </div>

        <LogoutButton />
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>My Tasks</h1>
            <p>
              {selectedTeam
                ? `Track what is next, what is moving, and what is done for ${selectedTeam.team_name}.`
                : "Select a team from the sidebar to view its task board."}
            </p>
          </div>

          <button
            type="button"
            className="dashboard-header__action"
            onClick={openTaskModal}
            disabled={!selectedTeam}
          >
            New Task
          </button>
        </header>

        {!selectedTeam ? (
          <main className="dashboard-empty-state">
            <h2>Select team to view tasks</h2>
            <p>
              Choose a team from the sidebar and the board will load its task
              columns here.
            </p>
          </main>
        ) : (
          <>
            {tasksErrorMessage ? (
              <p className="dashboard-feedback">{tasksErrorMessage}</p>
            ) : null}

            {membersErrorMessage ? (
              <p className="dashboard-feedback dashboard-feedback--muted">
                {membersErrorMessage}
              </p>
            ) : null}

            <main className="dashboard-board">
              {BOARD_COLUMNS.map((column) => {
                const columnTasks = getTasksForColumn(tasks, column.status);

                return (
                  <TaskColumn
                    key={column.status}
                    title={column.title}
                    tasks={columnTasks}
                    emptyMessage={column.emptyMessage}
                    onComplete={
                      column.status !== "complete"
                        ? handleCompleteTask
                        : undefined
                    }
                  />
                );
              })}
            </main>
          </>
        )}
      </div>

      <NewTaskModal
        isOpen={isTaskModalOpen}
        formData={taskFormData}
        members={teamMembers}
        isSubmitting={isCreatingTask}
        errorMessage={createTaskErrorMessage}
        onChange={handleTaskFormChange}
        onClose={closeTaskModal}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
