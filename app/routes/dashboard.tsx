import React, { useEffect, useState } from "react";
import { Github, Plus, Folder, FileCode, LogOut, RefreshCw } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState("");

  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newFile, setNewFile] = useState({
    path: "",
    language: "",
    content: "",
  });

  // ---------- helpers ----------
  const fetchJSON = async (path, options = {}) => {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  };

  // ---------- load user + projects ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const me = await fetchJSON("/api/me");
        setUser(me.user);

        const p = await fetchJSON("/api/projects");
        setProjects(p.projects || []);

        // optional: auto-select first project
        if (p.projects && p.projects.length > 0) {
          setSelectedProjectId(p.projects[0].id);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load dashboard");
        // if not authenticated – send back to login
        if (err.message.includes("Not authenticated") || err.message.includes("Invalid token")) {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- load files when project changes ----------
  useEffect(() => {
    if (!selectedProjectId) {
      setFiles([]);
      return;
    }

    (async () => {
      try {
        setLoadingFiles(true);
        const data = await fetchJSON(`/api/projects/${selectedProjectId}/files`);
        setFiles(data.files || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load files");
      } finally {
        setLoadingFiles(false);
      }
    })();
  }, [selectedProjectId]);

  // ---------- load GitHub repos ----------
  const loadRepos = async () => {
    try {
      setLoadingRepos(true);
      setError("");
      const data = await fetchJSON("/api/github/repos");
      setRepos(data.repos || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch GitHub repos");
    } finally {
      setLoadingRepos(false);
    }
  };

  // ---------- actions ----------
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    try {
      const data = await fetchJSON("/api/projects", {
        method: "POST",
        body: JSON.stringify(newProject),
      });
      setProjects((prev) => [data.project, ...prev]);
      setNewProject({ name: "", description: "" });
      setSelectedProjectId(data.project.id);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create project");
    }
  };

  const handleAddFile = async () => {
    if (!selectedProjectId) {
      setError("Select a project first");
      return;
    }
    if (!newFile.path.trim() || !newFile.content.trim()) {
      setError("File path and content are required");
      return;
    }

    try {
      const data = await fetchJSON(`/api/projects/${selectedProjectId}/files`, {
        method: "POST",
        body: JSON.stringify(newFile),
      });
      setFiles((prev) => [...prev, data.file]);
      setNewFile({ path: "", language: "", content: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add file");
    }
  };

  const handleLogout = async () => {
    try {
      await fetchJSON("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  const handleConnectGithub = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-sm tracking-[0.3em] uppercase">Loading NEXUS Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* background blobs / grid same as login */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"></div>
      </div>

      {/* floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* main container */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* top bar */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative inline-block">
              <h1
                className="text-3xl md:text-4xl font-light text-white tracking-[0.3em] uppercase relative z-10"
                style={{ fontFamily: "Ubuntu, sans-serif" }}
              >
                NEXUS
              </h1>
              <div
                className="absolute inset-0 text-3xl md:text-4xl font-light text-white blur-xl opacity-40"
                style={{ fontFamily: "Ubuntu, sans-serif" }}
              >
                NEXUS
              </div>
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">
              Code Vault Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 backdrop-blur-xl">
                {user.github_avatar ? (
                  <img
                    src={user.github_avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-white/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="text-xs text-gray-300">
                  <div className="font-medium text-white">{user.name || user.username}</div>
                  <div className="text-[10px] text-gray-400">
                    {user.email}
                    {user.github_username && ` · @${user.github_username}`}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 border border-white/20 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>

        {/* error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-200 text-xs px-4 py-2 rounded-xl">
            {error}
          </div>
        )}

        {/* content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          {/* Left: Projects + new project */}
          <div className="md:col-span-1 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/15 rounded-2xl p-5 backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-white" />
                <h2
                  className="text-sm text-white tracking-[0.15em] uppercase"
                  style={{ fontFamily: "Ubuntu, sans-serif" }}
                >
                  Projects
                </h2>
              </div>
              <span className="text-[10px] text-gray-400">
                {projects.length} total
              </span>
            </div>

            {/* new project form */}
            <div className="mb-5 space-y-2">
              <input
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/60"
                placeholder="New project name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, name: e.target.value }))
                }
              />
              <textarea
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/60 resize-none"
                rows={2}
                placeholder="Short description (optional)"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, description: e.target.value }))
                }
              />
              <button
                onClick={handleCreateProject}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-100 text-black text-[11px] font-bold uppercase tracking-[0.15em] py-2.5 rounded-xl hover:shadow-xl hover:shadow-white/30 transition-all"
              >
                <Plus className="w-3 h-3" />
                Create Project
              </button>
            </div>

            {/* project list */}
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all ${
                    selectedProjectId === project.id
                      ? "bg-white text-black border-white shadow-md shadow-white/30"
                      : "bg-white/0 border-white/10 text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <div className="font-medium truncate">{project.name}</div>
                  {project.description && (
                    <div className="text-[10px] text-gray-400 truncate">
                      {project.description}
                    </div>
                  )}
                </button>
              ))}
              {projects.length === 0 && (
                <p className="text-[11px] text-gray-500">
                  No projects yet. Create your first NEXUS project above.
                </p>
              )}
            </div>
          </div>

          {/* Middle: Files + add file */}
          <div className="md:col-span-2 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/15 rounded-2xl p-5 backdrop-blur-xl shadow-2xl shadow-black/40 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-white" />
                <h2
                  className="text-sm text-white tracking-[0.15em] uppercase"
                  style={{ fontFamily: "Ubuntu, sans-serif" }}
                >
                  Project Files
                </h2>
              </div>
              <span className="text-[10px] text-gray-400">
                {selectedProjectId
                  ? loadingFiles
                    ? "Loading files..."
                    : `${files.length} files`
                  : "Select a project"}
              </span>
            </div>

            {/* add file form */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/60 md:col-span-2"
                placeholder="File path (e.g. src/App.tsx)"
                value={newFile.path}
                onChange={(e) =>
                  setNewFile((f) => ({ ...f, path: e.target.value }))
                }
              />
              <input
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/60"
                placeholder="Language (optional)"
                value={newFile.language}
                onChange={(e) =>
                  setNewFile((f) => ({ ...f, language: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <textarea
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-white/60 font-mono resize-none"
                rows={10}
                placeholder="Paste your code here..."
                value={newFile.content}
                onChange={(e) =>
                  setNewFile((f) => ({ ...f, content: e.target.value }))
                }
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddFile}
                  className="flex items-center gap-2 bg-white text-black text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-xl hover:shadow-xl hover:shadow-white/30 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Add File
                </button>
              </div>
            </div>

            {/* files list */}
            <div className="flex-1 overflow-y-auto border-t border-white/10 pt-3 space-y-2">
              {selectedProjectId ? (
                files.length > 0 ? (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
                            {file.path}
                          </span>
                          {file.language && (
                            <span className="text-[10px] text-gray-400 uppercase">
                              {file.language}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-500">
                          {new Date(file.created_at).toLocaleString()}
                        </span>
                      </div>
                      <pre className="max-h-40 overflow-y-auto text-[11px] font-mono text-gray-300 whitespace-pre-wrap">
                        {file.content}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-500">
                    No files yet. Paste some code and click “Add File”.
                  </p>
                )
              ) : (
                <p className="text-[11px] text-gray-500">
                  Select a project from the left to view its files.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* bottom: GitHub repos */}
        <div className="mt-6 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/15 rounded-2xl p-5 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Github className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2
                  className="text-sm text-white tracking-[0.15em] uppercase"
                  style={{ fontFamily: "Ubuntu, sans-serif" }}
                >
                  GitHub Repositories
                </h2>
                <p className="text-[11px] text-gray-400">
                  View and later import your GitHub projects into NEXUS.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!user?.github_username && (
                <button
                  onClick={handleConnectGithub}
                  className="flex items-center gap-2 text-xs bg-white/10 border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
                >
                  <Github className="w-3 h-3" />
                  Connect GitHub
                </button>
              )}
              <button
                onClick={loadRepos}
                className="flex items-center gap-2 text-xs bg-white text-black px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-white/40 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${loadingRepos ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-52 overflow-y-auto">
            {repos.length === 0 && !loadingRepos && (
              <p className="text-[11px] text-gray-500">
                No repos loaded yet. Click “Refresh” to fetch from GitHub.
              </p>
            )}
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-gray-200 hover:border-white/40 hover:bg-black/60 transition-all"
              >
                <div className="font-medium text-white truncate">{repo.fullName}</div>
                {repo.description && (
                  <div className="text-[11px] text-gray-400 line-clamp-2">
                    {repo.description}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500">
                  <span>{repo.language || "Unknown"}</span>
                  <span>{new Date(repo.pushedAt).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
      `}</style>
    </div>
  );
}
