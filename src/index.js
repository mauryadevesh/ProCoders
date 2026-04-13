import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);