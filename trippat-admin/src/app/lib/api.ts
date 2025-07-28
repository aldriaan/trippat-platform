import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const adminAPI = {
  getDashboardStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/admin/dashboard/stats${params.toString() ? '?' + params.toString() : ''}`);
    return response.data;
  },
};

export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  create: async (data: CategoryFormData) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  
  update: async (id: string, data: CategoryFormData) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await api.patch(`/categories/${id}/status`, { status });
    return response.data;
  },
  
  updateOrder: async (categories: { id: string; order: number }[]) => {
    const response = await api.patch('/categories/order', { categories });
    return response.data;
  },
  
  bulkAction: async (categoryIds: string[], action: 'activate' | 'deactivate' | 'delete') => {
    const response = await api.post('/categories/bulk', { categoryIds, action });
    return response.data;
  },
  
  export: async (format: 'csv' | 'json') => {
    const response = await api.get(`/categories/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  import: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

interface CategoryFormData {
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  slug: string;
  icon: string;
  color: string;
  parentId?: string;
  image?: string;
  seo: {
    metaTitle: {
      en: string;
      ar: string;
    };
    metaDescription: {
      en: string;
      ar: string;
    };
    keywords: string[];
  };
}