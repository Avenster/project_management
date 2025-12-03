import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import axios from "axios";

dotenv.config();

const app = express();

// ---------- CONFIG ----------
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ---------- HELPER: create JWT ----------
function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------- HELPER: auth middleware ----------
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ---------- LOCAL AUTH: SIGNUP ----------
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        email,
        name,
        password_hash,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    const token = createToken(data);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      })
      .json({ user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ---------- LOCAL AUTH: LOGIN ----------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Missing fields" });

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user || !user.password_hash) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: "Invalid username or password" });

    const token = createToken(user);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      })
      .json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------- LOGOUT ----------
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token").json({ ok: true });
});

// ---------- CURRENT USER ----------
app.get("/api/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, username, name, github_username, github_avatar")
    .eq("id", req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ user: data });
});

// ---------- GITHUB OAUTH STRATEGY ----------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["read:user", "user:email", "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const github_id = profile.id;
        const github_username = profile.username;
        const github_avatar = profile.photos?.[0]?.value || null;
        const email =
          profile.emails?.[0]?.value || `${github_username}@github.local`;

        // find existing user by github_id or email
        let { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("github_id", github_id)
          .single();

        if (!user) {
          // maybe they signed up locally first
          const { data: byEmail } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (byEmail) user = byEmail;
        }

        if (user) {
          // update github fields
          const { data: updated, error: updateErr } = await supabase
            .from("users")
            .update({
              github_id,
              github_username,
              github_avatar,
              github_access_token: accessToken,
            })
            .eq("id", user.id)
            .select()
            .single();

          if (updateErr) throw updateErr;
          return done(null, updated);
        } else {
          // create new user
          const { data: created, error: insertErr } = await supabase
            .from("users")
            .insert({
              email,
              username: github_username,
              name: profile.displayName || github_username,
              github_id,
              github_username,
              github_avatar,
              github_access_token: accessToken,
            })
            .select()
            .single();

          if (insertErr) throw insertErr;
          return done(null, created);
        }
      } catch (err) {
        console.error("GitHubStrategy error:", err);
        done(err, null);
      }
    }
  )
);

// ---------- GITHUB OAUTH ROUTES ----------
app.get(
  "/auth/github",
  passport.authenticate("github", { session: false })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/auth/failure" }),
  (req, res) => {
    const user = req.user;

    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    // redirect back to frontend dashboard
    res.redirect(`${CLIENT_ORIGIN}/dashboard`);
  }
);

app.get("/auth/failure", (req, res) => {
  res.status(401).send("GitHub auth failed");
});
// ---------- PROJECTS API ----------

// Create project
app.post("/api/projects", requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: "Project name is required" });

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        description: description || "",
        user_id: req.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ project: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// List projects for current user
app.get("/api/projects", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ projects: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ---------- FILES API ----------

// List files for a project
app.get("/api/projects/:projectId/files", requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projectErr || !project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ files: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Add file (paste code)
app.post("/api/projects/:projectId/files", requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path, language, content } = req.body;

    if (!path || !content) {
      return res.status(400).json({ error: "path and content are required" });
    }

    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projectErr || !project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        project_id: projectId,
        path,
        language: language || null,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ file: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add file" });
  }
});


// ---------- GITHUB REPOS API ----------
app.get("/api/github/repos", requireAuth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("github_access_token, github_username")
      .eq("id", req.user.id)
      .single();

    if (error || !user?.github_access_token) {
      return res.status(400).json({ error: "GitHub not connected for this user" });
    }

    const ghRes = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${user.github_access_token}`,
        Accept: "application/vnd.github+json",
      },
      params: {
        per_page: 100,
        sort: "updated",
      },
    });

    const repos = ghRes.data.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      description: r.description,
      language: r.language,
      url: r.html_url,
      defaultBranch: r.default_branch,
      pushedAt: r.pushed_at,
    }));

    res.json({ repos });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch GitHub repos" });
  }
});

// ---------- START ----------
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
