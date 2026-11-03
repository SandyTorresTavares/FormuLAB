export const mapBackendFormulation = record => {
  const extractedText = record.processo_fabricacao || "";
  const ingredients = (Array.isArray(record.ingredientes) ? record.ingredientes : [])
    .map(item => typeof item === "string"
      ? item
      : item?.nome
        ? (item.percentagem == null ? item.nome : `${item.nome} (${item.percentagem}%)`)
        : "")
    .filter(Boolean);

  return {
    id: record._id || record.codigo,
    name: record.nome || record.codigo || "Formulação importada",
    category: record.categoriaProduto || "Não categorizado",
    lab: record.laboratorio || "Não informado",
    type: record.tipoArquivo || "Importado",
    date: record.criadoEm ? new Date(record.criadoEm).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
    status: record.status || "Aguardando Análise",
    ingredients,
    summary: record.resumo || "",
    extractedText
  };
};
