import React, { lazy, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ExamsPage = lazy(() => import('./pages/ExamsPage').then(m => ({ default: m.ExamsPage })));
const StudentsPage = lazy(() => import('./pages/StudentsPage').then(m => ({ default: m.StudentsPage })));
const StudentDetailsPage = lazy(() => import('./pages/StudentDetailsPage').then(m => ({ default: m.StudentDetailsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CreateExamPage = lazy(() => import('./pages/CreateExamPage').then(m => ({ default: m.CreateExamPage })));
const StudentStartPage = lazy(() => import('./pages/StudentStartPage').then(m => ({ default: m.StudentStartPage })));
const StudentExamPage = lazy(() => import('./pages/StudentExamPage').then(m => ({ default: m.StudentExamPage })));
const StudentResultPage = lazy(() => import('./pages/StudentResultPage').then(m => ({ default: m.StudentResultPage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Carregando...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('saas_token');
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="student/:id" element={<StudentDetailsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/admin/exams/new" element={<ProtectedRoute><CreateExamPage /></ProtectedRoute>} />
          <Route path="/admin/exams/edit/:id" element={<ProtectedRoute><CreateExamPage /></ProtectedRoute>} />
          <Route path="/student/start" element={<StudentStartPage />} />
          <Route path="/student/exam" element={<StudentExamPage />} />
          <Route path="/student/result" element={<StudentResultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}