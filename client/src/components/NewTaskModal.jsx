const TASK_STATUS_OPTIONS = ["To do", "In progress", "Complete"];

export default function NewTaskModal({
  isOpen,
  formData,
  members,
  isSubmitting,
  errorMessage,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="task-modal" onClick={(event) => event.stopPropagation()}>
        <div className="task-modal__header">
          <div>
            <p className="task-modal__eyebrow">New Task</p>
            <h2 id="new-task-title">Create a task</h2>
          </div>
          <button
            type="button"
            className="task-modal__close"
            onClick={onClose}
            aria-label="Close new task modal"
          >
            x
          </button>
        </div>

        <form className="task-modal__form" onSubmit={onSubmit}>
          <div className="task-modal__field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
            />
          </div>

          <div className="task-modal__field">
            <label htmlFor="task-content">Content</label>
            <textarea
              id="task-content"
              name="content"
              value={formData.content}
              onChange={onChange}
              rows="4"
            />
          </div>

          <div className="task-modal__field">
            <label htmlFor="task-status">Task Status</label>
            <select
              id="task-status"
              name="taskStatus"
              value={formData.taskStatus}
              onChange={onChange}
              required
            >
              {TASK_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>

          <div className="task-modal__field">
            <label htmlFor="task-assigned-to">Assigned To</label>
            <select
              id="task-assigned-to"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={onChange}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.email}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <p className="task-modal__message task-modal__message--error">
              {errorMessage}
            </p>
          ) : null}

          <div className="task-modal__actions">
            <button
              type="button"
              className="task-modal__secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="task-modal__primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
