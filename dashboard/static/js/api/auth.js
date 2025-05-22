// API endpoints
const API_ENDPOINTS = {
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    REFRESH: '/api/auth/token/refresh/'
};

// Get CSRF token from cookie
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// API request handler
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };

    const config = {
        method,
        headers,
        credentials: 'include'
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(endpoint, config);
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || 'An error occurred');
        }

        return responseData;
    } catch (error) {
        throw error;
    }
}

// Login function
async function login(username, password) {
    try {
        const data = await apiRequest(API_ENDPOINTS.LOGIN, 'POST', {
            username,
            password
        });
        
        // Store tokens if needed
        if (data.access) {
            localStorage.setItem('access_token', data.access);
        }
        if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Logout function
async function logout() {
    try {
        await apiRequest(API_ENDPOINTS.LOGOUT, 'POST');
        // Clear stored tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Refresh token function
async function refreshToken() {
    try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) {
            throw new Error('No refresh token available');
        }

        const data = await apiRequest(API_ENDPOINTS.REFRESH, 'POST', {
            refresh
        });

        if (data.access) {
            localStorage.setItem('access_token', data.access);
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export { login, logout, refreshToken }; 