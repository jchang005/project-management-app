-- Drop tables in reverse order of dependencies to avoid constraint errors
DROP TABLE IF EXISTS tasks_teams;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users_teams;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pword TEXT NOT NULL
);

CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  team_owner INT,
  FOREIGN KEY (team_owner) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE users_teams (
  user_id INT,
  team_id INT, 
  team_role TEXT, 
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  assigned_to INT,
  team_id INT NOT NULL,
  title TEXT,
  content TEXT,
  task_status TEXT NOT NULL DEFAULT 'To do'
    CHECK (task_status IN ('To do', 'In progress', 'Complete')), 
  FOREIGN KEY (team_id) REFERENCES teams(team_id), 
  FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

