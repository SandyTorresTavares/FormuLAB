import React, { useEffect, useState } from 'react';
import { classifyExtractedText } from './utils/classifyExtractedText.js';
import { buildSpreadsheetFormulations, inferSpreadsheetMappings } from './utils/spreadsheetImport.js';
import { 
  Upload, 
  Search, 
  FileText, 
  Filter, 
  ChevronDown, 
  PlusCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Cpu,
  Eye,
  AlertCircle,
  Edit3,
  Trash2,
  History,
  LogOut,
  Building2,
  FlaskConical,
  X,
  Clock,
  User,
  ArrowRight,
  Menu
} from 'lucide-react';

// Renderiza o logotipo vetorial reutilizável do FormuLAB.
const LogoFormulab = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 220 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="formulabGradient"
        x1="45"
        y1="105"
        x2="175"
        y2="105"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#12C4C9" />
        <stop offset="0.48" stopColor="#18BBC5" />
        <stop offset="0.53" stopColor="#A978DE" />
        <stop offset="1" stopColor="#B877DB" />
      </linearGradient>

      <linearGradient
        id="moleculeGradient"
        x1="85"
        y1="80"
        x2="175"
        y2="145"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#16BFC7" />
        <stop offset="1" stopColor="#B477DC" />
      </linearGradient>
    </defs>

    {/* FRASCO */}
    <path
      d="M73 48 H145 C150 48 153 44 153 39 C153 34 149 31 144 31 H76 C71 31 67 34 67 39 C67 44 70 48 73 48"
      stroke="url(#formulabGradient)"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M78 48 V86 C78 94 75 101 71 108 L48 149 C42 160 45 172 54 179 C59 183 65 185 73 185 H113"
      stroke="#16BFC7"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M142 48 V86 C142 94 145 101 149 108 L172 149 C178 160 175 172 166 179 C161 183 155 185 147 185 H108"
      stroke="#B477DC"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M78 48 H142"
      stroke="url(#formulabGradient)"
      strokeWidth="9"
      strokeLinecap="round"
    />

    {/* MOLÉCULA PRINCIPAL */}
    <g stroke="url(#moleculeGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M104 89 L118 119 L94 138" />
      <path d="M118 119 L143 102" />
      <path d="M118 119 L108 83" />
      <path d="M118 119 L145 139" />
      <path d="M143 102 L158 82" />
      <path d="M158 82 L178 68" />
      <path d="M145 139 L170 124" />
    </g>

    <circle cx="104" cy="89" r="10" fill="#15BEC6" />
    <circle cx="118" cy="119" r="15" fill="url(#moleculeGradient)" />
    <circle cx="94" cy="138" r="7" fill="#18BEC7" />
    <circle cx="143" cy="102" r="8" fill="#A977DB" />
    <circle cx="158" cy="82" r="7" fill="#A977DB" />
    <circle cx="178" cy="68" r="6" fill="#B477DC" />
    <circle cx="145" cy="139" r="7" fill="#A977DB" />
    <circle cx="170" cy="124" r="6" fill="#B477DC" />

    {/* HEXÁGONOS */}
    <path
      d="M166 48 L179 40 L192 48 L192 63 L179 71 L166 63 Z"
      fill="white"
      stroke="#A977DB"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      d="M169 91 L182 83 L195 91 L195 106 L182 114 L169 106 Z"
      fill="white"
      stroke="#A977DB"
      strokeWidth="6"
      strokeLinejoin="round"
    />

    <path d="M158 82 L166 63" stroke="#A977DB" strokeWidth="6" strokeLinecap="round" />
    <path d="M170 124 L169 106" stroke="#A977DB" strokeWidth="6" strokeLinecap="round" />

    {/* BOLHAS */}
    <circle cx="72" cy="143" r="3.5" fill="#16BEC7" />
    <circle cx="82" cy="151" r="2.5" fill="#16BEC7" />
    <circle cx="66" cy="157" r="2.5" fill="#16BEC7" />
    <circle cx="91" cy="121" r="3" fill="#16BEC7" />
    <circle cx="79" cy="132" r="2" fill="#16BEC7" />
    <circle cx="127" cy="151" r="3.5" fill="#18BFC7" />
    <circle cx="137" cy="159" r="2.5" fill="#B477DC" />
    <circle cx="119" cy="151" r="8" fill="white" />
    <circle cx="119" cy="151" r="4" fill="#B477DC" opacity="0.9" />
  </svg>
);

// Apresenta datas das formulações no padrão brasileiro, preservando valores inválidos.
const formatFormulaDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

export default function App() {
  const [activeTab, setActiveTab] = useState('buscar'); // 'cadastrar' | 'buscar' | 'gerenciar' | 'revisadas' | 'usuarios'
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [accountList, setAccountList] = useState([]);
  const [accountMessage, setAccountMessage] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const canEditPrivate = currentUser?.isAdmin || currentUser?.permissions.includes('edit_private');
  const canReadPrivate = currentUser?.isAdmin || currentUser?.permissions.includes('read_private');
  const canPublish = currentUser?.isAdmin || currentUser?.permissions.includes('publish');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [draggingDocumentType, setDraggingDocumentType] = useState(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [pdfUploadMessage, setPdfUploadMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedPages, setExtractedPages] = useState([]);
  const [selectedTextRange, setSelectedTextRange] = useState(null);
  const [selectedTextTarget, setSelectedTextTarget] = useState('ingredientsText');
  const [textTransferMessage, setTextTransferMessage] = useState('');
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState(null);
  const [spreadsheetPreview, setSpreadsheetPreview] = useState(null);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [spreadsheetMappings, setSpreadsheetMappings] = useState({});
  const [spreadsheetGrouping, setSpreadsheetGrouping] = useState('single');
  const [isPreviewingSpreadsheet, setIsPreviewingSpreadsheet] = useState(false);
  const [isImportingSpreadsheet, setIsImportingSpreadsheet] = useState(false);
  const [spreadsheetMessage, setSpreadsheetMessage] = useState('');
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [selectionSaveMessage, setSelectionSaveMessage] = useState('');
  const [selectionSaved, setSelectionSaved] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    lab: '',
    ingredientsText: '',
    summary: '',
    procedure: '',
    patentNotes: '',
  });
  const [isSavingFormulation, setIsSavingFormulation] = useState(false);
  const [formulationSaveMessage, setFormulationSaveMessage] = useState('');
  const [isLoadingFormulations, setIsLoadingFormulations] = useState(false);
  const [formulationsError, setFormulationsError] = useState('');

  // Estados dos Filtros na aba de Busca
  const [searchGlobal, setSearchGlobal] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('Todos os Produtos');
  const [selectedLab, setSelectedLab] = useState('Todos os Laboratórios');
  const [selectedIngredient, setSelectedIngredient] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível verificar a sessão.');
        if (active) setCurrentUser(result.user);
      })
      .catch((error) => {
        if (active) setAuthMessage(error.message || 'Não foi possível verificar a sessão.');
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!['buscar', 'gerenciar'].includes(activeTab)) return undefined;

    const controller = new AbortController();
    // Carrega as formulações visíveis para a aba atualmente selecionada.
    const loadFormulations = async () => {
      setIsLoadingFormulations(true);
      setFormulationsError('');
      try {
        const response = await fetch('/api/formulations', {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Não foi possível carregar as formulações.');
        }
        setFormulations(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setFormulationsError(error.message || 'Falha ao carregar formulações do banco de dados.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingFormulations(false);
      }
    };

    loadFormulations();
    return () => controller.abort();
  }, [activeTab, currentUser?.id]);

  useEffect(() => {
    if (activeTab !== 'usuarios' || !currentUser?.isAdmin) return undefined;
    const controller = new AbortController();
    // Busca as contas para que o administrador possa revisar status e permissões.
    const loadAccounts = async () => {
      setIsLoadingAccounts(true);
      setAccountMessage('');
      try {
        const response = await fetch('/api/auth/users', { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível carregar as contas.');
        setAccountList(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAccountMessage(error.message || 'Falha ao carregar as contas.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingAccounts(false);
      }
    };
    loadAccounts();
    return () => controller.abort();
  }, [activeTab, currentUser?.id, currentUser?.isAdmin]);

  const handleAuthSubmit = async (event) => {
    // Envia login ou cadastro e atualiza o estado da sessão conforme a resposta da API.
    event.preventDefault();
    setAuthMessage('');
    try {
      const response = await fetch(`/api/auth/${authMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a solicitação.');
      if (authMode === 'register') {
        setAuthMessage(result.message);
        setAuthMode('login');
        setAuthForm({ name: '', email: authForm.email, password: '' });
        return;
      }
      setCurrentUser(result.user);
      setAuthPanelOpen(false);
      setAuthForm({ name: '', email: '', password: '' });
      setActiveTab('buscar');
      setAuthMessage('');
    } catch (error) {
      setAuthMessage(error.message || 'Falha ao autenticar.');
    }
  };

  const handleLogout = async () => {
    // Encerra a sessão no backend e limpa os dados privados exibidos na tela.
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Não foi possível encerrar a sessão.');
      }
      setCurrentUser(null);
      setIsUserMenuOpen(false);
      setActiveTab('buscar');
      setFormulations([]);
      setSelectedFormula(null);
      setEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      setAuthMessage(error.message || 'Falha ao encerrar a sessão.');
    }
  };

  const handleSaveAccount = async (account) => {
    // Salva o status e as permissões de uma conta administrada pelo usuário atual.
    setAccountMessage('');
    try {
      const response = await fetch(`/api/auth/users/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: account.status, permissions: account.permissions }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar a conta.');
      setAccountList((accounts) => accounts.map((item) => item.id === result.id ? result : item));
      setAccountMessage(`Permissões de ${result.email} atualizadas.`);
    } catch (error) {
      setAccountMessage(error.message || 'Falha ao atualizar permissões.');
    }
  };

  const handleDocumentSelection = (file, expectedType = 'any') => {
    // Valida o arquivo escolhido e reinicia o estado do fluxo de extração.
    setPdfUploadMessage('');
    setSelectionSaveMessage('');
    setSelectionSaved(false);
    setFormulationSaveMessage('');
    setReviewForm({
      name: '',
      lab: '',
      ingredientsText: '',
      summary: '',
      procedure: '',
      patentNotes: '',
    });
    setUploadedFile(null);
    setExtractedPages([]);
    setSelectedTextRange(null);
    setTextTransferMessage('');
    if (!file) return;
    const isPdf = file.type === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf');
    const isJpeg = file.type === 'image/jpeg' && /\.(jpe?g)$/i.test(file.name);
    const isPng = file.type === 'image/png' && /\.png$/i.test(file.name);
    if (!isPdf && !isJpeg && !isPng) {
      setSelectedFile(null);
      setPdfUploadMessage('Selecione um PDF, uma imagem JPEG ou PNG.');
      return;
    }
    if ((expectedType === 'pdf' && !isPdf) || (expectedType === 'image' && isPdf)) {
      setSelectedFile(null);
      setPdfUploadMessage(
        expectedType === 'pdf'
          ? 'Este campo aceita somente PDF. Selecione a imagem na área “Imagens ou Fotos”.'
          : 'Este campo aceita somente imagens PNG ou JPEG. Selecione o PDF na área “Documentos PDF”.',
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setPdfUploadMessage('O arquivo deve ter no máximo 10 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDocumentUpload = async () => {
    // Envia o documento e solicita a extração de texto, incluindo OCR quando necessário.
    if ((!selectedFile && !uploadedFile) || isUploadingDocument) return;

    setIsUploadingDocument(true);
    setPdfUploadMessage('');

    try {
      let documentToExtract = uploadedFile;
      if (!documentToExtract) {
        const formData = new FormData();
        formData.append('document', selectedFile);
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Não foi possível enviar o arquivo.');
        }
        documentToExtract = {
          id: result.id,
          name: result.originalName,
        };
        setUploadedFile(documentToExtract);
      }

      setPdfUploadMessage('Extraindo texto por página; imagens escaneadas serão lidas por OCR...');
      const extractionResponse = await fetch(`/api/uploads/${documentToExtract.id}/text`);
      const extractionResult = await extractionResponse.json();
      if (!extractionResponse.ok) {
        throw new Error(extractionResult.error || 'Não foi possível extrair o texto do PDF.');
      }

      setExtractedPages(extractionResult.pages.map((page) => ({
        ...page,
        selected: false,
      })));
      setSelectedTextRange(null);
      setTextTransferMessage('');
      setSelectedFile(null);
      const ocrPages = extractionResult.pages.filter((page) => page.extractionMethod === 'ocr').length;
      setPdfUploadMessage(
        `Texto extraído de ${extractionResult.totalPages} página(s)${ocrPages ? `; OCR usado em ${ocrPages} página(s)` : ''}. Revise e selecione o que deseja guardar.`,
      );
    } catch (error) {
      const message = error.message || 'Falha ao enviar o arquivo. Verifique se o backend está aberto.';
      setPdfUploadMessage(
        message.includes('não parece ser um PDF válido')
          ? 'O backend ativo parece estar desatualizado. Reinicie o servidor na pasta backend/ para aceitar imagens PNG e JPEG.'
          : message,
      );
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleSpreadsheetSelection = (file) => {
    // Valida a extensão e o tamanho da planilha antes de preparar sua prévia.
    setSpreadsheetMessage('');
    setSpreadsheetPreview(null);
    setSelectedSheetName('');
    setSpreadsheetMappings({});
    if (!file) {
      setSelectedSpreadsheet(null);
      return;
    }
    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      setSelectedSpreadsheet(null);
      setSpreadsheetMessage('Selecione uma planilha .xlsx ou .csv.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedSpreadsheet(null);
      setSpreadsheetMessage('A planilha deve ter no máximo 10 MB.');
      return;
    }
    setSelectedSpreadsheet(file);
  };

  const handleSpreadsheetPreview = async () => {
    // Envia a planilha ao backend e carrega suas abas para mapeamento.
    if (!selectedSpreadsheet || isPreviewingSpreadsheet) return;
    setIsPreviewingSpreadsheet(true);
    setSpreadsheetMessage('Lendo as abas e preparando a prévia editável...');
    try {
      const formData = new FormData();
      formData.append('spreadsheet', selectedSpreadsheet);
      const response = await fetch('/api/spreadsheets/preview', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível ler a planilha.');
      }
      setSpreadsheetPreview(result);
      setSelectedSheetName(result.sheets[0].name);
      setSpreadsheetMappings(inferSpreadsheetMappings(result.sheets[0].columns));
      setSpreadsheetGrouping('single');
      setSpreadsheetMessage(`${result.sheets.length} aba(s) lida(s). Associe as colunas, revise e confirme a importação.`);
    } catch (error) {
      setSpreadsheetMessage(error.message || 'Falha ao ler a planilha. Verifique se o backend está ativo.');
    } finally {
      setIsPreviewingSpreadsheet(false);
    }
  };

  const handleSpreadsheetImport = async () => {
    // Converte as linhas selecionadas em formulações e salva o lote no backend.
    const sheet = spreadsheetPreview?.sheets.find(({ name }) => name === selectedSheetName);
    if (!sheet || isImportingSpreadsheet) return;
    const { formulations: importedFormulations, error } = buildSpreadsheetFormulations(
      sheet,
      spreadsheetMappings,
      spreadsheetGrouping,
    );
    if (error) {
      setSpreadsheetMessage(error);
      return;
    }

    setIsImportingSpreadsheet(true);
    setSpreadsheetMessage('Salvando as formulações revisadas no banco de dados...');
    try {
      const response = await fetch('/api/formulations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formulations: importedFormulations }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível importar as formulações.');
      }
      setFormulations((current) => [...result, ...current]);
      setSpreadsheetMessage(`${result.length} formulação(ões) importada(s) e salva(s) no banco de dados.`);
      setSpreadsheetPreview(null);
      setSelectedSpreadsheet(null);
      setSelectedSheetName('');
      setActiveTab('buscar');
      setSearchGlobal('');
      setSelectedProduct('Todos os Produtos');
      setSelectedLab('Todos os Laboratórios');
      setSelectedIngredient('');
    } catch (error) {
      setSpreadsheetMessage(error.message || 'Falha ao salvar as formulações no banco de dados.');
    } finally {
      setIsImportingSpreadsheet(false);
    }
  };

  const activeSpreadsheetSheet = spreadsheetPreview?.sheets.find(
    ({ name }) => name === selectedSheetName,
  );
  const spreadsheetImportPlan = activeSpreadsheetSheet
    ? buildSpreadsheetFormulations(activeSpreadsheetSheet, spreadsheetMappings, spreadsheetGrouping)
    : { formulations: [], error: 'Selecione uma aba para importar.' };

  const handleSaveExtractedSelection = async () => {
    // Persiste as páginas revisadas para que possam originar uma formulação.
    if (!uploadedFile || isSavingSelection) return;

    setSelectionSaveMessage('');
    const selectedPages = extractedPages
      .filter((page) => page.selected && page.text.trim())
      .map(({ pageNumber, text }) => ({ pageNumber, text }));
    if (selectedPages.length === 0) {
      setSelectionSaveMessage('Marque a caixa ao lado de pelo menos uma página com texto para habilitar o salvamento.');
      return;
    }

    setIsSavingSelection(true);
    setSelectionSaveMessage('Salvando a seleção no banco de dados...');
    try {
      const response = await fetch(`/api/uploads/${uploadedFile.id}/selection`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPages }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível salvar a seleção.');
      }
      const classifiedFields = classifyExtractedText(selectedPages);
      const populatedFields = Object.entries(classifiedFields)
        .filter(([field, value]) => value && !reviewForm[field])
        .length;
      setReviewForm((form) => Object.fromEntries(
        Object.entries(form).map(([field, value]) => [
          field,
          value || classifiedFields[field] || '',
        ]),
      ));
      setSelectionSaveMessage(
        `${result.message} ${populatedFields
          ? `${populatedFields} campo(s) vazio(s) reconhecido(s) foi(foram) preenchido(s) automaticamente; confira e ajuste abaixo.`
          : 'Nenhum campo vazio foi classificado. Confira os rótulos e o texto das páginas; os campos que já tinham conteúdo foram mantidos.'}`,
      );
      setSelectionSaved(true);
      setFormulationSaveMessage('');
    } catch (error) {
      setSelectionSaveMessage(error.message || 'Falha ao salvar a seleção. Verifique se o backend está aberto.');
    } finally {
      setIsSavingSelection(false);
    }
  };

  const handleTransferSelectedText = (page) => {
    // Copia o trecho selecionado de uma página para o campo escolhido do formulário.
    if (!selectedTextRange || selectedTextRange.pageNumber !== page.pageNumber) return;
    const text = page.text.slice(selectedTextRange.start, selectedTextRange.end).trim();
    if (!text) {
      setTextTransferMessage('Selecione primeiro um trecho do texto extraído.');
      return;
    }

    setReviewForm((form) => {
      if (['name', 'lab'].includes(selectedTextTarget)) {
        return { ...form, [selectedTextTarget]: text };
      }
      const currentValue = form[selectedTextTarget];
      return {
        ...form,
        [selectedTextTarget]: currentValue ? `${currentValue}\n${text}` : text,
      };
    });
    setTextTransferMessage('Trecho inserido no campo de revisão. Confira e edite se necessário.');
    setSelectedTextRange(null);
  };

  const handleSaveFormulation = async (event) => {
    // Valida e salva a formulação criada a partir do documento revisado.
    event.preventDefault();
    if (!uploadedFile || !selectionSaved || isSavingFormulation) return;

    setIsSavingFormulation(true);
    setFormulationSaveMessage('Salvando a formulação no MongoDB...');
    try {
      const response = await fetch(`/api/uploads/${uploadedFile.id}/formulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewForm.name,
          lab: reviewForm.lab,
          ingredients: reviewForm.ingredientsText
            .split('\n')
            .map((ingredient) => ingredient.trim())
            .filter(Boolean),
          summary: reviewForm.summary,
          procedure: reviewForm.procedure,
          patentNotes: reviewForm.patentNotes,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível cadastrar a formulação.');
      }

      setFormulations((current) => [result, ...current.filter((item) => item.id !== result.id)]);
      setFormulationSaveMessage('Formulação cadastrada no banco. Ela aparecerá na busca.');
      setActiveTab('buscar');
      setSearchGlobal('');
      setSelectedProduct('Todos os Produtos');
      setSelectedLab('Todos os Laboratórios');
      setSelectedIngredient('');
    } catch (error) {
      setFormulationSaveMessage(error.message || 'Falha ao salvar. Verifique se o backend está aberto.');
    } finally {
      setIsSavingFormulation(false);
    }
  };

  const [formulations, setFormulations] = useState([]);

  // Histórico de Edições / Logs de Alterações
  const [revisionHistory, setRevisionHistory] = useState([
    {
      id: 101,
      formulaName: 'Pasta de Dente Total Care',
      changedBy: 'Dra. Helena Martins (Lab Sinergia)',
      role: 'Farmacêutica Responsável',
      date: '21/05/2026 às 14:32',
      fieldChanged: 'Dosagem do Ingrediente Ativo',
      oldValue: 'Flúor Ativo (0.20%)',
      newValue: 'Flúor Ativo (0.24%)',
      reason: 'Ajuste de conformidade técnica para atendimento às normas da Anvisa.'
    },
    {
      id: 102,
      formulaName: 'Shampoo Hidratante Premium',
      changedBy: 'Carlos Eduardo (Lab BioTech)',
      role: 'Analista de P&D',
      date: '22/05/2026 às 09:15',
      fieldChanged: 'Adição de Conservante Natural',
      oldValue: 'Sem conservante vegetal',
      newValue: 'Adicionado Extrato de Aloe Vera (5%)',
      reason: 'Aumento da validade de prateleira e apelo dermocosmético.'
    }
  ]);

  const handleDeleteFormula = async (id) => {
    // Remove uma formulação após a confirmação do usuário e atualiza a lista local.
    if (window.confirm("Tem certeza que deseja remover esta formulação do sistema?")) {
      setFormulationsError('');
      try {
        const response = await fetch(`/api/formulations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Não foi possível excluir a formulação.');
        }
        setFormulations((current) => current.filter((formula) => formula.id !== id));
        if (selectedFormula?.id === id) setSelectedFormula(null);
      } catch (error) {
        setFormulationsError(error.message || 'Falha ao excluir a formulação.');
      }
    }
  };

  const handleOpenEdit = (formula) => {
    // Abre o editor preenchido com os dados da formulação selecionada.
    setEditingItem({...formula});
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    // Envia as alterações da formulação e fecha o editor quando a API confirma o salvamento.
    e.preventDefault();
    if (!editingItem) return;

    setFormulationsError('');
    try {
      const response = await fetch(`/api/formulations/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(canEditPrivate
          ? (canPublish
            ? editingItem
            : Object.fromEntries(Object.entries(editingItem).filter(([field]) => field !== 'visibility')))
          : { visibility: editingItem.visibility }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível atualizar a formulação.');
      }
      setFormulations((current) => current.map((formula) => (
        formula.id === result.id ? result : formula
      )));

      if (canEditPrivate) {
        const newLog = {
        id: Date.now(),
        formulaName: result.name,
        changedBy: 'Sandy Torres Tavares',
        role: 'Administradora / Pesquisadora',
        date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        fieldChanged: 'Resumo e especificações da formulação',
        oldValue: formulations.find((formula) => formula.id === result.id)?.summary || 'Versão anterior',
        newValue: result.summary,
        reason: 'Edição manual realizada no painel de gerenciamento.',
        };

        setRevisionHistory((history) => [newLog, ...history]);
      }
      setEditModalOpen(false);
    } catch (error) {
      setFormulationsError(error.message || 'Falha ao atualizar a formulação.');
    }
  };

  const filteredFormulations = formulations.filter(item => {
    const matchesGlobal = item.name.toLowerCase().includes(searchGlobal.toLowerCase()) ||
                          item.lab.toLowerCase().includes(searchGlobal.toLowerCase()) ||
                          (item.ingredients || []).some((ingredient) => ingredient.toLowerCase().includes(searchGlobal.toLowerCase())) ||
                          (item.summary || '').toLowerCase().includes(searchGlobal.toLowerCase()) ||
                          (item.procedure || '').toLowerCase().includes(searchGlobal.toLowerCase()) ||
                          (item.extractedText || '').toLowerCase().includes(searchGlobal.toLowerCase());
    const matchesProduct = selectedProduct === 'Todos os Produtos' || item.name === selectedProduct;
    const matchesLab = selectedLab === 'Todos os Laboratórios' || item.lab === selectedLab;
    const matchesIngredient = selectedIngredient === '' || 
      (item.ingredients || []).some(ing => ing.toLowerCase().includes(selectedIngredient.toLowerCase()));

    return matchesGlobal && matchesProduct && matchesLab && matchesIngredient;
  });
  const productOptions = [...new Set(formulations.map((item) => item.name))].sort();
  const labOptions = [...new Set(formulations.map((item) => item.lab))].sort();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR LATERAL DESKTOP */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <LogoFormulab className="w-11 h-11 flex-shrink-0" />
            <div>
              <h1 className="font-extrabold text-xl text-[#1F2937] tracking-tight leading-none">
                Formu<span className="text-[#34495E]">Lab</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                Gerenciamento de Formulações
              </p>
            </div>
          </div>

          <nav className="space-y-1.5" aria-label="Navegação Principal Desktop">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Painel Geral</p>
            
            {canEditPrivate && <button
              onClick={() => setActiveTab('cadastrar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'cadastrar'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Cadastrar Nova Formulação</span>
            </button>}

            <button
              onClick={() => setActiveTab('buscar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'buscar'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Buscar Formulações</span>
            </button>

            {(canEditPrivate || canPublish) && <button
              onClick={() => setActiveTab('gerenciar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'gerenciar'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Gerenciar Formulações</span>
            </button>}

            {currentUser && <button
              onClick={() => setActiveTab('revisadas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'revisadas'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Formulações Revisadas</span>
            </button>}
            {currentUser?.isAdmin && <button
              onClick={() => setActiveTab('usuarios')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'usuarios' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Gerenciar Contas</span>
            </button>}
          </nav>
        </div>

        <div className="border-t border-slate-100 pt-3 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            FormuLab &copy; 2026
          </p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL COM CABEÇALHO RESPONSIVO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* CABEÇALHO SUPERIOR (DESKTOP E MOBILE) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
          <div className="h-16 flex items-center justify-between px-4 sm:px-8">
            
            {/* Logo Mobile + Caminho da Página */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <LogoFormulab className="w-8 h-8" />
                <span className="font-bold text-slate-800 text-base">FormuLab</span>
              </div>

              <div className="hidden sm:flex text-xs text-slate-500 font-medium items-center gap-2">
                <span>FormuLab</span>
                <span>/</span>
                <span className="text-slate-800 font-bold capitalize">
                  {activeTab === 'cadastrar' && 'Cadastrar Nova Formulação'}
                  {activeTab === 'buscar' && 'Buscar Formulações'}
                  {activeTab === 'gerenciar' && 'Gerenciar & Editar Formulações'}
                  {activeTab === 'revisadas' && 'Formulações Revisadas e Histórico'}
                  {activeTab === 'usuarios' && 'Gerenciar Contas'}
                </span>
              </div>
            </div>

            {/* CONTROLES DO USUÁRIO & MENU HAMBÚRGUER */}
            <div className="flex items-center gap-2">
              
              {/* Menu de Perfil */}
              <div className="relative">
                <button 
                  onClick={() => {
                    if (!currentUser) {
                      setAuthMode('login');
                      setAuthPanelOpen(true);
                    } else {
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }
                  }}
                  aria-expanded={isUserMenuOpen}
                  aria-label="Abrir perfil do usuário"
                  className="flex items-center gap-2 sm:gap-3 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-full border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : '?'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">
                      {currentUser ? currentUser.name : 'Visitante público'}
                    </p>
                    <p className="text-[10px] text-teal-600 font-medium mt-0.5">
                      {currentUser?.isAdmin ? 'Administrador' : currentUser ? currentUser.email : 'Somente consulta'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {currentUser && isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Sessão Atual</p>
                      <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      Sair (Logout)
                    </button>
                  </div>
                )}
                {!currentUser && (
                  <button
                    onClick={() => { setAuthMode('register'); setAuthMessage(''); setAuthPanelOpen(true); }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-left text-xs text-purple-700 font-semibold"
                  >
                    Solicitar uma conta
                  </button>
                )}
              </div>

              {/* Botão Menu Hambúrguer (Mobile) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir Menu de Navegação"
                aria-expanded={mobileMenuOpen}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>

          {/* MENU MOBILE EXPANSÍVEL */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1" aria-label="Navegação Mobile">
              {canEditPrivate && <button
                onClick={() => { setActiveTab('cadastrar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'cadastrar' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-purple-600" />
                Cadastrar Nova Formulação
              </button>}
              <button
                onClick={() => { setActiveTab('buscar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'buscar' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <Search className="w-4 h-4 text-purple-600" />
                Buscar Formulações
              </button>
              {(canEditPrivate || canPublish) && <button
                onClick={() => { setActiveTab('gerenciar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'gerenciar' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                Gerenciar Formulações
              </button>}
              {currentUser && <button
                onClick={() => { setActiveTab('revisadas'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'revisadas' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <History className="w-4 h-4 text-purple-600" />
                Formulações Revisadas
              </button>}
              {currentUser?.isAdmin && <button
                onClick={() => { setActiveTab('usuarios'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600"
              >
                <User className="w-4 h-4 text-purple-600" />
                Gerenciar Contas
              </button>}
            </nav>
          )}
        </header>

        {/* CONTEÚDO PRINCIPAL (MUDANÇA DE ABAS) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          
          {/* ABA 1: CADASTRAR NOVA FORMULAÇÃO */}
          {activeTab === 'cadastrar' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Cadastrar Nova Formulação</h2>
                <p className="text-xs text-slate-500">Importe planilhas ou extraia texto de PDFs e imagens; revise os dados antes de salvar.</p>
              </div>

              {/* CARD DE AVISO */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-amber-950 mb-0.5">Sobre a leitura dos documentos</p>
                  <p className="text-amber-800">
                    PDFs escaneados e imagens são lidos por OCR local em português e inglês. A leitura pode conter erros: revise e edite o texto reconhecido antes de guardar. O sistema não interpreta nem confirma fórmulas químicas automaticamente.
                  </p>
                </div>
              </div>

              {/* OPÇÕES DE CARREGAMENTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                      <FileText className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Documentos PDF</h3>
                      <p className="text-xs text-slate-400">PDFs digitais ou escaneados</p>
                    </div>
                  </div>
                  <label
                    htmlFor="pdf-upload"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDraggingDocumentType('pdf');
                    }}
                    onDragLeave={() => setDraggingDocumentType(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDraggingDocumentType(null);
                      handleDocumentSelection(event.dataTransfer.files[0], 'pdf');
                    }}
                    className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 ${
                      draggingDocumentType === 'pdf' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="sr-only"
                      onChange={(event) => {
                        handleDocumentSelection(event.target.files[0], 'pdf');
                        event.target.value = '';
                      }}
                    />
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-600">
                      {selectedFile?.type === 'application/pdf' ? selectedFile.name : 'Arraste ou selecione um arquivo PDF'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF digital ou escaneado até 10 MB</p>
                  </label>
                  {selectedFile?.type === 'application/pdf' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPdfUploadMessage('');
                      }}
                      className="mt-2 text-xs font-medium text-slate-500 hover:text-red-600"
                    >
                      Remover PDF selecionado
                    </button>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Planilhas de Composição</h3>
                      <p className="text-xs text-slate-400">Excel .xlsx ou CSV até 10 MB</p>
                    </div>
                  </div>
                  <label
                    htmlFor="spreadsheet-upload"
                    className="block border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
                  >
                    <input
                      id="spreadsheet-upload"
                      type="file"
                      accept=".xlsx,.csv"
                      className="sr-only"
                      onChange={(event) => {
                        handleSpreadsheetSelection(event.target.files[0]);
                        event.target.value = '';
                      }}
                    />
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-600">
                      {selectedSpreadsheet?.name || 'Selecione uma planilha Excel ou CSV'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">A primeira linha preenchida é usada como cabeçalho</p>
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSpreadsheet && (
                      <button
                        type="button"
                        onClick={() => handleSpreadsheetSelection(null)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Remover planilha
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSpreadsheetPreview}
                      disabled={!selectedSpreadsheet || isPreviewingSpreadsheet}
                      className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPreviewingSpreadsheet ? 'Lendo planilha...' : 'Ler e revisar planilha'}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                      <ImageIcon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Imagens ou Fotos</h3>
                      <p className="text-xs text-slate-400">OCR local em português e inglês</p>
                    </div>
                  </div>
                  <label
                    htmlFor="image-upload"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDraggingDocumentType('image');
                    }}
                    onDragLeave={() => setDraggingDocumentType(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDraggingDocumentType(null);
                      handleDocumentSelection(event.dataTransfer.files[0], 'image');
                    }}
                    className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 ${
                      draggingDocumentType === 'image' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-400'
                    }`}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      className="sr-only"
                      onChange={(event) => {
                        handleDocumentSelection(event.target.files[0], 'image');
                        event.target.value = '';
                      }}
                    />
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-600">
                      {selectedFile && selectedFile.type !== 'application/pdf'
                        ? selectedFile.name
                        : 'Arraste ou selecione uma imagem PNG ou JPEG'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Formatos PNG e JPEG até 10 MB</p>
                  </label>
                  {selectedFile && selectedFile.type !== 'application/pdf' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPdfUploadMessage('');
                      }}
                      className="mt-2 text-xs font-medium text-slate-500 hover:text-red-600"
                    >
                      Remover imagem selecionada
                    </button>
                  )}
                </div>
              </div>

              {spreadsheetMessage && (
                <p role="status" aria-live="polite" className="text-sm text-slate-600">
                  {spreadsheetMessage}
                </p>
              )}

              {spreadsheetPreview && activeSpreadsheetSheet && (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
                    <div>
                      <h3 className="font-bold text-slate-800">Revisar e mapear planilha</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Associe cada coluna a um campo. As células e linhas selecionadas podem ser editadas antes de salvar.
                      </p>
                    </div>
                    {spreadsheetPreview.sheets.length > 1 && (
                      <div>
                        <label htmlFor="spreadsheet-sheet" className="mb-1 block text-xs font-bold text-slate-700">
                          Aba da planilha
                        </label>
                        <select
                          id="spreadsheet-sheet"
                          value={selectedSheetName}
                          onChange={(event) => {
                            const sheet = spreadsheetPreview.sheets.find(({ name }) => name === event.target.value);
                            setSelectedSheetName(event.target.value);
                            setSpreadsheetMappings(inferSpreadsheetMappings(sheet.columns));
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm sm:max-w-sm"
                        >
                          {spreadsheetPreview.sheets.map((sheet) => (
                            <option key={sheet.name} value={sheet.name}>{sheet.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label htmlFor="spreadsheet-grouping" className="mb-1 block text-xs font-bold text-slate-700">
                        Como agrupar as linhas selecionadas
                      </label>
                      <select
                        id="spreadsheet-grouping"
                        value={spreadsheetGrouping}
                        onChange={(event) => setSpreadsheetGrouping(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm sm:max-w-md"
                      >
                        <option value="single">Todas em uma formulação (mesmo produto e laboratório)</option>
                        <option value="rows">Uma formulação por linha</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {activeSpreadsheetSheet.columns.map((column, columnIndex) => (
                        <div key={`${column}-${columnIndex}`}>
                          <label
                            htmlFor={`spreadsheet-column-${columnIndex}`}
                            className="mb-1 block truncate text-xs font-semibold text-slate-700"
                            title={column}
                          >
                            {column}
                          </label>
                          <select
                            id={`spreadsheet-column-${columnIndex}`}
                            value={spreadsheetMappings[columnIndex] || 'ignore'}
                            onChange={(event) => setSpreadsheetMappings((current) => ({
                              ...current,
                              [columnIndex]: event.target.value,
                            }))}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                          >
                            <option value="ignore">Não mapear</option>
                            <option value="name">Nome do produto</option>
                            <option value="lab">Laboratório / fabricante</option>
                            <option value="ingredients">Ingrediente / composição</option>
                            <option value="summary">Resumo / finalidade</option>
                            <option value="procedure">Procedimento</option>
                            <option value="patentNotes">Observações sobre patentes</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {activeSpreadsheetSheet.rows.filter((row) => row.selected).length} de {activeSpreadsheetSheet.rows.length} linhas selecionadas
                      </span>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSpreadsheetPreview((current) => ({
                            ...current,
                            sheets: current.sheets.map((sheet) => sheet.name !== selectedSheetName
                              ? sheet
                              : { ...sheet, rows: sheet.rows.map((row) => ({ ...row, selected: true })) }),
                          }))}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                        >
                          Selecionar todas
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpreadsheetPreview((current) => ({
                            ...current,
                            sheets: current.sheets.map((sheet) => sheet.name !== selectedSheetName
                              ? sheet
                              : { ...sheet, rows: sheet.rows.map((row) => ({ ...row, selected: false })) }),
                          }))}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Limpar seleção
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[55vh] overflow-auto">
                    <table className="min-w-full border-collapse text-left text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-700">
                        <tr>
                          <th className="border-b border-slate-200 p-2">Usar</th>
                          <th className="border-b border-slate-200 p-2">Linha</th>
                          {activeSpreadsheetSheet.columns.map((column, index) => (
                            <th key={`${column}-${index}`} className="min-w-40 border-b border-slate-200 p-2">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeSpreadsheetSheet.rows.map((row, rowIndex) => (
                          <tr key={row.rowNumber} className="odd:bg-white even:bg-slate-50">
                            <td className="border-b border-slate-100 p-2 text-center">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                aria-label={`Incluir linha ${row.rowNumber}`}
                                onChange={(event) => setSpreadsheetPreview((current) => ({
                                  ...current,
                                  sheets: current.sheets.map((sheet) => sheet.name !== selectedSheetName
                                    ? sheet
                                    : {
                                      ...sheet,
                                      rows: sheet.rows.map((item, index) => index === rowIndex
                                        ? { ...item, selected: event.target.checked }
                                        : item),
                                    }),
                                }))}
                                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                              />
                            </td>
                            <td className="border-b border-slate-100 p-2 text-slate-500">{row.rowNumber}</td>
                            {activeSpreadsheetSheet.columns.map((column, columnIndex) => (
                              <td key={`${column}-${columnIndex}`} className="border-b border-slate-100 p-1">
                                <input
                                  aria-label={`Linha ${row.rowNumber}, ${column}`}
                                  value={row.values[columnIndex] || ''}
                                  onChange={(event) => setSpreadsheetPreview((current) => ({
                                    ...current,
                                    sheets: current.sheets.map((sheet) => sheet.name !== selectedSheetName
                                      ? sheet
                                      : {
                                        ...sheet,
                                        rows: sheet.rows.map((item, index) => index === rowIndex
                                          ? {
                                            ...item,
                                            values: item.values.map((value, valueIndex) => (
                                              valueIndex === columnIndex ? event.target.value : value
                                            )),
                                          }
                                          : item),
                                      }),
                                  }))}
                                  className="w-full min-w-36 rounded border border-transparent bg-transparent px-2 py-1.5 hover:border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 p-4 sm:p-5">
                    {spreadsheetImportPlan.error && (
                      <p role="status" className="text-sm text-amber-700">{spreadsheetImportPlan.error}</p>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Prévia: {spreadsheetImportPlan.formulations.length} formulação(ões). Os dados originais de todas as colunas selecionadas também serão guardados para conferência.
                      </p>
                      <button
                        type="button"
                        onClick={handleSpreadsheetImport}
                        disabled={isImportingSpreadsheet || Boolean(spreadsheetImportPlan.error)}
                        className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isImportingSpreadsheet ? 'Salvando no banco...' : 'Confirmar e salvar no banco'}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {pdfUploadMessage && (
                <p role="status" className="text-sm text-slate-600" aria-live="polite">
                  {pdfUploadMessage}
                </p>
              )}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleDocumentUpload}
                  disabled={(!selectedFile && (!uploadedFile || extractedPages.length > 0)) || isUploadingDocument}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {isUploadingDocument
                      ? 'Enviando e extraindo texto...'
                      : uploadedFile
                        ? 'Tentar extração novamente'
                        : selectedFile?.type === 'application/pdf'
                          ? 'Enviar PDF e extrair texto'
                          : 'Enviar imagem e extrair por OCR'}
                  </span>
                </button>
              </div>

              {uploadedFile && extractedPages.length > 0 && (
                <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Prévia do texto integral</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {uploadedFile.name} — revise e edite o texto antes de marcar as páginas que quer guardar.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {extractedPages.filter((page) => page.selected).length} de {extractedPages.length} páginas selecionadas
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionSaveMessage('');
                            setSelectionSaved(false);
                            setExtractedPages((pages) => pages.map((page) => ({
                              ...page,
                              selected: Boolean(page.text.trim()),
                            })));
                          }}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                        >
                          Selecionar páginas com texto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionSaveMessage('');
                            setSelectionSaved(false);
                            setExtractedPages((pages) => pages.map((page) => ({
                              ...page,
                              selected: false,
                            })));
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Limpar seleção
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 bg-purple-50/50 p-4 sm:p-5 space-y-3">
                    <p className="text-xs text-slate-600">
                      Para preencher sem copiar e colar, selecione um trecho no texto extraído, escolha o campo e clique em “Inserir trecho” na página correspondente.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1">
                        <label htmlFor="extracted-text-target" className="mb-1 block text-xs font-bold text-slate-700">
                          Campo que receberá o trecho selecionado
                        </label>
                        <select
                          id="extracted-text-target"
                          value={selectedTextTarget}
                          onChange={(event) => {
                            setSelectedTextTarget(event.target.value);
                            setTextTransferMessage('');
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="name">Nome do produto</option>
                          <option value="lab">Fabricante ou laboratório</option>
                          <option value="ingredientsText">Ingredientes</option>
                          <option value="summary">Resumo e finalidade</option>
                          <option value="procedure">Procedimento</option>
                          <option value="patentNotes">Observações sobre patentes</option>
                        </select>
                      </div>
                      {textTransferMessage && (
                        <p role="status" aria-live="polite" className="text-xs text-teal-700">
                          {textTransferMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                    {extractedPages.map((page) => (
                      <div key={page.pageNumber} className="p-4 sm:p-5 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={page.selected}
                            disabled={!page.text.trim()}
                            onChange={(event) => {
                              setSelectionSaveMessage('');
                              setSelectionSaved(false);
                              setExtractedPages((pages) => pages.map((item) => (
                                item.pageNumber === page.pageNumber
                                  ? { ...item, selected: event.target.checked }
                                  : item
                              )));
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          Página {page.pageNumber}
                          {page.extractionMethod === 'ocr' && (
                            <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">OCR</span>
                          )}
                        </label>
                        <textarea
                          aria-label={`Texto extraído da página ${page.pageNumber}`}
                          rows={8}
                          value={page.text}
                          onSelect={(event) => {
                            const { selectionStart, selectionEnd } = event.currentTarget;
                            if (selectionStart === selectionEnd) {
                              setSelectedTextRange(null);
                              return;
                            }
                            setSelectedTextRange({
                              pageNumber: page.pageNumber,
                              start: selectionStart,
                              end: selectionEnd,
                            });
                            setTextTransferMessage('');
                          }}
                          onChange={(event) => {
                            setSelectionSaveMessage('');
                            setSelectionSaved(false);
                            setSelectedTextRange(null);
                            setExtractedPages((pages) => pages.map((item) => (
                              item.pageNumber === page.pageNumber
                                ? { ...item, text: event.target.value }
                                : item
                            )));
                          }}
                          placeholder="Nenhum texto selecionável nesta página."
                          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleTransferSelectedText(page)}
                          disabled={selectedTextRange?.pageNumber !== page.pageNumber}
                          className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Inserir trecho no campo selecionado
                        </button>
                        {page.truncated && (
                          <p className="text-xs text-amber-700">
                            A prévia desta página foi limitada a 30.000 caracteres.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-[11px] text-slate-500">
                      Marque a caixa ao lado do número da página (não basta selecionar palavras no texto). Somente as páginas marcadas serão salvas; o PDF original permanece armazenado localmente.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveExtractedSelection}
                      disabled={isSavingSelection || !extractedPages.some((page) => page.selected && page.text.trim())}
                      className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:opacity-100"
                    >
                      {isSavingSelection ? 'Salvando seleção...' : 'Guardar páginas selecionadas'}
                    </button>
                  </div>
                  <p
                    role="status"
                    aria-live="polite"
                    className={`px-4 pb-4 text-sm ${
                      selectionSaveMessage.startsWith('Sua seleção')
                        ? 'text-teal-700'
                        : selectionSaveMessage.startsWith('Salvando')
                          ? 'text-slate-600'
                          : 'text-red-700'
                    }`}
                  >
                    {selectionSaveMessage || (
                      extractedPages.some((page) => page.selected && page.text.trim())
                        ? 'Páginas marcadas. Clique em “Guardar páginas selecionadas” para salvar.'
                        : 'Marque uma ou mais páginas para habilitar o botão.'
                    )}
                  </p>
                </section>
              )}

              {selectionSaved && uploadedFile && (
                <form onSubmit={handleSaveFormulation} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Revisar e cadastrar formulação</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Campos com rótulos reconhecidos foram preenchidos automaticamente. Confira e corrija cada valor; campos que já tinham conteúdo não foram substituídos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="formula-name" className="block text-xs font-bold text-slate-700 mb-1">Nome do produto *</label>
                      <input
                        id="formula-name"
                        type="text"
                        maxLength={200}
                        required
                        value={reviewForm.name}
                        onChange={(event) => setReviewForm((form) => ({ ...form, name: event.target.value }))}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="formula-lab" className="block text-xs font-bold text-slate-700 mb-1">Fabricante ou laboratório *</label>
                      <input
                        id="formula-lab"
                        type="text"
                        maxLength={200}
                        required
                        value={reviewForm.lab}
                        onChange={(event) => setReviewForm((form) => ({ ...form, lab: event.target.value }))}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="formula-ingredients" className="block text-xs font-bold text-slate-700 mb-1">Ingredientes, um por linha</label>
                    <textarea
                      id="formula-ingredients"
                      rows={5}
                      maxLength={30000}
                      value={reviewForm.ingredientsText}
                      onChange={(event) => setReviewForm((form) => ({ ...form, ingredientsText: event.target.value }))}
                      placeholder={'Exemplo:\nÁgua (80%)\nTensoativo — concentração conforme documento'}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm leading-relaxed focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Registre nomes e concentrações conforme a fonte; não estime valores ausentes.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="formula-summary" className="block text-xs font-bold text-slate-700 mb-1">Resumo e finalidade do produto</label>
                    <textarea
                      id="formula-summary"
                      rows={3}
                      maxLength={5000}
                      value={reviewForm.summary}
                      onChange={(event) => setReviewForm((form) => ({ ...form, summary: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm leading-relaxed focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="formula-procedure" className="block text-xs font-bold text-slate-700 mb-1">Procedimento e ordem de mistura</label>
                    <textarea
                      id="formula-procedure"
                      rows={5}
                      maxLength={20000}
                      value={reviewForm.procedure}
                      onChange={(event) => setReviewForm((form) => ({ ...form, procedure: event.target.value }))}
                      placeholder="Copie ou resuma os passos que o documento informa e revise-os antes de salvar."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm leading-relaxed focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="formula-patents" className="block text-xs font-bold text-slate-700 mb-1">Observações sobre patentes (opcional)</label>
                    <textarea
                      id="formula-patents"
                      rows={2}
                      maxLength={5000}
                      value={reviewForm.patentNotes}
                      onChange={(event) => setReviewForm((form) => ({ ...form, patentNotes: event.target.value }))}
                      placeholder="Registre apenas o que a fonte diz, como número ou referência. Não declare livre de patente sem verificação especializada."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm leading-relaxed focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-[11px] text-amber-700">
                      Este campo é apenas uma anotação da fonte; o sistema não verifica situação legal ou liberdade de uso.
                    </p>
                  </div>

                  {formulationSaveMessage && (
                    <p role="status" aria-live="polite" className={`text-sm ${
                      formulationSaveMessage.startsWith('Formulação cadastrada')
                        ? 'text-teal-700'
                        : formulationSaveMessage.startsWith('Salvando')
                          ? 'text-slate-600'
                          : 'text-red-700'
                    }`}>
                      {formulationSaveMessage}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingFormulation}
                      className="rounded-xl bg-purple-600 px-5 py-3 text-xs font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSavingFormulation ? 'Salvando formulação...' : 'Confirmar e salvar formulação'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ABA 2: BUSCAR FORMULAÇÕES */}
          {activeTab === 'buscar' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {authReady && !canReadPrivate && (
                <p className="text-xs text-slate-500">
                  {currentUser
                    ? 'Sua conta pode consultar formulações públicas; os registros privados não são exibidos.'
                    : 'Modo público: consulte formulações públicas sem precisar entrar.'}
                </p>
              )}
              {formulationsError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formulationsError}
                </p>
              )}

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-700 tracking-wider uppercase">
                    <Filter className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    Filtros de Pesquisa
                  </div>
                  <button 
                    onClick={() => {
                      setSearchGlobal('');
                      setSelectedProduct('Todos os Produtos');
                      setSelectedLab('Todos os Laboratórios');
                      setSelectedIngredient('');
                    }}
                    className="text-xs text-slate-400 hover:text-purple-600 transition-colors font-medium focus:outline-none"
                  >
                    Limpar Filtros
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="busca-geral" className="block text-[11px] font-bold text-slate-500 mb-1">Pesquisa Geral</label>
                    <div className="relative">
                      <input 
                        id="busca-geral"
                        type="text" 
                        value={searchGlobal}
                        onChange={(e) => setSearchGlobal(e.target.value)}
                        placeholder="Nome, código ou termo..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="filtro-produto" className="block text-[11px] font-bold text-slate-500 mb-1">Produto</label>
                    <select 
                      id="filtro-produto"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-slate-700 font-medium focus:ring-1 focus:ring-purple-500"
                    >
                      <option>Todos os Produtos</option>
                      {productOptions.map((product) => <option key={product}>{product}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="filtro-lab" className="block text-[11px] font-bold text-slate-500 mb-1">Laboratório</label>
                    <select 
                      id="filtro-lab"
                      value={selectedLab}
                      onChange={(e) => setSelectedLab(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-slate-700 font-medium focus:ring-1 focus:ring-purple-500"
                    >
                      <option>Todos os Laboratórios</option>
                      {labOptions.map((lab) => <option key={lab}>{lab}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="filtro-ingrediente" className="block text-[11px] font-bold text-purple-700 mb-1 flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-purple-600" aria-hidden="true" />
                      Filtro por Ingrediente
                    </label>
                    <input 
                      id="filtro-ingrediente"
                      type="text" 
                      value={selectedIngredient}
                      onChange={(e) => setSelectedIngredient(e.target.value)}
                      placeholder="Ex: Flúor, Aloe Vera..." 
                      className="w-full bg-purple-50/50 border border-purple-200 rounded-lg px-3 py-2 text-xs text-purple-900 focus:outline-none focus:border-purple-500 font-medium focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tabela de Resultados */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Formulações Encontradas ({filteredFormulations.length})
                  </h3>
                  <span className="text-xs text-slate-400">Clique na fórmula para inspecionar</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th scope="col" className="p-4">Produto</th>
                        <th scope="col" className="p-4">Laboratório</th>
                        <th scope="col" className="p-4">Ingredientes Principais</th>
                        <th scope="col" className="p-4">Formato Original</th>
                        <th scope="col" className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredFormulations.map((item) => (
                        <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{item.name}</td>
                          <td className="p-4 text-slate-600 font-medium">{item.lab}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {(item.ingredients || []).slice(0, 2).map((ing, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                  {ing}
                                </span>
                              ))}
                              {(item.ingredients || []).length > 2 && (
                                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                                  +{item.ingredients.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">{item.type}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedFormula(item)}
                              className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspecionar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!isLoadingFormulations && !formulationsError && filteredFormulations.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            Nenhuma formulação cadastrada foi encontrada. Envie um PDF e confirme o cadastro para adicionar uma.
                          </td>
                        </tr>
                      )}
                      {isLoadingFormulations && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">Carregando formulações do banco de dados...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: GERENCIAR FORMULAÇÕES */}
          {activeTab === 'gerenciar' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {formulationsError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formulationsError}
                </p>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Gerenciar Formulações</h2>
                <p className="text-xs text-slate-500">Edite, exclua ou reavalie o status das formulações cadastradas na base de dados.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formulations.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-purple-200 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{formatFormulaDate(item.date)}</span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-purple-700 font-semibold mb-3">{item.lab}</p>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      {canEditPrivate && <button
                        onClick={() => handleDeleteFormula(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors focus:outline-none"
                        title="Excluir Formulação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedFormula(item)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
                        >
                          Ver Detalhes
                        </button>
                        {canEditPrivate && <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>}
                        {canPublish && !canEditPrivate && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-50 font-semibold rounded-lg"
                          >
                            Visibilidade
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoadingFormulations && (
                  <p className="col-span-full py-8 text-center text-sm text-slate-500">
                    Carregando formulações do banco de dados...
                  </p>
                )}
                {!isLoadingFormulations && !formulationsError && formulations.length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm text-slate-500">
                    Nenhuma formulação cadastrada no banco de dados.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ABA 4: FORMULAÇÕES REVISADAS E HISTÓRICO */}
          {activeTab === 'revisadas' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Formulações Revisadas & Histórico</h2>
                <p className="text-xs text-slate-500">Acompanhe todas as alterações manuais e auditorias técnicas aplicadas às fórmulas.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Log de Modificações do Sistema
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {revisionHistory.map((rev) => (
                    <div key={rev.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{rev.formulaName}</span>
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {rev.fieldChanged}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{rev.date}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-rose-500 block mb-0.5">Valor Anterior</span>
                          <p className="text-slate-600">{rev.oldValue}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">Novo Valor Ajustado</span>
                          <p className="text-slate-800 font-medium">{rev.newValue}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <p className="text-slate-500 italic">
                          <strong className="not-italic text-slate-700 font-semibold">Motivo:</strong> {rev.reason}
                        </p>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                          <User className="w-3 h-3 text-purple-600" />
                          <span>{rev.changedBy} ({rev.role})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && currentUser?.isAdmin && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Gerenciar Contas</h2>
                <p className="text-xs text-slate-500">Aprove solicitações e defina individualmente o acesso de cada conta.</p>
              </div>
              {accountMessage && (
                <p role="status" className="rounded-xl bg-purple-50 border border-purple-100 p-3 text-xs text-purple-800">
                  {accountMessage}
                </p>
              )}
              {isLoadingAccounts && <p className="text-sm text-slate-500">Carregando contas...</p>}
              <div className="space-y-3">
                {accountList.map((account) => (
                  <section key={account.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {account.name} {account.isAdmin && <span className="text-[10px] text-purple-700">(administrador)</span>}
                        </h3>
                        <p className="text-xs text-slate-500">{account.email}</p>
                      </div>
                      <label className="text-xs font-semibold text-slate-600">
                        Situação
                        <select
                          value={account.status}
                          disabled={account.isAdmin}
                          onChange={(event) => setAccountList((accounts) => accounts.map((item) => (
                            item.id === account.id ? { ...item, status: event.target.value } : item
                          )))}
                          className="ml-2 border border-slate-200 rounded-lg p-2"
                        >
                          <option value="pending">Aguardando aprovação</option>
                          <option value="active">Ativa</option>
                          <option value="disabled">Desativada</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                      {[
                        ['read_private', 'Consultar formulações privadas'],
                        ['edit_private', 'Criar e editar formulações'],
                        ['publish', 'Publicar ou tornar privada'],
                      ].map(([permission, label]) => (
                        <label key={permission} className="flex items-center gap-2 text-slate-700">
                          <input
                            type="checkbox"
                            checked={account.permissions.includes(permission)}
                            disabled={account.isAdmin}
                            onChange={(event) => setAccountList((accounts) => accounts.map((item) => {
                              if (item.id !== account.id) return item;
                              const permissions = event.target.checked
                                ? [...item.permissions, permission]
                                : item.permissions.filter((value) => value !== permission);
                              return { ...item, permissions };
                            }))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveAccount(account)}
                        disabled={account.isAdmin}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                      >
                        Salvar permissões
                      </button>
                    </div>
                  </section>
                ))}
                {!isLoadingAccounts && accountList.length === 0 && !accountMessage && (
                  <p className="text-sm text-slate-500">Nenhuma conta cadastrada.</p>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {authPanelOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {authMode === 'register' ? 'Solicitar uma conta' : 'Entrar no FormuLab'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {authMode === 'register'
                    ? 'A solicitação precisa ser aprovada pelo administrador.'
                    : 'Visitantes podem consultar formulações públicas sem entrar.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setAuthPanelOpen(false); setAuthMessage(''); }}
                aria-label="Fechar janela de acesso"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-5 space-y-4">
              {authMode === 'register' && (
                <label className="block text-xs font-semibold text-slate-700">
                  Nome
                  <input
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={authForm.name}
                    onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 font-normal"
                  />
                </label>
              )}
              <label className="block text-xs font-semibold text-slate-700">
                E-mail
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Senha
                <input
                  type="password"
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={authMode === 'register' ? 12 : undefined}
                  maxLength={128}
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 font-normal"
                />
                {authMode === 'register' && (
                  <span className="block mt-1 text-[10px] text-slate-500">
                    Use 12 ou mais caracteres, com letras maiúsculas, minúsculas e números.
                  </span>
                )}
              </label>
              {authMessage && (
                <p role="status" className="text-xs text-purple-800 bg-purple-50 border border-purple-100 rounded-lg p-3">
                  {authMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={!authReady}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg p-2.5 text-sm font-bold"
              >
                {authMode === 'register' ? 'Enviar solicitação' : 'Entrar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                  setAuthMessage('');
                }}
                className="w-full text-xs text-purple-700 hover:text-purple-900 font-semibold"
              >
                {authMode === 'register' ? 'Já tenho uma conta' : 'Solicitar uma conta'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO / DETALHES DA FORMULAÇÃO */}
      {selectedFormula && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{selectedFormula.name}</h3>
                  <p className="text-xs text-purple-700 font-semibold">{selectedFormula.lab}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFormula(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Resumo Executivo</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedFormula.summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-2">Composição e Ingredientes</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedFormula.ingredients || []).map((ing, i) => (
                    <span key={i} className="bg-purple-50 text-purple-800 border border-purple-100 font-semibold px-2.5 py-1 rounded-lg">
                      {ing}
                    </span>
                  ))}
                  {(!selectedFormula.ingredients || selectedFormula.ingredients.length === 0) && (
                    <p className="text-slate-500">Nenhum ingrediente cadastrado.</p>
                  )}
                </div>
              </div>

              {selectedFormula.procedure && (
                <div>
                  <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Procedimento e ordem de mistura</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {selectedFormula.procedure}
                  </p>
                </div>
              )}

              {selectedFormula.patentNotes && (
                <div>
                  <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Observações sobre patentes (não verificadas)</h4>
                  <p className="text-slate-600 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100 whitespace-pre-wrap">
                    {selectedFormula.patentNotes}
                  </p>
                </div>
              )}

              {selectedFormula.extractedText && <div>
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Texto selecionado do documento</h4>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {selectedFormula.extractedText}
                </pre>
              </div>}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedFormula(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DA FORMULAÇÃO */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <form onSubmit={handleSaveEdit}>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-600" />
                  {canEditPrivate ? 'Editar Formulação' : 'Alterar visibilidade'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {!canEditPrivate && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Visibilidade da formulação</label>
                    <select
                      value={editingItem.visibility || 'private'}
                      onChange={(event) => setEditingItem({ ...editingItem, visibility: event.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="private">Privada</option>
                      <option value="public">Pública</option>
                    </select>
                  </div>
                )}
                {canEditPrivate && <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Produto</label>
                  <input 
                    type="text" 
                    value={editingItem.name} 
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Laboratório</label>
                  <input 
                    type="text" 
                    value={editingItem.lab} 
                    onChange={(e) => setEditingItem({...editingItem, lab: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resumo / Especificações</label>
                  <textarea 
                    rows="4"
                    value={editingItem.summary} 
                    onChange={(e) => setEditingItem({...editingItem, summary: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
                    required
                  />
                </div>
                {canPublish && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Visibilidade da formulação</label>
                    <select
                      value={editingItem.visibility || 'private'}
                      onChange={(event) => setEditingItem({ ...editingItem, visibility: event.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="private">Privada</option>
                      <option value="public">Pública</option>
                    </select>
                  </div>
                )}
                </>}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  {canEditPrivate ? 'Salvar Alterações' : 'Atualizar visibilidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}