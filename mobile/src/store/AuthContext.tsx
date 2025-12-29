import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

interface AuthContextType {
    user: any;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('auth_token');
            const storedUser = await SecureStore.getItemAsync('user_data');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (e) {
            console.error('Failed to load auth', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (newToken: string, userData: any) => {
        setToken(newToken);
        setUser(userData);
        client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await SecureStore.setItemAsync('auth_token', newToken);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        delete client.defaults.headers.common['Authorization'];
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
    };

    const updateUser = async (data: any) => {
        const newUser = { ...user, ...data };
        setUser(newUser);
        await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
