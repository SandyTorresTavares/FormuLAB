
import React, { useMemo, useState } from "react";
import {
  Upload, Search, FileText, Filter, PlusCircle, FileSpreadsheet,
  Image as ImageIcon, Sparkles, Eye, AlertCircle, Edit3, Trash2,
  History, LogOut, UserCheck, FlaskConical, X, Clock, User,
  Menu, CheckCircle2, File, Download
} from "lucide-react";

const LogoFormulab = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 220 220" fill="none">
    <path d="M73 48 H145 C153 48 153 31 144 31 H76 C67 31 67 48 73 48"
      stroke="#19BEC6" strokeWidth="9" strokeLinecap="round"/>
    <path d="M78 48 V86 C78 100 75 101 71 108 L48 149 C42 160 45 185 73 185 H113"
      stroke="#16BFC7" strokeWidth="10" strokeLinecap="round"/>
    <path d="M142 48 V86 C142 100 145 101 149 108 L172 149 C178 160 175 185 147 185 H108"
      stroke="#B477DC" strokeWidth="10" strokeLinecap="round"/>
    <g stroke="#A977DB" strokeWidth="6" strokeLinecap="round">
      <path d="M104 89 L118 119 L94 138 M118 119 L143 102 M118 119 L145 139"/>
      <path d="M143 102 L158 82 L178 68 M145 139 L170 124"/>
    </g>
    <circle cx="104" cy="89" r="10" fill="#15BEC6"/>
    <circle cx="118" cy="119" r="15" fill="#A977DB"/>
    <circle cx="94" cy="138" r="7" fill="#18BEC7"/>
    <circle cx="143" cy="102" r="8" fill="#A977DB"/>
    <circle cx="158" cy="82" r="7" fill="#A977DB"/>
    <circle cx="178" cy="68" r="6" fill="#B477DC"/>
    <circle cx="145" cy="139" r="7" fill="#A977DB"/>
    <circle cx="170" cy="124" r="6" fill="#B477DC"/>
  </svg>
);

const initialFormulations = [
  {
    id: 1,
    name: "Pasta de Dente Total Care",
    lab: "Lab Sinergia Química",
    type: "Documento PDF",
    date: "15/05/2026",
    status: "Aprovado",
    ingredients: [
      "Carbonato de Cálcio (35%)",
      "Sorbitol (20%)",
      "Flúor Ativo (0.24%)",
      "Lauril Sulfato de Sódio"
    ],
    summary: "Formulação antitártaro contendo Carbonato de Cálcio (35%), Sorbitol (20%) e Flúor Ativo (0.24%). Apresenta pH neutro (7.2).",
    extractedText: "Aqua, Calcium Carbonate, Sorbitol, Hydrated Silica..."
  },
  {
    id: 2,
    name: "Shampoo Hidratante Premium",
    lab: "Lab BioTech",
    type: "Excel (.xlsx)",
    date: "18/05/2026",
    status: "Em Análise",
    ingredients: [
      "Água Purificada (65%)",
      "Lauril Glucosídeo (15%)",
      "Extrato Aloe Vera (5%)"
    ],
    summary: "Base de limpeza suave formulada com Lauril Glucosídeo e Extrato de Aloe Vera.",
    extractedText: "Água Purificada: 65%; Lauril Glucosídeo: 15%; Aloe Vera: 5%."
  },
  {
    id: 3,
    name: "Sabonete Líquido Antisséptico",
    lab: "Lab Sinergia Química",
    type: "Imagem / PDF Escaneado",
    date: "20/05/2026",
    status: "Aprovado",
    ingredients: [
      "Cloreto de Benzalcônio (0.13%)",
      "Glicerina Bi-destilada (2.0%)",
      "Base Gel Carbopol"
    ],
    summary: "Sabonete contendo Cloreto de Benzalcônio (0.13%).",
    extractedText: "Cloreto de Benzalcônio 0.13%; Glicerina 2.0%."
  }
];

const initialHistory = [
  {
    id: 101,
    formulaName: "Pasta de Dente Total Care",
    changedBy: "Dra. Helena Martins",
    role: "Farmacêutica Responsável",
    date: "21/05/2026 às 14:32",
    fieldChanged: "Dosagem do Ingrediente Ativo",
    oldValue: "Flúor Ativo (0.20%)",
    newValue: "Flúor Ativo (0.24%)",
    reason: "Ajuste de conformidade técnica."
  }
];

const navItems = [
  { id: "cadastrar", label: "Cadastrar Nova Formulação", icon: PlusCircle },
  { id: "buscar", label: "Buscar Formulações", icon: Search },
  { id: "gerenciar", label: "Gerenciar Formulações", icon: Edit3 },
  { id: "revisadas", label: "Formulações Revisadas", icon: History }
];

const today = () => new Date().toLocaleDateString("pt-BR");
const now = () => new Date().toLocaleString("pt-BR");

export default function App() {
  const [activeTab, setActiveTab] = useState("cadastrar");
  const [formulations, setFormulations] = useState(initialFormulations);
  const [revisionHistory, setRevisionHistory] = useState(initialHistory);

  const [selectedFormula, setSelectedFormula] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchGlobal, setSearchGlobal] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("Todos");
  const [selectedLab, setSelectedLab] = useState("Todos");
  const [selectedIngredient, setSelectedIngredient] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [newLab, setNewLab] = useState("Lab Sinergia Química");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [processing, setProcessing] = useState(false);

  const [editName, setEditName] = useState("");
  const [editLab, setEditLab] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const filteredFormulations = useMemo(() => {
    return formulations.filter(item => {
      const term = searchGlobal.toLowerCase();

      const globalMatch =
        item.name.toLowerCase().includes(term) ||
        item.lab.toLowerCase().includes(term) ||
        item.ingredients.some(i => i.toLowerCase().includes(term));

      const productMatch =
        selectedProduct === "Todos" || item.name === selectedProduct;

      const labMatch =
        selectedLab === "Todos" || item.lab === selectedLab;

      const ingredientMatch =
        !selectedIngredient ||
        item.ingredients.some(i =>
          i.toLowerCase().includes(selectedIngredient.toLowerCase())
        );

      return globalMatch && productMatch && labMatch && ingredientMatch;
    });
  }, [formulations, searchGlobal, selectedProduct, selectedLab, selectedIngredient]);

  const resetFilters = () => {
    setSearchGlobal("");
    setSelectedProduct("Todos");
    setSelectedLab("Todos");
    setSelectedIngredient("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setUploadError("");
    setUploadSuccess("");

    if (!file) return;

    const allowedExtensions = [
      "pdf", "xlsx", "xls", "csv", "png", "jpg", "jpeg"
    ];

    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setUploadError("Formato não permitido. Selecione PDF, Excel, CSV ou imagem.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError("O arquivo ultrapassa o limite de 20 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Selecione um arquivo antes de continuar.");
      return;
    }

    setProcessing(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const extension = selectedFile.name.split(".").pop().toLowerCase();

      const formatNames = {
        pdf: "Documento PDF",
        xlsx: "Excel (.xlsx)",
        xls: "Excel (.xls)",
        csv: "CSV",
        png: "Imagem PNG",
        jpg: "Imagem JPG",
        jpeg: "Imagem JPEG"
      };

      let extractedText = "";

      // Leitura básica de arquivos CSV e texto.
      if (extension === "csv" || extension === "txt") {
        extractedText = await selectedFile.text();
      }

      const newFormula = {
        id: Date.now(),
        name: selectedFile.name.replace(/\.[^/.]+$/, ""),
        lab: newLab,
        type: formatNames[extension] || extension.toUpperCase(),
        date: today(),
        status: "Aguardando Análise",
        ingredients: [],
        summary: "Arquivo recebido. Aguardando processamento e validação técnica.",
        extractedText: extractedText || "Extração de conteúdo pendente. Integre um serviço de OCR ou processamento de documentos."
      };

      setFormulations(prev => [newFormula, ...prev]);

      setRevisionHistory(prev => [{
        id: Date.now() + 1,
        formulaName: newFormula.name,
        changedBy: "Sandy Torres Tavares",
        role: "Administradora",
        date: now(),
        fieldChanged: "Novo Cadastro",
        oldValue: "Não cadastrado",
        newValue: "Arquivo recebido no sistema",
        reason: "Cadastro inicial por envio de arquivo."
      }, ...prev]);

      setUploadSuccess("Arquivo cadastrado com sucesso! A extração inteligente depende da integração com o serviço de IA/OCR.");
      setSelectedFile(null);

      const input = document.getElementById("file-upload");
      if (input) input.value = "";
    } catch (error) {
      setUploadError("Não foi possível ler o arquivo. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenEdit = (formula) => {
    setEditingItem(formula);
    setEditName(formula.name);
    setEditLab(formula.lab);
    setEditSummary(formula.summary);
    setEditStatus(formula.status);
  };

  const handleSaveEdit = (event) => {
    event.preventDefault();
    if (!editingItem) return;

    const oldFormula = formulations.find(f => f.id === editingItem.id);
    if (!oldFormula) return;

    const updated = {
      ...oldFormula,
      name: editName.trim(),
      lab: editLab.trim(),
      summary: editSummary.trim(),
      status: editStatus
    };

    setFormulations(prev =>
      prev.map(f => f.id === updated.id ? updated : f)
    );

    setRevisionHistory(prev => [{
      id: Date.now(),
      formulaName: updated.name,
      changedBy: "Sandy Torres Tavares",
      role: "Administradora / Pesquisadora",
      date: now(),
      fieldChanged: "Dados da Formulação",
      oldValue: `${oldFormula.name} | ${oldFormula.summary}`,
      newValue: `${updated.name} | ${updated.summary}`,
      reason: "Edição manual realizada no painel de gerenciamento."
    }, ...prev]);

    if (selectedFormula?.id === updated.id) {
      setSelectedFormula(updated);
    }

    setEditingItem(null);
  };

  const handleDelete = (formula) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${formula.name}"?`
    );

    if (!confirmed) return;

    setFormulations(prev => prev.filter(f => f.id !== formula.id));

    setRevisionHistory(prev => [{
      id: Date.now(),
      formulaName: formula.name,
      changedBy: "Sandy Torres Tavares",
      role: "Administradora",
      date: now(),
      fieldChanged: "Exclusão",
      oldValue: formula.name,
      newValue: "Formulação removida",
      reason: "Exclusão confirmada pelo painel de gerenciamento."
    }, ...prev]);

    if (selectedFormula?.id === formula.id) {
      setSelectedFormula(null);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const pageTitle = navItems.find(item => item.id === activeTab)?.label;

  const statusClass = (status) => {
    if (status === "Aprovado") return "bg-emerald-50 text-emerald-700";
    if (status === "Reprovado") return "bg-rose-50 text-rose-700";
    return "bg-amber-50 text-amber-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-7">
            <LogoFormulab className="w-11 h-11" />
            <div>
              <h1 className="font-extrabold text-xl">
                Formu<span className="text-purple-600">Lab</span>
              </h1>
              <p className="text-[10px] text-slate-400">
                Gerenciamento de Formulações
              </p>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-3">
            Painel Geral
          </p>

          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => changeTab(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold transition ${
                  activeTab === id
                    ? "bg-purple-100 text-purple-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} className="text-purple-600" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t pt-4 text-center text-[11px] text-slate-400">
          FormuLab © 2026
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <LogoFormulab className="w-8 h-8" />
                <b>FormuLab</b>
              </div>
              <div className="hidden sm:block text-xs text-slate-500">
                FormuLab / <b className="text-slate-800">{pageTitle}</b>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-50 border rounded-full px-3 py-1.5"
                >
                  <span className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold">
                    ST
                  </span>
                  <span className="hidden sm:block text-left">
                    <b className="block text-xs">Sandy Torres Tavares</b>
                    <small className="text-teal-600">Status: Ativo</small>
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border shadow-xl p-2 z-50">
                    <p className="text-xs font-bold p-2">Sessão Atual</p>
                    <p className="text-[10px] text-slate-400 px-2 pb-2">
                      Lab Sinergia Química
                    </p>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        alert("Integre aqui a troca de usuário.");
                      }}
                      className="w-full text-left p-2 text-xs hover:bg-slate-50 rounded-lg flex gap-2"
                    >
                      <UserCheck size={15}/> Trocar de Usuário
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        alert("Integre aqui o encerramento da sessão.");
                      }}
                      className="w-full text-left p-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex gap-2"
                    >
                      <LogOut size={15}/> Sair
                    </button>
                  </div>
                )}
              </div>

              <button
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X/> : <Menu/>}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden border-t p-3 bg-white space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => changeTab(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold ${
                    activeTab === id ? "bg-purple-100 text-purple-900" : "text-slate-600"
                  }`}
                >
                  <Icon size={17}/> {label}
                </button>
              ))}
            </nav>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">

          {/* CADASTRAR */}
          {activeTab === "cadastrar" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Cadastrar Nova Formulação</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Envie documentos para cadastro e posterior análise técnica.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-xs">
                <AlertCircle className="shrink-0 text-amber-600"/>
                <div>
                  <b>Atenção: documentos escaneados</b>
                  <p className="mt-1">
                    PDFs escaneados e fotografias precisam passar por OCR
                    para que seus conteúdos sejam reconhecidos. A leitura
                    automática depende de integração com serviço externo.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-sm">Enviar arquivo</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, Excel, CSV ou imagens de documentos.
                  </p>
                </div>

                <label
                  htmlFor="file-upload"
                  className="block border-2 border-dashed border-purple-200 bg-purple-50/40 hover:bg-purple-50 rounded-xl p-10 text-center cursor-pointer transition"
                >
                  <Upload className="mx-auto text-purple-500 mb-3" size={32}/>
                  <p className="font-bold text-sm">
                    Arraste ou selecione seu arquivo
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    PDF, XLSX, XLS, CSV, PNG, JPG ou JPEG
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 p-3 rounded-xl">
                    <File size={22} className="text-teal-600"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button onClick={() => setSelectedFile(null)}>
                      <X size={18}/>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-2">
                    Laboratório responsável
                  </label>
                  <input
                    value={newLab}
                    onChange={e => setNewLab(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-purple-300 outline-none"
                    placeholder="Nome do laboratório"
                  />
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600">{uploadError}</p>
                )}

                {uploadSuccess && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs flex gap-2">
                    <CheckCircle2 size={17}/> {uploadSuccess}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    disabled={processing}
                    onClick={handleUpload}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl px-6 py-3 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16}/>
                    {processing ? "Processando..." : "Processar e Cadastrar"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "PDF", icon: FileText, color: "text-teal-600", bg: "bg-teal-50" },
                  { label: "Excel / CSV", icon: FileSpreadsheet, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Imagens", icon: ImageIcon, color: "text-purple-600", bg: "bg-purple-50" }
                ].map(item => (
                  <div key={item.label} className="bg-white border rounded-xl p-5 flex items-center gap-3">
                    <div className={`${item.bg} ${item.color} p-3 rounded-xl`}>
                      <item.icon size={22}/>
                    </div>
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSCAR */}
          {activeTab === "buscar" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Buscar Formulações</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pesquise produtos, laboratórios e ingredientes.
                </p>
              </div>

              <section className="bg-white border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xs font-bold uppercase flex gap-2">
                    <Filter size={16} className="text-purple-600"/>
                    Filtros de Pesquisa
                  </h3>
                  <button onClick={resetFilters} className="text-xs text-purple-600 font-bold">
                    Limpar filtros
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-2">Pesquisa geral</label>
                    <input
                      value={searchGlobal}
                      onChange={e => setSearchGlobal(e.target.value)}
                      placeholder="Nome ou ingrediente..."
                      className="w-full border rounded-lg p-2.5 text-xs outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-2">Produto</label>
                    <select
                      value={selectedProduct}
                      onChange={e => setSelectedProduct(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-xs"
                    >
                      <option value="Todos">Todos os produtos</option>
                      {formulations.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-2">Laboratório</label>
                    <select
                      value={selectedLab}
                      onChange={e => setSelectedLab(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-xs"
                    >
                      <option value="Todos">Todos os laboratórios</option>
                      {[...new Set(formulations.map(f => f.lab))].map(lab => (
                        <option key={lab}>{lab}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-purple-700 block mb-2">
                      Ingrediente
                    </label>
                    <input
                      value={selectedIngredient}
                      onChange={e => setSelectedIngredient(e.target.value)}
                      placeholder="Ex: Flúor, Aloe Vera..."
                      className="w-full border border-purple-200 bg-purple-50 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white border rounded-2xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase">
                    Formulações encontradas ({filteredFormulations.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-4">Produto</th>
                        <th className="p-4">Laboratório</th>
                        <th className="p-4">Ingredientes</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredFormulations.map(item => (
                        <tr key={item.id} className="hover:bg-purple-50/40">
                          <td className="p-4 font-bold">{item.name}</td>
                          <td className="p-4">{item.lab}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {item.ingredients.slice(0, 2).map((ing, i) => (
                                <span key={i} className="bg-slate-100 rounded px-2 py-1 text-[10px]">
                                  {ing}
                                </span>
                              ))}
                              {item.ingredients.length > 2 && (
                                <span className="text-purple-600 font-bold">
                                  +{item.ingredients.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusClass(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedFormula(item)}
                              className="flex items-center gap-1 text-purple-700 font-bold"
                            >
                              <Eye size={15}/> Inspecionar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredFormulations.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            Nenhuma formulação encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* GERENCIAR */}
          {activeTab === "gerenciar" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Gerenciar Formulações</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Edite, consulte e exclua formulações cadastradas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {formulations.map(item => (
                  <article key={item.id} className="bg-white border rounded-2xl p-5 flex flex-col justify-between gap-5 hover:border-purple-300 transition">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.date}</span>
                      </div>

                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-purple-600 font-semibold mt-1">{item.lab}</p>
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        {item.summary}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-3">
                        {item.ingredients.length} ingrediente(s)
                      </p>
                    </div>

                    <div className="border-t pt-3 flex justify-between items-center">
                      <button
                        onClick={() => handleDelete(item)}
                        title="Excluir"
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg"
                      >
                        <Trash2 size={17}/>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedFormula(item)}
                          className="text-xs font-bold px-3 py-2 hover:bg-slate-100 rounded-lg"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-purple-700"
                        >
                          <Edit3 size={13} className="inline mr-1"/>
                          Editar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {formulations.length === 0 && (
                <div className="bg-white rounded-xl p-10 text-center text-slate-400 text-sm">
                  Nenhuma formulação cadastrada.
                </div>
              )}
            </div>
          )}

          {/* HISTÓRICO */}
          {activeTab === "revisadas" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Formulações Revisadas</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Histórico de alterações e auditorias do sistema.
                </p>
              </div>

              <section className="bg-white border rounded-2xl overflow-hidden">
                <div className="p-4 border-b flex items-center gap-2">
                  <History className="text-purple-600" size={18}/>
                  <h3 className="text-xs font-bold uppercase">
                    Log de Modificações
                  </h3>
                </div>

                {revisionHistory.map(rev => (
                  <article key={rev.id} className="p-5 border-b last:border-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm">{rev.formulaName}</h3>
                        <span className="inline-block mt-2 bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold">
                          {rev.fieldChanged}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={14}/> {rev.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl my-4 text-xs">
                      <div>
                        <b className="text-rose-500 block mb-1">Valor anterior</b>
                        <p>{rev.oldValue}</p>
                      </div>
                      <div>
                        <b className="text-emerald-600 block mb-1">Novo valor</b>
                        <p>{rev.newValue}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      <b className="text-slate-700">Motivo:</b> {rev.reason}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <User size={14} className="text-purple-600"/>
                      {rev.changedBy} — {rev.role}
                    </div>
                  </article>
                ))}

                {revisionHistory.length === 0 && (
                  <p className="p-8 text-center text-xs text-slate-400">
                    Nenhuma alteração registrada.
                  </p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE DETALHES */}
      {selectedFormula && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold">{selectedFormula.name}</h3>
                <p className="text-xs text-purple-600 mt-1">{selectedFormula.lab}</p>
              </div>
              <button onClick={() => setSelectedFormula(null)}>
                <X/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <b className="uppercase text-[10px] text-slate-500">Resumo executivo</b>
                <p className="bg-slate-50 p-4 rounded-xl mt-2 leading-relaxed">
                  {selectedFormula.summary}
                </p>
              </div>

              <div>
                <b className="uppercase text-[10px] text-slate-500">Ingredientes</b>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFormula.ingredients.length > 0
                    ? selectedFormula.ingredients.map((ing, i) => (
                      <span key={i} className="bg-purple-50 text-purple-800 border border-purple-100 px-3 py-2 rounded-lg">
                        {ing}
                      </span>
                    ))
                    : <p className="text-slate-400">Ingredientes ainda não identificados.</p>
                  }
                </div>
              </div>

              <div>
                <b className="uppercase text-[10px] text-slate-500">Texto extraído</b>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl mt-2 whitespace-pre-wrap break-words font-mono text-[11px]">
                  {selectedFormula.extractedText}
                </pre>
              </div>

              <div>
                <b className="text-slate-500">Arquivo original:</b>
                <p className="mt-1">{selectedFormula.type}</p>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedFormula(null)}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Edit3 size={17} className="text-purple-600"/>
                Editar Formulação
              </h3>
              <button type="button" onClick={() => setEditingItem(null)}>
                <X/>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-2">Nome do produto</label>
                <input
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border rounded-lg p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold block mb-2">Laboratório</label>
                <input
                  required
                  value={editLab}
                  onChange={e => setEditLab(e.target.value)}
                  className="w-full border rounded-lg p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold block mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full border rounded-lg p-3"
                >
                  <option>Aguardando Análise</option>
                  <option>Em Análise</option>
                  <option>Aprovado</option>
                  <option>Reprovado</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-2">Resumo / Especificações</label>
                <textarea
                  required
                  rows={5}
                  value={editSummary}
                  onChange={e => setEditSummary(e.target.value)}
                  className="w-full border rounded-lg p-3 outline-none focus:border-purple-500 resize-y"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border bg-white rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}