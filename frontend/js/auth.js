/**
 * TaskPulse - Authentication Module
 * Handles user authentication, session management
 */

class Auth {
    constructor() {
        this.tokenKey = 'taskpulse_token';
        this.userKey = 'taskpulse_user';
    }

    // Check if user is logged in
    isAuthenticated() {
        return !!this.getToken();
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    // Check if user is manager or admin
    isManagerOrAdmin() {
        const user = this.getUser();
        return user && ['manager', 'admin'].includes(user.role);
    }

    // Check if user is admin
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }

    // Login and store credentials
    async login(email, password) {
        try {
            const response = await api.login(email, password);
            if (response.success) {
                this.saveSession(response.data.token, response.data.user);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Register new user
    async register(userData) {
        try {
            const response = await api.register(userData);
            if (response.success) {
                this.saveSession(response.data.token, response.data.user);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Save session to localStorage
    saveSession(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Logout and clear session
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = 'login.html';
    }

    // Refresh user data from server
    async refreshUser() {
        try {
            const response = await api.getMe();
            if (response.success) {
                localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
                return response.data.user;
            }
        } catch (error) {
            // If token is invalid, logout
            if (error.message.includes('Token') || error.message.includes('Not authorized')) {
                this.logout();
            }
            throw error;
        }
    }

    // Protect route - redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Redirect if authenticated
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            const user = this.getUser();
            if (user && ['manager', 'admin'].includes(user.role)) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'reports.html';
            }
            return true;
        }
        return false;
    }
}

// Export singleton
const auth = new Auth();
