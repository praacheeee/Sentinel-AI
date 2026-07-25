import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import NewIncident from "./pages/NewIncident";
import IncidentProfile from "./pages/IncidentProfile";
import IncidentIntelligenceReport from "./pages/IncidentIntelligenceReport";
import CityInsights from "./pages/CityInsights";
import AIInspection from "./pages/AIInspection";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents/new" element={<NewIncident />} />
          <Route path="/incidents" element={<IncidentProfile />} />
          <Route
            path="/incident-report"
            element={<IncidentIntelligenceReport />}
          />
          <Route path="/insights" element={<CityInsights />} />
          <Route path="/ai-inspection" element={<AIInspection />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;