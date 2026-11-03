import { API_BASE_URL } from "../config/api.js";
import { mapBackendFormulation } from "../mappers/formulacao.js";

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.erro || data.mensagem || "A requisicao a API falhou.");
  }
  return data;
};

export const listarFormulacoes = async ({ signal } = {}) => {
  const response = await fetch(API_BASE_URL + "/formulacoes", { signal });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data.map(mapBackendFormulation) : [];
};

export const importarArquivo = async (file) => {
  const formData = new FormData();
  formData.append("arquivo", file);

  const response = await fetch(API_BASE_URL + "/importar", {
    method: "POST",
    body: formData
  });
  const data = await parseResponse(response);

  return {
    ...data,
    dados: data.dados ? mapBackendFormulation(data.dados) : null
  };
};
