import React, { lazy, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminLayout } from './components/AdminLayout';
import { StudentLayout } from './components/StudentLayout';
import { RouteTracker } from './components/RouteTracker';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthProvider, useAuthStore } from './lib/authStore';
import { VisualSettingsProvider } from './components/VisualSettingsProvider';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ExamsPage = lazy(() => import('./pages/ExamsPage').then(m => ({ default: m.ExamsPage })));
const StudentsPage = lazy(() => import('./pages/StudentsPage').then(m => ({ default: m.StudentsPage })));
const StudentDetailsPage = lazy(() => import('./pages/StudentDetailsPage').then(m => ({ default: m.StudentDetailsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CreateExamPage = lazy(() => import('./pages/CreateExamPage').then(m => ({ default: m.CreateExamPage })));
const StudentStartPage = lazy(() => import('./pages/StudentStartPage').then(m => ({ default: m.StudentStartPage })));
const StudentExamPage = lazy(() => import('./pages/StudentExamPage').then(m => ({ default: m.StudentExamPage })));
const StudentResultPage = lazy(() => import('./pages/StudentResultPage').then(m => ({ default: m.StudentResultPage })));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const StudentResultDetailPage = lazy(() => import('./pages/StudentResultDetailPage').then(m => ({ default: m.StudentResultDetailPage })));
const StudentExamsListPage = lazy(() => import('./pages/StudentExamsListPage').then(m => ({ default: m.StudentExamsListPage })));
const StudentResultsListPage = lazy(() => import('./pages/StudentResultsListPage').then(m => ({ default: m.StudentResultsListPage })));
const StudentLoginPage = lazy(() => import('./pages/StudentLoginPage').then(m => ({ default: m.StudentLoginPage })));
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));


function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Carregando...</p>
      </div>
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{ className: 'font-semibold' }}
        />
        <AuthGate>
          <RouteTracker />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public auth routes */}
              <Route path="/" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={
                <PublicRoute redirectTo="/admin/dashboard">
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/student/login" element={
                <PublicRoute redirectTo="/student/dashboard">
                  <StudentLoginPage />
                </PublicRoute>
              } />
              <Route path="/confirmar-email" element={<Navigate to="/student/login" replace />} />
              <Route path="/redefinir-senha" element={<LoginPage />} />

              {/* Legacy redirects */}
              <Route path="/aluno/login" element={<Navigate to="/student/login" replace />} />
              <Route path="/aluno/*" element={<Navigate to="/student/dashboard" replace />} />

              {/* Admin routes */}
              <Route path="/admin" element={
                <PrivateRoute role="admin">
                  <AdminLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="exams" element={<ExamsPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/:slug" element={<StudentDetailsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/admin/exams/new" element={
                <PrivateRoute role="admin"><CreateExamPage /></PrivateRoute>
              } />
              <Route path="/admin/exams/editar/:slug" element={
                <PrivateRoute role="admin"><CreateExamPage /></PrivateRoute>
              } />
              <Route path="/admin/exams/edit/:id" element={
                <PrivateRoute role="admin"><CreateExamPage /></PrivateRoute>
              } />

              {/* Student exam flow */}
              <Route path="/prova/:slug" element={<StudentStartPage />} />
              <Route path="/student/start" element={<StudentStartPage />} />
              <Route path="/student/exam" element={
                <PrivateRoute role="aluno"><StudentExamPage /></PrivateRoute>
              } />
              <Route path="/student/result" element={
                <PrivateRoute role="aluno"><StudentResultPage /></PrivateRoute>
              } />

              {/* Student dashboard */}
              <Route path="/student" element={
                <PrivateRoute role="aluno">
                  <StudentLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="provas" element={<StudentExamsListPage />} />
                <Route path="resultados" element={<StudentResultsListPage />} />
                <Route path="resultado/:slug" element={<StudentResultDetailPage />} />
                <Route path="perfil" element={<StudentProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthGate>
      </AuthProvider>
    </Router>
  );
}
