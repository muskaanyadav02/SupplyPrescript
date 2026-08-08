import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";

import ShipmentsPage from "./pages/ShipmentsPage";
import AIPredictionPage from "./pages/AIPredictionPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Dashboard */}
        <Route path="/" element={<Layout />} />

        {/* Pages */}
        <Route
          path="/shipments"
          element={<ShipmentsPage />}
        />

        <Route
          path="/ai-prediction"
          element={<AIPredictionPage />}
        />

        <Route
          path="/recommendations"
          element={<RecommendationsPage />}
        />

        <Route
          path="/analytics"
          element={<AnalyticsPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;