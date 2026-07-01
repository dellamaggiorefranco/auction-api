import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080" // Sin el "/auction-api-nuevo"
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;