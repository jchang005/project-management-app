import TaskCard from "./TaskCard";

export default function TaskColumn({ title, tasks, emptyMessage, onComplete }) {
  return (
    <section className="dashboard-column">
      <div className="dashboard-column__header">
        <h3>{title}</h3>
        <span>{tasks.length}</span>
      </div>

      <div className="dashboard-column__body">
        {tasks.length === 0 ? (
          <p className="dashboard-column__empty">{emptyMessage}</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.task_id} task={task} onComplete={onComplete} />
          ))
        )}
      </div>
    </section>
  );
}
