export const mapBackendFormulation = (record) => {
  const extractedText = record.processo_fabricacao || "";
  const ingredients = (Array.isArray(record.ingredientes) ? record.ingredientes : [])
    .map((item) => typeof item === "string"
      ? item
      : item?.nome
        ? (item.percentagem == null ? item.nome : item.nome + " (" + item.percentagem + "%)")
        : "")
    .filter(Boolean);

  return {
    id: record._id || record.codigo,
    name: record.nome || record.codigo || "Formula\u00e7\u00e3o importada",
    lab: record.laboratorio || "N\u00e3o informado",
    type: record.tipoArquivo || "Importado",
    date: record.criadoEm ? new Date(record.criadoEm).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
    status: record.status || "Aguardando An\u00e1lise",
    ingredients,
    summary: record.resumo || extractedText || "Formula\u00e7\u00e3o importada da API.",
    extractedText
  };
};
