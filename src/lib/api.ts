/**
 * Compatibility API layer — delegates to service modules.
 * Legacy code can still import `api` from this file.
 * New code should import directly from `@/services`.
 */
import { authService } from '@/services/auth.service';
import { examsService } from '@/services/exams.service';
import { dashboardService } from '@/services/dashboard.service';
import { studentsService } from '@/services/students.service';
import { adminService } from '@/services/admin.service';
import { categoriesService } from '@/services/categories.service';

async function handleRoute(method: string, endpoint: string, data?: any): Promise<any> {
  // AUTH
  if (method === 'POST' && endpoint === '/login') {
    return authService.loginAdmin(data.email, data.password);
  }
  if (method === 'POST' && endpoint === '/student/login') {
    return authService.loginStudent(data.email, data.senha);
  }
  if (method === 'POST' && endpoint === '/student/register') {
    return authService.registerStudent(data);
  }
  if (method === 'POST' && endpoint === '/admin/forgot-password') {
    return authService.forgotAdminPassword(data.email);
  }
  if (method === 'POST' && endpoint === '/admin/reset-password') {
    return authService.resetAdminPassword(data.email, data.new_password);
  }
  if (method === 'PUT' && endpoint === '/admins/change-password') {
    const user = api.getUser();
    if (!user) throw new Error('Não autenticado');
    return authService.changeAdminPassword(user.id, data.current_password, data.new_password);
  }

  // CATEGORIES
  if (method === 'GET' && endpoint === '/categorias') return categoriesService.getAll();
  if (method === 'POST' && endpoint === '/categorias') return categoriesService.create(data);
  const catUpdateMatch = endpoint.match(/^\/categorias\/([a-f0-9-]+)$/);
  if (method === 'PUT' && catUpdateMatch) return categoriesService.update(catUpdateMatch[1], data);
  const catDeleteMatch = endpoint.match(/^\/categorias\/([a-f0-9-]+)$/);
  if (method === 'DELETE' && catDeleteMatch) return categoriesService.remove(catDeleteMatch[1]);

  // EXAMS
  if (method === 'GET' && endpoint === '/provas') return examsService.getAll();
  const provaIdMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'GET' && provaIdMatch) return examsService.getById(provaIdMatch[1]);
  const slugMatch = endpoint.match(/^\/provas\/slug\/(.+)$/);
  if (method === 'GET' && slugMatch) return examsService.getBySlug(slugMatch[1]);
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
    const info = localStorage.getItem('student_info');
    if (!info) return [];
    const parsed = JSON.parse(info);
    return studentsService.getResults(parsed.email);
  }
  const resultSlugMatch = endpoint.match(/^\/resultados\/slug\/(.+)$/);
  if (method === 'GET' && resultSlugMatch) return studentsService.getResultBySlug(resultSlugMatch[1]);

  // STUDENT STATUS
  if (method === 'PATCH' && endpoint.startsWith('/admin/students/status/')) {
    const email = decodeURIComponent(endpoint.split('/').pop() || '');
    return studentsService.updateStatus(email, data.status);
  }
  if (method === 'POST' && endpoint === '/admin/students/logout-all') return studentsService.logoutAll();

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

  login: async (credentials: { email: string; password: string }) => {
    const result = await authService.loginAdmin(credentials.email, credentials.password);
    const token = 'session-' + Date.now();
    localStorage.setItem('saas_token', token);
    localStorage.setItem('saas_user', JSON.stringify(result.user));
    return { token, user: result.user };
  },

  logout: () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
  },

  getUser: () => {
    const user = localStorage.getItem('saas_user');
    return user ? JSON.parse(user) : null;
  },
};

export default api;
