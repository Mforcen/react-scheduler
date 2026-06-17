/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo } from "./Demo";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Demo />
  </StrictMode>
);

const root = createRoot(elem);
root.render(app);
