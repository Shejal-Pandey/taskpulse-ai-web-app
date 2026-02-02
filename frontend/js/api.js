/**
 * TaskPulse - API Service
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get authorization header
    getAuthHeader() {
        const token = localStorage.getItem('taskpulse_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async sendOTP(email) {
        return this.request('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async verifyOTP(email, otp) {
        return this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp })
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    async getAllUsers() {
        return this.request('/auth/users');
    }

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token, newPassword) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
    }

    // Report endpoints
    async createReport(reportData) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
    }

    async getReports(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        const queryString = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/reports${queryString}`);
    }

    async getReport(id) {
        return this.request(`/reports/${id}`);
    }

    async getTodayReport() {
        return this.request('/reports/today');
    }

    async updateReport(id, reportData) {
        return this.request(`/reports/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reportData)
        });
    }

    async deleteReport(id, force = false) {
        const endpoint = force ? `/reports/${id}/force` : `/reports/${id}`;
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    async getReportStats(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        const queryString = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/reports/stats${queryString}`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Export singleton instance
const api = new ApiService();
