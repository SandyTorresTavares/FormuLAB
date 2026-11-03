import React, { useEffect, useMemo, useState } from "react";
import { importarArquivo, listarFormulacoes } from "./actions/formulacoes.js";
import { AppHeader, Sidebar } from "./components/layout/AppShell.jsx";
import CadastroPage from "./components/pages/CadastroPage.jsx";
import BuscaPage from "./components/pages/BuscaPage.jsx";
import GerenciarPage from "./components/pages/GerenciarPage.jsx";
import HistoricoPage from "./components/pages/HistoricoPage.jsx";
import { DetalhesModal, EditarModal } from "./components/modals/FormulaModals.jsx";
import { initialHistory, navItems } from "./constants/appData.js";

const now = () => new Date().toLocaleString("pt-BR");

export default function App() {
  const [activeTab, setActiveTab] = useState("cadastrar");
  const [formulations, setFormulations] = useState([]);
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
  const [apiError, setApiError] = useState("");
  const [editForm, setEditForm] = useState({ item: null, name: "", lab: "", summary: "", status: "" });

  useEffect(() => {
    const controller = new AbortController();
    listarFormulacoes({ signal: controller.signal })
      .then(setFormulations)
      .then(() => setApiError(""))
      .catch(error => { if (error.name !== "AbortError") setApiError(error.message || "Falha ao conectar a API."); });
    return () => controller.abort();
  }, []);

  const filteredFormulations = useMemo(() => formulations.filter(item => {
    const term = searchGlobal.toLowerCase();
    const globalMatch = item.name.toLowerCase().includes(term) || item.lab.toLowerCase().includes(term) || item.ingredients.some(i => i.toLowerCase().includes(term));
    const productMatch = selectedProduct === "Todos" || item.name === selectedProduct;
    const labMatch = selectedLab === "Todos" || item.lab === selectedLab;
    const ingredientMatch = !selectedIngredient || item.ingredients.some(i => i.toLowerCase().includes(selectedIngredient.toLowerCase()));
    return globalMatch && productMatch && labMatch && ingredientMatch;
  }), [formulations, searchGlobal, selectedProduct, selectedLab, selectedIngredient]);

  const resetFilters = () => {
    setSearchGlobal("");
    setSelectedProduct("Todos");
    setSelectedLab("Todos");
    setSelectedIngredient("");
  };

  const handleFileChange = event => {
    const file = event.target.files?.[0];
    setUploadError("");
    setUploadSuccess("");
    if (!file) return;
    const allowedExtensions = ["pdf", "pptx", "xlsx", "xls", "csv", "png", "jpg", "jpeg"];
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
      const result = await importarArquivo(selectedFile);
      if (result.dados) {
        const newFormula = result.dados;
        setFormulations(prev => [newFormula, ...prev.filter(item => item.id !== newFormula.id)]);
        setRevisionHistory(prev => [{
          id: Date.now(), formulaName: newFormula.name, changedBy: "Sandy Torres Tavares", role: "Administradora", date: now(),
          fieldChanged: "Novo Cadastro", oldValue: "Não cadastrado", newValue: "Arquivo processado e salvo na API", reason: "Cadastro inicial por envio de arquivo."
        }, ...prev]);
      }
      setApiError("");
      setUploadSuccess(result.mensagem || "Arquivo importado com sucesso.");
      setSelectedFile(null);
      const input = document.getElementById("file-upload");
      if (input) input.value = "";
    } catch (error) {
      setUploadError(error.message || "Não foi possível enviar o arquivo à API.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenEdit = formula => setEditForm({ item: formula, name: formula.name, lab: formula.lab, summary: formula.summary, status: formula.status });

  const handleSaveEdit = event => {
    event.preventDefault();
    const oldFormula = formulations.find(formula => formula.id === editForm.item?.id);
    if (!oldFormula) return;
    const updated = { ...oldFormula, name: editForm.name.trim(), lab: editForm.lab.trim(), summary: editForm.summary.trim(), status: editForm.status };
    setFormulations(prev => prev.map(formula => formula.id === updated.id ? updated : formula));
    setRevisionHistory(prev => [{
      id: Date.now(), formulaName: updated.name, changedBy: "Sandy Torres Tavares", role: "Administradora / Pesquisadora", date: now(),
      fieldChanged: "Dados da Formulação", oldValue: `${oldFormula.name} | ${oldFormula.summary}`, newValue: `${updated.name} | ${updated.summary}`,
      reason: "Edição manual realizada no painel de gerenciamento."
    }, ...prev]);
    if (selectedFormula?.id === updated.id) setSelectedFormula(updated);
    setEditForm({ item: null, name: "", lab: "", summary: "", status: "" });
  };

  const handleDelete = formula => {
    if (!window.confirm(`Deseja realmente excluir "${formula.name}"?`)) return;
    setFormulations(prev => prev.filter(item => item.id !== formula.id));
    setRevisionHistory(prev => [{
      id: Date.now(), formulaName: formula.name, changedBy: "Sandy Torres Tavares", role: "Administradora", date: now(),
      fieldChanged: "Exclusão", oldValue: formula.name, newValue: "Formulação removida", reason: "Exclusão confirmada pelo painel de gerenciamento."
    }, ...prev]);
    if (selectedFormula?.id === formula.id) setSelectedFormula(null);
  };

  const changeTab = tab => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };
  const pageTitle = navItems.find(item => item.id === activeTab)?.label;
  const statusClass = status => status === "Aprovado" ? "bg-emerald-50 text-emerald-700" : status === "Reprovado" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";

  return <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
    <Sidebar activeTab={activeTab} onChange={changeTab} />
    <div className="flex-1 min-w-0 flex flex-col">
      <AppHeader pageTitle={pageTitle} activeTab={activeTab} onChange={changeTab} mobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={() => setMobileMenuOpen(value => !value)} isUserMenuOpen={isUserMenuOpen} onToggleUserMenu={() => setIsUserMenuOpen(value => !value)} />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {apiError && <div className="max-w-5xl mx-auto mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs">{apiError}</div>}
        {activeTab === "cadastrar" && <CadastroPage selectedFile={selectedFile} onFileChange={handleFileChange} onClearFile={() => { setSelectedFile(null); const input = document.getElementById("file-upload"); if (input) input.value = ""; }} newLab={newLab} onLabChange={event => setNewLab(event.target.value)} uploadError={uploadError} uploadSuccess={uploadSuccess} processing={processing} onUpload={handleUpload} />}
        {activeTab === "buscar" && <BuscaPage formulations={formulations} filteredFormulations={filteredFormulations} searchGlobal={searchGlobal} onSearchChange={setSearchGlobal} selectedProduct={selectedProduct} onProductChange={setSelectedProduct} selectedLab={selectedLab} onLabChange={setSelectedLab} selectedIngredient={selectedIngredient} onIngredientChange={setSelectedIngredient} onResetFilters={resetFilters} onInspect={setSelectedFormula} statusClass={statusClass} />}
        {activeTab === "gerenciar" && <GerenciarPage formulations={formulations} onDelete={handleDelete} onInspect={setSelectedFormula} onEdit={handleOpenEdit} statusClass={statusClass} />}
        {activeTab === "revisadas" && <HistoricoPage revisionHistory={revisionHistory} />}
      </main>
    </div>
    <DetalhesModal formula={selectedFormula} onClose={() => setSelectedFormula(null)} />
    <EditarModal form={editForm} onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))} onClose={() => setEditForm(prev => ({ ...prev, item: null }))} onSave={handleSaveEdit} />
  </div>;
}
