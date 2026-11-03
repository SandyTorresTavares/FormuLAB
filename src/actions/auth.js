import { apiRequest } from "./http.js";

export const registrar = payload => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) });
export const entrar = payload => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) });
export const recuperarSenha = payload => apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) });
export const obterSessao = () => apiRequest("/auth/me");
export const listarUsuarios = async () => (await apiRequest("/auth/users")).users;
export const atualizarPapelUsuario = (id, role) => apiRequest(`/auth/users/${encodeURIComponent(id)}/role`, { method: "PATCH", body: JSON.stringify({ role }) });