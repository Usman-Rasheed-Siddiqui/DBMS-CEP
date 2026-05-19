
import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api';
const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",

    }
})

AxiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("refresh");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance