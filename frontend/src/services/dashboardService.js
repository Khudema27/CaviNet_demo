import api from '../utils/axiosConfig';

class DashboardService {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }

  async getRecentScans(limit = 10) {
    const response = await api.get('/dashboard/recent-scans', { params: { limit } });
    return response.data;
  }
}

export default new DashboardService();