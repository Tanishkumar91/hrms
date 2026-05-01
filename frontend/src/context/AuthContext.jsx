import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || '/api',
        withCredentials: true
    });

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        // Normalise: backend returns res.data.user with shape {id,name,email,role}
        const u = res.data.user;
        setUser({ _id: u.id, name: u.name, email: u.email, role: u.role });
        return res.data;
    };

    const register = async (name, email, password, role) => {
        const res = await api.post('/auth/register', { name, email, password, role });
        return res.data;
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch (err) {
            console.error('Logout API failed');
        }
        setUser(null);
        // Redirect to landing page
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
