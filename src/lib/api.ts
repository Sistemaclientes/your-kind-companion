const API_URL = 'http://localhost:3001/api';

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('saas_token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('saas_token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'API Error');
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const token = localStorage.getItem('saas_token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao deletar');
    }
    return response.json();
  },

  // Auth specific
  login: async (credentials: any) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Login Falhou');
    }
    const data = await response.json();
    localStorage.setItem('saas_token', data.token);
    localStorage.setItem('saas_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
  },

  getUser: () => {
    const user = localStorage.getItem('saas_user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;
