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

db.query("SELECT 1")
  .then(() => console.log("✅ Postgres connected"))
  .catch((err) => console.error("❌ DB error", err));

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
      "SELECT password_hash FROM users WHERE email=$1",
      [email],
    );
    if (result.rows.length >= 1) {
      var validPasssowrd = bcrypt.compare(
        password,
        result.rows[0].password_hash,
      );
      if (validPasssowrd) {
        var token = jwt.sign(email, JWT_SECRET, { expiresIn: "15m" });
        return res.status(200).json({
          token: token,
          message: "Login successful",
        });
      } else {
        return res.status(400).json({
          error: "INCORRECT_PASSWORD",
          message: "Incorrect password",
        });
      }
    } else {
      return res.status(400).json({
        error: "USER_NOT_FOUND",
        message: "User does not exist",
      });
    }
  } catch (err) {
    return res.status(400).json({
      error: "USER_NOT_FOUND",
      message: "User does not exist",
    });
  }
});

app.post("/teams/:teamId/projects", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "Not logged in" });
  }

  var user;

  try {
    const token = authHeader.split(" ")[1];
    user = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const teamId = req.params.teamId;

  const membership = await db.query(
    `
    SELECT role
    FROM team_members
    WHERE team_id = $1 AND user_id = $2
    `,
    [teamId, user.userId],
  );
  if (membership.rows.length === 0) {
    return res.status(403).json({ error: "Not a team member" });
  }

  const role = membership.rows[0].role;
  if (role !== "OWNER" && role !== "MEMBER") {
    return res.status(403).json({ error: "Not allowed" });
  }

  // finally, create the project
  const project = await db.query(
    `
    INSERT INTO projects (team_id, name)
    VALUES ($1, $2)
    RETURNING *
    `,
    [teamId, req.body.name],
  );

  res.status(201).json(project.rows[0]);
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
