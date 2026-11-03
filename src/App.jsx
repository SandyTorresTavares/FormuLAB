import React, { useEffect, useMemo, useState } from "react";
import { atualizarFormulacao, importarArquivo, listarFormulacoes } from "./actions/formulacoes.js";
import { AppHeader, Sidebar } from "./components/layout/AppShell.jsx";
import CadastroPage from "./components/pages/CadastroPage.jsx";
import BuscaPage from "./components/pages/BuscaPage.jsx";
import GerenciarPage from "./components/pages/GerenciarPage.jsx";
import HistoricoPage from "./components/pages/HistoricoPage.jsx";
import { DetalhesModal, EditarModal } from "./components/modals/FormulaModals.jsx";
import { initialHistory, navItems } from "./constants/appData.js";

const now = () => new Date().toLocaleString("pt-BR");
const showPercentage = value => {
  if (!value) return "sem percentual";
  const text = String(value);
  return /\bqsp?\b/i.test(text) || text.endsWith("%") ? text : `${text}%`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("cadastrar");
  const [formulations, setFormulations] = useState([]);
  const [revisionHistory, setRevisionHistory] = useState(initialHistory);
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
  const [editForm, setEditForm] = useState({ item: null, name: "", category: "", lab: "", summary: "", status: "", ingredientData: [] });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listarFormulacoes({ signal: controller.signal })
      .then(setFormulations)
      .then(() => setApiError(""))
      .catch(error => { if (error.name !== "AbortError") setApiError(error.message || "Falha ao conectar a API."); });
    return () => controller.abort();
  }, []);

  const filteredFormulations = useMemo(() => formulations.filter(item => {
    const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const term = normalize(searchGlobal.trim());
    const searchable = [item.name, item.category, item.lab, item.summary, item.extractedText, ...item.ingredients].map(normalize);
    const globalMatch = !term || searchable.some(value => value.includes(term));
    const categoryMatch = selectedCategory === "Todos" || item.category === selectedCategory;
    const labMatch = selectedLab === "Todos" || item.lab === selectedLab;
    const ingredientTerm = normalize(selectedIngredient.trim());
    const ingredientMatch = !ingredientTerm || item.ingredients.some(ingredient => normalize(ingredient).includes(ingredientTerm));
    return globalMatch && categoryMatch && labMatch && ingredientMatch;
  }), [formulations, searchGlobal, selectedCategory, selectedLab, selectedIngredient]);

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
        setRevisionHistory(prev => [...importedFormulas.map((formula, index) => ({
          id: Date.now() + index, formulaName: formula.name, changedBy: "Sandy Torres Tavares", role: "Administradora", date: now(),
          fieldChanged: "Novo Cadastro", oldValue: "Não cadastrado", newValue: `${formula.ingredients.length} ingrediente(s) identificado(s)`, reason: "Cadastro inicial por envio de arquivo."
        })), ...prev]);
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
    setEditForm({ item: formula, name: formula.name, category: formula.category, lab: formula.lab, summary: formula.summary, status: formula.status, ingredientData: formula.ingredientData.map(item => ({ ...item })) });
  };

  const handleSaveEdit = async event => {
    event.preventDefault();
    const oldFormula = formulations.find(formula => formula.id === editForm.item?.id);
    if (!oldFormula) return;
    const updated = { ...oldFormula, name: editForm.name.trim(), category: editForm.category.trim(), lab: editForm.lab.trim(), summary: editForm.summary.trim(), status: editForm.status, ingredientData: editForm.ingredientData };
    setSavingEdit(true);
    setEditError("");
    try {
      const savedFormula = await atualizarFormulacao(updated.id, updated);
      setFormulations(prev => prev.map(formula => formula.id === savedFormula.id ? savedFormula : formula));
      const oldIngredients = oldFormula.ingredientData || [];
      const newIngredients = savedFormula.ingredientData || [];
      const matchedOldIngredients = new Set();
      const ingredientEvents = newIngredients.flatMap((ingredient, index) => {
        const oldIndexByName = oldIngredients.findIndex((item, oldIndex) => item.name === ingredient.name && !matchedOldIngredients.has(oldIndex));
        const previousIndex = oldIndexByName >= 0 ? oldIndexByName : index < oldIngredients.length ? index : -1;
        const previous = previousIndex >= 0 ? oldIngredients[previousIndex] : null;
        if (previousIndex >= 0) matchedOldIngredients.add(previousIndex);
        if (previous && previous.name === ingredient.name && previous.percentage === ingredient.percentage) return [];
        return [{
          id: Date.now() + index + 1, formulaName: savedFormula.name, changedBy: "Sandy Torres Tavares", role: "Administradora / Pesquisadora", date: now(),
          fieldChanged: `Ingrediente: ${ingredient.name}`, oldValue: previous ? `${previous.name} (${previous.percentage ? showPercentage(previous.percentage) : "sem percentual"})` : "Ingrediente não cadastrado",
          newValue: `${ingredient.name} (${showPercentage(ingredient.percentage)})`, reason: "Ingrediente ou percentual alterado e salvo no banco de dados."
        }];
      });
      const removedIngredients = oldIngredients.flatMap((ingredient, index) => {
        if (matchedOldIngredients.has(index)) return [];
        return [{
          id: Date.now() + newIngredients.length + index + 1, formulaName: savedFormula.name, changedBy: "Sandy Torres Tavares", role: "Administradora / Pesquisadora", date: now(),
          fieldChanged: `Ingrediente removido: ${ingredient.name}`, oldValue: `${ingredient.name} (${showPercentage(ingredient.percentage)})`, newValue: "Removido",
          reason: "Ingrediente removido e alteração salva no banco de dados."
        }];
      });
      const dadosAlterados = oldFormula.name !== savedFormula.name || oldFormula.category !== savedFormula.category || oldFormula.lab !== savedFormula.lab || oldFormula.status !== savedFormula.status || oldFormula.summary !== savedFormula.summary;
      const dadosEvent = dadosAlterados ? [{
        id: Date.now(), formulaName: savedFormula.name, changedBy: "Sandy Torres Tavares", role: "Administradora / Pesquisadora", date: now(),
        fieldChanged: "Dados da Formulação", oldValue: `${oldFormula.name} | ${oldFormula.category} | ${oldFormula.status}`, newValue: `${savedFormula.name} | ${savedFormula.category} | ${savedFormula.status}`,
        reason: "Dados da formulação atualizados e salvos no banco de dados."
      }] : [];
      setRevisionHistory(prev => [...ingredientEvents, ...removedIngredients, ...dadosEvent, ...prev]);
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
      setRevisionHistory(prev => [{
        id: Date.now(), formulaName: savedFormula.name, changedBy: "Sandy Torres Tavares", role: "Revisora", date: now(),
        fieldChanged: "Status da análise", oldValue: formula.status, newValue: savedFormula.status,
        reason: "Status atualizado durante a revisão técnica."
      }, ...prev]);
    } catch (error) {
      setReviewError(error.message || "Não foi possível atualizar o status da análise.");
    } finally {
      setReviewSaving(false);
    }
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
        {activeTab === "cadastrar" && <CadastroPage selectedFile={selectedFile} onFileChange={handleFileChange} onClearFile={() => { setSelectedFile(null); const input = document.getElementById("file-upload"); if (input) input.value = ""; }} newName={newName} onNameChange={event => setNewName(event.target.value)} newCategory={newCategory} onCategoryChange={event => setNewCategory(event.target.value)} newLab={newLab} onLabChange={event => setNewLab(event.target.value)} uploadError={uploadError} uploadSuccess={uploadSuccess} processing={processing} onUpload={handleUpload} />}
        {activeTab === "buscar" && <BuscaPage formulations={formulations} filteredFormulations={filteredFormulations} searchGlobal={searchGlobal} onSearchChange={setSearchGlobal} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedLab={selectedLab} onLabChange={setSelectedLab} selectedIngredient={selectedIngredient} onIngredientChange={setSelectedIngredient} onResetFilters={resetFilters} onInspect={setSelectedFormula} statusClass={statusClass} />}
        {activeTab === "gerenciar" && <GerenciarPage formulations={formulations} onDelete={handleDelete} onInspect={setSelectedFormula} onEdit={handleOpenEdit} statusClass={statusClass} />}
        {activeTab === "revisadas" && <HistoricoPage revisionHistory={revisionHistory} />}
      </main>
    </div>
    <DetalhesModal formula={selectedFormula} onClose={() => { setSelectedFormula(null); setReviewError(""); }} onSetStatus={handleSetReviewStatus} reviewSaving={reviewSaving} reviewError={reviewError} />
    <EditarModal form={editForm} error={editError} saving={savingEdit} onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))} onClose={() => { if (!savingEdit) setEditForm(prev => ({ ...prev, item: null })); }} onSave={handleSaveEdit} />
  </div>;
}
