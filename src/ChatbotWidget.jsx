import React, { useState, useRef, useEffect } from "react";
import { sendMessage } from "./chatbotApi"; // Import the API function
import "./styles.css";

const LANG_CODE_TO_TTS = {
  en: "en-IN",
  hi: "hi-IN",
  ml: "ml-IN",
  te: "te-IN",
  kn: "kn-IN",
  ta: "ta-IN",
};

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Effect to scroll to the bottom of the messages list when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN"; // Default language

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Automatically send the message after speech recognition
        handleSend(transcript); 
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const speak = (text, lang) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // Add user message to state
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInput("");

    try {
      // Use the imported sendMessage function
      const replies = await sendMessage(textToSend);

      if (Array.isArray(replies)) {
        // Create an array of new bot messages
        const newBotMessages = replies.map((r) => {
          const botText = r.text || JSON.stringify(r);
          const langFromRasa = (r.json_message && r.json_message.language) || "en";
          const ttsLang = LANG_CODE_TO_TTS[langFromRasa] || "en-IN";

          speak(botText, ttsLang);

          // Update recognition language for the next user input
          if (recognitionRef.current && recognitionRef.current.lang !== ttsLang) {
            recognitionRef.current.lang = ttsLang;
          }

          return { sender: "bot", text: botText };
        });

        // Update state once with all new messages
        setMessages((prev) => [...prev, ...newBotMessages]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Display an error message in the chat
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting." }]);
    }
  };

  const handleVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Could not start voice recognition:", e);
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>AcadAssist</h2>
        <div className="status">
          <div className="status-dot"></div>
          Online
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-btn" onClick={() => handleSend()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
        <button className="mic-btn" onClick={handleVoice}>
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </button>
      </div>
    </div>
  );
}