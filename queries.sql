CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pword TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT
);