import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  const client = useMemo(
    () =>
      axios.create({
        baseURL: API_URL,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }),
    [token]
  );

  useEffect(() => {
    const checkSession = async () => {
      if (!token) return;
      try {
        const res = await client.get("/auth/me");
        setUser(res.data.user);
        await fetchHistory();
      } catch (err) {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      }
    };
    checkSession();
  }, [token, client]);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await client.get("/api/history");
      setChat(
        res.data.history.map((h) => ({
          sender: h.role === "user" ? "user" : "bot",
          text: h.text,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (mode) => {
    setAuthLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login" ? { email, password } : { name, email, password };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      const { token: newToken, user: profile } = res.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(profile);
      setName("");
      setEmail("");
      setPassword("");
      await fetchHistory();
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "Authentication failed";
      setError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setChat([]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!token) {
      setError("Please login to chat.");
      return;
    }

    const newChat = [...chat, { sender: "user", text: message }];
    setChat(newChat);
    setLoading(true);
    setError("");

    try {
      const res = await client.post("/api/chat", { message });
      setChat([...newChat, { sender: "bot", text: res.data.answer }]);
    } catch (error) {
      setChat([
        ...newChat,
        { sender: "bot", text: "✖ Error connecting to Gemini" },
      ]);
      console.error(error);
    } finally {
      setMessage("");
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <div className="app">
      <div className="chat-container">
        {/* Header */}
        <div className="header">
          <h2>✨ Gemini AI Chat</h2>
          <p className="description">
            Ask anything and get instant AI-powered responses using Google
            Gemini. This chat app helps you learn, explore ideas, and solve
            problems quickly.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={authMode === "login" ? "tab active" : "tab"}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "tab active" : "tab"}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>
            {authMode === "register" && (
              <input
                className="auth-input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="error">{error}</div>}
            <button
              className="auth-btn"
              onClick={() => handleAuth(authMode)}
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                  ? "Login to chat"
                  : "Create account"}
            </button>
          </div>
        ) : (
          <>
            <div className="top-row">
              <span className="user-chip">
                {user.name} · {user.email}
              </span>
              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <div className="history-row">
              <span className="history-label">Your saved chat</span>
              <div className="history-actions">
                <button className="ghost" onClick={fetchHistory}>
                  Refresh
                </button>
                <button
                  className="ghost danger"
                  onClick={async () => {
                    try {
                      await client.delete("/api/history");
                      setChat([]);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Chat Box */}
            <div className="chat-box">
              {chat.length === 0 && (
                <div className="welcome">
                  <p>👋 Welcome! Start a conversation with Gemini AI.</p>
                </div>
              )}

              {chat.map((c, i) => (
                <div key={i} className={`message ${c.sender}`}>
                  <span>{c.text}</span>
                </div>
              ))}

              {loading && (
                <div className="message bot typing">Gemini is typing...</div>
              )}
            </div>

            {/* Input */}
            <div className="input-area">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} disabled={loading}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
