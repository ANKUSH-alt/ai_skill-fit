import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useLanguageStore from './store/languageStore';

// Candidate Pages
import LanguageSelect from './pages/LanguageSelect';
import Registration from './pages/Registration';
import RoleSelect from './pages/RoleSelect';
import PhotoCapture from './pages/PhotoCapture';
import Instructions from './pages/Instructions';
import CameraCheck from './pages/CameraCheck';
import InterviewRoom from './pages/InterviewRoom';
import Processing from './pages/Processing';
import ThankYou from './pages/ThankYou';
import CandidateDashboard from './pages/CandidateDashboard';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import CandidateDetail from './pages/admin/CandidateDetail';
import Analytics from './pages/admin/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { getLanguage } = useLanguageStore();
  const language = getLanguage();
  
  if (!language) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { initLanguage } = useLanguageStore();

  useEffect(() => {
    initLanguage();
  }, [initLanguage]);

  return (
    <Router>
      <Routes>
        {/* Language Selection - First Screen */}
        <Route path="/" element={<LanguageSelect />} />
        
        {/* Protected Routes - Require Language Selection */}
        <Route
          path="/registration"
          element={
            <ProtectedRoute>
              <Registration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-select"
          element={
            <ProtectedRoute>
              <RoleSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/photo-capture"
          element={
            <ProtectedRoute>
              <PhotoCapture />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructions"
          element={
            <ProtectedRoute>
              <Instructions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/camera-check"
          element={
            <ProtectedRoute>
              <CameraCheck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/processing"
          element={
            <ProtectedRoute>
              <Processing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thank-you"
          element={
            <ProtectedRoute>
              <ThankYou />
            </ProtectedRoute>
          }
        />
        
        {/* Candidate Dashboard - No protection needed */}
        <Route path="/my-results" element={<CandidateDashboard />} />
        
        {/* Admin Routes - No language lock, English only */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/candidate/:id" element={<CandidateDetail />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
