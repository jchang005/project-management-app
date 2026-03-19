import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pg from "pg";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

const { DATABASE_URL, JWT_SECRET, PORT } = process.env;

const db = new pg.Pool({
  connectionString: DATABASE_URL,
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // check if user already exists
  try {
    const result = await db.query(
      "SELECT user_id From users WHERE email = $1",
      [email],
    );
    console.log(result);
    if (result.rows.length >= 1) {
      // user exists
      return res.status(409).json({
        error: "USER_ALREADY_EXISTS",
        message: "Email is already registered to another account",
      });
    } else {
      // Hash password
      const hash = await bcrypt.hash(password, 10);
      try {
        await db.query("INSERT INTO users (email, pword) VALUES ($1, $2)", [
          email,
          hash,
        ]);
      } catch (err) {
        console.log(err);
        return res.status(500).json("Server Error: Could not register user.");
      }
      res.status(201).json({ message: "User created" });
      console.log("user created");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("i was hit");

  try {
    const result = await db.query(
      "SELECT user_id, pword FROM users WHERE email=$1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    var validPasssowrd = await bcrypt.compare(password, result.rows[0].pword);
    if (!validPasssowrd) {
      return res.status(400).json({
        error: "INCORRECT_PASSWORD",
        message: "Incorrect password",
      });
    }

    var token = jwt.sign({ userId: result.rows[0].user_id, email }, JWT_SECRET);
    return res.status(200).json({
      token: token,
      message: "Login successful",
    });
  } catch (err) {
    console.log("something went wrong");
    return res.status(500).json({
      error: err.message,
      message: "Something went wrong",
    });
  }
});

app.post("/createteam", authenticate, async (req, res) => {
  // check if team exists
  // insert into teams table
  // set user as owner of team

  const { userId } = req.user;
  const { teamName } = req.body;

  try {
    // Create team
    const insertTeam = await db.query(
      "INSERT INTO teams (team_name, team_owner) values ($1, $2) RETURNING team_id",
      [teamName, userId],
    );
    // Set "OWNER" role
    await db.query(
      "INSERT INTO users_teams (user_id, team_id, team_role) values ($1, $2, $3)",
      [userId, insertTeam.rows[0].team_id, "OWNER"],
    );

    return res.status(201).json({ message: "Team successfully created!" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Team already exists" });
    }
    console.log(err);
    return res.status(500).json({
      error: err.messasge,
      message: "Something went wrong",
    });
  }
});

app.post("/team/:teamId/tasks", authenticate, async (req, res) => {
  const { userId } = req.user;
  const { title, content, assignedTo } = req.body;
  const { teamId } = req.params;

  try {
    const checkRole = await db.query(
      `SELECT team_role 
      FROM users_teams 
      WHERE user_id=$1 
      AND team_id=$2`,
      [userId, teamId],
    );

    if (checkRole.rows.length === 0) {
      return res.status(403).json({
        error: "NOT_A_MEMBER",
        message: "You are not part of this team",
      });
    }

    const role = checkRole.rows[0].team_role;

    if (!["MEMBER", "OWNER"].includes(role)) {
      return res.status(403).json({
        error: "INSUFFICIENT_ROLE",
        message: "You do not have permission to create tasks",
      });
    }

    await db.query(
      `INSERT INTO tasks (title, content, assigned_to, team_id) 
      VALUES ($1, $2, $3, $4)`,
      [title, content, assignedTo, teamId],
    );

    return res.status(200).json({ message: "Task created" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
});

// get team: click into team tile, returns team members, tasks,
app.get("/team/:teamId", authenticate, async (req, res) => {
  const teamId = req.params.teamId;

  // store team members into a list
  // store tasks assigned to team
  try {
    const teamMembers = await db.query(
      "SELECT (user_id, team_role) FROM users_teams WHERE team_id=$1 ",
      [teamId],
    );
    const tasks = await db.query("SELECT* FROM tasks_teams WHERE team_id=$1", [
      teamId,
    ]);
    // do stuff with them later
  } catch (err) {
    console.log(err);
  }
});

app.get("/tasks", authenticate, async (req, res) => {
  const { teamId } = req.query;
  // get tasks from database corresponding to teamId
  try {
    const getTasks = await db.query(
      `SELECT *
      FROM tasks
      WHERE team_id=$1`,
      [teamId],
    );

    res.json(getTasks.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
});

app.post("/team/:teamId/members", authenticate, async (req, res) => {
  const { newMember, role } = req.body;
  const { teamId } = req.params;
  try {
    const alreadyMember = await db.query(
      `SELECT *
      FROM users_teams 
      WHERE user_id = $1`,
      [newMember],
    );

    if (alreadyMember.rowCount > 0) {
      return res.status(400).json({
        error: "DUPLICATE_USER_IN_TEAM",
        message: "user already in team",
      });
    }

    await db.query(
      `INSERT INTO users_teams (user_id, team_id, team_role)
      VALUES ($1, $2, $3)`,
      [newMember, teamId, role],
    );
  } catch (err) {
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
});

app.patch("/team/:teamId/tasks/taskId", authenticate, async (req, res) => {
  const { taskId, title, content, assigned_to, team_status } = req.body;
  const { teamId } = req.params;

  try {
    // 1. Ensure task exists and belongs to team
    const taskCheck = await db.query(
      `SELECT * FROM tasks WHERE task_id=$1 AND team_id=$2`,
      [taskId, teamId],
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        error: "TASK_NOT_FOUND",
        message: "Task does not exist in this team",
      });
    }

    await db.query(
      `
        UPDATE tasks
          SET title = $1,
           content = $2,
           assigned_to = $3,
           team_status = $4,
          WHERE task_id = $5
        `,
      [title, content, assigned_to, team_status, taskId],
    );

    return res.status(200).json({
      message: "task updated",
    });
  } catch (err) {
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("ure a wizard harry");

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
