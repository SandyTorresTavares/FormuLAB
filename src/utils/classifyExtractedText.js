const sectionPatterns = [
  {
    field: 'name',
    pattern: /^(?:nome\s+(?:do\s+)?produto|produto|nome\s+comercial|marca)$/i,
    singleLine: true,
  },
  {
    field: 'lab',
    pattern: /^(?:fabricante|laborat[oó]rio|empresa|ind[uú]stria)$/i,
    singleLine: true,
  },
  {
    field: 'ingredientsText',
    pattern: /^(?:composi[cç][aã]o(?:\s+(?:do\s+)?produto|\s+qualitativa(?:\s+e\s+quantitativa)?)?|formula[cç][aã]o(?:\s+qualitativa(?:\s+e\s+quantitativa)?)?|ingredientes|mat[eé]rias[-\s]?primas|componentes)$/i,
  },
  {
    field: 'summary',
    pattern: /^(?:resumo|descri[cç][aã]o(?:\s+do\s+produto)?|finalidade|aplica[cç][aã]o|indica[cç][aã]o(?:\s+de\s+uso)?)$/i,
  },
  {
    field: 'procedure',
    pattern: /^(?:modo\s+de\s+preparo|procedimento|processo\s+de\s+fabrica[cç][aã]o|etapas\s+de\s+fabrica[cç][aã]o|ordem\s+de\s+(?:adi[cç][aã]o|mistura)|preparo)$/i,
  },
  {
    field: 'patentNotes',
    pattern: /^(?:patentes?|observa[cç][oõ]es\s+sobre\s+patentes?|propriedade\s+intelectual|refer[eê]ncias?\s+de\s+patentes?)$/i,
  },
];

// Remove marcadores de lista e espaços extras para facilitar a leitura das linhas.
function normalizeLine(line) {
  return line
    .replace(/^\s*(?:[-*•]|\d+(?:\.\d+)*[.)])\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Identifica se uma linha inicia uma seção conhecida do documento extraído.
function parseSectionHeading(line) {
  const cleanedLine = normalizeLine(line);
  for (const section of sectionPatterns) {
    const match = cleanedLine.match(/^(.+?)(?::|[-–—]\s+|$)\s*(.*)$/);
    if (match && section.pattern.test(match[1].trim())) {
      return { field: section.field, value: match[2].trim(), singleLine: section.singleLine };
    }
  }
  return null;
}

// Organiza o texto extraído por página nos campos do formulário de formulação.
export function classifyExtractedText(pages) {
  const fields = {
    name: '',
    lab: '',
    ingredientsText: '',
    summary: '',
    procedure: '',
    patentNotes: '',
  };
  let activeSection = null;

  for (const line of pages.flatMap(({ text }) => text.split(/\r?\n/))) {
    const pageMarker = line.match(/^\s*\[P[aá]gina\s+\d+\]\s*$/i);
    if (pageMarker) continue;

    const heading = parseSectionHeading(line);
    if (heading) {
      activeSection = heading.field;
      if (heading.value) {
        fields[heading.field] = [fields[heading.field], heading.value].filter(Boolean).join('\n');
      }
      if (heading.singleLine) activeSection = null;
      continue;
    }

    const value = normalizeLine(line);
    if (!value || !activeSection) continue;
    fields[activeSection] = [fields[activeSection], value].filter(Boolean).join('\n');
  }

  return Object.fromEntries(
    Object.entries(fields).map(([field, value]) => [field, value.trim()]),
  );
}
