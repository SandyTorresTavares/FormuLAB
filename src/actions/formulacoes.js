import { apiRequest } from "./http.js";
import { mapBackendFormulation } from "../mappers/formulacao.js";

export const listarFormulacoes = async ({ signal } = {}) => {
  const data = await apiRequest("/formulacoes", { signal });
  return Array.isArray(data) ? data.map(mapBackendFormulation) : [];
};

export const importarArquivo = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("arquivo", file);
  if (metadata.name?.trim()) formData.append("nome", metadata.name.trim());
  if (metadata.category?.trim()) formData.append("categoriaProduto", metadata.category.trim());
  if (metadata.lab?.trim()) formData.append("laboratorio", metadata.lab.trim());
  const data = await apiRequest("/importar", { method: "POST", body: formData });
  return { ...data, dados: data.dados ? mapBackendFormulation(data.dados) : null, formulacoes: Array.isArray(data.formulacoes) ? data.formulacoes.map(mapBackendFormulation) : [] };
};

export const atualizarFormulacao = async (id, formulacao) => {
  const data = await apiRequest(`/formulacoes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      nome: formulacao.name, categoriaProduto: formulacao.category, laboratorio: formulacao.lab,
      resumo: formulacao.summary, status: formulacao.status, processo_fabricacao: formulacao.preparation || "",
      ingredientes: (formulacao.ingredientData || []).map(item => ({ nome: item.name, percentagem: item.percentage }))
    })
  });
  return mapBackendFormulation(data);
};

export const excluirFormulacao = id => apiRequest(`/formulacoes/${encodeURIComponent(id)}`, { method: "DELETE" });
export const excluirFormulacoesEmMassa = ids => apiRequest("/formulacoes", { method: "DELETE", body: JSON.stringify({ ids }) });