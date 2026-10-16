import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Keep the CSRF token in memory for protected requests.
let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = typeof token === "string" ? token : null;
}

// Add the token to requests that can change server data.
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  const safeMethods = ["get", "head", "options"];

  if (!safeMethods.includes(method) && csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

export default api;
