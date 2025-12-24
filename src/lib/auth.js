/**
 * Authentication Library for Typer-Web
 * Handles JWT token management and user session
 */

import { API_BASE_URL } from '@/lib/api';

const TOKEN_KEY = 'typer_auth_token';
const USER_KEY = 'typer_auth_user';

/**
 * Helper function for auth API requests
 */
async function authRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Auth request failed:', error);
        return { success: false, message: 'Network error occurred' };
    }
}

/**
 * Sign up a new user
 */
export async function signup(username, password, displayName) {
    const response = await authRequest('/typer/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password, displayName }),
    });

    if (response.success) {
        saveAuthData(response);
    }

    return response;
}

/**
 * Login an existing user
 */
export async function login(username, password) {
    const response = await authRequest('/typer/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (response.success) {
        saveAuthData(response);
    }

    return response;
}

/**
 * Validate the current token
 */
export async function validateToken() {
    const token = getToken();
    if (!token) {
        return { success: false, message: 'No token found' };
    }

    const response = await authRequest('/typer/auth/validate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.success) {
        saveAuthData(response);
    } else {
        clearAuthData();
    }

    return response;
}

/**
 * Refresh the current token
 */
export async function refreshToken() {
    const token = getToken();
    if (!token) {
        return { success: false, message: 'No token found' };
    }

    const response = await authRequest('/typer/auth/refresh', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.success) {
        saveAuthData(response);
    }

    return response;
}

/**
 * Logout - clear all auth data
 */
export function logout() {
    clearAuthData();
}

/**
 * Save auth data to localStorage
 */
function saveAuthData(response) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
        userId: response.userId,
        username: response.username,
        displayName: response.displayName,
        expiresAt: response.expiresAt,
    }));
}

/**
 * Clear auth data from localStorage
 */
function clearAuthData() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get the current JWT token
 */
export function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the current user data
 */
export function getUser() {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    const token = getToken();
    const user = getUser();

    if (!token || !user) return false;

    // Check if token is expired
    if (user.expiresAt && Date.now() > user.expiresAt) {
        clearAuthData();
        return false;
    }

    return true;
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader() {
    const token = getToken();
    if (!token) return {};

    return {
        'Authorization': `Bearer ${token}`,
    };
}
