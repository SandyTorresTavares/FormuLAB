import React, { useState } from 'react';
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
  Sparkles,
  Cpu,
  Eye,
  AlertCircle,
  Edit3,
  Trash2,
  History,
  LogOut,
  UserCheck,
  Building2,
  FlaskConical,
  X,
  Clock,
  User,
  ArrowRight,
  Menu
} from 'lucide-react';

const LogoFormulab = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 220 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      {/* Gradiente principal do logo */}
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
      d="
        M73 48
        H145
        C150 48 153 44 153 39
        C153 34 149 31 144 31
        H76
        C71 31 67 34 67 39
        C67 44 70 48 73 48
      "
      stroke="url(#formulabGradient)"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="
        M78 48
        V86
        C78 94 75 101 71 108
        L48 149
        C42 160 45 172 54 179
        C59 183 65 185 73 185
        H113
      "
      stroke="#16BFC7"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="
        M142 48
        V86
        C142 94 145 101 149 108
        L172 149
        C178 160 175 172 166 179
        C161 183 155 185 147 185
        H108
      "
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
    <g
      stroke="url(#moleculeGradient)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
      d="
        M166 48
        L179 40
        L192 48
        L192 63
        L179 71
        L166 63
        Z
      "
      fill="white"
      stroke="#A977DB"
      strokeWidth="6"
      strokeLinejoin="round"
    />

    <path
      d="
        M169 91
        L182 83
        L195 91
        L195 106
        L182 114
        L169 106
        Z
      "
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

export default function App() {
  const [activeTab, setActiveTab] = useState('cadastrar'); // 'cadastrar' | 'buscar' | 'gerenciar' | 'revisadas'
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Estados dos Filtros na aba de Busca
  const [searchGlobal, setSearchGlobal] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('Todos os Produtos');
  const [selectedLab, setSelectedLab] = useState('Todos os Laboratórios');
  const [selectedIngredient, setSelectedIngredient] = useState('');

  // Base de Dados Simulada de Formulações
  const [formulations, setFormulations] = useState([
    { 
      id: 1, 
      name: 'Pasta de Dente Total Care', 
      lab: 'Lab Sinergia Química', 
      type: 'Documento PDF', 
      date: '15/05/2026', 
      status: 'Aprovado',
      ingredients: ['Carbonato de Cálcio (35%)', 'Sorbitol (20%)', 'Flúor Ativo (0.24%)', 'Lauril Sulfato de Sódio'],
      summary: 'Formulação antitártaro contendo Carbonato de Cálcio (35%), Sorbitol (20%) e Flúor Ativo (0.24%). Apresenta pH neutro (7.2) e boa estabilidade térmica.',
      extractedText: 'COMPOSIÇÃO: Aqua, Calcium Carbonate, Sorbitol, Hydrated Silica, Sodium Lauryl Sulfate, Aroma, Cellulose Gum, Sodium Monofluorophosphate...'
    },
    { 
      id: 2, 
      name: 'Shampoo Hidratante Premium', 
      lab: 'Lab BioTech', 
      type: 'Excel (.xlsx)', 
      date: '18/05/2026', 
      status: 'Em Análise',
      ingredients: ['Água Purificada (65%)', 'Lauril Glucosídeo (15%)', 'Extrato Aloe Vera (5%)', 'Cloreto de Sódio'],
      summary: 'Base de limpeza suave formulada com Lauril Glucosídeo e Extrato de Aloe Vera (5%). Viscosidade ajustada com Cloreto de Sódio.',
      extractedText: 'ITEM | MATÉRIA-PRIMA | CONCENTRAÇÃO (%)\n1 | Água Purificada | 65.0%\n2 | Lauril Glucosídeo | 15.0%\n3 | Extrato Aloe Vera | 5.0%'
    },
    { 
      id: 3, 
      name: 'Sabonete Líquido Antisséptico', 
      lab: 'Lab Sinergia Química', 
      type: 'Imagem / PDF Escaneado', 
      date: '20/05/2026', 
      status: 'Aprovado',
      ingredients: ['Cloreto de Benzalcônio (0.13%)', 'Glicerina Bi-destilada (2.0%)', 'Base Gel Carbopol'],
      summary: 'Sabonete bactericida contendo Cloreto de Benzalcônio (0.13%). Texto extraído de documento escaneado com 98% de precisão via OCR.',
      extractedText: 'ROTA DE SÍNTESE E FORMULAÇÃO LÍQUIDA\nAtivo Principal: Cloreto de Benzalcônio 0.13%\nGlicerina Bi-destilada 2.0%\nBase de Gel Carbopol q.s.p.'
    },
  ]);

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

  const handleDeleteFormula = (id) => {
    if (window.confirm("Tem certeza que deseja remover esta formulação do sistema?")) {
      setFormulations(formulations.filter(f => f.id !== id));
      if (selectedFormula?.id === id) setSelectedFormula(null);
    }
  };

  const handleOpenEdit = (formula) => {
    setEditingItem({...formula});
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setFormulations(formulations.map(f => f.id === editingItem.id ? editingItem : f));

    const newLog = {
      id: Date.now(),
      formulaName: editingItem.name,
      changedBy: 'Sandy Torres Tavares',
      role: 'Administradora / Pesquisadora',
      date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
      fieldChanged: 'Resumo e Especificações da Fórmula',
      oldValue: formulations.find(f => f.id === editingItem.id)?.summary || 'Versão Anterior',
      newValue: editingItem.summary,
      reason: 'Edição manual realizada no painel de gerenciamento.'
    };

    setRevisionHistory([newLog, ...revisionHistory]);
    setEditModalOpen(false);
  };

  const filteredFormulations = formulations.filter(item => {
    const matchesGlobal = item.name.toLowerCase().includes(searchGlobal.toLowerCase()) ||
                          item.lab.toLowerCase().includes(searchGlobal.toLowerCase());
    const matchesProduct = selectedProduct === 'Todos os Produtos' || item.name === selectedProduct;
    const matchesLab = selectedLab === 'Todos os Laboratórios' || item.lab === selectedLab;
    const matchesIngredient = selectedIngredient === '' || 
      item.ingredients.some(ing => ing.toLowerCase().includes(selectedIngredient.toLowerCase()));

    return matchesGlobal && matchesProduct && matchesLab && matchesIngredient;
  });

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
            
            <button
              onClick={() => setActiveTab('cadastrar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'cadastrar'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Cadastrar Nova Formulação</span>
            </button>

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

            <button
              onClick={() => setActiveTab('gerenciar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'gerenciar'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Gerenciar Formulações</span>
            </button>

            <button
              onClick={() => setActiveTab('revisadas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                activeTab === 'revisadas'
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Formulações Revisadas</span>
            </button>
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
                </span>
              </div>
            </div>

            {/* CONTROLES DO USUÁRIO & MENU HAMBÚRGUER */}
            <div className="flex items-center gap-2">
              
              {/* Menu de Perfil */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-label="Abrir perfil do usuário"
                  className="flex items-center gap-2 sm:gap-3 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-full border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    ST
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">Sandy Torres Tavares</p>
                    <p className="text-[10px] text-teal-600 font-medium mt-0.5">Status: Ativo</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Sessão Atual</p>
                      <p className="text-[10px] text-slate-400">Lab Sinergia Química</p>
                    </div>
                    
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); alert("Redirecionando para a tela de troca de usuário..."); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      Trocar de Usuário
                    </button>

                    <button 
                      onClick={() => { setIsUserMenuOpen(false); alert("Sessão encerrada com sucesso!"); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      Sair (Logout)
                    </button>
                  </div>
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
              <button
                onClick={() => { setActiveTab('cadastrar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'cadastrar' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-purple-600" />
                Cadastrar Nova Formulação
              </button>
              <button
                onClick={() => { setActiveTab('buscar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'buscar' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <Search className="w-4 h-4 text-purple-600" />
                Buscar Formulações
              </button>
              <button
                onClick={() => { setActiveTab('gerenciar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'gerenciar' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                Gerenciar Formulações
              </button>
              <button
                onClick={() => { setActiveTab('revisadas'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'revisadas' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
                }`}
              >
                <History className="w-4 h-4 text-purple-600" />
                Formulações Revisadas
              </button>
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
                <p className="text-xs text-slate-500">Envie o arquivo do seu produto para extração e síntese automática com Inteligência Artificial.</p>
              </div>

              {/* CARD DE AVISO */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-amber-950 mb-0.5">Aviso sobre PDFs Escaneados ou Fotos de Documentos</p>
                  <p className="text-amber-800">
                    PDFs gerados por scanner ou fotos de arquivos físicos são processados através de <strong>OCR (Reconhecimento Óptico de Caracteres / Visão por IA)</strong>. O tempo de leitura pode levar alguns segundos a mais para conversão dos caracteres.
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
                  <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-600">Arraste ou selecione o arquivo PDF</p>
                    <p className="text-[10px] text-slate-400 mt-1">Formato: .pdf</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Planilhas de Composição</h3>
                      <p className="text-xs text-slate-400">Tabelas e dosagens de ingredientes</p>
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-600">Arraste ou selecione a planilha em Excel</p>
                    <p className="text-[10px] text-slate-400 mt-1">Formatos: .xlsx, .csv</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                      <ImageIcon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Imagens ou Fotos</h3>
                      <p className="text-xs text-slate-400">Processamento com Leitor de Visão Computacional</p>
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-600">Arraste ou selecione a imagem</p>
                    <p className="text-[10px] text-slate-400 mt-1">Formatos: .png, .jpg, .jpeg</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => alert("Simulação: Arquivo enviado! Processando dados via OCR e IA...")}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Processar e Cadastrar com IA</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: BUSCAR FORMULAÇÕES */}
          {activeTab === 'buscar' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
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
                      <option>Pasta de Dente Total Care</option>
                      <option>Shampoo Hidratante Premium</option>
                      <option>Sabonete Líquido Antisséptico</option>
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
                      <option>Lab Sinergia Química</option>
                      <option>Lab BioTech</option>
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
                        <th scope="col" className="p-4">Tipo</th>
                        <th scope="col" className="p-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredFormulations.length > 0 ? (
                        filteredFormulations.map((item) => (
                          <tr 
                            key={item.id} 
                            onClick={() => setSelectedFormula(item)}
                            className={`hover:bg-purple-50/50 transition-colors cursor-pointer ${
                              selectedFormula?.id === item.id ? 'bg-purple-50/80' : ''
                            }`}
                          >
                            <td className="p-4 font-bold text-slate-800">{item.name}</td>
                            <td className="p-4">{item.lab}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {item.ingredients.map((ing, idx) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-medium text-slate-600">
                                {item.type}
                              </span>
                            </td>
                            <td className="p-4">
                              <button className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 focus:outline-none">
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Detalhes</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                            Nenhuma formulação encontrada com os filtros selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD DE VISUALIZAÇÃO DETALHADA DA FÓRMULA */}
              {selectedFormula && (
                <div className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-slate-800 text-base">{selectedFormula.name}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedFormula(null)}
                      className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                      aria-label="Fechar detalhes"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-500">Laboratório Origem:</p>
                      <p className="text-slate-800 font-medium">{selectedFormula.lab}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500">Data de Registro:</p>
                      <p className="text-slate-800 font-medium">{selectedFormula.date}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-500">Resumo da Síntese:</p>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                      {selectedFormula.summary}
                    </p>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-500">Texto Reconhecido / Extraído:</p>
                    <pre className="bg-slate-900 text-teal-400 p-3 rounded-xl text-[11px] font-mono whitespace-pre-wrap overflow-x-auto">
                      {selectedFormula.extractedText}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ABA 3: GERENCIAR FORMULAÇÕES */}
          {activeTab === 'gerenciar' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Gerenciar & Editar Formulações</h2>
                <p className="text-xs text-slate-500">Altere informações técnicas das fórmulas cadastradas ou exclua registros do banco de dados.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th scope="col" className="p-4">Produto</th>
                        <th scope="col" className="p-4">Laboratório</th>
                        <th scope="col" className="p-4">Data</th>
                        <th scope="col" className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {formulations.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{item.name}</td>
                          <td className="p-4">{item.lab}</td>
                          <td className="p-4">{item.date}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button 
                                onClick={() => handleOpenEdit(item)}
                                aria-label={`Editar ${item.name}`}
                                className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteFormula(item.id)}
                                aria-label={`Excluir ${item.name}`}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: FORMULAÇÕES REVISADAS E HISTÓRICO */}
          {activeTab === 'revisadas' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Formulações Revisadas e Histórico</h2>
                <p className="text-xs text-slate-500">Rastreabilidade completa de todas as modificações e aprovações feitas nos produtos.</p>
              </div>

              <div className="space-y-4">
                {revisionHistory.map((log) => (
                  <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Alteração Registrada
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm mt-1">{log.formulaName}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{log.date}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-500">Responsável:</p>
                        <p className="text-slate-800">{log.changedBy} ({log.role})</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-500">Campo Alterado:</p>
                        <p className="text-slate-800 font-semibold">{log.fieldChanged}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p><strong className="text-rose-600">Valor Anterior:</strong> {log.oldValue}</p>
                      <p><strong className="text-teal-600">Novo Valor:</strong> {log.newValue}</p>
                      <p><strong className="text-slate-600">Motivo:</strong> {log.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Editar Formulação</h3>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Fechar Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="edit-nome" className="block font-bold text-slate-600 mb-1">Nome do Produto</label>
                <input 
                  id="edit-nome"
                  type="text" 
                  value={editingItem.name} 
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="edit-lab" className="block font-bold text-slate-600 mb-1">Laboratório</label>
                <input 
                  id="edit-lab"
                  type="text" 
                  value={editingItem.lab} 
                  onChange={(e) => setEditingItem({...editingItem, lab: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="edit-resumo" className="block font-bold text-slate-600 mb-1">Resumo Técnico / Especificações</label>
                <textarea 
                  id="edit-resumo"
                  rows={4}
                  value={editingItem.summary} 
                  onChange={(e) => setEditingItem({...editingItem, summary: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}