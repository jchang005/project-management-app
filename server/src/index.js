import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pg from "pg";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { DATABASE_URL, JWT_SECRET, PORT } = process.env;

const db = new pg.Pool({
  connectionString: DATABASE_URL,
});

// db.query("SELECT 1")
//   .then(() => console.log("✅ Postgres connected"))
//   .catch((err) => console.error("❌ DB error", err));

app.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  // check if user already exists
  // Email is already registered to an account.
  try {
    const result = await db.query("SELECT id From users WHERE email = $1", [
      email,
    ]);
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
        await db.query(
          "INSERT INTO users (email, pword, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4, $5)",
          [email, hash, firstName, lastName, phoneNumber],
        );
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

  try {
    const result = await db.query(
      "SELECT id, pword FROM users WHERE email=$1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    var validPasssowrd = bcrypt.compare(password, result.rows[0].pword);
    if (!validPasssowrd) {
      return res.status(400).json({
        error: "INCORRECT_PASSWORD",
        message: "Incorrect password",
      });
    }

    var token = jwt.sign({ userId: result.rows[0].id, email }, JWT_SECRET);
    return res.status(200).json({
      token: token,
      message: "Login successful",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: "Something went wrong",
    });
  }
});

app.use(authenticate);

app.post("/createteam", async (req, res) => {
  // check if team exists
  // insert into teams table
  // set user as owner of team

  const { userId, email } = req.user;
  const { teamName } = req.body;

  try {
    const result = await db.query(
      "SELECT team_id FROM teams WHERE team_name=$1",
      [teamName],
    );

    if (result.rows.length === 0) {
      // Create team
      await db.query(
        "INSERT INTO teams (team_name, team_owner) values ($1, $2)",
        [teamName, email],
      );
      // Get teamID that was just generated
      const teamId = await db.query(
        "SELECT team_id FROM teams WHERE team_name = $1",
        [teamName],
      );
      // Set "OWNER" role
      await db.query(
        "INSERT INTO users_teams (user_id, team_id, team_role) values ($1, $2, $3)",
        [userId, teamId.rows[0].team_id, "OWNER"],
      );

      return res.status(200).json({ message: "Team successfully created!" });
    } else {
      return res.status(400).json({ message: "team already exists" });
    }
  } catch (err) {
    return res.status(500).json({
      error: err.messasge,
      message: "Something went wrong",
    });
  }
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader.startsWith("Bearer ")) {
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
