import axios from 'axios';
import Constants from 'expo-constants';

// Set this to true when you want to use your Hostinger backend
const IS_PRODUCTION = true
const PRODUCTION_URL = 'https://api-nexawork.p3consultingltd.com/api'; // Replace with your real Hostinger subdomain URL

// Auto-detect the local IP for development
const getBaseUrl = () => {
    if (IS_PRODUCTION) return PRODUCTION_URL;

    // Priority 1: Check Expo config
    const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        if (host !== 'localhost' && host !== '127.0.0.1') {
            return `http://${host}:8000/api`;
        }
    }

    // Default Local IP
    return 'http://192.168.0.105:8000/api';
};

const API_URL = getBaseUrl();
export const SERVER_URL = API_URL.replace('/api', '');
const API_BASE_URL = API_URL;

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add response interceptor for debugging
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.log('Request timed out - check if server is running');
        } else if (error.message === 'Network Error') {
            console.log('Network Error - check if phone and computer are on same WiFi');
            console.log('API URL:', API_BASE_URL);
        }
        return Promise.reject(error);
    }
);

export default client;
