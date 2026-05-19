import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import TokenSetter from "./auth/TokenSetter";
import WorkflowDetail from "./pages/WorkflowDetail";
import WorkflowsList from "./pages/WorkflowsList";

export default function App() {
  return (
    <Router>
      <TokenSetter />
      <Routes>
        <Route path="/" element={<Navigate to="/workflows" replace />} />
        <Route
          path="/workflows"
          element={
            <AuthGuard>
              <WorkflowsList />
            </AuthGuard>
          }
        />
        <Route
          path="/workflows/:id"
          element={
            <AuthGuard>
              <WorkflowDetail />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}
