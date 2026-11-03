import { API_BASE_URL } from "../config/api.js";
import { mapBackendFormulation } from "../mappers/formulacao.js";

const parseResponse = async response => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || data.mensagem || "A requisição à API falhou.");
  return data;
};

export const listarFormulacoes = async ({ signal } = {}) => {
  const response = await fetch(`${API_BASE_URL}/formulacoes`, { signal });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data.map(mapBackendFormulation) : [];
};

export const importarArquivo = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("arquivo", file);
  if (metadata.name?.trim()) formData.append("nome", metadata.name.trim());
  if (metadata.category?.trim()) formData.append("categoriaProduto", metadata.category.trim());
  if (metadata.lab?.trim()) formData.append("laboratorio", metadata.lab.trim());
  const response = await fetch(`${API_BASE_URL}/importar`, { method: "POST", body: formData });
  const data = await parseResponse(response);
  return {
    ...data,
    dados: data.dados ? mapBackendFormulation(data.dados) : null,
    formulacoes: Array.isArray(data.formulacoes) ? data.formulacoes.map(mapBackendFormulation) : []
  };
};

export const atualizarFormulacao = async (id, formulacao) => {
  const response = await fetch(`${API_BASE_URL}/formulacoes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: formulacao.name,
      categoriaProduto: formulacao.category,
      laboratorio: formulacao.lab,
      resumo: formulacao.summary,
      status: formulacao.status,
      processo_fabricacao: formulacao.preparation || "",
      ingredientes: (formulacao.ingredientData || []).map(item => ({ nome: item.name, percentagem: item.percentage }))
    })
  });
  return mapBackendFormulation(await parseResponse(response));
};

export const excluirFormulacao = async id => {
  const response = await fetch(`${API_BASE_URL}/formulacoes/${encodeURIComponent(id)}`, { method: "DELETE" });
  return parseResponse(response);
};

export const excluirFormulacoesEmMassa = async ids => {
  const response = await fetch(`${API_BASE_URL}/formulacoes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids })
  });
  return parseResponse(response);
};
