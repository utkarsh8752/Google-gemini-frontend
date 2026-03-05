


import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newChat = [...chat, { sender: "user", text: message }];
    setChat(newChat);
    setLoading(true);

    try {
      const res = await axios.post("https://google-gemini-backend.onrender.com/api/content", {
        question: message, // must match backend
      });

      setChat([
        ...newChat,
        { sender: "bot", text: res.data.answer },
      ]);
    } catch (error) {
      setChat([
        ...newChat,
        { sender: "bot", text: "❌ Error connecting to Gemini" },
      ]);
      console.error(error);
    } finally {
      setMessage("");
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h2>Gemini AI Chat</h2>

      <div className="chat-box">
        {chat.map((c, i) => (
          <div key={i} className={c.sender}>
            <b>{c.sender === "user" ? "You: " : "Gemini: "}</b>
            {c.text}
          </div>
        ))}

        {loading && <div className="bot">Gemini is typing...</div>}
      </div>

      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;

