import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProjectDashboard from './pages/dashboard/ProjectDashboard';
import TenderSetup from './pages/tenders/TenderSetup';
import TenderDocuments from './pages/tenders/TenderDocuments';
import BiddersList from './pages/bidders/BiddersList';
import BidderDetails from './pages/bidders/BidderDetails';
import BidderEvaluationList from './pages/evaluation/BidderEvaluationList';
import BidderEvaluationDetails from './pages/evaluation/BidderEvaluationDetails';
import ContractorReports from './pages/reports/ContractorReports';
import FinalComparison from './pages/comparison/FinalComparison';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { VoiceCopilot } from './components/VoiceCopilot';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/projects" replace /> : <Login />
        } />
        
        {/* Protected Routes */}
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/projects" element={<ProjectDashboard />} />
          <Route path="/projects/:projectId/tenders" element={<TenderSetup />} />
          <Route path="/projects/:projectId/tenders/:tenderId/documents" element={<TenderDocuments />} />
          <Route path="/projects/:projectId/tenders/:tenderId/bidders" element={<BiddersList />} />
          <Route path="/projects/:projectId/tenders/:tenderId/bidders/:bidderId" element={<BidderDetails />} />
          <Route path="/projects/:projectId/tenders/:tenderId/evaluation" element={<BidderEvaluationList />} />
          <Route path="/projects/:projectId/tenders/:tenderId/evaluation/:bidderId" element={<BidderEvaluationDetails />} />
          <Route path="/projects/:projectId/tenders/:tenderId/reports" element={<ContractorReports />} />
          <Route path="/projects/:projectId/tenders/:tenderId/comparison" element={<FinalComparison />} />
        </Route>
        
        {/* Default redirects */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/projects" replace /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/projects" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
      
      <ProtectedRoute>
        <VoiceCopilot />
      </ProtectedRoute>
    </>
  );
}

export default App;
