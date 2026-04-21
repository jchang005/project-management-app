export default function TaskCard({ task, onComplete }) {
  return (
    <article className="task-card">
      <div className="task-card__header">
        <h4 className="task-card__title">{task.title}</h4>
        {onComplete && (
          <button
            type="button"
            className="task-card__complete"
            onClick={() => onComplete(task.task_id)}
            aria-label="Mark as complete"
          >
            <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      {task.content ? <p className="task-card__content">{task.content}</p> : null}
    </article>
  );
}
