CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pword TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT
);

CREATE TABLE teams (
  team_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  team_owner TEXT,
  FOREIGN KEY (team_owner) REFERENCES users(email)
)

CREATE TABLE users_teams (
  user_id INTEGER,
  team_id INTEGER, 
  team_role TEXT, 
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
)
