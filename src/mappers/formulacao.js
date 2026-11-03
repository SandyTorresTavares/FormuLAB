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
    extractedText,
    audit: (Array.isArray(record.auditoria) ? record.auditoria : []).map((entry, index) => ({
      id: `${record._id || record.codigo}-${index}-${entry.ocorridoEm || ""}`,
      formulaId: record._id || record.codigo,
      formulaName: record.nome || record.codigo || "Formulação",
      changedBy: "Usuário do painel",
      role: "Auditoria",
      date: entry.ocorridoEm ? new Date(entry.ocorridoEm).toLocaleString("pt-BR") : "",
      occurredAt: entry.ocorridoEm || "",
      fieldChanged: entry.campo || "Alteração",
      oldValue: entry.valorAnterior || "",
      newValue: entry.valorNovo || "",
      reason: entry.motivo || ""
    }))
  };
};
