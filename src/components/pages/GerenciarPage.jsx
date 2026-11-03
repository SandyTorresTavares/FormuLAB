import { CheckSquare, Edit3, Square, Trash2 } from "lucide-react";

const excerpt = text => text?.trim() || "Resumo não informado. Consulte os detalhes para ver o texto extraído.";

export default function GerenciarPage({ formulations, onDelete, onDeleteSelected, deleting, selectedIds, onToggleSelected, onToggleAll, onInspect, onEdit, statusClass, canDelete = false }) {
  const allSelected = formulations.length > 0 && formulations.every(item => selectedIds.includes(item.id));
  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Gerenciar Formulações</h2><p className="text-xs text-slate-500 mt-1">Veja um resumo, classifique e revise cada documento nos detalhes.</p></div>{canDelete && formulations.length > 0 && <div className="flex items-center gap-3"><button type="button" onClick={onToggleAll} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors">{allSelected ? <CheckSquare size={16} /> : <Square size={16} />}{allSelected ? "Desmarcar todas" : "Selecionar todas"}</button>{selectedIds.length > 0 && <button type="button" onClick={onDeleteSelected} disabled={deleting} className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"><Trash2 size={15} />{deleting ? "Excluindo..." : `Excluir selecionadas (${selectedIds.length})`}</button>}</div>}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{formulations.map(item => <article key={item.id} className="group bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg">
      <div className="min-w-0"><div className="flex justify-between items-center gap-2 mb-3"><div className="flex items-center gap-2 text-[10px] font-bold">{canDelete && <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggleSelected(item.id)} aria-label={`Selecionar ${item.name}`} className="h-4 w-4 accent-purple-600" />}<span className={`px-2 py-1 rounded-full ${statusClass(item.status)}`}>{item.status}</span></div><span className="text-[10px] text-slate-400 shrink-0">{item.date}</span></div>
        <span className="inline-flex max-w-full truncate rounded-md bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-700">{item.category}</span>
        <h3 className="mt-2 truncate font-bold text-sm" title={item.name}>{item.name}</h3><p className="truncate text-xs text-slate-500 mt-1">{item.lab}</p>
        <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3" title={excerpt(item.summary)}>{excerpt(item.summary)}</p>
        <p className="text-[10px] text-slate-400 mt-3">{item.ingredients.length} ingrediente(s) · texto completo em detalhes</p>
      </div>
      <div className="border-t pt-3 flex justify-between items-center"><button onClick={() => onDelete(item)} disabled={deleting} title="Excluir" className="text-rose-500 p-2 rounded-lg transition-colors hover:bg-rose-50 disabled:opacity-50" aria-label={`Excluir ${item.name}`}><Trash2 size={17} /></button><div className="flex gap-2"><button onClick={() => onInspect(item)} className="text-xs font-bold px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">Ver detalhes</button><button onClick={() => onEdit(item)} className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-all hover:bg-purple-700 hover:shadow-md active:scale-95"><Edit3 size={13} className="inline mr-1" />Editar</button></div></div>
    </article>)}</div>
    {formulations.length === 0 && <div className="bg-white rounded-xl p-10 text-center text-slate-400 text-sm">Nenhuma formulação cadastrada.</div>}
  </div>;
}
