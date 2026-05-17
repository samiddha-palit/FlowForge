import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import WorkflowDetail from "./pages/WorkflowDetail";
import WorkflowsList from "./pages/WorkflowsList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/workflows" replace />} />
        <Route path="/workflows" element={<WorkflowsList />} />
        <Route path="/workflows/:id" element={<WorkflowDetail />} />
      </Routes>
    </Router>
  );
}
