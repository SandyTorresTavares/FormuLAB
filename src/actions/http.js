import { API_BASE_URL } from "../config/api.js";

const TOKEN_KEY = "formulab.auth.token";
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = token => token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.erro || data.mensagem || "A requisição à API falhou.");
    error.status = response.status;
    throw error;
  }
  return data;
}