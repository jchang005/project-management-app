export default function TaskCard({ task }) {
  return (
    <article className="task-card">
      <h4 className="task-card__title">{task.title}</h4>
      {task.content ? <p className="task-card__content">{task.content}</p> : null}
    </article>
  );
}
