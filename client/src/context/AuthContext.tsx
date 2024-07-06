import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import {jwtDecode} from 'jwt-decode';  // npm install jwt-decode
import { env } from '../config/env';
import logger from '../utils/logger';
import { AuthContextProps, AuthProviderProps } from '../types/AuthContext.types';

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const LOGIN_CHECK_INTERVAL = 300000;
    const SECONDS = 1000;

    useEffect(() => {
        if (localStorage.getItem('userId') && !userId) {
            setUserId(localStorage.getItem('userId'));
        }
    }, [userId]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${env.api_url}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const res = await response.json();
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            localStorage.setItem('userId', res.data.userId);
            setAccessToken(res.data.accessToken);
            setIsAuthenticated(true);
            setUserId(res.data.userId);
            return true;
        } catch (error) {
            logger.log('Login failed:', error);
            return false;
        }
    };

    const logout = async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.clear();
        setAccessToken(null);
        setIsAuthenticated(false);

        await fetch(`${env.api_url}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/';
            }
        });
    };

    const refreshAccessToken = useCallback(async (refreshToken: string | null): Promise<boolean> => {
        if (!refreshToken) {
            logout();
            return false;
        }

        try {
            const response = await fetch(`${env.api_url}/token-refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                logout();
                throw new Error('Failed to refresh token');
            }

            const res = await response.json();
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            setAccessToken(res.data.accessToken);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            logout();
            logger.log('Refresh Token:', error);
            return false;
        }
    }, []);

    const validateToken = useCallback(async (accessToken: string | null, refreshToken: string | null) => {
        if (!accessToken || !refreshToken) {
            setLoading(false);
            return;
        }

        try {
            const decoded: { exp: number } = jwtDecode(accessToken);
            const currentTime = Date.now() / SECONDS;
            if (decoded.exp < currentTime) {
                // Token expired
                await refreshAccessToken(refreshToken);
            } else {
                // Token is valid
                setAccessToken(accessToken);
                setIsAuthenticated(true);
            }
        } catch (error) {
            // Error during decoding or token is invalid
            await refreshAccessToken(refreshToken);
        }
        setLoading(false);
    }, [refreshAccessToken]);

    const updateToken = useCallback(async (accessToken: string | null, refreshToken: string | null): Promise<void> => {
        if (!accessToken || !refreshToken) {
            logout();
            return;
        }

        try {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setAccessToken(accessToken);
        } catch (error) {
            logout();
            logger.log('Failed to update token:', error);
        }
    }, []);

    const ensureAuth = useCallback(async () => {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        await validateToken(storedAccessToken, storedRefreshToken);
    }, [validateToken]);

    useEffect(() => {
        logger.log('ensureAuth 1');
        ensureAuth();
    }, [ensureAuth]);

    useEffect(() => {
        const interval = setInterval(() => {
            logger.log('ensureAuth 2');
            ensureAuth();
        }, LOGIN_CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, [ensureAuth]);

    return (
        <AuthContext.Provider value={{
            accessToken,
            isAuthenticated,
            loading,
            login,
            logout,
            refreshAccessToken,
            updateToken,
            userId
        }}>
            {children}
        </AuthContext.Provider>
    );
};
