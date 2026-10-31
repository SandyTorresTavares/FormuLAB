import { parse } from 'csv-parse/sync';
import ExcelJS from 'exceljs';

const maxRows = 200;
const maxColumns = 50;
const maxCellCharacters = 10000;
const maxSpreadsheetCharacters = 500000;

// Converte diferentes tipos de célula do Excel em texto seguro e limitado.
function cellToText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if ('result' in value) return cellToText(value.result);
    if ('text' in value) return String(value.text);
    if (Array.isArray(value.richText)) {
      return value.richText.map(({ text }) => text).join('');
    }
    if ('formula' in value) return String(value.formula);
    return '';
  }
  return String(value).slice(0, maxCellCharacters);
}

// Normaliza uma matriz de registros, identificando cabeçalho, linhas e limites da prévia.
function normalizeTable(name, records) {
  const headerIndex = records.findIndex((record) => record.some((value) => value.trim()));
  if (headerIndex < 0) return null;

  const header = records[headerIndex];
  const width = Math.max(...records.slice(headerIndex).map((record) => record.length));
  if (width > maxColumns) {
    throw new Error(`A aba "${name}" excede o limite de ${maxColumns} colunas.`);
  }
  if (records.length - headerIndex - 1 > maxRows) {
    throw new Error(`A aba "${name}" excede o limite de ${maxRows} linhas de dados.`);
  }

  const columns = Array.from({ length: width }, (_, index) => (
    header[index]?.trim() || `Coluna ${index + 1}`
  ));
  const rows = records.slice(headerIndex + 1)
    .map((record, index) => ({
      rowNumber: headerIndex + index + 2,
      values: Array.from({ length: width }, (_, columnIndex) => (
        String(record[columnIndex] ?? '').slice(0, maxCellCharacters)
      )),
      selected: true,
    }))
    .filter(({ values }) => values.some((value) => value.trim()));
  const totalCharacters = columns.reduce((total, column) => total + column.length, 0)
    + rows.reduce((total, row) => total + row.values.reduce((sum, value) => sum + value.length, 0), 0);
  if (totalCharacters > maxSpreadsheetCharacters) {
    throw new Error(`A planilha excede o limite de ${maxSpreadsheetCharacters} caracteres para pré-visualização.`);
  }

  return rows.length ? { name, columns, rows } : null;
}

// Lê o CSV enviado e transforma seu conteúdo no formato usado pela interface.
function parseCsv(buffer) {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
  const records = parse(text, {
    bom: true,
    delimiter: [',', ';', '\t'],
    max_record_size: maxCellCharacters * maxColumns,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: false,
  });
  return normalizeTable('CSV', records);
}

// Percorre as abas de um arquivo XLSX e converte cada aba válida em uma tabela.
async function parseWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const tables = [];
  let totalCharacters = 0;

  for (const worksheet of workbook.worksheets) {
    if (worksheet.rowCount > maxRows + 1 || worksheet.columnCount > maxColumns) {
      throw new Error(`A aba "${worksheet.name}" excede os limites de ${maxRows} linhas e ${maxColumns} colunas.`);
    }
    const records = [];
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      records.push(Array.from({ length: worksheet.columnCount }, (_, index) => (
        cellToText(row.getCell(index + 1).value)
      )));
    });
    const table = normalizeTable(worksheet.name, records);
    if (table) {
      totalCharacters += table.columns.reduce((total, column) => total + column.length, 0)
        + table.rows.reduce((total, row) => total + row.values.reduce((sum, value) => sum + value.length, 0), 0);
      if (totalCharacters > maxSpreadsheetCharacters) {
        throw new Error(`A planilha excede o limite de ${maxSpreadsheetCharacters} caracteres para pré-visualização.`);
      }
      tables.push(table);
    }
  }
  return tables;
}

// Valida o tipo do arquivo e escolhe o parser correspondente para CSV ou XLSX.
export async function parseSpreadsheetFile(file) {
  const extension = file.originalname.toLowerCase().split('.').pop();
  if (
    extension === 'csv'
    && ['', 'text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/octet-stream'].includes(file.mimetype)
  ) {
    const table = parseCsv(file.buffer);
    return table ? [table] : [];
  }
  if (
    extension === 'xlsx'
    && [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ].includes(file.mimetype)
    && file.buffer.subarray(0, 2).equals(Buffer.from('PK'))
  ) {
    return parseWorkbook(file.buffer);
  }
  throw new Error('Envie um arquivo .xlsx ou .csv válido.');
}
