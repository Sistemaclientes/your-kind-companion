import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamsPage } from './pages/ExamsPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateExamPage } from './pages/CreateExamPage';
import { StudentStartPage } from './pages/StudentStartPage';
import { StudentExamPage } from './pages/StudentExamPage';
import { StudentResultPage } from './pages/StudentResultPage';
import { AdminLayout } from './components/AdminLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="student/:id" element={<StudentDetailsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/admin/exams/new" element={<CreateExamPage />} />
        <Route path="/admin/exams/edit/:id" element={<CreateExamPage />} />
        <Route path="/student/start" element={<StudentStartPage />} />
        <Route path="/student/exam" element={<StudentExamPage />} />
        <Route path="/student/result" element={<StudentResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
