import { Edit3, Trash2 } from "lucide-react";

export default function GerenciarPage({ formulations, onDelete, onInspect, onEdit, statusClass }) {
  return <div className="max-w-6xl mx-auto space-y-6">
    <div><h2 className="text-2xl font-bold">Gerenciar Formulações</h2><p className="text-xs text-slate-500 mt-1">Edite, consulte e exclua formulações cadastradas.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{formulations.map(item => <article key={item.id} className="bg-white border rounded-2xl p-5 flex flex-col justify-between gap-5 hover:border-purple-300 transition">
      <div><div className="flex justify-between items-center mb-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusClass(item.status)}`}>{item.status}</span><span className="text-[10px] text-slate-400">{item.date}</span></div><h3 className="font-bold text-sm">{item.name}</h3><p className="text-xs text-purple-600 font-semibold mt-1">{item.lab}</p><p className="text-xs text-slate-500 mt-3 leading-relaxed">{item.summary}</p><p className="text-[10px] text-slate-400 mt-3">{item.ingredients.length} ingrediente(s)</p></div>
      <div className="border-t pt-3 flex justify-between items-center"><button onClick={() => onDelete(item)} title="Excluir" className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg"><Trash2 size={17} /></button><div className="flex gap-2"><button onClick={() => onInspect(item)} className="text-xs font-bold px-3 py-2 hover:bg-slate-100 rounded-lg">Detalhes</button><button onClick={() => onEdit(item)} className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-purple-700"><Edit3 size={13} className="inline mr-1" />Editar</button></div></div>
    </article>)}</div>
    {formulations.length === 0 && <div className="bg-white rounded-xl p-10 text-center text-slate-400 text-sm">Nenhuma formulação cadastrada.</div>}
  </div>;
}
