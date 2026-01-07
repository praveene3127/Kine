import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import API_BASE from "./api";
import { AudioProvider } from './context/AudioContext';
import { GestureProvider } from './context/GestureContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import PermissionPage from './pages/PermissionPage';
import CalibrationPage from './pages/CalibrationPage';
import WorkspacePage from './pages/WorkspacePage';
import ReviewPage from './pages/ReviewPage';
import AIAssistPage from './pages/AIAssistPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

// Styles
import './styles/index.css';

function App() {

  function testBackend() {
    fetch(`${API_BASE}/api/health`)
      .then(res => res.json())
      .then(data => {
        console.log("BACKEND OK:", data);
        alert("Backend connected ✅");
      })
      .catch(err => {
        console.error(err);
        alert("Backend failed ❌");
      });
  }

  return (
    <AuthProvider>
      <AudioProvider>
        <GestureProvider>
          <Router>

            <button
              onClick={testBackend}
              style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
            >
              Test Backend
            </button>

            <Routes>
              {/* Onboarding Flow */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/permission" element={<PermissionPage />} />
              <Route path="/calibration" element={<CalibrationPage />} />

              {/* Main App */}
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/ai-assist" element={<AIAssistPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>

          </Router>
        </GestureProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
