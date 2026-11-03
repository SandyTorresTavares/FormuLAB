import React, { useEffect, useMemo, useState } from "react";
import { atualizarFormulacao, excluirFormulacao, excluirFormulacoesEmMassa, importarArquivo, listarFormulacoes } from "./actions/formulacoes.js";
import { AppHeader, Sidebar } from "./components/layout/AppShell.jsx";
import CadastroPage from "./components/pages/CadastroPage.jsx";
import BuscaPage from "./components/pages/BuscaPage.jsx";
import GerenciarPage from "./components/pages/GerenciarPage.jsx";
import HistoricoPage from "./components/pages/HistoricoPage.jsx";
import { DetalhesModal, EditarModal } from "./components/modals/FormulaModals.jsx";
import { navItems } from "./constants/appData.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("cadastrar");
  const [formulations, setFormulations] = useState([]);
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLab, setSelectedLab] = useState("Todos");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newLab, setNewLab] = useState("Lab Sinergia Química");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [processing, setProcessing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [editForm, setEditForm] = useState({ item: null, name: "", category: "", lab: "", summary: "", status: "", preparation: "", ingredientData: [] });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listarFormulacoes({ signal: controller.signal })
      .then(formulas => {
        setFormulations(formulas);
        setRevisionHistory(formulas.flatMap(formula => formula.audit || []).sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)));
        setApiError("");
      })
      .catch(error => { if (error.name !== "AbortError") setApiError(error.message || "Falha ao conectar a API."); });
    return () => controller.abort();
  }, []);

  const approvedFormulations = useMemo(() => formulations.filter(item => item.status === "Aprovado"), [formulations]);
  const filteredFormulations = useMemo(() => approvedFormulations.filter(item => {
    const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const term = normalize(searchGlobal.trim());
    const searchable = [item.name, item.category, item.lab, item.summary, item.extractedText, item.preparation, ...item.ingredients].map(normalize);
    const globalMatch = !term || searchable.some(value => value.includes(term));
    const categoryMatch = selectedCategory === "Todos" || item.category === selectedCategory;
    const labMatch = selectedLab === "Todos" || item.lab === selectedLab;
    const ingredientTerm = normalize(selectedIngredient.trim());
    const ingredientMatch = !ingredientTerm || item.ingredients.some(ingredient => normalize(ingredient).includes(ingredientTerm));
    return globalMatch && categoryMatch && labMatch && ingredientMatch;
  }), [approvedFormulations, searchGlobal, selectedCategory, selectedLab, selectedIngredient]);

  const resetFilters = () => {
    setSearchGlobal("");
    setSelectedCategory("Todos");
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
      const result = await importarArquivo(selectedFile, { name: newName, category: newCategory, lab: newLab });
      const importedFormulas = result.formulacoes.length > 0 ? result.formulacoes : result.dados ? [result.dados] : [];
      if (importedFormulas.length > 0) {
        setFormulations(prev => [...importedFormulas, ...prev.filter(item => !importedFormulas.some(added => added.id === item.id))]);
        const auditEvents = importedFormulas.flatMap(formula => formula.audit || []);
        setRevisionHistory(prev => [...auditEvents, ...prev].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)));
      }
      setApiError("");
      setUploadSuccess(result.mensagem || "Arquivo importado com sucesso.");
      setSelectedFile(null);
      setNewName("");
      setNewCategory("");
      const input = document.getElementById("file-upload");
      if (input) input.value = "";
    } catch (error) {
      setUploadError(error.message || "Não foi possível enviar o arquivo à API.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenEdit = formula => {
    setEditError("");
    setEditForm({ item: formula, name: formula.name, category: formula.category, lab: formula.lab, summary: formula.summary, status: formula.status, preparation: formula.preparation || "", ingredientData: formula.ingredientData.map(item => ({ ...item })) });
  };

  const handleSaveEdit = async event => {
    event.preventDefault();
    const oldFormula = formulations.find(formula => formula.id === editForm.item?.id);
    if (!oldFormula) return;
    const updated = { ...oldFormula, name: editForm.name.trim(), category: editForm.category.trim(), lab: editForm.lab.trim(), summary: editForm.summary.trim(), status: editForm.status, preparation: editForm.preparation, ingredientData: editForm.ingredientData };
    setSavingEdit(true);
    setEditError("");
    try {
      const savedFormula = await atualizarFormulacao(updated.id, updated);
      setFormulations(prev => prev.map(formula => formula.id === savedFormula.id ? savedFormula : formula));
      setRevisionHistory(prev => [
        ...(savedFormula.audit || []).slice().reverse(),
        ...prev.filter(event => event.formulaId !== savedFormula.id)
      ]);
      if (selectedFormula?.id === savedFormula.id) setSelectedFormula(savedFormula);
      setEditForm({ item: null, name: "", lab: "", summary: "", status: "" });
    } catch (error) {
      setEditError(error.message || "Não foi possível salvar as alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSetReviewStatus = async (formula, status) => {
    setReviewSaving(true);
    setReviewError("");
    try {
      const savedFormula = await atualizarFormulacao(formula.id, { ...formula, status });
      setFormulations(prev => prev.map(item => item.id === savedFormula.id ? savedFormula : item));
      setSelectedFormula(savedFormula);
      setRevisionHistory(prev => [
        ...(savedFormula.audit || []).slice().reverse(),
        ...prev.filter(event => event.formulaId !== savedFormula.id)
      ]);
    } catch (error) {
      setReviewError(error.message || "Não foi possível atualizar o status da análise.");
    } finally {
      setReviewSaving(false);
    }
  };

  const handleDelete = async formula => {
    if (!window.confirm(`Deseja realmente excluir "${formula.name}"?`)) return;
    setApiError("");
    setDeleting(true);
    try {
      await excluirFormulacao(formula.id);
      setFormulations(prev => prev.filter(item => item.id !== formula.id));
      setSelectedIds(prev => prev.filter(id => id !== formula.id));
      if (selectedFormula?.id === formula.id) setSelectedFormula(null);
    } catch (error) {
      setApiError(error.message || "Não foi possível excluir a formulação.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSelected = id => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const handleToggleAll = () => setSelectedIds(prev => {
    const allSelected = formulations.length > 0 && formulations.every(item => prev.includes(item.id));
    return allSelected ? [] : formulations.map(item => item.id);
  });
  const handleDeleteSelected = async () => {
    const ids = selectedIds.filter(id => formulations.some(item => item.id === id));
    if (ids.length === 0 || !window.confirm(`Deseja realmente excluir ${ids.length} formulação(ões) selecionada(s)? Esta ação não pode ser desfeita.`)) return;
    setApiError("");
    setDeleting(true);
    try {
      const result = await excluirFormulacoesEmMassa(ids);
      const deletedIds = new Set(ids);
      setFormulations(prev => prev.filter(item => !deletedIds.has(item.id)));
      setSelectedIds([]);
      if (selectedFormula && deletedIds.has(selectedFormula.id)) setSelectedFormula(null);
      if (result.excluidas !== ids.length) setApiError(`${result.excluidas} de ${ids.length} formulação(ões) foram excluídas; atualize a lista para conferir os registros restantes.`);
    } catch (error) {
      setApiError(error.message || "Não foi possível excluir as formulações selecionadas.");
    } finally {
      setDeleting(false);
    }
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
        {activeTab === "cadastrar" && <CadastroPage selectedFile={selectedFile} onFileChange={handleFileChange} onClearFile={() => { setSelectedFile(null); const input = document.getElementById("file-upload"); if (input) input.value = ""; }} newName={newName} onNameChange={event => setNewName(event.target.value)} newCategory={newCategory} onCategoryChange={event => setNewCategory(event.target.value)} newLab={newLab} onLabChange={event => setNewLab(event.target.value)} uploadError={uploadError} uploadSuccess={uploadSuccess} processing={processing} onUpload={handleUpload} />}
        {activeTab === "buscar" && <BuscaPage formulations={approvedFormulations} filteredFormulations={filteredFormulations} searchGlobal={searchGlobal} onSearchChange={setSearchGlobal} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedLab={selectedLab} onLabChange={setSelectedLab} selectedIngredient={selectedIngredient} onIngredientChange={setSelectedIngredient} onResetFilters={resetFilters} onInspect={setSelectedFormula} statusClass={statusClass} />}
        {activeTab === "gerenciar" && <GerenciarPage formulations={formulations} onDelete={handleDelete} onDeleteSelected={handleDeleteSelected} deleting={deleting} selectedIds={selectedIds} onToggleSelected={handleToggleSelected} onToggleAll={handleToggleAll} onInspect={setSelectedFormula} onEdit={handleOpenEdit} statusClass={statusClass} />}
        {activeTab === "revisadas" && <HistoricoPage revisionHistory={revisionHistory} />}
      </main>
    </div>
    <DetalhesModal formula={selectedFormula} onClose={() => { setSelectedFormula(null); setReviewError(""); }} onSetStatus={handleSetReviewStatus} reviewSaving={reviewSaving} reviewError={reviewError} />
    <EditarModal form={editForm} error={editError} saving={savingEdit} onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))} onClose={() => { if (!savingEdit) setEditForm(prev => ({ ...prev, item: null })); }} onSave={handleSaveEdit} />
  </div>;
}
