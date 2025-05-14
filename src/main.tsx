import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import "./index.css";
import ResumeLayout from "./layouts/resume.tsx";
import Standard from "./layouts/standard.tsx";
import Landing from "./pages/Landing.tsx";
import Resume from "./pages/Resume.tsx";
import Audition from "./pages/Audition.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Standard />}>
          <Route path="/" element={<Landing />} />
          <Route path="/audition" element={<Audition />} />
        </Route>
        <Route element={<ResumeLayout />}>
          <Route path="/resume" element={<Resume />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);
