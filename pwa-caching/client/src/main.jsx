import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import registerServiceWorker from "./serviceWorkerRegistration";
import App from "./App.jsx";

// Register the service worker
registerServiceWorker();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
