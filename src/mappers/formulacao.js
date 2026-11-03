export const mapBackendFormulation = record => {
  const extractedText = record.processo_fabricacao || "";
  const ingredientData = (Array.isArray(record.ingredientes) ? record.ingredientes : [])
    .map(item => typeof item === "string"
      ? { name: item, percentage: "" }
      : item?.nome
        ? { id: item._id, name: item.nome, percentage: item.percentagem == null ? "" : String(item.percentagem) }
        : null)
    .filter(Boolean);
  const ingredients = ingredientData.map(item => {
    if (!item.percentage) return item.name;
    const percentage = /\bqsp?\b/i.test(item.percentage) || item.percentage.endsWith("%")
      ? item.percentage
      : `${item.percentage}%`;
    return `${item.name} (${percentage})`;
  });

  return {
    id: record._id || record.codigo,
    name: record.nome || record.codigo || "Formulação importada",
    category: record.categoriaProduto || "Não categorizado",
    lab: record.laboratorio || "Não informado",
    type: record.tipoArquivo || "Importado",
    date: record.criadoEm ? new Date(record.criadoEm).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
    status: record.status || "Aguardando Análise",
    ingredients,
    ingredientData,
    summary: record.resumo || "",
    extractedText
  };
};
