CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pword TEXT NOT NULL
);

CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  team_owner INT,
  FOREIGN KEY (team_owner) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE users_teams (
  user_id INT,
  team_id INT, 
  team_role TEXT, 
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
)

SELECT ut.team_role
FROM users_teams ut
JOIN teams t ON ut.team_id = t.team_id
WHERE t.user_id = $1 AND ut.user_id = $1

CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  assigned_to INT,
  team_id INT NOT NULL,
  title TEXT,
  content TEXT,
  task_status TEXT NOT NULL DEFAULT 'To do'
    CHECK (task_status IN ('To do', 'In progress', 'Complete'))
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
  FOREIGN KEY (assigned_to) REFERENCES users(user_id)
)

CREATE TABLE tasks_teams (
  task_id INT,
  team_id INT,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, team_id)
)