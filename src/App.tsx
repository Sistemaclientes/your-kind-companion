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

// Placeholder pages for faithful recreation of the structure
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="pt-20 px-8">
    <h1 className="text-3xl font-bold font-headline">{title}</h1>
    <p className="mt-4 text-slate-500">Esta página está em desenvolvimento para a demonstração fiel do layout.</p>
  </div>
);

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

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
