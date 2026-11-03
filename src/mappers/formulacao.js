export const mapBackendFormulation = record => {
  const rawExtractedText = record.textoExtraido || record.processo_fabricacao || "";
  const categoryText = String(record.categoriaProduto || "Não categorizado").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const category = categoryText ? categoryText[0].toLocaleUpperCase("pt-BR") + categoryText.slice(1) : "Não categorizado";
  const rawPreparation = String(record.processo_fabricacao || "");
  const preparationHeading = /^(?:formulação\s+)?(?:processo|procedimento|modo de preparo)\s*:?\s*/im;
  const preparationMatch = rawPreparation.match(preparationHeading);
  let preparation = record.textoExtraido && rawPreparation.trim() ? rawPreparation : "";
  if (preparationMatch) {
    const start = preparationMatch.index + preparationMatch[0].length;
    const steps = [];
    for (const line of rawPreparation.slice(start).split(/\r?\n/)) {
      if (/^(?:slide\s+\d+|principais benef[ií]cios|guia de formulação|versão)\b/i.test(line.trim())) break;
      if (line.trim()) steps.push(line.trim());
    }
    preparation = steps.join("\n");
  } else if (!preparation) {
    const source = rawExtractedText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const instruction = /^(?:(?:etapa\s+\d+\s*[:.)-]?|\d+[.)]|\d+\s*[-–])\s*)?(?:em (?:um|uma) (?:recipiente|béquer|bequer|tanque|vaso)|adicionar|acrescentar|misturar|agitar|aquecer|resfriar|incorporar|dissolver|homogeneizar|manter|verter|colocar)\b/i;
    const start = source.findIndex(line => instruction.test(line));
    if (start >= 0) {
      const steps = [];
      for (const line of source.slice(start)) {
        if (!instruction.test(line)) break;
        steps.push(line.replace(/^(\d+[.)]|\d+\s*[-–])\s*/, "").trim());
      }
      preparation = steps.join("\n");
    }
  }
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
    category,
    lab: record.laboratorio || "Não informado",
    type: record.tipoArquivo || "Importado",
    date: record.criadoEm ? new Date(record.criadoEm).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
    status: record.status || "Aguardando Análise",
    ingredients,
    ingredientData,
    summary: record.resumo || "",
    extractedText: rawExtractedText,
    preparation,
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
