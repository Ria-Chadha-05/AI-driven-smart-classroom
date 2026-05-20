import axios from "axios";

// In production (Vercel), VITE_API_URL is set to the deployed backend URL.
// Locally, it is empty so that Vite's dev-server proxy handles /api/* calls.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export default api;
