const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  async request(config) {
    const { endpoint, options = {} } = config;
    const token = localStorage.getItem('token');
    
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
      }
      const error = await response.json();
      throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
  }

  async login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid credentials');
    }

    const result = await response.json();
    localStorage.setItem('token', result.access_token);
    return result;
  }

  async register(userData) {
    return this.request({
      endpoint: '/auth/register',
      options: {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    });
  }

  async getCurrentUser() {
    return this.request({ endpoint: '/auth/me' });
  }

  async getScorecards() {
    return this.request({ endpoint: '/scorecards' });
  }

  async createScorecard(scorecardData) {
    return this.request({
      endpoint: '/scorecards',
      options: {
        method: 'POST',
        body: JSON.stringify(scorecardData),
      }
    });
  }

  async getStats() {
    return this.request({ endpoint: '/scorecards/stats' });
  }

  async getFriends() {
    return this.request({ endpoint: '/friends' });
  }

  async addFriend(friendCode) {
    return this.request({
      endpoint: '/friends',
      options: {
        method: 'POST',
        body: JSON.stringify({ friend_code: friendCode }),
      }
    });
  }
}

const apiService = new ApiService();
export default apiService;
