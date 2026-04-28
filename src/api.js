import axios from "axios";

// 🔥 CHANGE THIS to your backend deployed URL
const API = axios.create({
  baseURL: "http://localhost:8080/api", 
  // example:
  // baseURL: "https://your-backend.up.railway.app/api"
});

// ✅ Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Unauthorized → redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Forbidden
      if (error.response.status === 403) {
        alert("Access Denied");
      }
    }

    return Promise.reject(error);
  }
);

export default API;
