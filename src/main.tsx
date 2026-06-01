import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import "./index.css";
import ResumeLayout from "./layouts/resume.tsx";
import Resume from "./pages/Resume.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<ResumeLayout />}>
          <Route path="/" element={<Resume />} />
          <Route path="/resume" element={<Resume />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);
