/**
 * Compatibility API layer — delegates to service modules.
 */
import { authService } from '@/services/auth.service';
import { examsService } from '@/services/exams.service';
import { dashboardService } from '@/services/dashboard.service';
import { studentsService } from '@/services/students.service';
import { adminService } from '@/services/admin.service';
import { supabase } from '@/integrations/supabase/client';

async function handleRoute(method: string, endpoint: string, data?: any): Promise<any> {
  // EXAMS
  if (method === 'GET' && endpoint === '/provas') return examsService.getAll();
  const provaIdMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'GET' && provaIdMatch) return examsService.getById(provaIdMatch[1]);
  if (method === 'POST' && endpoint === '/provas') return examsService.create(data);
  const provaUpdateMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'PUT' && provaUpdateMatch) return examsService.update(provaUpdateMatch[1], data);
  const provaDeleteMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'DELETE' && provaDeleteMatch) return examsService.remove(provaDeleteMatch[1]);
  if (method === 'DELETE' && endpoint === '/provas') return examsService.removeAll();
  if (method === 'POST' && endpoint === '/responder-prova') return examsService.submitAnswers(data);

  // DASHBOARD
  if (method === 'GET' && endpoint === '/dashboard/stats') return dashboardService.getStats();
  if (method === 'GET' && endpoint === '/dashboard/students') return dashboardService.getStudents();
  const studentDetailMatch = endpoint.match(/^\/dashboard\/students\/(.+)$/);
  if (method === 'GET' && studentDetailMatch) return dashboardService.getStudentDetails(decodeURIComponent(studentDetailMatch[1]));

  // STUDENT RESULTS
  if (method === 'GET' && endpoint === '/resultados') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return studentsService.getResults(user.id);
  }
  const resultIdMatch = endpoint.match(/^\/resultados\/([a-f0-9-]+)$/);
  if (method === 'GET' && resultIdMatch) return studentsService.getResultById(resultIdMatch[1]);

  // ADMINS
  if (method === 'GET' && endpoint === '/admins') return adminService.getAll();
  if (method === 'POST' && endpoint === '/admins') return adminService.create(data);
  const adminDeleteMatch = endpoint.match(/^\/admins\/([a-f0-9-]+)$/);
  if (method === 'DELETE' && adminDeleteMatch) return adminService.remove(adminDeleteMatch[1]);

  return {};
}

export const api = {
  get: (endpoint: string) => handleRoute('GET', endpoint),
  post: (endpoint: string, data: any) => handleRoute('POST', endpoint, data),
  put: (endpoint: string, data: any) => handleRoute('PUT', endpoint, data),
  patch: (endpoint: string, data: any) => handleRoute('PATCH', endpoint, data),
  delete: (endpoint: string) => handleRoute('DELETE', endpoint),
};

export default api;
