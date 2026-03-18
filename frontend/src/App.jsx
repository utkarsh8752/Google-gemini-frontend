


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
    <div className="chat-container">

      {/* Header */}
      <div className="header">
        <h2>✨ Gemini AI Chat</h2>
        <p className="description">
          Ask anything and get instant AI-powered responses using Google Gemini.
          This chat app helps you learn, explore ideas, and solve problems quickly.
        </p>
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
        <button onClick={sendMessage}>➤</button>
      </div>

    </div>
  </div>
);

}

 export default App;