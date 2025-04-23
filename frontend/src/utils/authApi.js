import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with every request
});

// ✅ Authentication authApis
export const login = (credentials) => authApi.post("/auth/login", credentials);
export const signup = (userData) => authApi.post("/auth/signup", userData);
export const logout = () => authApi.post("/auth/logout");

export default authApi;
