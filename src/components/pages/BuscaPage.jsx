import { Eye, Filter } from "lucide-react";

const excerpt = text => text?.trim() || "Resumo não informado; consulte o texto completo nos detalhes.";

export default function BuscaPage({ formulations, filteredFormulations, searchGlobal, onSearchChange, selectedCategory, onCategoryChange, selectedLab, onLabChange, selectedIngredient, onIngredientChange, onResetFilters, onInspect, statusClass }) {
  const categories = [...new Set(formulations.map(item => item.category).filter(category => category && category !== "Não categorizado"))];
  const labs = [...new Set(formulations.map(item => item.lab).filter(lab => lab && lab !== "Não informado"))];

  return <div className="max-w-6xl mx-auto space-y-6">
    <div><h2 className="text-2xl font-bold">Buscar Formulações</h2><p className="text-xs text-slate-500 mt-1">Busque pelo nome, categoria, laboratório, ingredientes ou conteúdo extraído.</p></div>
    <section className="bg-white border rounded-2xl p-5 space-y-4"><div className="flex justify-between items-center border-b pb-3"><h3 className="text-xs font-bold uppercase flex gap-2"><Filter size={16} className="text-purple-600" />Filtros de Pesquisa</h3><button onClick={onResetFilters} className="text-xs text-purple-600 font-bold">Limpar filtros</button></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><label className="text-xs font-bold block mb-2">Busca geral</label><input value={searchGlobal} onChange={e => onSearchChange(e.target.value)} placeholder="Ex.: detergente, placas solares..." className="w-full border rounded-lg p-2.5 text-xs outline-none focus:border-purple-500" /></div>
        <div><label className="text-xs font-bold block mb-2">Categoria do produto</label><select value={selectedCategory} onChange={e => onCategoryChange(e.target.value)} className="w-full border rounded-lg p-2.5 text-xs"><option value="Todos">Todas as categorias</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></div>
        <div><label className="text-xs font-bold block mb-2">Laboratório</label><select value={selectedLab} onChange={e => onLabChange(e.target.value)} className="w-full border rounded-lg p-2.5 text-xs"><option value="Todos">Todos os laboratórios</option>{labs.map(lab => <option key={lab} value={lab}>{lab}</option>)}</select></div>
        <div><label className="text-xs font-bold block mb-2">Ingrediente</label><input value={selectedIngredient} onChange={e => onIngredientChange(e.target.value)} placeholder="Ex.: tensoativo, álcool..." className="w-full border border-purple-200 bg-purple-50 rounded-lg p-2.5 text-xs" /></div>
      </div>
    </section>
    <section className="bg-white border rounded-2xl overflow-hidden"><div className="p-4 border-b"><h3 className="text-xs font-bold uppercase">Resultados ({filteredFormulations.length})</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Produto / formulação</th><th className="p-4">Categoria</th><th className="p-4">Resumo</th><th className="p-4">Status</th><th className="p-4">Ação</th></tr></thead><tbody className="divide-y">
      {filteredFormulations.map(item => <tr key={item.id} className="transition-colors hover:bg-purple-50/40"><td className="p-4 font-bold max-w-56 truncate" title={item.name}>{item.name}</td><td className="p-4"><span className="rounded-md bg-purple-50 px-2 py-1 text-[10px] text-purple-700">{item.category}</span></td><td className="p-4 max-w-sm"><p className="line-clamp-2 text-slate-500" title={excerpt(item.summary)}>{excerpt(item.summary)}</p></td><td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></td><td className="p-4"><button onClick={() => onInspect(item)} className="flex items-center gap-1 text-purple-700 font-bold"><Eye size={15} /> Ver detalhes</button></td></tr>)}
      {filteredFormulations.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">Nenhuma formulação encontrada.</td></tr>}
    </tbody></table></div></section>
  </div>;
}
