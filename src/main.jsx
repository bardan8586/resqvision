import React from "react";
import { createRoot } from "react-dom/client";
import App from "../resqvision_operator_dashboard_prototype (1).jsx";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
