import React from 'react';
import ChatbotWidget from './ChatbotWidget';

export default function App(){
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AcadAssist</h1>
        <p className="subtitle">Language Agnostic Chatbot</p>
      </header>
      <main className="main-content">
        <ChatbotWidget />
      </main>
    </div>
  );
}
