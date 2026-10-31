const headerRules = [
  { role: 'name', pattern: /^(?:produto|nome|nome do produto|produto comercial|marca)$/ },
  { role: 'lab', pattern: /^(?:lab|laboratorio|fabricante|empresa|fornecedor)$/ },
  { role: 'ingredients', pattern: /^(?:ingrediente|ingredientes|materia prima|materias primas|componente|composicao|concentracao|percentual|quantidade|dosagem|teor)$/ },
  { role: 'summary', pattern: /^(?:resumo|descricao|finalidade|aplicacao)$/ },
  { role: 'procedure', pattern: /^(?:procedimento|processo|modo de preparo|preparo)$/ },
  { role: 'patentNotes', pattern: /^(?:patente|patentes|observacao sobre patente)$/ },
];

// Relaciona cada coluna da planilha ao campo que ela representa no formulário.
export function inferSpreadsheetMappings(columns) {
  return Object.fromEntries(columns.map((column, index) => {
    const normalized = column.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    const match = headerRules.find(({ pattern }) => pattern.test(normalized));
    return [index, match?.role || 'ignore'];
  }));
}

// Retorna os valores de uma linha associados a um papel específico.
function getMappedValues(row, columns, mappings, role) {
  return columns
    .map((_, index) => mappings[index] === role ? row.values[index]?.trim() : '')
    .filter(Boolean);
}

// Remove valores repetidos mantendo a ordem da primeira ocorrência.
function unique(values) {
  return [...new Set(values)];
}

// Junta os ingredientes mapeados de uma linha em uma única descrição.
function formatIngredients(row, columns, mappings) {
  return getMappedValues(row, columns, mappings, 'ingredients')
    .join(' — ');
}

// Mantém a representação original das linhas para rastreabilidade da importação.
function formatRawRows(rows, columns) {
  return rows.map(({ rowNumber, values }) => {
    const fields = columns
      .map((column, index) => values[index]?.trim() ? `${column}: ${values[index].trim()}` : '')
      .filter(Boolean);
    return `[Linha ${rowNumber}]\n${fields.join('\n')}`;
  }).join('\n\n');
}

// Constrói uma formulação a partir de uma ou mais linhas selecionadas.
function createFormulation(rows, columns, mappings) {
  const firstRow = rows[0];
  const name = unique(rows.flatMap((row) => getMappedValues(row, columns, mappings, 'name')))[0] || '';
  const lab = unique(rows.flatMap((row) => getMappedValues(row, columns, mappings, 'lab')))[0] || '';
  const ingredients = unique(rows.map((row) => formatIngredients(row, columns, mappings)).filter(Boolean));
  const collectField = (role) => unique(rows.flatMap((row) => getMappedValues(row, columns, mappings, role))).join('\n');

  return {
    name,
    lab,
    ingredients,
    summary: collectField('summary'),
    procedure: collectField('procedure'),
    patentNotes: collectField('patentNotes'),
    extractedText: formatRawRows(rows, columns),
    firstRowNumber: firstRow.rowNumber,
  };
}

// Valida o agrupamento escolhido e gera as formulações prontas para envio ao backend.
export function buildSpreadsheetFormulations(sheet, mappings, grouping) {
  const rows = sheet.rows.filter((row) => row.selected);
  if (rows.length === 0) {
    return { formulations: [], error: 'Selecione pelo menos uma linha para importar.' };
  }
  if (!Object.values(mappings).includes('name') || !Object.values(mappings).includes('lab')) {
    return { formulations: [], error: 'Associe uma coluna a “Nome do produto” e outra a “Laboratório”.' };
  }

  if (grouping === 'single') {
    const formulation = createFormulation(rows, sheet.columns, mappings);
    if (!formulation.name || !formulation.lab) {
      return { formulations: [], error: 'As linhas selecionadas precisam conter nome do produto e laboratório.' };
    }
    const names = unique(rows.flatMap((row) => getMappedValues(row, sheet.columns, mappings, 'name')));
    const labs = unique(rows.flatMap((row) => getMappedValues(row, sheet.columns, mappings, 'lab')));
    if (names.length > 1 || labs.length > 1) {
      return {
        formulations: [],
        error: 'As linhas selecionadas têm produtos ou laboratórios diferentes. Escolha “Uma formulação por linha” ou selecione linhas de um mesmo produto.',
      };
    }
    return { formulations: [formulation], error: '' };
  }

  const formulations = rows.map((row) => createFormulation([row], sheet.columns, mappings));
  const invalidRow = formulations.find(({ name, lab }) => !name || !lab);
  if (invalidRow) {
    return {
      formulations: [],
      error: `A linha ${invalidRow.firstRowNumber} não tem nome do produto ou laboratório. Corrija a linha ou exclua-a da importação.`,
    };
  }
  return { formulations, error: '' };
}
