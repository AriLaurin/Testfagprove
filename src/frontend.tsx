// Import Node.js polyfills first
import './nodePolyfills';

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import { App } from "./App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
